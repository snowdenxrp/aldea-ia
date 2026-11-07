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
| `report-r2.md` | 104.970 | `e873748f193e6156a1c3c8c91252e64f755776e75717c6ee7ca856524aeba3e9` | PASS |
| `expediente-consolidado-nexo-r2.html` | 143.251 | `6283e471831622615466280d913876d63d973137850dca117eba56dd3443638f` | PASS |
| `hashes-r2.md` | 4.450 | `ec39125f11d9feff4720efb6daddc2ef055fb1dc81fc95c6a5d7d9a7005861c2` | PASS externo |
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
- **UNKNOWN:** U2, U3, U5, U6, U7 y U9 permanecen abiertos (6); U1 está RESUELTO con lectura primaria directa de NIST SP 800-63B-4; U8 está RESUELTO con lectura primaria directa de Miller (2024); U4 permanece PARCIAL.
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
- `report-r2.md`: 104.970 bytes; SHA-256 `e873748f193e6156a1c3c8c91252e64f755776e75717c6ee7ca856524aeba3e9`.
- `expediente-consolidado-nexo-r2.html`: 143.251 bytes; SHA-256 `6283e471831622615466280d913876d63d973137850dca117eba56dd3443638f`.
- `hashes-r2.md`: 4.450 bytes; SHA-256 externo `ec39125f11d9feff4720efb6daddc2ef055fb1dc81fc95c6a5d7d9a7005861c2`.
- `consolidation-method.md`: 9.720 bytes; SHA-256 `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285`.

Los tres hashes de archivos distintos del manifiesto coinciden con el manifiesto final. El hash del manifiesto se conserva aquí como comprobación externa.


## Verificación primaria U1 / C02 (2026-11-07)

Se leyó directamente el texto oficial NIST de SP 800-63B-4:
- §2.3.2: AAL3 exige autenticador criptográfico con clave privada no exportable, resistencia al phishing y entorno aislado protegido por hardware; los autenticadores sincronizables no se permiten en AAL3.
- §3.2.13: define la no exportabilidad y admite hardware separado o procesador/entorno de ejecución integrado (secure element, TEE, TPM) separado del procesador host.
- Appendix B: describe las claves clonadas/exportadas a sync fabric.
- Appendix E: confirma que Rev.4 exige autenticador criptográfico no exportable en lugar de exigir un autenticador basado necesariamente en hardware.

Fuente primaria: https://pages.nist.gov/800-63-4/sp800-63b.html

**Resultado:** U1 RESUELTO con evidencia primaria directa; C02 confirmada con precisión. Se elimina la limitación anterior de lectura verbatim pendiente para estas disposiciones. El registro conserva 9 identificadores U1–U9: 6 UNKNOWN, 2 RESUELTOS (U1 y U8) y 1 PARCIAL (U4).


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
