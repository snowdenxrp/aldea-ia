# Evidencia 88 — Recuperación histórica de flujo de extracción y fallo en BRService$5 (17-11-2026)

- Fecha de registro: 2026-11-21.
- Procedencia: recuperación de hechos de mensajes originales del usuario en conversaciones anteriores; timestamps conservados: 2026-11-17T23:21:54Z, 23:26:16Z y 23:27:21Z.
- Archivo referido: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Clasificación: `RECOVERED-CHAT / USER-PASTED-SMALI` para los bloques descritos en los mensajes; en esta recuperación no se dispone de la transcripción Smali literal completa, por lo que los detalles se registran como contexto recuperado, no como cita literal reproducible ni `LOCAL-VERIFIED`.
- Alcance: recuperación documental estática; no se ejecutaron comandos ni pruebas.

## 1. Bucle de extracción de entradas ZIP — 23:26:16Z

El usuario describió un extracto físico aproximado 3190–3345, asociado a las directivas fuente `.line 1861–1881`, con los siguientes elementos:

- `v8` actúa como índice de un bucle sobre un `ArrayList`.
- Se consulta `v5.getEntry(v14)`.
- Se obtiene un stream mediante `v5.getInputStream(v14)`, cuyo resultado se asigna a `v7`.
- `v7` se utiliza en la ruta de `copyFileFromStream`.
- Los handlers `:catch_b` / `:catch_c` fueron asociados al mensaje `"copyFileFromStream error"`.

El contexto histórico previo identifica `v5` como `ZipFile` en la zona de línea física 3267. No se recuperó aquí el bloque literal íntegro, la cabecera del método ni todas las definiciones/redefiniciones de registros.

**Límite crítico:** este uso de `v8` como índice pertenece a esta región del método. No permite asignar el mismo significado a `v8` en 1235, 1728, 1738 u otras coordenadas de `BRService$5`; cada uso requiere su propio análisis de flujo y alcance.

## 2. Rama de restauración fallida — 23:21:54Z y 23:27:21Z

El usuario compartió contexto alrededor de `.line 1952–1965` (mensaje 23:21:54Z) y un grep/contexto físico aproximado 3578–3615, `.line 1952–1953` (mensaje 23:27:21Z).

Hechos recuperados:

- Se notifica `onError(packageName, feature, 6)` (también descrito como `notifyItemTaskError(..., 6)`).
- Se llama a `onRestoreEnd(packageName, feature)`.
- Aparecen los literales de log `"Restore failed, for : "` y `"bakFile = "`.
- En la rama donde `v5 == null`, si `bakFile` existe, se escribe `BRItem.error = 1`; si es null o no existe, se escribe `BRItem.error = 10`.
- Cuando `v5 != null`, el resumen recuperado indica que esa rama no asigna un nuevo error.

Un resumen del asistente del 2026-11-17T23:22:04Z identificó `v5` como `ZipFile` desde la zona física 3267 y señaló que no se había mostrado una reasignación antes de las escrituras de error alrededor de 3635–3646. Esto no demuestra por sí solo el flujo completo ni la ausencia de redefiniciones: debe mantenerse como observación histórica limitada.

El mensaje 23:27:21Z conserva el contexto de notificación/log, pero no aporta una segunda rama independiente; se relaciona con la misma región de fallo descrita a las 23:21:54Z.

## 3. Reconciliación con el expediente

- La semántica general de `BRItem.error=1/10`, el caso `v5 == null`, `onError(...,6)` y `onRestoreEnd()` ya estaba resumida en el índice maestro, sección histórica de estados/errores del 18-11, y en referencias relacionadas con evidencia 18. Esta evidencia no presenta esos hechos como writers nuevos.
- El delta preservado aquí es la recuperación con timestamps y coordenadas del bucle de extracción 3190–3345, especialmente el papel local de `v8` como índice y de `v5/v7` en la lectura del ZIP/stream.
- El contexto físico 3578–3615 y los literales de log precisan la ubicación histórica de la rama de fallo; no deben contarse como una segunda asignación distinta de `BRItem.error`.
- Las referencias de `v8` en otros puntos de `BRService$5` (incluidas 119/124, 1051, 1235, 1728, 1738, 2364 y otras) siguen siendo sitios separados. No se establece dominancia, continuidad de valor ni equivalencia semántica entre ellos.
- No se recuperó código literal suficiente para reconstruir el método continuo, cerrar los handlers, ni demostrar que el `v5` de la región del ZIP conserva el mismo valor hasta la rama de error.

**Resultado:** se recupera un uso local de `v8` como índice de iteración en la región de extracción ZIP, distinto de cualquier interpretación de `v8` en otros offsets. La rama de error mantiene la semántica histórica ya conocida (`error=1/10` cuando `v5==null`) y queda mejor localizada, pero no se cierra su flujo de registros completo. No `LOCAL-VERIFIED`.
