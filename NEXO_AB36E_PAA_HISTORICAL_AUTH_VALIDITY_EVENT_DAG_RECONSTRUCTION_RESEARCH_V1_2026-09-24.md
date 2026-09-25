# NEXO AB36E — HISTORICAL AUTH VALIDITY EVENT-DAG RECONSTRUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No TLC run and no formal proof.

## 1. Research target
The current frontier is AuthValidAt: reconstruct whether the exact authorization linked to an admission was valid at the admission event, without replacing historical state by current state.

Lamport's official material confirms that history variables record information about past behavior and may be added when needed for a refinement mapping. This supports the use of claim-relevant history, but does not establish the Nexo mapping. citeturn0search12turn0search13

## 2. Historical authority semantics
For an admission a with used authority u and admission event q, define conceptually:

AuthValidAt(a,H,q) iff:
- u exists in the retained authorization history;
- the authority record was issued before or at the relevant authorization point;
- its resource/incarnation matched the admission;
- its capability/scope matched the admission;
- its policy/delegation context was compatible at q;
- its epoch was valid/current according to the claim's temporal contract;
- no revocation/invalidation affecting u preceded q without a valid replacement/continuation rule;
- the boundary permitted the admission;
- the required ordering facts are known.

This is deliberately claim-scoped. A different claim may need a different historical closure.

## 3. Current state cannot substitute for history
Countermodel pair CM-AA311:
H1: AUTH_ISSUE(u) -> ADMIT(a) -> AUTH_REVOKE(u)
H2: AUTH_ISSUE(u) -> AUTH_REVOKE(u) -> ADMIT(a)
Both can end with the same current state: u revoked.
P_AA assessments differ at admission.
Therefore current authority state alone cannot reconstruct historical admission validity.

CM-AA312:
H1: POLICY_CHANGE(p0->p1) occurs after ADMIT.
H2: same change occurs before ADMIT.
Same final policy p1; different admission validity if p0/p1 are not equivalent.

CM-AA313:
H1: DELEGATION_REVOKE occurs after ADMIT.
H2: it occurs before ADMIT.
Same final delegation state; different historical validity.

CM-AA314:
H1: RESOURCE_REINCARNATE occurs after ADMIT.
H2: it occurs before ADMIT.
Same final incarnation; different admission validity.

CM-AA315:
H1: LEASE_EXPIRE occurs after ADMIT.
H2: it occurs before ADMIT.
Same final expired lease; different admission validity.

CM-AA316:
H1: EPOCH_ADVANCE occurs after ADMIT.
H2: it occurs before ADMIT.
Same final epoch; different admission validity unless a replacement authority existed.

## 4. Event-DAG reconstruction requirement
For each admission, define a claim-relative predecessor closure:

Pred_AA(a) = all retained events whose relative position to the admission can affect any P_AA predicate.

The reconstruction must not require the entire event log. It requires the smallest sound closure sufficient to determine the claim or return UNKNOWN.

Required event classes currently include:
AUTH_ISSUE, AUTH_REVOKE, EPOCH_ADVANCE, DELEGATION_CHANGE, POLICY_CHANGE, RESOURCE_REINCARNATE, LEASE_ISSUE, LEASE_EXPIRE, DECIDE, RETRY, ADMIT.

## 5. Order is the key information
For each invalidating event x and admission q, the relevant fact is not necessarily a timestamp. It is whether:
- x PRECEDES q;
- q PRECEDES x;
- x and q are unordered but provably independent;
- the order is unknown.

Unknown order that can change AuthValidAt must yield UNKNOWN.

Therefore:
INTEGER_TIMESTAMP != REQUIRED TEMPORAL SEMANTICS.
A claim-relative partial order can be sufficient.

## 6. Compensation does not erase history
CM-AA317:
REVOKE -> RESTORE -> ADMIT
versus
RESTORE -> ADMIT.
If restoration is a new authority/delegation event rather than retroactive cancellation of revocation, the histories are not equivalent.

Thus:
CURRENT_STATE_EQUALITY != HISTORICAL_AUTHORITY_EQUIVALENCE.

## 7. Incarnation aliasing
CM-AA318:
Resource r uses incarnation i0, then reincarnates to i1, then a bounded model reuses label i0.
A naive equality check `admission.incarnation = currentIncarnation[r]` would falsely infer continuity.

Therefore an implementation may require an incarnation identity that is never semantically reused within the retained history, or a retained generation relation sufficient to distinguish reincarnations.

## 8. Epoch semantics
CM-AA319:
Epoch advances from e0 to e1 without issuing replacement authority.
The fact `epoch = e1` does not prove any e1 authority exists.

CM-AA320:
Epoch remains e0 while delegation/policy/incarnation changes invalidate an authority.
Therefore epoch equality cannot be used as a complete proxy for current validity.

## 9. Historical linkage is immutable
ADMIT creates an immutable AdmissionRecord:
- admission_id
- usedAuth
- usedBridge
- admissionEvent
- subject
- operation
- attempt
- resource
- incarnation
- protocol
- boundary.

Later events update validity of that record's referenced context; they never rewrite which context was used.

This is the direct formal counterpart of:
USED/LINKED != VALID.

## 10. FALSE versus UNKNOWN
The historical evaluator needs an explicit distinction:
- FALSE: the model has sufficient evidence that a required condition was violated;
- UNKNOWN: a decisive historical distinction cannot be established.

Example: if Revocation(u) definitely precedes admission, FALSE may be justified.
If the relative order of Revocation(u) and admission is missing, UNKNOWN is required.

Missing history is not evidence that the invalidating event did not occur.

## 11. Reconstruction operator candidate
Conceptually:

Assess_AA(a,H) =
  if RequiredClosureMissing(a,H) then UNKNOWN
  else if HistoricalKernelHolds(a,H) then TRUE_JUSTIFIED
  else FALSE.

This is intentionally different from:
`if current state looks valid then TRUE`.

## 12. Minimal closure criterion
A history element h may be removed for admission a only if, under every allowed future continuation:
- every remaining history produces the same assessment; OR
- the abstraction becomes UNKNOWN rather than an unsound TRUE_JUSTIFIED; AND
- UsedContext remains reconstructible; AND
- no future continuation can make the removed distinction relevant.

This is stronger than immediate observational equivalence.

## 13. New lower-bound result
A historical validity evaluator needs at least one representation of each claim-relevant invalidation dimension:
AUTHORITY, EPOCH, POLICY, DELEGATION, INCARNATION, LEASE/PROTOCOL, ORDER.

This does NOT prove seven separate physical variables are required. Some may be encoded in one history structure or bridge record.

Therefore:
SEMANTIC DIMENSIONS != PHYSICAL VARIABLES.

## 14. AB36E conclusion
The hardest missing semantic piece is no longer authority identity. It is the reconstruction theorem obligation:

Given a retained EventDAG closure and immutable UsedContext, can AuthValidAt be reconstructed exactly, or conservatively as UNKNOWN, for every allowed P_AA history?

Until that obligation is satisfied, a TLC result would be premature because the model could still be checking an incomplete historical semantics.

## 15. AB36F frontier
1. Define exact event attributes and invalidation predicates.
2. Define predecessor closure algorithm mathematically.
3. Attack closure minimization with 2- and 3-event histories.
4. Define historical policy/delegation compatibility rather than equality.
5. Define epoch and incarnation semantics without aliasing.
6. Define protocol-specific historical validity.
7. Construct the smallest abstract Next that preserves immutable linkage and history closure.
8. Then produce a syntactically conservative TLA+ module and seek an actual TLC toolchain.
