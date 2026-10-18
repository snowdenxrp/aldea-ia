# NCS M0 — Cross-store revision-fence analysis

Date: 2026-10-18

## Purpose

Record the concrete boundary found while reviewing the current read-only mission-goal verifier and the existing persistence implementations. This is an architecture checkpoint, not a claim that M0 is complete.

## Existing facts from code

- Lúmina environment persistence is in `scripts/simulate.mjs` via `persistState()`. It uses a lock derived from the environment file path, checks `expectedRevision` when supplied, and atomically replaces `world-state.json` with a temporary file. `loadStateStrict()` reads and validates `stateRevision`, but does not retain a lock after returning.
- Nexo continuity persistence is in `src/nexo/core/continuity-store.mjs`. `commitIfCurrent()` locks the continuity file, checks `storeRevision`, and atomically replaces that file. Its own documentation correctly limits this revision to cooperating continuity writers.
- The mission-goal verifier in `scripts/nexo-repair-mission-verification.mjs` reads a continuity snapshot, then loads one strict environment snapshot and checks all repair invariants. It is read-only and returns `goal_observed`, not mission completion.
- The repair settlement helper in `scripts/nexo-repair-settlement.mjs` reads the environment, then commits `settled_observed` through the Nexo continuity CAS. The two files use independent locks.

## Race boundary

A successful read of environment revision R followed by a successful Nexo continuity CAS does not prove the environment remained at R until the continuity commit. A separate writer can persist revision R+1 between those operations. The Nexo CAS only serializes Nexo continuity writers; it cannot fence `world-state.json`.

Similarly, a read-only verifier proves the goal held in the snapshot it loaded, not that the goal still holds after the function returns. That is acceptable for a diagnostic observation, but insufficient as authorization for a protected transition or as a durable terminal mission-completion claim.

## Decision for now

Do not add a durable `goal_observed` transition, mark a mission completed, unblock/replan a mission, or wire this verifier into protected runtime execution. Keep current verification read-only and fail closed where state is unknown.

Do not solve this by adding a generic transaction wrapper, an undocumented second revision, or a test-only callback that does not correspond to a real persistence seam.

## Architectural options to evaluate next

1. Keep observation explicitly non-authoritative and ephemeral; no cross-store atomicity is claimed. This is the smallest valid choice if no consumer needs durable goal status.
2. If durable goal status is required, define a domain-specific persistence protocol with a clear writer boundary for the environment and continuity, including lock ownership, revision validation, crash recovery, and invalidation behavior. It must cover every writer of the environment, not only Nexo repair helpers.
3. If the project does not control every environment writer, treat cross-store durable terminal status as unavailable; retain a re-check-on-use contract instead of pretending to fence it.

No option is selected by this checkpoint. Choose only after tracing every writer and caller.

## Validation evidence

- Latest regression test: https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a
- Exact-head CI: NOT VERIFIED. The available status endpoint returned no statuses, and the workflow-run lookup returned no runs for the test commit. This is missing evidence, not PASS or FAIL.
- Exact-coverage hardening: https://github.com/snowdenxrp/aldea-ia/commit/b74cc37edfad915fc8cc5deaf9269c6f15b28872

## Project boundary

M0 incomplete. Protected effects STOP. STEP 7 OPEN / STOP / UNKNOWN. Nexo and Lúmina remain separate; no runtime cutover or protected-effect authorization is claimed.
