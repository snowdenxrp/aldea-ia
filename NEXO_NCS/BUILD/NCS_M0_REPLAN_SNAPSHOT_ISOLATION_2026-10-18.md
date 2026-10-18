# NCS M0 — Replan snapshot isolation

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED / FOCUSED CI PASS

## Defect

`replanPersistedNexoMission()` called the snapshot-producing `recordNexoPlan()`, then copied the returned snapshot into the caller's `memory` object with `Object.assign`. This erased the snapshot boundary.

## Correction

- Return the new memory snapshot from `recordNexoPlan()` directly.
- Regression asserts the successor exists in the returned snapshot, the failed attempt remains there, the old input snapshot does not contain the successor, and the returned memory object is distinct.

## Verification qualification

A previous workflow update accidentally used a stale base tree and reverted the runtime/test changes while retaining the workflow change. The workflow run therefore did **not** verify this snapshot-isolation regression, even though the runtime test command passed for the older test file. The code and assertions were restored on head `0a964abdc0a8f39465e484fd8f531a6a3d079caf`; the runtime test step passed on that exact SHA. Focused CI:
- Mission continuity / runtime regression [39085110783](https://github.com/snowdenxrp/aldea-ia/actions/runs/39085110783) — success; explicitly ran `tests/nexo/runtime.test.mjs` with the new snapshot assertions.
- STEP 4 semantic validation [39085110788](https://github.com/snowdenxrp/aldea-ia/actions/runs/39085110788) — success.
- STEP 5 outcome classification [39085110864](https://github.com/snowdenxrp/aldea-ia/actions/runs/39085110864) — success.

## Limits

This fixes local snapshot isolation only. It does not authenticate report provenance, establish the Proxy trust boundary, authorize protected effects, or prove production startup-to-protected-sink reachability. Proxy boundary remains design STOP; STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
