# GRAND MISSION 01 — Reconciliación histórica (Historical Reconciliation)

- **Fuente primaria:** repositorio `snowdenxrp/aldea-ia`, rama `nexo-mission-02-pdf-2026-11-05`, HEAD `c5724aa60914e71c352fd5f793be636c9c6703cb` (2026-11-10). Rango estudiado: `1112c26d` (2026-11-06) → HEAD, 121 commits, diff neto 54 altas / 0 modificaciones / 0 bajas (todas bajo `NEXO_NCS/RESEARCH/...`). El árbol en `1112c26d` ya contiene todo el corpus previo (septiembre–octubre de 2026): este rango estudia la capa documental de noviembre sobre ese corpus.
- **Método:** índices, handoffs y consolidaciones como localizadores; corpus masivos no releídos uno por uno; AB104/AB105/TLC no reabiertos (existencia y estado según índices). Etiquetas: EVIDENCIA / PROPUESTA / HIPÓTESIS / UNKNOWN. Detalle de fuentes en `GRAND_MISSION_01_SOURCE_REGISTER.md`.

## 1. Cronología: idea → investigación → decisión → diseño → implementación → prueba → CI → correcciones → estado actual

### Fase A — Investigación AB raíz (2026-09-24/25) — EVIDENCIA (inventario)
80 archivos `NEXO_AB7…AB56*` y `NEXO_*_RESEARCH_*` en la raíz (ya presentes en `1112c26d`), con borradores TLA (`NEXO_AB36_PAA_ABSTRACT_TLA_DRAFT_V1_2026-09-24.tla`, `NEXO_AB36B_*.tla`) y auditorías adversariales (`NEXO_AB36A_…`). Rol: semántica de admisión, quotients, leases, transiciones y cierre de protocolos (PAA). No re-auditada en esta misión.

### Fase B — AB104/AB105 en `NEXO_CONTINUITY/` y `docs/nexo/` (2026-09-25 → 2026-10-01) — EVIDENCIA (existencia/estado según índices)
- `NEXO_CONTINUITY/` (313 archivos): cadena AB104 (`AB104_100…AB104_151`, `AB104.131…AB104.151`), gates/runners AB55–AB99 con artefactos ejecutables históricos (`.py`/`.yml`), cierres por bloques P101–P112.
- `docs/nexo/` (1.802 archivos): AB104.369+ (2026-09-26) y serie AB105.*R (2026-09-29/10-01).
- Estado según `NEXO_MASTER_EVIDENCE_MAP_2026-10-04.md` (índice, no re-auditoría): ancla analítica protegida **AB105.116R**; **AB105.117R prohibido** (existe artefacto histórico `AB105.117R_G0_REAL_BROKER_ORDERING_WITNESS_V2_2026-10-03.md` — el propio mapa lo registra como contradicción #3); **TLC congelado** (run histórico 36781846063 citado, no re-ejecutado). Frontera primaria histórica: **AB104.151**; AB104.152–.184 solo cross-checks retrospectivos; prohibido backfill de AB104.185 primario.

### Fase C — G0 / Kafka JMM (2026-10-04) — EVIDENCIA con alcance acotado
`NEXO_CONTINUITY_G0_JMM_SNAPSHOT_AUDIT_2026-10-04.md` + mapa maestro (checkpoint JMM `d6c2ac31…`, pin Kafka `99b940733a9f6bc409457dba7108f08421d81e42`). Evidencia ejecutada documentada: PR #93 (`001367b6…`), run **37040417803 / job 110948877687 SUCCESS** (100 iteraciones × 4 lectores, 4.071.307 observaciones, `POST_RETURN_ALLOWED=0`, `UNEXPECTED=0`) — **negativo acotado** para ese probe sintético; no prueba de imposibilidad; no testigo real-broker. Real-broker documentado: run 370778 (240 eventos, 140/140 marcadores, orden temporal W1 < ENQUEUE < DEQUEUE < AUTH_ENTER < DENIED ×10) — **temporal solamente**, sin arista JMM happens-before establecida. W1→R1: UNKNOWN; vulnerabilidad: NOT ESTABLISHED. Run 370790: documentado pero lookup 404, sin artefacto crudo — no contable como evidencia fresca.

### Fase D — P112 y destilación del Core (2026-10-07/08) — EVIDENCIA documental / construcción pendiente
- `MASTER_P112_CHECKPOINT_2026-10-07.md` (891 L): ancla AB105.116R; frontera AB104.151; **cierre formal de P112 NO declarado**; granularidad mínima exacta de VersionSet **OPEN**; checkpoint VersionSet en commit `18b203e9…` (citado en el propio checkpoint).
- `NEW_CHAT_HANDOFF_P112_AB_WAIT_2026-10-07.md`: AB en espera (reanudación en bloques de 10 desde la frontera primaria tras cerrar P112). Primitiva documentada: `persistState(expectedRevision)` como commit condicional conservador para escritores cooperantes, con pruebas citadas (no re-ejecutadas). Brecha documentada: sin ciclo de vida atómico demostrado PREPARED durable → ejecución protegida → journal terminal → revalidación final → commit canónico → reconciliación.
- `NEW_CHAT_HANDOFF_2026-10-08.md` + `NEXO_CORE_FINAL_DISTILLATION_2026-10-08.md` (contratos C1–C12) + `NEXO_CORE_CONSTRUCTION_DESIGN_2026-10-08.md` (10 módulos, objetos de contrato, máquina de estados, primer gate): **handoff de construcción, no auditoría**. Arquitectura canónica: `INTENT → PROVENANCE/DEPENDENCIES → ISOLATED STATE → FINAL VALIDATION → CONDITIONAL COMMIT → RECONCILIATION`. STEP 3 (esqueleto de transición protegida) = siguiente trabajo documentado; brecha de runtime expresa: falta el owner de «final semantic revalidation → persistState».

### Fase E — M02 → M03 → M03-B y consolidación (2026-11-05) — EVIDENCIA documental
- `MISSION_02_NEXO_FUNDAMENTAL_ARCHITECTURE_2026-11-05.pdf` (19 MB; **sin inspección visual en esta misión** — EVIDENCE_ACCESS_BLOCKED parcial; contenido vía consolidaciones).
- Consolidación MUSE-AUTONOMY-001: siete partes P1–P7; **P7 (hoja del propietario) es la base**, con prevalencia de sus UNKNOWN y su lista de 12 materiales. Dictamen: **APROBADO CONDICIONADO** como investigación/referencia, **no** especificación técnica autorizada; NCS M0 debe terminar antes de cualquier implementación. Fallo estructural central sin solución demostrada (sin estándar de versionado de Constitución de agente, sin verificación de continuidad semántica entre modelos, sin revocación/sucesión sin tercero de confianza). Conteos: C01–C16 (15 CONFIRMADA, 1 PARCIALMENTE — C14), D1–D15, 12 materiales, R1–R7, U1–U9 (3 UNKNOWN, 6 RESUELTOS), D-01–D-12 SIN DECIDIR.
- R1 (2026-11-06): 5 correcciones a copias locales (C12 = seis controles; separaciones R1/R2; A1–A3 como precisiones del propietario; Anexo A).

### Fase F — Auditoría 002, R2 y cierre de integridad (2026-11-06/07) — EVIDENCIA
- 002 (adversarial de R1): H-01–H-04 + H-B2; 9 correcciones R2 (H-01 PASS→PARTIAL, etc.). Método: 3 pasadas con contexto compartido (**no** revisores externos independientes — declarado).
- Publicación R2: commit `96e227eb06134037fa5e01fabc8cfba4c384f476`; correcciones `0ef2f2b837d8472e22c633ba3e2b3029fc47f6e9`.
- `closure-r2.md`: **PASS limitado a publicación e integridad** de 4 archivos (`report-r2.md` 113.706 `e41c8f3b…`; HTML 153.699 `af343327…`; `hashes-r2.md` 4.450 `cde302f0…`; `consolidation-method.md` 9.720 `7295fedb…`); **cierre sustantivo global PARTIAL**. U1/U4/U6/U7/U8/U9 RESUELTOS (U7/U9 acotados); U2/U3/U5 UNKNOWN; C14 PARCIALMENTE CONFIRMADA; D-01–D-12 SIN DECIDIR. PDF R2 independiente: **no publicado**; HTML canónico aceptado por el propietario.
- `HANDOFF_MUSE_AUTONOMY_002_R2_RECOVERY_2026-11-07.md`: intento manual de SHA-256 con autocontrol `abc` fallido → **ningún hash de ese intento es válido**; el bloque «Revisión editorial adicional» de `closure-r2.md` (112.505/152.279 bytes) queda **SUPERSEDIDO** para la integridad vigente.
- Lecturas primarias del cierre (2026-11-07, documentadas): U1 SP 800-63B-4; U8 Miller arXiv:2411.00640; U2 ARIA/RMF/AI Act (sin umbral universal → UNKNOWN); U3 UCAN/ZCAP (UNKNOWN); U4 LF/AAIF/A2A + releases v1.0.0/v1.0.1 (discrepancia upstream 26-vs-28 conservada); U5 HELM/lm-eval (sin comparación pareada que sustente 4–5 → UNKNOWN); U6 ASML/JRC; U7 SP 800-53 Rev.5.1 (quarantine = contención, no fase de restauración); U9 RFC 9162 (inclusión/consistencia, no completitud).

### Fase G — Falsación 003 (2026-11-07) — EVIDENCIA documental
Rama contiene `MUSE_AUTONOMY_003_*` (4 archivos); conjunto de trabajo en espacio local. 5 pasadas con contexto compartido (no independientes externos). Sin modificación de canónicos, sin PASS global; cierre sustantivo PARTIAL.
- **Refutaciones documentadas:** atribución 4–5 (CRFM 2024-05-01 vs puntuaciones de creadores; mediana |Δ|=1,2 en 25 modelos; única pareada localizada HF 2023, LLaMA-65B 14,9); exhaustividad U3 (26 fichas F-01–F-26, no exhaustivo); «Ed25519» literal en IR 8547 (0 ocurrencias → CORROBORATED/INFERENCE); «migrar antes de 2030» como prescripción (→ PROPOSAL; hito federal de firmas 2031); AAL3 vía software aislado (F-E01: SP 800-63B-4 §3.2.13 exige entorno protegido por hardware — en el Poco X7 Pro la vía sería el TEE, sin afirmar cumplimiento); U2 en formulación amplia (Basilea MAR32 250 observaciones; δ=3 pp requiere 3.876 preguntas K=1; «caso» indefinido).
- **Corroborado:** núcleo C14 (2030/2035, EdDSA ≥128 bits, hitos 2030/2031); aritmética C11/Miller; fallo estructural central.
- **Contradicciones internas de R2** (F-E02/F-E03: U6/U9 RESUELTOS en §7/cierre y UNKNOWN en §11 B2/B7 sin purgar; F-E11: definición EVIDENCE «≥2 resúmenes» inflada; F-E13: texto original C01–C16 ausente; F-E14: P7 no directamente legible desde ese frente; F-E15: A2A §8.4 solo en `latest`, no contra tag v1.0.1 — I-02 abierta; F-E17: C12 circular, presupone D-01/D-02/D-08).

### Fase H — Cadena 004 (2026-11-08/09): F → G → H → I — EVIDENCIA (copias de revisión)
- **F:** M-01/M-02/M-03 corregidos; M-04 parcial; D-01 núcleo corregido/parcial en dependencia; D-02 pendiente de gate (A/B). Duplicación HTML accidental documentada (dos HTML byte-idénticos, SHA `973c5807…`).
- **G:** 5 entregables finales — informe 159.176 `89fb7665…`, cierre 48.458 `d7e85d53…`, HTML 195.786 `98a207b6…`, método 13.351 `5356bd1c…`, manifiesto 8.811 `44b97e7f…`. Diffs f2→g: informe 21/44, cierre 7/38, HTML 32/46, método 2/6; canónico→G método 4/10 (canónico→F2 4/6). Banner G: «COPIA DE REVISIÓN NO OFICIAL — ALTERNATIVA B… No aprobada»; canónico intacto (`7295fedb…`).
- **004-H** («Lanzala» 2026-11-08 23:02 CST; ejecutada 2026-11-09): readiness documental SÍ, global PARTIAL (causa: publicación). 0 CRÍTICOS, 0 MAYORES, 2 MENORES nuevos: **H-05** (cierre G L275 «copia de revisión F2» en presente, contradice L306) y **H-06** (glosa falsa del 4/10; la cifra es correcta). Borrador v1 obsoleto (no usar); v2 operativo.
- **004-I** (autorizada 2026-11-09 21:24 CST, protocolo A–E): **H-06 CORREGIDO** en 4 pasajes; **H-05 PREPARADO, NO corregido** (L275 intacto; cierre review-i byte-idéntico al G; redacciones exactas en informe §3). Tabla de publicación de 8 archivos con SUPERSEDED marcados (§2 abajo).

### Fase I — Reconciliación 004-J y ratificaciones (2026-11-10) — EVIDENCIA
- Verificación inicial en HEAD `6ff9a14` (12:06): 6/8 presentes; informe G y HTML ausentes. HEAD avanzó a `9fefe3b3…` (12:10:43, subida del propietario): discrepancia **resuelta por subida posterior, no por renombrado** (búsqueda en árbol completo: 2.509 archivos, un único archivo de cada tamaño). Los 8 byte-idénticos.
- H-06 verificado correcto en los 4 pasajes publicados; aritmética re-medida (canónico→G 4/10; canónico→F2 4/6; F2→G 2/6); glosa falsa 0 ocurrencias vivas.
- **Ratificación del propietario 2026-11-10 12:17 CST** (sin autorizar ejecución en GitHub): **H-05 OPCIÓN A** (conservar frase histórica L275 + nota editorial; aplicación pendiente) y **D-02 documental OPCIÓN B** (copia G del método como referencia de trabajo; canónico intacto como historia; registro visible pendiente). La D-02 del propietario (custodia de clave raíz) es otra decisión: sigue SIN DECIDIR.
- Discrepancias nuevas 004-J (0 CRÍTICOS, 2 MAYORES, 3 menores, 1 observación; revisor con contexto compartido): **MAYOR-1** (6 documentos publicados declaran H-05/D-02 pendientes tras la ratificación — obsolescencia sobrevenida); **MAYOR-2** (manifiesto G `44b97e7f…` ausente de la rama; 5 entregables en 4/5); menor-1 (pareja imposible «7.082 bytes + `7953961a…`»; medido 8.043); menor-2 (manifiesto Pasada 7 pre-final en rama con afirmación de coincidencia falsa en L18); menor-3 (puntero «manifiesto G (L73)» erróneo: el manifiesto G tiene 61 líneas, el 4/10 está en L61); observación-1 (autodescripciones de no-publicación = declaraciones históricas fechadas, NO contradicciones; la columna «Estado actual en la rama» del handoff 004-I §6 es instantánea 2026-11-09, **no** inventario vigente).
- Dictamen 004-J: **PARCIAL**. Próximo paso mínimo: subir manifiesto G; sustituir manifiesto Pasada 7; autorizar (o no) misión de aplicación H-05 A; registro visible D-02 B; verificación tras cada subida.
- Estado en HEAD `c5724aa6` (fin del rango): las subidas posteriores a `9fefe3b3` no alteran los dictámenes documentados; este frente no re-verificó bytes en `c5724aa6` más allá de los blobs de la tabla de fuentes y los conteos.

### Estado actual consolidado (según los handoffs más recientes)
- Cierre sustantivo global: **PARTIAL**. PASS solo para integridad R2 de 4 archivos.
- U2 (U2-a/b/c), U3, U5: **UNKNOWN**. U1, U4, U6, U7, U8, U9: **RESUELTOS** (U7/U9 acotados). C14: **PARCIALMENTE CONFIRMADA**. C01–C13/C15/C16: CONFIRMADA (003). D-01–D-12: **SIN DECIDIR**. 9 decisiones de Misión 01: pendientes.
- P112: cierre formal **NO declarado**; granularidad mínima exacta **OPEN**. AB105 congelada (ancla AB105.116R). TLC congelado. Core: destilación + diseño de construcción (2026-10-08); STEP 3 = siguiente trabajo documentado.
- Limitaciones heredadas vigentes: I-02 (C05/A2A sin re-verificar contra tag v1.0.1), M-3 (fecha del commit `96e227eb…` sin fuente), discrepancia v1.0.1 26-vs-28, SP 800-131A verbatim pendiente (D-11), texto original C01–C16 UNKNOWN, cadena P7 UNKNOWN (conocida vía §0 del informe G).

## 2. Handoffs y documentos supersedidos (marca SUPERSEDED tal como la documentan los handoffs)

| Archivo / bloque | Marca | Fuente de la marca |
|---|---|---|
| `Decisión de gate D-02 (1).md` (12.686 B, `539657d4…`) | SUPERSEDED (→ gate corregido 13.198 `c286a168…`) | Handoff 004-I §6; 004-J §4 |
| `informe de corrección (1).md` (69.010 B, `d75cd743…`) | SUPERSEDED (→ informe corregido 73.281 `c6bb0c0b…`) | Handoff 004-I §6; 004-J §4 |
| `Resumen ejecutivo MUSE-004-G (1).md` (22.807 B, `ddec26fb…`) | SUPERSEDED (→ resumen corregido 23.039 `ea549ab0…`) | Handoff 004-I §6; 004-J §4 |
| `HTML rectificado G.html` (195.843 B, `210e29ab…`) | SUPERSEDED (→ HTML G 195.786 `98a207b6…`) | Handoff 004-I §6; 004-J §4 |
| `Resumen ejecutivo MUSE-004-G.md` (handoff G, 17.590 B) | Superseded (coexiste) | Handoff 004-J §4 |
| `manifiesto SHA-256 (1).md` (8.043 B, `7953961a…`) | Pre-final; L18 falsa contra los finales; sustituir por Pasada 7 corregido 9.384 `3d1220bd…` | Informe 004-J §F.4 |
| `closure-r2.md`, bloque «Revisión editorial adicional» (112.505/152.279 B; `6d111749…/d27ad56e…/f09815f1…`) | **SUPERSEDIDA expresamente** para la integridad vigente; conservar como historial, no citar como hash vigente | `closure-r2.md`, rectificación final |
| Conjunto R1 y bases F2 | Conservados como **evidencia histórica** (no SUPERSEDED; no sobrescritos) | `hashes-r2.md` §2; Manifiesto G |
| Borrador 004-H v1 | Obsoleto, no usar (v2 operativo) | Memoria de misión; el v1 no está en la rama |
| Columna «Estado actual en la rama» (handoff 004-I §6) | Instantánea 2026-11-09: **no citar como inventario vigente** | Informe 004-J §F.6 |

Nota: los handoffs marcan SUPERSEDED la variante con sufijo «(1)»; la existencia de la variante sin «(1)» no se infiere — se registra la coexistencia sin estado inferido.

**Cadena de handoffs leída:** `HANDOFF_MUSE_AUTONOMY_002_R2_RECOVERY_2026-11-07.md`, `MUSE_AUTONOMY_003_HANDOFF.md`, `Handoff y dictamen 004-H.md`, `Handoff 004-I.md`, `Handoff 004-J.md` + `Informe de reconciliación 004-J.md`, `NEW_CHAT_HANDOFF_P112_AB_WAIT_2026-10-07.md`, `NEW_CHAT_HANDOFF_2026-10-08.md`, `NEXO_MASTER_EVIDENCE_MAP_2026-10-04.md`, `NEXO_CONTINUITY_G0_JMM_SNAPSHOT_AUDIT_2026-10-04.md`.

## 3. Decisiones: ratificadas vs pendientes vs contradictorias

### Ratificadas (fecha y alcance; la ratificación no autoriza ejecución salvo indicación)
- **H-05 OPCIÓN A** (2026-11-10 12:17 CST): conservar frase histórica L275 + nota editorial. Texto exacto preparado (004-I §3). **Aplicación pendiente** (misión separada; pronóstico de diff 7/(38+N) por re-medir).
- **D-02 documental OPCIÓN B** (2026-11-10 12:17 CST): copia G del método como referencia de trabajo; canónico intacto como historia. Condiciones materiales cumplidas. **Registro visible en la rama pendiente** (propuesta 004-J §H.2; registro formal ya en informe 004-J §E.2).
- HTML como artefacto canónico R2 (el propietario aceptó equivalencia HTML/PDF; no existe PDF R2 independiente en la rama).
- P7 como base de consolidación con prevalencia de sus UNKNOWN y 12 materiales.
- APROBADO CONDICIONADO del expediente como documentación de investigación/referencia — expresamente **no** especificación técnica autorizada ni autorización de implementación.

### Pendientes (autoridad = propietario salvo indicación)
- **D-01 a D-12: todas SIN DECIDIR** (D-01 identidad/autenticación; D-02 autenticación/recuperación — decisión del propietario, distinta del gate documental B —; D-03 enmienda; D-04 anclaje; D-05 fuente canónica; D-06 protocolo; D-07 evaluación; D-08 autorización/Core–Labs; D-09 ejecución/cadena de suministro; D-10 recuperación; D-11 agilidad PQC; D-12 dependencias materiales).
- **9 decisiones de la Misión 01.**
- Aplicación de H-05 A; registro visible de D-02 B; corrección MAYOR-1 (actualizar afirmaciones «pendiente» en 6 documentos, o alternativa de registro histórico sin reescribir — alcance a decidir por el propietario); subida del manifiesto G; sustitución del manifiesto Pasada 7; verificación tras cada subida.
- UNKNOWN abiertos: U2 (U2-a/b/c), U3, U5; legacy post-2035; jurisdicción del propietario; texto original C01–C16; M-3; I-02; v1.0.1 26-vs-28; SP 800-131A verbatim (D-11).
- P112: cierre formal no declarado; granularidad mínima exacta OPEN. AB: reanudar en bloques de 10 desde AB104.151 tras cerrar P112. Core STEP 3 como siguiente trabajo de construcción documentado.

### Contradictorias (ambas fuentes citadas; sin resolver por inferencia)
- **MAYOR-1** (obsolescencia sobrevenida): 6 documentos publicados (2026-11-08/09) afirman H-05/D-02 «pendientes» en presente frente a la ratificación 2026-11-10 12:17. No error al redactarse; MAYOR por coherencia de lectura de la rama.
- **Pareja imposible tamaño+hash** (menor-1): «7.082 bytes + `7953961a…`» frente a medición 8.043 bytes con ese hash. Impacto nulo (archivo SUPERSEDED), pero la pareja es imposible.
- **Falsedad viva en manifiesto pre-final** (menor-2): L18 afirma coincidencia con hashes finales; la tabla lista pre-finales. Residuo que un lector exclusivo de la rama puede tomar por vigente.
- **Puntero L73 conflado** (menor-3): «manifiesto G (L73)» erróneo; el manifiesto G tiene 61 líneas (4/10 en L61); L73 pertenece al manifiesto de Pasada 7. Sustancia verdadera, puntero erróneo.
- **Doble estado U6/U9 en R2** (F-E02/F-E03): RESUELTOS en §7/cierre y UNKNOWN en §11 B2/B7 (texto R1 sin purgar). Las copias G portan rectificaciones marcadas MUSE-003; la contradicción original queda registrada, no reescrita.
- **Doble escala de veredicto** (F-E22): «APROBADO CONDICIONADO» (§1) frente a «PARTIAL» (§11); el informe G añade el mapeo (R-10.1).
- **No contradicciones:** autodescripciones de no-publicación fechadas e instantánea 2026-11-09 del handoff 004-I §6 (inventarios con fecha superados por publicación posterior).

## 4. Evidencia reutilizada vs evidencia nunca verificada

### Reutilizada con verificación documentada
- R1: 8/8 archivos locales verificados, 0 discrepancias; hashes R1 heredados con procedencia declarada (P2/P4/P6/P7 no re-verificados en 002 — limitación registrada).
- R2: 4 archivos publicados re-hasheados en UTF-8; autocontrol `abc` → `ba7816bf…` OK en la rectificación final; manifiesto como ancla externa sin autorreferencia.
- Lecturas primarias directas (2026-11-07): U1 SP 800-63B-4 §§2.3.2/3.2.13/Ap.B/Ap.E; U4 LF/AAIF/A2A/`GOVERNANCE.md`/releases; U6 ASML/JRC; U7 SP 800-53 Rev.5.1; U8 Miller arXiv:2411.00640; U9 RFC 9162; U2 ARIA/RMF/AI Act; U3 UCAN/ZCAP; C14 núcleo en IR 8547 final + EO 14412 + OMB M-26-15.
- 004-J: re-medición propia de HEAD, 8 archivos, diffs y marcas sobre clon de solo lectura en `9fefe3b3`.
- G0 documentado en índices (no re-ejecutado): PR #93 run 37040417803 SUCCESS (negativo acotado); run real-broker 370778 (orden temporal, sin HB).

### Nunca verificada / UNKNOWN declarado (no elevado)
- **U2** (U2-a/b/c): sin norma universal 200–500 para agentes; Basilea MAR32 (250 días) es de ámbito bancario; MDE de Miller 13,2 pp a n=200 (K=1), 3.876 preguntas para δ=3 pp; «caso» sin definir; correlación reduce n efectivo (≈54 desde 500). Búsqueda no exhaustiva.
- **U3**: inventario ampliado a 26 fichas (F-01–F-26), **no exhaustivo**; pendientes: censo del registro DID, borradores WIMSE/AIMS, esquemas nacionales, jurisdicción. Fallo estructural corroborado: revocación/sucesión sin tercero de confianza sin solución estándar localizada (KERI lo admite).
- **U5**: atribución 4–5 **refutada**; diferencial general HELM-vs-lm-eval **UNKNOWN**; sub-UNKNOWNs conservados.
- C14: Ed25519 literal en IR 8547 (0 ocurrencias → CORROBORATED/INFERENCE vía FIPS 186-5); verificación *legacy* post-2035 UNKNOWN (SP 800-131A futuro); «migrar antes de 2030» = PROPOSAL (hito federal de firmas 2031).
- C09/C10/C12: controles SP 800-53 no leídos verbatim → CORROBORATED máximo; definición EVIDENCE heredada («≥2 resúmenes») retirada en la taxonomía G.
- Texto original C01–C16: ausente del expediente (UNKNOWN). P7: no directamente legible desde el frente 003 (UNKNOWN); su contenido consta vía §0 del informe G con esa limitación.
- A2A §8.4: confirmado solo en canal `latest` (2026-11-08), **no** contra tag v1.0.1 (I-02 abierta); punteros C05 = instantánea histórica 2026-11-05 (era 0.2.x/0.3.x), no citas vigentes del canal vivo.
- G0: W1→D1 JMM happens-before UNKNOWN; W1→R1 UNKNOWN; «stale snapshot imposible» UNKNOWN; vulnerabilidad NOT ESTABLISHED; run 370790 irrecuperable (404); PR #95/#96 sin runs por head-SHA; AB104.728 cobertura de error del reducer UNKNOWN; granularidad mínima exacta P112 OPEN.
- M-3: fecha 07-11-2026 del commit `96e227eb…` sin fuente verificable.
- Independencia: todas las pasadas 002/003/004/004-J fueron subagentes con contexto compartido — **no** revisores externos independientes (declarado en cada handoff). Esta misión tampoco los presenta como tales.

## 5. Qué evolucionó hacia código y qué quedó en propuesta

### Camino diseño → construcción documentado (sin evidencia de implementación en este frente documental)
- **P112 → transición protegida:** la investigación P112 converge en la «protected transition footprint» (ReadSet + DependencySet transitivo + WriteSet + evidencia de versión/incarnación/política/config/aleatoriedad + validación/commit condicional) y en la primitiva `persistState(expectedRevision)` (pruebas citadas en el handoff P112-AB-WAIT; **no re-ejecutadas** en esta misión).
- **Destilación C1–C12 (2026-10-08) + diseño de construcción** (10 módulos, objetos de contrato, máquina de estados, primer gate, UNKNOWNs explícitos): handoff de construcción. Brecha de runtime documentada: falta el owner de «final semantic revalidation → persistState». STEP 3 (esqueleto) = trabajo siguiente documentado. (La auditoría de código de esta misión, `GRAND_MISSION_01_IMPLEMENTATION_REALITY_AUDIT.md`, sí inspeccionó el código resultante en HEAD: véase allí el estado real.)
- Artefactos AB104/AB105 (incl. `.py`/`.yml` de gates): **evidencia histórica** (AB105 congelada; AB104.151 frontera primaria), no afirmación de capacidad productiva vigente.

### Propuestas que nunca llegaron a implementación (explícito en las fuentes)
- Arquitectura M02/M03/M03-B y expediente consolidado: APROBADO CONDICIONADO como referencia, **no** especificación autorizada; «este expediente no constituye especificación ejecutable, aprobación de arquitectura ni autorización para alterar NCS M0 o P07»; «PASS exige evidencia de implementación y pruebas aplicables; no se concede por documentación». NCS M0 debe terminar antes de cualquier implementación.
- Copias de revisión F2/G/I: «NO versión oficial… La aplicación sobre los canónicos R2 NO está autorizada» (banners); D-02 B ratificada como referencia de trabajo con canónico intacto — no fusión ni sustitución.
- Cuarentena como fase general de restauración: PROPOSAL de diseño Nexo (U7 acotado: NIST la respalda como contención, no como fase de CP-10).
- Sugerencias de diseño del expediente (cuatro subsistemas C01, capa DID/VC/capabilities sobre A2A C05, cadena de confianza de pesos C06, fuente canónica única C07, expiración corta + listas + monitoreo): PROPOSAL, impacto sobre D-01–D-12 SIN DECIDIR.

## 6. Limitaciones de acceso de esta reconciliación

- PDF MISSION_02 (19 MB): **no inspeccionado visualmente**; diagramas/tablas/paginación no verificados; contenido vía consolidaciones textuales.
- HTML: verificado por bytes/extracción de texto en misiones previas; no renderizado aquí. El HTML G se construyó por parcheo de bytes sobre F2 (documentado).
- P7 (artefacto del propietario): no directamente legible desde el frente 003; conocido vía §0/P7 del informe G y el PDF de 4 páginas citado allí.
- `README.md` de EXTERNAL_AI_REVIEWS: una sola línea, sin índice (inventario por `find`: 62 archivos).
- Corpus masivos no leídos exhaustivamente por diseño; afirmaciones sobre ellos dependen de índices/handoffs con procedencia declarada.
- Historia git completa; el diff neto de árbol absorbe ediciones posteriores a cada alta inicial (secuencia editorial real en los commits con mensaje de 2026-11-07).
- Sin acceso de escritura a GitHub: la cadena 004 trabajó en local; la publicación fue manual del propietario y verificada por clon de solo lectura.
- SHA-256 ≠ Git blob SHA en todas las fuentes.
- Ningún archivo del clon fue modificado; no se ejecutaron pruebas, CI ni código del repositorio.
