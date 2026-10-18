# NCS M0 — Strict persisted-state load for safety-sensitive recovery

Date: 2026-10-18
Status: IMPLEMENTED; EXACT-HEAD CI PASS

## Problem

`scripts/simulate.mjs::loadState()` is intentionally forgiving for ordinary simulation startup: read errors, malformed JSON and invalid/legacy shapes can fall back to a fresh default world with `stateRevision: 0`. That is useful for a simulation boot path, but it is not acceptable evidence that the loaded state is the current canonical state for a safety-sensitive Nexo recovery or effect-owner decision.

P112's existing prepared-checkpoint audit explicitly identifies fallback provenance as a separate gate. This change addresses only that gate; it does not claim a Nexo canonical store or an execution owner now exists.

## Change

Added `loadStateStrict(statePath)` alongside the existing `loadState()` and moved the Nexo-specific continuity shape checks into `src/nexo/core/continuity-contract.mjs` (`assertNexoContinuityMemoryShape`). This keeps Nexo's continuity contract in Nexo core instead of embedding the contract logic inside the Lúmina simulation script.

- `NEXO_STATE_NOT_FOUND` when the file does not exist.
- `NEXO_STATE_READ_FAILED` for other read failures.
- `NEXO_STATE_INVALID_JSON` for malformed JSON.
- `NEXO_STATE_SCHEMA_INVALID` for an unsupported top-level schema/shape.
- `NEXO_STATE_REVISION_UNKNOWN` if the persisted revision is missing, non-integer, unsafe or negative.
- `NEXO_MEMORY_SCHEMA_UNKNOWN` if non-null `nexoMemory` does not contain the required mission/attempt/do-not-repeat/execution/effect-journal collections.
- `NEXO_RECOVERY_CONTEXT_MALFORMED`, `NEXO_RECOVERY_CONTEXT_MISSING`, or `NEXO_RECOVERY_CONTEXT_MISMATCH` when a `prepared` journal entry lacks its mission/step/action context, cannot find the matching persisted step, or conflicts with that step's action/target. This prevents an orphaned prepared entry from being treated as safely reconstructable.
- Applies existing compatibility normalization only after the persisted snapshot shape, revision, and Nexo recovery-memory shape have passed validation.
- Does not silently create a default snapshot or assign revision zero.

The original `loadState()` behavior remains unchanged for existing simulation startup callers.

## Regression coverage

Extended `tests/nexo/simulation-restart-persistence.test.mjs` to assert strict rejection of:
- missing snapshot;
- invalid JSON;
- missing revision;
- malformed world schema.

It also asserts that a valid persisted snapshot loads with its actual revision and schema version.

## Evidence

- Source commits: `c527c252edd3d44566f567ebf06745d81c437339` (strict snapshot shape/revision), `02c00c2a67ec714803c3d06491e5ebdeb5c8b174` (memory shape), `64d170c9c29fb201dcbcde934daf17c96decb1ee` (prepared context validation).
- Final code+test head: `41c591a0845608418de2450525e8a9cf7ff6c3a9`.
- Exact-head mission/restart CI PASS [39097823559](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097823559), including both `simulation-restart-persistence.test.mjs` and `continuity-contract.test.mjs`.
- STEP 4 and STEP 5 CI PASS at code-identical head `5a00e917c02b650286cb9d379d3086c3d8001e80`: [STEP 4 39097816995](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097816995), [STEP 5 39097816881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097816881). The subsequent `41c...` commit only adds the CI workflow step/path and does not change the tested source.
- [Source](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/scripts/simulate.mjs)
- [Regression test](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/simulation-restart-persistence.test.mjs)

## Test-run correction

An intermediate CI run failed in the existing persistence-race test because the two worker processes were not synchronized after loading the initial revision; one worker could load after the other's valid commit, so the test's expected one-conflict assertion was nondeterministic. The test now uses a ready/release barrier: both workers report the revision they loaded, and the parent releases them only after both are ready. At exact source+test head `0b55842258c9c9457837f5bc801f94a5c31b425c`, the race test and strict-load tests passed in [mission/restart CI](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097716822).

## Limits

- This strict loader is a safer read boundary for the existing simulation snapshot; it does not turn Lúmina into Nexo, and does not make `world-state.json` Nexo's canonical continuity or authority store.
- A valid parse/schema/revision proves only that the snapshot is structurally loadable, not that its history, authority, provenance, revocation state or external effects are trustworthy.
- No protected effect is authorized by this change.
- M0 remains incomplete; prepared external effects remain UNKNOWN and must not be redispatched without operation-specific reconciliation. STEP 7 remains OPEN / STOP / UNKNOWN.

## Next

1. Confirm exact-head CI and fix any failures.
2. Define which owner is permitted to consume `loadStateStrict()` and how snapshot provenance is established; do not equate structural validity with current authority.
3. Continue the bounded local simulation-owner analysis separately from protected external effects, preserving the Nexo/Lúmina boundary.
