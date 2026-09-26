# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.246

Research: docs/nexo/NEXO_AB104_246_ROLLBACK_COMPENSATION_CRASH_RECOVERY_DOUBLE_COMPENSATION_V1_2026-09-26.md
Commit: 80070085c1b530c2653a1ffee02697ce1745fa7d

Core: compensation requires its own durable state machine and reconciliation. It cannot infer completion from rollback intent or absence of a receipt.

Candidate state: COMPENSATION_INTENDED -> CLAIMED -> ACCEPTED -> COMMIT_UNKNOWN -> RECONCILING -> COMMITTED | NOT_COMMITTED | UNKNOWN_PERMANENT. Partial child effects remain PARTIAL/UNKNOWN.

Critical invariant: a retry after UNKNOWN must preserve the SAME compensation identity when target semantics provide idempotency. Creating a new compensation identity because the first is UNKNOWN can cause double compensation.

Original UNKNOWN is not equivalent to committed or absent. If compensation is permitted while original outcome remains unknown, an explicit semantic policy is required for late resolution; it cannot silently assume the original happened exactly once.

Transactional outbox/Saga references reinforce the distinction between local atomicity, explicit compensation and duplicate delivery. TUF reinforces anti-rollback and coherent metadata state.

No implementation added. Prototype local journal/idempotency evidence is not distributed compensation fencing or authoritative external reconciliation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; preserve UNKNOWN/PENDING and contradictions.

Exact next: AB104.247 — original-effect UNKNOWN plus compensation policy, conditional compensation, late original resolution, partial effects and avoiding compensation-induced divergence.