import { PiiEngine, PiiCategory, ReplacementStrategy } from './pii.js';
import { TokenVault } from './vault.js';
import { ChatCompletionRequest } from '../types/chat.js';

export interface SecurityRuleAction {
  type: 'redact_pii' | 'find_replace' | 'redact_field' | 'block_request' | 'tokenize';
  categories?: PiiCategory[];
  strategy?: ReplacementStrategy;
  find?: string | RegExp;
  replace?: string;
  field?: string;
  blockMessage?: string;
  blockStatusCode?: number;
}

export interface SecurityRule {
  id: string;
  name: string;
  enabled: boolean;
  match?: {
    model?: string;
    path?: string;
  };
  actions: SecurityRuleAction[];
}

export class RulesEngine {
  private rules: SecurityRule[] = [];
  private vault: TokenVault;

  constructor(vault: TokenVault) {
    this.vault = vault;
  }

  public registerRule(rule: SecurityRule): void {
    this.rules.push(rule);
  }

  public async evaluateRequest(body: ChatCompletionRequest): Promise<{
    allowed: boolean;
    modifiedBody: ChatCompletionRequest;
    blockReason?: string;
    statusCode?: number;
  }> {
    let currentBody = JSON.parse(JSON.stringify(body)) as ChatCompletionRequest;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      if (rule.match?.model && rule.match.model !== currentBody.model) continue;

      for (const action of rule.actions) {
        if (action.type === 'block_request') {
          return {
            allowed: false,
            modifiedBody: currentBody,
            blockReason: action.blockMessage || 'Request blocked by security rule',
            statusCode: action.blockStatusCode || 403
          };
        }

        if (action.type === 'redact_pii') {
          const categories = action.categories || ['email', 'phone', 'ssn', 'credit_card', 'ip_address'];
          for (const msg of currentBody.messages) {
            if (typeof msg.content === 'string') {
              const res = await PiiEngine.scrubText(msg.content, categories, action.strategy);
              msg.content = res.text;
            }
          }
        }

        if (action.type === 'find_replace' && action.find !== undefined && action.replace !== undefined) {
          for (const msg of currentBody.messages) {
            if (typeof msg.content === 'string') {
              msg.content = msg.content.replaceAll(action.find, action.replace);
            }
          }
        }

        if (action.type === 'tokenize') {
          for (const msg of currentBody.messages) {
            if (typeof msg.content === 'string') {
              // Tokenize matches
              const matches = PiiEngine.detectPii(msg.content, action.categories || ['email', 'phone', 'ssn']);
              for (const m of matches) {
                const token = this.vault.store(m.match, 'tok_pii_');
                msg.content = msg.content.replace(m.match, token);
              }
            }
          }
        }
      }
    }

    return { allowed: true, modifiedBody: currentBody };
  }
}
