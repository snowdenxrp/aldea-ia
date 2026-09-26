# NEXO AB104.209 — AUTHORITATIVE NEGATIVE EVIDENCE AND UNKNOWN RESOLUTION — V1 — 2026-09-26

## Status
Research-only. No Nexo architecture implementation. No V21. No formal verification claim.

## Objective
Continue AB104.208 by studying when UNKNOWN_EXTERNAL can become NOT_COMMITTED without guessing, and when a target can provide authoritative negative evidence.

## Findings
1. Negative evidence is only authoritative if the target defines a durable semantic guarantee for absence. A failed local lookup, timeout, missing receipt, or empty cache is not proof of non-execution.
2. A target-side operation registry can support a strong negative result only when its retention/coverage horizon is sufficient and the target guarantees that an operation outside the registry was never accepted. Otherwise classify UNKNOWN_EXTERNAL.
3. Idempotency identity must remain stable across retries and recovery. Reusing an expired key can create a new logical operation unless the target's retention and reuse semantics explicitly prevent that. Therefore Nexo must bind operation_id/effect_identity to a payload fingerprint and target-specific retention contract.
4. Transactional outbox evidence reinforces the same boundary: a relay can crash after target/broker acceptance but before recording publication, so local publication state cannot prove non-publication; stable event identity and downstream idempotency/receipts are required.
5. Partial/streaming effects require effect-specific reconciliation. An acknowledgement may establish acceptance of a request, not necessarily completion of every externally visible sub-effect. Nexo must distinguish ACCEPTED, COMMITTED, PARTIAL, FAILED, and UNKNOWN where the target contract supports those semantics.
6. Target rollback/restore can invalidate naive negative evidence. A target saying "not found" after restoring an older snapshot cannot prove that an operation never existed. Evidence must bind to target incarnation/version/history or another trusted continuity mechanism.
7. Cross-system receipts are only authoritative to the degree that their issuer, binding to operation_id/effect_identity/payload fingerprint, freshness, and target scope are trusted. A transport acknowledgement alone is weaker than a target-durable receipt.
8. Minimum conceptual evidence graph for resolving UNKNOWN_EXTERNAL:
   DecisionContract + operation_id/effect_identity + payload fingerprint
   -> target identity/incarnation + authority epoch
   -> target operation record or receipt
   -> target retention/absence guarantee
   -> freshness/continuity evidence
   -> reconciliation result.
   If any required semantic edge is missing, retain UNKNOWN_EXTERNAL rather than infer.

## Candidate classification
- Target durable record: matching operation_id + matching fingerprint + committed result -> EXTERNALLY_COMMITTED.
- Target durable absence + explicit never-accepted/never-seen guarantee covering the whole relevant horizon + trusted continuity -> NOT_COMMITTED.
- Same operation_id with different fingerprint -> QUARANTINE / OPERATION_ID_COLLISION.
- Record exists but status is partial/ambiguous -> PARTIAL or UNKNOWN_EXTERNAL; do not retry blindly.
- Target restored/rolled back without continuity proof -> UNKNOWN_EXTERNAL.
- Only local CommitRecord/intent/transport timeout -> UNKNOWN_EXTERNAL, not NOT_COMMITTED.

## Code study
Searched the canonical repository `snowdenxrp/aldea-ia` main for:
operation_id, effect_identity, idempotency, reconcile, CommitRecord, UNKNOWN_EXTERNAL, fence, receipt, outbox.
The GitHub code-search surface returned no matching results for these exact queries. This is NOT proof that no related logic exists elsewhere; it is only the observed search result. No implementation claim is made.

## External evidence studied
- Transactional outbox references document the crash-after-publish/before-recording ambiguity and stable event identity/idempotent consumer requirement.
- The result is consistent with AB104.208: local evidence cannot manufacture certainty about an external effect.

## Residuals carried forward unchanged
TERNARY_MATH_GAP=FOUND
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED

## DO-NOT-REPEAT
Do not equate missing receipt with NOT_COMMITTED; timeout with absence; same operation_id with proof of execution; idempotency with fencing; local CommitRecord with external proof; expired key with safe reuse; target rollback with trustworthy absence; transport ACK with durable completion. Do not rewrite uncertainty history. No V21 and no unsupported formal/CI/fault-injection claims.

## Exact next action — AB104.210
Study target-side retention horizons and idempotency-key expiration/reuse in detail; model the boundary where an old UNKNOWN can no longer be safely resolved, including target incarnation/restore and cross-system receipt continuity. Then study partial/streaming effects and reconciliation state machines. Research and code study remain mandatory before architecture construction.
