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

## 7. Siguiente tarea concreta

**Continuar M0 hacia la migración real del runtime, pero primero cerrar el contrato de recuperación y su punto de integración con evidencia.**

Secuencia obligatoria:

1. Verificar HEAD de `ncs-clean-architecture` y leer la versión actual de `src/nexo/runtime.js`, `src/assistants/memory.js`, `scripts/nexo-continuity.mjs`, `src/nexo/core/continuity-owner.mjs` y las pruebas de runtime existentes. No asumir que no hubo commits concurrentes.
2. Hacer un mapa estrecho de llamadas reales en runtime donde hoy se crean/leen/escriben memorias de Nexo. Identificar cada write path relevante y quién lo consume. No repetir la auditoría general de todos los escritores de Lúmina; usar los hallazgos P112.
3. Definir el mínimo contrato owner-backed para que el runtime pueda reconstruir y persistir continuidad de Nexo sin serializarla en el estado de Lúmina. Distinguir:
   - misión/continuidad de Nexo;
   - intento/obligación PREPARED;
   - resultado/lineage;
   - evidencia de estado de entorno;
   - autoridad para efectos protegidos.
4. Antes de cortar legacy, añadir pruebas end-to-end de migración: arranque con memoria legacy, creación/lectura canónica de Nexo, reinicio, conflicto, store corrupto/missing, rollback/fallback seguro y separación física entre datos Nexo/Lúmina. Fallback nunca debe convertir estado desconocido/corrupto en memoria vacía.
5. No resolver aún efectos no idempotentes con observación de estado. Si no existe recibo durable/identidad de operación, mantener UNKNOWN/PREPARED y bloquear redispatch.
6. Integrar el owner en runtime solo después de que el contrato y los crash cuts estén definidos y probados. Hacer un cambio pequeño y coherente, no una migración masiva. Preservar rollback hasta verificar.
7. Correr CI sobre el head exacto; revisar jobs y logs, y actualizar `STATUS.md` + handoff con SHAs/run IDs. Registrar fallos reales, no ocultarlos.
8. Después, continuar con la siguiente frontera que desbloquee M0. No considerar M0 completo hasta que Nexo use su propia continuidad operativa en el runtime con persistencia/reinicio/migración/rollback probados y sin mezclar Lúmina.

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
