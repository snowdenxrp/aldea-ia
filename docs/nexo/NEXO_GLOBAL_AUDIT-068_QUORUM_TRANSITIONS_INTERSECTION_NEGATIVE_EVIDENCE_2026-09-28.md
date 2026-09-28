# NEXO GLOBAL AUDIT-068 — QUORUM TRANSITIONS, INTERSECTION & NEGATIVE-EVIDENCE COMPOSITION

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Audit: GLOBAL-AUDIT-068
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether quorum intersection and quorum reconfiguration can turn multiple negative observations into a closed absence claim across membership transitions.

Dimensions:
1. quorum intersection within one configuration;
2. quorum intersection across membership epochs;
3. joint configurations;
4. threshold changes;
5. disjoint quorums;
6. overlapping quorums with common-mode dependencies;
7. stale quorum certificates;
8. reconfiguration during an observation interval;
9. whether quorum agreement can establish absence rather than merely agreement;
10. interaction with UNKNOWN and FutureObs_PAA.

## Evidence studied

Flexible Paxos establishes an important boundary: majority is not the fundamental invariant; what matters for its consensus safety argument is the required intersection relation between relevant quorum classes. The work explicitly allows non-intersecting quorums in some phases while preserving the intersections required by the protocol. Therefore "quorum" and "majority" are not interchangeable semantic concepts. citeturn0search0turn0academia22

Raft's joint-consensus reconfiguration is a concrete example of why membership transitions require a transition configuration rather than a silent switch: during the joint phase, agreement requires separate majorities from both old and new configurations, preventing a period in which both configurations can independently make decisions. citeturn1search11

TUF uses threshold signatures, but its threshold is an authorization/signing threshold rather than a generic distributed-observer quorum. TUF also binds thresholds to role configuration and protects root transitions with continuity checks across old and new thresholds. This is useful evidence that threshold values must be interpreted together with authority, role, version and transition semantics; a count alone has no universal meaning. citeturn1search0

## Findings

### F068-01 — Quorum intersection proves an intersection property, not absence

If two admissible quorums intersect, the intersection can preserve agreement under the protocol's assumptions.

That does NOT by itself establish:

  NO-X-EXISTS-IN-DOMAIN

The missing bridge is semantic:

  observer-reported-NO-X -> domain-complete-NO-X

Intersection says that some evidence sources overlap. It does not prove that the quorum collectively covered every entity/event/observer state relevant to the absence claim.

Therefore:

  QUORUM INTERSECTION != ABSENCE COMPLETENESS

### F068-02 — A quorum is claim-relative

The same set of observers may form a valid quorum for one claim and be insufficient for another.

Examples:
- agreeing on a committed configuration;
- attesting a key transition;
- observing a bounded target population;
- proving no event occurred in a temporal interval.

The quorum rule must therefore bind to ClaimScope, ObservationDomain and semantic purpose.

A generic "2 of 3" rule cannot be promoted into a universal negative-evidence rule.

### F068-03 — Disjoint quorums are not automatically contradictory

Two disjoint quorums can both be valid under some quorum systems. Flexible Paxos demonstrates that not every pair of quorums must intersect; only protocol-relevant intersections need to be guaranteed. citeturn0search0turn0search2

Therefore:

  DISJOINT QUORUMS != AUTOMATIC CONFLICT

But for an absence certificate, disjointness also means the two reports cannot be treated as overlapping coverage unless an independent domain relation proves such coverage.

Thus:

  DISJOINT NEGATIVE QUORUMS != COMBINED GLOBAL ABSENCE

### F068-04 — Overlap is not independence

Suppose Q1 and Q2 overlap in observer O.

If O is the common dependency producing both reports, counting Q1 and Q2 as two independent negative witnesses can double-count the same evidence.

More generally, even if Q1 and Q2 have no identical observer, they may share:
- the same membership registry;
- the same stale snapshot;
- the same attestation root;
- the same upstream monitor;
- the same reconstruction checkpoint;
- the same common-mode software;
- the same source event.

Therefore quorum intersection must be evaluated together with the evidence dependency graph.

  QUORUM INTERSECTION != EVIDENCE INDEPENDENCE

### F068-05 — Membership-epoch transitions require an explicit transition rule

Let C1 be the old observer configuration and C2 the new configuration.

A certificate generated under C1 cannot automatically be interpreted under C2 merely because:
- identities overlap;
- quorum counts happen to be equal;
- the same threshold number is used;
- the new set contains many old observers.

Raft's joint consensus provides one concrete safe pattern: a transition configuration requires agreement from both old and new configurations before the new configuration takes over. citeturn1search11

For Nexo, this is evidence for a required semantic transition boundary, not a prescription to use Raft.

### F068-06 — Threshold equality does not imply semantic continuity

Consider:
  C1 = {A,B,C}, threshold=2
  C2 = {A,D,E}, threshold=2

The threshold remains 2, but the evidence population has materially changed.

Likewise:
  C1 = {A,B,C,D,E}, threshold=3
  C2 = {A,B,C,D,E,F,G}, threshold=3

The numeric threshold remains 3 while the fraction of population covered changes.

Therefore:

  SAME THRESHOLD != SAME COVERAGE

and

  SAME QUORUM SIZE != SAME AUTHORITY/FINALITY SEMANTICS

### F068-07 — Threshold changes can invalidate naive historical composition

A certificate with threshold t1 under epoch E1 cannot be combined with a certificate using threshold t2 under E2 unless the transition semantics establish how the two certificates relate.

This is especially important for negative claims because a lower threshold can reduce population coverage while preserving an apparently similar certificate shape.

The transition must bind at least:
- old membership;
- new membership;
- old threshold/quorum rule;
- new threshold/quorum rule;
- transition interval;
- authority epoch;
- claim scope;
- coverage semantics.

### F068-08 — Joint configuration prevents a semantic gap, but does not prove negative completeness

Joint consensus is useful because it prevents old and new configurations from independently making conflicting decisions during reconfiguration. citeturn1search11

But even a perfectly safe joint configuration only establishes the consensus property that its protocol specifies.

It does not automatically establish:

  NO-X-ANYWHERE-IN-DOMAIN

For negative evidence, a separate coverage/completeness proof is required.

Therefore:

  SAFE-RECONFIGURATION != NEGATIVE-EVIDENCE-CLOSURE

### F068-09 — Stale quorum certificates remain historical evidence, not current population evidence

A quorum certificate may be cryptographically valid and historically valid while no longer representing the current membership or authority state.

TUF explicitly binds threshold signatures to role configuration, version and expiry, and requires continuity checks during root transitions. It also rejects rollback to older metadata. citeturn1search0

For Nexo:

  VALID-CERTIFICATE != CURRENT-CLAIM-ADMISSIBILITY

A stale quorum certificate may support a bounded historical claim, but cannot silently satisfy a later population epoch.

### F068-10 — Reconfiguration during the observation interval splits the negative claim

If the observation horizon H crosses E1 -> E2, then the claim cannot safely be represented as a single quorum result unless the transition semantics explicitly cover the entire interval.

Candidate decomposition:

  H = H1 ∪ H2

where:
- H1 is covered by E1;
- H2 is covered by E2;
- transition interval is separately accounted for.

If there is an uncovered transition interval:

  COVERED(H1) + COVERED(H2) != COVERED(H)

The missing interval remains UNKNOWN.

### F068-11 — Quorum intersection across epochs requires a cross-epoch relation

An observer common to C1 and C2 does not automatically make the quorums intersect semantically across epochs.

The shared observer must itself be bound to:
- incarnation;
- credential/key epoch;
- membership authority;
- observation interval;
- freshness;
- state continuity assumptions.

Thus:

  SHARED IDENTITY != SHARED VALID EVIDENCE

This carries forward GLOBAL-AUDIT-057/058/067.

### F068-12 — Intersection can preserve agreement while absence remains UNKNOWN

This is the central negative-evidence result.

A system can have:
- mathematically guaranteed quorum intersection;
- cryptographically authenticated reports;
- safe reconfiguration;
- no conflicting quorum decisions;

and still lack proof of absence because:
- an unobserved population segment exists;
- an observer was offline;
- a new member joined during H;
- a late event occurred in H;
- membership completeness is unknown;
- common-mode dependencies collapse apparent independence;
- retention prevents reconstruction.

Therefore:

  CONSENSUS SAFETY != OBSERVATION COMPLETENESS

### F068-13 — Population coverage and quorum agreement are separate evidence dimensions

A negative certificate needs at least two conceptually different proofs:

A. Agreement proof:
  the admitted observers agree on the reported negative state.

B. Coverage proof:
  the admitted observer population and observation intervals cover the complete claim domain.

A may be proven while B remains UNKNOWN.

The reducer must not synthesize B from A.

### F068-14 — TUF threshold signing is useful analogy but not a generic quorum algebra

TUF's specification requires threshold signatures for roles and explicitly ties those thresholds to role configuration, key sets, delegation and version/expiry semantics. During root migration, the new root must be signed according to both predecessor and successor threshold rules. citeturn1search0

This demonstrates a useful design lesson:

  THRESHOLD + AUTHORITY + VERSION/TRANSITION + SCOPE

is meaningful, while:

  THRESHOLD COUNT ALONE

is not.

It does not prove that TUF's model can be directly imported into Nexo's negative-evidence semantics.

### F068-15 — Common-mode dependencies can defeat quorum composition

If every observer in Q1 and Q2 derives its negative statement from one shared stale membership snapshot, one shared monitor, or one shared reconstruction root, then quorum multiplicity may provide little or no independent evidence.

The evidence reducer therefore needs dependency closure before treating quorum members as independent witnesses.

If dependency independence is unresolved:

  INDEPENDENCE = UNKNOWN

and the resulting negative claim cannot be upgraded merely by counting signatures.

### F068-16 — A quorum can certify "agreement on no-X" without certifying "no-X"

This distinction must remain explicit:

  AGREEMENT:
    Q says each admitted observer reported NO-X.

  ABSENCE:
    X did not occur / does not exist within the claim domain.

The second requires a semantic bridge covering:
- population;
- time;
- event classes;
- observer authority;
- completeness;
- late events;
- retention/reconstruction;
- revocation/conflict;
- dependency closure;
- finality.

No such general bridge has yet been proven for Nexo.

## Candidate quorum certificate boundary — NOT FROZEN

A research candidate for a negative quorum certificate is:

  QuorumCertificate =
    ClaimScope
    ObservationDomain
    PopulationEpoch
    MembershipEvidence
    ObserverIncarnations
    QuorumSystem
    Threshold/IntersectionRule
    ObservationIntervals
    AgreementEvidence
    CoverageEvidence
    DependencyClosure
    CommonModeClosure
    AuthorityEpoch
    Freshness/AntiRollback
    TransitionEvidence
    LateEventRule
    FinalityBoundary
    Retention/Reconstruction
    Revocation/ConflictState

This is a research candidate only. It is NOT a protocol commitment and must not be treated as the future Nexo schema.

## New distinctions

- QUORUM INTERSECTION != ABSENCE COMPLETENESS
- QUORUM INTERSECTION != EVIDENCE INDEPENDENCE
- DISJOINT QUORUMS != AUTOMATIC CONFLICT
- DISJOINT NEGATIVE QUORUMS != COMBINED GLOBAL ABSENCE
- SAME THRESHOLD != SAME COVERAGE
- SAME QUORUM SIZE != SAME AUTHORITY/FINALITY SEMANTICS
- SAFE RECONFIGURATION != NEGATIVE-EVIDENCE CLOSURE
- VALID CERTIFICATE != CURRENT CLAIM ADMISSIBILITY
- SHARED IDENTITY != SHARED VALID EVIDENCE
- CONSENSUS SAFETY != OBSERVATION COMPLETENESS
- AGREEMENT-ON-NO-X != NO-X
- THRESHOLD COUNT != THRESHOLD SEMANTICS
- MULTIPLE SIGNATURES != MULTIPLE INDEPENDENT OBSERVATIONS
- JOINT CONFIGURATION != GLOBAL ABSENCE PROOF
- HISTORICAL QUORUM VALIDITY != CURRENT POPULATION COVERAGE

## Audit verdict

GLOBAL-AUDIT-068 does NOT close negative-evidence finality.

Quorum intersection is a safety relation for particular distributed protocols. It does not by itself establish the semantic completeness required for a negative/absence claim.

Membership transitions require explicit cross-epoch semantics. Joint configurations can prevent conflicting decisions during reconfiguration, but they do not automatically prove that the entire negative-claim domain was observed.

The critical decomposition is:

  AGREEMENT PROOF
      !=
  COVERAGE/COMPLETENESS PROOF
      !=
  FUTURE OBSERVATION FINALITY

No general quorum-to-absence algebra has been proven.

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

GLOBAL-AUDIT-069 — Quorum composition under adversarial/common-mode dependencies:
- Byzantine or correlated observer faults;
- shared upstream observation roots;
- threshold signatures versus independent observations;
- weighted quorums;
- quorum certificates with stale/forked state;
- equivocation;
- observer evidence that is cryptographically distinct but semantically duplicated;
- whether any admissible quorum construction can provide coverage evidence without an independently proven population-completeness boundary;
- interaction with FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
