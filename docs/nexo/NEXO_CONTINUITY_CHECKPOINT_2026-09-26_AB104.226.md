# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.226

## Persisted
- Research: docs/nexo/NEXO_AB104_226_ATOMIC_TARGET_ACCEPTANCE_BOUNDARY_V1_2026-09-26.md
- Commit: d8bd63c5c4f3cbcb10268d42e9ce75c9b0b188fa

## Core result
- The target-side effect boundary is the critical linearization point.
- Worker-side authority/version checks are observations, not sufficient stale-effect protection.
- Candidate atomic acceptance predicate binds authority root/epoch, resource identity/incarnation, fence, expected resource version, operation identity and payload fingerprint.
- If accepted, target should conceptually commit resource state and operation receipt/idempotency state together.
- Global authority epoch, resource fence and target resource version have distinct scopes; they must have explicit transition/order semantics.
- A target-side rejection is NOT_COMMITTED only when target semantics prove non-acceptance at the relevant boundary.
- Lost response after target commit requires reconciliation, not a fresh effect.
- Restore/clone can invalidate naive version/fence assumptions unless continuity is rollback-resistant.
- Partial/streaming children require child-level acceptance identity and evidence.

## Current code evidence
- effect-adapter.js SHA: 3ed48663b4da0d165c3a86da248d3f11d1e7b598
- runtime.js SHA: 1b4096bd6868fd9086ba6740f07d6a104a258651
- orchestrator.js SHA: 973d3d5406c5cab16fb49529d94e07a1557c3111
- runtime idempotencyKey remains missionId:stepId.
- local getStateVersion/ne​xoEffectRevision are not authority/fence mechanisms.
- prepared entries require reconciliation.
- handler exception still returns EFFECT_OUTCOME_UNKNOWN without persist(); discrepancy with existing test expectation remains unresolved.
- local runtime commit lock is not distributed fencing.
- no observed atomic target authority+fence+resource-version boundary.

## External evidence
- etcd atomic transactions compare multiple conditions and apply writes atomically; KV operations are documented as linearizable by default. citeturn0search1turn0search3
- Kubernetes resourceVersion is server-side concurrency identity, not authority by itself. citeturn0search7
- Fencing requires the protected resource to reject older tokens. citeturn0search0

## Residuals
AB50→AB58 unchanged:
TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## Constraints
Research/study only. No V21. No architecture implementation. Preserve UNKNOWN/PENDING and contradictions. No unsupported security/correctness/formal/CI/fault-injection claims.

## Exact next mission
AB104.227: operation-registry atomicity, receipt binding, crash ordering, retention/expiry and restore/clone interactions at the target boundary.

## DO-NOT-REPEAT
- local check != atomic target acceptance
- local version != authority freshness
- resource CAS != authority permission
- fence != anti-rollback without protected continuity
- operation_id equality != execution proof
- rejection != NOT_COMMITTED without a non-acceptance guarantee
- no V21 / no architecture implementation