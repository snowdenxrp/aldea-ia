# MISIÓN MUSE-AUTONOMY-004-G — PASADA 1: MATRIZ DE DIAGNÓSTICO / RECONSTRUCCIÓN DEL ESTADO

**Misión:** MUSE-AUTONOMY-004-G — remediación adversarial, reconciliación y verificación final de R2.
**Pasada:** 1 — reconstrucción del estado (diagnóstico).
**Fecha de la pasada:** 2026-11-08, 01:58 CST (07:58 UTC).
**Estado de esta pasada:** trabajo documental, reproducible y sin inventar nada. No se publica, no se fusiona, no se modifica ningún archivo canónico ni original. **No se declara PASS.**

## 0. Resumen ejecutivo de la pasada

- **HEAD verificado por git: `7870a6ab8bbdc2dcfcdec43e22f31bcff40d611b`** — coincide con el HEAD reportado por el coordinador. Rama `nexo-mission-02-pdf-2026-11-05`, commit `Add files via upload`, 2026-11-08 01:47:11 -0600.
- **Archivos inventariados (primarios): 47** — 34 en la copia local de la rama (`branch/`) + 8 informes F locales + 5 copias F2 locales (`review-f/`). Además 13 archivos de referencia (MUSE-004 `branch/` + `review/`) y 5 copias auxiliares en `/tmp`, todas verificadas por hash.
- **Canónicos R2: 4/4 intactos**, hashes SHA-256 coinciden exactamente con los valores de referencia.
- **7 archivos F publicados: 7/7 verificados** byte-idénticos a las copias locales (SHA-256) y confirmados como blobs del árbol en HEAD.
- **Discrepancia de publicación de los 6 archivos F: CONFIRMADA** por esta pasada, por tres vías independientes (nombre, SHA-256 y `git diff` entre árboles). Los 6 existen solo en el espacio local; ninguno está en la rama en HEAD.
- **«Nueve archivos anunciados»: DETERMINADO.** La única enumeración literal de nueve en el registro es «Nueve entregables MUSE-004» (§1.1 de la matriz F). Los 9 están presentes en la rama en ambos HEAD (viejo y nuevo), sin brecha de publicación. La otra lectura (4 F2 + 5 informes) no corresponde a ninguna lista enumerada en el handoff F, que anuncia **13** entregables (8 + 5). La discrepancia de publicación se mide contra esos 13, no contra los nueve. Ver §6.
- **HTML duplicado: CONFIRMADO** — dos archivos de 171.310 bytes, mismo SHA-256, `cmp` IDENTICAL, mismo blob git, presentes en ambos HEAD.
- **Otra discrepancia encontrada:** la diferencia de árboles `e5d884a2 → 7870a6ab` es exactamente 7 adiciones, 0 modificaciones, 0 eliminaciones — lo que corrobora que la publicación del propietario añadió solo los 7 archivos F y no tocó ningún canónico ni ningún otro archivo. Además, esta pasada confirma de forma independiente la discrepancia D-H1 ya registrada por F (ver §7).

## 1. Snapshot de partida y método de verificación

### 1.1 HEAD verificado

| Campo | Valor verificado por esta pasada |
|---|---|
| Repositorio | `snowdenxrp/aldea-ia` (remoto declarado en el clon: `https://github.com/snowdenxrp/aldea-ia.git`; **no contactado** — ver §8) |
| Rama | `nexo-mission-02-pdf-2026-11-05` |
| HEAD (commit) | `7870a6ab8bbdc2dcfcdec43e22f31bcff40d611b` |
| Mensaje del commit | `Add files via upload` |
| Autor / fecha del commit | `snowdenxrp <kevintemix@gmail.com>` / 2026-11-08 01:47:11 -0600 |
| HEAD anterior (referencia) | `e5d884a291435697e8349c3fd908f882cdf01130` (existe como objeto en el clon; ver §1.3) |
| Método | `git rev-parse HEAD` en el clon local `/tmp/aldea-ia-004g` |

El HEAD verificado es **idéntico** al reportado por el coordinador (`7870a6ab8bbdc2dcfcdec43e22f31bcff40d611b`).

### 1.2 Qué es (y qué no es) la copia local `branch/`

- `~/workspace/research_notes/nexo-autonomy-004-g/branch/` **no es un clon git**: no contiene `.git` (`git rev-parse HEAD` allí devuelve `fatal: not a git repository`). Es una copia plana (solo nombres base, sin subdirectorios) de 34 archivos.
- Los 34 archivos corresponden, todos, a la ruta `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/` dentro del árbol de la rama. El árbol completo en HEAD tiene **2.485 archivos**; `branch/` contiene solo el subconjunto de 34 relevantes para Nexo. El resto del árbol (2.451 archivos: investigación NEXO_AB*, NEXO_NCS, NEXO_CONTINUITY, docs, src, etc.) **no** forma parte de esta pasada y **no** fue inventariado archivo por archivo.
- Verificación de correspondencia: para cada uno de los 34 archivos se calculó `git hash-object` (SHA-1 de blob) sobre la copia local y se comparó con el blob registrado en `git ls-tree -r HEAD` para su ruta en el árbol. Resultado: **34/34 MATCH, 0 diferencias** (ver §2, columna «Blob git»).
- Advertencia de método (registrada para no repetir el error): la primera comparación por nombre base falló para 8 archivos con caracteres no ASCII (acentos, guiones largos) porque `git ls-tree` cita esas rutas con escapes octales (`core.quotepath`). La comparación válida se hizo con `git -c core.quotepath=false ls-tree -r HEAD`. Los 8 archivos «ausentes» en el primer intento **sí** están en el árbol; la ausencia era un artefacto de citación, no una discrepancia real.

### 1.3 Árboles viejo y nuevo

| Dato | Valor |
|---|---|
| Archivos en el árbol de `e5d884a2` | 2.478 |
| Archivos en el árbol de `7870a6ab` | 2.485 |
| Diferencia (`git diff --name-status e5d884a2 7870a6ab`) | **7 adiciones (A), 0 modificaciones (M), 0 eliminaciones (D)** |
| Las 7 adiciones | `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/` + `Decisión de gate D-02.md`, `HTML rectificado F2.html`, `evidencia D-01.md`, `informe de corrección.md`, `matriz de diagnóstico.md`, `revisión adversarial.md`, `verificación cruzada.md` |

La diferencia de árboles corrobora que el avance de HEAD desde `e5d884a2` consiste exactamente en la publicación de los 7 archivos F, sin ningún otro cambio. La ascendencia (`merge-base --is-ancestor`) **no** pudo verificarse en este clon (ver §8): el clon es superficial (`is-shallow-repository=true`, `rev-list --count HEAD = 1`), por lo que la relación de parentesco entre ambos commits queda como **UNKNOWN** y la verificación se apoya en la comparación de árboles, no en la historia.

## 2. Inventario completo — copia local de la rama (`branch/`, 34 archivos)

Origen: **rama** (copia plana de `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/` en HEAD `7870a6ab`). Todos los hashes SHA-256 se calcularon sobre los bytes locales con `sha256sum`/Python `hashlib`; la columna «Blob git» es el SHA-1 de `git hash-object`, comparado con `git ls-tree -r HEAD` (34/34 MATCH).

| # | Archivo | Tamaño (bytes) | SHA-256 | Blob git | Función |
|---|---|---|---|---|---|
| 1 | `Cierre-rectificado.md` | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` | `266a03145842381675eb53b00489faab7d8c6b42` | Cierre rectificado MUSE-004 (copia de revisión; entregable MUSE-004 n.º 2 de §6) |
| 2 | `Decisión de gate D-02.md` | 9.342 | `19a842f003764f0c44475c262d956f7961d1161f9f2edd6c72ed1bc6fd9ea2ef` | `2141168a367e272d3f2756117da8f711328f240e` | Informe F: decisión de gate D-02 (Pasada 5 de F). **Publicado por el propietario en este HEAD** |
| 3 | `EXPEDIENTE CONSOLIDADO — NEXO (R2 RECTIFICADO, REVISIÓN).html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | `ee9dce3c8a7f24583acb49829e26ea7161664177` | HTML rectificado MUSE-004, segundo nombre. **Duplicado accidental** (ver §7) |
| 4 | `HANDOFF_MUSE_AUTONOMY_002_R2_RECOVERY_2026-11-07.md` | 6.403 | `6190c5a353c38c57f766a8d85613cff47311b8ba95fca65fc2688503b4985c83` | `ef5cf98bfe02063c1ead3b0f9c2e5972107c4379` | Handoff de recuperación R2 (MUSE-002) |
| 5 | `HTML rectificado F2.html` | 184.564 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` | `1158b001a5e7c9fa381a2e4997faaae607432e7e` | HTML rectificado F2 (copia de revisión F2). **Publicado por el propietario en este HEAD** |
| 6 | `Informe-de-diferencias.md` | 7.522 | `b5319bed7179a00aba7ee59beff2d251c14265cf94a57a2a9f64bdc443522da8` | `d7e5e4a0b11aa0e6e2524bebdfeecec94ba007e5` | Informe de diferencias MUSE-004 (entregable MUSE-004 n.º 6 de §6) |
| 7 | `Informe-rectificado.md` | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` | `7b46eb749394097bd5f1303110d6bb70e449e1db` | Informe rectificado MUSE-004 (copia de revisión; entregable MUSE-004 n.º 1 de §6) |
| 8 | `MISSION_02_NEXO_FUNDAMENTAL_ARCHITECTURE_2026-11-05.pdf` | 19.054.669 | `bdd8947f8da50bbd518ff1ca964a3a8aeccfbeb76f4e4382e38336843e07a49d` | `ff7570e8d3a37deeb18e65e6daebb9c10a93230f` | PDF original de la Misión 02 (arquitectura fundamental) |
| 9 | `MUSE_AUTONOMY_003_ADVERSARIAL_REPORT.md` | 38.343 | `15957b8f6621211d537134f2251d6d7148b7112ba024c32899b163cb2f8cd847` | `49ad9b3ac0baa51d41528d868c8b7ca7ab641b78` | Informe adversarial MUSE-003 |
| 10 | `MUSE_AUTONOMY_003_CLAIM_MATRIX.md` | 36.215 | `c5cf1ddda02555a5dc216c6914da02b60111f6680fd5f672c37fa75730717e7c` | `e55db6e8473197b3fddb3bbaea592b78701374d0` | Matriz de afirmaciones MUSE-003 |
| 11 | `MUSE_AUTONOMY_003_HANDOFF.md` | 9.829 | `e6a6bf46881b8ff7236c4b75c5d9fa404c575c852423ba6e115f7f4d5f13d5e6` | `18da204b851dd536ddb6584d99f1c57ca8933f39` | Handoff MUSE-003 |
| 12 | `MUSE_AUTONOMY_003_SOURCE_REGISTER.md` | 15.410 | `261fa190a6247da3f2087394c4391e9c542260e60f6695f9acd2b22d7c7d0bc5` | `4297e83decc0baaa3f78bfb61cb523eac52cd1a9` | Registro de fuentes MUSE-003 |
| 13 | `Manifiesto-SHA-256.md` | 3.117 | `b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5` | `3d87cee7e3efdbe3b6a45ac7a8789b50a094b81a` | Manifiesto SHA-256 de la rectificación MUSE-004 (entregable MUSE-004 n.º 5 de §6) |
| 14 | `Matriz-de-aplicación-R-01–R-10 _ A-01–A-04.md` | 6.109 | `16b0a71b9146ede245962c4c154e5b6a7840e98474372dd8c676a69a05235003` | `200ea2218570d2018e777e0a736964f5e512f1b9` | Matriz de aplicación R-01–R-10 / A-01–A-04, MUSE-004 (entregable MUSE-004 n.º 7 de §6) |
| 15 | `README.md` | 47 | `58478b7e9a464a3a405abfb2e3db118b6b799d7ce1b6096110ab4db7e0b6b9ed` | `71e4030fb378272570fbdc03ebbc1c998bb4007b` | Descripción de la carpeta («Carpeta para investigaciones externas de Nexo.») |
| 16 | `Resumen-ejecutivo-y-bloqueos.md` | 8.387 | `a3aa426b975c6f58097d7c3aeeb998734593352dce534e266aae3f12f8329783` | `ced1c80f0695375d615ae0315f26981ffee1c510` | Resumen ejecutivo y bloqueos MUSE-004 (entregable MUSE-004 n.º 9 de §6) |
| 17 | `Revisión-adversarial-propia.md` | 38.687 | `0c2d10b62f20dbc2ea74e5f0c789145efff55fc88d03bc22a50ba025b11f071c` | `783f92b805ea8038b7e7eafc7cd014dc10c06e4b` | Revisión adversarial propia MUSE-004 (entregable MUSE-004 n.º 8 de §6) |
| 18 | `audit-r1-criteria-matrix.md` | 6.272 | `9ec420f532497eb4658ee1cb3ca628abc22408a62713c6ef21fda57b58f13707` | `4a9b288d00b92f5e78f5afb7ac86659d953491a0` | Matriz de criterios de auditoría R1 (MUSE-002) |
| 19 | `audit-r1-independent.md` | 23.857 | `0f9d37303a15865d1b035cea148210569cd96054a49ea0ac84862a94328a7028` | `8ebf42efcc579c623b6b6a72c0071a0263776195` | Auditoría independiente R1 (MUSE-002) |
| 20 | `auditoria-consolidada-muse-m02-m03-m03b-r1-corregida.html` | 147.680 | `56330207241d88d67bde723656175c6daa8757f943bf385705f1ffffc78cbd64` | `0ef932b9e6a77d1f0e55b106951a06fb71dadb1e` | HTML consolidado M02–M03–M03-B, versión R1 corregida |
| 21 | `auditoria-consolidada-muse-m02-m03-m03b.html` | 135.043 | `5b49911346ff6c20e4a1842405424193ff6a1a58af20c64f8b79afef8c39c673` | `9b0bf27e82177a455316a8e3e2d0a632204e7ef5` | HTML consolidado M02–M03–M03-B (original) |
| 22 | `auditoria-muse-autonomy-002-r1-independiente.html` | 138.565 | `f0ba66c8709866c0dbc16f80bd7b09f724833f17f83b72a9b005dab182ee5f46` | `b9e41b1b5eb46b3afeb02b1fc1ec040da3dcf3ff` | HTML de la auditoría independiente R1 (MUSE-002) |
| 23 | `closure-r2.md` | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` | `38e3c8efe69998926066c868d1a1526845141cac` | **Canónico R2 n.º 2** (solo lectura) |
| 24 | `consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | `eb3e71edbc44bf5d159656744bcf87112710add6` | **Canónico R2 n.º 4** (método de consolidación; solo lectura) |
| 25 | `evidencia D-01.md` | 16.013 | `7d0e3432e65f8028af960d48fcd107fbb301c9af6e10f051fcda4e9b3a11418a` | `028ba63d779bd880b555da54e2ae0468457c9b54` | Informe F: evidencia de fuentes D-01. **Publicado por el propietario en este HEAD** |
| 26 | `expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | `ee9dce3c8a7f24583acb49829e26ea7161664177` | HTML rectificado MUSE-004, primer nombre. **Duplicado accidental** (ver §7) |
| 27 | `expediente-consolidado-nexo-r2.html` | 153.699 | `af343327e190a37fbc317774e4b3da77b84724ee73bff50eb6053b835b728e7b` | `54ee9ec35e8810809d6ca6eccdf797c055cb8a6b` | HTML canónico R2 (referencia; no forma parte de la tabla del manifiesto de rectificación) |
| 28 | `hashes-r2.md` | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | `b6522c3bec121949c1613d3ff80dc539edb483a5` | **Canónico R2 n.º 3** (solo lectura) |
| 29 | `informe de corrección.md` | 28.941 | `5ae354a2769ded9ac1abba92a15337a565d79f755e9f452a6566f1638ecea715` | `6f7cb8906b1ef27adbfaf07d629670e12f119387` | Informe F: informe de corrección (Pasada 2 de F). **Publicado por el propietario en este HEAD** |
| 30 | `manifest-r1-verified.md` | 5.765 | `4e7fe75dc7d986e2891ffdfd9cde88680ad9bcda2cae2b0f3c45fdc4cd62e655` | `cb4487dce16547ef2460b68ab941d4e46fe45a4c` | Manifiesto verificado R1 (MUSE-002) |
| 31 | `matriz de diagnóstico.md` | 73.539 | `4cdf640b56cefd4adbcf3c02154c1d9264bb6a0ea46f077a3c671734b30ea5b6` | `587f09010a7b15a113e7f3f1f5210837712abe76` | Informe F: matriz de diagnóstico (Pasada 1 de F). **Publicado por el propietario en este HEAD** |
| 32 | `report-r2.md` | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | `c7d5169e63dd0ad20731ac405633250f0fa753a4` | **Canónico R2 n.º 1** (solo lectura) |
| 33 | `revisión adversarial.md` | 43.540 | `3cfff0e478ec999a7565ffe58585eb131af7a0871d3a806be5fec438fd8dec38` | `b7716c1e798f66c47fd7c9662bf186f29d42c0af` | Informe F: revisión adversarial (Pasada 4 de F). **Publicado por el propietario en este HEAD** |
| 34 | `verificación cruzada.md` | 26.023 | `aa93b13ca2471363ab842ba1af9bfef508f95d480cbc8fe8f58382ab38b24a78` | `9a4986699b31f9f49ee3094fbe48271caf67ee22` | Informe F: verificación cruzada entre documentos (Pasada 3 de F). **Publicado por el propietario en este HEAD** |

Composición de los 34: 4 canónicos R2 + 1 HTML R2 canónico + 9 entregables MUSE-004 + 4 archivos MUSE-003 + 6 archivos R1 (MUSE-002) + 1 handoff de recuperación + 1 PDF de la Misión 02 + 1 README + 7 archivos F publicados = **34**. Ningún archivo de la lista comparte nombre con otro salvo los dos HTML duplicados (filas 3 y 26), que comparten también tamaño, SHA-256 y blob git.

## 3. Inventario — espacio local de Fase F (`nexo-autonomy-004-f/`, 13 archivos)

Origen: **local** (ninguno de estos 13 estaba en la rama antes de la publicación del propietario; 7 de ellos pasaron a estarlo — ver §5).

### 3.1 Informes F (8 archivos, raíz de `nexo-autonomy-004-f/`)

| # | Archivo (local) | Tamaño (bytes) | SHA-256 | Función |
|---|---|---|---|---|
| F1 | `MUSE_004_F_DIAGNOSTIC_MATRIX.md` | 73.539 | `4cdf640b56cefd4adbcf3c02154c1d9264bb6a0ea46f077a3c671734b30ea5b6` | Pasada 1 de F: matriz de diagnóstico (M-01–M-04, D-01, D-02; §1.1 «Nueve entregables MUSE-004») |
| F2 | `MUSE_004_F_D01_SOURCE_EVIDENCE.md` | 16.013 | `7d0e3432e65f8028af960d48fcd107fbb301c9af6e10f051fcda4e9b3a11418a` | Investigación D-01: evidencia de fuentes (`agent.json`, A2A) |
| F3 | `MUSE_004_F_CORRECTION_REPORT.md` | 28.941 | `5ae354a2769ded9ac1abba92a15337a565d79f755e9f452a6566f1638ecea715` | Pasada 2 de F: informe de corrección |
| F4 | `MUSE_004_F_CROSS_DOCUMENT_VERIFICATION.md` | 26.023 | `aa93b13ca2471363ab842ba1af9bfef508f95d480cbc8fe8f58382ab38b24a78` | Pasada 3 de F: verificación cruzada entre documentos |
| F5 | `MUSE_004_F_ADVERSARIAL_REVIEW.md` | 43.540 | `3cfff0e478ec999a7565ffe58585eb131af7a0871d3a806be5fec438fd8dec38` | Pasada 4 de F: revisión adversarial (A-01–A-03, B-01–B-09) |
| F6 | `MUSE_004_F_D02_GATE_DECISION.md` | 9.342 | `19a842f003764f0c44475c262d956f7961d1161f9f2edd6c72ed1bc6fd9ea2ef` | Pasada 5 de F: decisión de gate D-02 (alternativas A/B) |
| F7 | `MUSE_004_F_SHA256_MANIFEST.md` | 7.082 | `7eda960dc4ad421d11e3dd96e5c2fd309483ef5f2c2aa8d6e4514ececa98ce18` | Pasada 5 de F: manifiesto SHA-256 (segunda lectura independiente) |
| F8 | `MUSE_004_F_HANDOFF.md` | 14.430 | `f4c6e2c10e36c4751a0959e05af846afa1e68d916ad96e3dccb7e8a99c5bcbc8` | Pasada 5 de F: handoff de cierre (dictamen PARCIAL; §7 lista los entregables) |

### 3.2 Copias de revisión F2 (5 archivos, `review-f/`)

| # | Archivo (local) | Tamaño (bytes) | SHA-256 | Función |
|---|---|---|---|---|
| R1 | `report-r2-rectified-review-f2.md` | 147.584 | `dacefd69a40ed28d924e2dee1faceca5ef85230182c829dcae84fff6634b6546` | Informe rectificado, copia de revisión F2 |
| R2 | `closure-r2-rectified-review-f2.md` | 42.702 | `80a82481f12def6bf09034e47edbabdd447528da382848eb2d6124473ba68023` | Cierre rectificado, copia de revisión F2 |
| R3 | `expediente-consolidado-nexo-r2-rectified-review-f2.html` | 184.564 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` | HTML rectificado, copia de revisión F2 (única copia F2 publicada, con otro nombre) |
| R4 | `consolidation-method-rectified-review-f2.md` | 12.800 | `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636` | Método de consolidación, copia de revisión F2 (alternativa B de D-02) |
| R5 | `hashes-r2-rectification-review-f2.md` | 5.248 | `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0` | Manifiesto SHA-256 de las copias F2 (no puede contener su propio hash) |

### 3.3 Referencia adicional verificada (no forma parte del inventario primario)

- `nexo-autonomy-004/branch/` (9 archivos): los 4 canónicos R2 (hashes idénticos a §2) + 4 archivos MUSE-003 (hashes idénticos a §2) + el paquete aprobado `MUSE_AUTONOMY_003_R2_RECTIFICATION_PACKET_DRAFT.md` (17.323 bytes, SHA-256 `2fd815b055e670455b6aaaf1cb2dab0d8328c906b50c1e1f3d24a0bcb8f18da3`).
- `nexo-autonomy-004/review/` (4 archivos): `report-r2-rectified-review.md` (135.870, `5dcf73ae…`), `closure-r2-rectified-review.md` (37.652, `ff3c0d19…`), `expediente-consolidado-nexo-r2-rectified-review.html` (171.310, `973c5807…`), `hashes-r2-rectification-review.md` (3.117, `b0395ed5…`) — byte-idénticos a sus homólogos de `branch/`.
- `/tmp/` (5 copias auxiliares, fechadas 2026-11-08 07:55 UTC): `report-f2.md`, `closure-f2.md`, `method-f2.md`, `hashes-f2.md`, `html-f2.html` — SHA-256 idénticos a R1–R5 de §3.2 respectivamente. Son copias de trabajo del mismo contenido, no entregables adicionales; no alteran ningún conteo.

## 4. Verificación de los cuatro canónicos R2

Solo lectura; ningún archivo fue modificado por esta pasada (ni por la publicación del propietario, ver §1.3). Verificación cruzada por dos vías: `sha256sum` directo sobre `branch/` y comparación con los valores de referencia y con `hashes-r2.md`.

| Canónico | Tamaño (bytes) | SHA-256 medido por esta pasada | Referencia | Resultado |
|---|---|---|---|---|
| `report-r2.md` | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | `e41c8f3b…` | **COINCIDE** |
| `closure-r2.md` | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` | `0d9ed5ff…` | **COINCIDE** |
| `hashes-r2.md` | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | `cde302f0…` | **COINCIDE** |
| `consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | `7295fedb…` | **COINCIDE** |

Los cuatro coinciden además con los valores registrados en el manifiesto F (§3.2 de `MUSE_004_F_SHA256_MANIFEST.md`) y con las copias de `nexo-autonomy-004/branch/`. Referencia adicional: `expediente-consolidado-nexo-r2.html` (HTML R2 canónico, 153.699 bytes, SHA-256 `af343327e190a37fbc317774e4b3da77b84724ee73bff50eb6053b835b728e7b`) coincide con el valor del manifiesto F.

## 5. Verificación de los 7 archivos F publicados

El propietario publicó 7 archivos F en la rama, con nombres de visualización en español distintos de los nombres locales. Verificación por esta pasada: (a) SHA-256 local vs. SHA-256 en rama: idénticos; (b) blob git en el árbol de HEAD: coincide con `git hash-object` de la copia local; (c) `git diff e5d884a2 → 7870a6ab`: los 7 aparecen como adiciones (A), sin modificaciones.

| # | Nombre en la rama | Nombre local de origen | Tamaño (bytes) | SHA-256 (ambos lados, idéntico) | Blob git en HEAD |
|---|---|---|---|---|---|
| 1 | `Decisión de gate D-02.md` | `MUSE_004_F_D02_GATE_DECISION.md` | 9.342 | `19a842f003764f0c44475c262d956f7961d1161f9f2edd6c72ed1bc6fd9ea2ef` | `2141168a367e272d3f2756117da8f711328f240e` |
| 2 | `HTML rectificado F2.html` | `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html` | 184.564 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` | `1158b001a5e7c9fa381a2e4997faaae607432e7e` |
| 3 | `evidencia D-01.md` | `MUSE_004_F_D01_SOURCE_EVIDENCE.md` | 16.013 | `7d0e3432e65f8028af960d48fcd107fbb301c9af6e10f051fcda4e9b3a11418a` | `028ba63d779bd880b555da54e2ae0468457c9b54` |
| 4 | `informe de corrección.md` | `MUSE_004_F_CORRECTION_REPORT.md` | 28.941 | `5ae354a2769ded9ac1abba92a15337a565d79f755e9f452a6566f1638ecea715` | `6f7cb8906b1ef27adbfaf07d629670e12f119387` |
| 5 | `matriz de diagnóstico.md` | `MUSE_004_F_DIAGNOSTIC_MATRIX.md` | 73.539 | `4cdf640b56cefd4adbcf3c02154c1d9264bb6a0ea46f077a3c671734b30ea5b6` | `587f09010a7b15a113e7f3f1f5210837712abe76` |
| 6 | `revisión adversarial.md` | `MUSE_004_F_ADVERSARIAL_REVIEW.md` | 43.540 | `3cfff0e478ec999a7565ffe58585eb131af7a0871d3a806be5fec438fd8dec38` | `b7716c1e798f66c47fd7c9662bf186f29d42c0af` |
| 7 | `verificación cruzada.md` | `MUSE_004_F_CROSS_DOCUMENT_VERIFICATION.md` | 26.023 | `aa93b13ca2471363ab842ba1af9bfef508f95d480cbc8fe8f58382ab38b24a78` | `9a4986699b31f9f49ee3094fbe48271caf67ee22` |

Resultado: **7/7 publicados y byte-idénticos**. Ninguno de los 7 sufrió cambio de contenido al publicarse (mismo SHA-256 en local y en rama; solo cambió el nombre de archivo en el caso del HTML F2 y en los 6 informes, que pasaron de nombres técnicos `MUSE_004_F_*` a nombres descriptivos en español).

## 6. Discrepancia de publicación: anunciados vs. realmente publicados

### 6.1 La discrepancia de los 6 archivos F — CONFIRMADA

Los siguientes 6 archivos existen **solo** en el espacio local y **no** están en la rama en HEAD `7870a6ab`. Verificado por esta pasada por tres vías: (1) el nombre no aparece en `branch/` (34 archivos) ni en `git ls-tree -r HEAD` (2.485 entradas); (2) el SHA-256 no aparece entre los hashes de ningún archivo de la rama; (3) `git diff e5d884a2 → 7870a6ab` no los incluye (la diferencia son solo las 7 adiciones de §5).

| # | Archivo (solo local) | Tamaño (bytes) | SHA-256 | Estado en rama |
|---|---|---|---|---|
| 1 | `review-f/report-r2-rectified-review-f2.md` | 147.584 | `dacefd69a40ed28d924e2dee1faceca5ef85230182c829dcae84fff6634b6546` | AUSENTE |
| 2 | `review-f/closure-r2-rectified-review-f2.md` | 42.702 | `80a82481f12def6bf09034e47edbabdd447528da382848eb2d6124473ba68023` | AUSENTE |
| 3 | `review-f/consolidation-method-rectified-review-f2.md` | 12.800 | `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636` | AUSENTE |
| 4 | `review-f/hashes-r2-rectification-review-f2.md` | 5.248 | `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0` | AUSENTE |
| 5 | `MUSE_004_F_HANDOFF.md` | 14.430 | `f4c6e2c10e36c4751a0959e05af846afa1e68d916ad96e3dccb7e8a99c5bcbc8` | AUSENTE |
| 6 | `MUSE_004_F_SHA256_MANIFEST.md` | 7.082 | `7eda960dc4ad421d11e3dd96e5c2fd309483ef5f2c2aa8d6e4514ececa98ce18` | AUSENTE |

Tamaños y hashes coinciden exactamente con los valores declarados en el handoff F (§7) y en el manifiesto F (§1–§2). La discrepancia de 6 archivos queda **confirmada sin corrección**: 13 entregables F en total (8 informes + 5 copias F2), 7 publicados, 6 solo locales.

Consecuencia documental: la rama en HEAD contiene solo **1 de las 5** copias de revisión F2 (el HTML, fila 2 de §5). Las otras 4 copias F2 — informe, cierre, método y manifiesto F2 — no están publicadas, por lo que **el paquete de revisión F2 no está completo en la rama**: falta el informe rectificado F2 (147.584 bytes), el cierre rectificado F2 (42.702 bytes), la alternativa B de D-02 (método F2, 12.800 bytes) y el manifiesto que los amarra (5.248 bytes). Tampoco están publicados el handoff ni el manifiesto de la propia misión F.

### 6.2 Determinación de «los nueve archivos anunciados»

La misión habla de «los nueve archivos anunciados». Esta pasada determina a qué nueve se refiere, con la evidencia textual en la mano:

**Lectura 1 — la única enumeración literal de nueve en el registro (ADOPTADA).**
«Nueve entregables MUSE-004», §1.1 de `MUSE_004_F_DIAGNOSTIC_MATRIX.md` (Pasada 1 de F):

| # | Archivo | Tamaño | SHA-256 (F §1.1) | En rama (HEAD) |
|---|---|---|---|---|
| 1 | `Informe-rectificado.md` | 135.870 | `5dcf73ae…276f4692` | SÍ, idéntico |
| 2 | `Cierre-rectificado.md` | 37.652 | `ff3c0d19…fb1100` | SÍ, idéntico |
| 3 | `expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807…37dbd5` | SÍ, idéntico |
| 4 | `EXPEDIENTE CONSOLIDADO — NEXO (R2 RECTIFICADO, REVISIÓN).html` | 171.310 | `973c5807…37dbd5` | SÍ, idéntico (duplicado, §7) |
| 5 | `Manifiesto-SHA-256.md` | 3.117 | `b0395ed5…01abd5` | SÍ, idéntico |
| 6 | `Informe-de-diferencias.md` | 7.522 | `b5319bed…522da8` | SÍ, idéntico |
| 7 | `Matriz-de-aplicación-R-01–R-10 _ A-01–A-04.md` | 6.109 | `16b0a71b…35003` | SÍ, idéntico |
| 8 | `Revisión-adversarial-propia.md` | 38.687 | `0c2d10b6…071c` | SÍ, idéntico |
| 9 | `Resumen-ejecutivo-y-bloqueos.md` | 8.387 | `a3aa426b…9783` | SÍ, idéntico |

Los 9 están presentes en la rama **en ambos HEAD**: esta pasada verificó que los 9 existen también en el árbol de `e5d884a2` (no son publicaciones nuevas de este HEAD; ya estaban antes de F). Por tanto, si «los nueve» son estos, **no hay brecha de publicación para ellos (9/9 presentes)** — pero tampoco son entregables de F: son los entregables de MUSE-004, anteriores a F. Medir la publicación de F contra estos nueve **ocultaría** la discrepancia real de §6.1.

**Lectura 2 — «4 documentos de revisión F2 + 5 informes» (NO SUSTENTADA por ningún documento).**
Ningún documento del workspace enumera un conjunto de exactamente 4 F2 + 5 informes. El handoff F (§7, `MUSE_004_F_HANDOFF.md`) anuncia **13** entregables, no 9: 8 informes F (tabla 1, incluido el propio handoff sin hash) + 5 copias F2 (tabla 2). El manifiesto F (§1–§2) confirma el mismo total de 13. La lectura 2 solo puede reconstruirse como hipótesis: 4 F2 (informe, cierre, HTML y método — excluyendo el manifiesto F2 por ser manifiesto y no documento de revisión) + 5 informes (diagnóstico, D-01, corrección, verificación cruzada y revisión adversarial — excluyendo la decisión D-02, el handoff y el manifiesto F). Bajo esa hipótesis, publicados serían 6/9 (los 5 informes + el HTML F2) y faltarían 3/9 (informe, cierre y método F2). Esta pasada **no adopta** esta lectura como determinación porque no tiene fuente: ningún informe la enuncia. Se registra únicamente como aritmética alternativa, para que el gate decida si esa era la intención de la misión.

**Determinación de esta pasada:** «los nueve archivos» se refieren a los **Nueve entregables MUSE-004 de F §1.1** (Lectura 1), por ser la única enumeración de nueve que existe en el registro verificable. La discrepancia de publicación de F debe medirse contra los **13 entregables anunciados en el handoff F**: 7 publicados / 6 ausentes (§6.1). Cualquier lectura que reduzca el anuncio a 9 debe justificarse con una fuente que esta pasada no encontró; si el gate sostiene la Lectura 2, la brecha sería de 3 archivos F2 dentro de esos 9, más 3 archivos fuera de los 9 (manifiesto F2, handoff F, manifiesto F) igualmente no publicados.

### 6.3 Resumen numérico de la publicación

| Conjunto | Anunciados | Publicados en HEAD | Solo locales | Brecha |
|---|---|---|---|---|
| Entregables F (handoff F §7: 8 informes + 5 F2) | 13 | 7 | 6 | **6** |
| Nueve entregables MUSE-004 (F §1.1) | 9 | 9 | 0 | 0 (preexistentes, no son de F) |
| Copias de revisión F2 (`review-f/`) | 5 | 1 (solo el HTML) | 4 | **4** |
| Informes F (raíz de `nexo-autonomy-004-f/`) | 8 | 6 | 2 (handoff y manifiesto) | **2** |
| Lectura 2 hipotética (4 F2 + 5 informes) | 9 | 6 | 3 | 3 (hipótesis no sustentada; ver §6.2) |

## 7. El HTML duplicado accidental — evidencia

| Dato | Valor |
|---|---|
| Archivo A | `EXPEDIENTE CONSOLIDADO — NEXO (R2 RECTIFICADO, REVISIÓN).html` — 171.310 bytes |
| Archivo B | `expediente-consolidado-nexo-r2-rectified-review.html` — 171.310 bytes |
| SHA-256 (ambos) | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` |
| Blob git (ambos) | `ee9dce3c8a7f24583acb49829e26ea7161664177` (mismo blob en el árbol de HEAD) |
| `cmp` entre ambos | **IDENTICAL** (verificado por esta pasada) |
| Presencia en `e5d884a2` | Ambos archivos ya estaban en el árbol viejo (no es un duplicado introducido por la publicación F) |
| Presencia en `nexo-autonomy-004/review/` | Solo existe el archivo B (un solo nombre); el duplicado no se replica allí |
| Registro previo | Manifiesto F §3.1 y handoff F §3 ya lo registraban como «duplicación accidental confirmada»; esta pasada lo **reconfirma de forma independiente** |

El duplicado sigue presente en la rama en HEAD y cuenta como **2 de los 9** entregables de F §1.1 (filas 3 y 4) pese a ser un solo contenido. La copia F2 (`HTML rectificado F2.html`, 184.564 bytes, SHA-256 `28e2b188…`) usa un solo nombre y no replica el duplicado.

## 8. Otras discrepancias y hallazgos de esta pasada

1. **D-H1 (discrepancia de hash de la revisión adversarial F) — confirmada de forma independiente.** El handoff de la Pasada 4 de F declaró para `MUSE_004_F_ADVERSARIAL_REVIEW.md` 43.534 bytes y SHA-256 `74919cde105219aa6bc54900edb94e44c1bb32e34fb02d639203169c10b41252`. Esta pasada mide **43.540 bytes** y SHA-256 **`3cfff0e478ec999a7565ffe58585eb131af7a0871d3a806be5fec438fd8dec38`**, idénticos a la segunda lectura del manifiesto F. El valor autoritativo sigue siendo el medido en la segunda lectura; la causa de la discrepancia original sigue **no establecida** (el manifiesto F la registra sin corregir silenciosamente el handoff ajeno; esta pasada hace lo mismo).
2. **La publicación no modificó nada más.** `git diff e5d884a2 → 7870a6ab`: 7 adiciones, 0 modificaciones, 0 eliminaciones (árbol 2.478 → 2.485 archivos). Ningún canónico, ningún entregable MUSE-004 y ningún archivo preexistente cambió de contenido en este HEAD.
3. **Correspondencia de nombres.** Los 7 archivos F publicados usan nombres de visualización distintos de los locales (tabla de §5). El mapeo se verificó por contenido (SHA-256 + blob), no por nombre. El HTML F2 se publicó como `HTML rectificado F2.html` y no bajo su nombre técnico `expediente-consolidado-nexo-r2-rectified-review-f2.html`; una búsqueda por nombre técnico en el árbol da 0 resultados, lo que no debe interpretarse como ausencia del contenido.
4. **`/tmp/aldea-ia-004g` es un clon parcial y superficial.** `remote: origin https://github.com/snowdenxrp/aldea-ia.git (fetch) [blob:none]`; `is-shallow-repository=true`; `rev-list --count HEAD = 1`; el commit padre registrado en el objeto HEAD (`d07ecce0…`) no se resolvió en la historia local y `merge-base --is-ancestor e5d884a2 HEAD` no se pudo establecer. Consecuencia: la ascendencia entre `e5d884a2` y `7870a6ab` es **UNKNOWN** en este clon; lo verificado es la diferencia de árboles (§1.3), no la cadena de parentesco.

## 9. Limitaciones de verificación

- **Sin acceso en vivo a GitHub.** La integración de GitHub de Snow está NOT_CONNECTED (según el contexto de la misión). No se hizo `fetch`, `push` ni ninguna operación remota; el remoto `origin` del clon no fue contactado. Todo lo verificado sobre la rama proviene del clon local `/tmp/aldea-ia-004g` (HEAD `7870a6ab`) y de la copia plana `branch/` (34 archivos). Si el remoto avanzó después de este clon, esta pasada no lo vería.
- **Clon superficial y parcial (`blob:none`).** La historia completa no está disponible localmente; la ascendencia `e5d884a2 → 7870a6ab` es UNKNOWN (ver §8.4). La comparación de blobs se hizo con `git hash-object` (cálculo local) contra `git ls-tree` (objetos de árbol presentes); no se descargó ningún blob.
- **Alcance del inventario.** El inventario exhaustivo cubre los 34 archivos de `branch/`, los 13 archivos del espacio F y los archivos de referencia de §3.3. El resto del árbol de la rama (2.451 archivos fuera de `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`) **no** fue inventariado archivo por archivo; solo se verificó su conteo total (2.485 en HEAD, 2.478 en el HEAD anterior) y la diferencia de árboles.
- **Archivos clasificados UNKNOWN: ninguno.** Todos los archivos citados en esta pasada fueron verificados por bytes (tamaño + SHA-256, y blob git para los 34 de `branch/`). No se sustituyó evidencia ausente con resúmenes: lo que no se pudo verificar (ascendencia, estado remoto en vivo) se declara UNKNOWN o NO VERIFICABLE en lugar de afirmarse.
- **No se modificó ningún archivo existente.** Esta pasada solo creó este informe. Los canónicos R2, los originales MUSE-004 y los archivos F permanecen intactos; sus hashes medidos aquí coinciden con los valores previamente registrados.

## 10. Estado para las pasadas siguientes (G)

- Punto de partida verificado: HEAD `7870a6ab`, 34/34 archivos de `branch/` con blob confirmado en el árbol, canónicos 4/4 intactos, 7/7 archivos F publicados byte-idénticos.
- Brechas que las pasadas de corrección deberán tratar (no resueltas por esta pasada, que solo diagnostica): los 6 archivos F ausentes en la rama (§6.1), con prioridad para las 4 copias F2; el HTML duplicado (§7); y la determinación del gate sobre la Lectura 2 de §6.2, si la misión la sostenía.
- D-01 a D-12 siguen SIN DECIDIR; U2/U3/U5 UNKNOWN; C14 PARCIALMENTE CONFIRMADA; cierre sustantivo PARTIAL. Nada de esto cambia por esta pasada.
- **No se declara PASS.** Esta pasada es diagnóstico; el veredicto global corresponde al cierre de la misión G.
