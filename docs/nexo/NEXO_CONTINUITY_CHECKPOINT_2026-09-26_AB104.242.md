# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.242

Research file: docs/nexo/NEXO_AB104_242_MIGRATION_AS_EFFECT_CRASH_IDEMPOTENCY_FENCING_V1_2026-09-26.md
Research commit: 2a57426767f4f650c8bcdd2963894c288f66185d

Core result: a migration is itself an effect when it changes durable state. It therefore needs intent/acceptance/commit/evidence separation, stable identity, crash recovery, fencing and reconciliation.

Key findings:
- transformation commit without migration record can be UNKNOWN unless target evidence proves completion;
- migration record before transformation is intent/reservation, not completion unless atomically bound;
- receipt loss requires reconciliation, not blind rerun;
- same migration identity must bind source digest, target scope/incarnation and transformation digest;
- local mutex is not distributed fencing;
- a migration authorized under E7 must not overwrite current E8 security metadata;
- rollback/compensation is not historical erasure; compensation is a new operation;
- migration receipt can reconstruct committed migration state only when bound to target commit semantics.

PostgreSQL WAL/transactions are storage-level references for durable logging and atomic visibility, not proof of Nexo authority or external effect semantics. citeturn0search4turn0search8
TUF provides analogous role separation, version/freshness and coherent Snapshot protections. citeturn0search0turn0search1

Current prototype: no demonstrated migration executor/fence/receipt mechanism in inspected Nexo path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.243 — migration-chain dependency ordering and incompatible migration-graph recovery.