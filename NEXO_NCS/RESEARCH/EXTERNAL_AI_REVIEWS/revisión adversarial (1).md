# MISIÓN MUSE-AUTONOMY-004-G — PASADA 5: REVISIÓN ADVERSARIAL PROPIA

**Misión:** MUSE-AUTONOMY-004-G — remediación adversarial, reconciliación y verificación final de R2.
**Pasada:** 5 — Ataque adversarial propio. Trabajo de verificación, solo lectura.
**Fecha:** 2026-11-08.
**Revisor:** agente adversarial hostil; no se confía en MUSE ni en los resultados de las pasadas anteriores.
**Entrega atacada (`~/workspace/research_notes/nexo-autonomy-004-g/`):**
- `review-g/report-r2-rectified-review-g.md` (157.071 bytes, `bd34107e…b4694`)
- `review-g/closure-r2-rectified-review-g.md` (48.472 bytes, `cec384d7…82864`)
- `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` (193.805 bytes, `9cdaa60b…f93f`)
- `review-g/consolidation-method-rectified-review-g.md` (13.351 bytes, `5356bd1c…3c9bf`)
- `review-g/hashes-r2-rectification-review-g.md` (7.152 bytes, `aeb80880…e78`)
- `MUSE_004_G_DIAGNOSTIC_MATRIX.md` (Pasada 1)
- `MUSE_004_G_CORRECTION_REPORT.md` (Pasadas 2 y 3)
**Contexto verificado:** copias F2 en `nexo-autonomy-004-f/review-f/`, canónicos R2 en `nexo-autonomy-004/branch/`, copia de la rama en `nexo-autonomy-004-g/branch/`, MUSE-004 y MUSE-003.
**Regla aplicada:** ningún archivo existente fue modificado; este informe es el único archivo creado. No se publica ni fusiona nada. No se declara PASS.

---

## 1. Veredicto global: PARCIAL — no LISTO PARA REVISIÓN FINAL

La entrega **resistió los ataques contra su fondo**: las correcciones A-01, A-02, A-03 y C-01 y los menores B-01–B-08 son reales, están en las líneas citadas y coinciden entre Markdown y HTML; la evidencia A2A fue re-verificada en vivo por esta pasada, sección por sección y línea por línea, y coincide exactamente con lo declarado; todos los hashes de los cinco archivos G coinciden con `sha256sum`; el HTML construido por parcheo de bytes no muestra pasajes F2 sin sincronizar, anclas rotas ni tablas desactualizadas; los estados (U2/U3/U5 UNKNOWN, C14 PARCIALMENTE CONFIRMADA, D-01–D-12 SIN DECIDIR, cierre PARTIAL) se conservan.

Pero la entrega **no superó el ataque contra su propia documentación de verificación**. Dos defectos MAYORES impiden declararla LISTO PARA REVISIÓN FINAL:

1. **El manifiesto G —el documento de integridad— contiene estadísticas de diff falsas** para los dos archivos que tocó la Pasada 3 (informe 8/31 declarado frente a 14/37 real; HTML 18/32 declarado frente a 24/38 real).
2. **El residuo B-02 es una inconsistencia viva**: la misma lógica que corrigió el plural no verificado en una celda se dejó sin aplicar en seis pasajes idénticos, uno de ellos en forma desnuda y sin salvedad.

Ningún defecto CRÍTICO. Ningún estado, veredicto, hash ni PASS está falseado. La corrección necesaria es acotada: actualizar el manifiesto y resolver (o decidir por gate, con constancia explícita en el propio dossier y no solo en el informe de corrección) el plural superviviente.

**Conteo: CRÍTICOS 0 · MAYORES 2 · MENORES 5.**

---

## 2. Tabla de defectos

| # | Sev. | Defecto | Ubicación |
|---|---|---|---|
| D-01 | MAYOR | Manifiesto G: estadísticas de diff f2→g falsas (stale de Pasada 2) para informe y HTML | `review-g/hashes-r2-rectification-review-g.md` L51, L53 |
| D-02 | MAYOR | Residuo B-02: plural no verificado «resúmenes» sobrevive en 6 pasajes tras corregirse en 1 celda con la misma lógica | informe L175, L199, L304, L529, L538, L570; HTML L395, L425, L655, L1100, L1108, L1351 |
| d-01 | MENOR | Cierre G, viñeta D-02: la opción B del gate sigue descrita como «copia f2 actualizada» | `review-g/closure-r2-rectified-review-g.md` L288 |
| d-02 | MENOR | Recuentos de marcas G de la Pasada 2 irreproducibles (informe 12, HTML 17) | `MUSE_004_G_CORRECTION_REPORT.md` L139 |
| d-03 | MENOR | Localización errónea del residuo R2c: «HTML L1351» es la fila SP 800-53, no R2c | `MUSE_004_G_CORRECTION_REPORT.md` L255 |
| d-04 | MENOR | Tensión §11 H-B2 vs §12 sobre §8.4: «no “Verificado en vivo”» frente a «confirmado en vivo» | `review-g/report-r2-rectified-review-g.md` L509 vs L561 |
| d-05 | MENOR | Tabla §4 de la Pasada 2 con hashes/tamaños G superados y sin nota de superado | `MUSE_004_G_CORRECTION_REPORT.md` L121–L129 |

---

## 3. Detalle de los defectos

### D-01 — MAYOR — El manifiesto G declara diffs f2→g falsos para informe y HTML

**Evidencia exacta.** Manifiesto, sección «Verificación»:

- L51: «Diff f2 → g (informe): 8 líneas eliminadas / 31 líneas añadidas (registro G, 13 líneas; tabla del Anexo A G, 10 líneas; 8 pasajes corregidos en su línea).»
- L53: «Diff f2 → g (HTML): 18 líneas eliminadas / 32 líneas añadidas (título, masthead, TOC, registro G, 8 pasajes corregidos, Anexo A, pie).»

**Medición de esta pasada** (`diff` directo f2→g, recuento de líneas `^<` / `^>`):

| Archivo | Declarado en el manifiesto | Medido por esta pasada |
|---|---|---|
| informe | 8 / 31 | **14 / 37** |
| HTML | 18 / 32 | **24 / 38** |
| cierre | 7 / 38 | 7 / 38 ✓ |
| método | 2 / 6 | 2 / 6 ✓ |

**Intento de falsación.** Se intentó falsar la hipótesis «el manifiesto está desactualizado» suponiendo que la Pasada 3 no hubiese cambiado los diffs: falso. La Pasada 3 modificó 6 líneas en informe y 6 en HTML (B-01, B-02, B-03, B-04, B-05, B-08) más la fila del Anexo A del informe con el nuevo hash del HTML; los diffs acumulados correctos (14/37 y 24/38) figuran en el propio informe de corrección, Pasada 3 §4 y §6. La Pasada 3 actualizó en el manifiesto los hashes del informe y del HTML y añadió la viñeta de la Pasada 3 (L59), pero **no actualizó los bullets de diff L51 y L53**, que siguen siendo los de la Pasada 2.

**Por qué es MAYOR y no MENOR.** El manifiesto es el documento de integridad de la entrega: un verificador que recompute los diffs obtiene valores distintos de los declarados y debe desconfiar del resto del documento. Los hashes y tamaños del manifiesto sí son correctos (ver F-06), por lo que el daño queda acotado a la sección «Verificación» — pero es exactamente la sección que afirma que la entrega fue verificada. Agravante menor dentro del mismo defecto: el bullet «El HTML g se verificó por extracción de texto contra el Markdown g (12 pasajes corregidos…)» describe el estado de la Pasada 2; tras la Pasada 3 son 18 pasajes corregidos (12 + 6 B), y el manifiesto no registra la re-verificación MD↔HTML de los 6 pasajes B (que sí existe, en el informe de corrección P3 §5, y que esta pasada re-verificó independientemente: 16/16, ver F-05).

**Corrección exigida.** Actualizar L51 a 14/37 y L53 a 24/38 (y el parentético: 14 pasajes corregidos en su línea en el informe, no 8; 14 en el HTML, no 8), y añadir la constancia de la verificación MD↔HTML de los 6 pasajes B.

### D-02 — MAYOR — Residuo B-02: el plural no verificado sobrevive en seis pasajes

**Evidencia exacta.** La Pasada 3 corrigió la celda HF §12 retirando el plural no verificado «resúmenes» (informe L566 / HTML L1319: «Corroborado (apoyo secundario que cita la primaria, sin identificar en número; …)»). El mismo defecto —afirmar multiplicidad de resúmenes que citan la primaria sin nombrar ni contar ninguno— sobrevive como texto vivo en seis pasajes por formato:

| Pasaje | Informe | HTML | Texto vivo |
|---|---|---|---|
| C09 | L175 | L395 | «existencia y texto apoyados en resúmenes que citan la primaria (resúmenes no nombrados; …)» |
| C12 | L199 | L425 | «existencia de los controles apoyada en resúmenes que citan la primaria, no nombrados y sin independencia comprobable» |
| §10 ítem 9 | L529 | L1100 | «existencia y texto corroborados por resúmenes que citan la primaria (resúmenes no nombrados; …)» |
| §12, párrafo definitorio | L538 | L1108 | «la afirmación descansa en resúmenes que citan la primaria» |
| §12, fila SP 800-53 | L570 | L1351 | «Corroborado (resúmenes que citan la primaria)» — forma desnuda, sin «no nombrados» ni puntero a la nota de limitación en la propia celda |
| §6.1 R2(c) | L304 | L655 | «apoyada en resúmenes que la citan» |

**Intento de falsación.** Se intentó falsar la hipótesis «el plural es inocuo porque la nota de limitación de §12 (informe L589 / HTML L1476) lo cubre todo»: fracasa en dos puntos. Primero, la nota de limitación cubre la *independencia* y la *falta de nombres*, no el *número*: afirmar que existen (varios) resúmenes es una afirmación de existencia y cantidad distinta de la independencia, y es exactamente la afirmación que B-02 retiró en la celda HF por no ser comprobable desde el dossier. Segundo, la fila SP 800-53 (L570/L1351) ni siquiera lleva la salvedad «no nombrados» en su celda; un lector que extraiga esa fila aislada no ve ninguna limitación.

**Por qué es MAYOR y no MENOR.** No cambia ningún estado ni veredicto (las etiquetas CORROBORATED no dependen del conteo), pero la entrega es internamente inconsistente bajo su propio criterio: la misma clase de defecto se corrige en un sitio y se conserva en seis, y la decisión de alcance que lo justifica vive solo en el informe de corrección (P3 §3.2 y §8.1: «residuo documentado para el gate»), no en el dossier. La Pasada 3 documentó el residuo con honestidad —eso se reconoce—, pero documentar no es corregir. La salida es binaria y pertenece al gate: extender la redacción singular-neutra a los seis pasajes o decidir conservar el plural con una justificación escrita en el propio §12; mientras tanto el dossier G contiene una afirmación no verificada que su propia revisión ya juzgó incorrecta en el caso gemelo.

### d-01 — MENOR — La opción B del gate sigue descrita como «copia f2 actualizada» en el cierre G

**Evidencia exacta.** `closure-r2-rectified-review-g.md` L288 (viñeta D-02), dos sustantivos vivos con nombre f2 en la misma frase:

> «La copia independiente de revisión `consolidation-method-rectified-review-f2.md` (alternativa B) actualiza esos estados; no sustituye el canónico. [Rectificación MUSE-004-G (C-01): en esta copia G el archivo es `consolidation-method-rectified-review-g.md`; la alternativa B sigue pendiente de decisión del gate.] El gate debe decidir entre **A** (canónico intacto, con la divergencia documentada aquí) y **B** (copia f2 actualizada).»

La marca C-01 mitiga el error (el lector atento ve el nombre G), pero la descripción de la opción B —«copia f2 actualizada»— y el sujeto de la frase anterior nombran el archivo F2, no el G que esta entrega realmente contiene. Un lector o un proceso que extraiga la definición de la opción B obtiene el archivo equivocado. La corrección es de una línea: «copia g actualizada» / «`consolidation-method-rectified-review-g.md` (alternativa B)».

### d-02 — MENOR — Recuentos de marcas G de la Pasada 2 irreproducibles

**Evidencia exacta.** `MUSE_004_G_CORRECTION_REPORT.md` L139 (Pasada 2 §5): «Recuentos de marcas `[Rectificación MUSE-004-G]`: informe 12, HTML 17 (incluye bandera del masthead y párrafo del Anexo A), cierre 8, nota de método 2.»

**Medición de esta pasada.** Ocurrencias literales de `[Rectificación MUSE-004-G` en el estado actual (tras la Pasada 3, que añadió 6 marcas B por formato): informe 17, HTML 18, cierre 8, método 2. Restando las 6 marcas B, el estado de la Pasada 2 era: informe **11**, HTML **12**. Contando solo marcas con etiqueta `(X-NN)`: informe 9, HTML 9 en estado P2. Ningún método de conteo basado en corchetes reproduce «informe 12, HTML 17». En cambio, cierre 8 y método 2 sí se reproducen exactamente (cierre: 8 marcas en 7 líneas —L288 lleva dos—; método: 2 marcas `(C-01/D-02)`).

**Alcance.** Las marcas mismas están todas presentes, correctamente situadas e idénticas entre formatos (15 por formato en el estado actual: 5 A-02, 3 A-03, 6 B, 1 C-01). El defecto es de metadatos de verificación en el informe de corrección, no del contenido. Pero un recuento declarado como verificación que no se reproduce erosiona la confianza en los demás recuentos del mismo informe.

### d-03 — MENOR — Localización errónea del residuo R2c

**Evidencia exacta.** `MUSE_004_G_CORRECTION_REPORT.md` L255 (Pasada 3 §3.2): «…y la fila R2c (HTML L1351)». HTML L1351 es la celda de la fila §12 SP 800-53 («Corroborado (resúmenes que citan la primaria)», precedida por «Catálogo de controles federales; baselines en SP 800-53B» y seguida por la fila SP 800-34). El pasaje R2c con plural está en §6.1: informe L304 / HTML L655 («(c) CORROBORATED: … apoyada en resúmenes que la citan; …»). El error no cambia el fondo (el plural de R2c existe y está en la lista de supervivientes), pero la cita de localización es falsa y haría fallar una verificación por línea.

### d-04 — MENOR — Tensión §11 H-B2 vs §12 sobre §8.4

**Evidencia exacta.** `report-r2-rectified-review-g.md`:

- L509 (§11 E, ítem 3, cambio R2 histórico): «**H-B2 — Fila A2A de §12:** §8.4 (firma JWS opcional, SHOULD) queda como análisis secundario, no “Verificado en vivo”.»
- L561 (§12, fila A2A): «§8.4 (firma JWS opcional MAY, verificación SHOULD) confirmado en vivo en la spec `latest` por el Frente E de MUSE-003 (F-E15); no verificado contra el tag v1.0.1 ni archivado con instantánea — no se presenta como lectura primaria del tag».

La conciliación existe pero exige reconstruir cronología y terminología: H-B2 es registro histórico de R2 (2026-11-06); la confirmación F-E15 es solo en `latest`, sin tag ni instantánea. La distinción entre «confirmado en vivo» (§12) y «Verificado en vivo» como término de arte (lectura primaria con instantánea, §11) no se define en un solo lugar del dossier. Un lector que lea solo §11 concluye que §8.4 no está verificado en vivo; uno que lea solo §12 concluye lo contrario. La salvedad B-07 está correctamente presente en el cierre (L288), el informe (L561) y el método (L68); el defecto es de presentación, no de estado.

### d-05 — MENOR — Tabla §4 de la Pasada 2 con hashes G superados y sin nota

**Evidencia exacta.** `MUSE_004_G_CORRECTION_REPORT.md` L121–L129 («4. Archivos G creados»): informe 155.684 bytes / `d5167fbc5636…8b56a`; HTML 192.418 bytes / `881802cf7c15…d8d5`. Esos eran los valores de la Pasada 2; los vigentes tras la Pasada 3 son informe 157.071 bytes / `bd34107e71af…b4694` y HTML 193.805 bytes / `9cdaa60b1488…f93f` (informe de corrección P3 §6, L343–L345, y manifiesto). La tabla §4 no lleva ninguna nota de «superado por Pasada 3 §6». Un lector que copie hashes desde §4 obtiene valores que ya no corresponden a ningún archivo G. Atenuante: §4 es explícitamente el registro de la Pasada 2 y los valores correctos existen en el mismo documento; el manifiesto —documento de integridad vigente— es correcto en hashes. El riesgo es de lectura parcial, no de integridad de los archivos.

---

## 4. Intentos de falsación (resultado individual)

ÉXITO = defecto encontrado. FRACASO = la entrega resiste (evidencia a su favor).

| # | Hipótesis atacada | Método | Resultado |
|---|---|---|---|
| F-01 | A-01: las viñetas acotadas siguen siendo falsas del texto que citan | Recuentos `grep -o` en cierre G L1–L272 (texto anterior al Addendum F, que empieza en L273) | **FRACASO.** `vault` 0, `HSM` 0, `trust_remote_code` 0, `agent.json` 0, `heredado` 1 (L57, «metadatos heredados», descriptivo), `index` 0. Las cuatro viñetas (L283, L284, L286, L287) dicen exactamente eso de ese texto. La afirmación M-02 «ninguna etiqueta EVIDENCE del texto anterior descansa en index o heredado» se sostiene textualmente por los mismos recuentos (ver §5, limitación). |
| F-02 | A-02: la evidencia A2A «verificada en vivo 2026-11-08» es inventada o imprecisa | `browser.open`/`browser.find` en `https://a2a-protocol.org/latest/specification/` y `https://a2a-protocol.org/v0.2.6/specification` (mismo crawl 2026-11-08 07:57 UTC citado por la Pasada 2) | **FRACASO.** Todo coincide, incluso los números de línea: `latest` §1 L16–20 (cita literal), §3.3 «Operation Semantics» L811, §4.3 «Push Notification Objects» L1415, §4.5 «Security Objects» L1667, §4.6 «Extensions» L1826, §5.1 «Functional Equivalence Requirements» L2078, §5.3 «Method Mapping Reference» L2098, §7.3 L3251, §7.5 L3270, §7.6 L3283, §8.4 «Agent Card Signing» L3418 con MAY L3420; frase §3.3 de identidad: 0 ocurrencias en `latest`. v0.2.6: §3.3 L99, frase de identidad L109–110, §4.3 L124, fuera de banda L129–130, §4.5 L147, §4.6 L161 + «Authorization logic is implementation-specific» L164, §5.1 L178–180, §5.3 L196 + `agent.json` L198–199. Las cinco notas A-02 (C05 L143, C01 L111, R1(a) L303, R4 L306, §12 L561) están presentes con el texto declarado, en ambos formatos. |
| F-03a | A-03: queda alguna afirmación viva de «resúmenes independientes» | `grep` en las cinco copias G | **FRACASO.** 0 como afirmación viva. Las 3 ocurrencias son citas de la fórmula retirada (informe L73 §0, HTML L283, cierre L245 Addendum MUSE-003) y la regla definitoria («fuentes que reescriben un mismo comunicado no cuentan como corroboraciones independientes»). «≥2» aparece solo en citas de fórmulas retiradas y en «SLIP-39 solo con T≥2» (informe L356, no relacionado). |
| F-03b | A-03/B-02: el plural «resúmenes» es tan verificable como la independencia retirada | `grep` de «resúmenes que citan la primaria» + «resúmenes que la citan» en informe y HTML | **ÉXITO → D-02.** Seis pasajes vivos por formato (tabla en D-02). La propia Pasada 3 lo admite como residuo (informe de corrección L255, L364). |
| F-04 | C-01: el Anexo A sigue nombrando archivos que no son los G, o los hashes son copiados | `sha256sum` real vs Anexo A del informe (L597–L605), Anexo A del HTML (L1482–L1490) y manifiesto; `grep` de nombres no-G | **FRACASO.** Cierre `cec384d7…82864` (48.472 B), HTML `9cdaa60b…f93f` (193.805 B), método `5356bd1c…3c9bf` (13.351 B): los tres coinciden con `sha256sum` y con el manifiesto. Informe con «ver manifiesto» (correcto: no puede autocontenerse), manifiesto «—». Manifiesto G: 7 ocurrencias en el HTML, 0 del manifiesto F2; 0 nombres `rectified-review.md/.html` sin `-g` en informe y HTML. Fila de método presente en ambos Anexos. Todas las filas de referencia del manifiesto (F2, MUSE-004, canónicos) existen y sus hashes coinciden con `sha256sum` medido. |
| F-05 | B-01–B-09: alguna corrección menor no está aplicada o difiere entre formatos | Lectura línea por línea citada (informe L31/L215/L233/L497/L538/L566; HTML L202/L445/L467/L1073/L1108/L1319) + extracción de texto del HTML y comparación normalizada de 16 pasajes (12 de P2 + 6 de P3, salvo duplicados) | **FRACASO en el fondo; ÉXITO parcial en metadatos → d-02, d-03.** Las 6 correcciones B están aplicadas con el texto declarado, idénticas en ambos formatos (16/16 comprobaciones de texto: C01, C05, C09, C12, R1(a), R4, §10, §12 A2A, B-01…B-05, B-08, Anexo A). B-06/B-07 verificados en cierre L292/L288; B-09 ausente («15 líneas»: 0 ocurrencias en `review-g/`). «EVIDENCE corroborado»: 1 por formato, solo cita del registro F (L40/L210). «(Fase A, INC-01)»: 0. Fallan solo los metadatos: recuentos de marcas P2 (d-02) y localización R2c (d-03). |
| F-06 | Hashes: algún hash del manifiesto o del Anexo A es copiado de una versión anterior | `sha256sum` de los 5 archivos G, 5 bases F2, 4 canónicos R2 y 4 archivos MUSE-004; `grep` de hashes P2 (`d5167fbc`, `881802cf`) en `review-g/` | **FRACASO.** Los 5 hashes G coinciden con el manifiesto y con el Anexo A. 0 restos de hashes P2 en `review-g/`. F2, canónicos y MUSE-004 coinciden con lo declarado (p. ej. informe F2 `dacefd69…b6546`, cierre canónico `0d9ed5ff…cb0f`, HTML MUSE-004 `973c5807…37dbd5`). |
| F-07 | ND-G1: el parcheo de bytes del HTML dejó pasajes F2 sin sincronizar, anclas rotas o tablas desactualizadas | Parseo estructural (Python `html.parser`): IDs duplicados, anclas sin destino, etiquetas sin cerrar, secciones; hash del `<script>` vs F2; comparación de recuentos de punteros § entre MD y HTML | **FRACASO.** Parseo sin errores ni etiquetas sin cerrar; 38 IDs, 0 duplicados; 30 anclas internas, 0 sin destino; 17 secciones abiertas y cerradas; `<script>` byte-idéntico a F2 (SHA-256 `ee5a2b2a9402c8dd…`, mismo en ambos). Recuentos de punteros A2A idénticos MD/HTML (§3.3: 18/18, §4.3: 12/12, §4.5: 14/14, §4.6: 15/15, §5.3: 8/8). Marcas G: 15 por formato, misma distribución (5 A-02, 3 A-03, 6 B, 1 C-01). |
| F-08 | Diffs f2→g: hay hunks fuera del alcance declarado (A-01/A-02/A-03/B-01–B-08/C-01/etiquetado G) | `diff` por archivo con lista de hunks; verificación del texto previo a los addenda del cierre | **FRACASO.** Todos los hunks pertenecen al alcance: informe 14/37 (16 líneas: registro G 13 añadidas, Anexo A 10 añadidas, 14 pasajes en su línea), HTML 24/38, cierre 7/38 (bandera L3, 6 viñetas Addendum F, Addendum G 31 líneas), método 2/6 (bandera, §Etiquetas, Actualización G). Texto del cierre L1–L272 idéntico a F2 salvo la bandera identificadora L3, cambio declarado. |
| F-09 | Estados/PASS: algún PASS o «LISTO PARA REVISIÓN FINAL» declarado sin evidencia, o algún estado cambiado | `grep` de «LISTO PARA REVISIÓN FINAL», «ESTADO: PASS», estados U/C14/D en las cinco copias G; verificación de la base del PASS de publicación en `closure-r2.md` | **FRACASO.** «LISTO PARA REVISIÓN FINAL»: 0 en `review-g/` (las únicas ocurrencias del árbol G están en `branch/` y negadas: «no LISTO PARA REVISIÓN FINAL», «No se declara PASS ni LISTO PARA REVISIÓN FINAL»). El PASS de publicación/integridad del Addendum G §(c) y de H-01 (informe L507) está fundado: `closure-r2.md` L40 «Publicación e integridad documental R2: PASS», L48 «El PASS se limita estrictamente a la publicación e integridad de los documentos enumerados», L202 «PASS, limitado a bytes UTF-8 y SHA-256». «No se declara ningún PASS nuevo» presente (cierre L306, L332; método L3). Estados verificados: informe L44/L57 y L410–L418 (D-01–D-12 SIN DECIDIR), cierre L323–L328, método L3/L60. |
| F-10 | Manifiesto: las estadísticas de diff declaradas son las reales | `diff` f2→g medido vs manifiesto L51–L54 | **ÉXITO → D-01.** Informe 14/37 real frente a 8/31 declarado; HTML 24/38 real frente a 18/32 declarado. Cierre y método correctos. |
| F-11 | Decisiones del propietario presentadas como propuestas de MUSE | `grep` de decisiones D-01–D-12 y de prescripciones («debe», «decide») en las copias G | **FRACASO.** D-02 se presenta como decisión pendiente del gate en cierre L288, método L3 y corrección §9; ninguna D-01–D-12 se resuelve. «Debe espejar» aparece solo en el informe de corrección (L43) sobre un futuro handoff del coordinador, no como decisión en las copias G. |
| F-12 | Duplicaciones, documentos mencionados inexistentes, archivos no manifestados | Inventario de `review-g/` vs manifiesto; duplicado HTML; marca del duplicado U5 | **FRACASO.** `review-g/` tiene exactamente los 5 archivos, todos en el manifiesto. Un solo HTML G (el duplicado de la rama no se replica; manifiesto, párrafo final de la tabla G). Duplicado U5 marcado SUPERSEDIDO/CONSOLIDADO en el cierre (L149–L152, nota editorial R-10.8). Todas las filas de referencia del manifiesto existen con hashes coincidentes. |
| F-13 | §8.4: §11 y §12 dicen lo mismo | Lectura de informe L509 (§11 H-B2) y L561 (§12 A2A) | **ÉXITO (menor) → d-04.** «No “Verificado en vivo”» frente a «confirmado en vivo … (F-E15)». Conciliable solo por cronología y por una distinción terminológica no definida en un solo lugar. |
| F-14 | Informe de corrección §4: los hashes G listados son los vigentes | Comparación §4 (L121–L129) vs P3 §6 (L343–L345) y manifiesto | **ÉXITO (menor) → d-05.** §4 lleva hashes P2 superados sin nota de superado. |
| F-15 | A-01 M-02: alguna etiqueta EVIDENCE del texto previo al Addendum F descansa en «index» o «heredado» por referencia no textual | Recuentos de ocurrencias + inspección de L57 | **FRACASO (parcial, ver §5).** «heredado» 1× (L57, descriptivo) e «index» 0× en L1–L272: ninguna etiqueta puede citar esas palabras en línea. La dependencia por cadena de referencias no se re-probó exhaustivamente (limitación). |

---

## 5. Puntos irresolubles o limitaciones de esta pasada

1. **JavaScript del HTML no ejecutado en navegador vivo.** Como en F y en las Pasadas 2–3, la verificación del HTML es estática (parseo + hash del `<script>` idéntico a F2 + resolución de anclas). Un defecto que solo se manifestara en ejecución (filtro/búsqueda) no habría sido detectado. La paridad byte a byte del script con F2 reduce, pero no elimina, ese riesgo.
2. **Sin acceso al remoto GitHub (NOT_CONNECTED).** Las afirmaciones de contexto sobre HEAD `7870a6ab…`, los 7 archivos F publicados y los 6 solo locales se toman de la Pasada 1 (matriz), no se re-verificaron en esta pasada. El objeto de este ataque son las copias G, no la rama.
3. **I-02 sigue abierta por diseño.** La sustancia de C05 no está re-verificada contra el tag v1.0.1; las notas A-02 la registran como instantánea histórica 2026-11-05. Esta pasada verificó `latest` y v0.2.6 en vivo, no el tag v1.0.1. La fila §12 A2A (informe L561) dice «ruta versionada v1.0.1 leída 2026-11-07»: eso registra una lectura, no una re-verificación de sustancia; la tensión aparente con I-02 es heredada de F/MUSE-003 y la nota C05 la mantiene explícitamente abierta, por lo que no se cuenta como defecto nuevo.
4. **M-02 (A-01) verificada solo textualmente.** Los recuentos de palabras son exactos, pero una dependencia de etiqueta EVIDENCE por cadena de referencias (no por mención en línea) exigiría re-auditar cada etiqueta del cierre L1–L272; no se hizo. El riesgo residual es bajo (las palabras no aparecen) pero no nulo.
5. **Alcance sustantivo no re-auditado.** Esta pasada no re-audita M02/M03/M03-B, los veredictos C01–C16, las 13 filas §12 más allá de los pasajes tocados por G, ni la matriz de diagnóstico de la Pasada 1 más allá de un muestreo de coherencia (§6–§8, D-H1). Los defectos listados son los de la entrega G; la ausencia de más defectos no certifica el fondo heredado.
6. **La corrección de D-02 (residuo B-02) es una decisión de gate, no de esta pasada.** Esta revisión no elige entre extender la redacción singular-neutra o conservar el plural con justificación; solo constata la inconsistencia y exige que la decisión quede escrita en el propio dossier, no solo en el informe de corrección.

---

## 6. Método y alcance (resumen)

- Solo lectura sobre `~/workspace/research_notes/nexo-autonomy-004-g/` y sus contextos F / MUSE-004 / MUSE-003. Ningún archivo existente modificado; único archivo creado: este informe.
- Herramientas: `sha256sum`, `diff`, `grep`/`grep -o`/`grep -c`, Python (`html.parser`, extracción y normalización de texto, comparación MD↔HTML), `browser.open`/`browser.find` sobre la especificación oficial A2A (`latest` y `v0.2.6`, crawl 2026-11-08 07:57 UTC, el mismo citado por la Pasada 2).
- Criterio de severidad: CRÍTICO = estado, veredicto, hash o PASS falseado, o integridad rota. MAYOR = inconsistencia material o dato de verificación falso en la entrega. MENOR = imprecisión de presentación, metadato o localización sin efecto sobre estados ni veredictos.
- Conteo final: **CRÍTICOS 0 · MAYORES 2 (D-01, D-02) · MENORES 5 (d-01–d-05).** Veredicto: **PARCIAL**. No LISTO PARA REVISIÓN FINAL hasta corregir D-01 y D-02 (o decidir D-02 por gate con constancia en el dossier).
