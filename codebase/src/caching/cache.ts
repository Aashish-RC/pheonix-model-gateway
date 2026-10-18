import { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat.js';

interface CacheEntry {
  response: ChatCompletionResponse;
  expiresAt: number;
  createdAt: number;
}

export class ResponseCache {
  private store = new Map<string, CacheEntry>();
  private defaultTtlMs: number;

  constructor(defaultTtlSeconds: number = 300) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  public static computeKey(req: ChatCompletionRequest): string {
    const payload = {
      model: req.model,
      messages: req.messages,
      temperature: req.temperature,
      top_p: req.top_p,
      max_tokens: req.max_tokens,
      tools: req.tools
    };
    const json = JSON.stringify(payload);
    // Fast in-memory hash or string
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      hash = ((hash << 5) - hash + json.charCodeAt(i)) | 0;
    }
    return `resp_cache:${req.model}:${hash}`;
  }

  public get(key: string): ChatCompletionResponse | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.response;
  }

  public set(key: string, response: ChatCompletionResponse, ttlSeconds?: number): void {
    const ttl = (ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs);
    this.store.set(key, {
      response,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  public invalidate(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }
}
