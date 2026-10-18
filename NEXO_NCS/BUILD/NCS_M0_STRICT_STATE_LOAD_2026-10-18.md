# NCS M0 — Strict persisted-state load for safety-sensitive recovery

Date: 2026-10-18
Status: IMPLEMENTED; EXACT-HEAD CI PASS

## Problem

`scripts/simulate.mjs::loadState()` is intentionally forgiving for ordinary simulation startup: read errors, malformed JSON and invalid/legacy shapes can fall back to a fresh default world with `stateRevision: 0`. That is useful for a simulation boot path, but it is not acceptable evidence that the loaded state is the current canonical state for a safety-sensitive Nexo recovery or effect-owner decision.

P112's existing prepared-checkpoint audit explicitly identifies fallback provenance as a separate gate. This change addresses only that gate; it does not claim a Nexo canonical store or an execution owner now exists.

## Change

Added `loadStateStrict(statePath)` alongside the existing `loadState()`:

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
- Final exact source+test head: `0b55842258c9c9457837f5bc801f94a5c31b425c`.
- Exact-head CI PASS: mission/restart [39097716822](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097716822) (includes `simulation-restart-persistence.test.mjs`), STEP 4 [39097716845](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097716845), STEP 5 [39097716821](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097716821).
- [Source](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/scripts/simulate.mjs)
- [Regression test](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/simulation-restart-persistence.test.mjs)

## Limits

- This strict loader is a safer read boundary for the existing simulation snapshot; it does not turn Lúmina into Nexo, and does not make `world-state.json` Nexo's canonical continuity or authority store.
- A valid parse/schema/revision proves only that the snapshot is structurally loadable, not that its history, authority, provenance, revocation state or external effects are trustworthy.
- No protected effect is authorized by this change.
- M0 remains incomplete; prepared external effects remain UNKNOWN and must not be redispatched without operation-specific reconciliation. STEP 7 remains OPEN / STOP / UNKNOWN.

## Next

1. Confirm exact-head CI and fix any failures.
2. Define which owner is permitted to consume `loadStateStrict()` and how snapshot provenance is established; do not equate structural validity with current authority.
3. Continue the bounded local simulation-owner analysis separately from protected external effects, preserving the Nexo/Lúmina boundary.
