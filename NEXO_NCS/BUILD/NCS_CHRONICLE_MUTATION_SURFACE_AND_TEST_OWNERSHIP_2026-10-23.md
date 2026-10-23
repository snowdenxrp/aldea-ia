# NCS — Chronicle mutation surface and regression ownership inventory

Date: 2026-10-23
Status: **SOURCE-TRACED INVENTORY — NO RUNTIME CHANGE**

## Decision boundary

The supported stable application API in `src/nexo/application/index.mjs` exports one mutating use case, `runNexoChronicleAppend`, plus read-only status/mission queries and previews. `scripts/nexo-chronicle-session.mjs` re-exports that same use case; `scripts/nexo.mjs` routes the public `chronicle-append` command to that CLI wrapper. This gives a coherent gate location for the supported public mutating use case.

It does **not** establish that lower-level store modules are impossible to import or call. `src/nexo/core/chronicle-store.mjs` and `src/nexo/core/continuity-store.mjs` expose store factories to internal modules. A gate at the application API can claim only that the supported public Chronicle append route is blocked; it cannot claim every conceivable in-process filesystem write is blocked unless the scope is widened and every relevant mutating surface is audited.

## Entry-point ordering

`scripts/nexo-chronicle-session.mjs`:
1. Parses arguments and checks that stdin is a pipe.
2. Reads bounded stdin into memory.
3. Calls `runNexoChronicleAppend({...args, content})`.
4. Prints a sanitized JSON result and exits nonzero unless status is `completed`.

The stdin read is not a store mutation. The application use case must nevertheless deny before creating lock deadlines/stores, loading stores, initializing stores, opening the continuity owner, admitting a mission, or constructing/running the effect adapter. The gate must be located before those steps, not merely before `store.append`.

## Existing regression ownership map

### Keep at the public route, but change expectations where required
- CLI integration: currently expects a valid append to return `completed`, create continuity/Chronicle files, and then replay without a second dispatch. Under a pre-commissioning deny policy, replace that success expectation with blocked/nonzero/no-files and unchanged existing-file bytes.
- Invalid CLI arguments, oversized stdin, unsupported generic commands, and sanitized output: retain their relevant guarantees.
- Read-only status, mission-status, mission-plan and preview behavior: retain, and explicitly regression-test that the new gate does not disable them.

### Preserve as lower-level mechanics, without claiming production authorization
- Store schema validation, persistence, locks, bounded reads/writes, revisions, and recovery behavior belong with store APIs/tests.
- Owner-backed PREPARED/settlement/reconciliation, effect-adapter verification, crash cuts, and idempotent replay are protocol/mechanics coverage. Tests that directly exercise these internals should remain available without being used as evidence that the public route is authorized.
- Some scenarios in `tests/nexo/chronicle-runtime.test.mjs` specifically prove end-to-end orchestration through `runNexoChronicleAppend`, including concurrent append, replay, bootstrap and interrupted-operation recovery. These cannot simply be relabeled as lower-level tests: either redesign them to target the exact internal protocol boundary that they prove, or retain them as explicitly marked pre-commissioning protocol harness tests whose setup does not expose a public production bypass. The test seam must not introduce an environment flag or fake authorization object.

## Current source facts

- `src/nexo/application/index.mjs` comments explicitly describe Chronicle append as the only mutating use case and continuity queries as read-only.
- `scripts/nexo-chronicle-session.mjs` imports the stable application index and calls `runNexoChronicleAppend`; it does not directly orchestrate the owner runtime.
- `scripts/nexo.mjs` supports `chronicle-append` and routes it to the session wrapper; generic `execute`, `run`, `effect`, and `repair` are rejected.
- The current public mutation path can write local continuity and Chronicle while returning `authorization: "NOT_EVALUATED"`; successful persistence is not owner authorization.
- No verified positive bootstrap-write capability is currently wired.
- The deny gate is not implemented and no runtime file changed in this review.

## Required next steps before runtime edit

1. Explicitly settle the policy: deny the supported public Chronicle append route before commissioning unless a separately verified, narrow bootstrap-write capability is established.
2. Define a non-production protocol-test seam that does not become a callable public bypass, or restructure the tests to exercise lower-level contracts directly.
3. Add a first-operation deny regression that spies on store/owner/adapter boundaries and proves they are not invoked; use filesystem byte snapshots and absent-path checks for the integration route.
4. Update the CLI mutation expectations while preserving read-only route tests.
5. Enumerate the claim scope accurately: public supported append route vs all in-process local mutators.
6. Run focused tests, deterministic `npm test`, relevant CI; fetch exact tested commit, test blobs, and raw job logs.

## Status

- Gate implemented: **NO**
- Runtime changed: **NO**
- Existing test suite migrated: **NO**
- CI evidence for this inventory commit: pending until queried.
- M0: `INCOMPLETO`; authorization: `NOT_EVALUATED`; legitimate root: `PENDING/UNKNOWN`; protected effects: `STOP`.
