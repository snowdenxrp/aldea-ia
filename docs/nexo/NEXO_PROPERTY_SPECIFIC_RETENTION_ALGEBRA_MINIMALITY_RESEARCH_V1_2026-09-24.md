# NEXO — Property-Specific Retention Algebra and Minimality V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Advance the previous retention round from the informal idea of a minimum to a precise algebra for deciding when one retained representation is sufficient for a property, when two representations are incomparable, and when a composite claim requires joint retention.

## Research cross-check
NIST defines assurance as credible evidence supporting a security or privacy claim, and its evidence-management program explicitly treats retention, preservation, integrity, and disposition as separate concerns. This supports a claim-scoped retention contract rather than a universal retention rule. citeturn0search10turn0search0
Lamport and Merz explain that refinement mappings may require history variables and that auxiliary variables can record past behavior without changing the implementation behavior. Lamport's refinement material also treats abstraction/refinement as the mechanism for relating different representations. This supports modeling retained summaries as abstractions whose sufficiency must be established for a particular property. citeturn0search24turn0search5

## 1. New distinction: sufficiency, minimality, optimality
`SUFFICIENT(R,P)` means retained representation R preserves enough information to establish property P under context C.
`MINIMAL(R,P)` means no strictly smaller representation under the chosen ordering remains sufficient for P.
`OPTIMAL(R,P)` requires an explicit cost function and therefore is stronger and different from semantic minimality.
Never infer minimality from sufficiency.
Never infer sufficiency from small size.

## 2. Retention partial order
Define a claim-scoped information preorder:
`R1 ⪯_P R2` iff R1 can support every P-relevant distinction that R2 supports, under the same context, without introducing additional assumptions.
This is semantic, not byte-count based.
Two representations can be incomparable:
`R1 ⪯_P R2` is false and `R2 ⪯_P R1` is false.

## 3. Minimal elements, not necessarily a unique minimum
For a property P, the safe set of sufficient representations can contain several minimal elements.
Therefore the architecture should seek a `minimal sufficient basis`, not assume a single globally least representation.
If a policy requires deterministic selection among incomparable bases, selection itself must be explicit and protected.

## 4. Cardinality is not semantic minimality
A 1 KB certificate can preserve more security-relevant information than a 100 MB log if the latter omits a critical binding.
Conversely, a tiny hash can be cryptographically strong while semantically insufficient because it does not preserve the distinction needed by the claim.
`SIZE_MINIMUM != INFORMATION_MINIMUM != TRUST_MINIMUM`.

## 5. Claim-preserving quotient
Candidate `ClaimPreservingQuotient(P,C)` partitions raw histories into equivalence classes only when substituting one member for another cannot change the truth of P within context C.
If two histories differ on a distinction relevant to P, they must not be collapsed into the same P-equivalence class.
This provides a formal target for safe semantic compaction.

## 6. Joint claims
If a composite claim is `P = P1 AND P2`, independently minimal bases for P1 and P2 may not be jointly sufficient because they can lose a cross-property relation.
Candidate `JointRequiredDistinctionSet(P1,P2)` must include both individual requirements plus relations needed to prove their composition.
`MINIMAL(P1) ∪ MINIMAL(P2) != automatically MINIMAL(P1 AND P2)`.

## 7. Cross-property relation preservation
Examples of relations that can disappear during independent compaction:
- same transaction;
- same causal branch;
- same resource incarnation;
- same authority epoch;
- same ordering domain;
- same policy generation;
- same effect identity;
- same provider execution;
- same failure-domain closure.
A composite summary must retain the relation itself or a sound certificate that preserves it.

## 8. Monotonicity of safe degradation
If retained information decreases, the supported claim may stay the same, weaken, become UNKNOWN, or become unsupported.
It must not become stronger solely because contradictory distinctions disappeared.
Candidate monotonic rule:
`R2 ⪯_P R1` cannot justify a stronger P-claim than R1 unless an explicit proof establishes that P is preserved.

## 9. Unknown preservation
Suppose raw history distinguishes A and B, but a compact summary cannot determine which occurred.
The summary must represent that uncertainty.
`COLLAPSE(A,B) → UNKNOWN_FOR_PROPERTY(P)` when A and B differ with respect to P.
This blocks the classic information-loss-to-certainty error.

## 10. Hidden dependencies and minimality
Minimality must be computed after sound dependency closure.
A representation that is minimal under a model with omitted dependency D may be unsound in the real environment if D can alter P.
`MODEL_MINIMUM != REAL_MINIMUM` when the model's dependency closure is incomplete.

## 11. Dynamic claims
A retention basis is not timeless.
Changes in policy, invariant, root, membership, provider contract, effect path, enforcement boundary, resource incarnation, or recognized recovery obligation can invalidate a previously minimal basis.
Therefore every retention certificate needs a context/generation and explicit invalidation triggers.

## 12. Retention certificates
Candidate `RetentionSufficiencyCertificate` fields:
- claim/property;
- scope and temporal interval;
- source history scope;
- retained representation;
- required distinction set;
- preserved distinction set;
- loss set;
- unknown set;
- dependency closure;
- effect/enforcement closure where applicable;
- abstraction/refinement relation;
- environment contract;
- authority/order/trust context;
- invalidation generation;
- verification method;
- reclamation authorization;
- successor/recovery method.

## 13. Reclamation as semantic transition
When raw evidence is replaced by a claim-preserving representation, reclamation is not merely storage maintenance.
Candidate transition:
`FREEZE → COMPUTE_CLAIM_CLOSURE → COMPUTE_REQUIRED_DISTINCTIONS → BUILD/VERIFY_ABSTRACTION → VERIFY_SUPPORT_CLOSURE → COMMIT_SUMMARY → COMMIT_RECLAMATION_AUTHORIZATION → RECLAIM → VERIFY_RETAINED_CLAIM_SCOPE`.
Any uncertainty at a safety-relevant gate causes HOLD/QUARANTINE or explicit claim degradation.

## 14. Incomparable bases
Suppose basis A preserves causal order and basis B preserves provider attestation. If neither semantically subsumes the other, the system has three safe choices:
1. retain both;
2. select one under an explicit property-specific contract if it is independently sufficient;
3. weaken the claim.
It must not silently choose the smaller byte representation.

## 15. Minimality cannot create independence
Removing shared dependencies does not make witnesses independent.
Conversely, retaining more witnesses does not prove independence.
`N_EVIDENCE_ITEMS != N_INDEPENDENT_SOURCES`.
Independence remains governed by the existing failure-domain/common-mode closure.

## 16. Minimality cannot create authority
A compact certificate, historical summary, or reconstruction certificate cannot itself become current authority.
`RETENTION_CERTIFICATE != AUTHORITY_CONTEXT`.
`HISTORICAL_SUPPORT != CURRENT_AUTHORIZATION`.

## 17. Connection to history variables
TLA+ history variables can record past behavior needed for refinement without being implemented state. This suggests a useful formal separation:
`IMPLEMENTATION_STATE` versus `ABSTRACT_CLAIM_HISTORY`.
A retained summary can represent the latter without retaining every implementation event, provided the refinement/abstraction relation is sound for the exact claim. citeturn0search24

## 18. Candidate algebra
Let `S(P,C)` be the set of representations sufficient for P under context C.
Define `R1 ⪯_P R2` when R1 preserves at least the P-relevant information of R2 without additional assumptions.
Then:
- sufficient representation = member of S(P,C);
- minimal sufficient representation = minimal element of S(P,C) under ⪯_P;
- unique minimum exists only if the ordering and domain provide one;
- incomparable minimal elements are legitimate;
- cost optimization is a separate layer.
This is a research algebra, not yet a formal theorem of the Nexo system.

## 19. Composite property rule
For P = compose(P1,...,Pn), define a joint basis rather than merely unioning independently minimized bases.
Candidate:
`JointBasis(P,C) = Closure(RequiredDistinctions(P), Relations(P), Dependencies(P), Assumptions(C))`.
The closure must be computed before minimization.

## 20. Candidate invariants
MR-19 SUFFICIENCY_PRECEDES_MINIMALITY
MR-20 SEMANTIC_ORDERING_NOT_BYTE_ORDERING
MR-21 MINIMAL_SUFFICIENT_BASIS_NEED_NOT_BE_UNIQUE
MR-22 INCOMPARABLE_BASES_REQUIRE_EXPLICIT_SELECTION_OR_RETENTION
MR-23 COMPOSITE_CLAIMS_REQUIRE_JOINT_DISTINCTION_CLOSURE
MR-24 CROSS_PROPERTY_RELATIONS_MUST_BE_PRESERVED
MR-25 INFORMATION_LOSS_MUST_PRESERVE_UNKNOWN_WHEN_DISTINCTIONS_COLLAPSE
MR-26 MODEL_MINIMALITY_CANNOT_EXCEED_VERIFIED_ENVIRONMENT_CLOSURE
MR-27 RETENTION_CERTIFICATE_IS_CONTEXT_AND_GENERATION_BOUND
MR-28 RETENTION_CERTIFICATE_INVALIDATES_ON_RELEVANT_CONTEXT_CHANGE
MR-29 MINIMALITY_CANNOT_CREATE_INDEPENDENCE
MR-30 MINIMALITY_CANNOT_CREATE_CURRENT_AUTHORITY
MR-31 RECLAMATION_IS_A_PROTECTED_SEMANTIC_TRANSITION_WHEN_CLAIM_SUPPORT_IS_AFFECTED
MR-32 CLAIM_STRENGTH_CANNOT_INCREASE_FROM_INFORMATION_LOSS
MR-33 COST_OPTIMALITY_IS_SEPARATE_FROM_SEMANTIC_MINIMALITY
MR-34 CLAIM_SCOPE_AFTER_RECLAMATION <= VERIFIED_RETAINED_SUPPORT_SCOPE.

## 21. Open gaps
MR-G11 Formal definition of the semantic preorder.
MR-G12 Conditions for existence/uniqueness of minimal elements.
MR-G13 Efficient computation of required distinctions.
MR-G14 Joint minimization across many simultaneous claims.
MR-G15 Formal quotient/refinement proof.
MR-G16 Dynamic environment and claim-expansion handling.
MR-G17 Privacy/cost optimization without weakening security.
MR-G18 Byzantine/common-mode dependency closure during minimization.
MR-G19 SANY/TLC/TLAPS encoding and checking.
MR-G20 Implementation refinement from retention algebra to actual storage.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime or deployment correctness claim. This document advances the research model only.