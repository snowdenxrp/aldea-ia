# NCS M0 — owner input validation before field access

Date: 2026-10-22
Status: IMPLEMENTED; exact-HEAD CI PENDING AT REPORT CREATION

## Finding

The public `createNexoContinuityOwner()` methods performed some property reads before validating caller-owned records. In `recordMission()`, the preliminary condition read `mission.missionId` and `mission.steps` before the downstream `recordNexoMissionInSnapshot()` called mission admission. An accessor-backed field could therefore execute caller-provided code before the admission boundary rejected accessors.

The same ordering pattern existed in operation entry points: `validateOperation()` read operation identity fields directly, and `recordOutcome()` inspected outcome fields before a structural data-property check. This is a reproducible contract-boundary defect, not evidence of authority bypass or protected-effect execution.

## Change

- `recordMission()` now calls `assertNexoMissionAdmission(mission)` before reading mission fields. Invalid input returns a fail-closed conflict result; resource-limit errors preserve their specific code.
- Added `validateCallerRecord()`: iterative continuity graph bound first, then `assertContractInput()` to reject accessors, exotic prototypes, and invalid property descriptors before public fields are read.
- Applied that guard before field access in `recordOutcome()`, `recordPrepared()`, `recordExecutionLineage()`, and `reconcilePrepared()`.
- Added a regression in `tests/nexo/continuity-contract.test.mjs`: an accessor-backed `missionId` must not execute, and the canonical store revision must remain unchanged.

## Scope and non-claims

This is input-contract hardening for in-process callers. It does not make JavaScript Proxy traps inert, does not defend against hostile code already executing in the same process, does not establish a global heap quota, does not authenticate evidence, and does not authorize protected effects. No dispatcher, authority root, or commissioning state was changed.

## Commits

- Regression: `d05519c5ddea931d83dc691064efb012c85ff848`
- Owner boundary fix: `5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037`

## CI

At report creation, workflows triggered by the fix commit were queued. Do not treat this change as CI-verified until the exact SHA `5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037` has completed the relevant workflows. Record each workflow and exact run result in a later checkpoint.

## Canonical state

M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
