# NCS M0 — Viabilidad de plataforma Android/Termux para P05-C y P07-C
## Investigación técnica documental de Gemini
**Fecha del informe:** 2026-11-10  
**Autor/fuente:** Gemini  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama de investigación:** `ncs-m0-architecture-research-2026-11-10`  
**Estado del hito según Gemini:** M0 PERMANECE ABIERTO

---

## 1. Propósito y alcance

Este documento consolida la investigación técnica documental entregada por Gemini sobre las capacidades y restricciones de Android/Linux/Termux relevantes para los componentes P05-C y P07-C de NCS M0.

El alcance es la semántica de descriptores, concurrencia, procesos, persistencia, suspensión, aislamiento local y operación sin root dentro del entorno Android/Termux descrito bajo R1.

La investigación es documental. No constituye selección de tecnología, implementación, ejecución de pruebas, verificación del dispositivo, ratificación de decisiones ni declaración de cumplimiento de P05-C/P07-C.

## 2. Descriptores de archivo y procesos

Gemini describe la semántica Linux de los descriptores y de las descripciones de archivo abiertas (`struct file` / open file descriptions):

- `dup()` crea otro descriptor que referencia la misma descripción de archivo abierta.
- Tras `fork()`, los descriptores heredados del proceso hijo siguen referenciando las mismas descripciones de archivo abiertas, con offsets compartidos.
- `execve()` conserva los descriptores que no tengan configurado close-on-exec.
- `O_CLOEXEC` permite configurar close-on-exec desde la apertura, evitando la ventana de carrera asociada a configurar el atributo después.
- Los descriptores pueden transferirse entre procesos mediante sockets Unix (`AF_UNIX`) y `SCM_RIGHTS`; Gemini indica que esta capacidad está soportada por Android Bionic.
- La transferencia de un descriptor transmite una referencia al objeto abierto; no equivale a copiar un archivo independiente.

La semántica compartida de la descripción abierta explica por qué `dup()`/`fork()` conservan offsets compartidos. También significa que la gestión de la vida útil de los descriptores y de los procesos que los heredan o reciben forma parte del análisis de concurrencia.

## 3. Terminación abrupta, suspensión y procesos Android

Gemini identifica los siguientes comportamientos y restricciones:

- `SIGKILL`, OOM y mecanismos Android como `lmkd` o Phantom Process Killer pueden terminar procesos abruptamente.
- Los búferes mantenidos únicamente en espacio de usuario se pierden si el proceso termina antes de persistirlos.
- Doze y la congelación/suspensión de procesos pueden interrumpir la continuidad temporal de una operación; el software debe contemplar reanudación y reconexión activa.
- La investigación recomienda asumir saltos discretos de tiempo y utilizar `CLOCK_MONOTONIC` para mediciones temporales, sin tratar el tiempo como prueba de identidad o autorización.
- En un escenario multihilo, después de `fork()` el proceso hijo debe evitar funciones que no sean async-signal-safe antes de `execve()`; en particular, no debe invocar asignación dinámica ni adquirir locks potencialmente heredados en estado bloqueado.

## 4. Bloqueos de archivo

Gemini distingue tres mecanismos:

- **Bloqueos POSIX tradicionales de `fcntl`:** asociados al proceso y con semánticas de liberación que pueden provocar liberación no intuitiva al cerrar descriptores del mismo archivo.
- **Bloqueos OFD (`F_OFD_SETLK`):** asociados a la descripción de archivo abierta, no al PID; Gemini los recomienda para el caso de concurrencia interproceso cooperativa.
- **`flock`:** mecanismo de bloqueo distinto, cuya semántica debe evaluarse separadamente.

Gemini señala que los bloqueos de archivo son advisory: un proceso no cooperativo puede ignorarlos y escribir igualmente. Por ello, un bloqueo OFD no es por sí mismo una frontera de seguridad frente a escritores que no respetan el protocolo.

La investigación también advierte que no deben asumirse bloqueos obligatorios como mecanismo disponible: los mandatory locks fueron eliminados de Linux 5.15 en adelante, según la exposición de Gemini.

## 5. Persistencia, atomicidad y recuperación ante fallos

Gemini considera viable con restricciones la persistencia frente a terminaciones abruptas mediante el patrón:

`write → fsync(file) → rename → fsync(dir)`

La secuencia descrita implica:

1. Escribir el contenido en un archivo temporal.
2. Sincronizar el contenido del archivo mediante `fsync(file_fd)`.
3. Renombrar el archivo temporal a su destino mediante `rename()`.
4. Sincronizar el directorio que contiene el cambio mediante `fsync(dir_fd)`.

Gemini indica que `rename(2)` es atómico para el cambio de nombre dentro del mismo punto de montaje, citando ext4/f2fs como sistemas de archivos locales pertinentes en Android. La atomicidad del rename no debe confundirse con durabilidad: la sincronización del archivo y del directorio es parte del patrón propuesto.

La investigación considera inadecuadas las escrituras directas in-place para el objetivo de persistencia estricta. También señala que evitar buffers C/stdio y usar llamadas de sistema directas como `write(2)` y `fsync(2)` reduce el riesgo de perder datos que permanezcan únicamente en buffers de usuario.

El patrón no protege frente a manipulación local directa, operaciones que no hayan sido sincronizadas, ni frente a datos que solo existan en RAM. Tampoco demuestra resistencia a rollback coherente de todo el dominio de persistencia.

## 6. Aislamiento Android y entorno sin root

Gemini describe el sandbox Android como aislamiento basado en UID y SELinux:

- Las aplicaciones Android de otros UID están aisladas por el sandbox.
- Los procesos y subprocesos ordinarios de Termux comparten el UID y dominio de seguridad de Termux; por tanto, no existe aislamiento fuerte entre procesos del mismo entorno únicamente por estar separados en procesos.
- Otros procesos del mismo UID pueden, según las condiciones de permisos y acceso, inspeccionar, terminar o modificar recursos de otros procesos del mismo entorno.
- ADB/propietario del dispositivo queda fuera de la frontera de aislamiento que Gemini considera.
- El almacenamiento compartido como `/sdcard` tiene restricciones y semánticas FUSE; Gemini recomienda mantener los archivos críticos en el HOME privado de Termux.
- El entorno sin root puede utilizar las APIs Unix públicas permitidas por el sandbox `untrusted_app`, pero no obtiene por ello autoridad sobre el kernel ni control frente al propietario/ADB.
- Android puede terminar procesos; la persistencia exige sincronización explícita.

La clasificación de Gemini es que la operación sin root es viable dentro de las APIs permitidas por el sandbox, pero el aislamiento local frente a otros procesos del mismo UID no queda garantizado.

## 7. Crash consistency y combinación de mecanismos

Gemini presenta la combinación de WAL/archivo temporal, sincronización explícita, rename y bloqueos OFD como un patrón viable con restricciones para consistencia ante fallos de proceso.

La combinación no elimina las limitaciones ya descritas:

- Los bloqueos OFD dependen de cooperación de los participantes.
- Los descriptores pueden heredarse o transferirse.
- Los procesos pueden terminar abruptamente.
- Los datos no sincronizados pueden perderse.
- Los mecanismos de archivo no impiden por sí solos la manipulación directa por procesos con permisos suficientes dentro del mismo entorno.
- La sincronización y atomicidad de un archivo/directorio no equivalen a una ancla independiente contra rollback.

## 8. Matriz de viabilidad para criterios de evaluación (CE) y obligaciones (O1–O9)

La siguiente matriz conserva las clasificaciones y justificaciones entregadas por Gemini.

| Criterio / obligación | Descripción resumida | Estado de viabilidad | Restricción técnica / justificación de Gemini |
|---|---|---|---|
| CE-1 | Concurrencia segura interproceso/hilo | VIABLE CON RESTRICCIONES | Viable usando exclusivamente `F_OFD_SETLK`. Inviable usar `fcntl` tradicional por peligro de liberación silenciosa al cerrar un descriptor. |
| CE-5 | Persistencia atómica ante fallos abruptos (SIGKILL/OOM) | VIABLE CON RESTRICCIONES | Requiere el patrón estricto `write → fsync(file) → rename → fsync(dir)`. Inviable mediante escrituras directas in-place. |
| CE-7 | Aislamiento y protección local de estado | PARCIALMENTE VIABLE | Protegido contra apps Android de otros UID. No aislable contra otros procesos dentro de Termux ni contra ADB/propietario. |
| O1 | Sincronización de descriptores abiertos | VIABLE | La semántica de `struct file` del kernel retiene los offsets compartidos tras `dup/fork`. |
| O2 | Limpieza y cierre seguro vía `O_CLOEXEC` | VIABLE | Implementado nativamente por el kernel Linux. |
| O3 | Transferencia segura de descriptor vía `SCM_RIGHTS` | VIABLE | Sockets Unix (`AF_UNIX`) nativamente soportados en Android Bionic. |
| O4 | Inmunidad a interbloqueos en fork multihilo | VIABLE CON RESTRICCIONES | El proceso debe evitar invocar funciones de asignación dinámica o locks entre `fork` y `execve()` (async-signal safety). |
| O5 | Tolerancia a suspensión de CPU / Doze Mode | VIABLE CON RESTRICCIONES | El software debe asumir saltos discretos de tiempo (`CLOCK_MONOTONIC`) y reconexión activa. |
| O6 | Evitar pérdida de datos por búferes de espacio de usuario | VIABLE | Evitar buffers C/stdio para persistencia estricta; usar llamadas a sistema directas `write(2)` y `fsync(2)`. |
| O7 | Bloqueo estricto contra lecturas/escrituras sucias | VIABLE CON RESTRICCIONES | Vía `F_OFD_SETLK` entre procesos cooperativos. Los procesos no cooperativos pueden ignorarlo (advisory). |
| O8 | Atomicidad de mutación de directorio/archivos | VIABLE | `rename(2)` es atómico en ext4/f2fs local en el mismo punto de montaje. |
| O9 | Operación garantizada en entorno sin root | VIABLE | Todo el diseño se restringe formalmente a las APIs Unix públicas permitidas por el sandbox SELinux `untrusted_app`. |

## 9. Estado del hito M0

**Declaración de Gemini:** Este documento constituye la investigación técnica documental requerida sobre las capacidades de la plataforma Android/Termux.

**AVISO DE ESTADO: M0 PERMANECE ABIERTO.**

Gemini no ejecuta selección de tecnología ni declaración de cierre por parte de Gemini.

## 10. Límites de interpretación para el expediente NCS

Esta entrega debe conservarse como investigación de plataforma, no como evidencia de implementación o aceptación:

- Las etiquetas VIABLE / VIABLE CON RESTRICCIONES / PARCIALMENTE VIABLE son evaluaciones documentales de Gemini.
- La matriz no demuestra que las obligaciones O1–O9 estén implementadas o satisfechas en el repositorio o dispositivo objetivo.
- La viabilidad de mecanismos de Linux/Android no demuestra que el diseño NCS actual los utilice correctamente ni que todos los escritores estén sometidos a ellos.
- En particular, la clasificación advisory de OFD locks no demuestra exclusión frente a procesos no cooperativos del mismo UID.
- El patrón de persistencia descrito no demuestra resistencia a rollback coherente ni proporciona por sí mismo un ancla independiente.
- La capacidad de operar sin root no equivale a aislamiento frente al propietario/ADB ni frente a otros procesos del mismo UID.
- No se elige `F_OFD_SETLK`, WAL, ext4/f2fs, un mecanismo de ancla ni una arquitectura como decisión de propietario.
- No se declara P05-C o P07-C satisfecho, no se ratifica ningún cambio a R1 y no se autoriza implementación, pruebas, ejecución en Termux/dispositivo ni efectos protegidos.

**Clasificación para el expediente:** INVESTIGACIÓN DOCUMENTAL RECIBIDA. P05 OPEN. P07-C UNKNOWN/BLOCKING. M0 INCOMPLETE.
