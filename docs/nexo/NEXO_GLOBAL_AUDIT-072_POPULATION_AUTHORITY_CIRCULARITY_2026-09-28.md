# NEXO GLOBAL-AUDIT-072 — POPULATION AUTHORITY CIRCULARITY & INDEPENDENT COMPLETENESS

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack whether a population authority can establish its own completeness without circular evidence, and whether an independently evidenced population boundary is possible without expanding the trusted computing base.

## Research evidence

Kubernetes explicitly distinguishes consistency of a collection at a resource version from freshness and completeness claims. Exact-version lists can provide a consistent snapshot, while unavailable historical versions can yield `410 Gone`; paginated continuation is tied to the original resource version. This demonstrates that snapshot consistency is a separate property from proving that the underlying domain itself is complete. citeturn0search0turn0search1

Kubernetes also documents that a stale/older resource version can be served under weaker semantics, while stronger reads use quorum-backed state. Again, consistency/freshness of the registry is distinct from proof that the registry enumerates every member relevant to a claim. citeturn0search0turn0search7

The 2026 heterogeneous-quorum literature reinforces that quorum properties depend on an agreed quorum model rather than emerging merely from participant counts. citeturn0search11

## Findings

### F072-01 — Authority authenticity does not prove population completeness

A registry can be authentic, signed, internally consistent and non-equivocating while omitting an entity that the registry was never authoritative over.

AUTHENTIC REGISTRY != COMPLETE POPULATION

### F072-02 — Self-attestation creates a circularity boundary

If authority A claims “A's member set is complete” and the only evidence for that claim is A's own member set, the completeness claim is circular.

The signature proves origin/authorship, not external completeness.

SELF-ATTESTED COMPLETENESS != INDEPENDENT COMPLETENESS

### F072-03 — An independent witness must observe a boundary, not merely repeat the registry

A second observer that copies A's list from the same source does not independently establish completeness.

To be independent for this claim, the witness must have an evidence path that does not reduce to the same completeness assertion.

DUPLICATED REGISTRY READS != INDEPENDENT COMPLETENESS EVIDENCE

### F072-04 — Multiple authorities do not automatically solve circularity

A,B,C can each attest the same population while all deriving membership from a common upstream authority U. Their signatures are distinct, but their completeness dependency is shared.

MULTI-AUTHORITY != INDEPENDENT-BOUNDARY PROOF

### F072-05 — An external census requires its own authority model

If an external census is introduced to prove completeness of the population authority, the census itself requires a definition of what counts as the complete domain.

This can recurse:

A completeness -> B census -> C domain authority -> ...

The chain must eventually terminate in an independently justified boundary or remain UNKNOWN.

### F072-06 — The root-domain question cannot be hidden

Every global completeness claim has an implicit universe U:

  “all members in U”

If U is undefined, the claim is underspecified.
If U is defined by the same authority whose completeness is being tested, circularity remains possible.

DOMAIN DEFINITION != DOMAIN ENUMERATION

### F072-07 — Snapshot consistency is not domain completeness

A perfectly consistent snapshot can still omit an entity outside the snapshot's authoritative scope. Kubernetes' resourceVersion semantics illustrate the distinction: a collection can be made internally consistent at a version while historical availability and freshness remain separate concerns. citeturn0search0turn0search6

CONSISTENT SNAPSHOT != COMPLETE UNIVERSE

### F072-08 — Historical completeness requires historical authority

A present registry cannot automatically prove that its historical population at time t was complete, especially after deletion, compaction, migration or authority changes.

CURRENT AUTHORITY != HISTORICAL COMPLETENESS

### F072-09 — Compaction can destroy the evidence needed to prove historical completeness

If the system no longer retains the membership transitions needed to reconstruct U(t), the correct result is UNKNOWN rather than inferred completeness. Kubernetes explicitly documents cases where exact historical versions become unavailable and clients must recover rather than pretending that the old snapshot still exists. citeturn0search0turn0search1

RETENTION FAILURE != PROOF OF NO CHANGE

### F072-10 — Population completeness is claim-relative

The complete population for “all active observers” can differ from the complete population for “all credential holders”, “all subjects”, or “all event sources”.

Therefore population completeness must be bound to ClaimScope and ObservationDomain.

### F072-11 — Observer completeness and subject completeness are different

A system may enumerate every observer while failing to enumerate every subject those observers are supposed to cover.

COMPLETE OBSERVERS != COMPLETE SUBJECT DOMAIN

### F072-12 — Partitioned domains require boundary coverage

If U is partitioned into U1...Un, proving completeness requires evidence that:
1. every relevant partition is represented;
2. partitions do not overlap in a way that creates hidden gaps;
3. the union equals U;
4. membership changes between partitions are accounted for.

Otherwise:

  COMPLETE(U1)...COMPLETE(Un) != COMPLETE(U)

unless union/completeness is independently established.

### F072-13 — Federated authority introduces boundary composition

A federated system can delegate population authority to multiple domains. The resulting global completeness claim requires a composition rule for domain coverage, not merely local correctness of each domain.

LOCAL COMPLETENESS != GLOBAL COMPLETENESS

### F072-14 — Weight/quorum agreement cannot manufacture a population boundary

A quorum of authorities agreeing on a member list proves agreement under its quorum assumptions. It does not independently establish that no unlisted member exists.

QUORUM AGREEMENT != UNIVERSE COMPLETENESS

### F072-15 — Independence must be dependency-relative

Two sources are independent only with respect to the claim and its supporting dependency graph. They may be independent at the network layer while sharing the same root registry or policy authority.

INDEPENDENCE IS CLAIM/DEPENDENCY-RELATIVE

### F072-16 — The population authority may become part of the TCB

If correctness of negative evidence depends on the authority's assertion that its population is complete, then that assertion is security-critical. Either:

A. the authority is admitted into the TCB for this property; or
B. an independent completeness contract exists that does not trust the authority's own assertion; or
C. completeness remains UNKNOWN.

No decision is made here about which architecture Nexo should adopt.

### F072-17 — Expanding the TCB does not automatically solve completeness

Putting the population authority inside the TCB changes the trust assumption; it does not mathematically prove the authority is complete.

TCB TRUST != EMPIRICAL/SEMANTIC COMPLETENESS

### F072-18 — Completeness contracts need falsifiability

A meaningful completeness contract should identify what evidence would demonstrate failure: omitted member, unknown partition, stale authority epoch, rollback, conflicting source, or unavailable historical evidence.

A contract that can never be falsified independently is merely an assertion.

### F072-19 — “No omitted member found” is weaker than “no omitted member exists”

Search/census procedures that fail to find omissions provide bounded evidence. They do not automatically prove existential absence unless the search space and coverage are themselves closed.

NO COUNTEREXAMPLE FOUND != PROOF OF COMPLETENESS

### F072-20 — FutureObs_PAA remains separate

Even if a complete population boundary were proven for time t, that would not prove no later admissible observation can alter the claim.

POPULATION COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Central unresolved theorem candidate

For a negative claim over universe U and interval H, a quorum certificate can only establish population-complete negative evidence if there exists an independently justified contract establishing:

1. definition of U;
2. authoritative scope over U;
3. complete enumeration of U for the relevant epoch/time;
4. complete observation coverage of U over H;
5. dependency independence/bounds;
6. historical reconstruction when needed;
7. transition/finality semantics;
8. admissible treatment of later observations.

The existence of such a generic contract for Nexo remains UNKNOWN.

## New distinctions

- AUTHENTIC REGISTRY != COMPLETE POPULATION
- SELF-ATTESTED COMPLETENESS != INDEPENDENT COMPLETENESS
- DUPLICATED REGISTRY READS != INDEPENDENT COMPLETENESS EVIDENCE
- MULTI-AUTHORITY != INDEPENDENT-BOUNDARY PROOF
- DOMAIN DEFINITION != DOMAIN ENUMERATION
- CONSISTENT SNAPSHOT != COMPLETE UNIVERSE
- CURRENT AUTHORITY != HISTORICAL COMPLETENESS
- RETENTION FAILURE != PROOF OF NO CHANGE
- COMPLETE OBSERVERS != COMPLETE SUBJECT DOMAIN
- LOCAL COMPLETENESS != GLOBAL COMPLETENESS
- QUORUM AGREEMENT != UNIVERSE COMPLETENESS
- TCB TRUST != EMPIRICAL/SEMANTIC COMPLETENESS
- NO COUNTEREXAMPLE FOUND != PROOF OF COMPLETENESS
- POPULATION COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Audit verdict

GLOBAL-AUDIT-072 does NOT close negative-evidence finality.

The audit establishes a hard boundary: population authority cannot prove its own completeness merely by authenticating its own enumeration. Independent completeness evidence must ultimately depend on a domain boundary that is not circular. If no such boundary exists, the correct epistemic state is UNKNOWN.

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

GLOBAL-AUDIT-073 — Completeness contract termination and domain-root attacks:
- whether a finite/constructive root domain can be independently defined;
- open-world vs closed-world assumptions;
- recursive authority/census chains;
- domain discovery versus domain proof;
- omission attacks at the root;
- partition/merge/split attacks;
- historical domain reconstruction;
- whether completeness can terminate without an unproven axiom;
- interaction with quorum evidence and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
