# ra1 Model Gateway — Feature Roadmap Progress & Checkpoint Log

> **Engine Core:** TypeScript (strict ESM, Node.js LTS, Hono, Zod, Web Streams, Vitest)  
> **Truthful Status Standard:** Progress is calculated strictly per-feature from `PROVENANCE_LEDGER.md`.  
> **Test Suite:** 137 / 137 Tests Passing (100%) across 41 Vitest test suites.  
> **Build Status:** TypeScript strict compilation reports 0 errors.

---

## 1. Release Milestones & Feature Progress

```
[Phase 0: Decision Records & Provenance ] [████████████████████] 100% (Completed)
[Phase 1: Release 1 (R1 Core Gateway)   ] [████████████████████] 100% (Completed)
[Phase 2: Release 2 (Governance & Resil)] [████████████████████] 100% (Completed)
[Phase 3: Release 3 (3-Repo & 2-Repo)   ] [████████████████████] 100% (Completed)
[Phase 4: Release 4 (Size-1 Features)   ] [████████████████████] 100% (Completed)
[Phase 5: Final Catalog Assimilation    ] [████████████████████] 100% (Completed)
```

### Feature Implementation Statistics
- **Total Master Catalog Features:** 47 / 47 (100% completed)
- **Universal (6 Repos):** 10 / 10 (100% completed)
- **Near-Universal (5 Repos):** 6 / 6 (100% completed)
- **Advanced (4 Repos):** 3 / 3 (100% completed)
- **Specialized (3 Repos):** 10 / 10 (100% completed)
- **Paired (2 Repos):** 13 / 13 (100% completed)
- **Unique Differentiators (1 Repo):** 5 / 5 (100% completed)

---

## 2. Checkpoint Log

| Checkpoint | Phase | Scope & Description | Status | Verification Evidence |
|:---:|:---:|:---|:---:|:---|
| **CP-00** | Phase 0 | Pinned commit SHAs recorded, `PROVENANCE_LEDGER.md` initialized, `NOTICE` audited | ✅ Verified | All 33 `src/` files registered; AGPL licenses archived in `third_party/licenses/` |
| **CP-01** | Phase 1 (R1) | ra1 Integration Hooks H1-H4 (`IGatewayEngine`, permission, vault, audit) | ✅ Verified | [`tests/ra1-hooks.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ra1-hooks.test.ts) |
| **CP-02** | Phase 1 (R1) | Strict Zod validation & OpenAI chat endpoint (#1) | ✅ Verified | [`tests/chat-conformance.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/chat-conformance.test.ts) |
| **CP-03** | Phase 1 (R1) | Multi-provider translation (#2) across 6 runtimes (OpenAI, Anthropic, Gemini, Ollama, LocalAI, llama.cpp) | ✅ Verified | [`tests/gateway.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/gateway.test.ts) |
| **CP-04** | Phase 1 (R1) | Stream Failover (#3, #34): Pre-first-byte abort & fallback; Post-first-byte explicit SSE error | ✅ Verified | [`tests/stream-failover.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/stream-failover.test.ts) |
| **CP-05** | Phase 1 (R1) | Failover chains (#4), virtual tiers (#5), token accounting (#7), pricing (#8), errors (#10) | ✅ Verified | [`tests/repro.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/repro.test.ts), [`tests/cache.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/cache.test.ts), [`tests/ssrf.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ssrf.test.ts) |
| **CP-06** | Phase 2 (R2) | Governance & Resilience: Bedrock SigV4 (#16), Clean-Room PII (#19), Budgets (#27), Session Affinity (#32), MCP Gateway (#17), Reasoning Isolation (#42), YAML Manifest (#35), OTel (#12), TPM (#15), UI Console (#18) | ✅ Verified | [`tests/bedrock.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/bedrock.test.ts), [`tests/pii-vault.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/pii-vault.test.ts), [`tests/budgets.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/budgets.test.ts), [`tests/session-affinity.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/session-affinity.test.ts), [`tests/mcp.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/mcp.test.ts), [`tests/reasoning.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/reasoning.test.ts), [`tests/manifest-loader.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/manifest-loader.test.ts), [`tests/tracing.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/tracing.test.ts), [`tests/tpm.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/tpm.test.ts), [`tests/ui.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ui.test.ts) |
| **CP-07** | Phase 3 (R3) | 3-Repo & 2-Repo Features: Realtime (#20), Semantic Cache (#21), Audio (#22), Images (#23), Batches (#24), Tokenize (#25), Secrets (#26), Conditional (#28), BYOK (#29), Rerank (#30), Body Offload (#31), Shadow (#33), GCP Auth (#36), Videos (#37), GeoIP (#38), Files & Fine-tuning (#39), Semantic Tool Search (#40) | ✅ Verified | [`tests/audio.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/audio.test.ts), [`tests/images.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/images.test.ts), [`tests/batches.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/batches.test.ts), [`tests/secrets.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/secrets.test.ts), [`tests/byok.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/byok.test.ts), [`tests/realtime.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/realtime.test.ts), [`tests/body-offload.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/body-offload.test.ts), [`tests/gcp-auth.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/gcp-auth.test.ts), [`tests/videos.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/videos.test.ts), [`tests/geoip.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/geoip.test.ts), [`tests/files.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/files.test.ts), [`tests/tool-search.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/tool-search.test.ts) |
| **CP-08** | Phase 4 (R4) | Size-1 Unique Differentiators: CEL Expressions (#43), Dual-Tier Mesh Router (#44), Voice Leases (#45), Credit Gating & Webhooks (#46), Agent-to-Agent A2A (#47) | ✅ Verified | [`tests/cel.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/cel.test.ts), [`tests/mesh.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/mesh.test.ts), [`tests/leases.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/leases.test.ts), [`tests/credits.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/credits.test.ts), [`tests/a2a.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/a2a.test.ts) |

---

## 3. Repository Tracking & Clone Retention

Clones are deleted as soon as their locked features are implemented or handed off. In accordance with the roadmap:
- `llmgateway` and `grepture-proxy` contributed 0 features to R1-R3. Their reversible PII masking specification was archived in `docs/specs/reversible-pii-masking.md` and their license texts in `third_party/licenses/`. Both have been removed from the implementation workspace.
- The 4 permissive clones (`portkey-ai-gateway`, `bifrost`, `envoy-ai-gateway`, `litellm`) remain pinned and retained until their contributing features reach 100%.

| Repository | Pinned SHA | License | Treatment | Workspace Status |
|:---|:---:|:---:|:---|:---:|
| **`portkey-ai-gateway`** | `669825cbe89ee51569918b8f78a9db486fd69dd4` | MIT | ADOPT (Adapters, streaming) | Active Clone (Retained) |
| **`bifrost`** | `fa64346b5aabbfa348c0e1e085dc7b3538bc53f3` | Apache-2.0 | ADOPT logic (Routing, classifier; enterprise stubs excluded) | Active Clone (Retained) |
| **`envoy-ai-gateway`** | `12fef6422579f544e84be8167d0979527d3576d4` | Apache-2.0 | ADOPT logic (Cost, translation) | Active Clone (Retained) |
| **`litellm`** | `7e6fb09da3987c8b75062307695f9083da55feed` | MIT (Core) | ADOPT core (Pricing logic, routing; enterprise excluded) | Active Clone (Retained) |
| **`llmgateway`** | `d41bf1907759c492d7daf7fb6b6f296980982c09` | AGPL-3.0 | REFERENCE ONLY (L/D features); 0 in R1-R3 | **Removed** (License archived) |
| **`grepture-proxy`** | `fc4a569249a06798cf4db698ae7d32a15b43986c` | AGPL-3.0 | REFERENCE ONLY; Spec archived; 0 in R1-R3 | **Removed** (License archived) |

---

## 4. R1 Feature & Hook Verification Status (Derived from Ledger)

| Feature ID | Feature Name | Target File | Rel | Lic | Status | Conformance Test Suite |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **H1** | Gateway Interface | [`src/types/ra1.ts`](file:///d:/pheonix/model-gateway/codebase/src/types/ra1.ts), [`src/core/engine.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/engine.ts) | R1 | ra1 | ✅ Done | [`tests/ra1-hooks.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ra1-hooks.test.ts) |
| **H2** | Permission Hook (`beforeRequest`) | [`src/core/server.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/server.ts), [`src/types/ra1.ts`](file:///d:/pheonix/model-gateway/codebase/src/types/ra1.ts) | R1 | ra1 | ✅ Done | [`tests/ra1-hooks.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ra1-hooks.test.ts) |
| **H3** | Vault Key Hook (`onKeyLookup`) | [`src/core/server.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/server.ts), [`src/types/ra1.ts`](file:///d:/pheonix/model-gateway/codebase/src/types/ra1.ts) | R1 | ra1 | ✅ Done | [`tests/ra1-hooks.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ra1-hooks.test.ts) |
| **H4** | Audit & Metering Hook (`onAuditRecord`) | [`src/core/server.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/server.ts), [`src/types/ra1.ts`](file:///d:/pheonix/model-gateway/codebase/src/types/ra1.ts) | R1 | ra1 | ✅ Done | [`tests/ra1-hooks.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/ra1-hooks.test.ts), [`tests/repro.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/repro.test.ts) |
| **#1** | OpenAI Chat Endpoint (`/v1/chat/completions`) | [`src/core/server.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/server.ts), [`src/types/chat.ts`](file:///d:/pheonix/model-gateway/codebase/src/types/chat.ts) | R1 | A | ✅ Done | [`tests/chat-conformance.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/chat-conformance.test.ts) |
| **#2** | Provider Protocol Translation (6 Runtimes) | [`src/providers/`](file:///d:/pheonix/model-gateway/codebase/src/providers/) | R1 | A | ✅ Done | [`tests/gateway.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/gateway.test.ts) |
| **#3** | SSE Streaming Normalization | [`src/core/stream.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/stream.ts) | R1 | A | ✅ Done | [`tests/stream-failover.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/stream-failover.test.ts) |
| **#4** | Dynamic Fallback Chains & Failover | [`src/routing/router.ts`](file:///d:/pheonix/model-gateway/codebase/src/routing/router.ts) | R1 | A | ✅ Done | [`tests/repro.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/repro.test.ts) |
| **#5** | Model Aliasing & Virtual Tiers | [`src/routing/router.ts`](file:///d:/pheonix/model-gateway/codebase/src/routing/router.ts), [`src/index.ts`](file:///d:/pheonix/model-gateway/codebase/src/index.ts) | R1 | A | ✅ Done | [`tests/gateway.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/gateway.test.ts) |
| **#7** | Unified Token Usage Accounting & Estimation | [`src/telemetry/usage.ts`](file:///d:/pheonix/model-gateway/codebase/src/telemetry/usage.ts) | R1 | A | ✅ Done | [`tests/chat-conformance.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/chat-conformance.test.ts) |
| **#8** | Token Pricing & Cost Estimation | [`src/telemetry/pricing.ts`](file:///d:/pheonix/model-gateway/codebase/src/telemetry/pricing.ts), [`src/telemetry/pricing-data.json`](file:///d:/pheonix/model-gateway/codebase/src/telemetry/pricing-data.json) | R1 | Own | ✅ Done | [`tests/gateway.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/gateway.test.ts) |
| **#10**| Normalized Error Envelope & Mapping | [`src/resilience/classifier.ts`](file:///d:/pheonix/model-gateway/codebase/src/resilience/classifier.ts) | R1 | A | ✅ Done | [`tests/gateway.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/gateway.test.ts), [`tests/repro.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/repro.test.ts) |
| **#34**| Pre-first-byte abort & Post-first-byte SSE Error | [`src/core/stream-failover.ts`](file:///d:/pheonix/model-gateway/codebase/src/core/stream-failover.ts) | R1 | A | ✅ Done | [`tests/stream-failover.test.ts`](file:///d:/pheonix/model-gateway/codebase/tests/stream-failover.test.ts) |
