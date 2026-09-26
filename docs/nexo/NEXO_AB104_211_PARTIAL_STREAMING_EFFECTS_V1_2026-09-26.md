# NEXO AB104.211 — PARTIAL AND STREAMING EFFECTS — V1 — 2026-09-26

## Status
Research-only. No architecture implementation, V21, or formal verification.

## Objective
Study how externally visible effects behave when a request contains multiple sub-effects, streaming records, batches, or partial failures.

## Findings
1. A single request boundary does not imply a single atomic external effect. Streaming/batch systems can acknowledge some records while others fail, and retries can replay already-processed records. AWS documents partial failures for streaming/batch ingestion and duplicate delivery after retries/checkpoint recovery.
2. Therefore an EffectContract must identify the effect granularity: request-level, batch-level, item-level, chunk-level, or stream-segment-level. Without that granularity, a receipt cannot be interpreted safely.
3. Acceptance and completion are distinct evidence. A target may acknowledge receipt/acceptance while downstream processing remains asynchronous. A completion receipt must identify the completed scope; otherwise it only proves acceptance at that boundary.
4. For partial effects, the safe recovery object is a set/map of sub-effect identities and statuses, not a single boolean. Conceptual states: NOT_SENT, SENT_UNKNOWN, ACCEPTED, PROCESSING, COMMITTED, FAILED, CANCELLED, COMPENSATED, UNKNOWN.
5. Crash after sub-effect k commits but before checkpoint k is durable creates a replay window. Recovery must replay only under target semantics that make duplicates harmless, or query/reconcile each sub-effect before acting. Blind replay can duplicate externally visible effects.
6. A stable parent operation_id is insufficient for independently reconciliable chunks. Each sub-effect needs a deterministic child identity bound to parent operation, target scope, sequence/chunk identity, and payload fingerprint. This is a research model, not implementation.
7. Ordering matters only when the target contract makes it semantically relevant. If sub-effects have dependencies, the reconciliation graph must preserve predecessor/dependency evidence; a set of individually committed children may still not establish valid final state.
8. Cancellation is not automatically rollback. After an external effect commits, cancellation may be a new compensating effect rather than erasure. Nexo must record compensation as a separate operation linked to the original effect identity.
9. Compensation itself can become UNKNOWN_EXTERNAL, so the system must not assume compensation restores the pre-effect state. It requires its own authoritative reconciliation.
10. Streaming checkpointing creates a second boundary: source progress vs target effect. A durable source checkpoint does not prove target completion; target completion does not prove source checkpoint durability. Recovery must reconcile both.
11. Idempotency reduces duplicate side effects but does not by itself provide fencing, ordering, cancellation, or proof of completion. AWS explicitly notes duplicate producer/consumer processing and recommends idempotent final destinations; RFC 9110 cautions against retrying non-idempotent requests without knowing whether the original was applied.
12. Candidate reconciliation model:
Parent operation
 -> child effect identities
 -> target receipts/status per child
 -> dependency/order evidence
 -> aggregate state.
Aggregate classification:
ALL committed => COMMITTED
none committed + authoritative absence => NOT_COMMITTED
mixed committed/failed => PARTIAL
any unknown blocking authoritative classification => UNKNOWN
compensation committed => COMPENSATED_WITH_HISTORY, never erase original commit.
13. Code study: broad structural keyword searches in canonical repo main for retry, checkpoint, stream, event, transaction, side effect, effect, and external returned no exact code-search matches. This remains a limitation of the search surface, not proof of repository-wide absence.

## External evidence
AWS documents duplicate stream processing and partial batch failure handling; these are concrete examples that retry/checkpoint boundaries can differ from effect boundaries. RFC 9110 says automatic retry of non-idempotent requests requires knowing the original was not applied or otherwise establishing idempotent semantics.

## Residuals unchanged
TERNARY_MATH_GAP=FOUND
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED

## DO-NOT-REPEAT
Do not equate request ACK with completion; parent operation_id with child uniqueness; checkpoint with effect completion; cancellation with rollback; compensation with erasure; idempotency with fencing; partial success with full success; missing child receipt with failure. No V21 or unsupported verification claims.

## Exact next action — AB104.212
Study reconciliation state machines and crash interleavings for parent/child effects: enumerate boundaries between send, accept, commit, receipt, checkpoint, retry, cancellation, compensation, and restore. Then compare these semantics with actual repository structures using directory/tree inspection rather than keyword-only search.
