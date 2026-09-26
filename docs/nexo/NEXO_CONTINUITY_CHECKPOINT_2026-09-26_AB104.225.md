# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.225

## Persisted
- Research: docs/nexo/NEXO_AB104_225_COMPOSED_EPOCH_FENCE_CAS_ATTACKS_V1_2026-09-26.md
- Commit: 594829e88f1d57edcc7072ee34b80f70afb2ac78

## Core result
- Authority epoch, resource fence and target CAS solve different parts of the race and cannot be treated as interchangeable.
- If target CAS checks only resource version, stale authority can still succeed after a rotation.
- If target checks authority/fence and resource version in one acceptance boundary, stale authorization can be rejected at the actual effect boundary.
- Fence state and target version both require rollback-resistant continuity if used for safety.
- Numeric epoch alone cannot resolve conflicting roots/configurations.
- Resource identity must include an incarnation/version across destroy/recreate.
- Parent authorization does not automatically authorize independently crossing child effects.
- Partition behavior is an explicit safety/liveness policy; it cannot be silently assumed safe.

## Current code evidence
- simulation-adapter.js blob SHA: 291ef4d43ca1af2dad29503d8c15f5cdd05aa114c
- memory.js blob SHA: c70f246a85e8c513b8f746d7de237f881b0de91c
- simulation-adapter.js uses nexoEffectRevision as a local simulation-state revision and increments it after mutations.
- effect-adapter.js uses that revision as a local precondition/state-change signal.
- nexoEffectRevision is NOT an authority epoch and has no demonstrated anti-rollback semantics.
- memory.js truncates effectJournal and executions to the last 200 entries; this remains a retention/anti-replay concern.
- recordNexoOutcome prevents a second durable outcome for the same mission/step; this is local mission semantics, not target fencing.
- No authority epoch/fence/target-incarnation mechanism was observed in these inspected files.

## External evidence
- Fencing requires the protected resource to reject stale tokens; local lease checks are insufficient. citeturn1search0
- RATS freshness narrows but does not eliminate the race after evidence generation. citeturn0search5turn0search3
- TUF binds roles, snapshot coherence and freshness, illustrating why isolated version/epoch values are insufficient without authority context. citeturn0search1turn0search0

## Residuals
AB50→AB58 unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## Constraints
- Research/study only.
- No V21.
- No architecture implementation.
- Preserve UNKNOWN/PENDING and contradictions.
- No unsupported security/correctness/formal/CI/fault-injection claims.

## Exact next mission
AB104.226: define and attack the exact atomic target-boundary tuple; study linearization, conditional writes, resource incarnation, fence transition durability and recovery after target/authority snapshots diverge.

## DO-NOT-REPEAT
- nexoEffectRevision != authority epoch
- local CAS/version != target authority fencing
- fence without rollback resistance != anti-rollback authority
- equal epoch numbers != equal authority roots
- parent authorization != automatic child-effect authorization
- rejection != NOT_COMMITTED without a non-acceptance guarantee
- no V21 / no architecture implementation