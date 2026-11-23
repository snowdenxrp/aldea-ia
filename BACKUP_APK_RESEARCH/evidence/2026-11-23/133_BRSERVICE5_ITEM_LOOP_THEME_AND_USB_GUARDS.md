# Evidencia 133 — BRService$5: guardias del bucle por BRItem, tema y disponibilidad USB — 2026-11-23

**Archivo:** `BRService$5.smali`  
**Ventana física compartida:** `sed -n '960,1080p' "$F"`.  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; fragmento pegado directamente por el usuario. Sin cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Guardias de entrada al procesamiento individual

En `:goto_f` recupera `mBRItems`, carga `v3=0xb` y continúa únicamente si se cumplen todas estas condiciones:

1. `mBRItems != null`.
2. `mIsAborted == false`.
3. `v11 < mBRItems.size()`.

Si la lista es null, la tarea está abortada o el índice ya no es menor que el tamaño, el flujo salta a `:cond_62`.

## 2. Obtención y registro del BRItem

- Recupera `mBRItems[v11]`, conserva el objeto en `v6` y lo convierte a `BRItem`.
- Construye y registra `"Restore One, start: "` concatenado con `BRItem.packageName` y `", type="` concatenado con `BRItem.type`.
- Esta ventana demuestra la lectura y el registro de esos campos, no una mutación de `BRItem`.

## 3. Caso especial de Theme Manager

- Lee `BRItem.packageName` y lo compara con `"com.android.thememanager"` mediante `TextUtils.equals`.
- Si coincide, escribe `v7` en `BRService.isRestoreTheme`.
- Si no coincide, omite esa escritura y continúa por `:cond_1b`.
- El valor efectivo de `v7` no queda resuelto en esta ventana.

## 4. Guardias de tipo de tarea y USB

Desde `:cond_1b`:

- Si `v8` es verdadero, asigna `v4=0xa` (10) y `v16=0x8` (8), y salta a `:goto_3f`.
- Si `v8` es falso, consulta `mIsFlashDriveTask`.
- Si no es una tarea de unidad externa, continúa por `:cond_1d`.
- Si es una tarea de unidad externa, consulta `isUsbAvaliable()`.
- Cuando USB no está disponible, asigna `v4=0xa` (10) y `v16=0x9` (9), y continúa hacia `:goto_3f` (destino fuera de esta ventana).

No se atribuye semántica funcional a `v4`, `v16`, `v8` ni a los literales 8/9 a partir de esta región aislada.

## 5. Dedupe y límites

- Evidencia 132 documenta la inicialización de `v11=0`, `v13=0` y la entrada a `:goto_f`; evidencia 133 añade las guardias de iteración y el comienzo del procesamiento por elemento.
- No hay escrituras directas a `BRItem.state` ni `BRItem.error` en esta ventana.
- La escritura a `BRService.isRestoreTheme` es un campo del servicio, no un campo de BRItem.
- No inferir que los valores 8/9 sean errores de BRItem, códigos globales ni estados.
- Las directivas `.line 1519`–`.line 1528` son líneas fuente, no coordenadas físicas.
- No se ejecutó Backup/Restore ni prueba dinámica.
