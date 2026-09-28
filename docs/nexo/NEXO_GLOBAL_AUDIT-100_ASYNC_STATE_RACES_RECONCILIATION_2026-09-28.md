# NEXO GLOBAL AUDIT-100 — Asynchronous Provider State Races and Reconciliation Completeness

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
State reordering, duplicate/late receipts, provider retry after client timeout, partial completion, cancellation after STARTED, stale status reads, history compaction, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence
AWS Durable Execution states that interrupted at-least-once steps can execute again on replay, while at-most-once-per-retry avoids replay of an interrupted attempt but does not guarantee exactly once across the workflow. It recommends idempotency for repeatable external effects. citeturn0search0

AWS also documents that stopping an execution does not interrupt already-running code; work already underway continues until the next checkpoint and external side effects can still occur. citeturn0search1

Google Cloud Tasks documents that execution order is not guaranteed, duplicate execution can occur, and retry/execution counters describe task-delivery behavior rather than a universal external-effect history. citeturn0search2turn0search3

Cloud Tasks additionally has bounded task-name deduplication: names are remembered for up to 24 hours after deletion, while task retention is separately bounded at 31 days. citeturn0search5

## Findings

DELIVERY ORDER != EFFECT ORDER
RECEIPT ORDER != SEMANTIC EVENT ORDER
LATE RECEIPT != LATE EFFECT
DUPLICATE RECEIPT != DUPLICATE EFFECT
RETRY COUNT != EFFECT COUNT
EXECUTION COUNT != COMPLETE PROVIDER HISTORY
TIMEOUT != NON-EXECUTION
CLIENT TIMEOUT != PROVIDER NON-EXECUTION
STARTED != COMPLETED
PARTIAL COMPLETION != COMPLETE FAILURE
CANCEL AFTER START != HISTORICAL ABSENCE
STOPPED WORKFLOW != CANCELLED EXTERNAL EFFECT
STALE READ != HISTORICAL STATE
CURRENT STATUS != COMPLETE TRANSITION HISTORY
TASK RETENTION != EFFECT HISTORY RETENTION
DEDUP WINDOW != EFFECT HISTORY WINDOW
TASK NAME DEDUP != WORLD-WIDE IDEMPOTENCY
QUEUE ORDER != CAUSAL ORDER
RECONCILIATION MATCH != HISTORICAL PATH PROOF
COMPACTION != SEMANTIC ERASURE
RETAINED FINAL STATE != RETAINED TRANSITION HISTORY
AT-LEAST-ONCE DELIVERY != EXACTLY-ONCE EFFECT
EFFECT RECONSTRUCTION != FUTURE FINALITY
EFFECT RECONSTRUCTION != FUTUREOBS_PAA CLOSURE

## Race analysis

### 1. Reordered state observations
An observer may receive a later state before an earlier receipt. Arrival order therefore cannot define provider event order.

### 2. Late receipts
A late receipt can attest an earlier provider event. Its arrival time must not silently become the event time.

### 3. Client timeout versus provider retry
A client timeout establishes uncertainty about the client-provider exchange, not absence of provider execution. A provider may retry after the client has already retried or revoked authority.

### 4. Partial completion
A provider can fail or cancel after an external sub-effect. A terminal status therefore requires provider-specific semantics before it can support a negative historical claim.

### 5. Cancellation after STARTED
AWS gives a concrete boundary: stopping the workflow does not stop already-running code; effects before the next checkpoint can still occur. citeturn0search1

### 6. Stale status
A current status read may be authoritative for the current resource under its contract while omitting earlier attempts, overwritten states, deleted jobs, or provider-side retries.

### 7. Compaction and retention
Cloud Tasks has separate bounded retention and dedup windows. Therefore a resource can retain a current task identity while historical evidence needed for reconstructing all prior attempts is unavailable. citeturn0search5

### 8. Duplicate delivery
Cloud Tasks explicitly allows duplicate execution despite aiming for exactly-once behavior. Therefore application-level idempotency remains a semantic boundary. citeturn0search2

## Research-only reconstruction boundary

Candidate evidence must bind:

- provider/resource identity and incarnation;
- logical operation and provider operation ID;
- attempt/retry lineage;
- state-transition event identity;
- event-time and observation/receipt-time;
- causal/order relation;
- accepted/queued/started/completed/failed/cancelled semantics;
- provider retry behavior;
- cancellation semantics;
- client timeout/failure boundary;
- idempotency/dedup namespace and validity window;
- current-state snapshot/version;
- retained event/history range;
- compaction/deletion events;
- reconciliation read semantics;
- external sub-effect lineage;
- authority/fencing epoch;
- credential/revocation state;
- provenance/dependency/common-mode closure;
- reconstruction loss;
- conflict state.

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
GLOBAL-AUDIT-101 — external-effect history retention and reconstructability: provider log truncation/TTL, tombstones, deleted resources, dedup-window expiry, receipt retention, snapshot/compaction boundaries, and whether any finite retention contract can safely close FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
