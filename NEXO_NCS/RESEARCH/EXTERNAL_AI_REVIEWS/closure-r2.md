# Cierre de publicación e integridad — MUSE-AUTONOMY-002 R2

## Alcance

Este registro cierra la publicación y la integridad documental de los artefactos R2. No declara cerrada la evaluación sustantiva de la misión ni autoriza implementación.

- Repositorio: `snowdenxrp/aldea-ia`
- Rama: `nexo-mission-02-pdf-2026-11-05`
- Commit de publicación inicial: `96e227eb06134037fa5e01fabc8cfba4c384f476`
- Commit que contiene las primeras correcciones documentales: `0ef2f2b837d8472e22c633ba3e2b3029fc47f6e9`.
- Las correcciones posteriores de identidad R1/R2, estado de publicación y hashes se registran en el historial de la misma rama; este cierre se actualiza para reflejar la verificación final.

## Integridad de archivos publicados

SHA-256 recalculado sobre el contenido UTF-8 recuperado de la rama, con tamaño exacto en bytes:

| Archivo | Bytes | SHA-256 | Resultado |
|---|---:|---|---|
| `report-r2.md` | 108.801 | `eb29be6c413655453c9d01f0956e2445efb48603f711b2a2658d1679e55ea726` | PASS |
| `expediente-consolidado-nexo-r2.html` | 147.900 | `eb76716816a51c92fa1c21a5227510ce3f4aff36b244ba17e829cbc4bc9a8de9` | PASS |
| `hashes-r2.md` | 4.450 | `c3a63284da9b7a089ae6005214bd53d98c02ef3ca4910ff7ce55d4410a5e5749` | PASS externo |
| `consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | PASS |

El hash del manifiesto se registra aquí, fuera del propio manifiesto, para evitar autorreferencia. Los hashes de los otros tres archivos coinciden con los valores del manifiesto R2.

## Discrepancias documentales resueltas

1. **Ruta de la nota de método:** el archivo publicado está en la raíz de `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`; el manifiesto se corrigió para reflejar esa ruta. No existe la ruta `notes/consolidation-method.md` en esta rama.
2. **PDF/HTML:** no existe un PDF R2 independiente en el árbol de la rama. El propietario confirmó que HTML y PDF representan el mismo expediente y aceptó el HTML como entrega suficiente. El HTML es el artefacto canónico publicado. No se afirma identidad binaria ni publicación del PDF.
3. **Estado posterior a la subida:** la nota de método y el informe R2 se actualizaron para dejar constancia de la publicación y de la verificación posterior.

## Alcance exacto de los cambios posteriores a la publicación inicial

La comparación final con la publicación inicial (`96e227eb06134037fa5e01fabc8cfba4c384f476`) incluye únicamente archivos documentales de esta misión: `consolidation-method.md`, `hashes-r2.md`, `report-r2.md`, `expediente-consolidado-nexo-r2.html` y este registro `closure-r2.md`. El snapshot HTML anterior `auditoria-muse-autonomy-002-r1-independiente.html` se conserva sin modificar como evidencia histórica.

No se modificaron código, pruebas, CI, workflows, NCS M0, P07 ni decisiones D-01 a D-12.

## Dictamen

- **Publicación e integridad documental R2:** PASS.
- **Cierre sustantivo global de MUSE-AUTONOMY-002:** PARTIAL.
- **UNKNOWN:** U2, U3, U5, U6, U7 y U9 permanecen abiertos (6); U1, U4 y U8 están RESUELTOS con lectura/verificación primaria directa; no quedan registros U1–U9 en estado PARCIAL.
- **C14:** parcialmente confirmada.
- **D-01 a D-12:** SIN DECIDIR.
- **Independencia de revisiones:** las tres pasadas fueron subagentes con contexto compartido; no se presentan como revisores externos independientes.
- **Implementación, seguridad operativa y conformidad técnica:** no demostradas por esta auditoría documental.

El PASS se limita estrictamente a la publicación e integridad de los documentos enumerados. No eleva UNKNOWN, no convierte propuestas en decisiones y no produce autorización de implementación.


## Revisión editorial adicional (2026-11-07)

Una lectura adversarial posterior detectó metadatos heredados del expediente base que podían confundirse con la identidad de la misión R2. Se aclaró en Markdown y HTML que:

- **MUSE-AUTONOMY-001** identifica el expediente base M02 → M03 → M03-B.
- **MUSE-AUTONOMY-002** identifica la auditoría adversarial y la revisión R2 de ese expediente.
- Las menciones a la integridad de la rama como UNKNOWN y “sin acceso a GitHub” describían el estado al redactar R2; se actualizaron para apuntar a la verificación posterior del 2026-11-07.
- El PDF R2 se describe como representación local declarada, no como archivo publicado ni como hash recalculado desde la rama. El HTML es el artefacto canónico aceptado por el propietario.
- El manifiesto fue actualizado con los nuevos tamaños y SHA-256 de Markdown y HTML.

Verificación final posterior a estas correcciones:
- `report-r2.md`: 108.801 bytes; SHA-256 `eb29be6c413655453c9d01f0956e2445efb48603f711b2a2658d1679e55ea726`.
- `expediente-consolidado-nexo-r2.html`: 147.900 bytes; SHA-256 `eb76716816a51c92fa1c21a5227510ce3f4aff36b244ba17e829cbc4bc9a8de9`.
- `hashes-r2.md`: 4.450 bytes; SHA-256 externo `c3a63284da9b7a089ae6005214bd53d98c02ef3ca4910ff7ce55d4410a5e5749`.
- `consolidation-method.md`: 9.720 bytes; SHA-256 `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285`.

Los tres hashes de archivos distintos del manifiesto coinciden con el manifiesto final. El hash del manifiesto se conserva aquí como comprobación externa.


## Verificación primaria U1 / C02 (2026-11-07)

Se leyó directamente el texto oficial NIST de SP 800-63B-4:
- §2.3.2: AAL3 exige autenticador criptográfico con clave privada no exportable, resistencia al phishing y entorno aislado protegido por hardware; los autenticadores sincronizables no se permiten en AAL3.
- §3.2.13: define la no exportabilidad y admite hardware separado o procesador/entorno de ejecución integrado (secure element, TEE, TPM) separado del procesador host.
- Appendix B: describe las claves clonadas/exportadas a sync fabric.
- Appendix E: confirma que Rev.4 exige autenticador criptográfico no exportable en lugar de exigir un autenticador basado necesariamente en hardware.

Fuente primaria: https://pages.nist.gov/800-63-4/sp800-63b.html

**Resultado:** U1 RESUELTO con evidencia primaria directa; C02 confirmada con precisión. Se elimina la limitación anterior de lectura verbatim pendiente para estas disposiciones. El registro conserva 9 identificadores U1–U9: 6 UNKNOWN y 3 RESUELTOS (U1, U4 y U8), sin registros parciales.


## Verificación primaria U8 / Miller (2024) (2026-11-07)

Se leyó directamente el PDF primario de Evan Miller, *Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations*, arXiv:2411.00640v1 (14 páginas; v1 presentada el 2024-11-01; PDF fechado 2024-11-04).

Hallazgos relevantes para el expediente:
- §§2–2.2: marco de superpoblación de preguntas, SEM por CLT y errores estándar agrupados cuando las preguntas comparten clusters.
- §3: reducción de varianza mediante múltiples respuestas por pregunta o probabilidades del siguiente token; no recomienda alterar la temperatura solo para reducir varianza.
- §4: comparación pareada a nivel de pregunta, con errores estándar sobre diferencias; también formula la variante agrupada.
- §5 y Ap. B–C: fórmula de tamaño de muestra/potencia y extensión para clusters. El ejemplo de ≈969 preguntas usa parámetros hipotéticos (diferencia absoluta 3%, potencia 80%, α=0,05) y el autor sugiere al menos 1.000 preguntas para nuevos evals bajo ese ejemplo; no es norma ni umbral universal.
- Precisión editorial: el artículo dice que el bootstrap suele ser innecesario cuando el CLT aplica a muestras grandes con varianza finita y muestreo simple; lo reserva para esquemas o estimadores complejos. Por ello, la frase previa de C11 que resumía la recomendación como “bootstrap, intervalos y pruebas pareadas” era incompleta y se corrigió.

Fuente primaria: https://arxiv.org/pdf/2411.00640

**Resultado:** U8 RESUELTO con lectura primaria directa. U2 permanece UNKNOWN: el artículo es investigación/recomendación estadística, no una norma que prescriba 200–500 casos.


## Revisión primaria de U2 — umbral de casos de prueba (2026-11-07)

Se contrastaron fuentes primarias adicionales:
- **NIST AI 200-3, ARIA Evaluation Planning Manual (septiembre 2026):** §3 y §4 recomiendan definir tamaños según objetivos y análisis de potencia. Appendix C presenta ejemplos específicos: Healthcare-Privacy usa ≈20–40 red teamers, ≈100 user testers por aplicación y ≈3–5 annotators; Manufacturing-Safety usa ≈30–50 red teamers, ≈60–100 user testers por aplicación y ≈3–5 annotators. Son participantes humanos en ejemplos hipotéticos, no un número universal de prompts o casos.
- **NIST AI RMF 1.0, Measure 2.1–2.3:** exige documentar test sets, métricas y herramientas; pide representatividad y evaluación para condiciones similares a despliegue. No fija N universal.
- **Reglamento (UE) 2024/1689, art. 10(2)–(4):** exige gobernanza de datos, relevancia, representatividad, completitud y propiedades estadísticas apropiadas; no fija N en ese artículo.
- **Miller (2024), §5:** el cálculo ≈969 y la sugerencia ≈1.000 se basan en parámetros hipotéticos, no en una norma.

**Resultado:** U2 permanece UNKNOWN. No se encontró un umbral universal obligatorio de 200–500 casos en estas fuentes primarias, pero la búsqueda no cubre exhaustivamente todas las normas sectoriales ni jurisdicciones. Se conserva la distinción entre número de prompts/casos, número de participantes humanos y número de anotadores.


## Verificación primaria U4 — gobernanza y versiones A2A (2026-11-07)

Fuentes primarias contrastadas:
- Linux Foundation, 23-06-2025: anuncia que A2A, creado por Google, pasa a ser un proyecto de la Linux Foundation.
- AAIF, 17-08-2026: anuncia A2A como hosted project.
- A2A Protocol, 27-08-2026: anuncia su aceptación como Growth Stage project en AAIF.
- AAIF About: se define como fundación neutral bajo la Linux Foundation y enumera A2A entre sus proyectos.
- A2A `GOVERNANCE.md` actual: el proyecto tiene un Technical Steering Committee propio de nueve asientos y atribuye al TSC la supervisión técnica, dirección, releases, políticas y procesos del proyecto. AAIF tiene su propio Governing Board y Technical Committee; no deben confundirse con el TSC de A2A.
- GitHub Releases: v1.0.0 publicado el 12-03-2026; v1.0.1 publicado el 28-05-2026, con notas fechadas 26-05-2026.

Discrepancia documental: el archivo `docs/specification.md` en el tag `v1.0.1` y la página versionada `/v1.0.1/specification/` aún presentan en el frontmatter `Latest Released Version 1.0.0`, aunque el release oficial v1.0.1 existe. La discrepancia se conserva como deuda editorial de la documentación upstream; no invalida el tag ni el release.

**Resultado:** U4 RESUELTO con evidencia primaria. La omisión de referencias a la Linux Foundation en el texto técnico de la especificación no contradice los registros de gobernanza y anuncios oficiales del proyecto.


## Revisión primaria U3 — UCAN y ZCAP (2026-11-07)

**UCAN v1.0.0** (`ucan-wg/spec`) fue leído directamente. La especificación describe autorización distribuida, local-first y originada por el usuario; principales identificados por DID; delegación, invocación, atenuación y cadenas de prueba. Declara expresamente que una cadena criptográficamente válida puede ser semánticamente inválida, que UCAN no ofrece confinement y que el conocimiento de todas las subdelegaciones no está garantizado. Revocation y Promise son RECOMMENDED, no REQUIRED.

**Authorization Capabilities (ZCAP)** fue contrastado en la página W3C CCG `v0.4.0-draft` y en el release GitHub `v0.4.0` (07-10-2026). Es un Draft Community Group Report, no una W3C Recommendation. El release indica que todos los cambios v0.4.0 son no normativos. La especificación cubre root/delegated capabilities, Data Integrity proofs, caveats y cadenas; el detalle normativo de revocación permanece en backlog. La página de versiones enumera `v0.4.0-draft` y `v0.3.0`.

**Resultado:** U3 permanece UNKNOWN. UCAN y ZCAP son mecanismos de autorización basados en capabilities, no una solución integral de identidad, autoridad raíz, recuperación o continuidad de Nexo. El inventario de protocolos/estándares de identidad y delegación sigue sin ser exhaustivo.


## Revisión primaria U5 — HELM frente a lm-evaluation-harness (2026-11-07)

Se leyó el paper original HELM (TMLR 2023) y los README oficiales actuales de HELM y EleutherAI lm-evaluation-harness. HELM documenta que resultados pueden variar ampliamente con prompts y ejemplos few-shot; el propio paper cita rangos de 30–80% para el mismo modelo/escenario bajo distintas condiciones y motiva estandarizar condiciones para comparaciones head-to-head. El repositorio HELM declara maintenance mode desde 01-06-2026. El harness de EleutherAI es un framework configurable, con más de 60 benchmarks y cientos de subtareas/variantes, prompts y few-shot configurables, postprocesamiento, métricas y backends.

**Resultado:** no se encontró una comparación primaria pareada que sustente un diferencial general de 4–5 puntos. Para validar una cifra así se requiere el mismo checkpoint, tarea y split, métrica/normalización, prompt, número de ejemplos few-shot, parser, versiones y semilla. U5 permanece UNKNOWN hasta localizar la comparación concreta o reproducirla. La diferencia no se atribuye a una causa específica.
