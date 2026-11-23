# Handoff de continuidad — MIUI Backup.apk — 2026-11-23

## Fuente de verdad

- Repositorio: `snowdenxrp/aldea-ia`
- Rama: `backup-apk-static-research-2026-11-19`
- Índice maestro: `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`
- Versión del índice: **1.26**
- Último HEAD antes de crear este handoff: `e92946f3dd6f394d92761a36a46048cdc35849bd` (índice de evidencia 127)
- Evidencias nuevas: `evidence/2026-11-23/127_FAKEBACKUPLISTENER_ONBACKUPEND_STATE_REGISTER_RESOLUTION.md` y `evidence/2026-11-23/128_BRSERVICE5_PRELOAD_AND_TRANSFER_GUARD_CONTEXT.md`
- Evidencias relacionadas: 123 (callbacks de ProgressItemAdapter), 124 (writers de callbacks), 126 (writers BRService$5).

## Delta guardado en esta sesión

Se recuperaron en el chat los bloques históricos de Termux para `BRService$FakeBackupListenerImp.smali`:
- 1100–1165
- 1160–1225
- 1220–1290

**Corrección esencial:** en `onBackupEnd(String,int)`, antes del writer físico 1273 aparece `const/4 v3, 0x1`. Las ventanas intermedias no muestran redefinición de `v3`; por tanto `iput v3, v0, BRItem.state` escribe **`state=1`**. Esto corrige evidencia 124, que había dejado `v3` sin resolver por no disponer de la ventana previa.

También se recuperó un grep global de `BRItem.state`, pero mezcla lecturas `iget` y escrituras `iput`; no es un inventario exclusivo de writers. Las escrituras de `ProgressPageFragmentBase$ProgressItemAdapter.smali` ya están preservadas en evidencia 123 y no se duplicaron.

## Comando fallido que no debe confundirse con una extracción

El usuario intentó asignar `F` con una línea malformada similar a:

```bash
="$D/com/miui/backup/service/BRService$5.smali"
```

Bash respondió que no existía el comando/ruta. El `grep` posterior usó el valor anterior de `F`, que apuntaba a `ProgressPageFragmentBase$ProgressItemAdapter.smali`. Por ello **no se obtuvo una extracción de BRService$5** mediante ese comando. No afirmar que sus métodos se inspeccionaron por ese intento ni repetirlo sin una necesidad concreta.

## Continuidad inmediata

El usuario está reconstruyendo el orden de una conversación anterior y compartiendo sus bloques de salida. Continuar recibiendo el siguiente fragmento histórico en el orden original. Por ahora:
- no adelantar comandos ni nuevas extracciones;
- no repetir los bloques ya recuperados;
- distinguir hallazgos previos de deltas nuevos;
- no duplicar evidencia 123 ni reabrir los writers ya cubiertos por 124/126;
- cotejar el índice y las evidencias antes de guardar cualquier otro delta;
- conservar clasificación `USER-PROVIDED / RECOVERED-CHAT-TERMUX-OUTPUT` cuando la fuente sea una salida histórica pegada en el chat, no `LOCAL-VERIFIED`;
- no atribuir semántica global a los números de `BRItem.state` solo por sus valores.

## Estado de verificación

Evidencia 127 e índice maestro fueron escritos en la rama indicada. Este handoff se añade como documento de continuidad independiente; después de crearlo, verificar el HEAD y volver a leer los tres archivos (evidencia 127, índice y handoff) antes de declarar la preservación completa.


## Actualización 2 — evidencia 128 (2026-11-23)

El usuario compartió dos nuevas ventanas de `BRService$5.smali`: físicas 1050–1160 y 1200–1300. Se preservó únicamente el delta contextual en evidencia 128; el índice maestro avanzó a v1.26.

**Contexto adicional confirmado:**
- Writer físico 1151 (`state=v14)): pertenece a la rama `shouldSkipBRItem(mState, BRItem)`; requiere `mIsTransingTask=true), estado actual igual a `v7), paquete distinto de `files_for_backup) y resultado no nulo de `findBakInCachePath()). El valor de `v14) sigue sin resolverse.
- Writer físico 1259: la ventana vuelve a mostrar que `files_for_backup` conserva su estado actual y los demás paquetes reciben `state=4); después se llama a `notifyItemTaskPreload()). Ya estaba documentado en evidencia 126; la nueva ventana añade corroboración/orden.
- Writer físico 1283: la rama `AppUtils.isPadDisableApps(packageName)` escribe `state=v10,error=v3) y llama a `notifyItemTaskError(...,v3)). Los valores efectivos de `v10) y `v3) no quedan resueltos. No conectar la definición histórica `v10=3) de otra región sin demostrar flujo y alcance.

**Dedupe:** no son writers nuevos; evidencia 128 amplía el contexto de evidencias 124/126. No repetir estas ventanas. Continuar esperando el siguiente bloque histórico del usuario, sin adelantar comandos ni nuevas extracciones.


## Actualización 3 — evidencia 129 (2026-11-23)

Se recibió la ventana física 520–620 de `BRService$5.smali` y se preservó su delta como evidencia 129. El índice maestro avanzó a **v1.27**.

**Continuidad técnica inmediata:**
- `:cond_d`: selecciona `v0=3` cuando `mIsAborted` es verdadero y `v0=6` cuando es falso; `:cond_e` asigna `v0=2`.
- `:goto_7` escribe `v7` en `mIsAborted`; el valor dominante de `v7` no se resuelve en esta ventana.
- La rama de espacio insuficiente asigna `v2=2` y salta a `:goto_9`.
- La ruta por `:goto_8` hace `v2=v0`.
- `:goto_9` recupera descriptor e items y llama a `setBRServiceFileList(descriptor,items)`. El bloque termina después del literal `"startRestore, transed"`; aún falta ver el uso posterior de `v2`.

**Dedupe:** no hay writer directo de `BRItem.state/error` en esta ventana. Evidencia 129 añade flujo de registros, no writers nuevos. No repetir la ventana 520–620. Continuar esperando el siguiente bloque histórico del usuario, preservando el orden y sin adelantar extracciones.


## Actualización 4 — evidencia 130 (2026-11-23)

Se recibió la ventana física 620–740 de `BRService$5.smali`. El delta se preservó en evidencia 130; índice maestro actualizado a **v1.28**.

**Continuidad inmediata:**
- Después de `setBRServiceFileList(descriptor,items)`, registra `"startRestore, transed"`.
- Propaga `BackupDescriptor.encryptedPwd` a `BRService.mEncryptedPasswd`; cuando el descriptor es null, asigna null.
- Si `mBRItems` no es null, construye una lista nueva que contiene solo `BRItem.packageName` y la entrega a `BRManager.setFutureTask(List)`.
- Comprueba si `mEncryptedPasswd` está vacío. En la rama no vacía obtiene Context desde `val$contextRef` y llama a `ConnectivityHelper.getInstance(context)`.
- No aparece uso de `v2`; su consumidor sigue sin localizar. No hay escrituras directas a `BRItem.state/error`.

**Dedupe:** no repetir ventanas 520–620 ni 620–740. Continuar desde la instrucción posterior a `ConnectivityHelper.getInstance(context)` y el destino `:cond_17` solo cuando el usuario comparta el bloque siguiente. Mantener procedencia de fragmentos compartidos y no inferir efectos posteriores.


## Actualización 5 — evidencia 131 (2026-11-23)

Se recibió la ventana física 740–860 de `BRService$5.smali` y se preservó el delta en evidencia 131. El índice maestro avanzó a **v1.29**.

**Hallazgos y continuidad inmediata:**
- Consulta conectividad mediante `ConnectivityHelper.isNetworkConnected()`. Sin conexión, asigna `v0=4) y salta a salida anticipada.
- Con conexión, llama a `setState(v4,v4,v6)`, descifra `mEncryptedPasswd` mediante `EncryptPassword.decryptPasswdFromXiaomiAccount(context,...)` y guarda el resultado en `mPasswd`.
- Contraseña vacía → `v0=1); no vacía → `v0=0). La ruta no nula llama a `setState(v4,v3,v0)`, `handleTaskFinish(v4,v3,v0,mBRItems)` y retorna.
- **Consumidor de v2 localizado:** en `:cond_17`, `v2==0) ejecuta `setState(v4,v11,v6)`; `v2!=0) omite esa llamada. Esto cierra el pendiente de evidencia 129/130 sobre la localización del consumidor, pero no resuelve el significado de v2, v11 o v6.
- Tras esa decisión obtiene PackageManager y comienza a iterar `mBRItems`; el cuerpo del bucle aún no se ha recibido.

**No repetir:** ventanas 520–620, 620–740 ni 740–860. El siguiente bloque útil empieza después de la inicialización/entrada al bucle `:goto_d`, en el punto exacto que el usuario comparta. No adelantar comandos ni nuevas extracciones.

**Límites:** no se observan writes directos a `BRItem.state/error`; no inferir significado de los argumentos de `setState` ni autenticación/éxito de restauración. Procedencia de evidencia 131: salida pegada directamente por el usuario, no verificación local independiente ni runtime.


## Actualización 6 — evidencia 132 (2026-11-23)

Se recibió la ventana física 850–970 de `BRService$5.smali` y se preservó en evidencia 132. El índice maestro avanzó a **v1.30**.

**Hallazgos:**
- Completa el iterador inicial de `mBRItems`: obtiene BRItem, lee `packageName` y llama a `equals("files_for_backup")`. En el fragmento pegado no aparece `move-result` ni branch basado en el resultado; después se ve `v11=5) y retorno al bucle. No atribuir filtrado/selección sin cotejo del Smali íntegro.
- Comprueba `mZipFilePath`; null o vacío no abre ZIP. Ruta no vacía intenta `new ZipFile(path)`.
- Éxito → ZipFile en `v5). `IOException` → log, lectura de `mState), llamada `setState(mState,v3,v14)), y `v5=null). Las rutas sin path también dejan `v5=null).
- En `:goto_e` inicializa `v11=0), `v13=0); `:goto_f` recupera `mBRItems`, carga `v3=11) y comprueba null hacia `:cond_62`.

**Continuidad inmediata:** continuar desde la rama de lista no nula de `:goto_f` / destino `:cond_62` según el siguiente bloque que comparta el usuario. No repetir ventanas 520–620, 620–740, 740–860 ni 850–970. No adelantar extracciones.

**Límites:** sin writes directos a `BRItem.state/error`; no asignar semántica a `v11=5), `v3=11) o `v14). La llamada `setState` es global al servicio. Procedencia de evidencia 132: salida pegada por el usuario, sin verificación local independiente ni runtime.
