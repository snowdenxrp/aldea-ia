# Evidencia 80 — Vecindad de lecturas y escritura BRService$6.error (1997–2128)

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación dirigida de conversaciones del usuario del 2026-11-19, especialmente 22:37:03Z; cotejo con evidencia 76.
- Clasificación: `USER-REPORTED-SMALI-DETAIL / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- No ejecución dinámica.

## 1. Coordenadas recuperadas

El material histórico reporta estas instrucciones en `BRService$6.smali`:

| Línea física reportada | Instrucción | Campo |
|---|---|---|
| 1997 | `iget v0, v11, Lcom/miui/backup/service/BRItem;->error:I` | lectura de `error` |
| 2101 | `iput v8, v11, Lcom/miui/backup/service/BRItem;->error:I` | escritura de `error` |
| 2105 | `iget v0, v11, Lcom/miui/backup/service/BRItem;->error:I` | lectura de `error` |
| 2120 | `iget v0, v11, Lcom/miui/backup/service/BRItem;->state:I` | lectura de `state` |
| 2128 | `iput v0, v11, Lcom/miui/backup/service/BRItem;->state:I` | escritura de `state` |

La escritura de 2101 y la escritura de state de 2128 ya constan en evidencia 76. El delta recuperado aquí es preservar las lecturas reportadas en 1997/2105 de `error` y en 2120 de `state`, junto con su ubicación relativa al grupo.

## 2. Límite de interpretación

La secuencia de coordenadas, por sí sola, no prueba que la lectura de 1997 controle la escritura de 2101, ni que la lectura de 2105 consuma el valor recién escrito. La lectura de `state` en 2120 tampoco establece por sí sola la condición de la escritura de 2128. Tampoco prueba que las instrucciones pertenezcan a una misma rama sin recuperar el bloque completo y sus etiquetas.

Sigue sin recuperarse:
- encabezado de método y descriptor;
- definición dominante de `v8` antes de 2101;
- ramas/etiquetas que conectan 1997, 2101, 2105, 2120 y 2128;
- valor efectivo de `v8` en 2101;
- relación semántica entre error y state en este bloque.

No transferir a `BRService$6` el significado de `v8` observado en `BRService$5`; la separación de procedencia quedó establecida en evidencia 78.

## 3. Delta y continuidad

Esta evidencia añade una lectura reportada de `BRItem.state` en 2120 a la vecindad de lecturas/escrituras, no un valor nuevo ni una condición nueva. Evidencia 76 sigue siendo la referencia para la semántica recuperada de los writers de `BRService$6/$7`; evidencia 78 conserva el límite entre clases internas.

**Estado:** `RECOVERED-CHAT / USER-REPORTED-SMALI-DETAIL`; pendiente de cotejo con el bloque Smali físico completo.