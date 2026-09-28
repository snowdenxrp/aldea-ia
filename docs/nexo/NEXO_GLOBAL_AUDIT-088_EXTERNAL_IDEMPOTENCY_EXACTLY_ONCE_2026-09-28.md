# NEXO GLOBAL AUDIT-088 — External Idempotency, Deduplication Windows and Exactly-Once Claims

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-088 attacks external-effect identity and exactly-once claims: provider idempotency semantics, deduplication windows, operation identity reuse, retries across epochs, ambiguous timeouts, receipt/reconciliation contracts, compensation races, outbox relay failover, concurrent-writer ordering, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

Stripe's API documents server-side idempotency keys: the first request's status/body are retained for the key and later requests with the same key return the stored result, including a 500 response. This is a concrete provider-specific contract, not a universal exactly-once theorem. citeturn0search4turn0search6

Google Cloud Pub/Sub documents an exactly-once delivery mode with explicit scope: pull subscriptions, acknowledgment semantics, message IDs, and same-region constraints. It also states that publisher-side duplicate publishes can still create multiple messages, potentially with different message IDs. citeturn0search0turn0search2

AWS transactional-outbox guidance explicitly says duplicate messages remain possible and consumers should be idempotent; it also stresses preserving notification order for event-sourcing use cases. citeturn0search5

## Findings

### 1. Provider idempotency is contract-scoped

An idempotency key only has the semantics the provider assigns to it: namespace, retention, request-parameter binding, operation type and lifetime matter.

PROVIDER IDEMPOTENCY != UNIVERSAL EXACTLY-ONCE
IDEMPOTENCY KEY != GLOBAL OPERATION ID

Stripe is an example where the key maps retries to the stored first result. That cannot be generalized to a provider that has a different retention or scope contract. citeturn0search4

### 2. Deduplication windows create temporal boundaries

If a provider retains idempotency state only for a bounded period, reusing the same key after that period can be semantically different from retrying within it.

DEDUP WINDOW != OPERATION LIFETIME
EXPIRED DEDUP STATE != PROOF OF NEVER EXECUTED

Therefore operation identity must include or reference the provider's idempotency scope and retention contract.

### 3. Key reuse is dangerous across epochs

Reusing an operation_id after authority rotation can collide with a historical operation while the intended authorization, target state or semantic contract has changed.

SAME KEY != SAME OPERATION
SAME KEY ACROSS EPOCHS != SAFE REPLAY

A candidate identity must bind operation semantics, authority epoch, source incarnation, target/provider, and effect contract.

### 4. Exactly-once delivery is not exactly-once external effect

Pub/Sub's exactly-once mode is explicitly a delivery/acknowledgment contract. Its guarantee is scoped to supported subscription types and regions, and publisher-side duplicate publishes can still create distinct messages. citeturn0search0turn0search2

EXACTLY-ONCE DELIVERY != EXACTLY-ONCE WORLD EFFECT
EXACTLY-ONCE ACK != EXACTLY-ONCE BUSINESS ACTION

The external-effect contract must cross the provider boundary.

### 5. Ambiguous timeout

If a request times out after the provider may have accepted it, retrying without provider-supported idempotency or a queryable receipt can duplicate the effect.

TIMEOUT != NOT EXECUTED
TIMEOUT != EXECUTED
RETRY SAFETY REQUIRES A CLOSING CONTRACT

### 6. Receipt semantics

A receipt can close a bounded provider-side observation, but its scope matters: request accepted, operation completed, object created, settlement finalized, and current object state are different claims.

RECEIPT != UNIVERSAL COMPLETION
CURRENT OBJECT STATE != COMPLETE REQUEST HISTORY

### 7. Compensation race

Suppose effect A occurs, reconciliation believes A failed, and compensation B is issued while A's delayed acknowledgement arrives. Both A and B can be real.

COMPENSATION RACE != ROLLBACK
LATE ACK != ERASURE OF COMPENSATION

The event history must retain both and resolve current state using explicit semantic rules.

### 8. Relay failover

Two relays can independently consume the same outbox event during failover. Even if the broker offers exactly-once delivery within a bounded contract, the external provider may not.

BROKER EXACTLY-ONCE != PROVIDER EXACTLY-ONCE
RELAY LEADERSHIP != EFFECT OWNERSHIP

### 9. Concurrent writers

Local transaction ordering can establish an order in the source database, but concurrent external effects may complete in a different order unless the provider contract preserves the required ordering.

LOCAL ORDER != EFFECT COMPLETION ORDER

AWS explicitly treats notification ordering as important for event-sourcing and warns that incorrect order can compromise data quality. citeturn0search5

### 10. Deduplication does not prove historical singularity

If a provider reports that it deduplicated two requests under one key, that proves something about its deduplication decision, not necessarily the complete history before the provider received them.

DEDUP RESULT != COMPLETE ATTEMPT HISTORY
ONE EFFECT OBSERVED != ONE REQUEST ATTEMPT

### 11. Exactly-once claims require a declared boundary

A valid exactly-once claim must specify what is counted:
- invocation;
- accepted request;
- committed local intent;
- provider-side operation;
- delivered message;
- completed external effect;
- durable business result.

Without that boundary, “exactly once” is underspecified.

EXACTLY-ONCE WITHOUT A COUNTING BOUNDARY = SEMANTICALLY INCOMPLETE

### 12. FutureObs_PAA

Even a provider contract that establishes exactly-once behavior for a bounded operation does not prove that no future observation can invalidate the broader claim.

EXACTLY-ONCE CONTRACT != FUTURE FINALITY
PROVIDER FINALITY != FUTUREOBS_PAA CLOSURE

## Research-only external identity boundary

A candidate external operation identity must bind:

- operation_id;
- operation semantic contract/version;
- provider/target identity;
- provider idempotency namespace;
- deduplication retention/window;
- authority epoch;
- source/worker incarnation;
- effect identity;
- request fingerprint/parameter binding;
- attempt sequence;
- receipt/ack semantics;
- reconciliation query semantics;
- compensation lineage;
- outbox event identity;
- relay incarnation;
- ordering relation;
- dependency/provenance closure;
- revocation/conflict state;
- reconstruction loss.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-088 does NOT close:

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

GLOBAL-AUDIT-089 — attack provider contract drift and external-world reconciliation:
idempotency semantic changes, provider failover/region migration, receipt versioning, dedup-state loss, provider-side rollback/compensation, stale provider reads, cross-provider identity mapping, external contract migration, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
