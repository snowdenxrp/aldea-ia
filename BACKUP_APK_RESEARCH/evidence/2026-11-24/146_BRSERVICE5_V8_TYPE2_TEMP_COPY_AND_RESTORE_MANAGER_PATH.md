# Evidencia 146 — BRService$5: v8, rama de tipo 2, archivo temporal y convergencia en restorePackage — 2026-11-24

**Procedencia:** salidas compartidas directamente por el usuario desde Termux en este chat: `nl -ba` de las ventanas 100–190, 1708–1755, 1770–1905, 1835–1995 y 1988–2145; `grep -nE` de todas las referencias a `v8`.
**Archivo declarado por el usuario:** `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRService$5.smali`.
**SHA-256 declarado por Termux:** `7c0112052117caf5b5fb119fc807f62ea0cf42bf35fe8d7e75c38af8a18bde25`.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Evidencia estática; hash reportado por el usuario, no recalculado ni cotejado localmente de forma independiente. No ejecución dinámica.

## 1. Identidad de v8 y asignación inicial

En el fragmento físico 103–127:

~~~smali
iget-object v0, v1, Lcom/miui/backup/service/BRService$5;->this$0:Lcom/miui/backup/service/BRService;
invoke-static {v0}, Lcom/miui/backup/service/BRService;->-$$Nest$fgetmBakFilesType(Lcom/miui/backup/service/BRService;)I
move-result v0
const/4 v5, 0x2
...
if-ne v0, v5, :cond_1
const/4 v8, 0x1
goto :goto_0
:cond_1
const/4 v8, 0x0
~~~

Por tanto, en esta asignación inicial, `v8=1` si `mBakFilesType==2`, y `v8=0` en caso contrario.

## 2. Inventario de referencias y continuidad hasta el consumidor

El usuario compartió el resultado completo de:

```text
119, 124, 1051, 1235, 1728, 2297, 2364, 2391,
2429, 2502, 2523, 2533, 2657, 2787, 2790, 2809,
2845, 2888, 2921, 2936, 2946, 2948, 3091, 3203,
3211, 3350, 3377, 3380, 3387, 3391, 3398, 3424,
3440, 3513, 3568, 3807
```

De las referencias anteriores al consumidor de la línea 1728, solo 1051 y 1235 vuelven a leer/mover el valor de `v8`; no aparece una redefinición de `v8` entre sus asignaciones 119/124 y el consumidor 1728. Las redefiniciones posteriores visibles empiezan en 2429. En consecuencia, para el flujo mostrado, la condición de la línea 1728 conserva el valor derivado de `mBakFilesType==2`.

No se infiere continuidad de `v8` más allá de ese consumidor: el registro se reutiliza posteriormente para otros valores y propósitos.

## 3. Rama de tipo 2: archivo temporal

El consumidor de la línea 1728:

~~~smali
if-eqz v8, :cond_2d
:try_start_3
new-instance v10, Ljava/io/File;
invoke-static {}, Lcom/miui/backup/Customization;->getTransTempBackupRootPath()Ljava/lang/String;
move-result-object v14
const-string v15, ".tmp_bak_file"
invoke-direct {v10, v14, v15}, Ljava/io/File;-><init>(Ljava/lang/String;Ljava/lang/String;)V
...
const/4 v15, 0x4
invoke-static {v14, v15, v4, v10}, Lcom/miui/backup/service/BRService;->-$$Nest$mcopyFile(Lcom/miui/backup/service/BRService;ILjava/io/File;Ljava/io/File;)V
move-object v4, v10
goto :goto_17
~~~

La rama verdadera crea `.tmp_bak_file` bajo `getTransTempBackupRootPath()`, invoca `mcopyFile(4, v4, v10)` y reemplaza la referencia local `v4` por el archivo temporal.

Conclusión estática acotada: **mBakFilesType==2 → v8!=0 → rama de copia a .tmp_bak_file**. No se infiere el significado funcional más amplio del tipo 2.

## 4. Rama alternativa y convergencia en :goto_17

Si `v8==0`, el flujo entra en `:cond_2d`:

- Lee `mIsTransingTask`. Si es true, conserva `v4` en `v10` y salta a `:goto_17`.
- Si es false, lee `mIsFlashDriveTask`.
- Si es tarea de unidad flash, compara el paquete con `WECHAT_PKG_NAME` y `QQ_PKG_NAME`; para paquetes distintos de ambos invoca `unpackBakSdDatas(v4, BRItem.localFileList)`.
- Las rutas llegan a `:goto_17`.

El bloque muestra las condiciones de la llamada, pero no permite generalizar el comportamiento a todos los paquetes ni a todas las tareas.

## 5. Flujo común después de :goto_17

En las líneas 1835–2005:

- Se consulta `StorageManagerCompat.supportFixApp()`.
- Si devuelve true y `v0==0`, se reinicia `mRestoreTaskSync`, se registra "restore Task execute" y se prepara el descriptor:
  - con `v3==0`, abre `v4` con `ParcelFileDescriptor.open(v4, 0x10000000)`;
  - con `v3!=0`, obtiene el nombre desde `BRItem.bakFilePath`, recupera la entrada del ZIP, abre su InputStream, crea un pipe y ejecuta `BRService$zipStreamReader` mediante `BackupApp.workExecutor`.
- En `:goto_19`, si `mRestoreTaskExecutor` no está apagado, crea `PerformAdbRestoreTask(context, descriptor, BRItem, passwd, listener)`, la ejecuta y llama a `waitForRestoreTaskEnd()`.
- Si `supportFixApp()` es false, el flujo cae en `:cond_32 / :goto_1a`. También se llega a `:goto_1a` cuando `supportFixApp()` es true y `v0!=0`.

## 6. Ruta :goto_1a y llamada a BRManager.restorePackage

En las líneas 2007–2079:

- Si `v3!=0`, crea un pipe, ejecuta `zipStreamReader` con `v3` como InputStream y usa el extremo cero del pipe como descriptor `v24`.
- Si `v3==0`, asigna `v24=null`.
- En `:goto_1b`, obtiene `mBRManager`, `BRItem.packageName`, `BRItem.feature`, `mPasswd`, la ruta absoluta de `v4` y el listener.
- Invoca:
  `BRManager.restorePackage(packageName, feature, passwd, v4.getAbsolutePath(), listener, v24)`.

Después, en `:goto_1c`, consulta `BackupManager.isSysAppForBackup(...)` y continúa la lógica posterior. El extracto recibido llega hasta la condición de la línea 2145; no cubre la finalización completa.

## 7. Reconciliación con evidencia previa y límites

- Evidencia 85 conservaba referencias históricas de `v8`; evidencia 86 amplió el inventario; evidencia 89 distinguió usos disjuntos del registro. Esta evidencia añade el literal primario de la asignación 119/124, el consumidor 1728, la rama alternativa y su convergencia.
- Evidencia 133 ya conservaba otra rama que consulta `v8` y asigna valores a `v16` bajo sus propias condiciones. El presente flujo de tipo 2 no demuestra que esa rama ni sus valores `v16=8/9` sean consecuencia de la copia temporal aquí descrita.
- No se observa asignación a `v16` en las ventanas 1708–2145 recibidas.
- No se concluye que `mcopyFile` termine con éxito en todos los casos, que `restorePackage` termine con éxito, ni que se produzca una restauración efectiva en dispositivo.
- La evidencia no resuelve por sí sola la cadena completa hasta el estado final, `mLastError` o los efectos posteriores de restauración.
- El hash identifica el archivo según la salida compartida por el usuario; no acredita que el archivo se haya subido al repositorio ni que el asistente lo haya verificado localmente.

**Estado:** delta documental nuevo y verificable contra las ventanas Smali proporcionadas; investigación estática INCOMPLETA. Sin cotejo local independiente ni ejecución dinámica.
