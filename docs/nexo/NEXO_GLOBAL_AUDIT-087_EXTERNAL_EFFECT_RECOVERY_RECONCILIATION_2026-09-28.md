# NEXO GLOBAL AUDIT-087 — External-Effect Recovery, Outbox, Idempotency and Reconciliation

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-087 attacks external-effect recovery and reconciliation: transactional outbox, effect-before-commit and commit-before-effect windows, idempotent replay, compensation versus rollback, operation identity across epochs, crash-induced duplicate/omitted effects, stale authority during recovery, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

AWS Prescriptive Guidance describes transactional outbox as a solution to the dual-write problem: business state and an outbox record are committed in one local transaction, after which a relay publishes the event. It explicitly warns that duplicate delivery can occur and recommends idempotent consumers. It also distinguishes rollback of the local transaction from downstream delivery. citeturn0search0turn0search10

Debezium's current Outbox Event Router captures changes from an outbox table and transforms them into messages. Its documentation presents the outbox as a mechanism to keep persisted service state consistent with published events; the concrete implementation still has a relay/CDC boundary between the committed database transaction and downstream consumption. citeturn0search1turn0search5

The transactional-outbox pattern documentation explicitly identifies the crash window after publishing but before recording publication, which can produce duplicate messages; consumers therefore need idempotency. It also distinguishes ordering of the local transactions from downstream delivery guarantees. citeturn0search3

## Findings

### 1. Effect-before-commit

If an external effect happens before the authoritative internal commit, a crash can leave the effect externally visible while the internal system later concludes that the operation never committed.

EFFECT-BEFORE-COMMIT != COMMITTED INTENT
EXTERNAL EFFECT != INTERNAL COMMIT PROOF

Recovery therefore needs reconciliation rather than simply replaying or erasing the internal operation.

### 2. Commit-before-effect

If internal state commits first and the process crashes before the external effect, the internal record can legitimately exist without the external world reflecting it.

COMMIT-BEFORE-EFFECT != EXTERNAL EFFECT OCCURRENCE
COMMITTED OUTBOX != DELIVERED EFFECT

Transactional outbox reduces this gap by durably recording the intended event with the local transaction, but it does not make arbitrary external systems atomic with the database. citeturn0search0turn0search3

### 3. Relay crash and duplicate effect

A relay may publish an effect and crash before recording that it published it. On restart, it may publish again.

PUBLISHED-THEN-CRASH != UNPUBLISHED
RETRY != FIRST EXECUTION

The external effect contract must therefore define whether the effect itself is idempotent, deduplicated by operation identity, or safely compensatable. AWS and microservices.io explicitly identify duplicate delivery as a normal outbox concern. citeturn0search0turn0search3

### 4. Operation identity across epochs

An operation_id must not silently mean the same operation across different authority/source incarnations.

SAME OPERATION_ID != SAME HISTORICAL OPERATION

A safe identity boundary must account for at least authority epoch, source incarnation, target/effect identity and semantic operation contract.

Otherwise a restored or stale worker can accidentally replay an old operation against a new authority epoch.

### 5. Idempotency is scoped

Idempotency means repeated application of the same operation under a defined identity/contract produces the defined same externally relevant result. It does not prove that the operation occurred exactly once historically.

IDEMPOTENT != EXACTLY-ONCE HISTORY
DEDUPLICATED != PROVEN SINGLE OCCURRENCE

### 6. Compensation is not rollback

Once an external effect occurs, a later compensating action may produce a desired current state without erasing the fact that the original effect occurred.

COMPENSATION != ROLLBACK OF HISTORY
CURRENT STATE RESTORATION != HISTORICAL ERASURE

For Nexo, compensation must be represented as a new event with its own authority, scope and provenance.

### 7. Reconciliation is not inference

A reconciler comparing internal and external state can discover divergence. It cannot automatically infer which side represents the historical truth when both sides permit multiple explanations.

DIVERGENCE DETECTED != ROOT CAUSE PROVEN
MATCHED CURRENT STATE != HISTORICAL PATH PROVEN

Unresolved causal alternatives must remain UNKNOWN.

### 8. External confirmation

A provider's acknowledgement can prove a bounded external observation, but not necessarily the complete history of retries, intermediate attempts, or duplicate effects unless its contract provides that coverage.

ACKNOWLEDGEMENT != COMPLETE EFFECT HISTORY
CURRENT PROVIDER STATE != COMPLETE OPERATION HISTORY

### 9. Stale authority during recovery

A relay restored from an older snapshot can hold a valid old authorization while the current authority has moved to a newer epoch.

OLD VALID AUTHORITY != CURRENT AUTHORITY

Before replaying an external effect, the worker must bind operation identity and authorization to the current epoch/incarnation under an explicit recovery contract.

### 10. Outbox ordering

Outbox ordering can preserve the order of committed local events, but downstream effect order may still require consumer/provider-specific guarantees.

LOCAL COMMIT ORDER != UNIVERSAL EXTERNAL ORDER

AWS explicitly recommends preserving notification order for event-sourcing scenarios, while acknowledging delivery/consumer concerns. citeturn0search0

### 11. Effect failure and compensation

A failed effect can mean:
- definitely not executed;
- possibly executed;
- definitely executed but response lost.

These are semantically different states.

FAILURE RESPONSE != EFFECT ABSENCE
TIMEOUT != NOT EXECUTED
RETRYABLE ERROR != PROVEN SAFE RETRY

The recovery reducer must preserve UNKNOWN where the provider cannot distinguish them.

### 12. Reconciliation after provider-side partial failure

A provider can accept an operation and fail before returning its acknowledgement. Retrying can then duplicate a non-idempotent effect.

PROVIDER ACCEPTED + ACK LOST != PROVIDER REJECTED

The only safe reduction requires an external operation identity or provider query/receipt semantics strong enough to close that boundary.

### 13. FutureObs_PAA

Even a perfectly reconciled external-effect history is bounded by the provider's observation contract and retained history.

RECONCILIATION CLOSURE != EXTERNAL WORLD COMPLETENESS
EFFECT HISTORY CLOSURE != FUTURE FINALITY
EXTERNAL CONFIRMATION != FUTUREOBS_PAA CLOSURE

## Research-only external-effect boundary

A candidate external-effect record should bind:

- operation_id;
- operation semantic contract/version;
- authority epoch;
- source/worker incarnation;
- target/provider identity;
- effect identity;
- intent state;
- commit state;
- delivery attempts;
- provider acknowledgement/receipt;
- provider operation identity where available;
- idempotency/deduplication scope;
- compensation events;
- reconciliation observations;
- ordering relation;
- timeout/error classification;
- retry history;
- provenance/dependency closure;
- stale-authority/fencing status;
- reconstruction loss;
- revocation/conflict status.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-087 does NOT close:

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

GLOBAL-AUDIT-088 — attack external-effect identity and exactly-once claims:
provider idempotency semantics, deduplication windows, operation identity reuse, retries across epochs, ambiguous timeouts, receipt/reconciliation contracts, compensation races, outbox relay failover, ordering under concurrent writers, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
