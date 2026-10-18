# ra1 Model Gateway

A high-performance, resilient, multi-provider AI model gateway built in TypeScript (strict ESM, Hono, Zod, Web Streams, OpenTelemetry) designed as an integrated layer for ra1.

---

## 🚀 Release Status & Milestone Progress

```
[Phase 0: Decision Records & Conformance] [████████████████████] 100% (Completed)
[Phase 1: Release 1 (R1 Core Gateway)   ] [████████████████████] 100% (Completed)
[Phase 2: Release 2 (Governance & Resil)] [░░░░░░░░░░░░░░░░░░░░]   0% (Queued Next)
[Phase 3: Release 3 (Advanced Features) ] [░░░░░░░░░░░░░░░░░░░░]   0% (Pending)
[Phase 4: Deferred Feature Review (D)   ] [░░░░░░░░░░░░░░░░░░░░]   0% (Pending)
[Phase 5: Layer Handoffs (L)            ] [░░░░░░░░░░░░░░░░░░░░]   0% (Pending)
[Phase 6: Final Wrap & Decommissioning  ] [░░░░░░░░░░░░░░░░░░░░]   0% (Blocked on R1-R3)
```

- **All R1 Conformance Tests Passing:** 28 / 28 tests passing (100%)
- **TypeScript Strict Compilation:** 0 build errors
- **Detailed Progress Dashboard:** See [`codebase/ROADMAP_PROGRESS.md`](./codebase/ROADMAP_PROGRESS.md)
- **Provenance Ledger & Attributions:** See [`codebase/PROVENANCE_LEDGER.md`](./codebase/PROVENANCE_LEDGER.md) and [`codebase/NOTICE`](./codebase/NOTICE)

---

## 📦 Architecture & Key Features (R1)

- **H1 `IGatewayEngine` Contract**: Standardized ra1 interface decoupling orchestration from underlying execution.
- **H2 Permission Hook (`beforeRequest`)**: Permission checks with `allow`, `deny`, and `ask-human` approval challenges.
- **H3 Vault Key Hook (`onKeyLookup`)**: Zero raw keys in config or logs; scoped credentials injected at runtime.
- **H4 Audit & Metering Hook (`onAuditRecord`)**: Real-time telemetry per request (actor, model, provider, tokens, latency, cost).
- **Feature 1 (`/v1/chat/completions`)**: Strict Zod schema validation matching OpenAI format.
- **Feature 2 Protocol Translation**: Seamless bidirectional translation across 6 runtimes:
  - OpenAI (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`)
  - Anthropic (`claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku`)
  - Google Gemini REST API (`gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`)
  - Ollama (`llama3.2`)
  - LocalAI (`localai`)
  - llama.cpp Server (`llama.cpp`)
- **Feature 3 & 34 Stream Failover**:
  - Pre-first-byte abort & fallback failover.
  - Post-first-byte explicit SSE error events (`event: error\ndata: ...`), with strict guarantee against silent re-sends or duplicate tokens.
- **Feature 4 Dynamic Fallbacks & Escape Routes**: Cooldown tracking, circuit breaking, and automatic failover to local runtimes when cloud APIs are saturated.
- **Feature 5 Virtual Tiers**: Out-of-the-box aliases for `smart-tier`, `fast-tier`, `vision-tier`, and `embedding-tier`.
- **Feature 7 & 8 Unified Token Accounting & Pricing**: Independent multi-unit pricing engine accounting for prompt, completion, reasoning, and prompt-cache read/write discounts.

---

## 🛠️ Quick Start

```bash
cd codebase

# Install dependencies
bun install

# Run tests
bun test

# Build TypeScript
bun run build

# Start gateway server
bun run start
```
