# Manifiesto SHA-256 — Copias rectificadas G para revisión (MISIÓN MUSE-004-G)

**Misión:** MUSE-AUTONOMY-004-G, Pasada 2 — Corrección (remediación de los defectos A-01, A-02, A-03 y del hallazgo C-01 de la revisión adversarial de MUSE-004-F).
**Fecha:** 2026-11-08.
**Estado:** copias de revisión G, NO versión oficial. La aplicación sobre los canónicos R2 NO está autorizada. No se ha publicado ni fusionado nada.

Todos los hashes se calcularon con `sha256sum` sobre los bytes finales de cada
documento de revisión G, después de la última edición. Nunca se calcularon hashes
sobre texto reconstruido, fragmentos o contenido copiado parcialmente. No se
copió ningún hash de versiones anteriores.

## Documentos de revisión G

| Archivo | Ruta | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `report-r2-rectified-review-g.md` | `research_notes/nexo-autonomy-004-g/review-g/report-r2-rectified-review-g.md` | 159.176 | `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b` |
| `closure-r2-rectified-review-g.md` | `research_notes/nexo-autonomy-004-g/review-g/closure-r2-rectified-review-g.md` | 48.458 | `d7e85d53e72acb6729a07624ca62026128e0069c8c275210250aeca469519655` |
| `expediente-consolidado-nexo-r2-rectified-review-g.html` | `research_notes/nexo-autonomy-004-g/review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 195.786 | `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9` |
| `consolidation-method-rectified-review-g.md` | `research_notes/nexo-autonomy-004-g/review-g/consolidation-method-rectified-review-g.md` | 13.351 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| `hashes-r2-rectification-review-g.md` (este manifiesto) | `research_notes/nexo-autonomy-004-g/review-g/hashes-r2-rectification-review-g.md` | — | — (ver nota) |

**Un solo archivo HTML G.** A diferencia de la rama MUSE-004, que contenía dos archivos HTML byte-idénticos con nombres distintos (duplicación accidental, mismo SHA-256 `973c5807…37dbd5`), la revisión G produce **un solo** archivo HTML. El duplicado no se replica.

## Documentos de referencia (bases F2 intactas, no modificadas)

| Archivo | Tamaño (bytes) | SHA-256 |
|---|---|---|
| `report-r2-rectified-review-f2.md` (informe rectificado F2, base de la copia G) | 147.584 | `dacefd69a40ed28d924e2dee1faceca5ef85230182c829dcae84fff6634b6546` |
| `closure-r2-rectified-review-f2.md` (cierre rectificado F2, base de la copia G) | 42.702 | `80a82481f12def6bf09034e47edbabdd447528da382848eb2d6124473ba68023` |
| `expediente-consolidado-nexo-r2-rectified-review-f2.html` (HTML rectificado F2, base de la copia G) | 184.564 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` |
| `consolidation-method-rectified-review-f2.md` (nota de método F2, base de la copia G) | 12.800 | `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636` |
| `hashes-r2-rectification-review-f2.md` (manifiesto F2) | 5.248 | `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0` |
| `report-r2-rectified-review.md` (informe rectificado MUSE-004) | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` |
| `closure-r2-rectified-review.md` (cierre rectificado MUSE-004) | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` |
| `expediente-consolidado-nexo-r2-rectified-review.html` (HTML rectificado MUSE-004) | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` |
| `hashes-r2-rectification-review.md` (manifiesto MUSE-004) | 3.117 | `b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5` |
| `report-r2.md` (R2 canónico) | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` |
| `closure-r2.md` (cierre R2) | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` |
| `hashes-r2.md` (manifiesto R2) | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` |
| `consolidation-method.md` (nota de método R2, 4.º canónico) | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` |

## Nota sobre la autorreferencia

Este manifiesto no puede contener su propio hash de manera autocontenida: un
archivo no puede contener su propio SHA-256. El hash de
`hashes-r2-rectification-review-g.md` se registra como evidencia externa en
`MUSE_004_G_CORRECTION_REPORT.md` (informe de corrección de la Pasada 2).

## Verificación

- Diff f2 → g FINAL (informe, medido con `diff` tras la corrección post-Pasada 5): 21 líneas eliminadas / 44 líneas añadidas.
- Diff f2 → g FINAL (cierre): 7 líneas eliminadas / 38 líneas añadidas (bandera G + 6 viñetas corregidas del Addendum F + Addendum G, 31 líneas; el texto anterior a los addenda se conserva íntegro).
- Diff f2 → g FINAL (HTML): 32 líneas eliminadas / 46 líneas añadidas (título, masthead, TOC, registro G, pasajes corregidos, Anexo A, pie).
- Diff f2 → g (nota de método, alternativa B): 2 líneas eliminadas / 6 líneas añadidas.
- El HTML g se verificó por extracción de texto contra el Markdown g (pasajes corregidos con el mismo texto visible en ambos formatos; 17 secciones; 30 anclas internas resuelven, 0 sin destino, 0 IDs duplicados; bloque `<script>` byte-idéntico al de F2). Marcas `[Rectificación MUSE-004-G]` finales (ocurrencias): informe 29 (24 líneas), HTML 29 (25 líneas), cierre 8, nota de método 2; marcas (D-02): 12 por formato.
- El Anexo A del informe G (L597–L605) lista los cinco archivos G con sus hashes reales salvo el propio informe (remite al manifiesto) y el manifiesto (—); el Anexo A del HTML G (tabla de revisión, 5 filas) nombra los cinco archivos G y remite al manifiesto `hashes-r2-rectification-review-g.md` (7 ocurrencias en el HTML G; 0 en el HTML F2).
- Método de construcción del HTML g: `artifact.create_web_static` y `artifact.export` no están disponibles en esta sesión de subagente (el namespace `artifact` cargado expone solo `restore`/`share`/`unshare`); el HTML g se construyó aplicando las mismas correcciones, con conteo exacto, sobre los bytes del HTML rectificado F2, preservando estructura, navegación, tablas, referencias internas y el JavaScript de búsqueda/filtro. Ver `MUSE_004_G_CORRECTION_REPORT.md`, hallazgo de proceso ND-G1 (misma desviación que ND-F1 en Fase F).
- Revisión de la Pasada 2: 4 defectos corregidos (A-01, A-02, A-03, C-01); precisiones B-06 y B-07 del Addendum F corregidas junto con A-01. 0 defectos CRÍTICOS nuevos. 1 hallazgo nuevo de proceso registrado en el informe de corrección (ND-G1). No se declara PASS.
- Revisión de la Pasada 3 (2026-11-08): hallazgos menores B-01–B-09 de la revisión adversarial F (§2.2). Corregidos B-01, B-02, B-03, B-04, B-05 y B-08 en informe y HTML (6 líneas modificadas en cada archivo, 0 líneas añadidas/eliminadas); B-06 y B-07 ya estaban corregidos por la Pasada 2 (verificados, sin cambio); B-09 no se repite en ninguna copia G (verificado, sin cambio). Actualizados en este manifiesto los hashes del informe (157.071 bytes) y del HTML (193.805 bytes); el Anexo A del informe G lleva el nuevo hash del HTML. Cierre (48.472 bytes) y nota de método (13.351 bytes) sin cambio en esta pasada. No se declara PASS.
- Corrección post-Pasada 5 (coordinador, 2026-11-08): defectos de la revisión adversarial propia — mayor D-01 (= C-1, diffs obsoletos en este manifiesto), mayor D-02 (residuo B-02: plural no verificado en 6+ pasajes), menores d-01 (= C-3, «copia f2 actualizada» en el cierre), d-02 (recuentos de marcas), d-03 (cita falsa de R2c), d-04 (§8.4 «Verificado en vivo» vs «confirmado en vivo») y d-05 (hashes superados sin nota en el informe de corrección) — corregidos en informe, HTML, cierre e informe de corrección. Actualizados en este manifiesto los hashes y tamaños del informe (159.176 bytes), del cierre (48.459 bytes) y del HTML (195.843 bytes); la nota de método no cambia (13.351 bytes). No se declara PASS.
- Auditoría final post-Pasada 5 (coordinador, 2026-11-09): la última auditoría adversarial encontró 1 defecto MAYOR nuevo (H-01: cifra de diff 4/6 en el documento de gate, correcta solo para la copia F2; para la copia G es 4/10) y 3 menores (H-02: nombre f2 residual en el sujeto de la viñeta D-02 del cierre; H-03: puntero superado a §6 en la nota d-05 del informe de corrección; H-04: plantilla «A-xx/C-xx» extra en el banner del HTML). Los cuatro se corrigieron: actualizados en este manifiesto los hashes y tamaños del informe (159.176 bytes), del cierre (48.458 bytes) y del HTML (195.786 bytes); la nota de método no cambia (13.351 bytes). Diffs f2 → g sin cambio (informe 21/44, cierre 7/38, HTML 32/46, método 2/6): las correcciones cayeron dentro de líneas ya modificadas. No se declara PASS.
