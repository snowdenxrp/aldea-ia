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

El fragmento compartido se interrumpe al comenzar la lectura de `extra_zip_file_path`. Por ello quedan sin recuperar el resto de la rama, el despacho hacia la ejecución de restauración, validaciones, tratamiento de errores y resultado final.

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
