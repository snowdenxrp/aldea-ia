# MISIÓN MUSE-AUTONOMY-003 — RESUMEN PARA EL PROPIETARIO (HANDOFF)

**Fecha:** 2026-11-07. **Para:** Kevin, propietario de Nexo. **De:** Snow (coordinador de la misión).

## Qué se hizo

Cinco pasadas adversariales separadas intentaron refutar las conclusiones residuales del expediente consolidado MUSE-AUTONOMY-002 R2. La hipótesis era que el expediente podía contener errores, generalizaciones, omisiones o conclusiones que exceden sus evidencias. Las cinco pasadas las hicieron subagentes de Snow que comparten contexto: no son revisores externos independientes y no deben presentarse como tales.

Los cuatro entregables de esta misión viven en `~/workspace/research_notes/nexo-autonomy-003/`:

- `MUSE_AUTONOMY_003_ADVERSARIAL_REPORT.md` — informe completo (metodología, fuentes, hallazgos, contraargumentos, dictamen).
- `MUSE_AUTONOMY_003_CLAIM_MATRIX.md` — matriz de afirmaciones atacadas, evidencia, contraevidencia y estados.
- `MUSE_AUTONOMY_003_SOURCE_REGISTER.md` — registro de fuentes primarias y secundarias, versiones, fechas y limitaciones.
- `MUSE_AUTONOMY_003_HANDOFF.md` — este resumen.

No se modificó ningún documento canónico R2, no se publicó nada y no se declara PASS global. El cierre sustantivo global sigue siendo **PARTIAL**.

## Qué se logró refutar

| # | Qué se refutó | Consecuencia |
|---|---|---|
| 1 | **La cifra 4–5 puntos es HELM vs lm-eval** (U5). Los números vienen de Stanford CRFM (2024-05-01) y comparan HELM con las puntuaciones reportadas por los creadores, no con lm-eval. Además, 4–5 es el máximo de la tabla CRFM (mediana 1,2 en 25 modelos), no el diferencial típico. | D5/U5 deben reescribirse con la procedencia real. La única comparación pareada HELM-vs-lm-eval localizada (Hugging Face, 2023) da 14,9 puntos para LLaMA-65B, no 4–5. |
| 2 | **El inventario de identidad/delegación del expediente es exhaustivo** (U3). Se encontraron 26 estándares/mecanismos no examinados, varios con estatus normativo final (GNAP RFC 9635, SCITT RFC 9943, SD-JWT RFC 9901, WebAuthn L3, eIDAS 2.0). | D-01, D-02, D-04, D-06 y D-08 deben reevaluarse con el inventario ampliado. |
| 3 | **«UCAN/ZCAP agotan el espacio de capabilities»** (U3). Existen Biscuit, Macaroons, GNAP, UMA 2.0 y otros. | D-08 debe considerar más formatos de capability. |
| 4 | **«Ed25519 está incluido literalmente en IR 8547»** (C14). «Ed25519» aparece cero veces en el documento final; su inclusión es una inferencia en dos pasos (Tabla 2 + FIPS 186-5), correcta pero no literal. | Re-etiquetar de EVIDENCE a CORROBORATED/INFERENCE. C14 se mantiene PARCIALMENTE CONFIRMADA. |
| 5 | **«Migrar las firmas antes de 2030 es prescripción NIST»** (C14). Esa fecha no existe en IR 8547 para las firmas; el hito federal de firmas es 2031. | Re-etiquetar como PROPOSAL prudencial. |
| 6 | **«Un autenticador no exportable en software aislado podría alegarse AAL3»** (M03 §2). SP 800-63B-4 §3.2.13 exige entorno aislado protegido por hardware (TEE, TPM, secure element). | Precisión nueva y material: en tu Poco X7 Pro la vía AAL3 sería el TEE del dispositivo, no software aislado. Afecta a D-01/D-02. |
| 7 | **«Ninguna norma prescribe ningún N fijo»** (U2, formulación amplia). Basilea MAR32 prescribe 250 observaciones para el backtesting de VaR bancario. | Matizar la redacción: 250 días en su ámbito; no generalizable a agentes. |
| 8 | **«200–500 bastan para decidir diferencias de 3 puntos»** (lectura fuerte de C11). Con la fórmula de Miller, a n=200 el error mínimo detectable es 13,2 puntos (una sola ejecución); para 3 puntos harían falta 3.876 preguntas. Además «caso» no está definido y la correlación entre casos reduce la muestra efectiva (≈54 a partir de 500). | Añadir a C11/D-07: error mínimo detectable, declarar el número de ejecuciones y definir «caso». |
| 9 | **Coherencia interna de R2 sobre sus propios estados.** R2 afirma a la vez U6 y U9 RESUELTOS (§7, cierre) y UNKNOWN (§11 B2/B7, texto heredado de R1). | Corrección editorial: alinear §11 con §7 y el cierre. |

## Qué quedó corroborado (se intentó refutar y no se pudo)

- **El núcleo de C14** (fechas 2030/2035, EdDSA ≥128 bits, hitos federales 2030/2031): leído literalmente en el documento final de IR 8547, no en resúmenes. El hallazgo H-04 de la auditoría 002 queda cerrado para el núcleo.
- **Ed25519 no caduca matemáticamente**: no hay expiración automática universal; el calendario es normativo federal, no una fecha criptográfica.
- **La aritmética de C11 y la fórmula de Miller** (incluido el ≈969 y el ≥1.000): reproducidas exactamente.
- **El fallo estructural central**: ningún estándar ni mecanismo encontrado resuelve la revocación o la sucesión sin un tercero de confianza cuando la clave raíz se compromete o el propietario queda incapacitado. KERI, el candidato más fuerte, lo admite en su propia gobernanza.
- **La tesis cualitativa de evaluación**: el mismo modelo puntúa distinto según la implementación del harness; tres fuentes independientes lo confirman.
- **No hay norma universal 200–500 para evaluar un agente** (en las 19 fuentes examinadas): los reguladores prescriben justificar el tamaño muestral y la potencia, no un número fijo.
- **Las citas de estatus normativo verificadas** del expediente (DID Core, VC 2.0, did:key, ZCAP, BitstringStatusList) y los conteos internos del dossier.

## Qué permanece UNKNOWN

| Registro | Estado | Qué falta para resolverlo |
|---|---|---|
| **U2** — tamaño de muestra 200–500 | UNKNOWN | Una norma primaria que prescriba un N universal para agentes, o una búsqueda documentada como exhaustiva; y la definición de «caso» + parámetros empíricos para D-07. |
| **U3** — exhaustividad de identidad/delegación | UNKNOWN | El inventario ampliado (26 fichas) tampoco es exhaustivo: faltan el censo del registro DID, borradores WIMSE/AIMS y esquemas nacionales. |
| **U5** — diferencial 4–5 HELM vs lm-eval | UNKNOWN | La cifra en esa formulación está refutada; falta una comparación pareada con versiones actuales fijadas por commit, o documentar que no existe. |
| **Verificación *legacy* post-2035** de firmas Ed25519 anteriores | UNKNOWN (nuevo) | La revisión futura de SP 800-131A. |
| **Jurisdicción de Kevin** (aplicabilidad de eIDAS 2.0) | UNKNOWN (nuevo) | Es un dato tuyo, no investigable en fuentes públicas. |
| **Texto original de C01–C16** (fidelidad de las reformulaciones de M03-B) | UNKNOWN (nuevo) | Archivar el texto original que proporcionaste. |
| **Controles SP 800-53 de C09/C10/C12** leídos verbatim | CORROBORATED como máximo (no EVIDENCE) | Lectura verbatim de los controles citados. |

## Contradicciones nuevas encontradas

1. **U6 y U9: RESUELTOS y UNKNOWN a la vez** en R2 (§7/cierre vs §11 B2/B7). Es texto heredado de R1 no purgado tras el cierre de 2026-11-07. Material.
2. **M03 §2 vs SP 800-63B-4 §3.2.13** (AAL3): la implicación de M03 es incorrecta; ninguna pasada anterior lo había corregido. Material.
3. **La definición de EVIDENCE del expediente** («corroborado por ≥2 resúmenes») infla etiquetas: las 4 fuentes de IR 8547 son reescrituras simultáneas del mismo comunicado NIST, y C09/C10/C12 descansan en controles no leídos verbatim. C09, C10, C12 y R2c deben degradarse a CORROBORATED o verificarse de verdad.
4. **C12 es circular**: la autenticación por mensaje presupone D-01/D-02/D-08, que están SIN DECIDIR; y «se descarta y se registra» crea una nueva vía de entrada hostil al log. No se había señalado.
5. **Doble escala de veredicto** (APROBADO CONDICIONADO en §1 vs PARTIAL en §11) sin mapeo en el dictamen.
6. **Texto obsoleto** tras el cierre de 2026-11-07: salvedades de verificación ya hecha (C02, §11 D), limitación A2A ya resuelta (§11 C4), calificadores «fuente secundaria» para v1.0.1, y la sección U5 duplicada en el cierre.

## Decisiones que siguen reservadas a ti

- **D-01 a D-12: todas SIN DECIDIR.** Esta misión no decide ninguna. Los frentes B y A aportan material nuevo para D-01, D-02, D-03, D-04, D-06, D-07, D-08 y D-11, pero no resuelven ninguna.
- **Las 9 decisiones de la Misión 01** siguen pendientes.
- **NCS M0 y P07 no se tocaron**; tampoco se autorizó implementación, ni se publicó nada en la rama.

## Qué trabajo adicional sería necesario

1. **Antes de decidir D-01/D-02/D-06/D-08:** lectura primaria de 7 fichas (GNAP, RFC 8693, KERI, did:webvh, SCITT, SPIFFE/WIMSE, FROST), censo del registro DID y de borradores WIMSE/AIMS, y registro de tu jurisdicción.
2. **Antes de decidir D-07:** definir «caso», medir la correlación entre casos y declarar el error mínimo detectable y el número de ejecuciones (K) para cada evaluación.
3. **Antes de decidir D-11:** lectura verbatim de SP 800-131A revisado (es lo único que podría elevar C14) y precisión sobre la verificación *legacy* post-2035.
4. **Para cerrar U5:** ejecución pareada HELM vs lm-evaluation-harness con versiones fijadas por commit, o documentar que no existe.
5. **Rectificación editorial del expediente** (10 correcciones mínimas, §9 del informe completo): reescribir D5/U5, alinear §11 B2/B7/D/E, registrar la precisión AAL3, degradar etiquetas infladas, alinear C11 con Miller, precisar C14, acotar U7/U9, etiquetar §6.4, archivar el texto original de C01–C16 y fijar las citas A2A al tag v1.0.1. Ninguna requiere re-auditoría; ninguna toca M0, P07 o tus decisiones.
6. **Publicación en la rama** sigue bloqueada por la autorización de GitHub (sin cambios desde el cierre R2).

---

*Dictamen final de la misión: la misión refutó atribuciones y formulaciones concretas con evidencia primaria; el núcleo sustantivo del expediente sobrevivió; los estados no cambian; el cierre sustantivo global sigue siendo PARTIAL.*
