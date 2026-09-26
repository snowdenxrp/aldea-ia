# NEXO AB104.246 — ROLLBACK/COMPENSATION CRASH RECOVERY AND DOUBLE-COMPENSATION ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A compensation workflow needs its own durable state machine. It cannot infer completion from the original rollback intent, and it cannot treat absence of a compensation receipt as proof that compensation did not occur.

## Candidate state machine
COMPENSATION_INTENDED -> CLAIMED -> ACCEPTED -> COMMIT_UNKNOWN -> RECONCILING -> COMMITTED | NOT_COMMITTED | UNKNOWN_PERMANENT

If the compensation has independently observable child effects:
CHILD_UNSEEN -> SENT_UNKNOWN -> ACCEPTED -> COMMITTED, with PARTIAL/UNKNOWN branches.

## Crash matrix
1. Crash before compensation is sent: NOT_COMMITTED only when the protocol proves the boundary was never crossed; otherwise UNKNOWN.
2. Target accepts compensation, worker crashes before local receipt: UNKNOWN; reconcile target.
3. Compensation commits, local state update crashes: reconstruct from authoritative receipt/target record; never blindly compensate again.
4. Local compensation record commits, target effect absent: record is intent/reservation, not external completion.
5. Receipt is lost but target registry retained: reconstruct.
6. Target registry restored to older snapshot: previous absence cannot establish NOT_COMMITTED; continuity is broken and outcome may become UNKNOWN.
7. Two compensators run concurrently: same effect identity must converge or one must be fenced; different effect identities can double-compensate.
8. Original effect is UNKNOWN: compensation must not assume the original effect happened exactly once. It requires reconciliation of the original first or an explicit policy for uncertain compensation.
9. Compensation itself becomes UNKNOWN: create a reconciliation state, not a second compensation identity.
10. Partial compensation: aggregate state PARTIAL; unresolved children remain blockers.

## Double-compensation invariant
For an external compensation C of original effect O:
C.operation_id/effect_identity must be stable across retries and bound to O, target incarnation, authority context and compensation payload fingerprint.

A retry after UNKNOWN may re-attempt the SAME effect identity only when the target protocol guarantees idempotent handling. Creating C2 because C1 is UNKNOWN can produce two real compensations.

## Original UNKNOWN problem
There are at least three distinct cases:
A. O did not happen.
B. O happened and is fully committed.
C. O's outcome remains unknown.
A compensator cannot safely treat C as the inverse of A/B without evidence. If compensation is allowed under C, the system needs an explicit semantic policy describing what happens when O later resolves differently. That policy is not equivalent to pretending O was committed.

## Atomicity boundary
A local transaction can atomically update local intent + local compensation state, but that does not atomically include an external target. Transactional outbox research shows why crash between local commit and publication can produce duplicate publication; consumers therefore need idempotency. citeturn0search4turn0search6
Saga research similarly distinguishes compensating transactions from automatic ACID rollback: compensation is an explicit new transaction and may not provide isolation automatically. citeturn0search1turn0search7

## Rollback and anti-resurrection
TUF treats rollback as an explicit security attack and uses version/expiration/metadata consistency to prevent older metadata from silently replacing newer state. citeturn0search0turn0search2
For Nexo, restoring an older migration representation must therefore not lower the trusted authority generation or resurrect executable permissions.

## Candidate recovery proof
trusted anchor
-> original operation lineage
-> original outcome classification
-> compensation contract validation
-> compensation identity/fingerprint validation
-> current authority/target incarnation
-> compensation receipt/target reconciliation
-> aggregate compensation classification
-> re-evaluate dependent permissions

Passing local compensation intent alone never authorizes a second external effect.

## Prototype boundary
No implementation was added. Existing prototype effect-path evidence remains limited: local journal/idempotency mechanisms are not proof of distributed compensation fencing, target-side idempotency, rollback-resistant authority, or authoritative reconciliation.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
compensation intent != compensation completion; missing receipt != non-execution; UNKNOWN original != committed original; compensation != deletion; new compensation ID != safe retry; local transaction != external atomicity; local lock != target fence; restored old target snapshot != authoritative absence; rollback representation != authority rollback; no V21; no architecture implementation; no unsupported verification claims.

## Exact next mission
AB104.247: original-effect UNKNOWN plus compensation policy — safe/unsafe compensation strategies, hedge/escrow semantics, target-side conditional compensation, late original resolution, partial original effects, and avoiding compensation-induced divergence.