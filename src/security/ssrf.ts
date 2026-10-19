export interface DnsLookupRecord {
  address: string;
  family?: number;
}

export type DnsResolver = (hostname: string) => Promise<DnsLookupRecord[]>;

export const defaultDnsResolver: DnsResolver = async (_hostname: string): Promise<DnsLookupRecord[]> => {
  throw new Error('Not implemented');
};

export function createFakeDnsResolver(_customRecords?: Record<string, string[]>): DnsResolver {
  return async () => [];
}

export class SSRFGuard {
  constructor(_resolver?: DnsResolver) {}

  public static setResolver(_resolver: DnsResolver): void {}

  public static resetResolver(): void {}

  public static getResolver(): DnsResolver {
    throw new Error('Not implemented');
  }

  public async validateUrl(_urlString: string, _allowLocalhost: boolean = false): Promise<void> {
    throw new Error('Not implemented');
  }

  public static async validateUrl(
    _urlString: string,
    _allowLocalhost: boolean = false,
    _customResolver?: DnsResolver
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  public static isPrivateOrReservedIp(_ip: string, _allowLocalhost: boolean): boolean {
    throw new Error('Not implemented');
  }
}
