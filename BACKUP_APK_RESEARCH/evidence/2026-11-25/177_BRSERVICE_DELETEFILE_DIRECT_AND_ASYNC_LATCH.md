# Evidencia 177 — BRService.deleteFile: eliminación directa y espera de operación asíncrona — 2026-11-25

**Fuente primaria:** salidas Termux compartidas para `BRService.smali:5730–5860` y `5820–5910`. La segunda ventana recupera la continuación, comprobación del latch, manejo de excepciones y final del método.

## Hallazgos confirmados

El método declara `throws IOException` y bifurca según `mBakFilesType`:

### Rama `mBakFilesType != 5`
- Invoca directamente `Utils.deleteFile(p1)`.
- Continúa a la salida común y retorna si la llamada regresa normalmente.
- En el fragmento no se observa comprobación adicional de resultado booleano.

### Rama `mBakFilesType == 5`
- Obtiene `mFileOpLatch` y entra en su monitor.
- Reinicia el `AtomicBoolean` a `false`.
- Construye `BRService$19(this, p1)` y ejecuta `start()`.
- Invoca `wait()` sobre el objeto latch dentro del bloque protegido por el monitor.
- Si `wait()` lanza `InterruptedException`, registra `deleteFile wait error` y continúa; en este fragmento no se observa restauración del indicador de interrupción ni relanzamiento de esa excepción.
- Después lee el latch. Si es verdadero, sale del monitor y retorna. Si es falso, construye y lanza una `IOException` sin mensaje explícito.
- El handler `catchall` ejecuta `monitor-exit` antes de propagar otras excepciones del bloque.

## Límites e interpretación

- La espera mostrada no tiene timeout explícito. No se puede concluir que la operación siempre termine: depende del progreso del hilo `BRService$19` y de su señalización.
- Este método no muestra quién cambia `mFileOpLatch` a verdadero ni cómo se determina el resultado de la eliminación asíncrona; eso requiere inspeccionar `BRService$19`.
- En la rama directa, no se observa en este método una comprobación del resultado de `Utils.deleteFile`; el contrato interno de esa utilidad no se infiere.
- No se ejecutó el APK ni se comprobó comportamiento dinámico.

## Dedupe

E176 documenta `createFile(File)` y menciona `BRService$19` solo como hilo creado por el método de eliminación cuyo cuerpo estaba pendiente. E177 añade el flujo completo de `deleteFile(File)`, sin duplicar E170–E176.

## Procedencia y alcance probatorio

USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. No se realizó cotejo local independiente del Smali ni se calculó hash nuevo del archivo. La evidencia describe exclusivamente las instrucciones compartidas. Expediente **INCOMPLETO**.
