# Evidencia 46 — Recuperación suplementaria de memoria y cobertura histórica

- Fecha de registro: 2026-11-20
- Repositorio: `snowdenxrp/aldea-ia`
- Rama: `backup-apk-static-research-2026-11-19`
- Base documental contrastada: índice maestro v0.29; commit `ca14bf9f68eb42e5352160771d2cb6983cfb4f7d`
- Procedencia: recuperación de conversaciones anteriores mediante contexto histórico y cotejo con el índice/evidencias disponibles.
- Clasificación: **RECOVERED-CHAT / HISTORICAL**. No LOCAL-VERIFIED; no sustituye fragmentos Smali originales.
- Alcance: consolidar anclas técnicas omitidas en resúmenes recientes, aclarar pendientes y evitar nuevas extracciones redundantes.

## 1. Regla de integridad

Esta evidencia registra únicamente datos recuperados de conversaciones y los clasifica como tales. No eleva un resumen histórico a extracción primaria. Los números de línea son referencias históricas de los archivos decodificados y deben cotejarse con la extracción local si se necesita una afirmación de precisión forense. Mantener diferenciados línea física y directiva `.line`.

## 2. Anclas de MiAsistService y conexión con BRService

Conversaciones del 16-11-2026 conservaron estas referencias:

| Archivo | Línea física | Hallazgo resumido |
|---|---:|---|
| `MiAsistService.smali` | 698, 703 | Ruta de activación y binding |
| `MiAsistService.smali` | 727, 734 | Segunda ruta de activación y binding |
| `MiAsistService.smali` | 2801–2865 | Preparación/invocación de inicio de BR y `bindBRService()` |
| `MiAsistService.smali` | 2939–2942 | Invocación de `BRService.startRestoreCommand(...)` |
| `BRService.smali` | 15199–15215 | Sobrecarga de cinco argumentos |
| `BRService.smali` | 15220–15294 | Sobrecarga de siete argumentos |

La ruta `bindBRService()` fue descrita como construcción de Intent explícito a `BRService`, inclusión de `extra_is_from_miasist=true`, llamada a `startService()` y después `bindService()`. La conexión Binder y la asignación efectiva a `mBRService` todavía deben reconstruirse en el punto de continuación de la evidencia 45.

Las clases internas recuperadas incluyen:
- `MiAsistService$1`: cadena de tareas `startLoadAppIconsTask` → `startLoadBRItemsTask` → `startRestoreCommand`; otros resúmenes la describen como callback de autorización/estado, por lo que no asignar una única función sin leer el cuerpo.
- `MiAsistService$2`: `ServiceConnection` asociado a BRService; guarda/limpia `mBRService` y registra listener.
- `MiAsistService$4`: conexión a `ITransFileService`, con etapa `STAGE_TRANS_SERVICE_BINDED`.
- `MiAsistService$5`: seguimiento de progreso/etapa, incluido `STAGE_BRITEMS_LOADING`.
- `MiAsistService$8`: tarea de carga de app/file BRItems, tamaños y rutas, con uso de `ITransFileService`.

La secuencia de tareas y las responsabilidades exactas de las clases internas son RECOVERED-CHAT; no se dispone aquí de todos sus cuerpos Smali.

## 3. IBRService y separación de rutas

Se recuperó que `IBRService.Stub` exponía 14 transacciones identificadas: getters de tipo de backup, estado, etapa de trabajo, último código de error y BRItems; abort; registro/desregistro de listener; métricas temporales; forceClose; pause; y consulta de ruta ZIP.

En el fragmento histórico examinado no se identificó `startRestoreCommand()` como transacción directa de `IBRService`. No confundir el canal Binder de consulta/control con la activación del servicio mediante Intent/`startService()`.

La evidencia 45 ya documenta específicamente la transacción 5 de `getBRItems()`, Stub, Proxy y transformación de referencias. Este addendum no duplica ni altera esos resultados.

## 4. Sobrecargas de startRestoreCommand

La sobrecarga de siete argumentos, históricamente ubicada en `BRService.smali:15220–15294`, prepara:
- `BRService.CMD_RESTORE`;
- `extra_descriptor`;
- `extra_descriptor_dir`;
- `extra_britems` cuando corresponde;
- `extra_zip_file_path`;
- `extra_is_from_miasist` cuando el argumento de origen vale 4;
- `extra_bakfiles_type`;
- llamada final a `startService()`.

Se recuperó una transformación del argumento de tipo: el valor 4 se mapea a 3 en la ruta descrita.

La sobrecarga de cinco argumentos, históricamente ubicada en `BRService.smali:15199–15215`, parece invocarse a sí misma. **ANOMALÍA NO RESUELTA**: no concluir recursión funcional/StackOverflow sin inspeccionar el cuerpo completo, overload resolution, registros y contexto del caller.

Callers históricos identificados: `MiAsistService.startRestoreCommand`, `BRService.restoreTransfering` y `RetransferUtils.smali:154`. La ruta de siete argumentos también se relacionó con `CMD_RESTORE` en `BRService.onStartCommand()`; el fragmento histórico de esa rama terminaba antes de completar validaciones, ejecución y manejo de errores.

## 5. BRItem.state, error y ProgressItemAdapter

Recuperación histórica adicional:
- `BRService$FakeBackupListenerImp`: escrituras directas reportadas `state=2` en línea física 5719, `state=3` en 5834 y `state=1` en 5921.
- `BRService$11.onCustomProgressChange()`: el argumento/código de listener `p3` se traduce a `BRItem.error`, no automáticamente a `BRItem.state`.
- Mapeo de códigos locales de listener reportado: 0→0, 3→2, 4→5, 5→6, 6→7, 8→6, 9→11, otro→1.
- Ruta de error: `state=3`; condición de reintento reportada: `mState=3`, `error=7`, `retryCount<1`.
- `ProgressItemAdapter.getSuccessfulCount()` cuenta elementos con `state=1` o `state=6`; `getFailedCount()` se calcula como total menos exitosos.
- `initData()` trata 1, 3 y 6 como estados finalizados; 1 y 6 incrementan el conteo de éxito.
- En los bloques revisados no se habían demostrado escrituras directas de `BRItem.state=7/8`.

No generalizar estas búsquedas parciales a todo el APK. No confundir códigos de listener, `error`, `progType`, `mWorkingStage` y `state`. Las referencias anteriores complementan evidencias 08/09/29 y la cronología ya existente; no las reemplazan.

## 6. restoreLocalMediaFile: secuencia recuperada

El contexto histórico de la extracción de `BRService.smali` alrededor de la línea física 12772 conserva:
1. Derivación de `backup_<suffix>.zip` desde `mCurrentBackupRootPath`.
2. Uso de `Utils.getZipSuffixType(packageName,type)`.
3. Si falta ZIP y el `InputStream` es null: `state=3`, `error=7`, notificación y retorno.
4. Si hay ZIP o InputStream: `state=8` y llamada a `ArchiveHelper.unzipFiles()`.
5. Después: `state=9` si abortado; `state=1` en caso contrario.

La llamada fue descrita con `BRService.PREF_BASE_PATH`, `zipSizeChangedListener`, `BRItem`, boolean, `InputStream` y `restoredImageVideoFile`. El contexto histórico situó un siguiente bloque de lectura alrededor de la línea física 3163 de `BRService.smali`; esa coordenada es histórica, no una garantía de que el archivo actual conserve idéntica numeración.

La evidencia 43 ya resume esta ruta. Esta sección registra los detalles recuperados en otra búsqueda de memoria, sin presentarlos como nueva extracción.

## 7. ArchiveHelper.unzipFiles y límites

Se conserva una extracción previa de la sobrecarga de siete argumentos:
`unzipFiles(File,String,IFileZipSizeChangedListener,BRItem,boolean,InputStream,List)`.

Hallazgos ya recuperados en conversaciones:
- El cuarto argumento es un `BRItem` y se utiliza para actualizar progreso/errores.
- La lista de rutas absolutas se agrega al argumento final.
- Se reportó `error=1` cuando el archivo restaurado no existe en una rama.
- Se reportó continuación del ciclo ante `BRItem.error=1` y ante `IOException`.
- Se registró el mensaje `invalid Path unzip failed, And restore error` en la ruta `ZipException`.
- Callers identificados: `ArchiveHelper`, `BRService` y `BRService$UnpackThread`.
- `UnpackThread` registra `UnpackThread delete file` y ejecuta `File.delete()`.

Estos son hallazgos RECOVERED-CHAT; para precisión de ramas y condiciones se debe acudir a la evidencia específica o al Smali, no inferir un flujo global a partir de este resumen.

## 8. Restricciones y pendientes vigentes

1. Solo análisis estático y lectura. No ejecutar servicios, backup/restore ni pruebas dinámicas.
2. No modificar APK ni datos de aplicación.
3. No repetir inventarios Parcelable 35–41, métodos BRItem 44 ni transformación Binder getBRItems 45.
4. Próximo objetivo técnico: completar `MiAsistService → bindBRService → ServiceConnection → onServiceConnected → IBRService.Stub.asInterface(IBinder) → mBRService → getBRItems()`.
5. Determinar si `asInterface()` retorna interfaz local o Proxy a partir de la ruta real; la mera existencia de Proxy no basta.
6. Separar los efectos de `startService()` y `bindService()`, y no equiparar la activación del servicio con el transporte Binder.
7. Mantener las contradicciones históricas del mapeo `mBakFilesType` sin resolver hasta cotejo de la extracción completa.
8. Preservar como RECOVERED-CHAT cualquier dato que no tenga salida Smali primaria visible; no elevarlo a LOCAL-VERIFIED.

## 9. Conclusión

La recuperación añade anclas de líneas para activación/binding y overloads, la tabla histórica de 14 transacciones, los límites entre activación y Binder, datos adicionales de estados/UI y la secuencia de restauración de medios. No cierra la conexión real del caller de `MiAsistService`, la anomalía de la sobrecarga de cinco argumentos, la causalidad completa de estados/errores ni la verificación local de los fragmentos.

**Punto exacto de continuación:** evidencia 45, sección 8. No solicitar nuevas extracciones hasta terminar la reconciliación documental de las evidencias y los métodos ya preservados.
