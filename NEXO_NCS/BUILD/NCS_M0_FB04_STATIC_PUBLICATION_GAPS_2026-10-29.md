# NCS M0 — hallazgos estáticos FB-04 en bootstrap/publicación Continuity

**Fecha:** 2026-10-29  
**Rama revisada:** `ncs-clean-architecture`  
**Estado:** REVISIÓN ESTÁTICA DEL CÓDIGO — NO ES PRUEBA DINÁMICA — NO IMPLEMENTADO — NO EJECUTADO  
**Archivos:** `src/nexo/core/continuity-service.mjs`, `src/nexo/core/continuity-store.mjs`

## 1. Resultado ejecutivo

La API dedicada `bootstrapNexoContinuityStore` mejora la separación de bootstrap y aplica validaciones léxicas de raíz/ruta, pero el código actual **no demuestra no-reemplazo frente a escritores no cooperativos ni resistencia a sustitución de componentes de ruta**. El propio contrato del store declara que `filePath` es configuración confiable, que no reclama resistencia a symlinks/path attacks y que el lock/revision coordina solo escritores cooperativos.

Se identifican tres brechas concretas para FB-04. No se propone parche todavía: primero debe fijarse el entorno restringido y el contrato de publicación que se pretende satisfacer.

## 2. Hallazgo FB04-S1 — carrera entre comprobación de ausencia y rename

En `createNexoContinuityStore().initialize()`:

1. Adquiere el lock cooperativo.
2. Comprueba `fsModule.access(filePath)`; si existe, devuelve `conflict`.
3. Si recibe ENOENT, llama a `writeEnvelope()`.
4. `writeEnvelope()` escribe `${filePath}.tmp` y luego hace `rename(tempPath, filePath)`.

El lock impide la concurrencia solo entre participantes que usan ese mismo lock. Un writer fuera del protocolo puede crear `filePath` después del `access()` y antes del `rename()`. En filesystems POSIX habituales, rename sobre un destino existente puede sustituirlo. Por tanto, la comprobación previa no demuestra la propiedad requerida de no reemplazo.

**Clasificación:** FB-04 OPEN/UNKNOWN. Requiere un mecanismo de publicación que haga cumplir la condición de no-reemplazo en el punto de publicación y pruebas negativas de concurrencia ligadas al SHA. No se selecciona aquí una primitiva concreta.

## 3. Hallazgo FB04-S2 — comprobación de temporales anterior al lock y limpieza posterior

En `bootstrapNexoContinuityStore()`, la enumeración del directorio padre y el rechazo de `.tmp`/`.tmp-*` ocurren **antes** de llamar a `store.initialize()`, que adquiere el lock después.

Dentro de `writeEnvelope()`, después de adquirir el lock, se llama a `removeStaleTemporaryFiles()`, que vuelve a recorrer el directorio y elimina los temporales que encuentra. Un proceso externo puede crear un temporal después del preflight dedicado y antes de esa limpieza. La limpieza general no distingue si ese archivo temporal pertenece a una operación concurrente/no cooperativa ni prueba que sea obsoleto.

**Clasificación:** FB-04 OPEN/UNKNOWN. La detección temprana de temporales no constituye exclusión; la limpieza genérica de temporales no satisface por sí sola la política M0 conservadora de no borrar estado de propietario desconocido.

## 4. Hallazgo FB04-S3 — resolución léxica no equivale a confinamiento físico de ruta

La API dedicada:
- usa `path.resolve(root, relativePath)` y `path.relative()` para rechazar escapes léxicos;
- valida la raíz mediante `fs.stat(resolvedRoot)`, que sigue symlinks;
- lee entradas del padre con `readdir(..., { withFileTypes: true })`, pero no demuestra la identidad estable de los componentes de ruta entre comprobación y uso;
- pasa el string `filePath` al store para operaciones posteriores.

La normalización y el prefijo relativo protegen frente a traversal léxico ordinario, pero no demuestran que root, directorios padres o destino no puedan ser sustituidos/redirigidos mediante symlinks u operaciones concurrentes.

El comentario del propio servicio declara que no reclama resistencia a symlink/path attacks; el store declara que el llamador debe usar un directorio local confiable y evitar que procesos no confiables muten rutas o locks.

**Clasificación:** no es una regresión respecto del contrato declarado; es una precondición ambiental no satisfecha/evidenciada. FB-03/FB-04 siguen OPEN/UNKNOWN hasta demostrar que el entorno restringido protege los componentes de ruta y el objeto efectivo.

## 5. Qué sí queda demostrado por lectura estática

- El bootstrap dedicado rechaza propiedades fuera de `root`, `relativePath`, `lockDeadline`, `lockWaitMs`; por tanto no acepta `legacyMemory`.
- La ruta de destino se deriva de raíz absoluta y ruta relativa normalizada, con rechazo de escape léxico.
- La API dedicada no construye ni devuelve owner.
- El store declara explícitamente el alcance cooperativo de su lock/revision y las limitaciones de symlink/path, filesystem distribuido y fsync.
- La inicialización detecta destinos ya existentes en el instante de `access()` y devuelve conflicto si los observa.

Estos hechos no prueban que el destino no pueda aparecer después de `access()`, que un temporal externo no sea borrado, ni que los componentes de ruta permanezcan estables.

## 6. Orden de resolución recomendado

1. Mantener el alcance restringido ya decidido por el propietario, sin exigir defensa frente a administrador/root hostil.
2. Identificar el runtime/launcher real y demostrar el control ambiental de acceso y relanzamiento (FB-03/E2/E3).
3. A partir del filesystem y controles reales del entorno, seleccionar un mecanismo de publicación no-reemplazable y de resolución segura de ruta. No elegirlo por suposición POSIX/Android.
4. Diseñar pruebas negativas para: destino creado entre preflight y publicación; temporal creado concurrentemente; padre/root sustituido; symlink en componentes; permisos/visibilidad parciales; error antes/después de la frontera de mutación.
5. Solicitar autorización separada antes de cambiar runtime/tests o ejecutar CI.

## 7. Gates

FB-04 OPEN/UNKNOWN; FB-03 OPEN/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; FB-06/FB-07 OPEN; raíz legítima PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera publicación y efectos protegidos STOP; **NCS M0 INCOMPLETO**.

No se ejecutaron tests, CI/Actions, comandos del POCO ni bootstrap real. No se modificó runtime.
