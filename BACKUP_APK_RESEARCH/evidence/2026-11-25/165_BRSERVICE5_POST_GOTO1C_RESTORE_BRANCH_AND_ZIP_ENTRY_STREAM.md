# Evidencia 165 — BRService$5: continuación posterior a :goto_1c y streams de entradas ZIP — 2026-11-25

**Base documental:** índice maestro v1.55; E163 y E164.
**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Ventanas literales compartidas de `BRService$zipStreamReader.smali:1–179` y `BRService$5.smali:2070–2760`; ubicación de `:goto_1c` en línea 2083. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica.
**Estado:** análisis estático; expediente INCOMPLETO.

## 1. Constructor e inicio de zipStreamReader

El constructor `<init>(BRService, ParcelFileDescriptor[], InputStream)`:
- guarda el BRService en `this$0`;
- guarda el array de descriptores en `mPipe`;
- guarda el InputStream recibido en `mZipInputStream`.

En el inicio de `run()`, si `mZipInputStream` no es null:
- construye un `FileOutputStream` con `mPipe[1].getFileDescriptor()`;
- asigna un buffer de 0x8000 bytes;
- lee repetidamente de `mZipInputStream` y escribe los bytes leídos en ese OutputStream;
- al llegar al fin de stream intenta cerrar OutputStream y mZipInputStream.

**Conclusión acotada:** el escritor creado por `zipStreamReader` utiliza el descriptor situado en el índice 1 del array. Esto identifica el descriptor concreto usado para escribir, pero no basta por sí solo para asignar semántica de lectura/escritura a ambos extremos ni para determinar quién cierra el descriptor complementario. El cleanup final ya se conserva en E164 y no se duplica aquí.

## 2. BRService$5 después de :goto_1c

La ventana 2070–2200 muestra que el destino de `:goto_1c` continúa el flujo de restauración:
- consulta `BackupManager.isSysAppForBackup(context, packageName)`;
- para paquetes no clasificados como app del sistema, consulta `PackageManager.getApplicationEnabledSetting(packageName)`;
- si el resultado es 2, registra que la app está deshabilitada y llama `setApplicationEnabledSetting(packageName, 0, 0)`;
- después continúa con comprobaciones de `mIsFlashDriveTask` y los nombres de paquete WeChat/QQ; para esa rama puede invocar `unpackBakSdDatas(File, localFileList)`.

La ventana 2200–2480 continúa con:
- incremento del contador de elementos;
- lectura de `BRItem.error` (el valor recuperado se sobrescribe inmediatamente en el registro local por una cadena de log; no atribuirle una condición);
- log `Restore One, restored package`;
- eliminación del archivo temporal `v10` si no es null;
- handlers de IOException que asignan `BRItem.error = v7`, registran el error y eliminan el temporal si existe;
- handler catchall que también elimina el temporal y relanza;
- rutas posteriores para tareas de transferencia/flash drive y notificaciones de estado.

**Límite:** la cadena literal de la ventana no permite concluir que el paquete se haya restaurado con éxito; el log y las operaciones posteriores no sustituyen una verificación del resultado de la tarea.

## 3. Rama files_for_backup y streams ZIP por archivo

Las ventanas 2340–2760 muestran una rama condicionada por `mIsFlashDriveTask` y `packageName == "files_for_backup"`, con bifurcación adicional según registros locales:
- En la rama alternativa donde el registro `v3` es un InputStream no nulo, se llama `restoreLocalMediaFile(BRItem, false, v3)`. La ventana posterior muestra otra rama: si `v5` está presente, se procesa una lista de rutas; no se equiparan ambos tipos de `v3` entre ramas.
- En la rama de lista, obtiene rutas desde `BRItem.localFileList` o desde `BRServiceDataHolder.getTypeBRServiceFileList(suffix)`.
- Si la lista es null/vacía, notifica error y fin de tarea.
- Itera sobre cada ruta; si la tarea fue abortada, asigna estado 3 y error 9.
- Para cada ruta, calcula una entrada ZIP relativa a `Environment.getExternalStorageDirectory()`, obtiene `ZipFile.getEntry(path)` y abre un InputStream con `ZipFile.getInputStream(entry)`, guardándolo en `v7`.
- Pasa ese stream a `BRService.copyFileFromStream(4, BRItem, InputStream, path, transingTotalSize)`.
- Si la copia devuelve true, agrega a la lista de resultados la ruta absoluta del archivo; si devuelve false, registra `copyOneFile error, file lost`.
- Las excepciones por archivo se capturan y registran como `copy File from usb failed`; el bucle continúa.
- Después del bucle, si `v7` no es null, intenta llamar `InputStream.close()`; una excepción se registra como `close inputStream error`.
- Luego actualiza estado/notificaciones y llama `MediaScannerConnection.scanFile()` con las rutas que se agregaron.

**Límites importantes:**
- El fragmento solo muestra el cierre explícito de la referencia actual `v7` después del bucle. No permite determinar si `copyFileFromStream` cierra internamente cada stream, ni si cada stream previo es cerrado antes de que `v7` sea reasignado en otra iteración.
- No se afirma fuga de streams; se requiere revisar el método `copyFileFromStream` y el resto del bucle/handlers.
- No se concluye que el extremo complementario del pipe o el InputStream original del puente queden cerrados aquí.
- La ventana termina en el comienzo de otra rama (`:cond_47`), no al final de `BRService$5.run()`.

## 4. Dedupe, relación y pendientes

- E163 conserva la llamada al puente, el InputStream original y la creación/entrega del pipe.
- E164 conserva el cleanup final de `zipStreamReader.run()` y el envío de `PerformAdbRestoreTask` seguido de `waitForRestoreTaskEnd()`.
- E165 añade la asignación explícita de `mPipe[1]` al FileOutputStream del lector y la continuación de `BRService$5` desde `:goto_1c`, incluidas las ramas de habilitación de paquete y extracción de archivos de flash drive.
- No se repiten como hallazgos nuevos los cierres ya descritos en E164.

Pendientes:
1. Continuar `BRService$5.smali` desde la línea 2760, sin saltar hasta `.end method`, y revisar todos los handlers/caminos finales para buscar cierre de descriptores del pipe y del InputStream original.
2. Recuperar el método completo `BRService.copyFileFromStream` para determinar si administra/cierra los InputStreams que recibe.
3. Rastrear las asignaciones previas al puente y el cierre del InputStream original.
4. Tras cerrar el ciclo, continuar con `extra_zip_file_path`.

**No demostrado:** cierre de ambos descriptores del pipe, cierre del InputStream original, fuga efectiva, éxito de restauración, integridad de archivos o comportamiento dinámico.

**Estado final:** evidencia documental basada exclusivamente en ventanas Termux aportadas por el usuario. Expediente INCOMPLETO.
