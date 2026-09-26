# NEXO — AB104.208 AUTHORITATIVE EFFECT RECONCILIATION V1
Date: 2026-09-26
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## External evidence studied
RFC 9110 distinguishes idempotent request semantics from general request logging/history and warns against automatically retrying non-idempotent requests when the client cannot determine whether the original was applied. This supports treating an ambiguous external result as UNKNOWN rather than guessing.
The IETF Idempotency-Key draft defines a unique key for recognizing retries of the same request and says a key must not be reused with a different payload; its fingerprint concept is useful reference evidence. It remains a draft.
The transactional-outbox pattern documents that a relay can publish and then crash before recording publication, causing duplicate publication; downstream processing therefore needs idempotency or equivalent duplicate handling.
Stripe describes the same ambiguous-response problem in production: an operation can succeed while the client loses the response, so a stable idempotency key can allow the server to return the cached result.

## AB104.208 findings
### 1. UNKNOWN must be evidence-bearing
UNKNOWN_EXTERNAL must retain operation_id, effect_identity, request/payload fingerprint, target/resource identity, authorization epoch/root digest, attempt/relay identity, last observed transport/result state, and reconciliation status. Timestamps are evidence, never sole authority.

### 2. Same operation_id + different fingerprint is a conflict
If operation X is associated with fingerprint A and later fingerprint B, the latter is not a retry. It is OPERATION_ID_COLLISION / PAYLOAD_MISMATCH and must be quarantined.

### 3. Same operation_id + same fingerprint is not proof of execution
Identity continuity is only meaningful if the external target actually records and enforces that identity. Without authoritative target lookup or durable idempotency semantics, Nexo may remain UNKNOWN.

### 4. Authoritative reconciliation hierarchy
A. Target authoritative operation record/query.
B. Target-issued durable receipt bound to operation_id + fingerprint + result.
C. Cryptographically verifiable intermediary receipt with trusted authority.
D. Reliable local transport evidence.
E. Local intent/CommitRecord.
Only A-C can normally convert external UNKNOWN into a definitive external result. D/E are supporting evidence.

### 5. Result classification
Target confirms matching operation -> EXTERNALLY_COMMITTED.
Target confirms absence and provides a guarantee that absence means never accepted -> NOT_COMMITTED.
Target finds same operation with different fingerprint -> QUARANTINE / COLLISION.
Target query unavailable/ambiguous -> remain UNKNOWN_EXTERNAL.
A later authority revocation does not erase a historically confirmed effect.

### 6. Idempotency retention
If a target forgets old idempotency keys, a later retry may no longer be recognized. Therefore IDEMPOTENCY_RETENTION must cover MAX_RECONCILIATION_HORIZON, or Nexo needs another durable target-side lookup/receipt mechanism.

### 7. Same effect, new operation_id
Creating a new operation_id after UNKNOWN can turn one ambiguous operation into two applied effects. A new operation_id is safe only after authoritative NOT_COMMITTED evidence, or where the effect semantics explicitly tolerate duplication.

### 8. Reconciliation must not mutate history
Append a new evidence/result fact linked to the original operation. Do not rewrite UNKNOWN into a fabricated original response or delete uncertainty history.

## Candidate Decision/Effect boundary
Conceptually:
DecisionContract -> immutable operation_id/effect_identity + payload fingerprint + authority evidence
EffectContract -> target semantics + idempotency guarantee + lookup/receipt semantics + retention + fencing/version check
Reconciliation -> target-authoritative evidence -> result classification
No implementation selected.

## Repository/code study
Canonical repo: snowdenxrp/aldea-ia / main.
Repository search for operation_idempotency/effect_identity/CommitRecord/reconciliation returned no matching implementation evidence in the searched surface. This is not proof that related code does not exist elsewhere. No implementation claim is made.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- UNKNOWN != NOT_COMMITTED.
- UNKNOWN != permission to retry with a new operation_id.
- Same operation_id + different fingerprint = collision/conflict.
- Same key does not prove execution unless target enforces/records it.
- Local CommitRecord is not external proof.
- Revocation does not erase historical effects.
- Never rewrite uncertainty history during reconciliation.
- Idempotency retention must cover the recovery horizon, or another authoritative lookup/receipt must exist.
- No V21.
- No unsupported formal/CI/fault-injection claims.

## EXACT NEXT ACTION — AB104.209
Attack the reconciliation contract:
1. authoritative negative evidence;
2. target-side absence guarantees;
3. idempotency-key expiration/reuse;
4. partial/streaming effects;
5. committed effect with missing receipt;
6. target rollback/restore after acknowledging an operation;
7. cross-system receipts and trust;
8. minimum evidence graph to classify UNKNOWN -> COMMITTED or NOT_COMMITTED without guessing.

Status: research-only.
