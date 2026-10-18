# NCS M0 — Replan snapshot isolation

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED; focused CI pending

## Defect

`replanPersistedNexoMission()` called the snapshot-producing `recordNexoPlan()`, then copied the returned snapshot back into the caller's `memory` object with `Object.assign`. That erased the snapshot boundary for this operation and meant the caller's prior in-memory state changed during successor planning.

## Correction

- Return the new memory snapshot from `recordNexoPlan()` directly.
- Preserve the original memory value unchanged; callers must adopt the returned `memory` when they choose to persist/continue with the new state.
- Regression asserts that the new successor exists in the returned snapshot, the failed attempt remains there, the old input snapshot does not contain the successor, and the returned memory object is distinct.

## Verification

Focused CI is pending for the new source/test head. Do not call this PASS until the run has completed.

## Limits

This fixes local snapshot isolation only. It does not authenticate report provenance, establish the Proxy trust boundary, authorize protected effects, or prove production startup-to-protected-sink reachability. Proxy boundary remains design STOP; STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
