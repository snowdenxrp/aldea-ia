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
