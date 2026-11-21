# Evidencia 94 — Rutas de restauración de cinco y siete argumentos; recepción CMD_RESTORE

**Fecha de registro:** 2026-11-21  
**Clasificación:** `USER-PASTED-SUMMARY / RECOVERED-CHAT`  
**No es:** `LOCAL-VERIFIED`; no se recibió en este bloque la extracción Smali literal completa para cotejo independiente.

## Delta recuperado

### 1. Sobrecarga de cinco argumentos: recursión

Se reporta que la sobrecarga:

`startRestoreCommand(Context, ArrayList, BackupDescriptor, String, int)`

contiene únicamente una invocación estática a sí misma con los mismos cinco argumentos, seguida de `return-void`, sin condición de salida ni delegación a la sobrecarga de siete argumentos.

Se reportan dos llamadores que pueden entrar en esa sobrecarga:

- `MiAsistService.startRestoreCommand()`, pasando `Context=p0`, y `null` para ArrayList, BackupDescriptor y String, más entero `4`; después intenta llamar a `bindBRService()`.
- `BRService.restoreTransfering(Context, BackupDescriptor)`, cuando `brState == 4`, con una invocación de cinco argumentos descrita como `{p0, v0, p1, v0, v1}`.

También se reporta un llamador adicional desde `RetransferUtils.smali:154` hacia `BRService.restoreTransfering(Context, BackupDescriptor)`. Por tanto, la ruta de retransmisión se incorpora al conjunto de posibles entradas a la sobrecarga recursiva.

**Interpretación acotada:** si el cuerpo y las llamadas están representados exactamente como se resumió, la recursión no retorna normalmente y la instrucción posterior a la llamada en `MiAsistService` no se alcanza en una ejecución ordinaria. Esto no demuestra por sí solo una vulnerabilidad explotable ni el origen externo de la llamada.

### 2. Sobrecarga independiente de siete argumentos

Se reporta una ruta distinta desde `ProgressPageFragmentBase$6.smali:275`, que obtiene datos de un `Bundle` y contexto de restauración, incluidos:

- `extra_descriptor_dir`
- `extra_zip_path`
- un entero de configuración/tipo
- un descriptor y una lista de elementos obtenidos previamente

Esta ruta invoca directamente la sobrecarga de siete argumentos; no depende de la sobrecarga recursiva de cinco argumentos.

La sobrecarga de siete argumentos prepara un Intent con `CMD_RESTORE` y extras reportados:

- `extra_descriptor`
- `extra_descriptor_dir`
- `extra_zip_file_path`
- `extra_bakfiles_type`
- `extra_is_from_miasist`, cuando corresponde
- `extra_britems`, cuando no es un reinicio

Se reporta una llamada a `Context.startService(Intent)`. En determinadas condiciones (sin actividad en primer plano y API 26 o superior), aparece además un mecanismo de inicio en primer plano. Esto confirma, al nivel del resumen compartido, el mecanismo de envío del Intent; no acredita que todos los extras sean válidos ni que la restauración concluya.

### 3. Recepción de CMD_RESTORE en BRService

Se reporta que `BRService.onStartCommand()` reconoce `CMD_RESTORE` y, en esa rama:

- asigna `BackupApp.mIsBackupTask = false`;
- lee `extra_is_from_miasist`;
- lee el tipo de operación;
- recupera `extra_britems`;
- consulta `BRServiceDataHolder.getDescriptor()`;
- determina `mDescriptorPath` a partir del descriptor o de `extra_descriptor_dir`.

La primera recuperación del fragmento se interrumpía al comenzar la lectura de `extra_zip_file_path`, pero un mensaje histórico posterior del usuario (2026-11-17T05:16:53Z) conserva una continuación hasta el despacho a `restoreFiles(...)`: lista no vacía → conversión `toArray()` y llamada con `BRItem[]`; lista vacía → llamada con null solo bajo condiciones específicas; en otro caso, log `restoreFiles brItems is null` y `setState(...)`. La lectura de `extra_zip_file_path` se ancla en físicas 19417–19426; las llamadas se ubican por directivas `.line 913` y `.line 915`, no por coordenadas físicas.

## Estado y límites

| Cuestión | Estado |
|---|---|
| Cuerpo recursivo de la sobrecarga de cinco argumentos | REPORTADO EN RESUMEN; pendiente cotejo Smali |
| Llamador desde MiAsistService | REPORTADO |
| Llamador desde restoreTransfering() | REPORTADO |
| RetransferUtils → restoreTransfering() | REPORTADO |
| Ruta de siete argumentos desde ProgressPageFragmentBase$6 | REPORTADA |
| Preparación de CMD_RESTORE y llamada startService() en sobrecarga de siete argumentos | REPORTADA |
| Recepción/preparación inicial de CMD_RESTORE en onStartCommand() | REPORTADA; fragmento incompleto |
| Ejecución efectiva y finalización de restauración | PENDIENTE |
| Equivalencia funcional entre rutas de cinco y siete argumentos | NO DEMOSTRADA |
| Accesibilidad externa / origen de activación | NO DEMOSTRADA |
| Autorización y controles de seguridad de la ruta | UNKNOWN / PENDIENTE |

## Próxima continuación cuando el usuario aporte más material

No repetir el análisis de los hallazgos anteriores. El delta pendiente es recuperar el resto de `BRService.onStartCommand()` después de la lectura de `extra_zip_file_path`, identificar el método de ejecución alcanzado por `CMD_RESTORE`, y cotejar con Smali literal la sobrecarga de siete argumentos y los llamadores de cinco argumentos. Mantener separadas las dos rutas y no declarar vulnerabilidad ni restauración funcional sin demostrar la cadena completa.

No se ejecutaron servicios, restauraciones ni pruebas dinámicas como parte de esta evidencia.


## Addendum de corrección — continuación parcial de CMD_RESTORE (2026-11-21)

La recuperación focalizada del mensaje del usuario del **2026-11-17T05:16:53Z** corrige el límite descrito arriba: el material histórico no terminaba al comenzar `extra_zip_file_path`. El bloque compartido continuaba hasta los despachos `restoreFiles(...)`:

- La lista `extra_britems` no vacía se convierte a `BRItem[]` mediante `toArray` y se pasa a `restoreFiles(BRItem[], BackupDescriptor, int)`, con los registros reportados `v6` (descriptor) y `v3` (tipo).
- Si la lista está vacía, se llama a `restoreFiles(null, v6, v3)` solo cuando `v3 == 3` o `mIsReStartCommand` es verdadero.
- En el otro caso se registra literalmente `restoreFiles brItems is null` y se llama a `setState(...)`; los argumentos exactos de esa llamada no están recuperados.
- La lectura de `extra_zip_file_path` se ancla en líneas físicas 19417–19426. Las llamadas a `restoreFiles` se reportaron bajo directivas Smali `.line 913` y `.line 915`; el log/error se reportó en `.line 915–918`. Estas directivas fuente no son coordenadas físicas.

**Límites:** no se recuperó en esta ronda el texto Smali consecutivo íntegro, el comando exacto de extracción ni el rango físico completo posterior a 19426. No asignar números físicos a las directivas `.line`, no inventar argumentos de `setState`, y no confundir este despacho dentro de `onStartCommand` con el cuerpo independiente de `restoreFiles` (reportado alrededor de la física 12672). Clasificación `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
