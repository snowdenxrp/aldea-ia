# Evidencia 70 — Inventario complementario de ubicaciones escritoras BRItem fuera del bloque BRService principal

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Alcance: recuperar ubicaciones de escritura de campos `BRItem.state/error` en clases adicionales que no están detalladas en las evidencias 49 y 53.
- Procedencia: recuperación de resúmenes de grep/conversaciones del 19-11-2026.
- Clasificación: `RECOVERED-CHAT / PRIOR-ASSISTANT-SUMMARY`; son ubicaciones reportadas, no bloques Smali literales disponibles en esta consolidación.
- No `LOCAL-VERIFIED`; no ejecución dinámica.

## 1. Ubicaciones adicionales recuperadas

| Archivo/clase | Coordenadas físicas reportadas | Campo | Qué se puede afirmar |
|---|---:|---|---|
| `ArchiveHelper.smali` | 1741 | `BRItem.error` | Se reportó una escritura del campo error. Valor, condición y método exacto pendientes de recuperar. |
| `CompatibilityActivity$1.smali` | 144 | `BRItem.state` | Se reportó una escritura del campo state. Valor, condición y método exacto pendientes. |
| `CompatibilityActivity$1.smali` | 152 | `BRItem.error` | Se reportó una escritura del campo error. Valor, condición y método exacto pendientes. |
| `ProgressPageFragmentBase.smali` | 625 | `BRItem.state` | Se reportó una escritura del campo state. Valor, condición y método exacto pendientes. |
| `BRService$6.smali` | 1557, 2128, 2495 | `BRItem.state` | Tres ubicaciones de escritura reportadas. No asociar valores/condiciones sin recuperar los bloques. |
| `BRService$6.smali` | 2101 | `BRItem.error` | Una ubicación de escritura reportada. Valor y condición pendientes. |
| `BRService$7.smali` | 53 | `BRItem.state` | Una ubicación de escritura reportada. Valor y condición pendientes. |
| `BRService$7.smali` | 58 | `BRItem.error` | Una ubicación de escritura reportada. Valor y condición pendientes. |

Estas coordenadas amplían el mapa de productores potenciales; no constituyen por sí solas una explicación causal de las transiciones ni prueban que todos los caminos se ejecuten.

## 2. Clases deliberadamente no duplicadas

- `BRService.smali`: sus coordenadas y bloques conocidos se conservan en evidencia 53; la ruta global `setState(IIII)` se conserva en evidencia 69.
- `BRService$FakeBackupListenerImp.smali`: escrituras state reportadas en 5719, 5834 y 5921 ya están en el expediente.
- `ProgressItemAdapter`: `itemStart`, abortos, errores y finalización están descritos en evidencias 54 y 67.
- `MiAsistService.smali`: escrituras paramétricas reportadas en 3175–3178 y 3296–3299 ya están descritas en la recuperación histórica de su pipeline; no se duplican aquí.

## 3. Límites y siguiente delta útil

1. Recuperar solo los bloques alrededor de las coordenadas listadas, incluyendo encabezado `.method`, descriptor, instrucciones `iput`, registros fuente y ramas que dominan cada escritura.
2. Para `ArchiveHelper.smali:1741`, contrastar con la escritura `error=1` ya descrita en evidencia 49; determinar si es la misma instrucción o una escritura distinta antes de añadir semántica.
3. Para `BRService$6/$7` y `CompatibilityActivity$1`, no inferir que los valores son 1/2/3/9 por similitud con otras clases.
4. Para `ProgressPageFragmentBase:625`, determinar si el objeto es un `BRItem` del modelo, una copia, o un objeto de presentación antes de integrarlo en el grafo causal.
5. Mantener separados grep de ubicaciones, fuente literal, resumen histórico y observación runtime.

**Resultado:** el inventario recupera ocho ubicaciones/clases adicionales de escritura de `BRItem.state/error` que no estaban descritas en las evidencias 49/53 ni en el índice v0.68. Se preservan como pistas de cobertura, no como semántica confirmada.