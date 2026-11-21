# Evidencia 76 — Semántica recuperada de escritores BRService$6 y BRService$7

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación dirigida de conversaciones del usuario del 2026-11-19, mensajes alrededor de 18:57Z, 21:22Z y 22:37Z.
- Clasificación: `RECOVERED-CHAT / USER-REPORTED-SMALI-DETAIL`; las coordenadas de `iput` se conservaron como resultados de grep compartidos por el usuario. No se conserva aquí el bloque Smali completo ni los encabezados de todos los métodos.
- No `LOCAL-VERIFIED`; no ejecución dinámica.

## 1. BRService$6.smali

### 1.1 Coordenada física 1557 — state y caso files_for_backup

Recuperación histórica del usuario:

- En la ruta asociada a `files_for_backup`, conserva el `BRItem.state` existente cuando coincide `packageName`.
- En el caso contrario, carga `const/4 v0, 0x4` y escribe el valor 4 en `BRItem.state`.
- El grep histórico identifica la instrucción como `iput v0, v11, ...->state:I` en la coordenada física 1557.

Límite: no se conserva el método/descriptor, la comparación literal completa ni la procedencia previa de `v11`; la descripción condicional queda como semántica recuperada de conversación, no como bloque fuente reproducido.

### 1.2 Coordenada física 2128 — state y caso files_for_backup

Recuperación histórica del usuario:

- La ruta para `files_for_backup` conserva el estado previo.
- En la otra rama asigna `state=1`.
- El grep identifica `iput v0, v11, ...->state:I` en la coordenada 2128.
- La coordenada 2101 se reportó como escritura `iput v8, v11, ...->error:I` en el contexto de ese tramo.

Límite: no se recuperó el valor efectivo de `v8`, su definición dominante ni la relación exacta de control entre la escritura de error en 2101 y la asignación de estado en 2128. No atribuir valor a `error` ni afirmar que las dos escrituras ocurren siempre juntas.

### 1.3 Coordenada física 2495 — state=3

Recuperación histórica del usuario:

- En la rama etiquetada `:cond_42`, se carga `const/4 v3, 0x3`.
- Después se escribe `iput v3, v11, ...->state:I` en la coordenada física 2495.
- El bloque histórico asocia a continuación el mensaje `"Backup One, result failed"`.

Esto permite registrar `state=3` en esa rama y el mensaje próximo en el flujo compartido. Sin el método completo no inferir que el mensaje sea condición, causa única, ni que toda asignación state=3 implique exactamente ese resultado.

## 2. BRService$7.smali — onZipFileSizeChanged

Método recuperado:
`onZipFileSizeChanged(JLcom/miui/backup/service/BRItem;Ljava/lang/String;)V`.

La recuperación histórica describe esta secuencia en la rama verdadera de `mIsAborted`:

- `const/4 p4, 0x3`, seguido de la escritura de `BRItem.state` en la coordenada física 53 (`iput p4, p3, ...->state:I`).
- `const/16 p4, 0x9`, seguido de la escritura de `BRItem.error` en la coordenada física 58 (`iput p4, p3, ...->error:I`).

Semántica limitada: en la rama descrita, el mismo objeto referenciado por `p3` recibe `state=3` y `error=9`. La condición recuperada es que `mIsAborted` es verdadera. No inferir qué actor cambia `mIsAborted`, ni el estado previo, ni otros efectos del callback.

## 3. Matriz consolidada

| Clase | Coordenada física | Campo | Valor/efecto recuperado | Condición / límite |
|---|---:|---|---|---|
| `BRService$6` | 1557 | `state` | conserva estado existente o asigna 4 | caso `files_for_backup` / comparación `packageName`; cuerpo incompleto |
| `BRService$6` | 2101 | `error` | fuente del `iput`: `v8`; valor desconocido | contexto próximo a la ruta de 2128; ramas no recuperadas |
| `BRService$6` | 2128 | `state` | conserva estado existente o asigna 1 | caso `files_for_backup`; cuerpo incompleto |
| `BRService$6` | 2495 | `state` | 3 | rama `:cond_42`; mensaje cercano `Backup One, result failed` |
| `BRService$7` | 53 | `state` | 3 | rama verdadera de `mIsAborted`; método `onZipFileSizeChanged` |
| `BRService$7` | 58 | `error` | 9 | misma rama descrita; objeto `p3` |

## 4. Reconciliación y no duplicación

- Evidencia 70 ya inventariaba las seis coordenadas; evidencia 76 añade semántica recuperada, no nuevas ubicaciones.
- Evidencia 47/53/69 documenta otros escritores y la normalización global `setState(IIII)`; no fusionar esa lógica con estos callbacks.
- El par `BRService$7` state=3/error=9 se parece a patrones de abortos de otras clases, pero es un escritor separado y su condición local es `mIsAborted`; no inferir que el mismo callback/origen controla los otros escritores.
- La línea 2101 de `BRService$6` no tiene valor de error recuperado; no convertir `v8` en 1/9 ni otro código por analogía.

## 5. Pendientes precisos

1. Si se necesita causalidad completa, recuperar solo encabezados y bloques alrededor de 1535–1565, 2088–2135 y 2478–2505 de `BRService$6.smali`.
2. Para `BRService$7`, recuperar encabezado y rango aproximado 35–65 para validar la rama completa de `onZipFileSizeChanged`.
3. Resolver `v8` antes de atribuir código a `BRItem.error` en 2101.
4. No repetir grep global ni extraer de nuevo las clases completas.

**Resultado:** se recuperan las transiciones state/error de seis coordenadas ya inventariadas. La información procede del historial de conversación y grep reportado, no de una verificación local actual.
