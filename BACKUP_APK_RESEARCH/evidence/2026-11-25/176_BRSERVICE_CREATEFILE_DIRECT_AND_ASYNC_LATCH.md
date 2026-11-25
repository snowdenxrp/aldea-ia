# Evidencia 176 — BRService.createFile: creación directa y espera de operación asíncrona — 2026-11-25

**Fuente primaria:** salidas Termux compartidas para `BRService.smali:5650–5740` y `5700–5840`. La primera recupera el método completo desde su directiva; la segunda confirma su cola y el comienzo del método siguiente.

## Hallazgos confirmados

El método declara `throws IOException` y bifurca según `mBakFilesType`:

### Rama `mBakFilesType != 5`
- Invoca `Utils.createFile(p1, true)`.
- Si el resultado es verdadero, salta al retorno común (`:goto_1`).
- Si es falso, registra una advertencia `fail to create file ` seguida de `p1.getAbsolutePath()`.
- Construye y lanza una `IOException` sin mensaje explícito.

### Rama `mBakFilesType == 5`
- Obtiene `mFileOpLatch` y entra en su monitor.
- Establece el `AtomicBoolean` a `false`.
- Construye `BRService$20(this, p1)` y ejecuta `start()`.
- Invoca `wait()` sobre el objeto latch mientras mantiene el monitor adquirido por el bloque `monitor-enter`; la liberación/re-adquisición durante `wait()` sigue la semántica de monitor de Java.
- Si `wait()` lanza `InterruptedException`, registra `createFile wait error` y continúa; en este fragmento no se observa restauración del indicador de interrupción ni relanzamiento de esa excepción.
- Después lee el latch. Si es verdadero, sale del monitor y retorna. Si es falso, construye y lanza una `IOException`.
- Un handler `catchall` asegura la salida del monitor antes de propagar otras excepciones capturadas por ese bloque.

## Límites e interpretación

- La espera mostrada no tiene timeout explícito. No se puede concluir que la operación siempre termine: eso depende de que el hilo `BRService$20` progrese y de la señalización del latch.
- Este método no muestra quién cambia `mFileOpLatch` a verdadero ni cómo se maneja el resultado real de la creación asíncrona; eso requiere inspeccionar `BRService$20`.
- En la rama directa, el booleano de `Utils.createFile(file, true)` controla el retorno o la IOException. No se infiere el significado interno del segundo argumento.
- No se atribuye a `IOException` una causa más específica que la indicada por el flujo visible.
- No se ejecutó el APK ni se comprobó comportamiento dinámico.

## Dedupe

E175 documenta `copyToUsb(String)` y solo identifica `createFile(File)` como el método siguiente. No describe su cuerpo. E176 añade el flujo completo de `createFile(File)`; no duplica E170–E175.

## Procedencia y alcance probatorio

USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. No se realizó cotejo local independiente del Smali ni se calculó hash nuevo del archivo. La evidencia describe exclusivamente las instrucciones compartidas. Expediente **INCOMPLETO**.
