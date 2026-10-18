# NCS M0 — Effect reconciliation and terminal settlement contract

Date: 2026-10-18
Status: DESIGN BOUNDARY; IMPLEMENTATION NOT AUTHORIZED UNTIL TRUSTED VERIFIER EXISTS

## Purpose

Define the minimum safe contract for resolving a durable `effectJournal.status === "prepared"` entry without treating an adapter response, caller flag, or continuity record as proof that the external effect occurred.

This document narrows the existing migration work. It does not reopen earlier architecture audits and does not claim runtime cutover, real-device migration, or protected execution.

## Facts verified in the current source

- `src/nexo/core/continuity-owner.mjs` can durably record a mission and PREPARED operation through the standalone Nexo store.
- Existing PREPARED returns `NEXO_EFFECT_OUTCOME_UNKNOWN`; `reconcilePrepared()` intentionally returns blocked with `verified: false`.
- `src/nexo/effect-adapter.js` runs a postcondition after a handler during the same execution attempt. If a handler throws, it returns an unknown outcome and leaves the PREPARED obligation unresolved.
- The adapter's caller-provided `request.reconcile` is explicitly not trusted and is not invoked.
- `src/nexo/runtime.js` still imports mission/execution/outcome operations from `src/assistants/memory.js`; it is not yet wired end-to-end to the standalone owner.
- The simulation adapter can inspect the in-memory Lúmina state. That can support a same-process simulation postcondition, but is not, by itself, independent crash recovery evidence.
- Nexo continuity and Lúmina environment state are stored separately. A write to one file and a write to the other are not one atomic commit.

## Required terminal verifier contract

A future verifier must be bound to a specific operation type by the owning integration, not selected ad hoc by the mission/request caller. It must receive the persisted operation identity and read the authoritative postcondition source; it must not infer truth solely from the adapter's cached result or from fields the caller supplies.

Verifier input must be bound to:
- persisted `idempotencyKey`, `missionId`, `stepId`, `action`, and `target`;
- the operation-specific postcondition definition/version;
- the source actually queried and its current observation/version, where the source supports versions;
- evidence of freshness and any required dependency/fence checks.

Verifier output is a closed classification, not a boolean:
- `effect_confirmed`: operation-specific postcondition is independently observed as satisfied;
- `effect_absent`: operation-specific evidence establishes the effect did not occur and retry is safe;
- `unknown`: source unavailable, stale, contradictory, incomplete, or incapable of distinguishing the crash window.

Only `effect_confirmed` or `effect_absent` may be candidates for terminal settlement, and only when the operation-specific policy defines what terminal status follows. `unknown` leaves PREPARED unresolved and blocks redispatch, completion claims, and successor replanning.

A non-empty evidence `source` label, `verified: true`, a handler return value, a store revision, or a caller-supplied callback is not independent verification. A verifier result must be produced by the trusted integration that owns the operation-specific read path. A generic owner method must not accept an arbitrary caller-supplied verdict and convert it to a terminal record.

## Crash-cut requirements

| Crash / failure point | Required recovery interpretation |
|---|---|
| Before PREPARED is durably committed | The adapter must not be dispatched. |
| After PREPARED commit, before dispatch | PREPARED remains unresolved until the integration proves the effect absent or reconciles it. No automatic redispatch. |
| During handler; handler throws or process dies | Effect may or may not have occurred. Preserve UNKNOWN. |
| Effect occurs; environment persistence fails/conflicts | Do not claim terminal success. Reconcile against the authoritative environment. |
| Environment persistence succeeds; Nexo terminal commit is absent or response is lost | The environment may contain the effect while Nexo still says PREPARED. Reconcile before any replay or replan. |
| Verifier source is stale/unavailable/contradictory | Keep PREPARED; block. |
| PREPARED identity does not match mission/step/action/target | Fail closed; do not dispatch, settle, or replan around it. |

## Required runtime ordering before cutover

1. Load the canonical Nexo continuity store; missing/corrupt state remains an explicit failure/UNKNOWN.
2. Load the current Lúmina environment state and its real persistence revision.
3. Reconstruct the exact mission and perform fresh admission against the current environment; a stored plan is not permission.
4. Commit PREPARED to the standalone Nexo store before dispatch.
5. Dispatch only after the relevant admission and persistence boundaries have succeeded.
6. Persist the environment change through its own owner/revision protocol.
7. Verify/reconcile the operation using the operation-specific read path.
8. Commit a terminal Nexo outcome only from that verifier contract.
9. If the two stores disagree or either commit outcome is ambiguous, preserve UNKNOWN. Do not claim cross-file atomicity.

This ordering is a contract to validate against the actual call path, not permission to add a generic transaction wrapper. If current APIs cannot make a step explicit, stop at that boundary.

## Explicit non-goals

- No automatic retries, queues, tombstones, generic transaction wrapper, global revision, new authority epoch, or new identity scheme.
- No claim that the local file store provides fsync/power-loss durability, anti-rollback, or distributed linearizability.
- No protected external execution and no release of STEP 7 STOP.
- No claim that CI temporary-directory tests migrated user/device data.
- No deletion of legacy memory fields/functions until runtime cutover, migration tests, and rollback/diagnostics are proven.

## Acceptance tests required before implementation is considered safe

- Each crash cut above is exercised with a test that proves whether the handler ran and what survives restart.
- Caller-supplied `verified: true`, `source` labels, and arbitrary reconcile callbacks cannot terminalize PREPARED.
- The operation-specific verifier reads the authoritative state source and binds its observation to the exact persisted operation identity.
- `unknown` keeps the journal PREPARED and blocks dispatch and successor replan.
- Confirmed absence permits a retry only if the operation-specific policy explicitly proves retry safety.
- Confirmed effect permits terminal completion only with fresh, operation-specific evidence.
- Tests cover environment commit success followed by lost/failed Nexo terminal commit.
- Runtime recovery reads the standalone Nexo store and does not rely on Nexo fields in `world-state.json` or call legacy memory reconstruction.

## Current decision

**Do not cut over runtime effect/outcome writes yet.** First implement the operation-specific verifier and terminal-settlement boundary against an actual authoritative state owner. Until then: M0 incomplete; unresolved PREPARED = UNKNOWN; protected effects = STOP; STEP 7 = OPEN / STOP / UNKNOWN.
