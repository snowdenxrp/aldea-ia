# MUSE_004_H — RECONCILIACIÓN (MISIÓN MUSE-AUTONOMY-004-H)

**Fecha de la medición:** 2026-11-09.
**Alcance:** solo la ronda final H-01–H-04 (2026-11-09) de MUSE-AUTONOMY-004-G, sobre los
archivos locales finales. No se re-auditan M02/M03/M03-B, C01–C16, A-01/A-02/A-03/C-01,
B-01–B-09 ni los 7 defectos de Pasada 5, salvo comprobar que la ronda H no los rompió.
No se decide D-02. No se resuelven I-02, M-3 ni la discrepancia de fecha v1.0.1.
No se verifica GitHub ni la publicación (fuera de alcance).

**Declaración de posición:** esta reconciliación se hizo con contexto compartido con el
equipo que produjo las copias G. **No soy un revisor externo independiente.** Las
mediciones son re-mediciones con herramientas (`diff`, `grep`, `sha256sum`, script de
anclas), no afirmaciones heredadas; cada valor citado abajo fue medido en esta misión.

**Hecho registrado (fuera de alcance):** el HEAD de la rama avanzó durante la misión de
`eb6ff90d` a `f2b7edfe` (Kevin subió algo). No se verificó la rama ni la publicación.

## 0. Método y comandos

- Diffs: `diff <F2> <G>` por archivo; recuento `grep -c '^<'` (eliminadas) /
  `grep -c '^>'` (añadidas). Diffs guardados en `/tmp/h004/diff-{report,closure,html,method}.txt`.
- Marcas: `grep -o 'Rectificación MUSE-004-G' | wc -l` (ocurrencias) y
  `grep -c 'Rectificación MUSE-004-G'` (líneas); mismo procedimiento para `(D-02)`.
- Hashes: `sha256sum` sobre los bytes reales de los 9 archivos; coherencia por
  `grep` de prefijo (8 caracteres) y de hash completo (64 caracteres) en cada documento citante.
- Anclas HTML: extracción por expresiones regulares (`id="..."`, `href="#..."`,
  bloques `<script>`) y comparación F2↔G.

Archivos base: `review-g/` = `~/workspace/research_notes/nexo-autonomy-004-g/review-g/`;
`review-f/` = `~/workspace/research_notes/nexo-autonomy-004-f/review-f/`;
canónicos (solo lectura) = `~/workspace/research_notes/nexo-autonomy-004-g/branch-eb6ff90/`.

## (b) Diffs finales f2→g, re-medidos con `diff`

| Archivo | Afirmado (ronda H) | Re-medido | Veredicto |
|---|---|---|---|
| `report-r2-rectified-review-g.md` | 21 / 44 | **21 eliminadas / 44 añadidas** (22 hunks) | CONFIRMADO |
| `closure-r2-rectified-review-g.md` | 7 / 38 | **7 eliminadas / 38 añadidas** (5 hunks) | CONFIRMADO |
| `expediente-consolidado-nexo-r2-rectified-review-g.html` | 32 / 46 | **32 eliminadas / 46 añadidas** (31 hunks) | CONFIRMADO |
| `consolidation-method-rectified-review-g.md` | 2 / 6 | **2 eliminadas / 6 añadidas** (3 hunks) | CONFIRMADO |

### Por qué no cambiaron con la ronda H (verificado, no supuesto)

La ronda H tocó solo 4 puntos; dos no tocan estos archivos y dos cayeron dentro de
líneas ya modificadas:

- **H-01** corrigió el documento de gate (`MUSE_004_G_D02_DECISION_GATE.md` §4 y §7),
  no la nota de método. El diff f2→g del método no podía cambiar por H-01.
- **H-03** corrigió el informe de corrección (`MUSE_004_G_CORRECTION_REPORT.md` §4,
  nota d-05), no el informe G. El diff f2→g del informe no podía cambiar por H-03.
- **H-02** (cierre, L288) cambió el nombre del archivo dentro de una línea que ya era
  una sustitución f2→g: el hunk `286,288c286,288` del diff del cierre ya sustituía esa
  línea (salvedad A-01/B-07 de §8.4 + marca C-01). Cambiar `review-f2` por `review-g`
  dentro de la misma línea no añade ni quita líneas del diff. Coherencia de tamaño:
  el informe de corrección afirma cierre 48.459 → 48.458 bytes; `review-f2` → `review-g`
  es exactamente −1 carácter, y el tamaño final medido es 48.458 bytes.
- **H-04** (HTML, banner L138) es una sustitución 1-a-1 dentro de una línea ya
  modificada. Prueba directa con la copia pre-H conservada en la rama
  (`branch-eb6ff90/«HTML rectificado G.html»`, 195.843 bytes, `210e29ab…`):
  `diff` F2 → HTML pre-H = **32/46** (idéntico al final), y
  `diff` HTML pre-H → HTML final = **1 eliminada / 1 añadida** (hunk `138c138`):
  se retiró únicamente ` con <code>[Rectificación MUSE-004-G (A-xx/C-xx)]</code>`
  (56 caracteres, 57 bytes por la `ó` de «Rectificación»), lo que explica
  195.843 → 195.786 bytes. El diff f2→g no podía cambiar.

### Diff canónico → copia G de la nota de método (H-01), re-medido

| Comparación | Re-medido | Veredicto |
|---|---|---|
| canónico `consolidation-method.md` → copia G | **4 eliminadas / 10 añadidas** | CONFIRMADO (4/10) |
| canónico → copia F2 (control) | **4 eliminadas / 6 añadidas** | CONFIRMADO (4/6 solo para F2) |

Descomposición medida del +4 (ver §5, discrepancia MENOR R-H01-D1): las 4 líneas
añadidas extra son la sección «Actualización G» (método G, L84–87: línea en blanco,
`## Actualización G (MUSE-AUTONOMY-004-G, 2026-11-08)`, línea en blanco, marca
`[Rectificación MUSE-004-G (C-01/D-02): …]`). El banner G es una línea modificada
con igual cómputo en ambos diffs (hunk `2a3,4`, +2 líneas en F2 y en G).

## (c) Marcas finales, re-medidas con `grep`

Patrón contado: `[Rectificación MUSE-004-G` (con corchete; el recuento sin corchete
coincide en todos los archivos). Ocurrencias / líneas que las contienen:

| Archivo | Afirmado | Re-medido (ocurrencias / líneas) | Veredicto |
|---|---|---|---|
| informe G | 29 (24 líneas) | **29 / 24** | CONFIRMADO |
| HTML G | 29 (25 líneas) | **29 / 25** | CONFIRMADO |
| cierre G | 8 | **8 / 7 líneas** | CONFIRMADO (ocurrencias) |
| nota de método G | 2 | **2 / 2** | CONFIRMADO |
| manifiesto G | — (no afirmado) | 1 / 1 | Informativo |

Marcas (D-02) — patrón `[Rectificación MUSE-004-G (D-02`:

| Archivo | Re-medido |
|---|---|
| informe G | **12** ocurrencias, 12 líneas |
| HTML G | **12** ocurrencias, 12 líneas |
| cierre G | 0 (no lleva pasajes de rectificación D-02; sus menciones D-02 son la viñeta de gate) |
| nota de método G | 1 (`[Rectificación MUSE-004-G (C-01/D-02): …]` L87); sus otras 4 `(D-02)` son marcas MUSE-004-F |

La afirmación «marcas (D-02): 12 por formato» se verifica para los dos formatos del
expediente (informe MD y HTML, 12/12). El cierre (0) y el método (1) no contradicen
esa lectura: no son formatos del mismo contenido sino documentos distintos sin pasajes
D-02. Se deja constancia de la lectura para evitar una interpretación extensiva.

Comprobaciones H-04: el banner del HTML (L136–138) contiene **0** ocurrencias de
`A-xx` tras la corrección. Las 2 ocurrencias restantes de `A-xx` en el HTML
(L217–218) y en el informe (L48, L50) son la descripción del formato de marca en la
sección «Registro de rectificación MUSE-004-G» (`…marcada en su sección con
[Rectificación MUSE-004-G (A-xx/C-xx)]`), idéntica en ambos formatos; no son
plantillas huérfanas. El manifiesto G contiene 1 ocurrencia del mismo patrón
descriptivo. Antes de H-04 el HTML tenía 3 (banner + 2 del registro) frente a 2 del
informe; ahora 2/2.

## (d) Hashes finales, re-calculados con `sha256sum`

Todos los tamaños y hashes coinciden con el borrador §2 y con las tablas citantes.

| Archivo | Bytes (medidos) | SHA-256 (medido) |
|---|---|---|
| `review-g/report-r2-rectified-review-g.md` | 159.176 | `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b` |
| `review-g/closure-r2-rectified-review-g.md` | 48.458 | `d7e85d53e72acb6729a07624ca62026128e0069c8c275210250aeca469519655` |
| `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 195.786 | `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9` |
| `review-g/consolidation-method-rectified-review-g.md` | 13.351 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| `review-g/hashes-r2-rectification-review-g.md` | 8.811 | `44b97e7f867e4f067bc42e4fdac5231cc3aa72414310485e2cdb21098e19f98d` |
| `MUSE_004_G_D02_DECISION_GATE.md` | 13.054 | `d39db99c911d6ed3aae023dc074e503c85cfe6079c816ee0914621d47a75b222` |
| `MUSE_004_G_CORRECTION_REPORT.md` | 73.137 | `85be5bf19e472628f99f117e9e72cce14b5ee0de49e1879124c5988971f6b2e6` |
| `MUSE_004_G_SHA256_MANIFEST.md` | 9.384 | `3d1220bd55b6a8e57d74a89031a089b8c7c53f04a36cabecaa91273ff635056d` |
| `Resumen ejecutivo MUSE-004-G.md` | 22.807 | `ddec26fb72c7f79c762d4d1c0ecc550b0ca2167af04fcfd9521322edc4585f44` |

### Coherencia por documento citante

| Documento citante | Comprobación |
|---|---|
| Anexo A del informe G (L593–L605) | Cierre, HTML y método con hash completo correcto y tamaños correctos. El informe remite su propio hash al manifiesto (L597: «Un archivo no puede contener su propio hash») y el manifiesto figura con `—` en hash; correcto y declarado. Sin hashes viejos. |
| Manifiesto G (`hashes-r2-rectification-review-g.md`) | 4/4 archivos G con hash completo y tamaño correctos; su propio hash correctamente ausente (nota de autorreferencia). Bases F2 con hashes correctos re-medidos (informe `dacefd69…`, cierre `80a82481…`, HTML `28e2b188…`, método `b8711617…`, manifiesto F2 `2f2e7da5…`) y tamaños correctos; originales MUSE-004 y canónicos R2 también correctos (ver abajo). Diffs y marcas declarados en su sección «Verificación» coinciden con (b) y (c). |
| Informe de corrección (tabla final L415–L423 + hash propio del manifiesto) | Tabla final: 5/5 hashes completos y tamaños correctos. «Hash propio del manifiesto G» citado 4 veces, siempre completo y correcto (`44b97e7f…`). §4 L401 (diffs y marcas) coincide con (b) y (c). |
| Manifiesto de Pasada 7 (`MUSE_004_G_SHA256_MANIFEST.md`) | §1: 5/5 G correctos (hash completo + tamaño). §2: informe de corrección `85be5bf1…` y gate `d39db99c…` correctos; otros entregables G re-verificados contra los archivos locales (matriz `9721ec33…`, verificación cruzada `d9454281…`, revisión adversarial `0605a799…`, registro A2A `720ce580…`). §3.1/§3.2/§3.3: bases F2, originales MUSE-004 y canónicos correctos. Único hash viejo presente: `210e29ab…` (HTML pre-H) en §4 L73, etiquetado explícitamente **SUPERSEDIDA**, junto a `539657d4…` y `d75cd743…` (informes publicados), también **SUPERSEDIDAS**. |
| Resumen ejecutivo | §4 (L59–63) y §5/§6 (L73–82, L132–143): 5/5 G + gate + corrección + manifiesto Pasada 7 con hashes completos o truncados coherentes (prefijo y sufijo coinciden con el valor completo en todos los casos: p. ej. `89fb7665…2993b`, `d39db99c…5b222`, `3d1220bd…56d`). Hashes viejos solo como **SUPERSEDIDO** (L76, L80–82, L114). L46–49: H-01 a H-04 descritos con cifras correctas (4/10, cierre L288, 29/29). |

### Hashes viejos buscados

`0b742e67…` (informe Pasada 7), `63c3277c…` (cierre), `996911b3…` (manifiesto):
**0 ocurrencias en los 9 archivos**. `210e29ab…` solo aparece etiquetado como
SUPERSEDIDA/SUPERSEDIDO (manifiesto Pasada 7 L73; resumen ejecutivo L76 y L114).
`539657d4…` y `d75cd743…` (gate y corrección publicados) solo como SUPERSEDIDAS
(manifiesto Pasada 7 L73; resumen ejecutivo L80–81). Las citas F2 son bases
etiquetadas como tales, no valores vigentes. **0 hashes viejos citados como vigentes.**

### Canónicos R2 intactos (re-medidos en `branch-eb6ff90/`)

| Archivo | SHA-256 medido | Veredicto |
|---|---|---|
| `report-r2.md` | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | INTACTO |
| `closure-r2.md` | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` | INTACTO |
| `hashes-r2.md` | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | INTACTO |
| `consolidation-method.md` | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | INTACTO |
| `expediente-consolidado-nexo-r2.html` | `af343327e190a37fbc317774e4b3da77b84724ee73bff50eb6053b835b728e7b` | INTACTO |

Los originales MUSE-004 citados en el manifiesto G y en el manifiesto Pasada 7
también coinciden con los archivos de `branch-eb6ff90/` (informe `5dcf73ae…`,
cierre `ff3c0d19…`, HTML `973c5807…`, manifiesto `b0395ed5…`; tamaños 135.870 /
37.652 / 171.310 / 3.117).

## Verificación cruzada (solo pasajes tocados por la ronda H)

| Pasaje H | Informe G | Cierre G | HTML G | Método G | Manifiesto G / citantes | Veredicto |
|---|---|---|---|---|---|---|
| H-01: cifra 4/10; 4/6 solo F2 | — | — | — | diff canónico→G 4/10 re-medido; F2 4/6 | Gate §4 L58 y §7 L96: 4/10, con 4/6 solo F2; corrección L409–410; manifiesto G L61; manifiesto Pasada 7 L73; resumen L29/L46/L124 | **Coherente**, salvo la descomposición imprecisa (R-H01-D1, MENOR) |
| H-02: archivo G del método | — | L288: sujeto `consolidation-method-rectified-review-g.md`; L319 (C-01) lo confirma | — | — | Corrección L410 (cierre 48.459 → 48.458); resumen L47 | **Coherente**. Ninguna otra mención F2 referida a la copia G en el cierre: `grep f2` solo devuelve el hash de commit `0ef2f2b8…` (L12), «Addendum F» y la mención histórica de L319 («nombraba el archivo de método F2») |
| H-03: puntero d-05 | — | — | — | — | Corrección L123: nota remite a la sección final «Corrección post-Pasada 5» (L371), que contiene los valores vigentes (tabla final L415–423, diffs/marcas L401); fila d-05 L385 y fila H-03 L411 con el mismo puntero. No queda otro puntero «valores vigentes» (`grep` solo L123/L385/L411) | **Coherente** |
| H-04: marcas 29/29 | 29 / 24 líneas | — | 29 / 25 líneas | — | Corrección L401 y L412; resumen L49 («antes 30 (26 líneas)»); banner HTML L138 sin plantilla | **Coherente** |
| Estados | U2/U3/U5 UNKNOWN; D-01–D-12 SIN DECIDIR; PARTIAL, no PASS | Igual (L288 y Addendum G) | Igual | Igual (banner y § Actualización G) | Corrección L405–406: mismos estados | **Coherente** |
| «LISTO PARA REVISIÓN FINAL» en copias G | 0 ocurrencias en `review-g/` (las 5 copias) | — | — | — | La frase aparece solo en el informe de corrección L405 («CON DEFECTOS MAYORES — no LISTO PARA REVISIÓN FINAL», veredicto de la auditoría, no del expediente) | **Coherente** |
| Ningún PASS nuevo | Las ocurrencias de PASS en líneas añadidas f2→g son «no declara ningún PASS nuevo» / «no se declara PASS» / PASS de integridad con alcance acotado (cierre) | — | — | — | Corrección L405: «No se declara PASS» | **Coherente** |

Notas de contexto verificadas y no discrepantes: informe L42 y HTML L212 nombran
`consolidation-method-rectified-review-f2.md`, pero dentro del registro histórico
MUSE-004-F (informe § «Registro … MUSE-004-F», L33; HTML sección F, L204),
describiendo el archivo que preparó F; no es una referencia a la copia G.
La aclaración (d-04) existe 1 vez por formato: informe L509 y HTML L1081, texto
idéntico. El Anexo A del HTML nombra los 5 archivos G y remite los hashes al
manifiesto (7 ocurrencias del nombre del manifiesto en el HTML, 0 valores hash
literales en el HTML); ningún documento afirma que el Anexo A del HTML contenga
los valores literales.

### HTML: anclas y `<script>`

- `id="..."`: 38 ids, **0 duplicados**.
- `href="#..."` internos: **30 ocurrencias** (17 destinos distintos), **0 sin destino**.
- 17 secciones `<section>`.
- `<script>`: 1 bloque, **byte-idéntico al de F2** (4.470 bytes,
  SHA-256 del contenido `675acad321d9…` en ambos).
- Coincide con lo declarado en el manifiesto G («30 anclas internas resuelven,
  0 sin destino, 0 IDs duplicados; bloque `<script>` byte-idéntico al de F2»).

## Discrepancias

### R-H01-D1 — MENOR: descomposición imprecisa de las 4 añadidas extra (H-01)

- **Ubicaciones exactas:** `MUSE_004_G_D02_DECISION_GATE.md` §7, L96
  («la cifra correcta es 4 líneas eliminadas / 10 líneas añadidas (las 4 añadidas
  extra son el banner G y la sección «Actualización G»)») y
  `MUSE_004_G_CORRECTION_REPORT.md` L410 (misma frase entrecomillada en la fila H-01).
- **Evidencia:** `diff` canónico → F2 = 4/6; canónico → G = 4/10. El hunk del
  banner (`2a3,4`, +2 líneas) es idéntico en ambos diffs; la única diferencia es
  el hunk final: F2 sustituye 1 línea (L81) y G sustituye 1 línea y añade 4
  (L84–87: blanco, `## Actualización G`, blanco, marca C-01/D-02). El banner G
  es una línea modificada en redacción, no líneas añadidas netas: aporta 0 de las
  4 extra. Las 4 extra son únicamente la sección «Actualización G».
- **Severidad:** MENOR (imprecisión de presentación, criterio del borrador §6).
  La cifra 4/10 es correcta y está verificada; ningún veredicto, estado ni hash
  depende de esta frase. No se corrige en esta misión.
- **Otras apariciones:** el resumen ejecutivo (L46, L124) y el manifiesto G (L61)
  afirman 4/10 sin repetir la descomposición; no hay que corregirlos.

No se encontró ningún defecto CRÍTICO ni MAYOR en la ronda H. No hay más
discrepancias.

## Limitaciones

1. **No soy revisor externo independiente** (ver declaración inicial): comparto
   contexto con el equipo que produjo las copias G. Esta reconciliación es una
   re-medición con herramientas, no una auditoría independiente.
2. **Publicación y Git fuera de alcance:** no se verificó la rama
   (`eb6ff90d` → `f2b7edfe` según la tarea; no comprobado por mí), ni las copias
   publicadas, ni el hash del manifiesto publicado (`7953961a…`, 7.082 bytes,
   citado en el resumen ejecutivo L82). Observación registrada sin verificar:
   el manifiesto de Pasada 7 §5 cita como HEAD `7870a6ab…`, distinto del HEAD
   `eb6ff90d` del borrador §2; esa cita es anterior a la subida de Kevin y queda
   fuera del alcance de esta misión.
3. **Tamaño pre-H del cierre (48.459 bytes)** citado en el informe de corrección
   (H-02) no es verificable contra un archivo pre-H conservado (no existe copia
   local pre-H del cierre; no se publicó). Su coherencia se comprobó
   indirectamente: −1 byte exacto por `review-f2` → `review-g` en L288, y tamaño
   final medido 48.458 bytes.
4. **No re-auditado:** contenido de M02/M03/M03-B, C01–C16, A-01/A-02/A-03/C-01,
   B-01–B-09, 7 defectos de Pasada 5, D-02, I-02, M-3, discrepancia de fecha
   v1.0.1. Heredados como limitaciones, no como defectos nuevos.
5. El HTML G se verificó por lectura de bytes/texto; no se leyó ni editó ningún
   archivo bajo `~/workspace/ts-spaces/`.

## Estado de (b), (c) y (d)

- **(b) Diffs f2→g: REPRODUCIDOS** — 21/44, 7/38, 32/46, 2/6; explicación de la
  invariancia ante H verificada, incluido el control directo F2 → HTML pre-H (32/46).
- **(c) Marcas: REPRODUCIDAS** — informe 29/24, HTML 29/25, cierre 8, método 2;
  (D-02) 12 por formato (informe y HTML).
- **(d) Hashes: REPRODUCIDOS Y COHERENTES** — 5 entregables + 3 informes G +
  resumen ejecutivo recalculados; 0 hashes viejos citados como vigentes; canónicos
  R2 intactos (5/5).
- **Verificación cruzada H-01–H-04: COHERENTE**, con una única discrepancia MENOR
  (R-H01-D1, descomposición de las 4 añadidas extra).
