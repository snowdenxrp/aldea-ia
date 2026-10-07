# P112 PERSISTENCE PRIMITIVE CRASH-CUT AUDIT V1 — 2026-10-07

Research-only; exact current `scripts/simulate.mjs` inspected at commit `f8704496184eb498d87847afebbd47d1004c61ec`.

## Exact primitive
`persistState()`:
1. acquires sibling lock directory with `fs.mkdir()`;
2. while lock held, optionally reloads current state and compares `expectedRevision`;
3. serializes the whole simulation payload in memory;
4. writes a temporary sibling file with `fsModule.writeFile()`;
5. renames temp file over `world-state.json`;
6. releases lock.

## What this DOES close
- For cooperating callers using the same lock path, the revision check occurs while the lock is held, so the demonstrated same-revision persistence race is serialized at this persistence boundary.
- A failed `writeFile`/`rename` path removes the temp file and does not intentionally replace the prior state; AB104.142 provides deterministic failure evidence for that behavior.
- Rename means the persistence path has a clean old-file/new-file replacement boundary at the namespace level, subject to filesystem semantics.

## What this DOES NOT close
- The lock is acquired only inside `persistState()`. Simulation mutation occurs earlier, outside that lock. Therefore the lock is NOT an execution/effect fence and does not prevent another process from changing in-memory state while this process is computing its next state.
- `expectedRevision` is a stale-writer guard, not an intrinsic lock-free CAS; it is safe only for writers honoring the lock/contract.
- The code does not demonstrate `fsync`/durable flush of the temp file before rename, nor a directory sync after rename. Therefore a crash/power-loss cut around write/rename cannot be promoted to a universal durable COMMITTED guarantee from this primitive alone.
- A successful function return proves the API path completed, not necessarily that the data survives every storage/power-loss model.
- `loadState()` catches read/parse/schema failures and returns a default state. That recovery fallback is a separate provenance/safety concern and must not be confused with successful durable recovery.

## Crash-cut classification
A) before temp write completes: prior state remains the intended durable state; new transition is NOT_COMMITTED if no replacement occurred.
B) temp written but rename not completed: old canonical file remains the intended state; temp artifact is not canonical and is cleaned on cooperating retry. Fresh evidence still required for exact crash timing.
C) rename completed: canonical namespace points at new payload, but without an explicit durability barrier the strongest safe claim is `PERSISTED_AT_NAMESPACE`, not universally durable-after-power-loss COMMITTED.
D) crash after rename before release lock: canonical new payload may exist; lock may remain and later stale-lock recovery can remove it. Commit status must be derived from canonical state plus storage/recovery evidence, not from exception alone.
E) crash/power loss during or after write/rename without durability barrier: durable outcome remains UNKNOWN under a strict crash model until recovery/storage evidence resolves it.

## Important result
The current primitive is stronger than simple last-writer-wins persistence, but weaker than a complete transactional durability protocol. It closes a stale-writer coordination problem, not the mutation→durable-commit linearization problem.

## Status
GREEN: exact persistence sequence and bounded guarantees traced from current code + primary AB104 evidence.
BLUE: durable storage barrier, crash semantics across actual filesystem, and integration of protected mutation with persistence remain OPEN.

## Exact next
Separate two remaining questions: (1) can the local protected mutation be represented as a recoverable journal/state transition whose commit marker is authoritative, and (2) what storage durability contract is actually required (process crash vs OS crash vs power loss)? Then compare the smallest protocol against existing `persistState()` without assuming a new database.

## DO-NOT-REPEAT
No implementation; no TLC rerun; no global `stateRevision` promotion; no AB104.185 primary; no AB105.117R; no exactly-once external-effect claim.
