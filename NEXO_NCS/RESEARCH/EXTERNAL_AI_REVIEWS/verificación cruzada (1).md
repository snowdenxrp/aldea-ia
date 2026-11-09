# MISIÓN MUSE-AUTONOMY-004-G — PASADA 4: VERIFICACIÓN CRUZADA ENTRE DOCUMENTOS (RECONCILIACIÓN COMPLETA)

**Misión:** MUSE-AUTONOMY-004-G — remediación adversarial, reconciliación y verificación final de R2.
**Pasada:** 4 — Reconciliación completa (verificación cruzada entre documentos).
**Fecha:** 2026-11-08.
**Alcance:** solo lectura. No se editó ningún archivo de revisión ni informe existente; no se publicó ni fusionó nada; no se declara PASS. Las contradicciones encontradas se registran aquí, no se corrigen.
**Dictamen de la pasada:** **3 contradicciones menores encontradas** (C-1, C-2, C-3); ninguna afecta a un estado epistemológico (U1–U9, C14, D-01–D-12, cierre PARTIAL). El cierre sustantivo sigue **PARTIAL**. Ningún UNKNOWN se convirtió en RESUELTO; ninguna propuesta se convirtió en decisión.

## 0. Documentos contrastados

| Sigla | Documento | Bytes | SHA-256 (medido por esta pasada con `sha256sum`) |
|---|---|---|---|
| IG | `review-g/report-r2-rectified-review-g.md` | 157.071 | `bd34107e71afa092d8e9fbb1523e7048dbca620f90fb228adb96b8393f9b4694` |
| CG | `review-g/closure-r2-rectified-review-g.md` | 48.472 | `cec384d74c8eb18f06d989f75b1a6e5bd20147fb4dbfce67da1ff62d5f182864` |
| HG | `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 193.805 | `9cdaa60b148860ceb0a84b8dbe007e57235767ed2ba8e603e08f4c949576f93f` |
| MG | `review-g/consolidation-method-rectified-review-g.md` | 13.351 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| ManG | `review-g/hashes-r2-rectification-review-g.md` | 7.152 | `aeb80880e942a2284973bce4ce9aa26a56270cf2258b5c52c6ce2ba1639b2e78` |
| ICG | `MUSE_004_G_CORRECTION_REPORT.md` (Pasadas 2 y 3) | 63.385 | `2d2243fed40e6a7ad5fb6e7d2139e73f9ad7b98c414ed93c3c95a074504ecd73` |
| DMG | `MUSE_004_G_DIAGNOSTIC_MATRIX.md` (Pasada 1) | 34.617 | `9721ec337c792f6d11562f3b5a70e48f475278aa1c6874739bba000381286adb` |
| FD02 | `../nexo-autonomy-004-f/MUSE_004_F_D02_GATE_DECISION.md` | 9.342 | `19a842f003764f0c44475c262d956f7961d1161f9f2edd6c72ed1bc6fd9ea2ef` |

Todos en `~/workspace/research_notes/nexo-autonomy-004-g/` salvo FD02 (en `nexo-autonomy-004-f/`).
Contexto consultado (solo lectura): `nexo-autonomy-004-f/review-f/` (bases F2), `nexo-autonomy-004-g/branch/` (copia de la rama), `nexo-autonomy-004/` (MUSE-004), clon local `/tmp/aldea-ia-004g`.

**Verificaciones de integridad realizadas por esta pasada (no copiadas de otros documentos):**
- `sha256sum` y `wc -c`/`wc -l` de los 5 archivos G, las 5 bases F2 y los 4 canónicos R2: todos coinciden con los valores declarados en ManG e ICG §6 (Pasada 3). Bases F2: informe `dacefd69…b6546` (147.584), cierre `80a82481…8023` (42.702), HTML `28e2b188…751f` (184.564), método `b8711617…5636` (12.800), manifiesto F2 `2f2e7da5…39a0` (5.248). Canónicos: report-r2 `e41c8f3b…80a` (113.706), closure-r2 `0d9ed5ff…0f` (21.346), hashes-r2 `cde302f0…ace4` (4.450), consolidation-method `7295fedb…24285` (9.720). Hashes de referencia MUSE-004 en ManG verificados contra `branch/`: informe `5dcf73ae…4692` (135.870), cierre `ff3c0d19…1100` (37.652), HTML `973c5807…37dbd5` (171.310), manifiesto `b0395ed5…abd5` (3.117).
- Diffs medidos f2 → g (comando `diff`): informe **14 eliminadas / 37 añadidas** (616 → 639 líneas), cierre **7 / 38** (301 → 332), HTML **24 / 38** (1.726 → 1.740), método **2 / 6** (83 → 87). Coinciden con ICG §4 (Pasada 3, acumulado).
- HEAD verificado por git en `/tmp/aldea-ia-004g`: `7870a6ab8bbdc2dcfcdec43e22f31bcff40d611b`, «Add files via upload», 2026-11-08 01:47:11 -0600. Coincide con DMG §1.1.
- `MUSE_004_G_A2A_EVIDENCE_REGISTER.md` **no existe** (verificado por `ls`): correcto según la tarea; no se exige como documento para reconciliar. Su contenido exigible se recoge en §6.
- La decisión D-02 (`MUSE_004_G_D02_DECISION_GATE.md`) **no existe aún**: correcto según la tarea; se reconcilió contra FD02 y contra MG.

**Leyenda de la matriz:** ✅ = COHERENTE (el documento afirma lo mismo / lo documenta igual) · ⚠️ = CONTRADICCIÓN (ver §4) · — = N/A (el documento no trata esa afirmación). Un ✅ con asterisco (*) remite a una nota al pie de la matriz.

## 1. Matriz documento × afirmación (36 afirmaciones críticas, 288 celdas)

| # | Afirmación crítica | IG | CG | HG | MG | ManG | ICG | DMG | FD02 | Evidencia / nota |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | U1 RESUELTO | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | IG L44/L57; CG L44/L323; MG L60; FD02 §2 fila 2 |
| 2 | U2 (U2-a/b/c) UNKNOWN | ✅ | ✅* | ✅ | ✅ | — | ✅ | ✅ | — | IG L385; CG L292/L323 (L255 es historia MUSE-003, ver OBS-6); MG L60 «U2 (U2-a/b/c)» |
| 3 | U3 UNKNOWN | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | CG L137 «U3 permanece UNKNOWN»; IG §3 L390 sin etiqueta en línea, estado fijado por resúmenes y cierre (ver OBS-7) |
| 4 | U4 RESUELTO | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | IG L391; MG L60; FD02 §2 fila 2 |
| 5 | U5 UNKNOWN | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | IG L44 y L483 «U5 permanece UNKNOWN»; CG L44 |
| 6 | U6 RESUELTO (acotado) | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | IG L393; MG L60; FD02 §2 fila 3 |
| 7 | U7 RESUELTO (acotado a SP 800-53 Rev. 5.1) | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | IG L394; MG L60; FD02 §2 fila 3 |
| 8 | U8 RESUELTO | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | IG L395; MG L60; FD02 no lo enumera (fila 3: U6/U7/U9) |
| 9 | U9 RESUELTO (acotado) | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | IG L396; MG L60; FD02 §2 fila 3 |
| 10 | C14 PARCIALMENTE CONFIRMADA | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | IG L23/L215 (partición EVIDENCE/CORROBORATED/INFERENCE, B-04); MG L54 |
| 11 | D-01 a D-12 SIN DECIDIR | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | IG 27 ocurrencias; HG 29; FD02 §1/§6 «no resuelve D-01 a D-12» |
| 12 | Cierre sustantivo PARTIAL; ningún PASS nuevo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | IG L44/L57; CG L42/L52/§(d); MG L54; ManG «No se declara PASS»; FD02 «no concede PASS» |
| 13 | A-01: recuentos del Addendum F acotados al texto anterior al addendum | ✅ | ✅ | ✅ | — | — | ✅ | — | — | CG L283–L287 + Addendum G L304–L332; recuentos re-verificados: pre-addendum (L1–L272) `vault` 0, `HSM` 0, `trust_remote_code` 0, `agent.json` 0, `heredado` 1 (L57) |
| 14 | A-02: C05/R1(a)/§12 A2A completados con §4.3/§4.5 y ubicaciones §7.3/§7.6; C01 §4.6 y R4 §4.5 como punteros históricos; D-01 anclado a v0.2.6 + commit 0858ddb, no re-abierto | ✅ | ✅* | ✅ | — | — | ✅ | — | — | IG L111/L143/L303/L306/L561; HG L315/L355/L650/L665/L1279; CG Addendum G: «No afecta al texto de este cierre salvo por la viñeta D-01»; A2A re-verificado en vivo por esta pasada (ver §2, comprobación 3) |
| 15 | A-03: «resúmenes independientes» retirado en C09, C12, §10 ítem 9 (×2 formatos) | ✅ | ✅* | ✅ | — | — | ✅ | — | — | IG L175/L199/L529; HG L395/L425/L1100; CG Addendum G: «este cierre no afirma independencia de resúmenes». Restos solo en citas de lo retirado o en la regla definitoria de §0 (IG L73, HG L283, CG L245) |
| 16 | C-01: Anexo A con artefactos G y hashes reales; fila de método añadida | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | IG Anexo A L597–L605 (cierre 48.472 `cec384d7…82864`, HTML 193.805 `9cdaa60b…93f`, método 13.351 `5356bd1c…3c9bf`, informe «ver manifiesto»); HG Anexo A 5 filas G, manifiesto G 7 ocurrencias, manifiesto F2 0, nombres MUSE-004 0 |
| 17 | B-01: etiqueta «EVIDENCE corroborado» retirada como texto vivo en §11 B14; vigente CORROBORATED | ✅ | — | ✅ | — | — | ✅ | — | — | IG L497; HG L1073; «EVIDENCE corroborado» 1 por formato, solo cita del registro F (IG L40, HG L210) |
| 18 | B-02: plural no verificado retirado en la celda HF §12 | ✅* | — | ✅* | — | — | ✅ | — | — | IG L566; HG L1319 («apoyo secundario … sin identificar en número»). Residuo documentado: el plural sobrevive en C09/C12/§10/fila SP 800-53/§12/R2c (ver OBS-1) |
| 19 | B-03: base de CORROBORATED de C16 precisada (M03 §5 sobre el conjunto, no por cifra) | ✅ | — | ✅ | — | — | ✅ | — | — | IG L233; HG L467; etiqueta sin cambio |
| 20 | B-04: encabezado C14 nombra el tercer componente (FIPS 186-5 §7, INFERENCE) | ✅ | — | ✅ | — | — | ✅ | — | — | IG L215; HG L445 |
| 21 | B-05: §12 alineada con §0 (vía del «cálculo reproducible») | ✅ | — | ✅ | ✅ | — | ✅ | — | — | IG L538; HG L1108; MG L54 ya seguía la versión de §0 |
| 22 | B-06: U2-a/b/c restituida en el resumen de estados del cierre | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | CG L292 + Addendum G L315/L323; IG L44/L57; MG L60 |
| 23 | B-07: salvedad §8.4 (F-E15, solo `latest`, no v1.0.1 ni instantánea) en D-02 del Addendum F | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | CG L288; IG L561; HG L1279; MG L68 |
| 24 | B-08: paréntesis «(Fase A, INC-01)» retirado tras «decisión del gate» | ✅ | — | ✅ | — | — | ✅ | — | — | IG L31; HG L202; 0 ocurrencias en `review-g/` |
| 25 | B-09: «15 líneas» no se repite en ninguna copia G; registro F = 12 líneas | ✅ | — | ✅ | — | — | ✅ | — | — | 0 ocurrencias de «15 líneas» en `review-g/`; registro F IG L33–L44 (12 líneas). El error vive solo en docs F (ver §4, nota) |
| 26 | D-02: alternativas A/B, decisión pendiente del propietario; canónico intacto | ✅ | ⚠️ | ✅ | ✅ | — | ✅ | ✅* | ✅ | IG L31; HG L202; MG banner + L85–L87; FD02 §3–§5/§7. C-3: CG L288 dice «B (copia f2 actualizada)» (ver §4). DMG inventaría el doc F D-02 (F6) y verifica canónicos 4/4 intactos |
| 27 | Integridad: ManG cubre los 4 archivos G con hashes reales (+ propio por evidencia externa) | ✅ | — | ✅ | — | ✅ | ✅ | — | — | ManG tabla G verificada por `sha256sum` por esta pasada; hash propio `aeb80880…` citado en ICG L347/L349; 0 restos de hashes Pasada 2 (`d5167fbc`, `881802cf`, `cabba5dd`) en `review-g/` |
| 28 | Diffs f2 → g y cifras de verificación del manifiesto | — | — | — | — | ⚠️ | ✅ | — | — | C-1: ManG L51/L53 (y «12 pasajes») desactualizados tras Pasada 3; real medido 14/37 informe, 24/38 HTML (ver §4). ICG §4 Pasada 3 correcto |
| 29 | HEAD 7870a6ab; 7 archivos F publicados, 6 solo locales | — | — | — | — | — | — | ✅ | — | DMG §1.1/§5/§6.1; HEAD re-verificado por git por esta pasada. ICG no trata la brecha de publicación |
| 30 | I-02 abierta: sustancia de C05 sin re-verificar contra el tag v1.0.1 | ✅ | — | ✅ | — | — | ✅ | — | ✅* | IG L143; HG L355; ICG §2.2/§9.2. FD02 registra la discrepancia de fecha v1.0.1 (26-vs-28) como no resuelta (§2.5/§6), distinta de I-02 |
| 31 | Salvedad §8.4 (F-E15) en todos los documentos que la citan | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅* | IG L561; CG L288; HG L1279; MG L68; FD02 §2 fila 5 la recoge con la discrepancia 26-vs-28 |
| 32 | Registro de evidencia A2A (pendiente, lo redacta el coordinador) | — | — | — | — | — | ✅ | — | — | No existe el archivo (verificado). La evidencia que debe contener está en ICG §2.2; contenido exigible en §6. (El doc F de evidencia D-01 es otro documento, no este registro) |
| 33 | v1.0.1: publicado 28-05-2026, release notes 26-05-2026; frontmatter aún dice 1.0.0 | ✅ | ✅ | ✅ | — | — | — | — | ✅ | IG L143/L524/L561–L563; CG L124/L126; HG L1095/L1276/L1290–L1295; FD02 §2.5/§6. ICG no contiene las fechas 26/28 (solo «tag v1.0.1» / I-02) |
| 34 | Copias de revisión no oficiales; no se publica ni fusiona nada | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | IG/HG/MG banners; CG Addendum G §(d); ManG «NO versión oficial»; DMG §9; FD02 §6/§7 |
| 35 | Registro F = 12 líneas (no 15) | ✅ | — | ✅ | — | — | ✅ | — | — | IG L33–L44; HG 0 ocurrencias de «15 líneas»; ICG §2 (Pasada 3) |
| 36 | Diff canónico → F2 (nota de método, alternativa B): 4 eliminadas / 6 añadidas | — | — | — | — | — | — | — | ⚠️ | C-2: FD02 §4 dice «6 eliminadas / 4 añadidas»; medido por esta pasada 4/6; informe de corrección F L142 dice 4/6 (ver §4) |

**Recuento de la matriz:** 36 afirmaciones × 8 documentos = **288 celdas**: **168 COHERENTE**, **3 CONTRADICCIÓN**, **117 N/A** (el documento no trata esa afirmación).

**Notas de la matriz:**
- (*) Fila 2, CG: la línea del Addendum MUSE-003 §(c) (CG L255) describe U2 sin la subdivisión; es historia de MUSE-003 y se deja intacta deliberadamente (ICG §2.1/§6); el resumen operativo es CG L292/L323, con U2-a/b/c. Ver OBS-6.
- (*) Filas 14/15, CG: el cierre documenta expresamente que A-02/A-03 no afectan a su texto (Addendum G), salvo la viñeta D-01/D-02 anotada. Eso es coherencia por registro explícito, no por ausencia.
- (*) Fila 18: la celda es coherente con lo que ICG ordena (ámbito acotado a la celda HF); el residuo plural en los demás pasajes está documentado en ICG §7.1 como decisión de gate. Ver OBS-1.
- (*) Fila 26, DMG: el diagnóstico inventaría el documento de gate F (F6) y verifica los canónicos intactos; no decide entre A y B (no le corresponde).
- (*) Filas 30/31, FD02: el documento F registra la discrepancia de fecha de v1.0.1 (26-vs-28) como no resuelta; la salvedad §8.4 (F-E15) la recoge en §2 fila 5.

## 2. Las 10 comprobaciones

### 1. Cifras idénticas en todos los documentos — **FALLO (menor; 2 contradicciones)**
Verificado por medición directa: tamaños y SHA-256 de los 5 archivos G, las 5 bases F2 y los 4 canónicos coinciden en IG, CG, HG, MG, ManG, ICG §6 (Pasada 3) y DMG. Diffs f2 → g medidos (14/37, 7/38, 24/38, 2/6) coinciden con ICG §4 (Pasada 3). Recuentos de marcas G reconciliados: ocurrencias de la subcadena «MUSE-004-G» — IG 18, HG 23, CG 8, MG 2 — menos las 6 marcas B añadidas en Pasada 3 dan 12/17/8/2, exactamente lo declarado en ICG §5 (Pasada 2). Estructura HTML: 17 secciones, 30 ocurrencias de ancla (17 destinos únicos, 0 sin destino), 0 IDs duplicados, bloque `<script>` completo con SHA-256 `ee5a2b2a9402c8dd…` (mismo que F2). Líneas A2A verificadas en vivo (ver comprobación 3). **Pero:**
- **C-1:** ManG L51/L53 (y el bullet «12 pasajes corregidos») conservan las cifras de diff de la Pasada 2 (informe 8/31, HTML 18/32) tras la Pasada 3 (real 14/37 y 24/38). Ver §4.
- **C-2:** FD02 §4 invierte las etiquetas del diff canónico → F2 del método (ver §4).

### 2. Estados epistemológicos consistentes — **PASS**
U1–U9, C14, D-01–D-12 y PARTIAL son idénticos en IG (L44/L57), CG (L44/L292/L323), HG (L214/L225), MG (L3/L54/L60) e ICG. El canónico `consolidation-method.md` conserva estados superados, pero esa divergencia es la propia D-02 y está documentada como tal en IG L31, HG L202, CG L288 y MG (alternativa B), no como un estado distinto afirmado por G. Residuos formales sin efecto: OBS-6 (CG L255 histórica) y OBS-7 (etiquetas en línea de U3/U5 en §3).

### 3. Referencias y versiones correctas — **PASS**
- A2A `latest`: re-verificado por esta pasada en la fuente oficial (`https://a2a-protocol.org/latest/specification/`, 5.887 líneas, crawl 2026-11-08 07:57 UTC): §1 L16, §4.3 «Push Notification Objects» L1415, §4.5 «Security Objects» L1667, §4.6 «Extensions» L1826, §7.3 «Client Authentication Process» L3251, §7.5 «Server Authorization Responsibilities» L3270, §7.6 «In-Task Authorization» L3283, §8.4 «Agent Card Signing» L3418; «Latest Released Version `1.0.0`» L4. Todas coinciden con ICG §2.2.
- A2A v0.2.6 (`https://a2a-protocol.org/v0.2.6/specification`, 3.564 líneas, mismo crawl): cabecera «Version: `dev`» L4; §3.3 L99 con la cita literal de identidad en capa HTTP (L109–110); §4.3 «Client/User Identity & Authentication Process» L124; §4.5 «In-Task Authentication (Secondary Credentials)» L147; §4.6 «Authorization» L161 («Authorization logic is implementation-specific» L164); §5.1 L178; §5.3 L196 con `/.well-known/agent.json` (L198–199). Todas coinciden con ICG §2.2.
- Limitación honesta de esta re-verificación: el navegador devolvió el mismo crawl de las 07:57 UTC que usó la Pasada 2, por lo que confirma las líneas citadas contra esa instantánea, no con una descarga fresca independiente.
- v1.0.1 (28-05-2026 / notas 26-05-2026 / frontmatter 1.0.0) y la discrepancia 26-vs-28 se declaran igual en IG, CG, HG y FD02 (ver matriz fila 33). NIST (SP 800-53 Rev. 5/5.1, SP 800-63B-4, IR 8547, FIPS 203/204/205, FIPS 186-5 §7), RFC (8259, 8785, 9162, 8615) y arXiv (Miller 2411.00640v1) mantienen versiones y etiquetas coherentes entre IG/HG/CG/MG; C14 conserva su partición por componente (B-04, IG L215).

### 4. Ninguna afirmación de resolución contradicha por otro documento — **PASS**
Ningún documento G afirma una resolución que otro niegue. Los PASS que aparecen son solo de integridad/publicación de bytes (CG L21–L24, L42, L221; alcance precisado en CG L288) o de verificación documental, nunca sustantivos. C-3 (fila 26) es una incoherencia de nombre de archivo, no de resolución.

### 5. Ninguna propuesta convertida accidentalmente en decisión — **PASS**
D-02 sigue pendiente en IG L31, CG L288, HG L202, MG (banner y L85–L87), ICG §9 y FD02 §7. D-01 no se re-abre (IG L53, HG L221, ICG §2.2). Las etiquetas PROPOSAL (cuarentena como fase de restauración, lista de controles de la cola, conversión en sandbox) se conservan en IG/HG. I-02 y ND-G1 siguen como decisiones de gate (ICG §9). La colisión de identificadores D-01/D-02 (defectos MUSE-004 vs. decisiones del propietario D-01/D-02) está desambiguada explícitamente en FD02 §1/§6 e ICG §9; ver OBS-8.

### 6. Ningún UNKNOWN convertido en RESUELTO — **PASS**
Búsqueda de patrones `U2/U3/U5 … RESUELTO` en IG/HG/MG/CG: todos los aciertos son falsos positivos de la frase resumen («U2, U3, U5 UNKNOWN; U1, U4, U6, U7, U8 y U9 RESUELTOS») o la frase explícita «U5 permanece UNKNOWN y U6 está RESUELTO» (IG L483, HG L1066). U2 global UNKNOWN (IG L385), U3 UNKNOWN (CG L137), U5 UNKNOWN (IG L44/L483). ICG lo declara en cada pasada y CG Addendum G §(d) lo reafirma.

### 7. Ninguna obligación nueva incorporada sin ratificación — **PASS**
Las únicas adiciones son marcas de rectificación, registros de rectificación, el Addendum G y las tablas del Anexo A; ninguna añade requisitos, decisiones ni criterios de cierre nuevos. MG L54: «Ninguna propuesta arquitectónica se convirtió en requisito normativo».

### 8. Ninguna afirmación de verificación sin evidencia asociada — **PASS**
Cada verificación G cita su evidencia: A-01 con recuentos re-verificados (CG L1–L272, re-medidos por esta pasada); A-02 con la tabla de evidencia ICG §2.2 (URLs, versiones, líneas, citas — re-verificadas en la comprobación 3); A-03 con la nota de limitación de §12 (IG L589); C-01 con hashes calculados por `sha256sum`; B-01–B-09 con ubicación por línea en ambos formatos. Pendiente declarado, no oculto: el registro de evidencia A2A no existe aún (ver §6) y la sustancia de C05 sigue sin re-verificarse contra el tag v1.0.1 (I-02, IG L143). Residuo heredado: la fecha 07-11-2026 del commit `96e227eb…` en MG L10/L60 carece de fuente verificable (menor M-3, FD02 §4); ver OBS-3.

### 9. Coherencia MD↔HTML — **PASS**
16 fragmentos de pasajes corregidos (C01, C05, C09, C12, R1(a), R4, §10 ítem 9, §12 A2A, B-01–B-05, B-08, C14, C16) presentes con el mismo texto visible en IG y HG. Comparación línea a línea de los 13 pares (IG L111/143/175/199/215/233/303/306/497/529/538/561/566 ↔ HG L315/355/395/425/445/467/650/665/1073/1100/1108/1279/1319): las únicas diferencias son artefactos de marcado ya documentados en F §3.9 e ICG §5 (`**` de negrita, `` ` `` de código, `*` de cursiva, `|` delimitador de tabla, espacios en bordes de `<code>`/`<em>`); en las filas §12 la celda HTML es el contenido de la celda MD sin las demás columnas, como corresponde. Registros G idénticos en sustancia (IG L46–L57 ↔ HG L216–L226); Anexo A con los mismos 5 artefactos G en ambos formatos. Estructura HG verificada por parseo (ver comprobación 1).

### 10. El manifiesto G cubre los archivos G finales con sus hashes reales — **PASS**
Verificado con `sha256sum` por esta pasada (no copiado de otros documentos): las 4 filas de ManG coinciden byte a byte con los archivos finales (IG 157.071 `bd34107e…4694`, CG 48.472 `cec384d7…82864`, HG 193.805 `9cdaa60b…93f`, MG 13.351 `5356bd1c…3c9bf`). El hash propio de ManG (7.152 bytes, `aeb80880…2e78`) no puede estar dentro del propio manifiesto y está registrado como evidencia externa en ICG L347/L349, como exige el método. Las filas de referencia (bases F2, MUSE-004, canónicos R2) también coinciden con los valores medidos. Un solo archivo HTML G; el duplicado accidental de la rama (171.310 bytes, `973c5807…37dbd5`, dos nombres) no se replica. Salvedad: las cifras de diff de ManG están desactualizadas (C-1); los hashes, que son la función del manifiesto, son correctos.

## 3. Método usado para buscar contradicciones

1. Medición independiente (no reutilización de cifras ajenas): `sha256sum`, `wc`, `diff` f2 → g y canónico → F2, `grep -c/-o` de todas las marcas, frases y hashes, y parseo HTML con Python (`html.parser` + regex: secciones, `id` duplicados, anclas `href="#…"`, hash del bloque `<script>` en sus dos extracciones).
2. Lectura dirigida por línea de todas las afirmaciones críticas en sus líneas citadas (IG, CG, HG, MG, ManG, ICG, DMG, FD02), con comparación normalizada MD↔HTML de los 13 pares de pasajes corregidos.
3. Re-verificación externa de A2A (`latest` y v0.2.6) por `browser.open`/`browser.find` contra la fuente oficial, con la limitación del crawl compartido declarada en la comprobación 3.
4. Verificación de HEAD por git en el clon local (`git rev-parse HEAD`).
5. Búsqueda de negaciones: «RESUELTO» junto a U2/U3/U5, «PASS» sustantivo, «SIN DECIDIR» ausente, «resúmenes independientes» como afirmación viva, «15 líneas», «(Fase A, INC-01)», «EVIDENCE corroborado» fuera de cita, hashes de Pasada 2, nombres MUSE-004 en el Anexo A de HG.

## 4. Contradicciones encontradas (3, todas menores; ninguna de estado)

### C-1 — El manifiesto G conserva cifras de diff de la Pasada 2 tras la Pasada 3 (ManG vs. ICG §4 y vs. medición)
- **ManG L51:** «Diff f2 → g (informe): 8 líneas eliminadas / 31 líneas añadidas (registro G, 13 líneas; tabla del Anexo A G, 10 líneas; 8 pasajes corregidos en su línea).»
- **ManG L53:** «Diff f2 → g (HTML): 18 líneas eliminadas / 32 líneas añadidas (título, masthead, TOC, registro G, 8 pasajes corregidos, Anexo A, pie).»
- **ManG, bullet «El HTML g se verificó…»:** «(12 pasajes corregidos presentes en ambos formatos…)».
- **Realidad medida por esta pasada:** informe **14 / 37**, HTML **24 / 38**; pasajes corregidos totales **18** (12 de Pasada 2 + 6 de Pasada 3). Coincide con ICG §4 (Pasada 3, acumulado) y §5 (Pasada 3).
- **Alcance:** las cifras de cierre (ManG L52: 7/38) y método (L54: 2/6) siguen vigentes porque la Pasada 3 no tocó esos archivos. El bullet de Pasada 3 añadido al final de ManG actualiza los hashes pero no las cifras de diff, por lo que la sección «Verificación» presenta como actuales cifras de la Pasada 2 sin fecharlas como tales. Los hashes del manifiesto (su función) son correctos; el error es de cifras de proceso, no de integridad.

### C-2 — El documento F de D-02 invierte las etiquetas del diff canónico → F2 del método (FD02 vs. informe de corrección F y vs. medición)
- **FD02 L53 (§4):** «Diff: 6 líneas eliminadas / 4 añadidas respecto al canónico (ver informe de corrección, `MUSE_004_F_CORRECTION_REPORT.md`).»
- **Fuente citada, informe de corrección F L142:** «canónico → f2 (nota de método, alternativa B) 4 eliminadas / 6 añadidas.»
- **Medido por esta pasada** (`diff branch/consolidation-method.md review-f/consolidation-method-rectified-review-f2.md`): 4 líneas `<` (eliminadas) y 6 líneas `>` (añadidas): banner (2 añadidas) + taxonomía, lista UNKNOWN, lecturas verbatim y extensión de supersesión (1 eliminada / 1 añadida cada una). La revisión adversarial F L238 («método 6 / 4») usa la convención añadidas/eliminadas de su propia frase («44 añadidas / 31 eliminadas») y coincide con lo medido.
- **Alcance:** inversión de etiquetas en una cifra de proceso del documento de gate; no afecta a A/B, a los estados ni a ningún hash. El documento de gate no es un documento G, pero la tarea ordenó reconciliar contra él y la contradicción es con su propia fuente citada.

### C-3 — El cierre G decide el gate entre A y «copia f2» cuando la copia vigente en G es la copia g (CG vs. MG / Addendum G)
- **CG L288 (viñeta D-02 del Addendum F, última frase):** «El gate debe decidir entre **A** (canónico intacto, con la divergencia documentada aquí) y **B** (copia f2 actualizada).»
- **Realidad en el dossier G:** la copia de la alternativa B es `consolidation-method-rectified-review-g.md` (MG, 13.351 bytes, `5356bd1c…3c9bf`); la copia f2 (`b8711617…5636`, 12.800 bytes) es la base, no la copia vigente en G.
- **Atenuante documentado (por eso es menor):** la misma viñeta lleva la marca G «en esta copia G el archivo es `consolidation-method-rectified-review-g.md`» y el Addendum G (CG, bullet C-01) dice expresamente: «La viñeta D-02 del Addendum F nombraba el archivo de método F2; en esta copia G el archivo es `consolidation-method-rectified-review-g.md`.» La corrección diseñada (ICG §2.4: solo añadir la marca) se aplicó; lo que queda es que la frase operativa final sigue nombrando la copia f2. Un lector que lea solo esa frase identificaría B con el archivo F2.

## 5. Residuos documentados y observaciones (no son contradicciones nuevas)

- **OBS-1 — Residuo B-02 (plural «resúmenes» fuera de la celda HF).** La corrección B-02 singularizó solo la celda HF (IG L566, HG L1319). El plural «resúmenes que citan la primaria» sobrevive en C09 (IG L175), C12 (L199), §10 ítem 9 (L529), fila §12 SP 800-53 (L570), párrafo definitorio de §12 (L538) y fila R2c (HG L1351), y en la cita histórica del registro F (IG L40, HG L210). La misma lógica (plural que afirma multiplicidad sin nombrar ni contar) les sería aplicable. ICG §3.2 y §7.1 lo documentan como ámbito acotado deliberado y residuo para el gate («decidir si la redacción singular-neutra se extiende… o se conserva la fórmula plural aprobada en A-03»). No es una contradicción oculta: está divulgado en el propio informe de corrección.
- **OBS-2 — CG L285 (M-03) conserva «Sin cambio de texto en el cierre».** Las otras cuatro viñetas del Addendum F usan la fórmula acotada «Sin cambio en el texto anterior a este addendum» (A-01). M-03 se dejó intacta deliberadamente (ICG §2.1/§6: no afirma ningún recuento; su corrección vivía en informe/HTML). En contexto el sentido sigue siendo verdadero (la corrección de M-03 no tocó el cierre), pero la fórmula difiere de sus viñetas vecinas.
- **OBS-3 — Residuo heredado M-3 (fecha del commit de publicación).** MG L10 y L60 afirman el commit `96e227eb06134037fa5e01fabc8cfba4c384f476` «(07-11-2026)». FD02 §4 registra esa fecha como sin fuente verificable en el workspace (menor M-3, pendiente). La copia G hereda la fecha de F2 sin cualificación nueva; el hash del commit sí está verificado (CG L11/L36, DMG). No es un error introducido por G.
- **OBS-4 — Valores de la Pasada 2 dentro de ICG.** ICG §2.4/§4/§8 (sección Pasada 2) citan el HTML G con 192.418 bytes / `881802cf…` y el manifiesto con 6.508 bytes / `cabba5dd…`. Son registros fechados del estado tras la Pasada 2, correctamente superados por ICG §6 (Pasada 3: 193.805 / `9cdaa60b…`, 7.152 / `aeb80880…`). No es contradicción, pero exige leer la sección de la pasada correcta; 0 restos de esos hashes quedan en `review-g/`.
- **OBS-5 — Discrepancia D-H1 (preexistente, ya documentada).** El handoff de la Pasada 4 de F declaró para `MUSE_004_F_ADVERSARIAL_REVIEW.md` 43.534 bytes / `74919cde…`; lo medido (DMG §8.1, re-medido por esta pasada) es 43.540 bytes / `3cfff0e478ec999a7565ffe58585eb131af7a0871d3a806be5fec438fd8dec38`, idéntico a la segunda lectura del manifiesto F. Causa no establecida; DMG la registra sin corregir el handoff ajeno. No afecta a ningún documento G.
- **OBS-6 — CG L255 (Addendum MUSE-003 §(c)) sin U2-a/b/c.** Línea histórica de MUSE-003, dejada intacta deliberadamente (ICG §2.1/§6, §3 Pasada 3). El resumen operativo vigente es CG L292/L323. Un lector del cierre sin el Addendum G vería dos resúmenes de estados distintos; la distinción histórica/operativa está documentada en ICG y en el propio Addendum G (L315).
- **OBS-7 — Etiquetas en línea de U3/U5 en §3 del informe.** IG L390 (U3) y L392 (U5) no llevan etiqueta de estado en línea (U2 sí: «U2 global UNKNOWN», L385; U4/U6/U7/U8/U9 sí llevan RESUELTO). Los estados de U3/U5 quedan fijados por los resúmenes (IG L44/L57), por CG L137 (U3) y L44, y por IG L483 (U5). Texto heredado, no cambio de G.
- **OBS-8 — Colisión de identificadores D-01/D-02.** «D-01» y «D-02» denotan a la vez (a) defectos MUSE-004 (D-01: re-anclaje A2A; D-02: nota de método fuera de alcance) y (b) decisiones del propietario D-01 (método de identidad DID) y D-02 (custodia/recuperación de la clave raíz). El dossier lo desambigua explícitamente donde importa (FD02 §1/§6: «no resuelve D-01 a D-12»; ICG §9: «Ninguna de estas decisiones es D-01 a D-12»), pero la colisión existe y un lector rápido puede confundir «D-02 pendiente de decisión del gate» con la decisión del propietario D-02.

## 6. Registro de evidencia A2A — contenido exigible (documento aún no redactado)

`MUSE_004_G_A2A_EVIDENCE_REGISTER.md` no existe; lo redacta el coordinador al final a partir de la evidencia A-02 de la Pasada 2 (ICG §2.2). Según ICG §2.2, debe contener, como mínimo:

1. **Spec `latest` (renderizada):** URL `https://a2a-protocol.org/latest/specification/`; «Latest Released Version `1.0.0`»; crawl 2026-11-08 07:57 UTC; 5.887 líneas. Secciones y líneas: §1 «Introduction» (L16; cita L18–20); §3.3 «Operation Semantics» (L811); §4.3 «Push Notification Objects» (L1415); §4.5 «Security Objects» (L1667); §4.6 «Extensions» (L1826); §5.1 «Functional Equivalence Requirements» (L2078); §5.3 «Method Mapping Reference» (L2098); §7 «Authentication and Authorization» (L3234); §7.3 «Client Authentication Process» (L3251; «Credential Acquisition (Out-of-Band)» L3255); §7.5 «Server Authorization Responsibilities» (L3270; «Authorization logic is implementation-specific» L3272); §7.6 «In-Task Authorization» (L3283); §8 «Agent Discovery: The Agent Card» (L3372); §8.1 (L3374); §8.2 (L3381); §8.4 «Agent Card Signing» (L3418; MAY L3420, SHOULD L3650). Cero ocurrencias en `latest` de la frase de §3.3 sobre identidad fuera de los payloads JSON-RPC.
2. **Instantánea v0.2.6 (renderizada):** URL `https://a2a-protocol.org/v0.2.6/specification`; cabecera «Version: `dev`» (L4); crawl 2026-11-08 07:57 UTC; 3.564 líneas. §3.3 «Streaming Transport (Server-Sent Events)» (L99; cita L109–110); §4.3 «Client/User Identity & Authentication Process» (L124; L129–130); §4.5 «In-Task Authentication (Secondary Credentials)» (L147); §4.6 «Authorization» (L161; L164); §5.1 «Purpose» (L178; L180); §5.3 «Recommended Location» (L196; `/.well-known/agent.json` L198–199).
3. **Estado abierto I-02:** la sustancia de C05 sigue sin re-verificarse contra el tag v1.0.1 con instantánea archivada; los punteros quedan como instantánea histórica 2026-11-05.
4. **Salvedad F-E15 (§8.4):** confirmación MAY/SHOULD solo en `latest`, no verificada contra el tag v1.0.1 ni archivada con instantánea.
5. **Anclaje D-01 (no re-abierto):** v0.2.6 + commit `0858ddb` (PR #841, cambio incompatible en la release 0.3.0, 2025-07-30); §6.1 R7 byte a byte intacto.
6. **Discrepancia de fecha v1.0.1:** publicado 28-05-2026, release notes 26-05-2026; frontmatter de la spec versionada aún dice 1.0.0 (no resuelta; deuda editorial upstream).

Las líneas de `latest` y v0.2.6 de los puntos 1–2 fueron re-verificadas por esta pasada (ver §2, comprobación 3); las citas de §5.1/§5.3/§7/§8.1/§8.2/§8.4-MAY/SHOULD y los conteos de líneas se toman de ICG §2.2 sin re-verificación independiente por esta pasada (el `browser.find` confirmó §4.3, §4.5, §4.6, §7.3, §7.5, §7.6, §8.4 y §1).

## 7. Veredicto de la pasada

- **Afirmaciones críticas en la matriz:** 36. **Celdas:** 288 — **168 coherentes**, **3 contradicciones** (C-1, C-2, C-3, todas menores y de proceso/nomenclatura), **117 N/A**.
- **Comprobaciones 1–10:** 1 FALLO (menor: C-1 y C-2, cifras); 2 PASS; 3 PASS; 4 PASS; 5 PASS; 6 PASS; 7 PASS; 8 PASS; 9 PASS; 10 PASS.
- **Contradicciones:** C-1 (ManG: diffs f2 → g de Pasada 2 desactualizados), C-2 (FD02 §4: diff canónico → F2 con etiquetas invertidas), C-3 (CG L288: alternativa B nombrada como «copia f2» en el dossier G, anotada pero no corregida en la frase operativa).
- **Estados preservados:** U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL; no se declara PASS.
- **Para el gate:** C-1 y C-3 se corrigen actualizando dos frases (ManG L51/L53 y CG L288, o una nota en el Addendum G que las cubra); C-2 pertenece al documento F de D-02 y solo puede corregirse allí o anotarse en el registro G. Residuo B-02 (OBS-1) y colisión D-01/D-02 (OBS-8) quedan para decisión del propietario. Nada de esto autoriza publicar, fusionar ni sustituir ningún documento.
