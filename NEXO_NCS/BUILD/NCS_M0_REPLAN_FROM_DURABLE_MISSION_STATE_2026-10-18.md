# NCS M0 — Replan from durable mission state

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED / FOCUSED CI PASS

## Functional gap

The previous increment created successor plans from a supplied mission object, but the persisted runtime path did not expose a single operation that reconstructs the prior mission, derives replan context from its durable outcome, creates a successor, and stores that successor before execution is considered.

## Change

- Added `replanPersistedNexoMission()` in `src/nexo/runtime.js`.
- Reconstructs the prior mission from durable memory by mission ID.
- Returns explicit `invalid`, `not_found`, or `not_replanned` states instead of inventing missing context.
- Uses `replanNexoMission()` to derive the reason from recorded failure/block evidence and preserve parent lineage.
- Persists the successor plan in memory before returning it. It does not execute the plan.
- Runtime regression now covers failure → durable reconstruction → successor planning/persistence → successor execution, and verifies the original failed attempt remains in history.

## Verification

Focused CI PASS on exact head `a7f60d90303fcbd24f4918f4b05730c6967527c8`:
- Mission admission / restart continuity: [39084825665](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084825665) — success.
- STEP 4 semantic validation: [39084825686](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084825686) — success.
- STEP 5 outcome classification: [39084825638](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084825638) — success.

## Limits

This is a non-authoritative planning/continuity path. It does not authenticate report provenance, authorize protected effects, or prove production startup-to-protected-sink reachability. Proxy trust boundary remains design STOP; STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
