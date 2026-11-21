# Evidencia 85 — Sitios adicionales de uso de v8 en BRService$5.run()

- Fecha de registro: 2026-11-21.
- Procedencia: recuperación del mensaje original del usuario del 2026-11-20T23:28:05Z, conversación «Revisar referencias v8».
- Archivo: `decoded/smali/com/miui/backup/service/BRService$5.smali`.
- Clasificación: `USER-REPORTED-GREP / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- Alcance: análisis estático; no ejecución dinámica.

## 1. Inventario grep recuperado

El usuario compartió el resultado de una búsqueda de referencias a `v8` en `BRService$5.smali`:

| Línea física reportada | Texto grep / instrucción | Tipo |
|---:|---|---|
| 119 | `const/4 v8, 0x1` | definición |
| 124 | `const/4 v8, 0x0` | definición alternativa |
| 1051 | `if-eqz v8, :cond_1c` | uso condicional |
| 1235 | `move/from16 v35, v8` | copia/uso del registro |
| 1728 | `if-eqz v8, :cond_2d` | uso condicional |

La tabla conserva el resultado de grep reportado por el usuario; no es una extracción completa de los métodos ni demuestra por sí sola el alcance de cada definición sobre todos los usos.

## 2. Relación con evidencia previa

- Las definiciones en 119/124 y el uso condicional en 1051 ya están cubiertos por las evidencias 65 y 66. No se cuentan de nuevo.
- El bloque físico 1025–1090, también recuperado en la conversación, confirma que la rama de 1051 puede asignar `v16=0x8` y saltar a `:goto_3f`; la rama alternativa comprueba `mIsFlashDriveTask` y `isUsbAvaliable()`, con asignación `v16=0x9` si la tarea flash-drive está activa y USB no está disponible. Este bloque no se vuelve a transcribir aquí.
- Las referencias físicas 1235 y 1728 son el delta nuevo frente al índice maestro v0.84: una copia `v8 → v35` y otra prueba condicional de `v8`.

## 3. Límites probatorios

El historial recuperado no conserva el bloque Smali alrededor de 1235 ni el bloque alrededor de 1728. Por tanto, no se determina:
- qué representa `v35` después de recibir `v8`, ni si llega a una llamada, campo o código de error;
- qué condición adicional o efecto controla `:cond_2d`;
- si el valor que llega a 1235/1728 procede siempre de las definiciones 119/124 dentro del mismo método y flujo;
- si el uso de 1728 tiene relación con los códigos 8/9 o con una ruta de restauración concreta.

No inferir semántica de `v35` ni causalidad a partir de la mera coincidencia de registro.

## 4. Siguiente evidencia necesaria

Si resulta imprescindible cerrar este delta, recuperar únicamente los bloques literales que incluyan:
1. el contexto inmediato de la línea física 1235 hasta el siguiente consumidor de `v35`;
2. el contexto de la línea física 1728, incluyendo la definición dominante de `v8`, la etiqueta `:cond_2d` y sus efectos.

No repetir el método completo ni las extracciones 1025–1090 ya preservadas.

**Resultado:** se amplía el inventario de usos de `v8` en `BRService$5.smali` con las coordenadas 1235 y 1728. Son referencias reportadas por grep recuperado del chat, no verificación local independiente ni cierre semántico.
