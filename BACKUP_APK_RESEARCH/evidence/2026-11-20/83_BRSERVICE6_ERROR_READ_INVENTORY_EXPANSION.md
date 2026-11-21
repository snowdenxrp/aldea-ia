# Evidencia 83 — Inventario ampliado de lecturas BRService$6.error (1877 y 2518)

- Fecha de registro: 2026-11-20.
- Rama: `backup-apk-static-research-2026-11-19`.
- Procedencia: mensaje original del usuario del 2026-11-19T22:37:03Z, recuperado del historial.
- Clasificación: `USER-REPORTED-GREP / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- Alcance: investigación estática; no ejecución dinámica.

## 1. Inventario literal reportado

El usuario reportó estas coordenadas en `BRService$6.smali`:

| Línea física reportada | Instrucción reportada | Campo |
|---:|---|---|
| 1508 | `iget v4, ..., BRItem;->state:I` | lectura de state |
| 1529 | `iget v0, ..., BRItem;->error:I` | lectura de error |
| 1549 | `iget v0, ..., BRItem;->state:I` | lectura de state |
| 1557 | `iput v0, ..., BRItem;->state:I` | escritura de state |
| 1877 | `iget v0, ..., BRItem;->error:I` | lectura de error |
| 1997 | `iget v0, ..., BRItem;->error:I` | lectura de error |
| 2101 | `iput v8, ..., BRItem;->error:I` | escritura de error |
| 2105 | `iget v0, ..., BRItem;->error:I` | lectura de error |
| 2120 | `iget v0, ..., BRItem;->state:I` | lectura de state |
| 2128 | `iput v0, ..., BRItem;->state:I` | escritura de state |
| 2495 | `iput v3, ..., BRItem;->state:I` | escritura de state |
| 2518 | `iget v4, ..., BRItem;->error:I` | lectura de error |

El reporte de origen enumera estas instrucciones mediante coordenadas y registros; no contiene aquí los bloques completos ni las ramas. La notación abreviada de la tabla preserva el registro y el campo, no una transcripción íntegra de cada línea.

## 2. Delta respecto a evidencias previas

- La lectura de `BRItem.error` en la línea física reportada **1877** queda ahora respaldada por el mensaje original del usuario del 19-Nov 22:37:03Z. Su clasificación ya no depende solamente de una síntesis posterior.
- Se recupera además la lectura de `BRItem.error` en la línea física reportada **2518**, ausente de las evidencias 76/80.
- Las demás coordenadas reconcilian el inventario del mismo mensaje con las ubicaciones ya conservadas en evidencias 70, 76 y 80; no son hallazgos nuevos por sí mismas.

## 3. Límites

Este inventario no demuestra:
- que las doce instrucciones estén en un mismo método o rama;
- que las lecturas 1877, 1997, 2105 o 2518 alimenten el writer 2101;
- que la lectura 2518 consuma el valor escrito en 2101;
- la definición dominante ni el valor efectivo de `v8`;
- una relación causal entre los campos `error` y `state`.

Para resolverlo siguen haciendo falta el encabezado `.method`, las instrucciones completas y etiquetas alrededor de 2101 y 2518, y el recorrido de definiciones de `v8`.

**Resultado:** dos lecturas de error quedan preservadas en el inventario de procedencia recuperada (1877, reclasificada con fuente original; 2518, delta nuevo). No se afirma verificación contra el Smali local.
