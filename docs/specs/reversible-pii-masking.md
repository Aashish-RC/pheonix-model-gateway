# Reversible PII Masking — Clean-Room Behavior Specification

> **Specification Metadata**  
> **Status:** Behavior Specification (for clean-room R2 implementation)  
> **Note on Authorship:** Authored by an architecture session that inspected reference sources (`grepture-proxy`). The R2 implementation must be authored by a clean session that references only this document and does not inspect the AGPL source.

---

### 1. Scope and Objective
The reversible PII masking subsystem protects user privacy by intercepting chat completion requests, detecting sensitive data (such as email addresses, telephone numbers, and government identification numbers), replacing each sensitive entity with an opaque, structured token placeholder before sending the payload upstream, and transparently restoring the original sensitive values in the downstream response—both in unary JSON payloads and dynamically across SSE (Server-Sent Events) streaming chunks.

---

### 2. Upstream Request Transformation (Tokenization)
1. **Input Inspection**:
   - The engine inspects all messages in the `messages` array of a `ChatCompletionRequest` whose `content` is a non-null string.
2. **Entity Detection**:
   - Matches substrings against configured entity definitions (e.g. Email, Phone, SSN, Credit Card, IP Address, Physical Address).
   - Non-overlapping spans are resolved deterministically (longest match wins in overlapping collisions).
3. **Vault Storage & Placeholder Generation**:
   - For each detected sensitive entity, the vault generates an opaque surrogate token formatted as:  
     `<prefix>_<random_entropy>` (e.g. `[TOKEN_EMAIL_a8f9c2d1e4]`).
   - The token must be alphanumeric/bracketed such that it cannot naturally collide with normal prose or markdown syntax.
   - The mapping `token -> { originalValue, entityType, createdAt, expiresAt }` is stored in an ephemeral, memory-bounded vault.
4. **Replacement**:
   - In the request sent to the upstream provider, the sensitive value is replaced with the opaque token.
   - The upstream model processes only the opaque placeholder.

---

### 3. Downstream Response Restoration (Detokenization)
1. **Unary Restoration**:
   - For non-streaming responses, every occurrence of an active token in the assistant message `content` is replaced with its corresponding `originalValue`.
2. **Streaming Restoration (Chunk Boundary Handling)**:
   - In an SSE stream, tokens may be split across chunk boundaries (e.g., Chunk 1 emits `"[TOKEN_EM"`, and Chunk 2 emits `"AIL_a8f9c2d1e4]"`).
   - The stream detokenizer maintains a sliding residual buffer:
     - If a chunk contains an incomplete token prefix (matching the token format delimiter), the partial fragment is retained in the buffer until the closing delimiter arrives or is proven not to be a token.
     - When a complete token is assembled, it is immediately detokenized to the original entity.
     - Non-token characters are emitted downstream without delay to preserve time-to-first-byte (TTFB).

---

### 4. Vault Lifecycle, Eviction & Security Invariants
1. **TTL and Eviction**:
   - Tokens carry an explicit TTL (default: 3600 seconds / 1 hour).
   - Expired entries are evicted periodically and upon lookup.
   - If an unknown or expired token is encountered during detokenization, it is left as-is without raising a runtime exception.
2. **Zero-Trust Security**:
   - Vault storage is in-memory and ephemeral. Tokens and original values must never be logged in plain text or emitted to audit events.
   - The vault provides bidirectional lookup: `tokenize(plainText) -> tokenizedText` and `detokenize(text) -> restoredText`.
