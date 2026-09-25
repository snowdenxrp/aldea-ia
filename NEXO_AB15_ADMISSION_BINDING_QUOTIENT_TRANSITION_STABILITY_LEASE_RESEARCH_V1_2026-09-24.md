# NEXO AB15 — ADMISSION BINDING QUOTIENT, TRANSITION STABILITY, LEASE/FENCE REDUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## Scope

AB15 tests whether AdmissionBindingClass can be a stable quotient under every P_AA-relevant transition, determines what a lease/fence must bind, attacks elimination of PendingDecision, and derives a first finite-domain basis.

## External cross-check

Lamport's refinement material confirms that refinement mappings may require auxiliary/history variables and that state-machine refinement is expressed by mapping lower-level behavior to higher-level behavior. His examples also distinguish history variables from actual program state. These support the methodology, not Nexo correctness. TLA+ model checking checks the behaviors of the finite model supplied; it does not establish that the implementation or all unmodeled domains satisfy the claim. 

## 1. Quotient target

Define a claim-relative relation:

x ≡AA y iff, under the same allowed environment/threat assumptions, every P_AA-relevant continuation from x and y has the same admission-authorization result for corresponding admitted attempts.

This is stronger than equality of current fields.

A quotient is admissible only if every concrete transition maps equivalent states to equivalent successor classes, or explicitly produces UNKNOWN/PENDING where the abstraction cannot preserve the distinction.

## 2. Stability attack

For each transition T:

x ≡AA y => T(x) ≡AA T(y)

is required only when T is abstracted identically and its preconditions are represented identically.

If T can distinguish x and y, the quotient is too coarse.

### Results

AUTHORITY ISSUE/REVOKE:
Requires authority consequences/currentness to remain distinguishable.

EPOCH ADVANCE:
Requires epoch/currentness. Equal capability is insufficient.

DELEGATION CHANGE:
Requires delegation consequence or an equivalent derived validity relation.

POLICY CHANGE:
Requires policy compatibility context.

RESOURCE REINCARNATION:
Requires resource incarnation.

FENCE ISSUE/EXPIRY:
Requires fence freshness and its bindings if admission can occur between decision and admission.

RETRY:
Requires attempt binding whenever retries can differ in P_AA-relevant authorization.

ADMIT:
Consumes the current authorization context and creates an admission binding. The admission binding must preserve the distinctions necessary to evaluate P_AA for that admitted attempt.

ABORT:
Cannot be used as evidence of no external effect because external effect is outside P_AA.

## 3. AdmissionBindingClass quotient

A useful compressed representation is:

AdmissionBindingClass =
  equivalence class of concrete admission snapshots under ≡AA.

The class identifier itself is not semantically sufficient unless the refinement relation can recover all P_AA-relevant consequences.

Therefore:
CLASS_ID != MAGIC_AUTHORIZATION_TOKEN.

The class is a mathematical quotient, not an implementation credential.

## 4. Candidate minimum dimensions

The current adversarial basis requires the class to preserve, directly or through recoverable context:

1. operation identity
2. attempt identity
3. subject identity
4. resource identity
5. resource incarnation
6. capability
7. scope
8. authority epoch/currentness
9. policy compatibility context
10. delegation validity/context
11. fence/lease binding when non-atomic
12. admission temporal position or an equivalent ordering relation

Not every dimension must be independently stored. A composite identifier may represent several dimensions only if the refinement contract guarantees injectivity over all P_AA-relevant distinctions.

## 5. PendingDecision elimination test

PendingDecision is eliminable if there exists a decision/admission bridge B such that:

B binds every P_AA-relevant authorization consequence;
B has explicit validity/freshness semantics;
B is bound to the correct subject, resource incarnation, attempt, policy/delegation context, and authority epoch;
B cannot be replayed across incompatible contexts;
B has an explicit admission-time validity rule.

If all conditions hold, PendingDecision is derivable from the active bridge and need not be an independent abstract state component.

If any condition fails, PendingDecision remains necessary or the bridge model must be strengthened.

## 6. Fence/lease minimum contract

Candidate FenceLeaseContext:

issuer/authority reference
subject binding
resource + incarnation binding
operation + attempt binding
authority epoch
policy compatibility digest/context
delegation context/digest
freshness/expiry
single-use or replay rule
boundary/scope
issuance and admission ordering relation

Critical separation:

Fence/lease freshness is not semantic authority.

The lease can preserve an authorization decision's validity interval only if its contract explicitly binds the authority consequences whose validity it is intended to carry.

## 7. New countermodels

CM-AA26 — lease replay across attempt:
A1 receives lease L; A2 reuses L without explicit binding. Quotient incorrectly admits A2.

CM-AA27 — lease replay across incarnation:
L for R@I1 reused after R@I2.

CM-AA28 — lease survives delegation revocation:
L remains syntactically fresh but delegation becomes invalid.

CM-AA29 — lease survives incompatible policy:
L fresh, authority otherwise valid, policy changes incompatibly.

CM-AA30 — fence collision:
Two contexts receive same visible fence value but differ in required binding. Syntax-valid fence cannot establish semantic freshness.

CM-AA31 — quotient transition split:
x and y are merged, but a future policy/delegation/incarnation transition causes different admission outcomes.

CM-AA32 — class identifier forgery/alias:
Two distinct P_AA classes map to one identifier because the identifier omitted a required dimension.

CM-AA33 — history-only distinction:
Current abstract fields are equal, but a required temporal relation differs and later affects admission. If auxiliary history cannot recover it, quotient is unsound.

## 8. Consequence for state/history separation

The quotient permits aggressive state compression only when the omitted distinctions remain recoverable.

Therefore:

MINIMAL_STATE != MINIMAL_SUPPORT

and

CLASS_COMPRESSION != INFORMATION_DELETION.

A safe compression may change representation while preserving the claim-relevant equivalence class.

## 9. Smallest finite-domain basis — candidate, not proof

The countermodel basis suggests the following minimum cardinalities for a first finite model:

Subjects: 1
Operations: 1
Attempts: 2
Resources: 1
Resource incarnations: 2
Authority epochs: 2
Policy contexts: 2
Delegation states: 2
Fences/leases: 2
Capabilities/scopes: 2
Temporal positions: at least 3 ordered positions

Rationale:
- 2 attempts distinguish operation-vs-attempt binding.
- 2 incarnations distinguish stale resource bindings.
- 2 epochs distinguish stale/current authority.
- 2 policy contexts distinguish compatibility/incompatibility.
- 2 delegation states distinguish valid/revoked.
- 2 fence/lease identities distinguish replay/collision.
- 2 capability/scope values distinguish matching/mismatching authorization.
- 3 temporal positions are safer than 2 because some attacks need an event before admission, an admission point, and a later transition; this remains a modeling hypothesis.

Subjects/operations/resources can remain singleton for the first claim because identity confusion can be represented by differing binding dimensions. This must be re-evaluated if subject-to-resource or operation-to-resource cross-binding itself becomes part of P_AA.

## 10. Important finite-model warning

A small finite basis is not automatically complete.

Completeness requires a coverage argument showing that every semantic distinction relevant to P_AA is represented or intentionally abstracted.

TLC, when eventually used, would check the supplied finite model's behaviors; it would not prove that the chosen finite domains cover all real-world cases.

## 11. Candidate invariants

AD15-01 QUOTIENT_IS_PAA_BEHAVIORAL
AD15-02 QUOTIENT_STABILITY_REQUIRES_TRANSITION_COMPATIBILITY
AD15-03 CLASS_ID_IS_NOT_AUTHORITY
AD15-04 CLASS_COMPRESSION_DOES_NOT_PERMIT_INFORMATION_LOSS
AD15-05 ADMISSION_CLASS_PRESERVES_REQUIRED_BINDING_DIMENSIONS
AD15-06 PENDING_DECISION_IS_ELIMINABLE_ONLY_IF_BRIDGE_IS_COMPLETE
AD15-07 FENCE_LEASE_FRESHNESS_IS_NOT_SEMANTIC_AUTHORITY
AD15-08 LEASE_BINDS_REQUIRED_SUBJECT
AD15-09 LEASE_BINDS_REQUIRED_RESOURCE_INCARNATION
AD15-10 LEASE_BINDS_REQUIRED_ATTEMPT
AD15-11 LEASE_BINDS_REQUIRED_POLICY_CONTEXT
AD15-12 LEASE_BINDS_REQUIRED_DELEGATION_CONTEXT
AD15-13 LEASE_REPLAY_IS_EXPLICITLY_REJECTED_OR_BOUND
AD15-14 TEMPORAL_RELATIONS_REQUIRED_BY_PAA_ARE_PRESERVED
AD15-15 MINIMAL_FINITE_DOMAINS_ARE_HYPOTHESES_UNTIL_COVERAGE_JUSTIFIED
AD15-16 TLC_MODEL_COVERAGE_IS_NOT_IMPLEMENTATION_PROOF

## 12. AB15 status

G1 advanced — quotient characterized.
G2 advanced — transition stability attack performed.
G3 advanced — lease/fence minimum contract derived.
G4 advanced — PendingDecision elimination criterion derived.
G5 advanced — CM-AA26..33.
G6 candidate — finite-domain basis.
G7 open — exact Rep_AA relation.
G8 open — complete quotient coverage/minimality argument.
G9 open — TLA+ draft only after these are closed.

## AB16 frontier

1. Define exact Rep_AA(c,a).
2. Construct a complete transition matrix: concrete transition × retained dimension × quotient effect.
3. Prove or refute quotient stability using countermodel families, without claiming formal proof.
4. Determine whether a lease/fence can replace PendingDecision without semantic weakening.
5. Build a complete CM-AA coverage matrix through CM-AA33.
6. Derive the smallest domains with an explicit symmetry/coverage argument.
7. Only then draft the narrow TLA+ model and refinement mapping.
