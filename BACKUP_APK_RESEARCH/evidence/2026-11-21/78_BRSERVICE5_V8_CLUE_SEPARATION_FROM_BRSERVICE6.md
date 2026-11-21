# Evidencia 78 — Separación de la pista register v8 entre BRService$5 y BRService$6

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación dirigida de conversaciones previas del usuario, especialmente 2026-11-17T23:20:47Z y 2026-11-20T23:31:17Z; contraste con el grep reportado el 2026-11-19T22:37:03Z.
- Clasificación: `USER-PASTED-SOURCE / RECOVERED-CHAT` para el bloque histórico de BRService$5; `PRIOR-ASSISTANT-SUMMARY / RECOVERED-CHAT` para la pista de v8 resumida el 20-11; `USER-REPORTED-GREP` para BRService$6:2101.
- No `LOCAL-VERIFIED`; no ejecución dinámica.

## 1. Fuente histórica de BRService$5

En la conversación del 2026-11-17T23:20:47Z el usuario pegó material literal de `BRService$5.smali` que describe:

- lectura de `mBakFilesType`;
- asignación de `v8=1` cuando el valor leído es `2`;
- asignación de `v8=0` en el caso contrario;
- uso posterior de `v8` mediante `if-eqz v8` en la selección de ruta `.tmp_bak_file`.

La conversación del 2026-11-20T23:31:17Z volvió a resumir esta relación como `v8=1` si `mBakFilesType==2`, `v8=0` de otro modo, y señaló expresamente que el expediente 61 no preservaba la asignación literal de `v8`.

Este material pertenece a `BRService$5`; no se conserva en la recuperación actual el método/descriptor completo ni una conexión de flujo de datos hacia el método de `BRService$6`.

## 2. Writer distinto: BRService$6:2101

El 2026-11-19T22:37:03Z el usuario reportó grep:

```smali
iput v8, v11, Lcom/miui/backup/service/BRItem;->error:I
```

en `BRService$6.smali:2101`.

La evidencia 76 conserva que el valor efectivo de `v8`, su definición dominante y su relación de control con el state writer de 2128 siguen sin recuperarse. La coincidencia nominal del registro `v8` entre clases internas distintas no establece identidad de variable, continuidad de valor ni equivalencia semántica.

## 3. Conclusión y límite

- Se puede afirmar que un bloque histórico de `BRService$5` usa `v8` como indicador derivado de `mBakFilesType==2`.
- Se puede afirmar que un grep separado reportó `BRService$6:2101` escribiendo el registro local `v8` en `BRItem.error`.
- **No** se puede concluir que `BRService$6:2101` escriba error 1/0, ni que su `v8` proceda de `mBakFilesType`.
- No transferir asignaciones, significados ni condiciones entre `BRService$5` y `BRService$6` por coincidencia del nombre del registro.
- La cuestión sigue abierta hasta recuperar el bloque de `BRService$6` que domina la escritura 2101, incluyendo todas las definiciones de `v8` en el método y las ramas relevantes.

## 4. Delta sobre el expediente

Esta evidencia no añade un writer ni resuelve el valor de error de la coordenada 2101. Preserva una pista histórica de otra clase y formaliza una exclusión necesaria para evitar contaminación entre métodos/clases. La evidencia 76 permanece como referencia primaria del estado pendiente de `BRService$6:2101`.

**Resultado:** `v8=1/0` está recuperado para un flujo de `BRService$5`, pero no es evidencia del valor escrito por `BRService$6:2101`.