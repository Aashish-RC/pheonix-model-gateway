import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ChatCompletionRequest, ChatCompletionRequestSchema } from '../types/chat.js';
import { ProviderRegistry } from '../providers/registry.js';
import { ModelRouter, RouteTarget } from '../routing/router.js';
import { CooldownTracker } from '../resilience/cooldown.js';
import { ErrorClassifier } from '../resilience/classifier.js';
import { SSRFGuard } from '../security/ssrf.js';
import { PricingEngine } from '../telemetry/pricing.js';
import { TokenUsageAccounting } from '../telemetry/usage.js';
import { StreamFailoverManager } from './stream-failover.js';
import { StreamTransformState } from '../types/provider.js';
import { SlidingWindowRateLimiter } from '../resilience/ratelimit.js';
import { ResponseCache } from '../caching/cache.js';
import { TokenVault } from '../security/vault.js';
import { RulesEngine } from '../security/rules.js';
import { GatewayEngine } from './engine.js';
import { PermissionHook, KeyLookupHook, AuditHook, RequestContext } from '../types/ra1.js';

export interface CreateGatewayAppOptions {
  permissionHook?: PermissionHook;
  keyLookupHook?: KeyLookupHook;
  auditHook?: AuditHook;
}

export function createGatewayApp(options?: CreateGatewayAppOptions): {
  app: Hono;
  router: ModelRouter;
  cooldownTracker: CooldownTracker;
  rateLimiter: SlidingWindowRateLimiter;
  cache: ResponseCache;
  rulesEngine: RulesEngine;
  vault: TokenVault;
  engine: GatewayEngine;
} {
  const app = new Hono();
  const cooldownTracker = new CooldownTracker();
  const router = new ModelRouter(cooldownTracker);
  const rateLimiter = new SlidingWindowRateLimiter(120, 60); // 120 req / min default
  const cache = new ResponseCache(300); // 5 min TTL
  const vault = new TokenVault(3600);
  const rulesEngine = new RulesEngine(vault);

  let activePermissionHook = options?.permissionHook;
  let activeKeyLookupHook = options?.keyLookupHook;
  let activeAuditHook = options?.auditHook;

  const engine = new GatewayEngine({
    router,
    cooldownTracker,
    defaultPermissionHook: activePermissionHook,
    defaultKeyLookupHook: activeKeyLookupHook,
    defaultAuditHook: activeAuditHook
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
        { id: 'ollama/llama3.2', object: 'model', created: 1715367049, owned_by: 'local' },
        { id: 'llama.cpp/default', object: 'model', created: 1715367049, owned_by: 'local' }
      ]
    });
  });

  // Chat completions endpoint
  app.post('/v1/chat/completions', async (c) => {
    const requestId = c.req.header('x-request-id') || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const traceId = c.req.header('x-trace-id') || `trace-${Math.random().toString(36).substring(2, 12)}`;
    const actor = c.req.header('x-actor-id') || c.req.header('authorization') || 'anonymous-client';

    const ctx: RequestContext = {
      requestId,
      traceId,
      actor,
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

    let body: ChatCompletionRequest = validationResult.data;

    // H2: Permission hook check
    if (activePermissionHook) {
      const decision = await activePermissionHook(body, ctx);
      if (decision.action === 'deny') {
        return c.json({
          error: {
            message: `Permission denied: ${decision.reason}`,
            type: 'permission_denied',
            param: null,
            code: decision.statusCode || 403
          }
        }, (decision.statusCode || 403) as any);
      }
      if (decision.action === 'ask-human') {
        return c.json({
          error: {
            message: `Human approval challenge required: ${decision.challengeId}`,
            type: 'approval_required',
            param: null,
            code: 428
          }
        }, 428);
      }
    }

    // 1. Rate Limiting Check (Sliding Window - Feature 9)
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

    // 2. Rules & PII Redaction Engine (Feature 19)
    const ruleRes = await rulesEngine.evaluateRequest(body);
    if (!ruleRes.allowed) {
      return c.json({
        error: {
          message: ruleRes.blockReason || 'Request blocked by security rules',
          type: 'security_violation',
          param: null,
          code: ruleRes.statusCode || 403
        }
      }, (ruleRes.statusCode || 403) as any);
    }
    body = ruleRes.modifiedBody;

    // 3. Response Caching Check (Feature 14 - Unary non-streaming)
    const cacheKey = ResponseCache.computeKey(body);
    const bypassCache = c.req.header('x-cache-refresh') === 'true' || body.stream === true;
    if (!bypassCache) {
      const cachedResp = cache.get(cacheKey);
      if (cachedResp) {
        return c.json(cachedResp, 200, {
          'x-cache': 'HIT',
          'x-gateway-model': body.model
        });
      }
    }

    // Affinity key & target resolution (Feature 4, 5, 13)
    const systemPrompt = body.messages.find((m) => m.role === 'system')?.content || '';
    const targets = router.resolveTargets(body.model, systemPrompt);

    if (targets.length === 0) {
      return c.json({
        error: {
          message: `Model alias '${body.model}' is not registered with any healthy upstream target`,
          type: 'invalid_request_error',
          param: 'model',
          code: 404
        }
      }, 404);
    }

    // Execute through targets with intelligent failover
    let lastError: unknown = null;
    let lastStatusCode = 500;
    const requestStartTime = Date.now();

    for (const target of targets) {
      const adapter = ProviderRegistry.get(target.provider);
      if (!adapter) {
        console.warn(`[Gateway] Unknown provider '${target.provider}' for target '${target.id}'`);
        continue;
      }

      // H3: Scoped Vault Key Lookup (Hook H3)
      let targetConfig = { ...target.config };
      if (activeKeyLookupHook) {
        const scoped = await activeKeyLookupHook(target.provider, target.model, ctx);
        if (scoped?.apiKey) {
          targetConfig.apiKey = scoped.apiKey;
        }
      }

      const upstreamReq = adapter.transformRequest(
        { ...body, model: target.model },
        targetConfig
      );

      // SSRF check: validate target URL
      try {
        const isLocal = target.provider === 'ollama' || target.provider === 'localai' || target.provider === 'llama.cpp';
        await SSRFGuard.validateUrl(upstreamReq.url, isLocal);
      } catch (ssrfErr: any) {
        console.error(`[Security] Blocked outbound request to ${upstreamReq.url}: ${ssrfErr.message}`);
        return c.json({
          error: {
            message: ssrfErr.message,
            type: 'security_violation',
            param: null,
            code: 403
          }
        }, 403);
      }

      cooldownTracker.incrementInFlight(target.id);
      const startTime = Date.now();

      try {
        const response = await fetch(upstreamReq.url, {
          method: upstreamReq.method,
          headers: upstreamReq.headers,
          body: upstreamReq.body
        });

        const latency = Date.now() - startTime;

        if (!response.ok) {
          const errorBody = await response.text();
          let parsedError: unknown = errorBody;
          try {
            parsedError = JSON.parse(errorBody);
          } catch {}

          const classified = ErrorClassifier.classify(response.status, parsedError, response.headers);
          console.warn(`[Gateway] Target ${target.id} failed (${response.status} ${classified.category}): ${classified.message}`);

          if (classified.isRetryable) {
            cooldownTracker.recordFailure(target.id, classified.retryAfterSeconds);
            cooldownTracker.decrementInFlight(target.id);
            lastError = classified.message;
            lastStatusCode = response.status;
            continue; // Fail over to next healthy target!
          } else {
            // Fatal non-retryable error (Feature 10: Standard OpenAI Error Envelope)
            cooldownTracker.decrementInFlight(target.id);
            return c.json(ErrorClassifier.toOpenAIError(classified), response.status as any);
          }
        }

        // Success!
        cooldownTracker.recordSuccess(target.id, latency);
        cooldownTracker.decrementInFlight(target.id);

        // Feature 3 & 34: Streaming Response with Pre-first-byte Failover & Post-first-byte SSE Error
        if (body.stream && response.body) {
          const state: StreamTransformState = {
            id: `chatcmpl-${Date.now()}`,
            model: body.model,
            created: Math.floor(Date.now() / 1000),
            buffer: ''
          };

          let stream: ReadableStream<Uint8Array>;
          try {
            const guarded = await StreamFailoverManager.createGuardedStream(
              response.body,
              adapter,
              state
            );
            stream = guarded.stream;
          } catch (preflightErr: any) {
            console.warn(`[Gateway] Pre-first-byte stream abort on ${target.id}: ${preflightErr.message}. Failing over...`);
            cooldownTracker.recordFailure(target.id, 10);
            lastError = preflightErr.message;
            continue; // Failover to next target!
          }

          // H4: Audit hook on stream start
          if (activeAuditHook) {
            const promptEst = TokenUsageAccounting.estimatePromptTokens(body);
            const usage = {
              promptTokens: promptEst,
              completionTokens: 0,
              reasoningTokens: 0,
              cachedPromptTokens: 0,
              totalTokens: promptEst,
              estimated: true
            };
            await activeAuditHook({
              requestId,
              traceId,
              timestamp: new Date().toISOString(),
              actor,
              model: body.model,
              provider: target.provider,
              targetId: target.id,
              tokens: usage,
              cost: PricingEngine.calculateCost(body.model, usage),
              latencyMs: latency,
              outcome: 'success',
              statusCode: 200
            });
          }

          return new Response(stream, {
            headers: {
              'content-type': 'text/event-stream',
              'cache-control': 'no-cache',
              connection: 'keep-alive',
              'x-gateway-provider': target.provider,
              'x-gateway-target': target.id
            }
          });
        }

        // Unary JSON Response
        const rawJson = await response.json();
        const normalized = adapter.transformResponse(rawJson, response.status, targetConfig);

        // Feature 7: Unified Token Usage Accounting
        const usage = TokenUsageAccounting.extractUsage(
          rawJson,
          target.provider,
          body,
          normalized.choices[0]?.message?.content || ''
        );

        // Feature 8: Cost calculation
        const cost = PricingEngine.calculateCost(body.model, usage);
        (normalized as any).cost = cost;

        // Feature 14: Cache response
        if (!bypassCache) {
          cache.set(cacheKey, normalized);
        }

        // H4: Audit & Metering Hook
        if (activeAuditHook) {
          await activeAuditHook({
            requestId,
            traceId,
            timestamp: new Date().toISOString(),
            actor,
            model: body.model,
            provider: target.provider,
            targetId: target.id,
            tokens: usage,
            cost,
            latencyMs: Date.now() - requestStartTime,
            outcome: 'success',
            statusCode: 200
          });
        }

        return c.json(normalized, 200, {
          'x-gateway-provider': target.provider,
          'x-gateway-target': target.id,
          'x-gateway-latency-ms': latency.toString(),
          'x-cache': 'MISS'
        });
      } catch (fetchErr: any) {
        cooldownTracker.decrementInFlight(target.id);
        cooldownTracker.recordFailure(target.id, 10);
        console.error(`[Gateway] Network error contacting ${target.id}: ${fetchErr.message}`);
        lastError = fetchErr.message;
      }
    }

    return c.json({
      error: {
        message: `All upstream targets for '${body.model}' failed. Last error: ${lastError}`,
        type: 'gateway_upstream_error',
        param: null,
        code: lastStatusCode
      }
    }, lastStatusCode as any);
  });

  return { 
    app, 
    router, 
    cooldownTracker, 
    rateLimiter, 
    cache, 
    rulesEngine, 
    vault,
    engine 
  };
}
