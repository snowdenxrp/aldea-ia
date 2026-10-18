# NCS M0 — Replan snapshot isolation

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: SOURCE + REGRESSION RESTORED; CI pending

## Defect

`replanPersistedNexoMission()` called the snapshot-producing `recordNexoPlan()`, then copied the returned snapshot into the caller's `memory` object with `Object.assign`. This erased the snapshot boundary.

## Correction

- Return the new memory snapshot from `recordNexoPlan()` directly.
- Regression asserts the successor exists in the returned snapshot, the failed attempt remains there, the old input snapshot does not contain the successor, and the returned memory object is distinct.

## Verification qualification

A previous workflow update accidentally used a stale base tree and reverted the runtime/test changes while retaining the workflow change. The workflow run therefore did **not** verify this snapshot-isolation regression, even though the runtime test command passed for the older test file. The code and assertions have now been restored on the current branch head. Treat CI as pending until the new exact-head run confirms these assertions are present and passing.

## Limits

This fixes local snapshot isolation only. It does not authenticate report provenance, establish the Proxy trust boundary, authorize protected effects, or prove production startup-to-protected-sink reachability. Proxy boundary remains design STOP; STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
