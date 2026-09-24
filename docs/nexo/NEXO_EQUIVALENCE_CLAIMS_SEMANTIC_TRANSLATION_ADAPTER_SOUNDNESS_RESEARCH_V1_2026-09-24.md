# NEXO — Equivalence Claims / Semantic Translation / Adapter Soundness Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/runtime/deployment verification claimed.

## 1. Attack objective
Determine when Nexo may legitimately treat two different representations as equivalent for a specific claim, and prevent a local equivalence adapter from silently creating broader authority.

Core distinctions:
REPRESENTATION_EQUIVALENCE != SEMANTIC_EQUIVALENCE
SEMANTIC_EQUIVALENCE != AUTHORIZATION_EQUIVALENCE
CLAIM_EQUIVALENCE != GLOBAL_EQUIVALENCE
LOCAL_EQUIVALENCE != CURRENT_AUTHORITY

## 2. External evidence
WebAuthn is a useful concrete precedent: its verifier does not treat a valid signature as sufficient. It separately checks type, challenge, origin and other contextual bindings, and explicitly describes the type field as preventing signature-confusion attacks. The specification also scopes credentials to a relying party and requires origin validation. RFC 3930 notes that deciding what is significant versus insignificant during canonicalization is application/protocol dependent and therefore tied to the security meaning of the message.

## 3. Adversarial equivalence cases
EQ-A Claim-relative equivalence: A and B are equivalent for display but not equivalent for authorization.
Required result: equivalence must name its claim; display equivalence cannot satisfy authorization equivalence.
EQ-B Lossy projection: A contains policy generation and dependency context; B omits them. B is declared equivalent to A for current authorization.
Required result: DENY unless omitted information is proven irrelevant to the exact claim.
EQ-C Adapter privilege amplification: adapter maps a restricted capability into a richer type whose defaults grant broader scope.
Required result: transformation cannot increase authority.
EQ-D Semantic alias: fields with different names or encodings are declared equivalent without proving units, range, normalization, defaults, and policy role.
Required result: require explicit semantic compatibility contract.
EQ-E Context erasure: transformation drops generation, resource incarnation, or effect identity because the target schema has no field for it.
Required result: lost context becomes UNKNOWN/HOLD or forces reauthorization.
EQ-F Equivalence transitivity failure: A~B for claim C1 and B~C for claim C2, but A~C does not preserve either claim.
Required result: equivalence is not globally transitive across claims.
EQ-G Circular equivalence: certificate for A~B depends on B being equivalent to A, with no independent root.
Required result: self-supporting equivalence certificate is invalid.
EQ-H Cross-protocol translation: audit object A translated to execution object B; syntactic mapping succeeds but authorization semantics differ.
Required result: translation requires an explicit protected composition/transition.
EQ-I Historical equivalence: old artifact A and current artifact B are structurally equivalent but differ in current policy/root/membership.
Required result: historical semantic similarity does not create current authority.
EQ-J Partial-order equivalence: two operations commute under one resource state but not another.
Required result: commutativity/equivalence must be context-bound and claim-specific.
EQ-K Unknown preservation failure: adapter converts UNKNOWN into a concrete safe-looking value.
Required result: UNKNOWN cannot be silently collapsed into SAFE/ABSENT/NO_EFFECT.
EQ-L Multi-resource projection: A has complete scope over resources R1,R2,R3; B retains only R1,R2 but downstream interprets B as whole-mission scope.
Required result: scope cannot widen beyond verified projection.

## 4. Candidate objects
EquivalenceClaim; SemanticEquivalenceClaim; ClaimSpecificProjection; SemanticTranslationContract; AdapterTransformationContract; ProjectionCompletenessCertificate; LossSet; UnknownPreservationContract; AuthorityNonAmplificationCertificate; EquivalenceDependencyGraph; IndependentEquivalenceRoot.

## 5. Equivalence claim contract
Candidate fields:
claim_id
source_object_id
target_object_id
source_context
target_context
claim_type
security_properties_preserved
security_properties_not_preserved
loss_set
unknown_set
scope
policy/invariant generations
authority epoch
effect identity/resource incarnations when relevant
dependency closure
failure-domain assumptions
transformation identity
verification method
invalidation triggers
independent assurance root

Critical rule:
NO_EQUIVALENCE_CLAIM_WITHOUT_EXPLICIT_PROPERTY_SCOPE

## 6. Projection rule
A projection P from A to B may preserve a claim C only if the omitted information is proven irrelevant to C under the bound context.
Candidate:
PRESERVED_CLAIM(A,B,C) requires SECURITY_RELEVANT_DISTINCTIONS_FOR_C ⊆ INFORMATION_RETAINED_OR_PROTECTED_BY_P

Projection completeness is therefore claim-specific, not absolute.

## 7. Non-amplification rule
Candidate theorem:
AUTHORITY(B) <= VERIFIED_AUTHORITY(P(A))
where the ordering is defined by an explicit authority-scope relation and P is a protected transformation.
Informally: an adapter may preserve or attenuate authority; it may not manufacture authority from omitted or ambiguous context.

## 8. Unknown preservation
Adapters must preserve uncertainty unless a protected transition supplies new evidence.
UNKNOWN(A) → UNKNOWN(B) is the default for unresolved security-relevant information.
UNKNOWN(A) → SAFE(B) requires an explicit proof or independent authoritative observation.

## 9. Equivalence dependency graph
Equivalence certificates themselves have dependencies. A certificate must not depend on the object or evidence whose deletion, invalidation, or reinterpretation it is being used to justify.
Candidate rule:
EQUIVALENCE_CERTIFICATE_USED_TO_JUSTIFY_ITS_OWN_SECURITY_RELEVANT_INFORMATION_LOSS -> DENY

## 10. Context-sensitive transitivity
Do not assume:
A ~C B AND B ~C D => A ~C D
unless the equivalence contract explicitly proves transitivity for claim C under compatible contexts.
Likewise:
A ~C1 B AND B ~C2 D does not imply A ~C1/C2 D.

## 11. Translation state machine
REQUESTED → SOURCE_CONTEXT_VERIFIED → TRANSFORMATION_BOUND → LOSS_ANALYZED → TARGET_CONTEXT_BOUND → CLAIM_VERIFIED → TARGET_AUTHORITY_REVALIDATED → PUBLISHABLE
Any context mismatch, unknown security-relevant loss, stale dependency, or invalidated root sends the translation to HOLD/QUARANTINE.

## 12. Candidate invariants
EQ-01 EQUIVALENCE_IS_CLAIM_SPECIFIC
EQ-02 REPRESENTATION_EQUIVALENCE_DOES_NOT_IMPLY_AUTHORIZATION_EQUIVALENCE
EQ-03 LOSSY_PROJECTION_CANNOT_WIDEN_AUTHORITY
EQ-04 UNKNOWN_SECURITY_INFORMATION_MUST_BE_PRESERVED_OR_REPROVEN
EQ-05 EQUIVALENCE_CERTIFICATES_ARE_CONTEXT_AND_GENERATION_BOUND
EQ-06 EQUIVALENCE_DEPENDENCIES_MUST_BE_CLOSED
EQ-07 SELF_SUPPORTING_EQUIVALENCE_IS_INVALID
EQ-08 CROSS_PROTOCOL_TRANSLATION_REQUIRES_EXPLICIT_PROTECTED_TRANSITION
EQ-09 HISTORICAL_EQUIVALENCE_DOES_NOT_CREATE_CURRENT_AUTHORITY
EQ-10 COMMUTATIVITY/EQUIVALENCE_IS_CLAIM_AND_CONTEXT SPECIFIC
EQ-11 ADAPTERS_CANNOT_AMPLIFY_AUTHORITY
EQ-12 EQUIVALENCE_MUST_NOT_ERASE_EFFECT_IDENTITY_RESOURCE_INCARNATION_OR_AUTHORITY_GENERATION_WHEN_SECURITY_RELEVANT
EQ-13 EQUIVALENCE_COMPOSITION_REQUIRES_EXPLICIT_COMPATIBILITY_AND_DEPENDENCY_CLOSURE
EQ-14 CLAIM_SCOPE_AFTER_PROJECTION <= VERIFIED_PROJECTION_SCOPE

## 13. Architectural synthesis
This closes a conceptual gap between schema compatibility, semantic identity, proof reuse, authority binding, and adapter behavior.
The architecture should not have a generic boolean such as `equivalent=true`.
Instead it needs claim-scoped equivalence with explicit preserved properties, losses, unknowns, context, dependencies, and invalidation.

Key synthesis:
SEMANTIC EQUIVALENCE IS AN ASSURANCE CLAIM, NOT A FACT OF PARSING.

## 14. Formalization target
Future model should include claim-specific equivalence relations, partial projections, loss/unknown sets, dependency closure, independent assurance roots, and non-amplification constraints.
Adversarial model should include lossy adapters, cross-protocol translation, circular certificates, historical/current context changes, non-transitive equivalence, and UNKNOWN-to-SAFE collapse.

## 15. Verification boundary
No SANY/TLC verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.