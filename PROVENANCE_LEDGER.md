# Provenance Ledger

This ledger records the origin, licensing treatment, specification author, and implementation engineer for every file in `src/` and `quarantine/`. Every file is accounted for. Treatments strictly follow verified source lineage and clean-room provenance standards.

| File | Feature / Subsystem | Primary Source & Path | Source Commit SHA | Treatment | Spec Author | Implementer | Date | License Notice Status |
|:---|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| `src/audio/speech.ts` | #22 Audio Speech & Transcription API | Portkey (`src/handlers/createSpeechHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/batches/manager.ts` | #24 Batch Processing API | Portkey (`src/handlers/batchesHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/caching/cache.ts` | #14 Exact Response Cache | In-memory cache design; reference: Portkey (`src/middlewares/cache/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Unverified (flagged for counsel) | Antigravity Architecture | Antigravity Engineering | 2026-10-18 | Yes |
| `src/caching/semantic.ts` | #21 Semantic Vector Caching | Bifrost (`plugins/semanticcache/`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/config/manifest-loader.ts` | #35 Declarative Config Manifest | Envoy AI Gateway (`pulse.yaml` / Gateway API) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | Envoy Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/core/engine.ts` | H1-H4 Gateway Engine | ra1 Architecture Contract (`IGatewayEngine`, failover, hooks) | N/A (ra1 Core) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/core/server.ts` | #1 HTTP Pipeline | Hono HTTP framework; Portkey handler pattern | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes (MIT) |
| `src/core/stream-failover.ts` | #34 Stream Failover | Bifrost stream test logic (`bifrost/core/streamfallback_test.go`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/core/stream.ts` | #3 Stream Normalizer | Web Streams SSE Transform; Portkey (`src/handlers/streamHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/embeddings/generator.ts` | Embeddings API | Portkey (`src/handlers/embeddingsHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/files/manager.ts` | #39 File Management & Fine Tuning | Portkey (`src/handlers/filesHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/images/generate.ts` | #23 Image Generations & Edits API | Portkey (`src/handlers/imageGenerationsHandler.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/index.ts` | Gateway Entrypoint & Tiers | Service entrypoint, route bootstrap, virtual tiers (#5) | N/A (ra1 Core) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/providers/anthropic.ts` | #2 Provider Translation | Portkey (`src/providers/anthropic/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/providers/bedrock.ts` | #16 Bedrock SigV4 Adapter | AWS SigV4 specification; Envoy (`internal/translator/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | AWS Spec / Envoy | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/providers/gcp-auth.ts` | #36 GCP OAuth2 Token Refresher | Envoy AI Gateway (`internal/gcpauth/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | Envoy Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/providers/gemini.ts` | #2 Provider Translation | Google REST API spec; Envoy (`internal/translator/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | Google API / Envoy Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/providers/local.ts` | #2 Local Runtimes | OpenAI-compatible specification for llama.cpp & LocalAI | N/A (Open Public Spec) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/providers/ollama.ts` | #2 Provider Translation | Ollama native REST API spec; Portkey (`src/providers/ollama/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Ollama / Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/providers/openai.ts` | #2 Provider Translation | Portkey (`src/providers/openai/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/providers/registry.ts` | #2 Adapter Registry | Factory/Registry pattern | N/A (Standard Pattern) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/realtime/gateway.ts` | #20 Realtime Audio/WebSocket API | Portkey (`src/handlers/realtimeHandler.ts`) & OpenAI Realtime Spec | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey / OpenAI Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/rerank/router.ts` | #30 Semantic Reranking API | LiteLLM rerank API specification | `7e6fb09da3987c8b75062307695f9083da55feed` | Adapted (MIT) | LiteLLM Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/resilience/budgets.ts` | #27 Multi-Tier Hierarchical Budgets | Bifrost (`plugins/governance/`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/resilience/classifier.ts` | #10 Error Classification | Bifrost failure classification (`bifrost/core/failureclass.go`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/resilience/cooldown.ts` | #4 Cooldown & Health | Bifrost cooldown tracking (`bifrost/core/keyselectors/`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/resilience/ratelimit.ts` | #9 Rate Limiter | Standard sliding-window memory algorithm | N/A (Standard Algorithm) | Unverified (flagged for counsel) | Antigravity Architecture | Antigravity Engineering | 2026-10-18 | Yes |
| `src/resilience/tpm.ts` | #15 Sliding-Window TPM Limiter | LiteLLM (`proxy/proxy_server.py`) | `7e6fb09da3987c8b75062307695f9083da55feed` | Adapted (MIT) | LiteLLM Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/routing/cel.ts` | #43 Common Expression Language (CEL) | Envoy AI Gateway (`internal/llmcostcel/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | Envoy Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/routing/conditional.ts` | #28 Advanced Conditional Routing | Portkey conditional router (`src/handlers/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/routing/router.ts` | #4, #5, #11 Router | Bifrost routing strategies (`bifrost/plugins/routing/`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/routing/session-affinity.ts` | #32 Sticky Session Affinity | Bifrost (`core/sessionaffinity.go`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/routing/shadow.ts` | #33 Shadow & Canary Traffic Emulation | Bifrost decision emulation (`core/decisionemulation.go`) | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/security/byok.ts` | #29 Bring Your Own Key Routing | Portkey handler utils (`src/utils/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/security/guardrails/pipeline.ts` | #19 Modular Guardrails Pipeline | Portkey plugins architecture (`src/plugins/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/security/pii.ts` | #19 Reversible PII Engine | Specification in `docs/specs/reversible-pii-masking.md` | N/A (Internal Spec) | Unverified (flagged for counsel) | Architecture Team | Engineering (Same session; unproven isolation) | 2026-10-19 | Flagged |
| `src/security/reasoning.ts` | #42 Reasoning Content Isolation | DeepSeek-R1 / Anthropic thinking specs & Bifrost | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Adapted (Apache-2.0) | Bifrost Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/security/secrets.ts` | #26 H3 Key-Lookup Hook Stub | Gateway H3 hook stub; manager moved to `packages-pending/layer-0-vault/` | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-19 | Yes |
| `src/security/ssrf.ts` | SSRF Guard | Outbound IP validation & fail-closed DNS resolution | N/A (RFC 1918/6598) | Unverified (flagged for counsel) | Antigravity Architecture | Antigravity Engineering | 2026-10-18 | Flagged |
| `src/security/vault.ts` | #19 Reversible PII Token Vault | Specification in `docs/specs/reversible-pii-masking.md` | N/A (Internal Spec) | Unverified (flagged for counsel) | Architecture Team | Engineering (Same session; unproven isolation) | 2026-10-19 | Flagged |
| `src/telemetry/body-offload.ts` | #31 Large Payload Body Offload | LiteLLM payload offload patterns | `7e6fb09da3987c8b75062307695f9083da55feed` | Adapted (MIT) | LiteLLM Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/telemetry/metrics.ts` | Prometheus Metrics Exposition | Prometheus exposition format specification | N/A (Open Standard) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-19 | Yes |
| `src/telemetry/pricing-data.json` | #8 Pricing Table | Official public pricing pages (OpenAI, Anthropic, Google) | N/A (Provider Pricing) | Own implementation | Provider Pages | Antigravity Engineering | 2026-10-18 | Yes |
| `src/telemetry/pricing.ts` | #8 Pricing Engine | Envoy AI Gateway design concept (`internal/llmcostcel/`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | Envoy Spec | Antigravity Engineering | 2026-10-18 | Yes (Apache-2.0) |
| `src/telemetry/tokens.ts` | #25 Token Counting API | Envoy AI Gateway (`internal/translator/tokenize.go`) | `12fef6422579f544e84be8167d0979527d3576d4` | Adapted (Apache-2.0) | Envoy Spec | Antigravity Engineering | 2026-10-19 | Yes (Apache-2.0) |
| `src/telemetry/tracing.ts` | #12 OpenTelemetry GenAI Spans | OpenTelemetry GenAI Conventions & Portkey (`src/apm/`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `src/telemetry/usage.ts` | #7 Token Accounting | Portkey (`src/handlers/responseHandlers.ts`) | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Adapted (MIT) | Portkey Spec | Antigravity Engineering | 2026-10-18 | Yes (MIT) |
| `src/types/chat.ts` | #1 Chat Types & Zod | OpenAI Chat Completion API specification | N/A (Open Public Spec) | Own implementation | OpenAI Spec | Antigravity Engineering | 2026-10-18 | Yes |
| `src/types/provider.ts` | Provider Types | Gateway internal provider interfaces | N/A (ra1 Core) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/types/ra1.ts` | ra1 Hooks Contract | ra1 Layer 0 integration hooks (H1-H5) | N/A (ra1 Core) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/types/resilience.ts` | Resilience Types | Error classification & health tracking types | N/A (ra1 Core) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/types/telemetry.ts` | Telemetry Types | Multi-unit token usage & pricing tier types | N/A (ra1 Core) | Own implementation | ra1 Architecture | ra1 Engineering | 2026-10-18 | Yes |
| `src/ui/console.ts` | #18 Web Console Interface Stub | Gateway console stub; UI moved to `packages-pending/app-surface/console.ts` | `669825cbe89ee51569918b8f78a9db486fd69dd4` | Own implementation | Antigravity Architecture | Antigravity Engineering | 2026-10-19 | Yes |
| `src/videos/generator.ts` | #37 Video Generation API | LiteLLM video API specification | `7e6fb09da3987c8b75062307695f9083da55feed` | Adapted (MIT) | LiteLLM Spec | Antigravity Engineering | 2026-10-19 | Yes (MIT) |
| `quarantine/geoip.test.ts` | #38 GeoIP Test Suite | Isolated test suite for GeoIP filter | N/A (Quarantine) | Quarantined | Clean-room pending | Quarantined | 2026-10-19 | Quarantined |
| `quarantine/geoip.ts` | #38 GeoIP & Abuse IP Blacklisting | Unproven implementation; isolated pending clean-room rebuild | N/A (Quarantine) | Quarantined | Clean-room pending | Quarantined | 2026-10-19 | Quarantined |

---

### Moved Modules (Excluded from Gateway Build)

The following non-gateway subsystems have been moved out of the gateway build into `packages-pending/`:
- **Layer 0 Vault**: `packages-pending/layer-0-vault/secrets.ts` (external secrets-manager sync; gateway retains only H3 key-lookup hook).
- **Layer 0 Metering & Billing**: `packages-pending/layer-0-metering-billing/credits.ts`, `leases.ts` (gateway emits usage events through H4).
- **Layer 1 Tool Registry**: `packages-pending/layer-1-tool-registry/gateway.ts`, `tool-search.ts` (MCP tool registration and semantic search).
- **Layer 2 Orchestration**: `packages-pending/layer-2-orchestration/a2a.ts` (agent-to-agent protocol).
- **App Surface**: `packages-pending/app-surface/console.ts` (admin control console & chat playground UI).
- **Deployment Topology**: `docs/deployment-notes.md` (replaces mesh code; dual-tier edge-to-regional architecture).
