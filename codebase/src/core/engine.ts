import { 
  IGatewayEngine, 
  GatewayRequestOptions, 
  RequestContext, 
  PermissionHook, 
  KeyLookupHook, 
  AuditHook, 
  StreamChunkHook 
} from '../types/ra1.js';
import { ChatCompletionRequest, ChatCompletionResponse, ChatCompletionRequestSchema } from '../types/chat.js';
import { ModelRouter } from '../routing/router.js';
import { CooldownTracker } from '../resilience/cooldown.js';
import { ProviderRegistry } from '../providers/registry.js';
import { ErrorClassifier } from '../resilience/classifier.js';
import { SSRFGuard } from '../security/ssrf.js';
import { TokenUsageAccounting } from '../telemetry/usage.js';
import { PricingEngine } from '../telemetry/pricing.js';
import { StreamFailoverManager } from './stream-failover.js';
import { StreamTransformState } from '../types/provider.js';

export interface GatewayEngineConfig {
  router: ModelRouter;
  cooldownTracker: CooldownTracker;
  defaultPermissionHook?: PermissionHook;
  defaultKeyLookupHook?: KeyLookupHook;
  defaultAuditHook?: AuditHook;
  defaultStreamChunkHook?: StreamChunkHook;
}

/**
 * High-performance ra1-native Model Gateway Engine implementing the IGatewayEngine contract.
 */
export class GatewayEngine implements IGatewayEngine {
  private router: ModelRouter;
  private cooldownTracker: CooldownTracker;
  private permissionHook?: PermissionHook;
  private keyLookupHook?: KeyLookupHook;
  private auditHook?: AuditHook;
  private streamChunkHook?: StreamChunkHook;

  constructor(config: GatewayEngineConfig) {
    this.router = config.router;
    this.cooldownTracker = config.cooldownTracker;
    this.permissionHook = config.defaultPermissionHook;
    this.keyLookupHook = config.defaultKeyLookupHook;
    this.auditHook = config.defaultAuditHook;
    this.streamChunkHook = config.defaultStreamChunkHook;
  }

  public setPermissionHook(hook: PermissionHook): void {
    this.permissionHook = hook;
  }

  public setKeyLookupHook(hook: KeyLookupHook): void {
    this.keyLookupHook = hook;
  }

  public setAuditHook(hook: AuditHook): void {
    this.auditHook = hook;
  }

  public setStreamChunkHook(hook: StreamChunkHook): void {
    this.streamChunkHook = hook;
  }

  public async chatCompletion(
    req: ChatCompletionRequest,
    options?: GatewayRequestOptions
  ): Promise<ChatCompletionResponse> {
    const validated = ChatCompletionRequestSchema.parse(req);
    const ctx = this.buildContext(options?.context);

    // H2: Permission Hook
    const permHook = options?.permissionHook || this.permissionHook;
    if (permHook) {
      const decision = await permHook(validated, ctx);
      if (decision.action === 'deny') {
        const error = new Error(`Permission denied: ${decision.reason}`) as any;
        error.statusCode = decision.statusCode || 403;
        await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', 0, 'denied', error.statusCode, error.message);
        throw error;
      }
      if (decision.action === 'ask-human') {
        const error = new Error(`Human-in-the-loop approval required for challenge: ${decision.challengeId}`) as any;
        error.statusCode = 428;
        error.challengeId = decision.challengeId;
        await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', 0, 'denied', 428, error.message);
        throw error;
      }
    }

    const systemPrompt = validated.messages.find(m => m.role === 'system')?.content || '';
    const targets = this.router.resolveTargets(validated.model, systemPrompt);

    if (targets.length === 0) {
      const error = new Error(`No available target found for model '${validated.model}'`) as any;
      error.statusCode = 404;
      await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', 0, 'error', 404, error.message);
      throw error;
    }

    let lastError: any = null;
    const startTime = Date.now();

    for (const target of targets) {
      const adapter = ProviderRegistry.get(target.provider);
      if (!adapter) continue;

      // H3: Vault Key Lookup
      let config = { ...target.config };
      const keyHook = options?.keyLookupHook || this.keyLookupHook;
      if (keyHook) {
        const scopedCred = await keyHook(target.provider, target.model, ctx);
        if (scopedCred?.apiKey) {
          config.apiKey = scopedCred.apiKey;
        }
      }

      const upstreamReq = adapter.transformRequest(
        { ...validated, model: target.model },
        config
      );

      // Validate URL against SSRF
      await SSRFGuard.validateUrl(upstreamReq.url, target.provider === 'ollama' || target.provider === 'localai' || target.provider === 'llama.cpp');

      this.cooldownTracker.incrementInFlight(target.id);
      const targetStartTime = Date.now();

      try {
        const response = await fetch(upstreamReq.url, {
          method: upstreamReq.method,
          headers: upstreamReq.headers,
          body: upstreamReq.body
        });

        const latency = Date.now() - targetStartTime;

        if (!response.ok) {
          const errorBody = await response.text();
          let parsedError: unknown = errorBody;
          try { parsedError = JSON.parse(errorBody); } catch {}

          const classified = ErrorClassifier.classify(response.status, parsedError, response.headers);
          this.cooldownTracker.decrementInFlight(target.id);

          if (classified.isRetryable) {
            this.cooldownTracker.recordFailure(target.id, classified.retryAfterSeconds);
            lastError = classified;
            continue; // failover
          } else {
            const err = new Error(classified.message) as any;
            err.statusCode = response.status;
            err.classified = classified;
            await this.emitAudit(ctx, validated.model, target.provider, target.id, latency, 'error', response.status, classified.message);
            throw err;
          }
        }

        this.cooldownTracker.recordSuccess(target.id, latency);
        this.cooldownTracker.decrementInFlight(target.id);

        const rawJson = await response.json();
        const normalized = adapter.transformResponse(rawJson, response.status, config);

        // Feature 7: Unified Token Usage Accounting
        const usage = TokenUsageAccounting.extractUsage(
          rawJson, 
          target.provider, 
          validated, 
          normalized.choices[0]?.message?.content || ''
        );

        // Feature 8: Cost calculation
        const cost = PricingEngine.calculateCost(validated.model, usage);
        (normalized as any).cost = cost;

        // H4: Audit & Metering Hook
        await this.emitAudit(ctx, validated.model, target.provider, target.id, Date.now() - startTime, 'success', 200, undefined, usage, cost);

        return normalized;
      } catch (err: any) {
        this.cooldownTracker.decrementInFlight(target.id);
        this.cooldownTracker.recordFailure(target.id, 10);
        lastError = err;
      }
    }

    const totalLatency = Date.now() - startTime;
    await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', totalLatency, 'error', 502, lastError?.message || 'All targets failed');
    const finalErr = new Error(`All targets failed for model '${validated.model}'. Last error: ${lastError?.message || lastError}`) as any;
    finalErr.statusCode = 502;
    throw finalErr;
  }

  public async streamChatCompletion(
    req: ChatCompletionRequest,
    options?: GatewayRequestOptions
  ): Promise<ReadableStream<Uint8Array>> {
    const validated = ChatCompletionRequestSchema.parse({ ...req, stream: true });
    const ctx = this.buildContext(options?.context);

    // H2: Permission Hook
    const permHook = options?.permissionHook || this.permissionHook;
    if (permHook) {
      const decision = await permHook(validated, ctx);
      if (decision.action === 'deny') {
        const error = new Error(`Permission denied: ${decision.reason}`) as any;
        error.statusCode = decision.statusCode || 403;
        await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', 0, 'denied', error.statusCode, error.message);
        throw error;
      }
      if (decision.action === 'ask-human') {
        const error = new Error(`Human-in-the-loop approval required for challenge: ${decision.challengeId}`) as any;
        error.statusCode = 428;
        await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', 0, 'denied', 428, error.message);
        throw error;
      }
    }

    const systemPrompt = validated.messages.find(m => m.role === 'system')?.content || '';
    const targets = this.router.resolveTargets(validated.model, systemPrompt);

    if (targets.length === 0) {
      const error = new Error(`No available target found for model '${validated.model}'`) as any;
      error.statusCode = 404;
      await this.emitAudit(ctx, validated.model, 'unknown', 'unknown', 0, 'error', 404, error.message);
      throw error;
    }

    let lastError: any = null;

    for (const target of targets) {
      const adapter = ProviderRegistry.get(target.provider);
      if (!adapter) continue;

      // H3: Vault Key Lookup
      let config = { ...target.config };
      const keyHook = options?.keyLookupHook || this.keyLookupHook;
      if (keyHook) {
        const scopedCred = await keyHook(target.provider, target.model, ctx);
        if (scopedCred?.apiKey) {
          config.apiKey = scopedCred.apiKey;
        }
      }

      const upstreamReq = adapter.transformRequest(
        { ...validated, model: target.model },
        config
      );

      await SSRFGuard.validateUrl(upstreamReq.url, target.provider === 'ollama' || target.provider === 'localai' || target.provider === 'llama.cpp');
      this.cooldownTracker.incrementInFlight(target.id);
      const targetStartTime = Date.now();

      try {
        const response = await fetch(upstreamReq.url, {
          method: upstreamReq.method,
          headers: upstreamReq.headers,
          body: upstreamReq.body
        });

        if (!response.ok || !response.body) {
          const errorBody = await response.text();
          let parsedError: unknown = errorBody;
          try { parsedError = JSON.parse(errorBody); } catch {}

          const classified = ErrorClassifier.classify(response.status, parsedError, response.headers);
          this.cooldownTracker.decrementInFlight(target.id);

          if (classified.isRetryable) {
            this.cooldownTracker.recordFailure(target.id, classified.retryAfterSeconds);
            lastError = classified;
            continue; // Failover pre-first-byte
          } else {
            const err = new Error(classified.message) as any;
            err.statusCode = response.status;
            throw err;
          }
        }

        // Feature 34: Guarded stream with pre-first-byte failover & post-first-byte SSE error
        const state: StreamTransformState = {
          id: `chatcmpl-${Date.now()}`,
          model: validated.model,
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
          this.cooldownTracker.decrementInFlight(target.id);
          this.cooldownTracker.recordFailure(target.id, 10);
          lastError = preflightErr;
          continue; // pre-first-byte failure -> failover to next target!
        }

        const latency = Date.now() - targetStartTime;
        this.cooldownTracker.recordSuccess(target.id, latency);
        this.cooldownTracker.decrementInFlight(target.id);

        // H4: Emit audit record for streaming initiation
        await this.emitAudit(
          ctx, 
          validated.model, 
          target.provider, 
          target.id, 
          latency, 
          'success', 
          200, 
          undefined,
          {
            promptTokens: TokenUsageAccounting.estimatePromptTokens(validated),
            completionTokens: 0,
            reasoningTokens: 0,
            cachedPromptTokens: 0,
            totalTokens: TokenUsageAccounting.estimatePromptTokens(validated),
            estimated: true
          },
          PricingEngine.calculateCost(validated.model, {
            promptTokens: TokenUsageAccounting.estimatePromptTokens(validated),
            completionTokens: 0,
            reasoningTokens: 0,
            cachedPromptTokens: 0,
            totalTokens: TokenUsageAccounting.estimatePromptTokens(validated)
          })
        );

        return stream;
      } catch (err: any) {
        this.cooldownTracker.decrementInFlight(target.id);
        this.cooldownTracker.recordFailure(target.id, 10);
        lastError = err;
      }
    }

    const finalErr = new Error(`All streaming targets failed for model '${validated.model}'. Last error: ${lastError?.message || lastError}`) as any;
    finalErr.statusCode = 502;
    throw finalErr;
  }

  private buildContext(ctx?: Partial<RequestContext>): RequestContext {
    return {
      requestId: ctx?.requestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      traceId: ctx?.traceId || `trace-${Math.random().toString(36).substring(2, 12)}`,
      actor: ctx?.actor || 'anonymous-actor',
      clientIp: ctx?.clientIp,
      metadata: ctx?.metadata
    };
  }

  private async emitAudit(
    ctx: RequestContext,
    model: string,
    provider: string,
    targetId: string,
    latencyMs: number,
    outcome: 'success' | 'error' | 'denied' | 'fallback',
    statusCode: number,
    errorMessage?: string,
    usage?: any,
    cost?: any
  ): Promise<void> {
    if (!this.auditHook) return;

    const defaultUsage = usage || {
      promptTokens: 0,
      completionTokens: 0,
      reasoningTokens: 0,
      cachedPromptTokens: 0,
      totalTokens: 0,
      estimated: false
    };

    const defaultCost = cost || PricingEngine.calculateCost(model, defaultUsage);

    try {
      await this.auditHook({
        requestId: ctx.requestId,
        traceId: ctx.traceId,
        timestamp: new Date().toISOString(),
        actor: ctx.actor,
        model,
        provider,
        targetId,
        tokens: defaultUsage,
        cost: defaultCost,
        latencyMs,
        outcome,
        statusCode,
        errorMessage,
        metadata: ctx.metadata
      });
    } catch (auditErr) {
      console.error(`[GatewayEngine] Audit hook failed:`, auditErr);
    }
  }
}
