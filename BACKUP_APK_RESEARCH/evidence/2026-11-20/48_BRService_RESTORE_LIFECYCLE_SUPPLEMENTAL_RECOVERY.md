# Evidencia 48 — Recuperación suplementaria del lifecycle de restauración BRService

- Fecha de incorporación: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: recuperación de conversaciones de 17 y 19-11-2026.
- Clasificación: RECOVERED-CHAT. Los fragmentos originales completos no están incluidos aquí; no LOCAL-VERIFIED.
- Alcance: preservar detalles adicionales del ciclo BRService$5.run()/startRestore(), preparación, monitorización, limpieza y límites de una extracción fallida.

## 1. restoreFiles(): entrada a la restauración

Contexto histórico del 17-11-2026:
- BRService.smali:12672 fue citado para restoreFiles().
- La función comprueba isIdleState() y mIsReStartCommand.
- Si admite la operación, fija mBakFilesType, estado global, descriptor y BRItems; establece mIsAborted=false; notifica y llama a startRestore().
- En el bloque resumido no se observó validación explícita del descriptor, de los archivos o de autorización.

**Límite:** ausencia de validación explícita en el fragmento examinado no demuestra que no existan controles en otros callers, capas o métodos. Hay discrepancia histórica de coordenadas: otros resúmenes ubican el cuerpo alrededor de 1351–1367. La evidencia 34 resolvió la interpretación de registros y firma, pero no normalizó definitivamente esas coordenadas. Releer método y descriptor solo si la reconciliación documental no puede resolverlo.

## 2. BRService$5.run(): arquitectura general recuperada

Un resumen de conversación del 17-11 describe el método como:
- inicialización de StorageMonitor, alrededor de líneas 206–215 del método/archivo según el contexto histórico;
- preparación de mDescriptorPath;
- selección entre transferencia, ZIP/zipStreamReader y restauración local;
- uso de mRestoreTaskExecutor;
- ruta de aplicaciones con PerformAdbRestoreTask y BRManager.restorePackage(), en un rango reportado alrededor de 1810–2105;
- invocación de restoreLocalMediaFile() para medios locales.

**Advertencia de coordenadas:** estos rangos provienen de resúmenes de conversaciones y no deben mezclarse con las líneas físicas de otras clases o con directivas .line. La extracción prioritaria de ese día falló porque la variable de shell $F estaba vacía; el único stdout/stderr recuperado fue:

    sed: can't read : No such file or directory

No se conservó raw output de la rama de despacho de aplicaciones en ese intento. No reconstruir el bloque faltante a partir del resumen.

## 3. Clasificación mBakFilesType: resolución documental

La evidencia 02 es la recuperación prioritaria del bloque BRService$5.run alrededor de las líneas 1391–1418:
- mBakFilesType==2 → v8=1.
- mBakFilesType==3 → mIsTransingTask=true.
- mBakFilesType==5 → mIsFlashDriveTask=true.
- mBakFilesType==1 → mIsLocalBackupTask=true.

La misma conversación vincula tipo 2/v8=1 con la ruta temporal .tmp_bak_file / getTransTempBackupRootPath(), pero la semántica exacta de v8 requiere el contexto completo.

**Corrección:** resúmenes anteriores que asignaban tanto 2 como 3 a transferencia son paráfrasis contradictorias; no reutilizar 2→mIsTransingTask. La asignación mejor soportada es la de evidencia 02, todavía RECOVERED-CHAT y pendiente de cotejo local.

## 4. Monitor, transferencia y conexión remota

Detalles recuperados de 17–19 de noviembre:
- Se reinicia StatSpeedHelper.
- Se crea StorageMonitor(context,type) y se llama startMonitor().
- Resultado 0: continúa.
- Resultado 1: el resultado local pasa a 2.
- Otros resultados: resultado 5 y aborto.
- En la ruta de transferencia se inicializan mReceivedRestoringItemFiles y mEverTriedBaks.
- Se llama bindTransFileServiceLocked().
- Se establece estado/etapa 3 antes de esperar mRemoteConnectedLatch.
- Si el latch no conecta, se llama setState(...,7,...), se espera con await(), se registra "not connected to remote" y se establece mIsAborted=true.
- Si conecta, se vuelve a etapa 3 y continúa la preparación.
- Al completar preparación se reinician contadores de transferencia, se envía Handler message 7 y se registra "startRestore, prepared".

**Interpretación obligatoria:** v0=7 en la rama de preparación fue descrito como resultado/control de flujo local, no como BRItem.state=7. El argumento de etapa 7 en setState tampoco es BRItem.state=7.

La ruta Flash Drive registra receiver/actualiza disponibilidad USB. Una conversación resumió una llamada setState(...,9) y handleTaskFinish cuando USB no está disponible; la cadena global de error 9 se conserva con más precisión en evidencia 05/47. No mezclar el resumen antiguo con la llamada final de etapa 12.

## 5. Preparación, password y capacidad

Recuperación histórica de líneas BRService$5.run/startRestore:
- 1452–1461: mIsAborted selecciona resultado local 3 o 6; una rama alternativa asigna resultado 2.
- Falta de espacio fuerza resultado 2 y mIsAborted=true.
- En tarea local se llama updateLocalRestoreItems.
- Se llama setBRServiceFileList(descriptor,mBRItems).
- 1463–1475: registra "startRestore, transed"; deriva mEncryptedPasswd desde BackupDescriptor.encryptedPwd; recopila BRItem.packageName en una lista; llama BRManager.setFutureTask().
- 1477–1503: sin red asigna resultado local 4; contraseña descifrada vacía asigna resultado local 1; en ambos casos se llama setState(v4,v3,v0) y handleTaskFinish(...), retornando.
- Con contraseña válida registra "startRestore, decrypted" y continúa con setState(v4,v11,v6).

Los valores locales v3, v4, v6 y v11 no se deben renombrar semánticamente sin leer sus asignaciones y el método receptor. Los resultados locales 1/2/3/4/5/6/7 no son automáticamente errores globales ni BRItem.state.

## 6. Cierre y métricas de restauración

Recuperación de conversación del 17-11:
- mReconnector.quit().
- ITransFileService.stopAll(0), con manejo reportado de RemoteException.
- unbindTransFileService().
- En la ruta mIsLocalBackupTask se reportó una segunda llamada a unbindTransFileService(); conservar el detalle como histórico hasta leer el bloque exacto.
- StorageMonitor.stopMonitor().
- Si v16!=0: v14=v16 y v2=12.
- Si v16==0 y abortado: v14=3 y v2=10.
- Si v16==0 y normal: v14=0 y v2=11.
- Llamada final resuelta en evidencia 12: setState(4,v2,0,v14).
- Borra contenidos de Customization.getTransTempBackupRootPath().
- setDescriptor(null).
- updatePkgStae(v14).
- handleTaskFinish(4,v2,v14,mBRItems).
- releaseWakeLock().
- Para Flash Drive se desregistra StorageReceiver.
- Métricas de restauración local: backup_local_restore_num=mBRItems.size(); backup_local_restore_success_num=v13.
- Log reportado: "total restore: ..., total susses count: ...".

El orden de setState, updatePkgStae y handleTaskFinish debe seguir la instrucción Smali exacta; evidencia 12 resuelve el orden de argumentos, no todos los efectos laterales de cada llamada.

## 7. Límites y pendientes que sobreviven

1. El cuerpo completo de BRService$5.run() y startRestore() no está preservado como texto íntegro en este addendum.
2. La extracción fallida con $F vacío no produjo el bloque de despacho de aplicaciones; no fingir que sí.
3. Falta el cuerpo completo de StorageMonitor.startMonitor() y la semántica exacta de sus códigos de retorno.
4. Falta cerrar la relación entre ZIP/zipStreamReader, mRestoreTaskExecutor, PerformAdbRestoreTask y BRManager.restorePackage() con instrucciones fuente.
5. El mapping de mBakFilesType debe verificarse contra todas las comparaciones y usos, sin repetir la paráfrasis corregida en evidencia 02.
6. No confundir resultados locales de preparación, mWorkingStage, mState, BRItem.state, BRItem.error, códigos de listener ni mLastError.
7. Solo lectura estática. No ejecutar servicio, backup, restore ni operaciones sobre el APK.

**Conclusión:** este addendum recupera el flujo general de BRService$5 y su preparación/cierre, pero no reemplaza la extracción primaria. La investigación permanece INCOMPLETA.
