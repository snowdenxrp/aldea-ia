# MISIÓN MUSE-AUTONOMY-004-G — PASADA 2: INFORME DE CORRECCIÓN

**Misión:** MUSE-AUTONOMY-004-G — remediación adversarial, reconciliación y verificación final de R2.
**Pasada:** 2 — Corrección. Trabajo exclusivamente documental, sobre **copias de revisión nuevas G**.
**Fecha:** 2026-11-08.
**Entradas:** `MUSE_004_F_ADVERSARIAL_REVIEW.md` (Pasada 4 de MUSE-004-F, §2.1 A-01/A-02/A-03, §2.2 B-01–B-09, §3, §4), `MUSE_004_F_CORRECTION_REPORT.md` (Pasada 2 de F), `MUSE_004_F_D01_SOURCE_EVIDENCE.md` (evidencia oficial A2A, consulta 2026-11-08), copias base en `nexo-autonomy-004-f/review-f/`, paquete aprobado `MUSE_AUTONOMY_003_R2_RECTIFICATION_PACKET_DRAFT.md`.
**Dictamen de la pasada:** **4 defectos tratados** — A-01, A-02, A-03 y C-01 **CORREGIDOS**; precisiones B-06 y B-07 (menores, mismo Addendum F) corregidas junto con A-01. **No se declara PASS.** No se modificó ningún original, ningún canónico R2, ninguna copia F2 ni ningún archivo de MUSE-003/MUSE-004. No se publicó ni fusionó nada. No se tomó ninguna decisión D-01 a D-12. Ningún UNKNOWN se convirtió en RESUELTO por inferencia.

**Estados vigentes que NO cambian:** U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL.

---

## 1. Resumen por defecto

| Defecto | Estado | Qué se hizo |
|---|---|---|
| A-01 (Addendum F: ausencias que el propio archivo refuta) | **CORREGIDO** | Las 4 viñetas de recuento (M-01, M-02, M-04, D-01) quedan acotadas «en el texto anterior a este addendum»; M-02 precisa la unicidad sobre ese texto (L57). B-06 (U2-a/b/c en el resumen) y B-07 (salvedad §8.4) corregidas en el mismo addendum. |
| A-02 (dependencia C05 incompleta; C01 §4.6 y R4 §4.5 sin anotar) | **CORREGIDO** | Notas de C05, R1(a) y fila §12 A2A completadas con §4.3 y §4.5 y sus ubicaciones actuales (§7.3, §7.6); C01 §4.6 y R4 §4.5 anotados como punteros históricos. Verificado en vivo en `latest` y en v0.2.6 el 2026-11-08 (ver §2.2). D-01 no se re-abre. |
| A-03 («resúmenes independientes» en C09, C12, §10) | **CORREGIDO** | Calificación «independientes» retirada en los 3 pasajes × 2 formatos; quedan como «resúmenes que citan la primaria», no nombrados y sin independencia comprobable, conforme a la nota de limitación de §12. |
| C-01 (Anexo A del HTML F2) | **CORREGIDO** | Anexo A actualizado a los artefactos G realmente entregados en ambos formatos: nombres, rutas y manifiesto `hashes-r2-rectification-review-g.md` (7 ocurrencias en el HTML G; 0 en el HTML F2); tabla G con hashes reales en el informe; fila de la nota de método añadida. |

---

## 2. Correcciones aplicadas, defecto por defecto

### 2.1 A-01 — Contradicciones del Addendum F (CORREGIDO)

**Verificación previa (cierre F2, texto anterior al Addendum F, L1–L272):** `vault` 0, `HSM` 0, `trust_remote_code` 0, `agent.json` 0, `heredado` 1 (L57, «metadatos heredados», descriptivo), `index` 0. Las afirmaciones eran verdaderas de ese texto y falsas del archivo completo una vez añadido el Addendum F que las enuncia — exactamente como diagnosticó la revisión F (§2.1 A-01). La corrección adoptada es la propuesta por Fase F: acotar cada afirmación al texto anterior al addendum. La viñeta M-03 (cierre F2 L285) no afirma ningún recuento y no necesitaba corrección: se verificó y se deja intacta.

**Ubicaciones:** `closure-r2-rectified-review-g.md`, viñetas del Addendum F §(b) (F2 L283, L284, L286, L287 → G L283, L284, L286, L287) y §(c) (F2 L292 → G L292). El cierre no tiene equivalente HTML (el HTML es el informe); A-01 no tiene pasajes en informe/HTML salvo el registro G que lo documenta.

**Redacciones anteriores → nuevas (fragmentos cambiados):**

- **M-01 (G L283):** «Verificado: 0 ocurrencias de «vault»/«HSM» en todo el cierre.» → «Verificado: 0 ocurrencias de «vault»/«HSM» en el texto anterior a este addendum. [Rectificación MUSE-004-G (A-01): la afirmación se acota al texto anterior a este addendum; los términos aparecen en esta misma viñeta al enunciar la verificación.]» Y «Sin cambio de texto en el cierre.» → «Sin cambio en el texto anterior a este addendum.»
- **M-02 (G L284):** «Ninguna etiqueta EVIDENCE de este cierre descansa en «index» o «heredado» (la única «heredado» del cierre es «metadatos heredados», en sentido descriptivo, no como respaldo de evidencia).» → «Ninguna etiqueta EVIDENCE del texto anterior a este addendum descansa en «index» o «heredado» (la única ocurrencia de «heredado» en ese texto es «metadatos heredados», L57, en sentido descriptivo, no como respaldo de evidencia). [Rectificación MUSE-004-G (A-01): la afirmación se acota al texto anterior a este addendum; la unicidad se verifica sobre ese texto.]» Además: «quedan reclasificadas en las copias f2 del informe y del HTML; el cierre no las contenía y no se reescribe. Sin cambio de texto en el cierre.» → «quedan reclasificadas en las copias f2 del informe y del HTML, y se conservan en las copias g; el cierre no las contenía y no se reescribe. Sin cambio en el texto anterior a este addendum.»
- **M-04 (G L286):** «Verificado: 0 ocurrencias de «trust_remote_code» en todo el cierre.» → «Verificado: 0 ocurrencias de «trust_remote_code» en el texto anterior a este addendum. [Rectificación MUSE-004-G (A-01): …]» Y «corregida en f2. Sin cambio de texto en el cierre.» → «corregida en f2. Sin cambio en el texto anterior a este addendum.»
- **D-01 (G L287):** «Verificado: 0 ocurrencias de «agent.json» en todo el cierre.» → «Verificado: 0 ocurrencias de «agent.json» en el texto anterior a este addendum. [Rectificación MUSE-004-G (A-01): …]» Y «re-anclada en el informe y el HTML f2. Sin cambio de texto en el cierre.» → «re-anclada en el informe y el HTML f2. Sin cambio en el texto anterior a este addendum.»

**B-06 (G L292, §(c) Estados preservados):** «- **UNKNOWN:** U2, U3 y U5 permanecen abiertos (U2 y U3 como cuestiones generales; U5 con sus sub-UNKNOWNs conservados).» → «- **UNKNOWN:** U2, U3 y U5 permanecen abiertos (U2 con su división U2-a/b/c restituida — U2-a existencia, U2-b parámetros, U2-c definición de «caso» —; U3 como cuestión general; U5 con sus sub-UNKNOWNs conservados). [Rectificación MUSE-004-G (A-01/B-06): restituida la subdivisión U2-a/b/c en este resumen, conforme al informe (§3, U2) y al propio cierre (L113, L246).]» La línea idéntica del Addendum MUSE-003 §(c) (cierre G L255) es historia de MUSE-003 y se deja intacta deliberadamente (ver §6).

**B-07 (G L288, viñeta D-02):** «…lecturas verbatim pendientes (SP 800-63B-4, PDF final de IR 8547, spec A2A §8.4) que ya se cerraron el 2026-11-07.» → «…que ya se cerraron el 2026-11-07, con la salvedad vigente de que la confirmación de la spec A2A §8.4 (MAY/SHOULD) se hizo solo en la spec `latest` por el Frente E (F-E15), no verificada contra el tag v1.0.1 ni archivada con instantánea. [Rectificación MUSE-004-G (A-01/B-07): añadida la salvedad vigente de §8.4, omitida en el Addendum F.]»

**Addendum G (cierre G L304–L332):** nueva sección que documenta las cuatro correcciones G en el cierre. Su §(c) adopta la redacción exacta de estados que el resumen ejecutivo (handoff G, a redactar por el coordinador) debe espejar para expresar el mismo estado — constancia exigida por la tarea:

> - **UNKNOWN:** U2, U3 y U5 permanecen abiertos (U2 con su división U2-a/b/c restituida — U2-a existencia, U2-b parámetros, U2-c definición de «caso» —; U3 como cuestión general; U5 con sus sub-UNKNOWNs conservados).
> - **RESUELTOS con alcance acotado:** U1, U4, U6, U7, U8 y U9. No quedan registros U1–U9 en estado PARCIAL.
> - **C14:** PARCIALMENTE CONFIRMADA.
> - **D-01 a D-12:** SIN DECIDIR.
> - **Cierre sustantivo global:** PARTIAL.
> - **Publicación e integridad documental R2:** se conserva íntegra; el PASS se limita estrictamente a la publicación e integridad de los documentos enumerados.

Ninguna obligación cambia de estado por A-01. El banner superior del cierre (G L3) pasa a identificar la copia como G.

### 2.2 A-02 — Referencias A2A incompletas (CORREGIDO)

**Investigación nueva (estrictamente la autorizada para verificar estas referencias):** `browser.search`/`browser.open` sobre la especificación oficial A2A, consulta 2026-11-08.

**Evidencia consultada:**

| Fuente | URL | Versión / fecha de consulta | Sección y texto que la sustenta |
|---|---|---|---|
| Spec `latest` (renderizada) | https://a2a-protocol.org/latest/specification/ | `latest`, se autodenomina «Latest Released Version `1.0.0`»; crawl 2026-11-08 07:57 UTC; 5.887 líneas | §1 «Introduction» (L16; cita L18–20: «an open standard designed to facilitate communication and interoperability between independent, potentially opaque AI agent systems»); §3.3 «Operation Semantics» (L811); §4.3 «Push Notification Objects» (L1415); §4.5 «Security Objects» (L1667); §4.6 «Extensions» (L1826); §5.1 «Functional Equivalence Requirements» (L2078); §5.3 «Method Mapping Reference» (L2098); §7 «Authentication and Authorization» (L3234); §7.3 «Client Authentication Process» (L3251), «2. **Credential Acquisition (Out-of-Band):** The client obtains the necessary credentials through an out-of-band process…» (L3255); §7.5 «Server Authorization Responsibilities» (L3270), «Authorization logic is implementation-specific» (L3272); §7.6 «In-Task Authorization» (L3283); §8 «Agent Discovery: The Agent Card» (L3372); §8.1 «Purpose» (L3374); §8.2 «Discovery Mechanisms» (L3381); §8.4 «Agent Card Signing» (L3418), «Agent Cards **MAY** be digitally signed using JSON Web Signature (JWS)…» (L3420), «Clients **SHOULD** verify at least one signature before trusting an Agent Card» (L3650). La frase citada de §3.3 («Identity information is not transmitted within A2A JSON-RPC payloads…») tiene **cero ocurrencias** en `latest` (búsqueda de texto completo). |
| Instantánea v0.2.6 (renderizada) | https://a2a-protocol.org/v0.2.6/specification | v0.2.6, cabecera «**Version:** `dev`» (L4); crawl 2026-11-08 07:57 UTC; 3.564 líneas | §3.3 «Streaming Transport (Server-Sent Events)» (L99); «Identity information is **not** transmitted within A2A JSON-RPC payloads; it is handled at the HTTP transport layer.» (L109–110); §4.3 «Client/User Identity & Authentication Process» (L124), «2. **Credential Acquisition (Out-of-Band):** … through an **out-of-band process** … outside the scope of the A2A protocol itself.» (L129–130); §4.5 «In-Task Authentication (Secondary Credentials)» (L147); §4.6 «Authorization» (L161), «Authorization logic is implementation-specific» (L164); §5.1 «Purpose» (L178), «The Agent Card is a JSON document that describes the server's identity, capabilities, skills, service endpoint URL…» (L180); §5.3 «Recommended Location» (L196), «`https://{server_domain}/.well-known/agent.json`» (L198–199). |

**Conclusión de la verificación:** las atribuciones históricas de C05 son literales en v0.2.6 (§3.3 identidad en capa HTTP; §4.3 credenciales fuera de banda; §4.5 autenticación secundaria en tarea; §4.6 autorización «implementation-specific»; §5.1 Agent Card; §5.3 `agent.json`). En `latest` (2026-11-08) ninguno de esos números resuelve al mismo contenido: §3.3 «Operation Semantics», §4.3 «Push Notification Objects», §4.5 «Security Objects», §4.6 «Extensions», §5.1 «Functional Equivalence Requirements», §5.3 «Method Mapping Reference»; los contenidos están hoy en §7.3 (credenciales fuera de banda), §7.5 (autorización), §7.6 (autorización en tarea) y §8.1–§8.2 (Agent Card). §1 sigue siendo «Introduction» y §8.4 sigue siendo «Agent Card Signing» con MAY (firma JWS opcional) y SHOULD (verificación por el cliente): la confirmación F-E15 se re-verifica vigente hoy; no se tocó ninguna afirmación §8.4. D-01 (§6.1 R7, v0.2.6 + commit 0858ddb) **no se re-abre**: ninguna corrección A-02 lo requiere; R7 queda byte a byte intacto en informe y HTML (verificado por diff: ningún hunk lo toca).

**Correcciones aplicadas (informe G y HTML G, mismo texto salvo marcado):**

| Pasaje | F2 → G (líneas) | Antes → después (fragmento) |
|---|---|---|
| §3 C05 | informe F2 L130 → G L143; HTML F2 L342 → G L355 | Nota F «los punteros §3.3/§4.6/§5.1 corresponden…: §3.3 es hoy «Operation Semantics», §4.6 «Extensions» y §5.1 «Functional Equivalence Requirements»» → «los punteros §3.3/§4.3/§4.5/§4.6/§5.1 corresponden…: §3.3 es hoy «Operation Semantics», §4.3 «Push Notification Objects», §4.5 «Security Objects», §4.6 «Extensions» y §5.1 «Functional Equivalence Requirements»». «el contenido de autorización «implementation-specific» está hoy en §7.5, la adquisición de credenciales fuera de banda en §7.3 y la Agent Card en §8.1–§8.2.» → «…está hoy en §7.5 «Server Authorization Responsibilities», la adquisición de credenciales fuera de banda en §7.3 «Client Authentication Process», la autenticación secundaria en tarea en §7.6 «In-Task Authorization» y la Agent Card en §8.1–§8.2.» Añadida marca G: completada la enumeración con §4.3 y §4.5, omitidos en la nota F; verificado en vivo en `latest` y en v0.2.6 el 2026-11-08 — en v0.2.6 §4.3 es «Client/User Identity & Authentication Process», §4.5 «In-Task Authentication (Secondary Credentials)» y §4.6 «Authorization»; la sustancia de C05 sigue sin re-verificarse contra el tag v1.0.1 (I-02 abierta). |
| §3 C01 | informe F2 L98 → G L111; HTML F2 L302 → G L315 | «A2A §4.6 — la autorización es "implementation-specific".» (bajo encabezado EVIDENCE, sin nota) → misma frase + «[Rectificación MUSE-004-G (A-02): puntero histórico — §4.6 corresponde a la numeración de la era 0.2.x/0.3.x (página `dev` leída 2026-11-05; en la instantánea v0.2.6 §4.6 es «Authorization» y la frase citada es literal); en el canal `dev`/`latest` actual (consultado 2026-11-08) §4.6 es «Extensions» y el contenido está en §7.5 «Server Authorization Responsibilities» («Authorization logic is implementation-specific»). La afirmación se conserva como verificación histórica 2026-11-05, no como cita vigente del canal vivo.]» La etiqueta EVIDENCE de C01 se conserva como verificación histórica (decisión F-4, no re-abierta). |
| §6.1 R1(a) | informe F2 L290 → G L303; HTML F2 L637 → G L650 | Nota F (punteros §5.1/§4.6/§3.3 desplazados; ver nota en §3 C05) → misma nota + «[Rectificación MUSE-004-G (A-02): la nota de §3 C05 queda completada con §4.3 y §4.5, también desplazados (hoy §7.3 y §7.6); esta fila no cita §4.3/§4.5, por lo que su enumeración no cambia.]» |
| §6.1 R4 | informe F2 L293 → G L306; HTML F2 L652 → G L665 | «La spec prevé autenticación secundaria en tarea (§4.5, verificado en vivo) y push notifications…» → «La spec prevé autenticación secundaria en tarea (§4.5 histórico — numeración de la era 0.2.x/0.3.x, verificado en vivo 2026-11-05; en el canal `dev`/`latest` actual, consultado 2026-11-08, §4.5 es «Security Objects» y el contenido está en §7.6 «In-Task Authorization» [Rectificación MUSE-004-G (A-02)]) y push notifications…» El riesgo sigue como HYPOTHESIS/riesgo a confirmar contra la spec antes de cualquier adopción. |
| §12 fila A2A | informe F2 L548 → G L561; HTML F2 L1266 → G L1279 | «Verificado en vivo para las secciones listadas;» → «Verificado en vivo para las secciones listadas, como instantánea histórica 2026-11-05 (numeración de la era 0.2.x/0.3.x);» Nota F «la URL `pr-849` y los punteros §3.3/§4.6/§5.1/§5.3 corresponden a la lectura 2026-11-05; en el canal `dev`/`latest` actual (2026-11-08) §5.3 es «Method Mapping Reference»…» → «la URL `pr-849` y los punteros §3.3/§4.3/§4.5/§4.6/§5.1/§5.3 corresponden a la lectura 2026-11-05; en el canal `dev`/`latest` actual (2026-11-08) §3.3 es «Operation Semantics», §4.3 «Push Notification Objects», §4.5 «Security Objects», §4.6 «Extensions», §5.1 «Functional Equivalence Requirements» y §5.3 «Method Mapping Reference»; los contenidos citados están hoy en §7.3 (credenciales fuera de banda), §7.5 (autorización «implementation-specific»), §7.6 (autorización en tarea) y §8.1–§8.2 (Agent Card); el well-known `agent.json` solo se reproduce en la instantánea v0.2.6 (ver §6.1 R7). No se sustituye «dev» por «latest».] [Rectificación MUSE-004-G (A-02): completada la enumeración con §4.3 y §4.5 y con las ubicaciones actuales; verificado en vivo en `latest` y en v0.2.6 el 2026-11-08.]» La celda de secciones listadas («§1, §3.3, §4.3, §4.5, §4.6, §5.1, §5.3») no cambia: es la lista histórica, ahora calificada como tal. |

**Otras referencias A2A revisadas y no tocadas (verificación completa del expediente):** §1 (C05, estable en `latest`); §5.3/§8.2 en R7 (re-anclaje D-01, intacto); §8.4 en R1(b), §12 y §11 (MAY/SHOULD re-confirmados hoy en `latest`, L3420/L3650; salvedad F-E15 vigente, ver B-07); «A2A fijado a v1.0.1» (registro R-10, afirmación de versión, no de sección); cierre §116–123 (gobernanza U4, sin secciones de la spec). No se reemplazó ninguna referencia histórica por una actual: cada puntero histórico conserva su significado temporal (instantánea 2026-11-05 / era 0.2.x/0.3.x) y la ubicación actual se añade como información, no como sustitución.

### 2.3 A-03 — Independencia de fuentes no demostrada (CORREGIDO)

**Barrido completo de expresiones de independencia de fuentes** (informe y HTML G): las únicas afirmaciones vivas de independencia de *resúmenes de corroboración* eran las tres diagnosticadas (C09, C12, §10 ítem 9). Revisadas y conservadas por no afirmar independencia de fuentes: §0 «fuentes que reescriben un mismo comunicado no cuentan como corroboraciones independientes» (regla definitoria, no afirmación); registro F M-04 y nota §12 (citan la fórmula retirada como lo retirado); C07 «dos fuentes maestras independientes» (describe el error corregido, no una afirmación); T9/U9 «monitores independientes» (requisito arquitectónico, no fuentes); nota de método «agentes independientes» (pasadas de auditoría, otro sentido). Ninguna fuente se identificó por nombre/publicación/autor/URL en C09/C12/§10 porque el expediente no las nombra (nota de limitación de §12, L576 en F2 / L589 en G: «los resúmenes de corroboración citados en §3 (C09, C12, R2c) no se nombran en este expediente; su independencia no es comprobable desde aquí»); por tanto no se pudo demostrar independencia y se degradó la afirmación, sin inventar fuentes ni relaciones.

**Correcciones (mismo texto en ambos formatos):**

| Pasaje | F2 → G (líneas) | Antes → después |
|---|---|---|
| §3 C09 | informe F2 L162 → G L175; HTML F2 L382 → G L395 | «existencia y texto apoyados en resúmenes independientes que citan la primaria (corroborado 2026-11-05)» → «existencia y texto apoyados en resúmenes que citan la primaria (resúmenes no nombrados; su independencia no es comprobable desde aquí — nota de limitación de §12; corroborado 2026-11-05)». Marca G añadida al final de la línea. Etiqueta CORROBORATED sin cambio. |
| §3 C12 | informe F2 L186 → G L199; HTML F2 L412 → G L425 | «(existencia de los controles apoyada en resúmenes independientes que citan la primaria, 2026-11-05;» → «(existencia de los controles apoyada en resúmenes que citan la primaria, no nombrados y sin independencia comprobable — nota de limitación de §12 —, 2026-11-05;». Marca G añadida. Etiqueta CORROBORATED sin cambio. |
| §10 ítem 9 | informe F2 L516 → G L529; HTML F2 L1087 → G L1100 | «existencia y texto corroborados por resúmenes independientes que citan la primaria;» → «existencia y texto corroborados por resúmenes que citan la primaria (resúmenes no nombrados; su independencia no es comprobable desde aquí — nota de limitación de §12);». Marca G añadida. |

**Verificación:** 0 ocurrencias restantes de «resúmenes independientes» como afirmación viva en informe y HTML G. Las 3 restantes están en citas de lo retirado o en la regla definitoria de §0 (informe G L73, HTML G L283: equivalencia retirada «≥2 resúmenes independientes»; cierre G L245: Addendum MUSE-003 citando la equivalencia retirada). La regla «≥2 fuentes independientes» **no** se recupera en ninguna forma: la fila HF §12 y R2c conservan su redacción sin «independientes». Distinción aplicada: diversidad de documentos / diversidad de autores / independencia epistemológica — el expediente no demuestra ninguna de las tres para estos resúmenes, y así queda escrito.

### 2.4 C-01 — Anexo A del HTML F2 (CORREGIDO)

**Hallazgo F verificado por esta pasada antes de corregir:** en el HTML F2, `hashes-r2-rectification-review-f2.md` aparece 0 veces; el Anexo A nombra `report-r2-rectified-review.md`, `expediente-consolidado-nexo-r2-rectified-review.html`, `closure-r2-rectified-review.md` y `hashes-r2-rectification-review.md` (archivos MUSE-004, no F2); la nota de método F2 no tiene fila. En el informe F2 el Anexo A (L580–L616) no listaba ningún artefacto de revisión. Cada hash se calculó con `sha256sum` sobre el archivo final (ver §4).

**Correcciones:**

| Ubicación | F2 → G | Antes → después |
|---|---|---|
| Informe, Anexo A | F2 L580–L616 → G L593–L639 (tabla nueva G L597–L605) | Sin tabla de revisión → tabla «Documentos de esta revisión G» con los 5 archivos G: informe (ver manifiesto — un archivo no puede contener su propio hash), cierre 48.472 bytes `cec384d7…82864`, HTML 192.418 bytes `881802cf…8d5`, método 13.351 bytes `5356bd1c…3c9bf`, manifiesto —. Rutas `research_notes/nexo-autonomy-004-g/review-g/…`. |
| HTML, Anexo A, párrafo | F2 L1469 → G L1482 | «Documentos de esta revisión rectificada (MUSE-AUTONOMY-004). … se registran en el manifiesto externo.» → «Documentos de esta revisión rectificada (MUSE-AUTONOMY-004-G). … se registran en el manifiesto externo `hashes-r2-rectification-review-g.md`. … [Rectificación MUSE-004-G (C-01): nombres actualizados a los artefactos G realmente entregados; el manifiesto G aparece en esta tabla, 0 veces en el Anexo A F2.]» |
| HTML, Anexo A, tabla de revisión | F2 L1473–L1476 → G L1486–L1490 | Filas MUSE-004 (`report-r2-rectified-review.md`, `expediente-consolidado-nexo-r2-rectified-review.html`, `closure-r2-rectified-review.md`, `hashes-r2-rectification-review.md`) → filas G (`report-r2-rectified-review-g.md`, `expediente-consolidado-nexo-r2-rectified-review-g.html`, `closure-r2-rectified-review-g.md`, `hashes-r2-rectification-review-g.md`), todas con «ver `hashes-r2-rectification-review-g.md`» salvo el manifiesto (—). **Fila nueva:** `consolidation-method-rectified-review-g.md` (nota de método, alternativa B). |
| Cierre, viñeta D-02 | F2 L288 → G L288 | Nombre de método F2 → añadida marca G: «en esta copia G el archivo es `consolidation-method-rectified-review-g.md`; la alternativa B sigue pendiente de decisión del gate.» (ver §2.1). |
| Método, banner y § «Etiquetas» | F2 L3/L54 → G L3/L54; sección nueva G L85–L87 | Banner «ALTERNATIVA B (MUSE-AUTONOMY-004-F…) … en el informe f2 y en el Addendum F del cierre f2» → «ALTERNATIVA B (MUSE-AUTONOMY-004-G, 2026-11-08; alternativa preparada en MUSE-AUTONOMY-004-F y actualizada en G) … en el informe g y en los Addenda F y G del cierre g», con marca G. «conforme a §0 del informe rectificado f2 (M-02)» → «…informe rectificado g (M-02)». Sección «Actualización G (MUSE-AUTONOMY-004-G, 2026-11-08)»: taxonomía y lista UNKNOWN sin cambio; salvedad §8.4 conservada; decisión de gate pendiente. |

**Verificación del Anexo A y del manifiesto:** el manifiesto G lista los 4 archivos G con los hashes de §4, coincidentes con los del Anexo A del informe G; el HTML G nombra el manifiesto G 7 veces y el manifiesto F2 0 veces; nombres MUSE-004 en el Anexo A del HTML G: 0. El Anexo A conserva intactas las tablas históricas R2/R1/P1–P7 (sus hashes no se tocan: son referencia histórica verificada en R2).

**Identidad G (consecuente con C-01, no contenido nuevo):** título HTML «R2 RECTIFICADO G» (G L8), subtítulo y mission-line (G L133, L135), bandera G (G L138), meta «Rectificación posterior» (G L143), entrada TOC del registro G (G L169), pie (G L1637), registro G en informe (G L46–L57) y HTML (G L216–L226), banner del cierre (G L3). El registro F se conserva íntegro como historial en ambos formatos.

---

## 3. Método usado para el HTML (ND-G1)

`artifact.create_web_static` y `artifact.export` **no están disponibles en esta sesión de subagente**: el namespace `artifact` cargado expone solo `restore`/`share`/`unshare` (igual que en la sesión de Pasada 2 de Fase F, ND-F1). No se simuló ninguna reconstrucción. **Método aplicado:** parcheo de bytes — las mismas correcciones, con conteo exacto por reemplazo (cada reemplazo con aserto de unicidad), sobre los bytes del HTML rectificado F2, preservando estructura, navegación, tablas, referencias internas y el JavaScript de búsqueda/filtro.

**Verificación posterior del HTML G:** parseo estructural sin errores y sin etiquetas sin cerrar; 17 secciones abiertas y cerradas (16 en F2 + 1 registro G); 30 anclas internas resuelven, 0 sin destino, 0 IDs duplicados (incluidas `#registro-de-rectificacion-muse-004-g` y `#anexo-a-archivos-generados-y-hashes`); bloque `<script>` byte-idéntico al de F2 (mismo SHA-256); comparación normalizada MD↔HTML de los 12 pasajes corregidos (C01, C05, C09, C12, R1(a), R4, §10, §12 A2A, registro G, Anexo A, y las dos marcas de método) — mismo texto visible en ambos formatos. No se ejecutó el JavaScript en un navegador en vivo (no disponible en esta sesión de subagente), igual que en F.

---

## 4. Archivos G creados

*Nota (MUSE-004-G, corrección post-Pasada 5, d-05): los tamaños y hashes de esta tabla corresponden al estado Pasada 2 y quedaron superados por la Pasada 3; los valores vigentes están en §6 y en el manifiesto G. Los diffs de la línea siguiente son asimismo del estado Pasada 2; los definitivos tras la Pasada 3 están en §6.*

| Archivo | Bytes | Líneas | SHA-256 |
|---|---|---|---|
| `review-g/report-r2-rectified-review-g.md` | 155.684 | 639 | `d5167fbc5636ed7867655dc0ac533a6dbcc88a3a1a8067fa6a71adfffa18b56a` |
| `review-g/closure-r2-rectified-review-g.md` | 48.472 | 332 | `cec384d74c8eb18f06d989f75b1a6e5bd20147fb4dbfce67da1ff62d5f182864` |
| `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 192.418 | 1.740 | `881802cf7c159be0268a64e325d5ba3c7eea655f2bb449a5813c9adaa591d8d5` |
| `review-g/consolidation-method-rectified-review-g.md` | 13.351 | 87 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| `review-g/hashes-r2-rectification-review-g.md` | 6.508 | — | `cabba5dd0da2253496f3712e82d0e5b8148d1d1f281e8b5b9eaea2c2ec49f68d` (hash propio, registrado aquí como evidencia externa) |

Diffs f2 → g (comando `diff`, recuentos de líneas eliminadas/añadidas): informe **8 / 31** (616 → 639 líneas); cierre **7 / 38** (301 → 332); HTML **18 / 32** (1.726 → 1.740); nota de método **2 / 6** (83 → 87). Cada hunk pertenece a A-01, A-02, A-03, C-01 (incluidas B-06/B-07 en el Addendum F) o al etiquetado G consecuente (título, masthead, TOC, registro G, Addendum G, Anexo A). Ningún cambio de redacción, reordenamiento o afirmación nueva fuera de ese alcance. El cierre conserva su texto anterior a los addenda íntegro (0 eliminadas en L1–L272).

---

## 5. Verificación de que Markdown y HTML G coinciden en los pasajes corregidos

Método: extracción de texto del HTML G (etiquetas retiradas, espacios colapsados) y comparación por pasaje contra el Markdown G.

- **Presencia:** 12 pasajes corregidos verificados presentes en ambos formatos (C01, C05, C09, C12, R1(a), R4, §10 ítem 9, §12 A2A, registro G, Anexo A, bandera/masthead G, pie G). Recuentos de marcas `[Rectificación MUSE-004-G]` en estado P2 (re-medidos en G tras la Pasada 5): informe 11 líneas con marca (9 sustantivas + 2 plantillas «A-xx/C-xx»), HTML 12 líneas (9 sustantivas + 3 plantillas), cierre 8, nota de método 2. [Corrección MUSE-004-G post-Pasada 5 (d-02): los valores «informe 12, HTML 17» no se reproducen.]
- **Comparación normalizada exacta** (mismo texto visible): C01, C05 (enumeración y ubicaciones), C09, C12, R1(a), R4, §10, §12 A2A — **idénticos** en ambos formatos salvo espaciado de marcado en los bordes de elementos `<code>`.
- **Restos:** 0 ocurrencias en informe y HTML G de «resúmenes independientes» como afirmación viva; 0 ocurrencias de nombres de archivo MUSE-004/F2 en el Anexo A del HTML G; 0 ocurrencias de `hashes-r2-rectification-review-f2.md` en el HTML G; 0 anclas sin destino; 0 IDs duplicados.
- **Recuentos A-01 re-verificados en el cierre G:** en el texto anterior al Addendum F (L1–L272): `vault` 0, `HSM` 0, `trust_remote_code` 0, `agent.json` 0, `heredado` 1 (L57). Las cuatro viñetas corregidas dicen ahora exactamente eso de ese texto.

---

## 6. Instancias que NO pudieron corregirse o que se dejan deliberadamente sin corregir, con su motivo

| Instancia | Ubicación (G) | Motivo |
|---|---|---|
| B-01 — «EVIDENCE corroborado» como texto vivo en §11 B14 | informe G L497; HTML G L1073 | Fuera del alcance de esta pasada (defecto menor de F, no uno de los cuatro mayores). Se conserva por diseño como historial fechado de R1 (decisión F-3: anotar, no reescribir); la anotación F que lo neutraliza sigue vigente. No se reabre aquí. |
| B-02 — plural no verificado en la fila HF §12 («resúmenes … no nombrados») | informe G L566; HTML G L1319 | Fuera de alcance (menor). El plural sigue afirmando multiplicidad sin nombrar ningún resumen; mitigado por la divulgación explícita en la propia celda. La corrección A-03 no lo agrava ni lo resuelve. |
| B-03 — C16 CORROBORATED con cifras sin trazabilidad por cifra (F-E20b) | informe G L231–L233; HTML G L464 | Fuera de alcance (menor, tensión definitoria). Degradar a HYPOTHESIS borraría que las cifras son, en sustancia, correctas; la limitación está divulgada en la propia línea. |
| B-04 — C14: la partición por componente no nombra la inferencia FIPS 186-5 §7 | informe G L213; HTML G L442 | Fuera de alcance (menor). La inferencia está divulgada en el cuerpo del pasaje; solo el encabezado no la nombra. |
| B-05 — divergencia definitoria §0 vs §12 (vía del «cálculo reproducible») | informe §0 / §12 | Fuera de alcance (menor). Sin efecto operativo en este dossier (ningún caso descansa EVIDENCE solo en cálculo con procedencia heredado/index). |
| B-08 — paréntesis «(Fase A, INC-01)» tras «decisión del gate» | informe G L31; HTML G L202 | Fuera de alcance (menor, redacción). La corchete de rectificación F que sigue lo desambigua por completo. |
| B-09 — «15 líneas» para el registro F (informe de corrección F §4 y manifiesto F2) | No está en las copias G | No se repite en ningún archivo G: el registro F ocupa 12 líneas (informe G L33–L44) y este informe declara los diffs F2→G correctos (§4). La afirmación errónea queda solo en los documentos F, que se conservan como historial. |
| I-02 — sustancia de C05 no re-verificada contra el tag v1.0.1 | §3 C05, §6.1 R1(a), fila §12 A2A | Fuera de alcance por diseño: re-verificar la sustancia contra el tag v1.0.1 con instantánea archivada es decisión de gate (ND-F2). Los punteros quedan registrados como instantánea histórica 2026-11-05. |
| M-03, viñeta del Addendum F | cierre G L285 | No necesitaba corrección: no afirma ningún recuento. Verificada y dejada intacta. |
| Línea UNKNOWN idéntica del Addendum MUSE-003 §(c) | cierre G L255 | Historia de MUSE-003, no del Addendum F. Corregirla reescribiría MUSE-003; B-06 se aplica solo a la L292 del Addendum F. |
| C01/R1(a): etiquetas EVIDENCE conservadas como verificación histórica | informe G L111/L303; HTML G L315/L650 | Decisión F-4, no re-abierta: la spec se leyó en vivo el 2026-11-05 con citas textuales (hoy verificadas literales en v0.2.6). Degradarlas contradiría ese registro. |

---

## 7. Decisiones de criterio documentadas (no son decisiones D-01 a D-12)

1. **A-01: acotar, no borrar.** Las viñetas del Addendum F se conservan como historial de lo que F afirmó, acotadas a su ámbito verdadero (texto anterior al addendum). Borrarlas habría borrado el registro de la verificación F.
2. **A-02: anotar, no sustituir.** Ningún puntero histórico se reemplaza por su ubicación actual: la ubicación actual se añade como información. Sustituir habría cambiado el significado temporal de afirmaciones verificadas en 2026-11-05 (y verificadas hoy literales en v0.2.6).
3. **A-03: degradar, no inventar.** Al no poder identificar los resúmenes por nombre, publicación, autor u organismo, no se afirma ni se niega su independencia: se retira la calificación y se deja constancia de que no es comprobable desde el expediente.
4. **C-01: punteros en el HTML, hashes reales en el informe.** El HTML no puede contener su propio hash ni el del informe sin circularidad (cada uno contiene el hash del otro): el Anexo A del HTML usa «ver manifiesto externo» y el Anexo A del informe lleva los hashes reales de cierre, HTML y método, y remite al manifiesto para el propio informe. El manifiesto G es la única fuente de los cinco hashes juntos.
5. **B-06/B-07 junto con A-01.** Son menores, pero viven en las mismas viñetas del Addendum F que A-01 corregía; dejarlas habría dejado el Addendum F inexacto en el mismo acto de corregirlo. Se documentan como tales, no como defectos mayores.

---

## 8. Confirmación de integridad: bases F2, originales y canónicos intactos

Hashes SHA-256 recalculados por esta pasada con `sha256sum` sobre los bytes de cada archivo (2026-11-08). Todos coinciden con lo declarado en la revisión F §4 y en el manifiesto F2.

| Archivo | Bytes | SHA-256 recalculado | Coincide |
|---|---|---|---|
| `nexo-autonomy-004-f/review-f/report-r2-rectified-review-f2.md` | 147.584 | `dacefd69a40ed28d924e2dee1faceca5ef85230182c829dcae84fff6634b6546` | Sí |
| `nexo-autonomy-004-f/review-f/closure-r2-rectified-review-f2.md` | 42.702 | `80a82481f12def6bf09034e47edbabdd447528da382848eb2d6124473ba68023` | Sí |
| `nexo-autonomy-004-f/review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html` | 184.564 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` | Sí |
| `nexo-autonomy-004-f/review-f/consolidation-method-rectified-review-f2.md` | 12.800 | `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636` | Sí |
| `nexo-autonomy-004-f/review-f/hashes-r2-rectification-review-f2.md` | 5.248 | `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0` | Sí |
| `nexo-autonomy-004/branch/report-r2.md` (canónico) | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | Sí |
| `nexo-autonomy-004/branch/closure-r2.md` (canónico) | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` | Sí |
| `nexo-autonomy-004/branch/hashes-r2.md` (canónico) | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | Sí |
| `nexo-autonomy-004/branch/consolidation-method.md` (canónico) | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | Sí |

**Hash propio del manifiesto G (evidencia externa):** `hashes-r2-rectification-review-g.md` (6.508 bytes) — SHA-256 `cabba5dd0da2253496f3712e82d0e5b8148d1d1f281e8b5b9eaea2c2ec49f68d`.

Ningún archivo original, canónico, F2 o de MUSE-003/MUSE-004 fue modificado por esta pasada (solo lectura; los únicos archivos escritos son los cinco G y este informe).

---

## 9. Para el gate (decisiones del propietario, no de esta pasada)

1. **D-02:** elegir entre **A** (canónico intacto, con la divergencia documentada) y **B** (copia G actualizada de la alternativa B). Sin esta decisión, el dossier G convive con el mismo canónico contradictorio que el dossier F2.
2. **I-02 / ND-F2:** decidir si se re-verifica la sustancia de C05/R1(a) contra el tag v1.0.1 con instantánea archivada, o si basta el registro de los punteros como instantánea histórica 2026-11-05 (ahora completo, con §4.3 y §4.5).
3. **ND-G1:** decidir si el HTML G (corrección directa sobre los bytes F2, verificada por extracción y parseo) es aceptable como entrega, o si se regenera con `artifact.create_web_static` en una sesión con esa función disponible.
4. **Cierre:** el estado sustantivo sigue PARTIAL; no se declara PASS. Ninguna de estas decisiones es D-01 a D-12.

---

# Pasada 3 — Hallazgos menores B-01–B-09

**Misión:** MUSE-AUTONOMY-004-G — remediación adversarial, reconciliación y verificación final de R2.
**Pasada:** 3 — Corrección de los nueve hallazgos menores B-01–B-09 de la revisión adversarial F (§2.2).
**Fecha:** 2026-11-08.
**Entradas:** `MUSE_004_F_ADVERSARIAL_REVIEW.md` (§2.2 B-01–B-09, leído íntegro antes de corregir; no se trabajó desde resúmenes), copias G en `review-g/` (estado Pasada 2), `MUSE_004_F_D01_SOURCE_EVIDENCE.md` (solo como referencia de contexto; esta pasada no re-verificó fuentes primarias).
**Dictamen de la pasada:** **6 defectos CORREGIDOS** (B-01, B-02, B-03, B-04, B-05, B-08); **2 YA CORREGIDOS POR LA PASADA 2 — VERIFICADOS** (B-06, B-07, sin cambio adicional); **1 NO PROCEDE** (B-09, verificado ausente en las copias G). **No se declara PASS.** No se modificó ningún original, ningún canónico R2, ninguna copia F2 ni ningún archivo de MUSE-003/MUSE-004. No se publicó ni fusionó nada. No se tomó ninguna decisión D-01 a D-12. Ningún UNKNOWN se convirtió en RESUELTO.

**Estados vigentes que NO cambian:** U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL.

## 1. Resumen por hallazgo

| Hallazgo | Estado | Qué se hizo |
|---|---|---|
| B-01 («EVIDENCE corroborado» como texto vivo, §11 B14) | **CORREGIDO** | Etiqueta contradictoria retirada como texto vivo en informe L497 y HTML L1073; la etiqueta vigente pasa a ser CORROBORATED y la redacción histórica exacta queda citada en el registro F (L40). |
| B-02 (plural no verificado en la fila HF §12) | **CORREGIDO** | Plural «resúmenes» retirado de la celda HF en informe L566 y HTML L1319; el apoyo queda «sin identificar en número» y sin independencia comprobable. Ámbito acotado a la celda diagnosticada (ver §2.2). |
| B-03 (C16 CORROBORATED sin trazabilidad por cifra, F-E20b) | **CORREGIDO** | Precisada la base de CORROBORATED en informe L233 y HTML L467: la etiqueta se sostiene por la declaración «Verificado» de M03 §5 sobre el conjunto, no por verificación por cifra. Etiqueta sin cambio. |
| B-04 (C14: encabezado sin FIPS 186-5 §7) | **CORREGIDO** | Encabezado C14 ampliado en informe L215 y HTML L445: tercer componente nombrado (INFERENCE para la inclusión de Ed25519 vía FIPS 186-5 §7). |
| B-05 (divergencia §0 vs §12: vía del «cálculo reproducible») | **CORREGIDO** | §12 alineada con §0 en informe L538 y HTML L1108: añadida la vía del «cálculo reproducible». Nota de método (L54) ya seguía la versión de §0; sin cambio. |
| B-06 (U2 sin U2-a/b/c en el resumen del cierre) | **YA CORREGIDO POR LA PASADA 2 — VERIFICADO** | Cierre G L292 lleva la subdivisión con sus tres definiciones; Addendum G L315/L323 la documenta y repite. Sin cambio en esta pasada. |
| B-07 (salvedad §8.4 omitida en D-02 del Addendum F) | **YA CORREGIDO POR LA PASADA 2 — VERIFICADO** | Cierre G L288 lleva la salvedad (F-E15, `latest`, sin tag v1.0.1 ni instantánea); coherente con informe L561 y método L68. Sin cambio en esta pasada. |
| B-08 (paréntesis «(Fase A, INC-01)» tras «decisión del gate») | **CORREGIDO** | Paréntesis retirado en informe L31 y HTML L202; la secuencia documental queda en el corchete F que sigue. 0 ocurrencias restantes en las copias G. |
| B-09 («15 líneas» para el registro F; son 12) | **NO PROCEDE — verificado ausente** | 0 ocurrencias de «15 líneas» en las cinco copias G. El registro F ocupa el informe G L33–L44 (12 líneas). La afirmación errónea vive solo en documentos F, que se conservan como historial. |

## 2. Verificación de las afirmaciones de la Pasada 2 sobre B-06, B-07 y B-09

Verificadas las tres de forma independiente sobre los archivos G, no dadas por válidas:

- **B-06 — CONFIRMADA.** Cierre G L292: «- **UNKNOWN:** U2, U3 y U5 permanecen abiertos (U2 con su división U2-a/b/c restituida — U2-a existencia, U2-b parámetros, U2-c definición de «caso» —; U3 como cuestión general; U5 con sus sub-UNKNOWNs conservados). [Rectificación MUSE-004-G (A-01/B-06): …]». Addendum G §(b) L315 documenta la corrección y §(c) L323 repite la redacción corregida. La subdivisión se conserva además en el informe G (L44, L57), en el propio cierre (L113, L246) y en la nota de método (L60). La línea idéntica del Addendum MUSE-003 §(c) (cierre G L255) se deja intacta deliberadamente: es historia de MUSE-003, no del Addendum F (criterio ya registrado en §6 de la Pasada 2).
- **B-07 — CONFIRMADA.** Cierre G L288: las tres lecturas verbatim «ya se cerraron el 2026-11-07, con la salvedad vigente de que la confirmación de la spec A2A §8.4 (MAY/SHOULD) se hizo solo en la spec `latest` por el Frente E (F-E15), no verificada contra el tag v1.0.1 ni archivada con instantánea. [Rectificación MUSE-004-G (A-01/B-07): …]». Coherencia verificada: la salvedad se conserva en la fila §12 A2A del informe G (L561: «§8.4 (firma JWS opcional MAY, verificación SHOULD) confirmado en vivo en la spec `latest` por el Frente E de MUSE-003 (F-E15); no verificado contra el tag v1.0.1 ni archivado con instantánea») y en la nota de método G (L68). Addendum G L316 documenta la corrección.
- **B-09 — CONFIRMADA.** `grep -rn "15 líneas"` sobre `review-g/` devuelve 0 ocurrencias. El registro F ocupa el informe G L33–L44: 12 líneas (encabezado L33, párrafo de fuente L35, 6 viñetas L37–L42, párrafo de estados L44), el mismo recuento que la revisión F (§2.2 B-09). La afirmación errónea («15 líneas») está solo en el informe de corrección F (§4) y en el manifiesto F2, documentos de proceso de Fase F que se conservan como historial y no son copias G; no hay nada que corregir en las copias G.

## 3. Correcciones aplicadas, hallazgo por hallazgo

Método común: parcheo de bytes con aserto de unicidad por reemplazo (cada fragmento antiguo con conteo exacto 1 en su archivo y en su línea esperada; el script aborta sin escribir si un aserto falla). Todas las ediciones son dentro de línea: ningún archivo cambia su número de líneas, por lo que todas las referencias por línea de la Pasada 2 siguen vigentes. Cada corrección lleva su marca `[Rectificación MUSE-004-G (B-0x)]` en ambos formatos. No se añadió ninguna sección de registro nueva al informe ni al HTML: la trazabilidad de la Pasada 3 vive en las marcas en línea y en esta sección del informe de corrección.

### 3.1 B-01 — «EVIDENCE corroborado» como texto vivo (CORREGIDO)

**Ubicaciones:** informe G L497 (§11 B14, punto (3)); HTML G L1073. **Defecto (F §2.2 B-01):** el dossier contenía como texto operativo una etiqueta («EVIDENCE corroborado») que su propio §0 y su propia M-04 declaran no vigente; la única protección era la anotación que la seguía en la misma frase. Un lector que extrajera etiquetas por búsqueda encontraba 2 ocurrencias en el informe (L40, cita en el registro F, y L497, esta).

**Corrección (mismo texto en ambos formatos, salvo marcado):** «(c) `trust_remote_code=True` ejecuta código del repositorio — EVIDENCE corroborado [Rectificación MUSE-004-F (M-04, m-07): etiqueta histórica de R1, conservada como historial; la etiqueta vigente es CORROBORATED (§6.1 R2c)];» → «(c) `trust_remote_code=True` ejecuta código del repositorio — CORROBORATED [Rectificación MUSE-004-F (M-04, m-07): la etiqueta histórica de R1 queda registrada como historial en el registro F (M-04); la etiqueta vigente es CORROBORATED (§6.1 R2c)] [Rectificación MUSE-004-G (B-01): retirada la etiqueta contradictoria como texto vivo; la redacción histórica exacta se conserva citada en el registro F (M-04).];»

**Criterio:** se retira la etiqueta contradictoria, no la historia. La redacción histórica exacta se conserva citada en el registro F (informe L40, HTML L210: «La etiqueta histórica «EVIDENCE corroborado» de §11 B14 queda anotada como historial; la vigente es CORROBORATED»), y en la revisión F y el informe de corrección F. La marca G no repite la frase exacta, deliberadamente, para que el recuento por grep sea verificable. **Verificación:** `grep "EVIDENCE corroborado"`: informe 1 (L40, cita del registro F), HTML 1 (L210, cita del registro F). **Consistencia:** la etiqueta vigente CORROBORATED coincide con §6.1 R2c y con la fila §12 HF; ningún otro pasaje cita B14 como EVIDENCE.

### 3.2 B-02 — Plural no verificado en la fila HF §12 (CORREGIDO, con ámbito acotado)

**Ubicaciones:** informe G L566 (celda de nivel de la fila HF §12); HTML G L1319. **Defecto (F §2.2 B-02):** la nueva redacción F2 («Corroborado (resúmenes que citan la primaria, no nombrados; …)») seguía afirmando multiplicidad y citación de la primaria sin nombrar ni contar ningún resumen; la propia afirmación de que existen (varios) resúmenes que citan la primaria no es comprobable desde el dossier.

**Corrección (mismo texto en ambos formatos, salvo marcado):** «Corroborado (resúmenes que citan la primaria, no nombrados; página primaria no leída línea a línea en este run) [Rectificación MUSE-004-F (M-04): retirada la fórmula «≥2 fuentes independientes», retirada por R-04 en §0; los resúmenes no se nombran y su independencia no es comprobable desde aquí (nota de limitación del mismo §12). El hecho —`trust_remote_code=True` ejecuta código del repositorio— no se cuestiona; solo su respaldo de independencia.]» → «Corroborado (apoyo secundario que cita la primaria, sin identificar en número; página primaria no leída línea a línea en este run) [Rectificación MUSE-004-F (M-04): retirada la fórmula «≥2 fuentes independientes», retirada por R-04 en §0; el apoyo secundario no se nombra y su independencia no es comprobable desde aquí (nota de limitación del mismo §12). El hecho —`trust_remote_code=True` ejecuta código del repositorio— no se cuestiona; solo su respaldo de independencia.] [Rectificación MUSE-004-G (B-02): retirado el plural no verificado «resúmenes»; el apoyo queda sin identificar en número y sin independencia comprobable.]»

**Ámbito acotado (decisión documentada, no omisión):** la corrección se aplica a la celda diagnosticada por B-02. El plural «resúmenes que citan la primaria» sobrevive en C09 (informe L175), C12 (L199), §10 ítem 9 (L529), la fila §12 SP 800-53 (L570), el párrafo definitorio de §12 (L538) y la fila R2c (informe L304; HTML L655): es la fórmula aprobada por la Pasada 2 (A-03) y el modelo que la propia revisión F elogia para R2c («está limpio […] y demuestra que la redacción correcta ya existía como modelo», F §2.1 A-03). Extender la redacción singular-neutra a esos pasajes reabriría A-03, ya cerrada en esta misión; queda como residuo documentado para el gate (ver §7). La cita de la celda antigua en el registro F (informe L40, HTML L210: «queda «Corroborado (resúmenes que citan la primaria, no nombrados; …)»») se deja intacta: cita con exactitud lo que hizo F2 y es historia, no texto vivo de la celda. [Corrección MUSE-004-G post-Pasada 5 (D-02/d-03): la cita «HTML L1351» era falsa — L1351 es la fila SP 800-53; R2c está en informe L304 y HTML L655. La decisión de ámbito acotado queda superada: tras el defecto mayor D-02 de la Pasada 5, la redacción singular-neutra SÍ se extendió a los pasajes vivos en G — la lógica de B-02 (plural no verificado) se aplica al cómputo, sin reabrir A-03, que resolvió la calificación de independencia («independientes»), no el cómputo; la redacción singular-neutra no reintroduce ninguna afirmación de independencia. Las citas L40/L210 se actualizan en consecuencia a la redacción vigente.]

### 3.3 B-03 — C16: CORROBORATED con cifras sin trazabilidad por cifra (CORREGIDO, etiqueta sin cambio)

**Ubicaciones:** informe G L233; HTML G L467. **Defecto (F §2.2 B-03):** tensión definitoria real: la definición §0 glosa CORROBORATED para lo heredado como «soporte comprobado en la fase de origen, no re-verificado aquí», pero para C16 la propia nota admite que M03 §5 declara las cifras «Verificado» sin atar cada cifra a su fuente (F-E20b): la comprobación por cifra en la fase de origen es exactamente lo que falta.

**Corrección (mismo texto en ambos formatos, salvo marcado):** «lo verificado (heredado M03; CORROBORATED — cifras sin trazabilidad por cifra en este expediente, ver F-E20b):» → «lo verificado (heredado M03; CORROBORATED — con salvedad: M03 §5 declara el conjunto «Verificado» sin atar cada cifra a su fuente (F-E20b), por lo que la comprobación por cifra en la fase de origen no es reproducible desde aquí; la etiqueta no afirma verificación por cifra):», con marca G al final de la línea: «[Rectificación MUSE-004-G (B-03): precisada la base de CORROBORATED para las cifras materiales; la etiqueta se sostiene por la declaración «Verificado» de M03 §5 sobre el conjunto, no por verificación por cifra.]»

**Criterio:** no se degrada a HYPOTHESIS (la revisión F lo desaconseja: borraría que las cifras son, en sustancia, correctas) y no se toca §0. La tensión se resuelve por acotación en el propio pasaje: la base de CORROBORATED queda explicitada como la declaración «Verificado» de M03 §5 sobre el conjunto, no como verificación por cifra; la glosa general de §0 describe el caso general y C16 lleva su base más estrecha escrita en línea. No se introduce ninguna afirmación nueva: la marca M-02 de la misma línea ya decía que M03 §5 «las declara «Verificado» sin atar cada cifra a su fuente». **Consistencia:** veredicto CONFIRMADA de C16 sin cambio; HYPOTHESIS/UNKNOWN para la imposibilidad universal se conserva.

### 3.4 B-04 — C14: la partición por componente no nombra la inferencia FIPS 186-5 §7 (CORREGIDO)

**Ubicaciones:** informe G L215; HTML G L445. **Defecto (F §2.2 B-04):** el encabezado partía la evidencia en IR 8547 (EVIDENCE) y FIPS 203/204/205 (CORROBORATED), pero no el tercer componente (FIPS 186-5 §7), que es el que sostiene la inclusión de Ed25519; un lector que leyera solo el encabezado podía atribuir a EVIDENCE-para-IR-8547 una conclusión que es, por el propio texto, inferencia en dos pasos. El cuerpo ya la divulgaba; el Frente D la clasificó CORROBORATED / INFERENCE.

**Corrección (mismo texto en ambos formatos, salvo marcado):** encabezado «**Evidencia primaria (EVIDENCE para IR 8547, texto final leído íntegramente por el Frente D de MUSE-003, 2.204 líneas; CORROBORATED para FIPS 203/204/205, heredado M03):**» → «**Evidencia primaria (EVIDENCE para IR 8547, texto final leído íntegramente por el Frente D de MUSE-003, 2.204 líneas; CORROBORATED para FIPS 203/204/205, heredado M03; INFERENCE para la inclusión de Ed25519 vía FIPS 186-5 §7 (dos pasos, no mención literal en IR 8547)):**», con marca G al final de la línea: «[Rectificación MUSE-004-G (B-04): la partición del encabezado nombra ahora el tercer componente (FIPS 186-5 §7, INFERENCE); la inferencia ya estaba divulgada en el cuerpo.]»

**Consistencia:** INFERENCE existe en la taxonomía de §0 («conclusión derivada de hechos disponibles») y coincide con la clasificación del Frente D; el cuerpo del pasaje no cambia (ya divulgaba la inferencia en dos pasos y las cero ocurrencias literales de «Ed25519» en IR 8547). C14 sigue PARCIALMENTE CONFIRMADA; ningún otro pasaje atribuye la inclusión de Ed25519 a EVIDENCE.

### 3.5 B-05 — Divergencia definitoria entre §0 y §12 (CORREGIDO)

**Ubicaciones:** informe G L538 (§12); HTML G L1108. **Defecto (F §2.2 B-05):** las dos formulaciones de la misma regla diferían: §0 (informe L73, HTML L283) permite conservar EVIDENCE si «su fuente primaria fue consultada directamente en el pasaje pertinente en este expediente o su cálculo es reproducible»; §12 decía solo «su nivel es CORROBORATED salvo lectura primaria directa en este expediente» (sin vía de cálculo). La nota de método G (L54) seguía la versión de §0 («o cálculo/prueba reproducible con entradas y método identificables»).

**Corrección (mismo texto en ambos formatos):** «Una fila con procedencia index/heredado no sostiene por sí sola una etiqueta EVIDENCE; su nivel es CORROBORATED salvo lectura primaria directa en este expediente.» → «… salvo lectura primaria directa en este expediente o cálculo reproducible.», con marca G al final del párrafo: «[Rectificación MUSE-004-G (B-05): añadida la vía del «cálculo reproducible» a §12, conforme a §0 y a la nota de método; ambas formulaciones de la regla quedan alineadas.]»

**Criterio:** se alinea §12 con §0 (dos fuentes —§0 y nota de método— contra una —§12—), no al revés. Sin efecto operativo, como ya señalaba la revisión F: ningún caso descansa EVIDENCE solo en cálculo con procedencia heredado/index (C11, el único caso de cálculo, se apoya además en lectura directa del PDF de Miller y sus filas §12 incluyen el PDF primario HELM de 162 páginas). La nota de método no necesita cambio.

### 3.6 B-06 — U2 sin U2-a/b/c en el resumen del cierre (YA CORREGIDO POR LA PASADA 2 — VERIFICADO)

Sin edición en esta pasada. Evidencia de la verificación en §2. Ningún estado cambia: U2 (U2-a/b/c) sigue UNKNOWN.

### 3.7 B-07 — Salvedad §8.4 omitida en D-02 del Addendum F (YA CORREGIDO POR LA PASADA 2 — VERIFICADO)

Sin edición en esta pasada. Evidencia de la verificación en §2. Ningún estado cambia: la salvedad es de verificación (F-E15), no de estado; U1/U4/U6/U7/U8/U9 siguen RESUELTOS como dice el Addendum F.

### 3.8 B-08 — Paréntesis «(Fase A, INC-01)» tras «decisión del gate» (CORREGIDO)

**Ubicaciones:** informe G L31 (límite de alcance); HTML G L202. **Defecto (F §2.2 B-08):** INC-01 es la entrada diagnóstica de Fase A, no un identificador de una decisión del gate; el paréntesis tras «decisión del gate» podía leerse como si la decisión del gate fuera «Fase A, INC-01». La corchete de rectificación F que sigue lo desambiguaba por completo.

**Corrección (mismo texto en ambos formatos, salvo marcado):** «…su tratamiento queda pendiente de decisión del gate (Fase A, INC-01). [Rectificación MUSE-004-F (M-03): Fase A documentó el problema (INC-01) y difirió la decisión a «Fase B / gate»; el gate no ha decidido; no existe decisión de Fase A de excluirlo.]» → «…su tratamiento queda pendiente de decisión del gate. [Rectificación MUSE-004-F (M-03): …] [Rectificación MUSE-004-G (B-08): retirado el paréntesis ambiguo tras «decisión del gate»; la secuencia documental queda en el corchete F que precede.]» (La marca G no repite el paréntesis retirado, para que el recuento por grep sea verificable.)

**Verificación:** `grep "(Fase A, INC-01)"` sobre `review-g/`: 0 ocurrencias. La viñeta M-03 del registro F (informe L39, HTML L209) formula la secuencia sin ambigüedad y no se toca. La atribución falsa sigue corregida: 0 ocurrencias de «decisión de Fase A (INC-01)» (ya verificado en F §3.5).

### 3.9 B-09 — «15 líneas» para el registro F (NO PROCEDE — verificado ausente)

Sin edición en esta pasada. Evidencia de la verificación en §2. La afirmación errónea vive solo en el informe de corrección F (§4) y en el manifiesto F2; esos documentos se conservan como historial de Fase F y no son copias G. Corregirlos reescribiría el registro de otra misión.

## 4. Diff estadístico de la Pasada 3, por archivo

Recuentos con `diff` (líneas eliminadas / añadidas). Todas las ediciones de la Pasada 3 son modificaciones dentro de línea (0 líneas añadidas o eliminadas netas en informe y HTML); los números de línea citados por la Pasada 2 siguen vigentes.

| Archivo | Pasada 3 sola (vs estado Pasada 2) | Acumulado f2 → g (Pasada 2 + Pasada 3) |
|---|---|---|
| `review-g/report-r2-rectified-review-g.md` | **7 / 7** (6 pasajes: L31, L215, L233, L497, L538, L566; + fila Anexo A del HTML) | **14 / 37** (Pasada 2: 8 / 31; la fila Anexo A ya contaba como añadida en Pasada 2, por eso el acumulado no suma 15 / 38) |
| `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | **6 / 6** (L202, L445, L467, L1073, L1108, L1319) | **24 / 38** (Pasada 2: 18 / 32) |
| `review-g/closure-r2-rectified-review-g.md` | **0 / 0** (B-06/B-07 ya corregidos; sin cambio) | 7 / 38 (Pasada 2, sin cambio) |
| `review-g/consolidation-method-rectified-review-g.md` | **0 / 0** | 2 / 6 (Pasada 2, sin cambio) |
| `review-g/hashes-r2-rectification-review-g.md` | **2 filas actualizadas + 1 viñeta añadida** (6.508 → 7.152 bytes) | Tabla reescrita en G (ver manifiesto) |

Cada hunk de la Pasada 3 pertenece a B-01, B-02, B-03, B-04, B-05, B-08 o a la actualización consecuente de hashes (Anexo A del informe, manifiesto). Ningún cambio de redacción, reordenamiento o afirmación nueva fuera de ese alcance.

## 5. Verificación MD↔HTML de cada corrección

Método: extracción de texto del HTML G (etiquetas retiradas, entidades resueltas, espacios colapsados) y comparación por pasaje contra el Markdown G, con los artefactos de marcado ya documentados en F §3.9 (`**` de negrita, `*` de cursiva, espacios en bordes de `<code>`, delimitador `|` de tabla, espacio antes de puntuación tras `</em>`).

| Pasaje | MD | HTML | Resultado |
|---|---|---|---|
| B-01 (§11 B14) | L497 | L1073 | **Idéntico** (texto visible) |
| B-02 (celda HF §12) | L566 | L1319 | **Idéntico** (contenido de la celda; el `\|` final es delimitador de tabla MD) |
| B-03 (C16) | L233 | L467 | **Idéntico** |
| B-04 (C14) | L215 | L445 | **Idéntico** (tras retirar artefactos de marcado) |
| B-05 (§12) | L538 | L1108 | **Idéntico** |
| B-06 | cierre L292 | — (el cierre no tiene equivalente HTML) | Verificado en cierre (§2); Addendum G L315/L323 |
| B-07 | cierre L288 | — (el cierre no tiene equivalente HTML) | Verificado en cierre (§2); informe L561, método L68 |
| B-08 (límite de alcance) | L31 | L202 | **Idéntico** |
| B-09 | — | — | 0 ocurrencias de «15 líneas» en ambos formatos |

Recuentos de marcas `[Rectificación MUSE-004-G (B-0x)]`: informe 6, HTML 6 (B-01, B-02, B-03, B-04, B-05, B-08, una por pasaje y formato). Recuentos de control tras la corrección: «EVIDENCE corroborado» 1 por formato (solo cita del registro F, L40/L210); «(Fase A, INC-01)» 0; «15 líneas» 0.

**Estructura del HTML G tras la Pasada 3:** parseo sin errores y sin etiquetas sin cerrar; 17 secciones abiertas y cerradas (16 en F2 + 1 registro G, sin cambio); 30 anclas internas resuelven, 0 sin destino, 0 IDs duplicados; bloque `<script>` byte-idéntico al de F2 (SHA-256 `ee5a2b2a9402c8dd…`, mismo prefijo que en F §3.11). No se ejecutó el JavaScript en un navegador en vivo (no disponible en esta sesión de subagente), igual que en F y en la Pasada 2.

**Método usado para el HTML (ND-G1, sin cambio):** `artifact.create_web_static` y `artifact.export` no están disponibles en esta sesión de subagente (igual que en la Pasada 2). No se simuló ninguna reconstrucción. Método aplicado: parcheo de bytes — las mismas correcciones, con conteo exacto por reemplazo (cada reemplazo con aserto de unicidad), sobre los bytes del HTML G de la Pasada 2.

## 6. Archivos G tras la Pasada 3 y recálculo del manifiesto

Hashes SHA-256 recalculados por esta pasada con `sha256sum` sobre los bytes finales de cada archivo (2026-11-08). El manifiesto G se recalculó: sus filas del informe y del HTML llevan los valores nuevos; las filas del cierre y de la nota de método no cambian; se añadió una viñeta en su sección «Verificación» documentando la Pasada 3. El Anexo A del informe G lleva el nuevo hash del HTML (L603); el Anexo A del HTML G sigue remitiendo al manifiesto externo, sin hashes.

| Archivo | Bytes | Líneas | SHA-256 (Pasada 3) | SHA-256 (Pasada 2) |
|---|---|---|---|---|
| `review-g/report-r2-rectified-review-g.md` | 157.071 | 639 | `bd34107e71afa092d8e9fbb1523e7048dbca620f90fb228adb96b8393f9b4694` | `d5167fbc…8b56a` |
| `review-g/closure-r2-rectified-review-g.md` | 48.472 | 332 | `cec384d74c8eb18f06d989f75b1a6e5bd20147fb4dbfce67da1ff62d5f182864` (sin cambio) | `cec384d7…82864` |
| `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 193.805 | 1.740 | `9cdaa60b148860ceb0a84b8dbe007e57235767ed2ba8e603e08f4c949576f93f` | `881802cf…8d5` |
| `review-g/consolidation-method-rectified-review-g.md` | 13.351 | 87 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` (sin cambio) | `5356bd1c…3c9bf` |
| `review-g/hashes-r2-rectification-review-g.md` | 7.152 | 59 | `aeb80880e942a2284973bce4ce9aa26a56270cf2258b5c52c6ce2ba1639b2e78` (hash propio, evidencia externa aquí) | `cabba5dd…9f68d` |

**Hash propio del manifiesto G (evidencia externa):** `hashes-r2-rectification-review-g.md` (7.152 bytes) — SHA-256 `aeb80880e942a2284973bce4ce9aa26a56270cf2258b5c52c6ce2ba1639b2e78`. El manifiesto no puede contener su propio hash; se registra aquí, como hizo la Pasada 2 con `cabba5dd…9f68d`.

**Bases F2, originales y canónicos intactos (recalculados por esta pasada, todos coinciden con F §4 y con §8 de la Pasada 2):** informe F2 `dacefd69…b6546` (147.584), cierre F2 `80a82481…8023` (42.702), HTML F2 `28e2b188…751f` (184.564), método F2 `b8711617…5636` (12.800), manifiesto F2 `2f2e7da5…39a0` (5.248); canónicos report-r2 `e41c8f3b…80a`, closure-r2 `0d9ed5ff…0f`, hashes-r2 `cde302f0…ace4`, consolidation-method canónico `7295fedb…24285`. Ningún resto de los hashes de la Pasada 2 (`d5167fbc…`, `881802cf…`) queda en `review-g/` (grep: 0 ocurrencias).

## 7. Decisiones de criterio documentadas (no son decisiones D-01 a D-12)

1. **B-01: retirar la etiqueta, conservar la cita.** La historia no se borra: la redacción exacta sobrevive citada en el registro F. La marca G no repite la frase para que el recuento por grep sea verificable.
2. **B-02: corregir la celda, no reabrir A-03.** El plural sobrevive en C09/C12/§10/R2c/§12 como fórmula aprobada por la Pasada 2 y modelo elogiado por la revisión F; extender la redacción singular-neutra reabriría A-03. El gate puede decidir extenderla; esta pasada no lo hace.
3. **B-03: precisar, no degradar.** Degradar C16 a HYPOTHESIS borraría que las cifras son, en sustancia, correctas (F §2.2 B-03). La base de CORROBORATED queda explicitada en línea.
4. **B-05: alinear §12 con §0.** Dos fuentes (§0, nota de método) contra una (§12). Sin efecto operativo en este dossier.
5. **B-06/B-07: verificar, no re-corregir.** Ya estaban corregidos por la Pasada 2; re-editarlos habría añadido ruido y riesgo sin beneficio. Su verificación independiente es el entregable de esta pasada para ambos.
6. **B-09: no reescribir historia ajena.** Los documentos F con el error se conservan como registro de Fase F.

## 8. Para el gate (decisiones del propietario, no de esta pasada)

1. **Residuo B-02:** decidir si la redacción singular-neutra («apoyo secundario … sin identificar en número») se extiende a C09, C12, §10 ítem 9, la fila §12 SP 800-53, el párrafo definitorio de §12 y la fila R2c, o si se conserva la fórmula plural aprobada en A-03. Ninguna de las dos opciones cambia un estado.
2. **D-02, I-02 / ND-F2, ND-G1 y cierre PARTIAL:** sin cambio respecto a §9 de la Pasada 2. El estado sustantivo sigue PARTIAL; no se declara PASS. Ninguna de estas decisiones es D-01 a D-12.

---

## Corrección post-Pasada 5 (coordinador, 2026-11-08)

Tras las Pasadas 4 (reconciliación) y 5 (ataque adversarial), el coordinador aplicó una ronda final de corrección sobre las copias G. No se declara PASS. Estados sin cambio: U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS; C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre PARTIAL.

### Defectos corregidos

| Defecto | Corrección aplicada |
|---|---|
| D-01 de Pasada 5 (= C-1 de Pasada 4) | Manifiesto G, sección «Verificación»: diffs f2→g actualizados a los valores finales medidos (informe 21/44, cierre 7/38, HTML 32/46, método 2/6) y «12 pasajes» sustituido por los recuentos finales de marcas. |
| D-02 de Pasada 5 (residuo B-02) | Redacción singular-neutra extendida a los pasajes vivos: C09 (L175), C12 (L199), R2c (L304), §10 ítem 9 (L529), §12 párrafo definitorio (L538, segunda frase), fila §12 SP 800-53 (L570), celda «Consultada vía» de la fila HF (L566), nota §12 (L587) y nota de limitación §12 (L589), en ambos formatos; registros L40 (M-04), L54 (A-03) y L511 (H-04) actualizados a la redacción vigente, con marca (D-02). La decisión de ámbito acotado de la Pasada 3 (§7 de este informe) queda superada: la lógica de B-02 (plural no verificado) se aplica al cómputo, sin reabrir A-03 — A-03 resolvió la calificación de independencia («independientes»), no el cómputo, y la redacción singular-neutra no reintroduce ninguna afirmación de independencia. El párrafo definitorio de §12 (L538) conserva su primera frase sin cambio (la definición operativa ya era singular-neutra; el paréntesis enuncia la regla R-04, no afirma un cómputo). |
| d-01 de Pasada 5 (= C-3 de Pasada 4) | Cierre G, viñeta D-02: «B (copia f2 actualizada)» → «B (copia g)». |
| d-02 de Pasada 5 | §3.3 de este informe (L139): recuentos de marcas en estado P2 corregidos a los valores re-medidos (informe 11 líneas con marca — 9 sustantivas + 2 plantillas «A-xx/C-xx» —, HTML 12 líneas — 9 sustantivas + 3 plantillas —, cierre 8, nota de método 2). La discrepancia se explica: `grep -c` cuenta líneas, no ocurrencias; las plantillas «A-xx/C-xx» no son marcas de contenido. |
| d-03 de Pasada 5 | §7 de este informe (L255): «la fila R2c (HTML L1351)» → «la fila R2c (informe L304; HTML L655)». L1351 es la fila SP 800-53. |
| d-04 de Pasada 5 | Informe L509 y HTML L1081 (H-B2): aclaración añadida — la confirmación en vivo en la spec `latest` por el Frente E (F-E15), registrada en §12, es una verificación posterior distinta de la instantánea histórica 2026-11-05; no convierte §8.4 en lectura primaria del tag v1.0.1 ni en «Verificado en vivo» en el sentido de §12 para esa instantánea. |
| d-05 de Pasada 5 | §4 de este informe: nota añadida — los tamaños y hashes de la tabla corresponden al estado Pasada 2 y quedaron superados por la Pasada 3; los valores vigentes están en §6 y en el manifiesto G; los diffs de la línea siguiente son asimismo del estado Pasada 2. |

### Hashes finales de las copias G (recalculados con `sha256sum` tras esta ronda)

| Archivo | Bytes | SHA-256 |
|---|---|---|
| `review-g/report-r2-rectified-review-g.md` | 159.176 | `0b742e6711bbcc8c0acb5d35e425b63e61cd7e9b9ed2fdd7cb49288603ef8025` |
| `review-g/closure-r2-rectified-review-g.md` | 48.459 | `63c3277c18b69435b877bfa4dcadc9cbf4b1d377c94c46a17f637c5ed95da0c8` |
| `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 195.843 | `210e29ab96729c0a9ed47ccc1a5860bb7a9b9a054c767f9060361a4e0288d8d1` |
| `review-g/consolidation-method-rectified-review-g.md` | 13.351 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| `review-g/hashes-r2-rectification-review-g.md` | 8.058 | `996911b3c967bf5bef8dd2a59a693c793330e0458a685487cd1e65e9f63f4cee` |

**Hash propio del manifiesto G (evidencia externa):** `hashes-r2-rectification-review-g.md` (8.058 bytes) — SHA-256 `996911b3c967bf5bef8dd2a59a693c793330e0458a685487cd1e65e9f63f4cee`.

### Diffs finales f2 → g (medidos con `diff`)

Informe 21 eliminadas / 44 añadidas; cierre 7 / 38; HTML 32 / 46; nota de método 2 / 6. Marcas `[Rectificación MUSE-004-G]` finales (ocurrencias): informe 29 (24 líneas), HTML 30 (26 líneas; una plantilla «A-xx/C-xx» más que el informe, sin contenido), cierre 8, nota de método 2; marcas (D-02): 12 por formato; aclaración (d-04): 1 por formato.
