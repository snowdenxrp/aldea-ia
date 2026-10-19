## M0 — bootstrap de Chronicle sin inicialización parcial evitable (validado 2026-10-18)

- Auditoría del entrypoint encontró que inicializaba Chronicle antes de comprobar si el almacén de continuidad estaba corrupto o ausente sin permiso de inicialización. Eso podía dejar un almacén Chronicle vacío como efecto lateral aunque la sesión completa fuera bloqueada.
- `scripts/nexo-chronicle-session.mjs` ahora preflighta ambos almacenes antes de inicializar ninguno. Un almacén corrupto, ilegible o ausente sin su flag de opt-in bloquea antes de escribir el otro. Después del preflight, la inicialización sigue sin promesa de atomicidad entre archivos: una carrera o fallo de E/S posterior puede dejar una inicialización parcial; no se reclama transacción cross-store.
- `tests/nexo/chronicle-runtime.test.mjs` comprueba ambos sentidos: continuidad corrupta no crea Chronicle ausente y Chronicle corrupto no crea continuidad ausente.
- SHA de código/test validado: `43827382ed27821182727c12a4ed6d03cc51ad36`. CI SUCCESS: [Chronicle vertical run 39174839208](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839208), [continuidad/runtime run 39174839267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839267), [STEP 4 run 39174839176](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839176) y [STEP 5 run 39174839133](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839133).
- Sigue sin cambiar el runtime default ni la separación Nexo/Lúmina. M0 permanece INCOMPLETO; la próxima frontera es revisar contrato de persistencia/recuperación y la integración de esta única capacidad, sin ampliar acciones ni inferir durabilidad ante pérdida de energía.

## M0 — Chronicle: identidad de operación sin colisiones (validado 2026-10-18)

- Auditoría del primer vertical detectó un caso de ambigüedad: la clave `missionId:stepId` no es inyectiva si alguno de los identificadores contiene `:`. Dos pares distintos podían formar la misma clave, haciendo que una entrada persistida ajena pareciera corresponder a la operación consultada.
- Corrección aplicada en `src/nexo/adapters/chronicle-effect.mjs`, `src/nexo/adapters/chronicle-observation.mjs` y `scripts/nexo-chronicle-session.mjs`: la acción, el verificador y la entrada CLI rechazan IDs con `:`; el verificador devuelve UNKNOWN para la consulta ambigua. No se cambia el formato canónico de identidad de otras acciones ni se inventan IDs alternativos.
- Regresiones: `tests/nexo/chronicle-store.test.mjs` verifica que la observación ambigua no se acepte; `tests/nexo/chronicle-runtime.test.mjs` verifica que la entrada rechace el ID antes de despachar.
- La primera ejecución de CI en SHA `bf5ef739b951b73455cf96782de706afce86accb` falló por una expectativa incorrecta del código de error en el test, no por el comportamiento del runtime: [run 39174663488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174663488). Se corrigió la expectativa para usar el código contractual `NEXO_CHRONICLE_ID_INVALID`.
- SHA final validado: `5c2305c9c07c0010dc3ff6a77b2bff8ed2f7742c`. CI SUCCESS: [Chronicle vertical, run 39174706702](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706702); [bounded continuity/runtime, run 39174706654](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706654); [STEP 4, run 39174706726](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706726); [STEP 5, run 39174706730](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706730).
- Estado: la identidad de esta vertical ahora tiene un delimitador no ambiguo por validación. Chronicle sigue siendo la única acción nativa habilitada por este entrypoint; no cambia runtime default, no se amplía a otras acciones y no se declara M0 completo.

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


## Actualización 2026-10-18 — primera vertical Chronicle en código (CI aún no confirmada)

Archivos nuevos:
- `src/nexo/core/chronicle-store.mjs`: persistencia local de Chronicle separada del journal operativo; inicialización explícita, append por clave de operación existente, mismo contenido idempotente, contenido distinto conflictivo, lock local y lectura que no recrea estado ausente.
- `src/nexo/adapters/chronicle-observation.mjs`: lectura persistida independiente que clasifica applied/not_applied/unknown sin atribuir causalidad.
- `tests/nexo/chronicle-store.test.mjs`: ausencia, inicialización, concurrencia de misma clave, conflicto, reapertura con nueva instancia y corrupción.
- `.github/workflows/nexo-m0-chronicle.yml`: ejecución focal Node 22.

Commits: `aa9a3a34fd955edc19759aa8996416de7f938c7f`, `ef104bd8f2395449cc68fcaf374c136e17a367cb`, `8535c3a4df301d94b4f5d2bee3bf4b041e8402c5`, `9c759110dc2ac76b20030c2d9fac2a8feb18fa0e`. El workflow acaba de agregarse: resultado PENDING/UNKNOWN hasta inspeccionar la ejecución. No afirmar que el test pasó.

No está conectado al runtime ni al owner verifier registry; todavía no cierra el ciclo PREPARED → dispatch → lineage → observación → settlement → outcome. Siguiente: observar CI, arreglar fallos concretos, probar respuesta perdida/crash cuts y solo entonces diseñar la conexión al CAS del owner para esta operación. No habilitar runtime default ni otras acciones. M0 INCOMPLETO.


## Actualización — CI inicial de Chronicle verde; crash cuts ampliados pendientes

- CI confirmada para la versión inicial: [run 39173007733](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173007733), SUCCESS, SHA `9c759110dc2ac76b20030c2d9fac2a8feb18fa0e`.
- Se añadieron pruebas para escrituras concurrentes con claves distintas y respuesta perdida después del rename: commit `bf3ded518216a9556118b36f6f6135a7baa3fa93`. Run [39173111447](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173111447) estaba QUEUED al guardar esta actualización; el resultado de la ampliación permanece PENDING.
- Próximo: comprobar run 39173111447 y corregir únicamente fallos observados. Después, implementar el enlace al owner de forma que el verificador no pueda liquidar una PREPARED distinta y el resultado solo se acepte bajo CAS; todavía no conectar dispatch real ni cambiar runtime default.


## Corrección — crash-cut Chronicle ya validado

La ejecución [39173111447](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173111447) terminó SUCCESS para el commit `bf3ded518216a9556118b36f6f6135a7baa3fa93`. Pasaron las pruebas focales de concurrencia con claves distintas, idempotencia, conflicto de contenido, reader reabierto, estado corrupto y respuesta perdida después de persistencia visible. Alcance limitado al store/verifier; no demuestra durabilidad ante pérdida de energía ni integración de runtime/owner.

Siguiente tarea exacta: revisar la API del owner y el binding de PREPARED → verificador → CAS, y cubrir con pruebas que una observación solo puede liquidar la misma operación/revisión. No cambiar runtime default ni activar otras acciones.


## Actualización M0 — vertical Chronicle integrada en runtime explícito

La vertical Chronicle ya está conectada a `executeNexoStepWithContinuityOwner` sin cambiar el runtime por defecto:
- `src/nexo/adapters/chronicle-effect.mjs`: handler + postcondition + verifier para la acción única `chronicle_append`.
- El owner registra `settled_observed` únicamente con `applied` de `nexo-chronicle-store`, y solo permite outcome completed si la misma operación/acción/target tiene ese settlement persistido.
- El runtime recupera PREPARED ya existente por lectura y no vuelve a despachar; si la entrada no está, deja el estado bloqueado/observado, sin retry automático. El replay tras settlement repite solo el outcome.
- Prueba real `tests/nexo/chronicle-runtime.test.mjs` usa continuidad store, Chronicle store, owner y adapter reales; cubre el ciclo completo, crash tras append antes de lineage, no-apply sin redispatch y respuesta perdida tras commit de outcome.
- CI verde de esa integración: [run 39173898535](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173898535), SHA `5e076ac31bd0c74432f104e54699918984520103`. El guard adicional que bloquea completion sin settlement aún espera CI: run `39173941624` PENDING; run `39173935254` del owner IN_PROGRESS al momento de escribir.
- Revisar esos dos runs primero. Luego validar las suites amplias afectadas y registrar el SHA final. M0 sigue INCOMPLETO; runtime default sin cambios; no ampliar a otras acciones ni usar Lúmina.


## Estado validado del owner-backed Chronicle (actualización posterior)

- [Run 39173941624](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941624) SUCCESS en SHA `47790c4014581c42fc5f85f9ba609e3a0678b53b`; store y runtime Chronicle pasaron incluyendo el bloqueo de outcome fabricado sin settlement.
- STEP 4 [39173941657](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941657) y STEP 5 [39173941656](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941656) también SUCCESS en el SHA final. El workflow bounded continuity/runtime pasó en el SHA previo del owner, `4657c36ca3eb1311f9593f1777636da57088581d`, run [39173935284](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935284).
- Siguiente frontera: entrada mínima propia de Nexo para invocar solo `chronicle_append`, con rutas explícitas, IDs de misión/paso suministrados y creación inicial opt-in. Debe validar contra el snapshot existente y no importar ni leer Lúmina. Esta entrada no se ha implementado aún; no cambiar runtime default. M0 INCOMPLETO.


## Actualización M0 — entrypoint Chronicle implementado y CI verde

- Entrada nueva: `scripts/nexo-chronicle-session.mjs`, independiente de Lúmina. Rutas, misión y step son explícitos; IDs no se generan automáticamente; inicialización requiere `--initialize-continuity` y `--initialize-chronicle` si faltan stores. Reutilizar misión/step con contenido distinto bloquea.
- `package.json` ejecuta las dos suites Chronicle dentro del test estándar; `.github/workflows/nexo-m0-chronicle.yml` también corre cuando cambia ese script.
- CI final [39174162150](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174162150) SUCCESS en SHA `1ef9a4745d31d324b56733e43e250d36bb3908b7`, con store, runtime owner-backed, crash cuts y entrada real. El test del entrypoint también pasó en [39174097465](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174097465).
- Siguiente frontera: auditar la ruta de CLI y sus supuestos de almacenamiento, revisar el resultado de las suites amplias y decidir explícitamente si/ cuándo esta ruta se integra a la aplicación. No tocar runtime default ni ampliar a otras acciones hasta que el corte actual esté auditado. M0 INCOMPLETO.


## Evidencia final de suites para la vertical Chronicle

En SHA `4626afbb1220feb0784c020288de697608b9276b`:
- [Run 39174272574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272574) SUCCESS — suite focal de Chronicle.
- [Run 39174272526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272526) SUCCESS — suite acotada de continuidad/runtime, ahora incluyendo las dos suites Chronicle.

El entrypoint es independiente de Lúmina y los tests incluyen: stores ausentes/corruptos no se recrean silenciosamente, IDs de misión/step suministrados, misma identidad con contenido diferente bloqueada, append con lectura independiente, recovery sin redispatch y replay del outcome. M0 permanece INCOMPLETO; no habilitar otras acciones ni cambiar runtime default.


## Última auditoría de entrada — clave canónica sin colisiones (2026-10-18)

- Se identificó que la clave canónica heredada `missionId:stepId` es ambigua si alguno de los IDs contiene `:`. Para no cambiar el contrato de continuidad ni reinterpretar datos existentes, el entrypoint Chronicle ahora rechaza IDs con ese separador y los IDs con espacios periféricos; pruebas explícitas cubren ambos lados de la colisión.
- CI verde en SHA `de89e228ca5b46becd17ef2e3159ab2e47c25f8e`: [Chronicle run 39174610849](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610849) y [continuity/runtime run 39174610848](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610848), ambos SUCCESS.
- Próximo: endurecer parsing CLI sin aceptar argumentos desconocidos/duplicados silenciosamente; probar errores de entrada y asegurar que los mensajes de salida no filtren contenido. No activar runtime por defecto ni ampliar la vertical.


## Último corte — parser estricto de CLI

- El parser exportado rechaza opciones desconocidas, duplicadas, flags repetidos y valores ausentes; el ejecutable captura fallos y emite solo estado/código/IDs, sin cuerpo Chronicle, stack ni rutas.
- Se corrigió una aserción desfasada detectada por [run 39174663488 FAILURE](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174663488); no se ocultó el fallo. Tras alinear la expectativa con `NEXO_CHRONICLE_ID_INVALID`, ambos workflows quedaron verdes en SHA `d7af2db2150ab6be57683ad1e15977f29c613081`: [39174722540](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722540) y [39174722491](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722491).
- Siguiente: prueba de proceso CLI real para garantizar no-mutación con argumentos inválidos y ausencia de contenido privado en stdout/stderr; auditar bootstrap/rutas. Mantener runtime por defecto intacto.


## CLI real y no-mutación ante argumentos inválidos — evidencia verde

La suite ejecuta el CLI real con un contenido centinela y un argumento desconocido. Resultado: exit status 1, código JSON estructurado, stderr vacío, el centinela no aparece en salida y ninguno de los dos stores se crea.

SHA `429fc980427c04f8db286e28ee9887333941acb8`: [Chronicle 39174861087 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861087) y [continuity/runtime 39174861039 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861039).

Siguiente corte: auditar explícitamente el modelo de filesystem y concurrencia que estos stores soportan; separar garantías demostradas de las no demostradas. No cambiar runtime por defecto ni ampliar acciones.


## Continuidad — corrección de privacidad CLI y límites de filesystem

- Se eliminó `--content <texto>`: el cuerpo de Chronicle podía quedar expuesto en argv/listado de procesos. Ahora se exige `--content-stdin` y el contenido se consume del stream stdin; stdin TTY se rechaza para evitar espera interactiva accidental. La prueba de integración ejecuta el CLI real y confirma no filtración a argv/stdout/stderr, no-mutación ante argumentos inválidos y persistencia correcta ante invocación válida.
- CI final en SHA `0ea0b8bcbd68a2e2062e359b11247cd6a04a2457`: [39176108822 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108822), [39176108833 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108833).
- Auditoría encontró límites que no deben ocultarse: temp+rename no es prueba de fsync/power-loss; rutas del caller no se canonicalizan ni aíslan de symlinks; reclamación de lock obsoleto usa check-then-remove y no demuestra exclusión adversarial multiproceso. No integrar a producción ni afirmar esas garantías.
- Próxima frontera: fijar el modelo de confianza de paths y del filesystem local, resolver la recuperación de locks con prueba de concurrencia entre procesos o limitar de manera explícita el store a un solo proceso cooperante. No hacer cutover ni ampliar acciones.


## Evidencia adicional — concurrencia entre procesos

La suite Chronicle inicia dos procesos Node separados que anexan entradas distintas al mismo archivo y verifica, con un reader recién creado, que ambas entradas sobreviven. Validado en SHA `6940f9524773b36a97d8c6eb44d7c2bd81146d62`: [Chronicle 39176214934 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214934), [continuidad/runtime 39176214965 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214965), [STEP 4 39176214931 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214931) y [STEP 5 39176214932 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214932).

Alcance: dos escritores cooperantes en el filesystem local de CI. No es evidencia de seguridad bajo carreras adversariales de recuperación de locks obsoletos, rutas con symlink o pérdida de energía. Mantener runtime default sin cambios.


## 7. Actualización posterior — lock obsoleto ya no se elimina automáticamente (2026-10-18)

- Código: `src/nexo/core/chronicle-store.mjs` y `src/nexo/core/continuity-store.mjs` ahora fallan de forma cerrada si detectan un lock obsoleto. La eliminación automática anterior era un check-then-remove vulnerable a que un proceso eliminara el lock recién adquirido por otro proceso.
- Códigos: `NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED` y `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`. La operación no borra el lock y no modifica el estado protegido. La recuperación es manual/operativa; no hay reaper automático.
- Tests: `tests/nexo/chronicle-store.test.mjs` y `tests/nexo/continuity-store.test.mjs` simulan lock viejo con PID muerto y verifican error explícito, datos sin cambio y lock conservado.
- Commits de código/tests: `1ea054a341705f60e4c20bae1849a508134948a8`, `0ecd243c35352ec58eba81a71b42ded68ddb7e57`, `8cb919e182de9ff0b36b7d0827e6e479e6cf9de5`, `b32b1307f7aedf1a0b39d78f58cde6f1c87776b0`.
- CI observada en el SHA final de código/tests `b32b1307f7aedf1a0b39d78f58cde6f1c87776b0`: continuidad/restart [39178015348 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015348), STEP 4 [39178015299 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015299), STEP 5 [39178015376 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015376). Chronicle y STEP 4/5 también pasaron en el commit de prueba Chronicle `8cb919e182de9ff0b36b7d0827e6e479e6cf9de5`: [39178005072](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005072), [39178005085](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005085), [39178005091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005091).
- Límite restante: no se ha cerrado el contrato de rutas/symlinks/permisos ni se ha demostrado resistencia a todos los interleavings multiproceso. El test de dos escritores solo prueba concurrencia cooperante normal, no lock recovery adversarial. No reclamar durabilidad ante power loss o soporte de filesystem distribuido.

### Próximo paso exacto

Definir el contrato de ruta y filesystem para ambos stores: canonicalización de ruta, tratamiento de symlinks y permisos/ámbito local. Luego tomar la decisión arquitectónica explícita entre (a) documentar y hacer cumplir un único proceso cooperante con exclusión externa, o (b) diseñar y probar locking multiproceso sin eliminación racy. No reintroducir auto-reaping por edad/PID, no añadir queues/ledgers/retries y no cambiar runtime default. M0 permanece INCOMPLETO.


## 8. Validación posterior de contrato local de rutas (2026-10-18)

- Ambos stores documentan `filePath` como configuración confiable y no como sandbox. El caller debe escoger un directorio local privado/de confianza y evitar mutaciones por procesos no confiables; symlink/path-attack resistance no está implementada ni afirmada.
- Código más reciente probado: `24d2e3561e1a65a8399875e5d826a43aef593129`. CI SUCCESS: continuidad/restart [39178122458](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122458), STEP 5 [39178122453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122453), repair crash cuts [39178122447](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122447), STEP 4 [39178122428](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122428). La vertical Chronicle y suites asociadas pasaron también en `888572c78390d4d46a4e7e4149bb793a93be82d1`: [39178115475](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115475), [39178115490](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115490), [39178115492](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115492), [39178115533](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115533), [39178115484](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115484).
- Próxima decisión: aceptar explícitamente para la primera vertical el contrato de directorio local privado/cooperación confiable, o no seguir con la integración hasta disponer de locking del sistema operativo más fuerte. La ruta de stores validada no completa el cutover de `src/nexo/runtime.js`; no cambiar runtime default ni declarar M0 completo.


## 9. Frontera de integración principal — Chronicle no debe entrar por Lúmina (2026-10-18)

- `scripts/nexo-chronicle-session.mjs` ejecuta la vertical owner-backed de Chronicle y no importa Lúmina. Sigue siendo un CLI opt-in, no el runtime general integrado.
- `scripts/assistants.mjs` importa mundo/simulación, persistencia de simulación, memoria de asistentes y genera misiones desde reportes de simulación. No usarlo como host para una sesión Nexo-only: eso reintroduciría el acoplamiento Nexo/Lúmina.
- Próximo corte exacto: inspeccionar el punto de entrada del producto y definir una entrada independiente de aplicación Nexo que invoque la vertical sin inicializar mundo/simulación. Mantener Chronicle CLI para pruebas; no construir una app completa por adelantado, no tocar runtime default y no habilitar otras acciones.
- El contrato de rutas/FS y los riesgos de locking siguen siendo los límites descritos en las secciones 7–8. El runtime genérico sigue sin cutover; M0 INCOMPLETO.


## 10. Handoff de cierre para el siguiente chat — estado verificado al 2026-10-18

### Punto exacto de continuidad

**La misión sigue siendo M0.** No reiniciar auditorías cerradas. El siguiente trabajo no es M1, STEP 7, ni ampliar Chronicle: es definir el seam mínimo de una **entrada principal de Nexo independiente de Lúmina** y continuar desde allí hacia el runtime canónico owner-backed.

- Rama: `ncs-clean-architecture`.
- HEAD documental observado al preparar este handoff: `1a5a6c90382d040b8214e1f5e2ea1f3507e8bea7` — “Handoff: document no-Lumina entrypoint integration boundary”.
- Commit anterior: `8290736e26d38eaa5742a62ecce570c85e244b26` — STATUS registra la frontera de entrada independiente.
- Commit de contrato confiable: `dd3de2b4e694f6872e6aae1caff84d7d5ee37aec` y `9f0b0e7f729781375d3fd262a610cdab0bfdceb5`.
- Último SHA de código/locks con CI de suites amplias observado: `b32b1307f7aedf1a0b39d78f58cde6f1c87776b0`: continuidad/restart [39178015348 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015348), STEP 4 [39178015299 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015299), STEP 5 [39178015376 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015376). Chronicle y suites asociadas pasaron en el commit de su regresión `8cb919e182de9ff0b36b7d0827e6e479e6cf9de5`: [39178005072](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005072), [39178005085](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005085), [39178005091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005091).
- Los commits documentales posteriores no son cambios de código y no implican por sí mismos una nueva ejecución de CI.

### Qué ya quedó hecho; no repetir

1. Chronicle es la primera vertical nativa no-repair de Nexo, en `src/nexo/core/chronicle-store.mjs`, `src/nexo/adapters/chronicle-effect.mjs`, `src/nexo/adapters/chronicle-observation.mjs`, y CLI explícita `scripts/nexo-chronicle-session.mjs`. Es independiente de Lúmina y valida escritura, lectura persistida independiente, idempotencia/conflicto, recuperación y replay sin redispatch.
2. El CLI usa `--content-stdin`, no argumentos argv para el contenido; hay pruebas del proceso real, validación estricta de argumentos, ausencia de filtración del contenido y no-mutación con entrada inválida.
3. Dos procesos Node cooperantes anexaron entradas distintas y un lector nuevo observó ambas. Esto no demuestra locking adversarial ni soporte de filesystem distribuido.
4. La reclamación automática de locks obsoletos fue retirada de ambos stores porque check-then-remove podía borrar un lock recién adquirido. Ahora falla cerrado con `NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED` o `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`; las pruebas comprueban que el estado y el lock se conservan.
5. El contrato de rutas declara `filePath` configuración confiable, no sandbox. No se afirma protección contra symlinks/path attacks, fsync, power-loss ni filesystem distribuido.
6. `scripts/assistants.mjs` no es el host apropiado para alojar Chronicle: importa mundo/simulación de Lúmina. No mezclar ahí la vertical ni modificar el runtime default por comodidad.
7. Las suites de repair crash cuts y guards PREPARED/outcome previos siguen siendo repair-only. No son settlement genérico ni prueban un runtime genérico integrado.

### Siguiente trabajo exacto — iniciar desde aquí

1. Releer solo `NEXO_NCS/STATUS.md`, este handoff y, si hace falta, el documento de contrato `NEXO_NCS/BUILD/NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md`. Verificar HEAD y los checks actuales; no repetir auditorías anteriores.
2. Inspeccionar el punto de entrada real del producto y sus imports/configuración. Identificar qué existe hoy para arrancar Nexo sin cargar `world.js`, `simulation.js`, `simulate.mjs` ni memoria de asistentes de Lúmina. No inventar que ya existe un shell independiente: demostrarlo desde archivos.
3. Proponer/implementar el cambio mínimo que dé una entrada Nexo-only invocable y comprobable. Mantener `scripts/nexo-chronicle-session.mjs` como CLI focal de validación. No construir una aplicación completa antes de probar el seam.
4. Antes de conectar otras acciones, definir la ruta owner-backed genérica: selección de misión/paso canónico → admisión → PREPARED confirmado por CAS antes del dispatch → dispatch → execution lineage → observación confiable del estado ambiental persistido → settlement CAS → outcome terminal. La única acción no-repair con contrato demostrado en este punto es `chronicle_append`; las demás deben bloquearse antes del adapter si no hay reconciliación verificable.
5. Contrato de filesystem aún limitado: para despliegue inicial usar directorio local privado/de confianza y evitar mutaciones por procesos no confiables; los locks obsoletos requieren recuperación explícita. No reintroducir reaper automático ni afirmar garantías no probadas.
6. Añadir prueba antes de cada límite nuevo, ejecutar CI y registrar SHA + run IDs exactos. CI sin evidencia visible = PENDING/UNKNOWN.
7. **No hacer cutover del runtime default, no habilitar efectos protegidos, no usar Lúmina como memoria/estado de Nexo y no declarar M0 completo** hasta tener evidencia end-to-end de continuidad canónica, crash/restart/replay y dispatch seguro.

### Estado de cierre

- M0: **INCOMPLETO**.
- Chronicle: vertical opt-in implementada; no equivale a integración del runtime general.
- Runtime default: sin cutover.
- Efectos protegidos: STOP; STEP 7 permanece OPEN / STOP / UNKNOWN y fuera del alcance actual.
- Nexo/Lúmina: separación obligatoria.
- Frase de entrada del chat nuevo: **NCS**.


## Addendum — continuación M0: replay de observación genérica (2026-10-18)

### Cambio realizado, sin declarar validación

- Implementación: `src/nexo/core/continuity-owner.mjs`, commit `39d13a8251e836abd1917aff071396f165993ab8`.
- Prueba de crash cut: `tests/nexo/repair-settlement-crash-cuts.test.mjs`, commit `31c8b3a4be5743ac12fc0c66bcae1d69b2fae1d6`.
- En un replay con revisión antigua, el owner reconoce una observación solo si el journal ya la persistió para la misma identidad canónica. No reejecuta el verifier. Una identidad incompatible no obtiene el replay. La respuesta usa `already_observed`, conserva `causalAttribution: NOT_ESTABLISHED`, `redispatchAuthorized: false` y no marca como settled el estado genérico `reconciled_observed`.
- CI para el SHA de prueba no tiene checks visibles ni runs confirmadas en la consulta realizada: **UNKNOWN/PENDING**. No afirmar que la suite pasó.

### Instrucciones inmediatas

1. Primero obtener evidencia ejecutable para `node tests/nexo/repair-settlement-crash-cuts.test.mjs` y las suites de continuidad/runtime que correspondan. Revisar el primer fallo si lo hay; no ocultarlo ni declarar PASS por ausencia de checks.
2. Auditar el diff del replay contra el contrato del owner: misma identidad completa, ningún segundo verifier, ningún dispatch, ningún outcome terminal, y Chronicle solo puede reflejar settlement si el settlement específico ya está persistido.
3. Después volver a la siguiente frontera documentada: identificar una entrada principal Nexo-only que no importe `world.js`, `simulation.js`, `simulate.mjs` ni memoria de asistentes de Lúmina. No alojar Chronicle en `scripts/assistants.mjs`.
4. No reabrir la investigación de locks/rutas ya documentada salvo que la prueba nueva revele un defecto. No cambiar runtime default ni ampliar acciones.

Estado: **M0 INCOMPLETO**. Chronicle sigue opt-in. Runtime default sin cutover. Efectos protegidos STOP. Nexo y Lúmina deben permanecer separados.


### Resolución del gate de validación — SHA `32df994706a16167d8d92440569b5db200feeb1b`

- La primera ejecución [39178949801](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178949801) falló por un error sintáctico de la prueba: contador `genericVerifierCalls` declarado dos veces. Se corrigió como `lostResponseVerifierCalls`; no fue una falla funcional del owner.
- En el SHA `32df994706a16167d8d92440569b5db200feeb1b`, los workflows relevantes quedaron SUCCESS: [repair crash cuts 39179028829](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028829), [effect adapter + settlement 39179029008](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179029008), [semantic validation 39179028944](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028944) y [outcome classification/restart/protected transition 39179028821](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028821).
- El resultado demuestra las suites específicas listadas, no toda la suite del repositorio ni integración del runtime general.

### Punto operativo actual

1. Replay genérico tras commit-respuesta-perdida: implementación y crash-cut test ya validados en las suites focales anteriores.
2. Siguiente: retomar la frontera arquitectónica documentada en el handoff base: inspeccionar el punto de entrada real del producto e identificar el seam mínimo Nexo-only que no cargue `world.js`, `simulation.js`, `simulate.mjs` ni memoria de asistentes de Lúmina.
3. No alojar Chronicle en `scripts/assistants.mjs`; conservar `scripts/nexo-chronicle-session.mjs` como vertical opt-in.
4. No cambiar runtime default, no ampliar acciones y no declarar M0 completo.


## Addendum — entrada Nexo-only validada (SHA de código `9174921f587b504f40524ae5e89f47da68e40ae2`)

- Nueva entrada `scripts/nexo.mjs`, invocable con `npm run nexo -- chronicle-append ...`. Solo enruta la vertical Chronicle; comandos desconocidos fallan cerrado.
- Se extrajo `executeNexoStepWithContinuityOwner` a `src/nexo/core/owner-backed-runtime.mjs`, sin imports estáticos de Lúmina/assistants. El CLI Chronicle importa este módulo directamente; `src/nexo/runtime.js` lo reexporta para compatibilidad.
- Prueba del proceso real y vertical Chronicle SUCCESS: [39179321550](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179321550). Detalle: `NEXO_NCS/BUILD/NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md`.
- No se cambió `index.html`: sigue siendo la entrada web de Lúmina. El CLI no es todavía una app web ni el runtime general de Nexo.

### Continuación exacta

1. Mantener Chronicle como única acción expuesta.
2. Siguiente gate: definir y probar la transición owner-backed para acciones explícitamente soportadas; PREPARED por CAS antes de dispatch, lineage, verificador persistido confiable, settlement y outcome. Si falta contrato de acción, bloquear antes del dispatch.
3. No cambiar runtime default, no habilitar efectos protegidos, no ampliar acciones por inferencia. M0 permanece INCOMPLETO.


## Addendum — allowlist de runtime validada (2026-10-18)

- El runtime owner-backed en `src/nexo/core/owner-backed-runtime.mjs` ahora bloquea cualquier acción fuera de `chronicle_append` antes de PREPARED/dispatch. Los handlers/verifiers registrados por un caller no habilitan por sí solos acciones nuevas.
- La suite `runtime.test.mjs` fue ajustada a este contrato; se mantienen pruebas de PREPARED UNKNOWN y de verificador ausente usando la acción habilitada. CI verde: [39179449609](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179449609), [39179591854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591854), [39179591845](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591845), [39179591868](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591868).
- Próximo gate: no añadir acciones nuevas; diseñar y probar el contrato operación-específico de reconciliación + settlement + outcome tras restart antes de habilitar otra capacidad. Mantener runtime default sin cutover y M0 INCOMPLETO.


## Current continuity pointer (verified after latest documentation commit)

- Branch: `ncs-clean-architecture`.
- HEAD verificado inmediatamente antes de este addendum: `a408a0498d4519f7220bdb022cf8088caca47782`; este addendum añade otro commit documental. En el siguiente chat, volver a leer el ref de la rama antes de escribir. No asumir que un SHA documental previo sigue siendo HEAD.
- Last code/test SHA with relevant focused CI green: `64e175a0c641357c40922bbeb6a74cd8eb63bdf0`. Comparing it to HEAD shows only these three documentation files changed: `STATUS.md`, this handoff, and `NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md`.
- The last relevant code gates are green: mission admission/continuity [39179591854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591854), outcome/restart [39179591845](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591845), semantic validation [39179591868](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591868), plus Chronicle/entrypoint [39179449609](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179449609).
- Next work must not invent a new action to fill the allowlist. Choose only from an already justified Nexo-native requirement, then define its trusted observation + settlement + outcome contract and crash/restart tests before enabling dispatch. Until such a concrete action is selected and proven, `chronicle_append` remains the sole enabled action.
- M0: **INCOMPLETO**. Runtime default unchanged. Protected effects STOP. Nexo/Lúmina separation remains mandatory.


## Addendum — continuidad read-only por CLI

- La entrada `scripts/nexo.mjs` ahora admite `status --continuity PATH`, además de `chronicle-append`. El comando status solo lee el store y devuelve revisión + contadores agregados; no imprime misiones, targets ni contenido, y no crea un store faltante.
- Test real: store ausente → bloqueado sin creación; store existente → contadores correctos y bytes idénticos antes/después.
- CI SUCCESS en SHA de código/test `f15760571a6092235c1ff8dbb776be4a384ba2d5`: [39179823123](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179823123), [39179823124](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179823124), [39179823115](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179823115).
- Esto aporta observabilidad del store, no autoriza efectos nuevos. Solo Chronicle muta desde el CLI. Mantener el gate de acción owner-backed, no cambiar runtime default y no declarar M0 completo.


## Addendum — reconstrucción de misión por la entrada Nexo (2026-10-19)

### Defecto corregido
- `reconstructNexoMissionFromSnapshot()` aplicaba el guard de reparación observada a cualquier `settled_observed`. Un `chronicle_append` ya persistido con settlement específico y outcome terminal podía reconstruirse incorrectamente como `blocked / verify_observed_repair_goal`.
- El guard ahora excluye únicamente `chronicle_append`, cuyo contrato específico verifica el append persistido y registra el outcome. Las demás acciones con `settled_observed` siguen bloqueadas y conservadoras.
- Regresión: `tests/nexo/chronicle-runtime.test.mjs` asegura que el paso Chronicle continúa `completed` tras reconstrucción. CI: [39180216543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180216543) SUCCESS.

### Capacidad read-only añadida
- `scripts/nexo.mjs` admite `mission-status --continuity PATH --mission ID`.
- Reconstruye mediante `createNexoContinuityOwner().reconstructMission()` desde el store canónico; devuelve revisión, estado/objetivo/incertidumbre y resumen por paso (ID, acción, estado, cantidad de dependencias y código de bloqueo si aplica). No devuelve targets, contexto ni payloads.
- Misión inexistente devuelve `NEXO_MISSION_NOT_FOUND`; store ausente/corrupto bloquea. No inicializa ni escribe.
- Prueba de proceso: lectura no mutante (bytes iguales), sin fuga del sentinel privado y estado Chronicle completado. CI SUCCESS en SHA `ccb1fb7218fbb0b13615a95c403b002b025faa35`: [39180275512](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275512), [39180275517](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275517), [39180275561](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275561).

### Comando
```sh
npm run nexo -- mission-status --continuity ./private/nexo-continuity.json --mission mission-1
```

Esto permite consultar la continuidad reconstruida, pero no significa que toda misión esté completada ni que un efecto observado pruebe causalidad. M0 INCOMPLETO; solo `chronicle_append` muta desde el CLI; runtime default sin cutover; efectos protegidos STOP; Nexo/Lúmina separados.


### Addendum — prueba de PREPARED a través del CLI (2026-10-19)

- `tests/nexo/entrypoint.test.mjs` ahora prepara un store real con una obligación `prepared` y ejecuta el proceso `mission-status`. El resultado debe reconstruir misión/paso como `blocked`, con `NEXO_EFFECT_RECONCILIATION_REQUIRED`.
- La salida no contiene el sentinel del payload; los bytes del store no cambian. Así el CLI no suaviza la incertidumbre ni resuelve automáticamente una obligación posiblemente despachada.
- CI SUCCESS en SHA `c7ad605f1257904cb3c4ff8eae261243068cfa95`: [39180351432](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351432), [39180351413](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351413), [39180351418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351418).
- Próxima frontera: no añadir comandos de efecto. Revisar la lectura/recuperación de la entrada independiente como una frontera de operación tras restart; después diseñar una conexión de aplicación que no importe Lúmina ni convierta los resultados de observación en autoridad. Runtime default permanece intacto.


### Addendum — replay real del CLI tras cierre de proceso (2026-10-19)

- `tests/nexo/entrypoint.test.mjs` ejecuta Chronicle append y después lanza una segunda invocación del proceso Node con la misma identidad/payload. El segundo proceso recupera el outcome ya persistido y devuelve `completed` con `dispatchAttempted=false`.
- Verificación fuerte: los bytes del archivo Chronicle y del store de continuidad no cambian en el replay; el sentinel del contenido no aparece en stdout. Esto comprueba idempotencia tras restart del CLI, no solo dentro del mismo proceso.
- CI SUCCESS en SHA `3ed7860a189b6b00d0a5444eb466a4393c4a2c4c`: [39180401874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401874), [39180401875](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401875), [39180401886](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401886).
- No extrapolar a pérdida de energía/fsync ni a otras acciones. Siguiente frontera: consolidar el contrato de recuperación del vertical y decidir el seam mínimo de aplicación Nexo sin importar Lúmina; no cambiar el runtime default.


## Current verified pointer after CLI restart regression (2026-10-19)

- Branch HEAD: `2420f0828fbb9964ee0161548c4dcd475edf12be` (documentation-only).
- Latest code/test SHA with focused CI SUCCESS: `3ed7860a189b6b00d0a5444eb466a4393c4a2c4c`.
- Compared code/test SHA → HEAD: only `NEXO_NCS/STATUS.md`, this handoff, and `NEXO_NCS/BUILD/NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md` changed.
- Verified CI: Chronicle/entrypoint [39180401874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401874), outcome classification [39180401875](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401875), semantic validation [39180401886](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401886), all SUCCESS on the code/test SHA.
- Latest validated capabilities: Chronicle settlement/outcome reconstruction no longer misclassifies Chronicle as a repair observation; `status` reads aggregate counts; `mission-status` reconstructs canonical mission state without payload disclosure; unresolved PREPARED remains blocked; same-operation CLI replay in a fresh process does not dispatch again or change either file.
- Next step: inspect the minimum application/runtime seam and its full transitive import graph. Do not integrate `src/nexo/runtime.js` into production or change the default runtime yet; it still has legacy compatibility coupling. No new mutating actions, no authority inference, no fsync/power-loss claims. M0 INCOMPLETO, protected effects STOP, Nexo/Lúmina separated.


### Addendum — guard automático del grafo de imports (2026-10-19)

- La suite de entrada recorre recursivamente los imports estáticos locales desde `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`, rechazando dependencias transitivas de `assistants/memory.js`, `simulation-adapter.js`, `world.js`, `simulation.js`, `simulate.mjs` o `src/nexo/runtime.js`.
- CI SUCCESS en SHA `c9f62e3611a598f0ab29fa1b55d2ac849a67c6c3`: [39180518798](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518798), [39180518686](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518686), [39180518787](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518787).
- Esto protege el grafo de módulos de la entrada CLI, pero no afirma aislamiento del proceso completo ni autoriza el runtime general. No cambiar `src/nexo/runtime.js` ni `index.html` todavía.


## Addendum — extracción del servicio de aplicación (2026-10-19)

### Estructura resultante
- `src/nexo/core/continuity-service.mjs`: abre store/owner canónico; solo importa módulos core.
- `src/nexo/application/chronicle-append.mjs`: contiene el caso de uso de append, prepara/ejecuta/verifica/liquida mediante el owner y contratos Chronicle.
- `src/nexo/application/continuity-queries.mjs`: consulta de contadores y reconstrucción de misión con salida sin payloads.
- `scripts/nexo.mjs`: parser/router CLI; `scripts/nexo-chronicle-session.mjs`: wrapper CLI del caso de uso; `scripts/nexo-continuity.mjs`: reexport de compatibilidad hacia core.
- Se mantuvo `src/nexo/runtime.js` sin cambios como compatibilidad legacy; la nueva aplicación no debe depender de él.

### Validación y fallo intermedio
- El primer refactor falló con `ReferenceError: blocked is not defined` al quedar el helper de resultado bloqueado en el script anterior. Se agregó explícitamente el helper en ambos límites (servicio y CLI wrapper).
- CI final SUCCESS en SHA `8d05417d0a47b5f38fb63833c338a0f04d1499e7`: [39180686782 — Chronicle/entrypoint](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180686782) y [39180686817 — mission admission/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180686817).
- La suite del grafo de imports continúa verificando que ambos entrypoints no importen la memoria de asistentes, simulación, `world.js`, `simulation.js`, `simulate.mjs` ni `src/nexo/runtime.js`.

### Límite y siguiente frontera
- El caso de uso ya puede ser consumido sin ejecutar el CLI, pero solo se ha probado la vertical Chronicle y sus consultas. No se declara runtime general, app Android/web, aislamiento OS, fsync/power-loss durability ni autoridad.
- Siguiente: revisar el contrato de la API de aplicación (inputs, resultado, idempotencia, concurrencia y recuperación) como interfaz estable antes de conectarla a otra superficie. No ampliar acciones ni cambiar runtime default. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


### Addendum — contrato directo de aplicación y carrera concurrente (2026-10-19)

- `tests/nexo/chronicle-runtime.test.mjs` importa el caso de uso desde `src/nexo/application/chronicle-append.mjs`; la prueba CLI permanece aparte.
- Dos invocaciones concurrentes de la misma operación no producen dos dispatches ni dos entradas Chronicle. Después, un retry explícito recupera `completed` con `dispatchAttempted=false`; continuidad y Chronicle quedan byte-identical durante el replay.
- CI SUCCESS en SHA `140769ea651ed5cd198fd57f05530679e79f8c5d`: [39180811315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811315), [39180811308](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811308), [39180811234](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811234), [39180811257](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811257).
- No automatic retries, queues, generic action dispatch or causality claims are added. The caller must handle a conflict/blocked concurrent loser and retry explicitly.


## Current verified pointer — application layer and concurrency proof

- Branch HEAD: `91569816fc19c56bc8126db4b18fd04976216f8a` (documentation-only).
- Last code/test SHA: `140769ea651ed5cd198fd57f05530679e79f8c5d`; focused CI SUCCESS: [39180811315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811315), [39180811308](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811308), [39180811234](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811234), [39180811257](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811257).
- Compared SHA `140769ea...` → HEAD: only `STATUS.md`, this handoff and `NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md` changed.
- Current application boundary: `src/nexo/core/continuity-service.mjs`; `src/nexo/application/chronicle-append.mjs`; `src/nexo/application/continuity-queries.mjs`; thin CLI wrappers under `scripts/`. The import-graph regression ensures no transitive dependency on Lúmina's world/simulation/assistant memory or `src/nexo/runtime.js`.
- Next gate: audit the public application contract for operation identity, payload binding, concurrent admission, result uncertainty and explicit retry behavior before any new caller (web/mobile or legacy runtime) consumes it. Do not enable a second mutating action, change the default runtime, or infer authority from store contents. M0 INCOMPLETO; protected effects STOP; Nexo/Lúmina separate.


### Addendum — carrera de inicialización con stores ausentes (2026-10-19)

- Dos llamadas concurrentes al caso de uso con continuidad y Chronicle ausentes, ambas con inicialización opt-in, no pueden despachar dos veces. La carrera puede bloquear a un caller en la inicialización/admisión; no se finge atomicidad cross-store.
- Un retry explícito converge a un único append. El replay posterior devuelve `completed` con `dispatchAttempted=false`; ambos archivos quedan byte-identical durante el replay.
- CI SUCCESS en SHA `7f4c69ef8003515c53d761677185f4668c05d5a0`: [39180909793](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909793), [39180909802](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909802), [39180909892](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909892), [39180909760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909760).
- Sin retry automático, cola, segundo dispatch ni afirmación de transacción entre archivos. El contrato exige que el caller maneje el bloqueo/conflicto y decida si vuelve a invocar.


## Verified continuity pointer — concurrent bootstrap checkpoint

- Branch HEAD: `3bcd5ea51accd008bd21163f15317d91fc367268` (documentation-only).
- Last code/test SHA: `7f4c69ef8003515c53d761677185f4668c05d5a0`.
- Compare code/test SHA → HEAD: only `STATUS.md`, this handoff, and `NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md` changed.
- Latest focused CI SUCCESS on code/test SHA: [Chronicle 39180909793](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909793), [continuity/restart 39180909802](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909802), [semantic validation 39180909892](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909892), [outcome/restart 39180909760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909760).
- Next exact task: finalize the stable application API contract: document accepted inputs/results and test invalid input, same-identity replay, payload mismatch, concurrent initial bootstrap, and unknown outcomes. Then evaluate one application integration seam without routing through legacy Lúmina memory. Do not add mutating actions or change runtime default. M0 INCOMPLETO.


### Addendum — validación de inputs de la API de aplicación (2026-10-19)

- El caso de uso se prueba directamente con ruta vacía y tipo incorrecto en un flag. Devuelve bloqueo contractual y `dispatchAttempted=false` antes de tocar los stores.
- CI SUCCESS en SHA `e8abe56f791e8460be6ae71abe723a3907bd13aa`: [39180992024](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180992024), [39180991951](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991951), [39180991860](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991860), [39180991827](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991827).
- API del vertical: validación estricta de entrada; misma identidad/payload es idempotente; payload distinto bloquea; concurrente/restart no duplica dispatch; incertidumbre no se convierte en fracaso/success inventado. Esto no cubre otras acciones ni autoriza runtime default.
