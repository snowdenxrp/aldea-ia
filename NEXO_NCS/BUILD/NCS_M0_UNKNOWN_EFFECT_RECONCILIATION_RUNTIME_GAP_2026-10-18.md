# NCS M0 — Unresolved effect cannot be reconciled through the runtime path

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: **FUNCTIONAL GAP CONFIRMED / PARTIAL CONTAINMENT IMPLEMENTED / RECOVERY STILL OPEN**

## Finding

The effect adapter has a conservative low-level contract: a handler exception returns `blocked/EFFECT_OUTCOME_UNKNOWN`, leaves the execution-journal entry `prepared`, and requires reconciliation before that same prepared key can be executed again. This is intentionally not treated as proof that the effect did not happen.

The integrated runtime does not currently carry that recovery contract through end to end:

1. `executeNexoStep()` calls `adapter.execute()` without exposing/forwarding a reconciliation callback.
2. It maps an adapter result with status `blocked` into a terminal blocked mission-step outcome and records that outcome in memory.
3. `beginNexoStep()` rejects terminal steps, so simply invoking normal step execution again cannot reconcile the blocked step.
4. `replanNexoMission()` accepts blocked missions, including one whose evidence code is `EFFECT_OUTCOME_UNKNOWN`; the successor mission generates a different `missionId:stepId` idempotency key. The adapter only checks a prepared journal entry for the requested key, so the new key can avoid the old unresolved entry's same-key reconciliation guard.

This is a source-path finding, not a claim of a live external-effect exploit or a completed dynamic reproduction. Existing adapter tests cover same-key reconciliation; they do not establish safe recovery across the integrated runtime and successor-mission boundary.

## Why it blocks M0

M0 needs a coherent observe → plan → execute → verify → persist/restart → recover/replan loop. If an effect's result is UNKNOWN, the runtime must not silently turn that uncertainty into an ordinary terminal block and then let a new mission identity act as a fresh operation. That could repeat an effect whose first outcome is still ambiguous.

## Existing design constraint — do not invent a patch

PG-009 recovery/restart/fencing research already distinguishes same-operation retry, same-mission replan, and a genuinely new semantic operation; a new ID must not evade effect deduplication. Do not repeat that research or add a guessed global lock/queue/retry wrapper.

Before code changes, the runtime contract must define:
- how an unresolved prepared effect is addressed and reconciled after restart;
- how its operation identity survives a replan when the semantic effect is still the same;
- what evidence permits closure as completed, absent, or still UNKNOWN;
- when a genuinely different operation may be admitted without bypassing unresolved causal dependencies.

Until that contract is implemented and regression-tested, mark this seam **STOP / UNKNOWN**. Do not activate protected effects. STEP 7 remains **OPEN / STOP / UNKNOWN**.

## Source anchors

- `src/nexo/effect-adapter.js`: prepared journal and same-key reconciliation; exception returns `EFFECT_OUTCOME_UNKNOWN` without finalizing the prepared journal.
- `src/nexo/runtime.js`: `executeNexoStep()` call boundary and outcome commit; no runtime reconciliation argument.
- `src/nexo/orchestrator.js`: blocked missions can be replanned and receive a new mission ID.
- `src/assistants/memory.js`: reconstruction restores terminal blocked outcomes from persisted attempts.
- Prior architecture anchor: `docs/nexo/PG-009_RECOVERY_RESTART_FENCING_2026-09-24.md` and the PG-009 notes in `docs/nexo/NEXO_INDEX.md`.

## Verification status

- Current source and existing tests were inspected on branch HEAD `804a621dcb06f626a498d23eb6609a8c7a90c1b9`.
- Existing focused CI PASS on source head `0a964abdc0a8f39465e484fd8f531a6a3d079caf`: runtime continuity [39085110783](https://github.com/snowdenxrp/aldea-ia/actions/runs/39085110783), STEP 4 [39085110788](https://github.com/snowdenxrp/aldea-ia/actions/runs/39085110788), STEP 5 [39085110864](https://github.com/snowdenxrp/aldea-ia/actions/runs/39085110864).
- Those runs do **not** prove this cross-mission unresolved-effect seam is safe; no new test was run for this specific path in this increment.
- No runtime code changed in this report-only increment.


## Partial containment implemented (2026-10-18)

A narrow guard now prevents `replanNexoMission()` from creating a successor when the prior mission's last evidence or any step result/failure carries `EFFECT_OUTCOME_UNKNOWN`, even if the caller supplies an explicit replan reason. A regression was added to `tests/nexo/orchestrator.test.mjs` for this bypass attempt.

This does not reconcile the prepared journal, does not establish durable operation identity across restart, and does not prevent all possible callers from constructing a mission through other APIs. The recovery contract remains OPEN / STOP / UNKNOWN; run the focused CI before treating this mitigation as verified.
