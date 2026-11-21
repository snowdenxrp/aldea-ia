# Evidencia 87 — Recuperación histórica de contexto literal BRService$5 (17-11-2026)

- Fecha de registro: 2026-11-21.
- Procedencia: recuperación de mensajes originales del usuario en conversaciones anteriores; timestamps conservados: 2026-11-17T23:20:20Z, 23:20:47Z, 23:35:19Z, 23:35:56Z y 23:36:25Z.
- Archivo referido: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Clasificación: `USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- Alcance: recuperación documental estática; no se ejecutaron comandos ni pruebas.

## 1. Contexto literal recuperado alrededor de 1728

Un mensaje del usuario del 2026-11-17T23:20:47Z describió una extracción literal atribuida al rango físico 1690–1750 con esta secuencia:

```smali
:cond_2c
# log: "Restore One, checked bak"
if-eqz v8, :cond_2d
.line 1644
:try_start_3
new-instance v10, Ljava/io/File;
...
Customization;->getTransTempBackupRootPath()
...
const-string v15, ".tmp_bak_file"
```

Elipsis indica instrucciones intermedias no recuperadas en el historial disponible; no reconstruirlas.

**Delta respecto de evidencia 85/86:** la referencia física 1728 ya no es solo una instrucción grep. Se recuperó su contexto inmediato y la acción del camino de caída (cuando `v8 != 0`): comienza la construcción de un `File` asociado a `getTransTempBackupRootPath()` y al nombre `.tmp_bak_file`.

**Límite:** no se recuperó el cuerpo de `:cond_2d`, por lo que no está descrito el camino tomado cuando `v8 == 0`. Tampoco se recuperó aquí el encabezado del método ni una cadena completa de definiciones/redefiniciones que demuestre que las inicializaciones 119/124 dominan este uso. No asignar todavía semántica definitiva a `v8`.

## 2. Contexto histórico de 1235

El mismo mensaje del 2026-11-17T23:20:47Z describió el rango físico 1200–1260 y conservó esta secuencia:

```smali
:cond_1f
:goto_10
move/from16 v35, v8
goto/16 :goto_2f
```

El contexto previo fue descrito como una comparación de `packageName`; no se recuperaron aquí las instrucciones completas de esa comparación ni el consumidor de `v35`.

Esto aporta contexto literal parcial independiente para la copia en 1235. No fusionarla con la copia física 2364 (evidencia 86) ni con las referencias de 1738/2297/2391: son sitios separados.

## 3. Otras referencias en la misma región 1725–1779: discrepancia que debe conservarse

Mensajes posteriores del usuario, fechados 2026-11-17T23:35:19Z y 23:35:56Z, describieron otros extractos de BRService$5:

- En el rango físico 1725–1731 se reportó `:goto_21` seguido de `iput v7, v6, ...BRItem;->error:I`; también se describió una ruta `:cond_39`/`:goto_22` con `move/from16 v35, v8`, y un handler `:catchall_1` que elimina `v13` y relanza `v0`.
- En el rango 1753–1755 se reportaron `:cond_40`, `notifyItemTaskError(..., 7)` y `notifyItemTaskEnd(...)`; el contexto próximo incluía una comprobación `ArrayList.isEmpty()` y `:cond_41`.
- Un mensaje del usuario del 2026-11-17T23:36:25Z situó otra copia de `move/from16 v35, v8` en la línea física 1738 bajo `:cond_3c`.

Estos resúmenes de extractos no se deben ensamblar artificialmente en un único bloque continuo con la secuencia 1690–1750. Hay solapamientos de coordenadas y etiquetas que no pueden reconciliarse sin los mensajes/bloques completos. Preservar como **extractos históricos separados con posible discrepancia de coordenadas/versión**, no como prueba de que las instrucciones sean simultáneas en un mismo cuerpo.

## 4. Relación con evidencias anteriores y estado

- Evidencia 85: conserva grep de 1235 y 1728, además de definiciones reportadas 119/124 y uso 1051.
- Evidencia 86: conserva referencias 2297/2364/2391/3807 y el fragmento literal 2338–2364.
- Evidencia 87 añade contexto literal parcial para 1235 y 1728, y referencias históricas separadas a 1738/1753–1755.
- No resuelve `:cond_2d`, no demuestra dominancia de las definiciones 119/124, no determina el consumidor de `v35` y no eleva nada a `LOCAL-VERIFIED`.

**Resultado:** el camino de caída de `if-eqz v8, :cond_2d` queda parcialmente contextualizado como inicio de preparación de `.tmp_bak_file` en `getTransTempBackupRootPath()`; la rama objetivo y la semántica completa de `v8` siguen pendientes.
