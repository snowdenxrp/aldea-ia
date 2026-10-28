# NCS M0 — evidencia de inspección de solo lectura en POCO/Termux

**Fecha:** 2026-10-28  
**Tipo:** observación operacional limitada; comandos de consulta; sin ejecución de Nexo.  
**Alcance autorizado por el propietario:** rutas, metadatos/permisos y existencia de configuración relevante. No incluye cambios, instalación, creación de Continuity, tests, CI/Actions ni efectos protegidos.

## 1. Evidencia observada

### Ruta y permisos
- `HOME=/data/data/com.termux/files/home`.
- `pwd -P` y `readlink -f .`: `/data/data/com.termux/files/home/aldea-ia`.
- `readlink -f .git`: `/data/data/com.termux/files/home/aldea-ia/.git`.
- `HOME`, repositorio y `.git`: permisos `700`.
- `world-state.json`: existe en la raíz local; permisos `600`; tamaño observado `2,776,627` bytes; mtime observado `2026-09-22 12:39:49.378792786 -0600`. No se leyó su contenido.

### Configuración de arranque consultada por existencia/permisos
- No existen en las rutas comprobadas: `$HOME/.termux/boot`, `$HOME/.termux/tasker`, `$HOME/.profile`, `$HOME/.bashrc`, `$HOME/.zshrc`.
- `$PREFIX/etc/profile` existe con permisos `600`; no se leyó su contenido.
- No se inspeccionaron credenciales, variables de entorno ni contenidos de archivos personales de configuración.

### Identidad del checkout local
- Rama: `main`.
- HEAD: `1834182a2eaf4b1bfe59f9802ce3e49fc89b2ca7`.
- Último commit local mostrado: `1834182a`, 2026-09-21, `fix: encode visual audit metadata safely`.
- `git status --short` mostró cambios locales de Lúmina en `src/exploration.js`, `src/main-stable.js`, `src/movement.js`, `src/simulation.js` y cuatro tests; también `lumina-test.log` y múltiples respaldos `.bak` sin seguimiento. No se abrió ni alteró ninguno de esos archivos.

### Búsqueda local limitada
Una búsqueda `git grep` de patrones relacionados con `openNexoContinuityOwner`, `allowEmptyInitialization`, `persistState`, `filePath`, `continuityPath`, `world-state.json` e `initialize-continuity` en archivos versionados `*.mjs/*.js/*.cjs/*.json` solo devolvió referencias a `world-state.json` en `scripts/assistants.mjs`, `scripts/simulate.mjs`, `src/main-stable.js` y `src/main.js`. Esta observación pertenece a la copia local antigua en `main`; **no contradice ni reemplaza** la inspección estática de la rama canónica `ncs-clean-architecture`.

## 2. Interpretación acotada

1. La copia local examinada se encuentra bajo el directorio privado de Termux, y los permisos observados limitan el acceso conforme a los permisos del sistema.
2. Estos hechos no demuestran que todos los procesos/sesiones con acceso estén identificados, que no existan escritores externos, ni que pueda impedirse la reanudación de un escritor durante una ventana de bootstrap.
3. La ausencia de los directorios/archivos consultados no excluye otros mecanismos de Android, procesos hijos, sesiones, scripts, servicios o launchers.
4. La existencia y permisos de `world-state.json` describen el estado de Lúmina en ese checkout; no son evidencia sobre la ruta efectiva del archivo Continuity ni autorizan a modificarlo.
5. La copia local está en `main` y tiene modificaciones sin seguimiento. Debe preservarse intacta: no ejecutar checkout, reset, clean, pull, stash ni cambiar de rama en ese árbol como parte de esta tarea.
6. No se ejecutó código de Nexo, no se ejecutaron tests/CI/Actions, no se creó ni modificó Continuity y no se observaron efectos protegidos.

## 3. Efecto sobre los gates

- E1: el entorno previsto sigue identificado como POCO X7 Pro / Android.
- E2 — exclusión sostenida de todos los escritores/launchers y prevención de reanudación: **UNKNOWN**.
- E3 — modo real de lanzamiento e inventario exhaustivo verificable de writers/launchers: **UNKNOWN**. La ausencia de algunas rutas locales no equivale a inventario exhaustivo.
- E4 — evaluación del almacenamiento relevante para el objeto Continuity efectivo: **NOT READY** hasta disponer de evidencia suficiente de E2/E3 y fijar el destino efectivo.
- P-01: `OPEN / UNKNOWN`; P01-B: `C — NO SELECCIONAR TODAVÍA`; P-05: `NO RATIFICADA`.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Raíz legítima: `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`.
- M0: `INCOMPLETO`; primera creación de Continuity y efectos protegidos: `STOP`.

## 4. Siguiente paso permitido

No hacer más inspecciones genéricas del teléfono ni repetir el censo de entrypoints ya documentado. La operación concreta de primera creación todavía no tiene un mecanismo de lanzamiento seleccionado/configurado/verificado; P01-B sigue explícitamente en C. El siguiente trabajo debe ser una reconciliación documental finita de los bloqueadores P-01/P-05 contra la línea de meta M0, manteniendo separados `M0_BUILD_COMPLETE` y `PROTECTED_EFFECTS_AUTHORIZED`. Cualquier decisión técnica de mecanismo o ejecución real requiere autorización específica adicional.

