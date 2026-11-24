# Evidencia 138 — BRService$5: finalización de restauración, métricas y liberación — 2026-11-23

**Archivo:** `smali/com/miui/backup/service/BRService$5.smali`  
**Método/contexto:** continuación del cierre de `startRestore` en `run()`.  
**Fuente:** salida Termux compartida directamente por el usuario mediante las ventanas físicas `sed -n '4060,4170p'`, `sed -n '4160,4225p'` y `sed -n '4220,4285p'` de `$F`.  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`; no cotejada independientemente contra el archivo local ni ejecutada dinámicamente.

## Continuación después de `Restoring end`

El fragmento continúa desde la obtención de `BRServiceDataHolder.getInstance()`:

1. Ejecuta `setDescriptor(null)`.
2. Invoca el método sintético `BRService.-$$Nest$mupdatePkgStae(this$0, v14)` (se conserva literalmente el nombre `updatePkgStae` observado).
3. Obtiene `mBRItems` y llama a `handleTaskFinish(4, v2, v14, mBRItems)`.
4. Llama a `releaseWakeLock()`.
5. Si `mIsFlashDriveTask` es verdadero, llama a `unregisterStorageReceiver()`; si es falso, omite esa llamada.
6. Registra el log `startRestore, released`.

## Selección de eventos de finalización

Después de la liberación anterior, el bloque compara `v2` con `v3`. Solo si son iguales entra a la selección por `mBakFilesType`:

| `mBakFilesType` | Comportamiento observado |
|---|---|
| 1 | Registra `backup_local_restore_finish` y continúa con las métricas locales |
| 3 | Si `mIsFromMiAsist` es verdadero registra `backup_pc_restore_finish`; si es falso registra `backup_trans_restore_finish` |
| 5 | Registra `backup_usb_restore_finish` |
| Otro valor | En el switch visible no se registra ninguno de esos eventos |

Las ramas de tipos 3 y 5 saltan a la convergencia `:goto_44`; la rama local converge en el mismo destino.

## Métricas de restauración local

Después de registrar `backup_local_restore_finish`, consulta `mIsAborted`.

- Si `mIsAborted` es verdadero, omite las dos métricas y el log de resumen.
- Si `mIsAborted` es falso:
  - Registra `backup_local_restore_num`, parámetro `total`, con valor `mBRItems.size()`.
  - Registra `backup_local_restore_success_num`, parámetro `success`, con valor `v13`.
  - Construye y registra el mensaje `total restore: <mBRItems.size()>, total susses count: <v13>` mediante `LogUtils.i`. Se conserva el literal `susses` tal como aparece en Smali.

Por tanto, el evento `backup_local_restore_finish` se registra antes de consultar `mIsAborted`; no prueba por sí mismo que la restauración haya sido exitosa ni que las métricas se hayan emitido. En este bloque, `v13` se usa como contador de éxito para la métrica y el log; su origen/asignaciones no quedan demostrados aquí.

## Salida del método

Las ramas visibles convergen en `:cond_6e / :goto_44` y ejecutan `return-void`. La salida excepcional `:catchall_3` captura la excepción, ejecuta `monitor-exit v2` dentro del bloque protegido y vuelve a lanzar la excepción.

## Dedupe frente a evidencias 136–137

- Evidencia 136 conserva el cleanup de transferencia anterior y la entrada a la comprobación de la tarea local.
- Evidencia 137 conserva la liberación de `BRManager`, el paro de `StorageMonitor`, la selección de `v2/v14`, la llamada `setState(4,v2,0,v14)`, la limpieza del directorio temporal y el log `Restoring end`.
- Esta evidencia añade únicamente la continuación posterior: descriptor a null, actualización `updatePkgStae`, `handleTaskFinish`, liberación de WakeLock, unregister condicional del receiver, selección de eventos de finalización, métricas locales y salida del método.

## Límites

- No se resuelven aquí los valores ni el significado general de `v2`, `v3`, `v14` o `v13`; tampoco se resuelve el origen de `v13`.
- La condición `v2 == v3` se registra como guardia literal; no se le atribuye semántica adicional.
- Los nombres de eventos son telemetría; no equivalen por sí solos a un resultado de éxito.
- `handleTaskFinish` se documenta como llamada con argumentos observados, no como análisis de su implementación.
- No se demuestra ejecución dinámica, éxito real de restauración ni comportamiento en dispositivo.
