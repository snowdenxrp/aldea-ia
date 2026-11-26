# NCS M0 — Reconciliación de evidencia Termux y el inventario P07-C

Fecha: 2026-11-26  
Repositorio: `snowdenxrp/aldea-ia`  
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`  
Snapshot de código analizado: `d8b5ca8720908d926acc18130614cce132a43b5d`  
Alcance: reconciliación documental de tres transcripciones Termux con el inventario estático de lectores/escritores. Sin ejecución, tests, CI, cambios de código ni operaciones en el dispositivo.

## 1. Fuentes reconciliadas

1. Inventario estático: `NEXO_NCS/BUILD/NCS_M0_D2_P07C_CONTINUITY_WRITER_READER_INVENTORY_D8B5CA8_2026-11-26.md`.
2. Transcripción RAW PATH / procesos: `NEXO_NCS/BUILD/EVIDENCE/2026-11-26_TERMUX_RAW_PATH_AND_ACTIVE_PROCESSES_TRANSCRIPT.md`.
3. Transcripción de configuración de launchers: `NEXO_NCS/BUILD/EVIDENCE/2026-11-26_TERMUX_LAUNCHER_CONFIG_INVENTORY_TRANSCRIPT.md`.
4. Transcripción de referencias assistants/simulate: `NEXO_NCS/BUILD/EVIDENCE/2026-11-26_TERMUX_SHORTCUTS_BIN_PACKAGE_SCRIPT_REFERENCES_TRANSCRIPT.md`.

Además, se inspeccionaron directamente desde GitHub, en el SHA exacto indicado, los archivos `package.json`, `scripts/assistants.mjs` y `scripts/simulate.mjs`. Esto es análisis estático del snapshot remoto; no demuestra por sí solo que el checkout local de Termux estuviera en ese SHA o limpio.

## 2. Hechos observados en Termux

### E1 — Variables y procesos en el momento de la captura

- `NEXO_STATE_PATH=<UNSET>`.
- `NEXO_LUMINA_MEMORY_PATH=<UNSET>`.
- La consulta de procesos no imprimió coincidencias para el patrón usado.
- El pipeline termina con `|| true`; no conserva el código de salida original.

Clasificación: **OBSERVED / OWNER-SUPPLIED**, limitada al shell, momento, visibilidad y patrón de búsqueda concretos. No demuestra ausencia universal de procesos ni configuración en futuros entornos de lanzamiento.

### E2 — Configuración de launchers inspeccionada

La búsqueda textual de las dos variables se ejecutó sobre la lista de targets indicada en el transcript. Los únicos resultados impresos fueron las lecturas de ambas variables en `$HOME/ncs-m0/scripts/assistants.mjs`, líneas 14–18.

Se imprimieron encabezados sin coincidencias para:
- `$HOME/.termux`
- `$PREFIX/etc/profile`
- `$PREFIX/etc/profile.d`

Los targets que no produjeron encabezado fueron omitidos por `[ -e "$target" ] || continue`; por tanto, no se debe afirmar su existencia ni su ausencia a partir de esa salida. La búsqueda tampoco cubrió todas las posibles fuentes de entorno, servicios, tareas, addons, wrappers o configuración externa.

Clasificación: **OBSERVED / PARTIAL TEXTUAL CONFIG INVENTORY**.

### E3 — Referencias a assistants/simulate

La búsqueda posterior, limitada a archivos `*.sh`, `*.json` y `*.mjs` y al patrón `assistants.mjs|simulate.mjs`, imprimió dos coincidencias en `$HOME/ncs-m0/package.json`:

- `simulate`: `node scripts/simulate.mjs`.
- `assistants`: `node scripts/assistants.mjs`.

No imprimió coincidencias bajo `$HOME/.shortcuts` ni `$HOME/bin`. Como stderr fue redirigido, esta salida no distingue por sí sola entre rutas inexistentes, inaccesibles o existentes sin coincidencias. Tampoco buscó todos los tipos de archivo ni todos los posibles directorios de lanzamiento.

Clasificación: **OBSERVED / NARROW LAUNCH-REFERENCE SEARCH**, no inventario exhaustivo.

## 3. Hallazgo estático adicional: tercer script npm

El `package.json` del snapshot remoto exacto `d8b5ca8720908d926acc18130614cce132a43b5d` declara tres comandos de aplicación:

| Script npm | Comando | Interpretación |
|---|---|---|
| `simulate` | `node scripts/simulate.mjs` | CLI de simulación Lúmina; el entrypoint usa su `STATE_PATH` predeterminado `world-state.json`. |
| `assistants` | `node scripts/assistants.mjs` | Lee `NEXO_STATE_PATH` y `NEXO_LUMINA_MEMORY_PATH` del entorno; si no están definidas, usa rutas predeterminadas. Es la ruta RAW condicional identificada por el inventario. |
| `nexo:continuity:bootstrap` | `node scripts/nexo-continuity-bootstrap.mjs` | Entry point de bootstrap de Continuity ya inventariado; usa el servicio/helper canónico en el flujo descrito por el inventario. No es un tercer RAW writer demostrado. |

El tercer comando no apareció en la transcripción E3 porque el patrón de búsqueda excluía expresamente `nexo-continuity-bootstrap.mjs`. Por tanto, E3 no puede describirse como lista completa de scripts npm ni de launchers del proyecto.

El script `simulate` usa el path predeterminado declarado dentro de `scripts/simulate.mjs`; el override `NEXO_STATE_PATH` aparece en `scripts/assistants.mjs`, que pasa el path a `persistState()`. La función exportada `persistState()` acepta un path suministrado por su caller. Estas distinciones no eliminan RAW-2: la ruta configurable sigue presente en `assistants.mjs`.

## 4. Reconciliación con RAW-1 y RAW-2

### RAW-1 — `NEXO_LUMINA_MEMORY_PATH`

- El código de `assistants.mjs` admite un destino configurado por esa variable y lo escribe con `fs.writeFile`, sin lock de Continuity.
- El shell inspeccionado mostró la variable UNSET en ese momento.
- La búsqueda limitada de configuración no encontró otras referencias textuales dentro de los targets que sí imprimieron encabezados.
- No se demuestra alias activo al archivo de Continuity; tampoco se demuestra que ninguna otra fuente pueda inyectar la variable al lanzar el proceso.

Clasificación reconciliada: **RAW condicional en el código; alias activo UNKNOWN; configuración del entorno parcialmente inspeccionada**.

### RAW-2 — `NEXO_STATE_PATH` / `persistState()`

- `assistants.mjs` admite el path configurable y llama a `persistState()`.
- `persistState()` usa el lock independiente de `simulate.mjs`, con recuperación stale por eliminación recursiva del directorio de lock y publicación mediante `rename()`.
- El shell inspeccionado mostró `NEXO_STATE_PATH` UNSET en ese momento.
- La búsqueda limitada de configuración no halló otras referencias textuales en los targets que produjeron encabezados.
- No se demuestra alias activo al archivo de Continuity, ni se demuestra exclusividad global de escritores.

Clasificación reconciliada: **RAW condicional en el código; alias activo UNKNOWN; configuración del entorno parcialmente inspeccionada**.

### Ruta canónica de bootstrap

El script `nexo:continuity:bootstrap` es un entrypoint adicional declarado en el `package.json` remoto. El inventario estático ya lo clasificaba como flujo de bootstrap que llama al preflight y al helper de Continuity. Su presencia como script npm no corrige los RAW condicionales ni prueba que todos los launchers/callers utilicen exclusivamente el helper.

## 5. Qué queda probado y qué no

**Sí queda respaldado:**
1. En el shell capturado, ambas variables estaban UNSET.
2. La consulta de procesos no mostró coincidencias para el patrón usado.
3. La búsqueda limitada de configuración encontró las lecturas de variables en `assistants.mjs`.
4. La búsqueda limitada de launch references encontró los scripts npm `assistants` y `simulate`.
5. El `package.json` del snapshot remoto exacto declara además `nexo:continuity:bootstrap`.
6. El snapshot de código contiene las rutas RAW condicionales ya descritas en el inventario.

**No queda probado:**
1. Que el checkout local de Termux correspondiera exactamente al SHA remoto `d8b5ca8...` o estuviera limpio al ejecutar las búsquedas.
2. Que las variables permanezcan UNSET en todos los posibles contextos de lanzamiento.
3. Que no existan launchers, tareas, servicios, wrappers, addons o consumidores externos a los targets inspeccionados.
4. Que no haya alias de paths creado dinámicamente o por configuración indirecta.
5. Que todos los escritores relevantes estén COVERED por el lock canónico.
6. Que el entorno real cumpla exclusividad de escritores o el modelo R1.

## 6. Decisión sobre más comandos Termux

**No se requieren más comandos para cerrar esta unidad de reconciliación documental.** Las capturas actuales ya aportan el límite de evidencia alcanzable sin ampliar arbitrariamente la búsqueda ni repetir el inventario recursivo que saturó Termux.

La correspondencia entre el checkout local y el SHA remoto permanece UNKNOWN porque no se capturó `git rev-parse HEAD` ni el estado del árbol local. Si esa correspondencia llegara a ser un requisito decisorio separado, bastaría una comprobación Git local, de solo lectura, focalizada; no se justifica ahora una nueva búsqueda recursiva de launchers.

No se debe interpretar la decisión de no pedir más comandos como cierre de la incertidumbre sobre consumidores externos.

## 7. Estado resultante

| Área | Estado |
|---|---|
| Transcripts Termux | **PRESERVED / VERIFIED** en la rama documental |
| Inventario de configuración local | **PARTIAL / OBSERVED** |
| Identidad exacta del checkout local | **UNKNOWN** |
| RAW-1 / RAW-2 como rutas posibles en el snapshot | **CONFIRMED STATICALLY / CONDITIONAL** |
| Alias RAW activo en Termux | **UNKNOWN** |
| Exclusividad global de escritores (O7) | **UNKNOWN** |
| P05 | **OPEN** |
| P07-C | **UNKNOWN / BLOCKING** |
| Arquitectura A | **UNKNOWN-STOP; no ratificar ni implementar** |
| NCS M0 | **INCOMPLETO** |

## 8. Próximo trabajo recomendado

Continuar con análisis documental del modelo de exclusión y de las garantías que P05/P07-C requieren, usando el inventario y las evidencias ya guardadas. No repetir el inventario de Termux. No modificar código, G2/C3 ni PR #110; no ejecutar runtime, tests, CI ni efectos protegidos en esta unidad.

Este documento es una reconciliación documental. No constituye implementación, prueba en dispositivo, aceptación del propietario de una nueva arquitectura ni CI-VERIFIED.
