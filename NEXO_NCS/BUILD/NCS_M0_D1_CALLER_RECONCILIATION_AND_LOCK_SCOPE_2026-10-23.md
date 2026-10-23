# NCS M0 — reconciliación D1 de callers y alcance de admisión

Fecha: 2026-10-23  
Rama objetivo: `ncs-clean-architecture`  
Estado: **ANÁLISIS DOCUMENTAL PARCIAL; NO IMPLEMENTADO; D1/D2/D3 OPEN**

## 1. Propósito y límites

Este documento consolida diferencias concretas encontradas al contrastar el contrato de raíz de instancia, el censo de referencias y el borrador de allowlist con las fuentes de la rama. No sustituye el grafo transitivo completo ni cierra la prueba de no-bypass.

No se modificaron fuentes de runtime, tests ni workflows. No se ejecutaron tests ni CI en esta revisión. No se declara autoridad, inicialización segura, admisión funcional ni activación de efectos.

## 2. Fuentes de referencia y blobs observados

- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`: blob `1d82f04f67b5ed15a6823cc23051ec59c43629a5`.
- `NEXO_NCS/RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md`: blob `b4e74453f8e9f90c54181fcd8a8f3434ac0b7a32`; snapshot de código documentado `f105a3a6b88c372d22aed49d29ea56d2d17ade78`.
- `NEXO_NCS/RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`: blob `020b8c284eae7424547cab08de6d5a248b453165`.
- `scripts/assistants.mjs`: blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`.
- `scripts/simulate.mjs`: blob `623d316c7a1efd10cc2f06a3080c0d9f06087596`.
- `scripts/nexo-chronicle-session.mjs`: blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.
- `src/nexo/core/continuity-store.mjs`: blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- `src/nexo/core/chronicle-store.mjs`: blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.

Los SHA de fuentes son identificadores de blobs observados durante la lectura, no una declaración de que todo el árbol de trabajo tenga una sola revisión uniforme. El censo indica que los 188 archivos JS/MJS/CJS fueron revisados en cuanto a imports estáticos conocidos, pero el grafo transitivo y los mecanismos dinámicos no están cerrados por una prueba automatizada.

## 3. Reconciliación concreta de callers

| Caller/superficie | Comportamiento observado en fuente | Clasificación propuesta | Implicación para D1 |
|---|---|---|---|
| `scripts/nexo.mjs` | CLI principal acepta `--continuity`; consultas y previews llaman a la API de aplicación; append lanza proceso hijo. | Producción: entrypoint de instancia. | Sustituir path suelto por una configuración única de raíz; bloquear antes de toda lectura de estado protegido. |
| `scripts/nexo-chronicle-session.mjs` | Acepta `--continuity` y `--chronicle`; llama a `runNexoChronicleAppend`; el archivo es invocable directamente. | Producción/interno expuesto como proceso hijo. | Debe validar la raíz y adquirir su propia admisión; nunca depender del lock del padre ni aceptar dos rutas contradictorias. |
| `src/nexo/application/chronicle-append.mjs` | Crea los stores de ambos almacenes y abre owner de Continuity. | API de aplicación bajo admisión. | La frontera de operación debe preceder a la primera lectura y cubrir el procesamiento/persistencia relevantes; helpers no deben adquirir un segundo lock de instancia. |
| `src/nexo/application/continuity-queries.mjs` y `mission-request-preview.mjs` | Consultas y previews materializan datos usando una ruta de Continuity. | API de aplicación de solo lectura. | Admitir antes de cargar el snapshot; prohibir inicialización/escritura incidental. |
| `src/nexo/core/continuity-service.mjs`, owner y stores | `openNexoContinuityOwner` acepta `filePath`; factories de store son primitivas path-based con locks por almacén. | Primitivas internas; bypass potencial mientras una entrada productiva pueda invocarlas sin contexto. | La producción debe pasar por una frontera que exige instancia/admisión; preservar los locks por almacén y sus códigos observables hasta demostrar equivalencia. |
| `scripts/assistants.mjs` | Carga `world-state.json` (o `NEXO_STATE_PATH`), abre Continuity con `NEXO_CONTINUITY_PATH` y `legacyMemory`, registra misión, escribe memoria de Lúmina y después persiste el estado del mundo; puede ejecutar reparación con `--nexo-repair-once`. | Comando compuesto/múltiples dominios. | No afirmar atomicidad entre Continuity, estado del mundo y memoria Lúmina. Separar sus contratos de persistencia; reparación sigue excluida por su gate constitucional. |
| `scripts/simulate.mjs` | Abre Continuity con `legacyMemory`; si falta el estado puede permitir inicialización vacía; su lock de estado puede borrar locks considerados obsoletos automáticamente. | Simulación legacy con efectos de persistencia fuera de la raíz Nexo. | Excluir de la superficie persistente ordinaria de Nexo hasta diseñar una operación explícita; no reutilizar su lock como protocolo equivalente de admisión. |
| `scripts/nexo-continuity.mjs` | Reexporta `openNexoContinuityOwner`. | Compatibilidad legacy. | Clasificar callers reales; retirar de rutas productivas no admitidas o convertirlas en acceso interno que requiera contexto. |
| Helpers de repair/runtime, dispatch, settlement y verificación | Flujos de varias fases; algunos pueden leer persistencia o llamar adaptadores de efecto. | Internos; efectos protegidos excluidos. | Si leen/escriben almacenes, deben heredar la admisión; esa admisión no autoriza dispatch ni reabre el gate constitucional. |
| Tests/workers/harnesses | Algunos crean stores directamente para probar el protocolo por almacén y fallos. | TEST_ONLY. | Mantener las pruebas de stores aislados y añadir pruebas específicas de instancia; no confundirlas con evidencia de no-bypass de producción. |

## 4. Correcciones al modelo de concurrencia

### 4.1 Lectura sin lock de store no basta para la garantía agregada

El censo observa que `loadCurrent()` de ambos stores lee sin adquirir el lock de mutación del almacén. Por tanto, el lock per-store no demuestra que las operaciones de lectura, append, consulta y procesamiento mantengan una única representación activa de los datos a la vez. La admisión común, si se implementa, debe adquirirse antes de la primera carga persistida y cubrir el procesamiento del snapshot que se quiere serializar.

### 4.2 El lock de instancia no sustituye los locks por almacén

Los locks existentes tienen diferencias de manejo de fallos de liberación y códigos de error. No se debe copiar uno y declarar equivalencia. La primera implementación debe conservar los locks por almacén y fijar un orden de adquisición único; cualquier extracción de una primitiva común requiere comparación de semántica y pruebas de regresión separadas.

### 4.3 Límite honesto de la garantía

La garantía objetivo es exclusión entre operaciones cooperantes que pasan por todas las entradas clasificadas dentro de la misma raíz. No demuestra una cota exacta de heap V8, cuota global de disco, durabilidad ante pérdida de energía, resistencia frente a proceso local hostil, autoridad constitucional ni ausencia de alias por hard link/mount. `realpath` puede resolver symlinks pero no hace que todas las identidades del mismo objeto filesystem sean únicas; el contrato debe definir los aliases fuera de alcance o rechazarlos cuando sean detectables.

## 5. Especificación mínima del test arquitectónico D1

Antes de cambiar runtime, especificar una prueba estática que:
1. Use un snapshot/árbol de la rama objetivo y enumere los entrypoints configurados en `package.json`, los scripts de proceso hijo y los exports públicos de aplicación.
2. Trace imports estáticos y reexports transitivos desde cada entrypoint; detecte factories, owners, métodos de stores, flags legacy, `spawn/spawnSync`, `import()`, `require()`, `eval` y `Function`.
3. Exija que cada caller quede clasificado como `PRODUCTION_ADMITTED`, `INTERNAL_ONLY`, `TEST_ONLY` o `EXPLICIT_EXCEPTION`, con ruta, función, operación de lectura/escritura, proceso, test propietario y justificación de excepción.
4. Falle ante un nuevo entrypoint sin clasificar, un import productivo directo de factory/store, un reexport público que permita el bypass, o una ruta legacy que acepte stores sin contexto de instancia.
5. Incluya fixtures negativos para: hijo Chronicle directo sin raíz; raíz mezclada con rutas contradictorias; `simulate` abriendo Continuity por la vía ordinaria; `assistants` llamando owner sin contexto; import dinámico de store no clasificable; módulo importado no resoluble.
6. Mantenga tests de stores aislados como TEST_ONLY y no ejecute dispatch, reparación ni efectos externos para probar el grafo.

Una búsqueda textual por sí sola no cierra imports computados o la resolución del grafo. Si la prueba no puede resolver un edge, debe reportar `UNKNOWN/BLOCKED`, no considerarlo permitido.

## 6. Protocolo mínimo D2 que debe especificarse antes de codificar

- Una sola admisión cross-process bajo la raíz canónica, adquirida antes de cargar los snapshots cubiertos.
- No reentrancia; helpers reciben el contexto de admisión ya adquirido.
- Orden único y documentado: admisión de instancia antes de cualquier lock de store; liberación de stores antes de liberar la admisión.
- Timeout acotado y monotónico; error de adquisición implica cero escritura/dispatch.
- Estado del owner/lock corrupto, ambiguo o no inspeccionable: fail-closed; no borrar automáticamente lock stale.
- Liberación verifica token; fallo incierto bloquea el uso posterior hasta recuperación explícita.
- El hijo Chronicle valida y adquiere la misma raíz por sí mismo.
- El lock es coordinación de procesos cooperantes, no autoridad, identidad ni sandbox.
- Valores exactos de timeout, ventana de creación de owner, límites de bytes y recuperación permanecen pendientes hasta comparar tests/protocolos actuales.

## 7. Siguiente secuencia de trabajo

1. Terminar la reconciliación de todos los callers restantes de las 188 fuentes y de los tests/workers, con búsqueda completa en checkout exacto o una fuente que permita enumerar todos los edges. El censo actual no prueba esa completitud.
2. Convertir la especificación de la sección 5 en test arquitectónico; no implementarlo hasta cerrar D1-D3 y congelar el contrato.
3. Cerrar D0: precedencia de configuración, raíz existente/bootstrap, symlinks/alias, legacy CLI/API, timeout/error codes y recuperación.
4. Cerrar D2: sección crítica, orden de locks, reentrada y release failure.
5. Cerrar D3: migración dry-run, copia verificable, cutover explícito, rollback y preservación del origen.
6. Solo con contrato cerrado y autorización separada, implementar por fases, ejecutar regresiones existentes y nuevas, y verificar CI contra el SHA exacto.

## 8. Estado canónico

M0: `INCOMPLETO`  
D1/D2/D3: `OPEN`  
Autorización: `NOT_EVALUATED`  
Raíz legítima: `PENDING/UNKNOWN`  
Efectos protegidos: `STOP`  
Runtime/tests/workflows: `SIN CAMBIOS EN ESTA REVISIÓN`  
Tests/CI: `NO EJECUTADOS EN ESTA REVISIÓN`
