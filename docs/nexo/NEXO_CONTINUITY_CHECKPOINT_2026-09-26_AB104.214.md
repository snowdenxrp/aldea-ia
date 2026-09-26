# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.214

## Canonical research state
- Research remains active. No clean Nexo architecture implementation has started.
- AB104.197 rule remains: CommitRecord/evidence is never permission to repeat an effect.
- AB50→AB58 residuals remain unchanged and must not be erased.

## AB104.214 persisted
- Research: docs/nexo/NEXO_AB104_214_EFFECT_PATH_DURABILITY_UNKNOWN_REEXECUTION_AUDIT_V1_2026-09-26.md
- Commit: 6f234e07b626e2fa69fde22966b39d3a5d16e36c

## Concrete prototype finding
- Actual path inspected: orchestrator → runtime → effect-adapter → simulation-adapter → memory/reconstruction.
- effect-adapter correctly refuses to execute a prepared entry again and requires reconciliation.
- CRITICAL: effectJournal is truncated to 200 entries in effect-adapter and memory. An old prepared/UNKNOWN entry can therefore be evicted. If its evidence disappears, a later recovery with the same idempotency key can be treated as fresh and reach the handler. This is a concrete prototype defect relevant to anti-replay/unknown preservation.
- Do not patch this yet. First research retention, archival, anti-replay, recovery semantics, and authority.
- idempotencyKey is currently missionId:stepId; it lacks target incarnation, authority epoch/root, and payload fingerprint.
- nexoEffectRevision is local simulation evidence, not external commit proof or anti-rollback.
- prepared-intent persistence is optional; no durable external guarantee is established.

## Tests actually inspected
- effect-adapter.test.mjs: local idempotency, concurrency, partial effects, UNKNOWN, reconciliation.
- effect-intent-persistence.test.mjs: prepared persistence ordering and persistence failure.
- restart-reconstruction.test.mjs: execution-only does not become completion; stale results do not regress verified completion.
- Missing coverage: eviction of unresolved records, real crash boundaries, restore rollback, target incarnation, authority epoch/root, fingerprint collision, authoritative negative reconciliation, partial external effects, cross-device fencing.

## Next exact mission
AB104.215: investigate retention/archival semantics for prepared, UNKNOWN, completed, failed, blocked; determine which records can be compacted and which must survive until an external horizon; design research-level rules for archival without losing anti-replay; distinguish archived evidence from nonexistent evidence during recovery. Continue external research and code study before architecture.

## DO-NOT-REPEAT
- Do not treat journal absence as proof of non-execution.
- Do not silently evict unresolved UNKNOWN/PREPARED evidence.
- Do not claim current prototype has external commit proof, anti-rollback, target incarnation, authority epoch/root, payload fingerprint, formal verification, or architecture completeness.
- Do not implement V21 or patch the architecture prematurely.