# Evidencia 130 — BRService$5: contraseña cifrada y preparación de future task — 2026-11-23

**Archivo:** `BRService$5.smali`  
**Ventana física compartida:** `sed -n '620,740p' "$F"`.  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; fragmento pegado directamente por el usuario. Sin cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Cierre de log y asignación de contraseña

Después de `:goto_9` y de `setBRServiceFileList(descriptor,items)`, se emite el log `"startRestore, transed"`.

A continuación se recupera `mBackupDescriptor`:

- Si el descriptor es null, `v12=null`.
- Si no es null, `v12=BackupDescriptor.encryptedPwd`.

Ambas rutas convergen en `:goto_a`, donde se escribe `v12` en `BRService.mEncryptedPasswd`.

Esto demuestra propagación condicional de `encryptedPwd` hacia el campo de servicio. No demuestra descifrado, validación de contraseña ni autenticación.

## 2. Construcción de la lista para BRManager.setFutureTask

Si `mBRItems` no es null:

1. Se crea una nueva `ArrayList` con capacidad inicial igual a `mBRItems.size()`.
2. Se obtiene un iterador de `mBRItems`.
3. Por cada elemento, se castea a `BRItem`, se lee únicamente `BRItem.packageName` y se agrega ese String a la nueva lista.
4. Se obtiene `mBRManager` y se invoca `BRManager.setFutureTask(List)` con esa lista.

La lista creada contiene nombres de paquetes, no objetos BRItem ni copias de sus campos state/error. La ventana no permite inferir qué hace posteriormente `setFutureTask` con la lista.

Si `mBRItems` es null, esta preparación se omite y el flujo continúa a `:cond_14`.

## 3. Rama posterior de contraseña

Se lee `mEncryptedPasswd` y se evalúa `TextUtils.isEmpty`.

- Si está vacío, salta a `:cond_17` (destino fuera de esta ventana).
- Si no está vacío, obtiene el objeto referenciado por `val$contextRef`, lo castea a `Context` y llama a `ConnectivityHelper.getInstance(context)`.

La ventana termina tras obtener el helper; no muestra aún llamadas posteriores ni efectos de red.

## 4. Estado del rastreo de v2

La ventana 620–740 no contiene una lectura visible de `v2`. Por tanto, el uso/consumidor de `v2` sigue pendiente; no se debe asignar significado a ese registro por proximidad con el flujo de contraseña o future task.

## 5. Estados BRItem y límites

- No hay escrituras a `BRItem.state` ni `BRItem.error` en este fragmento.
- La lectura de `packageName` es una lectura de campo, no una mutación de BRItem.
- `mEncryptedPasswd` es un campo de `BRService`, distinto de `BRItem.error`.
- Las directivas `.line 1463`–`.line 1475` no son coordenadas físicas.
- No inferir semántica ni ejecución posterior de `BRManager.setFutureTask` o `ConnectivityHelper.getInstance` sin el siguiente bloque.
- No se ejecutó Backup/Restore ni prueba dinámica.
