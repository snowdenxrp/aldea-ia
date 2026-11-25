# Evidencia 147 — BRService$5: continuación tras restorePackage, estado 6, error IOException y transferencia v8→v35 — 2026-11-24

**Procedencia:** salida compartida directamente por el usuario desde Termux: `nl -ba "$F" | sed -n '2140,2310p'` y `nl -ba "$F" | sed -n '2280,2420p'`.
**Archivo declarado:** `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRService$5.smali`.
**Relación:** continuación de evidencia 146; no duplica el inventario de `v8`, la asignación inicial ni la rama temporal ya documentadas.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Evidencia estática. No se recalculó el hash del archivo ni se realizó ejecución dinámica.

## 1. Rama posterior a la restauración y activación de aplicación

En las líneas físicas 2145–2180:
- `if-ne v0, v14, :cond_36` controla la entrada a la rama que registra que la aplicación está deshabilitada.
- La rama registra el mensaje `app <packageName> is disabled. maybe it's our duty to enable it.`.
- Obtiene `BRItem.packageName` y llama `PackageManager.setApplicationEnabledSetting(packageName, 0, 0)`.
- El flujo continúa en `:goto_1f`.

En las líneas 2188–2216 se consulta `mIsFlashDriveTask`; si es true, compara el paquete con `WECHAT_PKG_NAME` y `QQ_PKG_NAME`. Si coincide con cualquiera, salta a `:cond_37`; si no coincide, continúa a `:cond_38`.

En las líneas 2219–2224, para la rama `:cond_37`, llama:
`BRService.unpackBakSdDatas(v4, BRItem.localFileList)`.

## 2. Cierre del bloque try y excepción IOException

En las líneas 2226–2243:
- Incrementa `v13`.
- Invoca `File.length()` sobre `v4`; en el fragmento no aparece `move-result`, por lo que no se conserva el valor devuelto.
- Lee `BRItem.error` en `v0` (línea 2233), pero inmediatamente sobrescribe `v0` con la cadena `"Backup:BRService"`; no se observa aquí una decisión basada en el error leído.
- Registra `"Restore One, restored package"`.
- Cierra el bloque protegido, con captura de `IOException` en `:catch_4` y limpieza catch-all en `:catchall_1`.

En `:catch_4` (líneas 2253–2256 y 2278–2289):
- La excepción se mueve a `v0`.
- Se ejecuta `iput v7, BRItem.error`.
- Se registra `IOException` mediante `LogUtils.e(..., throwable)`.
- Si `v10` no es null, salta a `:goto_20` para eliminar el archivo temporal.
- No se observa en este manejador una escritura a `mLastError`, ni una llamada de notificación en el fragmento recibido.

## 3. Limpieza y propagación de excepción

- Líneas 2245–2251: si `v10` existe, llama `File.delete()`.
- Líneas 2301–2314: el manejador catch-all mueve `v10` a `v13`; si existe, lo elimina y después relanza la excepción.
- La eliminación se intenta; el fragmento no comprueba ni consume el booleano devuelto por `File.delete()`. No debe afirmarse que la eliminación siempre tenga éxito.

## 4. Transferencia de v8 a v35

En la ruta ordinaria que converge en `:cond_39 / :goto_22`:
`move/from16 v35, v8` (línea 2297), seguido de salto a `:goto_25`.

La misma transferencia aparece en:
- Línea 2364, dentro de la rama de transferencia de `files_for_backup`.
- Línea 2391, en `:cond_3c`.

Esto confirma copias del valor de `v8` a `v35` en esas rutas concretas. No establece que `v35` conserve el significado de `v8` después de la transferencia ni demuestra una relación con `v16=8/9`.

## 5. Rama de transferencia: files_for_backup y estado 6

En las líneas 2316–2388:
- Se consulta `mIsTransingTask`.
- Si es true, se compara `BRItem.packageName` con `"files_for_backup"`.
- Si coincide, llama `waitingForFilesTransingEnd()`.
- Lee `BRItem.state`; si ya es 6, salta a `:cond_39`.
- Si no es 6, escribe `BRItem.state=6` (líneas 2344–2351).
- Recupera packageName, feature, state, error y `transingTotalSize`, y llama `notifyTransItemChange(...)` (líneas 2354–2386).

Conclusión acotada: la escritura a estado 6 ocurre únicamente en esta rama, después de las condiciones `mIsTransingTask==true` y `packageName=="files_for_backup"`, y solo si el estado previo no era 6. La notificación transmite el estado/error leídos después de la escritura.

## 6. Continuación de tarea Flash Drive y medios locales

En las líneas 2393–2420:
- Se consulta `mIsFlashDriveTask`.
- Si es true, compara `packageName` con `"files_for_backup"`.
- Si coincide y `v3` no es cero, llama `BRService.restoreLocalMediaFile(BRItem, false, v3)` (líneas 2412–2420).

El fragmento termina dentro de esta rama; no permite cerrar sus resultados ni las ramas posteriores de `:goto_25`.

## 7. Límites y pendientes

- La ventana comienza en la línea 2140, no incluye la invocación previa a `BRManager.restorePackage` ni todo el contexto de `:goto_1c`; por tanto, no identifica un valor de retorno de `restorePackage` ni demuestra éxito/fracaso de esa llamada.
- No se observa una escritura a `mLastError` en las ventanas recibidas.
- La única escritura directa de `BRItem.state` observada en esta nueva ventana es `state=6` en la rama de transferencia `files_for_backup`.
- La excepción IOException asigna `v7` a `BRItem.error`; el valor/semántica de `v7` no se resuelve en este fragmento.
- No inferir semántica estable para `v8` o `v35` tras su reutilización.
- No se afirma que la restauración se haya completado dinámicamente.

**Estado:** delta nuevo preservado a partir de salida directa de Termux. Investigación estática INCOMPLETA.
