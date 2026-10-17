# NCS M0.49 — Reject malformed observation evidence collections

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

Observation envelope construction and mission-candidate construction spread `derivedProvenance` and `admissionEvidence` into arrays without first requiring arrays. A string could therefore be accepted as a sequence of characters, while other malformed iterables or values could behave inconsistently at the contract boundary.

## Change

- Added explicit array validation for `derivedProvenance` in `createObservationEnvelope()`.
- Added explicit array validation for `admissionEvidence` in `createMissionCandidate()`.
- Regression tests cover strings and object-shaped values for both fields.

## Evidence

- Source commit: `64f74c975d6748d288d093db24ca0563301f895e`
- Regression-test commit: `a55d0f54158efa7a8c6588eae3424cff6c931a9d`
- M0 source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996819776 — success
- STEP 5 source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996819811 — success
- STEP 4 source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996819850 — success
- M0 regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996829032 — success
- STEP 5 regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996828956 — success
- STEP 4 regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996828937 — success

## Limits

This is collection-shape validation only. It does not establish observation truth, source authenticity, admission authority, constitutional authority, or protected-effect readiness. No full-repository/device test is claimed.
