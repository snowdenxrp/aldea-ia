# NEXO AB104.212 — CRASH-INTERLEAVING RECONCILIATION STATE MACHINE — V1 — 2026-09-26

## Status
Research-only. No architecture implementation, V21, or formal verification.

## Objective
Enumerate externally relevant crash boundaries for parent/child effects and determine what each boundary permits during recovery.

## Findings
1. Crash before send: local intent exists, no target evidence. NOT_COMMITTED is allowed only if the protocol proves no boundary crossing; otherwise UNKNOWN.
2. Crash during transmission: bytes may have crossed the boundary. Transport state alone cannot prove non-processing.
3. Target rejects before acceptance: authoritative rejection can classify NOT_COMMITTED if its semantics guarantee no acceptance.
4. Target accepts and response is lost: effect may be committed; reconcile by identity/receipt. Blind retry is unsafe for non-idempotent semantics. RFC 9110 warns against automatic retry unless the original was not applied or idempotent semantics are established.
5. Target commits and receipt is lost: target-authoritative lookup can establish COMMITTED; local missing receipt cannot establish NOT_COMMITTED.
6. Receipt is durable but local checkpoint is lost: reconstruct from receipt; do not re-execute.
7. Child Ck commits before its checkpoint: reconcile Ck before replay unless target guarantees safe duplicate handling.
8. Ck committed and Ck+1 unknown: aggregate state is PARTIAL or UNKNOWN; ordering cannot be inferred without an explicit target contract.
9. Cancellation after some commits is a new operation; committed children remain historical facts.
10. Compensation is also a new effect and can itself become UNKNOWN.
11. Target restore after acknowledgement can remove visible history. Absence after rollback is not proof of never-commit; target incarnation/checkpoint continuity is required.
12. Concurrent recoverers need fencing/authority for local mutation; being first does not grant permission to repeat an external effect.
13. Duplicate child identity with a different payload fingerprint is collision/quarantine.
14. Parent aggregate checkpoint does not prove child completion unless its semantics explicitly bind all children atomically.
15. Source/stream checkpoint advancement does not prove target completion.

## Research state machine
Per child:
UNSEEN -> INTENDED -> SENT_UNKNOWN -> ACCEPTED -> PROCESSING -> COMMITTED
with FAILED/CANCELLED/PARTIAL/UNKNOWN branches.

Recovery:
UNKNOWN -> RECONCILING -> COMMITTED | NOT_COMMITTED | PARTIAL | UNKNOWN_PERMANENT.

A crash is not an execution result. Recovery must classify from evidence at the boundary actually crossed.

## External evidence
RFC 9110: idempotent requests can be retried after communication failure because repeated identical intended effects are equivalent; non-idempotent requests should not be automatically retried without knowing the original was not applied or establishing idempotent semantics.
RFC 9113: HTTP/2 defines explicit mechanisms that can guarantee a stream was not processed; such guarantees are stronger than simply receiving no response.
AWS Well-Architected: exactly-once behavior is difficult in distributed systems; idempotency tokens help distinguish repeated requests.

## Code study
Broad exact searches in canonical repo main for retry, checkpoint, stream, event, transaction, side effect, effect, and external returned no matches in the available GitHub code-search surface. This is only a search limitation, not proof of repository-wide absence.

## Residuals unchanged
TERNARY_MATH_GAP=FOUND
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED

## DO-NOT-REPEAT
Crash != NOT_COMMITTED; missing response != failure; checkpoint != target commit; parent checkpoint != child proof unless atomically bound; cancellation != rollback; compensation != erasure; first recoverer != authority; idempotency != fencing; timer expiry != evidence. No V21 and no unsupported verification claims.

## Exact next action — AB104.213
Study authoritative negative-result protocols and explicit not-processed guarantees across transport/application boundaries, map them into Claim Contract / Decision Contract / Effect Contract separation, then inspect repository tree/files through structural navigation.
