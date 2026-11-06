# Informe exacto de cambios — Versión R2 (MUSE-AUTONOMY-002)

**Procedencia:** versión R2 separada del expediente consolidado Nexo M02 → M03 → M03-B, preparada por la auditoría adversarial independiente MUSE-AUTONOMY-002 (2026-11-06). **R1 se conserva intacto como evidencia; R2 no lo sustituye ni lo sobrescribe.** R2 corrige únicamente los defectos demostrados por la auditoría; ningún otro contenido se modificó.

**Base:** `report.md` de R1 (95.294 bytes, 536 líneas, SHA-256 `780c1acb…8d967f1`) → `report-r2.md` (100.546 bytes, 563 líneas, SHA-256 `d6e18406…b8dff4`). Comparación directa (`diff`): 57 líneas cambiadas (42 añadidas, 15 eliminadas). Ninguna otra línea del expediente se tocó.

## Cambios exactos (9)

| # | Hallazgo | Cambio aplicado | Ubicación |
|---|---|---|---|
| 1 | H-01 — "ESTADO: PASS" contradecía §9 | Estado global reconciliado: "ESTADO: PARTIAL", con la distinción explícita entre el sentido epistémico de PASS (§9: exige evidencia de implementación, no se concede por documentación) y el sentido de aceptación documental de la misión R1 (cinco criterios demostrados en el ámbito local). | §11 D |
| 2 | H-02 — Anexo A del HTML obsoleto | Anexo A actualizado a los archivos vigentes, incluido el PDF R1 (141.597 bytes, 28 páginas). Las filas de `report-r2.md`, HTML R2 y PDF R2 remiten al manifiesto externo `hashes-r2.md` (un archivo no puede contener su propio hash). | Anexo A |
| 3 | H-B2 — §8.4 como "Verificado en vivo" en §12 | §8.4 (firma JWS opcional, SHOULD) queda como análisis secundario, no leído verbatim; retirado de la lista de secciones verificadas en vivo de la fila A2A. | §12, fila A2A |
| 4 | H-03 — Cita de C03 inexistente en la página citada | Cita entrecomillada sustituida por la redacción real de GitHub Docs ("previously verified commits retain their verified status… GitHub will not re-verify previously signed commits"). La sustancia de C03 no cambia. | §3 C03 |
| 5 | H-04 — Corroboración sin resúmenes identificados | Nota explícita de limitación en §12 (los resúmenes de corroboración no se nombran en este expediente; su independencia no es comprobable desde aquí) + fuentes nombradas para la corroboración del IR 8547 final (postquantum.com, Cloud Security Alliance, yaamlabs.com, quentir.ai). | §12, nota |
| 6 | H-05 — Referencias cruzadas de C04 | Nota de conteo de §5 ("fila D12/D4") y B1 ("trazada en §4") corregidas: C04 permanece CONFIRMADA en §3 y trazada en §5, sin fila en la matriz D1–D15 porque no hubo discrepancia sobre ella. | §5 nota, §11 B1 |
| 7 | H-07 — U1 "RESUELTO" sin calificación en §7 | La celda de estado ahora dice "RESUELTO (decisión del propietario; verificación verbatim pendiente)". | §7, fila U1 |
| 8 | H-08 — D9 mezclaba el conjunto con las incorporaciones | La fila distingue las 4 incorporaciones de C12 del conjunto completo de seis controles ("recursos" = límites de tamaño/frecuencia, ya existentes en M02). | §4 D9 |
| 9 | H-06 — Sección añadida del HTML sin declarar | La sección de informe final que solo existe en la versión web se presenta como "Apéndice de entrega", marcado como no parte del expediente, con el estado PARTIAL reconciliado. | Versión web (artefacto) |

Además: nueva sección §11 E con esta lista exacta de cambios, y Anexo A reescrito para R2 (archivos R2 + archivos R1 conservados como evidencia).

## Lo que NO se cambió

- R1 se conserva intacto (informe, HTML, PDF, manifiesto). Ninguna línea de R1 se sobrescribió.
- C01–C16, D1–D15, R1–R7, U1–U9, D-01 a D-12: sin cambios de veredicto ni de estado. D-01 a D-12 permanecen SIN DECIDIR.
- NCS M0 y P07: no modificados. No se autorizó implementación, bootstrap ni efectos protegidos.
- No se eliminó evidencia anterior para ocultar discrepancias: los hallazgos de la auditoría quedan documentados en `audit-r1-independent.md`.

## Verificación realizada sobre R2

- Comparación programática del artefacto contra `report.md` (constructor): 10 tablas, C01–C16, D1–D15 completos, subsecciones de §6 y §11, y los 13 SHA-256 reales del Anexo A coinciden; las filas R2 del Anexo A no contienen ningún hash (solo "ver hashes-r2.md").
- Controles probados en vivo: enlace del índice a §3, buscador "safetensors" (solo C06 visible), chip "Aportaciones nuevas · 5" combinado con búsqueda "C01" (0 correcciones: C01 queda correctamente excluida).
- PDF R2 verificado por extracción de texto: C01–C16 completos, "ESTADO: PARTIAL" presente, la cita inventada de C03 ausente (0 ocurrencias), D-01 a D-12 SIN DECIDIR.
- Nota: las subsecciones de §11 se renderizan en el orden A, B, D, E, C porque ese es el orden exacto de `report.md` y reordenarlas rompería la trazabilidad de las referencias internas ("§11 C" = Limitaciones). Se conserva a propósito.

## Entregables R2 (hashes calculados sobre los archivos reales)

| Archivo | Ruta | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `report-r2.md` / `report.md` (informe R2) | `workspace/research_notes/nexo-autonomy-002/r2/report-r2.md` | 100.546 | `d6e184061670b17ba72f465e7b5af0d1123206faa6fe5f68457a63fa3eb8dff4` |
| `expediente-consolidado-nexo-r2.html` (HTML R2) | `workspace/your_files/expediente-consolidado-nexo-r2/expediente-consolidado-nexo-r2.html` | 138.565 | `f0ba66c8709866c0dbc16f80bd7b09f724833f17f83b72a9b005dab182ee5f46` |
| `expediente-consolidado-nexo-r2.pdf` (PDF R2, 30 págs A4) | `workspace/your_files/expediente-consolidado-nexo-r2/expediente-consolidado-nexo-r2.pdf` | 148.668 | `2ab42be873d9f0684dd6d9e4d6c96da0f0f67fd40643754875b1b24a0fb721fa` |
| `consolidation-method.md` (nota de método, sin cambios) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/notes/consolidation-method.md` | 2.209 | `ac1efe9f9e8d7a5224f6de8011bb3ce47540e8975f7d6574d14297abd2c9a679` |

Manifiesto completo: `workspace/research_notes/nexo-autonomy-002/r2/hashes-r2.md`.

## Estado de R2

**PARTIAL** (bajo la regla de §9). Los cinco criterios R1 superan la comprobación en el ámbito local tras estas correcciones; la integridad del documento publicado en la rama sigue siendo UNKNOWN (sin acceso a GitHub) y las verificaciones documentales pendientes (§11 C) se mantienen como limitaciones.
