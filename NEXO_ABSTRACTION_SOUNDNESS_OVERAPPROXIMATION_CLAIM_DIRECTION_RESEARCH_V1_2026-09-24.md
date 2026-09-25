# NEXO — Abstraction Soundness, Approximation Direction, Claim Polarity and Refinement Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS execution. No runtime/deployment verification. No architecture-correctness claim.

Parent research frontier:
- 96ae3af5216113f5bf3839796b1d0aa85650259e — hypergraph projection soundness and refinement
- d875b4346c51f47b0f1925fe40c7f5bd30e2a4d5 — claim-preserving hypergraph abstraction

## Objective

Refine the abstraction problem by distinguishing exact claim preservation, conservative over-approximation, under-approximation, refinement/trace correspondence, completeness versus soundness, and ordinary trace/state properties versus hyperproperties.

The key question is not merely whether a projection preserves information. It is whether the direction and strength of approximation are compatible with the exact Nexo claim.

## External cross-check

Lamport's TLA+ material describes refinement mappings as a theorem in which the lower-level specification implies the higher-level specification under the mapping. Auxiliary/history variables may be required to construct such mappings.

Sources:
- Leslie Lamport, Proving Safety Properties: https://lamport.azurewebsites.net/tla/proving-safety.pdf
- Leslie Lamport, Auxiliary Variables in TLA+: https://lamport.azurewebsites.net/tla/auxiliary/auxiliary.html

Abstract-interpretation literature distinguishes concrete and abstract semantics and formalizes sound approximation using abstraction/concretization relations, commonly via Galois connections. An abstraction may deliberately lose information while remaining sound for a specified analysis; therefore soundness cannot mean exact reconstruction.

Sources:
- Cousot & Cousot, Abstract interpretation and application to logic programs: https://www.di.ens.fr/~cousot/COUSOTpapers/JLP92.shtml
- Cousot, Formalizations of Abstraction in the Abstract Interpretation Theory: https://www.di.ens.fr/~cousot/COUSOTtalks/Dagstuhl-06281.shtml

Model-checking literature describes conservative over-approximations as useful for safety: if the abstract system is safe, the concrete system is safe; the converse does not generally hold because abstraction can introduce spurious executions.

Source:
- Platzer, Verification of Hybrid Systems: https://www.cs.cmu.edu/~aplatzer/pub/HBMC.pdf

Hyperproperty literature warns that ordinary trace refinement does not automatically preserve arbitrary security hyperproperties; properties comparing multiple executions require explicit treatment.

Source:
- Clarkson & Schneider, Hyperproperties: https://www.cs.cornell.edu/fbs/publications/Hyperproperties.pdf

These external results are methodological evidence only. They do not prove any Nexo theorem.

## 1. Central finding: approximation direction is claim-dependent

A single abstraction direction cannot safely answer every Nexo claim.

Three distinct targets must not be conflated:

### A. Exact preservation

The abstract representation preserves the truth of P for every concrete state/trace represented by it.

Candidate condition:
α(s1) = α(s2) implies P(s1) = P(s2).

### B. Conservative safety preservation

The abstract model may admit behaviors that the concrete system cannot exhibit, but must not omit a concrete behavior relevant to the safety proof.

Candidate reachability condition:
α(Reach(C)) is a subset of Reach(A).

Then Safe(A) implies Safe(C). The converse generally does not follow.

### C. Existence/witness preservation

For claims that require proving that some event or effect actually occurred, an over-approximation is insufficient by itself because spurious abstract behavior can create false witnesses.

Therefore:
EXACT_PRESERVATION != SAFETY_OVERAPPROXIMATION != WITNESS_PRESERVATION

This is a refinement of the earlier generic claim-preserving abstraction concept.

## 2. Claim polarity must become an explicit abstraction input

Candidate ClaimPolarity values:
- UNIVERSAL_SAFETY
- ABSENCE
- EXISTENCE
- HISTORICAL_ATTRIBUTION
- CURRENT_AUTHORITY
- CONTAINMENT
- EQUIVALENCE
- INDEPENDENCE
- ORDER
- COUNT/QUORUM
- COMBINED/HYPERPROPERTY
- UNKNOWN/UNCLASSIFIED

Examples:
- Safety/absence can use conservative over-approximation for a proof of absence, provided the abstract model is itself safe.
- Historical existence cannot be established merely because an effect is possible in an over-approximation.
- Historical non-occurrence requires absence-capable closure; missing information must become UNKNOWN.
- Current authority requires current epoch, revocation/invalidation, policy, trust, ordering and relevant dependencies.
- Independence requires common-mode preservation, not merely witness count.

## 3. New distinction: soundness versus completeness

For Nexo, sound must always be qualified by direction.

Candidate terminology:
- Proof-Sound: the abstraction cannot justify a false positive claim of the specified kind.
- Counterexample-Sound: a reported violation has sufficient correspondence to a concrete execution/effect.
- Trace-Covering: every relevant concrete behavior has an abstract representation.
- Claim-Complete: the abstraction preserves enough information to decide the target claim without UNKNOWN.

These are different properties.

A projection may be proof-sound but incomplete. UNKNOWN can therefore be a sound result.

SOUND != COMPLETE
UNKNOWN_CAN_BE_SOUND

## 4. LossSet must be typed by semantic direction

Candidate LossSet(P, K, direction) classes:
- identity loss
- ordering loss
- causal loss
- resource-incarnation loss
- authority-epoch loss
- revocation loss
- policy loss
- provider-state loss
- enforcement-path loss
- common-mode loss
- witness-provenance loss
- historical-coverage loss
- negative-evidence capability loss

A loss is acceptable only if a proof establishes that it cannot change the target conclusion in the selected direction.

## 5. Adversarial case: false safety from under-approximation

Concrete system:
C = {safe trace, bad trace}

Under-approximation:
A = {safe trace}

The abstract model is safe, but concrete safety does not follow.

Therefore:
UNDER_APPROXIMATION + SAFE(A) does not imply SAFE(C).

A finite model containing only observed or retained behaviors must never silently be treated as the universe of possible behaviors.

## 6. Adversarial case: false violation from over-approximation

Concrete:
C = {safe trace}

Over-approximation:
A = {safe trace, spurious bad trace}.

UNSAFE(A) does not establish UNSAFE(C). The abstract bad trace requires concretization/refinement into a real witness.

Therefore:
ABSTRACT_COUNTEREXAMPLE != CONCRETE_COUNTEREXAMPLE

## 7. Adversarial case: hidden hyperedge

Concrete states may differ as tuples such as:
(E, R1, A, P1) versus (E, R2, A, P2).

If projection keeps only E, provider_id and A while removing resource incarnation, provider contract version and the joint hyperedge, the two states can collapse although authorization truth differs.

Therefore:
NODE_EQUIVALENCE != JOINT_RELATIONAL_EQUIVALENCE
PAIRWISE_EQUIVALENCE != HYPEREDGE_EQUIVALENCE

## 8. Adversarial case: hidden revocation

History H1: grant(A) -> revoke(A) -> query.
History H2: grant(A) -> query.

If both project to A=granted, they may be equivalent for a historical 'was granted' claim but not for 'is currently authorized'.

Therefore abstraction equivalence must bind temporal/currentness scope explicitly.

## 9. Adversarial case: hidden common-mode failure

Concrete:
W1 -> provider P
W2 -> provider P

If P is removed, two witness nodes can appear independent although they share one failure domain.

Therefore independence claims require preservation of common-mode dependencies.

## 10. Adversarial case: hidden enforcement boundary

An authorization decision of DENY is not equivalent to external containment if the enforcement component lies outside the modeled boundary.

This reinforces:
C1/C2 != C3
MODEL_BOUNDARY != WORLD_BOUNDARY

## 11. Candidate ClaimDirectionContract

Candidate object:
ClaimDirectionContract

Fields:
- claim_id
- claim_type
- claim_polarity
- target_scope
- target_boundary
- proof_direction
- required_concrete_coverage
- required_abstract_coverage
- allowed_unknown
- counterexample_requirements
- witness_requirements
- required_distinctions
- required_hyperedges
- required_currentness
- required_history
- required_dependency_closure
- required_enforcement_closure
- required_refinement_relation

Purpose: prevent a generic abstraction mechanism from applying an inappropriate soundness direction to a claim.

## 12. Candidate three-way-plus assessment

Basic result domain:
ClaimResult = {TRUE, FALSE, UNKNOWN}.

For Nexo this is likely too coarse. Candidate richer assessment values:
- PROVEN_TRUE
- PROVEN_FALSE
- UNKNOWN
- ABSTRACT_ONLY_TRUE
- ABSTRACT_ONLY_FALSE
- WITNESS_PENDING
- CONCRETIZATION_PENDING
- SCOPE_EXCEEDED
- DEPENDENCY_UNKNOWN
- HISTORY_INCOMPLETE

These must not be silently collapsed to Boolean values.

## 13. Refinement mapping must expose semantic direction

Candidate mapping:
M : ImplementationState × AuxiliaryHistory -> AbstractState

is insufficient by itself. It must be paired with a relation describing what is preserved.

Examples:
- safety refinement: every relevant concrete transition is represented by an abstract transition;
- historical refinement: causal order and effect identity are preserved;
- current-authority refinement: current authority epoch and revocation state are preserved;
- independence refinement: common-mode relations across multiple executions/objects are preserved.

ONE_MAPPING != ONE_UNIVERSAL_REFINEMENT_PROPERTY

## 14. Hyperproperties require a separate formal lane

Likely Nexo hyperproperty candidates:
- witness independence;
- noninterference-like separation;
- common-mode exclusion;
- claims quantified over pairs or sets of executions.

Candidate rule:
ClaimClass = HYPERPROPERTY must trigger explicit multi-execution semantics, such as self-composition or another formally justified relational method.

Do not encode a hyperproperty as an ordinary single-state invariant merely for convenience.

## 15. Hypergraph projection is not merely node filtering

Candidate model:
H = (V, E_h, τ_V, τ_E, R)

where V is typed vertices, E_h typed hyperedges, τ are type functions, and R carries temporal/causal/order annotations.

A projection must define:
- vertex mapping;
- hyperedge mapping;
- loss relation;
- unknown relation;
- scope mapping;
- boundary mapping.

Soundness cannot be defined only as V# being a subset of V.

## 16. Candidate preservation relation

Define Preserve_P(H,H#) to mean:
1. all P-required vertices are retained or soundly summarized;
2. all P-required hyperedges are retained or soundly summarized;
3. all P-required temporal relations are retained or soundly summarized;
4. all P-required authority/currentness distinctions are retained or soundly summarized;
5. all P-required dependency/common-mode relations are retained or soundly summarized;
6. omitted information is represented in LossSet/Unknown where it can affect P;
7. target scope does not exceed source verified scope;
8. no stronger authority is inferred than source semantics support.

This should become the core formal relation before the TLA+ model.

## 17. Can over-approximation amplify authority?

Yes, as an adversarial semantic failure mode.

Example:
Concrete state: authority_epoch=7, status=REVOKED.
Abstract state: status may be ACTIVE or REVOKED.

If the abstract checker treats 'possibly ACTIVE' as sufficient for authorization, the abstraction has amplified authority.

Therefore:
MAY_BE_AUTHORIZED != IS_AUTHORIZED
POSSIBILITY != PERMISSION

For authorization claims, abstract semantics must specify whether it reasons over all concretizations, some concretization, or a designated authoritative concretization.

## 18. Can a finite abstraction hide world dependencies?

Yes.

If the modeled boundary contains Provider but the real external path contains Provider -> subcontractor -> hardware controller, and the omitted dependency can change the effect outcome, the abstraction is unsound for an external-effect claim unless the omission is justified by contract.

Therefore:
NO_EDGE_IN_MODEL != NO_EDGE_IN_WORLD

Boundary-bounded soundness is acceptable only if omitted dependencies are proven irrelevant, represented as explicit environment assumptions, or represented as UNKNOWN.

An environment assumption must not silently become a fact.

## 19. Abstraction composition

For π1: H0 -> H1 and π2: H1 -> H2, individual soundness does not automatically imply soundness of π2 composed with π1 for a combined claim.

Composition requires:
1. π1 soundness for the claim;
2. π2 soundness under the resulting context;
3. preservation of distinctions introduced as necessary by π1;
4. safe combination of loss sets;
5. non-expanding scope;
6. non-expanding authority;
7. closed dependency relations;
8. non-contradictory boundary assumptions.

## 20. Minimality remains downstream

Strengthened rule:
FIRST SOUND CLOSURE
-> FIRST CLAIM-DIRECTION-CORRECT ABSTRACTION
-> THEN MINIMIZE

A smaller representation that changes approximation direction or removes a proof-relevant distinction is not a valid optimization.

## 21. Candidate invariants

AD-01 ABSTRACTION_SOUNDNESS_IS_CLAIM_SCOPED
AD-02 APPROXIMATION_DIRECTION_IS_CLAIM_DEPENDENT
AD-03 SOUNDNESS_MUST_BE_TYPED_AS_PROOF_OR_COUNTEREXAMPLE_OR_WITNESS_SOUNDNESS
AD-04 UNDER_APPROXIMATION_CANNOT_PROVE_UNIVERSAL_SAFETY
AD-05 OVER_APPROXIMATION_CANNOT_BY_ITSELF_PROVE_EXISTENCE
AD-06 ABSTRACT_COUNTEREXAMPLE_REQUIRES_CONCRETE_WITNESS
AD-07 UNKNOWN_MAY_BE_A_SOUND_RESULT
AD-08 POSSIBILITY_CANNOT_BE_INTERPRETED_AS_AUTHORITY
AD-09 HYPERPROPERTY_CLAIMS_REQUIRE_RELATIONAL_MULTIEXECUTION_SEMANTICS
AD-10 BOUNDARY_SOUNDNESS_REQUIRES_EXPLICIT_ENVIRONMENT_ASSUMPTIONS
AD-11 MODEL_BOUNDARY_MUST_NOT_BE_CONFUSED_WITH_WORLD_BOUNDARY
AD-12 LOSS_SET_MUST_BE_TYPED_BY_CLAIM_AND_PROOF_DIRECTION
AD-13 REFINEMENT_MAPPING_MUST_STATE_WHAT_SEMANTICS_IT_PRESERVES
AD-14 COMPOSED_ABSTRACTIONS_REQUIRE_JOINT_SOUNDNESS
AD-15 MINIMIZATION_FOLLOWS_DIRECTION_CORRECT_SOUNDNESS
AD-16 FINITE_ABSTRACTION_MUST_NOT_BE_TREATED_AS_COMPLETE_WORLD_MODEL
AD-17 AUTHORITY_MUST_NOT_BE_AMPLIFIED_BY_ABSTRACTION
AD-18 HISTORICAL_EXISTENCE_REQUIRES_WITNESS_OR_COVERAGE
AD-19 HISTORICAL_ABSENCE_REQUIRES_ABSENCE_CAPABLE_CLOSURE_OR_UNKNOWN
AD-20 CURRENT_AUTHORITY_REQUIRES_CURRENTNESS_PRESERVING_ABSTRACTION

## 22. Open gaps after this round

AD-G1 Formalize claim polarity/direction as a mathematical object.
AD-G2 Define proof-sound, counterexample-sound, witness-sound and claim-complete precisely.
AD-G3 Define concrete and abstract domains for SafetyClosureHypergraph.
AD-G4 Determine whether Galois connections, Galois insertions, simulation relations, or another formal basis is appropriate for each claim class.
AD-G5 Formalize Preserve_P(H,H#).
AD-G6 Formalize hyperedge preservation under projection.
AD-G7 Formalize environment assumptions and boundary-bounded soundness.
AD-G8 Formalize authority non-amplification.
AD-G9 Formalize historical existence versus historical absence.
AD-G10 Formalize currentness preservation.
AD-G11 Formalize multi-execution/hyperproperty semantics.
AD-G12 Prove or refute compositional abstraction soundness.
AD-G13 Define CEGAR refinement obligations for each claim direction.
AD-G14 Define the minimum information required to convert UNKNOWN into a claim.
AD-G15 Decide which parts belong in TLA+ state variables and which require auxiliary/history variables.
AD-G16 Only after these are settled: construct the first bounded TLA+ abstract model.

## Verification boundary

No Nexo theorem was proved.
No SANY/TLC/TLAPS execution was performed.
No implementation was changed.
No runtime/deployment claim is made.

This document records research findings, formalization candidates, adversarial counterexamples and open gaps only.