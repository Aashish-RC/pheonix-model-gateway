# ra1 Model Gateway

A high-performance, resilient, multi-provider AI model gateway built in TypeScript (strict ESM, Node.js LTS, Hono, Zod, Web Streams, Vitest) designed as an integrated layer for ra1.

---

## 🚀 Release Status & Milestone Progress

```
[Phase 0: Decision Records & Provenance ] [████████████████████] 100% (Completed)
[Phase 1: Release 1 (R1 Core Gateway)   ] [████████████████████] 100% (Completed)
[Phase 2: Release 2 (Governance & Resil)] [░░░░░░░░░░░░░░░░░░░░]   0% (Queued Next)
[Phase 3: Release 3 (Advanced Features) ] [░░░░░░░░░░░░░░░░░░░░]   0% (Pending)
[Phase 4: Deferred Feature Review (D)   ] [░░░░░░░░░░░░░░░░░░░░]   0% (Pending)
[Phase 5: Layer Handoffs (L)            ] [░░░░░░░░░░░░░░░░░░░░]   0% (Pending)
[Phase 6: Final Wrap & Decommissioning  ] [░░░░░░░░░░░░░░░░░░░░]   0% (Blocked on R1-R3)
```

- **Feature Implementation Progress:** 13 / 13 R1 in-scope targets completed (100%)
- **Conformance Test Suite:** 40 / 40 Vitest tests passing (100%)
- **TypeScript Strict Compilation:** 0 build errors
- **Detailed Feature Tracker:** See [`codebase/ROADMAP_PROGRESS.md`](./codebase/ROADMAP_PROGRESS.md)
- **Provenance Ledger & Attributions:** See [`codebase/PROVENANCE_LEDGER.md`](./codebase/PROVENANCE_LEDGER.md) and [`codebase/NOTICE`](./codebase/NOTICE)

---

## 📦 Architecture & Key Features (R1)

- **H1 `IGatewayEngine` Contract**: Standardized ra1 interface decoupling orchestration from underlying execution.
- **H2 Permission Hook (`beforeRequest`)**: Permission checks with `allow`, `deny`, and `ask-human` approval challenges.
- **H3 Vault Key Hook (`onKeyLookup`)**: Zero raw keys in config or logs; scoped credentials injected dynamically at runtime.
- **H4 Audit & Metering Hook (`onAuditRecord`)**: Real-time telemetry per request (actor, model, provider, tokens, latency, cost).
- **Feature 1 (`/v1/chat/completions`)**: Strict Zod schema validation matching OpenAI format. Single request pipeline via `GatewayEngine`.
- **Feature 2 Protocol Translation**: Seamless bidirectional translation across 6 runtimes:
  - OpenAI (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`)
  - Anthropic (`claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku`)
  - Google Gemini REST API (`gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`)
  - Ollama (`llama3.2`)
  - LocalAI (`localai`)
  - llama.cpp Server (`llama.cpp`)
- **Feature 3 & 34 Stream Failover**:
  - Pre-first-byte abort & fallback failover with timeout guard.
  - Post-first-byte explicit SSE error events (`event: error\ndata: ...`), with strict guarantee against silent re-sends or duplicate tokens.
- **Feature 4 Dynamic Fallbacks & Escape Routes**: Cooldown tracking, circuit breaking, and automatic failover to local runtimes when cloud APIs are saturated. Client errors (4xx) do not count against cooldown.
- **Feature 5 Virtual Tiers**: Out-of-the-box aliases for `smart-tier`, `fast-tier`, `vision-tier`, and `embedding-tier`.
- **Feature 7 & 8 Unified Token Accounting & Versioned Pricing**: Versioned data table cited from provider pricing pages. No silent default pricing.
- **SSRF Hardening**: Fail-closed DNS resolution, blocking link-local IPv6 (`fe80::/10`), IPv4-mapped IPv6, CGNAT (`100.64.0.0/10`), and reserved ranges.

---

## 🛠️ Quick Start

```bash
cd codebase

# Install dependencies (Node LTS)
pnpm install

# Run Vitest test suite
pnpm test

# Build TypeScript
pnpm run build

# Start gateway server
pnpm run start
```
