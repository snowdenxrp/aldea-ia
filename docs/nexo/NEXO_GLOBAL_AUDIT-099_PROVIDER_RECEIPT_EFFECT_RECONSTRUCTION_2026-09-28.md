# NEXO GLOBAL AUDIT-099 — Provider Receipt Semantics and Effect-State Reconstruction

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Accepted/queued/started/completed/failed/cancelled states, ambiguous and duplicate receipts, provider-side retries, asynchronous jobs, reconciliation gaps, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence
AWS Durable Execution documents that an interrupted side-effecting step may not be replayed under at-most-once-per-retry semantics; the caller must check the external system to determine whether the operation succeeded. It also exposes distinct deterministic OperationId and AttemptNumber values. citeturn0search2turn0search3

AWS also states that stopping an execution does not interrupt already-running code; work in progress remains STARTED and side effects before the next checkpoint still take effect. citeturn0search1

Google Cloud Tasks documents asynchronous at-least-once delivery, retry counts, execution counts, and possible duplicate execution. A successful handler response permits task deletion; retry metadata does not itself prove external effect state. citeturn0search4turn0search5turn0search6

## Findings
PROVIDER ACCEPTED != QUEUED
QUEUED != STARTED
STARTED != COMPLETED
COMPLETED != RECEIPT DELIVERED
RECEIPT DELIVERED != RECEIPT SEMANTICS PROVEN
FAILED != NO EFFECT
CANCELLED != HISTORICAL NON-EXECUTION
TIMEOUT != NON-EXECUTION
RETRY COUNT != EFFECT COUNT
EXECUTION COUNT != PHYSICAL ATTEMPT COUNT
HANDLER SUCCESS != WORLD EFFECT COMPLETION
TASK DELETION != HISTORICAL PATH PROOF
DUPLICATE RECEIPT != DUPLICATE EFFECT
MISSING RECEIPT != MISSING EFFECT
RECEIPT REPLAY != NEW OBSERVATION
CURRENT STATUS != COMPLETE HISTORY
PROVIDER HISTORY != WORLD HISTORY
RECONCILIATION READ != HISTORICAL RECONSTRUCTION
AT-LEAST-ONCE DELIVERY != EXACTLY-ONCE EFFECT
IDEMPOTENCY KEY != COMPLETE EFFECT IDENTITY
ATTEMPT ID != EXTERNAL EFFECT IDENTITY
COMPENSATION != ERASURE
EFFECT-STATE CLOSURE != FUTURE FINALITY
EFFECT-STATE CLOSURE != FUTUREOBS_PAA CLOSURE

## State-machine attack
Provider states such as accepted, queued, started and completed answer different semantic questions. Nexo cannot collapse them into EFFECT_OCCURRED without a provider-specific contract.

A failed or cancelled terminal state does not universally prove absence: failure may occur after an external sub-effect, and cancellation may only prevent future processing.

## Receipt attack
A receipt is evidence about an event only under an explicit contract covering issuer/provider identity, operation and attempt identity, state semantics, event-time versus receipt-time, ordering, retry/dedup behavior, authenticity, scope and retention.

AUTHENTIC RECEIPT != UNIVERSAL EFFECT PROOF
VALID RECEIPT != COMPLETE HISTORY

## Duplicate receipts
Two receipts may represent the same provider event delivered twice, different attempts for one logical operation, different provider events, a retry observation, or a replayed historical record.

TWO RECEIPTS != TWO EFFECTS
TWO RECEIPTS != TWO INDEPENDENT OBSERVATIONS

## Asynchronous jobs
Cloud Tasks provides a concrete asynchronous model with at-least-once delivery and possible duplicate execution. Retry count is not effect count, and dispatch timing is not deduplication identity. citeturn0search4turn0search5turn0search6

TASK LIFECYCLE != EXTERNAL EFFECT LIFECYCLE

## Interrupted side effects
AWS Durable Execution requires checking the external system after an interrupted at-most-once step to determine whether the operation succeeded. Local checkpoint state can therefore leave external-effect status unresolved. citeturn0search2

LOCAL TERMINAL STATE != EXTERNAL TERMINAL STATE

## Reconciliation gaps
A later provider read can close a specific current-state question if its read contract is sufficient, but it does not automatically reconstruct omitted intermediate attempts, failed requests, provider-side retries, or effects outside the queried resource.

CURRENT READ != COMPLETE EFFECT HISTORY

If reconciliation history is incomplete, the unresolved boundary remains UNKNOWN.

## Research-only receipt/effect boundary
Candidate record:
- logical operation ID and namespace;
- provider operation ID;
- provider/region/account/incarnation;
- attempt ID and retry lineage;
- request submission;
- accepted/queued/started/completed/failed/cancelled state;
- provider state-transition semantics/version;
- receipt ID and issuer;
- event-time and receipt-time;
- ordering guarantees;
- idempotency/dedup contract;
- cancellation semantics;
- external sub-effect lineage;
- local checkpoint/WAL position;
- reconciliation observation;
- provider history retention;
- compensation events;
- provenance/dependency/common-mode closure;
- conflict/revocation status;
- reconstruction loss.

Not frozen.

## Verdict
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
GLOBAL-AUDIT-100 — asynchronous provider state-machine races and reconciliation completeness: state reordering, duplicate/late receipts, provider-side retry after client timeout, partial completion, cancellation after start, stale status reads, history compaction, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
