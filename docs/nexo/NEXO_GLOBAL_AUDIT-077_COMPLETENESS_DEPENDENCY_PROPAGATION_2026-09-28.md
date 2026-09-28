# NEXO GLOBAL AUDIT-077 — COMPLETENESS DEPENDENCY PROPAGATION AND MINIMAL RE-EVALUATION

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Study how revocation, expiry, scope change, reconstruction loss, and supersession of a completeness prerequisite propagate through dependent claims without over-revoking claims that retain independent support.

Research included W3C PROV constraints, current TUF specification, python-tuf implementation/tests, and Kubernetes resource-version/watch recovery semantics.

## Findings

### F077-01 — Propagation must follow dependency edges, not names

A claim must be re-evaluated because its admissibility depends on a changed completeness contract, not merely because it references the same population or scope label.

W3C PROV models derivation and event ordering as provenance relationships that can be validated and normalized; this supports treating dependency lineage as evidence-bearing rather than as a cosmetic label. citeturn0search0

REFERENCE EQUALITY != DEPENDENCY EQUALITY

### F077-02 — Shared prerequisite revocation creates fan-out

If C1, C2, and C3 all depend on K, a change to K can require re-evaluation of all three. But the resulting state may differ because each claim can have different scope, time interval, independent evidence, or additional prerequisites.

SHARED DEPENDENCY != SHARED CLAIM STATE

### F077-03 — Re-evaluation must be minimal

A revoked K should invalidate/reopen only claims whose current admissibility actually depends on the affected portion of K.

A claim with independent sufficient evidence should not be over-revoked merely because it shares a population, observer, quorum, or graph component with an affected claim.

COMMON GRAPH COMPONENT != COMMON SEMANTIC DEPENDENCY

### F077-04 — Partial coverage requires claim-to-scope intersection

If K covers S and only S1 is revoked, a dependent claim over S2 disjoint from S1 is not automatically affected.

For overlapping scopes, the semantic relation must be known. A textual set intersection is insufficient when scope languages, aliases, hierarchy, or incarnation semantics are unresolved.

TEXTUAL OVERLAP != PROVEN SEMANTIC OVERLAP

### F077-05 — Independent evidence can preserve a claim

When K is revoked, C can remain currently admissible only if another admissible evidence path closes the same claim-relevant boundary and is not merely another representation of K.

This carries forward GLOBAL-AUDIT-047 and -069.

SECOND RECORD != INDEPENDENT SUPPORT

### F077-06 — Dependency cycles cannot bootstrap completeness

If K1 depends on C, C depends on K2, and K2 ultimately depends on K1, the cycle cannot manufacture admissibility merely because every node is locally signed/valid.

Cycle detection is necessary, but a terminating traversal does not prove semantic completeness.

### F077-07 — Revocation impact itself is an evidence dependency

The assertion “K is revoked for C” may require proof of authority, target identity/incarnation, scope, effective interval, epoch, and provenance. If those are unresolved, the revocation impact can remain UNKNOWN.

REVOCATION EVENT != PROVEN IMPACT

### F077-08 — Historical dependency and current dependency differ

A historical decision may cite K even after K is revoked. That historical relationship remains part of the provenance graph. Current evaluation may traverse the same edge and reach a different admissibility state.

HISTORICAL EDGE != CURRENT SUFFICIENCY

### F077-09 — Stale evidence can remain useful for anti-rollback without proving current validity

Current python-tuf tests explicitly preserve local expired metadata for rollback checks. The implementation therefore distinguishes “expired for current acceptance” from “still useful historical state for detecting rollback.” citeturn1search0turn1search6

EXPIRED FOR ADMISSION != USELESS FOR ALL DECISIONS

### F077-10 — TUF demonstrates ordered dependency validation

The current TUF specification requires ordered validation between root, timestamp, snapshot, and targets; versions, signatures, expiration, and cross-metadata references constrain whether a newer state can replace a trusted state. It also prevents rollback and mix-and-match conditions. citeturn1search1

This supports a dependency-aware reducer model, but TUF does NOT prove Nexo's completeness algebra.

VALIDATED CHAIN != GENERIC COMPLETENESS PROOF

### F077-11 — Kubernetes demonstrates bounded reconstruction

Kubernetes explicitly documents that historical resource versions are retained only for a limited time. If a requested watch history is gone, clients receive 410 Gone and must clear/rebuild local state from a newer consistent observation. citeturn0search2

Therefore a dependency reducer cannot assume arbitrary historical reconstruction.

HISTORY GAP != NO EVENT

### F077-12 — Partial reconstruction must not silently become complete

If part of a dependency graph can be reconstructed but another claim-relevant branch is missing, the affected claim must remain UNKNOWN unless an independently authoritative completeness contract covers the missing branch.

PARTIAL RECONSTRUCTION != COMPLETE RECONSTRUCTION

### F077-13 — Over-revocation is a semantic error class

A reducer that propagates every dependency failure globally can destroy valid independent evidence and convert a local UNKNOWN into unrelated UNKNOWN/REVOKED states.

Therefore propagation requires a claim-relative dependency closure plus scope/interval/epoch/incarnation matching.

### F077-14 — Re-evaluation should preserve reason provenance

For each reopened claim, the system should retain which dependency transition caused re-evaluation: revoked, expired, superseded, scope contraction, population transition, reconstruction loss, authority change, conflict, or late observation.

These labels are research candidates, not a frozen protocol.

### F077-15 — Quorum certificates require dependency-aware re-evaluation

A quorum certificate can remain authentic while its completeness prerequisite becomes unsupported. The certificate must therefore be re-evaluated at the semantic layer rather than deleted as cryptographically invalid.

Likewise, a quorum certificate should not be propagated as independent evidence if its members share the revoked completeness root.

AUTHENTIC QUORUM != INDEPENDENT COMPLETENESS EVIDENCE

### F077-16 — FutureObs_PAA remains a separate boundary

Dependency propagation can reopen a negative claim, but no amount of local dependency propagation proves that no future observation can alter it.

Kubernetes history retention and TUF freshness/rollback defenses illustrate temporal boundaries, but neither establishes general future-observation closure. citeturn0search2turn1search1

RE-EVALUATION != FUTURE FINALITY

## Candidate research-only reducer boundary — NOT FROZEN

For claim C, a dependency transition should trigger re-evaluation only when all are true:

1. The dependency is actually in C's admissibility closure.
2. The changed portion overlaps C's claim scope under defined semantics.
3. The dependency's affected interval intersects the claim's relevant interval.
4. Authority/epoch/incarnation semantics match the claim.
5. No admissible independent evidence path already closes the affected boundary.
6. Required provenance and reconstruction remain sufficient.
7. No unresolved conflict or cycle prevents determination.

If any required condition cannot be established, the safe result is UNKNOWN rather than automatic invalidation.

This is a research boundary, NOT a finalized Nexo protocol.

## New distinctions

- REFERENCE EQUALITY != DEPENDENCY EQUALITY
- SHARED DEPENDENCY != SHARED CLAIM STATE
- COMMON GRAPH COMPONENT != COMMON SEMANTIC DEPENDENCY
- TEXTUAL OVERLAP != PROVEN SEMANTIC OVERLAP
- SECOND RECORD != INDEPENDENT SUPPORT
- REVOCATION EVENT != PROVEN IMPACT
- HISTORICAL EDGE != CURRENT SUFFICIENCY
- EXPIRED FOR ADMISSION != USELESS FOR ALL DECISIONS
- VALIDATED CHAIN != GENERIC COMPLETENESS PROOF
- HISTORY GAP != NO EVENT
- PARTIAL RECONSTRUCTION != COMPLETE RECONSTRUCTION
- AUTHENTIC QUORUM != INDEPENDENT COMPLETENESS EVIDENCE
- RE-EVALUATION != FUTURE FINALITY

## Verdict

GLOBAL-AUDIT-077 does NOT close dependency completeness, population completeness, quorum semantics completeness, or FutureObs_PAA.

It narrows the required boundary: semantic reopening must be dependency-aware and claim-relative, with minimal fan-out, independent-evidence preservation, cycle handling, reconstruction awareness, and explicit reason provenance.

No generic propagation algebra has been proven.

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

GLOBAL-AUDIT-078 — Dependency closure under shared/common-mode roots and selective revocation:
- shared provenance roots;
- common-mode dependencies;
- selective versus global invalidation;
- duplicate evidence;
- overlapping claim scopes;
- quorum/common-root fan-out;
- cycle and cut-set analysis;
- reconstruction boundaries;
- interaction with FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
