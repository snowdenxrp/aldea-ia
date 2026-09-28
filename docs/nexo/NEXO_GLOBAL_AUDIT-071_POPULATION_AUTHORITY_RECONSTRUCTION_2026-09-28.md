# NEXO GLOBAL AUDIT-071 — POPULATION COMPLETENESS UNDER AUTHORITY AND RECONSTRUCTION

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether a negative claim can establish a complete population when membership is dynamic, historical state can be compacted, authority can fork or omit members, and reconstruction can be incomplete.

## External evidence studied

Kubernetes API semantics provide a concrete example of snapshot-bounded enumeration: paginated continuation preserves the initial resourceVersion; if the continuation state expires, a restart can produce a different snapshot rather than silently preserving the original enumeration. citeturn0search1turn0search5

etcd maintains a logical revision history, but compaction deliberately makes old revisions inaccessible. A historical query that has been compacted therefore cannot be reconstructed merely because the current state is available. citeturn0search4turn0search6turn0search13

Cassandra illustrates another boundary: membership and liveness are distributed, gossip state is versioned, and UP/DOWN decisions are local. Cassandra also deliberately retains failed nodes in gossip until explicit removal/replacement semantics, showing that failure/liveness and population membership are distinct concepts. citeturn0search0turn0search2

These systems are evidence about real design tradeoffs, not proposed Nexo implementations.

## Findings

### F071-01 — Enumeration requires an authority boundary

A list of members is evidence only relative to an authority that defines what counts as a member and what revision/epoch the enumeration represents.

Therefore:

  MEMBER LIST != POPULATION TRUTH

without authority, scope, epoch and freshness semantics.

### F071-02 — Current completeness does not imply historical completeness

A current authoritative registry may enumerate today's members while being unable to prove who belonged to the population during an earlier observation interval.

Thus:

  CURRENT COMPLETE LIST != HISTORICALLY COMPLETE LIST

Historical claims require historical membership evidence.

### F071-03 — Population authority becomes an evidence dependency

If the negative reducer trusts a population registry to establish completeness, that registry is part of the dependency graph for the negative claim.

Consequently:

  POPULATION COMPLETENESS -> DEPENDS ON POPULATION AUTHORITY

If the authority's own completeness cannot be independently established, the claim cannot silently inherit completeness from it.

### F071-04 — A root-of-trust can be necessary without being sufficient

Making population authority part of the trusted base may make the model explicit, but it does not prove that the authority's registry was complete for every historical interval.

Therefore:

  AUTHORITY IN TCB != COMPLETE HISTORICAL POPULATION

### F071-05 — Dynamic joins create negative-evidence boundaries

If member M can join at time t, an absence certificate over H must establish whether M was in scope before, during, or after t.

A snapshot taken after t cannot retroactively prove that M was absent from the population before t.

### F071-06 — Deletion/tombstone semantics matter

A missing member record can mean deletion, never existed, expired, compaction, failed reconstruction, or incomplete enumeration.

Therefore:

  NOT PRESENT IN REGISTRY != PROVEN NON-MEMBER

unless deletion/non-membership semantics are explicitly evidenced.

### F071-07 — Offline and removed are distinct states

Cassandra's membership/liveness model illustrates that failure detection and membership removal are separate concerns. citeturn0search0

For Nexo:

  OFFLINE != REMOVED
  DOWN != NON-MEMBER
  UNREACHABLE != NON-EXISTENT

### F071-08 — Snapshot consistency is necessary but not sufficient

A consistent snapshot prevents the enumeration from mixing incompatible revisions, but it does not prove that the snapshot's population domain is complete.

Kubernetes' resourceVersion/continue semantics demonstrate the value of snapshot identity; they do not turn snapshot consistency into population completeness. citeturn0search1turn0search5

Thus:

  SNAPSHOT CONSISTENCY != POPULATION COMPLETENESS

### F071-09 — Expired reconstruction state must produce UNKNOWN, not a new claim

Kubernetes can reject an expired continuation with resource-expired behavior rather than pretending that a restarted enumeration is the same snapshot. citeturn0search5

This supports a Nexo semantic rule candidate:

  LOST HISTORICAL ENUMERATION -> RECONSTRUCTION UNKNOWN

not:

  LOST HISTORICAL ENUMERATION -> CURRENT LIST SUBSTITUTE

### F071-10 — Compaction creates an explicit historical evidence boundary

etcd's compaction removes access to revisions before the compaction point. citeturn0search4turn0search6

Therefore a later state cannot necessarily reconstruct the exact prior population.

  CURRENT STATE + COMPACTION != HISTORICAL PROOF

### F071-11 — A reconstructed population needs provenance

A historical population reconstructed from snapshots, events, tombstones and checkpoints must preserve the exact evidence used and the intervals it covers.

Without provenance, a reconstructed set cannot distinguish:
- observed absence;
- inferred absence;
- unavailable history;
- overwritten state;
- unresolved fork.

### F071-12 — Membership history can fork

If two authoritative-looking histories disagree about whether member M existed or was active during H, signature validity alone does not select the correct history.

The resolver needs an explicit authority/finality relation.

Until that relation is established:

  CONFLICTING MEMBERSHIP HISTORIES = UNKNOWN

### F071-13 — Rollback can make a complete-looking registry stale

A registry may be internally complete relative to an older revision while missing members created later. Anti-rollback therefore matters for population evidence, not merely for configuration updates.

  COMPLETE-AT-E1 != COMPLETE-AT-E2

### F071-14 — Omission attacks target the registry, not the observers

An adversary need not compromise every observer if it can cause the population authority to omit the subject from the domain being observed.

Then every observer can truthfully report NO-X for the enumerated domain while the global claim is false.

Thus:

  PERFECT OBSERVERS + INCOMPLETE DOMAIN = INCOMPLETE NEGATIVE CLAIM

### F071-15 — Observer coverage and subject coverage are different

A population of ten observers may cover only a subset of the subjects/events relevant to a claim.

Therefore:

  OBSERVER COMPLETENESS != SUBJECT/DOMAIN COMPLETENESS

The coverage relation itself must be evidenced.

### F071-16 — Nested/federated populations require composition semantics

If population P is composed from regions P1...Pn, completeness of every known Pi does not prove completeness of P unless the composition rule establishes that no population segment exists outside the federation.

Thus:

  COMPLETE SUBPOPULATIONS != COMPLETE GLOBAL POPULATION

without a federation-boundary proof.

### F071-17 — Population authority can be a single common-mode dependency

If quorum observers and the population registry ultimately depend on one common authority, observer signatures cannot independently validate the registry's completeness.

This carries forward the common-mode result from GLOBAL-AUDIT-069.

### F071-18 — Historical absence needs both membership and observation histories

For a negative claim over H, two independent questions exist:

A. Which subjects were in scope during H?
B. What did the observers establish about those subjects during H?

Neither history can be inferred from the other.

  MEMBERSHIP HISTORY != OBSERVATION HISTORY

### F071-19 — Retention is part of population completeness

If historical membership evidence is discarded, the system may retain current completeness while losing historical completeness.

etcd's explicit compaction boundary is a concrete example. citeturn0search4turn0search13

Therefore:

  RETENTION FAILURE -> POSSIBLE POPULATION UNKNOWN

not automatic absence.

### F071-20 — Population completeness cannot yet close FutureObs_PAA

Even a proven-complete population at E1 does not establish that no new member/event becomes admissible after the final observation boundary.

Therefore:

  POPULATION COMPLETENESS != FUTUREOBS_PAA CLOSURE

The two boundaries remain separate.

## Candidate population-completeness contract — NOT FROZEN

Research candidate only:

  PopulationEvidence =
    PopulationScope
    PopulationAuthority
    AuthorityEpoch
    MembershipRevision
    MembershipEntries
    JoinEvents
    LeaveEvents
    Tombstones
    Incarnations
    SnapshotIdentity
    SnapshotInterval
    CompletenessBoundary
    FederationComposition
    HistoricalReconstruction
    ReconstructionProvenance
    RetentionState
    AntiRollbackState
    ConflictState
    RevocationState

This is not a Nexo schema and must not be implemented or treated as frozen.

## New distinctions

- MEMBER LIST != POPULATION TRUTH
- CURRENT COMPLETE LIST != HISTORICALLY COMPLETE LIST
- AUTHORITY IN TCB != COMPLETE HISTORICAL POPULATION
- NOT PRESENT IN REGISTRY != PROVEN NON-MEMBER
- OFFLINE != REMOVED
- DOWN != NON-MEMBER
- SNAPSHOT CONSISTENCY != POPULATION COMPLETENESS
- LOST HISTORICAL ENUMERATION -> UNKNOWN
- CURRENT STATE + COMPACTION != HISTORICAL PROOF
- COMPLETE-AT-E1 != COMPLETE-AT-E2
- PERFECT OBSERVERS + INCOMPLETE DOMAIN = INCOMPLETE NEGATIVE CLAIM
- OBSERVER COMPLETENESS != SUBJECT/DOMAIN COMPLETENESS
- COMPLETE SUBPOPULATIONS != COMPLETE GLOBAL POPULATION
- MEMBERSHIP HISTORY != OBSERVATION HISTORY
- RETENTION FAILURE -> POSSIBLE POPULATION UNKNOWN
- POPULATION COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Audit verdict

GLOBAL-AUDIT-071 does NOT close negative-evidence finality.

The population authority is now explicitly identified as a major evidence dependency. A registry can be authoritative, internally consistent and cryptographically authenticated while still being historically incomplete, stale, forked, compacted, or semantically narrower than the claim domain.

The strongest unresolved boundary is:

  CAN POPULATION COMPLETENESS BE INDEPENDENTLY EVIDENCED
  FOR THE EXACT HISTORICAL CLAIM DOMAIN AND INTERVAL,
  WITHOUT CIRCULARLY TRUSTING THE SAME AUTHORITY
  WHOSE COMPLETENESS IS BEING ASSERTED?

Current answer: UNKNOWN.

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

## Next exact mission

GLOBAL-AUDIT-072 — Population authority circularity, independent completeness evidence, and TCB boundary:
- can an authority prove its own population completeness;
- independent witness models;
- recursive authority chains;
- circular evidence dependencies;
- genesis/root population assumptions;
- authority compromise and omission;
- cross-checking registries without assuming completeness of either;
- whether completeness proof necessarily expands the TCB;
- minimum evidence needed to distinguish unknown population from proven empty population;
- interaction with FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
