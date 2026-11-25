# Evidencia 163 — BRService$5: caller de restoreStreamSplitApk y flujo posterior — 2026-11-25

**Base documental:** índice maestro v1.52; evidencia 162.  
**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Salida literal de Termux para `BRService$5.smali:1815–1965`, grep global de referencias al puente y contexto del encabezado de la invocación. No cotejo local independiente, no hash nuevo de Smali, no ejecución dinámica.  
**Estado:** análisis estático; expediente INCOMPLETO.

## 1. Caller único localizado

La búsqueda global:

`grep -RIn --include='*.smali' -F -- '-$$Nest$mrestoreStreamSplitApk' "$D/.."`

devolvió:
- `BRService$5.smali:1899`: invocación del puente sintético.
- `BRService.smali:2101`: definición del puente sintético.

La salida no mostró otras referencias en los archivos Smali recorridos. El puente sintético invoca el método privado, como ya se registró en E162. No se generaliza a archivos fuera del árbol buscado ni a referencias no textuales.

## 2. Argumentos y secuencia del caller

En `BRService$5.smali:1897–1899`, el caller obtiene la instancia `BRService` en `v14` y ejecuta:

`invoke-static {v14, v6, v5, v3}, BRService.-$$Nest$mrestoreStreamSplitApk(...)`

Según el descriptor del puente y la definición cotejada en E162:
- `v14`: instancia BRService;
- `v6`: BRItem;
- `v5`: ZipFile;
- `v3`: InputStream entregado como tercer argumento al método privado.

La ventana muestra que la invocación está dentro de la ruta `:cond_31`, tras comprobar el flujo relacionado con `supportFixApp()` y la condición `if-nez v3, :cond_31` (físico 1864). En esa ruta se obtiene el basename de `BRItem.bakFilePath` y se llama al método split APK.

Inmediatamente después del retorno:
1. El caller usa `v5` para `ZipFile.getEntry(basename)`.
2. Llama `ZipFile.getInputStream(entry)`; el resultado se coloca en `v0`.
3. Llama `ParcelFileDescriptor.createPipe()`; el array de descriptores se coloca en `v3`, sobrescribiendo en el caller el registro que había contenido el InputStream pasado al puente.
4. Construye `BRService$zipStreamReader` con la instancia BRService, el array pipe y el nuevo InputStream `v0`.
5. Construye un Thread con ese Runnable y lo entrega a `BackupApp.workExecutor.execute()`.
6. Registra `bakFileDescript is not null, transfer success`, obtiene el elemento cero del array pipe y continúa hacia `:goto_18`.

## 3. Implicación para la propiedad del InputStream original

E162 estableció que, dentro de `restoreStreamSplitApk`, el parámetro local `p3` se reemplaza por el stream obtenido de `ZipFile.getInputStream(entry)` cuando la entrada split existe. Eso no modifica el registro `v3` del caller: los registros locales de ambos métodos son independientes.

La nueva ventana muestra que, al regresar del puente, el caller no realiza un cierre explícito del stream original en el tramo inmediatamente posterior; en su lugar, después de crear el pipe, reutiliza `v3` para guardar el array de descriptores. Esto **no basta para concluir una fuga**: falta inspeccionar el resto del método caller, sus handlers/catchall y el contexto previo para determinar si el stream se cerró antes, si existe una ruta de cleanup o si otra abstracción administra su ciclo de vida.

El nuevo InputStream `v0` que se pasa a `zipStreamReader` es distinto del stream original `v3` entregado al método split APK. No confundir ambos flujos.

## 4. Dedupe, límites y siguiente paso

- E162 conserva el método privado completo, sus handlers y el hecho de que sobrescribe su parámetro local `p3`.
- E163 añade el caller localizado en `BRService$5`, su secuencia posterior y la distinción entre el stream original `v3` y el nuevo stream `v0` usado por `zipStreamReader`.
- No se afirma cierre efectivo, fuga, restauración exitosa ni comportamiento dinámico.
- Siguiente delta: recuperar el encabezado del método contenedor y el resto de su cuerpo hasta `.end method`, incluidos todos los handlers; revisar también las asignaciones/uso de `v3` anteriores a la llamada. Determinar si el caller cierra el InputStream original en otra rama o cleanup.
- Tras cerrar este punto, continuar con el origen/ciclo de vida de `extra_zip_file_path`.

**Estado final:** caller primario identificado y flujo posterior documentado desde salida aportada por el usuario; investigación INCOMPLETA.
