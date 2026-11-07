# Manifiesto SHA-256 — Publicación R2 (MUSE-AUTONOMY-002)

**Fecha:** 2026-11-06.
**Repositorio:** `snowdenxrp/aldea-ia`.
**Rama:** `nexo-mission-02-pdf-2026-11-05`.
**Carpeta:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`.

Todos los hashes se calcularon con `sha256sum` sobre los bytes finales de cada
entregable, después de la última edición. Nunca se calcularon hashes sobre
texto reconstruido, fragmentos o contenido copiado parcialmente.

## 1. Entregables R2 (publicación)

| Archivo | Ruta en la rama | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `report-r2.md` | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/report-r2.md` | 100.546 | `d6e184061670b17ba72f465e7b5af0d1123206faa6fe5f68457a63fa3eb8dff4` |
| `expediente-consolidado-nexo-r2.html` | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/expediente-consolidado-nexo-r2.html` | 138.565 | `f0ba66c8709866c0dbc16f80bd7b09f724833f17f83b72a9b005dab182ee5f46` |
| `expediente-consolidado-nexo-r2.pdf` (30 págs A4) | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/expediente-consolidado-nexo-r2.pdf` | 148.668 | `2ab42be873d9f0684dd6d9e4d6c96da0f0f67fd40643754875b1b24a0fb721fa` |
| `hashes-r2.md` (este manifiesto) | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/hashes-r2.md` | — | — (ver nota) |
| `notes/consolidation-method.md` | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/notes/consolidation-method.md` | 7.666 | `b4de98656aa46f9a97ae9a6a3502c41bccca18bdbfdb6860d9077cb12d1b158b` |

## 2. Documentos R1 conservados como evidencia en la misma carpeta

| Archivo en la rama | Tamaño (bytes) | SHA-256 |
|---|---|---|
| `auditoria-consolidada-muse-m02-m03-m03b-r1-corregida.html` (HTML R1) | 147.680 | `56330207241d88d67bde723656175c6daa8757f943bf385705f1ffffc78cbd64` |
| `auditoria-consolidada-muse-m02-m03-m03b.html` (HTML original, pre-R1) | 135.043 | `5b49911346ff6c20e4a1842405424193ff6a1a58af20c64f8b79afef8c39c673` |
| `expediente-consolidado-nexo.pdf` (PDF R1, 28 págs A4) — nombre en la rama: ver nota | 141.597 | `6bab7c1692cb09d703c3f52c71bdc733c1ed6c7439e8c12f02d61071269c0a6d` |
| `report.md` (informe R1) — en carpeta de investigación local | 95.294 | `780c1acba72ed0f9dc99cf0bd8c81405629e01ad28c818c5bfe18b3308d967f1` |
| `hashes.md` (manifiesto R1) — en carpeta de investigación local | 1.514 | `690a3a520a831d2ef06c8890acf21eda65e3c6fc2d91a26c6f2264175b399e4a` |
| `notes/consolidation-method.md` (nota de método R1) — en carpeta de investigación local | 2.209 | `ac1efe9f9e8d7a5224f6de8011bb3ce47540e8975f7d6574d14297abd2c9a679` |

Nota: el PDF R1 y los archivos `report.md`, `hashes.md` y la nota de método R1
no estaban publicados en esta carpeta de la rama al preparar este manifiesto;
sus hashes corresponden a las copias locales verificadas en la auditoría
(8/8, cero discrepancias) y se listan aquí como referencia de evidencia, no
como archivos publicados en la rama.

## 3. Documentos de la auditoría 002 ya publicados en la rama

| Archivo en la rama | Tamaño (bytes) | SHA-256 |
|---|---|---|
| `audit-r1-independent.md` | 23.857 | `0f9d37303a15865d1b035cea148210569cd96054a49ea0ac84862a94328a7028` |
| `manifest-r1-verified.md` | 5.765 | `4e7fe75dc7d986e2891ffdfd9cde88680ad9bcda2cae2b0f3c45fdc4cd62e655` |
| `audit-r1-criteria-matrix.md` (informe exacto de cambios R2; nombre conservado) | 6.272 | `9ec420f532497eb4658ee1cb3ca628abc22408a62713c6ef21fda57b58f13707` |
| `auditoria-muse-autonomy-002-r1-independiente.html` (HTML R2 bajo nombre anterior; se conserva, no se borra) | 138.565 | `f0ba66c8709866c0dbc16f80bd7b09f724833f17f83b72a9b005dab182ee5f46` |

## Nota sobre la autorreferencia

Este manifiesto no puede contener su propio hash de manera autocontenida: un
archivo no puede contener su propio SHA-256. El hash de `hashes-r2.md` se
registra como evidencia externa en el informe de cierre de la misión y en un
commit posterior, tras la publicación.
