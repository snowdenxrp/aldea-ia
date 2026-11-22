# Evidencia 105 — continuación parcial de CMD_RESTORE en BRService.onStartCommand — 2026-11-21

**Clasificación:** bloque físico 19417–19485 `LOCAL-VERIFIED` por salida `nl -ba` aportada por el usuario el 2026-11-21; condiciones de la rama vacía en 19487 en adelante: `RECOVERED-CHAT / NOT YET LOCAL-VERIFIED`.
**Fuente histórica:** mensaje del usuario del 2026-11-17T05:16:53Z.
**Archivo/método:** `BRService.smali`, `onStartCommand(Intent;II)I`.

## Continuación recuperada

El mensaje histórico confirma que el bloque compartido no terminaba al comenzar a leer `extra_zip_file_path`. La continuación llegaba hasta el despacho a `restoreFiles(...)`:

1. **Cotejo local:** física 19417 asigna `mDescriptorPath`; `extra_zip_file_path` se lee en físicas 19419–19422 y se asigna a `mZipFilePath` en 19426. Por tanto, 19417 no pertenece a la lectura del extra ZIP.
2. **Cotejo local, físicas 19459–19485:** si `v4` es no nulo y `size()` es distinto de cero, crea `BRItem[]`, lo llena mediante `toArray()` y llama a `restoreFiles(v0, v6, v3)`. Esto confirma localmente la rama de lista no vacía y los registros del despacho.
3. Cuando `extra_britems` está vacío, llama a `restoreFiles(null, v6, v3)` solo si `v3 == 3` o `mIsReStartCommand` es verdadero.
4. Si la lista está vacía y no se cumple ninguna de esas condiciones, registra el texto literal `restoreFiles brItems is null` y llama a `setState(...)`.

La llamada de la rama no vacía aparece en física 19483 bajo `.line 913`. La llamada de la rama vacía se reportó históricamente bajo `.line 915`; aún no está cotejada localmente. Las directivas `.line` son posiciones fuente, no líneas físicas.

## Delta frente a evidencias 94 y 96

- Corrige la conclusión anterior de que la rama `CMD_RESTORE` se cortaba al empezar la lectura de `extra_zip_file_path`.
- El cotejo local corrige el rango: 19417 es `mDescriptorPath`; el extra ZIP se lee en 19419–19422 y se asigna en 19426.
- Aporta las dos condiciones de despacho a `restoreFiles`, el caso de lista vacía sin despacho y el texto literal del log.
- No duplica el análisis del cuerpo independiente `restoreFiles(...)`, reportado alrededor de la física 12672.

## Límites

- El bloque físico 19417–19485 sí está cotejado localmente con el fragmento `nl -ba` del usuario; no se ha cotejado el tramo desde 19487 en adelante.
- No se conocen los argumentos exactos de `setState`; no completarlos por inferencia.
- No reconstruir instrucciones o condiciones adicionales que no estén descritas o mostradas.
- No afirmar que el servicio se ejecutó ni que la restauración concluyó.

**Estado:** despacho de lista no vacía `LOCAL-VERIFIED` hasta física 19485; rama vacía y resultado final pendientes.
