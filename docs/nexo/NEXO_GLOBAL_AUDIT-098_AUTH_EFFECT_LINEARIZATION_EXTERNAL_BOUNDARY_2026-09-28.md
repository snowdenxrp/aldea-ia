# NEXO GLOBAL AUDIT-098 — Authorization/Effect Linearization at the External Boundary

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Revocation exactly around commit, provider acceptance versus execution, cancellation races, receipt ambiguity, retry after revocation, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

RFC 7009 states that token invalidation can have propagation delay: some servers may know about invalidation while others do not. citeturn0search0

AWS Durable Execution explicitly documents that stopping an execution does not stop already-running code; external side effects performed before the next checkpoint can still take effect. citeturn0search2

AWS also distinguishes at-least-once from at-most-once-per-retry semantics and states that neither alone guarantees exactly-once execution across the entire workflow. For external idempotency APIs, the same idempotency key must be reused across attempts. citeturn0search1

## Findings

AUTHORIZATION CHECK != EFFECT COMMIT
AUTHORIZATION AT START != AUTHORIZATION AT EFFECT
REVOCATION BEFORE EFFECT != PROOF OF NO EFFECT
REVOCATION AFTER EFFECT != RETROACTIVE UNDO
PROVIDER ACCEPTED != EFFECT EXECUTED
EFFECT EXECUTED != RECEIPT DELIVERED
RECEIPT LOST != EFFECT ABSENT
CANCEL REQUESTED != EFFECT CANCELLED
CANCEL ACKNOWLEDGED != HISTORICAL EFFECT ABSENCE
TIMEOUT != NON-EXECUTION
RETRY AFTER TIMEOUT != FIRST EXECUTION
SAME IDEMPOTENCY KEY != SAME PROVIDER HISTORY
IDEMPOTENCY != EXACTLY-ONCE WORLD EFFECT
AT-MOST-ONCE-PER-RETRY != EXACTLY-ONCE WORKFLOW
REVOCATION OBSERVED LOCALLY != EXTERNAL FENCING
LOCAL COMMIT != PROVIDER COMMIT
PROVIDER COMMIT != WORLD FINALITY
CURRENT PROVIDER STATE != COMPLETE EFFECT HISTORY
RECONCILIATION MATCH != HISTORICAL PATH PROOF
EFFECT CLOSURE != FUTURE FINALITY
EFFECT CLOSURE != FUTUREOBS_PAA CLOSURE

## Race analysis

### 1. Authorization/effect gap

A permission check and the external effect are distinct events unless the external system itself enforces the same authority boundary atomically. Nexo cannot infer commit-time authorization merely from an earlier successful check.

### 2. Revocation at the boundary

If revocation occurs between authorization and external execution, three distinct facts must be separated:
- authorization was valid at check time;
- revocation was observed at some later time;
- the provider accepted/executed the effect.

Without a contract ordering these events, current state alone cannot reconstruct the effect decision.

### 3. Acceptance versus execution

A provider acknowledgement may mean request accepted, queued, persisted, or executed. The receipt contract must define which semantic event it attests.

PROVIDER ACK != UNIVERSAL EXECUTION PROOF

### 4. Cancellation race

AWS Durable Execution provides a concrete example: stopping an execution does not interrupt already-running Lambda code, and side effects before the next checkpoint can still happen. citeturn0search2

Therefore:
STOP REQUEST != EFFECT ABSENCE
STOP ACK != RETROACTIVE CANCELLATION

### 5. Retry ambiguity

AWS states replay/retry can run the same operation more than once. Idempotency keys can make repeated attempts converge at an external service, but this does not establish that only one physical attempt occurred. citeturn0search1

### 6. Receipt ambiguity

A lost acknowledgement leaves at least two live hypotheses:
H1 = provider accepted/executed
H2 = provider did not execute

A timeout or missing receipt must not collapse this to H2.

### 7. Compensation

A compensating operation is a new external event. It can reduce current divergence but cannot erase the original execution from history.

COMPENSATION != HISTORICAL UNDO

### 8. Reconciliation

A current provider read can establish current state under its read contract. It does not automatically prove the complete historical path that produced that state.

CURRENT MATCH != HISTORICAL PATH PROOF

## Research-only external-effect boundary

Candidate record must bind:

- authorization decision and authority epoch;
- authorization check time;
- revocation observation and effective interval;
- operation ID and idempotency namespace;
- provider identity/incarnation/region;
- request submission;
- provider acceptance semantics;
- provider execution semantics;
- receipt type and provenance;
- cancellation request/acknowledgement;
- retry/attempt lineage;
- provider deduplication state;
- local commit/checkpoint;
- reconciliation observation;
- compensation events;
- fencing state;
- provider contract version;
- provenance/dependency closure;
- retention/reconstruction loss;
- conflict/revocation state.

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

GLOBAL-AUDIT-099 — attack provider receipt semantics and effect-state reconstruction: accepted/queued/started/completed/failed/cancelled states, ambiguous receipts, duplicate receipts, provider-side retries, asynchronous jobs, reconciliation gaps, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
