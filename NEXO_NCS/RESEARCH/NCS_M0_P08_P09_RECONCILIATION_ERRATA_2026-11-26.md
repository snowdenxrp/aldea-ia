# NCS M0 — Errata P08/P09: separación Lúmina/Nexo y callers reales

**Fecha:** 2026-11-26  
**Rama:** `ncs-p09-o5-o7-writer-census-2026-11-26`  
**Snapshot de producto:** `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Clasificación:** `DOCUMENTARY CORRECTION / STATIC SOURCE RECONCILIATION`  
**No equivale a:** P08 IMPLEMENTED, P09 CLOSED, O7 PASS/CONTRADICTED universal, TESTED, CI-VERIFIED ni cierre M0.

## 0. Corrección explícita del documento anterior

El documento `NCS_M0_P09_O5_O7_WRITER_CENSUS_RECONCILIATION_2026-11-26.md` contó `assistants`, `simulate` y `.github/workflows/lumina-simulation.yml` como escritores relevantes para P09/Nexo. Esa clasificación fue demasiado amplia y queda **CORREGIDA** por esta errata.

La fuente canónica de cobertura P09 ya clasifica en el snapshot `d8b5ca8`:

- `scripts/assistants.mjs`: `ENTRYPOINT_LUMINA`; no importa owner/Continuity Nexo.
- `scripts/simulate.mjs`: `ENTRYPOINT_LUMINA`; persiste world-state de simulación propia, sin abrir Continuity.
- `lumina-simulation.yml`: automatización de Lúmina que ejecuta esos entrypoints y commitea sus archivos de estado; no es un writer Nexo demostrado.

La fuente exacta es `NEXO_NCS/BUILD/NCS_M0_P09_CALLER_COVERAGE_RECONCILIATION_2026-11-07.md`, blob `a9bcd78d8ddf6f27ebfec427aed0750b57bed714`, §§2–5. El propio documento dice que la clasificación histórica de assistants/simulate como callers Nexo corresponde a snapshots anteriores y queda superada para este SHA (§5).

**Consecuencia:** no contar esos entrypoints como callers Nexo activos ni usar su workflow como prueba de writer Nexo. Se conservan como actores Lúmina separados. La escritura directa de memoria Lúmina por `NEXO_LUMINA_MEMORY_PATH` permanece relevante únicamente para estudiar un posible alias/colisión de destino con un store protegido; la configuración efectiva que produciría esa colisión no está demostrada.

## 1. P08 — decisión vigente, no el estado del documento técnico histórico

El `STATUS.md` de esta rama contiene la ratificación del propietario registrada el 2026-11-12, con fecha de decisión 2026-11-09:

- P08 **DECIDED / RATIFICADA**.
- Una única root canónica deriva los destinos normales:
  - `<root>/.nexo-continuity.json`
  - `<root>/.nexo-chronicle.json`
- Operación normal no acepta rutas independientes para esos stores ni fallback ambiental.
- Chronicle initialization es separada, con admisión y autorización propias.
- Append no inicializa Chronicle; init y append no comparten invocación.
- La decisión no demuestra implementación: resolver común, admisión y separación init/append siguen pendientes.

Esta ratificación supersede el estado histórico `P08 OPEN / LAYOUT UNSELECTED` que aparece en la reconciliación técnica del 2026-11-07. El documento técnico conserva valor como evidencia del gap del snapshot, no como autoridad para reabrir la decisión del layout.

Fuente: `NEXO_NCS/STATUS.md`, delta “RATIFICACIONES P08/P09 DEL PROPIETARIO (2026-11-09; REGISTRADAS 2026-11-12)”, §P08.

## 2. Contra-cotejo de P08 contra el snapshot de producto

### 2.1 CLI Nexo: rutas independientes

Blob `scripts/nexo.mjs`: `e471eb478a09aa8a9a8323795583e198cdf0a127`.

- Los comandos de status/query aceptan `--continuity <path>`.
- El padre despacha Chronicle a `scripts/nexo-chronicle-session.mjs` mediante `spawnSync`.

Blob `scripts/nexo-chronicle-session.mjs`: `30a53de2f108aa255a1dfd61ce78c19788de160b`.

- Parser acepta valores independientes `--continuity` y `--chronicle`.
- También acepta flags `--initialize-continuity` y `--initialize-chronicle`.

Blob `src/nexo/application/chronicle-append.mjs`: `c1964467d68043d06e035ad59720f8cec2e52e52`.

- La API requiere `continuityPath` y `chroniclePath` separados.
- Construye dos stores distintos desde esos paths.
- Realiza `chronicleStore.loadCurrent()` y `continuityStore.loadCurrent()` antes de llamar a `openNexoContinuityOwner()`.

**Clasificación:** la implementación del snapshot conserva configuración por rutas independientes y pre-reads anteriores a la admisión del owner. Esto contradice estáticamente el mapping P08 ratificado y mantiene la brecha D1/P03–P04. No es un cambio de decisión; es evidencia de que la decisión aún no está implementada en esas rutas.

### 2.2 API pública de queries

Blob `src/nexo/application/continuity-queries.mjs`: `e1915e94e53e71d37a37952fead37ba62bdae79a`.

Cinco operaciones path-based públicas leen el store directamente mediante `createNexoContinuityStore({ filePath: continuityPath }).loadCurrent()` o equivalente:

- `loadNexoContinuityStatus`
- `loadNexoMissionStatus`
- `loadNexoMissionPlan`
- `previewNexoMissionDraft`
- `loadNexoOpenLoops`

El caller-coverage audit las clasifica como `PATH_BASED_PUBLIC_API`: no hay admisión de instancia común visible en esas funciones. `src/nexo/application/index.mjs` las reexporta, por lo que existe superficie importable además de los dos entrypoints CLI.

**Clasificación:** bypass estático de la frontera de admisión si estas APIs se usan como superficie normal. La existencia de exports no demuestra por sí sola que un consumidor externo concreto los haya invocado.

### 2.3 Bootstrap

El bootstrap dedicado recibe `--root` y `--relative-path`, y tiene flujo separado de preflight/confirmación. No es un resolver conjunto que derive Continuity y Chronicle desde la root P08. No debe confundirse con la operación normal ni usarse para declarar P08 implementada.

## 3. P09 — universo y clasificación corregidos

El propietario ratificó como universo declarado: repositorio/package, entrypoints, procesos hijos, workflows y launchers declarados. Loaders dinámicos y consumidores externos no identificados permanecen UNKNOWN.

Para el snapshot fijado, el inventario canónico P09 (§§2–5) establece:

| Superficie | Clasificación | Estado/implicación |
|---|---|---|
| `scripts/nexo.mjs` | ENTRYPOINT_NEXO | Caller conocido; importa queries/append; crea proceso hijo |
| `scripts/nexo-chronicle-session.mjs` | ENTRYPOINT_NEXO_DIRECT | Puede ejecutarse directamente; llama append |
| `scripts/nexo-continuity.mjs` | COMPATIBILITY_EXPORT | Reexporta owner/bootstrap; no es frontera de admisión |
| `scripts/nexo-continuity-bootstrap.mjs` | ENTRYPOINT_BOOTSTRAP_SEPARATE | Primera publicación separada |
| `scripts/nexo-runtime-session.mjs` + repair wrappers | GATED_REPAIR_SURFACE | Gated en la superficie identificada; no prueba inalcanzabilidad universal |
| `src/nexo/application/index.mjs` | PUBLIC_IMPORTABLE_API | Reexporta queries y append |
| `continuity-queries.mjs` | PATH_BASED_PUBLIC_API | Cinco queries directas por ruta |
| `chronicle-append.mjs` | PATH_BASED_MUTATING_API | Dos stores por paths; pre-read antes de owner |
| factories y owner core | LOW_LEVEL_IMPORTABLE_PRIMITIVES | Exports ESM path-based; consumidores externos no descartados |
| `assistants.mjs`, `simulate.mjs` | ENTRYPOINT_LUMINA | Excluidos del grafo Nexo para este SHA |
| `lumina-simulation.yml` | Automatización Lúmina | No clasificar como writer Nexo |

El guard estático cubre imports/reexports locales literales y separación de dominios para raíces clasificadas. No resuelve imports computados, módulos generados, consumidores externos, todos los launchers/workflows ni todas las órdenes de ejecución. El PASS histórico del guard no demuestra root admission ni pre-read admission.

**Resultado P09:** el inventario canónico ya existe y no debe repetirse genéricamente. Su estado permanece **OPEN / UNKNOWN** por los gaps concretos anteriores: APIs públicas path-based, pre-read, procesos hijos/direct execution, loaders no literales y consumidores externos dentro/fuera del universo verificable.

## 4. P08/P09 y O7 — consecuencia para RAW-1

RAW-1 se conserva exactamente en el nivel probatorio recibido:

- Claude reportó reproducción en scratchpad.
- Claude reportó lectura estática `NEXO_LUMINA_MEMORY_PATH` → `fs.writeFile`.
- El scratchpad y sus precondiciones no se han recuperado ni reproducido independientemente.

Esta errata añade una distinción que faltaba:

1. La escritura por defecto de memoria Lúmina (`.lumina-assistant-memory.json`) no es Continuity ni Chronicle.
2. `NEXO_LUMINA_MEMORY_PATH` permite configurar el destino de esa escritura directa. La capacidad de seleccionar una ruta arbitraria no demuestra que la configuración efectiva apunte a `<root>/.nexo-continuity.json` o `<root>/.nexo-chronicle.json`.
3. P08 prohíbe rutas independientes y fallback ambiental para la **operación normal Nexo**; no prueba que ningún otro proceso del repositorio pueda escribir accidentalmente sobre el mismo nombre si recibe una variable de entorno maliciosa o equivocada.
4. El workflow Lúmina recuperado no declara `NEXO_LUMINA_MEMORY_PATH`; usa el destino por defecto visible. No se ha probado configuración externa de ese entorno.
5. Por tanto, RAW-1 no puede elevarse aún a violación demostrada del objeto protegido. Tampoco puede descartarse sin el scratchpad original: hacen falta target canónico exacto, entorno, caller, precondiciones y resultado observable.

**Estado:** RAW-1 REPORTADO / NO REPRODUCIDO INDEPENDIENTEMENTE. O7 conserva CONTRADICCIÓN REPORTADA CONDICIONADA AL ALCANCE, pero esta errata no declara que el caso Lúmina por defecto viole O7 de Nexo.

## 5. B3 y H2

No se promueve ni se altera B3. La auditoría H2 se limitó a la API `persistState`, el caller Lúmina `assistants` y el estado de simulación; no demostró el mecanismo durable BLOCKED de P05/P07 ni su bypass desde una ruta protegida.

La clasificación B3 y los criterios B1–B6 permanecen en sus fuentes propias. Esta errata no infiere que una escritura Lúmina a su memoria de simulación afecte el estado BLOCKED de P05/P07.

## 6. Corrección que debe aplicarse a la unidad P09 anterior

En `NCS_M0_P09_O5_O7_WRITER_CENSUS_RECONCILIATION_2026-11-26.md`:

- Las filas de `assistants`, `simulate` y `lumina-simulation.yml` deben leerse como actores Lúmina separados, no como writers Nexo.
- El inventario P09 de Nexo debe tomar como base normativa el documento `NCS_M0_P09_CALLER_COVERAGE_RECONCILIATION_2026-11-07.md`, no volver a construir un inventario desde cero.
- La lectura H2 sobre `persistState`/assistants se conserva como evidencia del subsistema Lúmina y como posible alias configurable aún no demostrado contra el objeto protegido.
- El path mismatch del workflow STEP 3A es un hallazgo independiente de verificación del YAML, pero no debe confundirse con el workflow de simulación Lúmina.

## 7. Estado y no-cambios

| Gate | Estado |
|---|---|
| P08 | DECIDED / RATIFIED; implementación no demostrada |
| P09 | OPEN / UNKNOWN |
| O5 | UNKNOWN / STOP |
| O7 | CONTRADICCIÓN REPORTADA; alcance pendiente |
| P05-C | RATIFICADA; P05 OPEN |
| P07-C | UNKNOWN / BLOCKING |
| E2/E3 | PARTIAL / NOT CLOSED |
| M0 | INCOMPLETO |
| authorization | NOT_EVALUATED |
| commissioning / efectos protegidos | STOP |

Solo lectura estática/documental del snapshot y reconciliación de documentos. Sin código, tests, CI/Actions, workflows ejecutados, Termux/POCO, stores productivos, PR #110 ni ramas de producto modificadas.
