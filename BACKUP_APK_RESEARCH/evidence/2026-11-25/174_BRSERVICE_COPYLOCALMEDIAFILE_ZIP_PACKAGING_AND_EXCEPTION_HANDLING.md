# Evidencia 174 — BRService.copyLocalMediaFile: selección de archivos, empaquetado ZIP y manejo de errores — 2026-11-25

**Fuente primaria:** salidas Termux compartidas en el chat para `BRService.smali:5120–5560`, que cubren desde el cuerpo de `copyLocalMediaFile(BRItem, boolean)` hasta `.end method` y el inicio del método siguiente.

## Hallazgos confirmados

- El método continúa únicamente para `packageName == "files_for_backup"`, `WECHAT_PKG_NAME` o `QQ_PKG_NAME`; los demás paquetes retornan inmediatamente.
- Crea una `ArrayList` de archivos. Para `p2 == false`, recorre `BRItem.localFileList` desde `sendingIndex`, convierte cada ruta en `File` y comprueba `mIsAborted` en cada iteración.
- Para `files_for_backup`, notifica `notifyItemTaskStart(packageName, feature)` y asigna inicialmente `BRItem.state=2`.
- Para `p2 == true`, intenta construir un conjunto de subarchivos de la ruta externa de WeChat o QQ: selecciona la constante de ruta según el paquete, comprueba `exists()` e `isDirectory()`, obtiene los subarchivos con `Utils.getAllSubfiles()` y los agrega a la lista que se empaquetará.
- Si no está abortado, obtiene el sufijo con `Utils.getZipSuffixType(packageName, type)`, asigna `BRItem.state=7`, construye el temporal `mCurrentBackupRootPath + "/backup_" + suffix + ".zip"` y llama `ArchiveHelper.zipFiles(...)`.
- Abre una entrada en `mZipOutputStream` cuyo nombre es `backup_ + suffix + .zip`. Abre el ZIP temporal con `FileInputStream`, lo copia al ZIP principal mediante un búfer de `0x8000` bytes (32 KiB) y `outputStreamWrite()`.
- En la ruta normal posterior a EOF, elimina el ZIP temporal con `FileUtils.deleteFile()`, llama `closeEntry()` y cierra el InputStream con `IOUtils.closeQuietly()`.
- El handler `:catch_0` captura `Exception`, registra `"zip file error"` y no relanza la excepción.
- Cuando `p2 == false`, al final asigna `BRItem.state=3` si `mIsAborted` es true, o `BRItem.state=1` si no lo está. Esta asignación también se alcanza después de que `:catch_0` absorba una excepción.
- Para `files_for_backup`, al final asigna `progType=0` y llama `notifyItemTaskEnd(packageName, feature)`.
- El método termina en `.end method`; a continuación comienza `copyToUsb(String)`.

## Hallazgos técnicos / límites

- **Rama SDK inferior a 23:** `:cond_4` asigna `null` a `v6`. El flujo posterior utiliza `v6` como `Set`: si la ruta seleccionada existe y es directorio, intenta `Set.addAll()` sobre la referencia nula; si no se cumple esa condición, intenta `Set.size()` sobre ella. El bytecode observado muestra una posible `NullPointerException` en ambos subcaminos. La alcanzabilidad práctica depende del `minSdkVersion` y del entorno soportado; no se ejecutó dinámicamente.
- **Cleanup excepcional incompleto en el método:** si una excepción ocurre después de abrir el `FileInputStream` y antes de completar la ruta normal, el salto a `:catch_0` evita las instrucciones visibles que eliminan el ZIP temporal, cierran la entrada y llaman `closeQuietly()`. Esto permite afirmar que el método no garantiza esas operaciones en la ruta excepcional; no demuestra por sí solo que el recurso permanezca abierto en todos los casos ni que el ZIP temporal siempre quede presente.
- **Estado potencialmente no representativo del resultado:** para `p2 == false`, una excepción de empaquetado/lectura se registra y absorbe; si no hay aborto, el método asigna después `state=1`. Por tanto, esa asignación no demuestra por sí sola que el ZIP temporal se haya integrado correctamente.
- **Rama `p2 == true`:** el bloque final de asignación de estado está condicionado por `if-nez p2`; no se observa en esta ventana una asignación final equivalente para esa rama. No inferir su estado terminal más allá de las escrituras visibles.
- No se observa en este método una verificación posterior de integridad del ZIP principal ni rollback de la entrada parcialmente escrita.

## Dedupe

E173 termina justo antes de `copyLocalMediaFile`; no cubre este método. E174 consolida las tres ventanas recibidas en el chat (5120–5260, 5260–5410 y 5410–5560) sin duplicar E170–E173. No se registra como evidencia independiente cada observación intermedia.

## Procedencia y alcance probatorio

USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. No se realizó cotejo local independiente del Smali, no se calculó un hash nuevo del archivo y no se ejecutó el APK ni el método. La evidencia documenta el bytecode compartido, no comportamiento dinámico. Expediente **INCOMPLETO**.
