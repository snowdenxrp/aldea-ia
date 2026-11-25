# Evidencia 166 — BRService$5: rama localFileList y localización de copyFileFromStream — 2026-11-25

**Base documental:** índice maestro v1.56; E165.
**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Ventana física compartida de `BRService$5.smali:2760–2900` y grep literal de referencias a `copyFileFromStream` en `BRService.smali`. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica.
**Estado:** análisis estático; expediente INCOMPLETO.

## 1. Continuación de BRService$5 desde la línea física 2760

La ventana comienza en la continuación de la rama `localFileList`:
- El iterador obtiene cada ruta String desde la lista.
- Antes de copiar, consulta `mIsAborted`. Si está activo, asigna `BRItem.state=3` y `BRItem.error=9`, y salta a la continuación `:goto_2d`.
- Si no está abortado, obtiene `mCurrentBackupRootPath`, normaliza la ruta con `normalizeAbsoluteSdPath(path, root)` y llama `Utils.newDirChangePath(path)`.
- Construye un File con la ruta original y llama al puente sintético `-$$Nest$mcopyFile(BRService, 4, File(destino normalizado), File(origen))`.
- Si la llamada retorna sin IOException, agrega `getAbsolutePath()` del File construido con la ruta original a la lista de resultados.
- Una IOException se dirige a `:catch_a`, cuyo cuerpo queda fuera de esta ventana.
- Después consulta `Utils.getModifyTimeByReceiveFileMap(path)`, registra la ruta y el tiempo de modificación; si el valor no es null, intenta convertirlo a long y aplicar `File.setLastModified(long)`. Una RuntimeException se captura en `:catch_9` y se registra.
- La ventana termina antes de mostrar la continuación de `:catch_a`, `:goto_2d`, el final del bucle y el final de `BRService$5.run()`.

**Límite:** esta rama usa `copyFile` con objetos File; no es la llamada `copyFileFromStream` de la rama ZIP por entrada. No se atribuye aquí semántica adicional a los parámetros ni se afirma que la copia haya sido verificada más allá del retorno normal de la llamada.

## 2. Localización de copyFileFromStream

El grep literal compartido de `BRService.smali` devolvió:
- Línea física 1685: puente sintético estático `-$$Nest$mcopyFileFromStream(BRService, int, BRItem, InputStream, String, long)Z`, que delega en el método privado.
- Línea física 4185: definición del método privado `copyFileFromStream(int, BRItem, InputStream, String, long)Z`.

Esto localiza el cuerpo receptor, pero no lo recupera. Por tanto, siguen sin conocerse desde esta evidencia:
- si el método cierra el InputStream recibido;
- qué streams/outputs crea y cómo los cierra;
- sus rutas de retorno booleano y manejo de excepciones;
- si existe un cierre garantizado en todos los caminos.

## 3. Dedupe y continuidad

- E165 conserva la rama ZIP por entrada que llama a `copyFileFromStream`, el cierre posterior de la referencia actual `v7` y la incertidumbre sobre streams anteriores.
- E166 añade la rama distinta `localFileList` que llama a `copyFile`, la gestión visible del tiempo de modificación y las coordenadas exactas del puente/definición de `copyFileFromStream`.
- No se duplica el flujo ZIP de E165 ni se infiere comportamiento del método receptor a partir de su nombre.

**Siguiente paso:** recuperar `BRService.smali:4185` desde el inicio de `copyFileFromStream` hasta su `.end method`, incluyendo handlers y cleanup. Después cotejar si cierra cada InputStream y cómo se relaciona con el cierre externo de E165.

**No demostrado:** cierre interno del InputStream, fuga efectiva, éxito/integridad de la copia, cierre de descriptores del pipe o cierre del InputStream original del caller.

**Estado final:** evidencia documental basada en las ventanas Termux aportadas por el usuario. Expediente INCOMPLETO.
