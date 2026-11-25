# Evidencia 162 — BRService.restoreStreamSplitApk: método completo, streams y limpieza — 2026-11-25

**Base documental:** índice maestro v1.51; evidencia 161.  
**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Salida literal de Termux para `BRService.smali:13035–13362` y grep de referencias dentro del mismo archivo. No cotejo local independiente, no hash nuevo de Smali, no ejecución dinámica.  
**Estado:** análisis estático; expediente INCOMPLETO.

## 1. Identificación y entrada

El encabezado físico 13035 identifica:

`private restoreStreamSplitApk(BRItem, ZipFile, InputStream): void`

Registros de entrada: `p1=BRItem`, `p2=ZipFile`, `p3=InputStream`. El método inicializa `v3=null`, registro que después se usa para conservar la referencia a `FileOutputStream` durante la limpieza.

Si `BRItem.splitApkPath` está vacío, salta a `:cond_4`, omite la búsqueda de entrada y llega a la limpieza/cierre del stream recibido.

Si no está vacío:
1. Obtiene el basename de `splitApkPath`, posterior al último separador.
2. Llama `ZipFile.getEntry(basename)`.
3. Si el resultado es null, cierra el `InputStream` recibido si no es null y retorna. La excepción de cierre `IOException` se registra como `close zipInputStream error`.
4. Si la entrada existe, llama `ZipFile.getInputStream(entry)` y mueve el nuevo stream a `p3`.

## 2. Construcción de la ruta de destino

Después de obtener el stream de la entrada:
- Lee `BRService.mZipFilePath`.
- Busca el último punto (`.`) y toma la subcadena anterior.
- Concatena ese prefijo con el valor previo de `BRItem.splitApkPath`.
- Construye un `File`, obtiene `getAbsolutePath()` y escribe esa ruta absoluta de vuelta en `BRItem.splitApkPath`.
- Obtiene el directorio padre. Solo si ese padre no existe llama `mkdirs()` y después `createNewFile()`; el retorno booleano de esas operaciones no se comprueba en el fragmento.
- Abre `FileOutputStream(File)`.

## 3. Copia y cierre normal

Crea un `BufferedOutputStream` sobre el `FileOutputStream`, reserva un buffer de `0x400` (1024) bytes y repite:
- `InputStream.read(byte[])`;
- si el resultado no es -1, `BufferedOutputStream.write(buffer, 0, count)`;
- al llegar a -1, llama `flush()` y `BufferedOutputStream.close()`.

Después mueve la referencia del `FileOutputStream` a `v3`; en la ruta común de limpieza vuelve a llamar explícitamente `FileOutputStream.close()`. Por tanto, el bytecode intenta cerrar el flujo subyacente tras cerrar el BufferedOutputStream. No se infiere que el segundo cierre produzca un efecto adicional.

La limpieza común también cierra `p3` si no es null. En la rama de entrada ausente y en la rama de `splitApkPath` vacío, `p3` conserva el stream recibido originalmente y se cierra desde el propio método.

## 4. Hallazgo de propiedad del stream recibido

En la rama donde sí existe la entrada ZIP, el parámetro original `p3` se sobrescribe con el resultado de `ZipFile.getInputStream(entry)` (físico 13105–13108). La limpieza posterior cierra el nuevo `p3`, no conserva otra referencia visible al stream recibido al entrar al método.

**Conclusión acotada:** en esa rama, este método no muestra un cierre explícito del InputStream original recibido como tercer argumento; la referencia se reemplaza antes de la limpieza. No se afirma fuga efectiva en ejecución ni se determina si el llamador conserva/cierra ese stream por otra vía. Esto requiere revisar el caller.

## 5. Excepciones y limpieza

- `catch_4` captura `Exception` del tramo que incluye la búsqueda/obtención de stream, construcción de ruta y apertura del `FileOutputStream`; registra el mensaje literal `IOException` aunque el tipo capturado sea `Exception`.
- `catch_1` captura `Exception` durante la creación/uso del `BufferedOutputStream`, la lectura/escritura, flush o cierre. Conserva el `FileOutputStream` en `v3`, registra `IOException` y sigue a la limpieza.
- En las rutas de error ordinarias intenta cerrar el `FileOutputStream` si existe y el `InputStream` actual `p3` si no es null. Las excepciones de cierre se registran con `close fileOutputStream error` o `close zipInputStream error`.
- `catchall` ejecuta la misma limpieza de ambos recursos y después relanza la excepción original.
- No aparece una llamada a `ZipFile.close()` dentro del método.
- Si falla la copia después de crear el `BufferedOutputStream`, el handler cierra el `FileOutputStream`; no se observa una llamada explícita a `BufferedOutputStream.close()` en esa ruta de error.

## 6. Referencias encontradas en BRService.smali

El comando `grep -n -F 'restoreStreamSplitApk('` devolvió:
- línea 2101: método puente sintético `-$$Nest$mrestoreStreamSplitApk(...)`;
- línea 2104: el puente invoca el método privado mediante `invoke-direct`;
- línea 13035: definición del método privado.

Esta búsqueda se ejecutó solo sobre `BRService.smali`; no identifica por sí sola todos los callers en otros archivos Smali. El puente sintético no debe confundirse con una invocación externa ya demostrada.

## 7. Dedupe, límites y siguientes pasos

- E161 conserva la identificación parcial y el inicio del método; E162 completa su cuerpo, handlers, retornos y limpieza sin duplicar el análisis de `BRService$11` ni el receptor `restoreLocalMediaFile` de E160.
- La ausencia de `ZipFile.close()` se limita al cuerpo completo mostrado de este método; no se generaliza al ciclo de vida del objeto fuera de él.
- El posible stream de entrada reemplazado sin cierre local queda como hallazgo estático acotado; falta revisar callers para conocer la propiedad/cierre externo.
- Siguiente delta: buscar en todos los directorios Smali referencias al puente `-$$Nest$mrestoreStreamSplitApk` y reconstruir el caller inmediato; después continuar con el origen/ciclo de vida de `extra_zip_file_path`.
- No se demuestra creación exitosa del split APK, integridad del contenido, restauración completada, fuga efectiva, vulnerabilidad ni comportamiento dinámico.

**Estado final:** método completo preservado desde salida aportada por el usuario; investigación INCOMPLETA.
