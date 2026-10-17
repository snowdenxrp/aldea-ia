# NCS M0.64 — Detach and freeze outcome-classifier results
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Final regression-test commit: `60337cdc7cfa0078932b0cce7450e10af1c82f75`

## Concrete defect

The protected-transition helper `classify()` validated that an outcome-classifier port returned a supported `kind` plus array-valued `reasons` and `evidence`, but then returned that port-owned object directly. A conforming but mutable object could therefore escape the core boundary, and a caller or the adapter could mutate the reported terminal result after classification.

## Correction

`src/nexo/core/protected-transition.mjs` now reconstructs the validated result using the canonical `createOutcome()` contract factory. The returned outcome, its arrays, and nested evidence are detached and recursively frozen according to the existing contract.

## Regression

Added a test that supplies a mutable classifier result with nested evidence, executes a transition, mutates the classifier-owned source after return, and verifies the returned result remains unchanged and frozen.

The first CI attempt failed because the new test asserted the validator's reason even though its deliberately adversarial classifier ignored the input and returned its own reason. The test expectation was corrected to assert the classifier's original content remains detached. The final regression commit below passes all four focused workflows.

## Focused CI evidence — all success on final commit

- [M0 non-authority core contracts — run 39076742989](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076742989) — success
- [STEP 4 semantic validation — run 39076742913](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076742913) — success
- [STEP 5 outcome classification — run 39076742921](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076742921) — success
- [STEP 3A/3B/3C verification — run 39076742904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076742904) — success

These are focused workflow results, not a claim that the full repository test suite ran.

## Limits

This closes a mutability leak at the outcome-classifier boundary. It does not authenticate the classifier or authority gate, establish trusted port composition, prove runtime-to-protected-effect reachability, or close bypasses. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected activation remains blocked.
