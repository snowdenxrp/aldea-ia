# Evidencia 57 — Ramas RetransferUtils/restoreTransfering y arranque de RestoreThread

- Fecha de consolidación: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: mensajes históricos del usuario del 17-11-2026; parte de los detalles de restoreFiles solo aparece en resúmenes previos del asistente.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para la llamada, condición brState y ramas descritas por el usuario; PRIOR-ASSISTANT-OUTPUT para el resumen de restoreFiles.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. RetransferUtils.smali:154

El usuario describió directamente:
- `RetransferUtils.smali:154` llama a `BRService.restoreTransfering(Context, BackupDescriptor)`.
- En `restoreTransfering()`, si `brState == 3`, inicia la acción `CMD_BACKUP` y añade `extra_is_retransfering=true`.
- Si `brState == 4`, llama al overload de cinco argumentos de `BRService.startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,int)`.

El segundo caso complementa evidencia 55. El primero añade una rama backup/retransfering que no estaba documentada allí.

**Límite:** no se recuperó aquí el bloque Smali literal completo de restoreTransfering ni los demás valores de brState; no afirmar que 3 y 4 sean los únicos valores ni describir el resto del método.

## 2. startRestore(): creación de RestoreThread

El usuario pegó una descripción de `startRestore()`:
- crea una `WeakReference`;
- instancia `BRService$5` con nombre `"RestoreThread"`;
- llama `start()` sobre ese hilo.

Clasificación USER-PASTED-SOURCE / DIRECT-CHAT para esta secuencia. No se recuperó aquí el cuerpo completo, el constructor exacto de la WeakReference ni el callback posterior. La secuencia acredita creación/inicio del hilo descrito, no finalización exitosa del restore.

## 3. restoreFiles(BRItem[],BackupDescriptor,int): resumen no primario

Un resumen anterior del asistente atribuyó al método `restoreFiles(BRItem[],BackupDescriptor,int)` (coordenada reportada alrededor de línea física 12672):
- guarda `mBakFilesType`;
- asigna `mBRItems` salvo cuando tipo==3;
- guarda descriptor;
- limpia el flag de abort;
- notifica;
- llama `startRestore()`.

Esta descripción se clasifica **PRIOR-ASSISTANT-OUTPUT / NEEDS SOURCE REVALIDATION**, no fuente directa del usuario en la recuperación actual. No usar como conclusión cerrada hasta recuperar el bloque del método.

## 4. Condición de lista ausente en CMD_RESTORE: conflicto de resúmenes

Se conservan dos formulaciones históricas:
- Evidencia 56, basada en mensaje directo recuperado del usuario: `restoreFiles()` se llama cuando hay BRItems, o bajo una condición descrita como “tipo=3/reinicio”; lista null registra `restoreFiles brItems is null` y `setState(mState,0xc,6)`.
- Un resumen previo del asistente dijo: sin items se permite tipo 3 o `mIsReStartCommand`; si no, `setState(mState,0xc,6)`.

La formulación con `mIsReStartCommand` es PRIOR-ASSISTANT-OUTPUT y no debe sustituir la frase directa “tipo=3/reinicio” mientras no se recupere la condición Smali. Pueden ser interpretaciones relacionadas, pero no se demuestra que sean idénticas.

## 5. Pendientes

1. Recuperar cuerpo completo de `restoreTransfering(Context,BackupDescriptor)`, incluyendo todos los valores de brState y argumentos.
2. Recuperar `startRestore()` y `BRService$5.run()` para reconstruir el hilo RestoreThread sin asumir éxito.
3. Recuperar `restoreFiles(BRItem[],BackupDescriptor,int)` en el rango físico reportado alrededor de 12672 y verificar asignaciones/condiciones.
4. Resolver la condición de lista null en CMD_RESTORE y la posible relación con tipo 3/`mIsReStartCommand`.
5. Solo lectura estática.

**Conclusión:** `restoreTransfering()` no es exclusivamente una ruta de restore: el resumen directo recuperado describe `brState==3 → CMD_BACKUP + extra_is_retransfering=true` y `brState==4 → startRestoreCommand(5 args)`. `startRestore()` crea e inicia `BRService$5("RestoreThread")`. El cuerpo de restoreFiles y la condición exacta para lista ausente permanecen incompletos.
