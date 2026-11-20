# Evidencia 58 — BRService$5.run(), rutas de restore y firma de restoreFiles

- Fecha de consolidación: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: mensajes del usuario del 17-11-2026 y coordenadas Smali pegadas el 20-11-2026.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para la firma de restoreFiles, anclas de llamadas y secuencia inicial de run(); RECOVERED-CHAT para el mapa consolidado.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. Conflicto de firmas reportadas para BRService.restoreFiles

La evidencia 34 (19-11-2026) preserva una declaración Smali pegada directamente por el usuario:

    .method private restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V

Su descriptor es restoreFiles(BRItem[],com.miui.backup.data.BackupDescriptor,int). El cuerpo asociado usa p2 como descriptor singular y p3 como int/mBakFilesType. Los callers preservados en evidencia 34 pasan v0, v6, v3 y v5, v6, v3 respectivamente.

Una recuperación posterior de un mensaje del usuario del 20-11 reporta para BRService.smali:12672 otra declaración:

    restoreFiles([Lcom/miui/backup/service/BRItem;[Lcom/miui/backup/BackupDescriptor;I)V

Este segundo descriptor es restoreFiles(BRItem[],com.miui.backup.BackupDescriptor[],int), con un array de BackupDescriptor y además paquete distinto (com.miui.backup frente a com.miui.backup.data).

**Conflicto no resuelto:** ambas referencias se atribuyen a BRService.smali:12672, pero no son el mismo descriptor. No se debe sustituir la evidencia 34 ni declarar que la firma array es la correcta hasta determinar si:
- proceden de builds/versiones distintas del APK;
- las rutas/archivos Smali pertenecen a extracciones distintas;
- una referencia de clase o descriptor se transcribió mal;
- existe otra definición/overload y una de las coordenadas no es la línea física correcta.

Invocaciones adicionales reportadas en la recuperación posterior: BRService.smali:19483 y 19519. No asociarlas a uno u otro descriptor hasta leer el invoke completo.

**Estado:** SIGNATURE-CONFLICT / UNKNOWN-STOP. La semántica de p1/p2/p3 descrita en evidencia 34 sigue válida solo para el cuerpo/descriptor de esa evidencia; no extrapolarla a la firma alternativa.
## 2. BRService$5.run(): entrada al hilo de restore

El usuario pegó literalmente `.method public run()V` desde coordenada 39 de `BRService$5.smali`. Secuencia inicial recuperada:
- asigna `mBRStartTime`;
- registra el log `"startRestore"`;
- llama a `acquireWakeLock()`;
- llama a `acquireBMS()`;
- configura flags según `mBakFilesType`;
- inicia `StorageMonitor`.

Esta secuencia acredita preparación del hilo antes del procesamiento de restore. No implica que cada rama alcance todas las tareas posteriores ni que el restore finalice correctamente.

## 3. Mapa de llamadas recuperado dentro de BRService$5.run()

Anclas reportadas por el usuario:
- `restoreStreamSplitApk`: alrededor de línea 1899.
- `mRestoreTaskExecutor`: líneas 1951 y 1964.
- creación de `PerformAdbRestoreTask`: línea 1996.
- `BRManager.restorePackage(...)`: línea 2079.
- `restoreLocalMediaFile`: líneas 2419, 3006 y 3561.

También se reportó que `restoreAppData` no aparece en este mapa de `run()`. No confundir ausencia en este método con ausencia en todo BRService: existe otra definición/ancla de restoreAppData en BRService.smali alrededor de 12550.

## 4. Flags según mBakFilesType: alcance de lo recuperado

Una extracción del usuario del 19-11 reportó:
- tipo 2 → `v8=1`;
- tipo 3 → `mIsTransingTask=true`;
- tipo 5 → `mIsFlashDriveTask=true`;
- tipo 1 → `mIsLocalBackupTask=true`.

Estas asignaciones describen flags de contexto de tarea; no deben confundirse con BRItem.state ni interpretarse como enum exhaustivo. Se conservan aquí como referencia cruzada del setup de run().

## 5. Coordenadas adicionales de BRService.mBRItems

El usuario reportó lecturas de `mBRItems` en:
- 12050
- 12733
- 13610
- 14140–14151
- 16635
- 16891
- 17001–17010
- 17114
- 17170
- 17183
- 17345–17354
- 19002
- 19016
- 19025

No se recuperaron en este resumen los bloques completos ni sus métodos. No atribuir significado a cada lectura sin el contexto del método.

## 6. Límite sobre BRService$5 y RestoreThread

La descripción de `startRestore()` que crea `WeakReference`, instancia `BRService$5("RestoreThread")` y llama `start()` se conserva en evidencia 57. Este documento añade el inicio del método `run()` y sus llamadas posteriores, pero no reconstruye todos los registros, condiciones, loops ni resultados.

## 7. Pendientes

1. Recuperar el cuerpo completo de `restoreFiles(BRItem[],BackupDescriptor[],int)` en torno a 12672.
2. Leer las invocaciones 19483/19519 y mapear argumentos reales.
3. Recuperar bloques de `BRService$5.run()` en torno a 1899, 1951–2079, 2419, 3006 y 3561.
4. Reconstruir las ramas de flags `mBakFilesType` sin confundirlas con estado de item.
5. Seguir `PerformAdbRestoreTask` y `BRManager.restorePackage()` estáticamente; no ejecutar.
6. Mantener `restoreAppData` como método separado de las llamadas reportadas en run().
7. Solo lectura estática.

**Conclusión:** el método restoreFiles tiene dos descriptores históricos incompatibles reportados para la misma coordenada 12672; la firma real queda UNKNOWN-STOP hasta reconciliar build/hash/extracción. BRService$5.run() inicia el restore con wake lock/BMS/StorageMonitor y coordina restauración de APK, paquetes y medios mediante executor y llamadas específicas. El mapa de ejecución está incompleto y no prueba éxito runtime.
