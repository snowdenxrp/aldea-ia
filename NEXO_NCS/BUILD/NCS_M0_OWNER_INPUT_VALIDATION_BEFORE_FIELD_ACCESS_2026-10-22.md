# NCS M0 — owner input validation before field access

Date: 2026-10-22
Status: IMPLEMENTED; 7 relevant workflows SUCCESS on exact code HEAD `b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6`

## Finding

The public `createNexoContinuityOwner()` methods performed some property reads before validating caller-owned records. In `recordMission()`, the preliminary condition read `mission.missionId` and `mission.steps` before the downstream `recordNexoMissionInSnapshot()` called mission admission. An accessor-backed field could therefore execute caller-provided code before the admission boundary rejected accessors.

The same ordering pattern existed in operation entry points: `validateOperation()` read operation identity fields directly, and `recordOutcome()` inspected outcome fields before a structural data-property check. This is a reproducible contract-boundary defect, not evidence of authority bypass or protected-effect execution.

## Change

- `recordMission()` now calls `assertNexoMissionAdmission(mission)` before reading mission fields. Invalid input returns a fail-closed conflict result; resource-limit errors preserve their specific code.
- Added `validateCallerRecord()`: iterative continuity graph bound first, then `assertContractInput()` to reject accessors, exotic prototypes, and invalid property descriptors before public fields are read.
- Applied that guard before field access in `recordOutcome()`, `recordPrepared()`, `recordExecutionLineage()`, and `reconcilePrepared()`.
- Added regressions in `tests/nexo/continuity-contract.test.mjs`: accessor-backed `missionId`, low-level execution input, and low-level outcome evidence must not execute caller getters; rejected calls must not mutate canonical continuity.
- Follow-up audit found the same pattern in the exported low-level `recordNexoExecutionInSnapshot()` and `recordNexoOutcomeInSnapshot()`: parameter destructuring and `structuredClone()` could read accessors before rejection. These functions now accept the input record without destructuring, run the iterative continuity preflight and JSON-persistability check, then read fields and clone.

## Scope and non-claims

This is input-contract hardening for in-process callers. It does not make JavaScript Proxy traps inert, does not defend against hostile code already executing in the same process, does not establish a global heap quota, does not authenticate evidence, and does not authorize protected effects. No dispatcher, authority root, or commissioning state was changed.

## Commits

- Owner getter regression: `d05519c5ddea931d83dc691064efb012c85ff848`
- Owner boundary fix: `5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037`
- Low-level operation getter regression: `89ba6387068b2c303680b2774b752dca213b77e7`
- Low-level operation boundary fix: `b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6`

## CI

For exact code HEAD `b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6`, these seven workflows completed successfully:
- Deterministic persistence tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781227
- Bounded mission admission/restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781258
- Integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781259
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781165
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781247
- Canonical mission status projection: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781235
- Repair settlement crash cuts: https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781246

The test-only commit `89ba638...` failed in the expected way before the implementation fix landed; the same regressions pass on `b13e68d...`. No result from an ancestor commit is being counted as a pass for this SHA.

## Canonical state

M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
