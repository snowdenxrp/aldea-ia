# NCS M0 — P07 V2.1: trazabilidad, suficiencia de primitivas y protocolo de evidencia POCO/Termux

Fecha: 2026-11-03  
Rama: `ncs-lumina-decoupling-2026-10-29`  
Relacionado:
- `NCS_M0_D2_P07_V2_1_NORMATIVE_CORRECTION_2026-11-03.md`
- `NCS_M0_D2_P07_V2_1_SCENARIO_MATRIX_AND_TEST_ORACLES_2026-11-03.md`
- Contrato P07 original y comparación preliminar Android/Termux (2026-11-03)

Estado: **CONSOLIDACIÓN DOCUMENTAL — NO EJECUTADO — NO SELECCIÓN — NO AUTORIZA PRUEBAS EN DISPOSITIVO**

## 1. Trazabilidad de auditorías

| Fuente | Hallazgo | Resolución V2.1 | Estado |
|---|---|---|---|
| Claude C1 / Qwen | `/data/local/tmp` no es ruta apropiada asumida para Termux no-root | Usar fixture temporal privado de Termux; fingerprint exacto | Incorporado |
| Claude C2 / Qwen | Android 16 no determina versión de kernel | Kernel exacto permanece UNKNOWN hasta observación del dispositivo | Incorporado |
| Claude C3 / Qwen | openat2/seccomp no se puede inferir por analogía | Probar solo en hijo desechable; clasificar señal/errno sin inferencia | Incorporado |
| Claude C4 / Qwen | O_NOFOLLOW solo protege componente final | P07-02 separa symlink final/intermedio | Incorporado |
| Claude C5 / DeepSeek | fsync de directorio y durabilidad requieren separación | P07-D/P07-20 separan archivo, directorio, process crash y power loss | Incorporado |
| Claude C6 / DeepSeek | flock no protege sustitución de path | P07-12/P07-17; lock inode no equivale a nombre actual | Incorporado |
| Claude C7 / DeepSeek | unlinkat no es compare-and-unlink | P07-C prohíbe claim por secuencia stat/fstat + unlinkat | Incorporado |
| Claude C8–C10 | Oráculos incompletos y pruebas insuficientes | Harness PASS/FAIL/UNKNOWN/BLOCKED/INVALID/N/A; controles positivos/negativos | Incorporado |
| DeepSeek | fd identity no equivale a name identity | Modelo de identidad y P07-11/P07-15 | Incorporado |
| DeepSeek | inode reutilizable; dev/inode no es identidad eterna | Mantener descriptor/contexto; no usar como identidad eterna | Incorporado |
| DeepSeek | SIGKILL no libera si sobreviven referencias | P07-13 incluye duplicados/herencia/transferencia | Incorporado |
| DeepSeek | SIGSTOP no libera lock | P07-14 corrige el claim de inaccesibilidad | Incorporado |
| DeepSeek | F_SETLK y OFD tienen ciclos de vida diferentes | P07-17 los separa; cerrar otro fd puede liberar locks F_SETLK del proceso | Incorporado |
| Qwen V2 | P07-A fusionaba aliases por dev/inode | Requiere política de dominio; symlink/bind/hardlink separados | Corregido |
| Qwen V2 | Tamaño cero como tipo inválido e incluido en identidad | Tamaño es atributo mutable; validez según contrato de contenido | Corregido |
| Qwen V2 | Verificación inmediata antes de unlink como protección | Sigue siendo TOCTOU; oráculo INVALID | Corregido |
| Qwen V2 | EPERM/EACCES interpretados como seccomp | Clasificación sin inferencia; SIGSYS en hijo desechable | Corregido |
| Qwen V2 | filesystem esperado ext4/f2fs y kernel esperado como abort fijo | No imponer versión/FS sin requisito; reevaluar compatibilidad real | Corregido |
| Qwen V2 | EACCES previo en linkat generalizado | No descartar hardlinks sin causa/fingerprint | Corregido |
| Qwen V2 | P08 referido sin contrato | No crear dependencia P08; verificar mapa canónico P03/P04/P05/P07/P09 | Pendiente de reconciliación documental externa |

### 1.1 Hallazgos que no deben perderse

- P07-05/06 no pueden declarar PASS porque una segunda comprobación de inode ocurrió justo antes de unlink.
- Una prueba de detección de sustitución no es una prueba de prevención.
- Una prueba de lock cooperativo no demuestra que un writer directo esté bloqueado.
- Un process crash no demuestra power-loss durability.
- EACCES/EPERM no identifican por sí solos seccomp.
- Una prueba sin intercalación real no demuestra ausencia de TOCTOU.
- No existe evidencia actual para afirmar que openat2/renameat2 están bloqueadas en el POCO.
- No hay selección B+C: sigue siendo candidato de investigación del documento comparativo, no decisión.

## 2. Matriz de evaluación de primitivas

No usar una sola categoría A/B/C para resumir tres preguntas distintas. Registrar por separado:

- **Disponibilidad:** la syscall/API existe y se puede invocar en el target.
- **Semántica:** se observó que se comporta como requiere el contrato en el contexto probado.
- **Suficiencia:** la propiedad P07 queda satisfecha bajo el modelo R1 y la cobertura P09.

| Primitiva | Disponibilidad target | Semántica relevante | Suficiencia P07 |
|---|---|---|---|
| `openat` | UNKNOWN hasta prueba | Resolución relativa a dirfd; no congela nombre final tras abrir | Parcial; no resuelve cleanup |
| `openat2` | UNKNOWN; no inferir bloqueo | Puede restringir resolución según flags/kernel | No basta para compare-and-unlink |
| `O_NOFOLLOW` | Node flag documentado; target por probar | Protege componente final de apertura | Parcial |
| `O_DIRECTORY` | Node flag documentado; target por probar | Valida directorio abierto | Parcial; no demuestra raíz autorizada |
| `O_EXCL` | Node flag documentado; target por probar | Exclusividad de creación bajo semántica aplicable | Solo creación |
| `fstat` | Node API disponible; target por probar | Metadata del objeto fd | Identidad puntual, no path actual |
| `stat/lstat` | Node API disponible; target por probar | Observación de nombre/enlace en instante | No elimina TOCTOU |
| `flock` | Binding/API concreta UNKNOWN | Advisory; asociado a open file description en Linux | Coordinación cooperativa, no fencing |
| `F_SETLK` | Bionic/binding UNKNOWN | Locks de proceso; cierre de cualquier fd del proceso para el archivo puede liberar locks | Coordinación cooperativa, ciclo de vida delicado |
| `F_OFD_SETLK` | Bionic/binding UNKNOWN | Lock asociado a open file description; kernel/ABI deben comprobarse | Coordinación cooperativa, no fencing |
| `rename/renameat` | API/syscall target por probar | Atomicidad de cambio de nombre bajo condiciones aplicables | Visibilidad, no identidad condicional |
| `renameat2` | UNKNOWN | Flags específicos y syscall deben verificarse | No resuelve por sí sola identidad del source |
| `unlink/unlinkat` | API/syscall target por probar | Elimina nombre resuelto al ejecutar | No compare-and-unlink |
| `link/linkat` | UNKNOWN; EACCES previo sin causa | Hardlink sujeto a FS/permisos/política | No compare-and-unlink |
| `fsync(file)` | UNKNOWN target | Solicita sincronización del objeto/archivo | No persiste por sí solo la entrada del directorio |
| `fsync(dir)` | UNKNOWN target | Puede solicitar persistencia de metadata de directorio | No prueba pérdida de energía física |

### 2.1 Clasificación de errores

| Resultado | Interpretación permitida | No inferir |
|---|---|---|
| `ENOSYS` | syscall no implementada/no disponible en ese entorno | bloqueo seccomp |
| `EINVAL` | argumento/flag/tamaño/operación no aceptado en ese contexto | syscall universalmente ausente |
| `EPERM` | operación denegada por política/permisos/contexto | seccomp sin evidencia adicional |
| `EACCES` | acceso denegado | hardlinks no soportados en todos los casos |
| `ELOOP` | límite de symlink/resolución alcanzado según operación | que O_NOFOLLOW cubra todos los componentes |
| `ENOENT` | nombre no encontrado en esa observación | que un owner ilegible esté ausente |
| `ENOTDIR` | componente requerido como directorio no lo es | sustitución maliciosa sin más evidencia |
| `EBADF` | descriptor inválido/no apto para operación | que fsync de directorio sea universalmente imposible |
| `SIGSYS` | proceso recibió señal por política/acción asociada a syscall | errno específico; no continuar en proceso principal |
| `EINTR` | operación interrumpida; resultado según API/semántica concreta | operación no ejecutada o ejecutada sin reconciliación |

No mapear errores de forma genérica. Cada test registra operación exacta, flags, errno/señal, kernel, FS y precondiciones.

## 3. Protocolo de evidencia por fases

Este protocolo define cómo podría evaluarse P07 después de autorización específica. No es autorización para ejecutar comandos ahora.

### Fase 0 — Identidad del harness y fixture

1. Crear fixture independiente bajo directorio privado temporal de Termux.
2. Confirmar que ningún path/descriptor apunta a Continuity real.
3. Registrar SHA del harness, Node, ABI, Android build y fecha/hora.
4. Definir centinelas originales/sustitutos y hashes.
5. Establecer barreras reproducibles entre procesos.
6. Preparar limpieza segura: si atribución falla, no borrar; dejar fixture para inspección y marcar UNKNOWN/STOP.

### Fase 1 — Fingerprint del entorno

Capturar sin modificar archivos productivos:
- modelo/build Android y API;
- kernel exacto;
- ABI/arquitectura;
- versión Termux y Node;
- UID/GID efectivos y permisos del directorio fixture;
- filesystem/mount del directorio fixture y del HOME cuando sea observable;
- SELinux mode solo si herramienta disponible; no afirmar política completa;
- versión/huella de harness.

No exigir ext4/f2fs por suposición. Si el filesystem es distinto, caracterizarlo y reevaluar semánticas requeridas. Un kernel distinto de cualquier versión esperada produce reevaluación, no aborto automático.

### Fase 2 — Disponibilidad

- Probar primero APIs/flags inocuos en fixture.
- Syscalls que podrían generar SIGSYS solo en proceso hijo desechable.
- No asumir que header, constante Node o Bionic exportan prueba de syscall efectiva.
- No usar fallback silencioso.
- Si la operación no está disponible, registrar disponibilidad como NO DEMOSTRADA/NO DISPONIBLE en ese target; no inferir causa si errno no la determina.

### Fase 3 — Semántica

Ejecutar escenarios aplicables P07-01…04, 08, 10…18, 20…22 con barreras y procesos separados cuando corresponda. Distinguir:
- fd duplicado/heredado vs open independiente;
- flock vs F_SETLK vs OFD;
- SIGSTOP vs SIGKILL;
- symlink final vs intermedio;
- stat de nombre vs fstat de descriptor;
- archivo vs directorio fsync.

### Fase 4 — Sustitución/cleanup

P07-05/06/07/16/18/19 son bloqueantes para P07-C. Solo se aceptan PASS si:
- hay control positivo;
- sustitución está realmente intercalada en el punto previsto;
- centinela permanece intacto;
- objeto afectado se atribuye a la operación;
- no se usa una comparación inmediatamente antes de unlink como sustituto de atomicidad;
- si la primitiva no existe, el resultado es UNKNOWN/BLOCKED y no se ejecuta cleanup destructivo.

### Fase 5 — Publicación/persistencia

P07-09/20 separan:
- escritura completa;
- fsync de archivo;
- rename;
- fsync de directorio;
- crash del proceso;
- reinicio;
- pérdida de energía.

Una prueba de process crash puede observar recuperación del proceso, no power loss. No reclamar durabilidad física sin evidencia específica del hardware/filesystem.

### Fase 6 — Revisión de suficiencia

La evaluación final no suma PASS de primitivas. Debe responder por propiedad:
- A: raíz/aliases y contexto de resolución.
- B: tipo e identidad del destino.
- C: vinculación de operación/cleanup.
- D: creación, coordinación, visibilidad y persistencia.
- E: actores/permisos bajo R1.
- P05: release/readmisión.
- P09: callers/writers cubiertos.

Una propiedad permanece UNKNOWN si alguna dependencia crítica sigue sin resolver.

## 4. Clasificación de lo demostrable en POCO X7 Pro

### 4.1 Perfil conocido por contexto anterior; no revalidado en esta consolidación

- POCO X7 Pro, Android 16/API 36.
- Termux F-Droid 0.119.0-beta.3.
- Node v26.4.0.
- Arquitectura ARM64/rodin reportada previamente.
- Kernel exacto, filesystem efectivo del directorio de trabajo y disponibilidad syscall: no revalidados aquí.

Estos datos son contexto previo, no fingerprint de una ejecución P07 V2.1.

### 4.2 Posiblemente demostrable con fixture temporal y autorización

- disponibilidad/errores de APIs y syscalls inocuas;
- O_NOFOLLOW final vs intermedio;
- fstat(fd) vs stat(path);
- locks multiproceso y diferencias de ciclo de vida;
- rename/visibilidad en FS concreto;
- fsync de archivo/directorio como operación invocable;
- detección de sustitución;
- comportamiento de cleanup del harness en fixture controlada.

### 4.3 No demostrado por pruebas sin privilegios o sin infraestructura especial

- durabilidad física ante pérdida de energía;
- política SELinux completa;
- cambios de ownership que requieran privilegios;
- bind mounts si el proceso no puede observarlos/crearlos;
- aislamiento contra procesos hostiles del mismo UID (fuera del claim R1);
- enforcement contra root/OS comprometido;
- ausencia universal de writers externos.

No clasificar automáticamente como imposible todo bind mount: la capacidad de observarlo depende del entorno y de interfaces disponibles. Si no se puede observar, UNKNOWN/NOT_APPLICABLE según el escenario.

## 5. Puertas de decisión

No seleccionar mecanismo hasta:
1. P07 V2.1 revisada y ratificada en lo que corresponda.
2. Fingerprint real del entorno.
3. Disponibilidad y semántica probadas de cada primitiva necesaria.
4. Diseño de cleanup que satisfaga P07-C bajo R1, o declaración explícita de que P07-C no puede cerrarse con las opciones disponibles.
5. P05 define release/readmisión ante UNKNOWN.
6. P09 demuestra cobertura de callers/writers del alcance.
7. No existe fallback silencioso a una garantía inferior.

El candidato dirfd/openat2 + lock de kernel por descriptor continúa siendo **candidato de investigación**, no selección. No resuelve automáticamente cleanup replacement-safe.

## 6. Estado de la evidencia

| Elemento | Estado |
|---|---|
| P07 V2.1 documental | Propuesta consolidada, pendiente de ratificación |
| Matriz P07-01…22 | Diseñada; no ejecutada |
| Harness | No implementado |
| Fingerprint POCO para esta revisión | No revalidado |
| Disponibilidad de primitivas | UNKNOWN hasta prueba específica |
| Semántica en FS objetivo | UNKNOWN hasta prueba específica |
| Suficiencia P07-A…E | No establecida |
| P07-C | UNKNOWN / bloqueante |
| P05 | OPEN; C no ratificada |
| P09 | OPEN / UNKNOWN |
| Mecanismo | Ninguno seleccionado |
| Runtime/tests/workflows/dispositivo | Sin cambios |
| NCS M0 | INCOMPLETO |

## 7. Registro de no ejecución

Esta consolidación se realizó mediante lectura documental y escritura de documentos en GitHub. No se ejecutaron:
- comandos Termux;
- pruebas P07;
- harnesses;
- tests Node/npm;
- CI/GitHub Actions;
- syscalls de capacidad;
- bootstrap/publicación;
- operaciones sobre `$HOME/.nexo-continuity.json`.

