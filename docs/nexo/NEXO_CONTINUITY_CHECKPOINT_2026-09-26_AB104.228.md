# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.228

## Persisted
- Research: docs/nexo/NEXO_AB104_228_OPERATION_REGISTRY_STATE_MACHINE_RECEIPT_SEMANTICS_V1_2026-09-26.md
- Commit: 02ac0d2304c573a4caca97f7dbd9dd467142b402

## Core result
- Operation registry requires explicit states: UNSEEN, RESERVED, ACCEPTED, COMMITTED, RECEIPT_AVAILABLE, plus REJECTED_PRE_ACCEPTANCE, UNKNOWN_EXTERNAL, PARTIAL, CONFLICT, EXPIRED_HISTORICAL, QUARANTINED.
- RESERVED is not COMMITTED.
- ACCEPTED is not the same as receipt delivery.
- Receipt semantics must explicitly state the boundary proven.
- Strongest conceptual target transaction conditionally validates authority/fence/version and atomically mutates target + registers COMMITTED.
- Receipt may be delivered after commit; missing receipt is not non-commit.
- Negative evidence is valid only when bound to exact operation and pre-acceptance semantics.
- Expiry never erases historical uncertainty.
- Parent operations with independent children require child-level status/evidence.
- Restore of registry/resource from different snapshots can create an invalid combined history.

## Current code evidence
- effect-adapter test SHA: 02050c53303711de7baba5fe276a3e9f8b205681
- Exception UNKNOWN source/test discrepancy remains unresolved; no pass claim.
- Prototype journal capped at 200 entries; not a complete historical operation registry.

## External evidence
- AWS Durable Execution: retries can rerun side effects; stable idempotency and reconciliation are required. citeturn0search0turn0search4
- Transactional Outbox: crash after publication can cause duplicate relay publication. citeturn0search1
- etcd: atomic multi-condition transactions. citeturn0search9

## Residuals
AB50→AB58 unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## Constraints
Research/study only. No V21. No architecture implementation. Preserve UNKNOWN/PENDING and contradictions. No unsupported verification claims.

## Exact next mission
AB104.229: attack ACCEPTED vs COMMITTED, transaction commit, crash after acceptance, rollback/restore, durable negative receipts and receipt reconstruction semantics.

## DO-NOT-REPEAT
- RESERVED != COMMITTED
- receipt inclusion != effect truth
- registry absence != NOT_COMMITTED
- expiry != historical erasure
- no V21 / no architecture implementation