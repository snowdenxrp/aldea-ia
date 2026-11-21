# Evidencia 90 — Contexto histórico adicional de writers v10 en BRService$5 (17–19-11-2026)

- Fecha de registro: 2026-11-21.
- Archivo: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Procedencia: mensajes originales del usuario del 2026-11-19T04:38:21Z, 19:05:02Z, 19:11:29Z y 21:19:30Z; resúmenes históricos del asistente del 2026-11-19T19:11:30Z y 21:19:31Z.
- Clasificación: `USER-REPORTED-GREP / USER-PASTED-SMALI / RECOVERED-CHAT`; ciertos detalles de contexto se conservan solo en resúmenes históricos. No `LOCAL-VERIFIED`.
- Alcance: recuperación de contexto parcial alrededor de escrituras de `BRItem.state`; no reconstrucción de bloques completos.

## 1. Coordenada física 1336

El usuario reportó la instrucción:
```smali
iput v10, v6, Lcom/miui/backup/service/BRItem;->state:I
```

En el mensaje del 2026-11-19T04:38:21Z describió el contexto inmediato como:

- Condición previa `if-nez v14, :cond_23`.
- Escritura de `v10` a `BRItem.state`.
- Inmediatamente después, escritura `iput v3, v6, ...->error:I`.

En el mensaje del 2026-11-19T21:19:30Z añadió que la zona corresponde a `.line 1569` y que el writer de error usa `v3`.

No se recuperó la definición/reasignación dominante de `v10`, el encabezado del método ni el cuerpo completo de `:cond_23`. La condición sobre `v14` no demuestra por sí sola el valor de `v10`.

## 2. Coordenada física 1441

El usuario reportó la instrucción:
```smali
iput v10, v6, Lcom/miui/backup/service/BRItem;->state:I
```

El contexto histórico disponible indica:

- La escritura aparece después de comprobaciones relacionadas con `isGMSAPP`.
- A continuación se carga `const/16 v0, 0xd` y se escribe `iput v0, v6, ...BRItem;->error:I`.
- El mensaje del 2026-11-19T21:19:30Z asocia la región con `.line 1589`.

No se recuperó la definición/reasignación de `v10`, las condiciones completas de `isGMSAPP`, ni el encabezado/cuerpo completo del método. El literal `0xd` pertenece al writer de `error`, no prueba el valor escrito a `state`.

## 3. Reconciliación con inventarios previos

- El índice maestro ya registraba las escrituras `state=v10` en 1283, 1336 y 1441, dejando `v10` sin resolver.
- La evidencia histórica previa ya conservaba que 1336 y 1441 son writers de `BRItem.state`; esta evidencia no los vuelve a contar como writers nuevos.
- El delta aquí es el contexto adyacente recuperado: en 1336, guardia `if-nez v14, :cond_23` y writer `error=v3` junto a `.line 1569`; en 1441, comprobaciones `isGMSAPP` y writer `error=13` (`0xd`) junto a `.line 1589`.
- En ambos sitios, `v10` sigue sin procedencia ni valor efectivo demostrados. No se le atribuye 7, 8 ni otro estado.
- Los valores de `v10` de 1336/1441 no se conectan con el `v10` leído en 2360 ni con otras regiones sin análisis de flujo y alcance.

**Resultado:** se añade contexto local parcial a dos writers conocidos; el valor de estado continúa abierto. Clasificación `RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
