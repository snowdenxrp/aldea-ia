# P112 PERSISTSTATE PHYSICAL BOUNDARY / CRASH-CUT AUDIT V2 — 2026-10-07

## Scope
Physical source audit of existing `persistState(expectedRevision)` and its restart/conflict/failure tests. Goal: establish exactly what crosses the canonical persistence boundary, which crash/failure cuts are covered, and what remains unproven.

## Primary source
`scripts/simulate.mjs` current source.

### Exact commit sequence
1. Acquire sibling `.lock` directory with `fs.mkdir`; write `owner.json`.
2. If `expectedRevision` is supplied, reload canonical state while lock is held.
3. Compare current `stateRevision` with `expectedRevision`; mismatch throws `STATE_REVISION_CONFLICT` before payload construction/write.
4. Construct one payload containing `version, stateRevision, savedAt, day, hour, world, agents, events.slice(-500), nexoMemory`.
5. Remove stale sibling temp files matching the temp prefix.
6. Serialize payload with `JSON.stringify(...)+"\\n"`.
7. Write a unique sibling temp file.
8. Rename temp file over canonical `world-state.json`.
9. Return payload; `finally` releases the lock.

## 10 findings
1. 🟢 **Revision check precedes serialization/write.** A stale cooperating writer is rejected before creating the new canonical payload.
2. 🟢 **The canonical snapshot crosses as one serialized envelope.** `world`, `agents`, `events`, and `nexoMemory` are selected from the same supplied simulation at payload construction.
3. 🟢 **Nexo effect/mission memory is physically inside the same snapshot envelope.** The restart test proves a PREPARED effectJournal entry and mission outcome survive ordinary save/reload.
4. 🟢 **The temp-file boundary protects the previous canonical file on injected write failure.** The test forces `writeFile` to fail and then verifies the old revision/savedAt remain.
5. 🟢 **The temp-file boundary protects the previous canonical file on injected rename failure.** The test forces rename to fail, verifies the old state remains, and verifies temp cleanup.
6. 🟢 **The lock + expectedRevision protocol is exercised with two real Node workers.** The test requires exactly one commit and one `STATE_REVISION_CONFLICT` from a revision-0 race.
7. 🟢 **Killed-lock recovery exists.** A child process creates the lock and is SIGKILLed; the test ages the lock beyond the stale threshold and verifies a later persistence can recover it.
8. 🔵 **The failure tests are operation-level injections, not proof of arbitrary process/OS interruption at every byte boundary.** They establish tested behavior for rejected write/rename calls, not all crash cuts.
9. 🔴 **No fsync/fdatasync/FileHandle.sync contract is present in the inspected implementation.** Therefore no power-loss durability or post-crash storage-ordering guarantee is claimed.
10. 🔵 **The persistence primitive does not itself bind semantic admission provenance, effect identity, authority/fence context, or reconciliation outcome to the revision.** It is a conditional whole-snapshot replacement primitive, not the complete protected-transition protocol.

## Crash-cut map
- Before lock acquisition: no canonical write has begun.
- After lock acquisition / before revision check: canonical file unchanged by this call.
- Revision mismatch: canonical file unchanged by this call.
- After revision check / before temp write: RAM payload exists only in caller.
- During temp write: canonical file remains the prior file unless the filesystem/process failure semantics say otherwise; current tests only inject write rejection.
- After successful temp write / before rename: canonical file remains prior file; temp may exist.
- Rename failure: test proves prior canonical file remains and temp is cleaned.
- After successful rename / before return: canonical path has been replaced by the new payload; whether that replacement survives sudden process/OS/power interruption is not established.
- During lock release: canonical replacement already occurred; lock cleanup failure is a separate cleanup issue and is not part of payload commit semantics.

## Boundary conclusion
🟢 Existing `persistState(expectedRevision)` is a usable conditional snapshot-commit primitive for cooperating writers.

It is therefore unnecessary to invent another generic conditional-write primitive merely for snapshot conflict control.

But the complete protected-transition question remains open:
`isolated snapshot → final semantic revalidation → persistState(expectedRevision) → conflict classification/reconciliation`.

## Important distinction
“World + Nexo memory are in the same serialized payload” is proven for the canonical snapshot envelope. It does **not** mean every other Nexo artifact is in that envelope: the separate assistant memory file remains an independent consistency domain, and runtime/effect-adapter terminal persistence is not itself the canonical commit call.

## Evidence state
- 🟢 canonical payload membership and tested revision conflict/write/rename behavior.
- 🟢 cooperating-writer lock behavior.
- 🟢 ordinary restart reconstruction of Nexo memory/effectJournal.
- 🔵 exact behavior under arbitrary process crash during write/rename.
- 🔵 complete semantic final-gate integration.
- 🔴 power-loss durability / fsync claim.
- 🔴 exactly-once external-effect claim.

## DO-NOT-REPEAT
No second generic snapshot commit wrapper.
No implementation.
No TLC rerun.
No AB104.185 primary backfill.
No AB105.117R.
No JMM-HB claim.
No exactly-once or power-loss claim.

## Exact next
Audit the protected-transition owner against this proven boundary: identify the exact point where isolated simulation + cloned `nexoMemory` can undergo final semantic revalidation, then hand the validated candidate to existing `persistState(expectedRevision)`. Separately classify any effect/provider/memory artifact outside the canonical envelope.
