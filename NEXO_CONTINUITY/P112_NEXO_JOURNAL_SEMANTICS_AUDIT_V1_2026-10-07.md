# P112 NEXO JOURNAL SEMANTICS AUDIT V1 — 2026-10-07

Research-only; no implementation.

## Current durable structures
`src/assistants/memory.js` reconstructs `nexoMemory.nexo` with bounded collections: missions 50, attempts 100, doNotRepeat 100, executions 200, effectJournal 200. `persistState()` serializes `simulation.nexoMemory`, so these structures cross restart when the state file is successfully persisted.

The restart test explicitly persists a `prepared` effectJournal entry and verifies it survives `loadState()`/`applyState()`. This establishes serialization/reconstruction evidence for the prepared entry, not proof that the corresponding external effect did or did not occur.

## Semantics actually represented
`effectJournal` entries are structurally capable of carrying statuses such as `prepared`; the runtime passes the journal to the effect adapter. `recordNexoOutcome()` separately accepts only terminal mission-step statuses `completed`, `failed`, or `blocked`, and requires verified evidence for `completed`.

Therefore there are already two distinct histories:
- effect-level journal (`effectJournal`), including prepared state;
- mission-level terminal attempt/outcome (`attempts`/`executions`).

They must not be collapsed into one truth source.

## Critical limitation
The current `effectJournal` is bounded to the last 200 entries. Therefore unresolved/prepared evidence can eventually be evicted. This was already identified in later AB104.214-era research; here it is independently confirmed from current `memory.js` plus direct repository search. Eviction of an unresolved entry means absence from the current bounded journal cannot safely mean `ABSENT`.

`nexoEffectRevision` is incremented in `simulation-adapter.js` but is in-memory simulation state; it is not part of the serialized `nexoMemory` payload. It therefore cannot be treated as a durable cross-restart commit marker or target fence.

## Crash-state mapping
Current structures can represent useful evidence, but the code does not demonstrate a single authoritative durable state machine:
- prepared journal entry → evidence of PREPARED;
- terminal mission outcome → terminal mission record;
- missing journal entry → NOT sufficient evidence of no prior effect;
- `nexoEffectRevision` change → local in-memory mutation signal only;
- persistence failure/ambiguous storage → UNKNOWN until canonical recovery evidence resolves it.

## Important distinction
A successfully reconstructed `completed` mission step is stronger than a bare execution record because `recordNexoOutcome()` requires verified evidence. But it remains local Lúmina/Nexo evidence; it does not prove an external world-side commit.

## Status
GREEN: current journal persistence/reconstruction and separate mission outcome semantics confirmed from source + restart test.
BLUE: authoritative effect state machine, durable retention/archival of unresolved entries, and linkage between prepared intent, local mutation, durable commit, and recovery remain OPEN.

## Exact next
Trace the complete effectJournal lifecycle (`recordIntent`/prepare → handler → terminal journal update → persistence) and determine exactly where an entry can disappear, be overwritten, or remain only in RAM across every success, exception, and crash cut.

## DO-NOT-REPEAT
No retention patch; no implementation; no TLC rerun; no global stateRevision promotion; no AB104.185 primary; no AB105.117R.
