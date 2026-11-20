# Evidencia 51 — Pipeline de transferencia MiAsist y errores por etapa

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: mensajes con Smali pegado por el usuario el 16-11-2026; recuperación de conversaciones previas.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para las instrucciones y rangos expresamente pegados; RECOVERED-CHAT para los resúmenes de inner classes.
- No LOCAL-VERIFIED por relectura del checkout en esta sesión. No ejecución dinámica.

## 1. Pipeline de transferencia: métodos de MiAsistService

### 1.1 Anclas de método recuperadas

Texto fuente pegado el 16-11-2026:
- MiAsistService.doSendFile(String): referencia de método alrededor de línea 739.
- MiAsistService.sendAllBRItemsDescriptor(): alrededor de línea 2032.
- MiAsistService.startRestoreCommand(): alrededor de línea 2917.
- bindBRService(): líneas 675–708.
- bindTransFileService(): líneas 709–738.
- startAsClientOrServer(): alrededor de línea 2685.

En otra extracción del mismo día:
- doSendFile(String) también aparece invocado alrededor de líneas 809 y 2127.
- sendAllBRItemsDescriptor() aparece alrededor de líneas sintéticas 450–453 y alrededor de línea 2032 como referencia de método.
- MiAsistService$6 se crea en líneas 2036–2043.
- MiAsistService$7 se crea en líneas 2874–2885 y se ejecuta mediante executeOnExecutor().

Las referencias repetidas 739/809/2127/2032 no deben combinarse como si fueran una sola ubicación: algunas son definiciones o referencias a métodos, otras invocaciones desde bloques distintos. Se requiere descriptor + contexto para fijar cada relación.

### 1.2 MiAsistService$6

Texto fuente pegado/resumen directo del 16-11:
- Clase callback vinculada a sendAllBRItemsDescriptor().
- Campo exterior this$0.
- Constructor (MiAsistService,String).
- Usa mCurrentDate, mTotalSize, mAllBRItems, mDeviceAction, mDeviceStage, mDeviceError.
- Se relaciona con sincronización de iconos.
- Invoca doSendFile(String).
- ERR_WRITE_DESCRIPTOR se observó alrededor de líneas 241–245 en una extracción de MiAsistService$6.smali; otra extracción de MiAsistService.smali sitúa el error alrededor de 2171.
- En MiAsistService.smali, instancia $6 en 2036 y llama start() en 2043.
- doSendFile(String) aparece invocado en MiAsistService.smali:2127.

**Límite:** la descripción disponible no incluye cuerpo completo de la clase ni prueba el contenido exacto del descriptor enviado, el formato serializado o el significado de cada campo. Las dos coordenadas de ERR_WRITE_DESCRIPTOR pertenecen a archivos/clases o extracciones diferentes; no fusionarlas.

### 1.3 MiAsistService$7

Fuente directa recuperada:
- MiAsistService.smali crea $7 alrededor de 2874–2885.
- Constructor observado: (MiAsistService).
- Se ejecuta mediante executeOnExecutor().
- La secuencia circundante incluye STAGE_BRSERVICE_BR_START (alrededor de 2801), bindBRService() (2865), STAGE_BRITEMS_LOADING (2894) y la tarea $7.
- Una recuperación anterior solo mostraba la declaración de la clase, sin métodos/campos/cuerpo interno.

**No inferir** que $7 ejecuta una tarea concreta más allá de su creación/ejecución asíncrona en el contexto descrito. La tarea de carga app/file BRItems y tamaños está documentada para $8 en evidencia 49, no debe trasladarse a $7.

## 2. MiAsistService$5: etapas y errores de comunicación

Texto fuente del usuario del 16-11:
- ERR_CONNECTED_FAILED: línea 223.
- ERR_SEND_FAILED: línea 507.
- ERR_RECEIVE_FAILED: línea 737.
- STAGE_REMOTE_DISCONNECTED: líneas 363–367.
- STAGE_START_DESCRIPT_SENDED: líneas 526–528.
- STAGE_END_DESCRIPTOR_SENDED: líneas 576–578.
- STAGE_SELECT_DESCRIPT_RECEIVED se reporta también entre las etapas de la clase.
- STAGE_BRSERVICE_BR_START y STAGE_REMOTE_CONNECTED aparecen en el flujo de conexión.

Recuperación adicional de los bloques:
- MiAsistService$5 líneas 221–225: establece STAGE_REMOTE_CONNECTING con ERR_CONNECTED_FAILED.
- Líneas 310–314: establece STAGE_REMOTE_CONNECTED con ERR_NONE.
- MiAsistService$1 líneas 87–105 / 125–143: transiciones reportadas STAGE_REMOTE_DISCONNECTED con ERR_NONE o STAGE_AUTH_USER_AGREE con ERR_NONE.
- MiAsistService$1 líneas 148–174: carga iconos/BRItems y llama startRestoreCommand().
- MiAsistService$1 fue creado alrededor de MiAsistService.smali:2645–2649 tras STAGE_USER_AUTHORIZING (2622).
- ERR_CONNECTED_FAILED aparece en MiAsistService.smali:2782.
- STAGE_REMOTE_DISCONNECTED vuelve a aparecer en MiAsistService.smali:2337.

**Interpretación limitada:** estos nombres representan códigos/etapas de la comunicación y del workflow MiAsist. No equipararlos con BRItem.state, BRItem.error ni mLastError global de BRService. El valor ERR_NONE y la transición de etapa no prueban por sí solos que el usuario o peer esté autenticado.

## 3. MiAsistService$6 y protocolo de envío del descriptor

La relación recuperada es:
1. MiAsistService invoca sendAllBRItemsDescriptor().
2. Se crea MiAsistService$6(MiAsistService,String).
3. El hilo $6 se inicia con start().
4. El callback usa estado/dispositivo, fecha, tamaño y mAllBRItems; coordina sincronización de iconos.
5. En la ruta descrita se invoca doSendFile(String).
6. Una rama puede asignar ERR_WRITE_DESCRIPTOR.

No se conserva el cuerpo completo de sendAllBRItemsDescriptor() ni de doSendFile(String), por lo que no se determina:
- bytes exactos y estructura del descriptor;
- si el envío es por socket, Binder, fichero o combinación;
- framing, checksum, longitud, encoding o autenticación;
- orden completo de envío de descriptor frente a archivos;
- condiciones precisas de ERR_WRITE_DESCRIPTOR.

## 4. BRService.routeBackupData y runOnSendingThread

**USER-PASTED-SOURCE del 16-11-2026:**

### 4.1 routeBackupData

Firma recuperada:
routeBackupData(Context,String,int,ParcelFileDescriptor,OutputStream)

Ubicación reportada: BRService.smali líneas 5967–5971.

Comportamiento descrito en el bloque:
- escribe cabeceras MIUI/Android;
- retransmite datos desde socket hacia OutputStream;
- escribe una bandera final (writeEndFlag);
- hace flush().

**Límite:** el rango 5967–5971 es breve y puede representar solo una porción del método. No se ha recuperado el cuerpo íntegro, protocolo exacto, significado del entero, creación del socket, tratamiento de errores ni validación de cabeceras. No afirmar que routeBackupData sea el mismo canal que doSendFile sin seguir callers y extremos.

### 4.2 runOnSendingThread

Firma recuperada:
runOnSendingThread(Runnable)

Ubicación reportada: BRService.smali líneas 5461–5466.

Comportamiento:
- crea HandlerThread con nombre "SendingThread";
- crea Handler asociado;
- publica el Runnable mediante post().

Esto acredita una cola de ejecución asociada al hilo de envío en el bloque observado. No acredita el contenido del Runnable ni su relación exacta con routeBackupData.

## 5. Identidad Binder y UID: límites de lo recuperado

- BRService.smali:7380 contiene una invocación a Binder.clearCallingIdentity(), recuperada como referencia de fuente pegada el 16-11.
- No se conserva en el contexto actual el bloque completo que la rodea: caller, posición de clearCallingIdentity()/restoreCallingIdentity(), token almacenado ni operaciones ejecutadas bajo identidad limpia permanecen UNKNOWN.
- No concluir que la APK elimina controles de autorización o eleva privilegios por esa llamada aislada; clearCallingIdentity() cambia temporalmente la identidad Binder del hilo y su impacto depende del bloque completo y del finally/restore.
- El manifest reporta sharedUserId="android.uid.backup". En una conversación anterior se distinguió ese nombre de un UID numérico 6100, pero no se conserva una lectura primaria de PackageManager, dumpsys o manifest que permita confirmar la asignación numérica efectiva. Por tanto, 6100 queda como dato histórico NO VERIFICADO, no como UID confirmado de la APK.
- No confundir sharedUserId nominal, UID Linux asignado en instalación, UID del proceso, Binder calling UID y permisos/grants efectivos.

## 6. Relación con el pipeline BRService/IBRService

La cadena estática recuperada contiene dos canales conceptualmente distintos:
- IBRService Binder: interfaz de control/consulta con 14 transacciones ya inventariadas en evidencia 06/45.
- Transferencia de datos: MiAsistService usa ITransFileService y callbacks/etapas de transferencia; BRService tiene métodos de envío como routeBackupData y runOnSendingThread.

La evidencia disponible todavía no demuestra qué método concreto mueve cada archivo ni si todos los flujos comparten socket o descriptor. No atribuir a IBRService las funciones de transferencia de bytes: no hay transacción startRestoreCommand en las 14 operaciones identificadas.

## 7. Pendientes exactos

1. Recuperar cuerpo completo de MiAsistService.doSendFile(String), sendAllBRItemsDescriptor() y MiAsistService$6.
2. Recuperar cuerpo real de MiAsistService$7; hasta entonces solo consta constructor y ejecución mediante executeOnExecutor().
3. Recuperar bloques completos de MiAsistService$5 alrededor de errores 223, 507 y 737, y callers que actualizan device stage/error.
4. Recuperar routeBackupData() completo y callers; distinguirlo de doSendFile() hasta demostrar conexión.
5. Recuperar runOnSendingThread() y Runnable concreto que se publica.
6. Recuperar bloque BRService.smali alrededor de clearCallingIdentity() y su pareja restoreCallingIdentity().
7. No afirmar UID=6100 sin evidencia primaria.
8. No repetir la extracción de IBRService transaction map ni el inventario de Parcelable ya preservados.
9. Solo lectura estática; no iniciar servicios, transferencia, backup ni restore.

**Conclusión:** se recuperó una parte adicional del pipeline de transferencia MiAsist y de las etapas/errores de comunicación, además de dos anclas del subsistema de envío BRService. La transferencia efectiva, el protocolo de descriptor, la relación entre los canales y el contexto de clearCallingIdentity permanecen incompletos. Estado general: INCOMPLETE.
