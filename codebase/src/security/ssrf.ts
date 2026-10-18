import { URL } from 'node:url';
import dns from 'node:dns/promises';

export class SSRFGuard {
  // Disallowed IPv4 ranges
  // 127.0.0.0/8 (Loopback)
  // 10.0.0.0/8 (Private)
  // 172.16.0.0/12 (Private)
  // 192.168.0.0/16 (Private)
  // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
  // 0.0.0.0/8
  public static async validateUrl(urlString: string, allowLocalhost: boolean = false): Promise<void> {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      throw new Error(`SSRF Guard: Invalid target URL "${urlString}"`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`SSRF Guard: Unsupported protocol "${parsed.protocol}"`);
    }

    const hostname = parsed.hostname;

    // Check direct IP or hostname
    if (!allowLocalhost && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
      throw new Error(`SSRF Guard: Access to loopback/localhost is forbidden`);
    }

    // Resolve DNS to verify actual IP destination
    try {
      const records = await dns.lookup(hostname, { all: true });
      for (const rec of records) {
        if (this.isPrivateOrReservedIp(rec.address, allowLocalhost)) {
          throw new Error(
            `SSRF Guard: Resolved destination ${hostname} -> ${rec.address} is a private or reserved network address`
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('SSRF Guard:')) {
        throw err;
      }
      // If DNS resolution fails, let fetch fail naturally or catch network error
    }
  }

  private static isPrivateOrReservedIp(ip: string, allowLocalhost: boolean): boolean {
    if (allowLocalhost && (ip === '127.0.0.1' || ip === '::1')) {
      return false;
    }

    // IPv4 checks
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
      // 127.0.0.0/8
      if (parts[0] === 127) return true;
      // 10.0.0.0/8
      if (parts[0] === 10) return true;
      // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.0.0/16 (Link-local & AWS Metadata)
      if (parts[0] === 169 && parts[1] === 254) return true;
      // 0.0.0.0/8
      if (parts[0] === 0) return true;
    }

    // IPv6 checks (fc00::/7 private, ::1 loopback)
    if (ip === '::1' || ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) {
      return true;
    }

    return false;
  }
}
