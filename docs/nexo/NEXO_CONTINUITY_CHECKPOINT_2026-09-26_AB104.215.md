# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.215

## Persisted
- Research: docs/nexo/NEXO_AB104_215_RETENTION_ARCHIVAL_UNKNOWN_COMPACTION_V1_2026-09-26.md
- Commit: 30ce49d85f958d8a027f02b86ab96b9a67c77934

## Critical correction
- Direct main inspection reveals a code/test discrepancy: effect-adapter.js returns EFFECT_OUTCOME_UNKNOWN from handler exception without calling persist(), while effect-adapter.test.mjs expects exceptionJournal[0].result.code to be EFFECT_OUTCOME_UNKNOWN.
- Therefore do NOT claim UNKNOWN is durably recorded by the current exception path until actual test execution verifies it. No CI/formal verification claim.

## AB104.215 conclusions
- Journal absence is not NOT_COMMITTED.
- Archival must preserve anti-replay semantics; archived evidence must remain discoverable/verifiable.
- PREPARED/UNKNOWN require stronger retention than ordinary terminal results while external resolution remains possible.
- COMPLETED may be compacted only with stable identity and sufficient evidence/reference to prevent replay and permit reconstruction.
- FAILED/BLOCKED must be distinguished from proven pre-boundary non-commit; BLOCKED due uncertainty is not terminal non-execution.
- Retention horizon belongs to EffectContract/target semantics, not arbitrary local array length.
- Expired evidence does not turn UNKNOWN into NOT_COMMITTED.
- Proposed historical states: LIVE_UNRESOLVED, ARCHIVED_UNRESOLVED, RESOLVED_COMMITTED, RESOLVED_NOT_COMMITTED, RESOLVED_FAILED_PRE_BOUNDARY, UNKNOWN_PERMANENT, CORRUPT/CONFLICT.

## Next exact mission
AB104.216: research a cryptographically/verifiably bound archive/compaction certificate preserving anti-replay, operation identity, payload fingerprint, target/incarnation, authority, digest/range, unresolved states and recovery after restore; then attack truncation, garbage collection and snapshot+archive reconstruction.

## DO-NOT-REPEAT
- Never infer non-execution from journal absence.
- Never silently discard unresolved evidence.
- Never call the current exception UNKNOWN path durable without test execution evidence.
- No V21, no architecture implementation, no unsupported formal/CI/fault-injection claims.