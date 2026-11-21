# Evidencia 69 — BRService.setState(IIII): transición global y normalización de BRItem

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Archivo/método reportado: `BRService.smali`, `.method private setState(IIII)V`
- Coordenadas reportadas: directivas `.line 3404–3427` (no equivalen necesariamente a líneas físicas).
- Procedencia: recuperación de conversación del 19-11-2026 y confirmación contextual del usuario en ese chat.
- Clasificación: `USER-CONFIRMED-EXTRACTION-SUMMARY / RECOVERED-CHAT`. No se conserva en esta recuperación el bloque Smali literal íntegro; no clasificar como `USER-PASTED-SOURCE` ni `LOCAL-VERIFIED`.
- Solo análisis estático; no ejecución dinámica.

## 1. Parámetros y campos globales

El resumen recuperado atribuye los siguientes movimientos al método:

- `p1 → BRService.mState`
- `p2 → BRService.mWorkingStage`
- `p3 → BRService.mUserInterruptAction`
- `p4 → BRService.mLastError`, pero solo si el valor previo de `mLastError` era 0.

El usuario confirmó este mapeo y las ramas descritas en la conversación del 19-11-2026. El bloque literal completo no está disponible en el contexto actual; mantener la clasificación como resumen de extracción confirmado contextualmente, no como transcripción primaria.

## 2. Normalización de los BRItem ante determinadas condiciones globales

El resumen de extracción indica que, cuando:

- `mWorkingStage == 10` o `mWorkingStage == 12`; o
- `mUserInterruptAction == 2`;

el método recorre `BRService.mBRItems` y, para los elementos procesados, escribe:

- `BRItem.state = 3`
- `BRItem.error = 9`

Esto constituye una ruta adicional de propagación/normalización de estado y error desde una transición global de BRService hacia los objetos BRItem de su lista.

No asumir que la operación ocurre en todas las transiciones ni que los valores 10/12/2 tienen un significado externo específico sin recuperar el cuerpo literal y sus callers.

## 3. Liberación de WakeLock

También se reportó que cuando `p2 == 7` (es decir, `mWorkingStage == 7` tras la asignación indicada), el método llama a `releaseWakeLock()`.

No se conserva aquí el cuerpo de `releaseWakeLock()`, el tipo de WakeLock, ni el estado previo requerido para liberar el recurso.

## 4. Relación con otras rutas preservadas

- Evidencia 53 documenta escritores y propagaciones de `BRItem.state/error` dentro de BRService, pero no incluye este método `setState(IIII)`.
- Evidencia 47 documenta `showFinishNotification(IIILjava/util/ArrayList;)` y la propagación de estado/etapa/error globales como extras, pero esa ruta de notificación no sustituye la mutación directa de `mBRItems` resumida aquí.
- Se recuperó también una llamada histórica `setState(4,12,0,v14)`; conservarla como ejemplo de invocación reportada, no como caller completamente reconstruido.
- Existía previamente un wrapper `setState(III)` y una llamada hacia `setState(IIII)`; la relación exacta y sus argumentos deben cotejarse con los cuerpos literales antes de reconstruir el grafo de llamadas.

## 5. Límites y trabajo pendiente

1. Recuperar el encabezado y cuerpo Smali íntegro de `setState(IIII)`, con líneas físicas, para verificar orden de escrituras, condición `mLastError == 0`, límites del loop y campos exactos.
2. Recuperar el cuerpo del wrapper `setState(III)` y callers relevantes; no inferir la propagación de argumentos.
3. Identificar si el loop filtra elementos o aplica las escrituras a todos los `BRItem` de `mBRItems`.
4. Verificar la implementación y condiciones de `releaseWakeLock()` solo si resulta necesario para el análisis.
5. No equiparar `mWorkingStage`, `mState`, `mUserInterruptAction`, `BRItem.state` ni códigos de salida de RestoreThread: son campos/espacios de estado distintos.

**Resultado:** se recupera una ruta global adicional que puede convertir elementos de `mBRItems` a `state=3,error=9` durante determinadas transiciones, y una liberación de WakeLock en etapa 7. La información es valiosa pero permanece como resumen confirmado contextualmente hasta cotejo del Smali literal.