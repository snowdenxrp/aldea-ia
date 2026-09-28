# NEXO GLOBAL AUDIT-090 — External Contract Evidence and Migration Proofs

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-090 attacks evidence used to justify external-provider contracts and migrations: contract-version attestations, capability certificates, migration equivalence/refinement, dual-provider overlap, shadow reconciliation, provider-side event history, stale-read bounds, rollback after migration, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

Current Google Cloud Pub/Sub documentation makes the contract boundary unusually explicit: exactly-once delivery is supported only for pull subscriptions, is regional, uses Pub/Sub-defined message IDs, and has distinct semantics for redelivery, acknowledgement deadlines, ordered delivery, and publisher-side duplicates. citeturn0search5turn0search2

The same documentation states that multi-region subscribers can receive duplicates even when exactly-once is enabled, and that publisher-side duplicate publishes can produce multiple messages with different IDs. citeturn0search0turn0search5

## Findings

### 1. Contract attestations are bounded evidence

A signed/provider-issued contract attestation can authenticate who stated a capability and which version/scope was asserted. It does not automatically prove that the capability applied to every historical operation.

ATTESTED CAPABILITY != UNIVERSAL HISTORICAL CAPABILITY
SIGNATURE AUTHENTICITY != SEMANTIC APPLICABILITY

The attestation must bind effective interval, endpoint/region, operation type, subscription/delivery mode, version and applicable population.

### 2. Capability certificates require semantic scope

A certificate saying “exactly once” is incomplete unless its counting boundary is explicit: delivery, acknowledgement, processing, publication, or external business effect.

CAPABILITY LABEL != CAPABILITY SEMANTICS

Pub/Sub demonstrates why: its exactly-once feature concerns delivery/acknowledgement semantics under defined subscription and regional conditions, while publisher-side duplicates can still create multiple messages. citeturn0search5

### 3. Migration equivalence is observer-relative

Provider A and Provider B can both expose a successful “send” while differing in retry, deduplication, ordering, receipt, timeout and rollback semantics.

SAME BUSINESS OPERATION != SAME PROVIDER SEMANTICS
API MAPPING != SEMANTIC REFINEMENT

A migration proof must define the observer and the exact claim contract being preserved.

### 4. Dual-provider overlap is not automatic independence

Running A and B simultaneously can expose divergence, but both may share upstream data, credentials, network paths, business inputs, or common transformation logic.

DUAL PROVIDERS != INDEPENDENT EVIDENCE
DIVERGENCE DETECTED != ROOT CAUSE PROVEN
AGREEMENT != SEMANTIC EQUIVALENCE

Overlap can increase observability without proving independent truth.

### 5. Shadow reconciliation has an observation boundary

A shadow system may compare outputs without executing the external effect. That makes it useful for detecting behavioral differences, but it cannot prove that the unexecuted path would have produced the same external effect.

SHADOW OUTPUT != EXECUTED EFFECT
SHADOW AGREEMENT != EXTERNAL-EFFECT EQUIVALENCE

If shadow mode changes timing, retries, load or provider routing, its observations may not be transportable to production semantics without a refinement argument.

### 6. Provider-side history can be bounded

Provider event history may establish a stronger historical boundary than current-state reads, but only within the provider's retention and completeness contract.

PROVIDER EVENT LOG != COMPLETE WORLD HISTORY
RETAINED PROVIDER HISTORY != COMPLETE HISTORICAL HISTORY

If old records are unavailable, the missing interval remains a reconstruction dependency.

### 7. Stale-read bounds are claim-relevant

A read that is known to be at most Δ stale can bound uncertainty only if the target claim's temporal semantics tolerate that bound.

STALE-READ BOUND != CURRENT TRUTH
BOUNDED STALENESS != HISTORICAL COMPLETENESS

The bound itself must be authenticated and tied to the provider contract/version.

### 8. Rollback after migration

If B becomes current and later rolls back, the rollback does not erase operations accepted by A before migration or B during the overlap.

ROLLBACK != ERASURE
CURRENT PROVIDER STATE != COMPLETE MIGRATION HISTORY

Historical provider transitions must remain separate from current projection.

### 9. Contract attestation revocation

If a provider revokes or changes a capability certificate, claims depending on it must be selectively re-evaluated. Historical decisions are not erased.

CERTIFICATE REVOCATION != HISTORICAL ERASURE
CAPABILITY LOSS != UNIVERSAL CLAIM INVALIDATION

The affected dependency closure must be established before propagation.

### 10. Cross-provider agreement

Agreement between A and B can be evidence that their observed outputs matched for a bounded query. It cannot by itself prove that both observed the same complete world state or that their underlying evidence was independent.

AGREEMENT != COMPLETENESS
AGREEMENT != INDEPENDENCE
AGREEMENT != FUTURE FINALITY

### 11. Migration proof reuse

A proof established for one operation class, provider region, receipt version or time interval cannot automatically be reused for another.

PROOF FOR C1 != PROOF FOR C2
VERSION PROOF != UNIVERSAL MIGRATION PROOF

Proof reuse requires an explicit refinement/equivalence relation whose observer contract is preserved.

### 12. FutureObs_PAA

Even if contract versions, migration mappings, dual-provider observations, event history and stale-read bounds are all reconstructed for a bounded interval, future provider observations may still reveal information outside that boundary.

MIGRATION PROOF != FUTURE FINALITY
RECONCILIATION CLOSURE != FUTUREOBS_PAA CLOSURE

## Research-only migration evidence boundary

Candidate migration evidence must bind:

- predecessor and successor provider identities;
- contract versions;
- effective intervals;
- endpoint/region;
- operation semantic contract;
- idempotency namespace and dedup epoch;
- receipt schema/semantic version;
- ordering and consistency guarantees;
- request/response mapping;
- timeout/failure semantics;
- rollback/compensation semantics;
- operation identity mapping;
- dual-write/dual-provider overlap;
- shadow-observation mode;
- reconciliation query semantics;
- provider-side history/retention;
- stale-read bounds;
- authority epoch and source incarnation;
- provenance/dependency closure;
- common-mode dependencies;
- loss/reconstruction state;
- revocation/conflict status.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-090 does NOT close:

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

GLOBAL-AUDIT-091 — attack external migration under concurrent execution:
dual-write races, cutover boundaries, in-flight retries, late acknowledgements, operation identity collisions, provider A/B disagreement, partial rollback, compensation ordering, shadow-to-live promotion, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
