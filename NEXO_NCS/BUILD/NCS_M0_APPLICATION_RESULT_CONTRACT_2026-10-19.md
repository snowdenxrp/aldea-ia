# NCS — M0 Application Result Contract
Date: 2026-10-19
Latest validated code/test checkpoint: `d4936c965eb926b3e61eb7ecbe3f9becf58925ca` (2026-10-19)

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


## M0 — generic reconciliation read-failure boundary (2026-10-19)

`reconcilePrepared()` now catches failures from its initial canonical continuity read and its mandatory pre-CAS re-read. Both return structured `blocked` results with explicit uncertainty and the underlying error code when available. Regression: verifier returns a valid observation, pre-CAS read throws, method does not commit, the verifier is called once, revision remains 0, and the journal remains `prepared`.

Code SHA `c8b5c59cd5e2a69e11c9c8ba1263d46a5c678469`; final code/test SHA `f43c757cc7dc6ce966f797637dd5d7e2b5715827`. SUCCESS: [repair crash cuts 39189612150](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612150), [effect/settlement 39189612141](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612141), [STEP 4 39189612151](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612151), [STEP 5 39189612143](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612143), [Chronicle 39189596625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189596625), [continuity/restart 39189596815](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189596815).

No automatic retries or redispatch. M0 remains incomplete.


## M0 — generic observation replay integrity (2026-10-19)

Replay of `reconciled_observed` now requires allowed status, safe nonnegative `observedRevision`, nonblank `source`, an explicit `evidence` property, and a valid canonical ISO `observedAt`. If the record is partial, the owner does not report `already_observed` and does not call the verifier again. Initial/pre-CAS read failures return structured uncertainty; the initial-read test verifies the verifier is not called, and the pre-CAS test verifies PREPARED and revision 0 remain unchanged. The commit-response-loss test verifies that a durable observation is recovered after reopen without a second verifier call.

Code SHA `abd9e9d4ed64e96940155712b1dae173ba22c77e`; final code/test SHA `c2c2414edd8ffc138f6cf473f5eae2ee1bbae397`. SUCCESS: [repair crash cuts 39189827272](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827272), [effect/settlement 39189827289](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827289), [STEP 4 39189827310](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827310), [STEP 5 39189827224](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827224), [Chronicle 39189720937](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189720937).

This is fail-closed recovery integrity, not mission completion or cross-store atomicity. M0 remains incomplete.


## M0 — canonical continuity read failures (2026-10-19)

`recordMission()` now catches a failure from `store.loadCurrent()` and returns a structured blocked result with the original code (or `NEXO_CONTINUITY_LOAD_FAILED`), `uncertainty: continuity_read_failed`, expected revision, and `authorization: NOT_EVALUATED`. It does not attempt to build/commit against an unknown snapshot. Regression confirms unchanged canonical revision.

`reconcilePrepared()` has equivalent structured failure handling for its initial read and pre-CAS re-read. The initial-read test confirms the verifier is not called; the pre-CAS re-read test confirms PREPARED remains untouched. Code SHA `b34c09492a36ef354faf566b8a8b1e34cae7dadb` passed all six focal workflows; test SHA `9852ec69da2b1fe685619d765521916eba5a9786` passed its four triggered workflows, including the new admission-read regression. See STATUS and handoff for exact run links.

This handles known read-failure boundaries only. It does not add cross-store atomicity or mission-goal verification. M0 remains incomplete.


## M0 — Chronicle settlement replay requires complete canonical record (2026-10-19)

Chronicle replay previously accepted a settlement with status `applied`, source `nexo-chronicle-store`, and nonnegative revision even when the canonical record lacked evidence and `observedAt`. It now requires the evidence property and canonical ISO timestamp, matching the generic observation replay standard. A malformed partial settlement returns conflict and does not invoke the verifier.

Code SHA `005338b91656e61eee3ffbef105c306e2af496b2` passed all six focal workflows. Test SHA `ddf1034f4ef605dc68e0e7eb5debe4f61cecbd72` passed all four workflows triggered by the added regression. See STATUS/handoff for exact CI links. M0 remains incomplete; this is replay-integrity validation, not authorization or goal verification.


## Handoff de continuidad para el siguiente chat (2026-10-19)

El checkpoint más reciente es el replay Chronicle incompleto. La ruta de replay ahora exige identidad exacta, estado `settled_observed`, settlement `applied`, fuente `nexo-chronicle-store`, revisión observada no negativa, `evidence` presente y `observedAt` ISO válido/canónico. Una entrada parcial no se acepta como `already_observed` y no invoca el verificador como fallback. Código `005338b91656e61eee3ffbef105c306e2af496b2`; regresión en SHA código/pruebas `ddf1034f4ef605dc68e0e7eb5debe4f61cecbd72`. Seis workflows pasaron en el SHA de código; cuatro workflows disparados por la nueva prueba pasaron en el SHA código/prueba. IDs y enlaces, además del estado de todos los hardening previos y pasos de continuidad, están en `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19.md`.

Próximo paso: inspeccionar sólo la correspondencia entre el contrato de escritura del settlement Chronicle y el contrato de replay. Leer ambos caminos y pruebas existentes antes de cambiar código. M0 permanece INCOMPLETO; no se ha implementado el goal verifier ni autorizado el runtime real.


## M0 — Chronicle completion gate matches replay record completeness (2026-10-19)

The completion path in `recordOutcome()` now requires the same settlement completeness fields as Chronicle replay: `evidence` must be an own property and `observedAt` must be a valid canonical ISO timestamp, in addition to the existing exact identity, `settled_observed`, `applied`, source, and nonnegative safe-integer revision checks.

A malformed persisted settlement is blocked with `NEXO_CHRONICLE_SETTLEMENT_REQUIRED`; the regression verifies no attempt is appended and canonical `storeRevision` remains unchanged.

Code SHA: `f3a54153d3574f559aa32f1c56d093e1152b4842`. Code + corrected regression SHA: `b21896e893a1b739bbfa511f76c3a215298a73e6`.

CI SUCCESS at the code + regression SHA: [repair settlement crash cuts 39192937988](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937988), [effect and settlement contract regressions 39192937997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937997), [STEP 4 semantic validation 39192938031](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192938031), [STEP 5 outcome classification 39192937987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937987).

This closes the identified record-completeness discrepancy only. It does not establish external-effect causality, general goal verification, power-loss durability, legitimate authority, or protected-runtime readiness. M0 remains incomplete; protected effects remain STOP.


## Checkpoint M0 — evidencia Chronicle ligada al registro persistido (2026-10-19)

La observación Chronicle aplicada debe contener evidencia no nula ligada al registro que se leyó. `observeChronicleOperation()` produce `{kind: "persisted-chronicle-entry", operationKey, content}`; el propietario comprueba el tipo, kind y coincidencia exacta de operationKey/content tanto al recuperar settlement como antes de permitir `recordOutcome(status="completed")`. La presencia de una propiedad `evidence` con valor null ya no satisface el contrato Chronicle.

Regresión: un settlement con status/source/revisión/timestamp válidos pero `evidence: null` no puede completar una misión ni recuperarse como `already_observed` durante replay; la regresión confirma que la revisión canónica no avanza. Pruebas y CI quedan documentados en `NEXO_NCS/STATUS.md` y en el handoff M0 del 2026-10-19.

Esta evidencia demuestra coincidencia con una entrada observada del Chronicle local; no es una firma, autoridad, atribución causal, garantía de durabilidad física ni verificación general de objetivo. M0 continúa INCOMPLETO y los efectos protegidos permanecen STOP.


## Checkpoint M0 — contrato único también en runtime recovery (2026-10-19)

La ruta de recuperación de Chronicle ya no valida settlement con un subconjunto de campos. `src/nexo/core/chronicle-settlement-contract.mjs` es el contrato puro compartido por owner replay, terminal completion y runtime recovery: exige identidad no ambigua, target ligado a la entrada, status/source/revisión, evidencia no nula con kind/operationKey/content exactos y timestamp ISO canónico. Un settlement parcial se mantiene como obligación irresuelta; no se redispatcha ni se declara `journalSettled`.

Regresión en `tests/nexo/chronicle-runtime.test.mjs`: evidence null en un registro settled provoca `NEXO_CHRONICLE_EXISTING_OBLIGATION_UNRESOLVED`, no invoca el writer de outcome y no despacha. El SHA de código/contrato final es `e62b65ab699c5d177c40d08f32a1393af118e4ee`; prueba runtime en `26eab01d09ab4be20c7228da8abf17e3224f5a6b`. Ver runs enlazados en STATUS.

Este gate no autentica el archivo ni demuestra causalidad, autoridad, durabilidad física o goal verification. M0 sigue INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — observación genérica exige evidence no vacía (2026-10-19)

Para `applied/not_applied`, `reconcilePrepared()` requiere `evidence` como propiedad propia, objeto no nulo, no-array y con al menos una clave enumerable. Replay aplica el mismo criterio. `unknown` continúa como incertidumbre y no necesita evidencia positiva. Chronicle aporta evidencia de ausencia ligada a operationKey y revisión cuando no existe entrada.

Regresiones de ausencia, objeto vacío y replay con null: CI crash cuts/effect/settlement/STEP 4/STEP 5 en SHA `b3a3f8fbaafb29ba913916ce989fb3a3e7196768`; Chronicle native/bounded en SHA de código `6ab75e1b59758cd33cd0a470c90e45e02f418882`. Ver STATUS para enlaces.

Este requisito sólo garantiza una estructura mínima; no autentica el origen ni autoriza efectos. M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — identidad de operación no ambigua (2026-10-19)

`validateOperation()` rechaza `:` en `missionId` o `stepId` usando el código existente `NEXO_OPERATION_IDENTITY_MISMATCH`, preservando el formato actual de clave y evitando colisiones de tuplas. Se probaron ambas posiciones y la ausencia de mutación. Los seis workflows focales pasaron en SHA `442963578e2de42e6d67afd6fd85062ccea1a23e`; ver enlaces en STATUS.

Esto reduce colisiones de identidad local, no autentica al propietario ni autoriza efectos. M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — reconstrucción de completion con identidad exacta (2026-10-19)

`reconstructNexoMissionFromSnapshot()` sólo acepta una completion histórica si action/target coinciden exactamente con el paso y la evidencia tiene `verified === true`, kind y source no vacíos. Las claims completed con identidad/evidencia inválidas bloquean el paso; no lo completan ni lo devuelven a planned. Los estados no terminales con identidad disponible se filtran por la misma operación.

Regresiones de intento mismatcheado y evidence no verificada: bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS en SHA `5767851584eba13298cada7bf46b162844b7d7bd`. Ver STATUS para enlaces. Esto no es goal verification ni autorización. M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — reconstrucción Chronicle requiere ambos registros válidos (2026-10-19)

Para reconstruir `chronicle_append` como completed deben existir un settlement canónico validado por `isValidNexoChronicleSettlementRecord()` y un intento terminal verificado con action/target exactos. Settlement sin outcome terminal → blocked `NEXO_CHRONICLE_OUTCOME_REPLAY_REQUIRED`; claim completed sin settlement válido → blocked `NEXO_CHRONICLE_SETTLEMENT_REQUIRED`. No vuelve a planned ni redispatcha.

CI bounded admission/restart, crash cuts, STEP 4 y STEP 5 SUCCESS en SHA `fe79862299cb51dd95bd39e0d227d05698c65a03`. Ver STATUS para enlaces. M0 sigue INCOMPLETO; los efectos protegidos permanecen STOP.


## Checkpoint M0 — reconstrucción respeta acciones con completion permitido

La reconstrucción canónica sólo reconoce completion verificada para `local_analysis` o para `chronicle_append` con settlement y outcome válidos. Una claim completed de acción mutante sin goal verifier queda blocked con `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`; evidence inválida conserva su propio código. La prueba de replay monotónico se restringe a `local_analysis`, acción no mutante explícitamente permitida.

CI bounded admission/restart, STEP 4, STEP 5 SUCCESS en SHA de prueba `ac8e4bc88c04c2f1ea257a58ecf224d867dd4b94`; crash cuts SUCCESS en código `fbfda4b7be4de8cf2e3ae1b0d7903f0287cf5b6e`. Ver STATUS para enlaces. No hay goal verifier general; M0 INCOMPLETO y efectos protegidos STOP.


## Checkpoint M0 — PREPARED exige paso canónico reconstruido como planned (2026-10-19)

`recordPrepared()` ya no confía únicamente en el `status` del plan almacenado. La admisión reconstruye la misión desde el snapshot y requiere que el paso actual esté `planned` también en esa reconstrucción; de lo contrario devuelve `NEXO_PREPARED_STEP_NOT_RUNNABLE` sin commit. Regresión: una claim terminal caller-supplied para una acción mutante bloquea reconstrucción y no puede producir un nuevo PREPARED.

HEAD validado `9d46f1400cef0eb4c74a4c4419edcc2c616a73b9`: bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS (runs 39195354527, 39195354529, 39195354611, 39195354737). Chronicle native y effect/settlement SUCCESS en fix funcional `615941bf3bc4389c3ce9fd12b0212f3144f9c87a` (runs 39195344263, 39195344261). M0 sigue INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — admisión bloqueada por misión reconstruida no runnable (2026-10-19)

`recordPrepared()` exige que la misión reconstruida esté `planned` y que el paso reconstruido también esté `planned`, además de validar el plan persistido. Una claim terminal no autorizada bloquea el paso; un PREPARED sin resolver bloquea la misión y evita admitir otro paso independiente. El branch de idempotency/existing PREPARED se mantiene antes de los guards y sigue devolviendo UNKNOWN/prepared_existing, nunca permiso para redispatch.

HEAD código+tests `c59a825771af3376a88a9bc212e9967cf1d75f1d`: bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS (runs 39195662848, 39195662862, 39195662845, 39195662831). Chronicle native y effect/settlement SUCCESS en código `3ebb037f53409df9681f5ed01b6458e915e36a29` (runs 39195543682, 39195543685). M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — PREPARED permanece UNKNOWN tras reinicio

La prueba de continuidad reabre el owner después de confirmar PREPARED y repite la misma identidad. El resultado es `prepared_existing / NEXO_EFFECT_OUTCOME_UNKNOWN`, sin nueva escritura, sin cambio de revisión y con una sola entrada `prepared` persistida. Esto valida replay de la obligación, no despacho ni causalidad del efecto.

Test SHA `376f2d984eeb969d25c2c797a40037a72a6a5c6b`; bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS (runs 39195866238, 39195866236, 39195866226, 39195866266). La auditoría del camino genérico `reconcilePrepared()` confirmó que `reconciled_observed` es observación no-terminal y `recordOutcome()` sigue bloqueando outcomes mientras esa obligación no tenga contrato terminal específico. M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — Chronicle outcome reconstruction after response loss

La prueba de runtime simula pérdida de respuesta después del commit terminal, reabre el owner y comprueba reconstrucción: settlement válido + attempt completed producen paso `completed`; la misión completa permanece `awaiting_verification` y el runtime recupera sin un segundo dispatch. SHA de test `467cea28706a54b2f30e320485c1d7b3f57e2692`; Chronicle native, bounded admission, STEP 4 y STEP 5 SUCCESS (runs 39196004121, 39196004116, 39196004098, 39196004164). M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — Chronicle outcome evidence must match settlement

La evidencia del outcome Chronicle debe llevar el tipo canónico y `source/observedRevision` iguales al settlement persistido. Owner bloquea mismatch; reconstrucción también bloquea evidencia desatada e identidad distinta en lugar de informar que sólo falta replay. La pareja canónica sigue reconstructing completed. Fix funcional `c9be5ee...`; test SHA `9ca094...`; bounded admission, crash cuts, STEP 4 y STEP 5 SUCCESS. Esto es coherencia estructural, no autenticación de procedencia. M0 INCOMPLETO; efectos protegidos STOP.


## Checkpoint M0 — forma exacta de evidencia Chronicle

Outcome evidence debe contener exactamente `verified`, `kind`, `source`, `observedRevision`; kind canónico y source/revision ligados al settlement. Claims extra o desatadas se bloquean; el runtime real prueba que el resultado canónico sigue siendo aceptado. SHA funcional `4a976...`, SHA final de pruebas `d4936...`; bounded admission, Chronicle native, STEP 4 y STEP 5 SUCCESS. M0 INCOMPLETO; efectos protegidos STOP.
