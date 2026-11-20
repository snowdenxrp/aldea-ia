# Evidencia 58 — BRService$5.run(), rutas de restore y firma de restoreFiles

- Fecha de consolidación: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: fragmentos Smali pegados por el usuario el 17-11-2026 y referencias recuperadas posteriormente. Corrección de procedencia del 20-11: la variante de descriptor array no procede de un mensaje del usuario ni de Smali literal; apareció únicamente en una respuesta anterior del asistente.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para la firma de restoreFiles, anclas de llamadas y secuencia inicial de run(); RECOVERED-CHAT para el mapa consolidado.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. Procedencia y estado de la firma BRService.restoreFiles

La evidencia 34 (19-11-2026) conserva el bloque Smali pegado directamente por el usuario:

    .method private restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V
    .locals 4

El cuerpo asociado, también preservado en evidencia 34, usa p1 como array BRItem[], p2 como descriptor singular `com.miui.backup.data.BackupDescriptor` y p3 como int/mBakFilesType. Muestra la construcción de un ArrayList a partir de Arrays.asList(p1), y su asignación a `mBRItems`.

**Corrección crítica de procedencia:** una revisión de la búsqueda histórica determinó que la supuesta segunda declaración:

    restoreFiles([Lcom/miui/backup/service/BRItem;[Lcom/miui/backup/BackupDescriptor;I)V

no aparece en un mensaje del usuario recuperado ni en un bloque Smali pegado. Esa variante fue introducida por una respuesta anterior del asistente y luego propagada como si fuera una recuperación directa. Por tanto, debe clasificarse **PRIOR-ASSISTANT-OUTPUT / UNVERIFIED**, no USER-FACT ni DIRECT-CHAT. No constituye evidencia primaria de una segunda firma ni de un conflicto real entre dos builds.

Las referencias a BRService.smali:19483 y 19519 también fueron repetidas en resúmenes anteriores, pero los invokes literales completos no se han recuperado en el contexto actual. No usarlas para confirmar descriptor ni aridad hasta leerlas.

**Estado corregido:** `DIRECT-CHAT / PRIMARY-SOURCE-PRESERVED; LOCAL-UNVERIFIED` para la firma singular de evidencia 34. La alternativa array queda `UNSUPPORTED-PRIOR-ASSISTANT-OUTPUT`. No hay base documental suficiente para mantener `SIGNATURE-CONFLICT`; sigue pendiente verificar la firma contra el archivo local exacto, su hash y la extracción/build correspondiente.

La semántica p1/p2/p3 y construcción de ArrayList descrita en evidencia 34 aplica al bloque singular que el usuario compartió. No extrapolarla a una firma alternativa no sustentada.

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

1. Verificar en el archivo local exacto la declaración y cuerpo de `restoreFiles()` alrededor de 12672, registrando SHA-256, ruta y origen/build de la extracción.
2. Leer las invocaciones 19483/19519 y mapear argumentos reales.
3. Recuperar bloques de `BRService$5.run()` en torno a 1899, 1951–2079, 2419, 3006 y 3561.
4. Reconstruir las ramas de flags `mBakFilesType` sin confundirlas con estado de item.
5. Seguir `PerformAdbRestoreTask` y `BRManager.restorePackage()` estáticamente; no ejecutar.
6. Mantener `restoreAppData` como método separado de las llamadas reportadas en run().
7. Solo lectura estática.

**Conclusión:** la única firma con soporte primario recuperado es `restoreFiles(BRItem[],com.miui.backup.data.BackupDescriptor,int)` en evidencia 34. La supuesta variante array provino de una respuesta anterior del asistente y queda descartada como evidencia primaria. La firma singular sigue pendiente de verificación LOCAL-VERIFIED contra el archivo/hash de extracción. BRService$5.run() inicia el restore con wake lock/BMS/StorageMonitor y coordina restauración de APK, paquetes y medios mediante executor y llamadas específicas. El mapa de ejecución está incompleto y no prueba éxito runtime.
