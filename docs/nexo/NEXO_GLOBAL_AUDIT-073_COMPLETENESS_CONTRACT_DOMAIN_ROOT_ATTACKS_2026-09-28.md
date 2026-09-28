# NEXO GLOBAL-AUDIT-073 — COMPLETENESS CONTRACT TERMINATION AND DOMAIN-ROOT ATTACKS

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Audit: GLOBAL-AUDIT-073
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether a negative claim can obtain a non-circular, independently justified closed domain. Examine open-world vs closed-world semantics, completeness assertions, recursive authority chains, root omission, partitions/merges/splits, and historical reconstruction.

## Evidence studied

Research on incomplete databases distinguishes open-world semantics, where missing information remains unknown, from closed-world semantics, where absence from a complete domain may support negation. Partial closed-world work treats completeness as explicit metadata/claims about particular queries or portions of a database rather than as an automatic property. citeturn0search1turn0search8

Distributed-systems literature also distinguishes open and closed groups and shows that admission control is a separate mechanism from ordinary node communication. citeturn0search12

## Findings

### F073-01 — Closed-world reasoning requires a completeness boundary

A closed-world negative conclusion is not produced merely by failing to find a positive fact. It depends on an assertion that the relevant information/domain is complete. Under open-world semantics, absence of a fact leaves its status unknown. citeturn0search0turn0search10

Therefore:

  NO RECORD != NO ENTITY

unless a claim-relative completeness boundary is established.

### F073-02 — A root declaration is an axiom unless its completeness is independently grounded

If a root authority simply declares "this list is the complete universe," that statement may be authoritative but is epistemically an assumption unless another justified mechanism establishes completeness.

Thus:

  ROOT AUTHORITY ASSERTION != INDEPENDENT ROOT COMPLETENESS

Trusting the root may be a legitimate protocol choice, but it must be recorded as an explicit trust/TCB assumption rather than mistaken for an independently proven fact.

### F073-03 — Recursive completeness chains do not terminate automatically

Suppose A certifies B's complete population, B certifies C, and C certifies the root domain. If no terminal boundary is independently justified, the chain merely relocates the completeness assumption.

Therefore:

  A -> B -> C -> ... -> ROOT

requires an explicit termination rule. Otherwise completeness is circular or rests on an unacknowledged axiom.

### F073-04 — Independent witnesses cannot manufacture an omitted universe

Multiple authorities can corroborate the same incomplete root. Even if their reports are independent, they may independently attest the same omitted member set.

Therefore:

  INDEPENDENT AGREEMENT != UNIVERSE COMPLETENESS

Independence helps with agreement/fault tolerance; it does not define the universe being enumerated.

### F073-05 — Closed-world semantics must be scoped

Research on partial closed-world semantics shows that completeness can hold for some queries/relations while remaining absent for others. citeturn0search8turn0search25

For Nexo, a valid completeness assertion therefore needs at minimum a claim/domain scope. A global "database is complete" bit is semantically dangerous if only a subset is covered.

### F073-06 — Completeness can be query-relative

A dataset may be incomplete globally while still being complete enough to answer a particular query. Research explicitly studies whether a query's answer is invariant under all valid completions of incomplete data. citeturn0search6

This creates an important possibility for Nexo research:

  GLOBAL POPULATION COMPLETENESS
  may be stronger than necessary for some claims,

but the weaker claim must itself have an explicit completeness contract.

### F073-07 — Partitioning can create false global completeness

If domain D is partitioned into D1...Dn, completeness of every listed partition only establishes completeness of D if:
- the partition relation is itself complete;
- no hidden partition exists;
- partitions are mutually understood;
- coverage spans the entire intended D;
- merge/split history is accounted for.

Thus:

  COMPLETE PARTITIONS != COMPLETE UNION

without a complete partition-map boundary.

### F073-08 — Merges and splits create historical ambiguity

If populations merge or split, a current root list cannot automatically reconstruct which entities belonged to which historical domain at time t.

A historical negative claim therefore needs:
- population version/epoch;
- transition records;
- predecessor/successor relation;
- retention guarantees;
- treatment of orphaned/tombstoned identities.

Otherwise historical completeness remains UNKNOWN.

### F073-09 — Tombstones prove different things depending on the domain contract

A tombstone can establish that an authority intentionally recorded removal. It does not prove that the removed identity was the only omitted identity.

Therefore:

  COMPLETE REMOVAL RECORD != COMPLETE MEMBERSHIP UNIVERSE

### F073-10 — Open/closed semantics can be mixed, but only explicitly

Partial closed-world research supports treating some information as complete while leaving other information open. citeturn0search8turn0search25

This is potentially useful for Nexo, but only if the closure boundary is explicit and claim-relative.

No global closed-world assumption should be silently inferred from a local completeness assertion.

### F073-11 — Membership admission and population completeness are separate

A distributed system may have an explicit admission mechanism for which nodes are allowed to join, while the current list of admitted nodes can still be stale or historically incomplete. Open and closed distributed groups require explicit mechanisms for membership changes. citeturn0search12

Therefore:

  ADMISSION AUTHORITY != COMPLETE HISTORICAL MEMBERSHIP

### F073-12 — Root completeness can be treated as a trust assumption, but then TCB expands

There is a logically coherent escape from the regress: declare the population-root authority a trusted boundary and accept its completeness as an axiom.

That does not prove completeness externally. It defines it as part of the trusted semantics.

For Nexo this means:

  ROOT-COMPLETENESS-AXIOM -> TCB / AUTHORITY ASSUMPTION

not:

  ROOT-COMPLETENESS-AXIOM -> PROVED WORLD COMPLETENESS

Whether such an axiom is acceptable remains UNKNOWN.

### F073-13 — No-independent-root may be a valid semantic state

If no independent completeness boundary exists, the correct result for a global negative claim may remain UNKNOWN rather than forcing an architecture to invent one.

This is preferable to silently turning an epistemic gap into a protocol invariant.

### F073-14 — FutureObs_PAA is orthogonal to domain closure

Even a perfectly closed domain at time t does not automatically establish that no admissible observation/event after t can alter the claim.

Therefore:

  DOMAIN CLOSURE != TEMPORAL FINALITY

The FutureObs_PAA boundary remains separately unresolved.

### F073-15 — Completeness evidence must itself have provenance

A completeness contract cannot be treated as self-authenticating metadata. Its authority, scope, version, time interval, derivation and revocation state must be traceable.

Otherwise the system can prove negative claims using an unproven completeness assertion whose own origin is opaque.

### F073-16 — The strongest current model is a claim-relative completeness contract

Research suggests a useful conceptual decomposition, not a frozen schema:

  CompletenessContract =
    DomainScope
    Query/ClaimScope
    Authority
    AuthorityEpoch
    PopulationVersion
    EnumerationMethod
    CoverageBoundary
    PartitionBoundary
    TransitionHistory
    Retention/ReconstructionRule
    Revocation/ConflictState
    TrustAssumption
    Provenance

This is research only. It is not an implementation proposal.

## New distinctions

- NO RECORD != NO ENTITY
- ROOT AUTHORITY ASSERTION != INDEPENDENT ROOT COMPLETENESS
- RECURSIVE CERTIFICATION != TERMINATED COMPLETENESS PROOF
- INDEPENDENT AGREEMENT != UNIVERSE COMPLETENESS
- COMPLETE PARTITIONS != COMPLETE UNION
- COMPLETE REMOVAL RECORD != COMPLETE MEMBERSHIP UNIVERSE
- ADMISSION AUTHORITY != COMPLETE HISTORICAL MEMBERSHIP
- ROOT-COMPLETENESS-AXIOM != PROVED WORLD COMPLETENESS
- DOMAIN CLOSURE != TEMPORAL FINALITY
- COMPLETENESS METADATA != COMPLETENESS PROOF
- GLOBAL COMPLETENESS != QUERY COMPLETENESS

## Audit verdict

GLOBAL-AUDIT-073 does NOT close population completeness.

A closed-world negative claim requires a scoped completeness boundary. That boundary can be externally evidenced, explicitly trusted as a root assumption, or remain UNKNOWN. Recursive authorities do not automatically solve the problem; without a termination boundary they relocate the assumption. Partitioning, merges, splits and historical reconstruction add additional completeness obligations.

The critical unresolved question is now:

  CAN NEXO ACCEPT A ROOT-COMPLETENESS AXIOM
  AS AN EXPLICIT TRUST/TCB BOUNDARY,
  OR MUST IT REQUIRE AN EXTERNAL/INDEPENDENT
  COMPLETENESS CONTRACT?

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
population completeness boundary = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next audit

GLOBAL-AUDIT-074 — Root completeness as explicit trust boundary vs externally evidenced completeness:
- compare explicit axioms against evidence-backed contracts;
- analyze TCB expansion and authority capture;
- attack root compromise/rollback/fork;
- analyze whether independent completeness witnesses can be meaningfully defined;
- test minimal assumptions needed for claim-relative closure;
- connect domain-root closure to FutureObs_PAA and the existing R1-R5 boundary;
- preserve the possibility that UNKNOWN is the only sound result.

No implementation. No V21. Preserve UNKNOWN.
