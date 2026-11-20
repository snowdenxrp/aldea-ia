# Evidencia 49 — ArchiveHelper, restoreLocalMediaFile y rutas MiAsist/transferencia

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: mensajes del usuario con Smali/grep compartidos el 16, 19 y 20-11-2026; resúmenes históricos complementarios.
- Clasificación: mezcla de USER-PASTED-SOURCE / DIRECT-CHAT y RECOVERED-CHAT; cada sección indica su límite.
- No LOCAL-VERIFIED por relectura del checkout en esta sesión. Solo análisis estático.

## 1. ArchiveHelper.unzipFiles: firma, entrypoints y callers

**USER-PASTED-SOURCE recuperado del 19-11:**
- Sobrecarga de siete argumentos, inicio reportado en ArchiveHelper.smali línea física 1244:
  unzipFiles(File,String,IFileZipSizeChangedListener,BRItem,boolean,InputStream,List<String>)
- Sobrecarga de cuatro argumentos, inicio reportado en línea física 1959; delega a la de siete argumentos alrededor de línea 1994.
- Caller en BRService.smali:12918.
- Caller desde BRService$UnpackThread.smali:81.

La sobrecarga de siete argumentos recibe directamente un BRItem y trabaja con sus campos packageName, localFileList y totalSize. No se ha recuperado evidencia de que clone ese BRItem antes de procesarlo.

## 2. Comportamiento de extracción ZIP

**USER-PASTED-SOURCE / DIRECT-CHAT del 19-11:**
- Actualiza progreso del BRItem y notifica mediante callback utilizando el mismo objeto BRItem recibido.
- Recorre las entradas ZIP.
- Para el archivo restaurado que no existe en la condición descrita, asigna BRItem.error=1 y continúa el ciclo de entradas.
- Crea un archivo temporal .tmp; elimina un temporal existente antes de escribir.
- Escribe al temporal y trata de renombrarlo; si el rename no funciona, existe una ruta fallback de copia.
- Si el archivo final ya existe, se registra el caso correspondiente; si no existe el original, también se registra.
- Si el temporal y el archivo final tienen la misma longitud en la rama descrita, elimina el temporal.
- Agrega las rutas absolutas exitosas a la lista final (argumento p6).
- Logs recuperados: "rename file", "original file not exists", "original file exists", "restore file ... failed", "IOException continue next".
- ZipException registra "invalid Path unzip failed, And restore error", imprime stack trace y cierra ZipInputStream.
- IOException registra el error, cierra FileOutputStream en la rama descrita y continúa con la siguiente entrada.
- El método declara/propaga IOException en su contrato, aunque también maneja excepciones localmente en las ramas recuperadas.

**Límite:** no se conserva aquí el cuerpo completo literal ni todas las condiciones/orden de cada rama. No inferir que todos los errores son fatales ni que cada IOException sigue una única ruta.

## 3. Estado y error: distinción de ArchiveHelper

El resumen previo indicó expresamente que la sobrecarga de siete argumentos no escribe BRItem.state en el fragmento analizado; sí modifica progreso y BRItem.error. Esta es una conclusión acotada al cuerpo compartido, no a todos los métodos de restauración.

No confundir:
- BRItem.error=1 escrito durante extracción;
- estados 8/1/9 reportados por restoreLocalMediaFile antes/después de la extracción;
- state/error globales de BRService;
- errores de listener enviados a callbacks.

La identidad de referencia importa: dentro de esta llamada, el método recibe BRItem directamente y el callback recibe el mismo objeto en el proceso que ejecuta unzipFiles. Esto no demuestra identidad compartida entre procesos Binder.

## 4. BRService$UnpackThread

**USER-PASTED-SOURCE del 19-11:**
- El hilo llama a la sobrecarga de cuatro argumentos de unzipFiles; referencia reportada en BRService$UnpackThread.smali línea 81.
- Captura Exception y registra "Exception".
- Registra "UnpackThread delete file <absolutePath>".
- Ejecuta File.delete() sobre el archivo de la ruta absoluta descrita.

No se infiere si delete() tuvo éxito; el retorno debe revisarse en el Smali para afirmarlo.

## 5. restoreLocalMediaFile

**USER-PASTED-SOURCE / continuidad de conversación:**
- BRService.smali:12772: inicio reportado de restoreLocalMediaFile(BRItem,boolean,InputStream).
- Deriva backup_<suffix>.zip desde mCurrentBackupRootPath.
- Utiliza Utils.getZipSuffixType(packageName,type).
- Si falta ZIP y InputStream es null: state=3, error=7, notificación y retorno.
- Si hay ZIP o InputStream: state=8 y llama a ArchiveHelper.unzipFiles().
- Al finalizar: state=9 si abortado; state=1 en caso contrario.
- La ruta ZIP se relaciona con el tipo/suffix y la raíz actual de backup; no inventar el sufijo concreto sin recuperar los argumentos y el retorno del helper.

## 6. MiAsistService: cadena de tareas e inner classes

**USER-PASTED-SOURCE del 16-11:**
- MiAsistService$1, después de autorización, llama en orden a startLoadAppIconsTask(), startLoadBRItemsTask() y startRestoreCommand().
- MiAsistService$2 mantiene IBRService en mBRService; su onServiceConnected() utiliza IBRService$Stub.asInterface(), registra listener y su desconexión limpia la referencia (también preservado en evidencias 02/47).
- MiAsistService$4 recibe ITransFileService, lo guarda en mTransService, establece STAGE_TRANS_SERVICE_BINDED y ERR_NONE, y registra ITransFileServiceListener$Stub.
- MiAsistService$5 comprueba/gestiona STAGE_BRITEMS_LOADING y las transiciones de etapas.
- MiAsistService$8 contiene/ejecuta tareas:
  - loadAppBRItems
  - loadFileBRItems
  - updateAppBRItemSize
  - updateItemTotalSize
  - updateBakFilePath
  Accede a ITransFileService, syncers, mCurrentDate, mCurrentRootPath y mTotalSize; utiliza doInBackground(), onPostExecute() y onProgressUpdate().
- En MiAsistService se reportó instanciación de $6, $7 y $8; $7/$8 se ejecutan con executeOnExecutor(), y se llama bindBRService().
- Etapas recuperadas: STAGE_PARSING_SELECT_DESCRIPT, STAGE_USER_AUTHORIZING, STAGE_REMOTE_CONNECTING, STAGE_REMOTE_CONNECTED, STAGE_SELECT_DESCRIPT_RECEIVED, STAGE_BRSERVICE_BR_START, STAGE_BRITEMS_LOADING, STAGE_BRSERVICE_TRANS_BINDING, STAGE_TRANS_SERVICE_BINDED y STAGE_END_DESCRIPTOR_SENDED.

Los nombres y secuencia anteriores proceden de bloques pegados y resúmenes previos; no se ha reconstruido en este addendum el grafo completo de cada callback ni el significado de todos los códigos.

## 7. startRestoreCommand: firmas y discrepancia de coordenadas

**USER-PASTED-SOURCE recuperado del 16-11:**
Firmas identificadas:
- startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,int)
- startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,String,int,boolean)

En una extracción de BRService.smali se reportaron:
- overload de cinco argumentos alrededor de línea 1087;
- overload de siete argumentos alrededor de línea 1091.

La sobrecarga de cinco argumentos aparece invocándose a sí misma. La anomalía está reportada directamente, pero no se declara aquí como recursión funcional demostrada sin el método completo y sus descriptores exactos.

La sobrecarga de siete argumentos:
- establece mIsReStartCommand desde p6;
- construye Intent con BRService.CMD_RESTORE;
- incluye extra_descriptor y extra_descriptor_dir;
- incluye extra_britems cuando corresponde;
- incluye extra_zip_file_path;
- cuando p5==4, añade extra_is_from_miasist=true y asigna tipo 3 a extra_bakfiles_type;
- llama startService().

Otra extracción posterior ubicó la sobrecarga de siete argumentos alrededor de BRService.smali:15220 y la ruta de cinco argumentos en referencias 15199–15215. La diferencia entre 1087/1091 y 15199/15220 probablemente corresponde a coordenadas de distintas extracciones/archivos o a una confusión histórica; no normalizar sin identificar el archivo exacto y el descriptor. Evidencia 46/47 conserva la segunda pareja como coordenadas históricas.

También se reportó restoreAppData(String,int,int) alrededor de BRService.smali:12550.

## 8. RetransferUtils / restoreTransfering

Se recuperó una referencia histórica:
- RetransferUtils.smali:154 llama a restoreTransfering(...).

Otros resúmenes mencionan una cadena RetransferUtils → restoreTransfering → startRestoreCommand. No se conserva aquí el cuerpo completo ni el descriptor/argumentos del caller. Mantenerlo como ruta candidata recuperada, no como reconstrucción cerrada.

## 9. Pendientes y no repetición

1. No volver a extraer el inventario de Parcelable ni la tabla Binder ya documentados.
2. Si hace falta precisión de unzipFiles, recuperar solo el cuerpo 1244–1958 y sus callers; el hallazgo de referencia directa/errores ya está preservado.
3. No inferir éxito de File.delete() por la mera llamada.
4. No declarar que ArchiveHelper modifica state si el fragmento recuperado solo muestra error/progreso.
5. No asumir que la sobrecarga de cinco argumentos es un bug sin leer el método completo.
6. Resolver coordenadas alternativas de startRestoreCommand (1087/1091 frente a 15199/15220) por archivo/descriptor, no mezclarlas.
7. Completar la ruta RetransferUtils/restoreTransfering solo si resulta necesaria para la pregunta técnica central.
8. Solo lectura estática; no ejecutar servicios, backup o restore.

**Conclusión:** queda preservada una cantidad sustancial de análisis de extracción ZIP, mutación de BRItem, callbacks, tareas MiAsistService y construcción de CMD_RESTORE. Persisten vacíos de cuerpos completos, coordenadas contradictorias y retorno real de operaciones de archivos.
