# AB88 — BOUNDED EVENT-ORDER ATTACK — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, formal verification, or 286-triple expansion.

## Objective

Test the AB87 next action: whether event ordering among already explicit AB25/AB26 transition rules can expose a P_AA distinction without synthesizing semantics for LEASE_RENEW, RETRY, MUTATION, or RECHECK.

## Canonical transition basis

AB26 supplies explicit abstract contracts for:
- AuthorityRevoke
- PolicyChange
- DelegationChange
- ResourceReincarnate
- LeaseExpire
- Admit

Each is expressed with Pre, Post, Frame, Invalidation, HistorySupport, and AdmissionLink. AB26 also explicitly states that three temporal positions are not generally sufficient and that order must be preserved whenever reversal can change P_AA.

## Bounded attack family

Consider histories containing three distinct invalidation-capable events selected from:
1. AuthorityRevoke
2. PolicyChange
3. DelegationChange
4. ResourceReincarnate
5. LeaseExpire

followed by Admit where the preconditions permit it.

The test asks whether two histories can:
- have the same retained lower-arity event identities/current semantic fields;
- differ only in event order;
- both remain legal under the explicit AB26 rules;
- yet produce different P_AA admission observations.

No unresolved event law is filled in.

## Result A — invalidation monotonicity for the bounded family

For the explicit AB26 transitions, each selected event can invalidate a relevant authority/bridge/lease compatibility relation. Admit requires all relevant P_AA predicates for the actually linked context.

Therefore, in the simple bounded family with no later repair/reissue/rebinding action, moving an invalidating event earlier versus later can affect whether an intervening Admit is legal. This confirms that order can be P_AA-relevant.

However, when Admit is constrained to the final position and the same invalidating set has already occurred, reversal among multiple invalidators does not by itself establish an irreducible ternary predicate. The current explicit rules do not supply a three-way order-sensitive interaction whose result cannot be explained by the relevant lower-arity invalidation predicates.

Classification: ORDER_RELEVANCE = KNOWN; IRREDUCIBLE_TERNARY_ORDER_RESIDUAL = NOT_ESTABLISHED.

## Result B — temporal compression

A three-position representation is insufficient as a general theorem, consistent with AB26's t1..t5 example. A logical partial order can be sufficient only after proving that every omitted order relation is P_AA-irrelevant.

For the bounded invalidation-only family, the useful abstraction is not raw timestamps but an order relation over P_AA-relevant invalidation events plus the admission point.

This is a research representation result, not an architecture decision.

## Result C — lower-arity versus ternary

The bounded family can demonstrate order relevance with binary precedence facts such as:
- revoke precedes admit;
- policy change precedes admit;
- reincarnation precedes admit.

But the current explicit rules do not establish that a joint predicate of three event identities/order relations is required to predict the P_AA result.

Thus no concrete ternary P_AA collision is produced by this attack.

## Result D — unresolved-event firewall

The attack was deliberately restricted to explicit AB26 transitions. LEASE_RENEW, RETRY, MUTATION, and RECHECK were not assigned semantics.

Therefore no UNKNOWN branch was silently converted into a concrete successor, and no UNKNOWN result was treated as KNOWN_EMPTY.

## Gate

C2/C3/C6 for the four unresolved events remain UNKNOWN.

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

## Important distinction

AB88 establishes that event order is semantically relevant in the bounded explicit family, but it does not establish that a ternary hyperedge is semantically necessary.

This is exactly the separation required by AB50/AB51: a mathematical ternary non-reconstructibility result cannot become a protocol P_AA collision without a legal transition/observation that reads the irreducible distinction.

## Next exact action

The next highest-information bounded attack is to add LeaseIssue/CreateAttempt/Decide to the explicit transition family and test whether issuance/attempt identity plus one invalidation can produce a future-observation distinction that survives all lower-arity projections. This remains bounded and must retain AdmissionBindingClass and LeaseBridge as separate semantic objects.

Do not expand to all 286 triples until such an explicit irreducible residual is found or the semantic boundary is formally recorded.