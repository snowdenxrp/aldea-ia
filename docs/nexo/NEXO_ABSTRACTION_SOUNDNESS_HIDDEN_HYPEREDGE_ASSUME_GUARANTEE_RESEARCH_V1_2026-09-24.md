# NEXO - ABSTRACTION SOUNDNESS / HIDDEN HIGHER-ORDER INTERACTIONS / ASSUME-GUARANTEE RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can an apparently valid abstraction and local assume/guarantee proof hide a higher-order interaction that invalidates the composed mission claim?

## External cross-check

Lamport's TLA+ material explicitly distinguishes assumptions and theorems as proof obligations, and composition requires the assumptions of a component to be satisfied by the environment in which it is instantiated. cite: turn0search1.

Lamport's work on open-system composition notes that ordinary implication-style assumptions can permit problematic circular behavior and presents stronger composition/decomposition results for open systems. cite: turn0search10, turn0search25.

TLA+ uses abstraction levels and refinement mappings to relate implementations to higher-level specifications; auxiliary variables may be needed to expose the higher-level behavior required for refinement. cite: turn0search21.

Lamport also emphasizes that a TLA+ model is itself an abstraction and that model checking a restricted model does not establish correctness of arbitrary implementations. cite: turn0search20, turn0search12.

## Core result

A local proof can be mathematically valid and still be unusable for a global mission claim if its abstraction has erased a claim-relevant interaction.

Therefore:

LOCAL_PROOF_VALID + ABSTRACTION_VALID_LOCALLY != GLOBAL_PROOF_VALID

unless the abstraction preserves the claim-relevant interaction closure and the assumptions compose without hidden circularity.

## Canonical failure

Concrete system: E1, E2, E3.

Mission invariant:

E1 + E2 + E3 <= 10

Local components expose only pairwise state. Each local proof establishes pairwise safety. All pass. But the concrete triple violates the invariant.

The error is not necessarily inside any local proof. The error is:

ABSTRACTION_CLOSURE_OMISSION.

## New distinction

Three things must remain separate:

1. Proof correctness relative to a model.
2. Model abstraction soundness relative to the concrete claim.
3. Composition validity across component assumptions.

Thus:

PROOF_VALID_FOR_MODEL != ABSTRACTION_SOUND_FOR_CLAIM != COMPOSITION_VALID.

Only their validated conjunction can support a stronger assurance claim.

## Candidate AbstractionBoundary

Fields:
- abstraction_boundary_id;
- claim_id;
- concrete_scope;
- abstract_scope;
- omitted state dimensions;
- omitted interactions;
- preserved predicates;
- preserved transitions;
- preserved temporal relations;
- preserved causal relations;
- preserved uncertainty correlations;
- preserved resource/incarnation identity;
- preserved boundary/fence semantics;
- preserved mission aggregates;
- environment assumptions;
- refinement relation;
- completeness status;
- soundness status;
- invalidation triggers.

Critical rule:

An omitted dimension is not safe merely because no conflict has been observed in that dimension. It is safe only if a claim-specific argument establishes that changing that dimension cannot change the truth of the claim.

## Hidden hyperedge attack

Suppose the abstraction records resource_usage(Ei) but omits combined_rate(E1,E2,E3).

Each pair satisfies the local rule. The hidden triple creates combined_rate > limit.

The abstraction therefore maps concrete states with different claim truth to the same abstract state. That is an invalid projection for that claim.

Candidate condition:

ProjectionComplete(P,M,C) requires that concrete states mapped to the same abstract state agree on every predicate needed to establish M and every transition distinction needed to preserve M.

## Counterexample-guided refinement

When a reduced model finds no violation, that does not establish abstraction soundness.

Candidate loop:

ABSTRACT MODEL
→ CHECK CLAIM
→ CONCRETE/REFINEMENT EVIDENCE
→ COUNTEREXAMPLE OR MISSING DISTINCTION
→ IDENTIFY OMITTED INTERACTION
→ REFINE ABSTRACTION
→ RECHECK.

A counterexample can be:
- concrete violating trace;
- hidden dependency;
- hidden shared footprint;
- hidden temporal overlap;
- hidden causal edge;
- hidden aggregate;
- hidden retry/compensation;
- hidden provider continuation;
- hidden recovery path.

No “looks equivalent” shortcut.

## Candidate RefinementContext

Fields:
- refinement_id;
- abstract_context;
- concrete_context;
- abstraction_map;
- refinement_map;
- simulation/refinement obligations;
- preserved invariants;
- preserved interactions;
- environment assumptions;
- provider/resource contracts;
- incarnation mapping;
- continuity context;
- proof obligations;
- counterexample history;
- currentness;
- invalidation conditions.

## Assume/guarantee composition hazard

Component A has assumptions and guarantees. Component B has assumptions and guarantees.

It is not enough to say:

A_safe AND B_safe => mission_safe.

We need to establish:
- A guarantees satisfy B assumptions;
- B guarantees satisfy A assumptions;
- shared environment satisfies both;
- combined guarantees imply the mission invariant.

If assumptions depend on each other's guarantees circularly, the cycle must be explicitly classified.

Candidate cycle classes:
- C0 independent;
- C1 one-way founded;
- C2 mutually dependent but formally justified;
- C3 circular unresolved;
- C4 invalid.

C3/C4 cannot support a strong composed claim.

## Stronger assumption rule

An assumption is not a fact.

Candidate assumption states:

KNOWN_VALID
UNKNOWN
INVALID
STALE
CIRCULAR_UNRESOLVED
CIRCULAR_VERIFIED
ENVIRONMENTAL
BOUNDARY_ENFORCED.

Only states appropriate to the claim can discharge an obligation.

UNKNOWN -> MAYBE_SAFE -> SAFE is forbidden.

## Temporal composition hazard

A component may guarantee SAFE_AT_ENTRY and SAFE_AT_EXIT without guaranteeing SAFE_DURING_EXECUTION.

For mission invariants involving occupancy, rate, mutual exclusion, resource conservation or transient states, intermediate behavior is claim-relevant.

Therefore compositional contracts must expose temporal interaction obligations where necessary.

## Recovery composition hazard

A component proof may assume NO_OLD_WORK_REMAINS while provider behavior actually permits retries/redrives after crash.

Another component may assume RECOVERY_FENCE_ACTIVE.

If the recovery fence exists only inside Nexo while the provider queue bypasses it, both local proofs can appear valid while the global system violates the mission invariant.

Thus recovery paths are part of composition closure.

## Scope widening hazard

A component proven safe under S1 may be reused under S2.

If S2 adds a provider, queue, resource, capability, effect class, policy or mission budget, the old proof may remain valid for S1 while being insufficient for S2.

Therefore:

PROOF_VALID(S1) != PROOF_REUSABLE(S2).

Reuse requires a compatibility/reduction proof.

## Candidate ProofReuseContract

Fields:
- proof_id;
- old_context;
- proposed_context;
- claim;
- dependency closure;
- abstraction identity;
- hypergraph closure;
- assumptions;
- external contracts;
- resource/provider incarnations;
- boundary generation;
- continuity context;
- compatibility relation;
- invalidation status;
- required rechecks;
- reuse decision.

Possible results:
- REUSE_VERIFIED;
- REUSE_WITH_RECHECK;
- RECOMPUTE;
- UNKNOWN;
- REJECT.

No reuse result itself grants authority.

## Composition closure

For claim M:

COMPOSITION_CLOSURE(M) =
effect closure
+ higher-order interaction closure
+ assumption closure
+ dependency closure
+ environment closure
+ boundary closure
+ recovery closure
+ temporal/causal closure
+ continuity/version closure.

A composed claim cannot exceed this closure.

## Candidate compositional soundness condition

For components C1...Cn and claim M:

COMPOSED_VALID(M) requires:
1. each local proof is valid for its own proof context;
2. every proof context is current/compatible;
3. abstraction is sound for M;
4. all claim-relevant higher-order interactions are represented;
5. assumptions are satisfied;
6. assumption cycles are resolved;
7. shared dependencies are included;
8. environment/boundary assumptions are explicit;
9. temporal/causal constraints are preserved;
10. uncertainty correlations are preserved;
11. recovery/compensation/retry paths are represented;
12. refinement to the concrete implementation is established to the required level.

If any required condition is UNKNOWN, strong composition is not established.

## Safe overapproximation

When the system cannot prove whether a hidden interaction exists, it can conservatively introduce one.

UNKNOWN_INTERACTION can be discharged by:
- conservative coordination;
- safe abstraction;
- independent enforcement boundary;
- claim weakening.

Not by assumption.

## Abstraction lattice

Candidate assurance states:
A0 EXACT
A1 SOUND_OVERAPPROX
A2 SOUND_CLAIM_ABSTRACTION
A3 BOUNDED_ASSUMPTION
A4 UNKNOWN
A5 UNSOUND

Only A0-A3 may potentially support a claim, and only if the specific claim contract permits that level.

A4/A5 cannot discharge the obligation.

## New architectural separation

The Assurance Plane now needs distinct objects:

ProofContext
ProofResult
AbstractionContext
AbstractionBoundary
RefinementContext
AssumptionGraph
CompositionContract
ProofReuseContract.

Do not collapse them into a single proof cache record.

This prevents proof cache hit -> mistaken abstraction compatibility -> mistaken composition -> authority.

## Candidate invariants INV-ASC-01..40

01 Local proof validity is model-relative.
02 Model-relative proof validity does not establish abstraction soundness.
03 Abstraction soundness is claim-relative.
04 Projection omission can hide higher-order interactions.
05 Hidden interaction is UNKNOWN, not absent.
06 Pairwise closure cannot discharge arbitrary higher-order closure.
07 Aggregate mission invariants require aggregate-preserving abstraction.
08 Temporal invariants require temporal-preserving abstraction.
09 Causal invariants require causal-preserving abstraction.
10 Recovery paths must be represented when they can affect the claim.
11 Provider retries/redrives must be represented.
12 Compensation paths must be represented.
13 Resource incarnations must be represented.
14 Boundary/fence semantics must be represented.
15 Assumptions are not facts.
16 UNKNOWN assumptions cannot silently discharge obligations.
17 Circular assumptions require explicit classification.
18 Unresolved circularity blocks strong composition.
19 Local guarantees must satisfy peer assumptions.
20 Shared environment assumptions must be validated.
21 Composition must imply the mission invariant.
22 Proof reuse requires current context compatibility.
23 Byte identity does not establish semantic compatibility.
24 Abstraction identity does not establish authority.
25 Proof cache hits never grant authority.
26 Overapproximation may reduce liveness but preserve safety.
27 Underapproximation of claim-relevant behavior is prohibited for strong claims.
28 Counterexamples require abstraction refinement.
29 No concrete behavior may be silently erased if it can affect the claim.
30 Refinement maps must preserve the required safety property.
31 Auxiliary variables may expose higher-level facts but do not create authority.
32 Recovery can invalidate a previously sound composition.
33 Scope widening can invalidate abstraction completeness.
34 External contract drift can invalidate composition.
35 Continuity changes can invalidate proof reuse.
36 Unknown dependency closure blocks strong composition.
37 Independent verification does not remove common-mode assumptions.
38 Composition claim strength cannot exceed its weakest required premise.
39 Safe non-convergence is preferred to false-current composition.
40 Formal model verification remains distinct from implementation verification.

## Candidate theorem

Not formally proven:

If each component proof is valid for a current context, every abstraction used is sound for the target claim, the full claim-relevant hypergraph and temporal/causal closure are preserved, all assumptions are satisfied without unresolved circularity, shared dependencies and environment boundaries are covered, and the implementation refines the composed abstract specification, then composition may support the target claim at the strength justified by those premises.

Removing any premise may invalidate the composition.

## Architecture consequence

The clean assurance pipeline becomes:

DEFINE CLAIM
→ BUILD COMPOSITION CLOSURE
→ BUILD HYPERGRAPH
→ DEFINE ABSTRACTION
→ CHECK PROJECTION COMPLETENESS
→ BUILD ASSUMPTION GRAPH
→ DETECT/RESOLVE CYCLES
→ CHECK DEPENDENCY/ENVIRONMENT/BOUNDARY CLOSURE
→ CHECK TEMPORAL/CAUSAL CLOSURE
→ VERIFY LOCAL PROOFS
→ VERIFY REFINEMENT
→ COMPOSE
→ PUBLISH CLAIM AT JUSTIFIED STRENGTH.

This is materially stronger than a proof-cache architecture.

## Formalization target

A future model should contain:
- three effects with hidden ternary invariant;
- an abstraction omitting the aggregate;
- local component proofs;
- assumption edges;
- a circular-assumption case;
- recovery retry;
- provider continuation;
- refinement map;
- abstraction refinement;
- safe overapproximation;
- reduced and full CCD.

The model should deliberately contain a false-composition trap and verify that the architecture classifies it as UNKNOWN/REJECT rather than SAFE.

TLA+ explicitly supports assumptions/theorems as proof obligations and refinement mappings, while TLC provides explicit-state checking of executable specifications. These tools support the intended formalization path, but no execution or proof result is claimed here. cite: turn0search1, turn0search5, turn0search21.

## Next attack

PROOF REUSE
+
SEMANTICALLY EQUIVALENT NEW CONTEXT
+
CHANGED POLICY
+
CHANGED EXTERNAL EFFECT CONTRACT
+
RESOURCE REPLACEMENT
+
PARTIAL INVALIDATION
+
CONCURRENT ADMISSION

Question: when is a proof genuinely reusable, when does it require rechecking, and when must it be rejected even if the old and new models appear semantically equivalent?