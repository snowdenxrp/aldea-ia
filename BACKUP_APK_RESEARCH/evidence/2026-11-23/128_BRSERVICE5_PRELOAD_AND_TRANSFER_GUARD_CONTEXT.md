# Evidencia 128 — contexto de guardias de transferencia y preload en BRService$5 — 2026-11-23

**Archivo:** `BRService$5.smali`  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`. El usuario compartió `sed -n '1050,1160p' "$F"` y `sed -n '1200,1300p' "$F"`. La identidad del archivo como `BRService$5.smali` queda respaldada por el contexto recuperado y la ruta de `F` establecida en la conversación. No hubo cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Contexto adicional del writer físico 1151

La ventana 1050–1160 conserva la secuencia siguiente alrededor del writer ya inventariado en física 1151:

- Se registra `mRunningItemIndex=v11`.
- Se consulta `shouldSkipBRItem(mState, BRItem)`.
- En la rama donde el resultado es verdadero, si `mIsTransingTask` es verdadero y el estado del BRItem coincide con `v7), se excluye el paquete `files_for_backup`.
- Para los demás paquetes que cumplen esas guardias, se obtiene el nombre desde `bakFilePath` y se consulta `findBakInCachePath(name)`.
- Solo si la ruta devuelta no es nula se ejecuta el writer físico 1151: `iput v14, BRItem.state`.

Esto amplía el contexto de evidencia 126: la condición de caché no es la única guardia; el writer está dentro de la ruta de `shouldSkipBRItem`, transferencia activa, coincidencia con `v7` y paquete distinto de `files_for_backup`.

**Valor de `v14`: sigue UNKNOWN.** La ventana no muestra su definición dominante. No se infiere el valor a partir de otros usos del mismo registro en regiones distintas del método.

## 2. Confirmación del writer físico 1259 y del preload

La ventana física 1200–1300 muestra la continuación de la rama `:cond_20`:

- Para `packageName == "files_for_backup"`, carga el estado actual de BRItem en `v0`.
- Para cualquier otro paquete, asigna `v0=4`.
- En `:goto_11`, escribe `v0` en `BRItem.state` (writer físico 1259).
- Después llama a `notifyItemTaskPreload(packageName, feature)`.

Es corroboración y contexto de la selección ya documentada en evidencia 126; no se declara un writer nuevo.

## 3. Contexto de la rama Pad deshabilitada

La misma ventana continúa desde `:goto_12` y consulta `AppUtils.isPadDisableApps(packageName)`. Cuando devuelve verdadero:
- escribe `state=v10` (writer físico 1283);
- escribe `error=v3`;
- llama a `notifyItemTaskError(packageName, feature, v3)`.

Este bloque confirma la guardia y la relación entre el registro usado para `error` y el argumento de notificación. **No resuelve** los valores dominantes de `v10` ni `v3`. La definición histórica `v10=3` en otra coordenada no se conecta a este writer sin análisis de alcance y flujo.

## 4. Dedupe, coordenadas y límites

- Evidencia 126 ya conserva los writers físicos 1151, 1259, 1283, 1336 y 1441, sus operandos y parte de sus condiciones. Evidencia 128 añade el contexto de guardias descrito arriba; no los presenta como writers nuevos.
- Evidencia 124 ya conservaba el contexto de 1544 y 1557–1589 en una recuperación anterior; este bloque añade la ventana física previa de transferencia y la continuación física 1200–1300. No reemplaza las evidencias 124/126.
- Los números `.line 1528, 1532, 1534, 1536, 1540, 1542, 1543, 1544, 1545, 1546, 1550, 1556, 1557, 1559–1563` son directivas de línea fuente; no son coordenadas físicas.
- No se recuperó aquí el método completo ni las definiciones dominantes de `v14`, `v10` o `v3`. No se asigna semántica global a los códigos de estado/error.
- No se ejecutó Backup/Restore ni prueba dinámica.
