# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.211

AB104.211 completed: partial/streaming external effects and effect granularity.

Research-only. No architecture implementation, V21, formal verification, or security proof.

Core result:
A request is not necessarily one atomic effect. Reconciliation must operate at the actual target effect granularity (request/batch/item/chunk/segment). Acceptance, processing, commitment, and completion are separate evidence boundaries.

Research model:
parent operation_id -> deterministic child effect identities -> per-child target evidence -> dependency/order evidence -> aggregate classification.

Aggregate:
ALL committed => COMMITTED
authoritative none => NOT_COMMITTED
mixed committed/failed => PARTIAL
blocking unknown => UNKNOWN
compensation committed => COMPENSATED_WITH_HISTORY; original effect remains historical evidence.

Cancellation is not assumed to undo an already committed effect. Compensation is a new effect and can itself become UNKNOWN.

Code study:
Broad exact searches for retry, checkpoint, stream, event, transaction, side effect, effect, external returned no matches in GitHub code-search surface. Not evidence of repository-wide absence.

AB50→AB58 residuals unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

Exact next AB104.212:
Crash-interleaving state-machine study for parent/child effects, then directory/tree-based repository inspection.
DO-NOT-REPEAT: ACK != completion; checkpoint != target commit; cancellation != rollback; compensation != erasure; idempotency != fencing; no V21; no unsupported verification.
