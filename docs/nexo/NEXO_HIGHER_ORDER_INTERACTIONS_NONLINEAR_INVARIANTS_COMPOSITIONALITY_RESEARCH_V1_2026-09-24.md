# NEXO — HIGHER-ORDER INTERACTIONS / NONLINEAR INVARIANTS / COMPOSITIONALITY — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Core result
Pairwise interaction analysis is insufficient in the general case. It is possible that INTERACT(E1,E2)=NONE, INTERACT(E1,E3)=NONE and INTERACT(E2,E3)=NONE while INTERACT({E1,E2,E3}) is safety-relevant.
Therefore PAIRWISE_DISJOINTNESS != GROUP_DISJOINTNESS and PAIRWISE_COMMUTATIVITY != SET_COMMUTATIVITY.

External cross-check: higher-order network research distinguishes group interactions from ordinary pairwise edges and uses hypergraphs to represent relations involving arbitrary numbers of units. This supports the architectural distinction, but is not a Nexo correctness proof. citeturn0academia23turn0academia20
TLA+ models system state plus a next-state relation, and safety can be expressed as an invariant over all modeled behaviors. Inductive invariants are a standard route for safety proofs; refinement mappings relate lower-level implementations to higher-level specifications. citeturn0search5turn0search29turn0search6turn0search28

## 1. Three-effect example
Mission invariant: A + B + C <= 10. E1 consumes 4 from A, E2 consumes 4 from B, E3 consumes 4 from C. Pair-local checks can all pass while the group consumes 12 and violates the mission invariant.
The safety interaction is created by the shared higher-order invariant, not necessarily by any pair.

## 2. Nonlinear and threshold interactions
Invariants can be nonlinear, such as A*B <= K or A^2+B^2+C^2 <= K. Threshold effects can remain harmless pairwise but become unsafe when a third member is added.
Therefore BUDGET_VALID != GROUP_INVARIANT_VALID.

## 3. New object: InteractionHyperedge
Candidate fields: hyperedge_id, member_effects, interaction_arity, interaction_type, invariant_scope, trigger_condition, resource/physical scope, temporal scope, provider scope, recovery/compensation scope, required ordering, required coordination domain, evidence, verification method and invalidation conditions.

## 4. New object: GroupInvariant
Candidate fields: invariant_id, member set/class, quantity function, state variables, temporal semantics, nonlinear relation, allowed region, forbidden region, interaction arity, uncertainty semantics, recovery semantics, evidence requirements, assumptions and verification method.

## 5. Hypergraph closure
The interaction model should be generalized from a pairwise graph to PAIRWISE GRAPH + HIGHER-ORDER HYPEREDGES.
InteractionClosure(M) is complete only if every interaction capable of changing truth of M is represented at the required arity.
Candidate InteractionArity: 1, 2, 3, ..., GROUP, MISSION.
ARITY_COVERAGE < REQUIRED_ARITY means the claim is incomplete.

## 6. Unknown higher-order interaction
PAIRWISE_COMPLETE + GROUP_UNKNOWN != COMPLETE.
If higher-order interaction is unknown, a strong group claim remains UNKNOWN/HOLD unless an enforceable boundary or invariant proof makes it irrelevant.

## 7. Group composition
SAFE(E1) ∧ SAFE(E2) ∧ SAFE(E3) does not imply SAFE(E1⊕E2⊕E3). Likewise, safe pair claims do not imply group safety.
Group composition therefore needs its own proof obligation.

## 8. Temporal higher-order interaction
A triple interaction may exist only during a specific overlap interval. Therefore higher-order closure requires temporal semantics, not just membership.

## 9. Transfers, recovery, compensation and retries
Transfer cycles can create higher-order conservation interactions. Recovery can add reconciliation effects. Compensation can create new hyperedges. Retries/redrives can create additional attempts and provider continuations.
Therefore RECOVERY_SCOPE != ORIGINAL_EFFECT_SCOPE and possible recovery-generated effects must be included when they can affect the invariant.

## 10. Dynamic membership
New members can appear through delegation, child workflows, provider redrive, retries, queues, callbacks and autonomous resources.
A static group proof is invalid if dynamic membership can escape the proven envelope.
ScopeEnvelope can bound dynamic membership through maximum cardinality, allowed member classes, interaction classes, delegation depth, resource/incarnation classes, provider boundaries, effect-path closure, budgets, mission invariants and enforcement boundaries.

## 11. Fixed-point closure
Conceptual closure:
1. Start with direct effects.
2. Add pairwise interactions.
3. Add higher-order hyperedges triggered by current members.
4. Add reachable resources, providers, queues, recovery and compensation paths.
5. Recompute affected invariants.
6. Add newly relevant members.
7. Repeat to a safety-relevant fixed point.
8. Freeze the closure.
9. Validate aggregate, temporal and nonlinear constraints.
10. Establish protected coordination.
A single pass is unsafe because adding one member can expose another interaction.

## 12. Open-world boundary
For an open environment, globally complete hypergraph closure cannot generally be established by local observation alone. The earlier strategy still applies: closed world, enforceable boundary, explicit environment assumptions, or weakened claim.

## 13. Group coordination domain
Candidate GroupCoordinationDomain is the smallest authoritative scope capable of jointly validating all hyperedges relevant to the claim. It may be larger than a pairwise CCD but smaller than the entire mission.

## 14. Formal direction
Candidate SAFE_COMPOSITION(S,M,C) requires every relevant joint transition of S to preserve M, including higher-order constraints.
Candidate theorem: if relevant hyperedges are represented, closure is complete/current, all permitted joint/interleaved transitions preserve M, aggregate and temporal constraints hold, dynamic membership is bounded, recovery/compensation/retry paths are included, and environment assumptions hold, then the group claim can be reduced to the verified group model.
This is a candidate theorem requiring formal proof/refinement.

## 15. Inductive-invariant boundary
TLA+ safety reasoning commonly seeks an inductive invariant that is implied by Init and preserved by every Next step. For higher-order composition, the invariant must be preserved by the joint transition relation, not merely by isolated member transitions. citeturn0search27turn0search29

## 16. Invariant family INV-HO-01..36
01 Pairwise disjointness does not imply group disjointness.
02 Pairwise commutativity does not imply set commutativity.
03 Group interaction can exist without pairwise conflict.
04 Higher-order interaction is claim-specific.
05 Higher-order interaction can be nonlinear.
06 Threshold interactions require group analysis.
07 Interaction arity is safety-relevant.
08 Required arity must be covered by the claim.
09 Unknown higher-order interaction is not absence.
10 Group safety requires joint-transition reasoning.
11 Safe members do not imply safe composition.
12 Safe pairs do not imply safe group.
13 Temporal overlap can create higher-order interaction.
14 Transfer cycles can create higher-order interaction.
15 Recovery can increase interaction arity.
16 Compensation can create new hyperedges.
17 Retries/redrives can create new hyperedges.
18 Provider continuations belong to group closure.
19 Unknown external members cannot be silently excluded.
20 Dynamic membership invalidates static group proofs unless bounded.
21 ScopeEnvelope must bound dynamic cardinality when used.
22 Aggregate budget does not replace invariant proof.
23 Nonlinear invariants require direct evaluation.
24 Group CCD may exceed pairwise CCD.
25 Group CCD need not equal mission-wide CCD.
26 Closure must reach a safety-relevant fixed point.
27 Closure incompleteness invalidates strong claims.
28 Bounded closure must have explicit assumptions.
29 Open-world claims require boundary/assumption discipline.
30 Group state must be current and continuity-bound.
31 Resource incarnation changes invalidate incompatible group evidence.
32 STOP/recovery can invalidate group reductions.
33 Formal group safety requires joint transition/refinement evidence.
34 TLC/SANY absence means no formal verification claim.
35 Implementation enforcement remains separate from model safety.
36 Higher-order claims require explicit evidence and invalidation conditions.

## 17. Architectural result
The authoritative safety model is now better represented as:
EFFECTS + HYPEREDGES + INVARIANTS + TEMPORAL RELATIONS + CLOSURE
Pairwise graphs remain useful for discovery and optimization, but they are not the ultimate safety model.

## Remaining gaps
G-HO-01 formal hypergraph closure.
G-HO-02 higher-order interaction discovery.
G-HO-03 arity-bound soundness.
G-HO-04 nonlinear invariant formalization.
G-HO-05 fixed-point termination/boundedness.
G-HO-06 temporal hyperedge semantics.
G-HO-07 recovery/compensation hyperedge generation.
G-HO-08 provider/open-world hyperedge closure.
G-HO-09 dynamic membership enforcement.
G-HO-10 group CCD computation.
G-HO-11 compositional proof/refinement.
G-HO-12 formal model size/state explosion.
G-HO-13 actual TLC/SANY.
G-HO-14 implementation refinement.
G-HO-15 adversarial fault injection.
G-HO-16 long-duration dynamic-membership testing.

## Conclusion
The research establishes a major architectural boundary: PAIRWISE ANALYSIS IS NOT A COMPLETE SAFETY MODEL.
Strong current principle: a coordination reduction is safe only when every higher-order interaction capable of changing the truth of the claim is represented, bounded by an enforceable boundary, or proven irrelevant to that claim.
This is a research/design principle, not a verified theorem.

## Next attack
HYPERGRAPH CLOSURE + STATE-SPACE EXPLOSION + BOUNDED ABSTRACTION.
Question: once higher-order closure is required, how can Nexo avoid unbounded combinatorial growth while preserving soundness through abstraction, conservative over-approximation, compositional invariants, symmetry or bounded envelopes, without silently underapproximating dangerous interactions?