# NCS M0 — Outcome-driven successor mission

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED / FOCUSED CI PASS

## Functional gap

The lifecycle could mark a mission `needs_replan` or `blocked`, and callers could manually invoke `buildNexoMission()` with parent/reason fields. No dedicated entry point validated the prior terminal state, derived a reason from existing failure/block evidence, and created a successor with lineage intact. Existing tests manually supplied lineage, so this handoff was not exercised as one behavior.

## Change

- Added `replanNexoMission()` to `src/nexo/orchestrator.js`.
- Only accepts `needs_replan` or `blocked` prior missions.
- Uses an explicit reason, then a failed-step evidence code, blocked-step reason, or mission-level last-evidence code. Returns `null` rather than inventing a reason when none is grounded.
- Calls the existing planner with `parentMissionId` and `replanReason`; adds no IDs, retry rules, queues, or execution authority.
- Regression covers successor lineage, persistence/reconstruction, preservation of the prior outcome record, and rejected states.

## Verification

- Mission admission / continuity: [39084644603](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084644603) — success.
- STEP 4 semantic validation: [39084644520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084644520) — success.
- STEP 5 outcome classification: [39084644555](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084644555) — success.
- M0 non-authority core contracts: [39084644458](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084644458) — success.
- Final source/test head exercised by these workflows: `edd274dd6cade0534ca2b8adc3eeef662336ca1d`.

## Limits

This builds a successor plan candidate from newly supplied reports; it does not execute it, authenticate report provenance, or authorize protected effects. The existing caller-supplied `verified` contract is unchanged. Proxy boundary remains design STOP; STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
