# Evidencia 113 — coordenadas de copia de state/error en BRItem(BRItem) — 2026-11-22

**Archivo referido:** `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali`.
**Procedencia:** `USER-FACT / RECOVERED-CHAT`, resultado histórico recuperado de conversación del usuario, timestamp `2026-11-20T04:41:25Z`.
**Clasificación:** detalle de coordenadas físicas reportadas en salida de Termux; no se recuperó aquí el comando ni el stdout íntegro. No `LOCAL-VERIFIED`.

## Delta preciso

En el constructor de copia `BRItem(BRItem)`, la salida histórica reportó:

- línea física **121**: copia del campo `state` mediante lectura del objeto fuente (`iget`) y escritura al objeto destino (`iput`).
- línea física **123**: copia del campo `error` mediante `iget`/`iput`.

La misma recuperación indicó que el constructor copia los campos descritos en la evidencia 41, crea una lista nueva para `localFileList` y copia sus elementos mediante `addAll`. También reiteró que `apkSize` y `dataSize` no aparecen como referencias en los métodos del archivo, sino solo como declaraciones de campo.

## Reconciliación

La semántica general del constructor de copia ya está documentada en evidencia 41 (`41_BRITEM_CONSTRUCTORS_AND_COPY_SEMANTICS.md`). Esta evidencia **no** añade un nuevo comportamiento ni un nuevo writer de estado/error: añade únicamente las coordenadas físicas exactas 121 y 123 para dos copias ya descritas.

No volver a contar estas operaciones como writers independientes de la lógica de Backup; son copias de campos dentro del constructor de copia. No inferir que estas coordenadas prueban una mutación de un BRItem ya existente fuera de la construcción del objeto destino.

**Estado:** coordenadas recuperadas de chat; extracción literal y cotejo local actual pendientes.
