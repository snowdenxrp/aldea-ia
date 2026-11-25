# Evidencia 155 — BRService$5: v13 en limpieza excepcional y clasificación de reutilizaciones de v5 — 2026-11-24

**Método:** `.method public run()V` (inicio físico previamente identificado en línea 39).  
**Procedencia:** ventanas físicas compartidas por el usuario desde Termux en el chat actual.  
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica.

## 1. v13: las líneas 2266 y 2304 son limpieza excepcional, no reinicio normal del contador

La ventana física 2245–2320 permite reconstruir el bloque:

- 2263–2268: `:catchall_0` captura una excepción en `v0`, asigna `v13 = null` y salta a `:goto_23`.
- 2270–2299: `:catch_6` captura IOException, establece `v14=2`, `v10=null`, escribe `BRItem.error=v7`, registra IOException y, si `v10` no es nulo, salta a `:goto_20` para ejecutar `File.delete()`; después continúa a `:goto_25`.
- 2301–2304: `:catchall_1` captura otra excepción y asigna `v13 = v10`.
- 2306–2314: `:goto_23` comprueba `v13`; si no es nulo, invoca `File.delete()`; después `:cond_3a` relanza `v0`.

**Conclusión acotada:** las asignaciones de v13 en 2266 y 2304 pertenecen al bloque de limpieza excepcional de un objeto File temporal (referenciado por v10), seguido de relanzamiento de excepción. No constituyen un reset ni una actualización del contador en la ruta normal. La evidencia 139 conserva los tres incrementos (2227, 2422, 3503), y la evidencia 138 conserva el uso final de v13 en la métrica; este bloque no demuestra una redefinición normal entre esos puntos.

No se infiere el origen completo de v10 ni la semántica total del archivo temporal más allá de las instrucciones mostradas.

## 2. Clasificación contextual de ocurrencias de v5

Las ventanas recibidas clasifican las siguientes ocurrencias del inventario de evidencia 154:

- 97: `move-result-object v5` recibe `mBRItems` y lo pasa a `handleTaskFinish` en una ruta temprana que termina con `return-void` (líneas 85–101).
- 111: `const/4 v5, 0x2` contiene el valor comparado con `mBakFilesType` en `if-ne v0, v5`; no es una referencia ZipFile.
- 804: `move-result-object v5` recibe `mBRItems` y se pasa a `handleTaskFinish` en otra ruta temprana que termina con `return-void` (líneas 792–808).
- 3844: `const/4 v5, -0x1` es argumento de `mRunningItemIndex` mediante `fput`.
- 3885: `const/4 v5, 0x4` es argumento de `setState` en la fase de finalización/transición de tarea.
- 3891: `const-wide/16 v5, 0x1f4` prepara 500 ms para `Thread.sleep(J)`; ocupa el par de registros v5/v6.
- 3908 y 3945: cadenas de log `InterruptedException` y `RemoteException`.
- 4045: `const/4 v5, 0x0` es argumento de `setState`.
- 4088: `const/4 v5, 0x4` es argumento de `handleTaskFinish`.

Estas ocurrencias tardías no representan la ZipFile abierta en v5 en la línea 913. En las ventanas recibidas, v5 se reutiliza para argumentos, constantes, datos de log y un valor wide temporal. Las lecturas de v5 en 1509, 2437, 3011, 3635 y 3646 quedan fuera de esta clasificación contextual; las evidencias 152/153 describen parte de esos usos y el límite sobre posibles redefiniciones intermedias.

## 3. Resultado conjunto y límites

- El flujo normal del contador v13 no queda reiniciado por las asignaciones 2266/2304: ambas pertenecen a limpieza excepcional con relanzamiento.
- v13 también tiene reutilizaciones previas al bucle, documentadas en evidencia 153; el reinicio normal en 958 delimita el comienzo del contador principal.
- v5 es un registro reutilizado a lo largo del método. La asignación de ZipFile en 913 debe interpretarse localmente y no proyectarse sobre las fases anteriores o posteriores sin considerar las redefiniciones.
- La evidencia 154 queda contextualizada parcialmente; no se ha recibido una auditoría exhaustiva de cada lectura/escritura de ambos registros en todas las rutas.

**Dedupe:** no se repiten los incrementos 2227, 2422, 3503 ni el uso final de v13; ya constan en evidencias 139 y 138. Se contextualizan las líneas 2266/2304 y las ocurrencias v5 previamente inventariadas en evidencia 154.

**Estado:** análisis estático documental; investigación INCOMPLETA.
