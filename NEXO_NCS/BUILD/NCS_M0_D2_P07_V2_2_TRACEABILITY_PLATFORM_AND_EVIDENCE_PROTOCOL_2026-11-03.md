# NCS M0 — P07 V2.2: trazabilidad, fingerprint y protocolo de evidencia POCO/Termux

Fecha: 2026-11-03  
Base documental: commit `d8b5ca8720908d926acc18130614cce132a43b5d`.  
Rama de propuesta: `ncs-p07-v2-2-documentary-proposal-2026-11-03`.  
Relacionado:
- `NCS_M0_D2_P07_V2_2_NORMATIVE_CORRECTION_2026-11-03.md`
- `NCS_M0_D2_P07_V2_2_SCENARIO_MATRIX_AND_TEST_ORACLES_2026-11-03.md`

Estado: **PROTOCOLO DOCUMENTAL — NO EJECUTADO — NO SELECCIÓN — NO AUTORIZA PRUEBAS EN DISPOSITIVO**.

## 1. Procedencia y resolución de auditorías

### 1.1 Base documental

V2.2 se prepara sobre los tres documentos V2.1 del commit `d8b5ca8720908d926acc18130614cce132a43b5d`. No se compararon checksums de los adjuntos usados por los revisores; la correspondencia de versión se apoyó en nombres, contenido y numeración de líneas declarada. V2.2 debe por tanto conservar la base commit y verificar blobs cuando se integre.

### 1.2 Auditorías recibidas

- **Claude, segunda auditoría:** 4 hallazgos H1–H14 confirmados y 10 confirmados con matices; identifica defectos de oráculo/cobertura en P07-05/16/18/19, P07-13, y P07-09; señala falta de fixture/intercalación en P07-21 y orden inverso de P07-12; propone completar actor classes, owner lifecycle, root sentinel, cutpoints y fingerprint.
- **Qwen, auditoría adversarial:** considera V2.1 robusta en gran parte de la matriz; identifica P07-18 y P07-19 como críticos; pide ajustes P07-01, P07-07, P07-13 y P07-16. Considera válidos P07-05/09/12/21, puntos que se reevalúan abajo.
- **Anomalía de metadata:** el informe de Qwen se autodata 2026-11-04, posterior a la fecha de esta consolidación (2026-11-03). Se conserva como metadata declarada por el revisor, no se usa para inferir cuándo se produjo ni afecta el contenido técnico. Confirmar fecha antes de citarla como cronología.

### 1.3 Resolución de discrepancias

| Tema | Resolución V2.2 | Razón |
|---|---|---|
| P07-05 | Se adopta objeción Claude con distinción por actor | Falta seam interno para prevención; actores cubiertos deben serializarse, crudos solo caracterizarse |
| P07-09 | Se adopta objeción Claude parcialmente | Cutpoints requieren orden de syscalls y prueba de llegada; estado sembrado no es crash real; Qwen no prueba observabilidad de fsync |
| P07-12 | Se adopta objeción Claude | Falta orden abrir → sustituir → bloquear sobre fd antiguo, con segundo lock sobre objeto nuevo |
| P07-16 | Se combinan propuestas | dirfd ancla resolución, pero no prueba permanencia del nombre raíz; se agregan RT-A/RT-B, centinela e inventario |
| P07-21 | Se adopta objeción Claude | Falta intercalación que haga alcanzable el cleanup del nombre sustituido; hardlink policy sigue separada |
| P07-18 | Coincidencia Claude/Qwen | Separar atomicidad/visibilidad de protección del destino centinela |
| P07-19 | Coincidencia Claude/Qwen | Añadir sustituto, intercalación y centinela; revisar fuente exacta Node/libuv |
| P07-13 | Coincidencia parcial | Tabla por mecanismo y lifecycle/reaping |
| P07-03/10/14/20 | Ajustes de observabilidad | watchdog, indisponibilidad inyectada, estado T, nivel de evidencia fsync |

No se toma el recuento de escenarios “válidos” de un revisor como sustituto de oráculos completos. Un escenario puede ser válido como caracterización y no satisfacer un gate.

## 2. Matriz de trazabilidad escenario → propiedad → gate → evidencia

| Escenario | Propiedad | Gate | Evidencia mínima futura | Fingerprint/datos |
|---|---|---|---|---|
| P07-01 | A: aliases/dominio | P07-A | política ratificada + clasificación por clase | mountinfo, FS, dev/ino, resolución |
| P07-02 | A/B: resolución symlink | P07-A/B | final/intermedio separado; barrera real si carrera | flags, syscall, errno, kernel |
| P07-03 | B: tipo | P07-B | fstat del objeto abierto; watchdog FIFO | tipo, permisos, UID/GID |
| P07-04 | B/C: owner/acceso | P07-B/C | fixtures ausente/parcial/ajeno/ilegible | permisos, UID/GID, metadata |
| P07-05 | C: sustitución/cleanup | P07-C | seam interno, actor class, centinela, control | SHA, syscalls, fd/name identity |
| P07-06 | C: error handler | P07-C | cutpoint × handler fd/no-fd/foreign-fd | fase, PID, fd refs, errno |
| P07-07 | C: atribución temporal | P07-C/P05 | adopción definida, huérfano retenido si UNKNOWN | marker, fd, hash, provenance |
| P07-08 | E: writer crudo | R1/P09 | control cooperativo y actor directo | UID, permisos, clase(B) |
| P07-09 | D: crash proceso | P07-D | cutpoint anunciado, signal journal, reaping | PID, señal, orden syscalls |
| P07-10 | D/E: disponibilidad | P07-D/E | syscall/flag real o inyección controlada | kernel, ABI, errno, SIGSYS |
| P07-11 | identidad fd/name | P07-B/C | dos aperturas y fstat diferenciados | dev/ino, fd mapping |
| P07-12 | lock path substitution | P07-E/C | ambos órdenes de sustitución y lock | mecanismo, fd, dev/ino |
| P07-13 | lifecycle locks | P07-E | tabla por mecanismo, contención/reaping | flock/fcntl/OFD, procesos |
| P07-14 | SIGSTOP | P07-E | estado T confirmado y lock retenido | wait status, PID, señal |
| P07-15 | fstat vs stat | P07-B/C | identidad fd y resolución path separadas | dev/ino, mount context |
| P07-16 | raíz/ancestro | P07-A/C | RT-A/RT-B, centinela, inventario, cleanup | dirfd, namespace, mountinfo |
| P07-17 | semántica lock | P07-E | subcasos por mecanismo y open description | syscall/binding, FS |
| P07-18a | rename visibility | P07-D | lector solapado, observable old/new/ENOENT | FS, operación, timeline |
| P07-18b | destino replacement-safe | P07-C | centinela destino, fd, normal/NOREPLACE | dev/ino, nlink, namespace |
| P07-19 | copyFile error cleanup | P07-C/D | fallo inyectado, B sustituto, centinela | Node, libuv, source hash |
| P07-20 | fsync file/dir | P07-D | spy API o syscall trace explícito | FS, syscall/API, errno |
| P07-21 | hardlinks | P07-A/C | n1/n2, intercalación, cleanup, sentinel | dev/ino, nlink, FS |
| P07-22 | actor boundary | P07-E | cooperative/raw classification | UID, permissions, R1 |

## 3. Niveles de evidencia

Registrar cada afirmación en una de estas clases:

1. **DOCUMENTARY:** documentación/API/semántica publicada; no prueba el target.
2. **STATIC_SOURCE:** inspección de código exacto, commit, versión y hash; no prueba ejecución.
3. **RUNTIME_API:** invocación observada desde API/runtime; no necesariamente demuestra syscall exacta.
4. **SYSCALL_TRACE:** syscall observada con trazado fiable; requiere validar que el trazador funciona y no altera el comportamiento relevante.
5. **CONTROLLED_EXERCISE:** fixture/intercalación ejecutada con controles y journal.
6. **TARGET_FINGERPRINTED:** ambiente identificado para la ejecución; no prueba propiedad por sí solo.
7. **CI_VERIFIED:** ejecución CI ligada a SHA y workflow exactos.
8. **PRODUCT_EXERCISED:** ruta real de producto ejercida dentro del alcance autorizado; no inferir de tests unitarios.

No mezclar niveles. Un documento de Node sobre `copyFile` no prueba el mecanismo interno de unlink en la libuv embebida. Un spy API no prueba syscall si no observa syscall. Un fingerprint no prueba ausencia de otros writers.

## 4. Fingerprint de POCO X7 Pro / Termux

### 4.1 Datos declarados, sujetos a revalidación

Contexto previo:
- POCO X7 Pro, modelo `2412DPC0AG`, codename `rodin`.
- Android 16, API 36.
- HyperOS 3.0.302.0.
- Termux F-Droid 0.119.0-beta.3.
- Node.js v26.4.0.
- Git 2.55.0 (relevante para procedencia del checkout/harness, no para semántica filesystem).

Estos datos no son fingerprint de ejecución P07. Se deben revalidar para cada campaña autorizada.

### 4.2 Campos estáticos que deben capturarse si son legibles

- fecha/hora y zona;
- fabricante, modelo, codename, build fingerprint Android, API, patch level;
- kernel exacto y boot_id;
- ABI/arquitectura y userspace;
- Termux app version/source;
- Node `process.version`, `process.versions` completa, ABI, V8 y `process.versions.uv`;
- hash del binario Node;
- versión/build/compiler metadata si disponible;
- método de binding usado (Node core, addon, FFI o helper) y hash de cada artefacto;
- libuv realmente embebida o enlazada, con método de identificación y hash cuando sea posible;
- Git version, commit, dirty status, SHA del harness y del código bajo prueba;
- UID/GID efectivos, umask, capacidades, no_new_privs y Seccomp de `/proc/self/status` si legible;
- SELinux mode/context si observable, sin afirmar política completa;
- mountinfo del fixture y HOME, tipo de filesystem y opciones relevantes;
- si fixture y HOME comparten montaje;
- espacio libre, inode availability si se expone, y baseline de namespace;
- configuración legible de restricciones/background management relevante, sin inferir comportamiento futuro.

### 4.3 Solo mediante ejercicios controlados

- disponibilidad real y semántica de openat2/renameat2/flags/linkat/unlinkat;
- flock, F_SETLK y F_OFD_SETLK por mecanismo;
- locks bajo SIGKILL/SIGSTOP y referencias heredadas;
- fsync(file)/fsync(dir) invocables y errores;
- comportamiento de rename/RENAME_NOREPLACE;
- comportamiento de copyFile ante fallo en versión exacta;
- syscall trace/spy de API y validez del observador;
- EACCES de link/linkat y su causa;
- SIGSYS solo en proceso hijo desechable;
- observabilidad/overflow del journal de namespace si se utiliza.

### 4.4 Terminación de procesos Android

No afirmar un mecanismo concreto de terminación/freeze por versión sin evidencia. Para cada ejercicio:
- registrar PID, inicio, parent PID y estado;
- quién solicitó/envió la señal y cuándo;
- señal enviada y resultado observado;
- wait/reaping o evidencia equivalente;
- exit status y causa si el sistema la expone;
- si el proceso alcanzó el cutpoint anunciado antes de morir;
- restricciones de background legibles para esa ejecución.

Si A termina antes de que el harness envíe la señal prevista, escenario INVALID. No atribuir una muerte a Android sin evidencia.

### 4.5 No afirmable desde fingerprint estático

- ausencia universal de writers externos;
- quiescencia E2/E3;
- que ningún proceso mismo UID pueda reanudar escritura;
- política SELinux completa;
- semántica futura bajo cambios de estado del dispositivo;
- durabilidad ante pérdida de energía;
- que una versión de kernel implique feature sin probarla (backports del fabricante);
- suficiencia de un mecanismo para P07-C;
- autoridad constitucional de raíz.

## 5. Protocolo de evidencia por fases

### Fase 0 — Preparación documental

1. Ratificar alcance de escenarios y modelo de actores.
2. Definir fixture privado y comprobar que no apunta a Continuity real.
3. Definir centinelas y roles.
4. Definir controles positivos/negativos.
5. Definir política de retención si cleanup no puede atribuirse.
6. Registrar SHA del harness/producto antes de ejecutar.

### Fase 1 — Fingerprint

Capturar §4.2; si campo crítico no es legible, registrar UNKNOWN y su impacto. No sustituirlo por valor esperado.

### Fase 2 — Disponibilidad

Probar APIs/syscalls inocuas en fixture. Syscalls potencialmente sujetas a SIGSYS solo en hijo desechable. Separar ENOSYS/EINVAL/EPERM/EACCES/EBADF/EINTR/SIGSYS; no inferir causa no observada.

### Fase 3 — Caracterización de semántica

Ejecutar escenarios aplicables de aliases, tipo, symlink, lock, fd/name, rename, hardlink y fsync. Registrar cada mecanismo por separado. Fase 3 no incluirá implícitamente P07-16 ni P07-18b, que pertenecen a gate P07-C/Fase 4.

### Fase 4 — P07-C y cleanup

Para P07-05/06/07/16/18b/19/21:
- control positivo;
- seam/intercalación alcanzados;
- actor class;
- descriptor/namespace baseline;
- centinela independiente;
- oráculo de identidad por rol;
- resultado de cleanup;
- inventario posterior;
- evidencia de que no se destruyó sustituto.

Si seam no es instrumentable, UNKNOWN. Si solo se detecta divergencia y se detiene, DETECTION_ONLY. Si actor cubierto queda serializado, SERIALIZATION.

### Fase 5 — Crash/persistencia

Separar process crash, restart, filesystem recovery y power-loss. No usar el término “durable” sin especificar el nivel. Registrar última syscall completada, siguiente pendiente, journal de señal y reaping. La presencia del payload no prueba fsync.

### Fase 6 — Suficiencia y gates

No sumar PASS de primitivas. Resolver cada propiedad A–E y dependencias:
- P07-A aliases/raíz;
- P07-B tipo/identidad;
- P07-C operación destructiva;
- P07-D publicación/persistencia;
- P07-E actores/permisos;
- P05 release/readmisión;
- P09 callers/writers.

## 6. Registro de claims permitidos

| Observación | Claim permitido | Claim prohibido |
|---|---|---|
| fd conserva objeto tras rename/unlink | referencia abierta observada | nombre sigue apuntando al fd |
| dirfd ancla directorio abierto | resolución relativa anclada | raíz nombrada no sustituible |
| lock advisory contiende entre cooperadores | coordinación cooperativa | mandatory enforcement |
| rename cambia visibilidad atómicamente bajo FS probado | atomicidad de visibilidad | compare-and-rename por inode |
| fsync(file) API invocada | solicitud de sync de archivo | entrada de directorio persistida |
| fsync(dir) API invocada | solicitud de sync de directorio | durabilidad física universal |
| SIGKILL + inspección | supervivencia observada a process crash | power-loss durability |
| stat/fstat detecta divergencia | detección puntual | prevención TOCTOU |
| fail-closed conserva residuo | retención segura observada | cleanup replacement-safe |
| dos nombres hardlink al mismo inode | alias de objeto observado | mismo dominio de autoridad |

## 7. Dependencias y puertas

- **P05-C:** OPEN / NOT RATIFIED. Debe definir release/readmisión y política de residuos ante UNKNOWN/BLOCKED.
- **P09:** OPEN / UNKNOWN. Debe demostrar cobertura de callers/writers relevantes; lock/protocolo no demuestra adopción universal.
- **P07-A:** política aliases pendiente de decisión del propietario.
- **R1:** límite de actores requiere ratificación; no inferirlo de un candidato documental.
- **P01/P02:** raíz constitucional sigue fuera de P07.
- **P07-C:** no puede cerrar con solo documentos ni con detección sin prevención/serialización demostrada.

## 8. No ejecución y estado de esta rama

Esta rama contiene solo tres documentos Markdown de propuesta. En su preparación:
- no se modificó runtime;
- no se modificaron tests, workflows ni configuración;
- no se ejecutó npm/node test, CI ni GitHub Actions;
- no se ejecutaron comandos Termux/POCO ni syscalls;
- no se ejecutó bootstrap ni publicación;
- no se accedió ni modificó `$HOME/.nexo-continuity.json`;
- no se seleccionó mecanismo;
- no se modificó PR #110.

Estado:
- P07: OPEN.
- P07-C: UNKNOWN/BLOCKING.
- P05-C: OPEN/NOT RATIFIED.
- P09: OPEN/UNKNOWN.
- authorization: NOT_EVALUATED.
- raíz constitucional: PENDING/UNKNOWN.
- commissioning/efectos protegidos: STOP.
- NCS M0: INCOMPLETO.

**La creación de esta rama y documentos no constituye ratificación, implementación ni autorización de pruebas.**
