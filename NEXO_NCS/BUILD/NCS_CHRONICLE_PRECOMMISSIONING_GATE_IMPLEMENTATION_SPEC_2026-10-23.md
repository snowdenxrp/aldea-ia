# NCS — Chronicle pre-commissioning gate: implementation contract and test plan

Date: 2026-10-23
Status: **IMPLEMENTATION SPECIFICATION — NOT IMPLEMENTED**

Parent decision proposal: `NCS_CHRONICLE_PRECOMMISSIONING_WRITE_POLICY_DECISION_2026-10-23.md`.

## Source-traced execution order

Current `runNexoChronicleAppend(options)` in `src/nexo/application/chronicle-append.mjs` does the following after basic input validation:
1. Creates the lock deadline and store objects.
2. Calls `chronicleStore.loadCurrent()` and `continuityStore.loadCurrent()`.
3. Calls `openNexoContinuityOwner()`, which may initialize a missing continuity store when `allowEmptyInitialization` is true.
4. May initialize a missing Chronicle store when `initializeChronicle` is true.
5. May record a new mission to the continuity store.
6. Runs the owner-backed mission and eventually calls the Chronicle append handler.

The CLI wrapper `scripts/nexo-chronicle-session.mjs` reads stdin and then calls the application use case. The top-level `scripts/nexo.mjs` routes `chronicle-append` to that wrapper. The public application API in `src/nexo/application/index.mjs` exposes `runNexoChronicleAppend` as the only mutating use case.

**Important refinement:** placing a gate only immediately before `store.append()` is insufficient. The operation may mutate continuity or initialize either store earlier. A true zero-write deny gate must run at the start of the application use case, before store creation/use, lock activity, continuity-owner opening, mission admission, or any initialization. If the contract promises that a denied CLI request causes no filesystem effects, the wrapper's stdin read is not itself a filesystem mutation, but no store or lock operation may occur before the gate.

## Gate contract

The future gate must not accept a caller-supplied boolean such as `authorized: true`, a plain object claiming authority, a mission-admission result, a verifier map, a local file path, or a CLI flag as proof.

A permitted mutation requires a capability/decision whose provenance and authority are independently established by the eventual approved root-authority design. Since no such verified evaluator is currently wired, this specification defines no positive authorization path yet.

Until that design exists, the fail-closed implementation shape is:
- Run the gate as the first side-effect-relevant action inside `runNexoChronicleAppend`.
- Return a stable public blocked result with `authorization: "NOT_EVALUATED"`, `dispatchAttempted: false`, and `redispatchAuthorized: false`.
- Use a specific code such as `NEXO_CHRONICLE_PRECOMMISSIONING_WRITE_BLOCKED`; confirm naming against existing public error taxonomy before code change.
- Do not report `status: "completed"`, `AUTHORIZED`, or any implication that a write was attempted.
- Do not add a bypass flag for development/CLI. A bypass would be another authority path requiring a real contract.
- Leave read-only application query functions unchanged; verify their import/call graph does not trigger initialization.

This is a deny-only provisional implementation contract. A positive path must not be added until a legitimate root and an explicit narrow capability are verified.

## Required regression tests

Add focused tests to `tests/nexo/chronicle-runtime.test.mjs` and, where appropriate, `tests/nexo/entrypoint.test.mjs`:

1. Existing valid-looking Chronicle append is blocked while the gate has no verified authority provider.
2. Both initialization flags set to true still result in a block before either file or lock directory is created.
3. Missing continuity and Chronicle paths remain absent after denial.
4. Existing files are byte-for-byte unchanged after denial.
5. Spy/injected store constructors, `loadCurrent`, `initialize`, owner opening, mission admission, adapter handler and append are never called after denial. Prefer a small injectable dependency seam only if it is already compatible with the application architecture; do not add broad generic DI solely for tests.
6. Public response retains `authorization: "NOT_EVALUATED"`, `dispatchAttempted: false`, `redispatchAuthorized: false`, and the exact blocked code.
7. CLI still rejects generic `execute`, `run`, `effect`, and `repair` commands; `chronicle-append` returns a blocked result and nonzero process exit without file creation.
8. Read-only status and mission-query tests continue passing.
9. Ensure no test assumes that `authorization: NOT_EVALUATED` means the authority gate was actually evaluated and denied; it means authorization remains unevaluated.
10. No test may assert that all possible filesystem effects are impossible unless it observes the entire relevant entrypoint/application path.

## CI / acceptance criteria

- Run focused Chronicle runtime and entrypoint tests.
- Run deterministic `npm test`.
- Run the repository's relevant Chronicle persistence/admission CI workflow(s).
- Read back the exact code/test files at the tested commit SHA.
- Verify run SHA, workflow/job conclusion, and raw logs. No inherited CI status from an ancestor commit.
- Update STATUS only with observed results.

## Scope and non-goals

- No claim that this gate establishes legitimate owner identity.
- No claim that Proxy traps or the broader Core live-object trust boundary are solved.
- No modification to `executeProtectedTransition`, the generic runtime, reconciliation, or Lúmina.
- No external protected effects are enabled.
- Do not describe this plan as a runtime block until code and tests actually exist and are verified.

## Current state

- Runtime change: **none**.
- Gate implementation: **pending architectural decision / explicit continuation step**.
- M0: `INCOMPLETO`.
- Authorization: `NOT_EVALUATED`.
- Legitimate root: `PENDING/UNKNOWN`.
- Protected effects: `STOP`.
