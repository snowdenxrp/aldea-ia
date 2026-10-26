# Revisión externa — Garantías de persistencia y durabilidad para Nexo/NCS (2026-10-26)

## Estado del documento

- Tipo: revisión técnica externa e independiente (Perplexity Computer), solo documental.
- Alcance: lectura de código y de fuentes primarias publicadas. Runtime, tests, workflows, CI, ramas, APK y dispositivo: **sin cambios**.
- Tests/CI/scripts: **no ejecutados**.
- Decisión de implementación: **ninguna**. Este documento no autoriza cambios de runtime ni propone una arquitectura definitiva; entrega evidencia para que el propietario decida.
- Documento de contexto: [`NEXO_NCS/BUILD/NCS_M0_OPTION_C_WRITER_EXCLUSION_FEASIBILITY_2026-10-26.md`](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/NEXO_NCS/BUILD/NCS_M0_OPTION_C_WRITER_EXCLUSION_FEASIBILITY_2026-10-26.md) (blob `8829490cb1c8b8471ed5d192754bf84f09c2718c`).

## Pregunta central

¿Qué garantías pueden establecerse realmente para una persistencia basada en escritura de archivo temporal y `rename()`, control de revisión y bloqueo cooperativo, y cuáles no pueden afirmarse sin mecanismos o pruebas adicionales?

Escenarios de fallo distinguidos:

- **F1**: fallo del proceso (crash, `kill -9`, excepción no capturada). El kernel y el sistema de archivos siguen funcionando.
- **F2**: caída del sistema operativo o del sistema (kernel panic, reinicio forzado) con el dispositivo de almacenamiento todavía alimentado.
- **F3**: pérdida de energía o fallo del almacenamiento (incluye la caché volátil del dispositivo y errores de escritura del medio).

## Respuesta corta

Con el código actual (temporal + `rename()` + comprobación de revisión + bloqueo cooperativo, **sin `fsync`**), solo puede afirmarse **visibilidad atómica frente a F1** en un sistema de archivos local POSIX, **entre escritores cooperantes**. Para F2 y F3, `COMMIT.COMMITTED` no implica durabilidad, y el bloqueo no protege contra escritores no cooperantes.

## Revisión inspeccionada

La rama `ncs-clean-architecture` ya no apuntaba a `325d004c8f89e1ec25d9253bc7918a52d2351349` (HEAD citado en una revisión anterior). Se inspeccionó:

- Commit: `ad0fae27ae39cd78ffa42607b9c301d238e59246` (2026-10-26T18:08:39Z, mensaje: `docs(ncs): link independent AI review orders in status`).

| Archivo | Blob | Enlace |
|---|---|---|
| `NEXO_NCS/BUILD/NCS_M0_OPTION_C_WRITER_EXCLUSION_FEASIBILITY_2026-10-26.md` | `8829490cb1c8b8471ed5d192754bf84f09c2718c` | [ver](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/NEXO_NCS/BUILD/NCS_M0_OPTION_C_WRITER_EXCLUSION_FEASIBILITY_2026-10-26.md) |
| `scripts/simulate.mjs` | `1b5e39b681486f583c1779770c52dd913227dfa1` | [L214-L257](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/scripts/simulate.mjs#L214-L257) |
| `src/nexo/adapters/conditional-commit-persist-state.mjs` | `d6dc517f9c7841a957749804d612fbfe6e66c9a6` | [L51-L71](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/src/nexo/adapters/conditional-commit-persist-state.mjs#L51-L71) |
| `src/nexo/core/protected-transition.mjs` | `39a602b80cda8f3939b2ffed7e726d06c21b077f` | [L188-L238](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/src/nexo/core/protected-transition.mjs#L188-L238) |
| `scripts/assistants.mjs` | (no registrado) | [L106](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/scripts/assistants.mjs#L106) |
| `src/nexo/core/contracts.mjs` | (no registrado) | [ver](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/src/nexo/core/contracts.mjs) |

Auditorías P112 referenciadas por el documento de contexto (existencia comprobada en el commit, contenido no revisado en esta revisión):

- [`NEXO_CONTINUITY/P112_PERSISTENCE_PRIMITIVE_CRASH_CUT_AUDIT_V1_2026-10-07.md`](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/NEXO_CONTINUITY/P112_PERSISTENCE_PRIMITIVE_CRASH_CUT_AUDIT_V1_2026-10-07.md)
- [`NEXO_CONTINUITY/P112_LOCAL_JOURNAL_VS_STORAGE_DURABILITY_AUDIT_V1_2026-10-07.md`](https://github.com/snowdenxrp/aldea-ia/blob/ad0fae27ae39cd78ffa42607b9c301d238e59246/NEXO_CONTINUITY/P112_LOCAL_JOURNAL_VS_STORAGE_DURABILITY_AUDIT_V1_2026-10-07.md)

## Lo que hace el código (hechos observados por lectura)

Todas las líneas se refieren a `scripts/simulate.mjs` en el commit `ad0fae27`, salvo indicación contraria.

1. **Constantes del bloqueo**: `STATE_LOCK_RETRY_MS = 10` (L17) y `STATE_LOCK_STALE_MS = 60_000` (L18).
2. **Normalización de ruta**: `normalizePersistencePath()` (L20 y siguientes) acepta una ruta nativa absoluta (`string`) o una `URL` con protocolo `file:`; rechaza rutas vacías o relativas.
3. **Ruta del bloqueo**: `lockPathFor(statePath)` devuelve `${statePath}.lock` (L42-44).
4. **Comprobación de vida del dueño**: `processIsAlive(pid)` usa `process.kill(pid, 0)`; considera vivo el proceso si no hay error o si el error es `EPERM` (L46-49).
5. **Adquisición del bloqueo** (`acquireStateLock`, L55-82):
   - `fs.mkdir(lockPath)` (L61) y después `fs.writeFile(path.join(lockPath, "owner.json"), ...)` con `{ pid, token, createdAt }` (L62).
   - Liberación: lee `owner.json` y solo borra el directorio si el `token` coincide (L63-66).
   - Si `mkdir` falla con `EEXIST`: lee el dueño, calcula la antigüedad por `mtimeMs` del directorio (L69-71) y considera el bloqueo abandonado si `lockAge > 60 s` y el PID no está vivo, o si no hay dueño legible y `lockAge > 60 s` (L72-74). En ese caso lo borra con `fs.rm(..., { recursive: true, force: true })` y reintenta (L75-77); si no, espera 10 ms (L79).
6. **Lectura de estado tolerante** (`loadState`, L160-183): cualquier error de lectura o de `JSON.parse` se captura (`} catch {}`, L181) y se devuelve un estado por defecto con `stateRevision: 0` (L182).
7. **`persistState()`** (L214-257):
   - Normaliza la ruta (L215) y adquiere el bloqueo (L216).
   - Si `expectedRevision !== null`, lee el estado actual con `loadCurrentState` (por defecto `loadState`, no `loadStateStrict`) (L219) y lanza `STATE_REVISION_CONFLICT` si la revisión difiere (L221-225).
   - Borra todos los archivos vecinos cuyo nombre empiece por `<state>.tmp-` (L239-243, errores ignorados).
   - Escribe el temporal `<state>.tmp-<pid>-<ms>-<seq>` con `writeFile` (L244-246) y hace `rename(tempPath, normalizedStatePath)` (L247).
   - Si falla `writeFile` o `rename`, borra el temporal y relanza (L248-251).
   - `releaseLock()` está en `finally` (L254).
   - **No hay `fsync`/`fdatasync`/`FileHandle.sync()` del temporal ni del directorio** en ningún punto de la primitiva.
8. **Otros escritores que usan la misma primitiva**: `scripts/simulate.mjs` L274 y `scripts/assistants.mjs` L106 invocan `persistState()` con `expectedRevision`.
9. **Adaptador** (`src/nexo/adapters/conditional-commit-persist-state.mjs`):
   - Exige `statePath` de tipo `string` no vacío (L37).
   - Llama a `persistState(statePath, candidate.state, clock(), { expectedRevision, stateRevision: expectedRevision + 1 })` (L52-60).
   - Si no hay excepción → `COMMIT.COMMITTED` (L61).
   - Si `error.code === "STATE_REVISION_CONFLICT"` → `COMMIT.CONDITIONAL_CONFLICT` (L63-66).
   - Cualquier otra excepción → `COMMIT.UNKNOWN` con `errorCode` del error o `PERSISTENCE_UNKNOWN` (L68-70).
   - Consecuencia directa de L254 + L68-70: si `releaseLock()` lanza después de un `rename()` exitoso, el adaptador devuelve `COMMIT.UNKNOWN` aunque el reemplazo ya sea visible.
10. **Clasificación en Core** (`src/nexo/core/protected-transition.mjs`):
    - `SAFE_COMMIT` se construye antes de mutar (L188-190).
    - Excepción del puerto o resultado malformado → `RECONCILE_REQUIRED` (L193-222).
    - `COMMIT.COMMITTED` → `SAFE_COMMIT` (L224-226).
    - `COMMIT.CONDITIONAL_CONFLICT` → `STALE_CANDIDATE` (L228-232).
    - `COMMIT.UNKNOWN` → `RECONCILE_REQUIRED` (L234-238).
    - Cualquier otro estado válido (p. ej. `FAILED`) → `OUTCOMES.UNKNOWN` (L240-242).
11. **Estados del contrato**: `COMMIT_STATES = ["COMMITTED", "CONDITIONAL_CONFLICT", "FAILED", "UNKNOWN"]` (`contracts.mjs` L11).

## Fuentes primarias consultadas

| Tema | Fuente | Cita breve |
|---|---|---|
| Atomicidad de `rename` (POSIX) | [POSIX.1-2024 `rename()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html) | «a directory entry named *new* shall remain visible to other threads throughout the renaming operation and refer either to the file referred to by *new* or *old* before the operation began»; Rationale: «requires that the action of the function be atomic». No menciona durabilidad. |
| `rename` entre sistemas de archivos | [POSIX `rename()`, ERRORS](https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html) | «[EXDEV] … are on different file systems». |
| Atomicidad de `rename` (Linux) | [Linux `rename(2)`](https://man7.org/linux/man-pages/man2/rename.2.html) | «If *newpath* already exists, it will be atomically replaced, so that there is no point at which another process attempting to access *newpath* will find it missing»; «there will probably be a window in which both *oldpath* and *newpath* refer to the file being renamed». |
| `rename` en NFS | [Linux `rename(2)`, BUGS](https://man7.org/linux/man-pages/man2/rename.2.html) | «On NFS filesystems, you can not assume that if the operation failed, the file was not renamed». |
| Semántica de `fsync` (POSIX) | [POSIX `fsync()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/fsync.html) | «The nature of the transfer is implementation-defined»; «It is explicitly intended that a null implementation is permitted»; «fsync() might or might not actually cause data to be written where it is safe from a power failure»; «If the fsync() function fails, outstanding I/O operations are not guaranteed to have been completed». |
| `fsync` de directorio (POSIX) | [POSIX `fsync()`, APPLICATION USAGE](https://pubs.opengroup.org/onlinepubs/9799919799/functions/fsync.html) | «can invoke fsync() on the directory to ensure that the directory's entries and file attributes are synchronized»; «For most applications, synchronizing the directory's entries should not be necessary». |
| Caché del sistema de archivos | [POSIX XBD 4.11 File System Cache](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html) | «Cache entries shall be transferred to the underlying storage as the result of successful calls to fdatasync(), fsync()…, and may be transferred … at other times»; «If the system crashes before the cache is fully transferred, later operations' effects may be present in storage with earlier effects missing». |
| Visibilidad de `write` | [POSIX `write()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/write.html) | «Any successful read() from each byte position in the file that was modified by that write shall return the data specified by the write()…». |
| `fsync` de directorio (Linux) | [Linux `fsync(2)`](https://man7.org/linux/man-pages/man2/fsync.2.html) | «Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk. For that an explicit fsync() on a file descriptor for the directory is also needed». |
| Caché del disco (Linux) | [Linux `fsync(2)`](https://man7.org/linux/man-pages/man2/fsync.2.html) | «This includes writing through or flushing a disk cache if present»; HISTORY: «older kernels and lesser used filesystems do not know how to flush disk caches». |
| Errores de `fsync` (Linux) | [Linux `fsync(2)`, ERRORS](https://man7.org/linux/man-pages/man2/fsync.2.html) | «EIO … This error may relate to data written to some other file descriptor on the same file». |
| Reintento de `fsync` | [PostgreSQL wiki, Fsync Errors](https://wiki.postgresql.org/wiki/Fsync_Errors) | Linux 4.14 y ≥4.16: «you still only get the error once (so retrying fsync() is not OK)»; «buffers are still thrown away … so you might read back an older version of the page than you most recently wrote». |
| `fsync` en macOS | [Apple `fsync(2)`](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/fsync.2.html) | «the drive itself may not physically write the data to the platters for quite some time»; «the application may find that only some or none of their data was written»; «Mac OS X provides the F_FULLFSYNC fcntl». |
| `fs.fsync` de Node en Unix/macOS | [libuv `src/unix/fs.c`](https://github.com/libuv/libuv/blob/v1.x/src/unix/fs.c) (rama `v1.x`, commit `338ac6ac0714e6d8043a2826c9b3bc78e85bb961`) | Comentario en `uv__fs_fsync`: «Apple's fdatasync and fsync explicitly do NOT flush the drive write cache»; usa `fcntl(F_FULLFSYNC)` y recurre a `F_BARRIERFSYNC`/`fsync()`. |
| `fs.rename`/`fs.fsync` de Node en Windows | [libuv `src/win/fs.c`](https://github.com/libuv/libuv/blob/v1.x/src/win/fs.c) (mismo commit) | `fs__rename`: `MoveFileExW(..., MOVEFILE_REPLACE_EXISTING)` (L2341, sin `MOVEFILE_WRITE_THROUGH`); `fs__sync_impl`: `FlushFileBuffers` (L2356). |
| Documentación de Node | [Node.js `fs`](https://nodejs.org/api/fs.html) | `fs.fsync`: «Request that all data for the open file descriptor is flushed to the storage device. The specific implementation is operating system and device specific»; `fs.writeFile`: «It is unsafe to use fs.writeFile() multiple times on the same file without waiting for the callback». No documenta atomicidad de `writeFile` ni `fsync` de directorios. |
| `MoveFileEx` (Windows) | [Microsoft Learn, `MoveFileExA`](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexa) | `MOVEFILE_WRITE_THROUGH`: «The function does not return until the file is actually moved on the disk». La página no menciona atomicidad. |
| `ReplaceFile` (Windows) | [Microsoft Learn, `ReplaceFileA`](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilea) | «combines several steps within a single function»; documenta estados parciales en fallo, p. ej. «the replaced file no longer exists and the replacement file exists under its original name». No declara atomicidad. |
| Semántica POSIX de rename en NTFS | [Microsoft Learn, `FILE_RENAME_INFORMATION`](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntifs/ns-ntifs-_file_rename_information) | `FILE_RENAME_POSIX_SEMANTICS`: «allow replacing a file even if there are existing handles to it». Interfaz de nivel controlador; no es lo que usa libuv. |
| `FlushFileBuffers` (Windows) | [Microsoft Learn, `FlushFileBuffers`](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-flushfilebuffers) | «Flushes the buffers of a specified file and causes all buffered data to be written to a file». |
| ext4 | [Linux kernel docs, ext4](https://docs.kernel.org/admin-guide/ext4.html) | `data=ordered`: «All data are forced directly out to the main file system prior to its metadata being committed to the journal»; `auto_da_alloc`: «detect the replace-via-rename and replace-via-truncate patterns and force that … the data blocks of the new file are forced to disk before the rename() operation is committed»; `barrier`: «making volatile disk write caches safe to use». |
| Debate ext4/rename sin fsync | [LWN, «ext4 and data loss»](https://lwn.net/Articles/322823/) | Problema de «zero-length files» con asignación diferida; comentario: «sometimes it's appropriate to want atomicity without durability». |
| Dependencia del sistema de archivos | [Pillai et al., «All File Systems Are Not Created Equal», OSDI'14](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-pillai.pdf) ([página](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/pillai)) | «these properties vary widely among six popular Linux file systems»; «rename() and link() are seemingly atomic on all file systems that use techniques like journaling or copy-on-write»; «Linux ext2 and btrfs freely reorder directory operations». |
| Supuestos de hardware | [SQLite, Atomic Commit](https://www.sqlite.org/atomiccommit.html) | «often the IDE disk control lies and says that data has reached oxide while it is still held only in the volatile control cache»; «On Unix, the directory that contains the super-journal is also synced». |
| Dispositivos que mienten / bloqueos rotos | [SQLite, How To Corrupt](https://www.sqlite.org/howtocorrupt.html) | «most consumer-grade mass storage devices lie about syncing»; «some filesystems contain bugs in their locking logic … especially true of network filesystems and NFS». |
| Bloqueos advisory | [Linux `fcntl_locking(2)`](https://man7.org/linux/man-pages/man2/fcntl_locking.2.html) | «Advisory locks are not enforced and are useful only between cooperating processes»; «If a process closes any file descriptor referring to a file, then all of the process's locks on that file are released»; NFS: «it is possible that the lock might get lost»; bloqueo obligatorio: «no longer supported at all in Linux 5.15 and above». |
| `flock` | [Linux `flock(2)`](https://man7.org/linux/man-pages/man2/flock.2.html) | «flock() places advisory locks only»; «a process is free to ignore the use of flock() and perform I/O on the file». |
| `mkdir` | [Linux `mkdir(2)`](https://man7.org/linux/man-pages/man2/mkdir.2.html) | «EEXIST *path* already exists (not necessarily as a directory)»; «There are many infelicities in the protocol underlying NFS. Some of these affect mkdir()». La página no declara atomicidad explícitamente. |
| `O_EXCL` y NFS | [Linux `open(2)`](https://man7.org/linux/man-pages/man2/open.2.html) | «In NFS environments where O_EXCL support is not provided, programs that rely on it for performing locking tasks will contain a race condition». |
| Comprobación de PID | [Linux `kill(2)`](https://man7.org/linux/man-pages/man2/kill.2.html) | «If *sig* is 0, then no signal is sent, but existence and permission checks are still performed». No aborda reutilización de PID. |
| Pruebas F3 por reproducción | [Linux kernel docs, dm-log-writes](https://docs.kernel.org/admin-guide/device-mapper/log-writes.html) | «Only completed WRITEs, at the time the REQ_PREFLUSH is issued, are added in order to simulate the worst case scenario with regard to power failures». |
| Inyección de fallos de dispositivo | [Linux kernel docs, dm-flakey](https://docs.kernel.org/admin-guide/device-mapper/dm-flakey.html) | «useful in simulating failing devices for testing purposes»; `drop_writes`: «All write I/O is silently ignored». |

## Matriz de garantías

| Garantía | F1 proceso | F2 SO/sistema | F3 energía/almacenamiento | Condiciones | Fuente primaria | Prueba necesaria |
|---|---|---|---|---|---|---|
| **G1.** `rename()` reemplaza el destino de forma atómica para lectores concurrentes | Sí | No como garantía de durabilidad | No | Mismo sistema de archivos, local y POSIX. Linux advierte de una ventana en la que ambos nombres apuntan al mismo archivo | [POSIX `rename()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html): «shall remain visible… refer either to the file referred to by new or old». [Linux `rename(2)`](https://man7.org/linux/man-pages/man2/rename.2.html): «atomically replaced… no point at which another process… will find it missing». Ninguna habla de durabilidad | Lectores en bucle durante los reemplazos y `kill -9` en cada punto del protocolo. Solo cubre F1 |
| **G2.** Si `rename` devuelve error, el archivo no se renombró | Sí en sistemas locales (inferencia) | Igual | Igual | En NFS no se cumple | [Linux `rename(2)`, BUGS](https://man7.org/linux/man-pages/man2/rename.2.html): «On NFS… you can not assume that if the operation failed, the file was not renamed» | Inyección de fallos en el sistema de archivos de red real, si se usa en producción |
| **G3.** Cuando el nombre nuevo es visible, el contenido del temporal está completo | Sí (las escrituras quedan en la caché del kernel, que sobrevive a la muerte del proceso) | No sin `fsync(tmp)` | No | ext4 tiene una heurística (`auto_da_alloc`) que mitiga esto, pero no es universal ni está garantizada en otros sistemas | [POSIX `write()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/write.html): «Any successful read()… shall return the data». [POSIX XBD 4.11](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html): «later operations' effects may be present… with earlier effects missing». [ext4](https://docs.kernel.org/admin-guide/ext4.html): «auto_da_alloc… detect the replace-via-rename» | F2: reinicio forzado de una VM con el sistema de archivos objetivo. F3: [dm-log-writes](https://docs.kernel.org/admin-guide/device-mapper/log-writes.html) con reproducción del log y verificación del contenido |
| **G4.** Sin `fsync`, el orden «datos y luego rename» se mantiene en disco | No aplica | No garantizado | No garantizado | Depende del sistema de archivos y de sus opciones de montaje | [ALICE, OSDI'14](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-pillai.pdf): «ext2 and btrfs freely reorder directory operations»; las propiedades «vary widely among six popular Linux file systems» | Pruebas de corte de fallo por cada sistema de archivos objetivo (estilo ALICE o dm-log-writes) |
| **G5.** La nueva entrada de directorio sobrevive a un fallo | Sí (visible) | Solo con `fsync` del directorio (Linux) | Solo con `fsync` del directorio y un dispositivo que respete el vaciado de caché | Documentado como necesario en Linux. POSIX solo lo menciona como posibilidad | [Linux `fsync(2)`](https://man7.org/linux/man-pages/man2/fsync.2.html): «does not necessarily ensure that the entry in the directory… For that an explicit fsync() on… the directory is also needed». [SQLite](https://www.sqlite.org/atomiccommit.html) sincroniza el directorio en Unix | dm-log-writes o corte real de energía, comprobando nombre y contenido tras la recuperación |
| **G6.** Un `fsync()` exitoso significa que los datos están en almacenamiento estable | No aplica | Linux: sí, incluido el vaciado de la caché del disco. macOS: no con `fsync` simple | Depende del hardware y firmware | POSIX permite una implementación nula. macOS requiere `F_FULLFSYNC`; libuv lo usa en `fs.fsync` ([libuv unix/fs.c](https://github.com/libuv/libuv/blob/v1.x/src/unix/fs.c), commit `338ac6ac`). En Windows libuv usa `FlushFileBuffers` | [POSIX `fsync()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/fsync.html): «a null implementation is permitted… might or might not… safe from a power failure». [Apple `fsync(2)`](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/fsync.2.html): «only some or none of their data was written». [SQLite](https://www.sqlite.org/howtocorrupt.html): «most consumer-grade mass storage devices lie about syncing» | Solo un corte físico de energía en el hardware y firmware concretos. Ninguna prueba de software lo demuestra |
| **G7.** Reintentar `fsync` tras un error es seguro | No aplica | No | No | En Linux 4.14 y ≥4.16 el error se informa una sola vez | [PostgreSQL, Fsync Errors](https://wiki.postgresql.org/wiki/Fsync_Errors): «you still only get the error once (so retrying fsync() is not OK)» | [dm-flakey](https://docs.kernel.org/admin-guide/device-mapper/dm-flakey.html) con `error_writes` o `drop_writes` |
| **G8.** `rename` en Windows es un reemplazo atómico | UNKNOWN | UNKNOWN | UNKNOWN | libuv usa `MoveFileExW(…, MOVEFILE_REPLACE_EXISTING)` sin `MOVEFILE_WRITE_THROUGH` ([libuv win/fs.c](https://github.com/libuv/libuv/blob/v1.x/src/win/fs.c) L2341). No se verificó cómo hacer `fsync` de un directorio desde Node en Windows | [`MoveFileEx`](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexa) no menciona atomicidad. `FILE_RENAME_POSIX_SEMANTICS` existe, pero a nivel de controlador ([NTIFS](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntifs/ns-ntifs-_file_rename_information)) | Pruebas específicas en NTFS o ReFS, si Windows es plataforma objetivo |
| **G9.** Exclusión mutua entre escritores que cooperan | Sí mientras el dueño vive. Si muere, la recuperación tarda ≥ 60 s | El directorio `.lock` persiste en disco. Puede quedar bloqueado indefinidamente si el PID se reutiliza tras el reinicio (afecta a la disponibilidad, no a la seguridad) | Igual que F2 | `mkdir` con `EEXIST` es fiable en sistemas locales. NFS tiene «infelicities». Los PID son locales al host o contenedor | [`mkdir(2)`](https://man7.org/linux/man-pages/man2/mkdir.2.html); [`kill(2)`](https://man7.org/linux/man-pages/man2/kill.2.html): con señal 0 «check for the existence of a process ID» | Estrés con N escritores, `kill -9` con el bloqueo tomado y reinicio con el bloqueo abandonado |
| **G10.** Recuperar un bloqueo abandonado es seguro | Probablemente no (inferencia) | Igual | Igual | Comprobar y luego borrar (L72-76) no es atómico. Dos procesos en espera podrían considerarlo abandonado a la vez, y uno podría borrar el bloqueo recién creado por el otro. Tampoco se revalida el dueño antes del `rename` (no hay fencing) | Lectura de código; sin prueba ejecutada | Prueba de carrera determinista con pausas inyectadas entre `stat`, `rm` y `mkdir` |
| **G11.** Protección frente a un escritor que no usa el bloqueo | No | No | No | El bloqueo es advisory por diseño. Además, `persistState` borra los temporales vecinos con el mismo prefijo (L239-243) | [`fcntl_locking(2)`](https://man7.org/linux/man-pages/man2/fcntl_locking.2.html): «Advisory locks are not enforced and are useful only between cooperating processes». [`flock(2)`](https://man7.org/linux/man-pages/man2/flock.2.html): «a process is free to ignore the use of flock()» | Ninguna prueba puede demostrar la ausencia de otros escritores. Solo un inventario o auditoría de todos los actores capaces de escribir |
| **G12.** La comprobación de revisión detecta conflictos reales | Sí entre escritores cooperantes, si el estado se lee correctamente | Falla si el archivo queda vacío o corrupto: `loadState` devuelve revisión 0 (L181-182) | Igual que F2 | Un archivo ilegible pasa a ser «revisión 0». Con `expectedRevision=0` se sobrescribiría; con N>0 se clasificaría como `CONDITIONAL_CONFLICT` | Lectura de código | Prueba con archivo de estado truncado, vacío o con JSON inválido antes de `persistState` |

## Análisis por tema solicitado

### 1. Atomicidad de `rename()` y sus límites

- POSIX exige atomicidad de visibilidad: durante el reemplazo, el nombre destino siempre existe y apunta al archivo antiguo o al nuevo ([POSIX `rename()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html)).
- Linux lo reafirma, pero advierte de una ventana en la que ambos nombres apuntan al archivo ([Linux `rename(2)`](https://man7.org/linux/man-pages/man2/rename.2.html)).
- Límites: no funciona entre sistemas de archivos ni entre puntos de montaje (`EXDEV`); en NFS un error no implica que no haya ocurrido; ninguna de las dos especificaciones promete durabilidad.
- Tras un fallo de sistema, la atomicidad del `rename` en disco depende del sistema de archivos; ALICE la describe como «seemingly atomic» en sistemas con journaling o copy-on-write, y sus pruebas consideran incluso que no lo sea ([OSDI'14](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-pillai.pdf)).
- Windows: la documentación de `MoveFileEx` y `ReplaceFile` no declara atomicidad; `ReplaceFile` documenta estados parciales ([MoveFileEx](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexa), [ReplaceFile](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilea)).

### 2. Visibilidad frente a durabilidad

- Visibilidad: después de un `write()` exitoso, cualquier lectura devuelve los datos ([POSIX `write()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/write.html)). Esto es una propiedad de la caché del sistema, que sobrevive a F1.
- Durabilidad: la caché se transfiere al almacenamiento con `fsync`/`fdatasync` o «at other times», y si el sistema cae antes, puede quedar en disco un efecto posterior sin uno anterior ([POSIX XBD 4.11](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html)).
- En consecuencia, un `rename()` que devuelve éxito demuestra visibilidad, no durabilidad.

### 3. `fsync()` del archivo y del directorio según plataforma

- **POSIX**: la naturaleza de la transferencia es definida por la implementación; se permite una implementación nula ([POSIX `fsync()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/fsync.html)).
- **Linux**: `fsync` incluye vaciar la caché del disco, y la entrada del directorio requiere un `fsync` explícito del directorio ([Linux `fsync(2)`](https://man7.org/linux/man-pages/man2/fsync.2.html)). Tras un error, no es seguro reintentar ([PostgreSQL](https://wiki.postgresql.org/wiki/Fsync_Errors)).
- **macOS**: `fsync` no vacía la caché del disco; hace falta `F_FULLFSYNC` ([Apple](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/fsync.2.html)). `fs.fsync` de Node, a través de libuv, ya usa `F_FULLFSYNC` con recursos alternativos ([libuv](https://github.com/libuv/libuv/blob/v1.x/src/unix/fs.c)).
- **Windows**: libuv implementa `fsync` con `FlushFileBuffers` ([libuv](https://github.com/libuv/libuv/blob/v1.x/src/win/fs.c), [Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-flushfilebuffers)). El `fsync` de directorios desde Node en Windows no fue verificado: **UNKNOWN**.
- **Hardware**: incluso con `fsync` correcto, dispositivos de consumo pueden confirmar escrituras que siguen en caché volátil ([SQLite](https://www.sqlite.org/howtocorrupt.html), [SQLite](https://www.sqlite.org/atomiccommit.html)).
- Ninguno de estos mecanismos es universal; dependen de la plataforma, del sistema de archivos y del dispositivo.

### 4. Bloqueo cooperativo y escritores que no lo respetan

- Los bloqueos advisory solo sirven entre procesos cooperantes; cualquier proceso con permisos puede ignorarlos ([`fcntl_locking(2)`](https://man7.org/linux/man-pages/man2/fcntl_locking.2.html), [`flock(2)`](https://man7.org/linux/man-pages/man2/flock.2.html)).
- El bloqueo obligatorio de Linux era poco fiable y ya no existe desde Linux 5.15 ([`fcntl_locking(2)`](https://man7.org/linux/man-pages/man2/fcntl_locking.2.html)).
- El bloqueo de Nexo es un directorio creado con `mkdir`, no `flock`/`fcntl`; comparte la naturaleza cooperativa.
- Si otro escritor no lo respeta: puede reemplazar el archivo entre la comprobación de revisión y el `rename` (pérdida de actualización), puede perder su temporal porque `persistState` borra los temporales con el mismo prefijo (L239-243), y la comprobación de revisión no detecta nada si ese escritor no incrementa `stateRevision`.
- En NFS, los bloqueos pueden perderse sin notificación ([`fcntl_locking(2)`](https://man7.org/linux/man-pages/man2/fcntl_locking.2.html)) y `O_EXCL`/`mkdir` tienen limitaciones ([`open(2)`](https://man7.org/linux/man-pages/man2/open.2.html), [`mkdir(2)`](https://man7.org/linux/man-pages/man2/mkdir.2.html)).

### 5. Pruebas que demuestran y pruebas que no bastan

**Útiles (por escenario):**

- F1: inyectar `kill -9` en cada punto del protocolo (antes y después de `mkdir`, de `owner.json`, de la lectura de revisión, de `writeFile`, de `rename` y de la liberación), con lectores concurrentes que verifiquen que siempre ven un estado completo antiguo o nuevo.
- F2: reinicio forzado de una VM con el sistema de archivos y las opciones de montaje de producción, verificando el estado tras arrancar.
- F3: reproducción con [dm-log-writes](https://docs.kernel.org/admin-guide/device-mapper/log-writes.html) hasta cada `FLUSH`/`FUA`; inyección de errores con [dm-flakey](https://docs.kernel.org/admin-guide/device-mapper/dm-flakey.html); cortes físicos de energía en el hardware objetivo.
- Bloqueo: estrés con N escritores, carrera determinista en la recuperación de bloqueo abandonado, reinicio con bloqueo abandonado.
- Revisión: archivo de estado vacío, truncado o con JSON inválido.

Estas pruebas encuentran fallos; no demuestran su ausencia.

**No suficientes:**

- Tests con `fsModule` simulado (inyectado en `persistState`).
- Comprobar que `rename()` devolvió éxito.
- Leer justo después de escribir sin reiniciar el sistema.
- Una sola ejecución verde.
- CI en un sistema de archivos distinto del de producción.

### 6. Relación con `COMMIT.COMMITTED`, `COMMIT.CONDITIONAL_CONFLICT` y `COMMIT.UNKNOWN`

- **`COMMIT.COMMITTED`** solo significa que `persistState` terminó sin excepción: `rename` devolvió éxito y el bloqueo se liberó. Respalda G1 y G3 frente a F1. No respalda F2 ni F3 porque faltan G3, G5 y G6. Hoy, `SAFE_COMMIT` equivale a «visible y seguro frente a F1». Además, si F2 o F3 deshacen un rename ya confirmado, la revisión puede retroceder, lo que debilita las comprobaciones posteriores (inferencia).
- **`COMMIT.CONDITIONAL_CONFLICT`** es fiable solo si todos los escritores cooperan (G11) y el estado se lee correctamente (G12). Un archivo corrupto puede clasificarse como conflicto o, con `expectedRevision=0`, aceptarse una sobrescritura.
- **`COMMIT.UNKNOWN`** agrupa casos distintos:
  - Fallos antes del `rename`, por ejemplo `ENOSPC` en `writeFile`. En un sistema local, aquí casi seguro no hubo commit.
  - Fallos después de un `rename` exitoso, como un error en `releaseLock` (L254). Aquí sí hubo commit visible.
  - Casos realmente ambiguos, como un error de `rename` en NFS (G2).

  Releer el archivo permite saber si el cambio es visible, no si es durable.

## Conclusiones

### CONFIRMADO (por fuentes primarias o por lectura del código)

- La primitiva no hace `fsync` del archivo temporal ni del directorio (`scripts/simulate.mjs` L214-257).
- POSIX garantiza la atomicidad de `rename` para la visibilidad, no la durabilidad.
- Linux exige `fsync` del directorio para que la entrada de directorio llegue a disco.
- POSIX permite un `fsync` nulo, y macOS necesita `F_FULLFSYNC` para vaciar la caché del disco.
- Un `fsync` que falla no debe reintentarse como si fuera fiable (Linux).
- Los bloqueos advisory solo protegen entre escritores cooperantes.
- `loadState` convierte un estado ilegible en revisión 0 (L181-182), y `persistState` usa `loadState` para la comprobación de revisión (L219).
- Un error en `releaseLock` después del `rename` produce `COMMIT.UNKNOWN` (L254 + adaptador L68-70).
- En Node, `fs.rename` en Windows usa `MoveFileExW` con `MOVEFILE_REPLACE_EXISTING` sin `WRITE_THROUGH`, y `fs.fsync` en macOS usa `F_FULLFSYNC` (libuv `v1.x`, commit `338ac6ac`).

### INFERENCIA

- F1 es seguro para la visibilidad en sistemas POSIX locales.
- Hay una posible carrera al recuperar un bloqueo abandonado (G10).
- La revisión puede retroceder tras F2 o F3.
- `COMMIT.UNKNOWN` mezcla casos sin commit y casos con commit.
- En F2 con el dispositivo aún alimentado, los datos ya vaciados con `fsync` probablemente sobreviven aunque la caché volátil del dispositivo no se haya vaciado; en F3 no.

### PROPUESTA (sin validar; opciones a evaluar por el propietario)

- Definir explícitamente `COMMITTED` como «visible», o elevarlo a «durable» añadiendo `fsync(tmp)` y `fsync(dir)` según la plataforma, y probarlo con dm-log-writes.
- Separar `COMMIT.UNKNOWN` según la fase en la que ocurrió el fallo.
- Usar una lectura estricta (`loadStateStrict`) para la comprobación de revisión.

Ninguna de estas propuestas se ha implementado ni probado.

### UNKNOWN

- La plataforma y el sistema de archivos de producción (Linux ext4/f2fs, Android, macOS, Windows o red).
- Si el hardware objetivo respeta el vaciado de caché.
- La semántica en Windows y Node para el `fsync` de un directorio.
- Si existen escritores que no cooperan.
- La causa primaria del run de CI histórico `40270739196`, que sigue `UNKNOWN` según el documento de contexto.

## Decisiones de diseño abiertas

1. Qué modelo de fallo cubre el contrato: solo F1, F1 y F2, o también F3.
2. Qué plataformas y sistemas de archivos son objetivo.
3. Si `SAFE_COMMIT` debe significar «visible» o «durable».
4. Si `COMMIT.UNKNOWN` se resuelve automáticamente o queda a la espera de intervención explícita.
5. Cómo se demuestra que no hay escritores fuera del bloqueo.
6. Si se aceptan el umbral de 60 s y la heurística de PID para los bloqueos abandonados.

## Limitaciones de esta revisión

- No se ejecutaron pruebas, CI ni scripts; todas las afirmaciones sobre el comportamiento del código provienen de lectura estática.
- No se revisó el contenido de las auditorías P112; solo se comprobó que existen en el commit inspeccionado.
- Las citas de fuentes son extractos breves; la interpretación completa requiere leer cada fuente.
- Las referencias de libuv apuntan a la rama `v1.x` (commit `338ac6ac0714e6d8043a2826c9b3bc78e85bb961`); la versión de Node usada por Nexo no fue verificada.
