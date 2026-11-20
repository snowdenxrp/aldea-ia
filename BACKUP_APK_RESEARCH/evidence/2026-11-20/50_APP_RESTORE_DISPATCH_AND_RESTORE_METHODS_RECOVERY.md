# Evidencia 50 — Recuperación de despacho de restauración de aplicaciones y métodos BRService

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: mensajes y salidas Smali compartidos el 16-11-2026; grep/path summaries recuperados de esa conversación.
- Clasificación: USER-PASTED-SOURCE para restoreAppData y CMD_RESTORE; RECOVERED-CHAT para referencias de grep/callers.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. restoreAppData(String,int,int)

**USER-PASTED-SOURCE del 16-11-2026:**
- Definición reportada en BRService.smali:12550.
- Directivas Smali reportadas alrededor de líneas 2188–2207.
- Deshabilita el paquete indicado por p1; el tercer parámetro p3 se utiliza como userId.
- Deriva origen/destino de FullBackup.
- Llama a BRManager.moveData y después moveAndFixData.
- Llama AppUtils.setAppState(...,1,p3).
- En excepción registra "move data error" y actualiza el estado.
- Si el movimiento falla, registra el fallo y llama onError(p1,p2,1).

**Límite:** la salida original completa no está reproducida en este addendum; conservar estos efectos como fuente pegada en conversación. No inferir permisos, rollback, validación o atomicidad del movimiento sin el cuerpo íntegro.

## 2. onBind, onCreate, onStartCommand y despacho CMD_RESTORE

**USER-PASTED-SOURCE del 16-11-2026:**
- BRService.onBind() alrededor de línea física 18672.
- BRService.onCreate() alrededor de 18681.
- BRService.onStartCommand() alrededor de 19067.
- Caller sintético reportado alrededor de líneas 2085–2088.
- Rama de CMD_RESTORE alrededor de 19362–19379.
- La rama asigna BackupApp.mIsBackupTask y mIsFromMiAsist a partir de extra_is_from_miasist.

La evidencia 06 conserva que onBind devuelve mBinder y que onStartCommand procesa el Intent CMD_RESTORE. La presencia de esos entrypoints no demuestra que un caller externo pueda iniciar el servicio: manifest reporta BRService exported=false.

## 3. startRestoreCommand y extras

Firmas recuperadas:
- startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,int)
- startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,String,int,boolean)

La sobrecarga de siete argumentos fue pegada alrededor de BRService.smali:15220–15267:
- asigna mIsReStartCommand desde p6;
- crea Intent explícito hacia BRService;
- fija acción CMD_RESTORE;
- añade descriptor y descriptor directory;
- incluye BRItems cuando corresponde;
- incluye ZIP path;
- si p5==4, marca extra_is_from_miasist=true y pasa tipo 3 en extra_bakfiles_type;
- inicia el servicio.

La anomalía de la sobrecarga de cinco argumentos se conserva en evidencia 49: aparece una auto-invocación, pero no se afirma bug funcional hasta leer descriptor/cuerpo completo.

## 4. restoreStreamSplitApk

Referencias históricas de grep:
- Definición reportada en BRService.smali:13035.
- Caller desde BRService$5.smali:1899.
- Dentro del método se reportó llamada a startRestoreCommand en BRService.smali:13409.

No se recuperó cuerpo íntegro de restoreStreamSplitApk en el contexto disponible. Mantenerlo como ruta de restauración de split APK candidata, sin inferir el tratamiento exacto de archivos, estado o errores.

## 5. Callers y tareas BRService$5 / BRService$11

Referencias de grep recuperadas:
- BRService$5 llama prepareRestoringItems alrededor de líneas 395 y 447.
- BRService$5 llama restoreStreamSplitApk alrededor de 1899.
- BRService$11 llama restoreAppData alrededor de 1337.
- BRService$5 tiene llamadas relacionadas con restauración de medios alrededor de 2419, 3006 y 3561.
- BRService$5 y BRService$11 se relacionan con métodos ya conservados de restauración local/media, pero el grep no incluye sus cuerpos ni resuelve los argumentos.

## 6. PerformAdbRestoreTask y RestorePolicy

La búsqueda histórica encontró referencias a RestorePolicy dentro de PerformAdbRestoreTask.smali en el rango reportado 1435–2050.

Los valores de enum recuperados:
- IGNORE
- ACCEPT
- ACCEPT_IF_APK

**Límite:** solo se recuperó un inventario de referencias/paths, no el cuerpo completo ni la lógica que selecciona cada policy. No inferir condiciones de aceptación, verificación de APK o alcance de datos desde el nombre del enum.

## 7. Qué no se recuperó

La conversación anterior no conservó cuerpos completos de:
- BRManager.moveData / moveAndFixData;
- restoreStreamSplitApk;
- prepareRestoringItems;
- PerformAdbRestoreTask;
- BRManager.restorePackage;
- mRestoreTaskExecutor y su configuración;
- ZIP/zipStreamReader y la relación completa con descriptor;
- StorageMonitor.startMonitor().

El resumen del 17-11 indica que el intento de extraer un bloque prioritario de BRService$5.run falló porque $F estaba vacío; el único error conservado es sed: can't read : No such file or directory. No se dispone del stdout del despacho de aplicaciones de ese intento.

## 8. Orden de continuación

1. No repetir grep de localización de métodos ya realizado.
2. Reconciliar primero descriptores y coordenadas de restoreAppData, restoreStreamSplitApk y startRestoreCommand.
3. Si el objetivo de investigación requiere cerrar la ruta de apps, solicitar después únicamente los cuerpos completos de restoreStreamSplitApk, PerformAdbRestoreTask y prepareRestoringItems que falten; no volver a extraer ArchiveHelper/Parcelable/Binder ya cubiertos.
4. Mantener separados las referencias de grep, los bloques de fuente pegados y las inferencias.
5. Solo lectura estática; no iniciar BRService ni ejecutar Backup/Restore.

**Conclusión:** se recuperó una descripción directa del movimiento de datos de restoreAppData y del Intent CMD_RESTORE, además de callers/rangos de otros métodos. La ruta de restauración de aplicaciones sigue incompleta porque los métodos de executor/policy y restoreStreamSplitApk no tienen cuerpo completo preservado aquí.
