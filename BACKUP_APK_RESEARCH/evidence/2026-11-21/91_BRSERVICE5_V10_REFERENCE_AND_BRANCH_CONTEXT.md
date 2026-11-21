# Evidencia 91 — Referencias históricas adicionales de v10 en BRService$5 (19-11-2026)

- Fecha de registro: 2026-11-21.
- Archivo: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Procedencia: mensajes originales del usuario del 2026-11-19T19:07:26Z, 19:07:59Z, 19:11:29Z, 19:13:23Z y 19:14:03Z.
- Clasificación: `USER-REPORTED-GREP / USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- Alcance: inventario y fragmentos históricos parciales; no prueba de flujo de registros.

## 1. Referencia adicional de definición

El usuario reportó `const/4 v10, 0x3` en la coordenada física 134.

No se recuperó el método que contiene esa instrucción, su descriptor, ni el bloque completo. Tampoco se ha demostrado que esa definición domine o alcance las escrituras de `BRItem.state` en 1283, 1336 o 1441. Por tanto, no se concluye que esas escrituras asignen 3.

## 2. Contexto de las tres escrituras state=v10

El usuario describió las ramas asociadas a las escrituras de `v10`:

- Física 1283: rama `:cond_22`, descrita como aplicación Pad deshabilitada. Un contexto parcial previo conserva `:goto_12`, `if-eqz v0, :cond_22`, `.line 1560` y `iput v10, v6, ...BRItem.state:I`. Antes de ese fragmento aparecen cargas `const/16 v4, 0xa`, `const/16 v16, 0x8` y otra rama con `const/16 v16, 0x9`; no se recuperó definición de `v10` en ese contexto.
- Física 1336: rama `:cond_23`, descrita como paquete de sistema inexistente; también se reportó la guardia `if-nez v14, :cond_23`. Tras `iput v10, v6, ...BRItem.state:I`, aparece `iput v3, v6, ...BRItem.error:I`. El usuario asoció la zona con `.line 1569`.
- Física 1441: rama posterior a comprobaciones relacionadas con `isGMSAPP`, descrita como GMS no instalado. Tras `iput v10, v6, ...BRItem.state:I`, aparece `const/16 v0, 0xd` y `iput v0, v6, ...BRItem.error:I`. El usuario asoció la zona con `.line 1589`.

Las tres escrituras ya estaban inventariadas en evidencia previa; no se cuentan como writers nuevos. Esta evidencia preserva etiquetas/condiciones descritas y referencias adicionales de `v10`.

## 3. Otras referencias posteriores de v10

El usuario reportó también:

- Física 1641 y 1675: `const/4 v10, 0x7`.
- Física 1701: `if-nez v10, :cond_2c`.
- Física 1781: `move-object v10, v4`.
- Mensaje 19:14:03Z: en `:cond_28` y `:catch_1` aparece `const/4 v10, 0x7` seguido de una invocación; el texto recuperado no incluye la instrucción completa ni el destino de esa invocación.

No se demuestra relación de flujo entre estas referencias y las escrituras anteriores de state. En particular, las cargas 0x7 de 1641/1675 no prueban que 1283/1336/1441 escriban 7; `move-object v10, v4` puede pertenecer a un contexto de tipo distinto y no se interpreta sin descriptor y límites de método.

## 4. Límites y conclusión

La recuperación añade:
- una definición reportada `v10=3` en física 134;
- etiquetas/condiciones históricas de las ramas de 1283, 1336 y 1441;
- referencias posteriores `v10=7`, una prueba condicional y un movimiento de objeto.

No se recuperaron cabeceras de método ni flujo continuo que conecte estas coordenadas. No se asigna valor efectivo a las tres escrituras `BRItem.state=v10`. Clasificación `RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
