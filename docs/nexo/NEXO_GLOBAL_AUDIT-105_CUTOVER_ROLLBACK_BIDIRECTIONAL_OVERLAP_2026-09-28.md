# NEXO GLOBAL AUDIT-105 — Cutover Rollback and Bidirectional Overlap

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Rollback after destination activation, stale source after cutover, destination after rollback, fence/epoch rollback, duplicate operation namespaces, split-brain reconciliation, and whether rollback can preserve one authoritative effect history.

No implementation. No V21. No semantic freeze.

## Fresh evidence

etcd snapshot restore can move a cluster to an older revision and creates a new logical cluster identity. Its documentation warns that restoring an older revision can leave existing clients/caches inconsistent unless revision handling is used. citeturn0search6

AWS Durable Execution states that retries can execute a side-effecting operation more than once, and idempotency keys must remain stable across attempts. At-most-once-per-retry still does not mean exactly once across a workflow when retries are enabled. citeturn0search0turn0search11

Cloud Tasks provides at-least-once delivery and explicitly permits duplicate execution; retry parameters can continue attempts until limits are reached, after which the task is removed. citeturn0search1turn0search7

## Findings

ROLLBACK != HISTORICAL UNDO
ROLLBACK != EFFECT CANCELLATION
ROLLBACK TO OLD STATE != RETURN TO OLD AUTHORITY
RESTORED REVISION != CURRENT REVISION
RESTORED DATA != RESTORED INCARNATION
OLD FENCE VALUE != CURRENT FENCE AUTHORITY
FENCE EPOCH ROLLBACK != AUTHORITY REWIND
DESTINATION ACTIVE THEN ROLLED BACK != DESTINATION NEVER ACTIVE
SOURCE REACTIVATION != SOURCE CONTINUITY
SOURCE WRITER STOPPED != SOURCE EFFECT ABSENCE
DESTINATION CHECKPOINT != GLOBAL EFFECT CHECKPOINT
SAME OPERATION ID ACROSS PROVIDERS != SAME OPERATION HISTORY
SAME IDEMPOTENCY KEY ACROSS PROVIDERS != SHARED DEDUP STORE
DUPLICATE OPERATION NAMESPACE != DUPLICATE EFFECT PROOF
RECONCILIATION AFTER ROLLBACK != HISTORICAL UNDO
CURRENT STATE AFTER ROLLBACK != COMPLETE PRE-ROLLBACK HISTORY
SPLIT-BRAIN RECONCILIATION != AUTOMATIC SINGLE HISTORY
AUTHORITY MERGE != EFFECT MERGE
LATEST STATE != CAUSAL HISTORY
LOCAL LINEARIZABILITY != CROSS-PROVIDER LINEARIZABILITY
ROLLBACK SUCCESS != FUTUREOBS_PAA CLOSURE

## Critical bidirectional race

1. P1 is authoritative.
2. O1 is accepted at P1.
3. Cutover activates P2 with epoch E2.
4. P1 has an in-flight O1 attempt.
5. P2 executes or retries the migrated representation.
6. P2 becomes externally active.
7. A failure triggers rollback toward a P1 snapshot predating the cutover.
8. P1 resumes with old state and may see O1 as pending.
9. A delayed P2 receipt arrives after rollback.
10. A reconciliation process now observes evidence from both incarnations.

Even if each local state is internally valid, rollback does not erase the fact that P2 may have been externally active.

Therefore:

P2 ACTIVE -> ROLLBACK != P2 NEVER ACTIVE

and:

RESTORE(P1, old_state) != UNDO(P2 effects)

## Fence rollback boundary

A numeric fence/epoch must not be treated as authority merely because it is greater or equal locally.

Required distinction:

FENCE VALUE
vs
FENCE AUTHORITY
vs
FENCE ENFORCEMENT DOMAIN
vs
FENCE OBSERVATION

A rollback that restores an older fence value risks re-admitting an old writer unless the external effect boundary rejects the stale authority independently.

Thus:

RESTORED FENCE VALUE != RESTORED AUTHORITY

and:

LOCAL FENCE RESTORE != GLOBAL STALE-WRITER EXCLUSION

## Duplicate namespace boundary

A source and destination may both use an operation ID such as O-123. Without a shared or cryptographically bound identity namespace, equality of the string does not prove equality of operation history.

Similarly, passing the same idempotency key to two providers does not establish that they share a deduplication database or historical knowledge.

Therefore:

IDENTIFIER EQUALITY != HISTORY EQUALITY

## Split-brain reconciliation

After overlap/rollback, reconciliation must classify at least:

- source-only effect;
- destination-only effect;
- same logical operation / different attempt;
- same operation / conflicting effect;
- receipt-only evidence;
- effect-without-receipt;
- unknown due to retention loss;
- authority-conflict evidence.

A single "latest state wins" rule would destroy causal distinctions and can convert uncertainty into a fabricated historical winner.

## FutureObs_PAA impact

Rollback creates a particularly strong future-observation ambiguity:

A future observation of P1 after rollback cannot prove that P2 never executed.

A future observation of P2 cannot by itself prove that P1's historical state was superseded.

Therefore:

POST-ROLLBACK STATE != PRE-ROLLBACK WORLD HISTORY

ROLLBACK != FUTUREOBS_PAA CLOSURE

SPLIT-BRAIN RECONCILIATION != FUTUREOBS_PAA CLOSURE

## Epistemic state — unchanged

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

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-106 — cross-provider idempotency and deduplication independence: shared keys, provider-local namespaces, dedup TTL expiry, provider migration, retry after rollback, and whether any external-effect identity can remain unique without a shared authoritative registry.

No implementation. No V21. Preserve UNKNOWN.
