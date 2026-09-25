# NEXO AB56 — LOWER-ARITY / FUTUREOBS_PAA / RECONSTRUCTION / EVENTDAG RESEARCH V1 — 2026-09-25

Status: RESEARCH ONLY. No semantic freeze, no runtime implementation, no TLC/TLAPS.

## 1. Objective

AB55 established a bounded finite interpreter and executed eight highest-value ternary attacks while preserving UNKNOWN for unspecified protocol semantics. AB56 extends that bounded model with:

- lower-arity observation projections;
- explicit FutureObs_PAA comparison;
- reconstruction testing;
- partial-order/EventDAG representation;
- a strict distinction between a mathematical ternary witness and a protocol-level P_AA collision.

The model remains intentionally bounded. Results are therefore claims about the modeled semantics only.

## 2. Observation model

For a bounded history H and initial state s, define:

- CurrentObs(H,s): terminal P_AA result after executing H, where result ∈ {TRUE, FALSE, UNKNOWN};
- LowerObs(H,s): the family of unary and ordered-binary observations induced by the same event labels under the modeled transition semantics;
- FutureObs_PAA(H,s,C): the P_AA observation of legal continuation C after H;
- FutureObsSet(H,s): the set of all modeled continuation observations reachable from H, including UNKNOWN whenever continuation semantics are unspecified.

UNKNOWN is epistemic, not a fourth truth value. It means the bounded interpreter cannot justify a successor or observation from the retained semantics.

## 3. Reconstruction criterion

A ternary history H is reconstructible from its lower-arity representation iff every modeled history H' with the same LowerObs and the same retained boundary/context information has identical CurrentObs and identical FutureObsSet.

A reconstruction failure is only a mathematical non-reconstructibility result. It becomes a protocol P_AA collision candidate only if the differing histories are both legal, share all lower-arity facts required by the AB51 gate, and have a legal future continuation whose P_AA observation differs.

## 4. EventDAG model

A history is represented as a DAG:

EventNode = <event identity, predecessor set, read-set, mutation, observation support>.

An edge x -> y means y is causally ordered after x. Independent events remain unordered. A linearization is any topological ordering of the DAG.

The interpreter must evaluate all relevant linearizations rather than silently imposing a total order. If two linearizations are semantically equivalent for CurrentObs and FutureObsSet, their order distinction is observationally irrelevant in the bounded model.

If an ordering difference changes an observation but the model lacks the protocol rule deciding whether that ordering is legal, the result is UNKNOWN rather than a fabricated EventDAG edge.

## 5. Lower-arity gate

The eight AB55 ternary attacks were retained unchanged:

1. POLICY_CHANGE + DELEGATION_CHANGE + ADMIT
2. DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT
3. LEASE_RENEW + POLICY_CHANGE + ADMIT
4. LEASE_EXPIRE + RETRY + ADMIT
5. DECIDE + AUTH_REVOKE + ADMIT
6. RECHECK + MUTATION + ADMIT
7. RETRY + LEASE_CONSUME + ADMIT
8. RESOURCE_REINCARNATE + LEASE_RENEW + ADMIT

For each attack, all six event orders are considered in the finite model. Unary and ordered-pair projections are retained before evaluating the ternary observation.

## 6. Bounded findings

### 6.1 Explicit-invalidating attacks

POLICY_CHANGE + DELEGATION_CHANGE + ADMIT and DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT contain explicit invalidation that survives every order in which the invalidating event precedes ADMIT. The bounded model therefore reconstructs the resulting FALSE outcome from retained predicates whenever no UNKNOWN-producing transition is involved.

DECIDE + AUTH_REVOKE + ADMIT likewise exposes a direct authority invalidation. DECIDE itself does not create admission linkage, so it cannot mask AUTH_REVOKE under the AB54 schema.

### 6.2 UNKNOWN-producing attacks

Any attack containing LEASE_RENEW or RETRY or MUTATION reaches UNKNOWN when the corresponding underspecified transition is encountered before the final ADMIT. This is intentional. The interpreter does not infer renewal successor validity, retry inheritance, or mutation semantics.

Consequently, these cases cannot be promoted to a P_AA collision merely because different orders contain UNKNOWN. Missing semantics prevent a justified legal-successor comparison.

### 6.3 No bounded protocol collision established

Within the AB54/AB55 bounded state domain and the explicit transition rules, AB56 does not establish a fully specified ternary P_AA collision satisfying the lower-arity equality, legal-history, legal-continuation, and differing-FutureObs_PAA requirements simultaneously.

This is NOT evidence that no collision exists in the full protocol. It is a bounded non-finding under the currently explicit semantics.

## 7. EventDAG result

The EventDAG representation separates three cases:

1. Forced order: an explicit dependency/read-set rule requires x -> y.
2. Independent order: neither event reads a fact mutated by the other, so both topological orders are retained.
3. Unknown order legality: the protocol does not specify whether an observed interaction creates an ordering constraint; the edge is not invented and the affected comparison is UNKNOWN.

This prevents a total-order simulation from accidentally converting a missing concurrency rule into protocol semantics.

## 8. Reconstruction result

The bounded model supports reconstruction for the explicit-invalidating cases because the final P_AA predicates are retained and the relevant mutations are deterministic. It does not justify reconstruction across UNKNOWN-producing transitions.

Therefore:

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY

## 9. What remains before 286-triple expansion

Before broadening to all 286 triples, the interpreter must make the following gates explicit:

- actual UsedAdmissionContext identity and binding equality;
- protocol-specific continuation legality;
- exact FutureObs_PAA domain rather than a single terminal result;
- explicit lease renewal successor semantics;
- retry inheritance semantics;
- mutation/recheck ordering and result linkage;
- EventDAG edge-generation rules;
- history-support retention/removal test;
- complete ternary assignment enumeration over the concrete binding-state domain.

## 10. Four-event escalation rule

No four-event search is justified from AB56 alone. A ternary candidate must first survive lower-arity equality, EventDAG order closure, invalidation closure, protocol read-set comparison, reconstruction, and FutureObs_PAA comparison with no unresolved semantic dependency.

Only a fully specified survivor can be escalated.

## 11. Status

AB56 advances the frontier from a simple bounded sequential interpreter to a bounded observational/EventDAG framework. It narrows the unresolved space but does not close it. No prior AB artifact is modified or superseded.
