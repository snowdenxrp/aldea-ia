# NCS M0 — Goal-observation consumer decision

Date: 2026-10-18
Branch: `ncs-clean-architecture`

## Decision

**Do not build a cross-store revision fence for durable `goal_observed` at this stage.** Keep `verifyRepairMissionGoalFromPersistedState()` read-only and treat its result as an ephemeral diagnostic observation. A consumer that needs the information must re-read current persisted state when it uses the observation.

This closes the narrow consumer question for the current M0 code path: the verifier is exposed by `scripts/nexo-repair-mission-verification.mjs`, but the inspected production runtime in `src/nexo/runtime.js` does not call it. The current runtime instead imports legacy mission/outcome/execution/reconstruction functions from `src/assistants/memory.js`. The standalone verifier therefore has no demonstrated production consumer that requires a durable terminal goal-observation record.

This is a bounded decision about the current consumer, not a claim that no future Nexo feature will ever need durable goal status.

## Evidence boundary

- The verifier reads the Nexo continuity snapshot and then strict-loads one Lúmina environment snapshot. It returns `goal_observed`, `missionCompleted: false`, and `causalAttribution: "not_claimed"`; it does not write continuity.
- `src/nexo/core/continuity-store.mjs` fences cooperating writers of the Nexo continuity file only.
- `scripts/simulate.mjs` persists Lúmina environment state using a separate file lock and environment `stateRevision`.
- These primitives do not make a cross-file atomic transaction. The environment may change after observation; the diagnostic must not be reused as current authorization.
- Do not add a durable `goal_observed` transition, mark a mission completed, unblock/replan, or authorize protected execution from this observation.

## What this decision does NOT solve

M0's main migration remains incomplete. `src/nexo/runtime.js` still imports `recordNexoOutcome`, `recordNexoExecution`, `recordNexoPlan`, and `reconstructNexoMission` from `src/assistants/memory.js`. The independent Nexo owner can admit missions and persist PREPARED, but it does not yet provide a fully verified terminal effect-settlement contract. Do not cut over effect execution by merely replacing function names or trusting caller-provided `verified: true`.

## Next implementation task

Continue the runtime migration—not a new persistence research cycle—with a narrowly scoped owner-backed runtime contract:

1. Preserve the current legacy path while specifying the exact API seam between `src/nexo/runtime.js` and `createNexoContinuityOwner()`.
2. Separate durable mission/execution lineage recording from effect-journal settlement. A result record must never silently settle PREPARED.
3. Do not accept caller-provided evidence labels as independent authentication. Completion remains blocked unless the required verifier can establish the operation-specific result.
4. Keep Lúmina environment persistence conditional on its own revision. If a crash or conflict leaves the cross-file result ambiguous, retain UNKNOWN/PREPARED and do not redispatch.
5. Add restart/crash-cut tests against the actual owner/store API before runtime cutover; keep legacy memory available until rollback and migration tests pass.

Reuse existing P112 audits and current migration tests. Do not repeat broad writer audits, invent a generic transaction wrapper, add new global IDs/queues/retries/tombstones, or claim device migration.

## Current labels

M0 incomplete. Protected effects STOP. Unresolved PREPARED UNKNOWN. STEP 7 OPEN / STOP / UNKNOWN. Nexo and Lúmina remain separate.

## Runtime seam revalidated against current branch HEAD (2026-10-18)

This reuses the closed P112/AB104 execution-owner findings; it is not a new historical audit.

- `scripts/assistants.mjs` already opens the standalone Nexo owner and commits a mission through `owner.recordMission({ expectedRevision, mission })`. It does not call `executeNexoStep()` or `executeLuminaNexoStep()`.
- `scripts/simulate.mjs` opens the owner for one-time legacy continuity migration/status reporting, then advances and persists the Lúmina simulation. It does not execute Nexo missions.
- `src/nexo/runtime.js` remains a legacy-memory execution primitive. Its outcome path calls `recordNexoPlan`, `recordNexoExecution`, `recordNexoOutcome`, and `reconstructNexoMission` from `src/assistants/memory.js`; this file is not the production execution owner today.
- `persistState()` intentionally serializes only the Lúmina environment fields and excludes `nexoMemory`; the restart regression asserts both that `world-state.json` excludes Nexo operational continuity and that the reconstructed simulation has no `nexoMemory`. Preserve this separation.

### Consequence for implementation

Do **not** describe the next change as a simple replacement of imports in `runtime.js`. There is no demonstrated production caller to migrate. The missing unit is a real Nexo-owned execution lifecycle/session that can:
1. load/reconstruct from the canonical owner and carry the returned `storeRevision`;
2. persist the exact mission before any eligible dispatch;
3. require durable PREPARED before dispatch and refuse replay of unresolved obligations;
4. record execution lineage/outcome with CAS while keeping outcome claims separate from journal settlement;
5. stop on ambiguous environment/continuity writes and recover by rereading both stores;
6. preserve legacy behavior until restart/crash-cut tests exercise the new owner-backed entry point.

The current APIs are necessary primitives, not yet that complete lifecycle. In particular, `recordOutcome()` cannot authenticate a caller's evidence source, and `settled_observed` is not terminal mission completion. Start with a test-first session contract for the smallest already-supported repair-only path; do not dispatch non-idempotent or protected effects.

**Gate remains closed:** M0 incomplete; protected effects STOP; unresolved PREPARED/settled_observed UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.

