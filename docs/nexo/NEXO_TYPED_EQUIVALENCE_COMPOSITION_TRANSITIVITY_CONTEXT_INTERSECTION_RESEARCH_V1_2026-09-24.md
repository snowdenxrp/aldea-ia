# NEXO — Typed Equivalence Composition, Transitivity, Context Intersection and Non-Amplification V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack composition of equivalence/translation claims across multiple adapters and contexts: A→B→C, including temporal gaps, policy changes, hidden dependencies, losses, unknowns, and effect/enforcement changes.

## 2. Central finding
Equivalence is not a universal transitive relation. It is a typed, property-scoped relation whose transitivity requires explicit composition conditions.

Core:
`A ≈_P B` and `B ≈_P C` do not automatically imply `A ≈_P C`.

A safe composite equivalence needs a composable context, preserved security distinctions, compatible domains, temporal overlap/causal bridge, dependency closure, and non-amplification.

Lamport's refinement work supports this distinction: implementation/refinement is established by an explicit mapping and implication, not by resemblance of components. He also treats composition as requiring explicit assumptions about component specifications and their environments rather than simply assuming that individually valid components compose. citeturn0search18turn0search21

## 3. New object: EquivalenceCompositionContext
Candidate fields:
- composition_id
- source/target chain
- property type
- source/target claim scopes
- semantic domains
- protocol/schema/parser/canonicalization contexts
- policy/invariant generations
- authority epochs
- effect/attempt identities
- resource incarnations
- temporal intervals
- causal bridges
- transformation sequence
- cumulative loss set
- cumulative unknown set
- dependency closure
- failure-domain/common-mode closure
- enforcement/effect closure
- invalidations
- composition operator
- proof/support graph
- publication state.

## 4. Transitivity conditions
Candidate safe transitivity theorem shape:

If:
1. A≈P B under context C1;
2. B≈P C under context C2;
3. C1 and C2 are compatible for property P;
4. the intermediate representation B preserves all P-relevant distinctions;
5. transformations compose without introducing unaccounted loss/unknown;
6. dependency/effect/enforcement closures are jointly closed;
7. temporal validity overlaps or a protected causal bridge exists;
8. invalidations are absent or explicitly propagated;
9. composition does not amplify scope;

then a composite A≈P C may be established under a new context C3.

This is a candidate rule, not a proven theorem.

## 5. Context intersection
Composite context should not simply be the union of assumptions.

Candidate:
`RequiredContext(A≈C) = SECURITY_RELEVANT_INTERSECTION/COMPOSITION(C1,C2)`
with explicit closure expansion for dependencies and effects.

The safest default is not “take whichever context is stronger,” but construct a fresh composition context and recompute closure.

## 6. Loss accumulation
A→B loses distinction d1.
B→C loses d2.

Even if d1 is irrelevant to the first claim and d2 irrelevant to the second, d1+d2 may jointly matter.

Therefore:
`LOSS(A→C) != LOSS(A→B) ∪ LOSS(B→C)`
as a purely syntactic operation unless semantic interaction has been checked.

Candidate `CumulativeLossInteraction`.

## 7. Unknown accumulation
A has UNKNOWN x.
A→B preserves x.
B→C maps x to a concrete value.

That is an assurance promotion unless the second transformation has independent evidence.

Rule:
`UNKNOWN` must propagate through the chain unless a protected resolution event proves otherwise.

## 8. Scope amplification
A has scope S.
A→B preserves S.
B→C accidentally interprets an omitted tenant/resource constraint as global.

Then:
`S_C > S_A`.

This is forbidden.

Candidate:
`COMPOSED_SCOPE <= VERIFIED_SOURCE_SCOPE`
for all security dimensions unless a new protected authorization transition explicitly grants additional scope.

## 9. Policy-context drift
A≈B under P3.
B≈C under P4.

If P3 and P4 are not explicitly compatible for property P, the chain cannot be treated as one continuous authorization equivalence.

Historical equivalence can remain valid as historical evidence while current equivalence becomes UNKNOWN.

## 10. Invariant drift
A→B preserves I3.
B→C is verified under I4.

If I4 is stronger, prior proof may be insufficient.
If I4 is weaker, the chain must not retroactively amplify authority.

Need explicit invariant compatibility/refinement.

## 11. Temporal gap
A≈B valid in interval T0-T1.
B≈C valid in T2-T3.
T1 < T2.

No overlap exists.

Without a protected causal bridge showing that the relevant semantics remained continuous, composite current equivalence is UNKNOWN.

## 12. Resource replacement
B refers to resource incarnation R7.
C refers to same provider identifier but incarnation R8.

Same identifier does not establish effect equivalence.

A composite effect claim requires:
`ResourceIncarnation(A) → ResourceIncarnation(B) → ResourceIncarnation(C)`
with explicit causal bridges.

## 13. Hidden dependency interaction
T1 and T2 are individually sound but both depend on hidden service H.

If H can alter both translations, the apparent two-step independence is false.

Therefore:
`PAIRWISE_VALIDITY != COMMON_MODE_INDEPENDENCE`.

Dependency closure must be composed before claiming independent support.

## 14. Circular composition
A certificate proves A≈B using B's equivalence certificate.
B's certificate proves B≈C using C.
C's certificate ultimately depends on A.

This creates:
A → B → C → A.

An unsupported assurance SCC cannot establish the composite equivalence.

## 15. Non-associativity
Even when pairwise operators exist:
`(A ⊗ B) ⊗ C`
may not have the same security semantics as:
`A ⊗ (B ⊗ C)`.

Reasons:
- different context binding;
- different loss propagation;
- different authority cutoff;
- different temporal boundaries;
- different effect scope;
- different common-mode closure.

Therefore associativity is a claim to prove, not a property to assume.

## 16. Non-commutativity
Translation order can matter:
`A → B → C`
may preserve a security field that:
`A → C → B`
does not.

Policy migration followed by schema migration may differ from schema migration followed by policy migration.

Composition order must be explicit where transformations affect security semantics.

## 17. Idempotence is also claim-specific
Applying the same normalization twice may be idempotent.

Applying the same authority translation twice may not be:
- it could consume a capability;
- advance a generation;
- change an audit branch;
- produce a new effect identity.

Therefore:
`T(T(x)) = T(x)`
requires proof for the relevant property.

## 18. Intermediate representation as a security boundary
B is not merely a transport format.

If B drops:
- tenant identity;
- resource incarnation;
- authority epoch;
- revocation;
- policy generation;
- effect identity;

then B can become an authority-amplifying boundary.

Candidate invariant:
`INTERMEDIATE_REPRESENTATION_MUST_PRESERVE_ALL_SECURITY_DISTINCTIONS_REQUIRED_BY_DOWNSTREAM_CLAIMS`.

## 19. Fresh composition context
Do not simply copy C1 or C2 into C3.

C3 should be newly derived from:
- both contexts;
- transformation chain;
- cumulative loss/unknown;
- dependencies;
- temporal/causal bridge;
- current authority;
- effect/enforcement closure.

This prevents “context laundering.”

## 20. Context laundering attack
A weak target context is substituted into a chain because it has fewer constraints.

Example:
A claim requires P4/I4.
Adapter maps it to B with P3/I3.
Because B's older context is easier to satisfy, a composite certificate is generated and then presented as A-equivalent.

Rule:
`CONTEXT_PROJECTION_CANNOT_RELAX_SECURITY_REQUIREMENTS`
without explicit attenuation/degraded claim.

## 21. Historical proof reuse
A composite equivalence certificate can remain useful as historical evidence but cannot automatically support a current authorization after:
- root rotation;
- policy change;
- invariant change;
- resource replacement;
- dependency change;
- protocol change;
- revocation.

Proof reuse requires current context compatibility.

## 22. Effect-specific composition
For effect equivalence, composition must additionally include:
- effect identity;
- attempt lineage;
- provider contract;
- idempotency;
- ordering;
- timeout;
- retries/redrives;
- callback paths;
- compensation;
- resource incarnation;
- reconciliation.

Semantic transitivity alone is insufficient.

## 23. Enforcement-specific composition
If A and B have equivalent authorization semantics but B has a weaker enforcement boundary, the composite claim cannot inherit A's stronger prevention property.

Candidate:
`ENFORCEMENT_SCOPE_COMPOSITE <= VERIFIED_ENFORCEMENT_INTERSECTION/COMPOSITION`.

## 24. Setwise closure
For n transformations, pairwise checks are insufficient.

Candidate algorithmic concept:
1. build transformation graph;
2. compute semantic/property closure;
3. compute dependency closure;
4. compute effect-path closure;
5. compute enforcement closure;
6. compute temporal/causal closure;
7. compute invalidation closure;
8. evaluate cumulative loss/unknown;
9. evaluate common-mode dependencies;
10. publish only if composite scope is within verified closure.

This is architectural research, not an implementation plan yet.

## 25. Formalization implications
Future TLA+ model should type the relation:
`Equivalent(source,target,property,context)`
rather than use one generic equivalence predicate.

Composition action should create a fresh context and explicitly check:
- property compatibility;
- semantic domain compatibility;
- loss/unknown preservation;
- authority non-amplification;
- dependency closure;
- temporal/causal continuity;
- invalidation;
- effect/enforcement closure.

TLA+ can check invariants over all behaviors of a finite model, while refinement mappings can relate a lower-level implementation to a higher-level specification; those checks still depend on the model's declared state space and assumptions. citeturn0search2turn0search18

## 26. Candidate invariants
EC-01 NO_UNTYPED_TRANSITIVE_EQUIVALENCE
EC-02 TRANSITIVITY_REQUIRES_COMPATIBLE_CONTEXT
EC-03 INTERMEDIATE_REPRESENTATION_PRESERVES_REQUIRED_SECURITY_DISTINCTIONS
EC-04 UNKNOWN_CANNOT_BE_SILENTLY_RESOLVED
EC-05 CUMULATIVE_LOSS_CANNOT_EXCEED_CLAIM_TOLERANCE
EC-06 COMPOSED_SCOPE_CANNOT_AMPLIFY_SOURCE_SCOPE
EC-07 POLICY_CONTEXT_DRIFT_BLOCKS_CURRENT_AUTHORIZATION_EQUIVALENCE
EC-08 INVARIANT_DRIFT_REQUIRES_COMPATIBILITY_OR_REPROOF
EC-09 TEMPORAL_GAPS_BLOCK_CURRENT_COMPOSITE_EQUIVALENCE
EC-10 RESOURCE_INCARNATION_MUST_BE_CONTINUOUS_OR_EXPLICITLY_REBOUND
EC-11 COMMON_MODE_DEPENDENCIES_ARE_INCLUDED_IN_COMPOSITE_CLOSURE
EC-12 UNSUPPORTED_EQUIVALENCE_SCC_CANNOT_JUSTIFY_CURRENT_CLAIM
EC-13 ASSOCIATIVITY_MUST_BE_PROVED_PER_OPERATOR/PROPERTY
EC-14 COMMUTATIVITY_MUST_BE_PROVED_PER_OPERATOR/PROPERTY
EC-15 IDEMPOTENCE_MUST_BE_PROVED_PER_OPERATOR/PROPERTY
EC-16 CONTEXT_PROJECTION_CANNOT_RELAX_SECURITY_REQUIREMENTS
EC-17 HISTORICAL_COMPOSITE_PROOF_CANNOT_AUTO-BECOME_CURRENT
EC-18 EFFECT_EQUIVALENCE_REQUIRES_EFFECT_AND_RESOURCE_CLOSURE
EC-19 ENFORCEMENT_CLAIM_CANNOT_EXCEED_COMPOSITE_ENFORCEMENT_CLOSURE
EC-20 COMPOSITE_CURRENTNESS_REQUIRES_FRESH_COMPOSITION_CONTEXT.

## 27. Open gaps
EC-G1 Formal algebra of typed equivalence.
EC-G2 Conditions for safe transitivity.
EC-G3 Cumulative loss interaction.
EC-G4 Unknown-resolution proof contract.
EC-G5 Setwise/higher-order composition.
EC-G6 Associativity/commutativity/idempotence per property.
EC-G7 Common-mode closure automation.
EC-G8 Temporal/causal composition.
EC-G9 Effect/provider equivalence composition.
EC-G10 Enforcement-equivalence composition.
EC-G11 Refinement of adapters.
EC-G12 SANY/TLC/TLAPS validation.

## 28. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.