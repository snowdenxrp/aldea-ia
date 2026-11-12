## DELTA DE TRAZABILIDAD — P08/P09 REGISTRADAS (2026-11-12)

**Prevalencia:** esta delta actualiza las clasificaciones de §1, §3, §4 y §7 únicamente para P08/P09 y T-01. No reescribe el estado histórico que existía al 2026-11-10.

- Fuente primaria de las decisiones: handoff maestro NCS fechado 2026-11-10 y suministrado por el propietario en esta conversación el 2026-11-12; fecha de ratificación indicada: 2026-11-09.
- **Registro canónico:** rama `ncs-continuity-handoff-correction-2026-11-07` @ `53c1524b858e069c9af181d8e0b8715ddd94dd9b`; `NEXO_NCS/STATUS.md`, blob `5ec8f7a656978b034561a4fc8faa570441073fff`. El STATUS anterior blob `dfa580cc77ffafe37d26997220cbc12357328fa2` queda supersedido. P01-B=C permanece en `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, blob `53691bce19edc20c6a3acb6dd99aca4d6d58e33a`, §10.6.
- **Rama de investigación:** `ncs-m0-architecture-research-2026-11-10`; el paquete se publicó inicialmente en `56ab233bc628a27088640efe3e4869f0bf013abb` y recibió después commits documentales de reconciliación T-01. No fijar aquí un HEAD que cambiaría al editar este mismo expediente; resolver siempre la ref viva.
- **P08 — DECIDED/documentada:** una root canónica deriva `<root>/.nexo-continuity.json` y `<root>/.nexo-chronicle.json`; sin paths independientes ni fallback ambiental en operación normal; Chronicle init es operación separada con admisión y autorización de destino propias; append no inicializa Chronicle; init y append no comparten invocación. El registro vigente está en `NEXO_NCS/STATUS.md` (delta «RATIFICACIONES P08/P09 DEL PROPIETARIO»). La reconciliación técnica 07-11 sigue demostrando el gap del snapshot, no contradice la decisión.
- **P09 — SCOPE DECIDED/documentado; COVERAGE OPEN/UNKNOWN:** universo acotado = repositorio/package, entrypoints, procesos hijos, workflows y launchers declarados. Loaders dinámicos y consumidores externos no identificados siguen UNKNOWN. No hay afirmación de cobertura universal.
- **P01-B=C:** ya estaba documentada en `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, §10.6; se referencia, no se duplica.
- **DISC-08A/B:** siguen NO LOCALIZADOS en la búsqueda documentada de §3.1. No se afirma inexistencia ni se reconstruye su contenido.
- **T-01/B-DOC-1: PARTIAL.** P08/P09 están registrados y P01-B=C tiene referencia existente; la constancia DISC-08A/B sigue pendiente. Por tanto no se declara T-01 completo ni G-4/G-5 cerrados.
- **G-4 P08:** DECIDED / IMPLEMENTATION PENDING; resolver común y separación init/append siguen sin implementar/probar.
- **G-5 P09:** SCOPE DECIDED / COVERAGE OPEN-UNKNOWN; clasificación técnica, APIs path-based, fixtures y consumidores siguen como en la evidencia técnica existente.
- **B-DOC-4:** parcialmente avanzado solo para P08/P09. No se cierra el registro de P07 V2.3 ni de D-RB-01…09 por esta delta.
- Estados que no cambian: P05 OPEN; P07-C UNKNOWN/BLOCKING; E2/E3 PARTIAL; E4 según su evidencia; target SHA de cierre UNKNOWN; `authorization: NOT_EVALUATED`; ROOT_READY no establecido; commissioning/efectos protegidos STOP; M0 INCOMPLETO.
- Solo documentación. No implementación, tests, CI, workflows, Termux/POCO, bootstrap, stores, PR ni efectos.

---

# NCS M0 — Ruta crítica de cierre y contrato de evidencia

**Tipo:** integración documental y análisis técnico independiente (solo lectura).
**Fecha:** 2026-11-10 (consulta: 2026-11-10 23:18 CST / 2026-11-11 05:18 UTC).
**Rama de investigación:** `ncs-m0-architecture-research-2026-11-10`,
HEAD `9c4d9d81e2cf6925b8f21f262d961b4a0dd9874a` (verificado por `ls-remote` y clon público de solo lectura, sin modificar).
**Destino del documento:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/`.
**Estados canónicos al consultar:** M0 INCOMPLETO; P05 OPEN; P07-C UNKNOWN/BLOCKING; P09 OPEN/UNKNOWN; E2/E3 PARTIAL; `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; commissioning y efectos protegidos STOP; PR #110 OPEN/DRAFT/NOT MERGED.

**Vocabulario de estados (sin intercambiarlos):** DECIDED = aceptación explícita del propietario localizada; IMPLEMENTED = cambio en el código del SHA citado; TESTED = prueba ejecutada ligada a ese SHA; CI-VERIFIED = run CI sobre el SHA exacto con jobs inspeccionados; PROPOSAL = diseño o recomendación sin ratificar; UNKNOWN = no resuelto, nunca resuelto por inferencia; STOP = prohibido ejecutar sin autorización específica.

---

## 1. Dictamen ejecutivo

1. **M0 no está cerrado y ningún gate de la matriz maestra (§4) está cerrado.** De 9 gates, 0 están cerrados; los 9 siguen abiertos en algún grado (1 DECIDED sin implementar, 6 UNKNOWN/BLOCKING/PARTIAL, 2 sin evidencia sobre el SHA final). La cifra es contable porque los 9 gates están enumerados con fuente y estado en §4; lo que no puede contarse con rigor es el número de *sub-bloqueos* dentro de P05/P07, porque depende de decisiones futuras (alcance del claim, forma del ancla).
2. **La ruta crítica la determinan tres bloqueos raíz:** (a) la ausencia de enforcement durable bajo rollback — sin ancla externa realizada (D-RB-04 A) no hay single-use de release ni detección de RB-3/RB-4, y `PASS_GATE` es inalcanzable en R1 para el claim universal (I-1–I-7); (b) la admisión pre-read no implementada (P03/P04) junto con las APIs path-based sin convertir (P09) y el resolver root→stores inexistente (P08), que dejan O7 abierto; (c) la ausencia total de evidencia ejecutable sobre un SHA congelado: sin fingerprint del target (O8/S-1–S-4), sin ventana E2/E3 demostrada y sin harness con oráculos P07 ejecutados, nada puede pasar de PROPOSAL a TESTED/CI-VERIFIED.
3. **La mayor parte del trabajo inmediato no exige decisiones nuevas.** Referenciar el contenido decidido el 9-Nov (P08/P09), aplicar el corrigendum de lectura a ACA-1, y preparar las especificaciones (P07-A, predicados de REC/cuarentena, propuesta de ancla) son correcciones documentales o preparatorias. Las decisiones estrictamente inevitables son dos familias: aceptar el claim restringido con exclusiones explícitas o cambiar el modelo (A-08), y seleccionar la forma del ancla (D-RB-04) — ambas solo cuando se presenten con propuesta, alternativas y consecuencias.
4. **La ruta de cierre propuesta (§6) sobrevive a la falsación adversarial (§11) solo bajo una condición:** que el cierre de M0 se defina sobre el claim restringido con exclusiones explícitas aceptadas por el propietario (criterio 17 de la línea de meta). Si se exige el claim universal dentro de R1, la ruta es inviable por imposibilidad condicionada demostrada, no por falta de trabajo.
5. **Nada de lo anterior autoriza ejecución.** Implementación, inspección del dispositivo, harness, tests y CI sobre SHA congelado requieren autorización expresa separada en su momento (§10).

---

## 2. Base examinada

### 2.1 Ramas y HEADs verificados (2026-11-10 23:18 CST)

| Rama | HEAD verificado | Uso en esta integración |
|---|---|---|
| `ncs-m0-architecture-research-2026-11-10` | `9c4d9d81e2cf6925b8f21f262d961b4a0dd9874a` | Rama de investigación / destino de este documento |
| `ncs-continuity-handoff-correction-2026-11-07` | `eee2ae772e5569ffbc90d6334f47c6633f4961fb` | Canónicos de estado (STATUS, handoff, BUILD) |
| `ncs-lumina-decoupling-2026-10-29` | `d8b5ca8720908d926acc18130614cce132a43b5d` | Snapshot de código obligatorio |
| `ncs-strategic-vision-preservation-2026-11-05` | `0ba10bdee61e34e8592fa3138499f5e6337d3b0a` | Base documental histórica |
| `main` | `a1a105fdca630f6484734faffefba3c38897e8ba` | Referencia |

GitHub: **NOT_CONNECTED** (verificado 2026-11-10). Toda consulta fue clon público de solo lectura; el clon no se modificó (`git status --porcelain` = 0). La publicación de este documento queda pendiente de subida por el propietario.

### 2.2 Estado de la carpeta SNOW en la rama de investigación

Verificado contra el HEAD `9c4d9d81`:

| Archivo en rama | SHA-256 rama | ¿Byte-idéntico al local? |
|---|---|---|
| `NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md` (ACA-1) | `f337381f…` | Sí |
| `NCS_M0_P05_P07_ACA1_RATIFIED_DECISIONS_COMPATIBILITY_DELTA_2026-11-10.md` | `c970b186…` | Sí |
| `NCS_M0_P05_P07_ACA1_RATIFIED_DECISIONS_COMPATIBILITY_DELTA_2026-11-10 (1).md` (duplicado) | `c970b186…` | Sí (mismo contenido, nombre con sufijo) |
| `NCS_M0_P05_P07_CE1_CE5_CE7_INDEPENDENT_FALSIFICATION_2026-11-10.md` | `534c728c…` | No por 2 bytes: salto de línea en L1000; contenido idéntico (diff -w = 5 líneas, solo ese reflow) |
| `NCS_M0_ROLLBACK_SEMANTICS_AND_OWNER_DECISIONS_SNOW_2026-11-10.md` | `f36008ec…` | Sí |
| `Reconciliación de decisiones de rollback.md` | `f1d5e4bd…` | Sí (nombre distinto al entregado localmente) |
| `NCS_M0_ROLLBACK_RECONCILIATION_GAPS_AND_BLOCKERS_2026-11-10.md` | `3fdb1ca4…` | Sí |
| `NCS_M0_P09_DYNAMIC_LOADER_AND_DECLARED_GRAPH_DELTA_2026-11-10.md` | — | **No está en la rama** (pendiente de subida; local SHA `6e59e0e6…`) |

**Respuesta a la pregunta del encargo:** sí, el documento ACA-1 más reciente ya está incorporado en la rama (byte-idéntico, `f337381f…`), y también la evaluación de compatibilidad (`c970b186…`, en dos copias). El delta P09 no está incorporado todavía.

### 2.3 Ruta de orientación seguida

`NEXO_NCS/STATUS.md` (deltas superiores) → `NEXO_NCS/MASTER/README.md` + directiva estratégica → `NEXO_NCS/CORE/README.md` → handoff vigente `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-11-07_M0_CONTINUITY_CORRECTED.md` → `NEXO_NCS/DECISIONS/` (25 archivos; ninguno posterior a octubre de 2026 con fecha de noviembre) → registros BUILD citados por el handoff → carpeta SNOW de investigación. El handoff del 31-10 citado históricamente no fue recuperable en la rama estratégica (consta en STATUS y en el handoff del 07-11); el handoff vigente es el del 07-11.

### 2.4 Fuentes contrastadas (con hashes cuando se verificaron)

- STATUS.md (503.807 bytes en `eee2ae77`), deltas superiores del 07-11.
- Handoff canónico 2026-11-07 (hoja de gates literal en su §5; orden de trabajo en §6).
- Línea de meta: `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md` (aceptada como base de trabajo 2026-10-24, §9; 20 criterios + 8 pasos).
- P03/P04: `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md` (O-08/O-10/O-11 ratificados como diseño; §7 casos de aceptación futuros) + diseño técnico 2026-11-03 citado por el handoff (blob `d9a55256…`).
- P05/P07: obligaciones 2026-11-07 (blob `7af04a84…`), P05-C (blob `97e24c03…`), P07 V2.3 normativa (SHA `65de8801…`, blob `7a6fcd2e…`) y oráculos (SHA `f9cc5e43…`), reconciliación lock/release vigente (SHA `1df51530…`, snapshot `d8b5ca87`), matriz E1–E9 (SHA `310a0faf…`), contrato de identidad filesystem (SHA `1f74d462…`), contrato del owner de Continuity 2026-10-18 (C4/C6).
- P08: reconciliación root→stores 2026-11-07 (SHA `b905207c…`; P08 OPEN/LAYOUT UNSELECTED).
- P09: reconciliación caller coverage 2026-11-07 (SHA `fd44f337…`, blob `a9bcd78d…`) + delta de loaders/grafo 2026-11-10 (SHA `6e59e0e6…`, local; no en rama).
- E2/E3: assessment 2026-10-28 + R1 y evidencia 2026-11-02 (SHA `f720f00f…`; R1 ACCEPTED BY OWNER, E2/E3 PARTIAL/NOT CLOSED).
- E4: misma fuente R1 (comprobación post-escritura en destino real verificada solo para la publicación restringida).
- CI: handoff 2026-11-01 (5 runs SUCCESS sobre `7a7f3ffa…`) + addendum 2026-11-02 (suite local PASS sobre `5988d9b4…`, no CI-VERIFIED) + handoff 07-11 §3 (PR #110, run 40972888688 sin SHA probado expuesto).
- Investigación SNOW 2026-11-10: falsación CE-1/CE-5/CE-7 (local `8f1bb646…`; rama `534c728c…`, contenido idéntico), especificación de rollback (`f36008ec…`), ACA-1 (`f337381f…`), reconciliación D-RB (`f1d5e4bd…` + brechas `3fdb1ca4…`), compatibilidad ACA-1 (`c970b186…`).

---

## 3. Estado de ratificaciones y precedencia

Regla aplicada: una ratificación posterior del propietario prevalece sobre un estado histórico anterior **siempre que pueda localizarse y comprobarse**. Si la ratificación se conoce por instrucción del propietario pero no se encuentra su registro documental exacto, se clasifica como **declarada por el propietario / trazabilidad documental incompleta**: no se niega ni se inventa su contenido.

| Decisión | Fuente más reciente localizada | Clasificación | Precedencia aplicada |
|---|---|---|---|
| Línea de meta M0 (separar `M0_BUILD_COMPLETE` de `PROTECTED_EFFECTS_AUTHORIZED`) | Finish line §9, aceptación 2026-10-24 | **DECIDED-documentada** (base de trabajo; no acepta recomendaciones individuales ni autoriza implementación) | Gobierna el criterio de cierre (§13) |
| R1 (sandbox Android + HOME privado Termux, invocación manual única, exclusiones root/same-UID) | R1/E2/E3 2026-11-02 (SHA `f720f00f…`) | **DECIDED-documentada** | Gobierna el modelo de actores de todos los gates |
| P01-B/B2 opción C (no seleccionar launcher) | STATUS + AI_TEAM protocol (múltiples deltas) | **DECIDED-documentada** | ACA-1 no debe presuponer launcher seleccionado (K-03) |
| P03/P04 D1–D6 + O-08/O-10/O-11 (raíz explícita, admisión antes de lectura, release incierto → UNKNOWN/BLOCKED) | STATUS + handoff 07-11 §5 + spec 2026-10-25 §2 | **DECIDED-documentada como diseño; enforcement pendiente** | Prevalece sobre el estado del código en `d8b5ca87` (pre-read sin admisión) |
| P05-C como política (sin recuperación automática, sin borrado manual de lock como recuperación por defecto, D2 solo observa, resultado de negocio ≠ resultado de release) | STATUS delta 07-11 + blob `97e24c03…` | **DECIDED-documentada como política; P05 OPEN** | Gobierna O1–O9; enforcement durable sigue pendiente |
| Política de cleanup atribuible (solo objetos atribuidos con identidad/nombre protegidos; incertidumbre → conservar + UNKNOWN/BLOCKED; nombre/token/PID/antigüedad no justifican cleanup; sin atribución no hay readmisión) | STATUS delta superior 2026-11-07 | **DECIDED-documentada** | Regla normativa para P05/P07 (no satisface O4/O5 por sí sola) |
| Afectación reversible P07-C (cualquier desplazamiento temporal del nombre protegido o modificación de `nlink` cuenta como afectación aunque se restaure) | STATUS delta 2026-11-07 + handoff §6.1 | **DECIDED-documentada** (resuelve solo el punto reservado en V2.2 §8; no ratifica V2.3) | Criterio semántico de los oráculos P07 |
| P07 V2.3 (detección ≠ prevención; R-OBJ ≠ R-NAME; actor B fijado antes de ejecutar; taxonomía de resultados) | Instrucción del propietario (8-Nov-2026) + reconciliación STATUS; el archivo delta histórico dice NO RATIFICADO | **Declarada por el propietario / trazabilidad documental incompleta** (patrón idéntico al de P08/P09) | Se aplica como norma vigente; su registro exacto queda como brecha documental (§7, B-DOC-1) |
| P08 decidida (mapping root→stores), 9-Nov | Instrucción del propietario (encargo 2026-11-10 21:41 CST); rama sigue OPEN/LAYOUT UNSELECTED con candidato no ratificado | **Declarada por el propietario / trazabilidad incompleta** | Se trata como decidida; contenido no referenciado → ACA-1×P08 NO DEMOSTRADO |
| P09 universo declarado y verificable, 9-Nov (alcance acotado) | Misma instrucción; delta P09 dejó «definir el universo» como siguiente acción única | **Declarada por el propietario / trazabilidad incompleta** | Se evalúa cobertura solo dentro del universo declarado; nunca universal |
| D-RB-01 A … D-RB-09 A (moratoria RB-1–RB-4; solo el propietario ordena/autoriza rollback por declaración fuera del dominio restaurable; atomicidad; ancla monotónica externa requerida; UNKNOWN/BLOCKED por defecto; D-RB-06 C quiescencia; prohibición de revertir AUTH; cuarentena+verificación+reconciliación; registro externo) | Instrucción del propietario 2026-11-10 15:33 CST + reconciliación SNOW (`f1d5e4bd…`) | **Declaradas por el propietario + reconciliación documental** (el ancla es requisito ratificado, no mecanismo realizado) | Gobierna §5/§8; la moratoria cubre RB-1–RB-4 (corrección R-01–R-05) |
| D-01–D-12 (Misión 02) y 9 decisiones Misión 01 | Expediente 004/005 | **SIN DECIDIR** (fuera del alcance de cierre M0 salvo intersección documentada) | No son gates de M0; no se reabren aquí |
| H-05 A / D-02 B documentales | Ratificadas 2026-11-10 (expediente 004-I) | **DECIDED-documentadas; aplicación pendiente** | Sin intersección con los gates M0 de este documento |

### 3.1 Búsqueda expresa de DISC-08A y DISC-08B

Resultado: **no localizados**. Fuentes examinadas: `git grep -i DISC-08` sobre las ramas `ncs-continuity-handoff-correction-2026-11-07`, `ncs-m0-architecture-research-2026-11-10` y `ncs-strategic-vision-preservation-2026-11-05` (0 resultados); las primeras 60 de las 129 ramas remotas (0 resultados); `NEXO_NCS/STATUS.md` completo (0 menciones de DISC ni de fechas 2026-11-08/09/10); `~/workspace/research_notes/`, `~/memory/` y `~/MEMORY.md` (0 resultados); ningún nombre de rama contiene «disc» en el sentido de estos registros (solo discriminadores AB105). **Referencia exacta que falta:** un registro documental (ruta + sección + blob/commit) que defina DISC-08A y DISC-08B. Mientras no se localice, cualquier gate que dependa de ellos queda UNKNOWN por trazabilidad, no por inexistencia demostrada. No se concluye que no existan: la búsqueda cubrió el repo público y el workspace local, no registros privados del propietario ni ramas posteriores a la consulta.

### 3.2 Consecuencia de la trazabilidad incompleta

P07 V2.3, P08, P09 y D-RB se aplican en esta integración **como decisiones vigentes declaradas por el propietario**, con la etiqueta de trazabilidad correspondiente en cada celda de la matriz. La brecha no es «volver a decidir» (prohibido por el encargo y por la eficiencia protocolada), sino **referenciar/registrar el contenido exacto ya decidido** (§7, corrección B-DOC-1). Hasta entonces, ninguna verificación ACA-1×P08/P09 ni ningún `PASS_GATE` P07 puede apoyarse en un contenido no referenciado.

---

## 4. Matriz maestra de gates

Estados agregados por gate (el detalle por sub-bloqueo está en §8). «Estado actual» usa el vocabulario del encargo; ningún gate está en TESTED ni CI-VERIFIED **sobre el SHA final congelado**, porque ese SHA no existe todavía (la implementación de cierre no está autorizada).

| Gate | Decisión vigente (fuente exacta) | Estado actual | Demostrado / No demostrado | Bloqueo concreto | Dependencias previas | Evidencia mínima de cierre | Oráculo verificable | Artefacto que la conserva | Trabajo requerido | Afirmación ilegítima tras cerrarlo |
|---|---|---|---|---|---|---|---|---|---|---|
| **G-1 P03/P04** — admisión antes de lecturas persistentes; cobertura de superficies públicas | D1–D6 + O-08/O-10/O-11 (STATUS; handoff 07-11 §5; spec 2026-10-25 §2) | **DECIDED / no IMPLEMENTED** (enforcement pre-read) | Demostrado: diseño mapeado (5 queries, request→draft, Chronicle padre/hijo/directo, superficies de compatibilidad) en diseño técnico 2026-11-03. No demostrado: ningún enforcement en `d8b5ca87` (queries path-based, Chronicle pre-read sin admisión común, entrypoint hijo directamente ejecutable) | Implementación pre-read ausente; dueño de admisión por flujo sin fijar en código; helpers sin contexto explícito | G-3 (P08 resolver), G-5 (P09 universo), G-2 (release/readmisión P05) | Código en SHA congelado que admita antes del primer I/O en todos los flujos del universo + tests de arquitectura/concurrencia (§7 de la spec) ejecutados | Test de arquitectura: query sin raíz → rechazo antes de abrir stores; query con raíz → admisión previa a `loadCurrent()`; hijo valida en padre y directo sin doble adquisición; helper directo no lee fuera de admisión | Código + tests + run CI del SHA congelado; acta §14 | Implementación autorizada + prueba autorizada + CI | «La admisión técnica equivale a autoridad» (criterio 7 línea de meta); «read-only es excepción» (O-10 lo prohíbe) |
| **G-2 P05** — BLOCKED durable, enforcement, crash/reinicio | P05-C ratificada como política + política de cleanup atribuible (STATUS 07-11; obligaciones blob `7af04a84…`) | **DECIDED (política) / P05 OPEN**; enforcement **UNKNOWN** | Demostrado: obligaciones O1–O9 como criterios; código vigente incumple O4 (token→`rm(path)` no atómico), `lockReleaseFailures` volátil (O1/O5 sin demostrar), stale >60s sin auto-reap. No demostrado: BLOCKED durable interproceso, resolución, single-use bajo restore | Sin ancla externa realizada (D-RB-04 A); sin mecanismo durable que sobreviva a crash/restore; O1–O9 sin demostración técnica (S3 G-05) | G-3 sub-bloqueo ancla (§6 etapa 2); G-7 (fingerprint S-1) | Mecanismo durable de BLOCKED + single-use verificado contra ancla, con tests de crash/restart/restore en el target | Matriz E1–E9 sobre SHA congelado: E1/E2/E9 por diseño; E3/E4/E7/E8 exigen ejecución; E5/E6 fail-closed | Tests + evidencia de crash cuts + registro externo (D-RB-09) | Diseño de mecanismo (propuesta) → decisión → implementación autorizada → prueba → CI | «Lock vivo = BLOCKED durable»; «timeout/PID muerto/edad libera» (prohibido por P05-C y cleanup atribuible) |
| **G-3 P07-C** — semántica de afectación, sustitución, cleanup/release, oráculos | V2.3 declarada 8-Nov + afectación reversible 07-11 + cleanup atribuible 07-11 (STATUS; V2.3 SHA `65de8801…`/`f9cc5e43…`) | **UNKNOWN / BLOCKING**; mecanismo **NINGUNO** | Demostrado: norma (detección ≠ prevención; R-OBJ ≠ R-NAME; actor B fijado; taxonomía) y criterio de afectación. No demostrado: prevención/serialización en ningún escenario; P07-A (criterio de identidad) sin decidir; I-1–I-7 condicionan el claim universal | Sin arquitectura aceptada (A-01/A-08), sin P07-A, sin harness/oráculos ejecutados, sin actor B fijado por escenario | G-2, G-7 (S-1–S-4), G-5 (cobertura para serialización), decisión A-08 | Arquitectura aceptada para el claim (restringido o modelo cambiado) + harness con P07-05/06/16/18b/19/21 ejecutados con `actor_B_class` previo | V2.3 §2: PASS_GATE solo con gate completo; P07-16 divergencia = máx. DETECTION_ONLY; escenario no ejecutado nunca PASS | Harness + resultados por escenario con taxonomía completa (harness_verdict/result_class/product_state) | Especificación P07-A + predicados REC (documental) → decisiones A-01/A-08 → fingerprint → harness autorizado → CI | «Detección/STOP/retención = PASS_GATE» (prohibido expresamente); «reversibilidad neutraliza afectación» (decisión 07-11 lo prohíbe) |
| **G-4 P08** — mapping root→stores | Decidida 9-Nov (declarada por el propietario); rama: OPEN/LAYOUT UNSELECTED, candidato `.nexo-continuity.json` + `.nexo-chronicle.json` no ratificado en archivo (SHA `b905207c…`) | **DECIDED-declarada / trazabilidad incompleta**; en código **no IMPLEMENTED** (no hay resolver común) | Demostrado: ausencia de resolver común y separación init/append como corrección de contrato propuesta. No demostrado: contenido del mapping decidido (no referenciado) | Contenido decidido no localizado en el repo; sin resolver root→Continuity/Chronicle; append aún puede inicializar Chronicle | Referencia documental del contenido (B-DOC-1) | Registro del mapping decidido + resolver común implementado y probado (init/append separados) | Test: misma raíz → mismos stores en todos los flujos; append sin init previo → rechazo; raíz sin resolver → UNKNOWN/BLOCKED | Registro de decisión (DECISIONS/) + código + tests | Corrección documental (referencia) → implementación autorizada → prueba → CI | «El candidato de rutas es la decisión» (no ratificado en archivo); «pedir re-ratificación del mapping» (prohibido: ya está decidida) |
| **G-5 P09** — universo de callers/APIs y cobertura real | Universo declarado y verificable ratificado 9-Nov (declarado); P09 OPEN/UNKNOWN en canónicos (SHA `fd44f337…` + delta `6e59e0e6…`) | **DECIDED-declarada (alcance acotado) / OPEN**; 4 superficies RESOLVED, 6 PARTIAL, 1 UNKNOWN/OUTSIDE (delta S1–S11) | Demostrado (snapshot `d8b5ca87`, estático): 0 require/createRequire, 0 eval/Function/vm, 0 specifiers locales no resueltos, 0 loaders por manifiesto, 1 arista hijo de producto, separación Nexo/Lúmina 0/0, consumidores en repo enumerados (application/index.mjs: 2 CLI + 7 tests). No demostrado: guard no parsea `import(expr)` sin fixtures negativos; APIs path-based sin convertir (fila 6 FAIL); consumidores externos sin clasificar contra contenido referenciado | Contenido del universo no referenciado; fila 6 (factory path-based alcanzable desde raíz Nexo) sin cerrar; fixtures negativos ausentes; PASS del guard no ligado al SHA | B-DOC-1 (referencia del universo); G-1 (pre-read) | Universo referenciado + fixtures negativos por clase de loader + conversión o contexto admitido en APIs path-based + clasificación de consumidores contra el universo | Guard estático con fixtures negativos (cada clase de loader rechazada) + test de arquitectura de no-bypass (criterio 6 línea de meta) sobre SHA congelado | Guard + fixtures + delta P09 actualizado; run CI | Corrección documental → implementación autorizada (conversión APIs) → fixtures → CI | «No existen consumidores externos» (prohibido: UNKNOWN/OUTSIDE); «cobertura universal» (fuera del alcance ratificado) |
| **G-6 E2/E3** — control de actores en ventana R1 | R1 aceptada 2026-11-02 + criterio E2/E3 acotado (SHA `f720f00f…`); launcher único = propietario en sesión Termux manual | **PARTIAL / NOT CLOSED** (E2 y E3 por separado PARTIAL) | Demostrado: ventana R1 definida; evidencia puntual (HOME/PREFIX 0700, snapshot de procesos sin node/nexo, jobs vacíos, scheduler sin jobs) en una inspección. No demostrado: control sostenido durante una ventana real con operación; RE-01/RE-02 (launcher dedicado y destino efectivo) UNKNOWN; P01-B=C | Sin launcher dedicado definido; sin ventana demostrada con operación real; evidencia caduca ante reboot/update/cambio de entorno | G-7 (fingerprint), launcher dedicado (P01-B=C sigue: no seleccionar por inferencia) | Ventana R1 delimitada con roster, destino efectivo, clases de writers relevantes clasificadas y STOP ante actor no controlado, ligada a la operación | Checklist de ventana: pre-checks → operación → verificación, con invalidación por reboot/update (criterio R1) | Registro de ventana E2/E3 (fechas, SHA, roster, resultado) | Inspección operacional autorizada + evidencia; sin decisión nueva (criterio ya aceptado) | «Ausencia observada = ausencia exhaustiva»; «sesión manual/lock cooperativo basta» (assessment 2026-10-28 §2) |
| **G-7 E4 + fingerprint del target** — almacenamiento y primitivas | E4: comprobación post-escritura en destino real verificada solo para la publicación restringida (R1 doc); O8 exige fingerprint (V2.3 + obligaciones) | **E4: verificación limitada / gate NOT READY**; **O8/S-1–S-4: UNKNOWN** | Demostrado: probes puntuales en Termux (hardlink EACCES; `COPYFILE_EXCL` y `open('wx')` OK; suite local PASS sobre `5988d9b4…`). No demostrado: dirfd/openat, grupos de procesos, Unix-socket IPC, independencia de dominio WIT, backup/HOME (A-03 UNKNOWN/PENDING) | Sin fingerprint del POCO/Termux/Node `v26.4.0` sobre el SHA de cierre; A-03 sin evidencia específica de restauración de HOME | Autorización de inspección; G-6 | Fingerprint firmado por SHA/entorno + evidencia A-03 (¿el backup de Android restaura HOME de Termux?) | Cada primitiva S-1–S-4 con resultado PASS/FAIL/UNKNOWN ligado a versión de Node/Android | Informe de fingerprint + evidencia A-03 | Inspección autorizada (solo lectura primero) | «COPYFILE_EXCL = visibilidad atómica» (handoff 01-11 lo prohíbe); «probe temporal = propiedad del destino real» (E4 NOT READY) |
| **G-8 CI** — regresión sobre SHA final congelado | Criterios 16/18–20 línea de meta; handoff 01-11 (5 runs SUCCESS sobre `7a7f3ffa…`) | **CI-VERIFIED para SHAs históricos; OPEN para el SHA de cierre** (no existe) | Demostrado: CI verde histórico (compromisos 7a7f3ffa, suites locales). No demostrado: CI sobre un SHA que contenga implementación + tests de cierre; PR #110 sigue OPEN/DRAFT (run 40972888688 sin SHA expuesto) | No hay SHA de cierre; los tests de cierre (G-1/G-2/G-3/G-5) no están escritos ni autorizados | Todos los gates técnicos previos | Runs SUCCESS con `head_sha` = SHA congelado, jobs inspeccionados, ligados a tests de cierre | Conclusión de cada job requerido = success sobre el SHA exacto (criterio 16) | URLs de runs + jobs + acta | CI tras implementación autorizada; sin autorización no se ejecuta | «CI de otro SHA / solo documentación acredita runtime» (línea de meta §4); «PR abierto = integrado» |
| **G-9 Acta final** — comprobación de criterios y separación de autoridad | Línea de meta §3 (20 criterios) + §9 (aceptación 2026-10-24) | **PENDIENTE** (no iniciada; M0 INCOMPLETO) | Demostrado: línea de meta aceptada como base. No demostrado: ningún criterio verificado sobre SHA de cierre; exclusiones no enumeradas/aceptadas | Depende de G-1…G-8; requiere exclusiones explícitas si el claim es restringido | G-1…G-8 | Acta criterio por criterio (20) con PASS/exclusión/fallo + evidencia enlazada | Ningún criterio obligatorio en UNKNOWN/BLOCKED dentro del alcance; exclusiones con capacidad afectada y riesgo aceptados (criterio 17) | Acta de aceptación M0 (documento de cierre) | Redacción del acta (documental) tras evidencia; firma del propietario | «M0_BUILD_COMPLETE → efectos protegidos» (gates separados por diseño); «root/lock/test verde = autoridad» (criterio 7) |

**Conteo:** 9 gates; 0 cerrados; 9 abiertos (G-1 DECIDED sin implementar; G-2/G-3/G-5 UNKNOWN/BLOCKING u OPEN con núcleo demostrado; G-4/G-5 con trazabilidad incompleta; G-6 PARTIAL; G-7 NOT READY/UNKNOWN; G-8 histórico sin SHA de cierre; G-9 pendiente). La afirmación «9 abiertos» es contable porque cada gate tiene estado y fuente en la tabla; no se fuerza ninguna cifra sobre sub-bloqueos internos de P05/P07, cuya descomposición depende de las decisiones A-01/A-08 y de la forma del ancla.

**Gates transversales (no son `M0_BUILD_COMPLETE`, pero el acta debe registrarlos):** `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; `ROOT_READY` no establecido; commissioning STOP; efectos protegidos STOP. Cerrar M0 no los modifica (§13).

---

## 5. Grafo de dependencias

### 5.1 Bloqueos raíz (sin dependencia previa dentro de M0)

- **R-A. Trazabilidad 9-Nov** (contenido de P08/P09 no referenciado; DISC-08A/B no localizados): bloquea la *verificación* de G-4/G-5 y de ACA-1×P08/P09, pero no exige decisión nueva — solo referencia documental. Es raíz porque G-1/G-5 no pueden cerrarse «contra un contenido no referenciado».
- **R-B. Alcance del claim de cierre** (A-08: contención por política con exclusiones vs cambio de modelo): determina qué oráculos P07 son exigibles (universal vs restringido) y, por tanto, qué significa «cerrar» G-2/G-3. Sin esta decisión, G-2/G-3 no tienen criterio de éxito definido.
- **R-C. Ancla externa realizada** (D-RB-04 A como requisito): sin ella no hay enforcement de single-use bajo RB-3/RB-4 ni fin de la moratoria; bloquea G-2 en su pata rollback (O1/O2) y la propia moratoria D-RB-01 A frente a rollbacks no declarados.
- **R-D. Criterio de identidad P07-A**: sin él, O3/O5 (sustitución) y P07-16/P07-21 no tienen predicado de éxito; bloquea G-3 y la readmisión (G-2/E8).
- **R-E. Evidencia del target** (fingerprint O8/S-1–S-4 + A-03): bloquea cualquier afirmación sobre primitivas de G-2/G-3 y la ventana G-6.

### 5.2 Bloqueos derivados

- **D-1. O7 abierto** ← G-1 (pre-read) + G-5 (APIs path-based, fixtures) + G-4 (resolver) + G-6 (ventana). Es el bloqueo derivado más cargado: cuatro padres.
- **D-2. `PASS_GATE` inalcanzable** ← G-2 + G-3 + G-5 + G-6 + G-7 (regla V2.3 §2 exige gate completo con cobertura y fingerprint).
- **D-3. Moratoria inenforzable frente a rollback no declarado** ← R-C + clasificación del SO como ejecutor (D-RB-02 A exige declaración fuera del dominio; el ejecutor OS sigue sin clasificar con evidencia A-03).
- **D-4. CI de cierre imposible** ← G-1…G-7 (no hay tests de cierre escritos; no hay SHA que contenga implementación + tests).
- **D-5. Acta final imposible** ← G-8 + exclusiones aceptadas (criterio 17/20).

### 5.3 Paralelismo y secuencia forzada

- **Paralelo sin dependencias entre sí:** B-DOC-1 (referencia 9-Nov), corrigendum ACA-1 (B-DOC-2), especificación P07-A + predicados REC (preparación), propuesta de ancla + canal de registro (preparación), fingerprint (tras autorización de inspección), clasificación de consumidores contra el universo (tras B-DOC-1).
- **Forzosamente secuencial:** especificación → decisión (A-01/A-08, ancla, P07-A) → autorización de implementación → implementación → tests/harness autorizados → CI sobre SHA congelado → ventana E2/E3 con operación → acta. Ningún eslabón puede saltarse: la línea de meta §5 lo fija en 8 pasos y STATUS lo reitera («implementación pre-read solo después de resolver dependencias P07/P05 y con autorización específica», handoff §6.6.5).
- **Solo trazabilidad documental:** B-DOC-1, B-DOC-2, actualización del delta P09 en rama, registro de DISC-08A/B si se localizan.
- **Exigen decisión del propietario (futura, con propuesta):** A-08 (alcance del claim), forma del ancla + encaje en R1, P07-A, A-01 (MED+SUP o alternativa aceptada), A-04/A-07 según diseño del testigo, A-03 tras evidencia, A-09 (implementación) al final.
- **Exigen autorización expresa de ejecución:** inspección del dispositivo (G-7), implementación (G-1/G-2/G-4/G-5), harness y tests (G-3/G-8), CI sobre SHA congelado, ventana E2/E3 con operación (G-6).

### 5.4 Diagrama (texto)

```
B-DOC-1 referencia 9-Nov ──┬──> G-4 mapping verificado ──┐
B-DOC-2 corrigendum ACA-1 ─┤                             ├──> G-1 pre-read ──> G-8 CI ──> G-9 acta
P07-A spec + REC preds ────┤──> decisión P07-A ──────────┤         ▲
Propuesta ancla+registro ──┤──> decisión ancla (R-C) ────┤         │
A-08 alcance del claim ────┴──> criterio de éxito G-2/G-3 ┘         │
Fingerprint O8/S-1–S-4 + A-03 (autorizada) ──> primitivas G-2/G-3 ──┤
Ventana E2/E3 (autorizada) ─────────────────────────────────────────┘
A-01 arquitectura ──> implementación autorizada ──> harness P07 ──> CI ──> acta
```

---

## 6. Ruta crítica mínima

Ordenada por dependencia lógica y reducción de riesgo, no por conveniencia narrativa. Cada etapa indica entrada, actividad permitida, resultado, evidencia de salida, condición para avanzar y condición de detención. Las etapas 0–2 son documentales/preparatorias y no requieren autorización de ejecución; desde la etapa 3 en adelante, cada paso de ejecución requiere autorización expresa separada.

### Etapa 0 — Referencia y corrigendum (sin decisión, sin ejecución)

- **Entrada:** este documento; instrucciones del propietario del 9-Nov y del 10-Nov 15:33/21:41 CST.
- **Actividad permitida:** (a) referenciar/registrar el contenido exacto de P08 (mapping), P09 (universo) y P01-B=C en un registro localizable (DECISIONS/ o delta de STATUS); (b) aplicar a ACA-1 la regla de lectura R-01–R-05 de la reconciliación (A-02 con alcance RB-1–RB-4; opción C sin objeto; claim restringido releído como detección de violación); (c) subir el delta P09 y este documento a la carpeta SNOW; (d) localizar o registrar la ausencia de DISC-08A/B.
- **Resultado esperado:** G-4/G-5 verificables contra contenido referenciado; ACA-1 sin contradicción textual con D-RB-01 A.
- **Evidencia de salida:** rutas + blobs/commits de los registros; hashes de los archivos subidos.
- **Avanzar si:** el contenido referenciado coincide con lo declarado por el propietario (el propietario puede confirmar la referencia sin re-decidir).
- **Detener si:** el contenido localizado contradice lo declarado (entonces prevalece la ratificación posterior y se registra la discrepancia; no se re-decide en silencio).

### Etapa 1 — Especificaciones preparatorias (documental, sin ejecución)

- **Entrada:** etapa 0 completa.
- **Actividad permitida:** redactar (como PROPUESTA) (a) criterio P07-A + procedimiento de re-identificación + predicados de verificación de cuarentena y REC; (b) propuesta de forma del ancla D-RB-04 A con alternativas, coste y encaje en R1, y canal/formato/custodio del registro D-RB-09 A; (c) descomposición de A-08 (contención con exclusiones vs cambio de modelo) con consecuencias por opción.
- **Resultado esperado:** tres paquetes de decisión listos para presentar, cada uno con opciones y consecuencias.
- **Evidencia de salida:** documentos PROPUESTA con trazabilidad a §4/§8 de este documento.
- **Avanzar si:** cada propuesta declara qué propiedad garantiza y cuál no (sin prometer lo imposible I-1–I-7).
- **Detener si:** una propuesta requiere presupone primitivas sin fingerprint (S-1–S-4) — se marca condicional y se espera la etapa 3.

### Etapa 2 — Decisiones de alcance y arquitectura (propietario, sin ejecución)

- **Entrada:** etapa 1.
- **Actividad permitida:** el propietario decide A-08 (alcance del claim de cierre), la forma del ancla, P07-A y A-01 (y A-04/A-07 si el diseño del testigo lo requiere).
- **Resultado esperado:** criterio de éxito definido para G-2/G-3; ancla seleccionada (no solo requerida); identidad definida.
- **Evidencia de salida:** registros de decisión con fecha y contenido exacto (corrige la trazabilidad incompleta de raíz).
- **Avanzar si:** las decisiones son mutuamente compatibles con R1 y con D-RB-01–D-RB-09 (verificación documental inmediata, sin ejecutar nada).
- **Detener si:** se elige el claim universal dentro de R1 sin cambio de modelo — la ruta se declara inviable en ese punto (§11) y se vuelve a A-08.

### Etapa 3 — Evidencia del target (inspección autorizada, solo lectura primero)

- **Entrada:** autorización expresa de inspección; etapas 0–2 (para saber qué primitivas importan).
- **Actividad permitida:** fingerprint POCO/Termux/Node (versiones, probes S-1–S-4, límites de visibilidad), evidencia A-03 (restauración de HOME por backup Android), pre-checks de ventana E2/E3 sin operación.
- **Resultado esperado:** O8/S-1–S-4 con PASS/FAIL/UNKNOWN por primitiva; A-03 resuelta o acotada; E2/E3 con roster y destino efectivo (RE-01/RE-02 acotados).
- **Evidencia de salida:** informe de fingerprint ligado a SHA/entorno; registro A-03.
- **Avanzar si:** las primitivas necesarias para la arquitectura decidida existen en el target, o la arquitectura se ajusta documentalmente antes de implementar.
- **Detener si:** una primitiva necesaria resulta FAIL/UNKNOWN sin alternativa decidida (p. ej., sin grupos de procesos fiables → SUP no demostrable → volver a etapa 2).

### Etapa 4 — Implementación autorizada (código + tests de cierre)

- **Entrada:** autorización expresa de implementación (A-09) tras etapas 0–3.
- **Actividad permitida:** implementar solo lo exigido por los contratos decididos: G-1 pre-read en todos los flujos del universo, G-4 resolver + separación init/append, G-5 conversión/contexto en APIs path-based + fixtures negativos, G-2/G-3 mecanismo durable + BLOCKED + single-use contra ancla + cuarentena/REC según predicados.
- **Resultado esperado:** SHA congelado con implementación + tests de cierre (incluidos los casos §7 de la spec P03/P04 y E1–E9/P07 ejecutables).
- **Evidencia de salida:** SHA exacto; diff limitado a los contratos; tests escritos (no ejecutados todavía en CI).
- **Avanzar si:** el diff no introduce superficies nuevas sin clasificar (nuevo loader, nuevo caller → vuelve a G-5).
- **Detener si:** emerge una necesidad de decisión nueva (cualquier cambio de alcance) — se detiene ese cambio y se vuelve a etapa 2.

### Etapa 5 — Pruebas y harness autorizados

- **Entrada:** autorización de ejecución de pruebas/harness sobre el SHA congelado.
- **Actividad permitida:** ejecutar tests de arquitectura/concurrencia (G-1), matriz E1–E9 (G-2), harness P07 con `actor_B_class` fijado por escenario antes de ejecutar (G-3), fixtures negativos del guard (G-5), pruebas de crash/restart/restore contra el ancla.
- **Resultado esperado:** cada oráculo con resultado y taxonomía completa; ningún PASS por detección.
- **Evidencia de salida:** resultados ligados a SHA + entorno + comando exactos.
- **Avanzar si:** los oráculos bloqueantes del alcance decidido pasan con la taxonomía V2.3 (o el fallo es DETECTION_ONLY/UNKNOWN reconocido y el gate sigue abierto, sin maquillar).
- **Detener si:** aparece un actor no controlado, un seam no observable (→ UNKNOWN/INVALID por definición V2.3) o una contradicción con R1.

### Etapa 6 — CI sobre SHA congelado + ventana E2/E3 con operación

- **Entrada:** etapas 4–5; autorización de CI y de ventana operacional.
- **Actividad permitida:** CI con jobs inspeccionados sobre el SHA congelado; ventana R1 delimitada (pre-checks → operación → verificación) con STOP ante actor no controlado.
- **Resultado esperado:** G-8 CI-VERIFIED; G-6 con ventana demostrada (o PARTIAL reconocido si la operación no se autorizó en esa ventana: el acta lo registra como exclusión o como gate abierto, no como PASS).
- **Evidencia de salida:** URLs de runs con `head_sha` exacto; registro de ventana.
- **Avanzar si:** todos los jobs requeridos = success sobre el SHA exacto.
- **Detener si:** CI corresponde a otro SHA, un job falla, o la ventana se invalida (reboot/update/cambio de entorno).

### Etapa 7 — Acta de cierre

- **Entrada:** G-1…G-8 con evidencia sobre el SHA congelado (o exclusiones explícitas aceptadas).
- **Actividad permitida:** redactar el acta criterio por criterio (20 criterios de la línea de meta) y someterla al propietario.
- **Resultado esperado:** `M0_BUILD_COMPLETE` declarado solo si ningún criterio obligatorio del alcance queda UNKNOWN/BLOCKED; `PROTECTED_EFFECTS_AUTHORIZED` permanece STOP por separado.
- **Evidencia de salida:** acta firmada con evidencias enlazadas (§14).
- **Avanzar si:** el propietario acepta el acta (incluidas las exclusiones, si las hay).
- **Detener si:** falta una aprobación requerida o evidencia obligatoria (criterio 20) — M0 sigue INCOMPLETO.

**Ruta crítica (cadena más larga):** B-DOC-1 → propuesta ancla → decisión ancla/A-08 → fingerprint → implementación → harness → CI → acta. Las especificaciones P07-A/REC y el corrigendum ACA-1 corren en paralelo y no alargan la ruta si se preparan en la etapa 1.

---

## 7. Correcciones documentales necesarias (sin decisión nueva)

| ID | Corrección | Qué resuelve | Criterio de completitud |
|---|---|---|---|
| B-DOC-1 | Referenciar/registrar el contenido exacto de P08 (mapping), P09 (universo declarado) y P01-B=C, y localizar o registrar DISC-08A/B | R-A; K-04/K-05; G-4/G-5 verificables; §3.1 | Un auditor sin contexto puede leer el contenido decidido desde el repo (ruta + blob) y comprobar que coincide con lo declarado |
| B-DOC-2 | Corrigendum de lectura de ACA-1 (R-01–R-05): A-02 solo con alcance RB-1–RB-4; opción C sin objeto; claim restringido releído | K-01; única INCOMPATIBLE de texto (D-RB-01) | ACA-1 leída sin S2 no reintroduce la moratoria estrecha |
| B-DOC-3 | Subir a la rama: delta P09 (`6e59e0e6…`), este documento; resolver el duplicado `… (1).md` de la compatibilidad | Completitud del expediente SNOW | Carpeta SNOW con un solo ejemplar por entregable, hashes verificados |
| B-DOC-4 | Registrar en STATUS/DECISIONS las ratificaciones 7–10 Nov que hoy solo constan por instrucción (P07 V2.3 8-Nov; P08/P09 9-Nov; D-RB 10-Nov) con su contenido exacto | Trazabilidad incompleta (§3) | Cada decisión tiene registro con fecha, contenido y fuente; la etiqueta «declarada/trazabilidad incompleta» desaparece |
| B-DOC-5 | Anotar en la falsación en rama (`534c728c…`) la diferencia de 2 bytes (reflow L1000) | Higiene de hashes | Nota de una línea; no se re-sube el archivo |

Ninguna de estas correcciones modifica canónicos por sobrescritura: B-DOC-1/B-DOC-4 añaden registros; B-DOC-2 es corrigendum sobre documento de investigación (ACA-1 es PROPUESTA de Snow, no canónico); B-DOC-3/B-DOC-5 son publicación/higiene.

---

## 8. Trabajo técnico pendiente por gate (sin inventar soluciones)

Para cada gate se separa: (1) corrección documental suficiente; (2) mecanismo por diseñar; (3) mecanismo ya seleccionado/ratificado; (4) evidencia de dispositivo; (5) prueba posterior a autorización. Donde varias soluciones son posibles se comparan las opciones por la propiedad que cada una tendría que garantizar, sin seleccionar ninguna.

### G-1 P03/P04 (pre-read)

1. **Documental suficiente:** B-DOC-1 (resolver P08 es prerrequisito del pre-read: sin root→stores no hay admisión por raíz).
2. **Por diseñar:** dueño de admisión por flujo (¿CLI o API pública posee el contexto? — la spec §4 lo deja abierto); contrato de contexto para helpers; gramática CLI (flags bootstrap, compatibilidad legacy). Propiedad a garantizar: admisión completada antes del primer I/O de store en *cada* flujo del universo, con el contexto vivo hasta el último uso del snapshot.
3. **Ya ratificado:** la regla (O-08/O-10/O-11) y el orden abstracto (raíz canónica → admisión de instancia → locks per-store → I/O → release per-store → release de instancia, handoff §6.6.5).
4. **Dispositivo:** fingerprint de primitivas de lock (S-1) si el diseño las usa.
5. **Prueba:** casos §7 de la spec (sin raíz → rechazo; con raíz → admisión previa; padre/hijo sin doble adquisición; helper directo bloqueado; reemplazo de lock sobrevive).

### G-2 P05 (BLOCKED durable)

1. **Documental suficiente:** predicados de cuarentena/REC (etapa 1) — sin ellos E8 no tiene oráculo.
2. **Por diseñar:** mecanismo durable de BLOCKED y de single-use contra ancla. Opciones por propiedad: (a) ancla externa monotónica (D-RB-04 A) — garantiza detección de RB-3/RB-4 y no-replay *si* su verificación es previa a la admisión y su canal es fuera del dominio restaurable; (b) declaración del ejecutor por canal externo (D-RB-02 A) — garantiza conocimiento del rollback, no su prevención; (c) registro externo (D-RB-09 A) — garantiza auditabilidad, no monotonicidad por sí solo (no equivale al ancla). Ninguna forma está seleccionada; esta integración no propone una.
3. **Ya ratificado:** la política P05-C y la respuesta por defecto (UNKNOWN/BLOCKED, sin retry, sin readmisión sin procedimiento aprobado).
4. **Dispositivo:** A-03 (¿el backup restaura HOME?) decide si la moratoria es enforzable frente al SO; S-1/S-2 para cualquier mecanismo de kernel de usuario.
5. **Prueba:** E1–E9 + crash cuts + restore replay (CE-5) con el ancla en el bucle.

### G-3 P07-C

1. **Documental suficiente:** P07-A + predicados REC (etapa 1); fijación de `actor_B_class` por escenario en el diseño del harness (antes de ejecutar).
2. **Por diseñar:** arquitectura aceptada (A-01 MED+SUP u otra) y seams exactos fallo→sustitución→cleanup por oráculo (P07-06 matriz cutpoint×handler×actor; P07-19 A-temp/Library-temp/B-sentinel). Propiedad: prevención o serialización *dentro del claim decidido*; fuera de él, detección honesta (DETECTION_ONLY) sin PASS_GATE.
3. **Ya ratificado:** norma V2.3, afectación reversible, cleanup atribuible, R-OBJ/R-NAME separados.
4. **Dispositivo:** S-1 (dirfd/openat, fstat/stat), S-2 (grupos de procesos) si SUP se adopta.
5. **Prueba:** P07-05/06/16/18b/19/21 ejecutados con taxonomía completa sobre SHA congelado.

### G-4 P08

1. **Documental suficiente:** B-DOC-1 (referencia del mapping) — es el 80 % del desbloqueo de verificación.
2. **Por diseñar:** resolver común root→stores y separación init/append (contrato propuesto en la reconciliación 07-11, no implementado). Propiedad: una sola raíz produce los mismos stores en todos los flujos; append nunca inicializa.
3. **Ya ratificado:** la decisión de mapping del 9-Nov (contenido por referenciar; **no** re-ratificar).
4. **Dispositivo:** ninguno específico (paths dentro de HOME privado R1).
5. **Prueba:** mismo-root → mismos stores; append sin init → rechazo; raíz irresoluble → UNKNOWN/BLOCKED.

### G-5 P09

1. **Documental suficiente:** B-DOC-1 (universo) + subida del delta P09 (B-DOC-3) + clasificación de consumidores contra el universo referenciado (trabajo documental sobre el censo ya hecho; no repetir el censo).
2. **Por diseñar:** conversión de APIs path-based (`continuity-queries.mjs`, `chronicle-append.mjs`, factories/owner importables) a superficie interna o contexto admitido obligatorio; fixtures negativos por clase de loader (el guard no parsea `import(expr)`). Propiedad: ningún caller del universo alcanza un store sin admisión (O7 acotado).
3. **Ya ratificado:** alcance acotado (no universal); consumidores externos = UNKNOWN/OUTSIDE.
4. **Dispositivo:** ninguno específico.
5. **Prueba:** guard con fixtures negativos + test de no-bypass (criterio 6) sobre SHA congelado.

### G-6 E2/E3

1. **Documental suficiente:** roster de clases de writers relevantes y checklist de ventana (ya existe el criterio R1; falta su instanciación por ventana).
2. **Por diseñar:** launcher dedicado (P01-B=C: no seleccionar por inferencia; la selección es decisión futura si se quiere launcher) y destino efectivo (RE-01/RE-02).
3. **Ya ratificado:** R1 y el criterio de aceptación acotado; launcher único = propietario en sesión manual **durante la ventana de primera publicación** (ya ejecutada en alcance restringido; la ventana de cierre es otra).
4. **Dispositivo:** toda la evidencia (procesos, jobs, servicios, permisos, límites de visibilidad) — inspección autorizada.
5. **Prueba:** ventana delimitada con operación; STOP ante actor no controlado; invalidación por reboot/update.

### G-7 E4 + fingerprint

1. **Documental suficiente:** ninguna (es evidencia, no documento).
2. **Por diseñar:** nada aquí; el fingerprint *habilita* los diseños de G-2/G-3.
3. **Ya ratificado:** E1 (POCO X7 Pro/Android) identificado; E4 limitado verificado solo para la publicación restringida.
4. **Dispositivo:** fingerprint completo + A-03.
5. **Prueba:** probes S-1–S-4 con resultado por primitiva; E4 reevaluado para el destino del SHA de cierre.

### G-8 CI y G-9 Acta

Sin trabajo técnico propio: consumen la evidencia de G-1…G-7. El acta (G-9) es redacción documental tras la evidencia, con exclusiones explícitas si el claim es restringido.

---

## 9. Contratos de evidencia y oráculos de aceptación

Regla general (línea de meta §8.2 + V2.3 §2): cada afirmación de cierre debe poder repetirse sin memoria conversacional; ningún PASS por documentación, por CI de otro SHA o por detección.

| Gate | Oráculo de aceptación (objetivo) | Oráculo de rechazo / detención | Evidencia mínima conservada |
|---|---|---|---|
| G-1 | Los 10 casos §7 de la spec P03/P04 pasan sobre SHA congelado | Cualquier lectura de store antes de admisión, doble adquisición, o helper directo que lea fuera de contexto | Tests + run CI + SHA |
| G-2 | E1–E9 con resultado por caso; restore replay (CE-5) rechazado gracias al ancla; crash→restart nunca readmite sin REC | Persistencia confirmada + release incierto con retry/readmisión; lock reemplazado eliminado; BLOCKED no durable tras crash | Tests de crash cuts + registro externo + run CI |
| G-3 | P07-05/06/16/18b/19/21 con `actor_B_class` previo, taxonomía completa y `PASS_GATE` solo donde V2.3 lo permite (P07-16: máx. DETECTION_ONLY ante divergencia) | Escenario no ejecutado declarado PASS; seam no observable declarado PASS (debe ser UNKNOWN/INVALID); detección declarada PASS_GATE | Harness + resultados por escenario + run CI |
| G-4 | Misma raíz → mismos stores en todos los flujos; append sin init rechazado | Resolver ausente o dos flujos derivando stores distintos para la misma raíz | Registro de decisión + tests |
| G-5 | Guard con fixtures negativos rechaza cada clase de loader; test de no-bypass pasa en el universo referenciado | Arista sin resolver alcanzando operación protegida (→ UNKNOWN/BLOCKED, no PASS); consumidor externo declarado ausente | Guard + fixtures + delta actualizado + run CI |
| G-6 | Ventana R1 completada: pre-checks → operación → verificación sin actor no controlado | Actor relevante no controlado detectado → STOP; reboot/update/cambio de entorno → evidencia invalidada | Registro de ventana (fechas, SHA, roster) |
| G-7 | Fingerprint con PASS/FAIL/UNKNOWN por primitiva S-1–S-4 + A-03 resuelta | Primitiva necesaria FAIL/UNKNOWN sin alternativa decidida → vuelta a etapa 2 | Informe de fingerprint firmado por SHA/entorno |
| G-8 | Todos los jobs requeridos `success` con `head_sha` = SHA congelado | Run de otro SHA o solo documental presentado como evidencia de runtime | URLs de runs + jobs inspeccionados |
| G-9 | 20 criterios: PASS o exclusión aceptada; ninguno UNKNOWN/BLOCKED dentro del alcance | Criterio obligatorio sin evidencia o exclusión sin capacidad/riesgo documentados | Acta de aceptación |

**Nota sobre E4:** la comprobación post-escritura en destino real ya verificada (publicación restringida) se conserva como evidencia histórica limitada; no sustituye la evaluación de E4 para el destino del SHA de cierre (G-7).

---

## 10. Requisitos de autorización y límites de ejecución

| Paso | ¿Requiere autorización expresa? | Alcance de la autorización que habría que conceder |
|---|---|---|
| Etapas 0–1 (referencias, corrigendum, especificaciones PROPUESTA) | **No** (documental, dentro del encargo actual) | — |
| Etapa 2 (decisiones A-08/ancla/P07-A/A-01) | Decisión del propietario (no es «autorización de ejecución») | Registro de decisión con contenido exacto |
| Etapa 3 (fingerprint, A-03, pre-checks E2/E3) | **Sí, expresa y separada** | Inspección de solo lectura en POCO/Termux, acotada a primitivas y visibilidad; sin bootstrap, sin crear archivos, sin detener procesos |
| Etapa 4 (implementación) | **Sí (A-09)** | Diff limitado a los contratos decididos; cualquier decisión nueva detiene el cambio |
| Etapa 5 (tests/harness) | **Sí, separada de la implementación** | Ejecución sobre SHA congelado con `actor_B_class` fijado; sin efectos protegidos |
| Etapa 6 (CI + ventana con operación) | **Sí, separada** | CI sobre SHA exacto; ventana R1 con operación real y STOP ante actor no controlado |
| Etapa 7 (acta) | Firma del propietario | Aceptación del acta y de las exclusiones, si las hay |

**Límites que ninguna autorización de cierre levanta por sí sola:** commissioning, `ROOT_READY`, `authorization` (sigue NOT_EVALUATED hasta su propio gate), efectos protegidos (STOP), fusión de PR #110/#111, M1/STEP 7 (fuera del alcance M0 por instrucción expresa del encargo), y la prohibición de declarar PASS sin evidencia que satisfaga su definición.

---

## 11. Análisis adversarial de suficiencia

**Afirmación a falsar:** «Si se completan las etapas 0–7, M0 puede cerrarse legítimamente». Ataques intentados y resultado:

| # | Ataque | ¿La ruta lo resiste? | Corrección aplicada a la ruta |
|---|---|---|---|
| F-1 | Mutación por fd directo (CE-1) durante la ventana: el harness solo prueba clientes COVERED y declara PASS | **Resistido solo si** el acta declara el claim restringido con exclusión explícita de RAW (criterio 17) y los oráculos fijan `actor_B_class` previo; V2.3 prohíbe PASS_GATE con RAW en el claim | Etapa 2 (A-08) es prerrequisito de la etapa 5; §9 exige clase previa por escenario |
| F-2 | Restore RB-3/RB-4 silencioso entre CI y operación: el estado restaurado es autoconsistente | **Resistido solo con ancla realizada + declaración del ejecutor** (D-RB-02/D-RB-04); sin ancla, la moratoria es inenforzable (S3 B-01) y la ruta se detiene en etapa 2/3 | R-C en raíz; A-03 como evidencia de etapa 3; sin ancla no hay etapa 4 para G-2 |
| F-3 | Quiescencia declarada sin enumeración completa de poseedores (CE-11/CE-12) | **Parcialmente resistido:** D-RB-06 C se trata como precondición verificable solo en sentido acotado (ventana R1 + roster), nunca como propiedad universal; CE-12/CE-13 quedan como contraejemplos abiertos en el acta | G-6 exige ventana delimitada, no quiescencia universal; el acta no puede afirmar enumeración completa (I-6) |
| F-4 | Superficie pública que evita la admisión: API path-based importada directamente (fila 6 P09) | **Resistido si** G-5 convierte o exige contexto en *toda* API del universo referenciado; un solo caller sin clasificar → UNKNOWN/BLOCKED, no PASS | G-5 etapa 4 + fixtures; §9 oráculo de rechazo |
| F-5 | Harness que pasa sin cubrir el caso peligroso (p. ej., P07-06 sin matriz cutpoint×handler×actor; P07-19 sin seam observable) | **Resistido por construcción del oráculo:** seam no observable → UNKNOWN/INVALID; matriz incompleta → gate abierto | §9 G-3; etapa 5 «avanzar si» exige taxonomía completa |
| F-6 | CI verde sobre SHA equivocado o solo documental | **Resistido:** criterio 16 + §9 G-8 exigen `head_sha` exacto e inspección de jobs; el precedente PR #110 (run sin SHA expuesto) queda como contraejemplo registrado | Etapa 6 «detener si» |
| F-7 | Evidencia E2/E3 invalidada por reboot/update tras la ventana | **Resistido:** la evidencia caduca por definición R1; el acta debe ligar la ventana a la operación de cierre, no a una ventana histórica | §9 G-6; etapa 6 |
| F-8 | Confusión autoridad/identidad/continuidad/persistencia (lock verde → autoridad; raíz existente → ROOT_READY) | **Resistido:** criterios 4/7 de la línea de meta + separación de gates transversales en §13 | G-9 y §13 lo explicitan |
| F-9 | Atestación errónea del propietario en REC (CE-15) o doble instancia del mediador (CE-16) | **No eliminado, acotado:** REC adopta la atestación como raíz de confianza *declarada* (A-04), no como demostración técnica; el acta debe registrarlo como supuesto, no como garantía | §8 G-2/G-3; §12 lo lista como decisión/supuesto residual |
| F-10 | Dependencia circular: G-1 necesita G-4 (resolver) y G-4 necesita B-DOC-1; G-3 necesita G-5 (cobertura para serialización) y G-5 necesita G-1 (pre-read) | **Sin circularidad real tras B-DOC-1:** G-5 se cierra en dos sub-pasos (universo+fixtures+consumidores, documental/estático) antes de G-1; la serialización P07 usa la cobertura resultante | §5.3 lo ordena; la ruta (§6) lo refleja |
| F-11 | Gate omitido: ¿falta algo del expediente? Se contrastó contra los 20 criterios de la línea de meta y los gates literales del handoff §5 | **Cubierto:** los 20 criterios se mapean a G-1…G-9 (A→G-4/G-9, B→G-1/G-5, C→G-2/G-3/G-4, D→G-8, E→G-8/G-9); D0–D3 quedan como contratos subyacentes de G-1/G-2/G-4, no como gates separados (el handoff los mantiene OPEN en paralelo; el acta debe reconciliarlos) | Nota: D0/D1/D2/D3 OPEN en STATUS deben quedar reconciliados en el acta (aceptados, implementados o excluidos con riesgo) — criterio 3 |
| F-12 | Supuesto de dispositivo no verificado (S-1–S-4, A-03) tratado como hecho | **Resistido:** etapa 3 precede a la etapa 4; sin fingerprint no hay implementación que dependa de primitivas | §6 etapas 3–4 |

**Veredicto adversarial:** la ruta es suficiente **condicionada** a (i) A-08 resuelto a favor de claim restringido con exclusiones explícitas, o cambio de modelo; (ii) ancla realizada; (iii) fingerprint sin FAIL en primitivas necesarias. Si (i) se resuelve exigiendo el claim universal dentro de R1, la afirmación de cierre es **falsa por imposibilidad condicionada** (I-1–I-7, falsación CE-1/CE-5/CE-7 + ACA-1 §4.3), y ninguna cantidad de trabajo documental la hace verdadera. Esta integración no reabre esa demostración; la usa como restricción de la ruta.

---

## 12. Decisiones que realmente siguen pendientes

Sin pedir ninguna en este documento. Lista exhaustiva de lo que **no** está decidido hoy y cuya ausencia bloquea la ruta:

| Decisión | Estado | ¿Bloquea qué? | ¿Eevitable? |
|---|---|---|---|
| A-08: alcance del claim de cierre (contención con exclusiones vs cambio de modelo) | **PENDIENTE** (ACA-1 §8, propuesta) | Criterio de éxito de G-2/G-3; viabilidad misma de la ruta (§11) | **Ineevitable** en alguna forma: o se acepta el restringido con exclusiones, o se cambia el modelo |
| Forma del ancla D-RB-04 A + encaje en R1 | Requisito DECIDED; **forma PENDIENTE** | G-2 (O1/O2 rollback), fin de la moratoria | **Ineevitable** si se quiere enforcement de single-use bajo restore; evitable solo manteniendo la moratoria como exclusión permanente (entonces el acta debe declararlo) |
| P07-A: criterio de identidad (qué cuenta como mismo objeto, política de aliases) | **PENDIENTE** (sin decidir en canónicos) | O3/O5, P07-16/P07-21, readmisión | **Ineevitable** para G-3 |
| A-01: arquitectura de mediación/supervisión (MED+SUP u otra) | **PENDIENTE** (propuesta ACA-1) | G-1/G-2/G-3 implementación | Ineevitable en la forma «alguna arquitectura aceptada»; la forma concreta MED+SUP es propuesta, no obligada |
| A-04/A-07: atestación como raíz de REC; diseño del testigo | **PENDIENTE** | G-2/G-3 recuperación | Condicionadas al diseño adoptado |
| A-03: clasificación del SO/backup tras evidencia | **UNKNOWN/PENDING** (sin evidencia específica) | Enforzabilidad de la moratoria frente al OS | Se resuelve con evidencia (etapa 3), no con votación previa |
| A-05: alcance de cierre P09 | Parcialmente resuelta por el universo 9-Nov (declarado); el *contenido* falta por referenciar | G-5 | **No es decisión nueva**: es B-DOC-1 |
| A-09: autorización de implementación | **PENDIENTE** (por diseño, al final) | Etapa 4 | Ineevitable como autorización, no como decisión de diseño |
| D-01–D-12 y 9 de Misión 01 | SIN DECIDIR | Nada en la ruta M0 (fuera de alcance salvo intersección futura) | No se reabren aquí |
| DISC-08A/B | **No localizados** (§3.1) | Desconocido hasta localizarlos | Primero localizar; solo entonces clasificar |

**Respuesta corta:** sí hay decisiones estrictamente inevitables (A-08, forma del ancla, P07-A, y alguna arquitectura A-01), pero **ninguna puede tomarse hoy** sin la preparación de las etapas 0–1, y **ninguna se solicita en este documento**. Todo lo demás (B-DOC-1…5, especificaciones, clasificación de consumidores, preparación del harness) puede avanzar sin decisiones nuevas.

---

## 13. Criterio objetivo para declarar M0 cerrado

M0 puede declararse **`M0_BUILD_COMPLETE`** (única etiqueta de cierre que este documento reconoce, según la línea de meta §2.1) si y solo si se cumplen **todas** estas condiciones sobre un único SHA congelado:

1. Los 20 criterios de la línea de meta §3 están en PASS o en exclusión explícita aceptada por el propietario (con capacidad afectada y riesgo documentados); **ningún criterio obligatorio dentro del alcance queda UNKNOWN/BLOCKED** (criterio 17).
2. G-1…G-8 tienen la evidencia de §9 ligada a ese SHA (código + tests + runs CI con `head_sha` exacto + registro de ventana + fingerprint).
3. D0/D1/D2/D3 quedan reconciliados en el acta: aceptados, implementados o excluidos con riesgo (criterio 3).
4. El claim de cierre está escrito en el acta con su alcance (restringido con exclusiones, o modelo cambiado) y **ninguna afirmación del acta excede lo demostrado** (§12 del dictamen, pregunta 8).
5. El acta enumera las exclusiones aceptadas y los supuestos residuales (p. ej., atestación CE-15, enumeración I-6) como supuestos, no como garantías.
6. El propietario acepta el acta (criterio 20).

**Lo que el cierre NO significa** (debe constar en el acta): no implica `PROTECTED_EFFECTS_AUTHORIZED` (gate separado, STOP), no establece `ROOT_READY` ni legitimidad de la raíz, no fija `authorization` (sigue NOT_EVALUATED hasta su propio gate), no autoriza commissioning, bootstrap de una instancia nueva, dispatch ni efectos protegidos, y no abre M1.

---

## 14. Lista final de artefactos que deberán existir para el acta de cierre

1. Registro de referencia 9-Nov (P08 mapping, P09 universo, P01-B=C) + localización o constancia de ausencia de DISC-08A/B (B-DOC-1).
2. Corrigendum de lectura de ACA-1 (B-DOC-2) y carpeta SNOW completa sin duplicados (B-DOC-3).
3. Registros de decisión en DECISIONS/ o deltas de STATUS para P07 V2.3, P08, P09 y D-RB con contenido exacto (B-DOC-4).
4. Especificación P07-A + predicados de cuarentena/REC (etapa 1 → decisión etapa 2).
5. Propuesta y decisión de forma del ancla + canal del registro externo (etapas 1–2).
6. Decisión A-08 (alcance del claim) y A-01 (arquitectura) con registro.
7. Informe de fingerprint del target (S-1–S-4) + evidencia A-03 (etapa 3).
8. Código de cierre en SHA congelado: pre-read (G-1), resolver P08 + init/append (G-4), conversión APIs + fixtures (G-5), mecanismo durable + BLOCKED + single-use + cuarentena/REC (G-2/G-3).
9. Harness P07 + tests de arquitectura/concurrencia + matriz E1–E9 ejecutados con taxonomía V2.3 (etapa 5).
10. Runs CI sobre el SHA congelado con jobs inspeccionados (etapa 6).
11. Registro de ventana E2/E3 con operación (etapa 6).
12. Acta de aceptación M0 criterio por criterio (20) con exclusiones y supuestos residuales (etapa 7).

---

## Tabla final compacta

| ID | Estado actual | Bloqueo | Acción mínima | Evidencia de cierre | Dependencia | Autorización |
|---|---|---|---|---|---|---|
| G-1 P03/P04 | DECIDED / no IMPLEMENTED | Pre-read ausente; dueño por flujo sin fijar | Implementar admisión pre-read en flujos del universo (tras G-4/G-5) | 10 casos §7 spec + CI sobre SHA congelado | G-4, G-5, G-2 | Implementación + prueba + CI |
| G-2 P05 | DECIDED (política) / OPEN | Sin BLOCKED durable ni single-use bajo restore; ancla sin realizar | Decidir forma del ancla; implementar mecanismo durable | E1–E9 + crash/restore replay + registro externo | Ancla (R-C), G-7 | Decisión + implementación + prueba |
| G-3 P07-C | UNKNOWN / BLOCKING | Sin P07-A, sin arquitectura aceptada, sin harness | Especificar P07-A/REC; decidir A-01/A-08; ejecutar harness | P07-05/06/16/18b/19/21 con taxonomía V2.3 | G-2, G-5, G-7, A-08 | Decisión + harness + CI |
| G-4 P08 | DECIDED-declarada / no IMPLEMENTED | Mapping no referenciado; sin resolver común | B-DOC-1; implementar resolver + init/append | Registro + tests de raíz única | B-DOC-1 | Documental → implementación |
| G-5 P09 | DECIDED-declarada (acotado) / OPEN | Universo no referenciado; APIs path-based; fixtures ausentes | B-DOC-1; convertir APIs; fixtures negativos | Guard + fixtures + no-bypass + CI | B-DOC-1, G-1 | Documental → implementación |
| G-6 E2/E3 | PARTIAL / NOT CLOSED | Sin ventana con operación; RE-01/RE-02 UNKNOWN | Inspección + ventana R1 delimitada | Registro de ventana ligado a la operación | G-7 | Inspección + operación |
| G-7 E4/fingerprint | NOT READY / UNKNOWN (O8) | Sin fingerprint; A-03 sin evidencia | Fingerprint S-1–S-4 + A-03 | Informe por primitiva ligado a SHA/entorno | Autorización inspección | Inspección (solo lectura primero) |
| G-8 CI | CI-VERIFIED histórico / OPEN (SHA de cierre) | No existe SHA de cierre | CI sobre SHA congelado con jobs inspeccionados | Runs `head_sha` exacto, success | G-1…G-7 | CI |
| G-9 Acta | PENDIENTE | Depende de G-1…G-8 y exclusiones | Redactar acta 20 criterios y someterla | Acta aceptada por el propietario | G-8 | Firma del propietario |
| B-DOC-1 | Traza incompleta | Contenido 9-Nov + DISC-08A/B no referenciados | Referenciar/registrar (sin re-decidir) | Rutas + blobs localizables | — | Ninguna (documental) |
| B-DOC-2 | INCOMPATIBLE de texto (D-RB-01) | ACA-1 A-02/opción C estrechan la moratoria | Corrigendum R-01–R-05 sobre ACA-1 | ACA-1 legible sin S2 sin contradicción | — | Ninguna (documental) |

---

## Dictamen (respuestas explícitas)

1. **¿Cuántos gates siguen abiertos o desconocidos?** 9 de 9 (G-1…G-9), con la descomposición de §4. La cifra es contable a nivel de gate; no se fuerza una cifra de sub-bloqueos P05/P07 porque depende de A-08 y de la forma del ancla.
2. **¿Cuáles determinan la ruta crítica?** R-B (alcance del claim A-08), R-C (ancla realizada) y R-E (fingerprint/A-03), con R-A (referencia 9-Nov) como desbloqueo documental previo y R-D (P07-A) en paralelo. Cadena crítica: B-DOC-1 → ancla/A-08 → fingerprint → implementación → harness → CI → acta.
3. **¿Qué puede resolverse sin nuevas decisiones?** B-DOC-1…5 completos; especificaciones P07-A/REC y propuesta de ancla (como PROPUESTA); clasificación de consumidores contra el universo una vez referenciado; preparación del harness y de los fixtures; reconciliación D0–D3 para el acta.
4. **¿Qué decisiones nuevas son estrictamente inevitables?** A-08 (alcance del claim), forma del ancla, P07-A y alguna arquitectura (A-01); A-04/A-07 condicionadas al diseño; A-09 como autorización final. Ninguna se solicita ahora: cada una requiere su propuesta con alternativas y consecuencias (etapa 1).
5. **¿Qué puede prepararse documentalmente sin autorización de ejecución?** Todo lo de las etapas 0–1 y la redacción del acta en borrador; también el diseño del harness y de los fixtures (escritura sin ejecución, si se autoriza la escritura como trabajo documental).
6. **¿Qué requiere autorización expresa antes de ejecutarse?** Inspección del dispositivo (etapa 3), implementación (etapa 4), tests/harness (etapa 5), CI y ventana con operación (etapa 6).
7. **¿Conjunto mínimo de pruebas y evidencias para declarar M0 cerrado?** El de §9 + §14: 10 casos P03/P04, E1–E9, 6 oráculos P07 bloqueantes con taxonomía, tests P08/P09 (raíz única, init/append, fixtures, no-bypass), fingerprint + A-03, ventana E2/E3, CI sobre SHA congelado y acta 20/20 (PASS o exclusión aceptada).
8. **¿Qué seguiría fuera de alcance tras el cierre?** Claim universal dentro de R1 (I-1–I-7); escritores RAW/PRIVILEGED más allá del claim decidido; enumeración completa de poseedores de fd (I-6); retiro de mutaciones en vuelo (I-4); identidad post-restore como demostración técnica sin atestación (I-3/CE-15); cualquier garantía frente a OS comprometido o procesos same-UID maliciosos (excluidos por R1); cobertura universal de callers (P09 es acotado); fsync/durabilidad ante pérdida de energía más allá de lo probado; ROOT_READY, commissioning, dispatch y efectos protegidos (gates separados, STOP); M1/STEP 7 y todo objetivo futuro.

---

**Confirmación explícita:** esta integración es solo lectura y trabajo documental. No se modificó código, documentos canónicos, ramas, commits ni PR; no se ejecutaron pruebas, CI, comandos en dispositivo/Termux, runtime ni efectos persistentes; no se implementó ningún mecanismo ni se presentó ninguna propuesta como aprobada; no se solicitó ninguna decisión nueva al propietario; no se reabrieron investigaciones concluidas (la falsación, la especificación de rollback, la reconciliación D-RB, ACA-1, la compatibilidad y el delta P09 se usan como insumos, con sus hashes); no se declaró PASS, TESTED, IMPLEMENTED ni CI-VERIFIED para ningún gate de cierre; las fuentes no localizadas (DISC-08A/B, contenido exacto P08/P09 9-Nov, registro exacto P07 V2.3) quedan registradas como UNKNOWN por trazabilidad, sin reconstrucción por inferencia. Estados preservados: P05 OPEN, P07-C UNKNOWN/BLOCKING, P09 OPEN/UNKNOWN, E2/E3 PARTIAL/NOT CLOSED, M0 INCOMPLETO, `authorization: NOT_EVALUATED`, commissioning y efectos protegidos STOP.

*Fin del documento.*

---

## 15. Addendum de continuidad y corrección de fuentes (2026-11-10 23:24 CST)

Este addendum **no sustituye** las secciones 1–14 ni reinicia la investigación. Corrige y precisa la base de fuentes conforme a la instrucción del propietario y registra la integración de los análisis de Qwen y Gemini, ya recibidos en la rama de investigación, sin reauditarlos.

### 15.1 Fuente de verdad canónica (verificado)

- **STATUS canónico de NCS M0:** rama `ncs-continuity-handoff-correction-2026-11-07`, HEAD `eee2ae772e5569ffbc90d6334f47c6633f4961fb`, blob de `NEXO_NCS/STATUS.md` = **`dfa580cc77ffafe37d26997220cbc12357328fa2`** (verificado por `git rev-parse` sobre el clon público de solo lectura, 2026-11-10 23:24 CST; coincide con el blob indicado por el propietario).
- **Rama de investigación** `ncs-m0-architecture-research-2026-11-10` (HEAD `9c4d9d81…`, merge-base con `main` = `36c5e0975661…`): rama independiente de investigación basada en `main`, destinada exclusivamente a entregas externas. **Su `NEXO_NCS/STATUS.md` no es el STATUS canónico de M0**: su cabecera es «Current phase: CONSTRUCTION — STEP 7 POLICY CONTEXT RESOLVER TRUST BOUNDARY STOP», es decir, el expediente histórico de STEP 7.
- **Aclaración sobre este documento:** las secciones 1–14 **ya utilizaron el STATUS canónico** (rama `eee2ae77`, deltas del 07-11) como referencia de estado, y la rama de investigación solo como destino y como fuente de los documentos SNOW/Qwen/Gemini. Ninguna conclusión de este documento se apoya en el STATUS de la rama de investigación. La corrección del propietario queda así incorporada de forma explícita sin cambiar ningún gate.
- **Precedencia (sin cambios):** las decisiones posteriores del propietario prevalecen sobre el snapshot canónico cuando su procedencia y contenido pueden verificarse; si falta el registro exacto, la decisión se conserva como declarada por el propietario con brecha de trazabilidad (§3), sin reabrirla ni inventar su contenido.

### 15.2 Trabajo ya realizado integrado sin reauditar

| Fuente | Hash verificado | Uso en este documento |
|---|---|---|
| `NCS_M0_ROLLBACK_SEMANTICS_AND_OWNER_DECISIONS_SNOW_2026-11-10.md` | `f36008ec…` (rama = local) | Alcances RB-1–RB-4, D-RB-01…09 como PROPUESTA original; §4/§5 |
| `Reconciliación de decisiones de rollback.md` (= `NCS_M0_ROLLBACK_OWNER_DECISIONS_RECONCILIATION_2026-11-10.md`) | `f1d5e4bd…` (rama = local) | Ratificaciones D-RB y corrección de alcance R-01–R-05; §3/§4 |
| `NCS_M0_ROLLBACK_RECONCILIATION_GAPS_AND_BLOCKERS_2026-11-10.md` | `3fdb1ca4…` (rama = local) | Brechas G-01…G-10 / bloqueos B-01…B-05; §5/§6 |
| `NCS_M0_P05_P07_ACA1_RATIFIED_DECISIONS_COMPATIBILITY_DELTA_2026-11-10.md` | `c970b186…` (rama = local) | Matrices D-RB/O1–O9/oráculos, K-01…K-06, S-1…S-9; §4/§8/§11 |
| `NCS_M0_P05_P07_CE1_CE5_CE7_INDEPENDENT_FALSIFICATION_2026-11-10.md` | local `8f1bb646…`; rama `534c728c…` (reflow de 2 bytes en L1000, contenido idéntico) | CE-1/CE-5/CE-7, P-RESTORE UNKNOWN, I-1–I-7; §8/§11 |
| ACA-1 `NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md` | `f337381f…` (rama = local) | PROPUESTA de arquitectura; §8 |
| Copia ACA-1 con sufijo ` (1)` | `c970b186…` — **mismo contenido y blob que la original de compatibilidad** | **No es investigación adicional**; duplicado de subida. Se registra como tal y no se cita como fuente independiente |
| Qwen `NCS_M0_P05_P07_ALTERNATIVE_ARCHITECTURE_QWEN_2026-11-10.md` | rama SHA-256 `b1b08e1b…` | Ver §15.3 |
| Gemini `NCS_M0_ANDROID_TERMUX_P05_P07_PLATFORM_FEASIBILITY_GEMINI_2026-11-10.md` | rama SHA-256 `f66cb3f2…` | Ver §15.3 |

Nota de integridad Qwen: la copia en rama es una **consolidación fiel de fragmentos recibidos**, no una reproducción byte a byte verificada del original (consta en su propio anexo). Se integra con esa etiqueta; los pasajes ausentes (tabla funcional O1–O9 inicial, diagramas, filas CE intermedias) quedan UNKNOWN y no se completan por inferencia. Además, Qwen adopta una **lectura funcional de O1–O9** que puede diferir de la numeración normativa de las obligaciones: su matriz O1–O9 debe re-mapearse antes de cualquier uso normativo.

### 15.3 Integración de Qwen y Gemini (sin reauditar)

**Gemini — viabilidad de plataforma Android/Termux (investigación documental, M0 ABIERTO).** Aporta semántica de plataforma que alimenta directamente **G-7 (fingerprint)** y los supuestos S-1–S-4, sin demostrar ninguna obligación en el repo o el dispositivo:

- Descriptores: `dup`/`fork` comparten la descripción abierta; `execve` conserva fds sin CLOEXEC; `O_CLOEXEC` evita la ventana de carrera; `SCM_RIGHTS` sobre `AF_UNIX` soportado en Bionic. → Refuerza **I-6/CE-11** (enumeración de poseedores incompleta por herencia/transferencia) y el tratamiento de CE-12/CE-13 en §11.
- Bloqueos: OFD (`F_OFD_SETLK`) asociado a la descripción abierta, recomendado por Gemini para concurrencia cooperativa; **advisory** (un no cooperativo puede ignorarlo); sin mandatory locks en Linux ≥5.15. → Confirma que ningún lock de archivo es frontera frente a RAW/same-UID: coherente con la clasificación V2.3 (RAW nunca prueba enforcement) y con §9 (G-2/G-3).
- Persistencia: patrón `write → fsync(file) → rename → fsync(dir)` viable con restricciones; `rename` atómico en el mismo punto de montaje (ext4/f2fs); atomicidad ≠ durabilidad; el patrón **no** demuestra resistencia a rollback coherente ni ancla independiente. → Alimenta G-7 (qué debe probeear el fingerprint) y confirma §8 G-2 (la persistencia local no sustituye al ancla D-RB-04 A).
- Aislamiento: sandbox Android por UID/SELinux; **sin aislamiento fuerte entre procesos del mismo UID** en Termux; ADB/propietario fuera de la frontera; HOME privado recomendado frente a `/sdcard` FUSE. → Coherente con R1 (exclusión de same-UID malicioso y de OS comprometido) y con la ventana E2/E3 (G-6): el control de actores no puede apoyarse en aislamiento intra-UID.
- Su matriz CE-1/CE-5/CE-7 y O1–O9 usa una numeración propia (CE-5 = persistencia ante SIGKILL, no replay de release; O1–O9 distintos de las obligaciones normativas): **no se mezcla** con la numeración canónica de este documento; se cita solo como evaluación de viabilidad de plataforma. Sus etiquetas VIABLE/PARCIAL son *evaluaciones documentales de Gemini*, no evidencia de cumplimiento (su §10 lo declara expresamente).

**Qwen — arquitectura alternativa AFA-W (PROPUESTA no decisional).** Admisión forense con ancla de testigo: sobre de admisión AA + verificador VR como última puerta; autoridad normativa/evidencial/procedimental, **no coercitiva** bajo R1; fallo cerrado (UNKNOWN→BLOCKED) ante evidencia incompleta; identidad lógica `(namespace_id, name, epoch)` con manifiesto firmado. Su propia declaración de límites coincide con las imposibilidades de este documento: sin prevención de ejecución de escritor antiguo, sin aislamiento fuerte escritor/verificador en el mismo HOME, sin protección total de claves en HOME, y O3 (BLOCK tras rollback) solo cubierto **si el witness externo existe y se consulta**. En términos de §8: AFA-W es una **opción de diseño adicional para G-2/G-3** cuya propiedad sería detección + inadmisibilidad (no prevención), dependiente de witness externo — es decir, presupone la misma realización del ancla/registro (D-RB-04/D-RB-09) que ACA-1 deja pendiente; no la resuelve. Su **Arquitectura B** (UID separado, keystore, MAC/append-only, contador hardware) es explícitamente un **cambio de R1** que requiere decisión formal: en la ruta de §6 corresponde a la rama «cambio de modelo» de A-08, no a un paso dentro de R1. Las decisiones que Qwen lista como pendientes (witness obligatorio para O3, inmutabilidad vía SELinux/MAC, hash/canonicalización exactos, custodia de clave AA, tratamiento de objetos admitidos tras revocación) se suman a §12 como **preguntas de diseño abiertas**, sin seleccionar ninguna. Estados declarados por Qwen (P05 OPEN, P07-C UNKNOWN/BLOCKING, M0 no cerrado) son coherentes con los canónicos y no los modifican.

**Efecto neto sobre los gates:** ninguno cambia de estado. Qwen y Gemini enriquecen el espacio de opciones de G-2/G-3/G-7 y confirman restricciones ya demostradas (advisory, same-UID, witness-dependencia); no aportan evidencia de implementación, target o ejecución.

### 15.4 Dependencias prioritarias — representación explícita

La lista de prioridad del propietario se representa así en la estructura de este documento (se aclara la doble numeración: «G-02/G-03» del punto 3 son las **brechas de la reconciliación**; «G-2/G-3» de la matriz §4 son los gates P05/P07-C):

| # Prioridad | Representación en este documento | Invariante |
|---|---|---|
| 1. D-RB-01 A moratoria total RB-1–RB-4 | §3 (ratificación), §5 R-C/D-3, §6 etapas 0/2, §8 G-2, B-DOC-2 | **La moratoria ratificada no es enforcement demostrado**: sin ancla realizada y ejecutor clasificado, es inenforzable frente a rollback no declarado |
| 2. D-RB-04 A ancla externa monótona | §5 R-C, §6 etapas 1–2, §8 G-2, §12 | Requisito DECIDED; **forma y realización PENDIENTES**; GEN/WIT-local/registro humano no la sustituyen (compatibilidad §4) |
| 3. Brechas G-02/G-03 (restauración Android/Termux; SO como ejecutor) | §6 etapa 3, §8 G-7, §11 F-2 | **UNKNOWN** (A-03 sin evidencia específica); se resuelve con evidencia, no con votación previa |
| 4. P05 enforcement durable + recuperación | Gate G-2 (§4), §8, §9 (E1–E9) | **OPEN**; P05-C es política ratificada, no mecanismo |
| 5. P07-C identidad/sustitución/cleanup/oráculos | Gate G-3 (§4), §8, §9 (P07-05/06/16/18b/19/21) | **UNKNOWN/BLOCKING**; detección ≠ PASS_GATE |
| 6. P08 mapping decidido | Gate G-4 (§4), B-DOC-1 (§7) | Decisión **declarada**; localizar y enlazar contenido exacto; **no** re-ratificar |
| 7. P09 universo acotado ratificado | Gate G-5 (§4), §8 | **Decisión de alcance ≠ cierre técnico**: universo decidido (declarado) con P09 OPEN/UNKNOWN y cobertura sin demostrar |
| 8. E2/E3 bajo R1 | Gate G-6 (§4) | **PARTIAL/NOT CLOSED**; evidencia por ventana, caduca ante reboot/update |
| 9. P03/P04 pre-read + cobertura real | Gate G-1 (§4), §8 | D1–D6 DECIDED; enforcement **no implementado** en `d8b5ca87` |
| 10. Target, pruebas, CI, acta | Gates G-7/G-8/G-9 (§4), §6 etapas 3–7 | Sin fingerprint ni SHA congelado no hay TESTED/CI-VERIFIED; acta solo tras evidencia |

### 15.5 Confirmación del addendum

Solo lectura: no se modificó código, canónicos, ramas, commits ni PR; no se ejecutaron pruebas, CI ni comandos en dispositivo/Termux; no se cambiaron decisiones ni estados canónicos; no se reauditaron Qwen/Gemini/ACA-1 (integración de conclusiones con sus etiquetas); M0 **no** se declara cerrado. Estados preservados: P05 OPEN, P07-C UNKNOWN/BLOCKING, P09 OPEN/UNKNOWN, E2/E3 PARTIAL/NOT CLOSED, M0 INCOMPLETO.

*Fin del addendum. Las secciones 1–14 permanecen vigentes sin sustitución.*
