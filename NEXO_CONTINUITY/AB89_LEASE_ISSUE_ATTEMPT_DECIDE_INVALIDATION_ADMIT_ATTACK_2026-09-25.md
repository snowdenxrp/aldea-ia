# AB89 — LEASE_ISSUE + CREATE_ATTEMPT + DECIDE + INVALIDATION + ADMIT — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, formal verification, or 286-triple expansion.

## Objective

Test whether the next explicit transition family can produce an irreducible P_AA ternary residual without assigning semantics to LEASE_RENEW, RETRY, MUTATION, or RECHECK.

Family:
LeaseIssue + CreateAttempt + Decide + one explicit invalidation + Admit.

## Evidence basis

AB26 supplies explicit contracts for LeaseIssue, CreateAttempt, Decide, Admit, and the invalidation-capable actions.

LeaseIssue:
- valid authority and complete binding are required;
- a bound lease is created;
- issuance/validity interval is retained as history;
- future admission may reference the lease.

CreateAttempt:
- operation permits attempt creation;
- a fresh attempt identity exists;
- prior attempts remain unchanged;
- future admission must bind to the attempt.

Decide:
- decision inputs are available;
- a decision record exists;
- authority remains independent;
- the decision does not itself establish admission linkage.

Admit:
- actual admission linkage must exist;
- selected protocol must be valid;
- all P_AA predicates must hold for the actually linked context;
- admission creates the authoritative historical admission linkage.

## Attack construction

Use two histories H1/H2 with the same actors/resources and the same lower-arity facts, differing only in whether the explicit invalidation occurs before or after one candidate operation, then attempt Admit.

The explicit invalidation candidates are:
- AuthorityRevoke
- PolicyChange
- DelegationChange
- ResourceReincarnate
- LeaseExpire

The attack is valid only if both histories remain legal and the final P_AA result depends on a joint three-way relation that cannot be represented by the lower-arity predicates already exposed by the transition contracts.

## Result 1 — linkage blocks an apparent ternary shortcut

LeaseIssue does not itself create admission linkage.
CreateAttempt does not itself create admission linkage.
Decide does not itself create admission linkage.

Therefore a candidate triple of issuance + attempt + decision cannot, by itself, imply Admit. The missing bridge is the explicit actual admission linkage required by Admit.

Consequently, the three events cannot be collapsed into an implicit ternary admission predicate merely because all three precede Admit.

Classification: NO_TERNARY_ADMISSION_RULE_FROM_EVENT_COEXISTENCE.

## Result 2 — invalidation remains lower-arity in the explicit model

For each explicit invalidation candidate, its effect is already described as a relation over the affected authority/bridge/lease/policy/delegation/incarnation context and the later Admit.

Examples:
- AuthorityRevoke changes current authority validity and dependent bridge validity.
- PolicyChange recomputes affected compatibility.
- DelegationChange recomputes dependent validity.
- ResourceReincarnate invalidates old-incarnation bindings/leases.
- LeaseExpire makes the lease no longer valid and changes lease-based admission validity.

No recovered rule says that the invalidation becomes effective only when combined with the simultaneous presence of LeaseIssue + CreateAttempt + Decide as one irreducible joint condition.

Thus the current explicit family has no demonstrated irreducible ternary predicate.

## Result 3 — ordering can matter, but does not establish ternary necessity

If an invalidation precedes Admit, its lower-arity validity predicate can block admission.
If the same invalidation occurs after an already completed admission, historical admission linkage remains unchanged.

That demonstrates temporal relevance, consistent with AB88, but it does not produce a three-way residual among LeaseIssue/CreateAttempt/Decide.

## Result 4 — decision is informational unless explicitly linked

Decide creates a decision record but does not establish admission linkage. Therefore two histories differing only in decision record identity cannot be claimed to differ in P_AA unless the actual admission linkage or another explicit P_AA predicate reads that distinction.

This prevents an unjustified inference of:
Decision identity -> authorization -> admission.

## Result 5 — no hidden lower-arity collapse claim

This result is not a theorem that every possible implementation could never encode a ternary relation.

It is a bounded negative result about the currently recovered explicit protocol vocabulary:
no irreducible ternary P_AA read is exposed by this attack family.

## Gate

C1 Source context: KNOWN/PARTIAL
C2 Legal transition domain: bounded for explicit actions; unresolved events remain excluded
C3 Post-state: explicit for tested actions at the abstract level
C4 Invalidation/frame: explicit at bounded level
C5 Admission linkage: explicit requirement; decision/lease/attempt do not implicitly create it
C6 Exhaustive successor domain: NOT_ESTABLISHED beyond bounded abstract family

ORDER_RELEVANCE = KNOWN
IRREDUCIBLE_TERNARY_RESIDUAL = NOT_ESTABLISHED
TERNARY_PAA_COLLISION = UNKNOWN
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

## External methodology cross-check

Lamport's TLA material defines a state as variable assignment, a step as a pair of states, and an action as a predicate on steps. Therefore the fact that an event is present in a history is not by itself a transition predicate; the P_AA effect must arise from the actual state-to-state relation and the observation/linkage rule. This supports retaining the distinction between event coexistence and an irreducible joint transition predicate.

## Decision

AB89 does not produce a concrete ternary P_AA collision.

It does strengthen the evidence that the currently explicit admission architecture separates:
1. lease issuance;
2. attempt identity;
3. decision record;
4. actual admission linkage;
5. current validity/invalidation.

These must not be merged merely because they co-occur in a history.

## Exact next action

Proceed to an explicit bounded attack involving two independent admissions/attempt identities and one shared lease/bridge candidate, testing whether AdmissionBindingClass and LeaseBridge can be separated by future behavior without invoking unresolved renewal/retry semantics.

Do not expand to 286 triples until an explicit irreducible residual is found or the semantic boundary is formally recorded.
