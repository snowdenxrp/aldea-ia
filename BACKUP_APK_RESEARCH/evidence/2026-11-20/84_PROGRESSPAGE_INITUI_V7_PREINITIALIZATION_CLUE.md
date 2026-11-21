# Evidencia 84 — Pista de inicialización previa de v7 en ProgressPageFragmentBase.initUI()

- Fecha de registro: 2026-11-20.
- Rama: `backup-apk-static-research-2026-11-19`.
- Procedencia: recuperación de mensajes del usuario del 2026-11-18T03:38:31Z y 03:38:56Z.
- Clasificación: `RECOVERED-CHAT / USER-REPORTED-SOURCE-CONTEXT`; no `LOCAL-VERIFIED`.
- Alcance: análisis estático; no ejecución dinámica.

## 1. Material recuperado del historial

El historial conserva dos solicitudes de extracción del usuario para el mismo archivo:

1. A las 03:38:56Z, el usuario pidió el rango físico 430–515 de `ProgressPageFragmentBase.smali`. El contexto recuperado identifica ese bloque como `initUI()` y conserva la instrucción `const/4 v7, 0x1`.
2. A las 03:38:31Z, el usuario pidió el rango físico 580–700 del mismo archivo. El historial conserva que contiene directivas `.line 324–343`, etiquetas `:cond_3`, `:goto_0`, `:goto_1`, `:cond_4` a `:cond_8`, una lectura `iget v11, ..., BRItem;->state:I` y una escritura `iput v7, v10, ..., BRItem;->state:I`.

La recuperación disponible no incluye aquí las líneas Smali completas ni el encabezado literal `.method` de ambos rangos. Se conserva la descripción del contexto y la instrucción puntual, no una transcripción íntegra.

## 2. Relevancia para el writer de state

La inicialización reportada `v7=1` en el rango 430–515 es una pista compatible con la escritura posterior desde `v7` dentro del rango 580–700. Junto con el contexto histórico de evidencia 81 (comparación de `BRItem.state` con 6 antes de escribir `v7`), esto hace plausible una transición `state==6 → state=1`.

Sin embargo, la recuperación no demuestra que:
- ambos rangos pertenezcan al mismo cuerpo de método mediante encabezados `.method` cotejados;
- `v7` no sea redefinido entre las coordenadas físicas 515 y 580;
- la escritura descrita en 580–700 sea exactamente el grep reportado en la coordenada 625;
- las directivas `.line 324–343` correspondan a las coordenadas físicas 618/625.

## 3. Estado y siguiente evidencia necesaria

El valor inicial `v7=1` queda preservado como contexto histórico de `initUI()`, no como valor efectivo probado en el writer posterior. Para cerrar la transición se necesita el bloque literal continuo que incluya el final de 430–515, todo el rango 516–580 y el writer dentro de 580–700, con encabezado `.method`, etiquetas y coordenadas físicas.

No confundir este archivo con `ProgressPageFragmentBase$ProgressItemAdapter.smali`; su transición state 2→1 es un bloque distinto y no resuelve este punto.

**Resultado:** nueva pista recuperada que estrecha el valor candidato de `v7` a 1, pero la transición `6→1` permanece sin cierre probatorio.
