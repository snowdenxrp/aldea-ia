# Evidencia 86 — Inventario ampliado de referencias a v8 en BRService$5

- Fecha de registro: 2026-11-21.
- Procedencia principal: recuperación del mensaje original del usuario del 2026-11-20T23:28:05Z, conversación «Revisar referencias v8».
- Procedencia complementaria: fragmento Smali literal compartido por el usuario el 2026-11-19T21:15:23Z.
- Archivo: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Clasificación: `USER-REPORTED-GREP / USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- Alcance: análisis estático; no ejecución dinámica.

## 1. Referencias adicionales recuperadas

El usuario informó que el grep de referencias a `v8` también mostraba estas coordenadas, además de las ya registradas en evidencia 85:

| Línea física reportada | Procedencia recuperada | Estado |
|---:|---|---|
| 2297 | grep compartido el 2026-11-20T23:28:05Z | referencia reportada; instrucción no recuperada |
| 2364 | grep compartido el 2026-11-20T23:28:05Z | además aparece en un bloque Smali literal recuperado |
| 2391 | grep compartido el 2026-11-20T23:28:05Z | referencia reportada; instrucción no recuperada |
| 3807 | grep compartido el 2026-11-20T23:28:05Z | referencia reportada; instrucción no recuperada |

Estas coordenadas amplían el inventario, pero no autorizan a inferir el tipo de instrucción, la condición ni el efecto de cada sitio sin su texto literal.

## 2. Cotejo particular de la referencia 2364

En un fragmento literal anterior, atribuido a `BRService$5.smali` físico 2338–2364, el usuario compartió esta secuencia final:

```smali
.line 1735
iput v3, v6, Lcom/miui/backup/service/BRItem;->state:I
.line 1736
iget v10, v6, Lcom/miui/backup/service/BRItem;->feature:I
iget v15, v6, Lcom/miui/backup/service/BRItem;->error:I
move/from16 v35, v8
```

El fragmento permite clasificar el sitio final como copia del registro `v8` a `v35`, inmediatamente después de leer `feature` y `error` del mismo `BRItem` y dentro del bloque que incluye una escritura `state=6`.

**No fusionar** esta referencia física 2364 con la referencia grep física 1235 documentada en evidencia 85. Son coordenadas distintas aunque el texto de instrucción reportado sea el mismo. El historial no permite decidir si ambas copias alimentan el mismo flujo posterior ni qué representa `v35`.

## 3. Relación con evidencia 85 y límites

- Evidencia 85 conserva las definiciones reportadas en 119/124 y los usos 1051, 1235 y 1728.
- Evidencia 65/66 conserva el bloque de decisión 1025–1090; no se vuelve a transcribir.
- La referencia literal 2364 añade contexto local, pero no resuelve el uso 1235.
- No se recuperó el bloque literal de 1728 ni la etiqueta `:cond_2d` con sus efectos.
- No se conocen las instrucciones exactas en 2297, 2391 y 3807.
- No se demuestra que todas las referencias estén dominadas por las definiciones 119/124 en todos los caminos de control.
- No atribuir a `v8` o `v35` un código de error, tipo de tarea o significado de negocio a partir de estas coincidencias.

## 4. Próximo paso de mayor valor

Si se necesita cerrar una pregunta concreta, priorizar el bloque literal alrededor de la referencia física 1728, incluyendo la definición dominante de `v8`, `:cond_2d` y los efectos de ambas ramas. Para las referencias 2297/2391/3807, recuperar solo las instrucciones y consumidores inmediatos si resultan relevantes. No pedir ni repetir el método completo.

**Resultado:** el inventario recuperado de usos de `v8` se amplía con 2297, 2364, 2391 y 3807. La coordenada 2364 cuenta además con contexto Smali literal recuperado; las demás siguen siendo referencias grep. Ninguno de estos datos es verificación local actual.
