## 1D. Outcome directo bloqueado mientras PREPARED siga abierto (CI pendiente)

- Commit `d2d96e66e1870c24af31a8b78273d4b33909e999` amplía `tests/nexo/repair-settlement-crash-cuts.test.mjs`: `recordOutcome(... status: completed)` contra un paso cuyo efecto sigue `prepared` debe responder `blocked / NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`; el journal sigue `prepared` y no se crea un attempt.
- La protección cubre el bypass directo además de `reconcilePrepared()` con observación del caller. No implementa settlement genérico.
- Checks del SHA: `statuses: []`; el resultado de CI permanece PENDING/UNKNOWN.

## 1C. Guard adicional: observación del caller no liquida PREPARED (CI pendiente)

- Commit `df10a6466f23903d5b9a1c7ed2992be5a635bb59` añade una regresión en `tests/nexo/repair-settlement-crash-cuts.test.mjs`: se llama `owner.reconcilePrepared()` con una observación inventada por el caller (`desired_state_present`) y se exige `blocked / NEXO_EFFECT_RECONCILIATION_REQUIRED`, `verified: false` y journal todavía `prepared`.
- Esto congela la frontera fail-closed del owner; no implementa settlement genérico. La implementación real requiere un contrato de reconciliación/verificador confiable por acción, ligado al estado ambiental persistido tras reinicio.
- Checks consultados para el SHA nuevo: `statuses: []`. Run y resultado CI siguen PENDING/UNKNOWN. No afirmar PASS hasta observar el run/log.

# NCS / M0 — Handoff de recuperación para el siguiente chat
Fecha: 2026-10-18
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
Último commit de código probado: `3f655a3f239ecaf87d4ba3dd1504bdfffa9a33df` (el commit documental de continuidad se registra después).

## 0. Instrucción de entrada y misión

La palabra para iniciar un chat nuevo es exactamente **`NCS`**.

La misión real es **M0: construir una continuidad operativa propia de Nexo, independiente de Lúmina, y conectarla de forma segura al runtime real**. No reiniciar investigación, no volver a ejecutar auditorías cerradas, no desviar a M1 ni reabrir STEP 7 salvo dependencia demostrada.

Ruta de trabajo del repo: `STATUS → MASTER/CORE → BUILD → trabajo`. Leer primero `NEXO_NCS/STATUS.md` y este handoff; después inspeccionar solo el siguiente límite no resuelto. Los resúmenes previos ya contienen el historial extenso.

## 1A. Cambio posterior: replay de settlement tras respuesta perdida (CI pendiente)

Se endureció la recuperación de `settlePreparedRepairFromPersistedState()`:

- Si el commit del settlement se aplicó en el store, pero el caller recibió `UNKNOWN`, el replay puede consultar el journal canónico aunque la revisión actual ya haya avanzado.
- Solo recupera `settled_observed` si el registro almacenado tiene el tipo/fuente/observación esperados, conserva la revisión PREPARED y la revisión ambiental observada es la misma o la inmediatamente siguiente; `causalAttribution` debe seguir en `not_claimed`.
- No repite escritura ni dispatch. Un PREPARED todavía no liquidado sigue requiriendo coincidencia exacta de revisión; en caso contrario se devuelve conflicto.
- Regresión nueva en `tests/nexo/repair-settlement-crash-cuts.test.mjs`: el store confirma internamente el commit y el wrapper devuelve UNKNOWN; el segundo intento con revisión esperada original recupera el settlement registrado.
- Commits: `1acf070385134ecbb6eeef78b7cec43b8a4a4916` (lógica), `b572724ec18e22b9f2f5fe10cd2e50e851e4fb84` (recuperación aun cuando la revisión canónica avanzó), `3bc02acc1a1293e9c7726f44bf04cdbf4ad99724` (regresión).
- **Validación pendiente:** no se ha observado un run CI asociado al último commit. No declarar la regresión PASS hasta obtener evidencia de ejecución.

**No confundir este cambio con el settlement genérico de M0.** Es un arreglo de idempotencia/recuperación en el reconciliador repair-only existente. El siguiente trabajo sigue siendo el contrato genérico por acción, guiado por pruebas, sin callback de reconciliación libre ni evidencia que el caller pueda autoafirmar.

## 1B. Workflow focal de CI añadido; run aún no verificado

- Workflow: `.github/workflows/nexo-m0-settlement-replay.yml`.
- En push a `ncs-clean-architecture` cuando cambian el reconciliador, el test o el workflow; también admite `workflow_dispatch`.
- Ejecuta Node 22 y `node tests/nexo/repair-settlement-crash-cuts.test.mjs`.
- Commit de creación: `cd8daa099f6778ef80d19cbdde51a8fbf010cda5`. El workflow y la sección de regresión fueron recuperados desde GitHub y confirmados en la rama.
- La consulta inmediata de checks no mostró estados; la vista de Actions no pudo consultarse desde la herramienta web. Por eso, **run/resultado CI siguen UNKNOWN/PENDING**, no PASS. No se inventa run ID.
- STATUS ya registra esta frontera. El commit posterior que actualiza documentación no está incluido en el SHA de la ejecución que se espera del trigger.

## 1. Estado real al detenerse

- **M0: INCOMPLETO.** Hay un owner/store canónico de continuidad, admisión PREPARED, lineage, settlement separado y una ruta limitada de reparación con pruebas de reinicio/crash.
- **No se ha completado el cutover del runtime genérico** en `src/nexo/runtime.js`. No afirmar que Nexo ya usa continuidad canónica en todas las ejecuciones.
- `scripts/nexo-runtime-session.mjs` y `scripts/nexo-repair-session.mjs` constituyen una ruta estrecha, opcional y repair-only; no son un dispatcher general de producción.
- **Efectos protegidos: STOP.** STEP 7 sigue OPEN / STOP / UNKNOWN. No confundir tests que inyectan autorización con autoridad legítima demostrada.
- **Nexo y Lúmina deben permanecer separados.** No guardar memoria operativa de Nexo dentro del estado de simulación de Lúmina; no reclamar atomicidad entre stores/archivos.
- `settled_observed` solo indica observación y liquidación según el contrato actual; no demuestra causalidad ni finalización de misión. No añadir `goalObservations` sin requisito arquitectónico explícito.

## 2. Último cambio probado y CI

### Excepción al confirmar PREPARED

Se encontró que `owner.recordPrepared()` podía persistir PREPARED y después lanzar una excepción antes de devolver confirmación. La llamada no debe asumir que el commit falló ni despachar con estado incierto.

- Prueba primero: [run 39160592605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160592605), SHA `3b066758fe3313b56344a26e0c64bf3ef5d5d7c1`, falla como se esperaba.
- Corrección: `scripts/nexo-repair-preparation.mjs` devuelve bloqueo estructurado, preserva el código, marca `preparedCommitOutcome: unknown` y `uncertainty: prepared_commit_outcome_unknown`; `scripts/nexo-repair-entrypoint.mjs` propaga la incertidumbre y establece `dispatched: false`.
- Código + regresión validados: SHA `6300f8cb60fe18568e3ebd58e3ca1ee5b70d3d51`; [run 39160656605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160656605) SUCCESS.

### Excepción durante commit de settlement

La prueba añadió una excepción de `store.commitIfCurrent()` después de persistir entorno y lineage. El primer CI reprodujo el escape crudo: [run 39155348004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155348004), SHA `51c0ed94a7362133ddb9a29bd97e15b310dc298d).

La ruta ahora captura la excepción en la frontera concreta de settlement y devuelve `blocked`, el código original, información de dispatch/lineage y una incertidumbre explícita. La implementación del settlement también trata el fallo del commit como resultado no confirmado; no supone si la escritura llegó a almacenamiento durable.

- Código + regresión del entrypoint: SHA `8d37f804901d410ad5e32c0bc842729d53c8593e`; [run 39160463984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160463984) SUCCESS.
- Corrección adicional del settlement y regresión: SHA `67048ebbdd30b49000f3a2bfea5e6a3ef0eb1b74`; [run 39155469445](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155469445) SUCCESS.
- En el HEAD observado, el código de `scripts/nexo-repair-entrypoint.mjs` contiene el manejo de excepción y la regresión está en `tests/nexo/repair-owner-lifecycle.test.mjs`.

### Otras fronteras ya cubiertas — no repetir auditorías

- Recarga del owner después de confirmar PREPARED: bloqueo estructurado, obligación conservada y cero dispatch. SHA `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`; [run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS.
- Fallo al persistir execution lineage después de dispatch: incertidumbre explícita; no se intenta settlement/redispatch en esa invocación. SHA `209dde321dbca3bc755e8ee89948ec94db2be2e6`; [run 39154037675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39154037675) SUCCESS.
- Owner rechaza PREPARED nuevo si la misión no está `planned`, el paso no está `planned` o las dependencias no están `completed`. Códigos: `NEXO_PREPARED_MISSION_NOT_RUNNABLE`, `NEXO_PREPARED_STEP_NOT_RUNNABLE`, `NEXO_PREPARED_DEPENDENCIES_UNMET`. SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d`, cuatro suites verdes: STEP 4 [39153137708](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137708), STEP 5 [39153137599](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137599), repair crash cuts [39153137714](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137714), bounded admission/restart [39153137611](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137611).
- Replay contradictorio de outcome bloqueado con `NEXO_OUTCOME_RESULT_MISMATCH`; SHA `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3`, cuatro suites verdes documentadas en STATUS/master handoff.

## 2A. Dispatch adapter crash — cerrado con prueba (2026-10-18)

- `scripts/nexo-repair-dispatch.mjs` ahora inyecta `adapterFactory` para prueba y captura excepciones al crear/ejecutar el adapter. Devuelve `blocked / NEXO_REPAIR_ADAPTER_OUTCOME_UNKNOWN` con incertidumbre `adapter_call_may_have_applied_effect_before_throwing`; no supone que no hubo efecto, no hace retry y no altera la revisión ambiental ni liquida PREPARED.
- `tests/nexo/repair-owner-lifecycle.test.mjs` comprueba el adapter lanzando, la revisión ambiental conservada y la obligación `prepared` persistente en el owner.
- Primer intento: run 39167516878 falló por una clave idempotente de fixture no canónica. Se corrigió a `mission-owner-lifecycle:step-repair`; el código quedó probado en commit `3f655a3f239ecaf87d4ba3dd1504bdfffa9a33df`, con [repair crash cuts 39167557221 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167557221), [STEP 4 39167557187 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167557187) y [STEP 5 39167557073 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167557073).

## 2C. Gate contractual del runtime genérico registrado

Nuevo documento: `NEXO_NCS/BUILD/NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md`. No hacer un cutover parcial: el owner tiene PREPARED y lineage, pero no settlement genérico y `reconcilePrepared` bloquea por diseño. El adapter de Lúmina modifica estado en memoria; no demuestra estado ambiental durable después de restart. La siguiente implementación debe comenzar con pruebas contractuales de reconciliación/settlement y solo después conectar el runtime. Las acciones sin contrato no deben llegar al adapter.

## 2B. Auditoría del seam genérico — hallazgo bloqueante (2026-10-18)

El siguiente paso no es conectar mecánicamente `persistPreparedIntent` al owner:

- `executeNexoStep()` llama al adapter antes de `commitRuntimeOutcome()`; este último registra execution/outcome en la memoria legacy `src/assistants/memory.js`.
- `executeLuminaNexoStep()` acepta `persistPreparedIntent` opcional. Sin él, el journal solo es local. Con él, el adapter puede persistir PREPARED antes del handler, pero su resultado terminal se escribe solo en el journal local; el owner no recibe automáticamente execution lineage ni settlement.
- `owner.reconcilePrepared()` devuelve `NEXO_EFFECT_RECONCILIATION_REQUIRED` por diseño. Un resultado `completed` del adapter no sustituye reconciliación persistida y confiable.
- Por tanto, una integración parcial dejaría una obligación PREPARED sin resolver o permitiría una ventana de doble ejecución. **No hacer callback-only cutover ni sustituir memoria legacy después del dispatch.**
- Próxima tarea: definir contratos confiables de reconciliación por acción/efecto y rechazo antes de dispatch cuando no exista contrato probado. Mantener separados admisión, PREPARED durable/CAS, dispatch, lineage, observación/reconciliación, settlement y outcome. El bridge repair-only es la única ruta completa demostrada; no generalizarlo por renombrado.

## 3. Próximo trabajo exacto

**El hueco de excepción de dispatch y los límites de settlement ya auditados no deben repetirse.** El siguiente trabajo vuelve a la meta central de M0: definir el seam mínimo del **runtime genérico owner-backed**.

1. Inspeccionar solo los contratos necesarios entre `src/nexo/runtime.js`, `src/nexo/core/continuity-owner.mjs` y la entrada `scripts/assistants.mjs`. El runtime legacy ejecuta el adapter antes de registrar execution/outcome en memoria local; no hacer un reemplazo mecánico de imports.
2. Especificar cómo el runtime seleccionará misión/paso desde el snapshot canónico, comprobará admisión y escribirá PREPARED durable mediante CAS **antes** del dispatch; después separar dispatch, lineage, reconciliación, settlement y outcome.
3. Primer corte deliberadamente estrecho: solo acciones con reconciliación y postcondición demostradas. Las demás deben bloquearse sin dispatch. No convertir el dispatcher repair-only en dispatcher genérico, no añadir un segundo ledger ni simular atomicidad cross-store.
4. Prueba primero para cada límite nuevo, revisar los logs reales de CI y registrar SHA/run exactos. No declarar PASS sin evidencia.
5. Solo declarar M0 completo cuando el runtime real use continuidad canónica con evidencia end-to-end de crash/replay/restart; tests unitarios del owner y repair bridge no bastan.

## 4. Guardas de arquitectura

- `src/nexo/runtime.js` usa todavía `src/assistants/memory.js` para outcomes/execution/plans y puede despachar el adapter antes de registrar memoria legacy; también conserva un journal en memoria. **No hacer sustitución mecánica de escrituras legacy por owner writes.**
- `scripts/assistants.mjs` persiste la misión canónica, pero el repair bridge es opt-in con `--nexo-repair-once`; el modo por defecto no es prueba de runtime genérico integrado.
- La ruta actual está acotada a reparaciones conocidas y a conciliación ambiental específica. No inferir que todas las acciones admiten reconciliación.
- Mantener separados: admisión, PREPARED, dispatch, lineage, observación/reconciliación, settlement y outcome.
- No inventar IDs/colas/retries/tombstones/wrappers transaccionales ni revisiones globales; no afirmar atomicidad cross-store.
- No reabrir AB/P cerrados ni repetir M1/STEP 7. Las referencias históricas y decisiones están en `NEXO_NCS/BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md` y `NEXO_NCS/BUILD/NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md`.

## 5. Frase inicial para el nuevo chat

`NCS`

Después: leer `NEXO_NCS/STATUS.md` y este archivo en la rama `ncs-clean-architecture`, verificar HEAD/CI actuales y continuar en el siguiente hueco demostrado de `scripts/nexo-repair-dispatch.mjs`/settlement. No repetir lo ya validado. La meta es M0, no cerrar el trabajo en una colección de parches repair-only.


## 6. Actualización posterior — 2026-10-18 (esta sección supersede el siguiente paso de la sección 5)

- Se agregó verificación de solo lectura por acción configurada en bootstrap al adaptador (`verifiers`, `verifyPrepared`, `supportsReconciliation`), con identidad exacta y evidencia ligada a revisión/fuente. El verificador no se recibe del request.
- `createNexoContinuityOwner` ahora acepta `effectVerifiers` de bootstrap y `reconcilePrepared({expectedRevision, operation})` puede persistir observaciones de acciones genéricas por CAS. Antes del CAS vuelve a leer store y exige que revisión e identidad PREPARED sigan iguales. `unknown`, verificador ausente/fallido, evidencia inválida o carrera dejan PREPARED sin modificar.
- Corrección arquitectónica importante: las acciones de reparación no pueden pasar por este settlement genérico (`NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`); conservan su verificador y settlement específico con revisión ambiental enlazada. No mezclar `settled_observed` repair-only con la observación genérica `reconciled_observed`.
- `reconciled_observed` bloquea reconstrucción, outcome terminal y replanning hasta verificación separada del objetivo; nunca autoriza redispatch ni demuestra causalidad. El runtime genérico aún no usa el owner como ciclo canónico.
- Commits recientes: owner + CAS [f877063](https://github.com/snowdenxrp/aldea-ia/commit/f877063545261a1672c9463a9ca0df6a1048462c), endurecimiento de trust boundary [16a259d](https://github.com/snowdenxrp/aldea-ia/commit/16a259d6e98173f7905d10e463e840e5e78e298e), fail-closed compatibility [fb6de0a](https://github.com/snowdenxrp/aldea-ia/commit/fb6de0a6ebba7886af14d67582a4427fef450319), separación de estados [1b47319](https://github.com/snowdenxrp/aldea-ia/commit/1b47319a21b4d7f4f92f3e18b6b3b72c0ff418f9), reconstrucción [0b0fad1](https://github.com/snowdenxrp/aldea-ia/commit/0b0fad1dffd8771008b6945d5bc9a54c05be41aa), guard de replanning [db20ba7](https://github.com/snowdenxrp/aldea-ia/commit/db20ba7c322a3ce32131c274f7f7a850724eb502), pruebas [0c1f6c1](https://github.com/snowdenxrp/aldea-ia/commit/0c1f6c1c4a39b94708c1a7da3c6587f4731492b7), estado actualizado [f7e7ca0](https://github.com/snowdenxrp/aldea-ia/commit/f7e7ca0e24c3c0d0d522ebe56dbd87ff259bec82).
- CI: consultas disponibles de checks y runs no muestran ejecuciones para los SHAs recientes. No afirmar PASS; estado PENDING/UNKNOWN.
- Siguiente paso exacto: conectar el verificador persistido real como observador de solo lectura para la ruta genérica sin duplicar su lógica, mantener el settlement repair-only separado y diseñar el primer corte vertical del runtime canónico: bloquear cualquier dispatch hasta que PREPARED haya sido confirmado por el owner; después registrar lineage y reconciliar con verifier confiable. Mantener `NEXO_NCS/STATUS.md` como única puerta de entrada. M0 INCOMPLETO.


## 7. Corte vertical del runtime con owner — 2026-10-18

- Se añadió `executeNexoStepWithContinuityOwner` a `src/nexo/runtime.js` como ruta explícita, sin reemplazar todavía `executeNexoStep` legado.
- Preflight exige `adapter.supports(action)`, `adapter.supportsReconciliation(action)` y `owner.supportsReconciliation(action)`. Reparaciones conocidas se bloquean antes de PREPARED/dispatch con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` hasta conectar su settlement específico.
- Para acciones genéricas: `owner.loadCurrent` → `owner.recordPrepared` y exigir confirmación committed → `adapter.execute` → `owner.recordExecutionLineage` → `owner.reconcilePrepared`. No se registra outcome terminal ni se autoriza redispatch; el resultado final es `observed` o `unknown`.
- Si PREPARED commit lanza o queda sin confirmación, no hay dispatch. Si dispatch lanza, el efecto puede haber ocurrido: conservar UNKNOWN, no registrar lineage falso ni reintentar. Si lineage/reconcile lanza o no confirma, devolver UNKNOWN.
- Registro de verificadores del owner copiado y congelado en construcción. Código [7760515](https://github.com/snowdenxrp/aldea-ia/commit/776051522ec54ca3f159e6a95d15f0424ad4b7f3), runtime [dd3a981](https://github.com/snowdenxrp/aldea-ia/commit/dd3a98190ff763f2546b167fd4926ec9d900c326), errores inciertos [211e5d2](https://github.com/snowdenxrp/aldea-ia/commit/211e5d207bc596d0169c2411f53e9a493e8711ba) y [cad56cd](https://github.com/snowdenxrp/aldea-ia/commit/cad56cd8dc74e9aef56446d6b338d08e70e07506), preflight reparación [1533c36](https://github.com/snowdenxrp/aldea-ia/commit/1533c36193e1b8c940185b9fed1bc1a3cc426a6f), pruebas [220dcc2](https://github.com/snowdenxrp/aldea-ia/commit/220dcc28219f31dba43da1c6067a5a27c38e4c9a), [bcec2ee](https://github.com/snowdenxrp/aldea-ia/commit/bcec2eec151f13f7d905610ea99817e01e240c10), [5ce72d8](https://github.com/snowdenxrp/aldea-ia/commit/5ce72d8a10ba8c7494363d2519817207d38dc11b), [8317a46](https://github.com/snowdenxrp/aldea-ia/commit/8317a46611e016b6f91f773f46ccad64988f4d2b).
- No ejecutar por la sesión: las pruebas están escritas, pero no hay ejecución CI visible en las consultas disponibles. Mantener PENDING/UNKNOWN.
- Próxima instrucción: primero conseguir una ejecución CI observable de las suites afectadas y corregir fallos reales. Después conectar la lectura persistida real al owner y añadir el flujo específico de reparación ligado a revisión ambiental. No convertir el nuevo corte en runtime predeterminado antes de esa evidencia. STATUS sigue siendo puerta única de entrada; misión M0, Nexo separado de Lúmina.


## 8. CI observada después de corregir regresiones — 2026-10-18

- La primera CI falló porque `simulation-restart-persistence.test.mjs` esperaba `conflict` para un replay de settlement ya persistido. La semántica existente recupera correctamente el resultado `settled_observed` tras perder la respuesta del commit; se corrigió la expectativa a `NEXO_REPAIR_SETTLEMENT_ALREADY_JOURNALED`, `recovered: true`, causalidad no reclamada: [a256692](https://github.com/snowdenxrp/aldea-ia/commit/a25669271e5e7470d9cedc84615a53955dbee3aa).
- Después falló `continuity-migration.test.mjs` porque esperaba que un outcome `blocked` se registrara mientras PREPARED seguía abierto. Se corrigió: outcome terminal bloqueado, storeRevision no cambia, no se crea attempt: [7a34a43](https://github.com/snowdenxrp/aldea-ia/commit/7a34a4366a8a59a8d71616c522aced77074da13c).
- En `7a34a4366a8a59a8d71616c522aced77074da13c` se observaron runs exitosos: [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379142), [M0 repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379055), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379069), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379122). Runtime tests también pasaron dentro del flujo bounded.
- Estado de validación de estas suites: SUCCESS para ese commit. No extrapolar el éxito a toda M0 ni afirmar que la nueva ruta sea default. Falta conectar verificadores reales de estado persistido, integrar reparación con owner y decidir el cutover del runtime después de evidencias.


## 9. Corte siguiente: adaptador consume PREPARED canónico sin duplicar journal — 2026-10-18

- Se detectó y corrigió una falla arquitectónica del corte vertical previo: usar `adapter.execute()` podía crear un journal local además del `effectJournal` del owner. No deben coexistir dos fuentes de continuidad para el mismo efecto.
- `createEffectAdapter` expone `executePrepared(request, { preparedCommit })`, valida confirmación committed, revisión y correspondencia de identidad `preparedOperation`; evita `recordIntent`, `persistPreparedIntent` y persistencia local de resultado en esa ruta. Si detecta un journal local preexistente para la clave, bloquea; no fusiona estados.
- `executeNexoStepWithContinuityOwner` exige esa API y la invoca solo tras el commit PREPARED confirmado. Si la respuesta del PREPARED es incierta, no llama al adaptador. Si el adaptador arroja, conserva UNKNOWN. El resultado del adaptador es lineage, no settlement.
- `openNexoContinuityOwner` acepta `effectVerifiers` para la configuración confiable de bootstrap y el owner los copia/congela. Aún no hay verificador genérico de producción por defecto; las acciones sin verificador real deben bloquearse antes de PREPARED.
- Commits: [1f10238](https://github.com/snowdenxrp/aldea-ia/commit/1f102389b358b14c94ecd7bc2ed7c8c4e96fdbc1), [df9b146](https://github.com/snowdenxrp/aldea-ia/commit/df9b1465befc426d77532d53f3311df51a7ff3e6), [ff8d7d1](https://github.com/snowdenxrp/aldea-ia/commit/ff8d7d1f328372e5eb7da6a44e75199f62e321ec), [85ef18f](https://github.com/snowdenxrp/aldea-ia/commit/85ef18fbf3d730aa85bffa36a8afcf4995ac05ad), [3702e4a](https://github.com/snowdenxrp/aldea-ia/commit/3702e4a390d3f318b4b0559b9920b4eddde44ef3).
- CI de `3702e4a`: bounded continuity/runtime [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723235), STEP 4 [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723241), STEP 5 [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723238). El intento anterior en `85ef18f` falló porque tests mock aún usaban `execute`; se actualizó el contrato de los mocks en `3702e4a` y el siguiente run quedó verde.
- Continuación obligatoria: (1) agregar prueba directa de `executePrepared` en `tests/nexo/effect-adapter.test.mjs` (el intento de actualizar ese archivo no llegó a aplicarse); (2) cubrir que precondition fail en modo owner-prepared no crea journal local; (3) no inventar un verificador genérico: definir acción y fuente persistida concreta, o mantener el bloqueo; (4) diseñar cómo se reanuda/reconcilia tras crash sin redispatch; (5) después, conectar consumidor runtime solo con evidencia CI. Mantener Nexo independiente de Lúmina, M0 activo y M0 incompleto.


## 10. Actualización siguiente — pruebas directas del adaptador canónico (2026-10-18)

- Se añadió cobertura directa a `tests/nexo/effect-adapter.test.mjs`, commit [da3f3fa2621e1dd046a10d028b4fe8a81faee582](https://github.com/snowdenxrp/aldea-ia/commit/da3f3fa2621e1dd046a10d028b4fe8a81faee582).
- Casos incluidos: recibo PREPARED inválido no despacha; recibo committed válido despacha sin persistencia/journal local; journal local preexistente bloquea; precondición fallida no deja escritura local ni dispatch.
- El commit existe en la rama. Consultas a status checks y workflow runs no devolvieron estados/runs asociados al SHA; **no hay evidencia CI de estos tests todavía**. No afirmar que pasan.
- La cobertura de `executePrepared` no cambia el estado arquitectónico: el runtime canónico aún es una ruta explícita, no default; falta una acción genérica real con un verificador que lea estado ambiental persistido. Mantener bloqueadas acciones sin contrato probado.
- Próximo paso: hacer que CI ejecute exactamente `node tests/nexo/effect-adapter.test.mjs` (preferentemente en un workflow focal ya existente o en un trigger que cubra ese archivo), observar resultado/log y corregir fallos. Después elegir una acción concreta y rastrear su escritura persistida y lector real antes de diseñar el primer verificador. No fabricar semántica genérica, no tocar Lúmina y no declarar M0 completo.


## 11. Evidencia CI confirmada para pruebas directas del adaptador (2026-10-18)

Corrección de la sección 10: las pruebas sí tienen CI observable y exitoso en el commit da3f3fa2621e1dd046a10d028b4fe8a81faee582.

- [Run 39172107130 — Nexo M0 effect and settlement contract regressions](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172107130): SUCCESS; pasos de prueba del adaptador y settlement SUCCESS.
- [Run 39172107167 — bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172107167): SUCCESS; incluye node tests/nexo/effect-adapter.test.mjs, runtime.test.mjs, restart reconstruction y continuidad.
- Se confirman cuatro condiciones nuevas: recibo inválido no despacha; recibo válido no genera segundo journal; conflicto con journal local bloquea; fallo de precondición no deja escritura local ni dispatch.
- Este éxito es de las suites y del SHA indicados. No significa que M0 esté terminado ni que el runtime canónico sea default.
- La inspección siguiente no ha encontrado una acción genérica no-repair que ya tenga una pareja demostrada de mutación ambiental persistida + lector independiente post-restart. El adapter de Lúmina solo demuestra simulación en memoria; repair conserva su contrato separado.
- Próxima tarea: trazar una acción real no-repair desde la entrada de Nexo hasta la escritura y lectura persistidas. Si el repositorio no tiene esa pareja, definirla explícitamente antes del verificador. Sin fuente persistida, el estado correcto es BLOCKED/UNKNOWN, no un verificador inventado.


## 12. Hallazgo de arquitectura tras CI verde — bloqueo real antes del verificador genérico

Se inspeccionaron los archivos vigentes de la rama, no solo documentos históricos:

- `scripts/assistants.mjs` abre `openNexoContinuityOwner()` y registra la misión en el store canónico, pero genera informes y la misión desde `simulation`, y `buildNexoMission()` recibe esa memoria/reporte de Lúmina.
- `src/nexo/simulation-adapter.js` ejecuta `executeAction` de `src/actions.js` contra el objeto `simulation` en memoria. Las postcondiciones también inspeccionan esa simulación. No es evidencia independiente de un estado ambiental persistido que sobreviva un reinicio.
- `scripts/nexo-runtime-session.mjs` solo selecciona las tres acciones `repair_*`, que están protegidas por su contrato de settlement específico. No deben generalizarse ni renombrarse como settlement genérico.

Esto significa que todavía no hay en el repositorio una acción genérica no-repair que sea nativa de Nexo y tenga una pareja demostrada de writer persistente + reader independiente post-restart. Por tanto, no es correcto inventar el siguiente verifier usando Lúmina ni tratar la simulación como memoria operativa de Nexo.

**Siguiente tarea de arquitectura:** definir una primera capacidad nativa de Nexo (fuera del dominio de simulación Lúmina) con un estado persistido canónico explícito; identificar el único writer responsable, el lector de recuperación y la invariante que puede observarse después de reinicio. Hacerlo como una vertical concreta, no como un framework genérico. Después, conectar el verificador específico al owner y añadir crash-cut tests. Hasta que esa vertical exista, las acciones genéricas deben seguir bloqueadas antes de PREPARED/dispatch; el runtime canónico no pasa a default.


## 13. Nueva regresión del runtime canónico y evidencia CI (2026-10-18)

- Commit `2088417a482fefc0128f024c8c63fa212e87d64f` agrega una regresión: si el owner indica reconciliación disponible pero el adaptador no, el runtime bloquea antes de guardar PREPARED y no despacha. Así se prueba que ambos extremos anuncien el contrato, sin tratar la declaración de uno como sustituto del otro.
- CI: [run 39172525158](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525158) SUCCESS; `runtime.test.mjs`, `effect-adapter.test.mjs`, restart reconstruction y suites de store/contrato/migración SUCCESS. [STEP 4 run 39172525106](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525106) y [STEP 5 run 39172525094](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525094) también SUCCESS.
- No declara M0 completo. El siguiente paso es arquitectónico: elegir y diseñar una capacidad nativa de Nexo con un estado canónico persistido, writer y reader independiente tras reinicio; solo entonces implementar el verificador por acción. No añadir más preflights como sustituto de esa vertical y no reutilizar Lúmina.


## Actualización 2026-10-18 — decisión de primera vertical M0

Se eligió Chronicle como primera vertical nativa no-repair candidata, porque el Master Preservation Addendum ya lo define como historia durable de Nexo, distinta de memoria ordinaria y no equivalente a verdad universal. Documento normativo de este corte: `NEXO_NCS/BUILD/NCS_M0_FIRST_NATIVE_VERTICAL_CHRONICLE_2026-10-18.md`.

Alcance exacto: una operación estrecha de escritura Chronicle con contenido validado; writer único; reader creado de nuevo desde almacenamiento tras cerrar/reabrir; idempotency key existente, sin ID paralelo; verificador que compruebe como máximo una entrada y contenido exacto. El owner mantiene PREPARED/lineage/settlement; Chronicle no se convierte en otro journal de efectos. No se usa Lúmina.

Esto no es implementación terminada. El documento deja abierto el formato de almacenamiento hasta inspeccionar convenciones reales, prohíbe atomicidad cross-store inventada y enumera crash cuts obligatorios. Siguiente acción: implementar el writer/reader mínimo con pruebas de persistencia visible tras reapertura, conflicto por misma clave/contenido distinto, concurrencia y respuesta perdida; conectar verificador específico solo tras esas pruebas. Runtime default sigue sin cambiar; M0 INCOMPLETO.
