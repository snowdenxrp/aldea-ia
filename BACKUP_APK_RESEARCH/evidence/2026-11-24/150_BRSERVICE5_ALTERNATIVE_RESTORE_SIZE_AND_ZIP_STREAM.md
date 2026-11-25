# Evidencia 150 — BRService$5: cálculo de tamaño y segundo recorrido de extracción ZIP — 2026-11-24

**Procedencia:** salida compartida directamente por el usuario desde Termux: `nl -ba "$F" | sed -n '3100,3300p'`.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Análisis estático; sin ejecución dinámica ni cotejo local independiente.
**Continuidad:** continuación de evidencia 149, que terminaba en línea 3120. El solapamiento 3100–3120 se conserva solo como contexto; no se vuelve a registrar como hallazgo.

## 1. Cálculo de BRItem.transingTotalSize

Líneas 3103–3192:
- La rama comprueba si `BRItem.transingTotalSize` es cero. Si no es cero, salta a `:cond_52` y conserva el valor previo.
- Si es cero, consulta `BRServiceDataHolder.mTransingTotalSizeMap` con la clave `v3` (el sufijo obtenido anteriormente).
- Si existe una entrada, la convierte a `Long` y lee su valor.
  - Si el valor es distinto de cero, lo asigna a `BRItem.transingTotalSize`.
  - Si el valor es cero, calcula `v4.size() × 0x100 × 0x400`.
- Si no existe entrada, también calcula `v4.size() × 0x100 × 0x400`.
- El producto equivale aritméticamente a 262144 bytes por elemento (256 KiB), según las constantes Smali visibles. Se trata de un cálculo/estimación del total, no de una medición del tamaño real de cada archivo.

## 2. Segundo recorrido de la lista

Líneas 3195–3232:
- Crea una nueva lista auxiliar `v3`, inicializa el índice `v8=0` y comienza un bucle sobre `v4`.
- Antes de procesar cada elemento vuelve a consultar `mIsAborted`.
- Si está abortado, escribe directamente `BRItem.state=3` y `BRItem.error=9`, y salta a `:goto_35`.
- No inferir todavía la finalización posterior ni los recursos que se cierran en `:goto_35`; esa etiqueta no aparece desarrollada en esta ventana.

## 3. Obtención de entrada ZIP y llamada de copia

Líneas 3234–3300:
- Obtiene `v4[v8]` como ruta de archivo.
- Calcula la ruta relativa restando a la longitud de `Environment.getExternalStorageDirectory().getAbsolutePath()` más uno.
- Busca la entrada con `ZipFile.getEntry(relativePath)`.
- Dentro del bloque protegido, obtiene el flujo con `ZipFile.getInputStream(entry)`.
- Prepara la llamada a `BRService.copyFileFromStream(4, BRItem, inputStream, originalPath, BRItem.transingTotalSize)`.
- La ventana termina en la instrucción `invoke-static/range` de esa llamada, línea 3300. No muestra el booleano de retorno, tratamiento de false, incremento del índice, cierre del InputStream ni el catch de la obtención del flujo.

## 4. Límites probatorios y pendientes

- El factor 256 KiB es una constante usada en el cálculo cuando no hay tamaño de mapa distinto de cero; no demuestra que cada archivo tenga ese tamaño.
- No se conoce aún el tratamiento del retorno de `copyFileFromStream` en este segundo recorrido.
- No se conocen aquí las escrituras adicionales de `BRItem.state` / `BRItem.error`, notificaciones, cierre de flujos ni convergencia final.
- La extracción debe continuar desde la línea 3301, incluyendo el final del método y el destino de `:goto_35`.
- El expediente permanece INCOMPLETO.

