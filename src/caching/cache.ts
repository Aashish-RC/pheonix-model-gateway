import { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat.js';

export interface ResponseCacheOptions {
  enabled?: boolean;
  defaultTtlSeconds?: number;
}

export class ResponseCache {
  public enabled: boolean = false;

  constructor(_options: ResponseCacheOptions = {}) {}

  public static canonicalStringify(_obj: any): string {
    throw new Error('Not implemented');
  }

  public static computeKey(
    _req: ChatCompletionRequest,
    _scope?: { actor?: string; tenantId?: string }
  ): string {
    throw new Error('Not implemented');
  }

  public get(_key: string): ChatCompletionResponse | undefined {
    throw new Error('Not implemented');
  }

  public set(
    _key: string,
    _response: ChatCompletionResponse,
    _ttlSeconds?: number,
    _scope?: { actor?: string; tenantId?: string }
  ): void {
    throw new Error('Not implemented');
  }

  public invalidate(_key: string): void {
    throw new Error('Not implemented');
  }

  public clear(): void {
    throw new Error('Not implemented');
  }

  public size(): number {
    throw new Error('Not implemented');
  }
}
