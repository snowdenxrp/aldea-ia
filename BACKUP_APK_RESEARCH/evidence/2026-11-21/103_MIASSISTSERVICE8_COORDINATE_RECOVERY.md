# Evidencia 103 — Coordenadas recuperadas de MiAsistService$8

- Fecha de consolidación: 2026-11-21.
- Rama: `backup-apk-static-research-2026-11-19`.
- Procedencia: mensajes del usuario en el chat titulado “Reconstrucción de MiAsistService”, 2026-11-16 21:06:49Z y continuación 21:07:00Z; recuperación posterior focalizada.
- Clasificación: `USER-PASTED-SMALI / RECOVERED-CHAT` para referencias y coordenadas comunicadas por el usuario. No `LOCAL-VERIFIED`.
- Alcance: investigación estática; no ejecución dinámica ni extracción nueva del APK.

## 1. Coordenadas conservadas

Se recuperaron las siguientes anclas físicas reportadas para `MiAsistService$8.smali`:

| Coordenadas físicas reportadas | Referencia asociada en el mensaje recuperado |
|---|---|
| 297 | `updateAppBRItemSize` |
| 541 | `loadFileBRItemByType` |
| 671 | `updateItemTotalSize` |
| 796, 799, 811, 813 | referencias a `mCurrentDate` |
| 827, 867, 869 | referencias a `mCurrentRootPath` |
| 959 | referencia a `mTotalSize` |
| 1059, 1061, 1064 | `loadAppBRItems` / `loadFileBRItems` |
| 1132 | `updateBakFilePath` |
| 1191 | referencia a `mAllBRItems` |
| 1220–1347 | bloque/rango reportado de progreso y notificación; la continuación de 1347 incluye la referencia `-$$Nest$fputmLastUpdateTime` |

Las coordenadas son puntos físicos reportados, no una transcripción íntegra de cada instrucción. El mensaje histórico también describió referencias a `mTransService`, `mServiceSyncer` y `mSizePredictSyncer`, y callbacks de `AsyncTask` (`doInBackground()`, `onPostExecute()`, `onProgressUpdate()`), pero no se recuperaron aquí sus bloques completos ni encabezados de método.

## 2. Deduplicación frente al índice maestro

La sección 40 del índice maestro ya resumía la responsabilidad general de `MiAsistService$8` y los nombres de métodos:

- `loadAppBRItems`
- `loadFileBRItems`
- `updateAppBRItemSize`
- `updateItemTotalSize`
- `updateBakFilePath`

Esa sección no contenía las coordenadas físicas anteriores. Este registro añade únicamente las anclas concretas y sus etiquetas de contexto; no vuelve a registrar la descripción funcional general de `$8`.

## 3. Límites

- El contexto histórico disponible contiene líneas/anclas sueltas por coordenada, no cuerpos completos de métodos ni encabezados `.method`.
- No atribuir condiciones, valores, orden de ejecución, efectos sobre archivos ni semántica de sincronización que no aparezcan en el material recuperado.
- No inferir que el rango 1220–1347 sea un único método o que represente todas las notificaciones.
- La búsqueda histórica no recuperó un bloque literal completo de `MiAsistService$8`; no reconstruirlo por inferencia.
- No se comprobó el archivo Smali local en esta ronda.

**Resultado:** se preservan 18 anclas físicas reportadas de `MiAsistService$8.smali` como delta de coordenadas respecto del resumen ya existente en la sección 40. No se afirma que el inventario sea exhaustivo ni que los rangos estén verificados contra el APK local.
