# NCS M0 — continuidad de regresiones del store (2026-10-19)

Estado: seis regresiones de frontera añadidas a `tests/nexo/continuity-store.test.mjs`; suite determinista e integración M0/STEP 4/STEP 5/continuidad de misión CI SUCCESS en commit `24d1879192a6227013b805a069585c298760019f`. M0 permanece INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

## Evidencia revisada
- `src/nexo/core/continuity-store.mjs` blob `c5d8151a97a9d97315671d109f0e6e73a7e0d38e`
- `tests/nexo/continuity-store.test.mjs` blob previo `b61df0f7490e7d70ab821300febd680d0e7ed806`; blobs actualizados `b05212f399c506b09f099c3cfafadaf5f842d0cf` y `9fc3f5412d248c986104673aaae9ce7b771d44ee`
- `tests/nexo/chronicle-runtime.test.mjs` blob `873d38bf7fd19b8c90ec5e48c9fbfec87ffe0777`
- `tests/nexo/continuity-contract.test.mjs` blob `5b8f7e9a5fe7084a850fb0bb0d26263e573ca33b`

## Cobertura ya localizada
El test del store cubre estado ausente, padre no disponible, conflicto concurrente, respuesta perdida de initialize, fallo confirmado de initialize, revisión agotada, lock stale, contención cross-process, fallo transitorio/persistente de liberación, JSON corrupto y rechazo de campos desconocidos.

Los tests de runtime cubren PREPARED UNKNOWN sin invocar adapter y bloquean redispatch en varias rutas post-dispatch. Además, `repair-settlement-crash-cuts.test.mjs` blob `60e2486698cee7a029902aa9ee09df90707fe0eb` cubre respuesta perdida a nivel caller: el commit real se completa, el wrapper devuelve UNKNOWN/lanza y el replay recupera el registro sin volver a invocar el verifier. Eso no equivale a inyectar una excepción en el rename interno de `writeEnvelope()`; no duplicar las pruebas de caller.

## Gaps a localizar en la suite completa
| Caso | Expectativa | Estado |
|---|---|---|
| commit condicional falla antes del reemplazo y lectura confirma revisión anterior | failed confirmado; estado anterior intacto | Añadido en `9c56d35...`; CI SUCCESS |
| rename de commit condicional aplica candidato y después lanza dentro de `writeEnvelope()` | Store devuelve committed solo si lectura canónica exacta confirma revisión y snapshot | Añadido en `9c56d35...`; CI SUCCESS |
| commit falla y no se puede leer el estado canónico | UNKNOWN; no asumir rollback ni commit | Añadido en `9c56d35...`; CI SUCCESS |
| error no normalizado al adquirir lock | fijar y probar diferencia entre initialize y commitIfCurrent | Añadido test de caracterización en `9c56d35...`; CI SUCCESS. La API mixta queda explícita, no aprobada como diseño final. |
| lectura del envelope falla dentro de commit | no sobrescribir; conservar incertidumbre | Añadido en `24d1879...`; CI SUCCESS |
| liberación devuelve not_owned | fallo exterior, preservando estado de persistencia | Añadido en `9c56d35...`; CI SUCCESS |

“No localizado” se refiere al archivo de test del store; no implica ausencia en todos los tests.

## Decisión
No normalizar todavía la API mixta. Primero localizar estos escenarios en runtime/contract/migration tests; añadir solo los realmente ausentes. No tocar runtime hasta que las expectativas estén cerradas.

## Invariantes
- Un commit recuperado tras error exige lectura canónica válida que coincida exactamente con revisión y snapshot candidatos.
- Si no puede conocerse el estado canónico, resultado UNKNOWN.
- Un fallo de liberación no borra la persistencia confirmada ni autoriza handoff exitoso.
- Ningún resultado del store demuestra autoridad constitucional.
- PREPARED incierto bloquea dispatch; incertidumbre post-dispatch bloquea redispatch.
- No añadir BUSY, timeout, cancelación, lease, heartbeat ni recuperación automática por conveniencia.

## Próxima acción
Cruzar los gaps con todos los tests relevantes y workflows; ejecutar solo después de identificar la cobertura faltante y registrar SHA, run/job y logs. Este documento es una revisión, no evidencia de ejecución.

## Hallazgo estático adicional — owner record ilegible

`readLockOwner()` captura cualquier error de lectura/parsing de `owner.json` y devuelve `null`. `acquireLock()` entonces decide con la edad del directorio: si puede confirmar que el lock es stale, devuelve `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED` sin borrarlo; si no puede obtener una edad válida porque `stat()` falla, `age` permanece en cero y el bucle puede seguir esperando. No se cambió esta semántica ni se añadió timeout/BUSY, porque no existe contrato acordado para ese caso. Requiere una prueba específica y una decisión de contrato antes de tocar runtime.

Clasificación: brecha de caracterización del lock, no permiso para reclamar/borrar locks ajenos. La API mixta de adquisición continúa explícitamente caracterizada, sin aprobación de diseño final.

## Corrección compartida — fallo al inspeccionar antigüedad del lock (2026-10-19)

- Causa raíz confirmada en Continuity y Chronicle: `acquireLock()` absorbía cualquier error de `stat(lockPath)`, dejaba `age = 0` y repetía el bucle sin límite. Si el filesystem no permitía inspeccionar el lock, el sistema no podía distinguir esa incertidumbre de contención normal.
- Continuity: [fix `838f9032dcaf`](https://github.com/snowdenxrp/aldea-ia/commit/838f9032dcaf4ca4eed7c13c61735604099d8d03), error explícito `NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN`.
- Chronicle: [fix `5b349cf84793`](https://github.com/snowdenxrp/aldea-ia/commit/5b349cf847932f79ff94a751f7494f0eecdf7862), error explícito `NEXO_CHRONICLE_LOCK_STATE_UNKNOWN`.
- Regresiones: Continuity [`140238c6d43d`](https://github.com/snowdenxrp/aldea-ia/commit/140238c6d43d9a4da8b9cf3f3427b021fa5cedf5), Chronicle [`c5ffff237b6c`](https://github.com/snowdenxrp/aldea-ia/commit/c5ffff237b6c9933030a12308aab066aa968cb32). Ambos tests simulan `stat()` con `EACCES`, exigen fallo estructurado, lock preservado y almacén canónico no creado.
- CI para SHA exacto `c5ffff237b6c9933030a12308aab066aa968cb32`: persistencia [run 39357200273](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200273) SUCCESS, job `tests`, paso `Run tests`; Chronicle native vertical [39357200274](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200274) SUCCESS; integrated M0 acceptance [39357200292](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200292) SUCCESS; STEP 4 [39357200316](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200316) SUCCESS; STEP 5 [39357200276](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200276) SUCCESS; bounded mission admission/restart [39357200280](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200280) SUCCESS.
- No se añade timeout/BUSY ni se borra un lock que no pertenece a esta operación. El error explícito detiene la adquisición cuando la edad no puede conocerse; el comportamiento público sigue sujeto a los contratos existentes de cada store.
- Límite: no es una prueba de durabilidad ante pérdida de energía, ni de autoridad constitucional. M0 continúa INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

## Crosswalk de errores de adquisición hacia callers (inspección estática, 2026-10-19)

| Operación del owner | El store lanza error de adquisición | Contención del caller observada | Riesgo de redispatch observado |
|---|---|---|---|
| `recordMission()` | Propaga `commitIfCurrent()` | `runNexoChronicleAppend()` captura y devuelve resultado bloqueado | No dispatch; `dispatchAttempted:false`, `redispatchAuthorized:false` |
| `recordPrepared()` | Propaga | `runNexoOwnerBackedRuntime()` captura y devuelve `unknown` con `preparedCommitted:UNKNOWN` | No dispatch sin confirmación explícita de PREPARED |
| `recordOutcome()` | Propaga | Runtime captura y clasifica el resultado terminal como incierto | No habilita redispatch |
| `recordExecutionLineage()` | Propaga | Runtime captura como incertidumbre post-dispatch | `dispatchAttempted:true`, `redispatchAuthorized:false` |
| `reconcilePrepared()` | Captura localmente | Devuelve `blocked` con incertidumbre de commit de observación | No redispatch |

Conclusión: la asimetría pública existe y es real, pero los callers inspeccionados contienen los errores de modo conservador; no se observó una ruta que convierta un error de adquisición en confirmación de PREPARED o permiso de redispatch. Por tanto, **no normalizar la API sólo por simetría estética**. La decisión pendiente es si el contrato de cada store debe ser uniforme en una revisión arquitectónica explícita; cualquier cambio debe mantener estas invariantes y añadir regresiones de caller.

## Chronicle — fallo de liberación del lock no debe ocultar el resultado persistido (2026-10-19)

- **Defecto observado:** el release de Chronicle sólo intentaba borrar el lock si `owner.json` devolvía el token esperado, pero no informaba `not_owned`; además, `initialize()` y `append()` ignoraban el resultado de la liberación. Así, una escritura confirmada podía devolverse como `committed` aunque el lock no se hubiera liberado.
- **Corrección:** [`8b1449b27c85`](https://github.com/snowdenxrp/aldea-ia/commit/8b1449b27c8569a39d9d97c9cf400c979f3b6e10) hace que release devuelva `released`, `not_owned` o `failed`; el resultado público queda `blocked / NEXO_CHRONICLE_LOCK_RELEASE_FAILED` cuando la liberación no se confirma, preservando `persistenceStatus`, `storeRevision` y `lockRelease`.
- **Regresiones:** [`56550161e23e`](https://github.com/snowdenxrp/aldea-ia/commit/56550161e23efef3803924081a010aafde52c5d9) cubre `not_owned`; [`9d0da479b390`](https://github.com/snowdenxrp/aldea-ia/commit/9d0da479b390bc66e4072f752705cc8b05dff884) cubre fallo de cleanup `EACCES`. Ambas verifican que el registro quedó persistido, pero el handoff público está bloqueado y el lock no se borra si no pertenece a la operación.
- **Red/green conservado:** integrated acceptance falló en [run 39357529773](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357529773), SHA `56550161...`, porque la primera versión de lock-state fail-closed clasificó una carrera legítima: el owner podía borrar el lock entre `mkdir` → `EEXIST` y `stat()`, haciendo que `stat` devolviera `ENOENT`. No ocultar este fallo.
- **Corrección de carrera:** Continuity [`e986e3bd49f5`](https://github.com/snowdenxrp/aldea-ia/commit/e986e3bd49f59c50f7bb3cb0b8a31f043186eb56) y Chronicle [`5502ea6a7a29`](https://github.com/snowdenxrp/aldea-ia/commit/5502ea6a7a29b8e85f9fd9d8ded105cc3b786d05) ahora reintentan sólo si `stat()` da `ENOENT` (lock desapareció); cualquier otro error sigue siendo `LOCK_STATE_UNKNOWN`.
- **CI SUCCESS en SHA exacto `5502ea6a7a29b8e85f9fd9d8ded105cc3b786d05`:** persistencia [39357619819](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357619819); Chronicle native [39357619856](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357619856); STEP 5 [39357619906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357619906); STEP 4 [39357619967](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357619967); bounded admission/restart [39357620002](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357620002); integrated M0 acceptance [39357619948](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357619948); repair settlement crash cuts [39357619896](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357619896). Todos SUCCESS.
- Alcance: fixes de resultado de liberación y de clasificación de carrera; no prueba de durabilidad ante pérdida de energía ni de autoridad constitucional. M0 permanece INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.
