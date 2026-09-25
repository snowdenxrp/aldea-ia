# NEXO AB36F — CLAIM-RELATIVE CLOSURE / MINIMIZATION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No TLC run, no TLAPS proof, no implementation verification.

## 1. Continuity checkpoint
AB36E was reread before this round. Its exact frontier was: event attributes, invalidation predicates, predecessor closure, 2/3-event minimization attacks, historical policy/delegation compatibility, non-aliased epoch/incarnation semantics, protocol-specific historical validity, and only then a conservative TLA+ model.

External cross-check: Lamport/Merz describe history variables as recording past behavior and as potentially necessary for refinement mappings; auxiliary variables augment a specification without changing its described behavior when added under the required rules. This supports using history for refinement, but does not establish any Nexo closure as sound. citeturn0search12turn0search14

## 2. New distinction: claim-relative closure
A closure cannot be defined as a universal property of the whole system. It must be parameterized by a claim contract C.

Candidate:
Closure_C(a,H) = the retained distinctions sufficient to evaluate claim C for admission a.

For P_AA historical validity, C includes at least:
- exact UsedContext;
- temporal point/scope of admission;
- authority identity and validity;
- policy/delegation compatibility;
- epoch/incarnation compatibility;
- protocol semantics;
- relevant ordering;
- boundary.

A different claim, such as current authority validity or external effect existence, may require a different closure.

Therefore:
CLOSURE(A) != CLOSURE(B) in general.

## 3. Exact versus conservative reconstruction
Two sound outcomes are allowed:

EXACT_TRUE/FALSE:
all distinctions required by C are retained and the evaluator establishes the result.

CONSERVATIVE_UNKNOWN:
a missing distinction can affect the result, so the evaluator refuses to manufacture TRUE_JUSTIFIED or FALSE.

A third outcome is forbidden:

UNJUSTIFIED_TRUE.

Thus safe compaction need not preserve complete history; it must preserve enough information to avoid unsound claim strength.

## 4. Claim strength matters
The closure required for `TRUE_JUSTIFIED` can be stronger than the closure required to establish `FALSE`.

Example:
If a retained event proves `AUTH_REVOKE(u) PRECEDES ADMIT(a)`, FALSE may be established without knowing unrelated policy history.
Conversely, if the revoke event is missing, the system must not infer TRUE merely because no revocation is retained.

Therefore retention can be asymmetric by claim direction:

EVIDENCE_FOR_FALSE != EVIDENCE_FOR_TRUE.

## 5. Three-valued reconstruction contract
Candidate evaluator:

Assess_C(a,H) ∈ {TRUE_JUSTIFIED, FALSE, UNKNOWN}

with:
1. TRUE_JUSTIFIED only if a sufficient witness set establishes every required positive and non-invalidated condition.
2. FALSE only if a sufficient witness set establishes a decisive violation.
3. UNKNOWN whenever omitted/missing/ambiguous distinctions can change the result and no decisive result is otherwise established.

This preserves the earlier rule:
UNKNOWN != FAILURE and UNKNOWN != SUCCESS.

## 6. Closure sufficiency relation
Define two histories H1 and H2 as C-equivalent for admission a when they produce the same claim assessment for a under the specified temporal scope.

Candidate:
H1 ≡_{C,a} H2 iff Assess_C(a,H1) = Assess_C(a,H2).

However, raw equality of the assessment alone is too weak for refinement: a future extension, different claim, or stronger claim could expose distinctions that were hidden.

Therefore the abstraction contract must state its scope explicitly.

## 7. Future-continuation correction
AB36E proposed a universal future-continuation condition. This round refines it:

For a FIXED HISTORICAL claim whose truth is evaluated at event q, future events after q cannot retroactively alter the historical fact unless the claim explicitly defines current/revocable semantics.

Therefore future-continuation stability is required only when the claim's temporal semantics permit future events to affect its truth.

For CURRENT claims, future changes are relevant.
For HISTORICAL-AT-q claims, post-q events normally are not relevant except where the claim contract explicitly includes them (for example, later effect enforcement or post-admission cancellation semantics).

This prevents over-retention.

## 8. Predecessor closure is not simply all predecessors
A naive `Pred(a)` that retains every predecessor is safe but not minimal.

Candidate dependency closure:
Start from the predicates in C.
For each predicate, include events that can:
- establish its positive value;
- invalidate it;
- alter the interpretation of an establishing/invalidating event;
- determine ordering needed by the predicate;
- establish identity/continuity of the referenced object.
Then recursively include dependencies of those events.

This creates a typed dependency closure rather than a generic graph ancestry closure.

## 9. Hypergraph consequence
Because an invalidation may depend jointly on several objects, closure edges cannot always be binary.

Example:
A policy invalidates Bridge B only for Authority A on Resource incarnation R under Delegation D.
Dropping any one of {A,R,D,policy} can change the result.

Therefore the earlier SafetyClosureHypergraph is directly relevant:
closure dependencies can be hyperedges over multiple objects.

PAIRWISE RETENTION SUFFICIENCY != JOINT RETENTION SUFFICIENCY.

## 10. 2-event minimization attacks
M1:
`AUTH_ISSUE(u) -> ADMIT(a)`.
Removing AUTH_ISSUE loses proof that u ever existed. Must become UNKNOWN, not TRUE.

M2:
`AUTH_ISSUE(u) -> AUTH_REVOKE(u)` with ADMIT after both.
Removing REVOKE can turn FALSE into apparent TRUE. Unsafe.

M3:
`POLICY_SET(p0) -> ADMIT(a)`.
Removing policy context destroys policy compatibility evidence. UNKNOWN unless an independent invariant makes policy irrelevant.

M4:
`REVOKE(u) -> ADMIT(a)`.
Removing the order relation while retaining both events is unsafe if the reverse order would change the result.

## 11. 3-event minimization attacks
M5:
`ISSUE(u) -> REVOKE(u) -> ADMIT(a)`.
Deleting REVOKE or its order changes FALSE toward TRUE.

M6:
`ISSUE(u) -> ADMIT(a) -> REVOKE(u)`.
Deleting the ADMIT position and retaining only final revoked state destroys historical validity.

M7:
`REVOKE(delegation) -> RESTORE(delegation) -> ADMIT(a)`.
The restoration may establish a valid new context, but cannot retroactively erase the prior revocation. The closure must retain event identity and order.

M8:
`REINCARNATE(r,i0->i1) -> ADMIT(a,i0)`.
If i0 labels are reusable, identifier equality alone is insufficient; continuity evidence is required.

M9:
`EPOCH_ADVANCE(e0->e1) -> ADMIT(a)` without replacement authority.
Epoch equality alone cannot prove authority existence.

## 12. Historical policy/delegation compatibility
Simple equality is not enough.

Candidate relations:
PolicyCompatibleAt(policyContext, operation, resource, q)
DelegationValidAt(delegationContext, subject, operation, resource, q)

These may depend on:
- scope;
- issuer/delegator identity;
- constraints;
- version/generation;
- revocation status;
- effective interval/order;
- operation/resource binding.

Thus:
POLICY_EQUALITY != POLICY_COMPATIBILITY
DELEGATION_EQUALITY != DELEGATION_VALIDITY.

## 13. Epoch and incarnation
Epoch should be treated as a relation between authorization contexts, not a proof by itself.

Candidate:
EpochCompatibleAt(auth, q, H)

requires both the epoch relation and existence/validity of the corresponding authority context.

Incarnation should identify a resource lifetime, not merely a small reusable label.

Candidate:
ResourceIncarnationCompatibleAt(auth, bridge, admission, H)

requires continuity evidence sufficient to distinguish reincarnations.

## 14. Protocol-specific historical validity
ATOMIC:
closure must preserve the atomic authorization/admission point and all facts needed to establish its single semantic point.

LEASE:
closure must preserve issuance, binding, expiry, consumption/replay, and the relevant validity interval.

RECHECK:
closure must preserve the re-established facts at admission; issuance-time validity is insufficient by itself.

Therefore one generic `fresh` bit cannot soundly represent all three protocols.

## 15. Minimality is a partial order
There may be multiple incomparable minimal sufficient closures.

C1 may retain event A and omit B.
C2 may retain B and omit A.
Both can be minimal and sound.

Therefore:
MINIMAL != UNIQUE MINIMAL.

The architecture should not require a canonical minimal history unless there is a separate reason to do so.

## 16. New candidate invariant: Non-Amplifying Abstraction
For a projection P from concrete history to abstract closure:

If P(H) yields TRUE_JUSTIFIED for claim C, then every concrete history H' consistent with P(H) and the claim scope must also satisfy C.

If not, the projection amplifies authority/claim strength.

This is stronger and more precise than merely requiring the projected graph to contain the concrete graph's nodes.

Candidate name:
NON_AMPLIFYING_CLAIM_PROJECTION.

## 17. New candidate invariant: Unknown-on-Loss
If two concrete histories consistent with the same abstract state yield different claim assessments and the abstraction cannot distinguish them, the abstract evaluator MUST NOT return TRUE_JUSTIFIED. It should return UNKNOWN unless a decisive FALSE condition is common to all consistent histories.

This gives a formal target for LossSet:
LOSS_RELEVANT_TO_C => UNKNOWN unless the remaining evidence decides the claim.

## 18. Refinement implication
The refinement mapping must preserve claim-relevant distinctions, not necessarily every historical event.

Candidate obligation:
ConcreteHistory H --P--> AbstractContext A
AND A.Assess_C(a)=TRUE_JUSTIFIED
=> for every concrete H consistent with A under the abstraction contract, C(a,H) holds.

This is the anti-amplification direction we need before claiming that an abstract TLA model represents the concrete architecture.

## 19. Status
Established as research findings/candidate invariants:
- closure is claim-relative;
- exact and conservative UNKNOWN are both sound outcomes;
- positive TRUE evidence and negative FALSE evidence can require different retained evidence;
- dependency closure must be typed and can be hypergraph-shaped;
- minimal sufficient closures need not be unique;
- abstraction must be non-amplifying with respect to claim strength.

Still OPEN:
- formal definition of consistency set of histories under a projection;
- exact hyperedge dependency calculus;
- proof that the proposed closure algorithm is sufficient;
- proof that compaction preserves non-amplification;
- formal LossSet semantics;
- concrete refinement mapping;
- TLA syntax/tool checking;
- TLC/TLAPS.

## 20. AB36G frontier
1. Formalize `ConsistentHistories(P,A,C)`.
2. Formalize `LossSet` as omitted distinctions, not simply omitted objects.
3. Define non-amplification and unknown-on-loss mathematically.
4. Attack projection with indistinguishable concrete histories.
5. Derive typed hyperedge closure rules.
6. Only then encode the closure/projection kernel in conservative TLA+.
7. Obtain and run an actual TLA+ toolchain only after semantic review.
