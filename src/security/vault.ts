export interface VaultTokenRecord {
  token: string;
  originalValue: string;
  entityType: string;
  createdAt: number;
  expiresAt: number;
}

export class TokenVault {
  private static instance?: TokenVault;
  constructor(_ttlSeconds: number = 3600) {}

  public static getInstance(): TokenVault {
    if (!TokenVault.instance) {
      TokenVault.instance = new TokenVault();
    }
    return TokenVault.instance;
  }

  public store(_originalValue: string, _entityType: string, _ttlSeconds?: number): string {
    throw new Error('Not implemented');
  }

  public get(_token: string): VaultTokenRecord | undefined {
    throw new Error('Not implemented');
  }

  public evict(_token: string): void {
    throw new Error('Not implemented');
  }

  public clear(): void {
    throw new Error('Not implemented');
  }

  public size(): number {
    throw new Error('Not implemented');
  }
}
