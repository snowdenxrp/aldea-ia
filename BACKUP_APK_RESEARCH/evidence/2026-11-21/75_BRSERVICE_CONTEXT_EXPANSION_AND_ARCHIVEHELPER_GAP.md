# Evidencia 75 — Contexto ampliado BRService y estado histórico ArchiveHelper:1741

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación dirigida de mensajes literales del usuario del 2026-11-19.
- Clasificación: `USER-PASTED-SOURCE / RECOVERED-CHAT` para los rangos parciales descritos; no `LOCAL-VERIFIED`.
- Alcance: ampliar el contexto disponible para evidencia 73; la reconciliación posterior de ArchiveHelper:1741 se registra en evidencia 79.

## 1. BRService.smali — contexto físico 14155–14178

El usuario compartió un bloque físico que cubría 14155–14178. La recuperación conserva estos elementos del bloque:

- recorrido de un `Iterator` mediante `hasNext()` y `next()`;
- `check-cast p4` al tipo `BRItem`;
- carga de `0x3` en `v0` y escritura en `p4.BRItem.state` (física 14173);
- carga de `0x9` en `v0` y escritura en `p4.BRItem.error` (física 14178).

Esto sitúa las escrituras state/error dentro de un recorrido de ítems y confirma que ambas usan el objeto `p4` tras el cast a `BRItem`. No se recuperó el encabezado `.method`, descriptor completo, condición de entrada del bucle ni el cuerpo literal íntegro. La semántica limitada de las dos escrituras se conserva en evidencia 73.

## 2. BRService.smali — contexto físico 16679–16715

El usuario compartió un segundo bloque físico. La recuperación conserva:

- `v10` como referencia a un `BRItem` usado en el bloque de totales;
- una rama que depende de `p6`;
- carga de `0x6` en `v7` y escritura en `v10.BRItem.state` (física 16697);
- acumulación de tamaño de sección;
- otra escritura posterior a `v10.BRItem.state` usando `v7` (física 16710).

No se recuperó el encabezado `.method` ni todas las instrucciones/ramas. No inferir que la segunda escritura en 16710 también vale 6: el resumen conservado identifica el registro fuente `v7`, pero no preserva el valor vigente en ese punto ni las instrucciones intermedias completas. Tampoco se debe inferir el significado funcional de la rama `p6`.

## 3. ArchiveHelper.smali:1741 — actualización por evidencia 79

En la recuperación inicial que produjo esta evidencia no se había encontrado el contexto necesario y la comparación quedó `UNKNOWN`. Una búsqueda histórica posterior recuperó el encabezado del overload de siete argumentos (línea física 1244), el alias `v1 <- p3` y el bloque `const/4 v0, 0x1` seguido de `iput v0, v1, ...BRItem;->error:I`, ya descrito en evidencia 27. El grep reportado para 1741 identifica esa misma instrucción en ArchiveHelper.

**Estado actualizado:** evidencia 79 reconcilia 1741 con el writer `error=1` de evidencia 27. No es un writer adicional. La conclusión es `RECOVERED-CHAT`, no `LOCAL-VERIFIED`; la directiva `.line 369` no debe confundirse con la coordenada física 1741.

## 4. Reconciliación y no duplicación

- Evidencia 73 conserva los valores explícitos de las escrituras 14173/14178/16697.
- Evidencia 53 ya conserva coordenadas próximas de `BRService.smali`; esta evidencia añade solo el contexto de bucle/totales recuperado para los rangos 14155–14178 y 16679–16715.
- Evidencia 70 conserva la coordenada reportada `ArchiveHelper.smali:1741`; evidencia 27 conserva el writer `error=1`. La recuperación posterior y evidencia 79 los reconcilian como el mismo writer; no contarlos dos veces.
- No se realizó nueva extracción local ni búsqueda global.

**Resultado actualizado por evidencia 79:** se amplía el contexto de dos bloques BRService sin inventar método/condición. La posible duplicación ArchiveHelper:1741/evidencia 27, que aquí se dejó inicialmente `UNKNOWN`, fue resuelta mediante recuperación histórica posterior: misma escritura `error=1`, no un writer nuevo; no `LOCAL-VERIFIED`.
