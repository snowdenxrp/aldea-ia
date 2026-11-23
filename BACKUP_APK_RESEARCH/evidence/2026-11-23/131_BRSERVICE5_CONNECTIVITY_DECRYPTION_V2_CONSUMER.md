# Evidencia 131 — BRService$5: conectividad, descifrado de contraseña y consumidor de v2 — 2026-11-23

**Archivo:** `BRService$5.smali`  
**Ventana física compartida:** `sed -n '740,860p' "$F"`.  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; fragmento pegado directamente por el usuario. Sin cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Comprobación de conectividad y descifrado

Tras obtener `ConnectivityHelper`, el flujo llama a `isNetworkConnected()`.

- Si no hay conexión, asigna `v0=4` y salta a `:goto_c`.
- Si hay conexión, llama a `BRService.setState(v4,v4,v6)` y continúa.
- Lee `BRService.mEncryptedPasswd` y llama a `EncryptPassword.decryptPasswdFromXiaomiAccount(context,mEncryptedPasswd)`.
- Guarda el String devuelto en `BRService.mPasswd`.
- Comprueba `TextUtils.isEmpty(mPasswd)`: contraseña vacía asigna `v0=1`; no vacía asigna `v0=0`.

En `:goto_c`, si `v0` es distinto de cero, llama a `setState(v4,v3,v0)`, obtiene `mBRItems`, llama a `handleTaskFinish(v4,v3,v0,mBRItems)` y retorna. Por tanto, esta ruta agrupa la falta de conectividad (`v0=4`) y el resultado vacío del descifrado (`v0=1`) en la salida anticipada observada. Los valores semánticos de `v3` y `v4` no se asignan aquí.

## 2. Ruta de contraseña no vacía

Cuando `mPasswd` no está vacío, `v0=0` y el flujo alcanza `:cond_17`:

- Registra `"startRestore, decrypted"`.
- Evalúa `v2`.
- Si `v2==0`, llama a `BRService.setState(v4,v11,v6)`.
- Si `v2!=0`, omite esa llamada.
- Después obtiene el `PackageManager` y comienza a iterar `mBRItems`, si la lista no es null. El cuerpo del bucle continúa fuera de la ventana compartida.

## 3. Consumidor de v2: incertidumbre anterior resuelta

Evidencia 129 había conservado dos procedencias demostradas para `v2`:
- La rama de espacio insuficiente asigna explícitamente `v2=2`.
- La ruta que alcanza `:goto_8` ejecuta `move v2,v0`.

Esta ventana muestra el primer consumidor posterior compartido: `v2==0` habilita la llamada `setState(v4,v11,v6)`; cualquier valor distinto de cero la omite. Esto cierra la incertidumbre sobre dónde se consume `v2`, pero no determina por sí solo el significado funcional de los valores ni el de `v11`/`v6`.

## 4. Estados BRItem y límites

- No se observan escrituras directas a `BRItem.state` ni `BRItem.error` en esta ventana.
- Las llamadas a `BRService.setState` son transiciones del servicio; no deben describirse como escrituras directas a campos de BRItem sin revisar el cuerpo del método y sus argumentos.
- La iteración de `mBRItems` comienza, pero el bloque termina antes de mostrar su cuerpo.
- Las directivas `.line 1478`–`.line 1503` son números de línea fuente, no coordenadas físicas.
- No se demuestra autenticación exitosa, ejecución de restauración ni efectos de red más allá de consultar conectividad y llamar al método de descifrado.
- No se ejecutó Backup/Restore ni prueba dinámica.
