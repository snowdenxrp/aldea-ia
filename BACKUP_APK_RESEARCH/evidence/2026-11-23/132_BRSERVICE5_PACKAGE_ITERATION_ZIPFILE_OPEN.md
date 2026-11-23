# Evidencia 132 — BRService$5: recorrido de packageName y apertura de ZipFile — 2026-11-23

**Archivo:** `BRService$5.smali`  
**Ventana física compartida:** `sed -n '850,970p' "$F"`.  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; fragmento pegado directamente por el usuario. Sin cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Cierre del recorrido inicial de mBRItems

La etiqueta `:goto_d` continúa el iterador inicial:

1. Comprueba `Iterator.hasNext()`; si no hay siguiente elemento, salta a `:cond_19`.
2. Obtiene el siguiente objeto, lo convierte a `BRItem` y lee `BRItem.packageName`.
3. Carga el literal `"files_for_backup"` y ejecuta `String.equals(packageName)`.
4. En el fragmento pegado no aparece una instrucción `move-result` que recoja el booleano de `equals()`, ni una bifurcación posterior basada en él. A continuación se observa `const/4 v11, 0x5` y el retorno al iterador.

Por tanto, solo se registra la llamada de comparación y la asignación visible `v11=5`; no se afirma que el resultado de la comparación filtre, seleccione o modifique los BRItem. La ausencia de `move-result` se refiere al texto recibido y debe cotejarse con el Smali local si se recupera una extracción íntegra.

## 2. Apertura condicional del ZIP

En `:cond_19` recupera `BRService.mZipFilePath`:

- Si el campo es null, no intenta abrir el ZIP.
- Si no es null, llama a `String.isEmpty()`; si está vacío, tampoco intenta abrirlo.
- Si tiene contenido, intenta crear `java.util.zip.ZipFile(mZipFilePath)`.
- Si la construcción tiene éxito, mueve el objeto a `v5` y continúa por `:goto_e`.
- Si se captura `IOException`, registra `"can't create zipFile: mZipFilePath"` junto con la excepción, obtiene `BRService.mState` y llama a `setState(mState,v3,v14)`. Después, en `:cond_1a`, asigna null a `v5`.

Tanto las rutas sin ruta ZIP utilizable como la ruta de excepción llegan a `:cond_1a` y dejan `v5=null`. La ruta de apertura exitosa conserva el ZipFile en `v5`.

## 3. Inicio de la siguiente fase

En `:goto_e` inicializa `v11=0` y `v13=0`. Después `:goto_f` recupera `mBRItems`, carga `v3=0xb` (11) y comprueba si la lista es null. El destino null es `:cond_62`; la continuación del procesamiento queda fuera de esta ventana.

## 4. Límites y dedupe

- No se observan escrituras directas a `BRItem.state` ni `BRItem.error`.
- `setState(mState,v3,v14)` es una llamada a estado global del servicio; no se equipara a una escritura directa de campos BRItem.
- No se atribuye semántica a `v11=5`, `v3=11) ni `v14`.
- La ventana empieza solapada con la cola del bucle ya introducido en evidencia 131 y añade su cuerpo visible, la apertura condicional de ZipFile y el inicio de la fase siguiente.
- Las directivas `.line 1504`–`.line 1519` son números de línea fuente, no coordenadas físicas.
- No se ejecutó Backup/Restore ni prueba dinámica.
