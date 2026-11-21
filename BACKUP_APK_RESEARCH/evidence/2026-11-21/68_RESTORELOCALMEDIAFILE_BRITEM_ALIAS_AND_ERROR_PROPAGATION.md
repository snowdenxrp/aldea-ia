# Evidencia 68 — Alias de BRItem entre restoreLocalMediaFile() y ArchiveHelper.unzipFiles()

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Alcance: relación de identidad del objeto `BRItem` entre el contenedor de restauración de medios y el helper ZIP; interacción potencial entre `state` y `error`.
- Procedencia: extracción Smali compartida por el usuario en chat el 2026-11-19; recuperación de continuidad del 2026-11-21.
- Clasificación: `USER-PASTED-SOURCE / DIRECT-CHAT` para la instrucción de movimiento de referencia y el call site; interpretación causal limitada derivada de los bloques ya preservados en evidencias 49 y 53.
- No `LOCAL-VERIFIED`; no observación runtime. Solo análisis estático.

## 1. Call site y conservación de identidad

En `BRService.smali`, método `restoreLocalMediaFile(BRItem,boolean,InputStream)` (encabezado reportado alrededor de la línea física 12772; call site alrededor de la línea física 12918, asociado a `.line 3156`), el usuario compartió la instrucción:

```smali
move-object v5, p1
```

El registro `p1` contiene el `BRItem` recibido por el método contenedor. La referencia movida a `v5` se pasa a la sobrecarga de siete argumentos de:

```
ArchiveHelper.unzipFiles(File,String,IFileZipSizeChangedListener,BRItem,boolean,InputStream,List)
```

**Conclusión de aliasing:** el call site pasa la misma referencia de objeto `BRItem` que recibió `restoreLocalMediaFile()`; no crea una copia de `BRItem` antes de la llamada. Las mutaciones de campos realizadas por el helper sobre ese parámetro pueden observarse sobre el mismo objeto que conserva el método contenedor, salvo que una operación posterior sobrescriba el campo.

Este hallazgo precisa la relación de referencia ya descrita en evidencia 49: aquella evidencia documentaba que `unzipFiles()` recibe y notifica con el mismo `BRItem`, pero no preservaba explícitamente el movimiento de referencia desde el parámetro del contenedor al argumento del helper.

## 2. Interacción potencial entre state y error

La evidencia 53 conserva para el bloque atribuido a `restoreLocalMediaFile()` estas escrituras:
- línea física 12851: `BRItem.state = 3`;
- línea física 12859: `BRItem.error = 7` (el literal `0x7` se escribe en el campo `error`, no en `state`);
- línea física 12903: `BRItem.state = 8`;
- línea física 12956: `BRItem.state = 9` si abortado, o `state = 1` si no.

La evidencia 49 conserva que `ArchiveHelper.unzipFiles()` puede escribir `BRItem.error = 1` en la condición de archivo restaurado ausente y continuar el procesamiento de entradas ZIP.

Dado que el contenedor pasa la misma referencia `BRItem` al helper, la mutación de `error` hecha por `unzipFiles()` afecta al mismo objeto sobre el que `restoreLocalMediaFile()` realiza las transiciones de `state`. Por tanto, la combinación `state = 1` y `error = 1` es **posible según el flujo estático preservado** si la ruta del helper asigna error 1 y el contenedor termina asignando state 1 sin limpiar ese error.

**No afirmado:** no se observó esa combinación en ejecución; tampoco se afirma que ocurra en todos los casos de éxito del contenedor. La posibilidad depende de la rama concreta del helper y de que ninguna instrucción posterior sobrescriba `error`.

## 3. Relación con evidencia existente y no duplicación

- Evidencia 49 ya documenta la firma/callers de `unzipFiles()`, la recepción del objeto `BRItem`, la actualización de progreso/callbacks y la asignación potencial de `error=1`.
- Evidencia 53 ya documenta las escrituras `state/error` del bloque de `restoreLocalMediaFile()`, incluidas las coordenadas 12851–12956.
- Esta evidencia 68 **no vuelve a transcribir** esos inventarios: registra únicamente el delta de identidad de referencia en el call site y su consecuencia limitada para la propagación de mutaciones entre helper y contenedor.

## 4. Límites y clasificación

- La instrucción `move-object v5, p1` prueba transferencia de referencia local dentro de la llamada; no es una copia profunda ni una serialización Binder.
- La conclusión se limita a esta llamada concreta y no generaliza a otros callers de `unzipFiles()`.
- Las coordenadas son las reportadas en la extracción compartida; no se recalculó hash ni se releyó el Smali local en esta sesión.
- No se infiere que `state=1` signifique que todos los archivos fueron restaurados correctamente cuando `error` conserva un valor distinto de cero.
- No se ejecutó el APK, servicio, backup ni restore.

**Resultado:** queda documentado un alias concreto `restoreLocalMediaFile.p1 → unzipFiles.p1` y la posibilidad estática de que una mutación `error=1` del helper permanezca en el mismo `BRItem` aunque el contenedor termine con `state=1`.