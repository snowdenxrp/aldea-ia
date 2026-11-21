# Evidencia 89 — Separación de usos locales de v8 en BRService$5 (17–19-11-2026)

- Fecha de registro: 2026-11-21.
- Procedencia: recuperación de análisis y resúmenes históricos de conversaciones; timestamps conservados: 2026-11-17T23:26:16Z, 2026-11-19T21:22:13Z y 2026-11-19T22:13:43Z.
- Archivo: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Clasificación mixta: `USER-PASTED-SMALI / RECOVERED-CHAT` para la región de bucle descrita por el usuario; `PRIOR-ASSISTANT-SUMMARY / RECOVERED-CHAT` para coordenadas e interpretaciones conservadas solo en resúmenes del asistente. No `LOCAL-VERIFIED`.
- Alcance: reconciliación de usos disjuntos de un mismo registro Dalvik; no reconstrucción del método.

## 1. Región de iteración ZIP: v8 como índice local

El mensaje del usuario del 2026-11-17T23:26:16Z describió el rango físico aproximado 3190–3345 (`.line 1861–1881`) como un bucle sobre un `ArrayList`, usando `v8` como índice. El resumen histórico del asistente del 2026-11-19T21:22:13Z localizó en la misma región la condición física 3211:

```smali
if-ge v8, v0
```

Este literal corto se conserva como cita de un resumen previo, no como transcripción original independiente recuperada en esta sesión. El resumen lo identificó como condición de iteración; el usuario había descrito `v8` como índice. No se recuperaron aquí el destino de la rama, el encabezado del método ni el bloque completo.

## 2. Región anterior: v8 relacionado con estado de aborto

Un resumen del asistente del 2026-11-19T22:13:43Z conserva que en el rango físico 2787–2790 aparece `v8` como valor 3 asociado a `mIsAborted`, con escritura de `BRItem.state=3` en 2790. La evidencia de origen no se recuperó aquí como bloque literal completo; clasificar esta descripción como `PRIOR-ASSISTANT-SUMMARY`, no como cita primaria.

## 3. Región posterior: v8=7 no equivale a BRItem.state=7

El análisis histórico del asistente del 2026-11-19T04:40:43Z describe en `.line 1897` una instrucción `const/4 v8, 0x7`, seguida en `.line 1898` por una escritura de `v4` a `BRItem.state`, no de `v8`. El mismo resumen indica que el bloque conserva estados 1/6/3 y, en otro caso, asigna 1; también registra `progType=0`.

Este punto procede de resumen de análisis, no de un bloque literal que se vuelva a citar aquí. Evita interpretar el literal `v8=7` como una escritura directa `BRItem.state=7`.

## 4. Reconciliación y límites

Los sitios físicos 2787–2790, 3211 (dentro de la región 3190–3345) y el contexto fuente `.line 1897–1898` son ubicaciones distintas. El hecho de que el registro se llame `v8` en todas ellas no demuestra continuidad de valor, dominancia de una definición, ni que una asignación alimente otra.

La recuperación del usuario del 2026-11-17T23:26:16Z respalda específicamente el papel de índice en la región ZIP; los detalles de 3211, 2787–2790 y `.line 1897–1898` se preservan como resúmenes históricos del asistente con su procedencia explícita.

**Resultado:** se separa documentalmente el uso de `v8` como valor de estado/aborto, como índice de iteración ZIP y como literal 7 no escrito a `BRItem.state`. No se cierra el flujo de registros entre regiones ni se afirma continuidad. No `LOCAL-VERIFIED`.
