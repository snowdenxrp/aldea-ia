# MISIÓN MUSE-AUTONOMY-004-F — PASADA 2: INFORME DE CORRECCIÓN

**Misión:** MUSE-AUTONOMY-004-F — cierre adversarial de los seis defectos mayores de la rectificación R2.
**Pasada:** 2 — Corrección. Trabajo exclusivamente documental, sobre **copias de revisión nuevas F2**.
**Fecha:** 2026-11-08.
**Entradas:** `MUSE_004_F_DIAGNOSTIC_MATRIX.md` (Pasada 1), `MUSE_004_F_D01_SOURCE_EVIDENCE.md` (evidencia oficial A2A, consulta 2026-11-08), copias base en `nexo-autonomy-004-f/branch/`, paquete aprobado `MUSE_AUTONOMY_003_R2_RECTIFICATION_PACKET_DRAFT.md`.
**Dictamen de la pasada:** **6 defectos tratados** — M-01, M-02, M-03, M-04 y D-01 **CORREGIDOS**; D-02 con **alternativa B preparada, decisión pendiente de gate** (no es corregible por decisión editorial dentro de esta pasada, por diseño). **No se declara PASS.** No se modificó ningún original ni canónico. No se publicó ni fusionó nada. No se tomó ninguna decisión D-01 a D-12. Ningún UNKNOWN se convirtió en RESUELTO por inferencia.

**Estados vigentes que NO cambian:** U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL.

---

## 1. Resumen por defecto

| Defecto | Estado | Qué se hizo |
|---|---|---|
| M-01 (§6.4 ítem 2) | **CORREGIDO** | Ítem 2 dividido en cláusulas etiquetadas por separado en informe y HTML; cláusula vault/HSM como PROPOSAL. |
| M-02 (taxonomía `index`/`heredado`) | **CORREGIDO** | «Heredado» definido como procedencia, no nivel de evidencia (§0, §9, §12); reclasificadas C03, R3, C07, C13, C14-parte FIPS, C15, C16 y las 13 filas §12; controles sin contradicción conservados y documentados. |
| M-03 (atribución falsa a Fase A) | **CORREGIDO** | Registro L31 / HTML L198 reescrito: Fase A difirió al gate; el gate no ha decidido. |
| M-04 (fila HF `trust_remote_code`) | **CORREGIDO** | Celda §12 corregida en informe y HTML; B14 (m-07) anotado como historial, no reescrito. |
| D-01 (§6.1 R7, `agent.json`) | **CORREGIDO** | R7 re-anclada a v0.2.6 + commit 0858ddb (PR #841, 0.3.0, 2025-07-30); afirmación en presente sobre `dev` registrada como refutada; dependencia C05/R1(a)/§12-A2A registrada. |
| D-02 (`consolidation-method.md`) | **PARCIAL — decisión de gate** | Alternativa B preparada como copia independiente de revisión; no se elige entre A y B. |

---

## 2. Correcciones aplicadas, defecto por defecto

### 2.1 M-01 — §6.4 ítem 2: etiqueta mixta (CORREGIDO)

**Ubicación:** informe f2 §6.4 ítem 2 (antes L327); HTML f2 §6.4 ítem 2 (antes L820). Encabezado §6.4 sin cambio (su criterio ya era correcto).

**Redacción anterior:**
> `2. **[Norma (SP 800-63B-4, ámbito federal) + principio arquitectónico] Autenticación:** AAL3 = no-exportable + phishing-resistant + 2 factores; sincronizables solo ≤AAL2; claves raíz en vault/HSM separado del agente.`

**Redacción nueva:**
> `2. **[Norma (SP 800-63B-4, ámbito federal)] Autenticación — cláusulas normativas:** AAL3 = no-exportable + phishing-resistant + 2 factores; sincronizables solo ≤AAL2. **[PROPOSAL] Claves raíz en vault/HSM separado del agente.** [Rectificación MUSE-004-F (M-01): etiqueta separada por cláusula — las dos primeras cláusulas tienen respaldo normativo (SP 800-63B-4 §§2.3.2/3.2.13, leídos directamente 2026-11-07; M03 §2 corrección 02; Frente E F-E18); la cláusula final es PROPOSAL de diseño, no requisito NIST: SP 800-63B-4 regula autenticación federal y no impone vault/HSM para las claves raíz de Nexo. No se debilita ninguna salvaguarda propuesta; solo se corrige su atribución normativa.]`

**Fundamento:** matriz §2 (filas 2 y 7); Frente E F-E18; paquete R-09 («requisito normativo solo cuando la fuente primaria lo imponga expresamente y el ámbito coincida»); ítems 11 y 12 como modelo de delimitación (ítem 11 etiqueta PROPOSAL prudencial; ítem 12 delimita «inspirado en AC-5/SC-3, no prohibición literal de NIST»). Los ítems 1, 3–12 no se tocan. El cierre no contiene el ítem (0 ocurrencias de «vault»/«HSM»): su resumen R-09 pasa a ser exacto sin tocarlo, y así se registra en el Addendum F del cierre. **No queda nada parcial en M-01.**

### 2.2 M-02 — Taxonomía: «heredado» como procedencia, no como nivel de evidencia (CORREGIDO)

**Definición añadida** (§0 Nota de método, §9 primera viñeta, §12 definición de niveles, en informe y HTML):
> «heredado» es un atributo de procedencia —verificación hecha en M02/M03 y no repetida en este expediente—, NO un nivel de evidencia. Una afirmación heredada conserva EVIDENCE solo si su fuente primaria fue consultada directamente en el pasaje pertinente en este expediente o su cálculo es reproducible; en caso contrario su nivel es CORROBORATED (soporte comprobado en la fase de origen, no re-verificado aquí) o inferior según el caso. «Index» es asimismo procedencia y tampoco concede EVIDENCE.

**Reclasificaciones (informe y HTML, cada una con marca `[Rectificación MUSE-004-F (M-02)]`):**

| Pasaje | Antes | Después | Fundamento |
|---|---|---|---|
| §3 C03 | EVIDENCE, index + corroborado | CORROBORATED, index + corroborado | Apoyo `index` (sin lectura completa de la primaria). Sustancia intacta: la redacción real de GitHub Docs fue verificada en R2 (H-03). Ver §5.1, decisión documentada. |
| §6.1 R3 | (EVIDENCE: GitHub Docs, index.) | (CORROBORATED: GitHub Docs, index — sin lectura completa de la primaria.) | Misma fuente y apoyo que C03. |
| §3 C07 | EVIDENCE en fuentes (única) | EVIDENCE en SQLite + CORROBORATED en RFC 8259/JCS + PROPOSAL en la elección canónica | Etiqueta separada por componente: SQLite verificado en vivo; RFC 8259 heredado M03; JCS citado en M03 §3, no verificado en vivo en M03. |
| §3 C13 | EVIDENCE (GGUF, heredado M02/M03) | CORROBORATED (heredado M02/M03) | Apoyo solo «heredado». |
| §3 C14 | EVIDENCE (encabezado único; FIPS heredado M03 + IR 8547) | EVIDENCE para IR 8547 + CORROBORATED para FIPS 203/204/205 | IR 8547 conserva EVIDENCE (lectura íntegra del Frente D, 2.204 líneas); parte FIPS, solo «heredado». |
| §3 C15 | EVIDENCE (Veeam, heredado M03) | CORROBORATED (heredado M03) | Apoyo solo «heredado». |
| §3 C16 | EVIDENCE para los límites materiales concretos | CORROBORATED para los límites materiales concretos; HYPOTHESIS/UNKNOWN para la imposibilidad universal (sin cambio) | Cifras sin trazabilidad por cifra en este expediente (F-E20b: M03 §5 las declara «Verificado» sin atar cada cifra a su fuente). |
| §12, 5 filas | Nivel Index/Heredado | «Corroborado (heredado/index …)» | GitHub Docs (index 2026-11-05), FIPS 203/204/205, RFC 8259, GGUF, Veeam — alimentan las etiquetas §3 ahora CORROBORATED. |
| §12, 8 filas | Nivel Index/Heredado | «Procedencia: index/heredado … — no es nivel de evidencia; sin etiqueta EVIDENCE asociada en §3» | ONNX, OAIS, Shamir/SLIP-39, RFC 3629, LoC RFS, Syncthing, SP 800-34, Qubes — ninguna etiqueta EVIDENCE de §3 descansa en ellas. No se afirma corroboración que no se verificó; se conserva la procedencia y se retira la lectura de nivel. |

**Controles verificados sin contradicción (conservados, documentados en la matriz §3.4):** C10 (etiqueta ya CORROBORATED pese a «heredado M03»), §1 fallo estructural («heredado de M03» descriptivo, sin etiqueta EVIDENCE), §11 D («texto heredado» = texto anterior de R2). No se tocaron.

**Casos límite revisados y no reclasificados (matriz §3, L-11):** C11/HELM (la etiqueta EVIDENCE de C11 descansa en cálculo propio + lectura directa de Miller; el paper HELM figura en §12 como «Citado en M02/M03; paper no re-leído en M03-B» sin que la etiqueta dependa de él) y C01/DID-VC (fechas «(corroborado)» con nivel «Verificado en vivo», ambigüedad INC-08/F-E19, no contradicción §0). Se dejan como están y se registra aquí la revisión.

**Verificación de que ninguna etiqueta depende de la definición retirada:** tras la corrección, en el informe f2 no queda ninguna celda §12 con nivel `Index`/`Heredado` (0 ocurrencias de `| Heredado M03 |`, `| Heredado M02/M03 |`, `| Index 2026-11-05 |`, `| Index (M02) |`, `| Index (M02, secundaria) |`; 0 `<td>Heredado…</td>` / `<td>Index…</td>` en HTML); no queda ningún «EVIDENCE, index» ni «EVIDENCE: GitHub Docs, index». Las dos ocurrencias restantes de «≥2 fuentes independientes» en informe y HTML están dentro de notas de rectificación F que citan la fórmula retirada como lo que se retiró, no como afirmación viva (igual que las citas de la equivalencia retirada en §0/§9, que se conservan como historial de lo retirado). **No queda nada parcial en M-02.**

### 2.3 M-03 — Atribución falsa a Fase A (CORREGIDO)

**Ubicación:** informe f2, registro de rectificación, antes L31; HTML f2, antes L198.

**Redacción anterior:**
> `…queda fuera de alcance por decisión de Fase A (INC-01) y debe tratarse en el gate correspondiente, no en esta copia.`

**Redacción nueva:**
> `…queda fuera de alcance en esta copia por no estar listado como destino en el paquete; su tratamiento queda pendiente de decisión del gate (Fase A, INC-01). [Rectificación MUSE-004-F (M-03): Fase A documentó el problema (INC-01) y difirió la decisión a «Fase B / gate»; el gate no ha decidido; no existe decisión de Fase A de excluirlo.]`

**Fundamento:** matriz §4 — secuencia documental: el paquete no lista `consolidation-method.md` como destino (ausencia, no propuesta explícita); Fase A (`phase-a-map.md`, INC-01) difiere a «Fase B / gate»; Fase B lo excluyó de facto al no tocarlo, sin acta; el gate no ha decidido. La formulación nueva es la que ya emplean el diff (L76–L77) y el handoff. El manifiesto MUSE-004 ya era neutral y no se toca. El cierre no menciona la exclusión ni atribuye nada a Fase A (verificado): no se toca su texto; se registra en su Addendum F. **No queda nada parcial en M-03.** Corregir la atribución no resuelve D-02 (ver §2.6).

### 2.4 M-04 — Fila HF `trust_remote_code` (CORREGIDO)

**Ubicación:** informe f2 §12, antes L540; HTML f2 §12, antes L1292.

**Redacción anterior (celda Nivel):**
> `Corroborado (≥2 fuentes independientes que citan la primaria; página primaria no leída línea a línea en este run)`

**Redacción nueva:**
> `Corroborado (resúmenes que citan la primaria, no nombrados; página primaria no leída línea a línea en este run) [Rectificación MUSE-004-F (M-04): retirada la fórmula «≥2 fuentes independientes», retirada por R-04 en §0; los resúmenes no se nombran y su independencia no es comprobable desde aquí (nota de limitación del mismo §12). El hecho —`trust_remote_code=True` ejecuta código del repositorio— no se cuestiona; solo su respaldo de independencia.]`

**Fundamento:** matriz §5; modelo de redacción: fila SP 800-53 (L544, «Corroborado (resúmenes que citan la primaria)») y §6.1 R2c (ya corregido por R-04, sin «≥2» ni «independientes»). La nota de limitación del mismo §12 (L563) y la nota de §12 (L561) no se tocan (son correctas); §0 no se toca. El hecho no se cuestiona; ningún estado cambia.

**Tercera redacción, §11 B14 (menor m-07, antes L471):** «(c) `trust_remote_code=True` ejecuta código del repositorio — EVIDENCE corroborado;» — B14 es registro histórico fechado de R1 (2026-11-06), conservado por diseño como historial; **no se reescribe**. Se añade anotación: `[Rectificación MUSE-004-F (M-04, m-07): etiqueta histórica de R1, conservada como historial; la etiqueta vigente es CORROBORATED (§6.1 R2c)]`. **No queda nada parcial en M-04.**

### 2.5 D-01 — §6.1 R7: EVIDENCE de `agent.json` en la spec `dev` §5.3 (CORREGIDO)

**Ubicación:** informe f2 §6.1 R7 (antes L283); HTML f2 §6.1 R7 (antes L653). Sin presencia en el cierre (0 ocurrencias de «agent.json»): no se toca su texto.

**Redacción anterior:**
> `La página de la spec leída en vivo es versión `dev` y en §5.3 aún indica el well-known `agent.json`, mientras que v1.0 usa `agent-card.json`. (EVIDENCE: página leída en vivo.)`

**Redacción nueva (resumen; texto íntegro en el informe f2):** la instantánea v0.2.6 —cuya cabecera se autodenominaba `Version: dev`— §5.3 («Recommended Location») indicaba `https://{server_domain}/.well-known/agent.json`; el renombrado a `agent-card.json` se hizo en el commit 0858ddb (PR #841) y se publicó como cambio incompatible en la versión 0.3.0 (2025-07-30); el canal vivo `dev` actual (consultado 2026-11-08) ya no dice `agent.json`: sirve contenido v1.0, su §5.3 es «Method Mapping Reference» y el descubrimiento está en §8.2, con `agent-card.json`; lo mismo vale para `latest`, v1.0.0 y v1.0.1 (cero ocurrencias de `agent.json` en todas ellas). EVIDENCE solo para la versión re-anclada, con URL, versión y fecha de consulta 2026-11-08. La redacción anterior queda registrada como refutada en su forma actual; «dev» NO se sustituye silenciosamente por «latest».

**Fundamento:** `MUSE_004_F_D01_SOURCE_EVIDENCE.md` (consulta 2026-11-08): `latest` y `dev` hoy idénticas (5.887 líneas, 0 `agent.json` / 5 `agent-card.json`); v1.0.0, v1.0.1 y `main` 0/5; v0.3.0 ya dice `agent-card.json` en §5.3; **v0.2.6 es la única versión consultada con `agent.json` (2/0)**, §5.3 «Recommended Location»; releases 0.3.0 (2025-07-30) registra el cambio incompatible «Change Well-Known URI for Agent Card hosting from `agent.json` to `agent-card.json` (#841)»; commit 0858ddb884dc4671681fd819648dfd697176abb3, cuyo diff cambia la línea de §5.3. Fecha del commit no verificada (no visible en el extracto rastreado); solo consta su inclusión en 0.3.0 (2025-07-30). Discrepancia no resuelta: fecha de 1.0.1 (GitHub 2026-05-26 vs secundarias 2026-05-28); no afecta al hallazgo. La recomendación de R7 (fijar versión) se conserva.

**Dependencia C05 verificada (hallazgo ND-F2, ver §6):** los punteros §3.3/§4.6/§5.1 de C05 —misma página `dev` leída 2026-11-05— también se desplazaron en el canal `dev`/`latest` actual (comprobado por esta pasada el 2026-11-08 en `https://a2a-protocol.org/latest/specification/`): §3.3 es hoy «Operation Semantics», §4.6 «Extensions», §5.1 «Functional Equivalence Requirements»; la frase citada de §3.3 tiene cero ocurrencias en `latest`; «implementation-specific» está hoy en §7.5; credenciales fuera de banda en §7.3; Agent Card en §8.1–§8.2. Se registra con nota `[Rectificación MUSE-004-F (D-01, dependencia)]` en §3 C05, en §6.1 R1(a) y en la fila §12 A2A (que además anota que `pr-849` y §5.3 corresponden a la lectura 2026-11-05). **Lo estrictamente necesario:** los punteros quedan registrados como instantánea histórica 2026-11-05; la sustancia de C05 **no** se re-verifica aquí contra el tag v1.0.1 y su etiqueta EVIDENCE («verificado en vivo 2026-11-05») se conserva como verificación histórica de esa instantánea. **No queda nada parcial en D-01** salvo la limitación registrada: no se estableció cuándo exactamente el canal `dev` dejó de servir el contenido 0.2.x (sin fecha de transición verificada).

### 2.6 D-02 — `consolidation-method.md` fuera de alcance (PARCIAL — decisión de gate)

**No corregido editorialmente dentro del expediente** (por diseño: requiere decisión de gate). Lo que esta pasada sí entrega:

- **Alternativa B preparada:** `consolidation-method-rectified-review-f2.md` — copia independiente de revisión, con banner que declara que es copia no oficial, no aprobada, que NO sustituye el canónico (9.720 bytes, SHA-256 `7295fedb…c24285`, intacto). Cambios, todos marcados `[Rectificación MUSE-004-F (D-02)]`:
  - § «Etiquetas epistemológicas»: taxonomía nueva (§0 f2) — EVIDENCE = primaria consultada directamente o cálculo reproducible; CORROBORATED = apoyo secundario, la cantidad de resúmenes no sustituye lectura primaria; «heredado» = procedencia, no nivel de evidencia. Retirada la equivalencia «CORROBORATED = ≥2 fuentes independientes nombradas».
  - § «Qué se verificó y qué permanece UNKNOWN»: lista actualizada — UNKNOWN solo U2 (U2-a/b/c), U3, U5; U1/U4/U6/U7/U8/U9 RESUELTOS (con alcance acotado); commit de publicación conocido `96e227eb06134037fa5e01fabc8cfba4c384f476` (07-11-2026); integridad posterior a la subida verificada.
  - § «Limitaciones conocidas»: la frase «Las lecturas verbatim de SP 800-63B-4, del PDF final de IR 8547 y de la spec A2A §8.4 siguen pendientes» queda marcada como superada (las tres se cerraron el 2026-11-07; §8.4 con la salvedad: confirmada en `latest`, no verificada contra el tag v1.0.1 ni archivada con instantánea).
  - § «Actualización de publicación…»: nota de que la superación parcial queda extendida a las tres secciones actualizadas, solo dentro de esta copia.
- **Alternativa A documentada:** canónico intacto, con la divergencia documentada en el informe f2 (registro F, M-02/D-02) y en el Addendum F del cierre f2 (§(b) D-02), que precisa además que el PASS de integridad del cierre cubre solo bytes, no vigencia de contenido.
- **No se elige entre A y B.** La decisión queda para el gate, como indican la matriz §7.3 y el handoff (bloqueo residual 1). **Bloqueo residual:** la elección A/B y, en su caso, la aplicación de B sobre el canónico requieren autorización expresa y separada; esta pasada no la tiene y no la presupone.

---

## 3. Tabla de correspondencia con la matriz de diagnóstico

| Matriz | Defecto | Ubicaciones de la matriz tratadas en f2 |
|---|---|---|
| §2 (14) | M-01 | Informe L327, HTML L820 corregidos; encabezado L324/L817 sin cambio (criterio correcto); ítems 1, 3–12 sin cambio; cierre: 0 ocurrencias, resumen R-09 exacto tras la corrección (registrado en Addendum F). |
| §3 (42 + 6 controles) | M-02 | §0 L47 / HTML L256, §9, §12 L512 / HTML L1081 redefinidos; C03 L101, R3 L279, C07 L133, C13 L181, C14 L189, C15 L199, C16 L207 reclasificados; 13 filas §12 (informe L524–L559, HTML L1164–L1444) reclasificadas; 6 controles (§3.4) verificados y conservados; casos límite C11/C01 documentados sin cambio (§2.2). |
| §4 (12) | M-03 | Informe L31, HTML L198 reescritos; diff/handoff ya usaban la formulación correcta (sin cambio); manifiesto neutral (sin cambio); cierre: ausencia verificada, sin cambio de texto. |
| §5 (14) | M-04 | Informe L540, HTML L1292 corregidos; nota §12 L563 y §0 L47 sin cambio; R2c L278/L628 sin cambio (modelo); B14 L471 anotado como historial (m-07); cierre: 0 ocurrencias, sin cambio de texto. |
| §6 (11) | D-01 | Informe L283, HTML L653 re-anclados; C05 L117, R1(a) L277, fila §12 A2A L535 anotados con la dependencia; cierre: 0 ocurrencias, sin cambio de texto; canónico L260 intacto. |
| §7 (12 + 6 contradicciones) | D-02 | Alternativa B preparada; divergencia documentada en informe f2 y Addendum F del cierre; canónico intacto; decisión de gate pendiente. |
| §8 | HTML duplicado | **No replicado:** un solo archivo HTML f2. El segundo nombre de la rama no tiene entrada en ningún manifiesto y no se reproduce. |

---

## 4. Archivos F2 creados

| Archivo | Bytes | Líneas | SHA-256 |
|---|---|---|---|
| `review-f/report-r2-rectified-review-f2.md` | 147.584 | 616 | `dacefd69a40ed28d924e2dee1faceca5ef85230182c829dcae84fff6634b6546` |
| `review-f/closure-r2-rectified-review-f2.md` | 42.702 | 301 | `80a82481f12def6bf09034e47edbabdd447528da382848eb2d6124473ba68023` |
| `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html` | 184.564 | 1.726 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` |
| `review-f/consolidation-method-rectified-review-f2.md` | 12.800 | 83 | `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636` |
| `review-f/hashes-r2-rectification-review-f2.md` | 5.248 | — | `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0` (hash propio, registrado aquí como evidencia externa) |

Diffs rectificado → f2: informe 31 eliminadas / 44 añadidas (incluye el registro F, 15 líneas); cierre **0 eliminadas / 35 añadidas** (bandera superior + Addendum F; texto anterior íntegro); HTML 35 eliminadas / 49 añadidas; canónico → f2 (nota de método, alternativa B) 4 eliminadas / 6 añadidas.

---

## 5. Verificación de que Markdown y HTML f2 coinciden en los pasajes corregidos

Método: extracción de texto de ambos archivos f2 y comparación por pasaje (normalizada: etiquetas HTML y marcas Markdown retiradas, espacios colapsados).

- **Presencia:** 19 pasajes corregidos verificados presentes en ambos formatos (M-01 ítem 2; C03, C07, C13, C14, C15, C16, R3; M-03; M-04 HF y B14; D-01 R7 + commit 0858ddb, C05, R1(a), §12 A2A; M-02 §0 y §12 def; registro F). Recuentos: marcas `[Rectificación MUSE-004-F]` — informe 19, HTML 20 (la vigésima es la bandera del masthead), cierre 1 (bandera superior; el Addendum F usa el encabezado de sección, no la marca por línea), nota de método f2 5.
- **Comparación normalizada exacta** (mismo texto visible, salvo espaciado de marcado en los bordes de elementos `<code>`): M-01 ítem 2, D-01 R7, M-04 celda HF, C16 evidencia, M-02 C03, M-03 registro — **idénticos**.
- **Filas §12:** informe y HTML coinciden en las 13: 4 «Corroborado (heredado M03)» + 1 «Corroborado (heredado M02/M03)» + 1 «Corroborado (index 2026-11-05; …)» + 8 «Procedencia: … — no es nivel de evidencia; sin etiqueta EVIDENCE asociada en §3» (los recuentos brutos de «Corroborado (heredado» = 5 y «Procedencia: » = 9 incluyen una mención en el párrafo de definición de §12).
- **Estructura HTML:** 16 secciones abiertas y cerradas; 29 anclas del índice, 0 sin destino (incluida la nueva `#registro-de-rectificacion-muse-004-f`); título F2; un solo archivo HTML.
- **Restos:** 0 ocurrencias en informe y HTML f2 de: «decisión de Fase A (INC-01)», «EVIDENCE, index», «EVIDENCE: GitHub Docs, index», etiqueta mixta «[Norma … + principio arquitectónico]», celdas §12 con nivel `Heredado`/`Index`. Las 2 ocurrencias restantes de «≥2 fuentes independientes» en cada archivo están dentro de notas de rectificación F que citan la fórmula retirada como lo retirado, no como afirmación viva.

---

## 6. Hallazgos nuevos detectados al corregir

- **ND-F1 — `artifact.create_web_static` / `artifact.export` no disponibles en esta sesión.** La tarea ordenaba reconstruir el HTML con `artifact.create_web_static` (desde un `research_dir` con el informe f2 como `report.md`) y exportarlo con `artifact.export`. En esta sesión de subagente el namespace `artifact` cargado expone solo `restore`/`share`/`unshare`; las funciones de creación/exportación no están disponibles y no existe `artifact.list`/`artifact.status` para verificarlo por otra vía. **Decisión tomada:** construir el HTML f2 aplicando las mismas correcciones, con conteo exacto por reemplazo, sobre los bytes del HTML rectificado original. Esto **preserva** estructura, navegación, tablas, referencias internas y el JavaScript de búsqueda/filtro del original — una regeneración genérica desde Markdown los habría perdido — y la correspondencia MD↔HTML quedó verificada por extracción de texto (§5). Se documenta la desviación aquí y en el manifiesto f2; el gate puede, si lo desea, regenerar el HTML con el artefacto y comparar hashes. No es un defecto de contenido.
- **ND-F2 — Dependencia C05: los punteros §3.3/§4.6/§5.1 también se desplazaron.** Verificado por esta pasada el 2026-11-08 en la spec `latest` (ver §2.5). No es un defecto nuevo MAYOR: la sustancia de C05 no se re-verificó y los punteros quedan registrados como instantánea histórica 2026-11-05. Si el gate quiere cerrar la dependencia, haría falta re-verificar C05/R1(a) contra el tag v1.0.1 con instantánea archivada (I-02 de la matriz).
- **Sin otros defectos nuevos de contenido.** Se revisaron al corregir: §9, §11 B13/B14/D, §7 U6/U9, §12 notas L561/L563, §5, Anexo A — sin hallazgos adicionales. La doble clasificación D-01/m-04 (matriz L-06) se deja como está, fuera del alcance de esta pasada.

---

## 7. Decisiones de criterio documentadas (no son decisiones D-01 a D-12)

1. **C03: degradar en lugar de documentar lectura directa.** La matriz ofrecía dos salidas para C03: degradar a CORROBORATED o documentar la lectura primaria directa que R2 afirma haber hecho (H-03). No se tomó la segunda: en el expediente no consta ningún registro de una lectura directa completa de GitHub Docs (método, fecha, extracto) que permita re-etiquetarla como EVIDENCE conforme a §0; H-03 acredita la redacción real, no una lectura completa. Degradar es la salida honesta con la evidencia disponible.
2. **Las 8 filas §12 sin etiqueta EVIDENCE: procedencia explícita, no CORROBORATED.** Afirmar «Corroborado» para ONNX, OAIS, Shamir, RFC 3629, LoC RFS, Syncthing, SP 800-34 y Qubes habría supuesto un apoyo secundario que no se verificó para esas filas. Se conserva su procedencia y se declara explícitamente que no es nivel de evidencia y que ninguna etiqueta EVIDENCE de §3 descansa en ellas.
3. **B14 (m-07): anotar, no reescribir.** B14 es historial fechado de R1; reescribir su etiqueta borraría historia. La anotación F deja constancia de la etiqueta vigente sin tocar el registro.
4. **C05: conservar EVIDENCE como verificación histórica.** Sus punteros se registran como instantánea 2026-11-05; la sustancia no se re-verifica en esta pasada (fuera de alcance; ver ND-F2).

---

## 8. Confirmación de integridad: originales y canónicos intactos

Hashes SHA-256 recalculados por esta pasada con `sha256sum` sobre los bytes de cada archivo (2026-11-08). Todos coinciden con los declarados en la matriz de diagnóstico §1 y en los manifiestos.

| Archivo | Bytes | SHA-256 recalculado | Coincide |
|---|---|---|---|
| `nexo-autonomy-004-f/branch/Informe-rectificado.md` | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` | Sí |
| `nexo-autonomy-004-f/branch/Cierre-rectificado.md` | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` | Sí |
| `nexo-autonomy-004-f/branch/expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | Sí |
| `nexo-autonomy-004-f/branch/Manifiesto-SHA-256.md` | 3.117 | `b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5` | Sí |
| `nexo-autonomy-004-f/branch/consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | Sí |
| `nexo-autonomy-004/branch/report-r2.md` (canónico) | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | Sí |
| `nexo-autonomy-004/branch/closure-r2.md` (canónico) | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` | Sí |
| `nexo-autonomy-004/branch/hashes-r2.md` (canónico) | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | Sí |
| `nexo-autonomy-004/branch/consolidation-method.md` (canónico) | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | Sí |
| `nexo-autonomy-004/review/report-r2-rectified-review.md` | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` | Sí |
| `nexo-autonomy-004/review/closure-r2-rectified-review.md` | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` | Sí |
| `nexo-autonomy-004/review/expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | Sí |
| `nexo-autonomy-004/review/hashes-r2-rectification-review.md` | 3.117 | `b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5` | Sí |

**Hash propio del manifiesto f2 (evidencia externa):** `hashes-r2-rectification-review-f2.md` (5.248 bytes) — SHA-256 `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0`.

Ningún archivo original, canónico o de MUSE-003/MUSE-004 fue modificado por esta pasada (solo lectura; los únicos archivos escritos son los cinco f2 y este informe).

---

## 9. Para el gate (decisiones del propietario, no de esta pasada)

1. **D-02:** elegir entre **A** (canónico intacto, divergencia documentada) y **B** (copia f2 actualizada). Sin esta decisión, el dossier f2 convive con el mismo canónico contradictorio que el dossier MUSE-004.
2. **ND-F2:** decidir si se re-verifica C05/R1(a) contra el tag v1.0.1 con instantánea archivada, o si basta el registro de los punteros como instantánea histórica 2026-11-05.
3. **ND-F1:** decidir si el HTML f2 (corrección directa sobre los bytes originales, verificada por extracción) es aceptable como entrega, o si se regenera con `artifact.create_web_static` en una sesión con esa función disponible.
4. **Cierre:** el estado sustantivo sigue PARTIAL; no se declara PASS. Ninguna de estas decisiones es D-01 a D-12.
