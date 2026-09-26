# NEXO AB104.238 — CRASH-CONSISTENT INVALIDATION JOURNAL AND REPLAY SEMANTICS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
An invalidation log must be treated as an ordered evidence stream, while derived invalidation state must be reconstructable. Replay must be idempotent and must never convert an invalidation record into permission to execute an effect.

## Crash interleavings
1. Crash before INVALIDATION_EVENT durable: no durable invalidation exists; recovery must use the authoritative source of the authority change, not infer from a partial write.
2. Event durable before dependency traversal: replay must resume traversal from the durable event.
3. Traversal marks C1 stale, crashes before C2: C1 may be derived stale while C2 is not yet updated; recovery must continue from the same authoritative event without treating partial traversal as completion.
4. Invalidation event duplicated: same event identity must converge to one logical invalidation.
5. Events reordered: sequence/generation/predecessor checks must detect the gap or stale event; do not apply an older state as current.
6. New root E9 and revocation E10 concurrent: neither arrival order nor local clock should silently define authority; authenticated transition/ordering rules must decide admissibility.
7. Old snapshot restored: replay must not decrease the highest accepted authority generation or resurrect an executable decision.
8. Crash after invalidating decision but before fencing queued work: recovery must treat the queue item as requiring current authorization/fence, not as already safe.

## Event identity and replay
Candidate invalidation identity:
(authority_scope, authority_generation, event_id, predecessor, event_type, subject_digest, effective_policy, issuer, authenticity)
Replay rule:
same authoritative event + same semantics => idempotent convergence;
same event_id + different content => CONFLICT/QUARANTINE;
older generation after newer accepted generation => STALE/ROLLBACK;
missing predecessor => HISTORY_GAP/UNVERIFIED until repaired.

## Partial traversal
Dependency traversal is a derived computation. A crash can leave mixed derived state. Therefore the authoritative invalidation event must remain sufficient to rebuild all dependent states.
Candidate derived record:
(claim_id, invalidation_event_id, dependency_digest, resulting_status, evaluation_version)
Derived status must never become more authoritative than its source event.

## Snapshot + journal recovery
Candidate recovery order:
trusted anchor -> snapshot validation -> journal continuity -> replay journal after snapshot -> rebuild derived indexes -> verify generation monotonicity -> revalidate pending decisions -> expose executable permissions only after current authority checks.
An incomplete journal segment is a history gap, not an implicit no-op.

TUF is a useful reference for this separation: Snapshot binds a coherent metadata view, Timestamp points to Snapshot and has short freshness, and clients reject rollback/freeze conditions rather than silently accepting older state. citeturn0search0turn0search1
TUF's security documentation explicitly treats rollback, freeze and mix-and-match attacks as distinct threats, reinforcing that freshness and coherent reconstruction are separate from basic signature validity. citeturn0search0

## Root/key rotation race
Suppose R7 is current, R8 transition is authorized, and a revocation under R8 arrives while a worker still holds R7.
- R7 historical claims remain reconstructable.
- R7 cannot regain current authority after R8 becomes authoritative.
- queued R7 permissions must be revalidated.
- if target ordering is unknown, effect outcome remains UNKNOWN_EXTERNAL.
- a restored R7 snapshot cannot silently undo accepted R8 continuity.

## Duplicate and reordered invalidation events
Duplicate delivery is expected in crash/retry systems. It must converge without multiplying invalidation effects.
Reordering is different: if generations are monotonic, an older event may be retained historically but must not overwrite newer current state.

## Current prototype
No durable invalidation journal or authority-generation replay engine was demonstrated in the inspected Nexo path. Existing local journals remain prototype evidence only.
No implementation added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
journal replay != effect replay; duplicate invalidation != duplicate permission; partial traversal != completed invalidation; older snapshot != current authority; signature validity != freshness; derived index != authority; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.239: attack recovery from mixed snapshots plus journal segments — cross-version schemas, forked invalidation histories, root rotation during replay, duplicate event IDs, and proof that replay cannot resurrect an old executable permission.