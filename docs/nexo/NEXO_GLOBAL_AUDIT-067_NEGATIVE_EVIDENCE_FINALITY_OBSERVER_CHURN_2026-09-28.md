# NEXO GLOBAL AUDIT-067 — NEGATIVE-EVIDENCE FINALITY & OBSERVER-SET CHURN

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Audit: GLOBAL-AUDIT-067
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether a negative/absence certificate can remain closed when the population producing the negative evidence changes.

Dimensions:
1. observer join/leave/rejoin;
2. offline periods;
3. validator replacement/incarnation;
4. membership epochs;
5. partial observer failures;
6. quorum changes;
7. stale observers;
8. late observations;
9. population snapshots reconstructed after the fact;
10. whether an absence certificate can remain closed across population transitions.

## Evidence studied

TUF security guidance treats freshness as security state: clients must recognize when they may be unable to obtain updates, must not accept metadata older than previously seen, and must protect against rollback and indefinite freeze. This is directly relevant to an absence claim because "no newer observation arrived" is not equivalent to "no newer state exists." citeturn0search0

The TUF reference implementation/testing material also demonstrates that cached historical state remains relevant even after local metadata expiry: rollback checks can still use the expired local version. This supports treating historical observer state/freshness state as security-relevant state rather than disposable annotation. citeturn0search1

## Findings

### F067-01 — Observer membership is part of the meaning of an absence certificate

"All observers report no X" is not a complete claim unless the observer population is itself defined for the exact claim interval.

Therefore an absence certificate needs a population snapshot or equivalent authoritative membership evidence.

A current membership list cannot automatically be substituted for the historical population that existed during the observation interval.

### F067-02 — Join after observation cannot retroactively support earlier absence

If observer O joins after interval H, O has no observation authority for the earlier interval merely because O is currently a valid observer.

Thus:

  CURRENT-MEMBER(O) != MEMBER-DURING(H)

A certificate covering H cannot gain evidentiary weight from later membership.

### F067-03 — Leave before observation closure creates a boundary condition

If observer O leaves before the certificate's claimed finality point, then the system must know whether O's last admissible observation remains authoritative through the remainder of H.

Possible semantics include:
- explicit observation-validity interval ending at leave;
- durable signed observation with authority frozen to a prior membership epoch;
- replacement observer coverage;
- an authoritative membership/finality rule.

Without such semantics, the unobserved remainder remains UNKNOWN.

### F067-04 — Rejoin is a new-incarnation question

A rejoining observer must not automatically inherit the evidentiary continuity of its prior incarnation.

At minimum, the certificate must distinguish:
- stable observer identity;
- observer incarnation;
- membership epoch;
- credential/key epoch;
- observation interval.

This carries forward GLOBAL-AUDIT-057/058 and prevents stale state from being treated as fresh evidence.

### F067-05 — Offline is not equivalent to negative

An offline observer contributes no new observation while offline.

Therefore:

  OFFLINE != NO-X

If the claim requires population-complete observation during the offline interval, the certificate remains open unless another admissible mechanism covers that interval.

### F067-06 — Failure detectors do not automatically prove absence

A system may know that an observer is unreachable or failed, but failure detection does not by itself establish what state the observer held immediately before failure or what happened while it was unreachable.

Thus:

  UNREACHABLE != ABSENT

and

  FAILED-TO-REPORT != REPORTED-NO-X.

### F067-07 — Quorum membership and quorum semantics are separate claims

A quorum threshold is meaningful only relative to a defined membership configuration and an authority rule.

Changing the population from N to N' changes:
- the eligible observer set;
- possible quorum thresholds;
- intersection properties;
- coverage of historical observations.

Therefore a certificate cannot safely reuse a quorum count across membership epochs without an explicit transition rule.

### F067-08 — Old quorum evidence cannot silently satisfy a new population

Suppose epoch E1 has a valid negative quorum and membership later changes to E2.

The E1 certificate may remain valid for claims explicitly bounded to E1, but it does not automatically establish the E2 population's state.

This is the negative-evidence equivalent of historical authority-epoch binding.

### F067-09 — Replacement observer != continuity of replaced observer

If O1 is replaced by O2, O2 cannot automatically certify what O1 would have observed unless a separate authoritative state-transfer/reconstruction mechanism establishes that fact.

A replacement is a new evidence source, not a magical completion of the old source's missing interval.

### F067-10 — Late observations can invalidate closure

An observation received after certificate issuance can still be claim-relevant if its event-time falls inside the certificate's claimed interval and the authority semantics admit it.

Therefore receipt time cannot alone define finality.

This carries forward GLOBAL-AUDIT-049/050/066.

### F067-11 — Population churn can reopen a previously concrete absence

A certificate that was concrete under E1 can become non-current or UNKNOWN under E2 when:
- membership changes;
- a validator incarnation changes;
- required observer coverage disappears;
- a late event arrives;
- the authority/finality rule changes;
- the reconstruction boundary no longer proves complete coverage.

Historical certificate validity and current claim admissibility remain distinct.

### F067-12 — Stale observers are not independent observers

An observer that has not refreshed its authoritative state may report "no X" from an obsolete view.

Replication of that stale view across multiple observers does not create independent negative evidence.

This reinforces GLOBAL-AUDIT-047 and GLOBAL-AUDIT-066.

### F067-13 — Membership metadata is itself evidence-bearing

If the observer population is derived from a registry, roster, federation bundle, quorum configuration, or membership service, then that source becomes part of the certificate's dependency graph.

A stale or rolled-back membership registry can manufacture a false claim of population completeness.

TUF's documented freeze/rollback model is directly relevant: a client must recognize that it may be seeing an obsolete view rather than treating lack of newer metadata as proof of no newer state. citeturn0search0

### F067-14 — A closed negative certificate requires a stable finality boundary

For a certificate ABSENT(C,D,H), observer-set churn means closure requires more than "enough observers said no."

At minimum, the certificate must bind:
- population configuration/epoch;
- observer identities and incarnations;
- each observation interval;
- membership transitions relevant to H;
- quorum rule for that configuration;
- replacement/recovery semantics;
- late-event policy;
- freshness/anti-rollback state;
- authority/finality boundary.

If the system cannot prove that the observer population relevant to H was completely accounted for, closure remains UNKNOWN.

## Candidate state model — NOT FROZEN

For an observer O:

  Identity
  Incarnation
  MembershipEpoch
  AuthorityInterval
  ObservationInterval
  ObservationFreshness
  LastKnownState
  DependencyClosure

A population certificate would additionally bind:

  PopulationID
  PopulationEpoch
  MembershipEvidence
  RequiredCoverage
  QuorumRule
  ObserverEvidenceSet
  CommonModeClosure
  LateEventRule
  FinalityRule

These are research candidates only and are NOT protocol commitments.

## New distinctions

- CURRENT MEMBERSHIP != HISTORICAL MEMBERSHIP
- JOINED-LATER != OBSERVED-EARLIER
- OFFLINE != NO-X
- UNREACHABLE != ABSENT
- FAILED-TO-REPORT != REPORTED-NO-X
- REJOINED IDENTITY != SAME INCARNATION
- REPLACEMENT OBSERVER != HISTORICAL CONTINUITY
- QUORUM COUNT != QUORUM SEMANTICS
- E1 QUORUM != E2 POPULATION
- STALE OBSERVER != INDEPENDENT OBSERVER
- MEMBERSHIP ENUMERATION != MEMBERSHIP COMPLETENESS
- RECEIPT-TIME FINALITY != EVENT-TIME FINALITY
- HISTORICAL CERTIFICATE VALIDITY != CURRENT CLAIM ADMISSIBILITY

## Audit verdict

GLOBAL-AUDIT-067 does NOT close negative-evidence finality.

Observer-set churn introduces another independent semantic boundary: the population that is supposed to make absence meaningful must itself be historically and temporally bounded.

A negative certificate cannot remain globally closed merely because it reached a quorum at issuance time.

No general quorum/observer-churn algebra has been proven.

No implementation. No V21.

## Epistemic state

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
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next audit

GLOBAL-AUDIT-068 — Quorum transitions, intersection, and negative-evidence composition:
- quorum intersection across membership epochs;
- joint configurations;
- threshold changes;
- disjoint quorums;
- overlapping quorums with common-mode dependencies;
- stale quorum certificates;
- reconfiguration during observation;
- whether quorum intersection can ever establish absence rather than merely agreement;
- interaction with UNKNOWN/FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
