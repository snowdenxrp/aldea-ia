# Manifiesto SHA-256 — Copias rectificadas I para revisión (MISIÓN MUSE-004-I)

**Misión:** MUSE-AUTONOMY-004-I — Corrección de H-05 y H-06 (hallazgos menores de MUSE-AUTONOMY-004-H).
**Fecha:** 2026-11-09.
**Estado:** copias de revisión I, NO versión oficial. La aplicación sobre los canónicos R2 NO está autorizada. No se ha publicado ni fusionado nada.

Todos los hashes se calcularon con `sha256sum` sobre los bytes finales de cada
documento, después de la última edición. Nunca se calcularon hashes
sobre texto reconstruido, fragmentos o contenido copiado parcialmente. No se
copió ningún hash de versiones anteriores. Los hashes SHA-256 de este manifiesto
no son Git blob SHA y no deben presentarse como equivalentes.

## Documentos de revisión I

| Archivo | Ruta | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `report-r2-rectified-review-g.md` (informe G, SIN CAMBIO en 004-I) | `research_notes/nexo-autonomy-004-g/review-g/report-r2-rectified-review-g.md` | 159.176 | `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b` |
| `closure-r2-rectified-review-i.md` (cierre review-i; H-05 INTACTO, byte-idéntico al cierre G) | `research_notes/nexo-autonomy-004-i/review-i/closure-r2-rectified-review-i.md` | 48.458 | `d7e85d53e72acb6729a07624ca62026128e0069c8c275210250aeca469519655` |
| `expediente-consolidado-nexo-r2-rectified-review-g.html` (HTML G, SIN CAMBIO en 004-I) | `research_notes/nexo-autonomy-004-g/review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 195.786 | `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9` |
| `consolidation-method-rectified-review-g.md` (nota de método G, SIN CAMBIO en 004-I) | `research_notes/nexo-autonomy-004-g/review-g/consolidation-method-rectified-review-g.md` | 13.351 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| `hashes-r2-rectification-review-i.md` (este manifiesto) | `research_notes/nexo-autonomy-004-i/review-i/hashes-r2-rectification-review-i.md` | — | — (ver nota) |

**Un solo archivo HTML G.** A diferencia de la rama MUSE-004, que contenía dos archivos HTML byte-idénticos con nombres distintos (duplicación accidental, mismo SHA-256 `973c5807…37dbd5`), la revisión G produce **un solo** archivo HTML. El duplicado no se replica. El HTML no cambia en 004-I.

## Informes G corregidos en 004-I (versiones nuevas; los originales G se conservan intactos como evidencia)

| Archivo (versión 004-I) | Ruta | Tamaño (bytes) | SHA-256 | Original G (SUPERSEDED por esta versión) |
|---|---|---|---|---|
| `MUSE_004_G_D02_DECISION_GATE.md` | `research_notes/nexo-autonomy-004-i/MUSE_004_G_D02_DECISION_GATE.md` | 13.198 | `c286a168b5485409d2a81147a6e922b9633e91a7bfed7967cdaa72ba9db957f3` | 13.054 bytes, `d39db99c911d6ed3aae023dc074e503c85cfe6079c816ee0914621d47a75b222` |
| `MUSE_004_G_CORRECTION_REPORT.md` | `research_notes/nexo-autonomy-004-i/MUSE_004_G_CORRECTION_REPORT.md` | 73.281 | `c6bb0c0bf17f630b78671c0a5f57ee6144212ad7500afa566b258642f4b3b6fb` | 73.137 bytes, `85be5bf19e472628f99f117e9e72cce14b5ee0de49e1879124c5988971f6b2e6` |
| `Resumen ejecutivo MUSE-004-G.md` | `research_notes/nexo-autonomy-004-i/Resumen ejecutivo MUSE-004-G.md` | 23.039 | `ea549ab01c905b2756370d41baf33601eb9d23288696f0703b7ccc415703941f` | 22.807 bytes, `ddec26fb72c7f79c762d4d1c0ecc550b0ca2167af04fcfd9521322edc4585f44` |

## Constancia de la corrección 004-I

- **H-06 (CORREGIDO):** la descomposición falsa del diff canónico → G de la nota de método («las 4 añadidas extra son el banner G y la sección "Actualización G"») se sustituyó en los 4 pasajes por la descomposición correcta: «las 4 añadidas extra son solo las 4 líneas del bloque "Actualización G" (hunk `83a84,87`: blanco, título, blanco, párrafo); el banner G es una sustitución 1-a-1 presente en ambas copias y aporta 0 añadidas extra». Pasajes: gate doc L96 (§7); resumen ejecutivo L29 y L46 (L46 cita el §7 del gate); informe de corrección L409 (cita del gate §7). La cifra titular **4/10 no se tocó**. Barrido exhaustivo con `grep` de «banner G» y «añadidas extra» sobre todos los documentos G y las copias nuevas: 0 ocurrencias vivas de la glosa falsa; la única cita es la de esta misma viñeta, que reproduce la redacción superseded etiquetada explícitamente como falsa, y las apariciones en los informes de la 004-H, que son citas que describen el hallazgo, no texto vivo del expediente. El manifiesto G (L73) y este manifiesto afirmaban el 4/10 sin la descomposición falsa: no necesitaron corrección de texto.
- **H-05 (PREPARADO, NO CORREGIDO — decisión PENDIENTE del propietario):** la línea L275 del cierre («Esta copia es una **copia de revisión F2**», Addendum F) NO se modificó en esta misión, porque el propietario no eligió entre las opciones A y B. El cierre review-i es byte-idéntico al cierre G (48.458 bytes, `d7e85d53…`). Ambas redacciones están preparadas con su texto exacto en `MUSE_004_I_CORRECTION_REPORT.md` §3: **A** (anotación no destructiva — conservar la frase histórica intacta y añadir una nota editorial al pie del Addendum F o en el Addendum G, con referencia a L275, que diga que esa frase es texto histórico de F2 y que la copia actual es G, como ya declara L306) y **B** (cambiar L275 a «copia de revisión G» y registrar la redacción original F2, byte a byte, como texto superseded). Las demás menciones F2 del cierre (L3, L283–L287, L319) y de la matriz de diagnóstico (L63, L117–L120) son legítimas y no se tocan.

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
`hashes-r2-rectification-review-i.md` se registra como evidencia externa en
`MUSE_004_I_CORRECTION_REPORT.md` (informe de corrección de esta misión).

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
- **Corrección 004-I (2026-11-09):** H-06 corregido en los 4 pasajes (gate L96; resumen L29 y L46; informe de corrección L409) con la descomposición correcta del 4/10; la cifra 4/10 no se tocó. H-05 preparado, no corregido: L275 intacto, decisión pendiente del propietario (opciones A y B con texto exacto en `MUSE_004_I_CORRECTION_REPORT.md` §3). Diffs re-medidos con `diff` en esta misión: cierre f2 → i = **7 eliminadas / 38 añadidas** (medido, no reutilizado: el cierre review-i es byte-idéntico al cierre G porque L275 no cambió); informe 21/44, HTML 32/46, método 2/6 (re-medidos, sin cambio). Recuento de líneas sin cambio en los 3 informes corregidos (gate 106/106, corrección 426/426, resumen 145/145; cierre 332/332). Marcas `[Rectificación MUSE-004-G]` sin cambio (informe 29, HTML 29, cierre 8; paridad MD↔HTML 29/29 mantenida porque el HTML no cambia). Nuevos hashes de los 3 informes corregidos en la tabla superior. No se declara PASS.
