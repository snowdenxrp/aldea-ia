# NEXO GLOBAL AUDIT CONTINUITY — AUDIT-105

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-105
Latest audit commit: 750a483aa020c6262579eaf8b0e07cf4005a9da2

Audit-105 attacked cutover rollback, bidirectional overlap, stale source/destination writers, fence/epoch rollback, duplicate namespaces, and split-brain reconciliation.

Fresh evidence:
- etcd warns that snapshot restore can move revision backward and that restoring older state can make existing clients/caches inconsistent; restore also creates a new logical cluster identity. citeturn0search6
- AWS Durable Execution: side effects can repeat across retries; stable idempotency keys are required, and at-most-once-per-retry is not exactly-once across a workflow with retries. citeturn0search0turn0search11
- Cloud Tasks is at-least-once and permits duplicate execution; retry limits eventually remove the task. citeturn0search1turn0search7

Core distinctions:
ROLLBACK != HISTORICAL UNDO
ROLLBACK != EFFECT CANCELLATION
ROLLBACK TO OLD STATE != RETURN TO OLD AUTHORITY
RESTORED REVISION != CURRENT REVISION
RESTORED DATA != RESTORED INCARNATION
OLD FENCE VALUE != CURRENT FENCE AUTHORITY
FENCE EPOCH ROLLBACK != AUTHORITY REWIND
DESTINATION ACTIVE THEN ROLLED BACK != DESTINATION NEVER ACTIVE
SOURCE REACTIVATION != SOURCE CONTINUITY
DESTINATION CHECKPOINT != GLOBAL EFFECT CHECKPOINT
SAME OPERATION ID ACROSS PROVIDERS != SAME OPERATION HISTORY
SAME IDEMPOTENCY KEY ACROSS PROVIDERS != SHARED DEDUP STORE
IDENTIFIER EQUALITY != HISTORY EQUALITY
RECONCILIATION AFTER ROLLBACK != HISTORICAL UNDO
CURRENT STATE AFTER ROLLBACK != COMPLETE PRE-ROLLBACK HISTORY
SPLIT-BRAIN RECONCILIATION != AUTOMATIC SINGLE HISTORY
AUTHORITY MERGE != EFFECT MERGE
LOCAL LINEARIZABILITY != CROSS-PROVIDER LINEARIZABILITY
ROLLBACK SUCCESS != FUTUREOBS_PAA CLOSURE

Critical race:
P1 authoritative -> O1 accepted -> P2 activated with E2 -> P1 has in-flight O1 -> P2 executes/retries -> P2 becomes externally active -> rollback restores pre-cutover P1 state -> P1 resumes -> delayed P2 receipt arrives.

The rollback cannot establish that P2 was never externally active:
P2 ACTIVE -> ROLLBACK != P2 NEVER ACTIVE
RESTORE(P1, old_state) != UNDO(P2 effects)

Fence rollback must distinguish value, authority, enforcement domain, and observation:
RESTORED FENCE VALUE != RESTORED AUTHORITY
LOCAL FENCE RESTORE != GLOBAL STALE-WRITER EXCLUSION

Cross-provider identifier equality is insufficient:
SAME OPERATION ID != SAME HISTORY
SAME IDEMPOTENCY KEY != SHARED DEDUP STORE

Post-overlap reconciliation must retain distinctions such as source-only effect, destination-only effect, same logical operation/different attempt, conflicting effect, receipt-only, effect-without-receipt, retention-loss UNKNOWN, and authority conflict. Latest-state-wins would collapse epistemically distinct histories.

FutureObs_PAA remains UNKNOWN:
POST-ROLLBACK STATE != PRE-ROLLBACK WORLD HISTORY
ROLLBACK != FUTUREOBS_PAA CLOSURE
SPLIT-BRAIN RECONCILIATION != FUTUREOBS_PAA CLOSURE

Global epistemic state unchanged:
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness/minimality = UNKNOWN
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

AB55/AB56 carryover unchanged and mandatory.

Next exact mission:
GLOBAL-AUDIT-106 — cross-provider idempotency and deduplication independence: shared keys, provider-local namespaces, dedup TTL expiry, provider migration, retry after rollback, and whether any external-effect identity can remain unique without a shared authoritative registry.

No implementation. No V21. Preserve UNKNOWN.
