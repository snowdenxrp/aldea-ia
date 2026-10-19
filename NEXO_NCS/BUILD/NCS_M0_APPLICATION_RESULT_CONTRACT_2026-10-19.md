# NCS — M0 Application Result Contract
Date: 2026-10-19
Validated code/test SHA: 7148263da84eb37e80fc0fcfdb5957e299674a10

## Scope

This contract describes the public result shape for the owner-backed runtime used by the one enabled mutating application use case, `chronicle_append`. It does not authorize additional actions, make the legacy runtime canonical, or prove OS-level/power-loss durability.

## Status meanings

- `completed`: the Chronicle append invariant and terminal outcome are confirmed. `terminalOutcomeRecorded=true`, `journalSettled=true`, `redispatchAuthorized=false`. `dispatchAttempted` can be false on recovery/replay.
- `blocked`: a known input, capability, invariant, or contract gate prevented the requested next step. Read the `code`; do not assume that a prior dispatch never happened if `dispatchAttempted=true`.
- `conflict`: a known compare-and-swap/revision conflict occurred. It is not a write-unknown result. No automatic retry is performed; the caller must reload canonical state and decide explicitly.
- `unknown`: the effect or persistence result may have occurred but cannot be confirmed. Do not redispatch. Re-read canonical continuity and perform only the action-specific recovery path.
- `observed`: an observation was returned but the terminal settlement/outcome contract is not confirmed. It is non-terminal and does not authorize redispatch.
- `invalid`: the owner-backed runtime call context itself is invalid.

## Required result fields

| Field | Type | Meaning |
|---|---|---|
| `status` | string | One of the statuses above |
| `code` | string when supplied | Stable machine-readable reason |
| `dispatchAttempted` | boolean | Whether this invocation attempted adapter dispatch |
| `preparedCommitted` | boolean or `UNKNOWN` | Whether PREPARED commit is confirmed; UNKNOWN means the commit may have persisted before response loss |
| `lineageCommitted` | boolean or `UNKNOWN` | Whether execution lineage is confirmed |
| `journalSettled` | boolean or `UNKNOWN` | Whether the journal settlement is confirmed |
| `terminalOutcomeRecorded` | boolean or `UNKNOWN` | Whether the terminal outcome is confirmed |
| `redispatchAuthorized` | boolean | Currently always false in this vertical |

Missing boolean state fields are normalized to false only where no write was attempted and the state is known not to have been committed. If a commit response may have been lost after persistence, the corresponding field MUST remain `UNKNOWN`; it must not be flattened to false.

## Safety invariants

1. PREPARED must be explicitly confirmed before dispatch.
2. PREPARED conflict or UNKNOWN must not dispatch.
3. Adapter exceptions are UNKNOWN because the effect may have occurred before the exception.
4. A known lineage CAS conflict leaves the operation unresolved; the result remains UNKNOWN at the operation level, with `lineageCommitted=false`.
5. Reconciliation response loss preserves `journalSettled=UNKNOWN`; it never authorizes redispatch.
6. A known terminal-outcome CAS conflict after Chronicle settlement returns `conflict`, `journalSettled=true`, and `terminalOutcomeRecorded=false`. A later replay records the outcome only, without another Chronicle append.
7. A terminal-outcome commit exception/response loss returns `terminalOutcomeRecorded=UNKNOWN`; a later replay inspects the canonical journal and outcome without dispatching the append again.
8. Raw adapter exception messages are not exposed in application results. CLI output is allowlisted and never prints Chronicle content.
9. The caller owns retry policy. No automatic retry loop, queue, or retry authorization is implied by `conflict`, `blocked`, or `unknown`.

## Proof references

- PREPARED conflict, unknown PREPARED commit, adapter exception, lineage conflict, reconciliation response loss, outcome conflict and outcome response loss are exercised in `tests/nexo/chronicle-runtime.test.mjs`.
- Process restart/replay, private-content non-disclosure, mission reconstruction and PREPARED preservation are exercised in `tests/nexo/entrypoint.test.mjs`.
- CI SUCCESS on SHA `7148263da84eb37e80fc0fcfdb5957e299674a10`:
  - [Chronicle/entrypoint — 39181627883](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627883)
  - [Continuity/restart — 39181627998](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627998)
  - [Semantic validation — 39181627889](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627889)
  - [Outcome/restart — 39181627894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627894)

## Non-goals / current stop

- No generic effect settlement.
- No second mutating action.
- No default runtime cutover.
- No authority or ownership inferred from a continuity store.
- No claim of fsync/power-loss durability or cross-store transaction atomicity.
- Nexo remains independent of Lúmina; protected effects remain STOP.
- M0 remains INCOMPLETE.


## Public application API surface — validated update (2026-10-19)

- Import from `src/nexo/application/index.mjs`; the stable exports are exactly `runNexoChronicleAppend`, `loadNexoContinuityStatus`, and `loadNexoMissionStatus`.
- The CLI wrappers and export-list regression consume this surface. CI SUCCESS on SHA `71a01beb06d9a9d01e1cd459fe123588e1dd553b`: [39181785728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785728), [39181785739](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785739), [39181785834](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785834).


## Mission-admission response loss — guard added (CI pending)

- `runNexoChronicleAppend()` now catches an exception around `owner.recordMission()` and returns `status=unknown`, `missionAdmissionCommitted=UNKNOWN`, `dispatchAttempted=false`, and `redispatchAuthorized=false`.
- Rationale: `recordMission()` delegates to a store commit; an exception may mean the commit did not happen or happened before the response was lost. The caller must not be told admission definitely failed, and no effect dispatch may follow that uncertain response.
- Regression: `tests/nexo/chronicle-runtime.test.mjs` injects a store-response-loss error, asserts tri-state uncertainty and no dispatch/retry authorization, and confirms the raw error message is not exposed.
- Code/test SHA: `e4562b6edb0ce4c3f0df1ccaae94cc63edf33d1f`. CI has not yet been observed for this SHA; status remains PENDING/UNKNOWN until the matching workflow runs complete.


## Mission-admission UNKNOWN normalization — validated update (2026-10-18 local)

- The safe admission helper now normalizes both thrown store errors and returned `status=unknown` results to `missionAdmissionCommitted=UNKNOWN`, `dispatchAttempted=false`, and `redispatchAuthorized=false`. A returned UNKNOWN cannot lose its tri-state marker merely because it did not throw.
- Regression covers both exception-after-possible-commit and an explicit UNKNOWN return. Raw exception text remains hidden.
- Validated code/test SHA: `872a67b3e6512fce134507f82052a5cbc37d495f`. CI SUCCESS: [Chronicle 39187025194](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025194), [continuity/restart 39187025178](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025178), [STEP 4 39187025188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025188), [STEP 5 39187025187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025187), all SUCCESS.
- Replay policy remains explicit: no automatic retry or dispatch after UNKNOWN; next call reloads canonical continuity. M0 INCOMPLETO.


## Public application result allowlist — validated (2026-10-18 local)

- `runNexoChronicleAppend()` now returns an allowlisted summary instead of forwarding internal runtime objects. Public results omit `adapterResult`, `lineage`, `reconciliation`, `outcome`, `target`, and `context`; tests assert the Chronicle content does not appear in the serialized result.
- Every blocked result explicitly returns `dispatchAttempted=false` and `redispatchAuthorized=false`. Mission-admission uncertainty remains `UNKNOWN` and never dispatches.
- Validated code/test SHA: `7eaa58f106c7fe696e7674085cc58286a4256f75`. CI SUCCESS: [Chronicle 39187179382](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179382), [continuity/restart 39187179340](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179340), [STEP 4 39187179363](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179363), [STEP 5 39187179346](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179346), all SUCCESS.
- Scope: this hardens the public result boundary for the existing Chronicle vertical. It does not add a mutating capability or authorize UI/runtime integration. M0 INCOMPLETO.


## Mission admission commit-response crash cut — validated (2026-10-18 local)

- The regression now uses the real canonical continuity file store. A wrapper commits a mission, then throws to simulate response loss after persistence. The application helper returns `unknown / missionAdmissionCommitted=UNKNOWN`, `dispatchAttempted=false`, `redispatchAuthorized=false`; a fresh canonical read reconstructs the mission as planned at revision 1. No effect was dispatched.
- The first test attempt expected a second direct `recordMission()` call to return `already_recorded`; CI correctly returned `conflict`, because duplicate mission registration is not the recovery API. The test was corrected to assert canonical reconstruction instead; no production behavior was changed to fake duplicate admission.
- Validated code/test SHA: `274af889dfcfe8457af005f5ee126d012b1b6555`. CI SUCCESS: [Chronicle 39187313873](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313873), [continuity/restart 39187313731](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313731), [STEP 4 39187313692](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313692), [STEP 5 39187313854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313854), all SUCCESS.
- This proves the mission-admission response-loss cut and read-only recovery. It does not claim power-loss/fsync durability or authorize dispatch from UNKNOWN. M0 INCOMPLETO.

## Current verified pointer — mission-admission response-loss proof

- Branch HEAD at last documentation update: `0e4baf55de41bcfff249377785809765487ec883`; latest docs updates may advance HEAD further without changing code.
- Latest code/test SHA with four focal workflows SUCCESS: `274af889dfcfe8457af005f5ee126d012b1b6555`.
- Next: continue audit of the public application boundary and result contract. No new mutating action, no UI/legacy runtime integration, no `index.html` change, no authority inference. M0 INCOMPLETO; protected effects STOP; Nexo/Lúmina separate.



## Public admission UNKNOWN normalization — validated update (2026-10-19)

The runNexoChronicleAppend() mission-admission UNKNOWN branch now uses the same public allowlist serializer as all other application results. It preserves missionAdmissionCommitted=UNKNOWN and the no-dispatch/no-redispatch flags while including the request identity (missionId, stepId). Internal target/adapter objects are excluded. A focused regression covers the serializer contract and private payload non-disclosure.

CI SUCCESS on code/test SHA 3c8d14163144e6f83a6130f38f025e31302c1ac9: [Chronicle 39187723675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723675), [bounded mission admission/restart 39187723680](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723680), [STEP 4 39187723651](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723651), [STEP 5 39187723612](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723612). This is a response-shape correction only; no new action, no retry authorization, and no runtime cutover.



## Public result value-schema validation — validated update (2026-10-19)

The public result serializer now validates field values as well as field names. Status is restricted to the documented public status set; code must be a string; tri-state commit/settlement fields accept only boolean or UNKNOWN; storeRevision must be a nonnegative safe integer. The current public vertical always reports redispatchAuthorized=false. Malformed values are omitted or normalized rather than passed through. Regression covers malformed values and private-data non-disclosure.

CI SUCCESS on code/test SHA 42f0e12640a35bc1e7b524501f8dbe879a311d90: [Chronicle 39187949155](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949155), [bounded mission admission/restart 39187949154](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949154), [STEP 4 39187949143](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949143), [STEP 5 39187949152](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949152). This hardens response shape only and does not establish power-loss durability or authorize retry/redispatch.


## M0 guard — repair completion requires action-specific goal verification (2026-10-19)

The owner previously rejected completion when an unresolved effect journal row existed, but a known repair action with no journal row could still be completed by supplying evidence shaped as `{verified:true, kind, source}`. Those fields are labels, not authenticated evidence. The owner now blocks completed outcomes for the three known repair actions with `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED` until an action-specific goal verifier is connected. If PREPARED/observed effects are unresolved, `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` remains the higher-priority response. Non-mutating `local_analysis` completion behavior is unchanged.

Regression in `tests/nexo/repair-settlement-crash-cuts.test.mjs`: no PREPARED entry + caller-asserted repair completion → blocked; canonical revision remains 0.

Validated code/test SHA `bef43609defa7a57f542d1a572dde388afb90812`. CI SUCCESS: [M0 effect/settlement 39188821844](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821844), [repair crash cuts 39188821998](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821998), [bounded admission/restart 39188821789](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821789), [STEP 4 39188821769](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821769), [Chronicle 39188821790](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821790). This is a fail-closed guard, not the missing goal-verification implementation; M0 remains incomplete.


## Latest M0 checkpoint — completion guard for registered effects (2026-10-19)

A caller-supplied evidence shape is not a goal verifier. The owner now blocks completed outcomes for the three known repair actions and any action registered in the trusted `effectVerifiers` registry, except `chronicle_append`, whose completion is gated by its own exact persisted settlement contract. If PREPARED/observed effect state is unresolved, the existing `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` result retains precedence. Non-mutating `local_analysis` completion remains unchanged.

Regressions cover a repair with no PREPARED row and a registered `generic_write` with no PREPARED row. Both caller-asserted completions block without advancing canonical revision. The first guard iteration failed CI due to precedence/scope; corrected code and expanded tests passed all six focal workflows on code/test SHA `f0a2472887e8bf5d46aaff2c904e50dae190345b`: [bounded admission/restart 39188948325](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948325), [STEP 5 39188948326](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948326), [STEP 4 39188948327](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948327), [Chronicle 39188948337](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948337), [repair crash cuts 39188948338](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948338), [effect/settlement 39188948346](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948346).

This guard does not implement the missing mission-goal verifier or enable additional effects. M0 remains incomplete.


## M0 checkpoint — default-deny outcome completion (2026-10-19)

The guard that covered known repairs and actions registered in `effectVerifiers` left an uncovered case: an unregistered effectful action could be marked `completed` without PREPARED or a goal verifier. `recordOutcome(status=completed)` now fails closed by default, returning `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`, except for `chronicle_append` (its exact persisted settlement gate) and `local_analysis` (the explicitly non-mutating action). The existing unresolved-effect check still runs first. Regression: unregistered `generic_write`, no PREPARED, caller-asserted evidence → blocked and canonical revision remains 0.

Validated code/test SHA `8d8a92a0ad7ed73b0f35bc798f033be11402856c`. SUCCESS: [STEP 4 39189265872](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265872), [STEP 5 39189265904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265904), [repair crash cuts 39189265894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265894), [effect/settlement 39189265926](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265926). Chronicle SUCCESS on the preceding code-only SHA `a0cf6b87d479e39c3927b952869d52b3539b6c75`; the validated SHA added the regression test only.

This is a fail-closed guard, not the missing goal-verification implementation. M0 remains incomplete.


## M0 crash-cut — generic observation commit may persist before throwing (2026-10-19)

`reconcilePrepared()` now catches an exception from the generic observation `commitIfCurrent()` and returns structured uncertainty (`blocked`, `observationCommitted:false`, `uncertainty: effect_observation_commit_outcome_unknown`). It does not claim commit failure or success. Regression simulates a real canonical commit followed by a thrown error, then reopens the owner: replay returns `already_observed`, the canonical journal remains `reconciled_observed`, and the verifier is not called a second time.

Validated SHA `a8f5d06cb983a412b8187612c70a6032215518eb`: [repair crash cuts 39189472295](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472295), [effect/settlement 39189472360](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472360), [STEP 4 39189472242](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472242), [STEP 5 39189472266](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472266). Chronicle passed on the underlying code SHA `ea2bc19753d82c9d79a98c100b9b9ee2dd0b3c90` ([run 39189369262](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189369262)).

This is response-loss recovery, not cross-store atomicity, effect retry, or mission completion. M0 remains incomplete.
