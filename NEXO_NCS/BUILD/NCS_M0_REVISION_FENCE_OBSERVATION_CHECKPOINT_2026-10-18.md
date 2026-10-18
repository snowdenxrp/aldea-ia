# NCS M0 — Environment revision fence observation checkpoint

Date: 2026-10-18  
Code/test commit: [`db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`](https://github.com/snowdenxrp/aldea-ia/commit/db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f)

## Change

Added `comparePersistedRepairRevision()` to `src/nexo/adapters/persisted-repair-observation.mjs`. It compares a previously bound environment revision against a newly loaded snapshot revision and returns only diagnostic classifications:

- `current`: both valid revisions match.
- `stale`: both valid revisions exist and differ.
- `unknown`: the PREPARED environment revision is absent/invalid, or the current snapshot revision is invalid.

The important behavior is that omitted `expectedStateRevision` returns `PREPARED_ENVIRONMENT_REVISION_NOT_BOUND`. The code does not substitute the latest revision for the missing historical revision. Tests cover matching, stale, missing-binding, and invalid-current-revision cases.

## Exact-head CI

At exact commit `db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`, all three workflows completed successfully:

- [Mission admission / restart continuity — 39132287649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287649)
- [STEP 5 outcome classification — 39132287652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287652)
- [STEP 4 semantic validation — 39132287648](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287648)

The mission workflow explicitly ran and passed `node tests/nexo/simulation-restart-persistence.test.mjs`.

## Boundary / finding

This does **not** solve the race by itself. The current PREPARED schema has no authoritative `environmentStateRevision` field, and comparing a revision before a later Nexo continuity commit is not an atomic fence against another environment writer. The diagnostic function must not be treated as settlement proof or authorization.

Before adding any settlement method, design a bounded protocol against the actual two-store architecture:
1. Bind the observed environment revision into PREPARED before dispatch (with migration/schema implications explicitly reviewed).
2. Make the environment adapter reject dispatch if its current persisted revision no longer equals the prepared revision.
3. During recovery, load the strict persisted snapshot and classify the repair invariant against the recorded revision.
4. Recheck the environment revision at the settlement boundary; if it changed, preserve PREPARED and return UNKNOWN/stale.
5. Use the existing continuity store's compare-and-commit revision guard for terminal settlement; conflicts preserve the unresolved journal.
6. Add crash-cut tests for each boundary. A revision comparison without a lock/conditional write spanning the relevant boundary is detection, not atomic exclusion.

No terminal settlement API, generic transaction wrapper, new queue, or runtime cutover was added. Non-idempotent actions remain UNKNOWN and must not be redispatched. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
