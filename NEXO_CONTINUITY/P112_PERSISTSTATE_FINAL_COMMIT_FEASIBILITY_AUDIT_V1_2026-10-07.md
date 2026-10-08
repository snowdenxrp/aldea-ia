# P112 PERSISTSTATE FINAL COMMIT FEASIBILITY AUDIT V1 — 2026-10-07

## Scope
Question only: can the existing `persistState(expectedRevision)` serve as the final conditional commit primitive for a fully isolated working snapshot, without mutating canonical state first?

## Primary source inspected
`scripts/simulate.mjs` at the repository source currently containing the persistence implementation.

Exact sequence:
1. acquire sibling filesystem lock with `fs.mkdir`;
2. while the lock is held, reload canonical state;
3. compare canonical `stateRevision` with caller `expectedRevision`;
4. reject mismatch with `STATE_REVISION_CONFLICT` before writing;
5. serialize the complete working simulation, including `world`, `agents`, `events`, and `nexoMemory`;
6. write a unique temporary sibling file;
7. rename the temporary file over canonical `world-state.json`;
8. release the lock.

## Existing tests
`tests/nexo/simulation-restart-persistence.test.mjs` already exercises:
- real file save and reload;
- reconstruction of persisted Nexo mission memory;
- preservation of a PREPARED effectJournal entry across restart;
- stale expectedRevision rejection;
- two independent Node workers racing from revision 0, requiring exactly one commit and one `STATE_REVISION_CONFLICT`;
- injected write failure preserving the previous canonical state;
- injected rename failure preserving the previous canonical state and cleaning temp files;
- stale-lock recovery after the lock owner process is killed.

Therefore this is not a hypothetical persistence primitive.

## Result
🟢 **Existing mechanism is structurally sufficient as a conditional snapshot-commit primitive for cooperating writers.**

Reason:
- `applyState()` creates an isolated working simulation from persisted state.
- `persistState()` commits the supplied working snapshot, rather than requiring mutation of the canonical in-memory object.
- The revision comparison and canonical replacement occur under the same filesystem lock.
- A cooperating writer cannot pass the revision check and then be overtaken by another cooperating writer using the same lock before its replacement.
- The persisted envelope already contains Nexo memory, so the snapshot can carry mission/effect-journal state into the same canonical replacement.

This means we should **not invent a second generic conditional-commit wrapper merely to obtain snapshot commit**.

## Important boundary
This does NOT prove the complete Nexo protected-transition protocol.

Still separate:
- durable PREPARED checkpoint before handler;
- final commit-time authority/dependency/resource revalidation;
- complete dependency coverage;
- all mutation writers honoring the snapshot/commit protocol;
- process/OS/power-loss durability, because no fsync/fdatasync/FileHandle.sync contract was demonstrated;
- external-effect fencing/idempotency/reconciliation.

Also, `STATE_REVISION_CONFLICT` currently rejects the commit but does not itself perform replan/reconciliation.

## Correction to prior frontier
The open question is no longer:
"Does `persistState(expectedRevision)` need another commit primitive?"

The narrower remaining question is:
"Can the future protected-transition owner arrange the entire admitted local transition on an isolated snapshot, perform the required final revalidation, then use existing `persistState(expectedRevision)` as the canonical conditional commit?"

## Evidence classification
🟢 Existing conditional snapshot commit primitive.
🟢 Cooperating-writer stale-revision race covered by lock + expectedRevision tests.
🟢 Whole snapshot includes `nexoMemory`.
🔵 Final protected-transition integration is not implemented/proven.
🔵 Complete dependency/bypass coverage remains open.
🔵 Storage crash/power-loss durability remains outside current guarantee.
🔵 External effects remain a separate capability boundary.

## DO-NOT-REPEAT
No new transaction wrapper for the same conditional-commit function.
No implementation.
No TLC rerun.
No AB104.185 primary backfill.
No AB105.117R.
No claim that rename success is power-loss durable.
No claim that persistence lock fences an already-running effect.

## Exact next
Audit the future protected-transition owner against this already-existing primitive: isolated snapshot → final revalidation → `persistState(expectedRevision)` → conflict classification/reconciliation. Only add a narrower wrapper if a concrete missing semantic is demonstrated.
