# NEXO AB104.237 — INVALIDATION ORDERING, DURABLE PROPAGATION AND STALE-CACHE RACES V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
An invalidation event is not safe merely because it exists durably somewhere. Safety requires every consequence-bearing path to observe authoritative generation or be fenced by an equivalent ordering primitive at the protected effect boundary.

## Crash/interleaving matrix
1. Decision E7 -> crash -> revocation E8 -> recovery: revalidate current authority; do not resume cached E7 approval.
2. E8 durable -> invalidation propagation crashes: pending decisions remain non-executable until current authority is re-established.
3. Invalidation appended -> dependent index update crashes: append-only history survives; derived indexes must be rebuildable.
4. Decision marked stale -> crash before effect: recovery must not treat stale decision as executable.
5. Effect committed -> revocation arrives: revocation governs later acts; it does not erase the historical effect.
6. Revocation/effect race: target-side linearization/fence determines ordering; wall-clock timestamps are insufficient.
7. Stale cache after revocation: cache generation/freshness must be checked at the protected boundary or an explicit bounded-staleness policy applies.
8. Lost/reordered invalidation: sequence/generation/gap detection is required; silence is not proof that no invalidation occurred.
9. Device partition: offline E7 may remain historical, but cannot regain current authority from local consistency.
10. Older snapshot restore: must not lower current authority generation or resurrect consumed permission.

A recent IETF individual Internet-Draft on finality-bound revocation describes the same execution-boundary problem: revocation must be load-bearing at protected commit, and cached/stale authorization is not equivalent to authoritative current state. It discusses queued work, crash recovery, partitions, alternate effect paths, and revocation/effect races. It is a draft, not an IETF standard or Nexo design choice. citeturn0search0turn0search5

## Durable propagation model
Candidate: AUTHORITY_CHANGE -> durable INVALIDATION_EVENT -> dependency traversal -> append derived CLAIM_INVALIDATED records -> invalidate/revoke dependent DECISION -> fence queued/in-flight effect -> require fresh decision at effect boundary.
Derived indexes/cache are accelerators only: INDEX/CACHE != AUTHORITY.

## Generation semantics
Candidate monotonic generations: authority_generation, policy_generation, target_incarnation, resource_fence.
A permission carries the generation(s) against which it was authorized. The effect boundary verifies compatibility with current protected state.
A current 2026 IETF individual draft describes generation fencing and warns that restoring an older snapshot can resurrect consumed authorization without rollback-resistant continuity. citeturn0search2

## Cache rule
A cache hit answers what its source said when the entry was valid; it does not automatically answer what is authoritative now.
TUF provides an analogous freshness/rollback model: metadata expiration, coherent Snapshot metadata, and detection of older metadata. citeturn0search1turn0search6

## Queue/delegation attack
Authorization E7 -> queue item Q7 -> downstream executor. If E8 arrives before Q7 executes, Q7 cannot rely only on the old authorization. The derivation relationship must survive and current authority/fence must be re-established at execution.

## Effect crosses before invalidation
If target commits E7 before E8 becomes authoritative at the target boundary, EFFECT_COMMITTED(E7) remains historical and E8 governs subsequent operations. If ordering cannot be established, UNKNOWN_EXTERNAL, not retroactive NOT_COMMITTED.

## Prototype status
No durable invalidation engine, authority-generation fence, dependency traversal or multi-device revocation mechanism was found in the inspected Nexo effect/recovery path. No implementation added.
Existing observations: local execution/effect journals; 200-entry retention cap; runtime idempotency key missionId:stepId; local nexoEffectRevision/stateVersion; no demonstrated protected authority generation at the external boundary; exception EFFECT_OUTCOME_UNKNOWN persistence discrepancy remains unresolved.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
durable invalidation event != automatic propagation; derived index/cache != authority; cached allow != current permission; lost invalidation != no revocation; revocation notification != target fencing; historical effect != retroactive invalidation; older snapshot != current authority; timestamp ordering != protected linearization; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.238: crash-consistent invalidation journal and replay semantics — duplicated/reordered invalidation events, partial dependency traversal, concurrent root/key rotation, and recovery from older snapshots without resurrecting stale permissions.