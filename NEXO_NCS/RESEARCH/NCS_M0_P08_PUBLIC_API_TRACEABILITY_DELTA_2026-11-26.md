# NCS M0 — Delta de trazabilidad P08 sobre APIs públicas y entrypoints

**Fecha:** 2026-11-26  
**Rama documental:** `ncs-p09-o5-o7-writer-census-2026-11-26`  
**Snapshot de producto:** `ncs-lumina-decoupling-2026-10-29` @ `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Tipo:** lectura estática de blobs; no implementación, ejecución ni prueba.

## 1. Decisión P08 aplicable

La decisión del propietario registrada en `NEXO_NCS/STATUS.md` (§§66–75 en el snapshot documental consultado) es:

- una root canónica deriva `<root>/.nexo-continuity.json` y `<root>/.nexo-chronicle.json`;
- operación normal no admite rutas independientes ni fallback ambiental;
- Chronicle initialization es separada, con admisión/autorización propias;
- append nunca inicializa Chronicle; init y append no comparten invocación.

Esta decisión está **DECIDED/RATIFIED**. No implica que el código la implemente.

## 2. Superficie pública de aplicación

Blob `src/nexo/application/index.mjs`: `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`.

El módulo declara ser la API pública estable y reexporta:
- `runNexoChronicleAppend`;
- cinco funciones de `continuity-queries.mjs`;
- `previewNexoMissionRequest` desde `mission-request-preview.mjs`.

**Corrección de conteo:** hay cinco exports definidos en `continuity-queries.mjs`, pero seis APIs públicas de aplicación que pueden leer Continuity al contar el wrapper `previewNexoMissionRequest`, que delega a `previewNexoMissionDraft`. La documentación que dice “cinco queries públicas” describe el módulo de queries, no toda la superficie pública que llega a una lectura.

## 3. Seis APIs públicas que llegan a Continuity

Blob `src/nexo/application/continuity-queries.mjs`: `e1915e94e53e71d37a37952fead37ba62bdae79a`.

| API pública | Entrada de ruta | Lectura visible | Clasificación P08/D1 |
|---|---|---|---|
| `loadNexoContinuityStatus` | `continuityPath` | crea store por `filePath` y llama `loadCurrent()` | path-based; sin root común/admisión de instancia visible |
| `loadNexoMissionStatus` | `continuityPath` | crea store por `filePath`; `loadCurrent()` | igual |
| `loadNexoMissionPlan` | `continuityPath` | crea store por `filePath`; `loadCurrent()` | igual |
| `previewNexoMissionDraft` | `continuityPath` | crea store por `filePath`; `loadCurrent()` | igual |
| `loadNexoOpenLoops` | `continuityPath` | crea store por `filePath`; `loadCurrent()` | igual |
| `previewNexoMissionRequest` | `continuityPath` | delega a `previewNexoMissionDraft` | wrapper público; hereda lectura path-based |

La validación de datos de misión/request no es la admisión de acceso al store exigida por D1. En los cinco primeros casos, la lectura persistente se realiza directamente en la función pública. El sexto hereda exactamente esa ruta por delegación.

**Resultado:** las seis APIs no reciben root canónica ni un contexto/owner ya admitido; su interfaz permite seleccionar Continuity por path. El mapping P08 no está aplicado en esta superficie.

## 4. Chronicle append: paths independientes y pre-read

Blob `src/nexo/application/chronicle-append.mjs`: `c1964467d68043d06e035ad59720f8cec2e52e52`.

`runNexoChronicleAppend(options)` lee `continuityPath` y `chroniclePath` como campos separados. Luego:
1. crea `chronicleStore` desde `chroniclePath`;
2. crea `continuityStore` desde `continuityPath`;
3. ejecuta `chronicleStore.loadCurrent()`;
4. ejecuta `continuityStore.loadCurrent()`;
5. después llama a `openNexoContinuityOwner({ filePath: continuityPath, ... })`.

Esto es una brecha estática doble:
- **P08:** los dos destinos no se derivan de una única root dentro de la API;
- **D1/P03–P04:** se hacen lecturas persistentes antes de abrir el owner/admisión.

La comprobación de que faltan stores y el rechazo fail-closed posterior no convierten el pre-read en una lectura admitida.

Además, `initializeChronicle` es una opción booleana aceptada por el contrato de entrada. Si está activa y Chronicle falta, el mismo use case puede ejecutar `chronicleStore.initialize()` dentro de la invocación de append. Esto contradice el contrato P08 ratificado de init/append separados. La ruta normal sin esa opción bloquea Chronicle ausente, pero no elimina la capacidad del camino explícito de inicialización dentro del append.

El código también rechaza `initializeContinuity: true` antes de abrir stores, lo cual sí es un guard visible para esa operación concreta; no resuelve el mapping root→dos stores.

## 5. CLI padre/hijo

### `scripts/nexo.mjs`

Blob: `e471eb478a09aa8a9a8323795583e198cdf0a127`.

- El parser para `status`, `mission-status`, `mission-plan`, `mission-draft-preview` y `mission-request-preview` acepta `--continuity <path>`.
- No recibe una root canónica que derive ambos destinos.
- `chronicle-append` despacha los argumentos restantes a un proceso hijo; el padre no impone el mapping P08 al hijo.

### `scripts/nexo-chronicle-session.mjs`

Blob: `30a53de2f108aa255a1dfd61ce78c19788de160b`.

- Parser acepta `--continuity` y `--chronicle` como valores independientes.
- También acepta `--initialize-chronicle`.
- Invoca `runNexoChronicleAppend({ ...args, content })`.
- Exporta además `runNexoChronicleAppend`, por lo que la ruta no queda limitada al CLI.

**Resultado:** el CLI padre y el hijo conservan selección por paths independientes; el hijo expone también la inicialización dentro del flujo de append.

## 6. Bootstrap y límite de esta conclusión

El bootstrap `scripts/nexo-continuity-bootstrap.mjs` es un entrypoint separado que recibe `--root` y `--relative-path` para Continuity. No es un resolver común que derive ambos stores ni demuestra que las APIs anteriores usen la root P08.

Este informe no afirma:
- que una invocación externa concreta haya usado rutas divergentes;
- que se haya leído/escrito un store productivo en esta revisión;
- que todas las superficies dinámicas o consumidores externos estén enumerados;
- que P09 esté cerrado.

## 7. Estado y delta exacto

- **P08:** DECIDED/RATIFIED; enforcement en la superficie examinada **NO DEMOSTRADO**.
- **D1/P03–P04:** pre-read de queries públicas y Chronicle append antes de owner **CONFIRMED-STATIC** en el snapshot; no TESTED.
- **P09:** OPEN/UNKNOWN. Este delta afina la superficie pública; no cierra consumers dinámicos/externos.
- **O5:** UNKNOWN/STOP, sin cambio.
- **O7:** contradicción reportada condicionada al alcance; RAW-1 no reproducido, sin cambio.
- **P05-C:** RATIFICADA; P05 OPEN.
- **P07-C:** UNKNOWN/BLOCKING.
- **E2/E3:** PARTIAL/NOT CLOSED.
- **M0:** INCOMPLETO; `authorization: NOT_EVALUATED`; commissioning y efectos protegidos STOP.

## 8. Método y exclusiones

Lectura de archivos GitHub y blobs fijados al snapshot indicado. No se ejecutaron tests, CI, workflows, comandos, runtime, Termux/POCO, bootstrap ni acceso a stores. No se modificó código, PR #110 ni ramas de producto. No se seleccionó mecanismo filesystem ni se propuso una implementación como decisión.
