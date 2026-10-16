# NCS M0.19 — Snapshot isolation composition boundary review
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: SOURCE REVIEW COMPLETE / NO NEW TEST RUN
STEP 7: OPEN / STOP / UNKNOWN

## Scope
Follow the M0.18 next action: distinguish the candidate data-copy contract from proof that the protected transition receives genuinely isolated mutable state and is composed into production runtime.

## Exact source pins reviewed
- `src/nexo/core/contracts.mjs`: blob `fc34733cc7597c7a9b660a41643aa9d0dd32d16f`
- `src/nexo/core/protected-transition.mjs`: blob `3028751d1db6b62321c4cd9ff13889ae33a30895`
- `src/nexo/runtime.js`: blob `1b4096bd6868fd9086ba6740f07d6a104a258651`
- `tests/nexo/conditional-commit-persist-state.test.mjs`: blob `9486d39eafc794d6a4ffe42ece4e288fbe2cb01d`

## Findings
1. `createCandidate()` uses `structuredClone(state)` before returning a candidate. This is a useful data-boundary guarantee when that constructor is actually used.
2. `executeProtectedTransition()` calls the injected `snapshotIsolator.isolate({ claim, state })` and rejects only an `undefined` result. It does not itself verify deep detachment or reject every possible shared nested reference.
3. The focused integration test injects `snapshotIsolator: { isolate: ({ state }) => structuredClone(state) }`. That proves the test composition uses a deep clone; it is not evidence that the production runtime constructs or injects the same port.
4. The reviewed `src/nexo/runtime.js` path executes through `executeNexoStep()` / `executeLuminaNexoStep()` and an effect adapter. The inspected path does not invoke `executeProtectedTransition()` before the adapter effect path. This is a bounded source trace, not an exhaustive proof about every route or deployment.
5. No concrete production SnapshotIsolator + protected-transition + final-effect-sink composition was demonstrated by this review. The default Core port remains `NOT_IMPLEMENTED` unless an implementation is injected.

## Conclusion
The candidate constructor can detach state, and the tests exercise a deep-cloning isolator. The general protected-transition API, however, trusts the injected isolator's semantics; source review does not establish a production composition or complete mediation. This is not a reason to add a shallow identity check or another wrapper: those would not prove full graph detachment and would not repair the missing production route.

## Next action
Keep the production protected-effect route stopped. Do not wire it by inference. The next architecture decision still requires a justified constitutional scope/legitimate authority basis and identification of the actual effect sink. Once that exists, the composition can be designed against the real mutable state graph and tested with alias-mutation probes. Until then, report production isolation and bypass closure as UNKNOWN / NOT DEMONSTRATED.

No source/test/workflow/device/key/Constitution changes were made in this review. No tests were run.

STEP 7 remains OPEN / STOP / UNKNOWN. Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED. Protected effects remain STOP.
