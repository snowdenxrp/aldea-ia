# NEXO GLOBAL AUDIT CONTINUITY — AUDIT-104

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-104
Latest audit commit: 912303dfbcc7cda84e72de7e26207bf3d7158eba

Audit-104 attacked migration cutover, source/destination overlap, fencing propagation, outstanding operations, delayed receipts, duplicate effects, and rollback.

Fresh evidence:
- etcd provides linearizable operations by default, while serializable reads may be stale; watches are ordered by provider revision. citeturn0search7
- etcd snapshot restore creates a new logical cluster identity while preserving keyspace contents. citeturn0search4
- AWS Durable Execution documents replay/retry duplication boundaries and stable idempotency-key requirements for external effects. citeturn0search0turn0search8
- Cloud Tasks does not guarantee execution order and allows duplicate execution; retry duration/attempt limits eventually delete tasks. citeturn0search1turn0search5

Core distinctions:
CUTOVER START != CUTOVER COMPLETE
CUTOVER COMPLETE != OLD WRITER DEAD
OLD WRITER FENCED LOCALLY != OLD WRITER FENCED EXTERNALLY
FENCE ISSUED != FENCE OBSERVED
FENCE OBSERVED != FENCE ENFORCED
SOURCE QUIESCED != SOURCE EFFECTS ABSENT
DESTINATION ACTIVE != DESTINATION EXCLUSIVE
SOURCE STOP ACK != SOURCE NON-EXECUTION
MIGRATION RECORD != EFFECT RECONCILIATION
STATE COPY != EFFECT COPY
STATE EQUALITY != HISTORY EQUALITY
RETRY COUNT != EFFECT COUNT
LATE RECEIPT != LATE EFFECT
DUPLICATE RECEIPT != DUPLICATE EFFECT
ROLLBACK != HISTORICAL UNDO
PROVIDER-LOCAL LINEARIZABILITY != CROSS-PROVIDER LINEARIZABILITY
SOURCE ORDER + DESTINATION ORDER != ONE GLOBAL ORDER
CUTOVER FINALITY != FUTUREOBS_PAA CLOSURE

Critical race:
P1 accepts O; cutover issues E2; an in-flight P1 attempt completes after E2; P2 accepts migrated O; P2 may retry; receipts arrive out of order; rollback restores a pre-cutover checkpoint. Each provider may remain internally valid while the combined evidence fails to establish one global effect history.

Required proof obligations include:
- exact cutover linearization point;
- authoritative fencing domain;
- stale-writer rejection at actual external-effect boundary;
- complete outstanding-operation inventory;
- source/destination operation namespaces;
- effect/receipt lineage;
- cross-provider causal relation;
- duplicate suppression;
- rollback fencing;
- revocation state;
- retention coverage;
- reconciliation completeness.

Migration must not collapse incomplete history into binary SUCCESS/FAILURE. Candidate research-only states:
TRANSFERRED / FENCED / RECONCILED / UNKNOWN

FutureObs_PAA remains UNKNOWN:
DESTINATION OBSERVATION != SOURCE NON-EFFECT
CUTOVER SUCCESS != COMPLETE HISTORICAL RECONSTRUCTION
CROSS-PROVIDER CUTOVER != FUTUREOBS_PAA CLOSURE

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
GLOBAL-AUDIT-105 — cutover rollback and bidirectional overlap: stale source after destination activation, destination after rollback, fence-token/epoch rollback, duplicate operation namespaces, reconciliation after split-brain, and whether rollback can preserve a single authoritative history.

No implementation. No V21. Preserve UNKNOWN.
