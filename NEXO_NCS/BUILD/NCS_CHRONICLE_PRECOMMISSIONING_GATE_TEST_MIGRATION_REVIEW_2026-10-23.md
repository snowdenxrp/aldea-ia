# NCS — Chronicle pre-commissioning gate: test migration and enforcement seam

Date: 2026-10-23
Status: **IMPLEMENTATION PREREQUISITE — NO RUNTIME CHANGE**

Parent specification:
`NCS_CHRONICLE_PRECOMMISSIONING_GATE_IMPLEMENTATION_SPEC_2026-10-23.md`

## New finding from current branch source

The gate specification requires a deny-only application-boundary block before any store, lock, initialization, owner opening, mission admission, or append side effect. A source review of the existing tests shows that this is not a one-line change with a narrow new regression test:

- `tests/nexo/chronicle-runtime.test.mjs` is 100,167 characters and contains 26 textual references to `runNexoChronicleAppend(`. The file also tests real persistence, admission, restart/replay, recovery, conflicts, and failure outcomes. These tests must be classified by what they are proving before the public use case is made deny-only.
- `tests/nexo/entrypoint.test.mjs` currently launches `chronicle-append`, expects exit status 0 and public `completed`, then verifies the Chronicle entry and continuity state were persisted. That expectation directly conflicts with a pre-commissioning deny gate.
- The same entrypoint suite also verifies read-only status/query behavior and rejection of generic commands. Those guarantees must remain intact.
- The current CLI wrapper reads bounded stdin before calling the application use case. This is not a store write, but it means the public result cannot claim the authority evaluator was run merely because a gate response is returned.

Source refs at review time:
- `src/nexo/application/chronicle-append.mjs` blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`
- `tests/nexo/chronicle-runtime.test.mjs` blob `d56f7525841d96a951cd4c20429be07e3f5a7052`
- `tests/nexo/entrypoint.test.mjs` blob `47d6d6fe0736938ef562eb23fc8397c78fa10c4c`
- `scripts/nexo-chronicle-session.mjs` blob `30a53de2f108aa255a1dfd61ce78c19788de160b`
- `src/nexo/application/index.mjs` blob `9a32b3d4955f196469bc72d9719863ba01fde81d`

## Required implementation sequence

1. **Inventory test intent, not just call counts.** Classify every application-use-case call as one of: public route acceptance, deny/no-write, read-only behavior, or lower-level persistence/recovery mechanics.
2. **Preserve the public safety contract.** The supported public mutating route must deny before side-effect-capable collaborators run while no verified authority/capability provider exists. The public response must preserve `authorization: "NOT_EVALUATED"`, `dispatchAttempted: false`, and `redispatchAuthorized: false`.
3. **Move mechanical coverage to the narrowest existing lower-level API that proves the same invariant.** Do not add a generic dependency-injection framework, an environment variable, a CLI bypass, or a fabricated authorized provider just to keep tests green. Any new module boundary must be reviewed for whether it is a true enforcement boundary or only code organization.
4. **Do not claim universal write prevention from an application wrapper alone.** Directly imported lower-level store APIs remain separate mutating surfaces. Their intended scope and protections must be explicitly enumerated; if they are part of the supported production surface, the gate design must cover them or the design must be revised before claiming zero-write safety.
5. **Update entrypoint expectations deliberately.** The CLI mutation test should expect blocked/nonzero/no files while read-only status/mission-query tests continue passing. Keep separate lower-level tests for store initialization/append and owner-backed settlement without implying they are authorized production calls.
6. **Run tests and inspect evidence.** Execute focused runtime and entrypoint tests, deterministic `npm test`, relevant CI, then fetch the exact tested source/test blobs and raw run/job results. A passing unit suite alone does not prove every mutating import path is gated.

## Architectural conclusion

The Master Architecture's critical-gate rule supports fail-closed behavior when authority is unknown. It does **not** make a wrapper-only gate proof that every possible local write path is blocked. The implementation must distinguish:
- policy decision: pre-commissioning Chronicle writes through the supported public use case are denied until a verified narrow capability exists;
- enforcement claim: every in-scope mutating route is actually blocked;
- verification evidence: exact tests and CI runs demonstrate that claim.

These are three separate claims. Do not merge them.

## Current status

- Runtime code changed: **NO**.
- Gate implemented: **NO**.
- Existing test suite classified/migrated: **NO**.
- Policy basis: Master Architecture critical unknown-gate rule; no verified positive authorization path is wired.
- M0: `INCOMPLETO`.
- Authorization: `NOT_EVALUATED`.
- Legitimate root: `PENDING/UNKNOWN`.
- Protected effects: `STOP`.
