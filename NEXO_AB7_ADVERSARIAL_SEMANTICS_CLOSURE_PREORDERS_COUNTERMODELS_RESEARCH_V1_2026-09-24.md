# NEXO — AB7 ADVERSARIAL SEMANTICS, CLOSURE, PREORDERS AND COUNTERMODEL RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No theorem claimed proven.

## 1. External cross-check

Abstract interpretation starts from transition-system operational semantics and collecting semantics, then defines abstract properties through an explicit correspondence; reduced products combine abstract domains by exchanging information and iterated reduction. citeturn0search1turn0search11

TLA+ refinement may require auxiliary history variables, and such variables can support a refinement mapping without becoming implementation state. citeturn0search24turn0search25

These sources support the methodology only; they do not establish any Nexo theorem.

## 2. AB7-G1 — Admissible history

Candidate:

Hist_B(TM) = { h | h satisfies Init, Next, environment assumptions, boundary B, and threat-model assumptions TM }.

A history is not merely a list of states. It carries transition labels and claim-relevant event/effect observations.

Candidate transition record:

e = (pre, action, post, actor, authority_epoch, resource_incarnation, effect_binding, provider_execution, dependencies, time).

Not every field is mandatory for every claim.

## 3. Claim-relative event projection

For claim P:

Proj_P(e)

retains exactly the distinctions required by P.

This gives a clean rule:

Raw event identity != universal semantic event identity.

The same concrete event can have different abstract representations under different claims.

## 4. AB7-G2 — Temporal hyperedge closure

Candidate hyperedge:

he = (members, relation_type, validity_interval, boundary, claim_scope, provenance).

Closure must respect validity interval.

For a query interval I:

Closure_P(X,I,B,TM)

may include a dependency only if its relation is relevant to P, valid during the required interval, and within the relevant boundary/threat model.

This prevents stale dependencies from being silently treated as current.

## 5. Closure algebra — candidate, not theorem

For fixed P,I,B,TM, test:

Extensive:
X ⊆ C(X)

Monotone:
X ⊆ Y => C(X) ⊆ C(Y)

Idempotent:
C(C(X)) = C(X)

If any of these fail under the chosen temporal semantics, the closure definition must be revised rather than silently assuming a standard closure operator.

## 6. AB7-G3 — Threat model as semantic parameter

Candidate:

TM = (failure_classes, prohibited_relations, tolerated_relations, assumptions, boundary, interval).

Threat-model assumptions must be explicit because independence is otherwise under-specified.

A claim cannot silently inherit a stronger threat model than the one actually represented by its evidence.

Candidate:
THREAT_MODEL_AMPLIFICATION_IS_FORBIDDEN.

## 7. AB7-G4 — Preorders

Information and authority should initially be preorders.

Information:
a ≼I_P b iff b preserves at least all P-relevant distinctions/claims preserved by a under the same scope/boundary.

Authority:
a ≼A_P b iff every P-relevant authority consequence of a is entailed by b under identical identity/resource/currentness/boundary semantics.

Mutual refinement can induce equivalence classes:
a ~I b iff a ≼I b and b ≼I a.
a ~A b iff a ≼A b and b ≼A a.

Only after quotienting may a partial order be considered.

## 8. Important non-collapse

Even after quotienting:

~I does not imply ~A.
~A does not imply effect equivalence.
Effect equivalence does not imply enforcement equivalence.

This preserves the established equivalence hierarchy.

## 9. AB7-G5 — Claim status transition relation

Rather than a static lattice, define a transition relation:

StatusStep(P, k1, evidence_delta, assumptions_delta) -> k2.

Permitted transitions may include:
UNKNOWN -> TRUE_JUSTIFIED
UNKNOWN -> FALSE_JUSTIFIED
TRUE_JUSTIFIED -> UNKNOWN
TRUE_JUSTIFIED -> FALSE_JUSTIFIED
FALSE_JUSTIFIED -> UNKNOWN
and scope/boundary changes to SCOPE_EXCEEDED.

No transition is permitted merely because an implementation wants a stronger status.

Every transition needs a claim-specific justification rule.

## 10. Why TRUE -> FALSE is not paradoxical

If a prior TRUE_JUSTIFIED depended on an assumption A and new evidence establishes ¬A, the prior result may become invalid.

The correct semantic event is:
claim basis invalidated,
not:
truth logically changed.

Therefore ClaimStatus is a record of justified assessment, not an ontological truth value.

This distinction prevents confusion between:
WORLD_TRUTH
and
CURRENT_JUSTIFICATION.

## 11. AB7-G6 — Representation-first concretization

Candidate:

Rep_P(c,a) = “concrete context/history c is represented by abstract context a for claim P.”

Then:

gamma_P(a) = { c | Rep_P(c,a) }.

This avoids requiring a global abstraction function alpha.

A Galois connection should be introduced only if:
- both domains have suitable orders;
- abstraction/concretization satisfy the adjunction;
- claim semantics are preserved;
- boundaries and relational arity are compatible.

Cousot explicitly notes that when a best abstract approximation is unavailable, abstraction or concretization functions may be used while delaying the choice of approximation until context is known. citeturn0search3

## 12. Candidate proof-soundness condition

For universal claim P with bad predicate Bad_P:

If:
1. Rep_P(c,a);
2. abstract semantics establish that no represented abstract behavior satisfies Bad_P;
3. representation preserves all distinctions required by P;
4. environment/boundary assumptions are valid;

then the intended conclusion is:
not Bad_P(c).

This is a theorem target only. Conditions 2–4 still require formal definitions.

## 13. Counterexample soundness

For an abstract violation a:

It is not enough that abstract_bad(a).

Need a concrete witness:
exists c in gamma_P(a) such that Bad_P(c).

Therefore:

ABSTRACT_COUNTEREXAMPLE != CONCRETE_COUNTEREXAMPLE.

If witness extraction fails:
CONCRETIZATION_PENDING or ABSTRACT_ONLY_FALSE,
not PROVEN_FALSE.

## 14. AB7-G7 — Finite countermodel falsification plan

For every candidate law L:

1. define the smallest state vocabulary capable of expressing L;
2. enumerate finite histories up to a small bound;
3. search for a counterexample;
4. if found, record it as a semantic failure;
5. if none found, record only bounded non-falsification;
6. never promote bounded absence of counterexamples to theorem.

This prepares later TLC use without confusing model checking with proof.

## 15. Minimal countermodel MC-A — hidden epoch

States:
authority epoch 7, then revocation epoch 8.

Abstraction drops epoch.

Target claim:
current authority at time 8.

Expected:
UNKNOWN, unless another retained distinction proves currentness.

Invalid conclusion:
AUTHORIZED.

## 16. Minimal countermodel MC-B — hidden common mode

Two workers have distinct execution identities but share a scheduler.

Threat model prohibits scheduler common mode.

Abstraction drops scheduler dependency.

Expected:
DEPENDENCY_UNKNOWN or UNKNOWN.

Invalid conclusion:
INDEPENDENT.

## 17. Minimal countermodel MC-C — hidden incarnation

Resource R has incarnations R1 and R2.

Same resource label appears in both.

Historical claim refers specifically to R1.

Abstraction retains only R.

Expected:
HISTORY_INCOMPLETE or UNKNOWN.

Invalid conclusion:
effect on R1 definitely occurred.

## 18. Minimal countermodel MC-D — enforcement boundary

Z1 denies operation after capability issuance, but queued external execution remains possible.

Claim:
no external effect occurred.

Expected:
UNKNOWN until the external effect path is reconciled.

Invalid conclusion:
NO_EFFECT based only on Z1 denial.

## 19. Minimal countermodel MC-E — joint witness impossibility

W1, W2, W3 are individually valid and pairwise compatible but no common history realizes all three.

Expected:
JOINT_REALIZABILITY_FALSE or UNKNOWN depending on whether impossibility is proven.

Invalid conclusion:
synthetic combined event.

## 20. Minimal countermodel MC-F — compaction

Historical distinction E7-authorized -> E8-revoked is deleted.

Claim:
was authorized at E7?

Expected:
HISTORY_INCOMPLETE unless retained evidence is sufficient.

Invalid conclusion:
never authorized.

## 21. Minimal countermodel MC-G — knowledge vs authority

A refinement identifies the exact resource but adds no new authorization fact.

Expected:
knowledge may strengthen.

Authority:
unchanged.

Invalid:
UNKNOWN_AUTHORITY -> AUTHORIZED solely due to model precision.

## 22. New finding — three-valued dimensions are insufficient

We now have at least four independent semantic axes:

1. world/history realization;
2. epistemic justification;
3. authority;
4. boundary/threat-model scope.

A single scalar status cannot safely encode all four.

Candidate:
CLAIM_ASSESSMENT = (world predicate, justification status, authority context, scope context)

This is a candidate structured assessment, not yet a final type.

## 23. New finding — scope changes can mimic knowledge changes

A claim can move from TRUE to UNKNOWN because its boundary widened.

That does not mean evidence became worse.

Example:
“No effect occurred inside Z3” may be justified.
“No effect occurred anywhere in Z4” may be UNKNOWN.

Therefore status transitions must record whether the cause was:
- evidence change;
- assumption invalidation;
- scope expansion;
- boundary expansion;
- threat-model strengthening;
- currentness change.

## 24. New finding — refinement mapping must be claim-indexed

A single mapping:

M : ImplementationState -> AbstractState

may be insufficient.

Candidate:

M_P : ImplementationState × AuxiliaryHistory -> AbstractState_P

because different claims may require different preserved distinctions.

This is compatible with the role of auxiliary variables in refinement mappings, but the exact implementation-to-abstract construction remains open. citeturn0search24

## 25. Candidate invariants AD8-01..AD8-20

AD8-01 ADMISSIBLE_HISTORY_IS_BOUNDARY_AND_THREAT_MODEL_SCOPED
AD8-02 EVENT_PROJECTION_IS_CLAIM_SCOPED
AD8-03 TEMPORAL_HYPEREDGES_REQUIRE_VALIDITY_INTERVALS
AD8-04 CLOSURE_LAWS_MUST_BE_TESTED_NOT_ASSUMED
AD8-05 THREAT_MODEL_AMPLIFICATION_IS_FORBIDDEN
AD8-06 INFORMATION_AND_AUTHORITY_ARE_PREORDERS_UNTIL_QUOTIENTED
AD8-07 EQUIVALENCE_REQUIRES_MUTUAL_PREORDER_REFINEMENT
AD8-08 INFORMATION_EQUIVALENCE_DOES_NOT_IMPLY_AUTHORITY_EQUIVALENCE
AD8-09 AUTHORITY_EQUIVALENCE_DOES_NOT_IMPLY_EFFECT_EQUIVALENCE
AD8-10 CLAIM_STATUS_IS_JUSTIFIED_ASSESSMENT_NOT_WORLD_TRUTH
AD8-11 STATUS_TRANSITIONS_REQUIRE_CLAIM_SPECIFIC_RULES
AD8-12 PRIOR_JUSTIFICATION_MAY_BE_INVALIDATED
AD8-13 REPRESENTATION_RELATION_PRECEDES_GLOBAL_ABSTRACTION_FUNCTION
AD8-14 CONCRETIZATION_IS_CLAIM_SCOPED
AD8-15 ABSTRACT_COUNTEREXAMPLE_REQUIRES_CONCRETE_WITNESS
AD8-16 BOUNDED_COUNTERMODEL_SEARCH_IS_NOT_A_GENERAL_PROOF
AD8-17 HIDDEN_EPOCH_BLOCKS_CURRENT_AUTHORITY_CLAIMS
AD8-18 HIDDEN_COMMON_MODE_BLOCKS_INDEPENDENCE_CLAIMS
AD8-19 HIDDEN_INCARNATION_BLOCKS_HISTORICAL_IDENTITY_CLAIMS
AD8-20 REFINEMENT_MAPPING_MAY_BE_CLAIM_INDEXED

## 26. Updated frontier

AB7-G1 advanced: admissible history candidate defined.
AB7-G2 advanced: temporal hyperedge closure candidate defined.
AB7-G3 advanced: threat-model semantics candidate defined.
AB7-G4 advanced: preorders and quotient strategy defined.
AB7-G5 advanced: status transition semantics defined.
AB7-G6 advanced: representation-first gamma defined.
AB7-G7 advanced: finite falsification methodology and MC-A..G.
AB7-G8 remains open: minimal abstract state for first TLA+ model.

New frontier:
AB8-G1 formalize claim assessment as a multi-sorted semantic object.
AB8-G2 prove/deny closure laws using finite countermodels.
AB8-G3 formalize threat-model non-amplification.
AB8-G4 formalize preorder transitivity/reflexivity.
AB8-G5 define exact invalidation semantics.
AB8-G6 define witness extraction and joint realizability algorithmically.
AB8-G7 define minimal refinement mapping requirements.
AB8-G8 only then derive TLA+ state variables.

## Verification boundary

No implementation. No TLA+ execution. No theorem claimed proven.
