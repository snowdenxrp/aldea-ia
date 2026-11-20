# Evidencia 60 — mBakFilesType: campo, escrituras, lecturas y límites de procedencia

- Fecha de consolidación: 2026-11-20
- Rama: `backup-apk-static-research-2026-11-19`
- Fuente: mensajes históricos con salidas grep/Smali pegadas por el usuario desde Termux, 17–19-11-2026; salida de BRService$5.smali recuperada el 19-11.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para las instrucciones y referencias expresamente compartidas; RECOVERED-CHAT solo para asociaciones resumidas sin bloque completo.
- Solo análisis estático. No ejecución de backup/restore ni modificación del APK.

## 1. Identidad del campo

El usuario reportó:
- `BRService.smali`: campo `.field private mBakFilesType:I` en línea física 267.
- Getter sintético del campo alrededor de 665–670.
- Referencias adicionales en las líneas físicas 3325, 4093, 5676, 5812, 7355, 8762 y 12697.

La presencia de una referencia grep no demuestra por sí sola el valor, condición o semántica de la rama.

## 2. Escrituras y contexto reportado

### 2.1 backupPackages

Salida directa compartida el 19-11-2026 21:16:56Z:
- BRService.smali:3325: `iput v4, v0, Lcom/miui/backup/service/BRService;->mBakFilesType:I`.
- BRService.smali:3327: `const/4 v4, 0x3`.
- BRService.smali:3339: `iput-boolean v4, v0, Lcom/miui/backup/service/BRService;->mIsFromMiAsist:Z`.

El contexto histórico identifica el bloque como perteneciente a `backupPackages`. No se conserva aquí la declaración completa del método ni toda la secuencia intermedia de registros; no asumir que el literal de línea 3327 sea el valor escrito en 3325 sin el movimiento/orden exactos entre ambas instrucciones.

### 2.2 restoreFiles

Evidencia 34 conserva el cuerpo Smali directo de `restoreFiles(BRItem[],BackupDescriptor,int)`. La recuperación del 19-11-2026 21:16:56Z añade:
- BRService.smali:12697: `iput p3, p0, Lcom/miui/backup/service/BRService;->mBakFilesType:I`.
- BRService.smali:12699: `const/4 p3, 0x3` (instrucción reportada en la salida compartida).
- BRService.smali:12716: lectura/comparación reportada de `mBakFilesType` contra `0x3`.

La instrucción en 12699 ocurre después de la escritura 12697; no confundir el valor del parámetro p3 guardado en el campo con el valor que el registro p3 recibe después. El fragmento completo de esa secuencia no se reproduce aquí; conservar la interpretación exacta del branch solo cuando se recupere el bloque literal.

## 3. Lecturas y referencias grep adicionales

Salida grep compartida directamente:
- BRService.smali:4093 — referencia a `mBakFilesType` en `copyFile`.
- BRService.smali:5676 — referencia en `createFile`.
- BRService.smali:5812 — referencia en `deleteFile`.
- BRService.smali:7346 — `iget-boolean v0, p0, Lcom/miui/backup/service/BRService;->mIsFromMiAsist:Z`.
- BRService.smali:7355 — `iget v0, p0, Lcom/miui/backup/service/BRService;->mBakFilesType:I`.
- BRService.smali:8762 — referencia en `makeDirs`.

Para 4093/5676/5812/8762 se conserva solo la referencia del campo y la asociación de método reportada; no se transcribe un compare literal ni se afirma que cada uno compare con 0x5 sin recuperar la instrucción exacta. La afirmación anterior de que el getter alrededor de 7355 devuelve 4 cuando `mIsFromMiAsist` es true y, de otro modo, `mBakFilesType`, no está respaldada aquí por el cuerpo literal ni por una declaración completa del método: mantenerla como PRIOR-ASSISTANT-SUMMARY / UNVERIFIED hasta recuperar el método.

## 4. Configuración de flags en BRService$5.run()

La salida directa de Termux compartida el 19-11-2026 20:47:46Z para `BRService$5.smali:103–186` confirma estas comparaciones y destinos:
- `v0` frente a `v5 = 0x2` → branch `:cond_1` y ruta que usa `v8`;
- `v9` frente a `v10 = 0x3` → branch `:cond_2` y escritura/uso de `mIsTransingTask`;
- `v9` frente a `v11 = 0x5` → branch `:cond_3` y escritura/uso de `mIsFlashDriveTask`;
- `v9` frente a `v7 = 0x1` → branch `:cond_4` y escritura/uso de `mIsLocalBackupTask`.

La lectura resumida del bloque fue:
- tipo 2 → `v8=1`;
- tipo 3 → `mIsTransingTask=true`;
- tipo 5 → `mIsFlashDriveTask=true`;
- tipo 1 → `mIsLocalBackupTask=true`.

La salida histórica directa confirma las comparaciones, branch labels y registros/destinos; no se reconstruye aquí la instrucción exacta que asigna 1 a v8 si no está preservada en el fragmento literal. Una paráfrasis previa que asignaba `mIsTransingTask` al tipo 2 queda corregida: la comparación de `mIsTransingTask` es contra `0x3`.

## 5. Interpretación y límites

- `mBakFilesType` es un campo int del objeto BRService.
- Se escribe desde al menos dos contextos reportados: `backupPackages` (línea 3325) y `restoreFiles` (línea 12697).
- `restoreFiles` recibe el tipo por p3; la instrucción 12699 modifica ese registro después de guardarlo en el campo.
- `BRService$5.run()` consulta valores 1, 2, 3 y 5 para configurar rutas/flags. No asumir que estos valores forman un enum completo o que la semántica de escritura y restauración es idéntica.
- No confundir `mBakFilesType` con `BRItem.state`, `BRItem.error`, códigos de listener, `DeviceStage` o `mWorkingStage`.
- El getter de tipo y las condiciones de `copyFile/createFile/deleteFile/makeDirs` requieren sus cuerpos Smali literales antes de afirmar semántica exacta.

**Estado:** varias escrituras/lecturas y ramas están respaldadas por USER-PASTED-SOURCE / DIRECT-CHAT; asociaciones de getter/condiciones no reproducidas permanecen UNKNOWN o PRIOR-ASSISTANT-SUMMARY / UNVERIFIED. No LOCAL-VERIFIED por relectura/hash independiente en esta sesión.