# NEXO — AB8 CLAIM ASSESSMENT, INVALIDATION, PREORDER LAWS, WITNESS REALIZABILITY AND MINIMAL REFINEMENT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No theorem claimed proven.

## 1. External cross-check

Abstract interpretation literature supports transition-system semantics, collecting semantics, explicit concrete/abstract correspondence, and compositional/reduced-product construction. It also recognizes that correctness depends on the chosen correspondence rather than one universal approximation relation. citeturn0search5turn0search9

Lamport's refinement work confirms that history variables can support refinement mappings and remain auxiliary, while TLA+ modeling commonly treats the system as a state machine with transitions. citeturn0search24turn0search14

## 2. AB8-G1 — ClaimAssessment

Candidate structured assessment:

ClaimAssessment_P =
(
  claim_id,
  world_scope,
  justification_status,
  authority_context,
  boundary_context,
  threat_model,
  temporal_scope,
  required_distinctions,
  evidence_basis,
  invalidation_basis
)

This is intentionally multi-sorted.

A single TRUE/FALSE/UNKNOWN field cannot encode authority, scope, currentness, or evidence sufficiency without hidden semantics.

## 3. Separate world predicate from justification

Candidate:

WorldPredicate_P(h) = whether the claim is actually satisfied by history h.

Justified_P(K) = whether knowledge/evidence context K is sufficient to establish the claim under P.

These are different predicates.

Therefore:
JUSTIFIED_TRUE does not define world truth;
WORLD_TRUE does not imply currently justified knowledge.

This distinction is foundational for historical claims and post-compaction reconstruction.

## 4. AB8-G2 — Closure-law adversarial results

The candidate closure laws:
- extensivity;
- monotonicity;
- idempotence

were attacked against temporal and claim-scoped semantics.

Findings:
- Extensivity is natural if closure is defined as reachability from X.
- Idempotence is plausible if closure reaches a fixed point over a stable dependency relation.
- Monotonicity can fail if the dependency relation itself changes with the input claim scope or threat model.

Therefore the laws are not properties of an unindexed Closure.

Candidate corrected object:

Closure(P, TM, B, I, X)

For fixed P, TM, B, I, standard closure laws become candidate obligations.

If P/TM/B/I changes, comparing closures requires a separate monotonicity theorem.

## 5. New distinction — closure parameter refinement

A stronger threat model can legitimately produce a larger dependency closure.

Therefore:

X1 = X2
but
TM1 != TM2

does not imply:
Closure(TM1) = Closure(TM2).

This is not a bug; it is semantic parameterization.

## 6. AB8-G3 — Threat-model non-amplification

Candidate rule:

An abstraction or evidence transformation may not infer independence under a threat model stronger than the threat model represented by its retained dependencies and assumptions.

Formally, candidate:

TM_a <= TM_c

must be defined before any soundness relation involving threat models.

Potential direction:
concrete threat assumptions must imply the abstract assumptions required by the claim, not merely resemble them.

This remains OPEN until the threat-model order is defined.

## 7. Threat-model order is not obvious

A threat model can be:
- stronger by including more failure modes;
- broader by covering more boundary;
- stricter by prohibiting more dependencies;
- deeper by requiring more authority/recovery guarantees.

These dimensions need not form one scalar order.

Candidate multi-sorted threat context:

TM = (failure_scope, prohibited_modes, assumptions, boundary, time_scope)

Do not assume a total ordering.

## 8. AB8-G4 — Preorder law attack

For information preorder candidate:
a <=I_P b

Reflexivity is structurally expected if every representation preserves itself.

Transitivity is expected only if:
Rep_P(c,a) and Rep_P(a,b) compose without losing a P-required distinction.

Thus transitivity is not automatic from syntax.

For authority preorder:
transitivity depends on composing authority consequence inclusion under unchanged identity/resource/currentness/boundary semantics.

Therefore both remain candidate preorders until composition is formalized.

## 9. Quotient equivalence

If a <= b and b <= a, define mutual refinement equivalence.

But equivalence must be claim-indexed:

a ~I_P b

not simply:
a ~I b.

Likewise:
a ~A_P b.

This prevents one claim's equivalence from being reused as another claim's equivalence.

## 10. AB8-G5 — Invalidation semantics

A prior justification can become invalid for at least five different reasons:

1. new contradictory evidence;
2. assumption invalidation;
3. scope/boundary expansion;
4. currentness/epoch change;
5. retention/history loss.

These should not be collapsed into one generic UNKNOWN.

Candidate:

InvalidationReason =
EVIDENCE_CONTRADICTION
ASSUMPTION_INVALIDATED
SCOPE_EXPANDED
BOUNDARY_EXPANDED
THREAT_MODEL_STRENGTHENED
CURRENTNESS_CHANGED
HISTORY_LOST
DEPENDENCY_REVEALED
WITNESS_RETRACTED
CONCRETIZATION_FAILED

## 11. Important distinction — invalidation vs falsification

A justification can be invalidated without proving the opposite claim.

Example:
- old proof relied on independence;
- later evidence shows independence is unknown.

Correct:
TRUE_JUSTIFIED -> UNKNOWN

Not:
TRUE_JUSTIFIED -> FALSE_JUSTIFIED.

This is a critical epistemic rule.

## 12. AB8-G6 — Witness extraction

Candidate witness extractor:

Witness_P(K) -> W or UNKNOWN

A witness W must contain exactly the claim-required components:
identity,
temporal position,
authority context,
resource incarnation,
effect/provider identity,
dependency context,
boundary,
evidence provenance.

Witness extraction is not merely selecting a record.

## 13. Joint witness realization

For witness set W:

JointRealizable_P(W) iff there exists a concrete history h satisfying:
- every witness constraint;
- every cross-witness temporal relation;
- every identity/incarnation relation;
- every authority relation;
- every dependency relation;
- every boundary condition.

Pairwise compatibility is insufficient in general.

## 14. Witness inconsistency hierarchy

Candidate results:

JOINT_PROVEN_REALIZABLE
JOINT_PROVEN_IMPOSSIBLE
JOINT_UNKNOWN

Do not convert:
JOINT_UNKNOWN -> JOINT_PROVEN_IMPOSSIBLE.

Likewise, no witness should be fabricated by merging individually valid but jointly incompatible records.

## 15. AB8-G7 — Minimal refinement mapping

Candidate mapping contract for claim P:

M_P :
(implementation_state, auxiliary_history)
-> abstract_state_P

Required preservation obligations may include:
- P-required state predicates;
- P-required temporal relations;
- authority/currentness;
- effect boundary;
- dependency/common-mode;
- witness identity;
- historical distinctions;
- invalidation status.

Not every claim requires every obligation.

## 16. Auxiliary/history variable rule refined

A variable may be auxiliary only if existentially hiding it preserves the relevant implementation specification while it supplies information needed to establish the refinement mapping.

This is consistent with Lamport's history-variable treatment: auxiliary variables can be added to construct a refinement mapping and then hidden without changing the represented specification. citeturn0search24turn0search25

Nexo-specific correction:
If the actual claim semantics depend on the distinction, that distinction cannot be discarded merely by labeling it auxiliary.

## 17. New finding — first abstract model should not encode all history

The first TLA+ model should not blindly store complete event history.

Instead, derive the minimum abstract state from the claim contracts and retain auxiliary/history variables only where required for refinement.

This follows the research direction:
CLAIM CONTRACT -> REQUIRED DISTINCTIONS -> ABSTRACT STATE.

Not:
RAW IMPLEMENTATION -> EVERYTHING AS TLA+ STATE.

## 18. New finding — first model should target one claim family

Trying to model:
authority + history + effect + retention + independence + reconstruction
simultaneously would obscure which semantics caused a failure.

Candidate first formal target:
a narrowly scoped universal safety claim crossing the Z1 authorization boundary and Z3/Z4 effect boundary.

The exact claim remains OPEN.

## 19. Countermodel implications

AB8 work strengthens the existing minimum countermodels:

- MC-A hidden epoch tests currentness;
- MC-B hidden common mode tests threat-model semantics;
- MC-C hidden incarnation tests historical identity;
- MC-D enforcement gap tests effect boundary;
- MC-E joint witness impossibility tests existential reconstruction;
- MC-F compaction tests historical sufficiency;
- MC-G knowledge/authority separation tests non-amplification.

Each should eventually have an explicit claim contract and expected assessment.

## 20. Candidate invariants AD9-01..AD9-20

AD9-01 CLAIM_ASSESSMENT_IS_MULTI_SORTED
AD9-02 WORLD_TRUTH_AND_JUSTIFICATION_ARE_DISTINCT
AD9-03 CLOSURE_IS_PARAMETERIZED_BY_CLAIM_THREAT_BOUNDARY_AND_TIME
AD9-04 CLOSURE_LAWS_APPLY_ONLY_AFTER_PARAMETERS_ARE_FIXED
AD9-05 THREAT_MODEL_IS_NOT_ASSUMED_TO_HAVE_A_TOTAL_ORDER
AD9-06 ABSTRACTION_MUST_NOT_AMPLIFY_THREAT_ASSUMPTIONS
AD9-07 INFORMATION_PREORDER_REQUIRES_COMPOSABLE_REPRESENTATION
AD9-08 AUTHORITY_PREORDER_REQUIRES_COMPOSABLE_AUTHORITY_ENTAILMENT
AD9-09 MUTUAL_REFINEMENT_EQUIVALENCE_IS_CLAIM_SCOPED
AD9-10 INVALIDATION_REASONS_MUST_BE_DISTINGUISHABLE
AD9-11 INVALIDATION_DOES_NOT_IMPLY_OPPOSITE_CLAIM
AD9-12 HISTORY_LOSS_CAN_INVALIDATE_JUSTIFICATION_WITHOUT_PROVING_FALSE
AD9-13 WITNESS_EXTRACTION_IS_CLAIM_SCOPED
AD9-14 WITNESS_SET_REQUIRES_JOINT_REALIZABILITY
AD9-15 JOINT_UNKNOWN_MUST_NOT_BE_PROMOTED_TO_IMPOSSIBLE
AD9-16 REFINEMENT_MAPPING_IS_CLAIM_INDEXED
AD9-17 AUXILIARY_VARIABLES_MUST_NOT_HIDE_CLAIM_SEMANTICS
AD9-18 FIRST_ABSTRACT_MODEL_SHOULD_MINIMIZE_STATE_TO_CLAIM_REQUIREMENTS
AD9-19 FIRST_FORMAL_MODEL_SHOULD_TARGET_ONE_CLAIM_FAMILY
AD9-20 COUNTERMODELS_REQUIRE_EXPLICIT_CLAIM_CONTRACTS

## 21. Updated frontier

AB8-G1 advanced: multi-sorted ClaimAssessment.
AB8-G2 advanced: closure laws now explicitly parameterized.
AB8-G3 advanced: threat-model non-amplification candidate.
AB8-G4 advanced: preorder laws tied to composition.
AB8-G5 advanced: invalidation taxonomy.
AB8-G6 advanced: witness extraction and joint realization.
AB8-G7 advanced: minimal refinement mapping contract.
AB8-G8 advanced: first TLA+ model should be claim-family scoped.

New frontier:
AB9-G1 choose first claim family and exact boundary.
AB9-G2 formalize its concrete history semantics.
AB9-G3 derive minimal required distinctions.
AB9-G4 construct the smallest countermodels for that claim.
AB9-G5 formalize representation/refinement for that claim.
AB9-G6 determine whether a finite abstract domain is sufficient.
AB9-G7 only then write first TLA+ specification.
AB9-G8 run bounded falsification only after semantic review.

## Verification boundary

No implementation. No TLA+ execution. No theorem claimed proven.
