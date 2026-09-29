# AB104.927R — IN_PROGRESS correction crossing authority-window expiry
Date: 2026-09-29

## Question
A correction starts while successor authority is valid, remains IN_PROGRESS when that authority window expires, and later produces an external effect. Does authorization survive to completion?

## Fresh evidence
W3C PROV explicitly models activity start/end and instantaneous events, and models entity invalidation/expiry as a distinct temporal event. Its semantics therefore distinguish the time an activity starts from the time it ends and from the invalidation of an entity. citeturn0search1turn0search2

## Attack
R2/gen42 is authorized to correct predecessor EFFECT-1 during [T3,T4].
O2 starts at T3 and is accepted/IN_PROGRESS.
Authority window expires at T4.
O2 completes at T5 and EFFECT-2 commits.
Question: was completion authorized?

## Findings
1. Start-time authorization does not universally imply completion-time authorization.
2. The contract must define the authorization checkpoint: submission, acceptance, execution, commit, completion, continuous revalidation, or lease expiry.
3. If the permit is explicitly durable through terminal completion, O2 may remain authorized after T4; expiry then does not revoke an already-durable execution right.
4. If authorization is a lease that must remain valid through completion, O2 becomes unauthorized at T4 unless renewed.
5. If policy checks only acceptance/submission time, O2 may remain valid even though the authority expires before completion.
6. If policy checks commit/effect time, EFFECT-2 at T5 requires authority valid at T5.
7. A local rejection/fence at T4 does not prove the provider did not complete O2; outcome remains UNKNOWN until authoritative evidence resolves it.
8. Authority expiry does not erase O2 or any committed EFFECT-2.
9. A completion after expiry may be classified as valid, invalid, or UNKNOWN depending on the declared checkpoint semantics; no universal interpretation is safe.
10. Reauthorization after expiry is a new authority decision and does not by itself prove the original O2 was unauthorized or that no effect occurred.
11. If O2 produces multiple external effects, each effect can cross the authority boundary independently; operation-level status is insufficient for per-effect safety.
12. If O2 is cancelled/fenced at T4, cancellation requested is not cancellation completed, and fencing acceptance is not proof of effect absence.
13. No new top-level interaction class. Primarily I24 + I9/I19/I21 + class11/class12; I15/I22 can participate if retries occur.

## Core distinctions
AUTHORIZATION_AT_START != AUTHORIZATION_AT_COMPLETION
SUBMISSION_AUTHORITY != COMMIT_AUTHORITY
ACCEPTANCE_AUTHORITY != EFFECT_AUTHORITY
AUTHORITY_EXPIRY != EFFECT_ERASURE
LEASE_EXPIRY != EFFECT_ABSENCE
REAUTHORIZATION != ORIGINAL_AUTHORIZATION
REAUTHORIZATION != PROOF_OF_NONEXECUTION
CANCEL_REQUESTED != CANCELLED
FENCE_ACCEPTED != EFFECT_ABSENT
LOCAL_REJECTION != PROVIDER_NON_EXECUTION
OPERATION_STATUS != PER_EFFECT_AUTHORIZATION
RECEIPT_TIME != EFFECT_TIME
UNKNOWN != FAILED
UNKNOWN != CANCELLED

## Required evidence
- authority policy version and exact checkpoint semantics;
- permit/lease start and expiry;
- O2 submission, acceptance, execution, commit and completion times where available;
- provider receipt/effect ID;
- fencing/cancellation evidence;
- target + incarnation binding;
- per-effect outcome records;
- explicit renewal/reauthorization relationship;
- reconciliation rules for effects crossing the authority boundary.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
