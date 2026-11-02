# NCS M0 — delta de symlink path y artefactos temporales de bootstrap

Fecha: 2026-11-01
Rama: `ncs-lumina-decoupling-2026-10-29`
Base inspeccionada: `534ddb856df93de3065d6db92089904fce1bf9d4`
Commits de implementación: `a19da46da8942091bdfe0496b13f57414e63eaad`, `834f77d01dee9c99977d86015d7f6fdc9237ed2e`, `773d6fd82661df53e235277c296991ab46f15b62`
Estado: runtime y pruebas añadidos; **pruebas todavía no ejecutadas en este expediente**. Sin bootstrap real, sin creación de Continuity real y sin autorización de publicación.

## 1. Brecha abordada

En la base `534ddb8`, el bootstrap comprobaba la raíz con `stat()`, que sigue symlinks, y no inspeccionaba con `lstat()` cada componente del directorio relativo. La contención `path.resolve/path.relative` era léxica y no demostraba que los componentes del destino fueran directorios físicos no simbólicos.

Además, el preflight de servicio y la revalidación bajo lock solo reconocían artefactos reservados `.tmp` / `.tmp-*` cuando `Dirent.isFile()` era verdadero. Un directorio o symlink con esos nombres también constituye estado previo ambiguo.

## 2. Cambio de runtime

### `src/nexo/core/continuity-service.mjs`

- Inspecciona el objeto de raíz explícita con `lstat()`; si la propia raíz es un symlink, devuelve `NEXO_CONTINUITY_BOOTSTRAP_PATH_SYMLINK`.
- Rechaza una raíz que no sea directorio.
- Canonicaliza la raíz con `realpath()` y usa esa ruta canónica como raíz/destino efectivo. Esto permite que alias de plataforma en ancestros de la ruta de entrada no cambien el destino después de la validación.
- Inspecciona con `lstat()` cada componente de directorio de `relativePath`; symlink → `NEXO_CONTINUITY_BOOTSTRAP_PATH_SYMLINK`; componente ausente, no-directorio o no inspeccionable → `NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN`.
- Rechaza cualquier entrada del directorio padre cuyo nombre sea `<base>.tmp` o comience por `<base>.tmp-`, independientemente del tipo de entrada.

El destino informado en `destination.root` es la raíz canónica efectiva. La propia raíz explícita y los componentes relativos bajo ella no pueden ser symlinks. Los ancestros previos a esa raíz se canonicalizan; no se declara que sus alias sean una frontera de seguridad.

### `src/nexo/core/continuity-store.mjs`

- La revalidación bajo lock de artefactos temporales también rechaza cualquier tipo de entrada con nombre reservado, no solo archivos regulares.
- No elimina ni reutiliza esos objetos.

## 3. Pruebas añadidas

En `tests/nexo/continuity-contract.test.mjs` se añadieron casos para:
- raíz explícita que es symlink;
- componente intermedio del destino que es symlink;
- artefacto reservado `.tmp` como directorio y como symlink en el preflight del bootstrap;
- los mismos tipos de artefactos en la comprobación del store bajo lock.

Las pruebas verifican el error de bloqueo y que no se publique el destino.

**Estado de ejecución:** las pruebas se añadieron al árbol, pero todavía no se ha recibido una ejecución local/CI en los commits nuevos. No declarar PASS.

## 4. Límites que permanecen

- Las comprobaciones `lstat → realpath → lstat → readdir → initializeExclusive` siguen siendo operaciones separadas. No eliminan TOCTOU si otro proceso puede sustituir componentes entre comprobación y uso.
- El lock sigue siendo cooperativo. No excluye writers no cooperativos ni procesos con acceso equivalente al filesystem.
- No se demuestra fsync ni durabilidad ante pérdida de energía.
- No se afirma resistencia a actores hostiles con el mismo UID/sandbox.
- La canonicalización de ancestros no equivale a un descriptor de directorio estable ni a `openat2(RESOLVE_BENEATH|NO_SYMLINKS)`.

La exclusión verificable de launchers/writers durante una ventana concreta sigue siendo una condición de entorno, no una propiedad creada por estas comprobaciones.

## 5. Estado NCS

- Cambio de runtime: IMPLEMENTED en los commits indicados.
- Pruebas negativas: ADDED; NOT YET EXECUTED.
- CI: NOT VERIFIED en estos commits.
- P01-G: PENDING/UNKNOWN.
- E2/E3: UNKNOWN; E4 NOT READY.
- `authorization: NOT_EVALUATED`; raíz legítima PENDING/UNKNOWN.
- Primera creación/publicación, commissioning y efectos protegidos: STOP.
- M0 INCOMPLETO.

No ejecutar bootstrap ni crear Continuity real como parte de la validación de este delta.
