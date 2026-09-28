# NEXO GLOBAL AUDIT-070 — POPULATION COMPLETENESS & OBSERVER-DOMAIN CLOSURE

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Audit: GLOBAL-AUDIT-070
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether a negative certificate can establish that the relevant observer/subject population is complete for the claim interval and domain.

Dimensions:
1. authoritative population enumeration;
2. dynamic membership creation/deletion;
3. hidden/offline members;
4. observer coverage versus subject coverage;
5. domain partitioning;
6. nested/federated populations;
7. historical population snapshots and reconstruction;
8. adversarial omission of members;
9. independent evidence of completeness;
10. interaction with quorum certificates and FutureObs_PAA.

## Evidence studied

Secure group-membership research treats membership as a distributed state that processes must consistently observe; membership is not merely a static list. citeturn0search4turn0search5

Kubernetes provides a concrete production example of the same semantic problem. Its list/watch design binds collection state to resource versions, supports consistent list snapshots and ordered follow-up watches, and requires clients to recover when historical versions are unavailable. Its documentation explicitly distinguishes current/consistent reads from potentially stale reads and warns that some watch modes may start from arbitrarily stale data. citeturn0search0turn0search1

Kubernetes also guarantees that paginated list continuation represents the same initial snapshot, while an expired continuation token can force a restart; this demonstrates that population enumeration and historical reconstruction require explicit snapshot/version semantics rather than assuming a sequence of ordinary reads forms one complete population. citeturn0search1turn0search2

These are research analogies and implementation evidence, not Nexo protocol commitments.

## Findings

### F070-01 — Enumeration is not completeness

A registry can enumerate every member it knows about while still failing to prove that no unregistered member exists.

Therefore:

  ENUMERATED MEMBERS != COMPLETE POPULATION

A negative certificate needs an authority that defines what makes the population complete for the claim.

### F070-02 — Population completeness is claim-relative

The complete population for one claim may differ from another by:
- time;
- geography;
- tenant/domain;
- role;
- authority epoch;
- object type;
- incarnation;
- observation capability.

Therefore a global `population_complete=true` primitive would be semantically unsafe without claim scope.

### F070-03 — Observer population and subject population are different domains

Knowing all observers does not establish that all subjects/events they are supposed to observe are enumerated.

Thus:

  COMPLETE OBSERVER SET != COMPLETE SUBJECT DOMAIN

This is a critical separation for absence claims.

### F070-04 — A complete subject registry does not prove observation completeness

Even if every subject is enumerated, observers may have been offline, partitioned, stale, or unable to observe a relevant interval.

Therefore:

  COMPLETE SUBJECT ENUMERATION != COMPLETE OBSERVATION

### F070-05 — Dynamic creation creates a temporal completeness boundary

If a subject can be created during H, then a snapshot taken before creation cannot establish absence throughout H unless the authority provides a rule that covers the creation interval.

Likewise, deletion does not erase the historical existence of a subject/event.

Thus historical population membership must be bound to event/observation time, not merely current membership.

### F070-06 — Hidden/unregistered members remain UNKNOWN unless the domain authority excludes them

An observer can truthfully report "none of the members I know contain X" while an unknown member contains X.

The correct state is UNKNOWN unless the claim's authority contract proves that unknown members cannot exist within scope.

### F070-07 — Offline membership is not membership absence

A member that is offline may remain a valid member of the population.

Therefore:

  OFFLINE MEMBER != NON-MEMBER

and

  NO REPORT FROM MEMBER != NEGATIVE REPORT

### F070-08 — Membership deletion and evidence deletion are distinct

Deleting a member from the current registry does not erase observations or events attributable to that member during its historical membership interval.

Historical reconstruction therefore needs membership epochs/incarnations, not only current registry state.

### F070-09 — Snapshot consistency matters for population closure

A sequence of reads can observe different population states and accidentally synthesize a population that never existed.

Kubernetes explicitly addresses this by binding paginated collection results to a consistent snapshot/resource version and by using list/watch version semantics. citeturn0search0turn0search1

Therefore:

  MULTIPLE READS != ONE HISTORICAL SNAPSHOT

unless the underlying authority provides that guarantee.

### F070-10 — Freshness is necessary but not sufficient

A current membership snapshot may be fresh yet incomplete in semantic scope.

Conversely, an old snapshot may be complete for a historical interval but invalid for a current claim.

Therefore freshness and completeness are separate evidence dimensions.

  FRESHNESS != COMPLETENESS

### F070-11 — Version continuity does not prove semantic completeness

A monotonically increasing membership/resource version can prove ordering/freshness properties, but it does not automatically prove that every possible member source is represented.

The version authority itself becomes part of the completeness dependency graph.

### F070-12 — Nested/federated populations require closure at every boundary

If population P is composed from sub-populations P1...Pn, proving completeness requires both:
- completeness of the federation membership P1...Pn;
- completeness of each relevant Pi.

Thus:

  COMPLETE SUBPOPULATIONS != COMPLETE FEDERATION

unless the federation relation itself is complete.

### F070-13 — Domain partitioning creates an omission attack surface

If observers cover partitions D1...Dn, the union covers D only if the partition relation proves:
- no gaps;
- no unintended overlap semantics;
- no hidden partition;
- stable partition definition for H.

Therefore:

  UNION OF COVERED PARTITIONS != COMPLETE DOMAIN

without a partition-coverage proof.

### F070-14 — Overlap does not repair an omitted partition

Multiple observers may redundantly cover D1 while D2 remains completely unobserved.

Increasing quorum size inside D1 does not compensate for zero coverage of D2.

Thus:

  MORE EVIDENCE IN ONE REGION != GLOBAL COVERAGE

### F070-15 — Adversarial omission can target the registry itself

If an attacker can suppress a member from the authoritative population enumeration, every downstream quorum may remain internally consistent while excluding the compromised member.

Therefore membership enumeration must itself have authority, provenance, freshness, rollback protection, and conflict semantics.

This carries forward GLOBAL-AUDIT-069's dependency-closure result.

### F070-16 — Independent completeness evidence is stronger than self-attestation

If the same source both defines the population and certifies that its population is complete, the completeness claim has a common-mode dependency.

This does not automatically make it invalid, but its trust boundary must be explicit.

Candidate distinction:

  POPULATION AUTHORITY != INDEPENDENT COMPLETENESS PROOF

### F070-17 — Negative certificates cannot bootstrap population completeness

A quorum over the currently enumerated population cannot itself prove that the enumeration is complete if completeness is one of the facts needed to interpret the quorum.

That would be circular:

  completeness -> quorum meaning -> completeness

The reducer must detect and preserve this dependency cycle rather than treating the quorum as independent evidence of its own population completeness.

### F070-18 — Historical completeness and current completeness are distinct

A population can be complete for H while the current population has changed.

Likewise, a current complete registry cannot automatically reconstruct historical membership unless retention/version semantics preserve it.

Thus:

  CURRENT COMPLETENESS != HISTORICAL COMPLETENESS

### F070-19 — Reconstruction failure reopens completeness

If historical membership snapshots have been compacted, deleted, or cannot be reconstructed with sufficient provenance, then the system cannot silently infer the missing population state.

The claim becomes UNKNOWN for any conclusion that depends on that missing interval.

Kubernetes' explicit handling of expired resource versions and required relisting/recovery is a concrete implementation example of this boundary. citeturn0search0turn0search1

### F070-20 — FutureObs_PAA is downstream of population closure, not a substitute for it

Even after proving population completeness for H, the system still needs a finality rule preventing later admissible observations/events from changing the claim.

Therefore:

  POPULATION COMPLETENESS != FUTUREOBS_PAA CLOSURE

Conversely, FutureObs closure cannot repair an unknown historical population.

### F070-21 — A completeness claim needs explicit scope and authority

A research candidate completeness statement would need at least:
- claim scope;
- population identity/type;
- historical interval;
- membership authority;
- membership epoch/version;
- enumeration method;
- inclusion/exclusion rules;
- hidden-member semantics;
- creation/deletion semantics;
- federation/partition relation;
- freshness/anti-rollback state;
- provenance;
- reconstruction contract;
- conflict/revocation state.

This is a research candidate only and is NOT a frozen Nexo schema.

### F070-22 — The central unresolved boundary survives

The research still cannot prove a generic bridge from:

  COMPLETE-ENOUGH-REGISTRY

into:

  COMPLETE-ENOUGH-OBSERVATION-DOMAIN

without an independently specified authority contract.

Therefore the global absence problem remains OPEN.

## New distinctions

- ENUMERATED MEMBERS != COMPLETE POPULATION
- COMPLETE OBSERVER SET != COMPLETE SUBJECT DOMAIN
- COMPLETE SUBJECT ENUMERATION != COMPLETE OBSERVATION
- OFFLINE MEMBER != NON-MEMBER
- NO REPORT != NEGATIVE REPORT
- MULTIPLE READS != ONE HISTORICAL SNAPSHOT
- FRESHNESS != COMPLETENESS
- COMPLETE SUBPOPULATIONS != COMPLETE FEDERATION
- UNION OF COVERED PARTITIONS != COMPLETE DOMAIN
- MORE EVIDENCE IN ONE REGION != GLOBAL COVERAGE
- POPULATION AUTHORITY != INDEPENDENT COMPLETENESS PROOF
- CURRENT COMPLETENESS != HISTORICAL COMPLETENESS
- POPULATION COMPLETENESS != FUTUREOBS_PAA CLOSURE
- MEMBERSHIP DELETION != HISTORICAL EVIDENCE DELETION
- VERSION CONTINUITY != SEMANTIC COMPLETENESS
- QUORUM OVER KNOWN MEMBERS != PROOF THAT UNKNOWN MEMBERS DO NOT EXIST

## Audit verdict

GLOBAL-AUDIT-070 does NOT close negative-evidence finality.

It establishes population completeness as an independent evidence boundary. A complete-looking registry, fresh snapshot, quorum, or set of observers cannot be promoted into a proof of global population completeness without an explicit authority/coverage contract.

The critical chain remains:

  POPULATION COMPLETENESS
      !=
  OBSERVATION COMPLETENESS
      !=
  QUORUM AGREEMENT
      !=
  FUTURE OBSERVATION FINALITY

All four must remain semantically distinct.

No general population-completeness-to-absence theorem has been proven.
No implementation.
No V21.
Semantic freeze NOT DECLARED.
Preserve UNKNOWN.

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

GLOBAL-AUDIT-071 — Population completeness under adversarial authority and reconstruction:
- who is allowed to declare a population complete;
- multiple competing registries;
- conflicting membership histories;
- registry equivocation/forking;
- rollback and stale population snapshots;
- independent cross-checks versus circular completeness evidence;
- deletion/tombstone semantics;
- historical reconstruction after compaction;
- whether completeness can ever be proven without making the population authority part of the TCB;
- interaction with FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
