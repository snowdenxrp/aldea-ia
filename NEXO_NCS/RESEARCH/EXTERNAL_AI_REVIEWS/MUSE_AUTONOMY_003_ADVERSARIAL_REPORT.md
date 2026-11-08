# MISIÓN MUSE-AUTONOMY-003 — INFORME ADVERSARIAL

**Misión:** MUSE-AUTONOMY-003 — Revisión adversarial profunda (residual claims falsification) de las conclusiones residuales del expediente MUSE-AUTONOMY-002 R2.
**Fecha:** 2026-11-07.
**Expediente revisado:** `report-r2.md` (113.706 bytes, SHA-256 `e41c8f3b…be80a` según `closure-r2.md` vigente), `closure-r2.md` (leído entero), HEAD de referencia `c37a3575f5e043e9db9af01a786d658b363ead87`.
**Informes previos contrastados:** M02, M03, M03-B (`report.md` de investigación en `~/workspace/research_notes/nexo-mision-02-20261105-2109/`, `nexo-mision-03-20261105-2217/`, `nexo-mision-03b-20261105-1947/`).

## DECLARACIÓN OBLIGATORIA

Las cinco pasadas de esta misión comparten un mismo contexto: fueron ejecutadas por subagentes de Snow, no por revisores externos independientes. Este informe no es una revisión externa independiente; es una pasada adversarial interna con contexto compartido. Ninguna conclusión debe presentarse como verificación externa independiente. Los cinco informes de frente viven en `~/workspace/research_notes/nexo-autonomy-003/fronts/{A,B,C,D,E}/report.md` y son la base evidencial de este informe; este documento los sintetiza sin sustituirlos.

## 0. Dictamen global

**La misión encontró refutaciones reales y materiales, y el núcleo sustantivo del expediente sobrevivió.**

Refutaciones demostradas con evidencia primaria:

1. **U5 — la atribución de la cifra 4–5 queda refutada (Frente C).** Los números proceden de Stanford CRFM «HELM MMLU» (2024-05-01) y comparan HELM con puntuaciones reportadas por los creadores, no con lm-evaluation-harness. Además, «4–5 puntos» es el máximo de la tabla CRFM (mediana |Δ| = 1,2 en 25 modelos), no el diferencial típico. La única comparación pareada HELM-vs-lm-eval localizada (Hugging Face, junio 2023) da 14,9 puntos para LLaMA-65B, con signo variable. U5 permanece UNKNOWN como diferencial general; D5/U5 deben reescribirse con la procedencia real.
2. **U3 — la exhaustividad del inventario queda refutada (Frente B).** 26 fichas nuevas (F-01 a F-26), varias con estatus normativo final (GNAP RFC 9635, RFC 8693, SCITT RFC 9943, SD-JWT RFC 9901, WebAuthn L3, eIDAS 2.0). Varias omisiones cambian materialmente la evaluación (GNAP, RFC 8693 §4.1, KERI, did:webvh, SCITT, SPIFFE/WIMSE) y afectan a D-01, D-02, D-04, D-06 y D-08. El fallo estructural central (sin revocación/sucesión sin tercero de confianza) NO fue refutado. U3 permanece UNKNOWN; el inventario ampliado tampoco es exhaustivo.
3. **C14 — la etiqueta y dos capas de la formulación quedan precisadas, sin elevar ni debilitar el veredicto (Frente D).** «Ed25519» aparece cero veces en IR 8547: su inclusión es una inferencia en dos pasos (Tabla 2 EdDSA ≥128 bits + FIPS 186-5 §7), correcta pero CORROBORATED/INFERENCE, no EVIDENCE verbatim. «Migrar las firmas antes de 2030» es PROPOSAL, no prescripción NIST (el hito federal de firmas es 2031). La verificación *legacy* post-2035 queda UNKNOWN. C14 se MANTIENE PARCIALMENTE CONFIRMADA; H-04 queda cerrado para el núcleo (lectura primaria directa del final de IR 8547).
4. **M03 §2 — la implicación AAL3 queda refutada (Frente E, F-E01, material y nueva).** SP 800-63B-4 §3.2.13 exige entorno aislado protegido por hardware; un autenticador «en software aislado» no puede alegarse AAL3. La redacción prevalente de C02 sobrevive; la implicación de M03 no. Ninguna pasada anterior lo había corregido.
5. **U2 — la formulación amplia y la suficiencia implícita de 200–500 quedan refutadas parcialmente (Frente A).** Basilea MAR32 prescribe 250 observaciones en su ámbito (cuasi-contraejemplo que obliga a matizar «ninguna norma prescribe ningún N»). Bajo Miller, 200–500 no resuelven diferencias de 3 puntos (MDE 13,2 pp a n=200 con K=1; 3.876 preguntas necesarias para δ=3 pp). «Caso» no está definido y el clustering reduce n=500 a n efectiva ≈54. U2 permanece UNKNOWN; no se encontró norma universal 200–500 para agentes.
6. **Coherencia interna — contradicciones reales sobre estados (Frente E, F-E02/F-E03, materiales).** R2 afirma a la vez U6/U9 RESUELTOS (§7, cierre) y UNKNOWN (§11 B2/B7, texto heredado de R1 no purgado). Además, la definición de EVIDENCE del expediente (§0, «corroborado por ≥2 resúmenes») infla etiquetas: C09, C10, C12 y R2c descansan en resúmenes no nombrados o controles no leídos verbatim (F-E11).

Corroborado (no pudo refutarse pese a intentarlo):

- El núcleo de C14/M03-corrección-03 (fechas 2030/2035, EdDSA ≥128 bits, hitos federales 2030/2031) con lectura primaria directa (Frentes D y E).
- La aritmética binomial de C11 y la fórmula de Miller (Frentes A y E).
- El fallo estructural central: sin revocación/sucesión sin tercero de confianza (Frente B).
- La tesis cualitativa de evaluación: el mismo modelo puntúa distinto según la implementación (Frente C).
- Las citas de estatus normativo verificadas del expediente (Frente B, T8) y los conteos internos (Frente E).

**Estados que no cambian:** U2, U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (con las precisiones de alcance de F-E10/F-E16 y la corrección editorial de F-E02/F-E03); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo global **PARTIAL**. No se declara PASS. No se modifica ningún documento canónico R2. Las correcciones propuestas en §9 son PROPOSAL para una rectificación futura, no aplicadas aquí.

## 1. Metodología

Cinco pasadas adversariales separadas, una por frente, ejecutadas en paralelo por subagentes con contexto compartido:

| Frente | Objeto | Informe |
|---|---|---|
| A | U2 — tamaño de muestra 200–500 | `fronts/A/report.md` (64.136 bytes) |
| B | U3 — exhaustividad de identidad/delegación | `fronts/B/report.md` (103.373 bytes) |
| C | U5 — diferencial 4–5 HELM vs lm-eval | `fronts/C/report.md` (78.274 bytes) |
| D | C14 — transición poscuántica | `fronts/D/report.md` (56.191 bytes) |
| E | Ataque cruzado M02/M03/M03-B/R2/cierre | `fronts/E/report.md` (78.348 bytes) |

Hipótesis inicial común: «El expediente puede contener errores, generalizaciones, omisiones, fuentes insuficientes o conclusiones que exceden lo que realmente demuestran sus evidencias». Cada frente intentó demostrarla contra su objeto.

Etiquetas aplicadas (regla común): **EVIDENCE** = fuente primaria abierta y comprobada, con ubicación exacta; **CORROBORATED** = fuentes independientes que coinciden (tres resúmenes del mismo documento NO son tres fuentes); **INFERENCE** = conclusión derivada de primarias combinadas; **HYPOTHESIS** = plausible sin prueba primaria localizada; **PROPOSAL** = recomendación de diseño sin norma que la imponga; **UNKNOWN** = no resuelto. Para cada hallazgo importante cada frente registró: afirmación examinada, hipótesis de refutación, evidencia favorable, evidencia contraria, fuente primaria y ubicación exacta, resultado de la prueba, impacto, estado final y evidencia adicional que permitiría resolverlo.

Fuentes: primarias oficiales y documentos completos; los fragmentos de buscadores no se usaron como prueba suficiente. Los bloqueos se registraron sin rellenar lagunas. No se repitieron la comprobación SHA-256, la auditoría de bytes UTF-8 ni la comparación de commits (cerradas en `closure-r2.md`). No se leyeron ni editaron archivos bajo `~/workspace/ts-spaces/`.

## 2. Frente A — U2: tamaño de muestra

**Dictamen del frente: U2 permanece UNKNOWN.**

Búsqueda ampliada de 4 a 19 fuentes (finanzas, sanidad, software testing, gestión de IA, regulación UE, psicometría). Matriz completa en `fronts/A/report.md` §2 (F1–F19).

| Hallazgo | Resultado | Estado |
|---|---|---|
| H-A1 — No se encontró norma universal 200–500 | No refutado el núcleo de U2 | CORROBORATED |
| H-A2 — Basilea MAR32 prescribe 250 observaciones en su ámbito | Refutación parcial de la formulación amplia («ninguna norma prescribe ningún N») | EVIDENCE (250 en su ámbito) + INFERENCE (potencia débil: un modelo con el doble de excepciones sigue en verde el 43,9%) |
| H-A3 — Rama no determinista de Miller: 200–500 no resuelven δ=3 pp | Refutado en lectura fuerte (MDE 13,2 pp a n=200, K=1; 8,4 pp a n=500; 3.876 preguntas para δ=3 pp); corroborado en lectura débil (sí bastan para descartar δ≥10 pp) | EVIDENCE (fórmula reproducida exactamente) + INFERENCE |
| H-A4 — «Caso» no está definido; clustering | Refutado el supuesto implícito (SE agrupados hasta 3,05× → n=500 a n efectiva ≈54) | EVIDENCE + INFERENCE |
| H-A5 — El 969 de Miller se cita sin sus supuestos | Precisión: pareado, σ²=0, ω²=1/9 ficticio; no pareado equivalente 7.108 casos | EVIDENCE + INFERENCE |
| H-A6 — El rango 200–500 no tiene estatus privilegiado | Refutado: 100 curados estiman MMLU con error ≈2% (tinyBenchmarks); GPQA Diamond tiene 198 preguntas, por debajo del piso | EVIDENCE + INFERENCE |
| H-A7 — SR 11-7 derogada por SR 26-2 (17-04-2026), que excluye GenAI/agentic AI | Hallazgo de contexto; no cambia U2 | EVIDENCE |
| H-A8 — Los reguladores prescriben justificación, no N | Corrobora la tesis del expediente (FDA, AI Act arts. 15/55, SR 26-2, ISO 29119-1, ISO 42001, psicometría) | CORROBORATED |

Precisiones propuestas para R2 (sin cambiar estados): registrar Basilea como caso límite; añadir a C11 la tabla de MDE y la exigencia de declarar K; definir «caso» y exigir errores estándar agrupados; registrar los tres supuestos del 969; registrar la derogación de SR 11-7. Propuesta de reformulación: dividir U2 en U2-a (existencia de N universal), U2-b (parámetros empíricos para D-07) y U2-c (definición de caso). Familias sin examinar: DO-178C, ISO 26262, IEC 62304, ISO 14155, Common Criteria, regulación china; textos íntegros paywall de ISO 42001/23894/25059/29119 e IEEE 1012; PDF del Código GPAI bloqueado.

## 3. Frente B — U3: exhaustividad de identidad y delegación

**Dictamen del frente: U3 permanece UNKNOWN.**

26 fichas de candidatos (F-01 a F-26) no examinados en M02/M03/M03-B/R2, cubriendo las 10 áreas. Seis lecturas primarias directas (GNAP RFC 9635, FROST RFC 9591, especificación KERI v1.1, DID Core §§5.3.3–5.3.4, SCITT RFC 9943, BitstringStatusList v1.0/v1.1); el resto CORROBORATED por secundarias convergentes.

Pruebas adversariales (T1–T8):

| Prueba | Resultado | Estado |
|---|---|---|
| T1 — «El inventario es exhaustivo» | **REFUTADA** (25 fichas nuevas; 9+ estándares finales) | EVIDENCE (incompletitud) |
| T2 — «Ninguna omisión cambia materialmente la evaluación» | **REFUTADA PARCIALMENTE** (GNAP, RFC 8693, KERI, did:webvh, SCITT, SPIFFE/WIMSE afectan D-01/D-02/D-04/D-06/D-08) | INFERENCE apoyada en EVIDENCE/CORROBORATED |
| T3 — «UCAN/ZCAP agotan el espacio de capabilities» | **REFUTADA** (Biscuit, Macaroons, GNAP, UMA 2.0, `capabilityDelegation`, ACDC) | EVIDENCE/CORROBORATED |
| T4 — «No existe estándar de versionado de identidad (y de Constitución)» | **REFUTADA en la formulación amplia** (versionId/versionTime, did:webvh, KEL, SCITT); **CORROBORADA en la estrecha** (no hay estándar de versionado de Constitución) | EVIDENCE / UNKNOWN |
| T5 — «La revocación sin tercero de confianza no tiene solución estándar» | **NO REFUTADA** (corroborada: consulta, lista o expiración; nunca retroactiva offline) | INFERENCE robusta |
| T6 — «Existe estándar técnico de sucesión» | **NO LOCALIZADO** (búsqueda negativa documentada; derecho fragmentario, no ejecuta claves) | UNKNOWN |
| T7 — «eIDAS/EUDI no afectan a Nexo» | **NO RESUELTO** (depende de la jurisdicción de Kevin, no registrada) | UNKNOWN |
| T8 — «El expediente presenta correctamente el estatus normativo de lo que cita» | **NO REFUTADA** (citas verificadas correctas; 3 advertencias: FROST es Informational, aprobación KERI v1.0 no verificada en primaria, versiones en conflicto) | CORROBORATED |

Candidatos con mayor impacto material: **GNAP** (RFC 9635, primer protocolo de delegación fina en Standards Track; D-06/D-08); **RFC 8693 §4.1** (ningún estándar aplica control de acceso a cadenas multi-salto salvo actor superior y actual; D-08); **KERI** (rotación pre-comprometida, delegación jerárquica, recuperación social por umbral sin ledger; D-01/D-02 — pero admite en su gobernanza GLEIF EGF v4.0 §4.1.3 que sin claves pre-rotadas la única salida es abandonar la identidad); **did:webvh** (historia verificable sin ledger); **SCITT** (RFC 9943, transparencia generalizada con recibos; D-04); **SPIFFE/WIMSE/AIMS** (identidad de workload estándar para agentes); **eIDAS 2.0** (ley UE, plazos 2026–2027).

El fallo estructural central NO fue refutado: ningún candidato resuelve revocación o sucesión sin tercero de confianza. Recomendación (PROPOSAL): antes de decidir D-01/D-02/D-06/D-08, lectura primaria de F-01, F-02, F-08, F-14, F-18, F-22, F-24; censo del registro DID y borradores WIMSE/AIMS; registro de la jurisdicción de Kevin. La formulación de U3 debe actualizarse: «inventario ampliado con 26 fichas; exhaustividad no demostrada».

## 4. Frente C — U5: diferencial 4–5 puntos HELM vs lm-eval

**Dictamen del frente: U5 permanece UNKNOWN.**

Cadena de procedencia establecida (F-01–F-10, `fronts/C/report.md` §0.5):

| Hallazgo | Resultado | Estado |
|---|---|---|
| F-01 — El comparador real es HELM vs reportado, no HELM vs lm-eval | **REFUTADO** como comparación HELM-vs-lm-eval. CRFM «HELM MMLU» (2024-05-01): Claude 2.1 Reportado 78,5 / HELM 73,5 / Δ −5,0; GPT-4 (0613) 86,4 / 82,4 / Δ −4,0. lm-eval no es parte de esa comparación | EVIDENCE |
| F-02 — «4–5 puntos» es el máximo, no el diferencial típico | **REFUTADO** como enunciado general. Tabla CRFM (25 modelos): rango −5,0 a +1,8; mediana \|Δ\| = 1,2; media −0,65; solo 3/25 con \|Δ\| ≥ 4,0 | EVIDENCE |
| F-03 — Existe una comparación pareada HELM vs lm-eval (HF 2023) y da ~15 puntos | **REFUTADO** en sentido estricto («no existe comparación pareada»); **CORROBORADO** en sentido sustantivo («ninguna sustenta 4–5»). LLaMA-65B HELM 0,637 vs harness 0,488 = 14,9 puntos; signo variable −7,7 a +14,9; versiones actualizadas después | EVIDENCE / INFERENCE |
| F-04 — El artículo índice bestaiweb no contiene la cifra de M02 | **REFUTADO** para la versión vigente (su única comparación HELM-vs-harness es HF 2023, 15 puntos); **UNKNOWN** para versiones anteriores | EVIDENCE / UNKNOWN |
| F-05 — El literature review de GitHub no contiene la cifra | **REFUTADO** para la versión actual; «4-20 puntos (SourceScore, 2026)» sin entrada en sus referencias | EVIDENCE / UNKNOWN |
| F-06 — La cifra «4–5 %» real de MMLU-Pro mide sensibilidad al prompt | **CORROBORADO** que la magnitud existe con otro objeto; **INFERENCE** que sea el origen de la confusión (MMLU-Pro arXiv:2406.01574 §6.3: 24 estilos de prompt, «generally 4-5 %, peaks up to 10.98 %») | EVIDENCE / INFERENCE |
| F-07 — El 78,5 % pertenece a Claude 2 en el documento enlazado | **REFUTADO** (b): protocolos difieren (CoT + T=1 vs directo). **NO RESUELTO** (a): atribución a 2.1 no verificable en el documento recuperado | EVIDENCE / UNKNOWN / INFERENCE |
| F-08 — El 86,4 % de GPT-4 procede de un snapshot interno no reproducible | **CORROBORADO** (advertencia del propio CRFM) | CORROBORATED |
| F-09 — El Δ supera el ruido muestral pero no identifica causa | **REFUTADO** que sea ruido (SE ≈ ±0,6–0,7 pt con n=14.042); **REFUTADO** que el tamaño identifique al harness como causa | INFERENCE |
| F-10 — La dirección cualitativa queda corroborada por tres fuentes independientes | **CORROBORADO** (CRFM, HF 2023, experimento bestaiweb 0,0 %–63,2 %) | CORROBORATED |

Impacto: D5/U5 deben reescribirse con la procedencia real (CRFM, HELM vs reportado) y la tabla HF 2023, en lugar de «no se encontró comparación pareada». C11 queda intacta y reforzada (su maquinaria es exactamente lo que habría impedido el error). Sub-UNKNOWNs nuevos dentro de U5: documento enlazado por CRFM para «Claude 2.1» en mayo de 2024; versión de HELM en CRFM; temperatura/semilla/decoding del brazo HELM; agregación macro/micro; contenido de bestaiweb y del literature review en 2026-11-05.

## 5. Frente D — C14: transición poscuántica

**Dictamen del frente: MANTENER C14 como PARCIALMENTE CONFIRMADA. No elevarla. No debilitarla.**

Lectura primaria directa: IR 8547 final (DOI 10.6028/NIST.IR.8547, texto completo, 2.204 líneas), FIPS 186-5 §7, páginas CSRC de FIPS 203/204/205, EO 14412 (texto oficial Casa Blanca, entero), OMB M-26-15 (PDF oficial entero, 776 líneas). Bloqueos: govinfo HTTP 500 (sustituido por Casa Blanca); SP 800-131A no leído verbatim; RFC 8032 por extractos (mitigado por FIPS 186-5).

| Hallazgo | Resultado | Estado |
|---|---|---|
| H-D6 — H-04 queda cerrado para el núcleo C14 | La cita central es literal: IR 8547 §4/§4.1.1 — deprecación de toda la criptografía vulnerable tras 2030, desautorización bajo normas NIST tras 2035; Tabla 2: EdDSA ≥128 bits, mismo calendario. El final es más estricto que el borrador (≥128 bits ahora deprecados en 2030). Hitos federales 2030/2031 confirmados; FIPS 203/204/205 finales 13-08-2024 confirmados | EVIDENCE |
| H-D1 — «Ed25519» no es cita literal de IR 8547 | «Ed25519» aparece cero veces en IR 8547 (y tampoco en M-26-15 Ap. A). Inclusión por inferencia en dos pasos (Tabla 2 + FIPS 186-5 §7) — correcta, pero CORROBORATED/INFERENCE, no EVIDENCE verbatim | CORROBORATED / INFERENCE |
| H-D2 — *Disallowed* no cubre la verificación *legacy* | La verificación de firmas anteriores como *legacy use* tras 2035 no está resuelta en IR 8547 | UNKNOWN |
| H-D3 — Estatus operativo: plan anunciado, no regla vigente en SP 800-131A | IR 8547 §4.1 remite los calendarios detallados a la revisión de SP 800-131A; §4.2 admite que los estándares sigan permitiendo estas técnicas hasta 2035 | EVIDENCE |
| H-D4 — «Antes de 2030» es PROPOSAL, no prescripción NIST | «before 2030» tiene cero ocurrencias en IR 8547 para firmas; el hito federal de firmas es 2031 | PROPOSAL (refutado como prescripción) |
| H-D5 — Excepciones federales no recogidas | NSS excluidos; EO §7(b)-(c) (fondos; sin derecho exigible); regla FAR solo propuesta; M-26-15 Ap. A no nombra EdDSA | EVIDENCE |
| H-D7 — Autenticación con calendario distinto (§3.1.2) | La autenticación puede seguir con algoritmos vulnerables hasta que exista un CRQC capaz de romperlos; material para Nexo (identidad = autenticación/firma) | EVIDENCE |

Elevar C14 a CONFIRMADA exigiría (a) mención literal de Ed25519 en IR 8547 o en SP 800-131A revisado y (b) fechas operativas en SP 800-131A. Ninguna existe hoy. Precisiones recomendadas (§6 del informe del frente): re-etiquetar la inclusión de Ed25519, decir «IR 8547 final anuncia…», cualificar *disallowed* como «para aplicar protección criptográfica», re-etiquetar «antes de 2030» como PROPOSAL, añadir las cualificaciones federales y el matiz de autenticación e híbridos/firmas duales.

## 6. Frente E — Ataque cruzado

**Dictamen del frente: coherencia cruzada PARCIAL.**

26 hallazgos (F-E01–F-E26). Los materiales:

| Hallazgo | Resultado | Estado |
|---|---|---|
| F-E01 — M03 §2: «un autenticador no exportable en software aislado podría alegarse AAL3» | **REFUTADO** por SP 800-63B-4 §3.2.13 (entorno aislado protegido por hardware: secure element, TEE, TPM o procesador separado). Ninguna pasada lo había corregido, aunque el cierre cita ese §3.2.13. Material para D-01/D-02: en el Poco X7 Pro la vía AAL3 sería el TEE, no software aislado | EVIDENCE |
| F-E02 — R2 afirma U9 RESUELTO y UNKNOWN a la vez | Contradicción interna directa: §7/cierre dicen RESUELTO; §11 B2 dice UNKNOWN (texto heredado de R1) | EVIDENCE |
| F-E03 — R2 afirma U6 RESUELTO y UNKNOWN a la vez | Contradicción interna directa: §7/cierre dicen RESUELTO; §11 B7 dice UNKNOWN (además colapsa cifra sin verificar con registro resuelto) | EVIDENCE |
| F-E04 — §3 C02 conserva la salvedad «verificación verbatim pendiente» | Texto obsoleto en la sección normativa; la misma sección afirma y niega la dependencia de resúmenes | EVIDENCE |
| F-E05 — §11 D mantiene como pendiente una verificación ya hecha | Mezcla una verificación hecha (SP 800-63B-4) con dos pendientes, sin distinguirlas | EVIDENCE |
| F-E06 — §11 C4 contradice la resolución U4 | Limitación obsoleta: la gobernanza A2A ya se resolvió con primarias | EVIDENCE |
| F-E07 — C05 y §12 califican v1.0.1 de «fuente secundaria» | Calificador obsoleto; la fecha «mayo de 2026» es menos precisa que el dato vigente (28-05-2026) | EVIDENCE / CORROBORATED |
| F-E08 — H-07 describe una celda U1 ya superada | Documenta un estado intermedio sin nota de supersesión | EVIDENCE |
| F-E09 — C11 prescribe bootstrap; Miller dice que es innecesario | Tensión evidencia/redacción: Miller recomienda CLT; el bootstrap es de HELM. Fusión no señalada | INFERENCE |
| F-E10 — U7 RESUELTO es más ancho que su evidencia | Lo resuelto es «CP-10 no define quarantine como fase»; la negativa general requeriría búsqueda de texto completo en ~1.196 controles. Cuestión nominal resuelta, funcional pendiente | INFERENCE / EVIDENCE (alcance acotado) |
| F-E11 — La definición de EVIDENCE infla etiquetas (defecto metodológico compartido) | Las 4 fuentes de IR 8547 son reescrituras simultáneas del mismo comunicado NIST; C09/C10/C12 descansan en controles SP 800-53 no leídos verbatim y resúmenes no nombrados; R2c igual. Como máximo CORROBORATED | EVIDENCE (patrón) / INFERENCE |
| F-E12 — La regla de ámbito (§9) no se aplica a SP 800-53 / SP 800-34 | Doble vara: C02 limita SP 800-63B-4 e IR 8547, pero C09/C10/C12 derivan requisitos de diseño para Nexo de un catálogo federal sin argumento de transferencia | INFERENCE |
| F-E13 — El texto original de C01–C16 no existe en el expediente | Los veredictos se adhieren a reformulaciones de M03-B; la cadena de custodia del objeto evaluado no está documentada | EVIDENCE (ausencia) / UNKNOWN (fidelidad) |
| F-E14 — P7 es la base de consolidación y no es verificable desde aquí | La resolución del conteo 12 vs 11 depende de una fuente no comprobable por la regla de artefactos | UNKNOWN / INFERENCE |
| F-E15 — Las verificaciones «en vivo» no son reproducibles | La evidencia de R7 (`agent.json`) ya expiró en la spec viva; los punteros §3.3/§4.6/§5.1 no coinciden con la numeración vigente. **Cierra** la verificación pendiente de A2A §8.4 (MAY de firma JWS, SHOULD de verificación, confirmados en la spec `latest`) | EVIDENCE |
| F-E16 — U9: la retirada de la cláusula de M02 es demasiado categórica | Un Merkle ordenado/sparse sí puede probar no-pertenencia de una clave; lo que no prueba es la completitud del universo de eventos. La resolución U9 es además un diseño propuesto, no algo que RFC 9162 prescriba | INFERENCE / EVIDENCE (completitud) |
| F-E17 — C12: «se descarta y se registra» y la circularidad | (a) El registro de rechazos es una nueva vía de entrada hostil al log. (b) La autenticación por mensaje presupone D-01/D-02/D-08 (SIN DECIDIR): circularidad no señalada | INFERENCE |
| F-E18 — §6.4 mezcla requisitos y propuestas sin etiquetar | Ítems PROPOSAL presentados como «requisitos mínimos, no negociables», en tensión con §9 | INFERENCE |
| F-E19 — Tabla §12: Nivel «Verificado en vivo» con fechas «(corroborado)» | Ambigüedad de etiqueta: el nivel parece cubrir la fila entera | EVIDENCE |
| F-E20 — Afirmaciones huérfanas sin trazabilidad | Periodo de garantía de snapshots OpenAI («3 vs 6 vs 12 meses») sin fuente; cifras U6 heredadas sin cita por cifra | EVIDENCE (ausencia) |
| F-E21 — El cierre duplica la sección U5 | Duplicación editorial por ensamblaje; sin contradicción sustantiva | EVIDENCE |
| F-E22 — Doble escala de veredicto: APROBADO CONDICIONADO (§1) vs PARTIAL (§11) | El mapeo vive solo en §11 D/E; §1 no lo contiene | INFERENCE |
| F-E23 — U3: imprecisiones menores en UCAN/ZCAP | ZCAP v0.4.0 sí define tratamiento de revocación (caveats; MUST almacenar revocados hasta expiración). Impreciso, no falso | CORROBORATED / INFERENCE |
| F-E24 — U7: mezcla de versiones SP 800-53 (5.1 vs 5.2.0) | Sustancia sobrevive; nivel CORROBORATED, no EVIDENCE; «no cambió» debe leerse como «no cambió esos controles» | CORROBORATED |
| F-E25 — C14/D2: el intento de refutación FRACASÓ | Lectura primaria del PDF final de IR 8547 confirma fecha, frase verbatim §4.1.1 y Tabla 2. Matices nuevos: SP 800-57 relajaba 112 bits a 2031 (el final es más laxo ahí); la simétrica a 112 bits se desautoriza en 2030 (§4.1.3), no en 2035 | EVIDENCE |
| F-E26 — Intentos de refutación que fracasaron (resto) | C03 (cita GitHub verbatim), A2A v1.0.1 + frontmatter, Miller (≈969, ≥1.000, pareadas, bootstrap), NIST AI 200-3 Ap. C, HELM maintenance mode 01-06-2026, UCAN, RFC 9162 §11.3, ZCAP v0.4.0, EO 14412/M-26-15, SP 800-53 5.2.0, aritmética C11, conteos internos | EVIDENCE / CORROBORATED |

Riesgos omitidos por modelo mental compartido (§5 del informe E): cadena de custodia de C01–C16 (F-E13); vara de corroboración (F-E11); transferencia de ámbito federal→personal (F-E12); no-reproducibilidad de lo «verificado en vivo» (F-E15); el registro como superficie de ataque (F-E17a); circularidad C12→D-01/D-02/D-08 (F-E17b); distinción nominal/funcional (F-E10, F-E16); distinción hardware-based / hardware-protected (F-E01); el expediente como objeto que envejece sin purga (F-E02–F-E08, F-E21); doble escala de veredicto (F-E22).

## 7. Síntesis: refutaciones, corroboraciones y estados

### 7.1 Refutaciones logradas (con evidencia primaria)

| # | Afirmación refutada | Frente | Consecuencia |
|---|---|---|---|
| R-01 | «4–5 puntos es el diferencial HELM vs lm-evaluation-harness» | C (F-01, F-02) | D5/U5 deben reescribirse con la procedencia real (CRFM, HELM vs reportado) |
| R-02 | «No existe ninguna comparación pareada HELM vs lm-eval» (cierre) | C (F-03) | Precisar: existe una (HF 2023); no sustenta 4–5; está obsoleta |
| R-03 | «El inventario de identidad/delegación del expediente es exhaustivo» | B (T1) | 26 fichas nuevas; D-01/D-02/D-04/D-06/D-08 deben reevaluarse con el inventario ampliado |
| R-04 | «UCAN/ZCAP agotan el espacio de capabilities» | B (T3) | D-08 debe considerar Biscuit/GNAP además de UCAN/ZCAP |
| R-05 | «No existe estándar de versionado de identidad» (formulación amplia) | B (T4) | Estrechar a «no hay estándar de versionado de Constitución de agente» (D-03) |
| R-06 | «Ninguna norma prescribe ningún N fijo» (formulación amplia de U2) | A (H-A2) | Matizar: Basilea MAR32 prescribe 250 días en su ámbito; no generalizable a agentes |
| R-07 | «200–500 bastan para decidir diferencias de 3 puntos» (lectura fuerte de C11) | A (H-A3) | Añadir MDE, exigencia de declarar K, distinción decidir-vs-descartar |
| R-08 | «Los casos de Nexo son ensayos Bernoulli independientes» (supuesto implícito) | A (H-A4) | Definir «caso»; exigir errores estándar agrupados |
| R-09 | «200–500 es un rango con estatus privilegiado» | A (H-A6) | Corrobora la etiqueta PROPUESTA/heurística |
| R-10 | «SR 11-7 es el marco vigente para validar agentes en finanzas» | A (H-A7) | Derogada por SR 26-2; agentes excluidos expresamente |
| R-11 | «Ed25519 está incluido literalmente en IR 8547» (etiqueta EVIDENCE) | D (H-D1) | Re-etiquetar a CORROBORATED/INFERENCE con la cadena explícita |
| R-12 | «Migrar las firmas antes de 2030 es prescripción NIST» | D (H-D4) | Re-etiquetar como PROPOSAL; el hito federal de firmas es 2031 |
| R-13 | «Un autenticador no exportable en software aislado podría alegarse AAL3» (M03 §2) | E (F-E01) | Registrar la precisión: entorno aislado protegido por hardware (§§2.3.2/3.2.13) |
| R-14 | «R2 es internamente consistente en sus estados» | E (F-E02, F-E03) | Alinear §11 B2/B7 con §7 y el cierre (U6/U9 RESUELTOS) |
| R-15 | «EVIDENCE incluye corroboración por ≥2 resúmenes» (definición §0) | E (F-E11) | Degradar a CORROBORATED C09/C10/C12/R2c o leer verbatim y nombrar fuentes |
| R-16 | «C11 prescribe bootstrap según Miller» | E (F-E09) | Alinear con Miller: CLT; bootstrap solo para esquemas/estimadores complejos |

### 7.2 Corroboraciones (intentos de refutación que fracasaron)

| # | Afirmación corroborada | Frente | Base |
|---|---|---|---|
| K-01 | Núcleo de C14/M03-corr. 03 (fechas 2030/2035, EdDSA ≥128 bits, hitos federales) | D, E (F-E25) | Lectura primaria directa de IR 8547 final, EO 14412, M-26-15 |
| K-02 | No hay expiración criptográfica automática de Ed25519 | D | IR 8547 §2.1.1 (vulnerabilidad = Shor ante CRQC, no fecha) |
| K-03 | Aritmética binomial de C11 (±6,4 / ±4,0 / ±6,9) | A, E | Cálculo propio reproducido |
| K-04 | Fórmula de Miller §5 (≈969, MDE 13,2%/7,5%, bootstrap innecesario, pareadas) | A, E | PDF primario arXiv:2411.00640v1 |
| K-05 | No existe norma universal 200–500 para agentes (en las fuentes examinadas) | A | 19 fuentes; convergencia de 6 familias normativas |
| K-06 | Fallo estructural central (sin revocación/sucesión sin TTP) | B | Inducción sobre todos los mecanismos examinados; KERI lo admite |
| K-07 | La tesis cualitativa de evaluación (mismo modelo, distinto puntaje según implementación) | C | 3 fuentes independientes (CRFM, HF 2023, bestaiweb) |
| K-08 | Citas de estatus normativo verificadas (DID Core, VC 2.0, did:key, ZCAP, BitstringStatusList) | B (T8), E | Lectura de páginas de estado |
| K-09 | C03 (cita GitHub corregida por R2) verbatim | E (F-E26) | GitHub Docs, leído directamente |
| K-10 | A2A v1.0.1 (28-05-2026) y discrepancia de frontmatter | E (F-E26) | Spec `latest` en vivo + releases GitHub |
| K-11 | NIST AI 200-3 Ap. C (cifras de participantes) | E (F-E26) | PDF primario, 36 pp. |
| K-12 | Conteos internos (16, 15, 12, 13, 12, T1–T14, 9 UNKNOWN) | E (F-E26) | Aritmética interna coherente |

### 7.3 Estados epistemológicos: antes y después de MUSE-AUTONOMY-003

| Registro | Estado antes (cierre R2) | Estado después de 003 | Cambio |
|---|---|---|---|
| U2 | UNKNOWN | UNKNOWN | Sin cambio de estado; contenido sustantivo precisado (Basilea como caso límite; MDE; definición de caso pendiente) |
| U3 | UNKNOWN | UNKNOWN | Sin cambio de estado; inventario ampliado con 26 fichas; formulación actualizada («exhaustividad no demostrada») |
| U5 | UNKNOWN | UNKNOWN | Sin cambio de estado; atribución refutada; procedencia real establecida (CRFM); comparación pareada HF 2023 localizada |
| U1 | RESUELTO | RESUELTO | Sin cambio (F-E04/F-E08 son texto obsoleto, no estado) |
| U4 | RESUELTO | RESUELTO | Sin cambio (F-E06/F-E07 son calificadores obsoletos, no estado) |
| U6 | RESUELTO | RESUELTO | Sin cambio de estado; corregir la contradicción de §11 B7 |
| U7 | RESUELTO | RESUELTO (alcance acotado) | Precisión F-E10: lo resuelto es la cuestión nominal; la funcional sigue como PROPOSAL |
| U8 | RESUELTO | RESUELTO | Sin cambio (F-E09 es tensión redacción/evidencia en C11, no en U8) |
| U9 | RESUELTO | RESUELTO (alcance acotado) | Precisión F-E16: completitud de eventos sí; no-pertenencia de clave es matiz distinto; corregir §11 B2 |
| C14 | PARCIALMENTE CONFIRMADA | PARCIALMENTE CONFIRMADA | Sin cambio de veredicto; H-04 cerrado para el núcleo; etiquetas precisadas (H-D1, H-D4) |
| C01–C13, C15, C16 | CONFIRMADA | CONFIRMADA | Sin cambio de veredicto (F-E13: la cadena de custodia del texto original no está documentada) |
| D-01 a D-12 | SIN DECIDIR | SIN DECIDIR | Sin cambio |
| Cierre sustantivo global | PARTIAL | PARTIAL | Sin cambio; no se declara PASS |

### 7.4 Nuevos UNKNOWN y sub-UNKNOWN registrados por 003

- **Verificación *legacy* post-2035** de firmas Ed25519 anteriores (Frente D, H-D2): IR 8547 no lo trata; resolvería la revisión futura de SP 800-131A.
- **Sub-UNKNOWNs de U5** (Frente C): documento enlazado por CRFM para «Claude 2.1» en mayo de 2024; versión de HELM en CRFM; temperatura/semilla/decoding del brazo HELM; agregación macro/micro; contenido de bestaiweb y del literature review en 2026-11-05.
- **Jurisdicción de Kevin** (Frente B, T7): determina la aplicabilidad de eIDAS 2.0; dato del propietario, no investigable en fuentes públicas.
- **Procedencia de P7** desde un frente que respeta la regla de artefactos (Frente E, F-E14).
- **Texto original de C01–C16** (Frente E, F-E13): fidelidad de las reformulaciones de M03-B, UNKNOWN.
- **Controles SP 800-53 de C09/C10/C12** leídos verbatim (Frente E, F-E11): no comprobados; como máximo CORROBORATED.
- **Versiones en conflicto** (Frente B): did:webvh v0.5/1.0, ARF v1.4/v2.8.0/v3.0.0, RUFADAA 47/48 estados, ISO/IEC 29115 2013/2023, aprobación KERI v1.0.
- **Familias no examinadas para U2** (Frente A): DO-178C, ISO 26262, IEC 62304, ISO 14155, Common Criteria, regulación china; textos íntegros paywall.

## 8. Limitaciones de esta misión

- **Las cinco pasadas comparten contexto** (subagentes de Snow). No son revisión externa independiente; comparten fuentes, supuestos y sesgos. Los riesgos omitidos por modelo mental compartido se documentan en §6 (Frente E §5), pero la lista no es exhaustiva por definición.
- **Búsquedas finitas, universales negativos no demostrados.** Ningún frente demuestra inexistencia universal: U2 (norma universal), U3 (exhaustividad), U5 (ninguna comparación pareada que dé 4–5), T5/T6 (revocación/sucesión). Lo demostrado es: búsquedas ampliadas sin hallazgo, un cuasi-contraejemplo acotado (Basilea), y refutaciones positivas de atribuciones concretas.
- **Lecturas primarias no realizadas** (ver registro de fuentes): textos íntegros paywall de ISO/IEC 42001/23894/25059/29119, IEEE 1012, SP 800-131A Rev. 2/3, GPT-4 Technical Report verbatim, UMA 2.0, XACML/NGAC, AuthZEN, OID4VC, WebAuthn L3, SSF/CAEP/RISC, DIDComm v2, ARF/EUDI, SP 800-63A-4/C-4, ISO 29115/24760, RATS/EAT, SPIFFE, WIMSE/AIMS, ANP/did:wba; historial de bestaiweb y del literature review a 2026-11-05; datos crudos del leaderboard HELM MMLU.
- **Bloqueos registrados sin rellenar:** govinfo HTTP 500 (EO 14412, sustituido por Casa Blanca); PDF del Código GPAI (fetch fallido); RFC 8032 por extractos (mitigado por FIPS 186-5); página primaria DIF de did:webvh no localizada.
- **No se ejecutó ninguna evaluación** (Frente C): no se corrió HELM ni lm-evaluation-harness; una ejecución pareada nueva sería un experimento, fuera de alcance.
- **No se reabrieron U1, U4, U6, U7, U8, U9** salvo contradicciones nuevas, concretas y materiales (F-E01, F-E02, F-E03, F-E10, F-E16, F-E23, F-E24), documentadas sin repetir sus auditorías.
- **El PDF R2 no es un artefacto publicado en la rama** (el HTML es el canónico aceptado); este informe no lo verifica como publicación.

## 9. Correcciones mínimas recomendadas (PROPOSAL, no aplicadas)

Ninguna requiere re-auditoría ni toca NCS M0, P07 o D-01–D-12. Son precisiones editoriales y de etiquetado para una futura rectificación del expediente, si el propietario lo decide:

1. **Reescribir D5/U5** con la procedencia real (CRFM HELM MMLU, HELM vs reportado; tabla HF 2023; MMLU-Pro §6.3 como magnitud distinta) y registrar los sub-UNKNOWNs de U5.
2. **Alinear §11 B2 (U9), §11 B7 (U6), §11 D, §11 E H-07, §11 C4, §3 C02 (párrafo de precisión) y §12 (fila A2A)** con los estados vigentes de §7 y el cierre.
3. **Registrar la precisión F-E01** (AAL3: entorno aislado protegido por hardware, §§2.3.2/3.2.13; no llave externa, pero tampoco software aislado) como corrección a M03 §2.
4. **Degradar a CORROBORATED** las afirmaciones EVIDENCE que descansan en resúmenes no nombrados (C09, C10, C12, R2c) o leer verbatim los controles y nombrar las fuentes; redefinir EVIDENCE en §0 para excluir «corroborado por ≥2 resúmenes».
5. **Alinear la redacción prevalente de C11 con Miller** (CLT; bootstrap solo para esquemas/estimadores complejos) y añadir la tabla de MDE, la exigencia de declarar K y la definición de «caso».
6. **Precisar C14** según §6 del informe del Frente D (etiqueta de Ed25519, estatus de plan anunciado, *disallowed* para aplicar protección, «antes de 2030» como PROPOSAL, cualificaciones federales, matiz de autenticación).
7. **Acotar U7** a su alcance demostrado y registrar la cuestión funcional como PROPOSAL; **distinguir en U9** no-pertenencia de clave de completitud del universo de eventos.
8. **Etiquetar §6.4 por ítem** (EVIDENCE/PROPOSAL); **añadir en §1 el mapeo** APROBADO CONDICIONADO ↔ PARTIAL; **deduplicar U5** en el cierre; **archivar el texto original de C01–C16**; **fijar las citas A2A al tag v1.0.1** con instantáneas; **actualizar §11 C2** (IR 8547 ya leído línea a línea) y **§11 C** (A2A §8.4 confirmado).
9. **Actualizar la formulación de U3** con el inventario ampliado (26 fichas) y encargar, antes de decidir D-01/D-02/D-06/D-08, la lectura primaria de F-01, F-02, F-08, F-14, F-18, F-22 y F-24, el censo del registro DID y de borradores WIMSE/AIMS, y el registro de la jurisdicción de Kevin.
10. **Dividir U2** en U2-a (existencia), U2-b (parámetros empíricos para D-07) y U2-c (definición de caso), sin resolver ninguno en esta misión.

## 10. Fuentes

Registro completo en `MUSE_AUTONOMY_003_SOURCE_REGISTER.md` (documento C de esta misión). Resumen: 6+ lecturas primarias directas por frente en los frentes A, B, C y D; lectura primaria del final de IR 8547 (2.204 líneas), de SP 800-63B-4 §§2.3.2/3.2.13/Ap. B/Ap. E, de CRFM HELM MMLU, de HF 2023, de MMLU-Pro §6.3, de Miller (2024) y de la spec A2A `latest` (§8.4). Las fuentes heredadas del cierre (ARIA, RMF, AI Act art. 10, Miller §5, UCAN, ZCAP, RFC 9162) se aceptan como CORROBORATED donde no se re-leyeron íntegras, no como lectura primaria propia de cada frente.

---

*Fin del informe MUSE-AUTONOMY-003. Dictamen global: la misión refutó atribuciones y formulaciones concretas con evidencia primaria; el núcleo sustantivo del expediente sobrevivió; los estados no cambian; el cierre sustantivo global sigue siendo PARTIAL.*
