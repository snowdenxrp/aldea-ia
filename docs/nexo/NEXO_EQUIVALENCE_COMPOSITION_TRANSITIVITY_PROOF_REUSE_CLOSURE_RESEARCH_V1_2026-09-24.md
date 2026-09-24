# NEXO — Equivalence Composition / Transitivity / Proof-Reuse Closure Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/runtime/deployment verification claimed.

## 1. Attack objective
Determine when multiple local equivalence or translation claims may be composed into a stronger global claim without creating an unsound authority or assurance result.

Core rules:
LOCAL_EQUIVALENCE != GLOBAL_EQUIVALENCE
PAIRWISE_COMPATIBILITY != SETWISE_COMPATIBILITY
VALID_PARTIAL_CLAIMS != VALID_COMPOSITE_CLAIM
TRANSITIVE_SYNTAX != TRANSITIVE_SECURITY_MEANING

## 2. External evidence
Lamport's refinement work provides the relevant formal boundary: an implementation satisfies a higher-level specification when a refinement mapping establishes the required relation; invariants of the higher-level specification transfer through a valid refinement mapping. This supports treating composition as a proof obligation rather than assuming that compatible-looking local mappings compose automatically. His Byzantine Paxos example explicitly checks successive refinements and distinguishes checked safety from unverified liveness.
RFC 3930 also emphasizes that what information is significant for security and how it is canonicalized is application/protocol dependent, reinforcing that equivalence cannot be treated as a universal syntactic property.

## 3. Composition attacks
EC-A Pairwise chain with changing claims: A~B for claim C1, B~C for claim C2. No basis for A~C under C1/C2.
EC-B Pairwise security equivalence with incompatible contexts: A~B under policy P1 and B~C under P2. Composition silently spans a policy boundary.
EC-C Hidden dependency intersection: A~B and B~C each omit a dependency that is different in the other claim. Pairwise checks pass while global closure fails.
EC-D Mixed generations: A is generation G1, B bridges G1/G2, C is G2, but the bridge does not prove preservation of authority semantics.
EC-E Scope union: A preserves R1 and B preserves R2; composition is treated as preserving R1+R2 although neither certificate proves joint closure.
EC-F Effect identity split: A and B refer to the same logical operation but different effect attempts/resource incarnations. Composition could erase duplicate-effect or replacement boundaries.
EC-G Independent-root mismatch: certificates rely on roots that are individually valid but share a common compromised dependency.
EC-H Circular composition: A~B depends on C~D, which depends on A~B. No independent support.
EC-I Temporal gap: each local claim is valid at publication time, but their combined contexts never existed simultaneously.
EC-J Invalidation race: one component claim is invalidated while the composite claim remains cached.
EC-K Projection reversal: A→B is a safe attenuation, B→C is a safe attenuation under B's context, but a composite adapter restores information as if it were authoritative.
EC-L UNKNOWN collapse: one local claim contains bounded UNKNOWN; composition treats the unknown as resolved because other certificates are valid.
EC-M Non-associative composition: (A+B)+C satisfies one contract while A+(B+C) satisfies another.
EC-N Cross-protocol composition: audit equivalence + recovery equivalence is mistaken for execution authorization.
EC-O Compaction bridge: a compacted summary is locally equivalent to raw history for one claim, then reused as if equivalent for a stronger claim.

## 4. Candidate composition contract
CompositionContract must identify:
claim family
operator (AND/OR/intersection/bounded-union/sequence/attenuation/etc.)
source claims
common target claim
shared context requirements
policy/invariant generations
authority epoch
ordering domain
effect/resource identity closure
dependency/failure-domain closure
loss/unknown union
temporal overlap requirements
invalidation triggers
independent assurance root
composition verification method

Rule:
NO_GLOBAL_CLAIM_FROM_LOCAL_CLAIMS_WITHOUT_EXPLICIT_COMPOSITION_CONTRACT

## 5. Context intersection
For a composed claim, the safe context is not the union of all optimistic assumptions. Candidate:
COMPOSABLE_CONTEXT = INTERSECTION_OF_REQUIRED_SECURITY_CONTEXTS + EXPLICIT_COMPOSITION_RULE
If a required security property is absent from the intersection, composition cannot inherit it merely because another component possessed it.

## 6. Loss and unknown propagation
Candidate conservative operator:
COMPOSED_LOSS = UNION_OF_RELEVANT_LOSSES
COMPOSED_UNKNOWN = UNION_OF_RELEVANT_UNKNOWNS
unless the composition contract proves that a specific loss/unknown is irrelevant or resolved by an independent protected fact.

Therefore:
VALID(A) + VALID(B) does not imply COMPLETE(A+B).

## 7. Temporal composition
Each claim has a validity interval/context. Composition requires an explicit temporal relation:
T0/T1 overlap, ordered transition, or a protected bridge.
Historical validity at different times cannot automatically produce a state that was ever jointly authorized.

## 8. Invalidation closure
A composite claim must depend on every constituent claim and every dependency that can invalidate the composed property.
Candidate:
INVALIDATE(component_i) => INVALIDATE(all_composites_relying_on_component_i)
unless an explicit alternate proof path preserves the composite claim.

This extends the existing invalidation research: invalidation event != invalidation enforcement, and proof cache != assurance authority.

## 9. Non-amplification
Composition cannot produce stronger authority than the strongest explicitly justified composition operator permits.
Candidate:
AUTHORITY(COMPOSE(C1...Cn)) <= AUTHORITY_ALLOWED_BY_COMPOSITION_CONTRACT(C1...Cn)
AND/threshold/intersection semantics must never be inferred from a generic list of valid certificates.

## 10. Refinement boundary
For formal verification, each semantic translation or adapter should eventually have an explicit refinement relation to the abstract claim it is supposed to implement.
A valid implementation refinement can transfer an invariant from an abstract specification; without such a relation, syntactic similarity or local tests are not evidence that the global semantic property is preserved.

## 11. Candidate invariants
EC-01 LOCAL_EQUIVALENCE_DOES_NOT_IMPLY_GLOBAL_EQUIVALENCE
EC-02 PAIRWISE_COMPATIBILITY_DOES_NOT_IMPLY_SETWISE_COMPATIBILITY
EC-03 COMPOSITION_REQUIRES_EXPLICIT_OPERATOR_AND_TARGET_CLAIM
EC-04 COMPOSITION_CONTEXT_MUST_BE_CLOSED_OVER_ALL_SECURITY_RELEVANT_DEPENDENCIES
EC-05 RELEVANT_LOSS_AND_UNKNOWN_PROPAGATE_CONSERVATIVELY
EC-06 MIXED_GENERATION_CLAIMS_REQUIRE_EXPLICIT_PROTECTED_BRIDGE
EC-07 TEMPORALLY_DISJOINT_VALIDITY_DOES_NOT_CREATE_JOINT_AUTHORIZATION
EC-08 COMPONENT_INVALIDATION_PROPAGATES_TO_DEPENDENT_COMPOSITE_CLAIMS
EC-09 SHARED_COMPROMISED_DEPENDENCY_PREVENTS_INDEPENDENT_COMPOSITION
EC-10 CIRCULAR_COMPOSITION_WITHOUT_INDEPENDENT_ROOT_IS_INVALID
EC-11 COMPOSITION_CANNOT_RECONSTRUCT_DELETED_SECURITY_CONTEXT
EC-12 COMPOSITION_CANNOT_WIDEN_AUTHORITY_BEYOND_ITS_EXPLICIT_OPERATOR
EC-13 EFFECT_IDENTITY_AND_RESOURCE_INCARNATION_MUST_BE_CLOSED_FOR_EFFECT CLAIMS
EC-14 COMPACTED_EQUIVALENCE_IS_CLAIM-SCOPED
EC-15 VALID_PARTIAL_CLAIMS_DO_NOT_AUTOMATICALLY_FORM_A_VALID_COMPOSITE_CLAIM
EC-16 REFINEMENT_OR_EXPLICIT_SEMANTIC_MAPPING_IS_REQUIRED_FOR_IMPLEMENTATION-LEVEL TRANSFER

## 12. Synthesis
The architecture now needs three distinct relations:
1. EquivalenceClaim — what one representation preserves relative to another for a named property.
2. CompositionContract — how several claims may be combined.
3. Refinement/CorrespondenceContract — how an implementation realizes the abstract claim.
These must not collapse into one generic compatibility or equivalence relation.

## 13. Formalization target
Model claim-specific equivalence, composition operators, dependency closure, temporal overlap, invalidation propagation, loss/unknown propagation, effect/resource identity, and refinement mappings. Attack associativity, commutativity, mixed generations, cache invalidation, circular dependencies, and cross-protocol composition.

## 14. Verification boundary
No SANY/TLC verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.