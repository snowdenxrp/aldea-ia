# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.247

Research: docs/nexo/NEXO_AB104_247_UNKNOWN_ORIGINAL_EFFECT_CONDITIONAL_COMPENSATION_POLICY_V1_2026-09-26.md
Commit: 3cee0ca8dd78899dfe626bbc2b783058fbd5ad5f

Core: UNKNOWN original effect does not imply a universally safe compensation. Explicit policy is required for RECONCILE_FIRST, CONDITIONAL_COMPENSATION, or HEDGE/ESCROW semantics. No architecture choice made.

Critical finding: local pre-check followed by later compensation write is not atomic. Stronger semantics require target-side conditional acceptance binding original identity/fingerprint, target incarnation, authority/fence, expected target condition and compensation identity/fingerprint.

Late original resolution must append evidence/state transitions; it must not rewrite original history. NOT_COMMITTED, COMMITTED, PARTIAL, UNKNOWN and UNKNOWN_PERMANENT remain distinct.

Compensation retries require stable identity where target idempotency exists; new identity while first compensation is UNKNOWN risks double compensation. Transactional outbox and Saga research support explicit compensation/idempotency separation; TUF supports separation of authority, freshness and coherent state.

No implementation added. Prototype evidence remains non-proof of target-side conditional compensation or distributed fencing.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; preserve UNKNOWN/PENDING and contradictions.

Exact next: AB104.248 — target-side conditional compensation, atomic compare-and-compensate, CAS, operation registry binding, stale target state, partial effects, receipts and target restart.