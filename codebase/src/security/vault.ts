/**
 * Reversible Tokenization Vault
 * Anonymizes sensitive fields into opaque tokens before sending upstream,
 * and restores original values on the downstream response or SSE stream.
 */
export class TokenVault {
  private vault = new Map<string, { original: string; expiresAt: number }>();
  private defaultTtlMs: number;

  constructor(defaultTtlSeconds: number = 3600) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  public store(original: string, prefix: string = 'tok_'): string {
    const token = `${prefix}${crypto.randomUUID()}`;
    this.vault.set(token, {
      original,
      expiresAt: Date.now() + this.defaultTtlMs
    });
    return token;
  }

  public resolve(token: string): string | undefined {
    const entry = this.vault.get(token);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.vault.delete(token);
      return undefined;
    }
    return entry.original;
  }

  public detokenizeString(text: string): string {
    let result = text;
    for (const [token, entry] of this.vault.entries()) {
      if (Date.now() <= entry.expiresAt && result.includes(token)) {
        result = result.replaceAll(token, entry.original);
      }
    }
    return result;
  }

  /**
   * Creates a TransformStream that restores tokenized values in real-time
   * as SSE chunks pass through from the upstream provider.
   */
  public createDetokenizeStream(): TransformStream<Uint8Array, Uint8Array> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const self = this;

    return new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const restored = self.detokenizeString(text);
        controller.enqueue(encoder.encode(restored));
      }
    });
  }

  public cleanExpired(): void {
    const now = Date.now();
    for (const [token, entry] of this.vault.entries()) {
      if (now > entry.expiresAt) {
        this.vault.delete(token);
      }
    }
  }
}
