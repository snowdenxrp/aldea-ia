# Manifiesto SHA-256 — Publicación R2 (MUSE-AUTONOMY-002)

**Fecha de actualización:** 2026-11-07.
**Repositorio:** `snowdenxrp/aldea-ia`.
**Rama:** `nexo-mission-02-pdf-2026-11-05`.
**Carpeta:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`.

Todos los hashes se calcularon con `sha256sum` sobre los bytes finales de cada
entregable, después de la última edición. Nunca se calcularon hashes sobre
texto reconstruido, fragmentos o contenido copiado parcialmente.

## 1. Entregables R2 (publicación)

| Archivo | Ruta en la rama | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `report-r2.md` | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/report-r2.md` | 108.801 | `eb29be6c413655453c9d01f0956e2445efb48603f711b2a2658d1679e55ea726` |
| `expediente-consolidado-nexo-r2.html` | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/expediente-consolidado-nexo-r2.html` | 147.900 | `eb76716816a51c92fa1c21a5227510ce3f4aff36b244ba17e829cbc4bc9a8de9` |
| `expediente-consolidado-nexo-r2.pdf` (representación equivalente; no publicada por separado) | No existe archivo PDF independiente en el árbol de la rama; se conserva como referencia de la representación local | 148.668 (declarado en preparación) | `2ab42be873d9f0684dd6d9e4d6c96da0f0f67fd40643754875b1b24a0fb721fa` (declarado en preparación; no recalculado desde la rama) |
| `hashes-r2.md` (este manifiesto) | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/hashes-r2.md` | — | — (ver nota) |
| `consolidation-method.md` | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` |

**Nota de publicación:** el HTML R2 es el artefacto canónico efectivamente publicado. El propietario confirmó que HTML y PDF representan el mismo expediente y aceptó el HTML como suficiente; no se afirma que exista un PDF binario independiente en la rama ni identidad binaria entre ambos formatos. La nota de método R2 se encuentra en la raíz de la carpeta, no en `notes/`.

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
| `auditoria-muse-autonomy-002-r1-independiente.html` (snapshot R2 anterior a las correcciones de publicación; se conserva como evidencia histórica) | 138.565 | `f0ba66c8709866c0dbc16f80bd7b09f724833f17f83b72a9b005dab182ee5f46` |

## Nota sobre la autorreferencia

Este manifiesto no puede contener su propio hash de manera autocontenida: un
archivo no puede contener su propio SHA-256. El hash de `hashes-r2.md` se
registra como evidencia externa en el informe de cierre de la misión y en un
commit posterior, tras la publicación.
