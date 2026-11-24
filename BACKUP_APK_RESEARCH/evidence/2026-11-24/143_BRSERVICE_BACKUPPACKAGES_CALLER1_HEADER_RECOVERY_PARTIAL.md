# Evidencia 143 — recuperación parcial del encabezado del caller #1 de backupPackages — 2026-11-24

**Procedencia:** salida de `grep -R -n -B 35 -A 20 --include='*.smali' -e 'backupPackages' "$D"` compartida por el usuario desde Termux en este chat.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-GREP-OUTPUT. Evidencia estática; no cotejada independientemente contra el archivo local ni ejecutada dinámicamente.

## 1. Recuperación del caller #1

La salida muestra el encabezado físico del método contenedor:

~~~smali
.method private backupPackagesByRetransfering(Z)V
    .locals 17
~~~

Coordenadas físicas reportadas: declaración del método en línea 3563 y `.locals 17` en línea 3564. La misma salida muestra la invocación objetivo en línea 3774:

~~~smali
invoke-direct/range {v0 .. v13}, Lcom/miui/backup/service/BRService;->backupPackages(Ljava/util/ArrayList;ZZILjava/lang/String;ZIJJLcom/miui/backup/data/TransDeviceInfo;Z)V
~~~

Por tanto, el caller #1 ya identificado en evidencia 141 queda ahora asociado al método contenedor `BRService.backupPackagesByRetransfering(Z)V`. Esto recupera el encabezado que faltaba en evidencia 141. El argumento literal `p4=3` y el contexto de preparación del descriptor ya estaban registrados en evidencia 141; no se presentan como hallazgo nuevo de esta salida parcial.

## 2. Coordenada del caller desde Intent

La misma salida localiza la invocación desde el flujo de Intent en línea física 19318:

~~~smali
invoke-direct/range {v0 .. v13}, Lcom/miui/backup/service/BRService;->backupPackages(Ljava/util/ArrayList;ZZILjava/lang/String;ZIJJLcom/miui/backup/data/TransDeviceInfo;Z)V
~~~

La procedencia del argumento entero desde `getIntExtra(...)`, su movimiento a `v4` y el default aún no resuelto `v13` ya están descritos en evidencia 141. La línea 19318 se conserva aquí como coordenada física adicional; este extracto no basta para reconstruir por sí solo el encabezado completo ni todas las guardias del caller.

## 3. Dedupe, alcance y límites

- Evidencia 141 conserva la semántica acotada de ambos callers y el pendiente del encabezado #1. Esta evidencia 143 añade la identificación explícita del método contenedor y las coordenadas físicas visibles.
- La salida del usuario contiene otros fragmentos y coincidencias de texto `backupPackages` (incluidas cadenas de log y el método `backupPackagesByRetransfering`); no deben contarse como llamadas adicionales al método objetivo.
- El cuerpo del caller #1 no se recibió íntegramente en esta entrega. No se amplían todavía las asignaciones de registros, guardias, valores por defecto ni causalidad.
- La salida no demuestra comportamiento dinámico ni ejecución en dispositivo.
- No se recalculan hashes ni se atribuye verificación independiente al archivo Smali.

**Resultado:** pendiente del encabezado del caller #1 parcialmente resuelto. Siguen abiertos el contexto completo del caller #1, el default `v13` del caller #2, el literal `v8`/cadena causal del tipo 2 y el rastreo integral de `v13`. Investigación INCOMPLETA y estática.
