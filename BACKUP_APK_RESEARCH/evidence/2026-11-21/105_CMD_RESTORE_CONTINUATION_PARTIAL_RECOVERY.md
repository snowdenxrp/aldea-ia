# Evidencia 105 — continuación parcial de CMD_RESTORE en BRService.onStartCommand — 2026-11-21

**Clasificación:** `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
**Fuente histórica:** mensaje del usuario del 2026-11-17T05:16:53Z.
**Archivo/método:** `BRService.smali`, `onStartCommand(Intent;II)I`.

## Continuación recuperada

El mensaje histórico confirma que el bloque compartido no terminaba al comenzar a leer `extra_zip_file_path`. La continuación llegaba hasta el despacho a `restoreFiles(...)`:

1. La lectura de `extra_zip_file_path` está anclada en las líneas físicas reportadas **19417–19426**.
2. Cuando `extra_britems` no está vacío, el flujo convierte la lista mediante `ArrayList.toArray()` a `BRItem[]` y llama a `restoreFiles(BRItem[], BackupDescriptor, int)`; los registros reportados para descriptor y tipo son `v6` y `v3`.
3. Cuando `extra_britems` está vacío, llama a `restoreFiles(null, v6, v3)` solo si `v3 == 3` o `mIsReStartCommand` es verdadero.
4. Si la lista está vacía y no se cumple ninguna de esas condiciones, registra el texto literal `restoreFiles brItems is null` y llama a `setState(...)`.

Las llamadas a `restoreFiles` se asociaron a las directivas Smali `.line 913` y `.line 915`; el log/error se asoció a `.line 915–918`. Las directivas `.line` son posiciones fuente declaradas por Smali y no líneas físicas del archivo.

## Delta frente a evidencias 94 y 96

- Corrige la conclusión anterior de que la rama `CMD_RESTORE` se cortaba al empezar la lectura de `extra_zip_file_path`.
- Aporta las dos condiciones de despacho a `restoreFiles`, el caso de lista vacía sin despacho y el texto literal del log.
- No duplica el análisis del cuerpo independiente `restoreFiles(...)`, reportado alrededor de la física 12672.

## Límites

- No se recuperó aquí el texto Smali consecutivo íntegro ni el comando exacto de extracción.
- El rango físico 19417–19426 solo corresponde a la lectura de `extra_zip_file_path`; no se recuperó el rango físico completo de las instrucciones posteriores.
- No se conocen los argumentos exactos de `setState`; no completarlos por inferencia.
- No reconstruir registros, etiquetas, orden de instrucciones o condiciones adicionales que no estén descritos arriba.
- No afirmar que el servicio se ejecutó ni que la restauración concluyó.

**Estado:** continuación histórica parcial recuperada; ejecución efectiva y cotejo local siguen pendientes.
