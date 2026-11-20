# Evidencia 43 — Recuperación suplementaria de contexto del 19-11-2026

**Fecha de registro:** 2026-11-20  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama documental actual:** `backup-apk-static-research-2026-11-19`  
**Procedencia:** recuperación de contexto conversacional histórico; cotejada contra evidencias existentes 08, 09, 25, 29, 31 y 33 para evitar duplicación.  
**Clasificación:** RECOVERED-CHAT / HISTORICAL. No LOCAL-VERIFIED.

## 1. Propósito

Este addendum registra datos adicionales recuperados de conversaciones del 19-11-2026 y fija su relación con los documentos que ya existen. No sustituye las evidencias detalladas ni convierte resúmenes históricos en salidas Smali primarias.

## 2. Identidad del artefacto y ancla histórica del repositorio

Datos recuperados:

- SHA-256 completo reportado para `Backup.apk`: `36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae`.
- Rama de investigación reportada en el contexto histórico: `backup-apk-static-research-2026-11-19`.
- HEAD histórico reportado aproximadamente a las 20:47 UTC del 19-11-2026: `7ec90ac69c6d235141ca81d28d1707684be07e4c`.
- Ese HEAD histórico fue descrito como divergido de `main` (43 commits de investigación frente a 3 commits de main, según el resumen recuperado).
- El HEAD anterior no es el HEAD actual: esta recuperación y los registros 42/43 han avanzado la rama desde entonces.

Los hashes de Smali recuperados en el contexto están truncados y no deben utilizarse como identificadores SHA-256 completos:

| Archivo | Tamaño histórico reportado | SHA-256 recuperado (abreviado; no completar) |
|---|---:|---|
| `BRService$5.smali` | 128,021 bytes | `7c011205…8bde25` |
| `BRService.smali` | 522,862 bytes | `163be19e…efbfb` |
| `BRService$FakeBackupListenerImp.smali` | 56,451 bytes | `fe74114e…ecfb2` |
| `MiAsistService.smali` | 111,571 bytes | `3c068220…50a69` |

La evidencia 29 ya contiene la misma información de artefacto y hashes truncados. Se registra aquí porque el contexto recuperado confirma su relevancia como ancla temporal, no como nueva verificación criptográfica.

## 3. Anclas recuperadas de BRService$5 y state 6

El contexto histórico recupera los siguientes puntos concretos:

- La extracción de `BRService$5.smali` relacionó `mBakFilesType=2` con `v8=1`.
- `mBakFilesType=3` activa `mIsTransingTask=true`.
- `mBakFilesType=5` activa `mIsFlashDriveTask=true`.
- `mBakFilesType=1` activa `mIsLocalBackupTask=true`.
- La escritura identificada en línea física 2351 corresponde a `BRItem.state=6`; el debug directive próximo reportado fue `.line 1735`.
- La línea 2351 fue descrita como la única escritura state=6 identificada en ese bloque examinado; no implica exclusividad global del APK.

Estos puntos están ya recogidos en la evidencia 29 y en los addenda de reconciliación 10, 11, 15 y 23. El mapeo de tipos conserva las advertencias y contradicciones documentadas allí; no resolverlo a partir de este resumen.

## 4. Callback BRService$11: distinción state/error

El contexto recuperado del 19-11-2026 reitera:

- `onCustomProgressChange()` no modifica `BRItem.state` en el bloque inspeccionado.
- El argumento de listener `p3` se traduce a `BRItem.error`, no a `BRItem.state`.
- Mapeo reportado: 0→0, 3→2, 4→5, 5→6, 6→7, 8→6, 9→11, otro→1.
- La ruta de error establece `state=3`.
- Se reportó reintento si `mState=3`, `error=7` y `retryCount<1`.
- El análisis histórico no había encontrado escrituras directas demostradas de `state=7` ni `state=8` en los bloques revisados.

La evidencia 08 conserva más contexto y coordenadas de línea. No interpretar un listener code 7/8 ni un `error=7` como `BRItem.state=7/8`.

## 5. ProgressItemAdapter: conteo y alcance

El contexto recuperado reitera que:

- `getSuccessfulCount()` cuenta elementos con `state=1` o `state=6`.
- `getFailedCount()` se obtiene como total menos exitosos.
- `initData()` trata `state=1`, `state=3` y `state=6` como estados finalizados; 1 y 6 incrementan el conteo de éxito.
- Las escrituras directas revisadas en el adapter incluían state 2, 3 y 1; no se observaron literales 7/8 en esos rangos.

La evidencia 09 contiene rangos y límites. La semántica visual completa de cada estado sigue sin cerrarse.

## 6. restoreLocalMediaFile y ArchiveHelper

El contexto histórico recupera esta secuencia, ya desarrollada en evidencia 25:

1. `restoreLocalMediaFile(BRItem, boolean, InputStream)` deriva `backup_<suffix>.zip` a partir de `mCurrentBackupRootPath` y `Utils.getZipSuffixType(packageName,type)`.
2. Si falta el ZIP y el InputStream es null: `state=3`, `error=7`, notificación y retorno.
3. Si hay ZIP o InputStream: `state=8`, llamada a `ArchiveHelper.unzipFiles()`.
4. Después: `state=9` si abortado; `state=1` en caso contrario.
5. La llamada completa reportada utiliza `BRService.PREF_BASE_PATH`, `zipSizeChangedListener`, el `BRItem`, boolean, InputStream y `restoredImageVideoFile`.

El contexto también confirma que el siguiente foco histórico era continuar alrededor de la línea física 3163 de `BRService.smali`. Esto no reemplaza la evidencia 25 ni implica que la línea siga siendo idéntica en otra versión del archivo.

## 7. Estado de recuperación y pendientes que no deben confundirse

| Elemento | Estado |
|---|---|
| APK SHA-256 reportado | Recuperado; no recalculado |
| Hashes Smali completos | No recuperados; solo prefijos/sufijos truncados |
| HEAD histórico 19-11 | Recuperado; no es HEAD actual |
| Inventario global state/error | Resumido en evidencia 29; salida grep íntegra no está en este contexto |
| Callbacks BRService$11/FakeBackupListener | Recuperados parcialmente; evidencia 08 |
| Conteo UI | Recuperado parcialmente; evidencia 09 |
| restoreLocalMediaFile/unzipFiles | Resumido y analizado en evidencia 25 |
| Transporte Binder concreto de BRItem[] | Sigue pendiente de cerrar en el alcance general; ver evidencias 31–36 |
| Salida completa del constructor vacío compartida en chat anterior | No recuperada íntegramente; fragmento actual truncado |

## 8. Reglas de continuidad

1. No volver a ejecutar búsquedas ya preservadas solo para reproducir el mismo inventario.
2. No declarar ausencia global de escritores state/error por búsquedas parciales o por un grep que devolvió cero.
3. Mantener diferenciados `BRItem.state`, `BRItem.error`, `progType`, códigos de listener y `mWorkingStage`.
4. Mantener separados los números de línea física y los valores de directivas Smali `.line`.
5. No completar hashes abreviados.
6. No presentar RECOVERED-CHAT como LOCAL-VERIFIED.
7. Solo lectura estática; no iniciar servicios, backups, restauraciones ni pruebas dinámicas.

**Conclusión:** se recuperaron anclas temporales, metadatos de artefacto y detalles resumidos de callbacks/restore que complementan la navegación del expediente. La evidencia nueva no altera las conclusiones ni cierra los pendientes existentes.
