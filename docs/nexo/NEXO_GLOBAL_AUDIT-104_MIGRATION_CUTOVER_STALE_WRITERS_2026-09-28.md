# NEXO GLOBAL AUDIT-104 — Migration Cutover and Stale-Writer Races

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Source/destination overlap, fencing propagation, outstanding operations, duplicate effects, delayed receipts, rollback, and whether cutover can establish one authoritative effect history.

No implementation. No V21. No semantic freeze.

## Fresh evidence

etcd guarantees linearizable operations by default, while serializable reads may be stale. Its watch events are ordered by revision, demonstrating that provider-local ordering can be stronger than arbitrary client arrival order but remains scoped to that provider's revision domain. citeturn0search7

etcd snapshot restore creates a new logical cluster identity while preserving keyspace contents, so a cutover based on restored data cannot infer identity continuity from state equality alone. citeturn0search4

AWS Durable Execution documents that replay/retry can repeat side-effecting operations; even at-most-once-per-retry does not mean exactly once across the workflow. Stable idempotency keys are therefore an explicit external-effect boundary. citeturn0search0turn0search8

Cloud Tasks does not guarantee execution order and permits duplicate execution; retry configuration can continue attempts until a configured limit or duration, after which the task is deleted. citeturn0search1turn0search5

## Findings

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
SAME OPERATION ID != SAME PROVIDER OPERATION
SAME IDEMPOTENCY KEY != SAME PROVIDER DEDUP HISTORY
RETRY COUNT != EFFECT COUNT
LATE RECEIPT != LATE EFFECT
DUPLICATE RECEIPT != DUPLICATE EFFECT
ROLLBACK != HISTORICAL UNDO
RESTORE != RETROACTIVE CANCELLATION
CUTOVER CHECKPOINT != COMPLETE EXTERNAL HISTORY
CURRENT DESTINATION STATE != COMPLETE SOURCE HISTORY
PROVIDER-LOCAL LINEARIZABILITY != CROSS-PROVIDER LINEARIZABILITY
SOURCE ORDER + DESTINATION ORDER != ONE GLOBAL ORDER
CUTOVER FINALITY != FUTUREOBS_PAA CLOSURE

## Critical race

Consider source P1 and destination P2:

1. O is accepted by P1.
2. Cutover begins and fencing epoch E2 is issued.
3. P1 has an in-flight attempt whose acknowledgement is delayed.
4. P2 accepts the migrated representation.
5. P1 completes the old attempt after E2 was issued.
6. P2 retries or executes its corresponding operation.
7. Receipts arrive out of order.
8. A rollback restores a checkpoint that predates part of the cutover.

Even if each provider is internally correct, the combined observations do not automatically identify a single effect history.

The missing proof obligations are:

- exact cutover linearization point;
- authoritative fencing domain;
- stale-writer rejection at the actual external-effect boundary;
- inventory of all outstanding operations;
- source and destination operation namespaces;
- effect/receipt lineage;
- cross-provider causal relation;
- duplicate suppression semantics;
- rollback fencing;
- revocation state;
- retention coverage;
- reconciliation completeness.

## Strong boundary

A migration can produce a valid destination state without proving that every source-side attempt was either:

1. transferred exactly once,
2. externally prevented,
3. externally observed and reconciled,
4. or deliberately classified UNKNOWN.

Therefore a migration contract must not collapse these states into a binary SUCCESS/FAILURE result.

Candidate state partition:

TRANSFERRED
FENCED
RECONCILED
UNKNOWN

This is research-only and not yet a formal Nexo state machine.

## FutureObs_PAA impact

A future observation from P2 after cutover proves a fact in P2's authority domain, but does not by itself prove what happened to a delayed P1 attempt before or during cutover.

Thus:

DESTINATION OBSERVATION != SOURCE NON-EFFECT

and:

CUTOVER SUCCESS != COMPLETE HISTORICAL RECONSTRUCTION

and:

CROSS-PROVIDER CUTOVER != FUTUREOBS_PAA CLOSURE

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

GLOBAL-AUDIT-105 — cutover rollback and bidirectional overlap: stale source after destination activation, destination after rollback, fence-token/epoch rollback, duplicate operation namespaces, reconciliation after split-brain, and whether rollback can preserve a single authoritative history.

No implementation. No V21. Preserve UNKNOWN.
