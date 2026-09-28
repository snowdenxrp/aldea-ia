# NEXO GLOBAL AUDIT-092 — Recovery During External Migration

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-092

## Scope
Crash during cutover, lost receipts, provider retries, dedup-state reset, split-brain routing, fencing failures, compensation/retry races, recovery snapshots, FutureObs_PAA.

## Evidence
AWS Durable Execution documents that replay can rerun a step; at-least-once-per-retry is the default, while at-most-once-per-retry is still not exactly-once across a workflow when retries occur. Stable idempotency keys must survive replay. citeturn0search0turn0search1

Google Pub/Sub scopes exactly-once delivery to pull subscriptions and a single region; failed acknowledgement persistence can permit redelivery, and publish-side duplicates can still produce multiple messages. citeturn0search2

etcd uses a cluster-wide logical revision for ordering, but historical revisions are retention-bounded and old history is compacted. citeturn0search3

## Findings
CRASH POSITION != EFFECT STATUS
LOST RECEIPT != NO EFFECT
TIMEOUT != NO EFFECT
CLIENT RETRY != PROVIDER RETRY
ATTEMPT COUNT OBSERVED LOCALLY != COMPLETE PROVIDER ATTEMPT HISTORY
DEDUP STATE RESTORE != OPERATION HISTORY RESTORE
DEDUP RESET != NON-EXECUTION
RESTORED PROVIDER != SAME SEMANTIC STATE
FENCING FAILURE != EFFECT ABSENCE
FENCE != RETROACTIVE REVOCATION
CURRENT EPOCH != HISTORICAL EFFECT EPOCH
COMPENSATION != ROLLBACK
COMPENSATION != PROOF OF ORIGINAL ABSENCE
LATE EFFECT != ERASURE OF COMPENSATION
LOCAL SNAPSHOT != EXTERNAL HISTORY
RETAINED REVISION != COMPLETE HISTORY
A SNAPSHOT + B SNAPSHOT != PROVEN JOINT WORLD STATE
LOCAL IDENTITY PERSISTENCE != PROVIDER DEDUP PERSISTENCE
CURRENT CAPABILITY != HISTORICAL CAPABILITY
AT-MOST-ONCE-PER-RETRY != EXACTLY-ONCE-WORKFLOW
RECOVERY CLOSURE != FUTURE FINALITY
CRASH-WINDOW CLOSURE != FUTUREOBS_PAA CLOSURE

## Safe research boundary
A recovery claim must bind operation/migration lineage, provider and region, contract version, attempt/retry lineage, idempotency/dedup epoch, durable local commit position, outbox/WAL/snapshot range, receipt identity/version, provider reconciliation evidence, provider retention/compaction, routing/fencing epoch, incarnation, event-time versus observation-time, compensation lineage, cross-provider checkpoint relation, and reconstruction loss.

If execution remains ambiguous after recovery, preserve UNKNOWN rather than infer absence from missing receipt or restored local state.

FutureObs_PAA remains UNKNOWN.

## Mandatory AB55/AB56 carryover
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

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

## Next exact mission
GLOBAL-AUDIT-093 — recovery evidence itself: snapshot/WAL atomicity, provider recovery, dedup-store restoration, cross-provider checkpoint alignment, receipt replay, recovery idempotency, fencing epoch persistence, disaster recovery, FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
