# NCS M0 — Evaluación de mecanismos de publicación FB-04 (2026-10-29)

**Estado:** DISEÑO TÉCNICO CONDICIONAL — NO RATIFICADO — NO IMPLEMENTADO — NO EJECUTADO.

## 1. Pregunta exacta

La primera publicación de Continuity requiere que el destino solo pueda pasar de ausente a presente una vez, sin reemplazar un objeto que aparezca después del preflight. El store actual usa `access(destination)` y después `rename(temp, destination)`; el lock solo coordina participantes cooperativos.

Esta evaluación no decide todavía la primitiva final porque el filesystem y el runtime real del POCO no están identificados.

## 2. Separar dos operaciones distintas

### A. Primera publicación (initialize)

Propiedad requerida: **create-if-absent / no-replace** en el punto de publicación. Si el destino existe —o aparece concurrentemente— el resultado debe ser conflicto/STOP y el contenido preexistente debe permanecer intacto.

### B. Actualización de Continuity ya existente (commit)

La actualización sí necesita sustituir el archivo canónico de forma controlada para avanzar revisión. Es una operación distinta; no debe confundirse con la garantía no-replace de la primera publicación. Depende de exclusión efectiva de escritores, validación de revisión y un contrato de commit/UNKNOWN. La revisión actual no certifica esa frontera para procesos no cooperativos.

## 3. Evaluación de mecanismos candidatos

| Mecanismo | Propiedad útil | Limitación / condición | Evaluación M0 |
|---|---|---|---|
| `rename(temp, destination)` después de `access` | Reemplazo/renombrado normalmente atómico en un mismo filesystem | La ausencia comprobada antes no se vuelve condición atómica; puede sustituir un destino creado entre ambas operaciones | **NO ACEPTABLE** como prueba de no-replace |
| `open(destination, "wx")` / creación exclusiva | Solicita creación exclusiva y falla si el nombre ya existe | El destino aparece antes de que el contenido esté completo; lectores pueden observar archivo parcial salvo que se añada otro protocolo de admisión | **NO EQUIVALE** a publicar un archivo completo atómicamente |
| `link(temp, destination)` (hard link) | En filesystems que lo soportan, crear el nombre destino falla si ya existe; el enlace al archivo temporal completo puede ser una operación create-if-absent | Requiere mismo filesystem, soporte/permisos de hard links y validación del tipo de objeto; la limpieza posterior del temporal es otra operación. No resuelve sustitución de directorios/symlinks ni exclusión de escritores en rutas | **CANDIDATO CONDICIONAL** para primera publicación, no seleccionado |
| Lock cooperativo / `mkdir(lock)` | Serializa procesos que usan el mismo protocolo | Un writer que no participa puede ignorarlo; no cierra la carrera ni protege el namespace | **INSUFICIENTE** como única barrera |
| API nativa específica del SO/filesystem con no-replace | Puede exponer una primitiva de publicación con condición atómica explícita | Necesita binding/API soportado en el runtime real; disponibilidad y semántica dependen del entorno. Mayor superficie de implementación y mantenimiento | **CANDIDATO CONDICIONAL**, sin seleccionar |
| Copiar al destino y luego cerrar | Puede crear el nombre con exclusión si se combina con create-exclusive | Los lectores pueden ver bytes parciales; error/crash deja estado parcial | **NO ACEPTABLE** como publicación atómica por sí sola |

## 4. Hallazgos sobre el código actual

En `src/nexo/core/continuity-store.mjs`:

- `initialize()` adquiere el lock cooperativo, comprueba el destino con `access()` y después llama a `writeEnvelope()`.
- `writeEnvelope()` usa el nombre fijo `${filePath}.tmp`, ejecuta `removeStaleTemporaryFiles()`, escribe el temporal y hace `rename(tempPath, filePath)`.
- El cleanup de temporales ocurre dentro de `writeEnvelope()`, después del lock, pero no prueba que un temporal encontrado pertenezca a una operación obsoleta del mismo proceso.
- `commitIfCurrent()` también usa `writeEnvelope()`; ahí el rename de destino existente es parte del mecanismo actual de actualización, por lo que cambiar globalmente `writeEnvelope()` a una operación no-replace rompería la semántica de commits. La primera publicación y los commits deben tener caminos/contratos diferenciados.
- El propio comentario del store declara que el lock/revision solo coordina escritores cooperativos, que no se reclama resistencia a symlink/path attacks ni fsync/power-loss durability y que `filePath` es configuración confiable, no sandbox.

En `src/nexo/core/continuity-service.mjs`:

- El bootstrap dedicado hace comprobaciones léxicas de root/relativePath y preflight de temporales.
- `fs.stat(root)` sigue symlinks y no fija la identidad de los componentes del path durante el uso posterior.
- El destino y sus padres se vuelven a resolver por nombre en operaciones posteriores; no existe una garantía demostrada de descriptor-relative traversal o identidad inmutable del directorio.
- Por tanto, una primitiva no-replace en el nombre final no resolvería por sí sola el riesgo de sustitución del directorio padre o de la raíz.

## 5. Requisitos previos antes de seleccionar una opción

1. Identificar el runtime real que ejecutará NCS (no inferirlo desde la app M1).
2. Identificar filesystem, ubicación del destino, soporte de hard links, permisos y semántica de rename/link del entorno real.
3. Establecer la lista cerrada de procesos/identidades autorizadas a escribir y cómo se impide que launchers o procesos no incluidos accedan al destino durante toda la ventana.
4. Establecer cómo se fija/protege la identidad de root y directorios padres frente a sustitución/symlinks.
5. Separar el protocolo de primera publicación del protocolo de commit posterior.
6. Definir resultados conservadores: destino preexistente/concurrente = CONFLICT/STOP; temporal/estado desconocido = UNKNOWN/STOP; error tras frontera de publicación = UNKNOWN salvo evidencia inequívoca; nunca borrar temporales de propietario desconocido.

## 6. Decisión técnica provisional

No modificar el runtime todavía. Mantener `rename` actual como **no probado frente a escritores no cooperativos**, y no afirmar que `link()` sea viable en el POCO sin conocer filesystem y permisos. La opción más simple compatible con el alcance M0 podría ser un hard-link create-if-absent para la primera publicación, siempre que el entorno real lo soporte y el control ambiental de writers/path ya esté demostrado. Si no, se evaluará una primitiva nativa específica o se mantendrá STOP.

No se recomienda usar `open("wx")` directamente sobre el nombre canónico para escribir el documento porque expondría un archivo parcialmente escrito.

## 7. Estado y límites

- FB-03: OPEN / UNKNOWN.
- FB-04: OPEN / UNKNOWN.
- E2/E3: UNKNOWN.
- E4: NOT READY.
- raíz legítima: PENDING / UNKNOWN.
- `authorization: NOT_EVALUATED`.
- primera publicación operativa y efectos protegidos: STOP.
- M0: INCOMPLETO.

Solo lectura estática y diseño documental. No se cambió runtime, no se escribieron tests, no se ejecutó CI/Actions, no se inspeccionó ni modificó el POCO, no se creó Continuity real y no se seleccionó ni ratificó mecanismo.
