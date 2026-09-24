# NEXO — Meta-Assurance / Root Composition / Trust-Basis Minimality Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack composition of multiple IndependentAssuranceBoundary objects. Determine whether combining individually acceptable roots can manufacture a stronger root, hide a shared dependency, or create a meta-assurance cycle.

## 2. Fundamental rule
ROOT_A_VALID + ROOT_B_VALID != META_ROOT_VALID.
Likewise:
ASSURANCE_A_VALID + ASSURANCE_B_VALID != INDEPENDENT_COMPOSITE_ASSURANCE.
Composition requires an explicit claim-specific contract and dependency closure.

## 3. Root composition graph
Each root should be represented as a typed support object, not merely a boolean trusted=true.
Candidate RootSupport:
root_id
root_type
claim_scope
semantic_context
trust_anchor
ordering_anchor
dependency_closure
failure_domain_closure
authority_epoch
generation
invalidations
composition_contract
independence_basis
assumptions

## 4. Shared-root collapse
R1 and R2 can both satisfy their local contracts while sharing a critical dependency D.
R1 → D
R2 → D
Therefore their combination cannot claim independence against failures in D.
Candidate:
COMPOSITION_INDEPENDENCE <= MINIMUM_EFFECTIVE_INDEPENDENCE_OF_COMPONENTS_AND_SHARED_DEPENDENCIES.

## 5. Root composition operators
Candidate operators:
AND_ROOT: both roots must hold.
OR_ROOT: at least one root must hold, but the claim must explicitly tolerate loss of the other.
INTERSECTION_ROOT: only the common claim scope is retained.
BOUNDED_UNION_ROOT: union is allowed only with explicit closure and joint authorization.
THRESHOLD_ROOT: threshold semantics require membership, distinctness, target identity, context, ordering, generation, and dependency closure.
SEQUENTIAL_ROOT: root B is valid only after a protected transition from A.
ATTENUATED_ROOT: composed claim is strictly weaker than its inputs.

Operator names do not imply algebraic properties such as associativity, commutativity, idempotence, or monotonicity. Those properties must be proved for the exact claim and contract.

## 6. Meta-root attack
Suppose:
Root A proves verifier A.
Root B proves verifier B.
Verifier A and B jointly produce MetaRoot M.
M then claims that A and B are independent.
If M's independence proof uses M itself, the composition is circular.
Candidate invariant:
COMPOSITE_ROOT_MUST_NOT_BE_USED_AS_EVIDENCE_OF_THE_INDEPENDENCE_THAT_JUSTIFIES_COMPOSITE_ROOT.

## 7. Minimal independent basis
Instead of seeking an abstract universal root, define a claim-specific minimal trusted basis.
Candidate:
MinimalTrustBasis(C) = smallest dependency-closed set of independently anchored assumptions sufficient to establish claim C.

Important: 'smallest' is a design objective, not yet a formal theorem. Different incomparable minimal bases may exist.

## 8. Multiple incomparable bases
For claim C:
Basis A = {constitutional root, ordering root}
Basis B = {resource-side enforcement root, external attestation}
Neither necessarily contains the other.
Therefore the architecture must not assume a single universal root if the claim can be established by different independently justified bases.
Candidate result classes:
PROVEN_BY_BASIS_A
PROVEN_BY_BASIS_B
PROVEN_BY_MULTIPLE_COMPATIBLE_BASES
UNRESOLVED

## 9. Root substitution attack
An attacker may replace a required root with another root that proves a superficially similar property.
Artifact integrity root != current authority root.
Identity root != authorization root.
Recovery root != mission authority root.
External attestation root != internal policy root.
Candidate:
ROOT_SUBSTITUTION_REQUIRES_EXPLICIT_SEMANTIC_COMPATIBILITY_AND_NON_AMPLIFICATION_PROOF.

## 10. Composition scope rule
Composite claim scope must not exceed the closure of the component claims plus the explicit composition contract.
Candidate:
COMPOSITE_CLAIM_SCOPE <= VERIFIED_COMPOSITION_CLOSURE_SCOPE.
Unknown scope remains unknown; it is never silently promoted to universal scope.

## 11. Composition temporal rule
Two roots valid at different generations are not automatically jointly valid now.
Need:
generation compatibility
temporal overlap
ordering relation
revocation state
policy/invariant compatibility
resource/effect identity compatibility where relevant.

Candidate:
HISTORICAL_ROOT_VALIDITY != CURRENT_COMPOSITE_ROOT_VALIDITY.

## 12. Root rotation attack
After root rotation:
old root may remain historically authentic.
It must not automatically remain current.
Any composite root containing a stale component is stale unless the composition contract explicitly proves that the component's historical property remains sufficient without current authority.

## 13. Independence lattice
Binary independent/dependent is insufficient.
Candidate levels:
I0 unknown
I1 same source
I2 different process/service but shared critical dependency
I3 distinct failure domains with shared trust root
I4 distinct trust and failure domains but shared semantic/toolchain assumptions
I5 claim-specific independent support with closed dependency and semantic compatibility.

Composition should not silently upgrade I-level.

## 14. Trust basis circularity
Even a declared constitutional root can be insufficient if the definition of the constitution is itself supplied by a lower-level authority under evaluation.
Therefore the top boundary must explicitly state which semantics are axiomatic/trusted assumptions and which are derived claims.
This is not a proof that the constitution is metaphysically true; it is a trust-model boundary.

## 15. Formal target
Define a typed algebra over RootSupport and AssuranceClaim where composition returns a claim plus explicit residual assumptions and dependency closure.
Do not model roots as ordinary sets with generic union/intersection semantics.
Each operator should be a relation:
Compose(operator, inputs, context) -> output_claim, residual_assumptions, dependency_closure, invalidations.

Then prove properties only where specified:
soundness
non-amplification
unknown preservation
scope preservation
generation compatibility
dependency closure
anti-circularity.

## 16. Refinement target
The abstract root-composition algebra should be defined before implementation. A concrete implementation can then be checked against it through an explicit refinement mapping; TLA+ documentation describes refinement as showing that a lower-level specification implements a higher-level one, and TLC can check refinement mappings for finite models. citeturn0search24turn0search25

## 17. Root-of-trust cross-check
NIST SP 800-193 explicitly distinguishes roots/chains of trust for update, detection, and recovery, and requires recovery capability to be anchored in a root or chain of trust. This supports treating root purpose and trust scope as typed rather than assuming one generic root proves every property. NIST's document is platform-firmware guidance, not a direct specification of Nexo's composition algebra. citeturn0search27turn0search5

## 18. Candidate invariants
MR-01 ROOT_A_VALID + ROOT_B_VALID DOES NOT IMPLY META_ROOT_VALID
MR-02 COMPOSITE_ROOT_REQUIRES_EXPLICIT_COMPOSITION_CONTRACT
MR-03 COMPOSITE_ROOT_CANNOT_PROVE_ITS_OWN_INDEPENDENCE
MR-04 SHARED_DEPENDENCIES_LIMIT_INDEPENDENCE
MR-05 ROOT_SCOPE_IS_CLAIM_SPECIFIC
MR-06 ROOT_SUBSTITUTION_REQUIRES_SEMANTIC_COMPATIBILITY
MR-07 HISTORICAL_ROOT_VALIDITY_DOES_NOT_IMPLY_CURRENT_ROOT_VALIDITY
MR-08 COMPOSITE_SCOPE_CANNOT_EXCEED_VERIFIED_COMPOSITION_CLOSURE
MR-09 UNKNOWN_SCOPE_OR_DEPENDENCY_IS_NOT_UNIVERSAL_SCOPE_OR_NO_DEPENDENCY
MR-10 COMPOSITION_MUST_NOT_SILENTLY_UPGRADE_INDEPENDENCE
MR-11 TEMPORAL/GENERATION_INCOMPATIBILITY_BLOCKS_CURRENT_COMPOSITION
MR-12 ROOT_PURPOSE_MUST_BE_EXPLICIT
MR-13 DIFFERENT_ROOTS_DO_NOT_IMPLY_COMPATIBLE_JOINT_AUTHORITY
MR-14 TRUST_BASIS_SEMANTICS_MUST_HAVE_AN_EXPLICIT_TRUST_BOUNDARY
MR-15 COMPOSITION_OPERATORS_HAVE_ONLY_CLAIM-SPECIFIC_ALGEBRAIC_PROPERTIES

## 19. New open gaps
MG1. Formal definition and algorithm for MinimalTrustBasis.
MG2. Efficient detection of shared hidden dependencies.
MG3. Formal algebra for non-amplifying root composition.
MG4. Composition of incomparable valid bases.
MG5. Dynamic membership/root rotation during composition.
MG6. Formal trust-boundary representation for constitutional semantics.
MG7. Refinement mapping from the abstract root algebra to executable implementation.
MG8. Finite-model strategy that does not falsely prove independence because the model omits hidden dependencies.

## 20. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.