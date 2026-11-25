# Evidencia 151 — BRService$5: resultado de copia ZIP, cierre de flujo y finalización — 2026-11-24

**Procedencia:** salida compartida directamente por el usuario desde Termux: `nl -ba "$F" | sed -n '3290,3500p'`.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Análisis estático; sin ejecución dinámica ni cotejo local independiente.
**Continuidad:** continuación de evidencia 150, con solapamiento 3290–3300 solo contextual.

## 1. Resultado de copyFileFromStream

Líneas 3299–3329:
- La llamada `BRService.copyFileFromStream(4, BRItem, inputStream, path, transingTotalSize)` devuelve booleano.
- Si devuelve true, crea `File(path)`, obtiene su ruta absoluta y la agrega a la lista `v3`.
- Si devuelve false, registra `copyOneFile error, file lost`; en esta rama no se observa escritura directa a `BRItem.error`.
- Ambas rutas convergen en el avance del bucle.

## 2. Excepciones y cierre del InputStream

Líneas 3331–3401:
- Las excepciones de los bloques de obtención/copia convergen en `:goto_33`, donde se registra `copyFileFromStream error`; después el bucle continúa.
- Al salir del bucle o por la ruta de aborto `:goto_35`, se comprueba si el registro `v7` del flujo es nulo. Si no es nulo, se intenta `InputStream.close()`.
- Si `close()` lanza excepción, se registra `close inputStream error` y se llaman `notifyItemTaskError(packageName, feature, 7)` y `notifyItemTaskEnd(packageName, feature)`.
- En el bloque de cierre mostrado no se observa asignación directa a `BRItem.error`.

## 3. Lista de archivos restaurados y notificaciones

Líneas 3403–3437:
- Comprueba si la lista de rutas copiadas `v3` está vacía y, además, si la lista de origen `v4` no está vacía.
- Si ambas condiciones se cumplen, llama `notifyItemTaskError(packageName, feature, 7)` y `notifyItemTaskEnd(packageName, feature)`.
- Por tanto, si la lista de origen contiene elementos pero ninguno fue agregado a `v3`, se ejecuta esta notificación de error/finalización.
- Esto es una condición de lista vacía; no demuestra por sí sola la causa individual de cada fallo.

## 4. Estado y finalización común

Líneas 3443–3477:
- Lee `BRItem.state` y excluye los valores 1, 6 y 3.
- Si el estado no es ninguno de esos tres, escribe `BRItem.state=1`, `BRItem.progType=0` y llama `notifyItemTaskEnd(packageName, feature)`.
- Si el estado ya es 1, 6 o 3, este bloque no lo modifica ni ejecuta esa notificación por esta vía.
- La ruta de aborto previa escribe state=3; por tanto, al llegar a esta condición, state=3 queda excluido de la normalización a 1.

## 5. Límites y continuación

- Las llamadas `notifyItemTaskError(..., 7)` son notificaciones; en este fragmento no equivalen a una escritura demostrada de `BRItem.error=7`.
- El retorno false y las excepciones de copia mostradas no escriben directamente `BRItem.error` en este fragmento. No inferir que el método invocado internamente tampoco lo modifica.
- La ventana termina en la preparación de `MediaScannerConnection.scanFile`; falta el resto de la llamada, la convergencia posterior y el final del método.
- El expediente permanece INCOMPLETO.

