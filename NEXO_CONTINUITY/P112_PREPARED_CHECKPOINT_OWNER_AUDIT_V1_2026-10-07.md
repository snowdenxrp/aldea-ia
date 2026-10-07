# P112 PREPARED CHECKPOINT OWNER AUDIT V1 — 2026-10-07

Research-only; no implementation.

## Caller search

Repository-wide search for persistPreparedIntent finds the generic seam in runtime.js/effect-adapter.js and test coverage in tests/nexo/effect-intent-persistence.test.mjs. No production caller supplying the callback was found.

Search for executeLuminaNexoStep() finds the runtime definition and historical/test references, but no current production execution owner that invokes it and supplies a canonical persistence callback.

This independently confirms the AB104.150 boundary rather than treating that historical document as the source of truth.

## Persistence owner

scripts/simulate.mjs is the canonical owner of world-state.json persistence, including revision checking, lock, temp write and rename.

scripts/assistants.mjs calls persistState() after planning/report work, but it does not execute the Nexo effect through executeLuminaNexoStep().

Therefore there is currently no demonstrated production path:
effect adapter prepared → caller-owned durable persistState checkpoint → handler

## Test-only checkpoint

tests/nexo/effect-intent-persistence.test.mjs does provide a callback and verifies callback behavior/failure handling. This proves the seam's local contract, not production integration.

## Terminal side

The effect adapter persist() only updates the supplied in-memory journal and its local executed map. The runtime then separately updates Nexo mission memory. persistState() is a separate caller action.

Thus:
handler → adapter.persist() does not itself imply world-state.json persistence.

The normal simulation/assistant persistence path can persist nexoMemory, but no demonstrated execution owner currently bridges the effect lifecycle into that persistence call.

## Important result

GREEN: canonical persistence owner identified: scripts/simulate.mjs.
GREEN: test callback contract exists.
RED: production prepared-before-handler durable checkpoint is absent.
RED: production terminal effect + world mutation + journal + stateRevision commit is absent as one demonstrated boundary.
BLUE: the missing architectural boundary is specifically the execution owner that can coordinate the prepared checkpoint with canonical state persistence; do not invent a caller merely to close the graph.

## Exact next

Audit whether scripts/simulate.mjs itself can legitimately own effect execution without violating the existing simulation lifecycle, or whether a separate execution-owner boundary is required. Trace load → applyState → tick/mission → effect → persist and identify the smallest legitimate owner before any implementation.

## DO-NOT-REPEAT

No implementation; no callback wiring; no fsync patch; no global stateRevision promotion; no TLC rerun; no AB104.185 primary; no AB105.117R.
