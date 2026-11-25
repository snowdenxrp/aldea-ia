# Evidencia 160 — BRService: receptor restoreLocalMediaFile y selección entre InputStream y ZIP local — 2026-11-25

**Repositorio/rama:** `snowdenxrp/aldea-ia` / `backup-apk-static-research-2026-11-19`  
**Base documental conocida antes de este registro:** índice maestro v1.49, commit `b21cb8f809cd96dc24c32d8d3bd4ee031dec6d00`; evidencia 159, commit `2a8d71abf0571d6e62b03cb623d5c3d21ccd1aad`.  
**Alcance:** consolidación de la continuación del chat sobre `BRService$5.run()`, el receptor privado `BRService.restoreLocalMediaFile(BRItem, boolean, InputStream)` y la ruta de transferencia de `BRService$11`.  
**Estado global:** INCOMPLETO. Análisis estático documental; no se ejecutó restauración ni se modificó el APK.

## 1. Procedencia y nivel de evidencia

Esta entrada conserva dos niveles distintos y no los mezcla:

1. **Fragmento compartido directamente por el usuario en el chat:** implementación de `restoreLocalMediaFile`, identificada por `.line 3136–3168`, coordenada física aproximada/reportada `BRService.smali:12772`. El caller sintético aparece en `BRService$11.smali:1478`. El resumen técnico de la salida se recuperó del chat; el bloque literal completo no está incluido en este documento. Clasificación: `USER-PROVIDED / CURRENT-CHAT-OUTPUT (RECOVERED SUMMARY)`, no cotejo local independiente.
2. **Continuación de `BRService$11`:** bloque reportado en coordenadas físicas `3765–3788`, que lee `mZipFilePath`, abre un `ZipFile`, obtiene una entrada interna y pasa su stream al receptor. En el contexto recuperado, este detalle aparece como resumen previo del asistente basado en el análisis del chat; no se conserva aquí el stdout literal. Clasificación: `RECOVERED-CHAT / PRIOR-ASSISTANT-SUMMARY`, pendiente de volver a cotejar contra la salida original antes de elevarlo a evidencia primaria.

No se etiqueta ninguno de estos datos como `LOCAL-VERIFIED`. La recuperación de continuidad no sustituye los fragmentos Smali originales.

## 2. Receptor privado: restoreLocalMediaFile

Método identificado:
`restoreLocalMediaFile(Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;)V`

Resumen de la secuencia reportada en el fragmento directo del chat:

1. Si `mCurrentBackupRootPath` es null, el método retorna.
2. Calcula el sufijo mediante `Utils.getZipSuffixType(packageName, type)`.
3. Construye la ruta local `mCurrentBackupRootPath + "/backup_" + suffix + ".zip"` y crea/comprueba el `File` correspondiente.
4. Si el archivo no existe **y** el parámetro `InputStream` es null:
   - registra `"restore file failed: file not exist"`;
   - establece el resultado de item reportado como `state=3`, `error=7`;
   - notifica error y fin de tarea.
5. Si el archivo existe **o** el parámetro `InputStream` no es null:
   - establece el estado reportado `state=8`;
   - llama a la sobrecarga de siete argumentos de `ArchiveHelper.unzipFiles`, pasando el File local, `PREF_BASE_PATH`, listener, BRItem, el indicador `isWeChatOrQQ`, el InputStream recibido y `restoredImageVideoFile`.
6. El bloque reportado captura/loguea `IOException`; no se recuperó en esta ronda evidencia de captura general de otras excepciones.
7. Después de la llamada, la secuencia reportada establece `state=9` si la tarea está abortada; en caso contrario `state=1`. Después notifica el fin y realiza el escaneo multimedia descrito en el resumen del chat.

**Límites:** el detalle anterior es una recuperación fiel del análisis de la salida compartida, pero no se vuelve a publicar aquí el bloque Smali literal. Antes de afirmar condiciones exactas, orden de instrucciones, registros o alcance de los handlers, cotejar la ventana completa alrededor de la línea física 12772. La asignación de estados se conserva como resultado reportado del método, no como una afirmación de éxito dinámico de cada extracción.

## 3. Contrato relevante de ArchiveHelper.unzipFiles

La investigación anterior ya conserva la sobrecarga de siete argumentos en la evidencia histórica 27 (commit abreviado reportado `b1be4bc3`; revisar el índice/evidencia original para el nombre exacto del archivo). Su comportamiento recuperado distingue:

- **InputStream no nulo:** utiliza la ruta de entrada basada en `ZipInputStream`.
- **InputStream null:** abre un `FileInputStream` a partir del `File` recibido.

Esta distinción es crucial para interpretar la llamada de `restoreLocalMediaFile`: null no significa necesariamente que no haya fuente de datos. El receptor proporciona también el File `backup_<suffix>.zip`; la implementación de ArchiveHelper puede abrirlo cuando el stream recibido es null.

La evidencia 27 ya contiene el análisis de `ArchiveHelper.unzipFiles`; esta entrada no duplica su implementación ni reabre ese hallazgo. La relación se registra para cerrar el flujo entre caller y receptor.

## 4. Reconciliación con BRService$5 y evidencia 159

Evidencias 153–159 ya están preservadas y no se vuelven a registrar como hallazgos nuevos:

- **E153:** inicialización de `v5` con `new ZipFile(mZipFilePath)`; camino de fallo normalizado a null; reutilizaciones previas de `v13` y reinicio del contador en física 958.
- **E154:** inventario grep de operandos destino/lecturas de `v5` y `v13`; no era todavía una clasificación semántica completa.
- **E155:** `v13=0` (2266) y `v13=v10` (2304) pertenecen a handlers de limpieza excepcional con `File.delete()` y relanzamiento; no son reinicios normales del contador. Clasificó varias reutilizaciones posteriores de `v5`.
- **E156:** guardias de `v5` en físicas 1509, 2437 y 3011 seleccionan rutas ZIP/listas frente a rutas alternativas; en 1509 también se comprueba `File.exists()` de `v4`.
- **E157:** `:cond_2a` inicializa `v3=0`; si `v4` es null/no existe, el flujo llega a `:cond_3b`; si existe, llega a `:cond_2c`. `:cond_59` construye el File local `backup_<suffix>.zip`, pero el origen de `v3` seguía abierto.
- **E158:** `:cond_2c`, con `v8 != 0`, obtiene `getTransTempBackupRootPath()`, construye `.tmp_bak_file`, llama `BRService.copyFile(4,v4,tempFile)`, sustituye la referencia local `v4` por el temporal y salta a `:goto_17`. Con `v8==0`, examina `mIsTransingTask` y después empieza la rama Flash Drive. En `:cond_3b`, para transferencia activa y `files_for_backup`, espera `waitingForFilesTransingEnd()`, escribe state 6 si hace falta y notifica `notifyTransItemChange(...)`.
- **E159:** en la ruta que llega a `:cond_59`, `v3` permanece null: `v3==null` lleva a `:cond_4c`, `v5==null` salta a `:cond_59`, y la reasignación de `v3` a `BRItem.packageName` solo ocurre en la caída cuando `v5!=null`. La llamada de física 3561 entrega null como InputStream. El File construido en `:cond_59` no se pasa como argumento.

**Cierre nuevo de la relación caller/receptor:** aunque `:cond_59` construye un File que no pasa a la llamada, `restoreLocalMediaFile` vuelve a derivar la ruta `mCurrentBackupRootPath/backup_<suffix>.zip` desde el BRItem y la raíz de backup. Según el comportamiento ya conservado de ArchiveHelper, cuando el InputStream recibido es null puede abrir el File local mediante `FileInputStream`. Por ello, la lectura correcta no es “la ruta `:cond_59` no abre el ZIP”, sino: “el bloque `:cond_59` no entrega su objeto File ni un InputStream; el receptor puede reconstruir la ruta local y ArchiveHelper puede abrirla internamente”. Esto debe cotejarse con el Smali completo del receptor y de la sobrecarga de ArchiveHelper antes de elevarlo a conclusión primaria.

## 5. Ruta de BRService$11 y ZIP contenedor

El resumen recuperado del chat atribuye al bloque `BRService$11.smali:3765–3788` esta secuencia:

1. Lee `BRService.mZipFilePath`.
2. Si la ruta es no nula/no vacía, intenta construir `new ZipFile(mZipFilePath)`.
3. Selecciona una entrada interna según el paquete:
   - QQ: `backup_qq.zip`
   - WeChat: `backup_wechat.zip`
4. Obtiene la entrada con `ZipFile.getEntry()`, obtiene su InputStream con `ZipFile.getInputStream()` y pasa ese stream al receptor `restoreLocalMediaFile(BRItem, boolean, InputStream)`.
5. Si la apertura del ZipFile falla con `IOException`, registra `"can't create zipFile"`; el registro local del stream queda null y el flujo continúa hacia el receptor.

**Lectura conjunta, todavía condicionada a cotejo:** la ruta de `BRService$11` puede suministrar un stream extraído desde un ZIP contenedor (`mZipFilePath`); si no logra abrirlo, el receptor recibe null y puede recurrir al ZIP local `backup_<suffix>.zip` mediante ArchiveHelper. Esta ruta no debe confundirse con la de `BRService$5`, que llega a `:cond_59` con v3 null por sus propias guardias. Son callers distintos del mismo receptor.

No afirmar que el fallback siempre tenga éxito: depende de que `mCurrentBackupRootPath` sea válido, que el ZIP local exista y que la extracción posterior no falle.

## 6. Contexto ya conservado, no delta nuevo

El chat también recuperó/repasó estos datos, que no se duplican en esta evidencia:

- SHA-256 reportado por Termux para `BRService$5.smali`: `7c0112052117caf5b5fb119fc807f62ea0cf42bf35fe8d7e75c38af8a18bde25` (128,021 bytes). Es un hash reportado desde el dispositivo; no fue recalculado aquí.
- `v8=1` cuando `mBakFilesType==2`; no debe tratarse como bandera genérica de error. Su uso relevante es la rama temporal de `:cond_2c`.
- La ruta alternativa local, copia/mtime, escaneo multimedia, cálculo de `transingTotalSize`, extracción por stream, manejo de errores y estados ya se distribuyen entre evidencias 146–152.
- E153–E159 están guardadas individualmente y enlazadas desde el índice v1.49. No crear evidencias repetidas por volver a resumirlas.

## 7. Pendientes exactos y punto de continuación

**Siguiente objetivo aceptado por el usuario:** rastrear todas las asignaciones, lecturas y limpiezas de `mZipFilePath`, junto con las condiciones que activan cada ruta.

Orden recomendado de lectura estática:

1. Inventariar todas las instrucciones que escriben `BRService.mZipFilePath` (incluidos `iput-object`, setters/constructores y escrituras indirectas identificables).
2. Inventariar todas las lecturas y todos los sitios que lo ponen en null/vacío o lo limpian.
3. Para cada writer, recuperar el método completo, caller, guardias y origen del valor; no inferir el significado por el nombre del campo.
4. Reconstruir quién establece la ruta antes de `BRService$11` y bajo qué condiciones puede estar vacía.
5. Cotejar físicamente el bloque `BRService$11` 3765–3788 y el método completo `restoreLocalMediaFile` alrededor de física 12772; conservar las ventanas originales sin volver a pedir las ya preservadas.
6. Cotejar el overload de siete argumentos de `ArchiveHelper.unzipFiles` con evidencia 27, sin duplicar su análisis.

**No repetir:** las ventanas de `BRService$5` ya conservadas en E153–E159 (850–970, 1485–1535, 1540–1790, 2205–2391, 2385–2465, 2975–3040 y 3485–3695), salvo que el nuevo análisis de `mZipFilePath` identifique una dependencia concreta que requiera contexto adicional.

**No hacer:** ejecución dinámica, restauraciones, modificación del APK ni afirmaciones de vulnerabilidad/alcanzabilidad externa a partir de este análisis.

## 8. Estado final de esta consolidación

- Evidencias 153–159: preservadas en Git y cotejadas por lectura del repositorio.
- Evidencia 160: recuperación documental de la relación caller/receptor y el fallback InputStream/ZIP; separa claramente salida directa resumida y contexto recuperado de resúmenes previos.
- El expediente sigue **INCOMPLETO**.
- El siguiente chat debe comenzar por `mZipFilePath`, no repetir el análisis ya cerrado de `:cond_59` ni reabrir las evidencias 153–159.
