# Evidencia 161 — BRService: consumidores de mZipFilePath, extracción split APK y limpieza — 2026-11-25

**Base documental:** índice maestro v1.50; evidencia 160.  
**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Ventanas compartidas: `BRService$11.smali:1350–1530`, `:1535–1585`, `:1575–1645`; `BRService.smali:13020–13085` y `:13135–13215`. No cotejo local independiente, no hash nuevo de Smali, no ejecución dinámica.  
**Estado:** análisis estático; expediente INCOMPLETO.

## 1. BRService$11: ZIP contenedor y stream interno

La ventana física 1350–1530 muestra esta secuencia:

1. Se compara `p1` con `Customization.WECHAT_PKG_NAME`; la ruta mostrada entra a `:cond_2` cuando coincide.
2. Se lee `BRService.mZipFilePath` mediante el getter sintético. Si es null o vacío, `p2` se establece a null.
3. Si la ruta no está vacía, intenta `new ZipFile(mZipFilePath)`. Una `IOException` registra `can't create zipFile` y cae a la ruta con `p2=null`.
4. Selecciona el nombre de entrada según paquete: `backup_qq.zip` para QQ y `backup_wechat.zip` para WeChat.
5. Si el `ZipFile` está disponible, llama `getEntry(name)` y luego `getInputStream(entry)`. El resultado se mueve a `v4`. Si se produce una excepción, registra `can't get zipInputStream` y llama `notifyItemTaskError(packageName, feature, 7)`; el flujo continúa hacia la etiqueta de unión.
6. En `:cond_6/:goto_2`, llama `restoreLocalMediaFile(BRItem, v2, v4)`. Por tanto, el receptor puede recibir un InputStream null si la ruta no permitió abrir el ZipFile o si falló la obtención del stream.

**Límite:** el fragmento no muestra una comprobación explícita de que `getEntry(name)` devuelva una entrada no nula antes de `getInputStream(entry)`. La excepción se captura como `Exception`; no inferir el comportamiento exacto de una entrada ausente más allá de ese handler. Esta salida ahora reemplaza el resumen histórico pendiente de cotejo de E160 para este bloque concreto.

## 2. BRService$11: condición y objeto realmente eliminado

Después de la llamada al receptor, el bloque continúa:

- Solo entra a la rama de `splitApkPath` si `BRItem.error == 0`, el campo no es null y no es la cadena vacía.
- Construye `File(splitApkPath)` y comprueba `exists()`.
- Si existe, suma `File.length()` a `BRItem.totalSize` y también a `BRItem.completedSize` (la segunda suma aparece en la ventana 1535–1585).
- Más adelante, si `mZipFilePath` no está vacío y `new File(mZipFilePath).exists()`, registra `delete splitApk parent file`, obtiene `p2.getParentFile()` —donde `p2` sigue siendo el File creado desde `splitApkPath`— y llama `FileUtils.deleteFile(parentFile)`.
- Luego, si `BRItem.error == 0`, escribe `progType=v3` y `state=v2`; después llama `notifyItemTaskEnd(packageName, feature)`. Si se cumple `StorageManagerCompat.supportFixApp()` y el item no es del sistema, llama `notifyRestoreTaskFinished()`.

**Conclusión acotada:** la ruta `mZipFilePath` es una condición adicional para ejecutar la limpieza, pero el argumento de `FileUtils.deleteFile` es el directorio padre de `splitApkPath`, no el archivo `mZipFilePath` directamente. No afirmar que el borrado haya tenido éxito: el retorno de `deleteFile` no aparece ni se verifica en la ventana.

## 3. BRService.restoreStreamSplitApk: construcción del destino de split APK

La ventana 13020–13085 identifica explícitamente el método:

`restoreStreamSplitApk(BRItem, ZipFile, InputStream)`

El fragmento compartido muestra:

- Si `BRItem.splitApkPath` está vacío, salta a `:cond_4`.
- En caso contrario, obtiene el basename de `splitApkPath` (subcadena posterior al último separador) y busca una entrada con ese nombre en el `ZipFile` recibido mediante `getEntry`.
- La ventana continúa en el tramo 13135–13215: una vez disponible el stream de la entrada, obtiene `mZipFilePath`, busca el último `.` y toma el prefijo anterior a esa extensión.
- Concatena ese prefijo con el valor previo de `BRItem.splitApkPath`, crea un `File`, obtiene su ruta absoluta y la escribe de vuelta en `BRItem.splitApkPath`.
- Obtiene el directorio padre; si no existe, llama `mkdirs()`. Después llama `createNewFile()`, abre `FileOutputStream` y `BufferedOutputStream`, y comienza un bucle de lectura de bloques de `0x400` bytes desde el InputStream, escribiéndolos al output stream.

**Límites:** las ventanas no incluyen de forma continua todo el método ni sus handlers/retorno. No se determina aquí el comportamiento cuando la entrada no existe, ni el cierre final, propagación de errores o resultado de escritura. No se afirma que el archivo split APK se haya creado correctamente en ejecución.

## 4. Relación entre los consumidores de mZipFilePath

Este delta separa tres usos que no deben confundirse:

- **BRService$11:** abre `mZipFilePath` como `ZipFile` contenedor, selecciona una entrada interna `backup_qq.zip` o `backup_wechat.zip` y pasa su InputStream al receptor `restoreLocalMediaFile`.
- **restoreStreamSplitApk:** usa `mZipFilePath` como base de nombre/ruta para construir el destino de `BRItem.splitApkPath`; el stream de contenido se obtiene de una entrada del ZipFile recibido.
- **BRService$11 cleanup:** usa la no vaciedad y existencia de `mZipFilePath` como guardia antes de borrar el directorio padre de `splitApkPath`.

Esto complementa E160 y el inventario previo de lecturas/escrituras de `mZipFilePath`; no vuelve a registrar el fallback ZIP local de `restoreLocalMediaFile` ni el flujo null de E159.

## 5. Corrección de identificación de método

La salida física 13020–13085 muestra el encabezado `.method private restoreStreamSplitApk(...)`. Por ello, el fragmento físico 13075–13123 que en el intercambio previo se presentó como posible `handleTaskFinish` pertenece en realidad a `restoreStreamSplitApk`. El método `getZipPath()` mostrado en 8315–8330 solo devuelve directamente `mZipFilePath`. No se atribuye a `handleTaskFinish` la lógica de construcción del destino split APK.

## 6. Dedupe, límites y siguientes pasos

- E160 conserva el resumen del receptor `restoreLocalMediaFile` y el contrato de `ArchiveHelper.unzipFiles`; E161 no los duplica.
- E161 coteja con salida literal compartida por el usuario la parte de `BRService$11` que E160 mantenía como resumen histórico.
- El inventario anterior mostró una escritura directa visible de `mZipFilePath` desde el extra `extra_zip_file_path` en `onStartCommand`; E161 no reabre ese hallazgo.
- Queda pendiente completar `restoreStreamSplitApk` desde la entrada del método hasta todos sus handlers y retorno, si se necesita cerrar el ciclo de extracción split APK.
- Queda pendiente el contexto completo de `onStartCommand` y del origen/ciclo de vida de `extra_zip_file_path`, además de verificar si existen otros writers fuera del inventario textual compartido.
- No se demuestra éxito de extracción, integridad del ZIP, eliminación efectiva, restauración completada ni vulnerabilidad.

**Estado final:** evidencia documental añadida; investigación INCOMPLETA.
