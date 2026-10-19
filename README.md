# ra1 Model Gateway

A high-performance, resilient, multi-provider AI model gateway built in TypeScript (strict ESM, Node.js LTS, Hono, Zod, Web Streams, Vitest) designed as an integrated layer for ra1.

---

## Provenance & Implementation Status

Status is tracked per-feature derived directly from `PROVENANCE_LEDGER.md`. Quarantined files are excluded from compilation and test suites. Clean-room behavior specifications are located in `docs/specs/`.

| Feature | Status | License Treatment | Reviewed by Human |
|:---|:---:|:---|:---:|
| Core H1 `IGatewayEngine` & ra1 Contract | built | Own implementation | no |
| Core H2 Permission Hook (`beforeRequest`) | built | Own implementation | no |
| Core H3 Key Lookup Hook (`onKeyLookup`) | built | Own implementation | no |
| Core H4 Audit Hook (`onAuditRecord`) | built | Own implementation | no |
| #1 OpenAI Chat Endpoint (`/v1/chat/completions`) | built | Adapted (MIT) | no |
| #2 Provider Translation (OpenAI, Anthropic, Gemini, Ollama, Bedrock, Local) | built | Adapted (MIT / Apache-2.0) | no |
| #3 SSE Streaming Normalization | built | Adapted (MIT) | no |
| #4 Fallback Chains & Cooldown Tracking | built | Adapted (Apache-2.0) | no |
| #5 Model Aliasing & Virtual Tiers | built | Adapted (Apache-2.0 / MIT) | no |
| #6 Local Runtimes (Ollama, llama.cpp, LocalAI) | built | Own implementation | no |
| #7 Token Accounting & Estimation | built | Adapted (MIT) | no |
| #8 Token Pricing & Cost Engine | built | Adapted (Apache-2.0) | no |
| #9 Request Rate Limiter (Sliding Window) | built | Unverified (flagged for counsel) | no |
| #10 Normalized Error Envelope & Mapping | built | Adapted (Apache-2.0) | no |
| #11 Prompt Cache Affinity & Routing Strategies | built | Adapted (Apache-2.0) | no |
| #12 OpenTelemetry GenAI Distributed Spans | built | Adapted (MIT) | no |
| #13 Prometheus Metrics (`/metrics`) & Health Probes | built | Own implementation | no |
| #14 Exact Response Cache | built | Unverified (flagged for counsel) | no |
| #15 Sliding-Window TPM Limiter | built | Adapted (MIT) | no |
| #16 AWS Bedrock SigV4 Adapter | built | Adapted (Apache-2.0) | no |
| #17 MCP Tool Gateway & Agent Loop | built | Adapted (Apache-2.0) | no |
| #18 Embedded Control Console & Chat Playground UI | built | Adapted (MIT) | no |
| #19 Reversible PII Masking Engine & Vault | built | Unverified (flagged for counsel) | no |
| #20 Realtime Audio/WebSocket API (`/v1/realtime`) | built | Adapted (MIT) | no |
| #21 Semantic Vector Caching | built | Adapted (Apache-2.0) | no |
| #22 Audio Speech (TTS) & Transcription (STT) | built | Adapted (MIT) | no |
| #23 Image Generations & Edits API | built | Adapted (MIT) | no |
| #24 Batch Processing API (`/v1/batches`) | built | Adapted (MIT) | no |
| #25 Token Counting API (`/v1/tokenize`) | built | Adapted (Apache-2.0) | no |
| #26 External Secrets Manager Sync | built | Adapted (Apache-2.0) | no |
| #27 Multi-Tier Hierarchical Budgets | built | Adapted (Apache-2.0) | no |
| #28 Advanced Conditional Routing | built | Adapted (MIT) | no |
| #29 Bring Your Own Key (BYOK) Routing | built | Adapted (MIT) | no |
| #30 Semantic Reranking API (`/v1/rerank`) | built | Adapted (MIT) | no |
| #31 Large Payload Body Offload | built | Adapted (MIT) | no |
| #32 Sticky Session Affinity | built | Adapted (Apache-2.0) | no |
| #33 Shadow & Canary Traffic Emulation | built | Adapted (Apache-2.0) | no |
| #34 Pre-first-byte Abort & Post-first-byte SSE Error | built | Adapted (Apache-2.0) | no |
| #35 Declarative Config Manifest Loader | built | Adapted (Apache-2.0) | no |
| #36 GCP OAuth2 Token Refresher | built | Adapted (Apache-2.0) | no |
| #37 Video Generation API (`/v1/videos`) | built | Adapted (MIT) | no |
| #38 GeoIP Country & Abuse IP Blacklisting | quarantined | Quarantined | no |
| #39 File Management & Fine-Tuning API | built | Adapted (MIT) | no |
| #40 Dynamic Semantic Tool Search | built | Adapted (Apache-2.0) | no |
| #41 Modular Guardrails Pipeline | built | Adapted (MIT) | no |
| #42 Reasoning Content Isolation | built | Adapted (Apache-2.0) | no |
| #43 Common Expression Language (CEL) Engine | built | Adapted (Apache-2.0) | no |
| #44 Dual-Tier Mesh Architecture | built | Adapted (Apache-2.0) | no |
| #45 Voice Turn Duration Metering & Preflight Leases | quarantined | Quarantined | no |
| #46 Prepaid Credit Gating & Automated Webhooks | quarantined | Quarantined | no |
| #47 Agent-to-Agent (A2A) Routing Protocol | built | Adapted (MIT) | no |
| SSRF Guard (Zero-Trust IP & DNS Validation) | built | Unverified (flagged for counsel) | no |
| Spec: GeoIP Country & IP Blocking | spec only | Clean-room spec (`docs/specs/geoip-ip-blocking.md`) | no |
| Spec: Voice-Duration Metering & Leases | spec only | Clean-room spec (`docs/specs/voice-duration-metering.md`) | no |
| Spec: Prepaid Credit Gating & Webhooks | spec only | Clean-room spec (`docs/specs/prepaid-credit-gating.md`) | no |
| Spec: Reversible PII Masking | spec only | Clean-room spec (`docs/specs/reversible-pii-masking.md`) | no |

---

## Architecture Overview

### ra1 Integration Hooks
- **H1 Contract (`IGatewayEngine`)**: Standardized ra1 interface decoupling high-level orchestration from execution.
- **H2 Permission Hook (`beforeRequest`)**: Permission checks with `allow`, `deny`, and interactive approval challenges.
- **H3 Key Lookup Hook (`onKeyLookup`)**: Dynamic runtime credential resolution.
- **H4 Audit Hook (`onAuditRecord`)**: Telemetry per request (actor, model, provider, tokens, latency, cost).

### Routing & Resilience
- **Dual Stream Failover**: Pre-first-byte abort & fallback timeout; post-first-byte explicit SSE error guarantees against duplicate tokens.
- **Cooldown Tracking**: Automated cooldown tracking, circuit breaker, and escape routing to local runtimes (Ollama, llama.cpp, LocalAI).
- **Virtual Tiers**: Smart, fast, vision, and embedding routing tiers with load distribution and failover.

---

## Quick Start

### Installation

```bash
git clone https://github.com/Aashish-RC/pheonix-model-gateway.git
cd pheonix-model-gateway
pnpm install
```

### Running Tests

```bash
pnpm test
```

### Build & Run

```bash
pnpm run build
pnpm run start
```

---

## Documentation Links

- [Feature Roadmap & Checkpoint Log](./ROADMAP_PROGRESS.md)
- [Provenance Ledger](./PROVENANCE_LEDGER.md)
- [Licensing Notice](./NOTICE)
- [Clean-Room Behavior Specifications](./docs/specs/)
