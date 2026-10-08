# P112 LOCAL TRANSACTION FEASIBILITY / SNAPSHOT-COMMIT AUDIT V1 — 2026-10-07

Research-only; no implementation.

## Current persistence topology
`applyState()` deep-clones persisted world/agents and reconstructs a simulation object. `persistState()` serializes the entire simulation payload and conditionally checks `expectedRevision` while holding the filesystem lock. Therefore the repository has the raw ingredients for a snapshot/conditional-commit strategy.

## What this enables
A future local protected transition could conceptually operate on an isolated simulation snapshot:
1. load canonical state + capture revision/provenance;
2. durably record PREPARED intent;
3. construct an isolated working simulation;
4. perform the deterministic local mutation on that working state;
5. final-validate captured dependencies/current canonical revision;
6. persist the resulting whole state with conditional expectedRevision;
7. persist terminal effect/mission evidence as part of the committed state.

This avoids mutating the live canonical simulation before the conditional commit.

## What it does NOT yet prove
- The current `persistState()` is not a transaction enclosing handler execution.
- It has no demonstrated storage fsync/power-loss contract.
- `expectedRevision` is checked before serialization/rename, so it is useful only when all competing writers honor the same protocol.
- The simulation tick/day writers remain broad shared writers; a working snapshot must reject stale assumptions rather than blindly overwrite them.
- Every protected mutation entry point must operate only on the working snapshot during the transition; a bypass to the live simulation would break the model.
- PREPARED and final commit are separate durable states unless a real transactional store is introduced; crash between them remains PREPARED/UNKNOWN and requires reconciliation semantics.

## Important narrowing
The existing JSON architecture therefore appears more compatible with **conditional snapshot/commit** than with a true in-place local transaction. This is a feasibility result, not an implementation decision.

A true in-place atomic local transaction would require a storage/transaction primitive that atomically couples protected mutation and durable commit. The current lock/temp/rename primitive does not demonstrate that property.

## Status
GREEN: `applyState()` supplies an isolated cloned working state; `persistState(expectedRevision)` supplies conditional persistence at the file boundary.
BLUE: completeness of snapshot dependency capture, bypass exclusion, multi-writer protocol, crash recovery, and exact PREPARED/final-commit ordering remain OPEN.

## Exact next
Trace whether `executeAction` and all audited protected mutation branches can be redirected conceptually to an isolated simulation without hidden references to the live simulation, then map the conditional-commit conflict outcome to the existing UNKNOWN/reconciliation protocol. Do not implement yet.

## DO-NOT-REPEAT
No implementation; no fsync patch; no global stateRevision promotion; no TLC; no AB104.185 primary; no AB105.117R.
