# Evidencia 47 — Reconciliación de conexión Binder y estados de restauración

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Base: índice maestro v0.31; evidencias 02, 03–15, 33–46.
- Clasificación: RECONCILIACIÓN DOCUMENTAL / RECOVERED-CHAT + USER-PASTED-SOURCE.
- No se ejecutaron comandos en el dispositivo, servicios ni operaciones Backup/Restore.
- No es LOCAL-VERIFIED por relectura de la extracción Termux en esta sesión.

## 1. Corrección importante del estado de conexión Binder

La evidencia 45 dejó como pendiente seguir MiAsistService hasta onServiceConnected(). La evidencia 02 ya contiene este hallazgo histórico directo:

- MiAsistService$2.smali:38–106: onServiceConnected() invoca IBRService$Stub.asInterface(IBinder), guarda el resultado en mBRService y registra el listener.
- onServiceDisconnected() limpia mBRService.
- El usuario también pegó la declaración `.method public static asInterface(Landroid/os/IBinder;)Lcom/miui/backup/service/IBRService;` (16-11-2026 16:47:53Z). No se recuperó el cuerpo: `queryLocalInterface`, comparación de descriptor, construcción de Proxy y returns siguen sin fuente literal.
- Manifest, líneas 107–113 compartidas directamente por el usuario el 16-11: MiAsistService declara `android:process=":remote"`; BRService y TransFileService no muestran atributo `android:process` en sus declaraciones de servicio. Los tres muestran `exported="false"` y `foregroundServiceType="systemExempted"`.
- El fragmento recuperado de manifest (líneas 99–130) no incluye la etiqueta de apertura `<application>` ni permite confirmar un `android:process` a nivel de aplicación. Por ello, la ausencia de atributo en la declaración de BRService no basta para declarar su proceso efectivo sin comprobar la herencia desde `<application>`. La conclusión es condicional: si `<application>` no fija proceso, BRService hereda el proceso predeterminado del paquete y queda separado de MiAsistService `:remote`; si `<application>` fija `:remote`, BRService puede heredar ese mismo proceso. El fragmento disponible no distingue ambas configuraciones.
- MiAsistService.smali:675–707: bindBRService() construye Intent explícito a BRService, agrega extra_is_from_miasist=true, llama startService() y bindService().
- MiAsistService.smali:1600–1620: caller de IBRService.getBRItems().
- MiAsistService.smali:2939–2942: ruta reportada de BRService.startRestoreCommand(...,4), seguida de bindBRService().
- MiAsistService.smali:2862–2865: llamada reportada a BRService.startBackupCommand(...).

**Corrección de estado:** no está pendiente localizar ni demostrar la existencia de onServiceConnected() ni su llamada a Stub.asInterface(); eso ya está RECOVERED-DIRECT-CHAT en evidencia 02. Lo que sigue sin resolverse es:
1. recuperar el cuerpo exacto de IBRService$Stub.asInterface(IBinder); el callback MiAsistService$2, su asignación a mBRService y la desconexión ya están documentados en evidencias 02/55;
2. establecer si el Binder devuelto es local (rama queryLocalInterface) o remoto (rama Proxy) para la configuración de procesos de esta APK. El caller de `getBRItems()` ya está identificado en evidencia 59;
3. conectar ese resultado con el caller getBRItems() en la ruta concreta, sin inferir una ejecución solo por la presencia de Proxy;
4. recuperar la etiqueta `<application>` del manifest para determinar si fija un proceso por defecto; después resolver el proceso efectivo de BRService (su declaración de servicio no muestra `android:process` en el fragmento disponible) y compararlo con MiAsistService `:remote`. Solo entonces concluir si la conexión cruza procesos y si se espera Proxy.

## 2. Activación del servicio y canal Binder: dos mecanismos distintos

La secuencia recuperada no debe comprimirse como una única llamada:
- Intent explícito + startService(): activa/ordena la ruta de comando de BRService.
- bindService() + ServiceConnection: obtiene el IBinder.
- Stub.asInterface(IBinder): convierte el Binder en la interfaz local o Proxy según la implementación y el Binder recibido.
- mBRService.getBRItems(): invoca la interfaz obtenida.

La evidencia 02 también conserva BRService.onBind() alrededor de línea física 18672 y onStartCommand() alrededor de 19067. onBind() devuelve mBinder según el contexto histórico; onStartCommand() procesa CMD_RESTORE. No equiparar la activación del servicio con el transporte de una transacción Binder.

## 3. Corrección del orden de argumentos setState(IIII)

La evidencia 11 conservó inicialmente un conflicto entre el resumen antiguo incorrecto setState(4,0,v2,v14) y la llamada final verdadera.

La evidencia 12 resuelve el conflicto con la instrucción Smali exacta compartida por el usuario:

    const/4 v4, 0x4
    const/4 v5, 0x0
    invoke-static {v0, v4, v2, v5, v14}, ...->setState(IIII)V

Con v2=12, la llamada es inequívocamente:

    setState(4,12,0,v14)

Para los errores globales recuperados:
- Themes / Theme Manager: v14=8 → setState(4,12,0,8).
- Flash Drive sin USB disponible: v14=9 → setState(4,12,0,9).

**La formulación anterior setState(4,0,v2,v14) es una transcripción errónea y no debe reutilizarse.** La evidencia 11 debe leerse junto con su resolución explícita en evidencia 12.

### 3.1 Semántica de setState(IIII)

El cuerpo reportado de BRService.setState(IIII):
- p1 → mState.
- p2 → mWorkingStage.
- p3 → mUserInterruptAction.
- p4 → mLastError, únicamente si el valor previo de mLastError es cero.
- Si p2==7, libera WakeLock.
- Si p2==10 o p2==12, o p3==2, y mBRItems contiene elementos, cada uno recibe BRItem.state=3 y BRItem.error=9.

Por ello, setState(4,12,0,8) puede dejar mLastError=8 y a la vez escribir BRItem.error=9 en los ítems. No es contradicción: son capas diferentes. Tampoco implica que el error global 8 sea error 9.

La sobrecarga de tres argumentos delega conservando p1,p2, usando el mUserInterruptAction vigente como tercer argumento y pasando su tercer argumento como cuarto/error candidato.

## 4. Causalidad global de errores 8 y 9

Evidencia 05 conserva:
- Themes: paquete com.android.thememanager; marca isRestoreTheme; si v8!=0, asigna v4=0xa y v16=0x8.
- Flash Drive: USB no disponible; asigna v4=0xa y v16=0x9.
- Final: updatePkgStae(v14), handleTaskFinish(4,12,v14,mBRItems), y showFinishNotification.
- Extras de notificación: extra_last_task_state=4, extra_last_workingstage=12, extra_last_errcode=8/9, extra_last_britems=mBRItems.
- handleTaskFinish(IIILjava/util/ArrayList;) registra argumentos, llama a showFinishNotification y a stopSelf().
- getErrStringRes(II) conmuta por segundo argumento (código de error):
  - 8 → 0x7f12014b, err_router_disconnected, “Check your router's connection and try again.”
  - 9 → 0x7f120166, flash_drive_connection_failed, “USB drive disconnected”.

Otro caller separado, BRService.smali:5562–5567, fue reportado como handleTaskFinish(3,12,9,mBRItems). No fusionar la ruta de estado global 3/error 9 con la de estado 4/error 8 o 9.

La cadena causal sigue INCOMPLETA: falta releer los bloques completos y demostrar si existen productores adicionales de errores globales 8/9.

## 5. Reconciliación de BRItem.state=6

La aparente discrepancia entre física 2351 y `.line 1735` quedó resuelta documentalmente por la recuperación directa preservada en evidencias 11 y 15:
- línea física 2351 contiene la escritura `BRItem.state=6`;
- la misma instrucción corresponde a la directiva Smali `.line 1735`;
- el contexto `.line 1733–1735` es `waitingForFilesTransingEnd()`, lectura/comparación del estado y escritura de 6 para `files_for_backup`.

No son dos escritores en `BRService$5`. Evidencia 53 reporta además otro writer en `BRService.smali:16787–16791`, clase/contexto distinto. La enumeración global de productores sigue sujeta a cobertura del árbol y cotejo local/hash; no reabrir el falso conflicto de coordenadas.

El adapter cuenta state=1 y state=6 como éxito y considera 1, 3 y 6 terminales en `initData()`. La semántica específica de estado 6 fuera de los contextos documentados sigue pendiente.

## 6. Reconciliación de restoreFiles y semántica de arrays

Evidencia 33 conservó una interpretación inicial errónea de iput-object p3 como asignación directa a mBRItems. Evidencia 34 la corrigió al recuperar la firma:

    .method private restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V

Para un método de instancia:
- p0: receptor BRService.
- p1: BRItem[].
- p2: BackupDescriptor.
- p3: entero tipo.

La implementación guarda p3 en mBakFilesType:I; luego reutiliza el registro para crear un ArrayList desde Arrays.asList(p1) y asigna esa lista a mBRItems. La lectura anterior de iput-object p3 sin contexto de registros era incorrecta.

Callers reportados en BRService.smali:19483 y :19519. El array generado por toArray(new BRItem[]) es contenedor nuevo, pero conserva las referencias de los elementos. restoreFiles construye otro contenedor ArrayList sin clonar los elementos.

El getter getBRItems() crea un array nuevo; elementos ordinarios mantienen referencias a los BRItem internos, mientras files_for_backup se reconstruye en un BRItem nuevo con copia selectiva y referencia compartida a localFileList dentro del proceso del servicio.

La identidad no se traslada automáticamente a través de Binder: el Proxy reconstruye BRItem[] mediante createTypedArray(BRItem.CREATOR).

## 7. Otros hechos recuperados que no deben perderse

### 7.1 MiAsistService / manifest

Evidencia 06:
- Paquete com.miui.backup.
- sharedUserId="android.uid.backup".
- android:allowBackup="false".
- Permisos manifest reportados: android.permission.BACKUP, INSTALL_PACKAGES, MANAGE_EXTERNAL_STORAGE, INTERACT_ACROSS_USERS_FULL.
- miui.permission.BACKUP_PROXY y miui.permission.BACKUP_FILE_SERVER declarados signatureOrSystem.
- MiAsistService, BRService, TransFileService reportados exported=false.
- MiAsistService proceso :remote, acción miui.intent.action.MIASIST_PROXY.
- ApkInstallReceiver y AiActionProvider reportados exported; authority del provider com.miui.backup.
- isActionParamsValid lee mimover_action y client_port; acciones mi_backup y mi_restore; puertos aceptados 57447–57449.
- isOwnerSpace() reportado como true incondicional en el método examinado. Esto no prueba autenticación/autoridad.
- No inferir UID/grants efectivos ni alcanzabilidad externa solo del manifest.

### 7.2 BRService$5 y restauración

- startRestore() crea BRService$5 como hilo RestoreThread.
- Inicializa listas mReceivedRestoringItemFiles y mEverTriedBaks, llama bindTransFileServiceLocked() y puede llamar prepareRestoringItems().
- Espera mRemoteConnectedLatch; fallo de conexión: setState(...,7,...), espera, log not connected to remote, mIsAborted=true; éxito vuelve a etapa 3.
- Preparación: lee encryptedPwd, llama BRManager.setFutureTask(); falta de espacio aborta; sin red se reporta resultado local 4; contraseña descifrada vacía resultado local 1. No tratar estos valores como códigos globales sin seguir sus argumentos.
- Restauración local itera localFileList; copyFileFromStream false registra copyOneFile error, file lost; excepciones registran copyFileFromStream error y el bucle continúa en la rama descrita.
- BRItem.error=10 si falta bakFile y v5==null; error=1 si existe y v5==null; con v5!=null esa rama no asigna error nuevo.
- state=3 en la ruta de restore fallida; onError(...,6), onRestoreEnd; state=1 en éxito normal.
- setState(4,8,0) es una etapa intermedia; no confundir con el final de etapa 12 y errores 8/9.
- Secuencia final recuperada: mReconnector.quit(), ITransFileService.stopAll(0), unbind de TransFileService, StorageMonitor.stopMonitor(), setState(4,v2,0,v14), limpieza de getTransTempBackupRootPath(), setDescriptor(null), handleTaskFinish(...), releaseWakeLock().

### 7.3 Auditorías de recuperación GitHub

- Evidencia 13: auditoría recursiva de árboles de 134 ramas de aldea-ia; no se encontró copia Smali directa en las ramas preexistentes. La rama de investigación se incluyó y contiene el expediente actual.
- Evidencia 14: búsquedas de mensajes de commits para MIUI/Smali sin resultados pertinentes; dos resultados genéricos “backup” eran documentos Nexo ajenos.
- Evidencia 03: auditoría del repositorio antecedente D-RB-09; su árbol main no contenía APK/Smali; 27 commits de historial de G08_NON_OPERATIONAL_EVIDENCE_PLAN.md.
- Evidencia 04: auditoría de manual-supervivencia-nuclear y nexo-grand-mission-01; no encontró archivos directos de esta investigación.
- Estos resultados son auditorías de refs/paths y mensajes de commit, no prueba de inexistencia en objetos Git inalcanzables, adjuntos, archivos locales o transcripciones no recuperadas.

## 8. Prioridad técnica corregida — no repetir

Orden actualizado:
1. No volver a localizar MiAsistService$2.onServiceConnected(); ya está localizado y su uso de Stub.asInterface() consta en evidencia 02.
2. Recuperar/releer solo el cuerpo de IBRService$Stub.asInterface(IBinder) y MiAsistService$2, más el atributo android:process de BRService, para resolver local vs Proxy.
3. Conectar esa rama con el caller MiAsistService.smali:1600–1620 (getBRItems()).
4. Cotejar las discrepancias de coordenadas restoreFiles() (línea 12672 frente a 1351–1367) contra descriptor y archivo exacto; evidencia 34 resuelve registros y tipo, pero no normaliza esa discrepancia de coordenadas.
5. Reconciliar todos los usos de mBakFilesType y BRService$5.run(); el mapping mejor soportado en evidencia 02 es 2→v8=1, 3→transfer, 5→Flash Drive, 1→local. No reutilizar la paráfrasis incorrecta que intercambiaba 2/3/5.
6. Resolver si la línea física 2351 y .line 1735 refieren al mismo state=6; recuperar el contexto de la otra escritura state=6 reportada.
7. Continuar causalidad global 8/9 y verificar todos los callers de handleTaskFinish, sin confundir estado global, etapa, BRItem.state, BRItem.error y códigos de listener.
8. No solicitar comandos nuevos hasta terminar la reconciliación de los documentos y bloques ya preservados.

**Conclusión:** el expediente contiene una conexión Binder histórica más completa de lo que el master resumía. La llamada onServiceConnected → Stub.asInterface → mBRService está recuperada; lo desconocido es qué rama local/Proxy se materializa para la configuración real de procesos y cómo la consume el caller. La investigación permanece INCOMPLETA y exclusivamente estática.
