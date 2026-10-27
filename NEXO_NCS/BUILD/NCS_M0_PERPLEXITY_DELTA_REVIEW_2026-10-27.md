# NCS M0 — Revisión de delta del informe Perplexity (2026-10-27)

**Estado:** nota documental de contraste estático; no es contrato ratificado ni implementación.  
**Rama de referencia:** `ncs-clean-architecture`, commit inspeccionado `e477bdefb4db82456997c106ce7ff65673e15f67`.  
**Gates:** M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; D3/STOP vigente.  
**Cambios ejecutables, tests y CI:** ninguno realizado por esta revisión.

## 1. Resultado ejecutivo

El informe Perplexity aporta una corrección importante al inventario de la rama: `scripts/assistants.mjs` es un tercer caller directo de `openNexoContinuityOwner`, además de Chronicle y simulación. La ruta de `legacyMemory` inicializa continuidad desde `persisted.nexoMemory` cuando el store Nexo no existe, sin depender de `allowEmptyInitialization`. La continuidad alimenta la planificación y puede compartir invocación con persistencia de estado de Lúmina.

También se hizo una comprobación de lectura acotada de los archivos de `main` relevantes para distinguir la superficie de automatización del código de la rama auditada. No se consultó historial de Actions ni se verificó si el workflow ha corrido.

## 2. Hallazgos de rama confirmados estáticamente en este contraste

### DLT-01 — Tercer caller directo: `scripts/assistants.mjs`

En el commit de referencia, `scripts/assistants.mjs`:
- carga el estado de mundo mediante `loadStateStrict` si el archivo existe;
- llama a `openNexoContinuityOwner` con `legacyMemory: persisted.nexoMemory ?? null` y `allowEmptyInitialization: !stateExists`;
- pasa `continuity.current.snapshot` a `buildNexoMission`;
- registra la misión con `continuity.owner.recordMission`;
- escribe memoria de asistentes y persiste el estado del mundo en la misma invocación.

**Consecuencia:** el inventario de “dos callers directos” era incompleto. Actualizar el inventario a tres rutas observadas: Chronicle, `simulate.mjs` y `assistants.mjs`. Esto es inspección estática, no ejecución.

Fuente: [scripts/assistants.mjs en el commit de referencia](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/scripts/assistants.mjs).

### DLT-02 — La migración `legacyMemory` inicializa sin `allowEmptyInitialization`

En `continuity-service.mjs`, al no encontrar el store:
- si `legacyMemory` no es null/undefined, proyecta la memoria heredada a un snapshot;
- solo consulta `allowEmptyInitialization === true` cuando no existe memoria heredada;
- inicializa el store con el snapshot resultante.

Por tanto, la ausencia de `allowEmptyInitialization` no impide el camino de migración. El estado de mundo existente puede sembrar el store Nexo separado. Esto amplía la brecha de aislamiento; no demuestra por sí solo autoridad ni un efecto protegido.

Fuentes: [continuity-service.mjs](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/src/nexo/core/continuity-service.mjs) y [continuity-snapshot.mjs](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/src/nexo/core/continuity-snapshot.mjs).

### DLT-03 — Consumidores que afectan planificación

En la ruta de `assistants.mjs`, `continuity.current.snapshot` se usa como memoria al construir la misión. `src/nexo/orchestrator.js` consulta `doNotRepeat` para condicionar pasos. El análisis de consumidores no puede limitarse a `effectJournal`: debe cubrir también `missions`, `attempts`, `executions` y `doNotRepeat`.

Estado: el impacto en planificación está confirmado estáticamente en los archivos citados; el grafo global de consumidores sigue incompleto.

Fuente: [orchestrator.js](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/src/nexo/orchestrator.js).

## 3. Distinción crítica: workflow presente en la rama frente al código ejecutado desde main

El archivo `.github/workflows/lumina-simulation.yml` contiene cron cada cinco minutos, `workflow_dispatch`, permisos `contents: write`, y pasos que ejecutan `npm test`, `npm run assistants` y `npm run simulate`. Sin embargo, antes ejecuta `git fetch origin main` y `git reset --hard origin/main`.

Una lectura puntual de `main` encontró diferencias relevantes respecto del commit de la rama:

- En `main`, `scripts/assistants.mjs` no llama a `openNexoContinuityOwner`; usa `simulation.nexoMemory`, construye la misión y la registra con `recordNexoPlan`.
- En `main`, `scripts/simulate.mjs` no abre el store separado de continuidad y su payload de persistencia no incluye `nexoMemory`.
- El workflow, por tanto, **no puede describirse como ejecución confirmada de los tres callers de la rama auditada**. El propio YAML sincroniza `main` antes de ejecutar.

**Límite:** esto solo confirma el contenido estático leído en los archivos de `main` durante esta comprobación. No confirma que el workflow haya corrido, qué commit exacto ejecutó en una ejecución concreta, ni su resultado. No se consultó historial de Actions ni logs. La presencia del workflow es una superficie automatizada relevante, pero su alcance runtime real permanece parcialmente UNKNOWN.

Fuentes:
- [Workflow de simulación](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/.github/workflows/lumina-simulation.yml)
- [assistants.mjs en main](https://github.com/snowdenxrp/aldea-ia/blob/main/scripts/assistants.mjs)
- [simulate.mjs en main](https://github.com/snowdenxrp/aldea-ia/blob/main/scripts/simulate.mjs)
- [package.json en main](https://github.com/snowdenxrp/aldea-ia/blob/main/package.json)

## 4. Carrera de inicialización y tests existentes

Perplexity informa de un test de carrera de bootstrap en `tests/nexo/chronicle-runtime.test.mjs`. En este contraste no se ejecutó ni se leyó el cuerpo de ese test; su mera existencia no demuestra que cubra escritores no cooperativos, cortes de proceso, fallos ambiguos o todos los caminos de inicialización.

La preocupación sobre un escritor no cooperativo entre la comprobación de existencia y el `rename` se mantiene como hipótesis estática que requiere una prueba/contrato de exclusión apropiado; no debe etiquetarse como una carrera reproducida.

## 5. Estado revisado de propiedades negativas

| Propiedad | Estado después del contraste |
|---|---|
| NBP-01 — ausencia de autoridad derivada de estado local | UNKNOWN global; consumidores no exhaustivos |
| NBP-02 — bootstrap no continúa hacia admisión/efectos | Refutada estáticamente en Chronicle; también hay admisión de misión en `assistants.mjs` |
| NBP-03 — rechazo de payload mixto | No demostrado; sin cambio |
| NBP-04 — ausencia no habilita creación/operación normal | No satisfecha en rutas de la rama inspeccionadas; la migración `legacyMemory` amplía el caso |
| NBP-05 — errores y corrupción no tratados como ausencia | Parcial por ruta; UNKNOWN global |
| NBP-06 — estado inicial no decide reintento/reconciliación por sí solo | UNKNOWN global; consumidores de varias colecciones aún incompletos |
| NBP-07 — exclusión frente a todos los escritores | UNKNOWN; el informe identifica lock cooperativo, pero no se ejecutaron pruebas ni se verificó exclusión global |
| NBP-08 — bootstrap no habilita reparación indirecta | La sesión M0 de producto está bloqueada; alcanzabilidad global de módulos dedicados UNKNOWN |
| NBP-09 — NOT_EVALUATED no equivale a aprobación | Sigue siendo una etiqueta que no prueba enforcement |
| NBP-10 — bootstrap no se mezcla con persistencia operativa | No demostrado; `assistants.mjs` registra misión y persiste mundo en una invocación |

## 6. Próximo trabajo documental, ordenado

1. Corregir el mapa de callers de dos a tres para la rama `ncs-clean-architecture`.
2. Añadir `legacyMemory` como camino de inicialización independiente de la bandera de bootstrap vacío.
3. Extender el inventario de consumidores a las cinco colecciones de continuidad y a los puntos de planificación, dispatch y reconciliación.
4. Mantener separadas tres preguntas: contenido de la rama NCS, contenido de `main`, y evidencia de ejecuciones reales de Actions.
5. Si se autoriza en una etapa posterior, leer estáticamente los tests de carrera y de CLI citados, sin ejecutarlos, y registrar exactamente qué propiedades cubren.
6. No consultar ni inferir el historial de Actions como si ya estuviera comprobado. El estado de ejecuciones permanece UNKNOWN.

## 7. Límites y decisión

- Inspección estática de archivos de la rama de referencia y lectura puntual de archivos en `main`; no se ejecutó código del repositorio.
- No se ejecutaron tests ni CI; no se consultaron logs ni historial de Actions.
- No se modificaron archivos de runtime, tests, workflows ni configuración ejecutable.
- No se habilitaron reparaciones ni efectos.
- D3/STOP sigue vigente. Opción A sigue siendo investigación de almacenamiento local estrictamente no autoritativo, no un contrato aceptado.
- M0 permanece `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`.

Una propiedad no se considera demostrada por el nombre de una bandera, por un comentario, por la presencia de un test, ni por la existencia de un workflow. Se requiere evidencia que cubra la ruta y el fallo concreto que la propiedad pretende excluir.


## 8. Inventario estático de colecciones y consumidores (2026-10-27)

Este addendum sigue el punto exacto del handoff: inventariar consumidores de las cinco colecciones copiadas por `projectNexoContinuitySnapshot`, sin reabrir el censo general ni ejecutar código.

### Forma y semántica del snapshot

`src/nexo/core/continuity-snapshot.mjs` (blob `56cbd1753f1fa3fb67c3592e5a5664b58d96c4c3`, líneas 8–13 y 44–51) limita el snapshot a `missions`, `attempts`, `doNotRepeat`, `executions` y `effectJournal`, más `schema` y `schemaVersion`. La proyección hace `structuredClone` de cada colección; no incluye `runs`, `lessons`, `patterns`, estado del mundo ni una representación de autoridad.

`src/nexo/core/continuity-service.mjs` (blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`, líneas 81–104) intenta cargar primero el store canónico. Si recibe “not found” y `legacyMemory` no es null, proyecta esa memoria aunque `allowEmptyInitialization` sea falso; la bandera solo habilita el snapshot vacío cuando no hay memoria heredada. Si el archivo canónico existe pero está corrupto/da error distinto de NOT_FOUND, el servicio propaga el error en vez de caer a la migración.

### Matriz por colección

| Colección | Consumidor estático identificado | Efecto observable del dato | ¿Puede influir en control operativo? | Límite |
|---|---|---|---|---|
| `missions` | `continuity-owner.mjs` (`recordMission`, `recordPrepared`, `recordOutcome`); `continuity-operations.mjs` (`reconstructNexoMissionFromSnapshot`); `chronicle-append.mjs` busca/admite la misión; `owner-backed-runtime.mjs` busca misión/paso. | Fija identidad de misión/paso, acción, target, estado y dependencias reconstruidas. | **Sí:** admisión, elegibilidad PREPARED y posibilidad de dispatch. | No demuestra autoridad constitucional; son datos operacionales persistidos. |
| `attempts` | `continuity-operations.mjs` registra outcomes y reconstruye el estado de los pasos a partir de intentos; `orchestrator.js` expone solo el conteo como `memorySignals.attempts`. | Los intentos ligados a misión/paso/acción/target pueden marcar un paso completed/failed/blocked o bloquear ante discrepancias. | **Sí, para reconstrucción/planificación**; el conteo de `orchestrator.js` por sí solo no decide ejecución. | La presencia de un outcome/attempt no autentica su procedencia ni demuestra que el efecto ocurrió. |
| `doNotRepeat` | `continuity-operations.mjs` añade la entrada cuando un outcome trae `doNotRepeat: true`; `orchestrator.js` consulta acción y target en `repeatBlocked`. | Coincidencia de acción y target marca un paso planificado como `blocked` con `DO_NOT_REPEAT`. | **Sí:** cambia selección y planificación de misión. | No es una autorización ni una barrera universal contra otros callers. |
| `executions` | `continuity-owner.mjs` registra linaje mediante `recordExecutionLineage`; `continuity-operations.mjs` conserva una entrada por idempotency key y expone el conteo en `operationalSignals.executions`. | Registra el resultado del adapter como linaje; una repetición de la misma identidad no añade otra ejecución. | **Limitado en la evidencia observada:** sirve para trazabilidad/identidad y señales; la reconstrucción inspeccionada usa el conteo como señal, no como prueba de autorización. | El resultado guardado no liquida `effectJournal`; el código lo declara explícitamente. No prueba causalidad ni éxito verificado. |
| `effectJournal` | `continuity-owner.mjs` (`recordPrepared`, `recordExecutionLineage`, `reconcilePrepared`); `owner-backed-runtime.mjs` busca obligaciones existentes; `continuity-operations.mjs` valida ownership/identidad y reconstruye estados. | Conserva PREPARED, identidad de operación, observaciones/settlement y resultados de reconciliación. | **Sí, directamente:** PREPARED existente/UNKNOWN bloquea redispatch; entradas huérfanas, no reconocidas o desalineadas bloquean la misión y requieren reconciliación. | El journal es una obligación operativa, no una fuente de autoridad. Una etiqueta de estado o source no prueba por sí sola el efecto externo. |

Fuentes de código por blob:
- `src/nexo/core/continuity-operations.mjs`: `cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5`.
- `src/nexo/core/continuity-owner.mjs`: `6d1fa37745ca57e5ab5093b9cdcabf1ff5495261`.
- `src/nexo/core/owner-backed-runtime.mjs`: `a7a014489209273ce78d0103afa785728d4c467c`.
- `src/nexo/orchestrator.js`: `de257324cabfaae69219f71e598bb83c1aafc0a1`.
- `scripts/assistants.mjs`: `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`.
- `scripts/simulate.mjs`: `1b5e39b681486f583c1779770c52dd913227dfa1`.
- `src/nexo/application/chronicle-append.mjs`: `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`.

### Callers y consecuencia de alcance

- `scripts/assistants.mjs` (líneas 50–64, 89–106): pasa `persisted.nexoMemory ?? null` a `openNexoContinuityOwner`, construye una misión usando el snapshot abierto, registra la misión, escribe memoria de aprendizaje y luego persiste el estado del mundo. Por tanto, la ruta de continuidad puede compartir invocación con planificación y escrituras de Lúmina/world-state.
- `scripts/simulate.mjs` (líneas 262–274): también pasa `state.nexoMemory ?? null` y después persiste el estado de simulación. La independencia Nexo/Lúmina no queda demostrada end-to-end por el hecho de que el snapshot se guarde en otro archivo.
- `src/nexo/application/chronicle-append.mjs` (blob indicado arriba) preflight de ambos stores, abre Continuity, admite misión y puede continuar a PREPARED/append en la misma invocación cuando el caller pasa los flags de inicialización.
- Estos son tres callers directos ya documentados en el delta. Este addendum no afirma que sean todos los callers externos/indirectos.

## 9. Lectura estática de tests pertinentes — no ejecutados

### `tests/nexo/continuity-migration.test.mjs`

Blob `0bef1b93c6268042f14830c97e084d0a543e05f4`. El cuerpo inspeccionado afirma:
- las cinco colecciones se copian desde `legacyMemory.nexo`;
- `runs`, `lessons` y `patterns` no se copian al snapshot standalone;
- reabrir prefiere el store canónico y no fusiona una memoria heredada obsoleta;
- corrupción del store canónico produce error, no fallback a legacy;
- store ausente sin legacy ni flag explícito devuelve `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`;
- el flag `allowEmptyInitialization: true` permite el snapshot vacío.
La prueba contiene esas aserciones en el archivo; **no se ejecutó** en esta revisión y no demuestra aislamiento de todos los callers.

### `tests/nexo/chronicle-runtime.test.mjs`

Blob `0bf35f0dc1aadb121a8b2145b4963bacd5641c04`, líneas 1282–1312. El caso de bootstrap concurrente lanza dos invocaciones cooperantes de `runNexoChronicleAppend` con las mismas rutas/identidad y ambos flags de inicialización; afirma que como máximo una despacha, que un reintento explícito converge a una entrada Chronicle y que la repetición final no modifica bytes ni vuelve a despachar.

**Lo que cubre:** concurrencia de dos invocaciones que siguen los locks/contratos del store en ese caso sintético, identidad de operación idéntica y replay explícito.

**Lo que no cubre por sí solo:** un escritor que ignora el lock; otro proceso que crea/reemplaza el destino entre `access(filePath)` y `rename(tempPath, filePath)`; todos los callers de la rama; crash/power loss del filesystem; ni una prueba universal de exclusión. No se afirma que el test haya pasado, porque no se ejecutó.

### `tests/assistants.test.mjs`

Blob `5bc77be1b7a987d936efa4d5105996eaa76437da`. La parte inspeccionada incluye regresiones de simulación y una comprobación de que `createLearningMemory` separa copias anidadas de datos Nexo. No constituye una prueba end-to-end de `scripts/assistants.mjs` abriendo/migrando Continuity y luego persistiendo world-state.

## 10. Carrera de inicialización — hecho frente a riesgo inferido

`src/nexo/core/continuity-store.mjs` (blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`):
- `initialize(snapshot)` adquiere primero un lock de directorio cooperativo (aprox. líneas 270–294).
- Bajo ese lock, llama `fsModule.access(filePath)`; si tiene éxito devuelve conflicto `ALREADY_EXISTS`; solo un error `ENOENT` se trata como ausencia (aprox. líneas 300–307).
- Después, `writeEnvelope` escribe un nombre temporal fijo `${filePath}.tmp` y llama `fsModule.rename(tempPath, filePath)` (aprox. líneas 202–215).
- El contrato del propio store declara que la revisión coordina **solo escritores cooperativos**, que `filePath` es configuración confiable y que no se reclama resistencia a ataques de ruta/symlink ni durabilidad ante pérdida de energía.

**Hecho estático:** la creación exclusiva se apoya en el lock compartido y en una comprobación de ausencia anterior a la escritura/rename; el código mostrado no usa una operación de publicación final con semántica explícita de “crear solo si todavía no existe”.

**Riesgo inferido / UNKNOWN:** un escritor que no use el mismo lock podría crear el destino después de la comprobación y antes del rename. El efecto exacto depende de las garantías del filesystem/plataforma y no fue reproducido; no se etiqueta como exploit confirmado. El test de carrera Chronicle no cubre este actor no cooperativo. La propuesta de bootstrap ya exige resolver este modelo si el alcance necesita exclusión frente a tales escritores.

No se propone parche ni se ejecuta una prueba de carrera.

## 11. Estado y siguiente cierre documental

- Inventario de cinco colecciones: **cubierto en los módulos citados**, con límites explícitos; no es prueba de inventario global de todos los consumidores externos.
- Inicialización desde `legacyMemory`: confirmada estáticamente y no depende de `allowEmptyInitialization`.
- Los tests de migración y carrera contienen las aserciones descritas, pero su ejecución sigue **NOT RUN / UNKNOWN** en esta revisión.
- Exclusión de escritores no cooperativos y semántica de publicación inicial: **UNKNOWN / riesgo inferido**, no reproducido.
- La siguiente tarea no es volver a investigar Chronicle ni crear otro contrato: reutilizar la propuesta explícita de bootstrap y determinar si su alcance exige garantizar exclusión solo entre escritores cooperativos o también frente a procesos locales no cooperativos. No se puede escoger esa política por inferencia ni implementar antes de la decisión/autoridad aplicable.

Sin cambios de runtime, tests, workflows o configuración ejecutable; no se ejecutaron tests/CI/Actions ni se consultaron logs.
