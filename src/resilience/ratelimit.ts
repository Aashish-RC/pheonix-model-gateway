export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export class SlidingWindowRateLimiter {
  constructor(_defaultLimit: number = 60, _windowDurationSeconds: number = 60) {}

  public check(_key: string, _customLimit?: number): RateLimitResult {
    throw new Error('Not implemented');
  }

  public reset(_key: string): void {
    throw new Error('Not implemented');
  }
}
