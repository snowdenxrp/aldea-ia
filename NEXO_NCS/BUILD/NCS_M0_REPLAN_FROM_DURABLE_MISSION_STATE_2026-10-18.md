# NCS M0 — Replan from durable mission state

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED; focused CI pending

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

Focused workflow is triggered by changes to the runtime and its integration test. Record its exact run and final status here after completion; until then CI is pending.

## Limits

This is a non-authoritative planning/continuity path. It does not authenticate report provenance, authorize protected effects, or prove production startup-to-protected-sink reachability. Proxy trust boundary remains design STOP; STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
