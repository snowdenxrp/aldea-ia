# NCS M0.45 — Reject blank Observation source/code

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The Observation envelope's `requiredString()` rejected empty strings but accepted whitespace-only `source` and `code`. Core ClaimEnvelope and policy reference contracts already reject blank required identifiers. An Observation with blank source/code could therefore be structurally accepted despite carrying no usable label.

## Change

Observation `requiredString()` now rejects non-strings and strings whose trimmed length is zero, while preserving the original nonblank value. Regression cases cover whitespace-only source and code.

## Evidence

- Source commit: `7d7f4210426358c7eb9ea867c20312f3bf5951d4`
- Test commit / CI head: `d1cd6f126c7067f32d9ae604da4e21df855e9abb`
- M0 non-authority core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994815429 — success
- STEP 4 semantic validation CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994815408 — success
- STEP 5 outcome classification CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994815407 — success

## Limits

This corrects required-field shape only. A nonblank source label is not authenticated source provenance and does not authorize an action. No full-repository or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
