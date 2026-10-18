import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ChatCompletionRequest, ChatCompletionRequestSchema } from '../types/chat.js';
import { ModelRouter } from '../routing/router.js';
import { CooldownTracker } from '../resilience/cooldown.js';
import { SlidingWindowRateLimiter } from '../resilience/ratelimit.js';
import { ResponseCache } from '../caching/cache.js';
import { GatewayEngine } from './engine.js';
import { PermissionHook, KeyLookupHook, AuditHook, RequestContext } from '../types/ra1.js';

export interface CreateGatewayAppOptions {
  permissionHook?: PermissionHook;
  keyLookupHook?: KeyLookupHook;
  auditHook?: AuditHook;
  cache?: ResponseCache;
}

export function createGatewayApp(options?: CreateGatewayAppOptions): {
  app: Hono;
  router: ModelRouter;
  cooldownTracker: CooldownTracker;
  rateLimiter: SlidingWindowRateLimiter;
  cache: ResponseCache;
  engine: GatewayEngine;
} {
  const app = new Hono();
  const cooldownTracker = new CooldownTracker();
  const router = new ModelRouter(cooldownTracker);
  const rateLimiter = new SlidingWindowRateLimiter(120, 60); // 120 req / min default
  const cache = options?.cache || new ResponseCache({ enabled: false }); // Default: off in R1

  const engine = new GatewayEngine({
    router,
    cooldownTracker,
    cache,
    defaultPermissionHook: options?.permissionHook,
    defaultKeyLookupHook: options?.keyLookupHook,
    defaultAuditHook: options?.auditHook
  });

  app.use('*', logger());
  app.use('*', cors());

  // Health endpoint
  app.get('/health', (c) => {
    return c.json({
      status: 'healthy',
      service: 'model-gateway',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });

  // Models listing
  app.get('/v1/models', (c) => {
    return c.json({
      object: 'list',
      data: [
        { id: 'gpt-4o', object: 'model', created: 1715367049, owned_by: 'gateway' },
        { id: 'gpt-4o-mini', object: 'model', created: 1715367049, owned_by: 'gateway' },
        { id: 'claude-3-7-sonnet', object: 'model', created: 1715367049, owned_by: 'gateway' },
        { id: 'claude-3-5-sonnet', object: 'model', created: 1715367049, owned_by: 'gateway' },
        { id: 'gemini-1.5-pro', object: 'model', created: 1715367049, owned_by: 'gateway' },
        { id: 'gemini-2.0-flash', object: 'model', created: 1715367049, owned_by: 'gateway' },
        { id: 'ollama/llama3.2', object: 'model', created: 1715367049, owned_by: 'local' },
        { id: 'llama.cpp/default', object: 'model', created: 1715367049, owned_by: 'local' }
      ]
    });
  });

  // Chat completions endpoint (W3: Single request pipeline via GatewayEngine)
  app.post('/v1/chat/completions', async (c) => {
    const requestId = c.req.header('x-request-id') || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const traceId = c.req.header('x-trace-id') || `trace-${Math.random().toString(36).substring(2, 12)}`;
    const actor = c.req.header('x-actor-id') || c.req.header('authorization') || 'anonymous-client';
    const tenantId = c.req.header('x-tenant-id') || undefined;

    const ctx: RequestContext = {
      requestId,
      traceId,
      actor,
      tenantId,
      clientIp: c.req.header('x-forwarded-for') || undefined
    };

    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({
        error: {
          message: 'Invalid JSON request body',
          type: 'invalid_request_error',
          param: null,
          code: 400
        }
      }, 400);
    }

    // Strict Zod schema validation (Feature 1)
    const validationResult = ChatCompletionRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return c.json({
        error: {
          message: `Validation failed: ${issue.path.join('.')}: ${issue.message}`,
          type: 'invalid_request_error',
          param: issue.path.join('.') || null,
          code: 400
        }
      }, 400);
    }

    const body: ChatCompletionRequest = validationResult.data;

    // Rate Limiting Check (Feature 9)
    const rateLimitRes = rateLimiter.check(actor);
    c.header('x-ratelimit-limit', rateLimitRes.limit.toString());
    c.header('x-ratelimit-remaining', rateLimitRes.remaining.toString());
    c.header('x-ratelimit-reset', rateLimitRes.resetSeconds.toString());
    if (!rateLimitRes.allowed) {
      c.header('retry-after', rateLimitRes.resetSeconds.toString());
      return c.json({
        error: {
          message: 'Rate limit exceeded. Too many requests.',
          type: 'rate_limit_error',
          param: null,
          code: 429
        }
      }, 429);
    }

    // Delegate execution to the unified GatewayEngine
    try {
      if (body.stream) {
        const stream = await engine.streamChatCompletion(body, { context: ctx });
        return new Response(stream, {
          headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
            'x-request-id': requestId
          }
        });
      } else {
        const response = await engine.chatCompletion(body, { context: ctx });
        return c.json(response, 200, {
          'x-request-id': requestId
        });
      }
    } catch (err: any) {
      const status = err.statusCode || 500;
      const errorEnvelope = err.openAIError || {
        error: {
          message: err.message || 'Internal server error',
          type: 'api_error',
          param: null,
          code: status
        }
      };
      return c.json(errorEnvelope, status as any);
    }
  });

  return { 
    app, 
    router, 
    cooldownTracker, 
    rateLimiter, 
    cache, 
    engine 
  };
}
