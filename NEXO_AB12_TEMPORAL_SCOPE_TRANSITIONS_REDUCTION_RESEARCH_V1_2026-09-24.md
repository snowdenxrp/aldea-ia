# NEXO AB12 — TEMPORAL SCOPE, TRANSITION OBLIGATIONS, FENCE BRIDGING AND REDUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## 1. Scope

AB12 continues P_AA: every internally admitted effect must have a currently valid Z1 authority matching the exact admission binding.

Boundary remains Z1 -> Z3. Z4 external execution is excluded.

## 2. External methodology cross-check

Lamport's refinement material explicitly permits history variables when past behavior is needed to construct a refinement mapping. The implementation/refinement relation is an implication between behaviors, and auxiliary variables can preserve information needed for the mapping. This supports the methodology only; it does not prove Nexo properties.

Cousot's temporal abstract interpretation shows that temporal abstraction can be sound yet incomplete, including for finite systems. His reduced-product treatment shows that component abstractions can exchange information to obtain more precise results, but the concrete/abstract correspondence remains the correctness basis.

## 3. AB12-G1 — Temporal scope of P_AA

P_AA must first declare what time it quantifies over.

Candidate scopes:

S_current:
  only the current admission.

S_decision:
  validity at authorization-decision time.

S_admission:
  validity at the concrete admission point.

S_interval:
  validity throughout a decision-to-admission interval.

S_historical:
  validity of every retained historical admission in the claim scope.

S_reconstruction:
  validity of historical admissions reconstructed from retained evidence.

These are different claims. A model must not silently substitute one for another.

For the first model, S_admission is the narrowest useful candidate, while S_historical becomes necessary if the model claims audit/reconstruction properties.

## 4. AB12-G2 — Concrete transition obligations

Candidate concrete transitions affecting P_AA:

AUTHORITY_ISSUE
AUTHORITY_REVOKE
EPOCH_ADVANCE
DELEGATION_CHANGE
POLICY_CHANGE
RESOURCE_REINCARNATE
FENCE_ISSUE
FENCE_REVOKE_OR_EXPIRE
DECISION
ADMIT
RETRY
ABORT

For each transition T, the abstract model must preserve every P_AA-relevant consequence of T.

Candidate obligation:

For each concrete transition T and claim-relevant state pair c -> c', if P_AA-relevant meaning changes, the abstract transition must change the corresponding abstract meaning or move the claim to an explicit UNKNOWN/PENDING state.

## 5. Transition matrix findings

AUTHORITY_ISSUE:
  changes available authority.

AUTHORITY_REVOKE:
  changes currentness; does not retroactively erase a prior valid admission.

EPOCH_ADVANCE:
  may invalidate prior authority; does not imply a new authority is valid.

DELEGATION_CHANGE:
  can invalidate authority even when the base capability is unchanged.

POLICY_CHANGE:
  can change admissibility without changing authority identity.

RESOURCE_REINCARNATE:
  changes resource identity context even when resource_id is unchanged.

FENCE_ISSUE:
  creates a freshness/order artifact; does not create semantic permission.

FENCE_EXPIRE/REVOKE:
  can invalidate an admission path if the protocol requires a live fence.

DECISION:
  records an authorization decision but does not automatically establish admission validity.

ADMIT:
  is the event directly constrained by P_AA.

RETRY:
  creates a new attempt and must re-evaluate the binding rules.

ABORT:
  stops an internal path; it does not prove that no external effect occurred, although external effect is outside this first claim.

## 6. AB12-G3 — Currentness attack

Countermodel CM-AA15:

t1: authority A valid under epoch E1.
t2: epoch advances to E2.
t3: no new authority for the operation exists.
t4: admission reuses A.

A model that treats epoch monotonicity as authority monotonicity can incorrectly accept t4.

Therefore:
  EPOCH_ADVANCE != AUTHORITY_GRANT.

CM-AA16:

t1: authority A valid.
t2: delegation revoked.
t3: base capability unchanged.
t4: admission attempted.

Therefore:
  CAPABILITY_UNCHANGED != AUTHORITY_CURRENT.

## 7. AB12-G4 — Decision-to-admission bridge

Three protocol classes emerge:

D0:
  decision and admission are the same atomic semantic event.

D1:
  decision creates a lease/fence that remains valid until admission.

D2:
  decision and admission are separate and admission rechecks authority.

Only D0/D1/D2 with explicit semantics can justify a relation between decision validity and admission validity.

Candidate invariant:

NO_IMPLICIT_DECISION_TO_ADMISSION_AUTHORIZATION.

For D1, the bridge must bind at least every dimension that P_AA requires: authority context, resource incarnation, policy compatibility, attempt binding, and freshness/order.

## 8. AB12-G5 — Snapshot minimization

A field is removable only if removing it preserves P_AA equivalence over every permitted concrete continuation in the claim scope.

Candidate criterion:

Remove field f only if for all concrete contexts c1,c2 differing only in f:
  P_AA(c1, future) == P_AA(c2, future)

for all allowed future continuations.

This is stronger than checking equality of current outputs.

Therefore snapshot minimization is a behavioral equivalence problem, not a structural compression problem.

## 9. AB12-G6 — Countermodel basis

Current minimal adversarial basis:

CM-AA1 stale epoch
CM-AA2 revoked authority
CM-AA3 wrong resource incarnation
CM-AA4 scope mismatch
CM-AA5 capability mismatch
CM-AA6 fence reuse
CM-AA7 policy mismatch
CM-AA8 operation/attempt confusion
CM-AA9 historical/current confusion
CM-AA10 external-success confusion (outside P_AA boundary)
CM-AA11 deleted admission snapshot
CM-AA12 final-state aliasing
CM-AA13 unsound current-state reduction
CM-AA14 decision/admission gap
CM-AA15 epoch advance without replacement authority
CM-AA16 delegation revocation with unchanged capability

CM-AA10 remains explicitly OUTSIDE the first claim and must not leak into the proof obligation.

## 10. AB12-G7 — Reduction operator

Let the component product be:

A x I x P x F x T

and candidate reduction rho.

The safe direction is:

gamma(rho(x)) must contain every concrete context still possible under the claim assumptions.

A reduction that deletes possible P_AA-relevant histories is unsound.

Reduction may safely remove combinations only when their impossibility follows from explicit concrete constraints.

Candidate invariant:

REDUCTION_MUST_BE_CONSERVATIVE_WITH_RESPECT_TO_P_AA_POSSIBILITY.

## 11. AB12-G8 — Candidate finite dimensions

Potential finite model dimensions:

Subjects: 1
Operations: 1
Attempts: 2
Resources: 1
Incarnations: 2
Epochs: 2
Policies: 2
Delegations: 2
Fences: 2
Actions/capabilities: 2
Temporal positions: bounded finite sequence

These are candidate bounds, NOT a proof that they are complete.

Finite model checking can expose counterexamples but cannot by itself establish implementation correctness.

## 12. Important new distinction

There are now two different minimization problems:

M_state:
  minimize abstract state components.

M_history:
  minimize historical information retained for refinement/reconstruction.

A state-minimal model may still require auxiliary/history variables for the refinement mapping.

Therefore:

MINIMAL_ABSTRACT_STATE != MINIMAL_HISTORY_SUPPORT.

Lamport's auxiliary-variable methodology directly motivates keeping this distinction explicit.

## 13. AB12 candidate invariants

AD12-01 CLAIM_TEMPORAL_SCOPE_MUST_BE_EXPLICIT
AD12-02 CURRENT_SCOPE_IS_NOT_HISTORICAL_SCOPE
AD12-03 EVERY_P_AA_RELEVANT_CONCRETE_TRANSITION_HAS_ABSTRACT_SEMANTICS
AD12-04 AUTHORITY_REVOKE_DOES_NOT_ERASE_PRIOR_VALID_ADMISSION
AD12-05 EPOCH_ADVANCE_DOES_NOT_GRANT_AUTHORITY
AD12-06 DELEGATION_REVOCATION_CAN_INVALIDATE_UNCHANGED_CAPABILITY
AD12-07 FENCE_ISSUE_DOES_NOT_CREATE_SEMANTIC_AUTHORITY
AD12-08 DECISION_REQUIRES_EXPLICIT_ADMISSION_BRIDGE
AD12-09 FENCE_BRIDGE_MUST_BIND_REQUIRED_CONTEXT
AD12-10 SNAPSHOT_MINIMIZATION_IS_BEHAVIORAL
AD12-11 COUNTERMODEL_BASIS_MUST_INCLUDE_TEMPORAL_ALIASING
AD12-12 EXTERNAL_SUCCESS_IS_OUTSIDE_P_AA
AD12-13 REDUCTION_MUST_PRESERVE_P_AA_RELEVANT_POSSIBILITY
AD12-14 FINITE_BOUNDS_ARE_HYPOTHESES_UNTIL_JUSTIFIED
AD12-15 MINIMAL_STATE_AND_MINIMAL_HISTORY_ARE_DISTINCT

## 14. AB12 status

G1 ADVANCED — temporal scope separated into explicit candidate claim variants.
G2 ADVANCED — concrete transition obligations enumerated.
G3 ADVANCED — epoch/delegation currentness countermodels added.
G4 ADVANCED — decision/admission bridge classified.
G5 ADVANCED — snapshot minimization converted into behavioral equivalence.
G6 ADVANCED — countermodel basis expanded to CM-AA16.
G7 OPEN — reduction operator still lacks a formal concrete/abstract proof obligation.
G8 OPEN — finite bounds remain hypotheses.
G9 NEXT — construct the smallest candidate semantic state and test every transition against the countermodel basis.

## 15. AB13 frontier

AB13-G1 define exact S_admission temporal semantics.
AB13-G2 derive the smallest abstract state from CM-AA1..16.
AB13-G3 derive auxiliary/history variables separately.
AB13-G4 define the concrete-to-abstract representation relation.
AB13-G5 attack every abstract transition with the countermodel basis.
AB13-G6 test reduction soundness conceptually.
AB13-G7 determine whether 2 attempts / 2 incarnations / 2 epochs / 2 policies are sufficient as countermodel dimensions.
AB13-G8 only after this, draft the first narrow TLA+ specification.

Verification boundary:
No implementation.
No TLA+ execution.
No TLC execution.
No theorem claimed proven.
