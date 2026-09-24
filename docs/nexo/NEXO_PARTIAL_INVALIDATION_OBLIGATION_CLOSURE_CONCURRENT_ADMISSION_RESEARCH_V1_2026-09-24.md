# NEXO - PARTIAL INVALIDATION / OBLIGATION CLOSURE / CONCURRENT ADMISSION - 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
Can Nexo invalidate only the affected portion of assurance while safely allowing unrelated operations during the propagation window?

## External cross-check
TLA+ safety checking is property-specific: invariants concern every reachable state of the modeled behavior, and refinement maps relate lower-level behavior to a higher-level specification. This supports claim-scoped verification rather than treating an entire system as one undifferentiated proof. citeturn0search0turn0search5
SLSA provenance explicitly records build inputs/dependencies and describes transitive trusted-platform closure; its dependency completeness is bounded/best-effort at some levels, reinforcing that assurance must state its closure boundary. citeturn0search1turn0search4
TUF distinguishes integrity from freshness and repository-wide consistency; a locally valid artifact is not enough if the surrounding view is stale or mixed. citeturn0search3

## Core result
Partial invalidation is possible, but only when the affected claim/obligation closure is known and the invalidated boundary is enforced atomically enough that stale assurance cannot cross it.

`INVALIDATED_DEPENDENCY != INVALIDATE_EVERYTHING`
`INVALIDATED_DEPENDENCY != INVALIDATE_NOTHING`
The correct operation is claim/obligation closure.

## 1. Proof obligations, not proof blobs
A proof should be decomposed into obligations:
`P = {O1, O2, ... On}`.
Each obligation has dependencies and assumptions.
A dependency change should invalidate every obligation whose truth depends on it, plus every composed claim that depends transitively on those obligations.
This is more precise than invalidating an entire proof artifact blindly.

## 2. Obligation dependency graph
Candidate graph:
`DEPENDENCY -> OBLIGATION -> CLAIM -> ADMISSION_RULE -> EFFECT_CLASS`.
Also:
`DEPENDENCY -> PROOF_CONTEXT -> PROOF_RESULT`.
The graph must be directed and version/context bound.

## 3. Three statuses
Every assurance component should distinguish:
`CURRENT`
`INVALID`
`UNKNOWN`.
Do not use `VALID/INVALID` as the only states because propagation may be incomplete.
If a dependency changed and impact cannot be determined, the affected assurance becomes UNKNOWN rather than silently CURRENT.

## 4. Partial invalidation boundary
Candidate `InvalidationBoundary`:
- change identity
- impacted dependency
- affected context IDs
- impacted obligations
- impacted claims
- protected effect classes
- affected coordination domains
- required fences
- propagation status
- linearization reference
- unresolved impact set
- currentness/freshness context.

## 5. The critical race
Sequence:
`D changes`
→ invalidation begins
→ operation E requests admission
→ propagation has not reached all caches
→ E finds an apparently CURRENT proof
→ admission succeeds.
This is unsafe if D can affect E's claim.

Therefore cache state cannot decide admission during an unresolved invalidation window.

## 6. Authoritative impact cutoff
Candidate transition:
`CHANGE_DETECTED -> IMPACT_CLOSURE -> AUTHORITY_CUTOFF -> INVALIDATION_COMMIT -> REVALIDATION -> ADMISSION_RELEASE`.
The critical point is not merely event publication. A protected authoritative boundary must establish that affected old assurance is no longer admissible.

## 7. Invalidation order versus observation order
Message order is insufficient.
`INVALIDATION_ORDER != OBSERVATION_ORDER`.
A stale observer may still report CURRENT after authoritative invalidation.
Therefore currentness must be derived from the authoritative invalidation generation/context, not from cache arrival time.

## 8. Epoch model
Candidate `AssuranceGeneration`:
- assurance_epoch
- policy_generation
- dependency_generation
- boundary_generation
- topology_generation
- resource_incarnation set
- proof_context_id.
An admission must bind to a current generation set.

## 9. Generation equality is not enough
Even if all numeric generations match, the underlying closure may be incomplete or restored from an old snapshot.
Thus:
`GENERATION_MATCH != CONTEXT_CONTINUITY`.
Continuity anchor and rollback semantics remain separate.

## 10. Partial invalidation and concurrent admission
Case A: admission linearizes before invalidation cutoff.
The operation is a real current transition under the old context and must be handled by the protected-transition/effect lifecycle. It cannot simply be erased from history.
Case B: invalidation cutoff linearizes first.
Admission using old context must be denied.
Case C: order is unknown.
Strong admission requires revalidation or an enforcement boundary proving the old context cannot produce the protected effect.

## 11. Why invalidating everything is also wrong
Global invalidation can destroy liveness unnecessarily.
If claim M1 depends on D and claim M2 is proven disjoint from D under a complete closure, M2 may remain CURRENT.
But the disjointness itself is a safety claim and must be established.
`NO_EDGE_OBSERVED != DISJOINT_PROVEN`.

## 12. Claim-specific impact
Candidate function:
`Impact(D, Claim) -> {NONE, DIRECT, TRANSITIVE, UNKNOWN}`.
`NONE` is allowed only with complete dependency/interaction closure.
`UNKNOWN` must not be converted into NONE.

## 13. Obligation-level reuse
Suppose:
`P = O1 ∧ O2 ∧ O3`.
D affects only O2.
If O1/O3 are independently current and O2 is invalid, Nexo may preserve O1/O3 as historical/current sub-assurance, but the composite claim requiring all three becomes non-current.
This avoids both extremes:
`everything stale` and `everything current`.

## 14. Monotone claim degradation
Assurance should degrade monotonically:
`GLOBAL_CURRENT -> GROUP_DEGRADED -> EFFECT_HOLD -> QUARANTINED`
when uncertainty grows.
A degraded claim cannot silently regain strength without explicit revalidation.

## 15. Cross-boundary admission rule
Candidate:
`ADMIT(E,C)` only if every obligation required by E's claim is CURRENT under the same protected context and every relevant invalidation generation is resolved.
If any required obligation is UNKNOWN/INVALID, admission is blocked or downgraded only if a weaker claim is explicitly sufficient.

## 16. Protected admission bundle
Candidate `AdmissionAssuranceBundle`:
- operation/effect identity
- claim ID
- proof context
- obligation set
- dependency closure version
- invalidation generation
- policy/invariant versions
- boundary/fence generations
- resource incarnations
- interaction/coordination domain
- current evidence
- freshness/currentness
- assumptions
- invalidation watch/binding.
This bundle must be consumed by the authoritative admission transition, not by an arbitrary cache.

## 17. Propagation failure
If invalidation cannot reach one required authoritative component, Nexo cannot claim that component is current.
Possible result:
`PROPAGATION_UNKNOWN`.
Safety behavior:
`HOLD / RESTRICT / QUARANTINE` for claims that depend on the missing component.
Unrelated claims can remain current only if their closure excludes that component.

## 18. Recovery during partial invalidation
Recovery cannot simply restore the old proof cache.
Recovery sequence:
`RESTORE -> REBUILD CURRENT CONTEXT -> REPLAY INVALIDATION INTENTS -> RECOMPUTE IMPACT -> REVALIDATE OBLIGATIONS -> RECOMPUTE CLAIMS -> EXPLICIT RELEASE`.
This follows the broader continuity rule: restored historical state does not restore historical authority.

## 19. Invalidation and external effects
If a dependency affects an already-admitted external effect, invalidation does not retroactively erase the effect.
It changes the future control/evidence state.
Potential consequences:
- fence future attempts;
- invalidate continuation/retry;
- reconcile existing effect;
- recompute claims;
- preserve historical uncertainty.

## 20. Partial invalidation and effect identity
An invalidation must identify which effects are affected.
Using only provider/resource names is insufficient where multiple incarnations or effect identities exist.
Required binding may include:
`effect_id + attempt_id + context_id + dependency_generation + resource_incarnation + boundary_generation`.

## 21. Concurrent invalidation sources
Two changes D1 and D2 may overlap.
Nexo must not assume independent propagation if their impact closures intersect.
Candidate interaction classes:
DISJOINT, COMPOSABLE, ORDER_SENSITIVE, CONFLICTING, UNKNOWN.
Unknown overlap produces a conservative joint invalidation domain.

## 22. Higher-order invalidation
Pairwise dependency analysis is insufficient.
D1 may be harmless alone, D2 harmless alone, while D1+D2 changes a mission invariant.
This connects to the earlier higher-order interaction research.
Therefore invalidation closure may require hyperedges/group claims rather than only pairwise edges.

## 23. Proof cache architecture
Cache may accelerate lookup but cannot own truth.
Candidate:
`CACHE -> PROOF_CANDIDATE`
`AUTHORITATIVE_CONTEXT -> CURRENTNESS`
`DEPENDENCY/INVALIDATION PLANE -> IMPACT`
`ADMISSION_CORE -> FINAL_DECISION`.
Cache inconsistency therefore causes performance degradation, not silent authority expansion.

## 24. Selective invalidation theorem candidate
Candidate theorem, not formally proven:
If (1) dependency closure is complete, (2) claim impact is complete, (3) unaffected claim domains are proven disjoint from the changed dependency and interaction closure, and (4) authoritative admission binds to the current invalidation generation, then invalidation may be safely limited to the impacted claim domain.
Failure of any premise => UNKNOWN/HOLD for the strong selective-currentness claim.

## 25. Relationship to TUF/SLSA
TUF's repository-wide consistency and freshness concepts show why one valid file is insufficient to establish a current coherent view. citeturn0search3
SLSA's provenance/dependency model similarly makes the surrounding build context and dependency closure part of what must be interpreted and verified, rather than treating the top-level artifact digest as the whole story. citeturn0search1

## 26. Candidate invariants INV-PINV-01..34
01 Invalidation is claim/obligation scoped.
02 Unknown impact is not no impact.
03 Partial invalidation cannot bypass affected obligations.
04 Composite claim currentness requires all required obligations current.
05 Obligation currentness is context-bound.
06 Cache state never grants currentness.
07 Cache state never grants authority.
08 Authoritative invalidation generation orders protected admission.
09 Event arrival order does not define invalidation order.
10 Admission before invalidation is a real transition requiring lifecycle handling.
11 Admission after invalidation cutoff cannot use stale assurance.
12 Unknown ordering requires revalidation or effective stale-context fencing.
13 Selective invalidation requires complete closure.
14 Disjointness must be proven, not inferred from missing edges.
15 Higher-order interactions can enlarge invalidation closure.
16 Multiple invalidations require joint impact analysis when closures intersect.
17 Unknown propagation blocks strong currentness.
18 Recovery replays invalidation before release.
19 Restored proof cache cannot restore authority.
20 Invalidation does not erase historical effects.
21 External effects remain subject to reconciliation after invalidation.
22 Effect identity is part of impact binding.
23 Resource incarnation is part of impact binding when relevant.
24 Boundary generation is part of impact binding when relevant.
25 Policy/invariant versions are part of impact binding when relevant.
26 Assurance degradation is monotonic until revalidation.
27 Revalidation is explicit.
28 Currentness is not observation timestamp.
29 Generation equality does not prove continuity.
30 Strong selective-currentness claims require closure completeness.
31 False-current is more dangerous than false-stale.
32 Weaker claims may remain available only when explicitly sufficient.
33 Invalidation state and proof state are distinct.
34 Invalidation state and authority state are distinct.

## Architectural result
A dedicated Invalidation/Impact Plane is now justified.
It must sit between change detection and authoritative admission, with explicit integration into Proof/Assurance, Dependency Closure, Fencing, Recovery, Evidence and Authority.

Canonical flow:
`CHANGE -> IMPACT CLOSURE -> AUTHORITATIVE CUTOFF -> INVALIDATE -> REVALIDATE -> RECOMPUTE CLAIM -> RELEASE ADMISSION`.

Critical separation:
`PROOF CACHE != ASSURANCE AUTHORITY`
`INVALIDATION EVENT != INVALIDATION ENFORCEMENT`
`INVALIDATION ENFORCEMENT != EXTERNAL EFFECT STOP`
`SELECTIVE INVALIDATION != SELECTIVE AUTHORITY`.

## Open gaps
G-PINV-01 formal obligation dependency graph.
G-PINV-02 formal selective-invalidation theorem.
G-PINV-03 atomicity between cutoff and admission.
G-PINV-04 higher-order impact closure.
G-PINV-05 concurrent invalidation composition.
G-PINV-06 runtime propagation enforcement.
G-PINV-07 cache/currentness refinement.
G-PINV-08 recovery replay implementation.
G-PINV-09 external-effect impact semantics.
G-PINV-10 actual SANY/TLC/TLAPS.
G-PINV-11 implementation refinement.
G-PINV-12 fault-injection validation.

## Next attack
INVALIDATION CUTOFF + ADMISSION LINEARIZATION + DURABLE INTENT + CRASH/REPLAY.
Question: what happens if the invalidation cutoff and an admission commit race, then the process crashes before either side is fully recorded? The next round must determine the minimum durable ordering needed to prevent both stale admission and phantom invalidation.