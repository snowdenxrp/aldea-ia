# NCS M0.60 — Preflight semantic validator result before field reads

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Status: FOCUSED CI PASS — BOUNDED CORE DATA-CONTRACT FIX

## Finding

M0.59 guarded the candidate returned by `candidateExecutor.execute()` before reading its fields. The next boundary, `finalSemanticValidator.validate(candidate)`, still returned a port-controlled object whose `status` property was read before the shared structural preflight. An enumerable getter on `status` could therefore execute caller-controlled code during result handling.

## Change

- `executeProtectedTransition()` now rejects non-record validator results as UNKNOWN before field access.
- For record-shaped results, it calls the shared `assertContractInput()` before reading `status`, `reasons`, or `evidence`.
- Added a regression test with an enumerable `status` getter. The getter is rejected without execution and conditional commit is not called.

## Evidence

- Source change commit: `49e36675b2c2e71cb63da4e676c7cca7a9e1fa97`
- Regression-test commit: `80325047c8a3c49bad0499ce9dfeb93d578eeeec`
- M0 Core contracts CI: [run 39075993667](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075993667) — success
- STEP 4 semantic validation CI: [run 39075993617](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075993617) — success
- STEP 5 outcome classification CI: [run 39075993672](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075993672) — success
- STEP 3A/3B/3C verification CI: [run 39075993553](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075993553) — success

All four focused workflows completed successfully on the final regression-test commit `80325047c8a3c49bad0499ce9dfeb93d578eeeec`.

## Scope and limits

This closes the identified read-before-preflight defect for semantic-validator output. It does not establish that the validator port is trustworthy, that its evidence is authentic, that production runtime reaches this transition exclusively, or that durable commit/reconciliation and protected-effect bypass closure are proven.

**STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.** Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED. No first deployment target or first constitutional ownership class is inferred by this fix.
