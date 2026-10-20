# NCS — M0 handoff for next chat (2026-10-20)

## Mandatory opening instruction

Start the next chat with the exact keyword `NCS`. The mission is **M0**. Continue from this handoff and `NEXO_NCS/STATUS.md`; do not restart prior research, re-run closed audits without a concrete new discrepancy, switch to M1, or make STEP 7 the active workstream.

Repository: `github.com/snowdenxrp/aldea-ia`  
Branch: `ncs-clean-architecture`  
Current project entry point: [NEXO_NCS/STATUS.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)

## Non-negotiable state

- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Protected effects: **STOP**.
- Legitimate root / constitutional owner proof: **PENDING / UNKNOWN**.
- STEP 7 remains OPEN / STOP / UNKNOWN, not this workstream.
- Nexo and Lúmina are separate.
- Do not equate structural consistency, caller-provided `verified`, CI success, or a reconstructed status with authenticated provenance, causal attribution, legitimate authority, or permission to execute protected effects.
- No invented goal verifier, root credential, queue, retries, transaction wrappers, state labels, or authorization semantics. If a structural change is needed, expose the root cause and stop to redesign instead of quietly layering patches.
- Keep STATUS and handoff as continuity records. Record red/green history honestly; do not erase failed test-first runs.

## Work completed before this checkpoint

### Persisted mission dependency graph
The persisted snapshot validator in `src/nexo/core/continuity-contract.mjs` now validates mission `steps` and dependency graph rather than relying only on admission-time validation. It rejects invalid/duplicate step identities, missing/blank actions, malformed or sparse `dependsOn`, duplicate/dangling/self references, and cycles; malformed persisted plans fail closed as `NEXO_MEMORY_SCHEMA_UNKNOWN`.

Related code/test SHA: `4dc34fb045ff47457ca6476a07d3b5f3d7550469`.
- Test-first failure run `39366069315`: exposed non-array dependencies not rejected.
- Test-first failure run `39366159595`: exposed cycles not rejected.
- Runs `39366172190` and `39366172230`: old repair-session fixture had dangling dependency and had to be made semantically valid (a real prerequisite still planned).
- Final SUCCESS at code/test SHA `4dc34fb045ff47457ca6476a07d3b5f3d7550469`:
  - Integrated M0 acceptance `39366255751`
  - Repair settlement crash cuts `39366255728`
  - Full `npm test` `39366255710`
  - STEP 4 `39366255732`
  - STEP 5 `39366255760`
- Documentation updates: STATUS blob `09f6bfea1b476f47c10cfa1a6557bc142279144c`; prior handoff update blob `6df226373d2b5951bf70b48d6913b4424e849559`.
- Documentation HEAD at that checkpoint: `af7002d9bd09eaa7b6428d0401adfdd6a07583c4`; `npm test` CI SUCCESS at docs HEAD, run `39366394201`.
- The separate proposed audit report `NCS_M0_PERSISTED_MISSION_GRAPH_VALIDATION_2026-10-20.md` was **not created** (GitHub tool blocked creation); do not claim it exists. STATUS and handoff contain the validation record.

### Current follow-on audit: terminal outcomes and canonical reconstruction
Reviewed current branch files:
- `src/nexo/core/continuity-operations.mjs`
- `src/nexo/core/continuity-owner.mjs`
- `src/nexo/application/continuity-queries.mjs`
- `tests/nexo/continuity-migration.test.mjs)
- `NEXO_NCS/STATUS.md`

The existing tests already cover important cases, so do not duplicate them:
- completed attempt with action/target mismatch is blocked as `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, and no result is projected;
- unverified completion evidence is blocked as `NEXO_COMPLETION_EVIDENCE_UNVERIFIED`;
- caller-labelled completion for mutating repair action is blocked as `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`;
- `local_analysis` is the explicit non-mutating exception; its completion evidence must have `verified`, `kind`, and `source`, but those fields alone do not authenticate the producer;
- Chronicle completion requires canonical persisted settlement and matching outcome evidence;
- unresolved `prepared` / `settled_observed` effects dominate outcome reconstruction;
- contradictory late outcome replay is rejected as `NEXO_OUTCOME_RESULT_MISMATCH`, preserving the original persisted result;
- PREPARED identity/revision and lineage constraints remain separate from outcome settlement.

The latest pass did **not** establish a new reproducible defect, did not change code, and did not run new CI. Do not report a new fix or new test pass from this latest pass. The user-facing summary said the next task is to continue auditing store revision / response-loss / reconstruction consistency.

## Exact next actions

1. Re-read `NEXO_NCS/STATUS.md` and this handoff first. Use repository file fetches to verify the current branch HEAD and latest relevant workflow results before any edits; the SHAs above are the last known checkpoint, not a claim that no later commit exists.
2. Continue M0 by inspecting the persisted-outcome / commit path and reconstruction around `src/nexo/core/continuity-owner.mjs`, `src/nexo/core/continuity-operations.mjs`, and existing tests. Focus narrowly on response lost after commit, same-revision replay, stale revision conflict, ambiguous commit/persistence result, and whether the reconstructed projection can disagree with the durable record. Reuse existing tests before writing anything.
3. Pick one candidate only if it is a concrete invariant not already covered. Write a regression that fails on the exact current code SHA, establish the reason, implement the smallest coherent fix, and rerun targeted tests plus the appropriate CI workflows. Preserve all red/green runs and tie each SUCCESS to the exact code/test SHA.
4. If no new discrepancy is reproducible, record that honestly and move to the next unresolved M0 dependency from STATUS—do not manufacture a patch.
5. Update `NEXO_NCS/STATUS.md` and this handoff with code/test SHA, changed paths, exact CI run IDs/statuses, red/green history, limits, and next action. Verify the resulting documentation commit/HEAD.
6. Do not wire or activate protected runtime effects merely because tests pass. The known global gap remains that `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`; do not claim full owner-backed runtime migration without end-to-end evidence.
7. Do not reopen the already investigated PREPARED trust boundary, broad root-family research, STEP 7, or M1 unless a concrete new M0 finding makes it necessary.

## Useful source links

- [STATUS / NCS entry point](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)
- [Previous M0 handoff](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-19.md)
- [Continuity contract](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-contract.mjs)
- [Continuity operations / reconstruction](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-operations.mjs)
- [Continuity owner / persistence](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-owner.mjs)
- [Migration/reconstruction regressions](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/continuity-migration.test.mjs)
- [Repair session regressions](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/repair-session.test.mjs)

## Start-next-chat instruction

Begin by acknowledging the keyword `NCS`, reading STATUS and this handoff, verifying current HEAD/CI, then continuing the narrow M0 audit above. Do not ask the user to repeat already preserved context. The mission remains M0.


## Addendum — response-loss / outcome-reconstruction audit (2026-10-20)

Audit record: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).

- Existing tests already cover lost conditional-commit response, UNKNOWN when canonical reread is unavailable, confirmed write failure, repair-settlement replay after a lost response, contradictory late outcome replay, and Chronicle's no-redispatch recovery path.
- No new reproducible defect was established; no code/test changes and no new CI run in this pass. Do not duplicate these regressions or treat stale-revision conflict as proof of persistence.
- Next: audit actual call sites and the public result boundary for the canonical owner-backed runtime versus legacy `src/assistants/memory.js`. No runtime cutover or repair-effect enablement without concrete call-site evidence and crash-cut coverage.
- M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


## Addendum — mission-admission persistence receipt fix (2026-10-20)

- Follow-on audit found that a lock-release failure after a confirmed store commit returned `status: failed, persistenceStatus: committed`; the Chronicle public boundary dropped the committed-admission fact.
- Fixed in `src/nexo/application/chronicle-append.mjs`: public result now remains blocked, `missionAdmissionCommitted: true`, `dispatchAttempted: false`, and `redispatchAuthorized: false`. Unknown persistence remains UNKNOWN. Regression added to `tests/nexo/chronicle-runtime.test.mjs`.
- Final code/test SHA: `52eb4f9bdb959c577c6532ab30f1294f542ef4db`. Exact-SHA CI SUCCESS: integrated M0 `39368731996`; Chronicle `39368732138`; deterministic persistence `39368732251`; mission admission/restart `39368731963`; STEP 4 `39368731975`; STEP 5 `39368732135`.
- Full audit: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- This is a result-contract correction only. M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


## Addendum — cross-stage persistence receipt correction (2026-10-20)

- Corrected persistence-result reporting across mission admission, PREPARED, execution lineage, Chronicle observation/settlement, and terminal outcome. Confirmed `persistenceStatus: committed` is preserved as a factual receipt while unsafe handoff blocks progression; unknown outcomes stay `UNKNOWN`. No dispatch or retry is authorized by these receipts.
- Updated `src/nexo/core/continuity-owner.mjs`, `src/nexo/core/owner-backed-runtime.mjs`, `src/nexo/application/chronicle-append.mjs`; regressions in `tests/nexo/chronicle-runtime.test.mjs` and `tests/nexo/repair-settlement-crash-cuts.test.mjs`.
- Red history retained: `3aed78b9788c9ffe25bc0077b02793a1ca6f75c0` and `0bf505d483cd56345fe7a7c9240545c86616bc2d` failed an outdated assertion that a thrown commit response proves non-persistence. The assertion now expects UNKNOWN.
- Final code/test SHA: `5aef07d4fb933d8c0be4ee4cbc325e7e8c4f85a7`; all six focal workflows SUCCESS: M0 integrated `39369199068`, repair crash cuts `39369199071`, effect/settlement `39369199064`, deterministic persistence `39369199083`, STEP 4 `39369199069`, STEP 5 `39369199073`.
- Full record: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- State remains M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN. Next: resume from the next unresolved M0 item in STATUS without reopening these receipt contracts or cutting over the legacy runtime.


## Addendum — owner-backed public boundary and next M0 frontier (2026-10-20)

- Re-read current branch runtime boundary, Chronicle application wrapper, and `tests/nexo/chronicle-runtime.test.mjs`. The capability-check exception regression is present; before dispatch, unexpected exception becomes `blocked / NEXO_RUNTIME_INTERNAL_FAILURE`, with no PREPARED or dispatch and no exception-message leakage.
- The test commit `55d2c1b11b3bbda1abf42677636d279ebce84187` is an ancestor of final code/test SHA `5aef07d4fb933d8c0be4ee4cbc325e7e8c4f85a7`. Existing six focal workflows on that exact code/test SHA remain the evidence: integrated M0 `39369199068`, crash cuts `39369199071`, effect/settlement `39369199064`, deterministic persistence `39369199083`, STEP 4 `39369199069`, STEP 5 `39369199073`. No new CI was run in this audit.
- Legacy APIs remain importable but are not evidenced as active production callers by the existing `NCS_M0_LEGACY_EFFECT_PATH_VS_OWNER_BACKED_2026-10-19.md`; `scripts/simulate.mjs` does not import those APIs. Do not cut over legacy runtime or describe it as protected execution.
- Next unresolved M0 frontier: lock contention/progress contract and deployment assumptions. Current store waits without a bound while the lock owner remains alive. The existing `NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md` explicitly recommends no arbitrary timeout/BUSY/cancellation/lease/stale-lock reclamation before the caller contract is chosen. Decide/record whether first-version requirements accept local cooperative writers plus unbounded waiting, or require bounded acquisition; if bounded, define the public error/status and every caller's handling before code changes.
- Do not reopen cross-stage persistence receipts, repeat the status/steps/objective audit, switch to M1/STEP 7, or enable protected effects.
- Global state unchanged: M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.

## Addendum — lock acquisition error normalization (2026-10-20; CI initially pending, then resolved)

- Found and fixed a mismatch in `initialize()`: comment promised OS error codes would stay behind the Nexo store contract, but arbitrary `error.code` such as `EACCES` could leak in the structured result.
- `src/nexo/core/continuity-store.mjs` now preserves internal `NEXO_CONTINUITY_STORE_*` codes, keeps `ENOENT/ENOTDIR` as `NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE`, and maps other acquisition failures to `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`.
- `tests/nexo/continuity-store.test.mjs` injects `EACCES` to assert normalization. It also explicitly asserts the existing mixed contract: `commitIfCurrent()` still throws non-path acquisition errors. This audit did not unify that contract or change lock waiting/stale-lock policy.
- Runtime commit `995871f4500b4dee5e164c2d83a59cb0e6207bf8`; test commit / exact code-test SHA `9fad44406e3c19bac2a20ecb830cf29f6758dae7`; blobs runtime `ecf982a028dcd4e9208eb236e27538eb5b508863`, test `f3c9eeb3d0e28926511dcc5ed5051ac567ece130`. Audit: `NCS_M0_LOCK_ACQUISITION_ERROR_NORMALIZATION_AUDIT_2026-10-20.md`.
- Initial status lookup was empty; a direct Actions API query subsequently found five runs for the exact SHA. The integrated and mission-admission workflows failed because an old test assertion still expected `EACCES`; the runtime output matched the new contract. See the correction addendum below for red/green history.
- M0 remains INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.

## Addendum — corrected lock-error regression and exact-SHA CI (2026-10-20)

- The first code/test SHA `9fad44406e3c19bac2a20ecb830cf29f6758dae7` exposed a stale expectation at `tests/nexo/continuity-store.test.mjs:566`: expected `{status:"failed", code:"EACCES"}` although `initialize()` correctly returned `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`. This was a test-contract mismatch, not a runtime failure. Red runs preserved: integrated acceptance [39372027172](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027172) and mission-admission/restart [39372027076](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027076). STEP 4 [39372027142](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027142), STEP 5 [39372027131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027131), and deterministic persistence [39372027145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027145) were SUCCESS on that SHA.
- Test-only correction commit / exact code-test SHA: `b133c8c392739a0912f7b0466650a25962ead267`; test blob `ee9327c706f8b34a7c2a7c632f48cb81776df098`. The expected result now matches the normalized Nexo error, while the assertion that `commitIfCurrent()` propagates `EACCES` remains. No runtime change was added after the first fix.
- All five relevant workflows are SUCCESS on the exact corrected SHA: integrated M0 [39372728077](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728077), mission-admission/restart [39372728055](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728055), deterministic persistence [39372728046](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728046), STEP 4 [39372728141](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728141), STEP 5 [39372728127](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728127).
- Audit report: `NCS_M0_LOCK_ACQUISITION_ERROR_NORMALIZATION_AUDIT_2026-10-20.md`; STATUS was updated with the same evidence. The documentation commits do not change the validated code/test SHA.
- Next: continue M0 with the open lock-contention/progress contract. Review public API callers and deployment assumptions; do not add arbitrary timeout/BUSY/cancellation/lease/stale-lock recovery without a chosen contract. Do not reopen closed persistence receipt audits or activate protected effects.
- State remains M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


## Addendum — lock contention caller audit (2026-10-20)

- Report: `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md`.
- Confirmed both Continuity and Chronicle stores wait in a 10 ms retry loop without a deadline while a valid lock persists and its owner PID remains alive. The 60-second stale threshold is not a timeout; stale recovery remains explicit and no automatic deletion was added.
- Caller inspection found no public store deadline/cancellation parameter. The inspected canonical paths fail closed after an acquisition error and do not authorize dispatch when PREPARED is unconfirmed, but they cannot return a bounded response while acquisition is still waiting. Error result/exception contracts remain non-uniform across store APIs.
- No runtime/test change and no new CI run in this review. Latest exact code/test SHA remains `b133c8c392739a0912f7b0466650a25962ead267`, with five workflows SUCCESS listed in STATUS.
- Next architecture action: settle the deployment/API requirement—(a) explicitly accept cooperative local writers and unbounded waiting as a first-version limitation, or (b) require bounded acquisition and specify one shared public outcome plus caller handling/reconciliation before implementation. Do not invent a timeout/BUSY/cancellation/lease/heartbeat/reclaim patch. Any deadline protocol must distinguish lock contention from stale/IO errors and persistence UNKNOWN, and must never enable blind redispatch after PREPARED.
- Do not reopen already closed receipt/reconstruction audits. M0 remains INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


### Proposed direction for lock progress (not adopted)

- Recommendation in the caller audit: bounded lock waiting for the interactive runtime, using one caller-owned monotonic deadline/budget propagated across nested Continuity/Chronicle operations—not an arbitrary store-local timeout.
- Deadline expiry before ownership must be a structured result that states the write phase did not start. Never interrupt an in-flight write/rename to force a timeout. A prior PREPARED/external dispatch still requires canonical reconciliation before any retry.
- The deadline budget and whether bounded response is required for the first supported deployment are unresolved product/architecture requirements. Do not implement until they are decided; current code remains unchanged.
- Audit: `NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md`, sections 5 and 5.1. STATUS contains the same recommendation.


## Addendum — decisión A aceptada y siguiente contrato de lock (2026-10-20)

**Decisión del usuario: A — requerir espera acotada para adquisición de lock.** La elección anterior entre espera ilimitada/acotada queda resuelta. No interpretar “sin límite” como aceptación de espera de lock ilimitada: el usuario eligió explícitamente A.

- Especificación de contrato: `NEXO_NCS/BUILD/NCS_M0_BOUNDED_LOCK_WAIT_CONTRACT_2026-10-20.md`.
- STATUS actualizado con decisión, límites y secuencia.
- Aún no hay cambio de runtime/tests ni CI para el contrato. El código continúa con espera sin deadline hasta completar la implementación y validación.
- No inventar el presupuesto numérico. Contrato objetivo: deadline monotónico absoluto único propiedad del caller, compartido por mutaciones anidadas Continuity/Chronicle. Vence sólo la espera de adquisición; nunca cancelar escritura/rename en curso. La expiración previa a lock debe decir explícitamente que no comenzó la fase de escritura; adquisición tardía debe liberar únicamente lock propio y no escribir. Los resultados de liberación y persistencia siguen separados.
- No se autoriza dispatch sin PREPARED confirmado ni redispatch por timeout después de PREPARED/efecto posible. En ese caso, recargar estado canónico y reconciliar.
- HISTÓRICO SUPERADO por los addenda posteriores: deadline monotónico, contrato por API, implementación inicial y pruebas ya están presentes. Próxima tarea vigente: auditoría final de callers/entrypoints fuera de runNexoChronicleAppend.
- Presupuesto/configuración sigue abierto; no fijar una cifra arbitraria. La garantía no es un timeout estricto de pared si una llamada filesystem no retorna. No agregar framework genérico de cancelación, watchdogs, leases, heartbeats ni reclaim automático como side quest.
- CI previo: SHA código/test `b133c8c392739a0912f7b0466650a25962ead267` y cinco workflows SUCCESS citados en STATUS. No presentarlos como validación de este nuevo contrato.
- Mantener M0 `INCOMPLETO`, `authorization: NOT_EVALUATED`, efectos protegidos `STOP`, raíz legítima `PENDING/UNKNOWN`. No reabrir auditorías cerradas de recibos/reconstrucción, no cambiar a M1/STEP 7.


## Addendum — mapa de propagación de deadline (2026-10-20)

- Auditoría: `NEXO_NCS/BUILD/NCS_M0_LOCK_DEADLINE_CALLER_MAP_2026-10-20.md`.
- Mapeadas las firmas públicas de Continuity y Chronicle, la cadena de aplicación `runNexoChronicleAppend`, `openNexoContinuityOwner`, owner mutations, `executeNexoStepWithContinuityOwner`, Chronicle handler y wrapper CLI. No hay deadline monotónico ni configuración de presupuesto existente en las rutas inspeccionadas.
- No basta con añadir un parámetro a los stores: el deadline debe atravesar PREPARED, lineage, reconciliation y terminal outcome, y ser compartido por Continuity y Chronicle dentro de una operación. No usar presupuestos relativos independientes por cada capa.
- Tests actuales cubren espera cross-process, concurrencia de misma revisión, stale/unknown, write/rename ambiguos y fallos de lock release; el test de espera cross-process deberá modificarse para la política acotada, y se requieren pruebas de integración de no-dispatch/no-redispatch.
- **Bloqueo de diseño antes de implementación:** fijar fuente y valor/política de un presupuesto finito para la primera versión. No existe un valor en los fuentes inspeccionados; no inventarlo y no usar fallback ilimitado, porque contradice la decisión A. Recomendación: la configuración del host/aplicación crea un único deadline monotónico absoluto y los stores reciben ese deadline.
- HISTÓRICO SUPERADO: presupuesto aceptado (2.000 ms configurable), helper, matriz, implementación y CI exacto ya están registrados abajo.
- Sin cambios de runtime/tests y sin CI nuevo por este mapa. El último SHA código/test con cinco workflows SUCCESS sigue siendo `b133c8c392739a0912f7b0466650a25962ead267`; no valida este diseño.
- Estado: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## Addendum — matriz de resultados de timeout por API (2026-10-20)

- Leer `NEXO_NCS/BUILD/NCS_M0_LOCK_TIMEOUT_RESULT_MATRIX_2026-10-20.md`.
- Matriz propuesta para las cuatro APIs mutables, handler Chronicle y runtime público. Timeout significa que no empezó la fase de escritura en esa llamada; mantener distinto de stale/unknown/IO/conflict/persistencia ambigua.
- Forma de resultado `phase`/`writeStarted` es sólo propuesta, requiere validación contra convenciones existentes antes de implementarse.
- Adquisición tardía: nunca empezar escritura después del deadline; liberar sólo lock propio demostrado; fallo de liberación debe preservarse separado del timeout.
- HISTÓRICO SUPERADO: el usuario aceptó explícitamente 2.000 ms configurables; no es un límite de tiempo de pared estricto.
- HISTÓRICO SUPERADO: runtime/tests fueron modificados y los workflows M0 relevantes pasaron en los SHA indicados en los addenda posteriores.
- M0 sigue `INCOMPLETO`, `authorization: NOT_EVALUATED`, efectos protegidos `STOP`, raíz legítima `PENDING/UNKNOWN`.


## Addendum — decisión aprobada e implementación inicial de deadline (2026-10-20)

### Decisión del usuario
- El usuario aceptó explícitamente la recomendación: **2.000 ms como presupuesto inicial configurable**.
- Interpretación: espera cooperativa de adquisición; no es garantía de que toda llamada filesystem o toda operación Nexo termine en 2 segundos.

### Runtime y pruebas cambiados
- Nuevo helper: src/nexo/core/lock-deadline.mjs, basado en performance.now().
- Continuity y Chronicle tienen adquisición acotada con códigos de timeout distintos y resultados estructurados phase:"lock_acquisition", writeStarted:false.
- Una operación compuesta runNexoChronicleAppend crea un deadline único y lo comparte entre ambos stores y el owner.
- Se añadieron pruebas de lock vivo retenido para Continuity initialize/commitIfCurrent y Chronicle initialize/append; las pruebas confirman que no se inicia escritura y que el estado canónico no cambia.
- Código/tests en SHA cf62bd858232a8c0c71f21ace6469c2a62f48448; los seis workflows relevantes pasaron:
  - https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455204
  - https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455208
  - https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455212
  - https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455161
  - https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455195
  - https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455201
- Logs de jobs consultados: 118472464797, 118472464632, 118472468527.

### Pendiente inmediato
1. Añadir pruebas deterministas donde mkdir/acquisition resuelva después del deadline; comprobar que no se escribe y sólo se intenta liberar el lock propio.
2. Añadir prueba de fallo de liberación después de adquisición tardía; conservar timeout + lockRelease sin afirmar que el lock se liberó.
3. Revisar todos los callers/entrypoints para asegurar que los resultados de timeout no se aplanan ni provocan redispatch.
4. Ejecutar de nuevo workflows M0 sobre el SHA que incluya esos cambios; registrar los resultados exactos.
5. Mantener M0 INCOMPLETO; authorization NOT_EVALUATED; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.

No volver a auditar el trabajo de lock error normalization que ya está cerrado; no reabrir persistencia-receipt/reconstruction audit; no cambiar a M1 ni STEP 7. La misión sigue siendo M0.


### Follow-up — adquisición tardía cubierta

- Pruebas nuevas para Continuity y Chronicle hacen que mkdir se resuelva después del deadline.
- Verificado: no se inicia escritura; se libera el lock propio; el archivo canónico no aparece.
- También se simula fallo EACCES de liberación en ambos stores; el resultado mantiene timeout y detalle de lockRelease.failed.
- SHA exacto de código/tests: 15415580788c4e823f03371b566e29106268b67d. Seis workflows M0 relevantes terminaron success: 39375730407, 39375730358, 39375730428, 39375730355, 39375730370, 39375730363. Logs de jobs 118473315380, 118473315369 y 118473336472 inspeccionados.
- El siguiente frente es una auditoría dirigida de callers/entrypoints: verificar que los códigos/metadata de timeout no se aplanan y que un timeout posterior a PREPARED/posible dispatch no habilita redispatch. No volver a investigar lock acquisition internals ya cubiertos.


### Follow-up — timeout reaches public boundary; PREPARED remains fail-closed

- The Chronicle handler forwards phase/writeStarted/lockRelease from store timeout results.
- publicChronicleResult preserves timeout evidence nested in prepared/lineage/reconciliation/outcome/adapterResult, without exposing target payloads. CLI JSON emits the sanitized timeout metadata.
- Continuity bootstrap propagates lock-timeout metadata through its thrown-error boundary; application helper preserves the fields.
- Runtime regression test: PREPARED acquisition timeout stays blocked, dispatchAttempted false, redispatchAuthorized false; adapter is not invoked.
- Application tests: timeout while initializing missing Chronicle and while bootstrapping missing Continuity preserve timeout code, phase, and writeStarted:false.
- Current code/tests SHA: 12efac26d0948b91c59706612edec7df9e78c4f5. Six returned workflows succeeded: 39376332936, 39376332981, 39376333167, 39376332991, 39376333035, 39376333016. Logs checked: 118475197653, 118475197877, 118475199164. No mission-admission/restart run was returned for this SHA; don't claim it passed on this exact SHA.
- Remaining: final caller/entrypoint audit outside runNexoChronicleAppend; confirm isolated mutations use bounded per-call defaults and no public surface drops timeout or enables redispatch.


### Caller inventory conclusion

- The stable application API has one mutating use case: runNexoChronicleAppend; it creates and shares one absolute monotonic deadline. Continuity queries use loadCurrent only.
- The Chronicle CLI delegates to the application API and now emits sanitized timeout metadata.
- The separate repair-session/repair-entrypoint path receives owner/store objects by injection; it is not the supported interactive Chronicle route. Canonical owner-backed runtime currently rejects repair actions before PREPARED. Do not activate this repair path as an interactive operation until it has its own shared-deadline propagation and tests.
- No second public stable application boundary composing Continuity + Chronicle stores was found in the inspected source tree. Standalone store mutations remain bounded per call.
- Next M0 decision/work item: explicitly keep the injected repair path outside the active interactive contract, or design/propagate a shared deadline before enabling it. Keep M0 INCOMPLETO, authorization NOT_EVALUATED, protected effects STOP, legitimate root PENDING/UNKNOWN.




## Estado vigente al cierre de auditoría de callers (2026-10-20)

- Rama: `ncs-clean-architecture`. Último head documental previo a esta actualización: `41df13384fe2b30c5d1f9cbbf0a2e806d8d1b58d`; SHA de runtime/tests para timeout público: `12efac26d0948b91c59706612edec7df9e78c4f5`.
- Decisión ya aceptada: deadline inicial configurable de 2.000 ms, monotónico; no garantiza límite estricto de pared.
- Adquisición normal, adquisición tardía y fallo de liberación están cubiertos en ambos stores. La propagación pública, timeout previo a PREPARED y no-dispatch están cubiertos en la ruta Chronicle.
- Seis workflows exactos pasaron en SHA `12efac26d0948b91c59706612edec7df9e78c4f5`: M0 integrated acceptance (39376332936), Chronicle native vertical (39376332981), deterministic persistence (39376333167), repair settlement crash cuts (39376333016), STEP 5 (39376332991), STEP 4 (39376333035). No apareció mission-admission/restart para ese SHA; no contarlo.
- Inventario de callers concluido: la API estable sólo expone Chronicle append mutante y consultas Continuity read-only. CLI delega en Chronicle API.
- La ruta de reparación por scripts/owner-store inyectados queda fuera del contrato interactivo Chronicle. No afirmar que tiene deadline compartido ni activarla como ruta interactiva hasta diseñar y probar su contrato de deadline/settlement/no-redispatch. Nota de frontera: `NEXO_NCS/BUILD/NCS_M0_REPAIR_ROUTE_DEADLINE_BOUNDARY_2026-10-20.md`.
- **Siguiente acción:** continuar el siguiente bloqueo M0 desde `NEXO_NCS/STATUS.md`; no volver a investigar los locks ya cubiertos. No hacer cambios de runtime por la ruta de reparación salvo que exista una necesidad explícita y el contrato esté especificado.
- Estado global permanece M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## Continuación añadida — frontera AuthorityGate (2026-10-20)

Tras el trabajo documental posterior al último checkpoint:

- Nota de frontera de composición: [NCS_M0_AUTHORITY_GATE_IMPLEMENTATION_BOUNDARY_2026-10-20.md](NCS_M0_AUTHORITY_GATE_IMPLEMENTATION_BOUNDARY_2026-10-20.md).
- Reutilización de contratos previos y siguiente puerta: [NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md](NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md).
- Inventario actual de límites de autoridad: [NCS_M0_CURRENT_AUTHORITY_BOUNDARIES_2026-10-20.md](NCS_M0_CURRENT_AUTHORITY_BOUNDARIES_2026-10-20.md).

Hallazgo: el Core protected-transition recibe `authorityGate.check` por inyección; el pipeline valida forma y detiene STOP/UNKNOWN, pero los fixtures AUTHORIZED no prueban autoridad legítima. La API pública mutante sigue limitada a Chronicle append y expone `authorization: NOT_EVALUATED`; consultas de Continuity son read-only. Repair permanece bloqueado antes de PREPARED por el contrato de settlement pendiente; otras acciones nuevas no están habilitadas.

Se reutilizaron —no se repitieron— los contratos ya guardados de Constitution-to-Policy binding, su ataque y Trust Function / Root Role Map. El siguiente paso registrado por esos documentos es un inventario relativo a un claim y efecto concreto: frontera final, regla constitucional, fuente protegida, currentness/revocación/sucesión, dependencias/failure domains y pruebas negativas. No crear una raíz genérica ni implementar el Constitution Authority Context mientras falte una base legítima demostrable.

No hubo cambio de runtime ni ejecución nueva de tests/CI. M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

Nota operativa: el intento de integrar este checkpoint directamente en `NEXO_NCS/STATUS.md` no se completó. No afirmar que STATUS esté actualizado; los tres documentos BUILD enlazados arriba sí se guardaron y verificaron.


## Continuación añadida — inventario relativo al claim Chronicle append (2026-10-20)

Nuevo documento creado en la rama y commit:
- [NCS_M0_CLAIM_RELATIVE_CHRONICLE_APPEND_INVENTORY_2026-10-20.md](NCS_M0_CLAIM_RELATIVE_CHRONICLE_APPEND_INVENTORY_2026-10-20.md)
- Commit que añadió el inventario: `70b0b7f103fd470207796a146f157ace07ab71d9`.

Resultado estático: se trazó la operación mutadora de la API pública estable desde `runNexoChronicleAppend` hasta el handler local, observación/reconciliación y asentamiento terminal. Es una ruta de persistencia local con controles de continuidad; no prueba por sí misma autorización constitucional ni propietario legítimo. No se observó un AuthorityGate conectado a una fuente de raíz legítima antes de esa escritura en los archivos inspeccionados. Esto no se etiqueta como bypass confirmado.

La nota separa garantías locales existentes de pruebas pendientes sobre raíz/procedencia, scope del claim, currentness/epoch, revocación, sucesión, pérdida de dispositivos y fallos/contradicciones. Especifica pruebas negativas necesarias sin afirmar que estén implementadas ni ejecutadas.

No hubo cambios de runtime ni ejecución nueva de CI. No se actualizó `NEXO_NCS/STATUS.md` en este paso; no afirmar lo contrario. Estado M0: `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

Siguiente paso: seguir los contratos STEP 7 existentes para identificar una fuente constitucional ya definida y verificable vinculable a un claim concreto; si no existe, registrar el bloqueo y conservar STOP, sin inventar una raíz nueva ni endurecer de nuevo contratos de forma ya validados.


## Continuación añadida — reuso del cierre Authority Context (2026-10-20)

Se consultó el índice de GitHub sólo para localizar contratos existentes y se leyó en la rama objetivo la auditoría ya cerrada `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md` (blob `e81abbfb35048dcb2cf29f8827db7e67d239adf9`) y la puerta `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` (blob `d5ebabcb05566593e32f3e1f9bf1047f6b99e0c0`).

Resultado: la auditoría existente ya concluye que no hay una ruta actual implementada de autoridad constitucional; la puerta de implementación dice STOP BEFORE CODE hasta que exista una Trust Foundation reconocida. El índice encontró el nombre `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md`, pero el fetch directo en `ncs-clean-architecture` devolvió 404; no tratarlo como archivo presente en esta rama. No repetir la auditoría cerrada ni crear otro contrato genérico.

Se añadió esta precisión a `NCS_M0_CLAIM_RELATIVE_CHRONICLE_APPEND_INVENTORY_2026-10-20.md` (blob nuevo `591d5bfbd4a218adb4501afa9c9570298998b547`, commit `46ade86dc5846f2468be710ce1142d31485a110a`).

**Siguiente bloqueo real:** la raíz inicial y su reconocimiento independiente siguen sin resolución/implementación demostrable. Antes de implementar `createConstitutionAuthorityContext` o un verificador de raíz, hace falta definir y poder verificar cómo se reconoce la raíz inicial y qué evidencia de provisión, currentness y revocación la sostiene. No escoger una raíz por intuición ni dar por resuelta la decisión. Estado no cambia: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`. `NEXO_NCS/STATUS.md` no fue actualizado.


## Corrección de prioridad M0 — decisión de alcance 2026-10-19 + CI mission-status (2026-10-20)

Se recuperó y leyó la decisión existente `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md` (blob `dfb647d07cb28178b3c8a3a8289d8209943db8fd`). Es una decisión aceptada de alcance arquitectónico: raíz criptográfica única y un dispositivo inicial; selección física/provisión/verificación de llave pendientes; pérdida irrecuperable de la llave fuera de alcance inicial; la llave no da permiso ilimitado. La misma decisión fija que **la misión inmediata sigue siendo M0: coherencia entre misión persistida, estados de pasos y reconstrucción/proyección**, revisando CI de `continuity-queries.mjs` y su regresión. No reabrir comparación general de raíces ni reiniciar M0.

Se verificó el workflow dedicado:
- [Nexo M0 — canonical mission status projection, run 39375282715](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375282715), SHA `04a8c5fd417b0a52e2cea2976cf71448f4811e3c`, job y paso de regresión de entrypoint `success`.
- En el test de entrypoint, la misión persistida `completed` con paso `planned` produce `persistedMissionStatus: completed`, `missionStatus: planned`, `statusDiscrepancy: true`; la consulta es read-only y no filtra payload. PREPARED pendiente reconstruye misión/paso como `blocked` y no modifica el snapshot.
- Compare del SHA de ese run con el HEAD documental actual no muestra cambios en `continuity-queries.mjs`, `continuity-operations.mjs`, `tests/nexo/entrypoint.test.mjs` ni el workflow dedicado. Por eso el run aplica a esos bytes; no decir que fue ejecutado sobre el HEAD actual.
- [Deterministic persistence run 39428590480](https://github.com/snowdenxrp/aldea-ia/actions/runs/39428590480) pasó en HEAD documental `d78be9a21fc1cad7d2d19a6ba527ff282be73a38`; no sustituye la regresión dedicada.

Se creó y verificó:
- [NCS_M0_MISSION_STATUS_COHERENCE_CI_REVIEW_2026-10-20.md](NCS_M0_MISSION_STATUS_COHERENCE_CI_REVIEW_2026-10-20.md), commit `831f98d414f4d991ddde4d1e6ae716bfc8e9d7bf`.
- La nota `NCS_M0_AUTHORITY_SOURCE_VS_BOOTSTRAP_RECOGNITION_2026-10-20.md` se actualizó para indicar que su propuesta de revisar el objeto constitucional no reemplaza la prioridad inmediata M0; blob `d346e809985c0337f3f68d9262e673c9f56a7185`, commit `c721d0b46379e57258663ff51b77e0453c535866`.

### Próxima tarea obligatoria
Revisar consumidores de `loadNexoMissionStatus` y CLI `mission-status` para saber si pueden ignorar `statusDiscrepancy` mientras ven `status: reconstructed`. Decidir desde evidencia del consumidor si la discrepancia informada es suficiente o si debe producir una salida fail-closed `blocked`. No mutar snapshot desde una consulta read-only. Si se cambia contrato, añadir regresión dirigida y ejecutar workflow dedicado + regresiones M0 en el SHA exacto. No tocar llave física/bootstrap en este paso.

Estado sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima/implementada sigue sin prueba. `NEXO_NCS/STATUS.md` no se actualizó.


## Continuación M0 — discrepancia de mission-status endurecida selectivamente y CI verde (2026-10-20)

Tras revisar consumidores, se confirmó que `scripts/nexo.mjs` terminaba con exit code 0 si la consulta devolvía `reconstructed`, aunque `statusDiscrepancy` fuera true. Se cambió `src/nexo/application/continuity-queries.mjs` para que una afirmación persistida `completed` no se exponga como proyección utilizable cuando la reconstrucción canónica no confirma `completed`. La respuesta se bloquea con `NEXO_MISSION_STATUS_DISCREPANCY` y conserva diagnóstico mínimo; no incluye pasos ni payload, no modifica el store y la CLI sale con código 1.

**No bloquear toda diferencia:** el primer intento hizo STOP ante cualquier discrepancia y falló la regresión porque una misión persistida como `planned` puede reconstruirse legítimamente como `awaiting_verification`. Evidencia de ese fallo (no PASS): [run 39429434598](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429434598), SHA `b2e446fbba0ca4291dc0fdc3a9a1e008d56f0352`. La regla se afinó para bloquear sólo el sobreclaim terminal persistido `completed` que la reconstrucción no respalda.

Código/tests de la corrección final: SHA `f07840b2222f55124e200c2866789834fa6904dd`.
- [Mission status projection](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700787): SUCCESS.
- [Deterministic persistence](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700840): SUCCESS.
- [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700796): SUCCESS.
- [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700814): SUCCESS.
Se inspeccionaron jobs: la regresión independiente de entrypoint y los pasos M0 de continuidad/reconstrucción/entrypoint terminaron success.

Documento ampliado y verificado: [NCS_M0_MISSION_STATUS_COHERENCE_CI_REVIEW_2026-10-20.md](NCS_M0_MISSION_STATUS_COHERENCE_CI_REVIEW_2026-10-20.md), blob `4531fc68c0d2ccf28c6b063675ad6cad9cd90d18`, commit `64be5fbe8ed9d6fe9d3a9876060ae6f08ea42481`.

### Prioridad a partir de aquí
La discrepancia terminal de mission-status tiene una regresión dedicada y cuatro workflows verdes en el SHA exacto. Siguiente paso: revisar si la reconstrucción/proyección trata coherentemente los estados persistidos de pasos y los resultados/attempts, sólo donde haya un contraejemplo concreto; no reabrir locks ni raíz bootstrap. La decisión de alcance 2026-10-19 de llave única/dispositivo único se conserva; no se seleccionó modelo físico ni se implementó bootstrap.

Estado: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`. `NEXO_NCS/STATUS.md` no fue actualizado.
