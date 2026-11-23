# Evidencia 127 — resolución de BRItem.state en FakeBackupListenerImp.onBackupEnd — 2026-11-23

**Archivo:** `BRService$FakeBackupListenerImp.smali`  
**Método:** `onBackupEnd(String,int)`  
**Procedencia:** recuperación en el chat actual de salidas históricas de Termux compartidas por el usuario: ventanas físicas 1100–1165, 1160–1225 y 1220–1290, más grep de referencias a `BRItem.state`. Clasificación `USER-PROVIDED / RECOVERED-CHAT-TERMUX-OUTPUT`; no se cotejó el archivo local en esta sesión, no se recalculó hash y no hubo ejecución dinámica.

## 1. Corrección de evidencia 124: writer físico 1273

Evidencia 124 dejó el valor del writer de `onBackupEnd()` como no resuelto porque la ventana 1250–1290 no contenía la definición del registro. La recuperación de la ventana anterior permite resolverlo:

En el bloque físico 1100–1165 aparecen, antes de la escritura:

```smali
const/4 v2, 0x7
const/4 v3, 0x1
```

El bloque físico 1160–1225 muestra usos de `v3` como argumento de `copyLocalMediaFile(...,v3)` y `AppUtils.setAppSuspend(...,v3,...)`, pero no muestra una redefinición de `v3`. La continuación física 1220–1290 llega al writer:

```smali
.line 5921
:cond_4
iput v3, v0, Lcom/miui/backup/service/BRItem;->state:I
```

Por tanto, en la secuencia de instrucciones compartida, `v3` conserva el valor `1` desde `const/4 v3, 0x1` hasta el `iput`. El writer físico 1273 asigna **`BRItem.state = 1`**.

**Erratum:** reemplazar la frase de evidencia 124 que decía que el valor concreto de `v3` no estaba resuelto. La clasificación correcta para este writer es `state=1`, sustentada por el registro definido antes de la ventana de escritura y por la continuidad de las ventanas compartidas.

## 2. Contexto adicional conservado

- Antes de la definición de `v3`, el método carga `v2=7`; el flujo comprueba aborto, cifrado, `error==7` y `retryCount<1`, con una salida anticipada en esa rama.
- La rama `:cond_1` comprueba `error==0` y las condiciones de paquete QQ/WeChat antes de la llamada opcional a `copyLocalMediaFile`.
- En el fragmento posterior se comprueba `BRItem.error`; si es cero, se invoca `writeSplitApks` y puede procesarse `splitApkPath`.
- En `:cond_4`, tras la escritura `state=1`, se escribe `progType=v4`; después se invoca `notifyItemTaskEnd(packageName,feature)`.

No se atribuye significado global al número 1 ni se extrapola esta asignación a otros métodos/registros.

## 3. Dedupe del resto de los bloques recuperados

- Las escrituras de `ProgressPageFragmentBase$ProgressItemAdapter.smali` en las líneas físicas 477, 582, 1379, 1492 y 1544, y la escritura de `error=9) en 589, ya están preservadas en evidencia 123. Los bloques recientes corroboran esos datos; no constituyen una evidencia nueva sobre esos writers.
- El grep global de `BRItem.state` funciona como inventario de referencias y mezcla lecturas `iget` con escrituras `iput`; no se vuelve a registrar como hallazgo nuevo.
- El intento de asignar `F` mediante la línea malformada `="$D/.../BRService$5.smali"` produjo `bash: ... No such file or directory`. El `grep` posterior con `"$F"` siguió usando la ruta previa de `ProgressPageFragmentBase$ProgressItemAdapter.smali`; por tanto, ese comando no extrajo ni verificó `BRService$5.smali`. No repetirlo como si hubiera producido salida de ese archivo.

## 4. Efecto sobre el expediente

- Evidencia 124 permanece como registro del contexto parcial de los tres callbacks, pero su afirmación sobre `onBackupEnd v3` queda corregida por esta evidencia 127.
- No se crean nuevos writers ni se declara completo el inventario global.
- No se modificó el APK ni se ejecutó Backup/Restore o prueba dinámica.
