# GLOBAL-AUDIT-039 — CROSS-PROVIDER EVIDENCE COMPOSITION AND COMMON-MODE ATTACK — 2026-09-28

## Objective
Determine when observations from multiple providers can legitimately strengthen a reconciliation claim and when apparent agreement is common-mode confidence inflation.

## 1. Provider independence is claim-relative
Distinct provider names, hosts, processes, regions or vendors do not establish epistemic independence. A claim-specific independence analysis must identify shared authority, storage, network/proxy, identity issuer, configuration, model/runtime, resource/provider, clock and reconciliation dependencies.

## 2. Majority attack
Three providers can return the same incorrect status if they share one upstream source or replicated stale snapshot. A 2/3 or 3/3 vote therefore does not establish truth unless the failure model and independence assumptions justify it.

`VOTE_COUNT != INDEPENDENT_EVIDENCE_COUNT`.

## 3. Correlated freshness
Providers may expose different timestamps while sharing the same upstream revision. Apparent temporal diversity is not necessarily independent freshness. Provider revision/incarnation lineage must be retained.

## 4. Correlated authorization
Multiple observers may validate the same authority issuer. Agreement does not multiply evidence if all depend on one compromised/stale issuer.

## 5. Cross-provider contradiction
If P1 says ACCEPTED and P2 says REJECTED:
- if a trusted consistency contract orders them, reducer may resolve according to that contract;
- if they represent different snapshots/incarnations, preserve separate histories;
- if no authoritative relation exists, result remains UNKNOWN for claims requiring a unique external state.

## 6. Safe aggregation contract
For claim C, each observation must carry:
`SourceIdentity, SourceIncarnation, DependencySet, CommonModeDomains, FailureAssumptions, Freshness, ConsistencyMode, ClaimProperty`.

Aggregation can improve epistemic status only when the additional evidence contributes claim-relevant information under an explicit failure/independence contract and does not silently share an unresolved common-mode dependency.

## 7. Common-mode closure
If all providers depend on an unresolved common source S capable of producing the same wrong result, aggregation cannot promote UNKNOWN to TRUE_JUSTIFIED merely by provider count.

## 8. Byzantine-style caution
The audit does not assume a specific Byzantine consensus protocol for Nexo. The relevant result is narrower: if a claim depends on a failure threshold, the threshold and independence/fault assumptions must be explicit. Without them, majority is descriptive, not proof.

## 9. Evidence graph
Candidate graph:
`ProviderObservation -> DependencyNodes -> CommonModeDomains -> ClaimPredicate`.

The reducer must preserve the graph or a sound summary of it. Flattening to `N providers agree` loses failure-domain structure.

## 10. Conclusion
Cross-provider evidence is useful only when its dependency/failure structure is part of the claim contract. Provider diversity can be a resilience mechanism, but it is not automatically an epistemic proof of truth.

No formal proof/TLC/TLAPS/runtime fault injection.

Next: GLOBAL-AUDIT-040 — attack quorum/failure-threshold semantics and whether independence assumptions themselves require evidence/provenance.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
