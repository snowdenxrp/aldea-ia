# Evidencia 149 — BRService$5: ruta alternativa de restauración local, IOException y MediaScanner — 2026-11-24

**Procedencia:** ventanas Smali compartidas directamente por el usuario desde Termux: `nl -ba "$F" | sed -n '2750,2940p'` y `nl -ba "$F" | sed -n '2920,3120p'`.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Análisis estático; sin ejecución dinámica ni cotejo local independiente.
**Relación/dedupe:** continuación de evidencia 148 desde la ruta `:cond_47`; las líneas 2750–2780 se solapan deliberadamente con el contexto previo. No se duplica el análisis ZIP de evidencia 148 ni el catch IOException anterior de evidencia 147.

## 1. Ruta alternativa cuando v5 es null

Líneas 2750–2800:
- En `:cond_47` crea una nueva `ArrayList` y obtiene un iterador directamente de `BRItem.localFileList`.
- Por cada ruta, vuelve a comprobar `mIsAborted`.
- Si está abortado, escribe explícitamente `BRItem.state=3` y `BRItem.error=9`, y salta a `:goto_2d`.
- La ventana muestra una llamada directa a `localFileList.iterator()`; no muestra una comprobación de null antes de ella. No inferir el comportamiento de valores null fuera de este extracto.

## 2. Copia local, normalización y fecha de modificación

Líneas 2801–2902:
- Obtiene `mCurrentBackupRootPath` y llama `normalizeAbsoluteSdPath(originalPath, rootPath)`.
- Llama `Utils.newDirChangePath(originalPath)`.
- Construye `File` para la ruta original y llama `BRService.copyFile(4, File(normalizedPath), File(originalPath))`.
- Si la llamada termina sin lanzar IOException, agrega `File(originalPath).getAbsolutePath()` a la lista destinada al escaneo multimedia.
- Obtiene la fecha con `Utils.getModifyTimeByReceiveFileMap(originalPath)`. Si no es null, la convierte a long y llama `File.setLastModified(long)`; el booleano de retorno no se consume en el fragmento.
- Si el parseo lanza RuntimeException, registra el error y continúa el bucle. No se observa escritura de `BRItem.error` en ese catch.

## 3. Manejo de IOException

Líneas 2904–2950:
- El catch de IOException llama `notifyTransFileProgressChange(4, normalizedPath, originalPath, 0, File(originalPath).length())`.
- Después escribe explícitamente `BRItem.error=1`.
- Registra `copy error: item` junto con el BRItem y la excepción.
- Vuelve al iterador mediante `:goto_2c`; no se observa en este catch una escritura directa de `BRItem.state` ni una finalización inmediata de la tarea.

**Distinción probatoria:** este catch sí escribe `BRItem.error=1` directamente. No debe confundirse con las ramas de evidencia 148 que solo registraban el retorno false de `copyFileFromStream` o excepciones de copia sin mostrar una asignación directa al campo.

## 4. MediaScanner y convergencia

Líneas 2952–2977:
- Al terminar el recorrido o llegar desde la salida por aborto, obtiene el contexto desde WeakReference, convierte la lista de rutas agregadas a `String[]` y llama `MediaScannerConnection.scanFile(context, paths, null, null)`.
- Después salta a `:goto_25`.
- La lista se alimenta tras la copia que retorna normalmente; el catch IOException no agrega esa ruta antes de continuar.

## 5. Rama local posterior y lista alternativa

Líneas 2980–3120:
- En `:cond_4b`, comprueba `mIsLocalBackupTask` y que `BRItem.packageName` sea `files_for_backup`.
- Si `v3` no es null, llama `restoreLocalMediaFile(BRItem, false, v3)` y salta a `:goto_24`.
- En la rama `:cond_4c`, obtiene `localFileList` y el sufijo mediante `getZipSuffixType(packageName,type)`. Si la lista es null o vacía, consulta `BRServiceDataHolder.getTypeBRServiceFileList(suffix)`.
- Si la lista resultante está vacía, llama `notifyItemTaskError(packageName,feature,7)` y `notifyItemTaskEnd(packageName,feature)`; no se observa escritura directa de `BRItem.error=7` en este bloque.
- Si la lista no está vacía, continúa hacia el cálculo de `transingTotalSize`. La salida termina en la línea 3120, antes de mostrar la continuación.

## 6. Dedupe, límites y pendientes

- Evidencia 148 ya cubre la rama ZIP, la selección de lista, la cancelación en esa rama y el escaneo multimedia. Esta evidencia añade la ruta alternativa de copia local y su catch IOException.
- Evidencia 147 ya conserva un catch IOException distinto, en otro tramo del método; no asumir que ambos catches tienen el mismo contexto o efectos.
- No se atribuye semántica global a los valores `state=3`, `error=9` o `error=1`.
- No se demuestra que `copyFile` haya tenido éxito en ejecución real, que `setLastModified` haya cambiado la marca temporal, ni que MediaScanner haya completado un escaneo.
- La continuación posterior a la línea 3120 queda pendiente, incluyendo el resto de la rama de lista alternativa y sus posibles escrituras/notificaciones.
- El expediente permanece INCOMPLETO.

