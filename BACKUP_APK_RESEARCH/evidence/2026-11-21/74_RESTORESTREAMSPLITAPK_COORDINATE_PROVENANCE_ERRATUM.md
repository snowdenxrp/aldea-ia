# Evidencia 74 — Erratum de procedencia: coordenadas restoreStreamSplitApk en BRService$5

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación dirigida de conversaciones anteriores; no se repitió extracción local.
- Clasificación: `RECOVERED-CHAT` para la distinción de coordenadas y el contenido del fragmento recordado; referencias a call sites conservan el nivel de evidencia que tenían.
- No `LOCAL-VERIFIED`; no ejecución dinámica.

## 1. Resultado de la recuperación histórica dirigida

La búsqueda dirigida no recuperó el bloque literal de `BRService$5.smali` correspondiente a líneas físicas 1653–1738 ni una instrucción `invoke` literal en la coordenada 1683. La atribución de un call site en 1683, repetida en evidencia 72, procede de una síntesis/resumen anterior y no debe elevarse a `USER-PASTED-SOURCE`.

Tampoco se recuperó una instrucción `invoke` literal que confirme que la línea física 1899 sea un segundo call site.

## 2. Fragmento literal distinto: líneas físicas 3445–3468

El historial sí conserva que el usuario pegó un fragmento de `BRService$5.smali` en las líneas físicas 3445–3468. En ese fragmento:

- La directiva `.line 1898` acompaña una escritura de estado.
- La directiva `.line 1899` acompaña una escritura de `progType`.

Este dato demuestra que el número 1899 aparece como directiva de línea fuente en ese fragmento; **no demuestra** que exista allí un `invoke restoreStreamSplitApk`. Las líneas físicas 3445–3468 y los números `.line 1898/1899` pertenecen a sistemas de coordenadas distintos y no deben intercambiarse.

## 3. Reconciliación con evidencias 50, 58 y 72

- Evidencia 50 conserva una referencia histórica de grep que atribuye un caller a `BRService$5.smali:1899`, sin bloque literal de la instrucción.
- Evidencia 58 conserva el mismo ancla histórica del flujo `BRService$5.run()`; no aporta un cuerpo literal que resuelva si 1899 es línea física, directiva `.line` u otra numeración de la extracción.
- Evidencia 72 había presentado la referencia 1683 como ancla de extracción compartida y la comparaba con 1899 como posibles call sites. La recuperación dirigida no encontró el mensaje literal que sostendría la atribución del invoke en 1683, y el fragmento físico 3445–3468 no respalda que 1899 sea una segunda llamada.

**Erratum:** mantener 1683 como referencia histórica no verificada, no como call site confirmado. Mantener 1899 como referencia de grep cuyo sistema de coordenadas y contenido exacto no están resueltos. No afirmar dos call sites ni dos builds distintos.

## 4. Estado probatorio actual

| Elemento | Estado |
|---|---|
| Definición de `restoreStreamSplitApk(BRItem,ZipFile,InputStream)` en `BRService.smali:13035` | Referencia histórica conservada en evidencia 50; cuerpo completo pendiente |
| Caller atribuido a `BRService$5` en 1899 | Referencia de grep/resumen; coordenada física vs `.line` no resuelta |
| Caller atribuido a 1683 | Síntesis previa recuperada; bloque literal no encontrado en el historial consultado |
| Fragmento físico 3445–3468 | Usuario compartió fragmento; incluye directivas `.line 1898/1899` para escrituras de estado/progType, no evidencia de invoke |
| Dos call sites distintos | `UNKNOWN`; no afirmarlo |
| Dos builds/extracciones distintos | `UNKNOWN`; no afirmarlo |

## 5. Siguiente delta útil

No volver a pedir ni extraer bloques ya preservados de 1331–1445, 2333–2356 o 3445–3468. Para cerrar el call graph solo se necesita el fragmento físico que contenga el `invoke` atribuido a 1683, o la salida literal de grep/contexto que originó la referencia 1899, con encabezado del método, descriptor y coordenadas físicas claramente separadas de las directivas `.line`.

**Resultado:** se reduce una falsa apariencia de discrepancia. La evidencia disponible no confirma dos call sites; 1683 y 1899 permanecen como referencias históricas de distinta calidad/procedencia.
