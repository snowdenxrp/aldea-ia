# NEXO — Hypergraph Projection Soundness and Claim-Preserving Refinement Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Determine what must be true for projecting the full SafetyClosureHypergraph into a smaller claim-specific representation without losing a security-relevant distinction, and define a future refinement target for proving that the projection preserves the intended claim.

## Web cross-check
Lamport and Merz state that refinement mappings relate lower-level representations to higher-level concepts and may require auxiliary history variables. Lamport's safety/refinement material expresses implementation as a theorem that the lower-level specification implies the higher-level specification under the mapping. citeturn0search24turn0search26
NIST defines assurance as justified confidence relative to specific claims and describes assurance evidence as information supporting assurance, trustworthiness and risk decisions. This reinforces that preservation must be evaluated relative to an explicit claim rather than as a universal property of a representation. citeturn0search1turn0search13

## 1. Central finding
A projection is not safe merely because every retained node has a valid identity.
The projection is sound for property P only if every distinction and relation that can affect P is either:
1. retained explicitly;
2. represented by a proven abstraction;
3. ruled irrelevant by a verified boundary/contract.
`NODE_PRESERVATION != CLAIM_PRESERVATION`.

## 2. Candidate projection
Let H be the full typed safety hypergraph and π_P(H) the claim-specific projection for property P.
Candidate soundness condition:
`SoundProjection(H, π_P, P, C)` iff every pair of H-states that map to the same projected state are indistinguishable with respect to P under context C.
This is a research definition, not a proven theorem for Nexo.

## 3. Claim-preserving equivalence
Define a P-specific equivalence:
`H1 ≈_P,C H2` iff P has the same truth value for H1 and H2 under context C, and every required security-relevant distinction for P is preserved.
A projection is potentially sound when each projection class is contained within a P-equivalence class.
If one projected class contains two histories with different P outcomes, the projection is unsound.

## 4. Counterexample-guided interpretation
An unsafe projection has a witness pair:
`H1 ≈_projection H2` but `P(H1) != P(H2)`.
This is a concrete abstraction counterexample.
Future research can use a CEGAR-like loop:
`PROJECT → CHECK PROPERTY → FIND DISTINCTION LOSS → REFINE PROJECTION → RECHECK`.
This is a methodology target, not an implementation claim.

## 5. Hidden hyperedge preservation
A projection must preserve multiway relations when P depends on them.
Retaining E, R, A and P separately is insufficient if P depends on the tuple `(E,R,A,P)`.
Candidate rule:
`REQUIRED_HYPEREDGE(P) ⊆ PRESERVED_OR_SOUNDLY_ABSTRACTED_RELATIONS`.

## 6. Scope preservation
A projection must not enlarge any claim dimension.
Candidate vector:
`ClaimScope = <authority, relevance, effect, enforcement, evidence, resource, temporal, dependency>`.
For each dimension d:
`ProjectedScope[d] <= VerifiedSourceScope[d]` under that dimension's semantics.
A projection may reduce scope. It may not silently widen it.

## 7. Unknown preservation
If the source distinguishes states A and B and P differs between them, a projection that merges them must represent uncertainty.
`MERGE_DISTINCT_P_OUTCOMES → UNKNOWN_P`.
Information loss cannot create certainty.

## 8. Currentness preservation
Historical equivalence is not current authority equivalence.
A projection that preserves a historical claim may still omit:
- current authority epoch;
- current policy/invariant;
- current trust root;
- current ordering context;
- current resource incarnation;
- current invalidation generation.
Therefore a projection can be sound for historical attribution while unsound for current authorization.

## 9. Temporal preservation
Projection must preserve temporal/causal distinctions required by P.
Two events with identical identities but different order can produce different safety outcomes.
`IDENTITY_EQUIVALENCE != TEMPORAL_EQUIVALENCE`.
Temporal gaps require a verified causal bridge or explicit UNKNOWN.

## 10. Resource-incarnation preservation
Same provider resource identifier does not establish same resource incarnation.
If P depends on whether effect E occurred before or after replacement, the projection must preserve incarnation and the relevant causal boundary.

## 11. Dependency preservation
A projection may not omit a dependency merely because it is not represented in the current claim's primary object set.
If changing D can change P within the environment boundary, D or a sound abstraction of D belongs in the projection.
`NO_EDGE_IN_PROJECTION != NO_EDGE_IN_SOURCE`.

## 12. Trust/support preservation
A claim-preserving projection must preserve enough support context to avoid circular assurance.
If the source proof depended on root R, but the projection deletes R and later uses the projection to justify deletion of R, support becomes circular.
`PROJECTION_CANNOT_DELETE_THE_SUPPORT_THAT_JUSTIFIES_PROJECTION_TRUST`.

## 13. Refinement mapping target
Candidate future mapping:
`M : ImplementationState × AuxiliaryHistory → AbstractSafetyClosureState`.
The theorem target would be structurally similar to:
`ImplementationSpec => AbstractSpec[M]`.
Lamport's refinement framework uses this style: the higher-level variables are defined as expressions of lower-level variables under the mapping. citeturn0search26turn0search24
No such Nexo theorem has been written or checked yet.

## 14. Auxiliary history
Some properties cannot be represented from current state alone.
Candidate auxiliary/history variables may record:
- effect lineage;
- causal order;
- predecessor cutoffs;
- resource incarnation transitions;
- invalidation history;
- branch/fork provenance;
- proof-context generations.
These variables need not imply that all raw history must remain physically stored forever; they define what the abstract proof must be able to distinguish.

## 15. Safety versus liveness
The first formal target should be safety:
`BAD_STATE` must be unreachable under the abstract model.
Whether a safe fixed point is eventually reached is a separate liveness problem.
Lamport's TLA+ material explicitly distinguishes safety from liveness; an invariant-style safety property can be violated by a finite execution prefix, whereas liveness concerns eventual behavior. citeturn0search12
Therefore retention non-convergence should first be modeled as a safety condition: non-convergence must not produce an unjustified strong claim.

## 16. Hyperproperties caution
Some independence/confidentiality-style claims compare multiple executions rather than one execution.
Lamport and Schneider note that hyperproperties can require special treatment under refinement; refinement does not automatically preserve every hyperproperty. citeturn0search27
This matters for Nexo claims such as witness independence or noninterference-like properties.
A future formalization must classify each claim as ordinary state/trace property or hyperproperty before selecting the proof method.

## 17. Projection certificate
Candidate `ClaimPreservingProjectionCertificate` fields:
- source hypergraph context;
- target projection;
- property/claim;
- equivalence relation or preservation condition;
- required distinctions;
- required hyperedges;
- omitted information;
- loss/unknown set;
- environment boundary;
- dependency/common-mode closure;
- temporal/causal bridge;
- authority/trust/order context;
- refinement mapping;
- invalidation conditions;
- verification method;
- resulting claim scope.

## 18. Safe projection lifecycle
`REQUEST_PROJECTION → FREEZE_RELEVANT_CONTEXT → COMPUTE_SOURCE_CLOSURE → IDENTIFY_REQUIRED_DISTINCTIONS/HYPEREDGES → BUILD_PROJECTION → CHECK_PRESERVATION → CHECK_SUPPORT_CLOSURE → CHECK_CURRENTNESS → COMMIT_PROJECTION → AUTHORIZE_RECLAMATION_IF_APPLICABLE`.
Any newly discovered relevant distinction invalidates the projection until revalidated.

## 19. Projection composition
Two individually sound projections may compose unsafely.
`Sound(π1,P1) + Sound(π2,P2) != Sound(π1∘π2,P1∧P2)` automatically.
Composition requires a joint preservation proof.
This extends the earlier rule that pairwise compatibility does not imply joint compatibility.

## 20. Projection contraction versus deletion
A sound projection may replace source detail with a certificate.
Deletion without a sound projection is simply information loss.
`CERTIFIED_ABSTRACTION != DELETION`.
Reclamation is safe only after the abstraction is committed and its support boundary is durable.

## 21. Candidate theorem targets
Target T1: claim-preserving projection.
`If π is sound for P under C, replacing H by π(H) preserves P within C.`
Target T2: scope non-amplification.
`Scope(π(H)) <= VerifiedScope(H)`.
Target T3: unknown preservation.
`If P is not invariant over a projection class, the projected claim is UNKNOWN_P or weaker.`
Target T4: currentness separation.
`Historical soundness of π does not imply current-authority soundness.`
These are formalization targets, not established Nexo theorems.

## 22. Candidate invariants
PS-01 PROJECTION_SOUNDNESS_IS_CLAIM_AND_CONTEXT_SPECIFIC
PS-02 NODE_IDENTITY_PRESERVATION_DOES_NOT_IMPLY_CLAIM_PRESERVATION
PS-03 REQUIRED_DISTINCTIONS_MUST_BE_RETAINED_OR_SOUNDLY_ABSTRACTED
PS-04 REQUIRED_HYPEREDGES_MUST_BE_RETAINED_OR_SOUNDLY_ABSTRACTED
PS-05 PROJECTION_CLASSES_MUST_NOT_MERGE_DIFFERENT_P_OUTCOMES_WITHOUT_UNKNOWN
PS-06 PROJECTED_SCOPE_CANNOT_EXCEED_VERIFIED_SOURCE_SCOPE
PS-07 HISTORICAL_PROJECTION_SOUNDNESS_DOES_NOT_IMPLY_CURRENT_AUTHORITY_SOUNDNESS
PS-08 TEMPORAL_AND_RESOURCE_INCARNATION_DISTINCTIONS_MUST_BE_PRESERVED_WHEN_RELEVANT
PS-09 DEPENDENCY_OMISSION_REQUIRES_IRRELEVANCE_OR_BOUNDARY_PROOF
PS-10 PROJECTION_CANNOT_SELF-JUSTIFY_DELETION_OF_ITS_SUPPORT
PS-11 REFINEMENT_MAPPING_MUST_PRESERVE_CLAIM_RELEVANT_SEMANTICS
PS-12 AUXILIARY_HISTORY_MAY_BE_REQUIRED_FOR_REFINEMENT
PS-13 SAFETY_FORMALIZATION_PRECEDES_LIVENESS_CLAIMS
PS-14 HYPERPROPERTY_CLAIMS_REQUIRE_EXPLICIT_REFINEMENT_TREATMENT
PS-15 COMPOSED_PROJECTIONS_REQUIRE_JOINT_PRESERVATION
PS-16 CERTIFIED_ABSTRACTION_MUST_PRECEDE_RECLAMATION.

## 23. Open gaps
PS-G1 Formal P-equivalence definition in TLA+.
PS-G2 Hypergraph-to-state-machine encoding.
PS-G3 CEGAR-like projection refinement semantics.
PS-G4 Formal hyperedge preservation.
PS-G5 Refinement mapping for current authority/currentness.
PS-G6 Hyperproperty classification and proof strategy.
PS-G7 Projection composition theorem.
PS-G8 Finite model abstraction soundness boundary.
PS-G9 SANY/TLC/TLAPS execution.
PS-G10 Implementation refinement and fault injection.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime or deployment correctness claim.