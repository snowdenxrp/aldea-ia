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
