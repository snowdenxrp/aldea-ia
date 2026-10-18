## Incremento M0 — entrada repair-only owner-backed (2026-10-18)

Se añadió `scripts/nexo-repair-entrypoint.mjs` (`runNexoRepairOnce`) para reunir los helpers existentes en un flujo limitado a reparaciones convergentes. Para una obligación PREPARED previa, intenta observar la invariante persistida primero; solo considera dispatch si el estado sigue en la revisión base y la observación demuestra que la invariante no está presente. Rechaza target/context discrepante y revisiones nuevas. Settlement se mantiene separado y solo registra `settled_observed`.

Test del entrypoint/crash recovery: [CI 39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), SHA `e36121220d4d89475a68bc4bf1a0d2880b4092be`, SUCCESS. Incluye recovery antes del dispatch y el caso donde la invariante ya estaba satisfecha: settlement observado sin escritura ni avance de revisión del entorno.

No confundir este entrypoint de script con la integración productiva: `src/nexo/runtime.js` sigue usando la memoria heredada y no llama a `runNexoRepairOnce`. No hay atomicidad cross-store demostrada, no se completan misiones y los efectos protegidos permanecen fuera de alcance. Siguiente paso: auditar el contrato del entrypoint (incluido el caso de estado ya satisfecho sin escritura y los límites de recuperación) y preparar pruebas de integración antes de cualquier corte de runtime.

---

## Incremento confirmado — recuperación después del commit de entorno (2026-10-18)

El test de lifecycle ahora simula el crash cut entre persistir el entorno y liquidar PREPARED. Commit de prueba: [55f9a064dd28ed5b51eb552f903f3bec504f9640](https://github.com/snowdenxrp/aldea-ia/commit/55f9a064dd28ed5b51eb552f903f3bec504f9640). CI exacto [39141847081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141847081) terminó SUCCESS en ese SHA; los tres pasos de prueba del workflow finalizaron success.

La prueba persiste entorno revisión 31 desde PREPARED revisión 30, reabre el owner/store desde disco, observa la invariante y registra `settled_observed`, y confirma que replay queda bloqueado sin otra escritura. Esto valida el helper lifecycle y recuperación de estado, no un reinicio completo de la aplicación productiva ni atomicidad cross-store. STATUS con evidencia actualizado en [ef459d67c31fe0c03515ab226b56dcc7a8d27ef5](https://github.com/snowdenxrp/aldea-ia/commit/ef459d67c31fe0c03515ab226b56dcc7a8d27ef5).

Próximo paso: diseñar un único entrypoint repair-only owner-backed con contratos explícitos para PREPARED, dispatch, observación/settlement, recovery y UNKNOWN/STOP. No migrar todavía el runtime genérico que registra outcomes vía `src/assistants/memory.js`; no activar efectos protegidos.

---

## Incremento posterior — replay y stale revision (2026-10-18)

La prueba integrada `tests/nexo/repair-owner-lifecycle.test.mjs` ahora incluye dos regresiones adicionales en el commit [53cf292ae966c80eb722a7f48eec0c6c2c86595d](https://github.com/snowdenxrp/aldea-ia/commit/53cf292ae966c80eb722a7f48eec0c6c2c86595d):

1. Tras `settled_observed`, repetir dispatch debe quedar bloqueado sin mutar entorno ni continuidad.
2. Si el entorno cambia de revisión 20 a 21 después de PREPARED, dispatch debe fallar cerrado, conservar revisión 21 y dejar la obligación PREPARED para reconciliación.

**CI exacto verificado:** [run 39141470114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141470114) completó SUCCESS sobre el commit de prueba `53cf292ae966c80eb722a7f48eec0c6c2c86595d`. El job `repair-crash-cuts` y los tres pasos de test finalizaron `success`. STATUS actualizado con esta evidencia en commit [e6b48e922af1caf5e173ae273e2f7a2e80c84fba](https://github.com/snowdenxrp/aldea-ia/commit/e6b48e922af1caf5e173ae273e2f7a2e80c84fba).

Estas pruebas cubren el comportamiento de helpers repair-only, no el corte de runtime productivo ni atomicidad entre almacenes. Siguiente: verificar CI del commit de test; corregir cualquier fallo real; después añadir/ejecutar el corte de crash tras persistencia de entorno antes del settlement y evaluar un entrypoint owner-backed repair-only antes de cualquier conexión a `runtime.js`.

---

# NCS — MASTER HANDOFF PARA NUEVO CHAT — MISIÓN M0

Fecha de corte: 2026-10-18
Repositorio: `snowdenxrp/aldea-ia`
Rama de trabajo: `ncs-clean-architecture`
Misión única: **terminar M0 sin desviaciones y sin perder continuidad**.
Puerta de entrada obligatoria en la próxima sesión: `NEXO_NCS/STATUS.md`.

## 0. Instrucción inicial para el siguiente chat

El usuario iniciará el nuevo chat escribiendo exactamente: `NCS`.

Al recibir `NCS`:
1. Leer primero `NEXO_NCS/STATUS.md`.
2. Leer este documento completo: `NEXO_NCS/BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md`.
3. Leer el handoff de migración y el checkpoint de execution lineage enlazados más abajo.
4. Retomar desde la sección **“Siguiente tarea concreta”**. No volver a empezar auditorías históricas, no repetir investigaciones cerradas, no pedir al usuario que repita el contexto.
5. Verificar el estado real de la rama y los checks del HEAD antes de afirmar cuál es el commit más reciente o que CI está verde. Los SHAs que aparecen en este documento son puntos de evidencia específicos, no garantía de que sean el HEAD más nuevo.
6. Mantener el trabajo centrado en M0. No desviarse a M1, Step 7, GenesisRoot, Lúmina, negocio personal u otras líneas salvo que un bloqueo técnico concreto de M0 lo requiera.

## 1. Meta real de M0

Construir la base operativa propia de Nexo: continuidad y memoria operativa con propiedad arquitectónica de Nexo, recuperación tras reinicio, admisión de misiones y registro de resultados con evidencia suficiente, manteniendo autoridad/Constitución por encima de cualquier ejecución.

La meta no es simplemente tener archivos, tests o un prototipo que “funcione”. M0 debe dejar una ruta de runtime de Nexo coherente, comprobable, recuperable y separada de Lúmina. No se debe activar una ruta protegida ni declarar migración completa hasta que los límites de persistencia, recuperación, evidencia y rollback estén demostrados.

Axiomas de separación:
- Modelo ≠ Nexo.
- Sistema operativo ≠ Nexo.
- Dispositivo ≠ Nexo.
- Lúmina ≠ Nexo.
- La memoria/continuidad operativa de Nexo debe pertenecer a Nexo; no serializarla dentro del estado de simulación de Lúmina.
- El teléfono es un posible canal/dispositivo, no la autoridad de identidad del propietario.

## 2. Estado real al corte

### Hecho y comprobado en el repositorio
- Hay un almacén canónico separado de continuidad de Nexo y un owner semántico para cargar/reconstruir misiones, registrar misiones y escribir obligaciones `PREPARED`.
- `recordExecutionLineage()` existe en `src/nexo/core/continuity-owner.mjs`. Registra una línea de ejecución en el almacén de Nexo con CAS de `storeRevision`, identidad vinculada a misión/paso/acción/target y controles de replay. **No liquida ni modifica `effectJournal`.**
- Para reparaciones, la línea de ejecución exige una obligación `PREPARED` única y coincidente, y exige que la revisión de entorno de la operación coincida con la capturada en `PREPARED`.
- Si la revisión falta o difiere, la operación falla cerrada antes de guardar línea de ejecución.
- La reconstrucción de una obligación sin resolver conserva la misión bloqueada. `settled_observed` también reconstruye bloqueada y dirige a verificar el objetivo sin redispatch.
- Hay scripts de preparación, dispatch, liquidación observada y verificación de objetivos para reparaciones convergentes. La ruta de settlement registra observación, no causalidad, y no está conectada al runtime productivo.
- Se añadió una prueba de crash cuts para la frontera donde Lúmina ya persistió pero Nexo continúa PREPARED, para revisión de entorno no relacionada y para invariante ausente.
- La corrección del fixture de prueba de persistencia se verificó en CI.
- Los workflows exactos indicados en la sección 5 pasaron.

### No está hecho / no se debe afirmar
- M0 sigue INCOMPLETO.
- `src/nexo/runtime.js` todavía utiliza rutas de memoria legacy desde `src/assistants/memory.js`; la migración del runtime no está terminada.
- No hay prueba de arranque completo de Nexo → frontera real de efectos protegidos.
- No existe atomicidad entre el almacén de continuidad de Nexo y el archivo persistido de entorno de Lúmina.
- `recordExecutionLineage()` no autentica evidencia externa ni prueba causalidad; un objeto caller-provided con `status: completed` o `verified: true` no es prueba independiente.
- `settled_observed` no significa `completed`; no debe habilitar ejecución, redispatch ni efectos protegidos.
- No hay evidencia de migración real de dispositivo ni de ejecución protegida autorizada.
- STEP 7 permanece `OPEN / STOP / UNKNOWN`. No reabrirla ahora salvo que M0 dependa concretamente de un requisito suyo.
- No se debe declarar todo M0 terminado porque pasaron tres workflows de CI.

## 3. Cambios de código recientes

### A. Owner-backed execution lineage
Archivo principal: `src/nexo/core/continuity-owner.mjs`.

La API `recordExecutionLineage({ expectedRevision, operation, result })`:
- valida contexto e identidad de la operación;
- usa `storeRevision` esperado y rechaza revisiones obsoletas;
- verifica que la misión y el paso existan y que acción/target coincidan;
- requiere una única entrada `effectJournal` con misma clave idempotente, misión, paso, acción y target y estado `prepared`;
- para `repair_agent_state`, `repair_agent_needs`, `repair_resource_state`, requiere revisión de entorno válida y coincidente con la revisión persistida en PREPARED;
- no duplica una identidad de ejecución existente ni reemplaza su primer registro;
- registra lineage, pero devuelve `journalSettled: false` y no modifica el estado del journal.

Códigos de bloqueo importantes:
- `NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED`
- `NEXO_EXECUTION_PREPARED_IDENTITY_MISMATCH`
- `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`
- `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`
- `NEXO_CONTINUITY_STORE_REVISION_CONFLICT`

### B. Recovery de reparación persistida
Archivos relevantes:
- `scripts/nexo-repair-preparation.mjs`
- `scripts/nexo-repair-dispatch.mjs`
- `scripts/nexo-repair-settlement.mjs`
- `scripts/nexo-repair-mission-verification.mjs`
- `src/nexo/adapters/persisted-repair-observation.mjs`
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`
- `tests/nexo/simulation-restart-persistence.test.mjs`

Límites comprobados:
- preparación carga estrictamente el estado persistido y liga la revisión a PREPARED;
- dispatch requiere que la revisión persistida siga siendo exactamente la preparada;
- la persistencia usa la primitiva condicional existente de `persistState()`;
- si el resultado de persistencia es ambiguo, no se redispatcha automáticamente;
- settlement solo puede producir `settled_observed` si la revisión del entorno es la preparada o la inmediatamente siguiente y la invariante de reparación está presente;
- si la revisión es más avanzada/no relacionada o falta la invariante, se mantiene PREPARED;
- la atribución causal se registra como `not_claimed`;
- la reconstrucción de `settled_observed` queda bloqueada y solicita verificación sin redispatch.

### C. Corrección del test de revisión persistida
`applyState()` crea simulación en memoria y no conserva `stateRevision` del snapshot persistido. La prueba había calculado la revisión siguiente desde el objeto de simulación y fallaba. Se corrigió para conservar el snapshot estrictamente cargado (`changedGoalSource`) y calcular `changedGoalSource.stateRevision + 1`. No se cambió la persistencia de Lúmina para acomodar el test.

### D. Owner-backed durable outcome recording — latest increment

Added `recordOutcome({ expectedRevision, outcome })` to `src/nexo/core/continuity-owner.mjs`. It persists step outcomes through Nexo's own store CAS, binds them to the stored mission/step/action/target, preserves the first attempt, and refuses completed outcomes while the matching effect journal remains `prepared` or `settled_observed`. The method does not settle the journal and reports authorization as `NOT_EVALUATED`.

Regression coverage was added to `tests/nexo/continuity-migration.test.mjs` for required completion evidence, durable reconstruction, replay immutability, and the unresolved-effect guard. The focused M0 workflow now runs both continuity migration and repair crash-cut tests.

Evidence:
- Owner implementation: `cd559da754ca407da25095f689e434e314597e42`
- Unresolved-effect completion guard: `d6eed85aadcb106eeed7cfb44c0e47d215c4b5af`
- Exact source + test head: `c7a8852b791dec8a2bee64cda6126aa1658af198`
- Focused workflow: [39140292963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140292963) — SUCCESS; crash-cut and continuity-migration test steps passed.
- Mission/restart [39140282526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282526), STEP 4 [39140282510](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282510), STEP 5 [39140282488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282488) — SUCCESS on the source/test head.
- Detailed checkpoint: `NEXO_NCS/BUILD/NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md`.

This is a persistence primitive, not runtime cutover. Runtime still uses legacy memory. No independent evidence authentication, cross-store atomicity, authority, or protected-effect authorization is claimed.

## 4. Commits de referencia y evidencia

Los SHAs siguientes identifican cambios concretos; consultar GitHub para HEAD real antes de hacer más cambios.

### Owner/lineage y endurecimiento
- Owner inicial lineage: `f5e9e20c9911f75b66624aa62c4af020e185a326`
- Test inicial lineage: `014b589ff84e1bdae5d7f4ef44068264b70cf363`
- Owner exige PREPARED: `71b2db0b83e190f9f6d13c765a4e1bc85857903d`
- Regresión sin PREPARED: `9971058e2477aa458e6afebdb240f4a52b3b2401`
- Bloqueo de reconstrucción `settled_observed`: `98caddd0edd81908c2f07b199391e9fe85dbeeae`
- Owner liga la revisión de entorno de lineage a PREPARED: `291d482a2f1e03294c519bb8971fcce0b1c69176`
- Regresión de revisión discrepante: `4667d3b3cbe4a587c6e53118961437b2db733958`
- Corrección del fixture crash-cut: `ea1a8390c2826021feab46f3197c84a1a4f47039`
- Pruebas de revisión ausente y discrepante: `12452f8d851c646d3cb7674cd0f59d7ba1246fe1`

### Documentación actualizada
- Estado: `NEXO_NCS/STATUS.md`
- Handoff de migración: `NEXO_NCS/BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md`
- Checkpoint lineage: `NEXO_NCS/BUILD/NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md`
- Análisis de fence cross-store: `NEXO_NCS/BUILD/NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md`
- Decisión de consumidor de goal observation: `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md`

## 5. CI verificado — no extrapolar fuera de estos heads

Exact-head test commit `12452f8d851c646d3cb7674cd0f59d7ba1246fe1`:
- Mission/restart continuity: run [39139024311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024311). El job confirma éxito de `tests/nexo/simulation-restart-persistence.test.mjs` y `tests/nexo/continuity-migration.test.mjs`.
- STEP 5 outcome classification: run [39139024315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024315).
- STEP 4 semantic validation: run [39139024377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024377).

También existe:
- Crash-cut settlement run [39138771613](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138771613), para el owner code head `291d482a2f1e03294c519bb8971fcce0b1c69176`.
- La verificación de crash cuts cubre las condiciones descritas, no la atomicidad entre almacenes ni la integración del runtime.

**Regla de evidencia:** no copiar “PASS” a commits posteriores sin comprobar su propio run/job/log. Si la documentación cambia después del head probado, el código no necesariamente cambia, pero tampoco se debe presentar el nuevo head documental como si fuera el head exacto probado por esos workflows.

## 6. Decisiones ya cerradas; no repetir auditorías

- La verificación de objetivo en `scripts/nexo-repair-mission-verification.mjs` es de solo lectura. No hay consumidor productivo demostrado que requiera persistir un estado terminal `goal_observed`; el runtime no la llama. Por tanto, no crear un fence cross-store solo para persistir ese estado no utilizado. Revalidar el estado actual cuando un consumidor lo necesite.
- No reabrir las auditorías P112 ya realizadas:
  - `NEXO_CONTINUITY/P112_PERSISTSTATE_FINAL_COMMIT_FEASIBILITY_AUDIT_V1_2026-10-07.md`
  - `NEXO_CONTINUITY/P112_PERSISTSTATE_PHYSICAL_BOUNDARY_CRASH_CUT_AUDIT_V2_2026-10-07.md`
  - `NEXO_CONTINUITY/P112_PROTECTED_OWNER_AGAINST_EXISTING_PERSISTENCE_PRIMITIVE_V1_2026-10-07.md`
  - `NEXO_CONTINUITY/P112_WRITER_DEPENDENCY_GRAPH_V1_2026-10-07.md`
- No hacer un transaction wrapper genérico, no inventar revisiones globales, IDs, colas, retries, tombstones ni hooks solo para tests.
- No quitar todavía el path legacy de memoria.
- No conectar todavía settlement ni lineage al runtime como si fueran autoridad para ejecutar.
- No afirmar que una revisión contigua prueba causalidad: es una restricción conservadora de reconciliación, no una prueba causal.

## Incremento adicional — integración repair-only (2026-10-18)

Se añadió `tests/nexo/repair-owner-lifecycle.test.mjs`, una regresión integrada sobre los helpers reales existentes. Cubre la secuencia:
1. continuidad legacy importada al store Nexo separado;
2. PREPARED comprometido contra la revisión de entorno 10;
3. dispatch repair-only con persistencia condicional del entorno en revisión 11;
4. settlement separado como `settled_observed`, sin causalidad afirmada;
5. verificación de solo lectura `goal_observed`, sin marcar misión completada ni mutar continuidad;
6. aserción de que el archivo de Lúmina no incluye `nexoMemory`.

Workflow modificado para ejecutar el test: `.github/workflows/nexo-m0-repair-crash-cuts.yml`.

Commits:
- Test integrado: `eddf41c542b252329e45304245728a7bdb5d6800`
- Workflow: `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`
- STATUS: `42af7045279ddc494abc8c2b4f984a5506781596`

CI enfocado [39140959531](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140959531) completó **SUCCESS** en el SHA exacto del workflow `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`. El job `repair-crash-cuts` y los pasos de crash-cut, migración y lifecycle integrado finalizaron `success`. Esta prueba todavía **no** integra `runtime.js`; valida el flujo repair-only de los helpers ya existentes. Los commits documentales posteriores no cambian el SHA al que aplica esta evidencia.

## Incremento — CI trigger coverage corregida (2026-10-18)

El workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml` ahora activa CI ante cambios en preparación, dispatch, settlement, verificación de misión, migración de continuidad y la prueba integrada. Antes, varios de esos inputs no estaban en `paths`, por lo que una edición podía no ejecutar el workflow focalizado.

- Commit: `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`.
- CI exacto: [39141182732](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141182732), **SUCCESS** sobre ese mismo SHA; todos los tres pasos de test configurados finalizaron `success`.
- Pendiente como regresión explícita: replay después de `settled_observed` y revisión de entorno obsoleta entre PREPARED y dispatch. No inferir que están cubiertos por el PASS actual.

## 7. Siguiente tarea concreta

**La inspección dirigida y el mapa de integración ya están hechos; no repetirlos. El siguiente paso es definir y probar la entrada owner-backed real para la ruta repair-only antes de conectarla al runtime general.**

Estado actual de la inspección (revalidado en HEAD antes de esta actualización):
- `scripts/assistants.mjs` ya usa `owner.recordMission()` para persistir la misión en el store independiente; no ejecuta misiones.
- `scripts/simulate.mjs` abre continuidad para migración legacy/diagnóstico, pero no ejecuta misiones.
- `src/nexo/runtime.js` sigue usando `src/assistants/memory.js` para plan, execution, outcome y reconstruction; no hay caller productivo demostrado que ejecute `executeLuminaNexoStep()`.
- `world-state.json` excluye `nexoMemory`; la regresión de reinicio ya verifica esa separación. No reintroducirla.
- El owner tiene `recordMission`, `recordPrepared`, `recordExecutionLineage` y `recordOutcome`, pero el último no autentica evidencia externa y ninguno autoriza efectos protegidos. `settled_observed` no equivale a misión completada.

Secuencia obligatoria:

1. Diseñar una sesión/entrada de ejecución **específica para las tres reparaciones convergentes existentes**; no una capa genérica de transacciones. Debe cargar misión canónica, mantener `storeRevision`, preparar antes del dispatch, usar el fence de `stateRevision`, liquidar solo por observación persistida y volver a verificar el objetivo.
2. La recuperación de un PREPARED preexistente no debe redispatchar automáticamente. Si el estado persistido no prueba la invariante, dejar PREPARED/UNKNOWN y detenerse.
3. Añadir primero pruebas con archivos temporales para: ejecución repair-only normal; crash/reinicio después de PREPARED; crash tras persistencia de entorno antes de settlement; revisión de entorno obsoleta; conflicto del store Nexo; invariant ausente/UNKNOWN; y comprobación de que el resultado nunca afirma causalidad ni misión completada.
4. Ejecutar CI para ese test y revisar el log exacto. Solo después implementar el mínimo helper owner-backed y volver a ejecutar las pruebas. No conectarlo todavía a efectos no idempotentes ni a la ruta protegida general.
5. Mantener la ruta legacy disponible hasta que una prueba end-to-end cubra arranque, misión canónica, dispatch elegible, recuperación, reinicio y rollback/fallback seguro. Corrupto/missing desconocido no se convierte en memoria vacía.
6. Verificar HEAD y CI sobre el SHA exacto; actualizar `STATUS.md` y este handoff con commits y run IDs. No extrapolar PASS a un SHA sin run/job/log.
7. Solo después decidir el punto mínimo de conexión a `runtime.js`. M0 no se declara completo hasta que el runtime de Nexo usa su continuidad propia con persistencia/reinicio/migración/rollback probados y sin mezclar Lúmina.

## 8. Criterios de “no avanzar todavía”

Detener el corte y rediseñar la raíz si:
- la continuidad de Nexo sigue siendo serializada junto al estado de Lúmina;
- el runtime no tiene una fuente canónica para su memoria operativa;
- un error de carga se transforma en inicialización vacía;
- un resultado de adapter puede liquidar PREPARED sin evidencia independiente;
- un restart permite redispatch no seguro;
- un commit de Nexo se presenta como atómico con un commit de Lúmina sin fence real;
- los tests prueban solo funciones aisladas y no el camino real de arranque/runtime;
- la evidencia no conecta trigger → run → job → head → artefacto/log → interpretación.

## 9. Mensaje operativo al siguiente asistente

Trabaja directamente en el repositorio con cambios concretos, inspecciones dirigidas y pruebas. No respondas con otra recapitulación extensa como sustituto de avance. No repitas las mismas explicaciones cada turno. No marques tareas terminadas solo porque el usuario diga “continúa”. El usuario quiere iniciativa, pero exige precisión y continuidad.

La misión es M0. Todo lo que no desbloquee M0 debe esperar.
