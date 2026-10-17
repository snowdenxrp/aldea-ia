# NCS M0.62 — Require complete outcome-classifier results

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Status: FOCUSED CI PASS — BOUNDED CORE CONTRACT FIX

## Finding

M0.61 preflighted the object returned by `outcomeClassifier.classify()` and verified that its `kind` matched the requested terminal classification. However, a result such as `{ kind: "UNKNOWN", reasons: [] }` could pass while omitting `evidence`; malformed scalar values for `reasons` or `evidence` could also escape. This meant the Core accepted an incomplete object as an Outcome.

## Change

- `classify()` now requires both `reasons` and `evidence` to be arrays after structural preflight and exact terminal-kind verification.
- Added regression tests for a missing `evidence` array and a non-array `reasons` value.
- Malformed classifier output rejects the transition rather than being treated as a valid terminal outcome.

## Evidence

- Source commit: `ecadcd8dfe7afe6f6f9f72d331d622044dda2b64`
- Regression-test commit: `87d89694696d3b723053a9d038cb9df2741306e1`
- M0 Core contracts CI: [run 39076179928](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179928) — success
- STEP 4 semantic validation CI: [run 39076179931](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179931) — success
- STEP 5 outcome classification CI: [run 39076179919](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179919) — success
- STEP 3A/3B/3C verification CI: [run 39076179968](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179968) — success

All four focused workflows completed successfully on the final regression-test commit `87d89694696d3b723053a9d038cb9df2741306e1`.

## Scope and limits

M0.62 closes the identified incomplete-outcome contract defect. It does not establish that the classifier is trustworthy, that production runtime exclusively uses this transition, or that constitutional authority, durable canonical commit/reconciliation, and protected-effect bypass closure are proven.

**STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.** Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED. No deployment target or constitutional ownership class is inferred.
