# NCS M0 — mapa de APIs y propagación de deadline de lock
Fecha: 2026-10-20
Estado: **mapa de callers actualizado tras implementación inicial; integración global aún pendiente**.
Rama: `ncs-clean-architecture`.

## 1. Fuentes verificadas

- `src/nexo/core/continuity-store.mjs` blob `ecf982a028dcd4e9208eb236e27538eb5b508863`
- `src/nexo/core/chronicle-store.mjs` blob `f441dc538313dd85935b5679547dd69ad242d2a3`
- `src/nexo/core/continuity-owner.mjs` blob `81db34308e3881e3fa900653751a325952eeceb9`
- `src/nexo/core/continuity-service.mjs` blob `9f19377f67103bf0d22f68cab9266c2accacc768`
- `src/nexo/core/owner-backed-runtime.mjs` blob `8397fc41c533a7c5d1ca424ad90c4bd95f8dffa6`
- `src/nexo/application/chronicle-append.mjs` blob `e5ff6c385f3160dfb78982a36c73a15d2d51887d`
- `src/nexo/adapters/chronicle-effect.mjs` blob `b29c26d84c19afa34769f06cedd7d0131e873075`
- `scripts/nexo-chronicle-session.mjs` blob `29f0b2f9f62979e5811afcd051d7624bd55f36fa`
- `tests/nexo/continuity-store.test.mjs` blob `ee9327c706f8b34a7c2a7c632f48cb81776df098`
- `tests/nexo/chronicle-store.test.mjs` blob `a5c80cea31cb7a11f347a998050dcc8e160c9d29`
- `tests/nexo/chronicle-runtime.test.mjs` blob `8532700c63414ebc7a163ff6853958d85f8b93e4`
- `tests/nexo/effect-adapter.test.mjs` blob `602a220cafc31888892a04d31a06d256bf49b455`

## 2. Mutating store API today

| API | Current signature | Current acquisition behavior | Key caller/consumer |
|---|---|---|---|
| Continuity factory | `createNexoContinuityStore({ filePath, fsModule = fs })` | No deadline option | continuity service, Chronicle application, direct tests/scripts |
| Continuity initialize | `initialize(snapshot)` | Lock acquisition before initialization write; returns structured failure | `openNexoContinuityOwner()` |
| Continuity conditional commit | `commitIfCurrent(expectedRevision, candidate)` | Returns structured path failure; throws other acquisition failures | Continuity owner mutation methods |
| Chronicle factory | `createNexoChronicleStore({ filePath, fsModule = fs })` | No deadline option | Chronicle application/effect adapter/direct tests |
| Chronicle initialize | `initialize()` | Lock acquisition before initialization write; returns structured blocked result | `runNexoChronicleAppend()` |
| Chronicle append | `append({ operationKey, content })` | Returns structured parent-path failure; throws other acquisition failures | Chronicle effect handler |

Read-only `loadCurrent()` does not acquire these locks. It may still encounter filesystem latency/failure, so the lock-wait contract must not misrepresent it as deadline-cancellable.

## 3. Propagation chain and missing links

1. Top-level interactive operation: `runNexoChronicleAppend({ continuityPath, chroniclePath, missionId, stepId, content, initializeContinuity, initializeChronicle })`. It creates both stores, preflights both, may initialize either store, admits a mission, and calls `executeNexoStepWithContinuityOwner()`. No deadline/budget parameter exists.
2. Continuity opening: `openNexoContinuityOwner({ filePath, legacyMemory, allowEmptyInitialization, effectVerifiers })` constructs the store and may call `initialize(snapshot)`. No deadline parameter exists.
3. Owner: `createNexoContinuityOwner({ store, effectVerifiers })`. `recordMission`, `recordOutcome`, `recordPrepared`, `recordExecutionLineage`, `reconcilePrepared`, and the remaining persistence paths call `store.commitIfCurrent()` internally. Their argument contracts currently carry operation/revision/evidence, not a deadline.
4. Runtime: `executeNexoStepWithContinuityOwner(args)` delegates to its internal executor. The path can persist PREPARED, lineage, observation/settlement and terminal outcome; the public result wrapper catches surprise errors and tracks whether dispatch was attempted. No deadline is extracted or forwarded.
5. Chronicle handler: `createNexoChronicleEffectContracts({ store }).handler()` calls `store.append({ operationKey, content })`; the handler's public operation contract does not carry a deadline.
6. CLI wrapper: `scripts/nexo-chronicle-session.mjs` calls `runNexoChronicleAppend({ ...args, content })`; no explicit deadline/configuration source is wired there.

## 4. Existing tests and compatibility impact

- `tests/nexo/continuity-store.test.mjs`: initialization and commit contract, lock acquisition failure, stale/unknown locks, same-revision concurrency, cross-process waiting/release, write/rename uncertainty, and lock-release failure receipts.
- `tests/nexo/chronicle-store.test.mjs`: initialization/append, concurrent process waiting, stale/unknown lock, release failures, ambiguous append outcome, revision exhaustion.
- `tests/nexo/chronicle-runtime.test.mjs`: PREPARED/lineage/reconciliation/terminal outcome, restart recovery, bootstrap race, concurrent application calls and no-redispatch behavior.
- Current cross-process tests characterize waiting until lock removal; they do not enforce a bounded wait.
- Existing call sites instantiate stores without deadline parameters. A safe change cannot silently default missing deadlines to infinity after the user chose A, nor may it pick an undocumented arbitrary timeout. The top-level deadline/budget policy and API migration must be resolved before enabling the new contract.
- The owner has multiple direct commit sites (including mission, outcome, PREPARED, execution lineage and observation/reconciliation). Passing a deadline only into `commitIfCurrent` is insufficient if nested owner methods fail to forward it. Passing separate relative budgets at each layer is also incorrect because it restarts the clock.

## 5. Minimal design direction

- Prefer an operation-scoped monotonic deadline, created once at the top-level application/runtime boundary and passed through options to every mutating store call in that operation. Use the same deadline for Continuity and Chronicle; do not store a deadline permanently in a factory that may be reused across unrelated operations.
- Keep lock-staleness age checks separate: current `Date.now()` use for lock age is wall-clock metadata and must not be reused for elapsed wait calculations.
- Deadline expiry before acquisition should be a distinct structured domain result. At store level, preserve the different established method contracts where feasible, but audit each caller's handling before finalizing whether a method returns status or throws.
- No timeout should interrupt filesystem writes/rename after lock acquisition. If the `mkdir` attempt resolves successfully only after the deadline has passed, release the lock only if ownership token proves it belongs to this operation, do not start protected write phase, and return acquisition timeout; represent release failure separately.
- No lock release error, persistence receipt, or existing UNKNOWN state may be flattened. PREPARED not confirmed means no dispatch; after prior PREPARED/possible external effect, reconcile canonical state and never redispatch because of timeout.

## 6. Blocking product/configuration requirement

A bounded policy needs one finite configured budget. No authoritative value or existing deadline configuration was found in the inspected sources; repository search found no existing `performance.now()/deadline` or `AbortSignal.timeout` implementation to reuse. Do not invent a default number. The architecture can carry a caller-owned absolute deadline without embedding a number in stores, but the actual first-version application entry point still needs an explicit finite budget/configuration before bounded behavior can be activated.

Recommended next step: choose where the first-version budget is configured (application/runtime config, supplied by host) and define its finite value/policy; then implement the shared deadline helper and the contract tests. Do not implement an unbounded fallback for omitted deadline.

## 7. State

This is static API/caller mapping, not runtime proof. No runtime/tests changed and no CI was run for this document.
- M0: `INCOMPLETO`
- `authorization: NOT_EVALUATED`
- Protected effects: `STOP`
- Legitimate root: `PENDING/UNKNOWN`

Related:
- `NEXO_NCS/BUILD/NCS_M0_BOUNDED_LOCK_WAIT_CONTRACT_2026-10-20.md`
- `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md`


## 6. Actualización tras implementar deadline inicial (2026-10-20)

- `src/nexo/core/lock-deadline.mjs` centraliza reloj monotónico y default configurable de 2.000 ms.
- `createNexoContinuityStore` y `createNexoChronicleStore` aceptan `lockDeadline` (deadline absoluto compartido) y `lockWaitMs` (presupuesto por mutación cuando no hay deadline compartido).
- `runNexoChronicleAppend` crea un deadline único al inicio de la operación validada y lo pasa a ambos stores y a `openNexoContinuityOwner`; el owner usa el store configurado con ese deadline para todas sus mutaciones.
- `initialize`/`commitIfCurrent`/`append` devuelven resultado estructurado para timeout de adquisición, con `phase:"lock_acquisition"` y `writeStarted:false`; Chronicle handler ya propaga el código de bloqueo del store.
- Pruebas añadidas para lock vivo retenido en las cuatro APIs. Los seis workflows M0 relevantes pasaron en el SHA de código/tests `cf62bd858232a8c0c71f21ace6469c2a62f48448`.
- Pendiente: adquisición tardía tras deadline y liberación fallida, más comprobación de propagación por otras fronteras/entrypoints. No afirmar límite de pared estricto.


### Adquisición tardía verificada

- Pruebas en ambos stores inyectan un `mkdir` que resuelve tras el deadline.
- Resultado verificado: timeout con `writeStarted:false`, archivo canónico ausente y liberación del lock propio.
- Pruebas adicionales hacen fallar `rm` del lock tardío; el timeout conserva `lockRelease.status:"failed"` y el código EACCES, sin afirmar limpieza.
- SHA código/tests: `15415580788c4e823f03371b566e29106268b67d`; seis workflows relevantes pasan (runs 39375730407, 39375730358, 39375730428, 39375730355, 39375730370, 39375730363).
- El punto de auditoría pendiente ya no es el comportamiento interno de adquisición tardía; es la preservación del timeout a través de los callers/entrypoints y las garantías de no-redispatch en el runtime completo.


### Propagación pública y no-dispatch verificados (2026-10-20)

- La aplicación pública conserva phase/writeStarted/lockRelease para timeouts de inicialización y admisión.
- El handler Chronicle propaga metadata de timeout de append; el runtime owner-backed mantiene `dispatchAttempted:false` y no invoca el adapter cuando PREPARED no queda confirmado.
- La proyección pública puede conservar el código del timeout incluso cuando está anidado en lineage/outcome/adapter result; la CLI Chronicle ahora emite phase, writeStarted, lockRelease y lockAcquisitionCode sin exponer rutas ni payloads.
- Se añadieron pruebas sintéticas de proyección pública, handler y runtime PREPARED timeout, además de pruebas de integración de timeout durante inicialización de ambos stores.
- Código/tests validado en SHA `12efac26d0948b91c59706612edec7df9e78c4f5`; seis workflows relevantes en success (runs 39376332936, 39376332981, 39376333167, 39376332991, 39376333035, 39376333016). Logs de jobs 118475197653, 118475197877 y 118475199164 inspeccionados.
- Queda por hacer auditoría final de otras entrypoints que construyen stores/owners fuera de la ruta Chronicle compuesta; las mutaciones aisladas ya están acotadas por llamada por el default del store, pero sólo esta operación compuesta tiene deadline compartido explícito.


### Resultado de auditoría adicional de entrypoints

- `src/nexo/application/index.mjs` declara una sola operación mutante estable: `runNexoChronicleAppend`; esta ruta comparte un deadline absoluto.
- `src/nexo/application/continuity-queries.mjs` usa `loadCurrent()` solamente; no adquiere lock de escritura.
- `scripts/nexo-chronicle-session.mjs` delega en la operación pública Chronicle; su salida CLI ya conserva los campos de timeout sanitizados.
- `scripts/nexo-repair-session.mjs` y `scripts/nexo-repair-entrypoint.mjs` reciben owner/store inyectados y son una ruta de reparación separada; no crean los stores de Chronicle interactivo. El runtime canónico actual bloquea acciones de reparación antes de PREPARED. **No activar esa ruta como operación interactiva hasta definir/propagar un deadline compartido propio y probar sus resultados.**
- `src/nexo/runtime.js` legacy usa memoria/adapter y no construye estos stores en el flujo inspeccionado.
- Conclusión: no se encontró otra frontera pública estable que construya ambos stores para una operación compuesta. La única ruta compuesta actualmente soportada por la API de aplicación es Chronicle; el resto de mutaciones directas recibe presupuesto por mutación, y la ruta de reparación inyectada permanece fuera del alcance activo y no debe considerarse lista para activación.


### Frontera operativa final de reparación (2026-10-20)

La auditoría de callers de la API estable queda completada. Ver [NCS_M0_REPAIR_ROUTE_DEADLINE_BOUNDARY_2026-10-20.md](NCS_M0_REPAIR_ROUTE_DEADLINE_BOUNDARY_2026-10-20.md).

- Sólo `runNexoChronicleAppend` es la operación mutante compuesta exportada por la API pública actual; comparte deadline.
- La ruta de reparación inyectada no pertenece a ese contrato ni hereda su deadline. El runtime canónico bloquea repair antes de PREPARED; los scripts de reparación separados no deben describirse como globalmente inhabilitados ni como cubiertos por deadline.
- Límite operativo: no añadir la ruta de reparación a la API interactiva ni activarla hasta diseñar deadline único y probar toda la secuencia PREPARED/dispatch/lineage/settlement/no-redispatch.
- Esta es una frontera fail-closed basada en el código actual, no una decisión de habilitar la reparación.
