# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.210

Research-only canonical state. No architecture implementation and no V21.

AB104.210 completed: retention horizons, idempotency expiry/reuse, target restore continuity, and cross-system receipt boundaries.

Core invariant:
UNKNOWN_EXTERNAL that outlives the target's retention/lookup horizon does NOT become NOT_COMMITTED. Without independent durable evidence, it becomes unresolved historical uncertainty (conceptually UNKNOWN_PERMANENT), not proof of absence.

EffectContract research fields now include operation_id, effect_identity, payload_fingerprint, target identity/incarnation, authority epoch/root, idempotency scope, retention horizon, lookup/absence semantics, receipt binding, restore semantics, partial-effect semantics, and reconciliation deadline.

Candidate lifecycle:
UNKNOWN_EXTERNAL -> RECONCILING -> EXTERNALLY_COMMITTED | NOT_COMMITTED | PARTIAL | UNKNOWN_PERMANENT.

Expiration is an evidence boundary, never permission to retry or reuse an old logical identity.

External research used RFC 9110, IETF Idempotency-Key draft-07, AWS Well-Architected 2025, AWS Durable Execution guidance, and transactional-outbox/idempotent-consumer references.

Code-search limitation remains explicit: exact searches in the canonical repo returned no matches for the AB104.209 keyword set; this does not prove repository-wide absence. No implementation claim.

AB50→AB58 residuals remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
expired key != NOT_COMMITTED; restored absence != historical absence; intermediate ACK != final commit; operation_id equality != proof; idempotency != fencing; no V21; no unsupported verification claims.

Exact next action: AB104.211 — partial/streaming effects, acceptance vs completion, sub-effect identity, cancellation/compensation, deduplication, crash points, then broader structural repository code study.
