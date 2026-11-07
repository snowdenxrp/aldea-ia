# NCS M0 — P-07: contrato de aceptación de identidad filesystem y frontera de rutas
Fecha: 2026-11-03
Rama: ncs-lumina-decoupling-2026-10-29
Base: P-03/P-04 D1–D6 ratificadas; P-05 abierta; matriz E1–E9 commit 16f677ed45cc1420c70b5e0e5efb12cd14794d14.
Estado: **DESCOMPOSICIÓN TÉCNICA — NO SELECCIONA MECANISMO — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito y límites

Definir qué debe demostrar P-07 antes de afirmar identidad segura de raíz, destino, lock y objeto durante adquisición, escritura, release o cleanup.

P-07 cubre la frontera filesystem y sus alias/carreras. No es el contrato de exclusión operacional E2/E3, no sustituye P-05 (release/readmisión), ni demuestra autoridad constitucional de la raíz. El lock cooperativo existente conserva su alcance limitado a participantes que lo respetan.

Este documento no selecciona primitiva filesystem, no ratifica P-05-C, no modifica runtime/tests/workflows/configuración/dispositivo y no ejecuta tests/CI/Actions.

## 2. Evidencia base reutilizada

El análisis estático anterior, ligado al código 7a7f3ffa56af116a4f7222d22ff7638c9b470f92 y registrado en NCS_M0_CONTINUITY_STORE_WRITER_AND_PATH_BOUNDARY_DELTA_2026-11-01.md, establece:

- Escrituras actuales conocidas de Continuity pasan por continuity-store.mjs y su lock cooperativo.
- loadCurrent() también toma el lock por-store; esto coordina lectores cooperativos.
- initializeExclusive() usa temporal único con open(..., "wx") y publica con copyFile(..., COPYFILE_EXCL).
- commitIfCurrent() usa temporal y rename() después de comprobar revisión bajo lock.
- COPYFILE_EXCL evita sustituir un destino existente al ejecutar la copia, pero no constituye visibilidad atómica para lectores no cooperativos.
- La validación de bootstrap usa root absoluto, ruta relativa normalizada, contención léxica, stat(root), inspección de padre/temporales y segunda inspección bajo lock. No demuestra identidad de cada componente ni elimina cambios concurrentes entre check y use.
- No se observó contrato completo basado en realpath de cada componente, lstat/no-follow de toda la cadena, descriptor de directorio estable o primitiva equivalente.
- El módulo declara filePath como configuración confiable; no es sandbox de seguridad.
- La prueba en Termux reportó EACCES para hardlink. No se debe asumir disponibilidad de hardlink ni sustituirlo por symlink por analogía.
- No se demuestra fsync ni durabilidad ante pérdida de energía.

Estos hechos no se amplían a todos los sistemas de archivos, procesos ni versiones. No repetir inventario de callers ni análisis de writer scope ya documentados.

## 3. Propiedades que P-07 debe especificar

### P07-A — Identidad de raíz y resolución de aliases

Debe definirse qué significa que dos entradas de ruta representen la misma raíz efectiva y qué evidencia vincula la raíz aprobada con la usada por cada operación.

Aceptación requerida:
1. La raíz efectiva queda resuelta antes de derivar rutas de stores/locks.
2. Alias equivalentes no crean accidentalmente dos dominios de admisión para el mismo destino físico.
3. Componentes symlink o equivalentes reciben una regla explícita: rechazo, resolución controlada o soporte demostrado; nunca aceptación implícita.
4. La resolución no puede escapar del límite aprobado mediante componentes intermedios, cambios concurrentes o rutas relativas ambiguas.
5. La identidad presentada en preflight y la identidad usada tras confirmación permanecen ligadas; cualquier divergencia produce STOP antes de store I/O.

No se declara que realpath, canonicalización textual o una comprobación aislada sean suficientes.

### P07-B — Identidad del destino y tipo de objeto

Debe especificarse qué objetos son admisibles para archivo Continuity, archivo Chronicle, lock de admisión, locks per-store, temporales y directorios padre.

Aceptación requerida:
1. Cada objeto tiene tipo permitido explícito; symlink, directorio, socket, FIFO, dispositivo u objeto inesperado no se interpreta como archivo normal.
2. Se define el tratamiento de archivo existente, ausente, truncado, ilegible y sustituido.
3. La identidad del destino no se deriva únicamente del nombre de path.
4. Los temporales se asocian inequívocamente a una operación y no se adoptan, limpian o reemplazan por semejanza de nombre.
5. La ruta efectiva del objeto queda ligada a raíz canónica e invocación.

### P07-C — Operaciones resistentes a sustitución

Debe definirse cómo la operación que consume, reemplaza, libera o elimina un objeto garantiza que actúa sobre el mismo objeto cuya identidad validó.

Aceptación requerida:
1. La identidad comprobada y el objeto afectado están vinculados por propiedad verificable.
2. Si otro actor sustituye el path entre comprobación y uso, la operación no afecta al sustituto.
3. Si no puede demostrarse esa vinculación, salida UNKNOWN/BLOCKED y ningún cleanup destructivo alternativo por path.
4. Error de lectura de owner no se convierte en ausencia, token mismatch concluyente ni permiso para limpiar.
5. La limpieza por error de inicialización no elimina recursivamente un objeto cuya identidad no se atribuya al intento actual.

No se elige entre descriptor, handle, operación relativa a directorio, syscall específica, hardlink u otra técnica. La selección requiere compatibilidad demostrada con Android/Termux y contrato de fallo explícito.

### P07-D — Orden y límites de publicación

Debe definirse qué garantiza cada fase: creación temporal, escritura/cierre, publicación inicial, reemplazo de snapshot, observación por lectores y release.

Aceptación requerida:
1. Separar exclusividad de creación, atomicidad de visibilidad, durabilidad y coordinación; no usar esos términos como sinónimos.
2. Definir punto de linealización de cada operación o clasificar UNKNOWN si no puede determinarse.
3. Un lector no cooperativo no se considera protegido por el lock cooperativo.
4. Temporal + rename no se describe como fencing contra writers directos.
5. No afirmar fsync/durabilidad ante pérdida de energía sin contrato y evidencia específicos.
6. Resultados de negocio/persistencia permanecen separados del resultado de release conforme P-03/P-05.

### P07-E — Permisos, ownership y modelo de actores

Debe fijarse qué propiedades de permisos/ownership son precondiciones verificables y qué actores quedan fuera del modelo.

Aceptación requerida:
1. Identificar quién puede crear, renombrar, borrar o sustituir raíz, directorios, archivos y locks durante la ventana.
2. Definir cómo se detectan permisos insuficientes, ownership inesperado y cambios de tipo.
3. Una inspección puntual de permisos no equivale a exclusión sostenida.
4. Separar resistencia frente a actores cooperativos, otros procesos bajo el mismo UID y actores privilegiados/OS comprometido.
5. Las exclusiones del modelo R1 se declaran explícitamente y no se extrapolan a seguridad universal.

## 4. Matriz de aceptación P-07

| ID | Intercalación/condición | Resultado exigido | Evidencia necesaria | Relación E |
|---|---|---|---|---|
| P07-01 | Dos aliases de raíz apuntan al mismo destino | Un solo dominio canónico o rechazo explícito | Resolución y destino efectivo ligados a SHA/ejecución | E3/E6/E7 |
| P07-02 | Componente intermedio es symlink o cambia tras preflight | Rechazo/STOP o resolución segura demostrada; nunca escape | Barrera entre validación y apertura; destino real | E3/E4 |
| P07-03 | Destino/lock existe como tipo inesperado | UNKNOWN/BLOCKED; cero cleanup destructivo | Fixture por tipo y estado antes/después | E5 |
| P07-04 | Owner ilegible o permisos denegados | UNKNOWN distinto de ausencia/token mismatch | Fixtures separadas; resultado; cero readmisión | E5 |
| P07-05 | Objeto se sustituye entre check y cleanup | Sustituto intacto | Carrera determinista e identidad antes/después | E3 |
| P07-06 | Escritura inicial de owner falla y path se sustituye | Manejador no borra sustituto | Inyección + sustitución + centinela | E4 |
| P07-07 | Temporal preexistente, ajeno o sustituido | No adoptar ni borrar por nombre solamente | Identidad y trazabilidad de creación/cleanup | E3/E4 |
| P07-08 | Writer directo ignora lock y modifica destino | No ampliar claim de exclusión cooperativa | Proceso separado y evidencia del cambio | E6/E7 |
| P07-09 | Fallo entre escritura, publicación y respuesta | Persistencia según evidencia; release separado; UNKNOWN si ambiguo | Cortes de crash/inyección y lectura independiente | E1/E2/E9 |
| P07-10 | Plataforma no soporta operación seleccionada | Fallo cerrado; sin fallback silencioso | Prueba de capacidad en entorno objetivo y error exacto | E3/E4/E7 |

La tabla define obligaciones de aceptación, no autorización para ejecutar las intercalaciones. Los tests futuros deben ser deterministas y ligados al SHA exacto.

## 5. Dependencias que P-07 no resuelve

- P-05 determina qué hacer con release incierto, quién puede resolverlo y cuándo se permite readmisión. P-07 puede producir observaciones de identidad; no inventa recovery.
- P-03/P-04 fijan frontera pública, admisión exclusiva, límites D2, orden y tratamiento UNKNOWN. P-07 no puede crear bypass ni mover propiedad de admisión a stores.
- P-09 cubre callers externos/dinámicos no demostrados. Una primitiva segura no prueba que todos los escritores la usen.
- E2/E3 ambiental requiere evidencia de control de launchers, writers y prevención de relanzamiento durante una ventana real. P-07 no prueba quiescencia operacional.
- Raíz constitucional: identidad filesystem de una ruta no demuestra legitimidad constitucional ni autoridad para crear Continuity.

## 6. Cuestiones de ingeniería previas a seleccionar mecanismo

1. ¿Qué sistemas de archivos y semánticas reales están presentes en el destino Termux/Android previsto, y cuáles pueden verificarse sin publicar Continuity?
2. ¿Qué operación concreta vincula identidad validada con cleanup/reemplazo en esa plataforma?
3. ¿Cómo se garantiza que todos los componentes de ruta permanecen bajo el límite aprobado durante la operación?
4. ¿Qué tipos y permisos se aceptan para root, stores, locks y temporales?
5. ¿Qué comportamiento se exige ante EACCES, ENOENT, ELOOP, ENOTDIR, owner ilegible y sustitución concurrente?
6. ¿Qué garantías son solo cooperativas y cuáles tienen enforcement contra procesos distintos dentro de R1?
7. ¿Qué nivel de atomicidad, visibilidad y durabilidad necesita M0 sin reclamar propiedades que la plataforma no ofrece?

Ingeniería puede comparar mecanismos y documentar compatibilidad; no debe seleccionar una arquitectura que cambie el modelo de amenaza, añada servicio/daemon, marcador durable o mecanismo de recuperación sin decisión y autorización aplicables.

## 7. Criterios para declarar P-07 cerrada

P-07 no se cierra con canonicalización textual aislada, stat/lstat aislados, token en lock file, COPYFILE_EXCL, temporal único, rename, test de sustitución sin carrera real, tests dentro de un solo proceso, PASS de CI sin evidencia de plataforma/operación cubierta ni lock cooperativo presentado como fencing contra writers no cooperativos.

Para cierre se requiere:
1. Contrato explícito P07-A…P07-E.
2. Mecanismo elegido con compatibilidad demostrada en entorno objetivo.
3. Pruebas negativas deterministas P07-01…P07-10 aplicables.
4. Evidencia de no-daño al sustituto y fallo cerrado en ambigüedad.
5. Revisión de callers conocidos y resolución separada de P-09.
6. Claims limitados exactamente al modelo de actores probado.
7. SHA exacto, resultados de pruebas y CI diferenciados.

## 8. Estado al emitir este documento

- P-07: **OPEN**; requisitos descompuestos, sin mecanismo seleccionado ni cierre.
- P-05: **OPEN / NOT RATIFIED**; C sigue recomendación no ratificada.
- P-03/P-04 D1–D6: **RATIFICADAS**; enforcement pendiente.
- E1–E9: matriz diseñada; ningún PASS nuevo.
- E3/E4: riesgos estáticos previamente confirmados; sin revalidación dinámica.
- E6/E7: enforcement interproceso no demostrado.
- P-09: **OPEN / UNKNOWN** para callers externos/dinámicos.
- M0: **INCOMPLETO**.
- authorization: NOT_EVALUATED; raíz constitucional PENDING/UNKNOWN.
- Primera publicación, commissioning y efectos protegidos: **STOP**.
- Sin cambios runtime/tests/workflows/configuración/dispositivo; tests/CI/Actions no ejecutados.


---

## DELTA — DEPENDENCIA P-05 TRAS RATIFICACIÓN DE POLÍTICA C (2026-11-07)

La sección de estado original es un snapshot anterior a la decisión del propietario. P-05-C quedó **RATIFICADA POR EL PROPIETARIO** el 2026-11-07 como política `UNKNOWN/BLOCKED` sin recuperación automática.

- P-05 permanece **OPEN**: la ratificación no implementa enforcement ni resuelve la incertidumbre interproceso después de crash.
- P-07 conserva su alcance propio: identidad de raíz/destino, aliases, sustitución, cleanup replacement-safe, orden de publicación y límites filesystem.
- P07-C continúa **UNKNOWN / BLOQUEANTE** hasta demostrar operaciones replacement-safe bajo R1 y cobertura P09.
- La política C refuerza el requisito de no ejecutar cleanup destructivo por path cuando la identidad del objeto no esté demostrada; no selecciona una primitiva.
- P-09 sigue **OPEN / UNKNOWN**; E1–E9 no obtienen PASS nuevo; NCS M0 sigue **INCOMPLETO**.
- No se ejecutaron tests/CI ni se modificó runtime, workflows, configuración o dispositivo.

Registro autoritativo: [definición técnica P-05-C y ratificación del propietario](NCS_M0_D2_P05_POLICY_C_TECHNICAL_DEFINITION_2026-11-03.md).
