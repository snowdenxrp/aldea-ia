# Evidencia 148 — BRService$5: restauración de archivos locales, cancelación, estado y MediaScanner — 2026-11-24

**Procedencia:** dos ventanas Smali compartidas directamente por el usuario desde Termux: `nl -ba "$F" | sed -n '2410,2600p'` y `nl -ba "$F" | sed -n '2580,2780p'`.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Análisis estático; sin ejecución dinámica ni cotejo local independiente.
**Relación/dedupe:** continuación de evidencia 147 desde `:cond_3d` / `:goto_25`. No vuelve a registrar las transiciones ya cubiertas de estado 6, el catch IOException anterior ni el inventario v8.

## 1. Selección de lista de archivos ZIP

Líneas físicas 2436–2492:
- La rama `:cond_3d` primero comprueba `v5` no nulo; si es nulo salta a `:cond_47`.
- Recupera `BRItem.localFileList`, `packageName` y `type`; calcula el sufijo con `Utils.getZipSuffixType(packageName, type)`.
- Si la lista es null, obtiene `BRServiceDataHolder.getTypeBRServiceFileList(suffix)`.
- Si no es null pero está vacía, también obtiene esa lista alternativa.
- La lista resultante se mueve a `v3`; si es null o vacía, llama `notifyItemTaskError(packageName, feature, 7)` y después `notifyItemTaskEnd(packageName, feature)` (líneas 2495–2513).

**Límite:** la llamada con código 7 es una notificación de error; este fragmento no escribe el valor 7 en `BRItem.error`.

## 2. Iteración, cancelación y copia de archivos

Líneas 2517–2659:
- Crea una lista nueva `v4` para rutas copiadas y recorre `v3` por índice.
- Antes de procesar cada elemento consulta `mIsAborted`.
- Si está abortado, escribe `BRItem.state=3` y `BRItem.error=9` (líneas 2535–2554), y salta a `:goto_2a`, fuera del bucle.
- En caso contrario obtiene la ruta, calcula una subcadena a partir de la longitud de `Environment.getExternalStorageDirectory().getAbsolutePath()` más uno, busca esa ruta con `ZipFile.getEntry` y abre el flujo mediante `ZipFile.getInputStream`.
- Llama `copyFileFromStream(4, BRItem, inputStream, path, transingTotalSize)`.
- Si devuelve true, crea `File(path)`, obtiene la ruta absoluta y la agrega a `v4`.
- Si devuelve false, registra `copyOneFile error, file lost`; no se observa en este bloque una escritura directa a `BRItem.error` por ese retorno false.
- Una excepción `Exception` en el bloque se registra como `copy File from usb failed`; tampoco se observa aquí escritura directa a `BRItem.error`.
- El índice del bucle se incrementa y continúa.

## 3. Cierre del InputStream y transición de estado

Líneas 2661–2721:
- Al salir del bucle o por cancelación, si `v7` no es null intenta `InputStream.close()`; una excepción se registra como `close inputStream error`.
- Lee `BRItem.state`. Si el estado es 1, 6 o 3, conserva el estado y no ejecuta el bloque de finalización condicionado.
- Para cualquier otro estado, escribe `BRItem.state=1`, escribe `BRItem.progType=0` y llama `notifyItemTaskEnd(packageName, feature)` (líneas 2688–2721).

**Cautela:** no atribuir a `state=1` el significado de éxito. El extracto solo demuestra la condición y las escrituras/callbacks. En particular, tras cancelación el estado 3 se conserva y no se ejecuta esa llamada a `notifyItemTaskEnd` de este bloque.

## 4. MediaScanner

Líneas 2725–2747:
- Obtiene `Context` desde `val$contextRef` mediante `WeakReference.get()`.
- Convierte la lista de rutas copiadas `v4` a `String[]`.
- Llama `MediaScannerConnection.scanFile(context, paths, null, null)`.
- Después salta a `:goto_25`.

La llamada se encuentra después de la comprobación/transición de estado y se ejecuta también cuando el estado era 1, 6 o 3, siempre que el flujo llegue a este bloque.

## 5. Ruta alternativa

En la línea 2750 comienza `:cond_47`, alcanzable cuando `v5` es null desde la condición de línea 2437. Crea una lista y empieza a iterar directamente sobre `BRItem.localFileList` (líneas 2750–2780). La ventana termina antes de revelar el procesamiento restante; no se infiere su resultado.

## 6. Límites y pendientes

- No se recibe el tramo posterior a la línea 2780; queda abierta la ruta `:cond_47`.
- No se demuestra el significado semántico global de los códigos de estado 1, 3 o 6, ni del error 9.
- Los errores de copia false y las excepciones de copia se registran, pero en este tramo no se observa asignación directa a `BRItem.error`.
- La notificación `notifyItemTaskError(..., 7)` no equivale por sí sola a una escritura del campo `BRItem.error`.
- No se determina aún la relación de esta rama con `mLastError` ni el resultado de `BRManager.restorePackage`.
- No se afirma éxito dinámico.

**Estado:** delta nuevo documentado; investigación estática INCOMPLETA.
