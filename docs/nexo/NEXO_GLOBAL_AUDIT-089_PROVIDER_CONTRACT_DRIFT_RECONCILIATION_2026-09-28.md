# NEXO GLOBAL AUDIT-089 — Provider Contract Drift and External-World Reconciliation

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-089 attacks external contract drift: provider semantic changes, failover/region migration, receipt versioning, dedup-state loss, provider rollback/compensation, stale reads, cross-provider identity mapping, external contract migration, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

Google Pub/Sub's current exactly-once documentation explicitly scopes the guarantee to pull subscriptions and a single cloud region. It also notes that publisher-side duplicate publishes can still produce multiple messages, including messages with different IDs. Multi-region subscriber deployments can therefore fall outside the stated exactly-once boundary. citeturn0search1turn0search7

AWS's transactional-outbox guidance states that duplicate messages remain possible, consumers should be idempotent, and notification order matters for event-sourcing. Its example separates the committed local outbox transaction from downstream SQS processing. citeturn0search2turn0search3

Pub/Sub's documentation further exposes a concrete contract-drift boundary: exactly-once delivery depends on acknowledgment state, acknowledgment deadlines, subscription type, region and client behavior; its monitoring metric can indicate events that may lead to redelivery when the persistence layer for exactly-once state is unavailable. citeturn0search1

## Findings

### 1. Provider contract drift is semantic evidence

A provider can preserve an API shape while changing retention, deduplication, receipt semantics, ordering, regional scope, or retry behavior.

API compatibility != semantic contract compatibility
SAME API != SAME EXTERNAL SEMANTICS

Nexo cannot treat a provider version/endpoint as interchangeable merely because requests still parse.

### 2. Failover and region migration

A guarantee scoped to one region cannot silently be promoted to a global guarantee after failover.

REGIONAL GUARANTEE != GLOBAL GUARANTEE
FAILOVER != SEMANTIC CONTINUITY

Pub/Sub explicitly limits exactly-once delivery to subscribers operating within a cloud region and warns that multi-region subscriber deployment can produce duplicates. citeturn0search1

A region transition therefore becomes part of the external-effect contract and evidence dependency.

### 3. Receipt versioning

A receipt format can remain syntactically compatible while changing the meaning of completion, acknowledgement, settlement or expiration.

RECEIPT SCHEMA COMPATIBILITY != RECEIPT SEMANTIC EQUIVALENCE

Historical receipts must remain bound to their provider contract/version and interpretation rules.

### 4. Dedup-state loss

If a provider loses or resets deduplication state, retrying an old operation may no longer have the same semantics as retrying while the original dedup record existed.

DEDUP STATE LOSS != OPERATION ABSENCE
DEDUP RESET != HISTORICAL NON-EXECUTION

The system must represent the provider's deduplication epoch/window rather than assuming permanent key identity.

### 5. Provider rollback

A provider-side rollback can change current visible state without erasing the historical fact that an earlier operation was accepted or executed.

PROVIDER ROLLBACK != HISTORY ERASURE
CURRENT PROVIDER STATE != COMPLETE EFFECT HISTORY

A later compensation or rollback must be represented as its own event.

### 6. Stale provider reads

A provider read can be authentic yet stale relative to the provider's current state.

AUTHENTIC READ != CURRENT READ
CURRENT READ != COMPLETE HISTORY

If Nexo uses a read to reconcile an external effect, the read's freshness/version/consistency contract becomes part of the evidence.

### 7. Cross-provider identity mapping

The same business object can have different provider identifiers, lifecycle semantics and consistency guarantees.

IDENTIFIER EQUALITY != OBJECT IDENTITY
CROSS-PROVIDER ID MAPPING != PROVEN SEMANTIC CONTINUITY

A mapping requires explicit authority, scope, incarnation and migration semantics.

### 8. External contract migration

Migrating from provider A to provider B can preserve a business-level intent while changing:
- operation identity;
- deduplication;
- receipt semantics;
- ordering;
- failure modes;
- compensation;
- retention;
- observation completeness.

BUSINESS INTENT EQUALITY != PROVIDER OPERATION EQUIVALENCE

Migration therefore needs an explicit semantic mapping, not a field-by-field adapter assumption.

### 9. Provider capability downgrade

If a provider loses exactly-once or stronger receipt guarantees, current claims depending on those guarantees may need re-evaluation.

CAPABILITY LOSS != AUTOMATIC GLOBAL INVALIDATION

Only claims whose admissibility actually depends on the lost capability should be affected; unrelated historical decisions remain historical.

### 10. Provider capability upgrade

An upgrade to a stronger provider contract does not retroactively prove that historical operations enjoyed the new guarantee.

NEW GUARANTEE != HISTORICAL GUARANTEE

A capability becomes claim-relevant only for operations within its effective contract interval.

### 11. Contract conflict during migration

During migration, both provider contracts can be valid for different operation intervals.

TWO VALID CONTRACTS != ONE UNIVERSAL CONTRACT

A deterministic resolver must not erase the temporal boundary between them.

### 12. Reconciliation across changed contracts

A current provider state may be reconciled successfully while the historical evidence needed to distinguish duplicate, retry, compensation and rollback paths has already been discarded.

CURRENT RECONCILIATION != HISTORICAL PATH COMPLETENESS

Therefore reconciliation success cannot automatically close historical UNKNOWN.

### 13. FutureObs_PAA

Even if provider contracts, migrations, receipts and dedup epochs are completely reconstructed over a bounded interval, the result does not prove that future provider observations cannot distinguish the claim.

CONTRACT CLOSURE != FUTURE FINALITY
PROVIDER RECONCILIATION != FUTUREOBS_PAA CLOSURE

## Research-only external contract boundary

A candidate external contract record must bind:

- provider identity;
- endpoint/region;
- contract version;
- operation semantics;
- idempotency namespace;
- deduplication epoch/window;
- receipt schema and semantic version;
- ordering guarantee;
- consistency/freshness guarantee;
- failure/timeout semantics;
- rollback/compensation semantics;
- operation identity mapping;
- migration predecessor/successor;
- effective interval;
- authority/source incarnation;
- provenance/dependency closure;
- reconstruction loss;
- conflict/revocation state.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-089 does NOT close:

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

GLOBAL-AUDIT-090 — attack external contract evidence and migration proofs:
contract version attestations, provider capability certificates, migration equivalence/refinement, dual-write/dual-provider overlap, shadow reconciliation, provider-side event history, stale-read bounds, rollback after migration, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
