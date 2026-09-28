# NEXO GLOBAL AUDIT-076 — COMPLETENESS-CONTRACT REVOCATION AND SEMANTIC RE-OPENING

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Audit revocation/supersession of completeness contracts; scope expansion/contraction; population split/merge; epoch transitions; stale certificates; historical versus current claims; propagation to dependent negative claims; quorum interaction; FutureObs_PAA.

## Findings

### F076-01 — Revocation changes current admissibility, not historical existence

A completeness certificate that was valid for a historical interval remains a historical artifact even after later invalidation/revocation. The current projection may change, but history must not be erased.

W3C PROV explicitly models entity lifetimes and invalidation events, with generation/usage/invalidation temporally constrained. citeturn0search1turn0search3

CERTIFICATE REVOCATION != ERASURE OF HISTORICAL VALIDITY

### F076-02 — Completeness revocation is claim-relative

Revoking a completeness contract for population P, scope S, epoch E, or interval H does not automatically revoke unrelated claims.

Propagation requires dependency linkage from each affected claim to the contract.

GLOBAL REVOCATION != UNIVERSAL INVALIDATION

### F076-03 — Scope contraction can invalidate negative claims without changing the historical certificate

If a contract formerly covered S and is later narrowed to S', claims whose proof relied on S\S' lose current support. Historical statements made while S was covered remain historical records, subject to the contract that existed then.

### F076-04 — Scope expansion cannot retroactively strengthen old evidence

A contract expanded at E2 cannot make evidence collected under E1 prove the newly added domain.

LATER SCOPE != HISTORICAL COVERAGE

### F076-05 — Supersession requires semantic dominance

A newer completeness certificate does not automatically supersede an older one merely because its version is larger or arrival time is later.

Need explicit authority, target, scope, epoch/incarnation, temporal interval and supersession semantics.

### F076-06 — Population split requires partition evidence

When population P becomes P1 + P2, the partition relation itself is evidence-bearing. A certificate for P before the split does not automatically establish completeness of P1 and P2 after the split.

SPLIT != PROVEN PARTITION

### F076-07 — Population merge requires union semantics

When P1 and P2 merge, their historical completeness certificates do not automatically compose into completeness of P. Need explicit domain relation, overlap/duplicate handling, authority and epoch semantics.

MERGE != PROVEN COMPLETE UNION

### F076-08 — Epoch transitions do not automatically preserve completeness

A new membership/authority epoch may preserve, narrow, expand, or replace the population semantics. Epoch number alone does not establish continuity.

EPOCH INCREMENT != SEMANTIC CONTINUITY

### F076-09 — Stale certificates remain evidence about their historical interval

Expiry/staleness affects current admissibility; it does not convert the historical certificate into “never valid.” Kubernetes provides a concrete operational analogue: resource versions and watch history are bounded; once historical state is unavailable, clients must recover from a newer consistent state rather than pretend the old history remains available. citeturn0search0

STALE NOW != INVALID THEN

### F076-10 — Reconstruction loss can make revocation impact UNKNOWN

If a completeness certificate was valid at T1 but required provenance/history is compacted or lost before a later revocation at T2, current reconstruction may be unable to determine exactly which claims depended on the certificate.

REVOCATION KNOWN != REVOCATION IMPACT RECONSTRUCTABLE

### F076-11 — Dependent negative claims must reopen when their completeness prerequisite becomes unsupported

If negative claim C depended on completeness contract K, and K becomes revoked, scope-inapplicable, stale beyond its allowed interval, or otherwise unsupported, then C's current admissibility must be re-evaluated.

Possible current transitions include:
CONCRETE -> UNKNOWN
CONCRETE -> REVOKED
CONCRETE -> CONCRETE if an independent valid proof remains.

No monotonic current reducer is proven.

### F076-12 — Historical decision immutability and current claim mutability coexist

The historical record of “C was admitted under K at T1” can remain immutable while the current projection becomes UNKNOWN or REVOKED.

HISTORICAL DECISION IMMUTABILITY != CURRENT CLAIM IMMUTABILITY

### F076-13 — Quorum certificates depending on revoked completeness contracts are not automatically current

A quorum certificate can remain cryptographically authentic while losing semantic sufficiency because its population-completeness dependency was revoked or narrowed.

AUTHENTIC QUORUM != CURRENTLY SUFFICIENT QUORUM

### F076-14 — Revocation of a completeness contract can itself depend on a later completeness boundary

If revocation R claims that K is invalid for an entire population, R may itself require a population-completeness dependency. This creates potential recursive dependency chains.

No circular chain may self-bootstrap admissibility.

### F076-15 — Replacement contracts need explicit inheritance

A new completeness contract K2 must not silently inherit K1's historical coverage merely because it names the same population. Inheritance requires explicit continuity semantics including authority, epoch/incarnation and preserved provenance.

SAME POPULATION LABEL != SAME COMPLETENESS SEMANTICS

### F076-16 — Historical claims require historical authority semantics

Current authority cannot automatically rewrite what was admissible under a prior authority epoch. Conversely, a historical authority cannot automatically authorize current projections after its authority interval ends.

CURRENT AUTHORITY != HISTORICAL AUTHORITY

### F076-17 — FutureObs_PAA remains separate

Revoking/superseding a completeness contract can reopen current negative claims, but establishing a completeness boundary never automatically closes future observations unless an explicit finality contract covers the relevant observation domain and interval.

COMPLETENESS REVOCATION != FutureObs_PAA
COMPLETENESS PROOF != FutureObs_PAA CLOSURE

### F076-18 — Reopening must preserve dependency provenance

A current reducer must be able to explain why a claim reopened: revoked contract, changed scope, epoch transition, stale history, conflict, late event, missing reconstruction, or another dependency.

Otherwise the projection loses epistemic provenance.

## Candidate transition model — NOT FROZEN

For a claim C depending on completeness contract K:

SUPPORTED(C,K,E,H) is claim-relative and historical.

Current projection can be:
CONCRETE
UNKNOWN
REVOKED
CONFLICTED

A K transition may trigger re-evaluation:
VALID -> EXPIRED
VALID -> REVOKED
VALID -> SUPERSEDED
VALID -> SCOPE_CONTRACTED
VALID -> SCOPE_EXPANDED
VALID -> POPULATION_SPLIT
VALID -> POPULATION_MERGED
VALID -> RECONSTRUCTION_LOSS

These labels are research candidates only.

## New distinctions

- CERTIFICATE REVOCATION != ERASURE OF HISTORICAL VALIDITY
- GLOBAL REVOCATION != UNIVERSAL INVALIDATION
- LATER SCOPE != HISTORICAL COVERAGE
- SPLIT != PROVEN PARTITION
- MERGE != PROVEN COMPLETE UNION
- EPOCH INCREMENT != SEMANTIC CONTINUITY
- STALE NOW != INVALID THEN
- REVOCATION KNOWN != REVOCATION IMPACT RECONSTRUCTABLE
- AUTHENTIC QUORUM != CURRENTLY SUFFICIENT QUORUM
- SAME POPULATION LABEL != SAME COMPLETENESS SEMANTICS
- CURRENT AUTHORITY != HISTORICAL AUTHORITY
- COMPLETENESS PROOF != FutureObs_PAA CLOSURE

## Verdict

GLOBAL-AUDIT-076 does NOT close population completeness or FutureObs_PAA.

It establishes that completeness is a revocable, scoped, temporal evidence dependency. Revocation must alter current admissibility where justified, while preserving historical records. Scope changes, population transitions, stale certificates and reconstruction loss can reopen dependent negative claims. No automatic global propagation rule is justified.

## Global epistemic state

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

## Mandatory carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-077 — Completeness-contract dependency propagation and minimal re-evaluation:
- dependency graph propagation;
- shared completeness prerequisites;
- partial claim coverage;
- stale/revoked contract fan-out;
- avoiding over-revocation;
- dependency cycles;
- reconstruction after partial history loss;
- interaction with quorum certificates and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
