# Recuperación histórica dirigida: cinco objetivos pendientes — 2026-11-21

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base documental revisada:** `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`, sección 95; HEAD conocido al iniciar esta actualización: `d326ad461d753c05ac7d5680fd4b48c74e705c21`.  
**Método:** recuperación dirigida de contexto histórico de conversaciones anteriores usando los títulos de chats de la captura como pistas; cotejo contra el índice maestro vigente. No se ejecutó el dispositivo ni se realizaron extracciones locales.

## Resultado por objetivo

| Objetivo | Resultado de la recuperación disponible | Estado |
|---|---|---|
| `RetransferUtils.restoreTransfering()` | No se recuperó el cuerpo completo. Se conserva únicamente la llamada reportada en `RetransferUtils.smali:154` a `BRService.restoreTransfering(Context, BackupDescriptor)`. | `UNKNOWN / NOT RECOVERABLE FROM AVAILABLE CONTEXT` |
| `BRService.restoreTransfering(Context, BackupDescriptor)` | No se recuperó el cuerpo completo. Las ramas `brState==3` → `CMD_BACKUP` + `extra_is_retransfering=true` y `brState==4` → overload de cinco argumentos ya están en evidencias 57 y 94. | `PARTIAL / ALREADY PRESERVED` |
| Continuación de `BRService.onStartCommand()` tras `extra_zip_file_path` | No se recuperaron instrucciones posteriores. El fragmento histórico sigue truncado al comenzar esa lectura. La descripción previa de extras, descriptor, `restoreFiles()` y caso de lista null ya está en evidencia 56 / sección 51. | `UNKNOWN / NOT RECOVERABLE FROM AVAILABLE CONTEXT` |
| `TransFileService` / `ITransFileService` Binder | No se recuperaron declaración de interfaz, Stub/Proxy, transaction IDs, `onTransact`, parcel marshalling ni cuerpos de transferencia. Se mantienen únicamente las anclas previas: manifest/proceso, `bindTransFileService` grep 709–738 y recepción de `ITransFileService` por `MiAsistService$4`; véanse evidencias 43/51 y 59. | `PARTIAL / BODY AND TRANSACTIONS UNKNOWN` |
| `CompatibilityActivity$1` / `ProgressPageFragmentBase` | No apareció bloque literal adicional. Permanecen los greps reportados de `iput p1` a `BRItem.state/error` en CompatibilityActivity$1 y el writer reportado en ProgressPageFragmentBase, con ambigüedad de coordenadas físicas frente a `.line`. Evidencias 70, 77, 81 y 84 ya contienen el contexto disponible. | `UNKNOWN / NO NEW SOURCE BLOCK` |

## Deduplicación Binder

La recuperación histórica devolvió detalles de `IBRService` que no constituyen hallazgos nuevos:

- `IBRService.getBRItems()`: transacción Binder 5; Stub usa `Parcel.writeTypedArray(...,1)`; Proxy ejecuta `transact(5,...,0)`, `readException()` y `createTypedArray(BRItem.CREATOR)`. Ya preservado en evidencia 45.
- `IBRService$Stub.asInterface(IBinder)`: null → null; consulta `queryLocalInterface("com.miui.backup.service.IBRService")`; devuelve interfaz local compatible o crea `IBRService$Stub$Proxy`. Ya preservado en evidencia 62.
- El manifest/proceso y la inferencia sobre ruta Proxy también están cubiertos por evidencias 45, 62 y 63; no se duplican.

Estos detalles pertenecen a `IBRService`, no prueban la estructura Binder de `TransFileService` ni autorizan extrapolar sus transaction IDs.

## Procedencia y límites

- Esta actualización registra el resultado de una recuperación de contexto histórico, no una nueva extracción del APK.
- No se recuperó texto Smali literal nuevo para los cinco objetivos.
- Los resúmenes de conversaciones anteriores no se elevan a `USER-PASTED-SOURCE` ni a `LOCAL-VERIFIED`.
- Las coordenadas grep no se reinterpretan como bloques fuente; las directivas `.line` no se confunden con líneas físicas.
- No se afirma que el historial completo haya sido inspeccionado: la recuperación disponible es parcial y no equivale a transcript íntegro.
- No se realizaron cambios al APK, al dispositivo, ni pruebas dinámicas.

## Continuidad sin repetición

No repetir como tareas de recuperación ya ejecutadas en esta ronda:

1. Buscar los cuerpos completos de ambos `restoreTransfering()` en los resúmenes históricos disponibles.
2. Buscar la continuación de `CMD_RESTORE` después de `extra_zip_file_path` en los resúmenes históricos disponibles.
3. Buscar la interfaz/Stub/Proxy de `TransFileService` en los resúmenes históricos disponibles.
4. Buscar bloques literales de CompatibilityActivity$1 y ProgressPageFragmentBase en los resúmenes históricos disponibles.
5. Volver a registrar los detalles de `IBRService.getBRItems()` y `Stub.asInterface()`, ya preservados en evidencias 45 y 62.

**Siguiente fuente necesaria para cerrar los pendientes:** bloques fuente originales recuperables de los chats o cotejo futuro contra los archivos Smali locales. Hasta entonces, mantener los estados abiertos y no reconstruir código por inferencia.


## Addendum — contexto histórico adicional de IBRService y gate MiAsist (2026-11-21)

Una segunda búsqueda histórica focalizada recuperó referencias USER-FACT del 2026-11-16 17:03–17:04 UTC. No recuperó el bloque Smali literal.

### IBRService.Stub.onTransact

El usuario había descrito que `IBRService.Stub.onTransact(int, Parcel, Parcel, int)`:
- usa el descriptor `com.miui.backup.service.IBRService`;
- aplica `enforceInterface`;
- maneja IDs de transacción 1–14;
- lee listeners mediante `Parcel.readStrongBinder()`;
- transporta valores de retorno de tipos int, long, String y typed array.

Esto complementa el catálogo de 14 transacciones ya mencionado en evidencia 37 y el transporte de `getBRItems()`/transacción 5 ya preservado en evidencia 45. No se recuperó aquí la tabla completa método↔ID ni los bloques por transacción; no inferirla.

### Gate de MiAsistService

El usuario describió que `MiAsistService.onStartCommand()` valida, en ese orden, `isActionParamsValid()`, `isOwnerSpace()` e `isBRServiceAvailable()`, antes de llamar a `bindTransFileService()`. También describió que `startRestoreCommand()` delega a `BRService.startRestoreCommand(Context, ArrayList, BackupDescriptor, String, int)`.

El índice ya conservaba las anclas de `isActionParamsValid()`, `bindTransFileService()`, `isOwnerSpace()` y la delegación a BRService en evidencias 37, 51, 52 y 59; el delta aquí es la secuencia explícita del gate y la mención de `isBRServiceAvailable()`. No se recuperó el cuerpo de esos validadores ni el bloque continuo de `onStartCommand()`.

**Clasificación:** `USER-FACT / RECOVERED-CHAT`; no `USER-PASTED-SOURCE` ni `LOCAL-VERIFIED`. Este addendum pertenece a `IBRService` y al gate de `MiAsistService`; no aporta interfaz, Stub/Proxy ni transaction IDs de `TransFileService/ITransFileService`.



## Addendum — MiAsistService TransFileService lifecycle and ZIP metadata (2026-11-21)

Una recuperación histórica adicional de mensajes del usuario del 16-11-2026 añadió contexto de ciclo de vida que no estaba explícito en el índice maestro:

### Vinculación de TransFileService desde MiAsistService

**USER-FACT / RECOVERED-CHAT (16-11-2026 17:59:27Z):**
- `bindTransFileService()` construye un Intent explícito a `com.miui.backup.service.TransFileService`.
- Ejecuta `startService()` y después `bindService(..., mTransServiceConnection, 1)`.
- `unbindTransFileService()` llama `unregisterTransFileServiceListener(mTransListener)`, después `unbindService(...)`, y anula `mTransService`.
- `startAsClientOrServer()` llama `ITransFileService.connectToHost(TransDeviceInfo)` para backup y `acceptDevice(TransDeviceInfo)` para restore. En la ruta de backup, después llama `prepareTransItemsSize()`. El método requiere `mTransService` enlazado.

**USER-FACT / RECOVERED-CHAT (16-11-2026 18:12:12Z):**
- `MiAsistService.onDestroy()` llama `ITransFileService.cancelSizeGetter()` y `stopAll(I)`.
- `MiAsistService.onBind(Intent)` devuelve null; `onStartCommand()` valida el Intent, comprueba disponibilidad de BRService y llama a `bindTransFileService()`.

**USER-FACT / RECOVERED-CHAT (16-11-2026 21:03:47Z):**
- Campo `mTransService:ITransFileService`.
- Campo `mTransListener:ITransFileServiceListener$Stub`.
- El grep reportó bridges sintéticos `-$$Nest$mstartRestoreCommand()` y `startBackupCommand()` delegando a métodos privados; no son entradas externas independientes.

**Manifest reportado (16-11-2026 18:00:50Z):** `TransFileService` aparece `android:exported="false"` y sin proceso explícito; `MiAsistService` aparece en proceso `:remote`. El índice ya conservaba la restricción exported=false para los tres servicios en sección 37; este addendum precisa el proceso reportado y la ausencia de atributo process en TransFileService. No deducir el proceso efectivo heredado sin el bloque `<application>` completo.

### Límite Binder

Estos datos describen cómo `MiAsistService` solicita y administra el servicio; **no** recuperan el cuerpo de `TransFileService`, la interfaz completa `ITransFileService`, Stub/Proxy, transaction IDs, `onTransact`, `readStrongBinder` ni el marshalling Parcel. No extrapolar las 14 transacciones de `IBRService` a `ITransFileService`.

### ZIP: metadata de modificación

**USER-FACT / RECOVERED-CHAT (19-11-2026 22:45:57Z):** el tramo final reportado de `ArchiveHelper.unzipFiles()` conserva `fileLastModifyTime` mediante `Utils.getModifyTimeByReceiveFileMap` / `setLastModified`, agrega `getAbsolutePath()` a la lista de salida `p6`, y ante `IOException` registra `"IOException continue next"` y continúa con la siguiente entrada. La evidencia 49 ya conservaba la lista de rutas absolutas y la continuación ante IOException; este addendum añade la restauración explícita de la fecha de modificación. No se recuperó aquí el bloque literal completo ni la condición exacta de obtención del timestamp.

**Clasificación general:** `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`. No se han obtenido transaction IDs ni código fuente interno de TransFileService.

## Addendum — BRService Binder listener bootstrap (2026-11-21)

Una recuperación histórica focalizada de mensajes del usuario del 16-11-2026 añadió un detalle del lado servidor que no aparece explícito en el índice maestro v0.97. Se conserva como contexto histórico; no se recuperó en esta ronda el bloque Smali completo.

### BRService$1 / IBRService.Stub

**USER-FACT / RECOVERED-CHAT (16-11-2026 13:24:18Z):**
- `BRService$1` extiende `IBRService$Stub`.
- Su constructor almacena la referencia `this$0` y llama al constructor de `IBRService$Stub`.
- Los métodos reportados incluyen `registerBRListener(IBRServiceListener)` y `unregisterBRListener(IBRServiceListener)`.
- En `registerBRListener`, la referencia histórica indica que agrega el listener a `mRemoteCallbackList` y acto seguido envía a ese listener `onServiceStateChange(IIII)` con el estado actual.
- El servicio conserva el Binder en `mBinder`; el resumen histórico atribuye su creación a `new BRService$1(this)` y que `BRService.onBind()` devuelve `mBinder`.

El envío inmediato de estado al registrar listener es el delta de esta recuperación. El catálogo general de métodos/transacciones Binder y `getBRItems()` ya estaba preservado en evidencias previas; no se vuelve a enumerar aquí.

### Campos y conexión caller-side

**USER-FACT / RECOVERED-CHAT (16-11-2026 13:28:19Z):**
- `MiAsistService` declara `mBRService: IBRService`, `mBRServiceConnection: ServiceConnection` y `mBRServiceListener: IBRServiceListener`.
- La conexión se instancia mediante `new MiAsistService$2(this)`.

El callback `MiAsistService$2.onServiceConnected()` ya está preservado en las secciones 38/47 y evidencia 02: recibe Binder, convierte con `IBRService$Stub.asInterface()`, asigna `mBRService` y registra `mBRServiceListener`; `onServiceDisconnected()` limpia la referencia. No se repite como hallazgo nuevo.

### Límites probatorios

La parte del callback `$2` y la descripción del constructor/`BRService$1` proceden de recuperación histórica y resúmenes; el dato de registro en `mRemoteCallbackList` y notificación inmediata se clasifica como `USER-FACT / RECOVERED-CHAT`, no como bloque Smali literal adjunto en esta ronda ni `LOCAL-VERIFIED`. No se infieren los cuatro argumentos concretos de `onServiceStateChange(IIII)`, la sincronización/orden interno del callback, el comportamiento ante excepción ni la política de eliminación de listeners muertos.

## Addendum — alcance de la comprobación de identidad en IBRService.Stub.onTransact (2026-11-21)

**USER-PASTED-SOURCE / DIRECT-CHAT (16-11-2026 17:03:00Z):** el usuario compartió el bloque de `IBRService.Stub.onTransact`. El fragmento recuperado muestra `enforceInterface("com.miui.backup.service.IBRService")` y el despacho de las transacciones 1–14. En las ramas visibles no se identificó una comprobación explícita adicional mediante `Binder.getCallingUid()`, `checkCallingPermission()`, `enforceCallingPermission()` u otra validación de UID/permiso del caller.

**Alcance exacto:** esto registra únicamente la ausencia de esas comprobaciones explícitas en el bloque `onTransact` que el usuario compartió. `enforceInterface` valida el descriptor de interfaz; no equivale a una autorización por UID o permiso.

**No concluir:** no demuestra que las operaciones sean invocables por cualquier aplicación ni que exista una vulnerabilidad explotable. La accesibilidad sigue condicionada por la declaración `android:exported`, el mecanismo real de obtención del Binder, permisos de paquete/servicio, identidad de proceso y otras capas del sistema. Tampoco se afirma que no existan controles en los métodos llamados, en el servicio, en el framework o fuera del fragmento revisado.

**Clasificación:** `USER-PASTED-SOURCE / DIRECT-CHAT` para el bloque compartido; observación limitada al fragmento. No `LOCAL-VERIFIED` en esta ronda.


## Addendum — callbacks de transferencia y descriptor en MiAsistService$5/$6 (2026-11-21)

### MiAsistService$5 — conexión y descriptor

**USER-FACT / RECOVERED-CHAT (16-11-2026 16:46:59Z; referencias ampliadas 18:06:58Z):** la recuperación histórica atribuye a este callback que, después de establecerse la conexión, actualiza `mConnectionState`; participa en el envío del descriptor y en la transición a `STAGE_BRSERVICE_BR_START`; también procesa el descriptor seleccionado recibido en `STAGE_SELECT_DESCRIPT_RECEIVED`, usando `mBackupDescriptor`, `mReceivedItemFiles` y `mHandler`.

El inventario histórico posterior ubica callbacks/notificaciones de progreso en líneas 155 y 181–195; llamadas a `setState` en 225, 314, 367, 528, 555, 578 y 745; recepción del descriptor en 675; rama de acción backup en 683–687; y archivos recibidos/uso de Handler en 769–778. Las etapas/error de conexión 221–225 y 310–314, las referencias 363–367, 526–528 y otros códigos ya están resumidos en el índice; aquí se preserva la relación descriptor/estado y el inventario de callbacks, no se vuelven a presentar como nuevos los códigos ya indexados.

### MiAsistService$6 — callback de envío de descriptor

**USER-FACT / RECOVERED-CHAT (16-11-2026 16:46:59Z; inventario ampliado 18:06:58Z):** el callback asociado a `sendAllBRItemsDescriptor()` consulta datos de fecha, tamaño, items, acción, etapa y error; espera/sincroniza con `mAppIconsLoadSyncer` y `mIsLoadAppIconsDone`; y participa en la invocación de `doSendFile(String)`. Ante un fallo, el resumen histórico reporta `STAGE_START_DESCRIPT_SENDING` junto con `ERR_WRITE_DESCRIPTOR`. Se reportan referencias a `sendAllBRItemsDescriptor()` y `doSendFile()` en líneas 8 y 185, y una llamada a `setState` en 245.

**Límites:** la recuperación no conserva aquí el cuerpo Smali literal íntegro ni permite reconstruir el orden exacto de todas las lecturas, condiciones de espera, ramas de error o argumentos. No inferir que la espera sea bloqueo indefinido, que el descriptor se envíe íntegro en una sola operación, ni el protocolo de transporte. Las coordenadas se conservan como referencias históricas reportadas, no como verificación local actual.

**No duplicación:** las etapas/error ya preservadas en el índice (incluidos `ERR_CONNECTED_FAILED`, `ERR_SEND_FAILED`, `ERR_RECEIVE_FAILED`, `STAGE_REMOTE_DISCONNECTED`, `STAGE_START_DESCRIPT_SENDED` y `STAGE_END_DESCRIPTOR_SENDED`) no se re-clasifican como hallazgos nuevos. Este addendum añade únicamente la asociación de $5 con recepción/selección del descriptor y la descripción resumida del callback $6.

**Clasificación:** `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`. Timestamps de origen: 2026-11-16T16:46:59Z y 2026-11-16T18:06:58Z.


## Addendum — inventario de referencias BRItems en callbacks y carga de UI (2026-11-21)

**USER-FACT / RECOVERED-CHAT (2026-11-20T00:04:42Z):** una salida grep histórica reportó las siguientes referencias a `mBRItems`:

- `BRService$11`: líneas físicas reportadas 69, 527, 594, 844, 916, 1122, 1296, 1666 y 1735.
- `BRService$6`: líneas físicas reportadas 106, 259, 306, 569, 944, 952, 973, 1226, 1235, 1343, 1351, 1372, 3417, 3528, 3557 y 3746.

La misma recuperación reportó que `ProgressPageFragmentBase$7$1` a `$7$7` llaman `IBRService.getBRItems()` y luego `ProgressItemAdapter.initData(BRItem[])` (rango Smali reportado 97–180); el bloque de `ProgressPageFragmentBase` contiene referencias de carga en 676–719. El índice ya conserva el contrato de `getBRItems()`, el caller de `MiAsistService` y la semántica de `initData()`; el delta aquí es el inventario nominal de siete callbacks UI y las coordenadas de referencias a `mBRItems` en las dos clases internas.

**Límites:** grep reportado, no bloques Smali íntegros. Las coordenadas no permiten asignar por sí solas semántica de lectura/escritura, método, rama ni orden de ejecución. No inferir que cada callback de UI haga una llamada remota distinta, que se ejecuten los siete en una misma sesión, ni que las referencias `mBRItems` sean todas mutaciones. No duplicar las conclusiones de state/error ya documentadas para `BRService$6/$11`.

**Clasificación:** `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.


## Addendum — BRService$11 start/progress callbacks (2026-11-21)

Una recuperación histórica focalizada del chat del 2026-11-19T04:43:51Z recuperó un detalle de los callbacks de inicio que no estaba explicitado en el expediente:

- `onBackupStart()` y `onRestoreStart()` comprueban `checkRunningTaskIndex()` antes de operar sobre el elemento activo.
- En la ruta reportada, acceden a `mBRItems[mRunningItemIndex]`, asignan `state=2` y notifican el inicio de la tarea correspondiente.
- `onRestoreProgress()` notifica el progreso de restauración.

**Deduplicación:** el índice sección 22 y las evidencias 08/15 ya conservaban que BRService$11 inicia items con `state=2`, gestiona errores con `state=3` y traduce códigos `p3` a `BRItem.error`. El inventario de referencias `mBRItems` en sección 100/evidencia 96 también ya estaba preservado. El delta de este addendum es la comprobación explícita de `checkRunningTaskIndex()`, el acceso mediante `mRunningItemIndex` y la notificación de progreso en `onRestoreProgress()`; no se vuelven a registrar los estados ni el mapping.

**Procedencia y límites:** `USER-PASTED-SOURCE / RECOVERED-CHAT`, mensaje histórico del usuario fechado 2026-11-19T04:43:51Z. La recuperación disponible describe el contenido del bloque compartido, pero no adjunta aquí el Smali literal ni permite verificar las ramas completas, los argumentos de las notificaciones o el comportamiento cuando `checkRunningTaskIndex()` falla. No es `LOCAL-VERIFIED`; no inferir sincronización, exclusión mutua ni validez del índice fuera del guard reportado.
