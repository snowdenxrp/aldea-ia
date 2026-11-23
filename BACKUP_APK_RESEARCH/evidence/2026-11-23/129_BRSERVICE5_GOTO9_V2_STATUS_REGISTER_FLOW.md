# Evidencia 129 — BRService$5: convergencia en :goto_9 y flujo de v2 — 2026-11-23

**Archivo:** `BRService$5.smali`  
**Ventana física compartida:** `sed -n '520,620p' "$F"`.  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`. Fragmento pegado directamente por el usuario en esta conversación. No hubo cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Selección previa de v0

El fragmento muestra tres asignaciones relevantes que convergen en `:goto_7`:

- En `:cond_d`, si `mIsAborted` es verdadero, asigna `v0=3`; si es falso, asigna `v0=6`.
- En `:cond_e`, asigna `v0=2`.
- En `:goto_7`, escribe `v7` en `mIsAborted` mediante `-$$Nest$fputmIsAborted`, y después salta a `:goto_8`.

El origen/valor dominante de `v7` no queda resuelto en esta ventana. Tampoco se atribuye significado semántico definitivo a los valores 2, 3 o 6 por este fragmento aislado.

## 2. Rama de espacio disponible

En `:cond_f` se lee `mTransSingleItemMaxSize` y se consulta `SysUtils.isStorageSpaceEnough(J)`.

- Si el resultado es verdadero, el flujo continúa a `:cond_11`.
- Si el resultado es falso, se escribe `v7` en `mIsAborted`, se asigna `v2=2` y se salta directamente a `:goto_9`.

La ventana no resuelve el valor dominante de `v7`; por tanto, solo queda confirmada la escritura del registro `v7` en el campo, no el valor booleano efectivo.

## 3. Rama de restauración local y convergencia

En `:cond_10`, se consulta `mIsLocalBackupTask`. Si es verdadero, se obtiene `mDescriptorPath` y se llama a `updateLocalRestoreItems(path)`. La rama continúa por `:cond_11` hacia `:goto_8`.

En `:goto_8`, se ejecuta `move v2, v0`. Por tanto, en esta ruta `v2` recibe el valor que quedó en `v0`.

## 4. Consumidor inmediato aún pendiente

En `:goto_9`:

1. Se obtiene `BRServiceDataHolder.getInstance()`.
2. Se recupera `mBackupDescriptor` en `v12`.
3. Se recupera `mBRItems` en `v13`.
4. Se llama a `setBRServiceFileList(descriptor, items)`.
5. El fragmento termina después de cargar el literal de log `"startRestore, transed"`.

**Estado de `v2`:** la ventana demuestra dos orígenes inmediatos antes de `:goto_9`: (a) `v2=2` en la rama de espacio insuficiente; (b) `v2=v0` en `:goto_8`. El bloque no muestra todavía una lectura/uso posterior de `v2`; su consumidor queda pendiente del siguiente fragmento. No asignar aún un nombre semántico al registro.

## 5. Estados BRItem y límites

- No aparece en esta ventana una instrucción `iput` sobre `BRItem.state` ni `BRItem.error`.
- `v0`, `v2` y `v7` son registros de flujo local; no equipararlos automáticamente con campos de BRItem.
- Las directivas `.line 1452`–`.line 1463` son metadatos de línea fuente y no coordenadas físicas del archivo.
- Este bloque continúa el rastreo previamente pendiente desde `:goto_9`; no reemplaza ni duplica la evidencia 128, que cubre otras ventanas físicas y el contexto de los writers de preload.
- No se infiere el significado de `"startRestore, transed"` más allá de que es un literal de log.
- No se ejecutó Backup/Restore ni prueba dinámica.
