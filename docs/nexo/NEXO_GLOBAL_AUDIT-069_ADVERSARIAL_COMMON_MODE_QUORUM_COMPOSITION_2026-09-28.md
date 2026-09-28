# NEXO GLOBAL AUDIT-069 — ADVERSARIAL / COMMON-MODE QUORUM COMPOSITION

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Audit: GLOBAL-AUDIT-069
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether quorum composition can turn cryptographically distinct or Byzantine-resilient observer evidence into a trustworthy negative/absence claim when evidence sources share dependencies or can be adversarially correlated.

Dimensions:
1. Byzantine/correlated observer faults;
2. shared upstream observation roots;
3. threshold signatures versus independent observations;
4. weighted quorums;
5. stale/forked quorum state;
6. equivocation;
7. cryptographically distinct but semantically duplicated evidence;
8. population-completeness boundaries;
9. quorum systems with asymmetric/federated trust;
10. interaction with UNKNOWN/FutureObs_PAA.

## Evidence studied

Classical Byzantine quorum systems distinguish ordinary intersection from an intersection containing enough non-faulty participants to mask Byzantine behavior. Set intersection alone is therefore insufficient once arbitrary faults are admitted. [Malkhi/Reiter, Byzantine quorum systems: https://doi.org/10.1145/258533.258650]

Flexible Paxos demonstrates that even ordinary consensus does not require every quorum pair to intersect; the required intersection relation depends on protocol phases. There is therefore no protocol-independent rule that a quorum must intersect without specifying what decision/evidence the quorum supports. [Flexible Paxos: https://arxiv.org/abs/1608.06696]

Recent heterogeneous-quorum research further shows that quorum intersection and weak availability alone need not suffice for deterministic quorum-based consensus in heterogeneous settings. [Satrapy, 2026: https://link.springer.com/article/10.1007/s00446-026-00507-0]

Real implementations/tools were inspected as research evidence:
- Stellar's quorum analyzer computes intersection and related structural properties rather than assuming them from validator counts.
- python-fbas exposes intersection, minimal quorum, splitting-set, blocking-set and history-loss analyses.
- A TLA+/TLAPS Byzantine Paxos example makes quorum intersection an explicit assumption.
- A current BFT formal-verification project separates quorum-intersection lemmas from broader protocol invariants and treats epoch reconfiguration as a later verification phase.
- A production-oriented quorum analyzer/test corpus demonstrates that quorum-intersection predicates require boundary and mutation tests.

These sources are research evidence, not Nexo protocol commitments.

## Findings

### F069-01 — Byzantine intersection is not ordinary intersection

For arbitrary faulty observers, the useful property is not merely:

  Q1 ∩ Q2 != EMPTY

but a claim-specific condition that enough of the intersection remains trustworthy under the assumed fault set.

Therefore:

  SET INTERSECTION != TRUSTWORTHY INTERSECTION

The fault model must be explicit before any quorum certificate can be interpreted as evidence.

### F069-02 — A Byzantine-safe quorum can still be semantically incomplete for absence

Even if a quorum system safely masks f Byzantine participants, that safety statement concerns the protocol property for which the quorum was defined.

It does not automatically prove:
- complete population enumeration;
- complete event observation;
- absence across an arbitrary domain;
- no hidden upstream event;
- no late observation inside H;
- no unresolved source incarnation;
- no future observation relevant to the claim.

Therefore:

  BYZANTINE QUORUM SAFETY != ABSENCE COMPLETENESS

### F069-03 — Common-mode dependencies can collapse apparent quorum diversity

Suppose observers O1...On independently sign the same statement, but all derive it from one upstream monitor M or one stale snapshot S.

Cryptographically, signatures are distinct.
Semantically, the supporting observation may be one source.

Thus:

  DISTINCT SIGNATURES != DISTINCT EVIDENCE

and:

  DISTINCT OBSERVERS != INDEPENDENT OBSERVATIONS

The dependency graph must trace claim-supporting provenance beneath each observer report.

### F069-04 — Threshold signatures compress authorization, not independence

A threshold signature can demonstrate that a threshold of authorized key shares participated in signing according to the signature scheme.

It does not by itself establish that signers:
- observed independently;
- used independent inputs;
- covered disjoint observation domains;
- were free of a common upstream dependency;
- possessed current state;
- observed the entire claimed interval.

Therefore:

  THRESHOLD AUTHENTICATION != EVIDENCE INDEPENDENCE

A single aggregate signature may hide more provenance than individually inspectable observations.

### F069-05 — Weighted quorum semantics require a weight authority

Weighted quorum systems are meaningful only relative to an authoritative weight assignment and quorum rule.

If weights are stale, correlated, duplicated, or controlled by one common authority, the numeric total can overstate evidentiary diversity.

Thus:

  WEIGHT SUM != EVIDENCE DIVERSITY

unless weight semantics and dependency structure are proven relevant to the claim.

### F069-06 — A single highly weighted common-mode observer can dominate the certificate

A weighted system can satisfy its mathematical threshold while most effective evidence originates from one organization or upstream sensor.

For negative evidence this is dangerous because the apparent quorum can satisfy the threshold without establishing independent coverage.

Candidate distinction:

  QUORUM WEIGHT != INDEPENDENT COVERAGE WEIGHT

This is research terminology only and is not a defined Nexo primitive.

### F069-07 — Equivocation requires evidence identity, not only signature validity

A Byzantine observer can sign conflicting statements if protocol context is not bound into the signed claim.

Each negative observation therefore needs enough context to distinguish:
- claim scope;
- target;
- source incarnation;
- observation interval;
- membership/configuration epoch;
- protocol view/round where applicable;
- statement digest;
- authority;
- provenance.

Thus:

  SIGNATURE VALIDITY != NON-EQUIVOCATION

### F069-08 — Forked state can produce multiple authentic but incompatible quorums

Observers can see different legitimate branches or stale snapshots while producing authentic reports.

Quorum membership alone does not establish which branch is current.

The resolver needs explicit:
- epoch/fork identity;
- branch ancestry;
- authority/finality rule;
- anti-rollback state;
- conflict semantics.

Without those, conflicting authentic evidence remains UNKNOWN rather than being resolved by arrival order or signature count.

### F069-09 — Cryptographic duplication can be semantic duplication

Evidence can be cryptographically distinct while deriving from:
- the same source event;
- the same signed snapshot;
- the same upstream measurement;
- the same membership registry;
- the same attestation root;
- the same reconstruction checkpoint;
- the same common-mode software.

Evidence identity must therefore include dependency ancestry, not only content hash or signer identity.

This carries forward GLOBAL-AUDIT-047/048/066/068.

### F069-10 — Quorum intersection can protect against contradiction while failing to prove coverage

The classical BFT quorum result is about preventing incompatible decisions under a specified fault model. It does not establish that every relevant subject/event was observed.

Three separate relations must remain distinct:

  INTERSECTION / AGREEMENT
  COVERAGE / COMPLETENESS
  FUTURE-OBSERVATION FINALITY

None may be silently substituted for another.

### F069-11 — Population completeness is an independent semantic boundary

Even a perfect quorum over all listed observers cannot prove global absence if the system cannot prove that the observer population itself is complete for the claim.

Thus:

  COMPLETE QUORUM OVER KNOWN MEMBERS != COMPLETE OBSERVATION DOMAIN

Membership completeness remains an evidence dependency.

### F069-12 — Correlated Byzantine faults defeat naive counting

Several nominal observers may share one compromised upstream dependency without sharing private signing keys.

A threshold signature can remain cryptographically valid while observations are semantically correlated.

Therefore the fault model must include dependency correlation, not only node compromise count.

Candidate unresolved distinction:

  NODE-FAULT BOUND != DEPENDENCY-FAULT BOUND

### F069-13 — Federated quorum systems make local trust explicit, but do not solve absence semantics

Federated Byzantine quorum systems allow participants to specify local quorum slices and derive global quorum properties from those slices.

This is useful evidence that a quorum may not even be globally uniform.

A local trust relation would still need separate semantics for:
- observation coverage;
- population completeness;
- dependency independence;
- authority epochs;
- future observation closure.

No direct import is justified.

### F069-14 — Quorum analyzers demonstrate that structural properties are separate computations

Real tooling exposes separate checks for intersection, minimal quorums, splitting sets, blocking sets and history-loss properties.

This supports a research constraint:

  DO NOT REDUCE ALL QUORUM SEMANTICS TO ONE BOOLEAN is_quorum

A future Nexo reducer, if eventually designed, will need claim-relative predicates rather than a single quorum flag.

No such reducer is being implemented now.

### F069-15 — Quorum intersection can itself be computationally nontrivial

For heterogeneous/federated quorum systems, determining quorum intersection and enumerating minimal quorums can be computationally expensive.

A future proof boundary must distinguish:
- exact mathematical property;
- algorithm used to compute it;
- input completeness;
- solver correctness;
- result provenance.

A computed TRUE without these dependencies is not automatically a proof of semantic completeness.

### F069-16 — Byzantine-safe intersection still depends on the declared fault model

Classical Byzantine quorum constructions derive safety from explicit bounds on arbitrary faults.

If several apparently separate observers can fail together because they share an upstream root, the effective fault domain may be larger than the observer count suggests.

Therefore:

  OBSERVER COUNT != EFFECTIVE FAILURE DOMAIN

### F069-17 — Weighted quorums require more than a numerical threshold

A weighted quorum certificate should not be interpreted without preserving:
- weight assignment/version;
- weight authority;
- membership epoch;
- threshold rule;
- observer/source identities;
- dependency closure;
- claim scope;
- observation interval;
- revocation/finality state.

Otherwise a stale or manipulated weight map can transform the same signatures into a different semantic quorum.

### F069-18 — Common-mode dependency is itself a negative-evidence attack surface

For a positive claim, one corroborating observation may sometimes be sufficient.

For absence, a common-mode failure can systematically produce the same false NO-X result across every observer.

Thus:

  MORE CORRELATED OBSERVERS != MORE NEGATIVE EVIDENCE

### F069-19 — FutureObs_PAA remains independent of quorum safety

Even if:
- quorum intersection is proven;
- Byzantine intersection is proven;
- observer signatures are authentic;
- common-mode dependencies are bounded;

a later admissible event/observation can still change the current claim unless a claim-relative finality boundary excludes it.

Therefore:

  QUORUM SAFETY != FUTUREOBS_PAA CLOSURE

This directly continues GLOBAL-AUDIT-049/050/065/066/067/068.

### F069-20 — No admissible generic quorum-to-absence algebra has been established

The strongest current result is a separation candidate, not a Nexo protocol theorem:

  QUORUM CERTIFICATION
      ->
  AGREEMENT / AUTHORIZATION PROPERTY
      [under explicit protocol/fault assumptions]

does not imply:

  GLOBAL NEGATIVE CLAIM
      ->
  COMPLETE POPULATION
  + COMPLETE OBSERVATION
  + INDEPENDENT/BOUNDED DEPENDENCIES
  + FINALITY AGAINST FUTURE OBSERVATIONS

The second implication remains UNKNOWN for Nexo.

## Candidate evidence-dependency boundary — NOT FROZEN

Research candidate for each observer report:

  ObserverEvidence =
    ClaimScope
    TargetIdentity
    SourceIncarnation
    ObservationInterval
    MembershipEpoch
    AuthorityEpoch
    ProtocolView/Round
    ObservationPayload
    Signature/Attestation
    UpstreamSourceIDs
    DerivationIDs
    Snapshot/CheckpointIDs
    MembershipEvidence
    WeightEvidence
    DependencyClosure
    CommonModeGroups
    Conflict/EquivocationState
    Freshness/AntiRollback
    ReconstructionContract

Research candidate for a quorum-level negative certificate:

  QuorumCertificate =
    ObserverEvidenceSet
    QuorumSystem
    QuorumRuleVersion
    MembershipEpoch
    WeightConfiguration
    FaultModel
    IntersectionProperty
    ByzantineIntersectionProperty
    CoverageEvidence
    PopulationCompletenessEvidence
    CommonModeClosure
    Finality/FutureObsBoundary
    Retention/ReconstructionState
    Revocation/ConflictState

These are research candidates only. They are NOT frozen Nexo schemas.

## New distinctions

- SET INTERSECTION != TRUSTWORTHY INTERSECTION
- BYZANTINE QUORUM SAFETY != ABSENCE COMPLETENESS
- DISTINCT SIGNATURES != DISTINCT EVIDENCE
- DISTINCT OBSERVERS != INDEPENDENT OBSERVATIONS
- THRESHOLD AUTHENTICATION != EVIDENCE INDEPENDENCE
- WEIGHT SUM != EVIDENCE DIVERSITY
- QUORUM WEIGHT != INDEPENDENT COVERAGE WEIGHT
- SIGNATURE VALIDITY != NON-EQUIVOCATION
- AUTHENTIC QUORUM != CURRENT BRANCH
- CRYPTOGRAPHIC DUPLICATION != SEMANTIC INDEPENDENCE
- COMPLETE QUORUM OVER KNOWN MEMBERS != COMPLETE OBSERVATION DOMAIN
- NODE-FAULT BOUND != DEPENDENCY-FAULT BOUND
- OBSERVER COUNT != EFFECTIVE FAILURE DOMAIN
- MORE CORRELATED OBSERVERS != MORE NEGATIVE EVIDENCE
- QUORUM SAFETY != FUTUREOBS_PAA CLOSURE
- QUORUM CERTIFICATION != GLOBAL NEGATIVE CLAIM

## Audit verdict

GLOBAL-AUDIT-069 does NOT close negative-evidence finality.

The research strengthens the separation between quorum safety and evidence semantics.

Byzantine quorum theory can provide strong intersection guarantees under explicit fault assumptions, but those guarantees are not equivalent to population completeness or absence. Threshold signatures authenticate participation; they do not prove independent observation. Weighted quorums require authoritative weight semantics. Federated and heterogeneous quorum systems further demonstrate that quorum properties are claim/protocol-specific rather than universal.

The strongest unresolved boundary is now:

  CAN A QUORUM CERTIFICATE EVER PROVIDE
  POPULATION-COMPLETE NEGATIVE EVIDENCE
  WITHOUT AN INDEPENDENTLY PROVEN
  POPULATION/OBSERVATION-COMPLETENESS CONTRACT?

Current answer:
UNKNOWN.

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

GLOBAL-AUDIT-070 — Population completeness and observer-domain closure:
- authoritative population enumeration;
- dynamic membership creation/deletion;
- hidden/offline members;
- observer coverage versus subject coverage;
- domain partitioning;
- nested/federated populations;
- population snapshots and historical reconstruction;
- adversarial omission of members;
- whether completeness can be independently evidenced;
- interaction with quorum certificates and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
