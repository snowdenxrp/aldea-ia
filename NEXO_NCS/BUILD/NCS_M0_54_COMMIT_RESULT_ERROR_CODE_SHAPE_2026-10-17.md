# NEXO NCS — M0.54: Validate commit-result errorCode shape

Date: 2026-10-17
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PENDING AT REPORT CREATION

## Defect demonstrated

`createCommitResult()` validated the commit status but copied `errorCode` into a shallow-frozen result without validating its type. A caller could supply a mutable object (or blank string) as an error code; the returned object would retain that caller-owned object, contradicting the plain contract of a commit error code and the Core's detached immutable result boundary.

This is distinct from M0.28: that report covered detachment of nested `reasons` and `evidence` for validation/outcome/authority results. It did not cover the scalar `errorCode` field of `createCommitResult()`.

## Correction

- `src/nexo/core/contracts.mjs`: `errorCode` must be either `null` or a non-empty, non-blank string.
- `tests/nexo/core-contracts.test.mjs`: added regression coverage for null, blank strings, and object-shaped mutable values.
- No commit semantics, authority semantics, reconciliation logic, or protected-effect routes were changed.

## Commits

- Source: `65f9430a66822e07098d40aa2ff0731e273bdfd6`
- Regression test: `6b9fa321c6fdce3a15ca1ff8a3767e4ef8aa0205`

## Focused CI

Runs were triggered on the regression-test commit `6b9fa321c6fdce3a15ca1ff8a3767e4ef8aa0205`. At report creation, runs were still queued/in progress; no PASS is claimed yet.

- M0 core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041551827
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041551943
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041551753
- STEP 7 policyContext contract: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041551767
- STEP 3A/3B/3C verification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041551824

## Scope and limitations

This is a bounded Core contract-shape correction. It does not establish commit correctness, caller identity, provenance authenticity, constitutional authority, runtime reachability, or bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No full repository test run is claimed.

## Next step

Verify all focused CI runs on the regression-test commit. Update STATUS and the latest handoff only after recording completed results. Continue with a distinct contract boundary; do not repeat M0.1–M0.54.
