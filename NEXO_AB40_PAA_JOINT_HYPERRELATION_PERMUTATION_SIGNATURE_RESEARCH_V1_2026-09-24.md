# NEXO AB40 — PAA JOINT HYPERRELATION, PERMUTATION, AND MINIMAL RELATIONAL SIGNATURE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB39 was reread directly before this round. The remaining question is not whether scalar Bridge/Binding fields are sufficient, but whether their enriched joint relational product can represent every P_AA-relevant distinction without a separate Qres.

## 2. Semantic product
Define a candidate joint representation:
`JB_AA(a) = <Link, Auth, Bind, Protocol, Order, Invalidation, Replay, Future>`.
This is a semantic relation signature, not a proposed runtime struct.

Components:
- Link: actual admission ↔ used authority ↔ used bridge ↔ operation/attempt/resource/incarnation.
- Auth: authority consequences relevant at admission.
- Bind: subject/operation/attempt/resource/incarnation/capability/scope/boundary matching.
- Protocol: atomic/lease/recheck semantics sufficient to validate admission.
- Order: only claim-relevant precedence/linearization relations.
- Invalidation: revocation, expiry, policy/delegation/incarnation changes that can invalidate the used context.
- Replay: consumption, retry, attempt freshness and reuse restrictions where applicable.
- Future: the P_AA-relevant continuation space or a conservative representation that yields UNKNOWN when it cannot be determined.

## 3. Why this is not eight required variables
The signature is a semantic decomposition. Several components may be derivable from others. The minimality question is whether the quotient kernel of a proposed representation is contained in P_AA behavioral equivalence.

## 4. Formal absorption criterion
Let `R(H)` be a proposed retained representation and `≈AA` the full claim-relative behavioral quotient. Exact absorption is possible only if:
`R(H1) = R(H2) => H1 ≈AA H2`.
Equivalently, every collision induced by R must be behaviorally harmless for P_AA.
If the implication fails, R loses claim-relevant information.

## 5. Permutation attack method
For a finite event multiset E, enumerate admissible partial/total orderings that preserve event bindings. For each ordering:
1. derive actual linkage;
2. derive protocol validity;
3. derive current admission assessment;
4. derive relevant future transitions;
5. compare the candidate representation;
6. record a separator whenever equal representation yields different observation/future behavior.
This is bounded exploration, not proof.

## 6. Four-event attack families
P1: LEASE_ISSUE, POLICY_CHANGE, DELEGATION_CHANGE, ADMIT.
P2: LEASE_ISSUE, LEASE_EXPIRE, RETRY, ADMIT.
P3: DECIDE, AUTH_REVOKE, LEASE_RENEW, ADMIT.
P4: AUTH_ISSUE, DELEGATION_CHANGE, RESOURCE_REINCARNATE, ADMIT.
P5: RECHECK, POLICY_CHANGE, DELEGATION_CHANGE, ADMIT.
P6: LEASE_ISSUE, LEASE_RENEW, POLICY_CHANGE, ADMIT.
P7: LEASE_ISSUE, CONSUME, RETRY, ADMIT.
P8: DECIDE, POLICY_CHANGE, INCARNATION_CHANGE, ADMIT.

## 7. Critical permutation result
The dangerous permutations are not arbitrary timestamp permutations. They are permutations that reverse a relation from the dependency vocabulary:
`PRECEDES_AA`, `INVALIDATES`, `BINDS`, `BRIDGES`, `CONSUMES`, `CAUSES`.
Therefore integer time is not the semantic minimum. A partial order plus typed relations can be sufficient if it determines every P_AA-relevant future.

## 8. Joint hyperrelation
A key relation is not reducible to independent binary facts when validity depends on a tuple. Candidate hyperedge:
`USED_ADMISSION_CONTEXT(admission, auth, bridge, subject, operation, attempt, resource, incarnation, policy, delegation, protocol, boundary)`.
This is claim-scoped. Omitting a member is safe only if it is recoverable without changing P_AA equivalence.

## 9. Three-way and four-way interaction
Examples:
- `policy × delegation × renewal` can determine whether a bridge remains usable.
- `attempt × consume × retry` can determine replay validity.
- `incarnation × bridge × admission` can determine whether an apparently valid bridge is stale.
- `decision × revoke × protocol` can determine whether a later admission is valid.
Thus pairwise completeness is insufficient for a general claim-complete representation.

## 10. Candidate minimal relational signature
The smallest currently defensible semantic target is not the eight-component list itself. It is the quotient of the following relations:
`Rmin_AA = quotient(Link, Validity, Binding, Protocol, Order/Invalidation, Replay, FutureSupport)`.
Relations are retained only when removing them creates a P_AA-distinguishable continuation or makes actual admission linkage unreconstructible.

## 11. Can Qres be absorbed?
Potentially yes, but only if an enriched `BridgeBinding*` representation reconstructs `Rmin_AA` totally and deterministically modulo ≈AA.
Then Qres becomes an auxiliary mathematical quotient, not a separate semantic component:
`AAKernel* = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + BridgeBinding*`.
This is a candidate architecture, NOT yet established.

## 12. Failure cases for absorption
Absorption fails if any of these remain hidden:
- actual bridge identity/linkage;
- exact protocol linearization or recheck fact-set;
- invalidation order;
- lease expiry/renewal semantics;
- replay/attempt semantics;
- incarnation binding;
- joint policy/delegation effects;
- future continuation differences.

## 13. Future-support subtlety
Storing the entire future transition graph would be excessive. The semantic requirement is weaker: equivalent representations must admit the same P_AA-relevant future observations, or conservatively return UNKNOWN when the difference cannot be resolved.
Therefore FutureSupport may be a derived property of the representation rather than a stored field.

## 14. Stable abstract Next candidate
For abstract state `A` and abstract action `α`:
`Next_AA(A,A')` holds only when there exists a concrete transition or finite concrete transition sequence represented by `A→A'` that preserves:
- authority non-amplification;
- actual admission linkage;
- protocol semantics;
- P_AA-relevant order/invalidation;
- replay/attempt semantics;
- boundary;
- observation/refinement obligations.
Concrete transitions that change no claim-relevant semantic relation may stutter.
Unknown correspondence must not be treated as stutter.

## 15. Important correction to “minimality”
We cannot yet claim the eight semantic relation families are individually irreducible. Some can be functions of others under a restricted protocol contract. The defensible lower bound is the behavioral quotient itself: any sound representation must distinguish histories whenever P_AA can distinguish them under allowed continuations.

## 16. Result
AB40 narrows the architecture from `+ Qres` toward a richer relational `BridgeBinding*` candidate. This is a possible collapse of Qres at the semantic level, but it is not yet proven.
The real question is now:
`Can BridgeBinding* be constructed so that its kernel is exactly contained in ≈AA while remaining transition-congruent?`

## 17. AB41 frontier
1. Define `BridgeBinding*` as an explicit abstraction, not a bag of fields.
2. Generate the shortest permutation separators for P1–P8.
3. Attack whether `FutureSupport` is derivable rather than stored.
4. Attack transition congruence after representation collisions.
5. If no residual survives under the bounded model, state only bounded evidence and then derive the stable semantic Next candidate.
6. Keep formal verification deferred until the semantic contract freezes.
