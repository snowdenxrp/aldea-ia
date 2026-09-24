# NEXO — Composition Algebra: Associativity / Commutativity / Threshold / Intersection Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/runtime/deployment verification claimed.

## 1. Attack objective
Determine whether composition operators over authorization, assurance, equivalence, and capability claims are associative, commutative, idempotent, monotonic, or order-sensitive. Do not assume algebraic properties that have not been defined and proven for the exact claim.

Core rule:
VALID_PARTS + VALID_PARTS != VALID_COMPOSITE

## 2. External cross-check
Current IETF EP-QUORUM draft material is useful as a concrete example: it requires all elements of its quorum predicate, binds members to the same action hash, checks roles and distinctness, and treats the satisfied predicate as approval evidence rather than complete authorization or proof of execution. This supports making the composition operator and its target semantics explicit rather than inferring them from a collection of valid signatures. [External source: IETF EP-QUORUM draft, September 2026.]
Lamport's refinement material likewise requires an explicit refinement mapping when transferring a higher-level invariant to a lower-level implementation; the relation is not inferred from local resemblance.

## 3. Operator taxonomy
AND_COMPOSITION: every required constituent must satisfy its contract.
OR_COMPOSITION: at least one permitted branch satisfies the contract; branch semantics must be explicit.
INTERSECTION_COMPOSITION: resulting authority/scope is the intersection of constituent scopes.
BOUNDED_UNION: union is permitted only over an explicitly closed and jointly authorized scope.
THRESHOLD_COMPOSITION: k-of-n predicate with explicit membership, distinctness, context, ordering, and consumption semantics.
SEQUENTIAL_COMPOSITION: later claim depends on a specific predecessor state/event.
ATTENUATION_COMPOSITION: target authority is no stronger than source authority under an explicit attenuation function.
CONDITIONAL_COMPOSITION: result depends on a predicate over contexts/resources/effects.
ABSORBING_COMPOSITION: combination enters a protected safe state and does not imply historical erasure.

## 4. Associativity attack
Test whether (A op B) op C equals A op (B op C).
For AND over identical claim types this may be mathematically associative, but security context can make the implementation-level operation non-associative if each intermediate result changes generation, scope, invalidation, or ownership.
Example: A and B produce an intermediate capability whose context is G1; combining with C under G2 may invalidate the intermediate. Reordering can therefore change whether the final claim is admissible.
Rule: algebraic associativity must be proven at the claim semantics, not assumed from the operator name.

## 5. Commutativity attack
Test whether A op B equals B op A.
Order is security-relevant when claims carry predecessor/successor semantics, leases, epochs, causal position, effect identity, or ordered approval trails.
Even threshold membership may be set-like only if the contract explicitly says order is irrelevant. An ordered quorum is not equivalent to an unordered set of signatures.

## 6. Threshold attack
A threshold is not merely count >= k.
Required context may include:
same target/effect identity
same policy/membership generation
authorized roles
distinct principals/keys where required
same transaction or explicit predecessor chain
same ordering domain
validity window
root/trust generation
dependency/failure-domain closure
consumption semantics
revocation state
current authority validation
Therefore k valid artifacts from different contexts must not automatically satisfy one threshold claim.

## 7. Intersection attack
Intersection is naturally authority-attenuating only if all scopes and constraints are represented correctly.
However, hidden defaults can turn intersection into union. Example: one claim has scope R1, another has unknown scope; treating unknown as universal can produce R1 ∪ Runknown instead of HOLD.
Rule:
UNKNOWN_SCOPE != UNIVERSAL_SCOPE
and:
INTERSECTION_WITH_UNKNOWN_SECURITY_SCOPE -> UNKNOWN/HOLD unless resolved.

## 8. Union attack
Union is dangerous because it can amplify authority.
Candidate rule:
BOUNDED_UNION_REQUIRES_EXPLICIT_CLOSURE_AND_JOINT_AUTHORIZATION
Two independently valid authorities do not automatically authorize their union.
This extends the multi-parent authority anti-amplification research.

## 9. Idempotence attack
Does A op A equal A?
Not necessarily. A repeated signature, approval, delegation, or effect attempt may be a duplicate rather than an idempotent repetition.
Threshold protocols may explicitly reject duplicate members; effect operations require effect identity/idempotency semantics.
Rule:
IDEMPOTENCE_IS_CLAIM_SPECIFIC_AND_MUST_NOT_BE_INFERRED_FROM_EQUAL_IDENTIFIERS.

## 10. Monotonicity attack
Does adding a valid claim always preserve or strengthen the composite result?
No general assumption is safe.
Adding a claim can introduce a conflicting policy generation, weaker dependency, stale root, incompatible scope, or a condition that makes the joint claim invalid.
Candidate:
ADDITIONAL_EVIDENCE_MAY_WEAKEN_OR_INVALIDATE_A_COMPOSITE_CLAIM_IF_IT_REVEALS_CONFLICT_OR_BREAKS_CLOSURE.

## 11. Consumption semantics
Some composition artifacts must be single-use or state-consuming.
A valid composite claim that has already been consumed cannot necessarily be reused merely because all component signatures remain cryptographically valid.
Therefore:
CRYPTOGRAPHIC_REUSABILITY != AUTHORIZATION_REUSABILITY
and consumption state belongs in the protected context when relevant.

## 12. Composition algebra contract
Candidate CompositionContract fields:
composition_id
operator
input_claim_ids
target_claim_type
target_scope
target_effect_identity
required_context_relation
associativity_semantics
commutativity_semantics
idempotence_semantics
monotonicity_semantics
threshold/membership rules
ordering/causal rules
generation compatibility
dependency closure
loss/unknown propagation
invalidation propagation
consumption semantics
authority non-amplification bound
verification method
independent assurance root

## 13. Candidate invariants
CA-01 NO_COMPOSITION_WITHOUT_EXPLICIT_OPERATOR
CA-02 OPERATOR_PROPERTIES_ARE_CLAIM_SPECIFIC
CA-03 THRESHOLD_COUNT_ALONE_DOES_NOT_ESTABLISH_AUTHORIZATION
CA-04 DISTINCTNESS_AND_ROLE_REQUIREMENTS_ARE_PART_OF_THRESHOLD_SEMANTICS_WHEN_REQUIRED
CA-05 ORDERED_AND_UNORDERED_COMPOSITION_ARE_NOT_INTERCHANGEABLE
CA-06 UNION_REQUIRES_EXPLICIT_CLOSURE_AND_CANNOT_AMPLIFY_AUTHORITY
CA-07 UNKNOWN_SCOPE_OR_CONSTRAINT_CANNOT_BE_TREATED_AS_UNIVERSAL
CA-08 IDEMPOTENCE_MUST_BE_EXPLICIT
CA-09 ADDING_EVIDENCE_MAY_REVEAL_CONFLICT_AND_INVALIDATE_COMPOSITION
CA-10 CONSUMED_COMPOSITION_ARTIFACT_CANNOT_BE_REUSED_WITHOUT_REUSE_AUTHORIZATION
CA-11 COMPONENT_GENERATION_AND_DEPENDENCY_CONTEXT_MUST_BE_COMPATIBLE
CA-12 COMPOSITION_INVALIDATION_PROPAGATES_TO_DEPENDENT_RESULTS
CA-13 COMPOSITION_SCOPE <= VERIFIED_JOINT_SCOPE
CA-14 EFFECT_COMPOSITION_REQUIRES_EFFECT_IDENTITY_AND_RESOURCE_INCARNATION_CLOSURE
CA-15 ALGEBRAIC_EQUALITY_MUST_NOT_BE_CONFUSED_WITH_AUTHORIZATION_EQUIVALENCE

## 14. Formalization target
Future formal model should encode operators as typed relations over claim objects, not generic set operations. For each operator, specify identity, domain/codomain, preconditions, postconditions, invalidation behavior, and algebraic properties that are actually intended. Then attack those properties with counterexamples before attempting proof.
Potential TLA+ structure: abstract claims and operators first; implementation mappings later. A refinement mapping can transfer a proven abstract invariant only after the implementation is shown to refine the abstract specification.

## 15. Verification boundary
No SANY/TLC verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.