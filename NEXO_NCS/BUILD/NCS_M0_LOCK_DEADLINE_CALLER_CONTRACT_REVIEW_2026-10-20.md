# NCS M0 — caller contract for bounded lock acquisition

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Tipo: inspección estática dirigida de implementación y callers; no cambia runtime. Se debe leer con el addendum de `NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md`.

## Alcance y fuentes

| Fuente | Blob | Hallazgo |
|---|---|---|
| `src/nexo/core/lock-deadline.mjs` | `60f80eeb5f213fff539f5e4224a387898899d668` | Presupuesto predeterminado de 2.000 ms; deadline monotónico local al proceso. No interrumpe una operación de filesystem que no retorna. |
| `src/nexo/core/continuity-store.mjs` | `9b2bf50c26a76826f40f6761e07c1537db284262` | `initialize()` y `commitIfCurrent()` devuelven `failed / NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT`, `phase: lock_acquisition`, `writeStarted: false`. `initialize()` normaliza otros errores de adquisición; `commitIfCurrent()` todavía puede propagar excepciones OS no-path. |
| `src/nexo/core/chronicle-store.mjs` | `924742e0a999fb0291dafcc67c5f0b250548339b` | Mismo patrón acotado, con `NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT`. |
| `src/nexo/core/continuity-service.mjs` | `77733d2ed20586eeff1c7a60858a1d793b3c773c` | Al inicializar el store, cualquier resultado que no sea `committed` o `conflict` se convierte en excepción tipada; no entrega un owner parcialmente inicializado. |
| `src/nexo/application/chronicle-append.mjs` | `ccb09c6874b9173963811073150c87b75f53bf2f` | Crea un deadline monotónico y lo comparte con Chronicle, Continuity y el owner anidado. Errores de apertura/inicialización se convierten en resultado público bloqueado. `recordNexoMissionSafely()` captura excepciones y produce `UNKNOWN`, `dispatchAttempted: false`, `redispatchAuthorized: false`. |
| `src/nexo/core/owner-backed-runtime.mjs` | `8c697ea2944e19cce90bf7833f4ba392fee83818` | `recordPrepared()` está envuelto en try/catch; excepción ⇒ `unknown`, sin dispatch. La ruta de resultado estructurado exige `status === "committed"`, `preparedCommitted === true` y revisión sucesora exacta antes de llamar al adapter. Después de dispatch, los fallos de lineage/reconciliación/resultado terminal retornan UNKNOWN o bloqueado y `redispatchAuthorized: false`. |
| `src/nexo/core/continuity-owner.mjs` | `81db34308e3881e3fa900653751a325952eeceb9` | Los métodos de escritura delegan en `commitIfCurrent()`; la superficie de excepción no es idéntica entre todos los métodos. El runtime owner-backed captura los errores en los límites críticos revisados. |
| `scripts/nexo-repair-entrypoint.mjs` | `74d0fa92c447034e7454b7b846d584819ac81ffd` | Observa el estado persistido antes de considerar redispatch; excepciones de lectura/lineage/settlement se convierten en resultado bloqueado/UNKNOWN. |
| `scripts/nexo-repair-settlement.mjs` | `2f6e91d494b4edb012c2b2db5a077b875c5b0348` | Si `commitIfCurrent()` lanza, devuelve `blocked` con `settlement_commit_outcome_unknown`; sólo declara `settled_observed` tras confirmación `committed`. |
| `tests/nexo/chronicle-runtime.test.mjs` | `cb2c2397bba3dd11a1a15a81cca65ca498e385f6` | Tiene regresiones de propagación del timeout en límites de Chronicle y comprobaciones de no dispatch cuando el PREPARED no queda confirmado. |
| `tests/nexo/continuity-store.test.mjs` | `f50382fc7d57bacd43dcc888812ceb1bf7fdce76` | Comprueba timeout explícito en `initialize()` y `commitIfCurrent()` con `lockWaitMs: 25`; también caracteriza la asimetría de errores no-path. |

## Matriz caller → fallo → comportamiento

| Caller/capa | Timeout estructurado | Excepción no-path de adquisición | Riesgo de dispatch/redispatch observado |
|---|---|---|---|
| `openNexoContinuityOwner()` | El resultado failed/timeout se transforma en error tipado; no entrega owner | Propaga la excepción si viene de una llamada que la lanza | No entrega owner inicializado; el caller de aplicación lo bloquea |
| `runNexoChronicleAppend()` preflight/open/init | Devuelve resultado bloqueado, preservando el código; un timeout nested se conserva en la frontera pública | Captura apertura/initialización; la admisión usa `recordNexoMissionSafely()` | No se despacha si admisión no se confirma |
| `recordNexoMissionSafely()` | Resultado no comprometido cae en la rama de fallo/bloqueo | Captura y devuelve UNKNOWN con dispatch/redispatch false | No |
| `executeNexoStepWithContinuityOwner()` | Timeout de PREPARED no satisface el requisito exacto de committed | Captura excepción de PREPARED y devuelve UNKNOWN | No se llama al adapter sin confirmación explícita de PREPARED |
| `executeNexoStepWithContinuityOwner()` después de dispatch | Timeout/error de lineage o reconciliación queda UNKNOWN/bloqueado | Captura y evita exponer excepción cruda | No autoriza redispatch; el efecto externo puede seguir siendo UNKNOWN |
| `runNexoRepairSettlement()` | Resultado no committed no se marca como settlement verificado | Captura y devuelve blocked/uncertainty | No se afirma settlement |

## Conclusión acotada

En los caminos críticos revisados no encontré una rama que transforme el timeout de adquisición en éxito ni que autorice dispatch/redispatch sin confirmación de persistencia. Los callers de Chronicle y reparación revisados fallan cerradamente; las pruebas existentes ya cubren timeout y no-dispatch en el límite Chronicle.

La asimetría de error entre `initialize()` y `commitIfCurrent()` sigue siendo real: una excepción OS no-path puede salir de `commitIfCurrent()`, aunque los callers críticos inspeccionados la capturan. No hay evidencia en esta revisión que justifique uniformar el contrato del store. Mantenerlo como requisito de diseño abierto, no como bug demostrado.

Limitaciones: inspección estática de rutas nombradas; no es una demostración exhaustiva de todos los usos externos del módulo ni sustituye CI. No se modificó runtime ni se ejecutaron pruebas en esta revisión.

Estado M0: `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.
