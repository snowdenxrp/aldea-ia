# NEXO — GLOBAL EFFECT-GRAPH CYCLES AND CROSS-CHAIN TERMINATION RESEARCH
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Attack
This round attacks two compensation chains that converge on one resource, diverge, and later interact again.

The key question:
Can local chain termination guarantee global effect termination?

Answer from the research attack:
No. Chain-local depth is insufficient when independent chains share effects, resources, callbacks, or mission invariants.

## 2. External cross-check
Raft prevents conflicting committed command histories by using a single authoritative replicated ordering and election restrictions; its client protocol separately addresses duplicate commands after retries. This supports separating global ordering from effect identity/deduplication. citeturn0search15turn0search18

Version vectors are a standard technique for detecting concurrent updates rather than pretending one local version is globally ordered. This supports modeling concurrent effect ancestry explicitly. citeturn0search8

Optimistic offline locking detects conflicts by validating that changes do not conflict immediately before commit; this supports treating conflict detection as a protected boundary rather than assuming earlier reads remain valid. citeturn0search1

## 3. Core finding
Two locally bounded compensation chains can form a globally cyclic effect graph.

Therefore:
LOCAL_CHAIN_TERMINATION != GLOBAL_EFFECT_TERMINATION

and:
NO_CYCLE_WITHIN_CHAIN != NO_CYCLE_IN_EFFECT_GRAPH

## 4. Example
Chain A:
E1 → C1 → C2

Chain B:
E2 → C3 → C4

Both converge on resource R.

Later:
C2 interacts with C4.
C4 changes the condition under which C2 was selected.
C2 changes the condition under which C4 was selected.

Now the dependency graph contains a cycle even though neither chain individually contains one.

## 5. New object: EffectDependencyGraph
Candidate graph nodes:
- original effects;
- retries;
- compensations;
- callbacks;
- continuations;
- resource incarnations;
- reconciliation decisions;
- mission-invariant obligations.

Edge types:
CAUSES
RETRIES
COMPENSATES
DEPENDS_ON
CONFLICTS_WITH
INVALIDATES
TARGETS
OBSERVES
DERIVES_FROM
REQUIRES

The graph is not merely an audit graph. For safety-relevant effects it becomes part of the closure used to decide whether another effect may be admitted.

## 6. Hyperedge requirement
Some interactions cannot be represented safely as pairwise edges.

Example:
C1 is safe only if E1, E2, and resource R jointly satisfy a condition.

Therefore pairwise conflict checking can be unsound.

Candidate:
EffectInteractionHyperedge

A hyperedge binds:
- participating effects;
- resources/incarnations;
- mission invariants;
- ordering assumptions;
- provider contract;
- claim scope.

## 7. Cycle detection
Candidate cycle classes:

G0 no cycle
G1 informational cycle
G2 historical dependency cycle
G3 active effect dependency cycle
G4 compensation cycle
G5 authority/effect mixed cycle

G3-G5 are safety-critical.

A cycle does not automatically mean the world is unsafe.
It means local acyclic reasoning is insufficient and closure must be established at the cycle scope.

## 8. Strongly connected components
Candidate technique:
Collapse each strongly connected component (SCC) of the effect dependency graph into one coordination unit.

But SCC collapse is not automatically safe.

It requires:
- explicit semantic composition;
- common safety boundary;
- complete effect-path closure;
- consistent resource incarnations;
- current authority;
- no hidden external continuation.

This extends the prior authority-cycle research.

## 9. New concept: Effect Coordination Component
An SCC that contains safety-relevant external effects becomes:
Effect Coordination Component (ECC)

An ECC is the minimum graph unit for which a single release/containment decision may be required.

Candidate rule:
NO_PROTECTED_RELEASE_WHILE_ECC_HAS_UNRESOLVED_ACTIVE_CYCLE

## 10. Converging chains
When two chains converge on one resource:
A and B must be merged into a common interaction closure if either:
- targets the same resource incarnation;
- affects the same mission invariant;
- shares a provider;
- shares a causal dependency;
- shares a fence;
- shares a callback/continuation;
- can invalidate the other's evidence.

This means chain identity is not enough to determine isolation.

## 11. Divergence after convergence
After A and B interact, they cannot necessarily be separated again.

A later scope reduction requires proof that:
- no cross-chain dependency remains;
- no outstanding effect/callback can cross the boundary;
- resource incarnations are independent;
- mission invariants no longer couple them;
- evidence dependencies are closed.

Thus:
MERGE ≠ AUTOMATICALLY REVERSIBLE PARTITION

## 12. New object: EffectClosureContext
Candidate fields:
- graph fingerprint;
- SCC/ECC identity;
- participating effects;
- resource incarnations;
- interaction hyperedges;
- provider boundaries;
- callback/continuation closure;
- mission invariant closure;
- authority/fence context;
- dependency/common-mode closure;
- claim ceiling.

Purpose:
freeze the graph boundary used by an effect decision.

## 13. Global termination
A global termination condition must be defined over the effect graph, not only over compensation chains.

Candidate safe terminal conditions:
T0 VERIFIED_RESOLVED
T1 VERIFIED_ABSORBED_IN_SAFE_STATE
T2 VERIFIED_CONTAINED_WITH_WEAKER_CLAIM
T3 QUARANTINED
T4 UNKNOWN_NON_CONVERGENT_WITHOUT_FURTHER_AUTHORIZED_EFFECTS

T4 is important:
The system may stop generating effects even when the world cannot be fully reconciled.

Therefore:
TERMINATION != COMPLETE_WORLD_KNOWLEDGE

## 14. Effect absorption
If a cycle cannot be safely resolved, Nexo may seek an absorbing safe state, but only under the previously established conditions:
- complete relevant effect boundary;
- stale-effect fencing;
- crash-safe transition;
- protected absorption linearization;
- verified enforcement;
- no hidden continuation inside the claim boundary.

Otherwise absorption itself remains a claim, not world truth.

## 15. New object: GlobalTerminationContext
Candidate fields:
- ECC set;
- active effect set;
- unresolved uncertainty set;
- mission invariants;
- resource incarnations;
- effect-path closure;
- termination policy;
- current authority continuity;
- current fences;
- external enforcement status;
- claim ceiling.

A global termination decision must be current-context bound.

## 16. New state machine
Candidate:

T0 ACTIVE_GRAPH
→ T1 CLOSURE_FROZEN
→ T2 SCC_ANALYZED
→ T3 CONFLICT_RESOLVED
→ T4 EFFECTS_FENCED
→ T5 ENFORCEMENT_VERIFIED
→ T6 TERMINAL_CLAIM_READY
→ T7 TERMINAL_CLAIM_PUBLISHED

Alternative safe exit:
→ TQ QUARANTINED

Invalidation:
Any critical context change → STALE → RECOMPUTE_CLOSURE

## 17. Cycle-breaking effect
A proposed cycle-breaking effect must itself enter the graph before authorization.

Therefore the graph is evaluated under a hypothetical candidate extension:

G + C

The candidate is admissible only if:
- the resulting graph remains within the safety boundary;
- no new unresolved cycle makes the claim invalid;
- mission invariants remain safe under allowed outcomes;
- effect-path closure remains complete enough;
- provider enforcement is sufficient.

This prevents the “solution” from secretly creating another cycle.

## 18. New invariant family
GC-01 Local chain termination does not prove global termination.
GC-02 Any shared safety-relevant resource merges effect closures.
GC-03 Pairwise interaction is insufficient where higher-order dependencies exist.
GC-04 SCC/ECC boundaries require explicit composition semantics.
GC-05 A merged closure cannot be split without proving independence.
GC-06 Cycle-breaking effects must be analyzed as new graph nodes before admission.
GC-07 Global termination is claim-scoped, not equivalent to complete world knowledge.
GC-08 Quarantine is a valid terminal safety state.
GC-09 Unknown non-convergence may prohibit further protected effects.
GC-10 No protected release while unresolved active safety-critical ECC remains.
GC-11 Graph closure must include hidden callbacks, retries, delegated effects and provider continuations within the claimed boundary.
GC-12 Resource incarnation changes can merge or split closures only through explicit proof.

## 19. Adversarial fixtures
GC-A01 two compensation chains converge on one resource.
GC-A02 chains diverge after shared resource interaction.
GC-A03 chains later interact again.
GC-A04 cycle exists only through a callback.
GC-A05 cycle exists only through a retry lineage.
GC-A06 cycle spans two resource incarnations.
GC-A07 pairwise checks pass but three-way invariant fails.
GC-A08 SCC contains an external provider continuation.
GC-A09 cycle-breaking effect creates a new cycle.
GC-A10 chain-local depth limits reached but global graph still active.
GC-A11 one chain quarantined while the other remains active.
GC-A12 scope reduction attempted before proving independence.
GC-A13 authority rotates during SCC analysis.
GC-A14 STOP occurs after closure freeze.
GC-A15 provider history is incomplete.
GC-A16 hidden delegated capability crosses ECC boundary.
GC-A17 snapshot restore removes local graph edge but not external effect.
GC-A18 two ECCs merge after a new effect.
GC-A19 ECC splits after resource replacement.
GC-A20 repeated merge/split cycles prevent stable termination.

## 20. Distillation
CARRY_FORWARD:
- effect-path closure
- interaction contracts
- higher-order closure
- SCC caution
- claim-scoped termination
- safe absorbing states
- quarantine as safe terminal mode
- resource incarnation binding
- hidden continuation closure

REWORK:
- EffectDependencyGraph
- EffectInteractionHyperedge
- Effect Coordination Component
- EffectClosureContext
- GlobalTerminationContext
- exact SCC composition semantics
- global termination proof

REJECT:
- chain depth alone as global termination
- pairwise checks as universal closure
- first cycle breaker wins
- merged closure automatically splits
- terminal claim == complete world knowledge

OPEN:
- formal graph/SCC semantics
- hypergraph temporal closure
- global termination theorem
- liveness/convergence analysis
- SANY/TLC
- implementation refinement
- fault injection and long-duration testing

## 21. Status
RESEARCH COMPLETE FOR THIS ATTACK ROUND.
DESIGN CANDIDATE ONLY.
NO V21 IMPLEMENTATION.
NO FORMAL CORRECTNESS CLAIM.
NO RUNTIME CORRECTNESS CLAIM.
