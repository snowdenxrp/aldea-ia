# GLOBAL-AUDIT-108

## Scope
Provider-local ordering/reconciliation versus global causal/effect history, especially delayed observations after compaction, retention loss, and recovery.

## Fresh evidence
- etcd response headers expose cluster_id, member_id, revision, and raft_term; these identify provider-local state/order metadata, not a universal cross-provider causal order.
- etcd restore from snapshot can move observed revision backward and creates a new logical cluster identity; revision bumps/compaction are recommended to invalidate stale watchers/caches.
- AWS Durable Execution history is a detailed execution audit trail but is retained only for a bounded period after completion (1–90 days, default 30 days).
- AWS Durable Execution separates deterministic OperationId from AttemptNumber and states that retries/replay may repeat side effects.
- Cloud Tasks provides at-least-once delivery, permits duplicate execution, and does not guarantee execution order.

## Findings
1. PROVIDER_REVISION != GLOBAL_CAUSAL_TIME.
2. RAFT_TERM != GLOBAL_EVENT_ORDER.
3. PROVIDER_LOCAL_ORDER != CROSS_PROVIDER_ORDER.
4. RECEIPT_ORDER != EFFECT_ORDER.
5. OBSERVATION_ORDER != EFFECT_TIME.
6. EVENT_TIME != OBSERVATION_TIME.
7. LATE_OBSERVATION != LATE_EFFECT.
8. CURRENT_REVISION != COMPLETE HISTORICAL ORDER.
9. RESTORED_REVISION != ORIGINAL GLOBAL POSITION.
10. REVISION_BUMP != RECONSTRUCTED GLOBAL HISTORY.
11. COMPACTION != HISTORICAL ERASURE PROOF.
12. COMPACTION != HISTORICAL COMPLETENESS.
13. STALE_WATCH INVALIDATION != EFFECT_HISTORY RECONSTRUCTION.
14. PROVIDER_A_ORDER + PROVIDER_B_ORDER != ONE TOTAL GLOBAL ORDER.
15. RECONCILIATION_TIME != EFFECT_TIME.
16. RECONCILED_STATE != RECONCILED_CAUSAL_PATH.
17. LATE_RECEIPT != LATE_EFFECT.
18. RECEIPT_TIMESTAMP != EFFECT_TIMESTAMP unless semantics explicitly establish that relation.
19. RETAINED AUDIT TRAIL != COMPLETE WORLD HISTORY.
20. FINITE AUDIT RETENTION + UNOBSERVED REQUIRED HORIZON -> UNKNOWN.
21. PROVIDER LOCAL FINALITY != GLOBAL FINALITY.
22. CROSS_PROVIDER AGREEMENT != CAUSAL ORDER PROOF.
23. CONVERGED CURRENT STATE != UNIQUE HISTORICAL PATH.
24. RECOVERY CONSISTENCY != HISTORICAL COMPLETENESS.

## Adversarial scenario
P1/I1 records effect candidate E1 at local revision r100.
Migration activates P2/I2, which records E2 at its own local revision r7.
E1 receipt arrives after P2 reconciliation.
Later P1 is restored from a snapshot at r80 with a new cluster identity.
The system now observes r81... but receives an old P1 receipt and an E2 reconciliation record.

No numeric comparison of r100, r7, r80, or later revisions can establish a single global event order. A reconciliation result can establish constraints only to the extent its evidence contract defines ordering and provenance. If the required cross-provider observation or historical lineage has expired, the appropriate state is UNKNOWN.

## Research-only consequence
Nexo must not later treat provider revisions, receipt timestamps, attempt numbers, or reconciliation timestamps as a universal causal clock. Any future Claim/Decision Contract that depends on ordering will need an explicit ordering domain, authority, provenance, observation-time semantics, cross-domain translation rules, retention horizon, and UNKNOWN state.

No architecture implementation or semantic freeze is authorized.

## FutureObs_PAA
UNKNOWN. Not closed.

## Global epistemic state
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
AB55/AB56 carryover = UNRESOLVED
