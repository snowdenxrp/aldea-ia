# GLOBAL-AUDIT-106

## Scope
Cutover overlap: operation identity, idempotency domains, retry lineage, and reconciliation across provider incarnations.

## Fresh evidence
- AWS Durable Execution documents that retries/replay can execute an operation more than once; at-most-once is only per retry attempt, and exactly-once across a workflow is not guaranteed. Stable idempotency keys must be generated durably and reused across attempts. [AWS Durable Execution]
- AWS exposes deterministic OperationId and AttemptNumber, explicitly separating logical operation identity from attempt identity.
- Cloud Tasks is at-least-once and permits duplicate execution; execution order is not guaranteed. Therefore delivery metadata cannot by itself establish world-effect order.
- etcd snapshot restore changes member/cluster identity and can require revision bumps because restored older revisions can leave watchers/caches inconsistent.

## Findings
1. OPERATION_ID != ATTEMPT_ID.
2. ATTEMPT_ID != EXTERNAL_EFFECT_ID.
3. IDEMPOTENCY_KEY != GLOBAL_DEDUP_STORE.
4. SAME_IDEMPOTENCY_KEY + DIFFERENT_PROVIDER_INCARNATION != AUTOMATICALLY_SAME_HISTORY.
5. RETRY_LINEAGE != EFFECT_LINEAGE.
6. PROVIDER_RETRY_METADATA != WORLD_EFFECT_HISTORY.
7. RECEIPT_MATCH != EFFECT_IDENTITY_MATCH.
8. LOGICAL_OPERATION_RECONCILIATION != HISTORICAL_PATH_RECONSTRUCTION.
9. DESTINATION_DEDUP_HIT != PROOF_SOURCE_EFFECT_ABSENCE.
10. SOURCE_DEDUP_MISS != PROOF_NO_PRIOR_EFFECT.
11. SAME_PAYLOAD != SAME_OPERATION.
12. SAME_OPERATION_ID != SAME_AUTHORITY.
13. SAME_PROVIDER_ID != SAME_PROVIDER_INCARNATION.
14. MIGRATION_MAPPING != EFFECT_IDENTITY_PROOF.
15. CROSS_PROVIDER_IDEMPOTENCY != PROVEN SHARED DEDUP SEMANTICS.
16. REPLAY EQUIVALENCE != WORLD EFFECT SINGULARITY.
17. CURRENT DEDUP STATE != COMPLETE HISTORICAL DEDUP STATE.
18. RECONCILED FINAL STATE != RECONCILED CAUSAL HISTORY.

## Adversarial race
P1 executes logical operation O under incarnation I1.
A1 is submitted; receipt is lost.
Cutover activates P2/I2.
P2 receives the same logical operation and executes attempt A2.
P1 later retries A1 after local recovery.
A delayed P2 receipt arrives after reconciliation.

Required distinction set:
- source-only effect
- destination-only effect
- both effects with shared logical operation
- same logical operation / different attempts
- conflicting effects
- receipt without proven effect
- effect without receipt
- dedup hit without historical dedup closure
- retention-loss UNKNOWN
- authority/incarnation conflict

## Research-only consequence
A future Nexo effect contract cannot infer exactly-once world effects merely from operation IDs, idempotency keys, provider receipts, retries, or reconciled current state. The contract must model logical operation, attempt lineage, provider incarnation, authority/fencing epoch, external-effect identity, receipt provenance, dedup domain, retention horizon, and UNKNOWN outcomes separately.

## FutureObs_PAA
NOT CLOSED. This audit adds boundary evidence only.

## Global epistemic state preserved
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED
AB55/AB56 carryover remains unresolved.
