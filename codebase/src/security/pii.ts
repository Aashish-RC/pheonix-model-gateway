export type PiiCategory = 
  | 'email' 
  | 'phone' 
  | 'ssn' 
  | 'credit_card' 
  | 'ip_address' 
  | 'address' 
  | 'date_of_birth';

export type ReplacementStrategy = 'placeholder' | 'hash' | 'mask';

export interface PiiMatch {
  category: PiiCategory;
  match: string;
  start: number;
  end: number;
}

export const piiPatterns: Record<PiiCategory, RegExp[]> = {
  email: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g],
  phone: [
    /(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    /\+\d{1,3}[\s.-]?\d{4,14}/g,
  ],
  ssn: [/\b\d{3}-\d{2}-\d{4}\b/g],
  credit_card: [
    /\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Visa
    /\b5[1-5]\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Mastercard
    /\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b/g, // Amex
    /\b6(?:011|5\d{2})[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Discover
  ],
  ip_address: [/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g],
  address: [
    /\b\d{1,5}\s+\w+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Circle|Cir)\b/gi,
  ],
  date_of_birth: [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{2,4}\b/gi,
  ],
};

export const placeholders: Record<PiiCategory, string> = {
  email: '[EMAIL_REDACTED]',
  phone: '[PHONE_REDACTED]',
  ssn: '[SSN_REDACTED]',
  credit_card: '[CREDIT_CARD_REDACTED]',
  ip_address: '[IP_REDACTED]',
  address: '[ADDRESS_REDACTED]',
  date_of_birth: '[DOB_REDACTED]',
};

async function hashValue(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}

function maskValue(value: string): string {
  if (value.length <= 2) return '**';
  if (value.length <= 4) return value[0] + '***';
  return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
}

export class PiiEngine {
  public static detectPii(text: string, categories: PiiCategory[]): PiiMatch[] {
    const matches: PiiMatch[] = [];

    for (const category of categories) {
      const patterns = piiPatterns[category];
      if (!patterns) continue;

      for (const pattern of patterns) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          matches.push({
            category,
            match: m[0],
            start: m.index,
            end: m.index + m[0].length,
          });
        }
      }
    }

    matches.sort((a, b) => a.start - b.start || b.end - a.end);

    const deduped: PiiMatch[] = [];
    let lastEnd = -1;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        deduped.push(m);
        lastEnd = m.end;
      }
    }

    return deduped;
  }

  public static async replacePii(
    text: string,
    matches: PiiMatch[],
    strategy: ReplacementStrategy = 'placeholder'
  ): Promise<string> {
    if (matches.length === 0) return text;

    const replacements: string[] = [];
    for (const m of matches) {
      switch (strategy) {
        case 'placeholder':
          replacements.push(placeholders[m.category] || '[REDACTED]');
          break;
        case 'hash':
          replacements.push(await hashValue(m.match));
          break;
        case 'mask':
          replacements.push(maskValue(m.match));
          break;
      }
    }

    let result = '';
    let lastIdx = 0;
    for (let i = 0; i < matches.length; i++) {
      result += text.slice(lastIdx, matches[i].start);
      result += replacements[i];
      lastIdx = matches[i].end;
    }
    result += text.slice(lastIdx);

    return result;
  }

  public static async scrubText(
    text: string,
    categories: PiiCategory[] = ['email', 'phone', 'ssn', 'credit_card', 'ip_address'],
    strategy: ReplacementStrategy = 'placeholder'
  ): Promise<{ text: string; redactionCount: number }> {
    const matches = this.detectPii(text, categories);
    const scrubbed = await this.replacePii(text, matches, strategy);
    return { text: scrubbed, redactionCount: matches.length };
  }
}
