# MISIÓN MUSE-AUTONOMY-003 — REGISTRO DE FUENTES

**Fecha:** 2026-11-07. **Expediente revisado:** `report-r2.md` + `closure-r2.md` (HEAD `c37a3575…`). **Regla de lectura:** EVIDENCE = fuente primaria leída directamente con ubicación exacta; CORROBORATED = fuentes independientes convergentes (tres resúmenes del mismo documento NO son tres fuentes); INFERENCE = derivada de primarias combinadas; las fuentes heredadas del cierre que un frente no re-leyó íntegras se aceptan como CORROBORATED, no como lectura primaria propia. Las cinco pasadas comparten contexto (subagentes de Snow, no revisores externos independientes).

## 1. Fuentes primarias leídas directamente (EVIDENCE)

### Frente A — U2

| # | Fuente | Versión / fecha | Ubicación | Qué se verificó | Limitación |
|---|---|---|---|---|---|
| A-P1 | Miller (2024), «Rethinking Sampling…» | arXiv:2411.00640v1, 2024-11-01 | PDF íntegro (§§2–5, Ap. B–C) | Fórmula de MDE §5 ecs. (9)–(10); ≈969; 13,2%/7,5%; bootstrap innecesario (§5); SE agrupados §2.2 Tablas 3–4 (hasta 3,05×) | Ninguna relevante |
| A-P2 | Fed/OCC/FDIC, SR 26-2 | 17-04-2026 (vigente) | Texto íntegro, §§I, II (nota 3), IV, V | Deroga SR 11-7; excluye expresamente GenAI/agentic AI (nota 3) | Ninguna |
| A-P3 | Basel Framework, MAR32 | Vigente 01-01-2023 | bis.org, MAR32.3(3), MAR32.9 Tabla 1 | 250 observaciones; zonas 0–4/5–9/≥10; «based on a sample of 250 observations» | Ámbito bancario VaR, no agentes |
| A-P4 | FDA, Draft Guidance AI-enabled devices | 07-01-2025 (borrador) | Texto íntegro, §VIII, Ap. C | Justificación de tamaño muestral + potencia adecuada; sin N | Borrador, no norma final |
| A-P5 | Reglamento (UE) 2024/1689 (AI Act) | 13-06-2024 | arts. 15, 55; Ap. C ARIA (NIST AI 200-3, sept. 2026) | Sin N universal; ARIA: ejemplos de participantes humanos (≈20–40 red teamers, ≈100 usuarios) | ARIA es metodología, no norma |
| A-P6 | NIST AI RMF 1.0 | 2023 | Measure 2.1–2.3 | Sin N universal | Ninguna |
| A-P7 | NIST AI 200-3 (ARIA) | Sept. 2026 | §§3–4, Ap. C | Ejemplos de participantes humanos, no N de casos | Ninguna |
| A-P8 | ISO/IEC/IEEE 29119-1 | 2013 (extracto) | §3.34 (muestreo) | Testing exhaustivo imposible; muestreo sin N fijo | Extracto, no texto íntegro |
| A-P9 | Polo et al. 2024 (tinyBenchmarks) | ICML 2024 (PMLR 235) | Paper completo | 100 curados estiman MMLU con error ≈2% | Ninguna |
| A-P10 | CRFM HELM Lite/Capabilities; Miller Tabla 2; M02 §3.3 | 2023–2024 | HELM Docs; Miller Tabla 2 | HELM topa en 1.000 por coste; HumanEval 164; GPQA Diamond 198 | Ninguna |

### Frente B — U3

| # | Fuente | Versión / fecha | Ubicación | Qué se verificó | Limitación |
|---|---|---|---|---|---|
| B-P1 | GNAP (Grant Negotiation and Authorization Protocol) | RFC 9635, IETF Standards Track | Texto íntegro | Delegación fina, grant con restricciones, sin scopes implícitos | Ninguna |
| B-P2 | FROST (Flexible Round-Optimized Schnorr Threshold) | RFC 9591, Informational | Texto íntegro | Umbral Schnorr sin ledger; estatus Informational, no estándar | Estatus: no es un estándar |
| B-P3 | KERI (Key Event Receipt Infrastructure) | Spec v1.1 | Texto íntegro | Rotación pre-comprometida, KEL, delegación jerárquica, recuperación social por umbral sin ledger | Aprobación v1.0 (21-01-2026) no verificada en primaria |
| B-P4 | DID Core | W3C Recommendation, 19-07-2022 | §§5.3.3–5.3.4 | `capabilityDelegation`, `versionId`/`versionTime` | Ninguna |
| B-P5 | SCITT (Supply Chain Integrity, Transparency and Trust) | RFC 9943, IETF Standards Track | Texto íntegro | Transparencia generalizada con recibos; §1 reconoce «fine-grained revocation is too hard» | Ninguna |
| B-P6 | BitstringStatusList | v1.0 W3C Recommendation, 15-05-2025 | Página de estado | Estatus normativo final verificado | Ninguna |
| B-P7 | Reglamento (UE) 2024/1183 (eIDAS 2.0) | 11-04-2024 | Texto de la ley | Marco europeo de identidad; plazos 2026–2027 | Aplicabilidad a Nexo no resuelta (jurisdicción) |
| B-P8 | Reglamento (UE) 650/2012 (sucesión) | 04-07-2012 | Texto de la ley | Sucesión civil sin efecto criptográfico | Derecho, no técnica |
| B-P9 | RUFADAA (Revised Uniform Fiduciary Access to Digital Assets Act) | EEUU, 2015 | Texto de la ley | Acceso fiduciario a activos digitales; sin transferencia criptográfica | 47/48 estados en conflicto de versiones |
| B-P10 | VC 2.0; did:key; ZCAP-LD | Rec. 15-05-2025; CCG Draft v0.9; v0.4.0-draft (07-10-2026) | Páginas de estado W3C/CCG | Estatus normativo verificado; ZCAP sí define tratamiento de revocación (caveats) | ZCAP: más detalle normativo en backlog |

### Frente C — U5

| # | Fuente | Versión / fecha | Ubicación | Qué se verificó | Limitación |
|---|---|---|---|---|---|
| C-P1 | CRFM, «HELM MMLU» | 2024-05-01 | https://crfm.stanford.edu/2024/05/01/helm-mmlu.html, tabla completa (25 modelos) | Comparación HELM vs reportado; Δ −5,0/+1,8; mediana \|Δ\|=1,2; media −0,65 | Enlace para «Claude 2.1» no verificable en el documento recuperado |
| C-P2 | Hugging Face, «What's going on with the Open LLM Leaderboard?» | Jun. 2023 | https://github.com/huggingface/blog/blob/main/open-llm-leaderboard-mmlu.md, L58–L82, L180–L259, L280–L285; commits e47e01b/cab5d89 | Comparación pareada HELM vs harness: LLaMA-65B 0,637 vs 0,488 (+14,9); gaps −7,7 a +14,9 | Post de 2023; implementaciones actualizadas después |
| C-P3 | Wang et al., MMLU-Pro | arXiv:2406.01574v4 | https://arxiv.org/html/2406.01574v4/, abstract y §6.3 (L469–L488) | 24 estilos de prompt, MMLU «generally 4-5 %, peaks up to 10.98 %» | La confusión con M02 es INFERENCE, no demostrada |
| C-P4 | Anthropic, Model Card Claude 2 | Jul. 2023 | PDF §4.3 (L500–L521) | MMLU 5-shot CoT 78,5 % para Claude 2 (T=1); 73,4/77,0 para Instant 1.1/1.3 | El enlace CRFM pudo cambiar desde mayo de 2024 |
| C-P5 | bestaiweb.ai, artículo índice | Leído 2026-11-07 (actualizado 2026-11-03) | Artículo completo (300 líneas) | No contiene la cifra 4–5; su única comparación HELM-vs-harness es HF 2023 (15 puntos) | Historial a 2026-11-05 no disponible |
| C-P6 | GitHub literature review (llm-reliability-ranking) | Commit 22fe45f | docs/literature_review.md (204 líneas) | No contiene la cifra; «4-20 points (SourceScore, 2026)» sin entrada en referencias | Historial a 2026-11-05 no reconstruible |
| C-P7 | HELM paper (TMLR 2023) + READMEs actuales | 2023; mantenimiento desde 01-06-2026 | Paper + READMEs (heredado del cierre) | Varianza con prompts/few-shot; modo mantenimiento | Ninguna |
| C-P8 | Hendrycks et al. 2020 (MMLU); dataset cais/mmlu | 2020 | Referencias del cálculo F-09 | n=14.042 preguntas; SE ±0,73/±0,63 pt | Cálculo propio, no primaria |

### Frente D — C14

| # | Fuente | Versión / fecha | Ubicación | Qué se verificó | Limitación |
|---|---|---|---|---|---|
| D-P1 | NIST IR 8547 final | 27-10-2026 | DOI 10.6028/NIST.IR.8547, texto íntegro (2.204 líneas) | §4/§4.1.1 cita literal; Tabla 2 EdDSA ≥128 bits; §4.2; §4.1.3; §2.1.1; §3.1.2; cero ocurrencias de «Ed25519» y de «before 2030» para firmas | Ninguna para el núcleo |
| D-P2 | FIPS 186-5 | 2023 | §7 (pág. CSRC leída) | Ed25519 ≈128 bits (RFC 8032) | Ninguna |
| D-P3 | FIPS 203/204/205 | Finales 13-08-2024 | Páginas CSRC | Fechas finales confirmadas | Ninguna |
| D-P4 | EO 14412 | 22-06-2026 | Texto oficial Casa Blanca (ínt.), §4(b), §7(b)-(c) | PQC claves 31-12-2030; fondos; sin derecho exigible | govinfo HTTP 500 (sustituido por Casa Blanca) |
| D-P5 | OMB M-26-15 | 24-06-2026 | PDF oficial íntegro (776 líneas) | PQC firmas 31-12-2031; HVA/high-impact; §3.2.1 híbridos/firmas duales; Ap. A sin EdDSA | Ninguna |
| D-P6 | SP 800-57 (referencia cruzada) | Vigente | Referencia en F-E25 | 112-bit disallow 01-01-2031 proyectado; final más laxo ahí | No leído verbatim por el frente E |

### Frente E — Ataque cruzado

| # | Fuente | Versión / fecha | Ubicación | Qué se verificó | Limitación |
|---|---|---|---|---|---|
| E-P1 | NIST SP 800-63B-4 | Jul. 2025 | §§2.3.2, 3.2.13, Ap. B, Ap. E (pages.nist.gov/800-63-4) | §3.2.13: entorno aislado protegido por hardware (secure element, TEE, TPM) | Ninguna |
| E-P2 | GitHub Docs, About commit signature verification | Leído 2026-11-06/07 (164 líneas) | https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification | Cita C03 verbatim (verificados retenidos tras revocación) | Ninguna |
| E-P3 | A2A Protocol spec | `latest`, tag v1.0.1 (28-05-2026) | a2a.dev/specification/; `spec/a2a.proto` §1.4; GOVERNANCE.md | §8.4 MAY JWS, SHOULD verificación (confirmado en vivo); frontmatter «Latest Released Version 1.0.0»; `agent.json` sin ocurrencias | Punteros §3.3/§4.6/§5.1 desfasados; citas no fijadas por snapshot |
| E-P4 | NIST IR 8547 final | 27-10-2026 | PDF íntegro (DOI 10.6028/NIST.IR.8547) | Fecha, frase §4.1.1, Tabla 2; 112-bit simétrica desautorizada en 2030 (§4.1.3) | Ninguna |
| E-P5 | NIST SP 800-53 | Rel. 5.1 / 5.2.0 | CP-10, IR-9, AC-4(8), SC-18(1), SI-3; change list 5.2.0 | Quarantine como contención, no fase de restauración; 5.2.0 no cambió esos controles (corroborado por change list) | 5.1 leído; 5.2.0 por change list, no por diff |
| E-P6 | RFC 9162 (CT v2.0) | Dic. 2021, Experimental | §§2.1.3–2.1.4, 8.2–8.3, 11.3 | Prueba de inclusión/consistencia; gossip fuera de alcance | Ninguna |
| E-P7 | Miller (2024) | arXiv:2411.00640v1 | PDF íntegro | ≈969, ≥1.000, pareadas, bootstrap innecesario | Ninguna |
| E-P8 | NIST AI 200-3 (ARIA) | Sept. 2026 | Ap. C, PDF 36 pp. | Cifras de participantes verbatim | Ninguna |

## 2. Fuentes secundarias y corroboradas (CORROBORATED)

| # | Fuente | Versión / fecha | Qué corrobora | Limitación |
|---|---|---|---|---|
| S-1 | Resúmenes de IR 8547 final (postquantum.com, CSA, yaamlabs.com, quentir.ai) | 27-oct–2-nov-2026 | Fechas 2030/2035 y alcance del final | Reescrituras casi simultáneas del mismo comunicado NIST; NO son 4 fuentes independientes |
| S-2 | Resúmenes de GPT-4 Technical Report | 2023 | 86,4 % de GPT-4 (5-shot) | El primario (arXiv:2303.08774) no se leyó verbatim |
| S-3 | Resúmenes de NIST AI 200-3 / ARIA | Sept. 2026 | Ejemplos de participantes | El primario se leyó por el frente E (Ap. C) |
| S-4 | Resúmenes de HELM (TMLR 2023) y READMEs actuales | 2023–2026 | Varianza con prompts/few-shot; mantenimiento desde 01-06-2026 | El paper se leyó por el cierre, no por el frente C |
| S-5 | Openlayer (blog) sobre SR 26-2 | 2026 | Afirmación de derogación de SR 11-7 | Desmentida por el primario (SR 26-2); no usar |
| S-6 | Secundarias de UCAN/ZCAP (docs oficiales, repos) | 2024–2026 | UCAN v1.0.0; ZCAP v0.4.0-draft | El cierre leyó UCAN v1.0.0 y ZCAP v0.4.0-draft directamente |
| S-7 | Secundarias de A2A (Linux Foundation 23-06-2025; AAIF 17-08-2026; A2A Protocol 27-08-2026) | 2025–2026 | Gobernanza A2A | La spec y GOVERNANCE.md se leyeron directamente por el frente E |
| S-8 | Secundarias de SP 800-53 (resúmenes de controles) | 2020–2025 | C09/C10/C12 | Controles no leídos verbatim; resúmenes no nombrados (F-E11) |
| S-9 | Secundarias de KERI, did:webvh, SPIFFE/WIMSE, OID4VC, WebAuthn L3, SSF/CAEP/RISC, DIDComm v2, ARF/EUDI | 2023–2026 | Fichas B no leídas en primario | CORROBORATED, no EVIDENCE |
| S-10 | Secundarias de Chen et al. e Invariant Labs (2025) | 2025 | Prompt injection / MCP tool poisoning | Heredadas de M03; no leídas en primario por 003 |

## 3. Fuentes heredadas del cierre (no re-leídas íntegras por 003; CORROBORATED)

| # | Fuente | Versión / fecha | Estado heredado | Limitación |
|---|---|---|---|---|
| H-1 | NIST SP 800-63B-4 | Jul. 2025 | U1 RESUELTO (leído verbatim por el cierre) | El frente E re-leyó §§2.3.2/3.2.13/Ap. B/Ap. E (E-P1) |
| H-2 | Miller (2024) | arXiv:2411.00640v1 | U8 RESUELTO (leído por el cierre) | Re-leído íntegramente por A y E |
| H-3 | A2A governance (LF, AAIF, GOVERNANCE.md, releases) | 2025–2026 | U4 RESUELTO | Re-leído parcialmente por E (E-P3) |
| H-4 | ASML / EU JRC (EUV) | 2024–2026 | U6 RESUELTO | No re-leído por 003 salvo por cifras heredadas (F-E20) |
| H-5 | NIST SP 800-53 Rel. 5.1/5.2.0 | 2020/2025 | U7 RESUELTO (alcance acotado por F-E10) | Re-leído parcialmente por E (E-P5) |
| H-6 | RFC 9162 (CT v2.0) | Dic. 2021 | U9 RESUELTO (alcance acotado por F-E16) | Re-leído por E (E-P6) |
| H-7 | HELM paper (TMLR 2023) + READMEs | 2023 | U5: sin comparación pareada (refutado por C, F-03) | Re-leído parcialmente por C |
| H-8 | UCAN v1.0.0; ZCAP v0.4.0-draft | 2024; 07-10-2026 | U3: no son solución integral | Precisión F-E23 (ZCAP sí define revocación) |

## 4. Bloqueos y fuentes no disponibles

| # | Fuente / intento | Bloqueo | Consecuencia |
|---|---|---|---|
| B-1 | govinfo (EO 14412) | HTTP 500, no reintentado | Sustituido por texto oficial de la Casa Blanca (D-P4) |
| B-2 | Código de Práctica GPAI (PDF) | Fetch fallido, no repetido | U2: fuente no examinada |
| B-3 | ISO/IEC 42001, 23894, 25059, 29119 (textos íntegros); IEEE 1012; NIST AI 600-1 | Paywall / previsualizaciones parciales | U2: búsqueda no exhaustiva |
| B-4 | SP 800-131A Rev. 2 / Rev. 3 | No leído verbatim | C14: elevación imposible sin él |
| B-5 | GPT-4 Technical Report (arXiv:2303.08774) | No leído verbatim | C-F08: CORROBORATED, no EVIDENCE |
| B-6 | RFC 8032 | Por extractos | Mitigado por FIPS 186-5 §7 (D-P2) |
| B-7 | bestaiweb y literature review a 2026-11-05 | Historial no disponible | C-F04/F-05: UNKNOWN para versiones anteriores |
| B-8 | Datos crudos del leaderboard HELM MMLU | No localizados | C-F07/F-09: sin test pareado |
| B-9 | Página primaria DIF de did:webvh | No localizada | B: CORROBORATED, no EVIDENCE |
| B-10 | UMA 2.0, XACML/NGAC, AuthZEN, OID4VC, WebAuthn L3, SSF/CAEP/RISC, DIDComm v2, ARF/EUDI, SP 800-63A-4/C-4, ISO 29115/24760, RATS/EAT, SPIFFE, WIMSE/AIMS, ANP/did:wba | No leídos en primario por 003 | B: fichas CORROBORATED; lectura primaria pendiente antes de decidir D-01/D-02/D-06/D-08 |
| B-11 | DO-178C, ISO 26262, IEC 62304, ISO 14155, Common Criteria, regulación china de evaluación de IA | No examinados | A: familias no examinadas para U2 |
| B-12 | Texto original de C01–C16 (ChatGPT) | No presente en el expediente | E-F13: cadena de custodia UNKNOWN |
| B-13 | P7 (hoja consolidada de erratas del propietario) | Artefacto; no legible directamente por un frente | E-F14: no verificable desde aquí |

## 5. Verificaciones de integridad de los informes de frente

- `fronts/A/report.md`: 444 líneas, 64.136 bytes; 19 fuentes (F1–F19).
- `fronts/B/report.md`: 563 líneas, 103.373 bytes; 26 fichas (F-01–F-26); 6 lecturas primarias directas.
- `fronts/C/report.md`: 543 líneas, 78.274 bytes; 10 hallazgos (F-01–F-10).
- `fronts/D/report.md`: 344 líneas, 56.191 bytes; lectura primaria de IR 8547 íntegro (2.204 líneas), EO 14412 y M-26-15 íntegros.
- `fronts/E/report.md`: 425 líneas, 78.348 bytes; 26 hallazgos (F-E01–F-E26).
- Fuentes canónicas de partida: `branch/report-r2.md` (113.706 bytes), `branch/closure-r2.md` (21.346 bytes), `branch/HANDOFF_MUSE_AUTONOMY_002_R2_RECOVERY_2026-11-07.md` (6.403 bytes); informes M02/M03/M03-B (`report.md` de investigación).

---

*Fin del registro de fuentes MUSE-AUTONOMY-003.*
