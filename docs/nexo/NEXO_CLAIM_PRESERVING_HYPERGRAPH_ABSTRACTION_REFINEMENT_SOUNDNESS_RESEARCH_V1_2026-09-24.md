# NEXO — Claim-Preserving Hypergraph Abstraction and Refinement Soundness Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Determine what it means for a compacted or projected SafetyClosureHypergraph to preserve a security claim, and define a candidate abstraction/refinement contract without assuming that node preservation is sufficient.

## External cross-check
Lamport describes refinement mappings as the relation by which a lower-level specification implements a higher-level specification, and notes that auxiliary variables can be added to make such mappings possible. His safety-proof material states refinement as a theorem relating the lower-level specification to the instantiated higher-level specification. citeturn0search24turn0search25
Lamport's TLA+ material also distinguishes auxiliary/history variables from implementation state, which is directly relevant to representing retained causal information without assuming that the full raw history remains physically stored. citeturn0search0turn0search1
NIST describes assurance as grounds for justified confidence that a security or privacy claim has been or will be achieved, and its assessment guidance treats evidence as something organized to support a claim. This supports keeping claim, evidence and assurance semantics distinct rather than equating a preserved artifact with a proved claim. citeturn0search16turn0search4

## 1. Central finding
A projection or compact representation is safe only relative to a property.
`ABSTRACTION_SOUND != ABSOLUTELY_INFORMATION_PRESERVING`.
The required question is:
`Does the abstraction preserve every distinction needed to determine the truth of property P within scope S and context K?`

## 2. Candidate `ClaimPreservingAbstractionContract`
Fields:
- property/claim identity;
- source hypergraph context;
- target abstraction context;
- source scope;
- target scope;
- retained node classes;
- retained hyperedge classes;
- quotient/equivalence relation;
- loss set;
- unknown set;
- environment boundary;
- dependency closure;
- authority/order/trust context;
- resource incarnations;
- temporal/causal bridge;
- invalidation triggers;
- proof/refinement method;
- resulting claim strength.

## 3. Property-specific preservation
Different claims need different preserved distinctions.
Example:
- accounting balance may need aggregate quantities and transaction identity;
- historical-effect absence needs complete relevant effect closure, ordering, incarnation and absence-capable evidence;
- current authority needs current ordering, authority epoch, policy/invariant, trust and revocation context;
- external-effect containment needs effect-path and enforcement closure.
Therefore one universal 'lossless summary' is not meaningful without a property.

## 4. Required distinction set
Candidate `RequiredDistinctionSet(P,K,S)` contains the semantic distinctions whose collapse can change the truth value of P within scope S and context K.
Abstraction is claim-preserving only if no two source states that differ on a required distinction are mapped to the same abstract state unless an explicit proof establishes that P has the same truth value in both.

## 5. Quotient condition
Let α map concrete states to abstract states.
A candidate soundness condition is:
`α(s1) = α(s2) AND RequiredDistinctions(P) preserved => P(s1) = P(s2)`.
This is a research target, not yet a formal theorem for Nexo.
If the condition cannot be established, the abstraction must return UNKNOWN or a weaker property.

## 6. Relation to refinement
The implementation-to-abstraction mapping should establish that every concrete behavior represented by the implementation corresponds to an allowed abstract behavior for the property being claimed.
Candidate direction:
`ConcreteSpec => AbstractSpec_under_refinement_mapping`.
Lamport gives this form explicitly for TLA+ refinement proofs. citeturn0search25

## 7. Refinement is not reconstruction
Reconstruction asks whether a historical claim can be recovered from surviving evidence.
Refinement asks whether implementation behavior is represented correctly by an abstract specification.
They interact but are not identical:
`RECONSTRUCTABLE != REFINED`.
`REFINED != HISTORICALLY COMPLETE`.

## 8. Loss set
Every transformation should identify what it loses.
Candidate classes:
- identity loss;
- ordering loss;
- causal loss;
- resource-incarnation loss;
- authority-generation loss;
- policy/invariant loss;
- membership/quorum loss;
- provider-execution loss;
- callback/retry lineage loss;
- compensation relation loss;
- independence/common-mode loss;
- temporal-boundary loss.
A loss is acceptable only if it is proven irrelevant to the exact claim.

## 9. Unknown preservation
Unknown must not be collapsed into a known value during abstraction.
`UNKNOWN(source) -> UNKNOWN(target)` is the conservative default unless the transformation has an explicit proof that the unknown distinction cannot affect the target property.
This continues the earlier Unknown Preservation Contract.

## 10. Scope preservation
An abstraction can preserve a claim while reducing scope.
For example:
`GLOBAL_EFFECT_CONTAINMENT` may become `BOUNDARY_EFFECT_CONTAINMENT`.
This is safe if the reduced scope is explicit and the claim is not published outside it.
`CLAIM_SCOPE_AFTER_ABSTRACTION <= VERIFIED_ABSTRACTION_SCOPE`.

## 11. Hyperedge preservation
Preserving all nodes and pairwise edges is insufficient when a security property depends on a multiway relation.
The abstraction must preserve required hyperedges or a sound summary of them.
`NODE_PRESERVATION != HYPEREDGE_PRESERVATION`.
`PAIRWISE_EDGE_PRESERVATION != JOINT_RELATION_PRESERVATION`.

## 12. Hidden hyperedge counterexample
Concrete state contains E,R,A,P with one joint contract.
Two abstract states collapse R1/R2 because provider ID is preserved but resource incarnation is removed.
All visible pairwise identities remain equal.
The historical effect claim can nevertheless change truth value.
Therefore the projection is unsound for that property.

## 13. Common-mode preservation
Two evidence sources may remain separate nodes after abstraction while their shared dependency is removed.
The abstraction would then falsely suggest independence.
Therefore independence claims require preservation of the relevant failure-domain/common-mode hyperedges.
`WITNESS_COUNT_AFTER_ABSTRACTION != INDEPENDENCE_PRESERVED`.

## 14. Authority non-amplification
An abstraction cannot transform historical or weaker information into stronger authority.
Candidate:
`AuthorityStrength(abstract) <= VerifiedAuthorityStrength(source)` unless a protected transition explicitly establishes new authority.
This extends the existing claim-degradation and authority-binding research.

## 15. Currentness preservation
An abstraction that preserves historical truth does not necessarily preserve currentness.
`HISTORICAL_PROPERTY_PRESERVED != CURRENT_AUTHORITY_PRESERVED`.
Currentness requires current authority/order/trust/dependency/resource/invalidation context.

## 16. Compositional abstraction
If A and B are independently claim-preserving, their composition is not automatically claim-preserving.
The composition must preserve the intersection/combination of their required distinctions and all cross-component hyperedges.
`SOUND(αA) + SOUND(αB) != SOUND(αB ∘ αA)` without a composition proof.

## 17. Minimality after soundness
Only after preservation is established may minimization be attempted:
`FIRST_SOUND_ABSTRACTION → THEN_MINIMIZE`.
Minimal cardinality, minimum storage cost and minimum trust basis are different optimization problems.
An abstraction with fewer bytes is not necessarily safer or semantically sufficient.

## 18. Incomparable abstractions
There may be two abstractions A and B that preserve the same property but retain different distinctions.
`A != B`, yet both may be sufficient.
Therefore there may be multiple incomparable minimal representations.
The architecture must not assume a unique canonical minimum unless proven.

## 19. Dynamic re-abstraction
New dependencies, claims, effects, policy versions, resource incarnations or recovery obligations can invalidate the abstraction.
Re-abstraction sequence:
`CHANGE → IMPACT ANALYSIS → INVALIDATE AFFECTED CERTIFICATE → EXPAND REQUIRED DISTINCTIONS → BUILD NEW ABSTRACTION → RECHECK REFINEMENT → REVALIDATE CLAIM`.

## 20. Candidate certificate
`ClaimPreservationCertificate` should bind:
- claim/property;
- concrete context fingerprint;
- abstract context fingerprint;
- required distinctions;
- preserved hyperedges;
- loss/unknown set;
- scope;
- environment boundary;
- common-mode closure;
- refinement mapping;
- dependency closure;
- invalidation triggers;
- verification method;
- generation/epoch.

## 21. Formal target
Future formalization should define:
1. concrete state space;
2. abstract state space;
3. abstraction function α;
4. required-distinction predicate;
5. claim predicate P;
6. hyperedge-preservation relation;
7. refinement relation;
8. invalidation semantics;
9. scope transformation;
10. safety invariants.
The first useful theorem target is not 'the whole Nexo is correct'. It is a bounded theorem such as:
`For claim P under context K, every implementation state maps to an abstract state that preserves P-relevant distinctions and does not amplify claim scope or authority.`

## 22. Candidate invariants
AS-01 ABSTRACTION_IS_PROPERTY_SCOPED
AS-02 REQUIRED_DISTINCTIONS_ARE_EXPLICIT_OR_SOUNDLY_DERIVED
AS-03 COLLAPSING_A_REQUIRED_DISTINCTION_REQUIRES_PROOF
AS-04 UNKNOWN_CANNOT_BE_SILENTLY_COLLAPSED
AS-05 CLAIM_SCOPE_CANNOT_GROW_THROUGH_ABSTRACTION
AS-06 AUTHORITY_CANNOT_GROW_THROUGH_ABSTRACTION
AS-07 HYPEREDGE_REQUIREMENTS_MUST_BE_PRESERVED_OR_SOUNDLY_SUMMARIZED
AS-08 COMMON_MODE_REQUIRED_FOR_INDEPENDENCE_MUST_SURVIVE_ABSTRACTION
AS-09 CURRENTNESS_REQUIRES_CURRENT_CONTEXT
AS-10 COMPOSED_ABSTRACTIONS_REQUIRE_COMPOSITION_SOUNDNESS
AS-11 MINIMIZATION_FOLLOWS_SOUNDNESS
AS-12 MULTIPLE_INCOMPARABLE_MINIMAL_ABSTRACTIONS_MAY_EXIST
AS-13 RELEVANT_CONTEXT_CHANGE_INVALIDATES_AFFECTED_ABSTRACTION_CERTIFICATE
AS-14 CLAIM_PRESERVATION_CERTIFICATE_CANNOT_SELF_JUSTIFY_REQUIRED_SUPPORT
AS-15 REFINEMENT_MAPPING_MUST_BE_EXPLICIT_FOR_FORMAL_IMPLEMENTATION_CLAIMS.

## 23. Open gaps
AS-G1 Formal RequiredDistinctionSet definition.
AS-G2 Formal hyperedge-preservation relation.
AS-G3 Formal abstraction/refinement theorem.
AS-G4 Conditions for compositional abstraction.
AS-G5 Efficient detection of property-changing distinctions.
AS-G6 Dynamic re-abstraction semantics.
AS-G7 Minimality theorem and computational complexity.
AS-G8 Multi-property joint abstraction.
AS-G9 SANY/TLC/TLAPS execution.
AS-G10 Implementation refinement/fault-injection validation.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime or deployment correctness claim.