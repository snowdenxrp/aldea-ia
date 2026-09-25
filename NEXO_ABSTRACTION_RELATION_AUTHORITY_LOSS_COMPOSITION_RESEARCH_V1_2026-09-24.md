# NEXO — Abstraction Relation Selection, Authority Order, Loss/Unknown and Composition Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No V21. No V20 patching. No SANY/TLC/TLAPS execution.

## Objective

Continue from AB2-G1..AB2-G8. Determine which semantic primitives should be primary before any TLA+ model is attempted.

## 1. External cross-check

Cousot's abstract-interpretation framework supports both abstraction/concretization relations and Galois connections, while explicitly noting that correctness can be established under different correspondence relations. It also treats complex abstractions compositionally and discusses reduced products. citeturn0search0turn0search1turn0search3turn0search15

Therefore Nexo should not assume that every abstraction must be represented by a Galois connection. The mathematical framework should permit a more general representation relation and introduce alpha/gamma only where their required properties are established.

## 2. AB2-G1 — Primary semantic primitive

Candidate decision:

PRIMARY = representation/refinement relation

Secondary constructions:
- concretization gamma, when definable;
- abstraction alpha, when definable;
- Galois connection/insertion, only when its hypotheses are actually satisfied.

Reason:
Nexo abstractions may summarize history, authority epochs, hyperedges, enforcement boundaries and world/environment assumptions in ways that are not naturally captured by one uniform lattice. A relation-first model prevents an unjustified algebraic assumption.

Candidate:

Rep_P(c,a) means abstract context a is an admissible representation of concrete context c for claim contract P.

This is claim-scoped. There is no universal Rep relation independent of P.

## 3. Claim-relative abstraction

A critical refinement:

Rep(c,a) is too weak.

Use:

Rep(c,a,P)

because the distinctions required to preserve an accounting claim may differ from those required to preserve current authority, historical effect attribution or independence.

Thus:

GLOBAL_ABSTRACTION_SOUNDNESS is not a primitive.

CLAIM_RELATIVE_SOUNDNESS is.

## 4. AB2-G2 — Authority ordering

Authority must not be treated as an ordinary Boolean.

Candidate authority context:

A = (subject, capability, scope, resource, epoch, issuer, delegation_chain, revocation_state, boundary)

Define a partial order:

A1 ⊑auth A2

only if every authorization asserted by A1 is contained within A2 under the same identity, resource, epoch/currentness and boundary semantics.

Important:
This is a candidate partial order, not yet a formal authority lattice.

Non-amplification requirement:

If Rep(c,a,P) and a asserts authority A#, then A# must be supported by every relevant concrete context represented by a.

Otherwise the abstraction is authority-amplifying.

## 5. Authority is not monotonic under abstraction

More abstract does not mean more authorized.

An abstraction may:
- preserve authority;
- reduce known authority;
- produce UNKNOWN;
- invalidate a claim after hidden revocation is discovered.

Therefore:

ABSTRACTION_REFINEMENT != AUTHORITY_ESCALATION.

## 6. AB2-G3 — Loss and Unknown

Candidate:

Loss_P(a) = set of distinctions omitted by a that may affect P.

Partition:

LOSS-BENIGN
LOSS-BLOCKING
LOSS-UNKNOWN

LOSS-BLOCKING means the omitted distinction is known to affect P.

LOSS-UNKNOWN means its effect on P cannot currently be ruled out.

Only LOSS-BENIGN can be ignored for a claim.

Candidate conclusion rule:

BlockingLoss(P,a) => result(P,a) <= UNKNOWN

unless an independent argument establishes irrelevance.

This preserves the earlier principle that UNKNOWN is a valid sound result.

## 7. Loss must preserve dependency closure

A loss record itself must not be a shallow list.

For each lost distinction d, retain:
- source scope;
- affected claim types;
- dependency closure;
- possible authority impact;
- possible historical impact;
- possible enforcement impact;
- invalidation triggers;
- evidence needed to resolve it.

Thus:

LOSS_RECORD != JUST_MISSING_FIELD.

## 8. AB2-G4 — Relational abstraction

For a claim requiring k related executions/contexts:

RelationalArity(P)=k.

Define a k-ary representation relation:

Rep_k(C_k,A_k,P)

where C_k is a tuple/set of concrete executions and A_k is the corresponding abstract relational context.

This avoids reducing independence/common-mode claims to single-execution summaries.

Candidate requirement:

For relational P, all P-required cross-execution relations must be preserved or explicitly become UNKNOWN.

## 9. AB2-G5 — Composition

For abstractions A1 and A2:

Rep(c,a1,P)
and
Rep(a1,a2,P)

does not by itself guarantee:

Rep(c,a2,P).

A composition theorem requires:
- compatible claim contracts;
- compatible boundaries;
- transitive representation/refinement relation;
- composed loss semantics;
- preserved authority/currentness;
- preserved relational arity;
- preserved required hyperedges.

Candidate composition contract:

Compose_P(A1,A2) is valid only if every distinction required by P after A2 is either:
1. preserved from concrete through A1 and A2; or
2. proven irrelevant by the composition contract.

This directly connects to the earlier typed closure composition work.

## 10. AB2-G6 — Counterexample concretization

An abstract counterexample x# is concrete only if:

exists x in gamma(x#)
such that Violation_P(x).

If gamma is unavailable, a direct witness mapping may be used.

If neither exists:

ABSTRACT_ONLY_FALSE
or
CONCRETIZATION_PENDING

must not be promoted to PROVEN_FALSE.

This prevents spurious abstract counterexamples from becoming concrete claims.

## 11. AB2-G7 — Negative evidence

Define:

AbsenceCapable(B,E)

meaning boundary B can establish absence of event class E over the relevant time/scope.

Only if AbsenceCapable is true can:

NoWitness(E,B) => NoEvent(E,B)

be considered.

Otherwise:

NoWitness => UNKNOWN.

This connects retention, compaction, observation and historical reconstruction.

## 12. AB2-G8 — State vs auxiliary/history variables

Candidate separation:

STATE VARIABLES:
facts required to define the abstract safety semantics at the current abstraction level.

AUXILIARY/HISTORY VARIABLES:
information required only to establish the refinement/representation relation, reconstruct causal/history distinctions, or prove correspondence.

The distinction is methodological, not yet a TLA+ design.

A fact should not be hidden as “auxiliary” if the actual abstract claim semantics depends on it.

Conversely, raw implementation history should not automatically become part of the abstract state.

## 13. New critical finding — abstraction boundary is a security boundary

The abstraction boundary is not merely a compression boundary.

If an omitted distinction can alter:
- authority;
- effect identity;
- enforcement;
- historical attribution;
- common-mode independence;
- currentness;
- ordering;
- resource incarnation;

then the abstraction boundary changes the security claim.

Therefore:

ABSTRACTION_BOUNDARY_REQUIRES_SECURITY_CLASSIFICATION.

Candidate classification:
- CLAIM-IRRELEVANT
- CLAIM-PRESERVING
- CLAIM-DEGRADING
- CLAIM-BLOCKING
- UNKNOWN

## 14. New critical finding — refinement can strengthen knowledge without strengthening authority

A refined model may know more without receiving more authority.

Therefore distinguish:

KNOWLEDGE_REFINEMENT
AUTHORITY_REFINEMENT

A refined abstraction can move:

UNKNOWN -> PROVEN_TRUE

without any authority change.

It must not move:

UNAUTHORIZED -> AUTHORIZED

merely because the representation became more precise.

## 15. New critical finding — composition can be direction-sensitive

A1 may be safe for universal safety while unsafe for historical existence.

Therefore:

Compose(A1,A2,P1) may be valid
while
Compose(A1,A2,P2) is invalid.

No universal “safe composition” flag.

## 16. Candidate invariants AD3-01..AD3-20

AD3-01 REPRESENTATION_IS_CLAIM_SCOPED
AD3-02 ALPHA_GAMMA_ARE_OPTIONAL_CONSTRUCTIONS
AD3-03 GALIOS_CONNECTION_REQUIRES_EXPLICIT_HYPOTHESES
AD3-04 SOUNDNESS_IS_NOT_GLOBAL
AD3-05 AUTHORITY_ORDER_IS_SEPARATE_FROM_INFORMATION_ORDER
AD3-06 ABSTRACTION_MUST_NOT_AMPLIFY_AUTHORITY
AD3-07 AUTHORITY_REFINEMENT_IS_NOT_KNOWLEDGE_REFINEMENT
AD3-08 LOSS_IS_TYPED_BY_CLAIM_IMPACT
AD3-09 BLOCKING_LOSS_FORCES_UNKNOWN_UNLESS_IRRELEVANCE_IS_PROVEN
AD3-10 LOSS_RECORDS_REQUIRE_DEPENDENCY_CONTEXT
AD3-11 RELATIONAL_CLAIMS_REQUIRE_K_ARY_REPRESENTATION
AD3-12 COMPOSITION_REQUIRES_CLAIM_RELATIVE_SOUNDNESS
AD3-13 COMPOSITION_REQUIRES_LOSS_COMPATIBILITY
AD3-14 ABSTRACT_COUNTEREXAMPLE_REQUIRES_CONCRETE_WITNESS
AD3-15 NEGATIVE_EVIDENCE_REQUIRES_ABSENCE_CAPABILITY
AD3-16 NO_WITNESS_DOES_NOT_IMPLY_NO_EVENT_BY_DEFAULT
AD3-17 AUXILIARY_HISTORY_MUST_NOT_HOLD_UNMODELED_CLAIM_SEMANTICS
AD3-18 ABSTRACTION_BOUNDARIES_REQUIRE_SECURITY_CLASSIFICATION
AD3-19 REFINEMENT_MAY_INCREASE_KNOWLEDGE_WITHOUT_INCREASING_AUTHORITY
AD3-20 COMPOSITION_VALIDITY_IS_CLAIM_AND_DIRECTION_SPECIFIC

## 17. Updated frontier

AB2-G1: substantially advanced; representation relation selected as primary candidate, but formal ordering/refinement properties remain open.

AB2-G2: authority order candidate defined; exact algebra/order properties remain open.

AB2-G3: Loss/Unknown semantics advanced; complete formal result lattice remains open.

AB2-G4: k-ary relational abstraction candidate defined; concrete hyperproperty semantics remain open.

AB2-G5: composition obligations identified; theorem remains open.

AB2-G6: counterexample concretization condition identified; formal witness construction remains open.

AB2-G7: absence capability identified; formal boundary semantics remain open.

AB2-G8: state/history distinction established as a design obligation; TLA+ encoding remains open.

New gaps:
AB3-G1 formalize claim-relative representation relation.
AB3-G2 define authority partial order and revocation semantics.
AB3-G3 define Loss impact algebra.
AB3-G4 define k-ary hyperproperty representation.
AB3-G5 prove composition under compatible contracts.
AB3-G6 define concrete witness extraction.
AB3-G7 formalize absence-capable observation/retention boundaries.
AB3-G8 derive TLA+ variables only after these semantics stabilize.

## Verification boundary

Research only. No implementation, no formal execution, no theorem claimed proven, no runtime/deployment verification.
