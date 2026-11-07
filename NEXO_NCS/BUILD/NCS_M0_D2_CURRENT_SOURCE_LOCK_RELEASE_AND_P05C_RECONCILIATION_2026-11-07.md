# NCS M0 — Reconciliación del código vigente: lock/release frente a P-05-C y P-07-C

Fecha: 2026-11-07  
Rama documental: `ncs-strategic-vision-preservation-2026-11-05`  
Snapshot de código inspeccionado: `ncs-lumina-decoupling-2026-10-29`  
HEAD de código: `d8b5ca8720908d926acc18130614cce132a43b5d`  
Estado: **ANÁLISIS ESTÁTICO DE CÓDIGO — NO IMPLEMENTA — NO EJECUTA — NO AUTORIZA PRUEBAS**

## 1. Alcance y procedencia

Esta unidad no repite el inventario de callers P-09 ni la comparación genérica de primitivas. Revalida directamente los seams de lock/release y publicación que condicionan P-05-C, P-07-C y el posterior enforcement D1.

Blobs recuperados en el HEAD indicado:

| Archivo | Blob SHA |
|---|---|
| `src/nexo/core/continuity-store.mjs` | `c1eb81bf74d2df576079b3269ac4db22d87fe7b6` |
| `src/nexo/core/continuity-service.mjs` | `53fd7043266635b30a1e01b69bb00d28feda300c` |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` |

La punta de PR #110 sigue siendo `d8b5ca8720908d926acc18130614cce132a43b5d`; esta revisión no afirma que el código haya cambiado después de ese snapshot.

## 2. Continuity: adquisición, release y estado incierto

En `continuity-store.mjs`:

1. La admisión per-store se crea con `mkdir(filePath + ".lock")` y escribe `owner.json` con PID/token.
2. Si falla la escritura de `owner.json`, el handler ejecuta `rm(lockPath, { recursive: true, force: true })`.
3. El release lee `owner.json`, compara el token y después ejecuta `rm(lockPath, { recursive: true, force: true })` por nombre.
4. Si el primer cleanup falla, reintenta una segunda vez por el mismo path.
5. Si ambos fallan, registra el path en `lockReleaseFailures`, un `Set` en memoria del proceso.
6. En una adquisición posterior dentro del mismo proceso, ese Set bloquea mientras el path exista; si el path devuelve ENOENT, el Set se limpia y la adquisición continúa.
7. Ante lock existente con edad mayor a 60 segundos y PID no vivo, el código devuelve `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`; no elimina automáticamente el lock obsoleto.

### Consecuencia

- El rechazo de stale lock evita una readmisión automática por antigüedad/PID mientras el directorio siga presente.
- No existe en este código evidencia de que el estado de release fallido sobreviva al proceso: `lockReleaseFailures` es volátil.
- Si el path desaparece, la lógica local elimina la marca volátil y permite volver a intentar; una nueva instancia tampoco hereda el Set.
- La comprobación token→`rm(path)` no vincula atómicamente el objeto comprobado con el objeto eliminado. Un reemplazo entre ambas operaciones puede hacer que el cleanup afecte al sustituto.
- El cleanup recursivo por nombre del lock y el cleanup de temporales siguen siendo seams que requieren identidad replacement-safe; que el proceso haya creado inicialmente el nombre no demuestra que ese nombre siga refiriendo al mismo objeto al limpiar.

Clasificación: **P-05 durable/interproceso NO DEMOSTRADO; P-07-C NO SATISFECHO**. El rechazo de stale lock es una conducta fail-closed parcial, no prueba O1–O5 ni cierre de P-05-C.

## 3. Chronicle: mismo riesgo de identidad en release

En `chronicle-store.mjs`:

1. La adquisición usa `mkdir(lockPath)` y escribe PID/token.
2. El release lee el owner y compara el token; luego ejecuta `rm(lockPath, { recursive: true, force: true })` por nombre.
3. Si la escritura inicial del owner falla, el handler también limpia el directorio por path.
4. El lock stale (edad > 60 s y PID no vivo) produce `NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED`; no hay reclamación automática en esa rama.
5. El resultado de release fallido se devuelve como `blocked`, separando `persistenceStatus`, pero el código inspeccionado no crea por sí mismo un estado durable independiente que sobreviva a la desaparición/sustitución del lock path.

Clasificación: **separación de resultado de negocio/release parcialmente implementada; identidad de cleanup y cuarentena durable no demostradas**.

## 4. Publicación y temporales: garantías exactas

### Continuity

- La publicación inicial usa temporal único abierto con `"wx"`, escribe/cierra y publica mediante `copyFile(..., COPYFILE_EXCL)`.
- El propio código declara que la copia no es una operación de visibilidad atómica y que los lectores cooperativos toman el lock per-store.
- El temporal se elimina mediante `unlink(tempPath)`; ante algunos errores se vuelve a intentar por path.
- El reemplazo ordinario usa temporal estable `.tmp` y `rename(tempPath, filePath)`; el cleanup de temporales escanea nombres y después elimina por path.
- El módulo declara expresamente que no reclama fsync/durabilidad ante pérdida de energía ni resistencia a ataques de symlink/path.

### Chronicle

- El reemplazo usa temporal estable y `rename(temp, filePath)`.
- El módulo declara que no reclama fsync/durabilidad ante pérdida de energía ni resistencia a ataques de symlink/path.
- El cleanup de temporales también termina eliminando paths después de un escaneo.

### Consecuencia

Se puede describir la publicación ordinaria como coordinación/visibilidad para participantes cooperativos bajo las condiciones del filesystem; no como fencing de escritores directos, compare-and-unlink, ni durabilidad ante pérdida de energía. P07-D permanece **PARTIAL/OPEN** y P07-C **UNKNOWN/BLOCKING**.

## 5. Matriz de impacto sobre las obligaciones O1–O9

| Obligación | Evidencia de este snapshot | Estado |
|---|---|---|
| O1 BLOCKED sobrevive al proceso dueño | No hay estado independiente durable demostrado; locks stale conservados solo mientras el objeto/path permanezca | UNKNOWN |
| O2 nueva invocación descubre estado previo | Lee el lock path actual; no prueba continuidad de identidad tras desaparición/sustitución | UNKNOWN |
| O3 identidad estable | Directorio nombrado por path; no hay anclaje estable demostrado en el seam | UNKNOWN |
| O4 cleanup solo afecta objeto adquirido | Token leído antes de `rm(path)`; no hay operación condicionada atómicamente a identidad | NOT SATISFIED |
| O5 ausencia/sustitución no habilita readmisión | La ausencia permite reintento; marca Continuity es solo process-local | NOT SATISFIED |
| O6 reclasificación por procedimiento aprobado | No se demuestra procedimiento durable/registrado en estos módulos | UNKNOWN |
| O7 todos los callers pasan por admisión | Depende de P-09; sigue OPEN/UNKNOWN | UNKNOWN |
| O8 garantía en R1 real | Código no prueba fingerprint ni permisos/ownership del POCO | UNKNOWN |
| O9 negocio y release separados | Los resultados conservan `persistenceStatus` y `lockRelease` en rutas de fallo | PARTIAL |

No se eleva O9 a PASS global: la separación de campos en estas rutas no resuelve P-05, P-07 ni cobertura.

## 6. Qué queda demostrado y qué no

**Demostrado estáticamente en el snapshot:**
- lock per-store basado en directorio por path y owner token;
- rechazo de lock stale bajo el predicado edad/PID, sin auto-reap en esa rama;
- cleanup de release y algunos errores mediante `rm(path, recursive)`;
- marca de fallo de release de Continuity almacenada en memoria del proceso;
- publicación inicial Continuity con `COPYFILE_EXCL`, no visibilidad atómica;
- reemplazo de snapshots mediante temporal + rename;
- ausencia de claim de fsync/power-loss durability y de path-attack resistance en los módulos.

**No demostrado:**
- persistencia interproceso de BLOCKED después de crash y frente a desaparición/sustitución del path;
- identidad estable de lock/root/destino en el namespace real;
- release/cleanup replacement-safe;
- semántica del filesystem/kernel/Node concreto del POCO;
- control sostenido de writers/launchers E2/E3;
- cobertura de consumidores externos/loaders no literales P-09;
- admisión de instancia D1 antes del primer I/O persistente en las APIs públicas ya identificadas.

## 7. Decisión técnica derivada

1. No reutilizar el lock per-store actual como prueba de cuarentena durable P-05.
2. No considerar token + lectura + `rm(path)` como cleanup replacement-safe.
3. No resolver la brecha con `stat/lstat/realpath` seguido de unlink ni con rename como sustituto de identidad.
4. No introducir un marcador durable, lock hermano, tombstone, epoch, daemon o journal sin decisión/ratificación aplicable.
5. Mantener el resultado de negocio separado de release; ante release incierto, conservar UNKNOWN/BLOCKED y no reintentar ni readmitir.
6. Cualquier diseño futuro debe satisfacer O1–O9 y los oráculos V2.3 antes de implementación.

## 8. Estado y siguiente trabajo mínimo

- P-05-C: RATIFICADA COMO POLÍTICA.
- P-05: OPEN; enforcement durable/interproceso no demostrado.
- P07-C: UNKNOWN/BLOCKING; O4 y O5 no satisfechas por los seams observados.
- P07-A/B/D/E: siguen OPEN; este análisis aporta evidencia estática de código, no target fingerprint ni decisión de aliases.
- P-09: OPEN/UNKNOWN.
- P-03/P-04: D1–D6 ratificadas; enforcement pre-read pendiente.
- E2/E3: PARTIAL/NOT CLOSED.
- NCS M0: INCOMPLETO.

Siguiente unidad: diseñar una alternativa de admisión/release que no dependa de borrar el lock por path, que preserve BLOCKED tras crash y que tenga identidad verificable; compararla contra O1–O9 y el modelo R1. No seleccionar ni implementar sin cerrar la dependencia de P07-C/P05 y sin autorización específica.

Esta unidad fue solo lectura estática de GitHub. No se ejecutaron tests, CI/Actions, syscalls, harness, comandos POCO/Termux, bootstrap, escrituras de Continuity ni efectos protegidos.
