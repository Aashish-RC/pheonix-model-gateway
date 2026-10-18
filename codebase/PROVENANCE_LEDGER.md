# Provenance Ledger

This ledger records the true origin, licensing treatment, specification author, and implementation engineer for every file in `src/`. No file is omitted. All attributions are audited against actual repository sources.

> **Truth-in-Documentation Standard**:
> - AGPL sources (`grepture-proxy`, `llmgateway`) are reference-only and removed from the active implementation workspace.
> - Any file implementing a standard technique where the implementing session previously inspected an AGPL repo is explicitly flagged for counsel.
> - Quarantined files (`quarantine/pii.ts`, `quarantine/rules.ts`, `quarantine/vault.ts`) are completely excluded from compilation and packaging.

| File in `codebase/src/` | Feature / Subsystem | Primary Source & Path | Source Commit SHA | Treatment | Spec Author | Implementer | Date | License Notice Status |
|:---|:---:|:---|:---:|:---|:---|:---|:---:|:---:|
| `src/caching/cache.ts` | #14 Exact Response Cache | Own design (canonical JSON + SHA-256 + actor/tenant scope); reference: `portkey-ai-gateway/src/middlewares/cache/` | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Own implementation of a standard technique; the AGPL source was read by the same agent; flagged for counsel. | Antigravity Architecture | Antigravity Engineering | 2026-10-18 | Yes |
| `src/core/engine.ts` | H1-H4 Gateway Engine | ra1 Architecture Contract (`IGatewayEngine`, failover, hooks) | N/A (ra1 Core) | Original ra1 Implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/core/server.ts` | #1 HTTP Pipeline | Hono web-standard HTTP route; Portkey handler pattern (`portkey-ai-gateway/src/handlers/chatCompletionsHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) with attribution | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes (MIT) |
| `src/core/stream-failover.ts` | #34 Stream Failover | Bifrost stream test logic (`bifrost/core/streamfallback_test.go`) & Portkey (`src/handlers/streamHandler.ts`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0 / MIT) with attribution | Bifrost / Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0 / MIT) |
| `src/core/stream.ts` | #3 Stream Normalizer | Web Streams SSE Transform; `portkey-ai-gateway/src/handlers/streamHandler.ts` | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) with attribution | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/index.ts` | Gateway Entrypoint & Tiers | Service entrypoint, route bootstrap, virtual tiers (#5) | N/A (ra1 Core) | Original ra1 Implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/providers/anthropic.ts` | #2 Provider Translation | `portkey-ai-gateway/src/providers/anthropic/` | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) with attribution | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/providers/gemini.ts` | #2 Provider Translation | Google REST API spec; Envoy (`internal/translator/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) with attribution | Google API / Envoy Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/providers/local.ts` | #2 Local Runtimes | OpenAI-compatible specification for llama.cpp & LocalAI | N/A (Open Public Spec) | Original Implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/providers/ollama.ts` | #2 Provider Translation | Ollama native REST API spec; Portkey (`src/providers/ollama/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) with attribution | Ollama / Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/providers/openai.ts` | #2 Provider Translation | `portkey-ai-gateway/src/providers/openai/` | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) with attribution | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/providers/registry.ts` | #2 Adapter Registry | Factory/Registry pattern | N/A (Standard Pattern) | Original Implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/resilience/classifier.ts` | #10 Error Classification | Bifrost failure classification (`bifrost/core/failureclass.go`) & Portkey errors (`src/errors/`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0 / MIT) with attribution | Bifrost / Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0 / MIT) |
| `src/resilience/cooldown.ts` | #4 Cooldown & Health | Bifrost cooldown tracking (`bifrost/core/keyselectors/`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) with attribution | Bifrost Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/resilience/ratelimit.ts` | #9 Rate Limiter | Standard sliding-window memory algorithm; no repo source | N/A (Standard Algorithm) | Own implementation of a standard technique; the AGPL source was read by the same agent; flagged for counsel. | Antigravity Architecture | Antigravity Engineering | 2026-10-18 | Yes |
| `src/routing/router.ts` | #4, #5, #11 Router | Bifrost routing strategies (`bifrost/plugins/routing/`) & LiteLLM virtual model tiers | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0 / MIT) with attribution | Bifrost / LiteLLM Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0 / MIT) |
| `src/security/ssrf.ts` | SSRF Guard | Standard zero-trust outbound IP validation & fail-closed DNS resolution | N/A (Standard RFCs 1918, 6598, 4291, 5771) | Own implementation of a standard technique; the AGPL source was read by the same agent; flagged for counsel. | Antigravity Architecture | Antigravity Engineering | 2026-10-18 | Yes |
| `src/telemetry/pricing-data.json` | #8 Pricing Table | Public pricing pages from OpenAI, Anthropic, and Google (URLs and dates cited per entry) | N/A (Official Pricing Pages) | Original Data Table (LiteLLM pricing JSON excluded) | Provider Pricing Pages | Antigravity Engineering | 2026-10-18 | Yes |
| `src/telemetry/pricing.ts` | #8 Pricing Engine | Envoy design reference (`envoy-ai-gateway/internal/llmcostcel/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted logic (Apache-2.0) using verified pricing data | Envoy Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/telemetry/usage.ts` | #7 Token Accounting | Portkey (`src/handlers/responseHandlers.ts`) & Bifrost (`core/billingheader.go`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT / Apache-2.0) with attribution | Portkey / Bifrost Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT / Apache-2.0) |
| `src/types/chat.ts` | #1 Chat Types & Zod | Public OpenAI Chat Completion API specification | N/A (Open Public Spec) | Original Zod Schema & TypeScript Types | OpenAI Spec | Antigravity Engineering | 2026-10-18 | Yes |
| `src/types/provider.ts` | Provider Types | Gateway internal provider interfaces | N/A (ra1 Core) | Original ra1 Types | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/types/ra1.ts` | ra1 Hooks Contract | ra1 Layer 0 integration hooks (H1-H5) | N/A (ra1 Core) | Original ra1 Types | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/types/resilience.ts` | Resilience Types | Error classification & health tracking types | N/A (ra1 Core) | Original ra1 Types | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/types/telemetry.ts` | Telemetry Types | Multi-unit token usage & pricing tier types | N/A (ra1 Core) | Original ra1 Types | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |

---

### Quarantined Files (Excluded from Build and Package)
- `quarantine/pii.ts` — Quarantined due to structural similarity to Grepture patterns. Excluded.
- `quarantine/rules.ts` — Quarantined with PII engine. Excluded.
- `quarantine/vault.ts` — Quarantined with PII tokenization store. Excluded.
*(To be re-implemented cleanly in R2 by a fresh session working strictly from `docs/specs/reversible-pii-masking.md`)*
