# NEXO AB28 — P_AA ORDER-DEPENDENCY MATRIX, TRANSITIVE REDUCTION, CONCURRENCY ATTACKS, AND REFINEMENT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External cross-check
Lamport's official material treats executions as sequences of states and emphasizes that the choice of step/action granularity matters. History variables can preserve past ordering information needed by a refinement mapping, while stuttering is valid only relative to the variables relevant to the abstraction. The reduction target therefore must be claim-relative rather than raw trace equality.

## 2. Exact-order dependency candidate
For an admission a and events e1,e2, define a candidate dependency predicate:
`Dep_AA(e1,e2,a)` iff changing the relative order of e1 and e2, while preserving all other modeled facts and keeping the histories valid, can change the P_AA assessment of a or of an allowed future admission.

This is a semantic test, not merely a syntactic test based on event types.

## 3. Event-to-admission dependency matrix
AuthorityIssue -> Admit: relevant when the admission depends on that authority.
AuthorityRevoke -> Admit: relevant when the revoke targets the authority used by the admission.
EpochAdvance -> Admit: relevant when the admission is epoch-bound.
DelegationChange -> Admit: relevant when the admission depends on the affected delegation chain.
PolicyChange -> Admit: relevant when policy compatibility is admission-relevant.
ResourceReincarnate -> Admit: relevant when the admission targets the affected resource.
LeaseIssue -> Admit: relevant for LEASE protocol admissions using that bridge.
LeaseExpire -> Admit: relevant when expiration can occur before the admission linearization point.
AttemptCreate/Retry -> Admit: relevant when attempt identity is part of the actual admission binding.
Decide -> Admit: relevant when the protocol requires a decision-to-admission bridge.
Abort -> Admit: relevant only where abort changes whether the concrete admission linkage exists.

## 4. Not every pair needs direct storage
If e1 <AA e2 and e2 <AA e3 are independently required and the order relation is transitive, e1 <AA e3 may be derivable rather than stored.

Therefore:
`MINIMAL_ORDER_STORAGE != TRANSITIVE_ORDER_CLOSURE`.

The semantic closure may contain more relations than the representation must physically store.

## 5. Admission-centered order skeleton
A candidate minimal skeleton is therefore centered on each actual admission linkage:
`OS_AA(a) = (Predecessors(a), Successors(a), Binding(a), Protocol(a), InvalidationLinks(a))`.

Only events capable of changing the validity of the linked admission, or the bridge establishing that validity, need to enter the skeleton.

## 6. Pairwise commutation is not enough
A dangerous compression rule would be:
if e1 and e2 appear individually commutative, erase their order.

That is not yet sound because three-way interactions can exist.

New principle:
`PAIRWISE_COMMUTATION != GLOBAL_PAA_EQUIVALENCE`.

A set of events must be considered jointly whenever their combined invalidation, bridge, delegation, policy, incarnation, or binding effects can change P_AA.

## 7. Concurrent-event countermodels
CM-AA180 — policy and delegation changes are individually harmless under the current witness but jointly invalidate it.
CM-AA181 — delegation and incarnation changes interact through a lease bridge.
CM-AA182 — two individually irrelevant events jointly change the validity of a future admission.
CM-AA183 — three events have pairwise commuting projections but a different joint ordering changes bridge availability.
CM-AA184 — two unrelated events are incorrectly forced into a total order, creating false history distinctions.
CM-AA185 — true concurrency is collapsed into a single arbitrary order and later interpreted as causal.
CM-AA186 — partial order omits a shared-resource relation that becomes relevant only after a retry.
CM-AA187 — policy and lease events are independent by type but not by binding.
CM-AA188 — same precedence graph, different event bindings.
CM-AA189 — same bindings, different protocol class.
CM-AA190 — same current validity, different admission linearization position.

## 8. Binding-aware order is mandatory
Order cannot be minimized independently of bindings.
`ORDER(e1,e2)` without knowing which authority/resource/incarnation/policy/delegation/attempt/bridge each event addresses can collapse histories that are semantically different.

Thus the order structure must preserve binding endpoints or an equivalent quotient.

## 9. Causal order remains separate
Even when an order relation is required for P_AA, it must not automatically be labeled causal.
Candidate relations remain distinct:
`PRECEDES_AA`, `CAUSES`, `INVALIDATES`, `BINDS`, `COMMON_MODE`.

A later formal model may prove some implication between these relations, but none is assumed now.

## 10. Partial-order reduction candidate
An event pair may be treated as order-independent only if a stronger claim-relative commutation test succeeds:
1. both events are enabled in the relevant context;
2. both orderings are valid executions;
3. both produce equivalent P_AA-relevant state;
4. actual admission linkage is preserved;
5. bridge/lease replay and invalidation behavior is preserved;
6. every relevant future continuation remains P_AA-equivalent;
7. no hidden history distinction needed by a future admission is lost.

Failure of any condition means order must not be erased.

## 11. Claim-relative refinement versus bisimulation
For proving a one-way safety abstraction, a forward refinement/simulation obligation may be sufficient: every concrete relevant behavior must be represented by an abstract behavior that preserves the safety claim.

For an exact behavioral quotient, stronger two-way correspondence is needed. The current project therefore must not call the relation 'bisimulation' until both directions and the observation function are explicitly defined and checked.

Lamport's refinement material supports the distinction between implementation/refinement and the auxiliary information needed to construct the mapping.

## 12. Candidate observation function
Define a claim-relative observation:
`Obs_AA(h) = sequence/set of P_AA assessments of actual admissions plus UNKNOWN where required distinctions are unavailable.`

The exact choice between sequence and set remains open because admission identity and temporal order may themselves be claim-relevant.

## 13. Stronger behavioral relation
Candidate:
`h1 ≈AA h2` iff under the same assumptions, corresponding actual admissions have equivalent binding/protocol context, their P_AA-relevant order structures are equivalent, and every allowed future continuation yields equivalent Obs_AA results.

This relation is intentionally stronger than equal current AA_Norm and weaker than identical complete traces.

## 14. New compression countermodels
CM-AA191 — same AA_Norm, different order skeleton.
CM-AA192 — same order skeleton, different actual admission linkage.
CM-AA193 — same order and linkage, different lease replay history.
CM-AA194 — same order and linkage, different boundary scope.
CM-AA195 — same current observation, future continuation split.
CM-AA196 — UNKNOWN incorrectly collapsed into FALSE.
CM-AA197 — UNKNOWN incorrectly collapsed into TRUE.
CM-AA198 — missing order treated as arbitrary deterministic order.
CM-AA199 — total-order serialization creates a false causal conclusion.
CM-AA200 — transitive edge removed without preserving the path that proves it.

## 15. Revised semantic-kernel candidate
The current kernel candidate is not yet proven minimal:
`K_AA = AA_Norm + Ord_AA + LeaseBridge + AdmissionBindingClass`.

Important correction: Ord_AA cannot be treated as an independent scalar component. It is relational and binding-aware, and may be partly encoded by LeaseBridge, AdmissionBindingClass, or retained history. Whether those structures can absorb all order semantics remains an open quotient question.

## 16. Result
AB28 establishes a candidate dependency matrix and shows why simple pairwise order compression is unsafe.

Key conclusions:
- order relevance is admission- and binding-specific;
- transitive closure may be semantically required without every edge being stored;
- pairwise commutation is insufficient for global claim equivalence;
- partial-order reduction must preserve joint invalidation and bridge behavior;
- exact bisimulation must not be claimed before both directions are formalized;
- the candidate semantic kernel is still not proven minimal.

## 17. AB29 frontier
1. Construct the concrete dependency graph for the six-component kernel.
2. Derive minimal order edges for every event class and binding relation.
3. Build explicit 2- and 3-event concurrency countermodels.
4. Test whether Ord_AA can be factored into AdmissionBindingClass, LeaseBridge, and residual history without semantic loss.
5. Define the exact observation function for P_AA.
6. Formulate the first concrete-to-abstract simulation obligation.
7. Only after that, decide the variable set for the first TLA+ model.