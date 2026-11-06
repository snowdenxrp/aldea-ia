# MISIÓN MUSE-AUTONOMY-002 — Manifiesto verificado de R1

**Fecha:** 2026-11-06. Todos los hashes de la sección 1 se calcularon sobre los bytes reales de los archivos locales (Línea A, `sha256sum` + `wc -c`). Ningún hash copiado de informes se aceptó como verificación independiente.

## 1. Archivos locales verificables — VERIFICADO (8/8, 0 discrepancias)

| Archivo | Ruta local | Tamaño (bytes) | SHA-256 calculado | Estado |
|---|---|---|---|---|
| `report.md` (informe consolidado R1) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/report.md` | 95.294 | `780c1acba72ed0f9dc99cf0bd8c81405629e01ad28c818c5bfe18b3308d967f1` | VERIFICADO |
| `hashes.md` (manifiesto) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/hashes.md` | 1.514 | `690a3a520a831d2ef06c8890acf21eda65e3c6fc2d91a26c6f2264175b399e4a` | VERIFICADO (sin ancla propia, ver O1) |
| `consolidation-method.md` (nota de método) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/notes/consolidation-method.md` | 2.209 | `ac1efe9f9e8d7a5224f6de8011bb3ce47540e8975f7d6574d14297abd2c9a679` | VERIFICADO |
| `expediente-consolidado-nexo.html` (HTML final exportado) | `workspace/your_files/expediente-consolidado-nexo/expediente-consolidado-nexo.html` | 147.680 | `56330207241d88d67bde723656175c6daa8757f943bf385705f1ffffc78cbd64` | VERIFICADO (solo copia local; no demuestra nada sobre la rama) |
| `expediente-consolidado-nexo.pdf` (PDF R1) | `workspace/your_files/expediente-consolidado-nexo/expediente-consolidado-nexo.pdf` | 141.597 | `6bab7c1692cb09d703c3f52c71bdc733c1ed6c7439e8c12f02d61071269c0a6d` | VERIFICADO (28 págs A4, 595,28×841,89 pt) |
| P1 `report.md` (M02) | `workspace/research_notes/nexo-mision-02-20261105-2109/report.md` | 55.646 | `8f75a49d3b196d961599a35c8d3bc97aa8cf6d11d0c4dfe6de2abec634d1f30c` | VERIFICADO |
| P3 `report.md` (M03) | `workspace/research_notes/nexo-mision-03-20261105-2217/report.md` | 45.283 | `ccd68c91ba3dd2ae95e2af9e059456bcd9e2451cc102db1927becebf576af675` | VERIFICADO |
| P5 `report.md` (M03-B) | `workspace/research_notes/nexo-mision-03b-20261105-1947/report.md` | 58.209 | `ec063ee5c7100ac109e2c3326c0a91342a813b92bd9f0aa1099be98448c32355` | VERIFICADO |

## 2. Archivos del repositorio — NO VERIFICABLE

Repositorio `snowdenxrp/aldea-ia`, rama `nexo-mission-02-pdf-2026-11-05`. Sin integración de GitHub (`not_connected`); no se intentó ningún acceso por ningún medio.

| Archivo en rama | Estado |
|---|---|
| `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/auditoria-consolidada-muse-m02-m03-m03b-r1-corregida.html` (documento objetivo) | **NO VERIFICABLE** — existencia, tamaño y hash desconocidos |
| `hashes.md` en la rama | **NO VERIFICABLE** — además, su ruta en la rama no está determinada: la ruta local (`research_notes/nexo-autonomy-001-20261105-2210/hashes.md`) no corresponde al árbol `NEXO_NCS/RESEARCH/...`; no hay evidencia de que el manifiesto exista en la rama ni de dónde residiría |
| Cualquier otro archivo de la rama | **NO VERIFICABLE** |

Distinción: "archivo publicado en rama" ≠ "copia local de trabajo". Todo lo verificado en §1 corresponde a copias locales; nada de ello demuestra nada sobre el contenido de la rama.

## 3. Archivos de artefacto — NO RE-VERIFICADO en esta auditoría

No se leyeron ni se calcularon hashes de archivos bajo `~/workspace/ts-spaces/` (fuera de alcance de lectura directa). Sus hashes se heredan de la consolidación.

| Parte | Archivo declarado en Anexo A | SHA-256 declarado | Estado |
|---|---|---|---|
| P2 | `ts-spaces/mision-02-nexo/index.html` | `e80623e0119ca23688a6f6317beabee2489055b2af8164738b45194c6299150b` | NO RE-VERIFICADO |
| P4 | `ts-spaces/mision-03-nexo/index.html` | `11b001215bbc3e7b2dca0d62994c32fb063951910945556ffcdedb842da63057` | NO RE-VERIFICADO |
| P6 | `ts-spaces/mision-03-b-nexo/index.html` | `e594bc288dda4c8312ffa29c3323991b90a00559eec7f5a48d73d7dfb71b771a` | NO RE-VERIFICADO |
| P7 | `ts-spaces/hoja-consolidada-de-erratas-nexo/index.html` | `5a6506ef1e6efca9840222130dd619a3a46157740188a376ed954006beb0c40a` | NO RE-VERIFICADO |
| P7 | `your_files/hoja-consolidada-de-erratas-nexo/hoja-consolidada-de-erratas-nexo.pdf` | `2a89284926d639073cbc916a66c5cadad3843348f45c18002666b144bf775ca3` | NO RE-VERIFICADO (no calculado en esta auditoría) |

## 4. Archivos generados por esta auditoría (MISIÓN MUSE-AUTONOMY-002)

| Archivo | Ruta | Tamaño (bytes) | SHA-256 | Estado |
|---|---|---|---|---|
| `audit-r1-independent.md` | `workspace/your_files/muse-autonomy-002/audit-r1-independent.md` | 23.857 | `0f9d37303a15865d1b035cea148210569cd96054a49ea0ac84862a94328a7028` | VERIFICADO — hash calculado tras la última edición, registrado abajo |
| `manifest-r1-verified.md` | `workspace/your_files/muse-autonomy-002/manifest-r1-verified.md` | — | — | Manifiesto; no puede contener su propio hash |
| `r2-change-report.md` | `workspace/your_files/muse-autonomy-002/r2-change-report.md` | 6.272 | `9ec420f532497eb4658ee1cb3ca628abc22408a62713c6ef21fda57b58f13707` | VERIFICADO — hash calculado tras la última edición, registrado abajo |

**Hashes de los archivos de esta auditoría (calculados sobre los archivos reales tras su última edición):**

- `audit-r1-independent.md`: `0f9d37303a15865d1b035cea148210569cd96054a49ea0ac84862a94328a7028`
- `r2-change-report.md`: `9ec420f532497eb4658ee1cb3ca628abc22408a62713c6ef21fda57b58f13707`

**Nota sobre la autorreferencia:** un archivo no puede contener su propio hash. El hash de `manifest-r1-verified.md` no figura en ningún documento de esta auditoría; su integridad descansa en que los hashes que contiene fueron calculados por la Línea A sobre los archivos reales y son reproducibles por cualquiera con acceso a las copias locales.
