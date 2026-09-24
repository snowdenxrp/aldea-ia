# NEXO — UNKNOWN_ORDER / CONCURRENT TRANSITIONS / TEMPORAL INVARIANTS — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can two transitions be individually safe and fit the aggregate budget, yet violate a mission invariant because their causal order is unknown or because their intermediate states interact?

## External cross-check

etcd documents strict serializability and linearizable operations for its KV API, while its watch stream is explicitly not itself linearizable; clients must use revisions to reason about ordering. Its transactions can atomically evaluate multiple comparisons and apply a conditional update. citeturn0search0turn0search3 Lamport's current PlusCal/TLA+ material emphasizes modeling concurrency and nondeterminism at the algorithm level and checking it with TLC, rather than relying on code-level debugging. citeturn0search4turn0search7

## Core result

YES.

INDIVIDUAL_SAFE(E1) ∧ INDIVIDUAL_SAFE(E2) ∧ AGGREGATE_BUDGET_OK does not by itself imply MISSION_SAFE(E1,E2).

A missing causal order can matter when:
- transitions are non-commutative;
- one changes the precondition of the other;
- an intermediate state violates the invariant;
- one consumes/releases capacity required by the other;
- compensation/retry depends on which effect happened first;
- external world ordering differs from Nexo control ordering.

Therefore KNOWN_ORDER can be a safety dependency, and UNKNOWN_ORDER is not equivalent to arbitrary order.

## 1. Order-sensitive versus commutative effects

Effects may be COMMUTATIVE, ORDER_SENSITIVE, MUTUALLY_EXCLUSIVE, CONDITIONALLY_COMMUTATIVE, or UNKNOWN.

If an invariant depends on order, Nexo needs protected ordering or a proof that all allowed orders are safe.

Candidate predicate: SAFE_FOR_ALL_ORDERS(S,M).

If true, unknown order can be tolerated for that claim. If false and order cannot be established, HOLD/QUARANTINE is the safe default.

## 2. Internal order versus external order

We distinguish CONTROL_ORDER, PROVIDER_ORDER, RESOURCE_ORDER, WORLD_EFFECT_ORDER and OBSERVATION_ORDER.

A linearized internal decision does not automatically determine external effect order. Therefore CONTROL_ORDER != WORLD_EFFECT_ORDER.

## 3. Partial order is often sufficient

A global total order may be unnecessary. If only E1 BEFORE E2 matters, unrelated effects can proceed concurrently.

Candidate CausalConstraint(E1,E2,BEFORE).

The ordering relation must be authoritative through coordination, resource sequencing, fencing, provider ordering, or a proof that ordering is irrelevant.

OBSERVED_ORDER != CAUSAL_ORDER.

## 4. Unknown order as uncertainty set

If E1/E2 relative order is unknown, uncertainty can contain E1→E2, E2→E1 and, when permitted, interleavings.

Candidate SAFE_UNDER_ORDER_UNCERTAINTY(action,U,M).

The action/claim is safe only if the invariant survives every permitted world.

## 5. Interleaving

For multi-step effects E1=a1→a2 and E2=b1→b2, histories can include a1,b1,a2,b2 rather than only whole-effect orders.

This is the class of concurrency problem PlusCal/TLA+ is designed to model and check. citeturn0search7

## 6. Safe pre/post does not imply safe interleaving

SAFE(pre) ∧ SAFE(post) ∧ SAFE(E1) ∧ SAFE(E2) does not imply concurrent safety if an intermediate state is forbidden.

## 7. Commutativity is claim-specific

Two effects may commute for one invariant but not another. A commutativity claim must bind effect class, target, invariant, context, resource incarnation and assumptions.

Candidate CompatibilityClaim(effect_pair,invariant,context).

## 8. Fencing and order

A fence generation can establish a protected ordering boundary only to the extent guaranteed by the resource contract.

FENCE_GENERATION=2 does not prove all generation-1 work has completed. Therefore FENCE_ORDER != WORLD_COMPLETION_ORDER.

## 9. Release/acquire race

If E1 releases Q and E2 acquires Q before external release is confirmed, E2 may consume Q while E1 still occupies it.

Thus LOCAL_RELEASE → E2_ADMISSION is unsafe unless the external contract proves the needed world property.

## 10. Transfer and compensation races

Transfers and compensations can create causal chains. UNKNOWN original outcome plus compensation produces multiple possible histories, so compensation needs its own identity, order, interaction contract and mission analysis.

## 11. Retry race

After E1/A1 timeout, A2 may begin while A1 continues. Possible worlds include A1 only, A2 only, A1+A2, either ordering, or overlap. Retry admission therefore needs order/interaction analysis in addition to idempotency.

## 12. STOP and invalidation races

STOP_REQUEST_ORDER, STOP_ENFORCEMENT_ORDER, RESOURCE_FENCE_ORDER and WORLD_EFFECT_ORDER are distinct boundaries.

Likewise, concurrent invalidation and admission require either authoritative order, an enforcement fence that makes stale admission ineffective, or a claim safe under both orderings.

## 13. Unknown order can be harmless

If effects commute for the relevant claim and all permitted interleavings preserve the invariant, forcing an order is unnecessary. This supports ONE AUTHORITATIVE SAFETY ORDER PER INTERACTING CLAIM rather than a global total order.

## 14. New objects

CausalConstraint:
- constraint_id
- source_effect
- target_effect
- relation
- invariant_scope
- required_order
- authority_basis
- resource/incarnation scope
- enforcement mechanism
- valid context
- linearization reference
- evidence
- invalidation conditions.

InterleavingContract:
- contract_id
- effect set
- allowed/forbidden interleavings
- intermediate-state constraints
- commutativity claim
- resource/incarnation dependencies
- fence requirements
- uncertainty semantics
- verification method.

TemporalSafetyClaim:
- claim_id
- invariant
- time/ordering semantics
- covered transitions
- allowed interleavings
- required causal relations
- uncertainty set
- safe region
- evidence/context/freshness
- dependencies/invalidation triggers.

## 15. Invariant family INV-ORDER-01..30

01 Unknown order is not arbitrary order.
02 Control order does not imply world order.
03 Observation order does not imply causal order.
04 Provider order does not automatically equal world-effect order.
05 Resource order requires a resource contract.
06 Order requirements are claim-specific.
07 Commutativity is claim-specific.
08 Unknown order may be tolerated only if all permitted orders are safe.
09 Interleavings must be considered for multi-step effects.
10 Safe pre/post does not imply safe intermediate states.
11 Partial order can replace total order when sufficient for the claim.
12 Causal constraints require authoritative enforcement or proof.
13 Timestamps do not establish causal order by themselves.
14 Queue order does not establish external completion order.
15 Fence generation does not prove prior work completed.
16 Resource incarnation is required for cross-replacement causal reasoning.
17 Retry order must be modeled under UNKNOWN.
18 Compensation order must be modeled under UNKNOWN.
19 STOP order and world-effect order are distinct.
20 Admission/invalidation order must be resolved or made harmless.
21 Concurrent reservation safety does not imply mission invariant safety.
22 Release/acquire ordering may require external confirmation.
23 Transfer chains require causal/conservation semantics.
24 Late evidence cannot retroactively authorize an old action.
25 Old context cannot inherit current causal authority.
26 Conflicting causal evidence produces UNKNOWN_ORDER/EVIDENCE_CONFLICT.
27 Recovery must reconstruct causal uncertainty rather than invent order.
28 Scope reduction requires closure of order-relevant interactions.
29 Strong temporal claims require adequate history/retention.
30 Formal concurrency claims require explicit model assumptions.

## 16. Formal direction

Candidate state:
CausalRelation(E1,E2) ∈ {BEFORE, AFTER, CONCURRENT, UNKNOWN}.

Candidate safety predicate:
ORDER_SAFE(S,M,U) ≜ every permitted history in U satisfies SafeTrace(history,M).

Candidate admission:
ADMIT(E) requires CURRENT_CONTEXT ∧ CURRENT_SCOPE ∧ CURRENT_BUDGET ∧ CURRENT_FENCES ∧ ORDER_REQUIREMENTS_SATISFIED, OR proof that the claim is safe under all allowed interleavings.

This is deliberately abstract and is not yet a proof.

## 17. Important reduction

We can avoid requiring a global total order.

The architecture only needs an authoritative order for transitions that can interact with the claim.

GLOBAL_TOTAL_ORDER is optional.
CLAIM-SUFFICIENT ORDER is mandatory when order matters.

## 18. New architectural concept: Temporal Interaction Closure

TemporalInteractionClosure(M) is the set of transitions whose relative order, overlap or interleaving can affect invariant M.

It includes direct effects, retries, compensations, releases/acquisitions, transfers, recovery, provider continuations, child effects and shared physical transitions.

If two effects are outside this closure and proven non-interacting for M, they need not participate in the same safety order.

## Remaining gaps

G-ORDER-01 formal interleaving model.
G-ORDER-02 commutativity proof conditions.
G-ORDER-03 partial-order reduction criteria.
G-ORDER-04 external provider ordering contracts.
G-ORDER-05 intermediate-state physical invariants.
G-ORDER-06 temporal occupancy refinement.
G-ORDER-07 unknown-order uncertainty composition.
G-ORDER-08 transfer-chain causal model.
G-ORDER-09 retry/compensation causal graph.
G-ORDER-10 recovery reconstruction of partial orders.
G-ORDER-11 history retention requirements.
G-ORDER-12 formal refinement.
G-ORDER-13 actual TLC/SANY.
G-ORDER-14 implementation-level ordering enforcement.
G-ORDER-15 fault injection with adversarial interleavings.

## Conclusion

Aggregate safety still does not imply mission safety when temporal ordering/interleaving matters.

Strong research principle:

If order matters to a claim, either establish the required causal relation or prove the claim safe for every permitted ordering/interleaving.

This is a research/design principle, not a verified theorem.

## Next attack

PARTIAL-ORDER REDUCTION + COMMUTATIVITY + CLAIM-SPECIFIC COORDINATION.

Question: how far can Nexo safely reduce coordination by proving that groups of effects commute for a specific invariant, without hiding shared physical, temporal, recovery, compensation or provider interactions?
