# NEXO GLOBAL AUDIT-091 — Concurrent External Migration and Cutover Races

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-091 attacks external-provider migration while operations are concurrent: dual-write races, cutover boundaries, in-flight retries, late acknowledgements, operation-identity collisions, A/B disagreement, partial rollback, compensation ordering, shadow-to-live promotion, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

Stripe's idempotency contract stores the first result for a key, compares later parameters against the original, and may prune keys after at least 24 hours; after pruning, reuse creates a new request. It also explicitly distinguishes concurrent requests that conflict before endpoint execution from requests whose execution has begun. citeturn0search1turn0search4

AWS's transactional-outbox guidance states that duplicate downstream messages can occur, consumers should be idempotent, and event notification order must be preserved for event-sourcing; its sample uses durable outbox records and message deduplication identifiers but still treats downstream delivery as a separate boundary. citeturn0search0turn0search5

AWS Durable Execution documentation explicitly distinguishes at-least-once replay from exactly-once execution and recommends matching retry semantics to the side effect; a retry can execute a step again even when an individual attempt has at-most-once semantics. citeturn0search10

## Findings

### 1. Cutover is an interval, not an instant

If A is active before cutover and B after cutover, requests already in flight can cross the boundary.

CUTOVER POINT != UNIVERSAL EFFECT BOUNDARY
REQUEST START TIME != EFFECT COMMIT TIME

A migration contract therefore needs an effective interval plus operation/attempt semantics.

### 2. Dual-write can create two real effects

Writing A and B for the same intent does not prove they represent one external effect. If the providers are not jointly idempotent under a shared semantic identity, both can execute.

DUAL-WRITE != ONE EFFECT
SHARED INTENT != SHARED EXTERNAL IDENTITY

### 3. In-flight retry after cutover

A request accepted by A before cutover but retried against B after cutover can produce:
- A effect + B effect;
- A accepted + B deduplicated;
- A ambiguous + B executed;
- A and B both rejected;
- an unresolved combination.

The retry must therefore carry migration lineage, not merely the business operation identifier.

LATE RETRY != SAME PROVIDER OPERATION

### 4. Provider-specific idempotency namespaces

Stripe's documented parameter comparison and pruning behavior shows that idempotency semantics are provider-specific and time-bounded. Reusing the same key after pruning can create a new request. citeturn0search1

KEY EQUALITY ACROSS PROVIDERS != DEDUPLICATION
KEY EQUALITY ACROSS WINDOWS != SAME OPERATION

### 5. Late acknowledgements

A's acknowledgement can arrive after B has already executed a migrated retry.

LATE ACK != LATE EXECUTION
ACK ORDER != EFFECT ORDER

The system must preserve receipt timestamps/versions and provider semantics rather than ordering events solely by arrival.

### 6. A/B disagreement

A and B can both provide authentic observations that disagree because they observe different epochs, replicas, or provider histories.

AUTHENTIC A != AUTHORITATIVE GLOBAL STATE
AUTHENTIC A + AUTHENTIC B != AUTOMATIC CONFLICT RESOLUTION

A disagreement needs scope, time, provider authority and operation identity before it can be classified.

### 7. Partial rollback

Rolling B back while A remains historically authoritative does not erase B's executed effects.

ROLLBACK != ERASE
COMPENSATION != HISTORICAL UNDO

A compensation is a new external event with its own identity and race conditions.

### 8. Compensation ordering

If compensation C is issued while the original effect E is ambiguous, a late confirmation of E can produce E → C or C → E in semantic order even if receipts arrive in another order.

RECEIPT ORDER != SEMANTIC EVENT ORDER
COMPENSATION ORDER != ARRIVAL ORDER

### 9. Shadow-to-live promotion

A shadow provider may have accumulated observations without producing live effects. Promoting it does not prove that its historical shadow observations establish live-effect equivalence.

SHADOW HISTORY != LIVE HISTORY
SHADOW AGREEMENT != LIVE EFFECT EQUIVALENCE

### 10. Concurrent migration writers

Multiple writers can disagree on the active provider during a cutover unless authority epoch/fencing is explicit.

CURRENT CONFIG != PROOF OF HISTORICAL ROUTING
WRITER AGREEMENT != EFFECT ORDERING

A fencing epoch can constrain future writers but does not reconstruct effects already accepted before fencing.

### 11. Operation identity collision

A globally unique local operation ID can collide semantically when reused by a second provider, environment, incarnation or migration epoch.

LOCAL UNIQUENESS != GLOBAL SEMANTIC UNIQUENESS

Candidate identity must bind provider/target, contract epoch, source incarnation and migration lineage.

### 12. Reconciliation after migration

A current A/B state match can show convergence of selected current fields but cannot by itself prove:
- which provider executed first;
- whether a duplicate attempt occurred;
- whether a compensation raced with the original;
- whether an acknowledgement was lost;
- whether provider history was pruned.

CURRENT MATCH != HISTORICAL PATH PROOF

### 13. Exactly-once remains boundary-dependent

AWS explicitly notes that retry semantics and external side effects must be matched; at-least-once replay can rerun code, while at-most-once does not itself mean end-to-end exactly-once. citeturn0search10

RETRY POLICY != EXTERNAL EXACTLY-ONCE
ATTEMPT SEMANTICS != WORLD-EFFECT SEMANTICS

### 14. FutureObs_PAA

A migration proof over a bounded cutover interval cannot establish that later provider observations will never reveal an unobserved duplicate, rollback, compensation, or stale-history distinction.

MIGRATION CLOSURE != FUTURE FINALITY
CUTOVER RECONCILIATION != FUTUREOBS_PAA CLOSURE

## Research-only migration race boundary

Candidate migration operation record:

- business intent identity;
- provider identity;
- provider operation identity;
- migration epoch;
- source/worker incarnation;
- attempt identity;
- provider idempotency namespace;
- dedup window/epoch;
- cutover interval;
- authority/fencing epoch;
- request fingerprint;
- provider receipt identity/version;
- semantic event-time and observation-time;
- retry lineage;
- compensation lineage;
- A/B observation relation;
- shadow/live mode;
- provider history/reconciliation evidence;
- retention/loss state;
- provenance/dependency closure;
- conflict/revocation state.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-091 does NOT close:

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

GLOBAL-AUDIT-092 — attack migration recovery and ambiguous external outcomes:
crash during cutover, lost receipts, provider-side retries, dedup-state reset, split-brain routing, fencing failures, compensation/retry races, recovery snapshots, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
