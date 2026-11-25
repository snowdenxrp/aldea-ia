# Evidencia 164 — zipStreamReader: cierre de streams y BRService$5: continuación hacia PerformAdbRestoreTask — 2026-11-25

**Base documental:** índice maestro v1.54; evidencias 162 y 163.  
**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Salidas literales aportadas para `BRService.smali:13190–13320`, `BRService$zipStreamReader.smali:180–280` y `BRService$5.smali:1935–2005`, además de `wc -l` de los tres archivos. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica.  
**Estado:** análisis estático; expediente INCOMPLETO.

## 1. Identidad y límites de las ventanas

El usuario ejecutó las rutas corregidas bajo:

`$HOME/backup-static/decoded/smali/com/miui/backup/service`

Conteos físicos reportados:
- `BRService.smali`: 19,654 líneas.
- `BRService$zipStreamReader.smali`: 268 líneas.
- `BRService$5.smali`: 4,261 líneas.

Las ventanas son parciales; no constituyen por sí solas los métodos completos.

## 2. BRService.restoreStreamSplitApk: cotejo de cleanup con E162

La ventana 13190–13320 comienza en el bucle de copia ya descrito en E162: lectura desde `p3`, escritura al `BufferedOutputStream p2`, flush y cierre del buffer. A continuación muestra:
- En la ruta común, el registro `v3` conserva el `FileOutputStream` y se intenta cerrarlo; una `IOException` se registra mediante `LogUtils.e`.
- Después se intenta cerrar `p3` si no es null; la excepción de cierre se registra.
- El handler ordinario registra el error con la etiqueta literal `IOException`, intenta cerrar `v3` y `p3`.
- El flujo catchall salta a la limpieza y relanza la excepción según el cuerpo ya preservado en E162.

**Dedupe:** este fragmento confirma y solapa la gestión de recursos documentada en E162; no crea un hallazgo independiente sobre el método privado. La salida termina en `:goto_6`; no se recibió aquí el resto posterior a ese punto, aunque E162 conserva la ventana más amplia 13035–13362.

## 3. BRService$zipStreamReader.run(): cierre de salida y entrada

La ventana 180–280 muestra el tramo final de `run()`:
- En la ruta de error de transferencia, registra `transfer to FileDescriptor error`.
- Si el registro local `v3` no es null, intenta cerrar el `OutputStream`; si falla con `IOException`, registra el error de cierre.
- Después obtiene el campo `mZipInputStream`; si no es null, intenta cerrarlo. La excepción de este cierre se captura como `Exception` en el handler asociado.
- La ruta ordinaria llega a `return-void`.
- La ruta de salida por excepción (etiqueta `:goto_6`) intenta cerrar otro registro de salida, `v4`, si no es null; registra una eventual `IOException`. Después intenta cerrar también `mZipInputStream`, registra una eventual excepción y termina con `throw v3`.

**Conclusión acotada:** el final de `run()` contiene rutas explícitas de cierre del OutputStream local y del InputStream almacenado en `mZipInputStream`, incluida una ruta que relanza una excepción después de intentar la limpieza. Esta ventana no permite determinar qué descriptor del pipe representa cada OutputStream ni si el extremo complementario queda cerrado por el caller; para eso se requiere el constructor y el inicio de `run()`, además del resto del caller.

## 4. BRService$5: continuación después de preparar el pipe

La ventana 1935–2005 continúa el caller descrito en E163:
- En la ruta `:goto_19`, obtiene `mRestoreTaskExecutor` y consulta `ExecutorService.isShutdown()`.
- Si el executor no está apagado, construye `PerformAdbRestoreTask` con el contexto recuperado de `val$contextRef` (`WeakReference.get()`, cast a `Context`), el descriptor `ParcelFileDescriptor` en `v6`, el `BRItem` en `v22`, la contraseña `mPasswd` y el `BackupRestoreListener`.
- Envía la tarea al executor mediante `ExecutorService.execute(Runnable)`.
- A continuación llama a `BRService.waitForRestoreTaskEnd()`.
- Después salta a `:goto_1c`.

**Conclusión acotada:** el caller no termina inmediatamente tras crear y entregar el lector del pipe. En la rama mostrada, comprueba que el executor no esté apagado, programa un `PerformAdbRestoreTask` y espera mediante `waitForRestoreTaskEnd()`. La ventana termina en el salto `:goto_1c`; no muestra el destino de ese salto, el cierre de los ParcelFileDescriptor ni el final del método/handlers. No se concluye éxito de restauración ni cierre/fuga de recursos.

## 5. Relación con E162–E163 y deduplicación

- E162 sigue siendo la evidencia principal del método completo `restoreStreamSplitApk`; la primera ventana de este aporte solo corrobora su cleanup.
- E163 sigue siendo la evidencia del caller, del puente, de la distinción entre el InputStream original y el nuevo stream entregado a `zipStreamReader`, y de la preparación del pipe.
- E164 añade dos deltas: el tramo final de cleanup de `zipStreamReader.run()` y la continuación del caller desde la entrega del lector del pipe hasta el envío de `PerformAdbRestoreTask` y la espera.
- Los conteos de líneas son metadatos de la extracción reportados por Termux; no son hashes ni verificación independiente de los archivos.

## 6. Pendientes precisos

1. Recuperar el inicio de `BRService$zipStreamReader.run()` y su constructor para mapear la propiedad/dirección de los descriptores y el origen exacto de `mZipInputStream`.
2. Continuar `BRService$5.smali` desde el destino de `:goto_1c` hasta `.end method`, incluyendo handlers/catchall y todas las rutas de cierre de los descriptores del pipe y del InputStream original.
3. Revisar las asignaciones y usos de `v3` antes de la llamada al puente para determinar si el InputStream original se cierra en otra ruta.
4. Tras cerrar el ciclo de streams, continuar con el origen y ciclo de vida de `extra_zip_file_path`.

**No demostrado:** fuga efectiva, cierre del extremo lector/escritor por todas las rutas, éxito de `PerformAdbRestoreTask`, integridad del archivo, restauración completada, vulnerabilidad o comportamiento dinámico.

**Estado final:** E164 preserva únicamente los deltas anteriores a partir de las salidas aportadas por el usuario. Expediente INCOMPLETO.
