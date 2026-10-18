# ra1 Model Gateway

A high-performance, resilient, multi-provider AI model gateway built in TypeScript (strict ESM, Node.js LTS, Hono, Zod, Web Streams, Vitest) designed as an integrated layer for ra1.

---

## 🚀 Release Status & Milestone Progress

```
[Phase 0: Decision Records & Provenance ] [████████████████████] 100% (Completed)
[Phase 1: Release 1 (Core Gateway)      ] [████████████████████] 100% (Completed)
[Phase 2: Release 2 (Governance & Resil)] [████████████████████] 100% (Completed)
[Phase 3: Release 3 (Advanced & Media)  ] [████████████████████] 100% (Completed)
[Phase 4: Release 4 (Size-1 Features)   ] [████████████████████] 100% (Completed)
[Phase 5: Extended Standard Endpoints   ] [████████████████████] 100% (Completed)
[Phase 6: Final Decommissioning & Wrap  ] [████████████████████] 100% (Completed)
```

- **Master Catalog Features:** 47 / 47 features implemented (100%)
  - **Universal (6 repos):** 10 / 10 (100%)
  - **Near-Universal (5 repos):** 6 / 6 (100%)
  - **Advanced (4 repos):** 3 / 3 (100%)
  - **Specialized (3 repos):** 10 / 10 (100%)
  - **Paired (2 repos):** 13 / 13 (100%)
  - **Unique Differentiators (1 repo):** 5 / 5 (100%)
- **Conformance Test Suite:** 137 / 137 Vitest tests passing (100%) across 41 test suites
- **TypeScript Strict Compilation:** 0 build errors (`tsc --noEmit` & `pnpm run build` pass)
- **Provenance & Licensing:** 100% clean-room isolation, complete provenance audit in [`PROVENANCE_LEDGER.md`](./PROVENANCE_LEDGER.md) and [`NOTICE`](./NOTICE)
- **Clone Decommissioning:** All reference clones fully decommissioned and removed ([`CLONE_DECOMMISSIONING_PLAN.md`](./CLONE_DECOMMISSIONING_PLAN.md))

---

## 📦 Key Architecture & Feature Matrix

### Core Orchestration & Integration Hooks (ra1 Layer 0)
- **H1 `IGatewayEngine` Contract**: Standardized ra1 interface decoupling high-level orchestration from execution.
- **H2 Permission Hook (`beforeRequest`)**: Permission checks with `allow`, `deny`, and interactive `ask-human` approval challenges.
- **H3 Vault Key Hook (`onKeyLookup`)**: Zero raw keys stored in config or logs; scoped credentials injected dynamically at runtime.
- **H4 Audit & Metering Hook (`onAuditRecord`)**: Real-time telemetry per request (actor, model, provider, tokens, latency, cost).

### Unified API Surface
- **Chat & Messages**:
  - `/v1/chat/completions`: Full OpenAI-compatible chat completions with schema validation and streaming.
  - `/v1/messages`: Anthropic native messages API translation.
  - `/v1/completions`: Legacy text completions endpoint.
- **Multimodal & Media**:
  - `/v1/embeddings`: Standard vector embeddings API.
  - `/v1/images/generations` & `/v1/images/edits`: Text-to-image and image editing pipelines.
  - `/v1/audio/speech` (TTS), `/v1/audio/transcriptions` (STT), `/v1/audio/translations`: Audio processing suite.
  - `/v1/videos/generations`: Asynchronous video generation job lifecycle.
- **Realtime & Tools**:
  - `/v1/realtime` & `/v1/realtime/sessions`: WebSocket full-duplex audio/voice gateway with lease tracking.
  - `/v1/rerank`: Semantic reranking endpoint for RAG pipelines.
  - `/v1/tokenize` & `/v1/messages/count_tokens`: Pre-flight token counting.
  - `/v1/batches`: Asynchronous batch inference jobs.
  - `/v1/files` & `/v1/fine_tuning/jobs`: File management and model fine-tuning APIs.
  - Model Context Protocol (MCP) Gateway & Semantic Tool Search (`/mcp/*`).
- **Telemetry & Health**:
  - `/metrics`: Prometheus exposition format metrics.
  - `/health/liveness` & `/health/readiness`: Kubernetes cluster health probes.
  - `/console` & `/public`: Embedded Control Console and Chat Playground UI.

### Resilience & Smart Routing
- **Dual Stream Failover**: Pre-first-byte abort & fallback timeout; post-first-byte explicit SSE error guarantees against duplicate tokens.
- **Dynamic Fallbacks & Escape Routes**: Automated cooldown tracking, circuit breaker, and escape routing to local runtimes (Ollama, llama.cpp, LocalAI).
- **CEL Routing Expressions**: Google Common Expression Language rule engine for header and payload matching.
- **Dual-Tier Mesh Router**: Local cluster routing with fallback to edge and cross-region gateways.
- **Sticky Session Affinity**: Cookie and header-based session pinning with TTL expiration.
- **Shadow & Canary Traffic**: Transparent asynchronous traffic mirroring for candidate model evaluation.
- **Dual RPM & TPM Rate Limiting**: Token-aware sliding-window rate limiting with standard RFC headers.
- **Hierarchical Budgets & Credit Gating**: Multi-tenant budget caps, soft threshold webhooks, and hard cutoff enforcement.

### Security & Privacy
- **SSRF Hardening**: Fail-closed DNS resolution blocking RFC 1918, RFC 6598 (CGNAT), IPv6 link-local (`fe80::/10`), IPv4-mapped IPv6, and multicast.
- **Reversible PII Masking & AES-256 Vault**: Clean-room reversible redaction of emails, phones, SSNs, credit cards, and IPv4 addresses with stream detokenizer.
- **BYOK (Bring Your Own Key)**: Per-request client encryption keys preventing server credential persistence.
- **GeoIP & Residency Fencing**: ISO country code validation for regulatory compliance.
- **Secret Redaction**: Automatic zero-leak pattern masking for cloud and AI API keys.
- **Reasoning Isolation**: Encrypted/redacted reasoning tokens (`thought` / `thinking`) for secure downstream consumption.

---

## 🛠️ Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Aashish-RC/pheonix-model-gateway.git
cd pheonix-model-gateway

# Install dependencies (Node.js LTS, pnpm)
pnpm install
```

### Running Tests

```bash
# Run complete Vitest test suite (41 test suites, 137 tests)
pnpm test
```

### Build & Run

```bash
# Compile TypeScript to JavaScript (strict ESM)
pnpm run build

# Start the model gateway server (default port: 3000)
pnpm run start
```

---

## 📚 Documentation Links

- [Feature Roadmap & Checkpoint Log](./ROADMAP_PROGRESS.md)
- [Clone Decommissioning Plan](./CLONE_DECOMMISSIONING_PLAN.md)
- [Provenance Ledger & Attribution](./PROVENANCE_LEDGER.md)
- [Licensing & Notice](./NOTICE)
