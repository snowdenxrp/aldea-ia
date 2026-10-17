# NCS M0.50 — Revalidate ObservationEnvelope at MissionCandidate boundary

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

`createMissionCandidate()` checked only the supplied observation's `source` and `code`, then cloned/froze the object directly. A caller could bypass `createObservationEnvelope()` and submit a look-alike object with malformed `derivedProvenance` or mutable exotic data such as `Map`/`Date`. This recreated the same class of boundary-bypass already addressed for ClaimEnvelope, but on the observation side.

## Change

- `createMissionCandidate()` now rejects null/non-object/array observations.
- It rebuilds the supplied observation through `createObservationEnvelope()`, enforcing required nonblank fields, collection shapes, plain-data-only values, detachment, and recursive freezing at the public candidate boundary.
- Added regressions for malformed provenance collection, object-shaped provenance, `Map` inputs, and `Date` freshness when passed through a look-alike observation.

## Commits

- Source: `e3893502f80f4be207918b47fd91203341e34fb2`
- Initial regression tests: `83fd231f9848ff2655d6147e72229e7070e44152` (M0 workflow caught an assertion expecting the old error text; this failed run was inspected, not hidden).
- Corrected regression assertions: `e43f19c4373ec642a75a1d436f4625d05e3765a4`

## Focused CI for corrected test head

- M0 core: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997100974 — pending at report creation
- STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997100979 — pending at report creation
- STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997100978 — pending at report creation

The source-head M0 workflow at `e3893502f80f4be207918b47fd91203341e34fb2` failed because the existing test expected an error message prefixed with `observation.source`; the constructor now correctly reports its own `source` validation. The test was corrected to assert the new constructor-level error and a fresh CI run was triggered.

## Limits

This is structural boundary validation only. It does not authenticate who produced an observation, prove that its content is true, establish constitutional authority, or prove runtime reachability to protected effects. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No deployment or device test is claimed.
