import { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat.js';

export type MaskCategory = 'EMAIL' | 'PHONE' | 'SSN' | 'CREDIT_CARD' | 'IP_ADDRESS';
export type PIIEntityType = MaskCategory;

export interface MaskEntityMatch {
  type: MaskCategory;
  value: string;
  start: number;
  end: number;
}
export type PIIEntityMatch = MaskEntityMatch;

export interface MaskEngineOptions {
  enabledTypes?: MaskCategory[];
  vaultTtlSeconds?: number;
}
export type PIIEngineOptions = MaskEngineOptions;

export class PIIMaskingEngine {
  constructor(_options: MaskEngineOptions = {}) {}

  public detect(_text: string): MaskEntityMatch[] {
    throw new Error('Not implemented');
  }

  public maskText(_text: string): string {
    throw new Error('Not implemented');
  }

  public maskRequest(_request: ChatCompletionRequest): ChatCompletionRequest {
    throw new Error('Not implemented');
  }

  public unmaskText(_text: string): string {
    throw new Error('Not implemented');
  }

  public unmaskResponse(_response: ChatCompletionResponse): ChatCompletionResponse {
    throw new Error('Not implemented');
  }

  public createStreamDetokenizer(): (chunk: string) => string {
    throw new Error('Not implemented');
  }
}
