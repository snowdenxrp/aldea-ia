# Evidencia 77 — Procedencia de escritores CompatibilityActivity y ProgressPageFragmentBase

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación dirigida de conversaciones del usuario del 2026-11-18 y 2026-11-19.
- Clasificación: `USER-REPORTED-GREP / RECOVERED-CHAT` para las coordenadas de inventario; `USER-PASTED-SOURCE / RECOVERED-CHAT` para el bloque funcional de `ProgressPageFragmentBase` descrito a continuación.
- No `LOCAL-VERIFIED`; no ejecución dinámica.

## 1. CompatibilityActivity$1.smali — coordenadas 144 y 152

El usuario reportó grep literal de estas instrucciones:

- Línea reportada 144: `iput p1, v1, ...BRItem;->state:I`.
- Línea reportada 152: `iput p1, v1, ...BRItem;->error:I`.

Ambas instrucciones usan el mismo registro objeto `v1` y el registro fuente `p1`. Esto permite identificar dos escrituras sobre campos distintos del mismo objeto en el fragmento reportado.

No se recuperó el encabezado del método ni el origen/valor de `p1`, las ramas dominantes o el tipo de `v1` antes del cast. No asignar valores numéricos ni causa a estas escrituras. La clasificación sigue siendo grep reportado, no bloque Smali contextual completo.

## 2. ProgressPageFragmentBase.smali — coordenada 625: conflicto de sistemas de numeración

El inventario de evidencia 70 preservó `ProgressPageFragmentBase.smali:625` como una escritura `iput v7, v10, ...BRItem;->state:I`, a partir de un grep reportado el 19-11.

Sin embargo, la recuperación de la conversación del 18-11 aporta un fragmento literal donde la directiva Smali `.line 625` corresponde a una operación de UI/resumen:

- se invoca `getSuccessfulCount()`;
- el resultado se usa con `getQuantityString(0x7f100021, ...)`;
- el texto se combina con `getSuccessfulSize()`, formateado mediante `ExtraTextUtils.formatFileSize`;
- el resumen se asigna a `mProgressSummary`.

Esos dos datos no son compatibles si ambos números se interpretan como la misma clase de coordenada. La explicación posible es una confusión entre número físico de línea del archivo Smali y directiva `.line` (número de línea fuente), o una diferencia de extracción/build; el historial no permite decidir cuál.

**Erratum:** no describir `ProgressPageFragmentBase.smali:625` como coordenada física confirmada del `iput` hasta cotejar el archivo. Conservar:
- grep reportado: `iput v7, v10, BRItem.state` atribuido a línea 625, sistema de coordenadas no resuelto;
- fuente literal: directiva `.line 625` en el bloque de resumen UI, no una prueba de que el `iput` esté en esa línea fuente.

### 2.1 Contexto adicional de state 6 → 1

Una recuperación anterior del análisis de `ProgressPageFragmentBase` describe un recorrido de `BRItem[]`:

- objeto `v10`;
- lectura `iget v11, v10, ...BRItem;->state:I`;
- comparación con `const/4 v12, 0x6`;
- si coincide, escritura `iput v7, v10, ...BRItem;->state:I`;
- `v7` había sido inicializado con `0x1`.

Esto respalda una transición estática `state 6 → 1` en ese bloque de `initUI()`, pero no resuelve por sí solo si la coordenada física 625 del grep corresponde a esa escritura. No afirmar que la línea física 625 es la transición hasta cotejar el mapa de líneas del archivo.

## 3. Reconciliación y no duplicación

- Evidencia 70 ya contenía las ubicaciones reportadas; evidencia 77 corrige su procedencia/ambigüedad y no añade nuevos writers.
- No atribuir la operación `getSuccessfulCount()` / `getQuantityString(0x7f100021)` a una escritura de `BRItem.state`.
- La transición `state 6 → 1` se conserva como resumen recuperado de `initUI()`; mantenerla separada del grep ambiguo de línea 625.
- No repetir extracción global ni asumir que la numeración física y `.line` son equivalentes.

## 4. Pendiente exacto

Para resolver `ProgressPageFragmentBase` basta recuperar el encabezado del método y el fragmento con `iget state`, comparación con 6, inicialización de `v7` y `iput state`, junto con las coordenadas físicas visibles. Para `CompatibilityActivity$1`, recuperar únicamente el método que contiene 144/152 y el origen de `p1`.

**Resultado:** CompatibilityActivity$1 tiene dos escrituras reportadas desde `p1` al mismo objeto `v1`; la coordenada 625 de ProgressPageFragmentBase queda marcada como ambigua entre línea física y directiva `.line`. No se eleva ninguna de estas conclusiones a verificación local.
