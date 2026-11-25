# Evidencia 175 — BRService.copyToUsb: disponibilidad USB, normalización de ruta y resultado de copia — 2026-11-25

**Fuente primaria:** salidas Termux compartidas en el chat para `BRService.smali:5560–5700` y `5520–5590`. La segunda ventana recupera el inicio de `copyToUsb(String)`; la primera contiene su continuación, final y comienzo de `createFile(File)`.

## Hallazgos confirmados

- Al entrar, ejecuta `isUsbAvaliable()`.
- Si USB no está disponible, llama `setState(3, 12, 9)`, después `handleTaskFinish(3, 12, 9, mBRItems)`, y retorna sin intentar la copia.
- Si USB está disponible, obtiene `mCurrentBackupRootPath` y calcula la ruta normalizada mediante `normalizeAbsoluteSdPath(p1, mCurrentBackupRootPath)`.
- Construye un `File` con la ruta original `p1` y otro con la ruta normalizada.
- Compara las cadenas original y normalizada mediante `TextUtils.equals()`.
- Si son diferentes, ejecuta `copyFile(1, originalFile, normalizedFile)`.
- Si esa llamada lanza `IOException`, el handler registra `copy to Usb error`, consulta dos veces `originalFile.length()` y llama `notifyTransFileProgressChange(4, p1, null, length, length)`. La excepción se absorbe; no se relanza desde este método.
- Si las rutas son iguales, omite `copyFile()`, consulta dos veces la longitud del archivo original y llama `notifyTransFileProgressChange(3, p1, null, length, length)`.
- Después de la rama de copia o de la notificación de error, el método retorna. Termina en `.end method`; a continuación comienza `createFile(File)`.

## Límites e interpretación

- Los enteros `3`, `12`, `9`, `4` y `3` se conservan como argumentos literales observados. No se les asigna una semántica de estado/progreso más específica sin inspeccionar los métodos receptores y sus contratos.
- La llamada `copyFile()` solo se realiza cuando la ruta normalizada difiere de la original.
- La captura de `IOException` demuestra que el error se registra y absorbe en `copyToUsb`; no demuestra que la copia haya tenido éxito.
- En la rama de error se consulta la longitud del archivo original dos veces. No se observa en esta ventana una consulta de longitud del destino ni una verificación de igualdad/integridad.
- En la rama de rutas iguales se notifica con código 3 sin ejecutar copia; esto es coherente con la ruta ya normalizada, pero no prueba por sí solo que exista un dispositivo USB distinto ni que se haya realizado transferencia.
- El comportamiento interno de `isUsbAvaliable()`, `normalizeAbsoluteSdPath()`, `copyFile()`, `setState()`, `handleTaskFinish()` y `notifyTransFileProgressChange()` no se deduce más allá de las invocaciones visibles.
- No se observa aquí borrado de destino parcial, rollback, sincronización ni verificación de integridad. No afirmar su ausencia global en `copyFile()` sin analizar ese método receptor.

## Dedupe

E174 documenta `copyLocalMediaFile(BRItem, boolean)` y únicamente localiza `copyToUsb(String)` como método siguiente. E175 documenta el cuerpo completo de `copyToUsb` a partir de las ventanas compartidas, sin duplicar E170–E174.

## Procedencia y alcance probatorio

USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. No se realizó cotejo local independiente del Smali, no se calculó un hash nuevo del archivo y no se ejecutó el APK ni el método. La evidencia documenta el bytecode compartido, no comportamiento dinámico. Expediente **INCOMPLETO**.
