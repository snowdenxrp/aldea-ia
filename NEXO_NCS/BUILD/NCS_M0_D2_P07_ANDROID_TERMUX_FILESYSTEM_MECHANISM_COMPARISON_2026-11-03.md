# NCS M0 — Comparación preliminar de mecanismos filesystem para Android/Termux
Fecha: 2026-11-03
Rama: ncs-lumina-decoupling-2026-10-29
Base: P-07 contract commit 06d44f6284dc37c721903ac69c817245082b1923; matriz E1–E9 commit 16f677ed45cc1420c70b5e0e5efb12cd14794d14.
Estado: **INVESTIGACIÓN TÉCNICA PRELIMINAR — NO SELECCIÓN — NO IMPLEMENTADO — NO AUTORIZA PRUEBAS NI EFECTOS**

## 1. Resultado ejecutivo

No hay base suficiente para seleccionar hoy un mecanismo de exclusión/filesystem para NCS M0. Hay cuatro problemas distintos:

1. Admisión/exclusión entre procesos.
2. Identidad y resolución de paths (raíz, directorios, destinos, aliases y symlinks).
3. Operaciones sobre el objeto correcto (evitar que cleanup/release borre un sustituto).
4. Persistencia/durabilidad (visibilidad, atomicidad de publicación y resistencia ante crash).

Un mecanismo puede resolver una dimensión y no las otras:
- O_EXCL resuelve creación exclusiva de un nombre en una operación; no demuestra identidad durante cleanup.
- O_NOFOLLOW protege el componente final de una apertura; no toda la cadena de directorios.
- rename puede sustituir un nombre atómicamente bajo ciertas condiciones del filesystem; no es fencing frente a writers que ignoran el protocolo.
- flock/fcntl pueden coordinar procesos cooperativos mientras el lock está vivo; no autentican la ruta ni hacen seguro borrar un lock file por nombre.
- openat2 restringe la resolución de rutas si el kernel lo soporta, pero los headers Android/Bionic no prueban disponibilidad de la syscall en el kernel concreto ni que Node la exponga.

**Resultado: NO SELECCIONAR.** La combinación descriptor de directorio/openat2 + lock de kernel por descriptor merece investigación prioritaria, pero no es una arquitectura elegida. Sigue pendiente resolver cleanup/release resistente a sustitución y cobertura R1/P09.

## 2. Plataforma: hechos y límites

### 2.1 Termux

El perfil previsto mantiene Nexo bajo el almacenamiento privado de Termux, no en almacenamiento compartido ni en ~/storage. La documentación de Termux indica que el directorio privado suele residir en ext4 o f2fs y admite symlinks y atributos de archivo; el almacenamiento compartido tiene limitaciones relevantes, incluidas restricciones de symlink y características POSIX.

Android asigna UID propio a cada aplicación y aplica aislamiento mediante UID/SELinux. Esto protege el sandbox frente a otras aplicaciones por defecto, pero no separa procesos que comparten el UID de Termux. Tampoco demuestra que launchers, plugins o procesos auxiliares estén ausentes durante una ventana operativa.

### 2.2 Node.js

La API node:fs documenta flags como O_CREAT, O_EXCL, O_DIRECTORY, O_NOFOLLOW, O_SYNC y O_DSYNC. Permite aperturas controladas, pero la API estándar de alto nivel no expone una interfaz general equivalente a openat2(dirfd, path, open_how), ni una operación portable de unlink condicionado a identidad de inode.

La existencia de un flag en Node no prueba que esté soportado o conserve semántica idéntica en el target. Se requiere verificación con Node 26.4.0 y filesystem reales.

### 2.3 openat2 en Android

El árbol público de Android/Bionic contiene el header UAPI linux/openat2.h. Linux define restricciones como RESOLVE_BENEATH, RESOLVE_NO_SYMLINKS y RESOLVE_NO_MAGICLINKS. La syscall openat2 se incorporó en Linux 5.6; los headers son definiciones de interfaz, no prueba de soporte del kernel instalado.

En POCO X7 Pro / Android 16:
- kernel exacto y syscall efectiva: UNKNOWN;
- disponibilidad desde Node.js 26.4.0 sin addon/FFI: NO DEMOSTRADA;
- compatibilidad de flags y semántica bajo el filesystem privado de Termux: NO DEMOSTRADA.

No seleccionar openat2 hasta comprobar kernel/runtime y definir comportamiento fail-closed. Un fallback a secuencias realpath/stat/open no es equivalente.

## 3. Comparación de familias

| Familia | Aporta | Límites críticos | Evaluación preliminar |
|---|---|---|---|
| A. Node fs path-based: open wx, O_EXCL, O_NOFOLLOW, stat/lstat, rename | Stack existente; creación exclusiva; rechazo de symlink final en apertura compatible; publicación por rename | Check/use race en padres; cleanup por nombre vulnerable a sustitución; no fencing de writer directo | Insuficiente como única barrera |
| B. Descriptor de directorio + openat/openat2 vía addon/syscall | Ancla resolución a dirfd; openat2 puede restringir escape y symlinks durante resolución | Syscall/flags no confirmados; Node no ofrece API general directa; no resuelve por sí solo unlink condicionado a inode | Candidato condicionado |
| C. Lock de kernel por descriptor: flock/fcntl OFD | Coordinación interproceso cooperativa; kernel administra ciclo de vida del lock | Advisory; reemplazo del path puede producir locks sobre inodes distintos; no protege writer que ignora lock; requiere binding | Candidato solo para admisión |
| D. Lock file/directory: O_EXCL/mkdir | Arbitraje simple por nombre; cercano al patrón actual | Crash deja stale artifact; cleanup por path puede borrar sustituto; ausencia no demuestra quiescencia; depende de P05 | No resuelve release por sí solo |
| E. SQLite/base transaccional | Transacciones y journal/recovery gestionados por motor | No resuelve raíz/aliases ni escritores que evaden DB; sidecars/locking dependen del FS; añade formato y migración | No introducir en M0 sin decisión |
| F. Servicio/daemon | Centraliza admisión y estado | Lifecycle, boot, relanzamiento, disponibilidad y autoridad adicionales | Fuera de alcance actual |
| G. Hardlink como token | En algunos FS relaciona nombres con el mismo inode | La prueba previa en Termux devolvió EACCES; no asumir soporte ni usarlo como compare-and-unlink | No disponible como supuesto de diseño |

## 4. Evaluación de cada candidato

### A — Node fs path-based
Ventajas: no añade addon; open wx/O_EXCL permite creación exclusiva; O_NOFOLLOW puede rechazar symlink final; O_DIRECTORY puede validar directorio en plataformas compatibles; rename/temporal sirven para snapshots cooperativos.

Límites: realpath/lstat previo seguido de open deja ventana check/use; O_NOFOLLOW final no congela componentes padre; stat seguido de unlink no prueba que se elimina el objeto inspeccionado; lock por path no bloquea writer directo.

**Conclusión:** conservar como baseline cooperativo, no como solución suficiente de P07-A/P07-C ni E6/E7.

### B — Descriptor de directorio + openat/openat2
Ventajas potenciales: operaciones relativas a dirfd evitan resolver de nuevo toda la ruta absoluta; openat2 puede exigir beneath/in-root y prohibir symlinks/magic links durante resolución; errores explícitos permiten fallo cerrado.

Límites: header Bionic no confirma syscall en el kernel POCO; Node no ofrece API estándar de alto nivel para todas estas operaciones; requiere addon/helper auditado; openat2 no crea una operación compare-and-unlink; un actor que modifica entradas dentro del mismo directorio aún requiere control de permisos/identidad.

**Conclusión:** investigar disponibilidad real y binding mínimo. No asumir que resuelve E3/E4 por completo.

### C — Lock de kernel por descriptor
Ventajas potenciales: lock asociado a descriptor/inode; kernel administra ciclo de vida; terminación del proceso puede liberar lock y evitar stale-file cleanup como unlock.

Límites: flock/fcntl son advisory; si el path del lock se sustituye, un proceso puede mantener lock sobre inode viejo y otro abrir/lockear inode nuevo; no demuestra que store path sea destino aprobado; requiere comprobar semántica exacta del FS y binding nativo.

**Conclusión:** candidato para admisión exclusivamente, condicionado a identidad estable del lock object y cobertura P09.

### D — Lock file/directory
Ventajas: simple, observable, creación exclusiva por nombre.

Límites: crash puede dejar lock stale; borrar por path tras leer token no demuestra que el path siga apuntando al objeto original; path ausente no prueba que el actor terminó; PID, timestamp, TTL o token no equivalen por sí solos a quiescencia.

**Conclusión:** no usar como solución autónoma de release/readmisión. P05 debe resolver incertidumbre.

### E — SQLite
Ventajas: motor maduro para transacciones, locking y recuperación de datos.

Límites: no resuelve autoridad de raíz, alias/symlink, manipulación de directorio ni writers que evaden el motor; journal/locking dependen del FS; cambia formato, sidecars, dependencia y migración.

**Conclusión:** no introducir en M0 por conveniencia. Solo reconsiderar con decisión de alcance.

## 5. Matriz frente a P07-01…P07-10

| Prueba | A: Node path API | B: dirfd/openat2 | C: kernel fd lock | D: lock file/dir | E: SQLite |
|---|---|---|---|---|---|
| P07-01 aliases raíz | Parcial; canonicalización no basta ante carrera | Potencialmente fuerte dentro de dirfd; syscall debe probarse | No resuelve | No resuelve | No resuelve |
| P07-02 symlink/componente | O_NOFOLLOW solo final; insuficiente | Potencialmente fuerte con flags/kernel soportados | No resuelve | No resuelve | No resuelve |
| P07-03 tipo inesperado | lstat/open flags; carrera pendiente | Descriptor + validación; verificar | No resuelve | Parcial para lock object | Parcial para DB, no raíz |
| P07-04 owner ilegible/permisos | Debe mapear a UNKNOWN | Igual; no autoriza inferencia | Error lock no prueba identidad store | Riesgo de confundir unreadable con absent | Error DB debe bloquear |
| P07-05 sustitución cleanup | Vulnerable si cleanup por path | Dirfd reduce escape; compare-and-unlink pendiente | Lock inode no impide reemplazar nombre | Vulnerable a cleanup por path | Motor controla DB, no sidecars |
| P07-06 fallo owner + sustitución | No seguro con rm recursivo por path | Requiere cleanup ligado al objeto | No resuelve metadata owner | Riesgo alto de borrar sustituto | No aplica directamente |
| P07-07 temporal ajeno | Nombre único no prueba identidad cleanup | Mejor anclaje; cleanup sigue pendiente | No resuelve | Nombre no equivale a identidad | Sidecars administrados por motor |
| P07-08 writer directo | No | No por sí solo | Advisory: no | No | Solo si todos usan DB |
| P07-09 fallo escritura/publicación | Puede clasificar resultado; durabilidad aparte | No determina durabilidad por sí solo | No | No | Transacción/journal potencial, sujeto a FS |
| P07-10 syscall/flag no soportado | Flags runtime deben probarse | ENOSYS/EINVAL => STOP, sin fallback débil | Binding/FS no soportado => STOP | Semántica FS a verificar | Journal/locking a verificar |

Ninguna familia aislada cierra P07. B+C podría cubrir más dimensiones que A+D, pero requiere resolver P07-C, P05, P09 y R1. No se eleva a decisión.

## 6. Puertas de evaluación

### Candidato 1 — Mantener Node path API
Baseline actual. Beneficio: mínimo cambio. No cierra aliases/componentes ni cleanup condicionado a identidad. Mantener claims limitados a operaciones cooperativas existentes.

### Candidato 2 — Binding mínimo dirfd/openat2
No implementar aún. Requiere:
1. syscall disponible en kernel exacto y flags/struct aceptados;
2. addon/helper pequeño y auditable, compatible con Node 26.4.0 y ABI ARM64 Android;
3. resolución anclada a dirfd y pruebas negativas de symlink/escape/cambio de componente;
4. diseño separado de cleanup seguro.
Descarte inmediato si ENOSYS/flags no soportados y no existe alternativa con la misma garantía. Prohibido fallback silencioso.

### Candidato 3 — Lock kernel por descriptor
No implementar aún. Requiere:
1. elegir flock vs fcntl/OFD según semántica probada;
2. lock object estable y protegido contra sustitución bajo R1;
3. pruebas multiproceso, terminación/crash, cierre de descriptor y reemplazo de path;
4. UNKNOWN/BLOCKED ante adquisición/release ambiguos.
Descarte si dos procesos pueden lockear inodes distintos bajo el mismo nombre o algún caller no respeta el lock.

### Candidato 4 — Lock file/dir mejorado
No suficiente como mecanismo único. Reconsiderar solo si P05 define readmisión tras crash y P07 demuestra identidad/cleanup replacement-safe. PID, TTL o marker no son prueba de quiescencia.

### Candidato 5 — SQLite
Fuera de selección M0. Reconsiderar solo mediante decisión expresa y evaluación de sidecars, journal mode, locking, crash recovery y root boundary.

## 7. Plan de investigación no destructiva

Esta secuencia es propuesta, no ejecutada:
1. Confirmar perfil ya reportado: POCO X7 Pro, Android 16/API 36, Termux F-Droid, Node 26.4.0, ARM64; kernel exacto no inferido.
2. En una sesión autorizada, obtener kernel exacto, ABI, syscall openat2 (si se prueba, syscall inocua con fixture temporal), exports reales de fs.constants y filesystem de $HOME.
3. Si se evalúa addon, compilar fuera de ruta Continuity, en directorio temporal; no escribir stores ni locks reales.
4. Comparar locking con dos procesos y fixture independiente, nunca path Nexo; observar cierre normal y terminación abrupta.
5. Comparar identidad/cleanup solo con fixture aislada, centinelas y sustitución forzada por barreras.
6. Registrar SHA del harness, kernel, Node, FS, comando, exit/error y observables.
7. Revaluar P05/P07 con resultados; no seleccionar ni implementar hasta autorización aplicable.

No se ejecutó comando ni prueba en el dispositivo para este documento. Pruebas de capacidad requieren autorización explícita y fixtures temporales independientes.

## 8. Evidencia faltante

| Pregunta | Estado | Evidencia requerida |
|---|---|---|
| Kernel exacto POCO | UNKNOWN | versión/build reportado por dispositivo |
| openat2 syscall disponible | UNKNOWN | prueba inocua, errno y flags mínimos |
| openat2 expuesto en Node | No demostrado | API/binding auditado; Node estándar no basta |
| FS real de $HOME | Parcial; ext4/f2fs es lo típico documentado | mount/device exactos |
| O_NOFOLLOW/O_DIRECTORY real | Docs API, no prueba target | fixtures symlink final/intermedio |
| flock/OFD disponible | UNKNOWN | binding + prueba multiproceso |
| lock inode estable | UNKNOWN | intercalación de reemplazo y dos procesos |
| cleanup condicionado a identidad | UNKNOWN | técnica y carrera reproducible; stat+unlink no basta |
| fsync/durabilidad | UNKNOWN | contrato sync y prueba de crash si el claim lo exige |
| todos los writers cubiertos | P09 OPEN/UNKNOWN | evidencia de actores externos; no repetir censo histórico |

## 9. Recomendación provisional

**No seleccionar todavía.** Priorizar:
1. verificar openat2 y dirfd en kernel exacto;
2. evaluar lock kernel por descriptor para admisión cooperativa;
3. tratar cleanup/release replacement-safe como problema independiente y posiblemente bloqueante;
4. mantener P05-C no ratificada; no inventar recovery;
5. si no hay combinación verificable dentro de R1, mantener STOP en vez de degradar a path-based checks.

B+C es un candidato para evaluación, no arquitectura elegida. Si P07-C no puede resolverse, P07 no se cierra aunque openat2 y flock funcionen.

## 10. Fuentes técnicas consultadas

- Termux filesystem layout: https://github.com/termux/termux-packages/wiki/Termux-file-system-layout
- Termux execution environment: https://github.com/termux/termux-packages/wiki/Termux-execution-environment
- Node.js fs API: https://nodejs.org/api/fs.html
- Android Application Sandbox: https://source.android.com/docs/security/app-sandbox
- Android/Bionic openat2 UAPI header: https://android.googlesource.com/platform/bionic/+/master/libc/kernel/uapi/linux/openat2.h
- Linux openat2(2): https://man7.org/linux/man-pages/man2/openat2.2.html
- Linux openat2 UAPI header: https://github.com/torvalds/linux/blob/master/include/uapi/linux/openat2.h

Estas fuentes describen APIs/modelos generales; no prueban disponibilidad ni semántica del kernel/filesystem concreto del POCO.

## 11. Estado al emitir este documento

- Comparación: **DOCUMENTADA PRELIMINARMENTE**.
- Mecanismo seleccionado: **NINGUNO**.
- Candidato de investigación: dirfd/openat2 + kernel fd lock, ambos condicionados.
- P05: **OPEN / NOT RATIFIED**; C no ratificada.
- P07: **OPEN**; P07-A…P07-E no cerradas.
- P09: **OPEN / UNKNOWN**.
- E1–E9: criterios diseñados; ningún PASS nuevo.
- M0: **INCOMPLETO**.
- authorization: NOT_EVALUATED; raíz constitucional PENDING/UNKNOWN.
- Primera publicación, commissioning y efectos protegidos: **STOP**.
- Sin cambios runtime/tests/workflows/configuración/dispositivo; no se ejecutaron pruebas, CI, Actions ni comandos de dispositivo.
