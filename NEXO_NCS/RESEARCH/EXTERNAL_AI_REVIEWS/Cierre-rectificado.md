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
| `report-r2.md` | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | PASS |
| `expediente-consolidado-nexo-r2.html` | 153.699 | `af343327e190a37fbc317774e4b3da77b84724ee73bff50eb6053b835b728e7b` | PASS |
| `hashes-r2.md` | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | PASS externo |
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
- **UNKNOWN:** U2, U3 y U5 permanecen abiertos (3); U1, U4, U6, U7, U8 y U9 están RESUELTOS con evidencia/revisión primaria; no quedan registros U1–U9 en estado PARCIAL.
- **C14:** parcialmente confirmada.

> **Rectificación MUSE-003 (2026-11-07) — R-06 / A-04.** Sin cambiar el estado (C14 sigue PARCIALMENTE CONFIRMADA), se precisa: NIST IR 8547 usa formulaciones prospectivas («will deprecate» / «will disallow»): describen un **plan anunciado**, no una obligación redactada como «shall». Se separan el hito federal de establecimiento de claves (**2030**) del hito de firmas (**2031**); «migrar firmas antes de 2030» no es prescripción NIST y, si se conserva como recomendación prudencial, se etiqueta PROPOSAL. Ed25519 no aparece literalmente en IR 8547; su asociación con EdDSA ≥128 bits requiere una inferencia en dos pasos junto con FIPS 186-5 §7. «Disallowed» significa que el algoritmo deja de estar permitido para **aplicar protección criptográfica**; no significa, por sí solo, que esté prohibido verificar firmas o datos protegidos previamente. El tratamiento legacy post-2035 sigue UNKNOWN y la revisión de SP 800-131A está anunciada, no publicada ni incorporada como calendario final. Alcance federal/NIST, no universalizado.
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
- `report-r2.md`: 112.505 bytes; SHA-256 `6d111749716c0145441af7321c3c61378a63adef974d291da662c82dd36bef6a`.
- `expediente-consolidado-nexo-r2.html`: 152.279 bytes; SHA-256 `d27ad56efcf308220d9e88c088bb920e9cfdf8a4d8697e9e1b96e80a958b6b98`.
- `hashes-r2.md`: 4.450 bytes; SHA-256 externo `f09815f19fa7b97f688b7bf047040b571f6b0c9102e0bfb24c1d62514ffd62cb`.
- `consolidation-method.md`: 9.720 bytes; SHA-256 `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285`.

Los tres hashes de archivos distintos del manifiesto coinciden con el manifiesto final. El hash del manifiesto se conserva aquí como comprobación externa.


## Verificación primaria U1 / C02 (2026-11-07)

Se leyó directamente el texto oficial NIST de SP 800-63B-4:
- §2.3.2: AAL3 exige autenticador criptográfico con clave privada no exportable, resistencia al phishing y entorno aislado protegido por hardware; los autenticadores sincronizables no se permiten en AAL3.
- §3.2.13: define la no exportabilidad y admite hardware separado o procesador/entorno de ejecución integrado (secure element, TEE, TPM) separado del procesador host.
- Appendix B: describe las claves clonadas/exportadas a sync fabric.
- Appendix E: confirma que Rev.4 exige autenticador criptográfico no exportable en lugar de exigir un autenticador basado necesariamente en hardware.

Fuente primaria: https://pages.nist.gov/800-63-4/sp800-63b.html

**Resultado:** U1 RESUELTO con evidencia primaria directa; C02 confirmada con precisión. Se elimina la limitación anterior de lectura verbatim pendiente para estas disposiciones. El registro conserva 9 identificadores U1–U9: 3 UNKNOWN y 6 RESUELTOS (U1, U4, U6, U7, U8 y U9), sin registros parciales.


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

> **Rectificación MUSE-003 (2026-11-07) — R-05 / A-01 / A-03.** Sin cambiar el estado (U2 global sigue UNKNOWN), se restituye la división en subregistros: **U2-a Existencia** (normas primarias que prescriban tamaños muestrales en ámbitos acotados y alcance de la búsqueda; la ausencia de un N universal para agentes no equivale a ausencia de N en todos los sectores), **U2-b Parámetros** (validez de parámetros estadísticos, supuestos, emparejamiento, varianza y potencia aplicables a D-07) y **U2-c Definición de «caso»** (unidad de análisis, independencia/dependencia, clustering y correspondencia con una ejecución K). Resolver un subregistro no resuelve U2 global ni autoriza una decisión D-07. Basilea MAR32 se conserva como caso sectorial (250 observaciones/días para backtesting bancario de VaR), no como mínimo universal para agentes. Atribución corregida: Miller publicó el resultado de aproximadamente **969** preguntas, junto con los resultados de MDE **13,2%** y **7,5%** bajo sus escenarios; **3.876** y **7.108** son cálculos derivados del Frente A mediante la misma fórmula, no cifras publicadas por Miller. Escenarios con sus supuestos: 969 (determinista pareado, σ² = 0 y ω² = 1/9); 3.876 (no determinista con K = 1); 7.108 (no pareado). Ninguna de estas cifras es regla universal.


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

> **Rectificación MUSE-003 (2026-11-07) — R-01 / A-02.** Procedencia corregida de la cifra «4–5 puntos»: (1) **CRFM HELM MMLU (2024-05-01)** compara HELM con puntuaciones reportadas por los creadores, no con lm-eval; en 25 modelos el rango observado va de −5,0 a +1,8, la **mediana de los valores absolutos de las diferencias, mediana de |Δ| = 1,2 puntos**, y la media firmada es −0,65; 4–5 es un extremo, no el diferencial típico. (2) **Hugging Face (2023)**: comparación pareada histórica, +14,9 puntos para LLaMA-65B; evidencia histórica acotada, no estimación universal. (3) **MMLU-Pro §6.3 (Wang et al.)**: 24 estilos de prompt producen variaciones típicas de 4–5% y picos de hasta 10,98%; es sensibilidad al prompt, no diferencia entre harnesses, y se registra como **INFERENCE** / hipótesis de procedencia plausible, no como procedencia demostrada. La frase original «no se encontró una comparación primaria pareada» queda precisada: sí existe una comparación pareada histórica (Hugging Face 2023), que no sustenta un diferencial general de 4–5 puntos. Se conservan los sub-UNKNOWNs de U5 (documento enlazado para Claude 2.1; versión de HELM; temperatura/semilla/decoding; agregación macro/micro; historial de fuentes secundarias a 2026-11-05). U5 permanece UNKNOWN como cuestión general.


> **NOTA EDITORIAL — BLOQUE SUPERSEDIDO / CONSOLIDADO (Rectificación MUSE-003, 2026-11-07 — R-10.8).**
> Este segundo bloque «Revisión primaria U5» (el duplicado posterior, encabezado «HELM y lm-evaluation-harness») queda marcado como **SUPERSEDIDO / CONSOLIDADO** en el primer bloque «Revisión primaria U5 — HELM frente a lm-evaluation-harness», porque ambos bloques son casi idénticos en contenido y el segundo no aporta verificación distinta. **No se borra nada**: el texto del bloque duplicado se conserva íntegro a continuación como historial. La rectificación de procedencia R-01 / A-02 anotada en ambos bloques se aplica al contenido consolidado (primer bloque).

## Revisión primaria U5 — HELM y lm-evaluation-harness (2026-11-07)

Se leyó el paper HELM (TMLR 2023) y los README oficiales actuales de HELM y lm-evaluation-harness. HELM documenta que las condiciones de evaluación pueden variar sustancialmente por escenarios, métricas, prompts y ejemplos few-shot; su paper cita rangos de 30–80% para el mismo modelo/escenario bajo condiciones distintas y promueve estandarización para comparaciones directas. El repositorio HELM declara maintenance mode desde 01-06-2026. El harness actual declara más de 60 benchmarks y cientos de subtareas/variantes, con prompts, few-shot, postprocesamiento, métricas y backends configurables.

**Resultado:** no se encontró una comparación primaria pareada que sustente un diferencial general de 4–5 puntos. Para validar esa cifra se requieren mismo checkpoint, tarea/split, métrica/normalización, prompt, número de ejemplos, parser, versiones y semilla. U5 permanece UNKNOWN; no se atribuye la diferencia a una causa específica.

> **Rectificación MUSE-003 (2026-11-07) — R-01 / A-02.** Procedencia corregida de la cifra «4–5 puntos»: (1) **CRFM HELM MMLU (2024-05-01)** compara HELM con puntuaciones reportadas por los creadores, no con lm-eval; en 25 modelos el rango observado va de −5,0 a +1,8, la **mediana de los valores absolutos de las diferencias, mediana de |Δ| = 1,2 puntos**, y la media firmada es −0,65; 4–5 es un extremo, no el diferencial típico. (2) **Hugging Face (2023)**: comparación pareada histórica, +14,9 puntos para LLaMA-65B; evidencia histórica acotada, no estimación universal. (3) **MMLU-Pro §6.3 (Wang et al.)**: 24 estilos de prompt producen variaciones típicas de 4–5% y picos de hasta 10,98%; es sensibilidad al prompt, no diferencia entre harnesses, y se registra como **INFERENCE** / hipótesis de procedencia plausible, no como procedencia demostrada. La frase original «no se encontró una comparación primaria pareada» queda precisada: sí existe una comparación pareada histórica (Hugging Face 2023), que no sustenta un diferencial general de 4–5 puntos. Se conservan los sub-UNKNOWNs de U5 (documento enlazado para Claude 2.1; versión de HELM; temperatura/semilla/decoding; agregación macro/micro; historial de fuentes secundarias a 2026-11-05). U5 permanece UNKNOWN como cuestión general.


## Resolución U6 — afirmación EUV (2026-11-07)

ASML indica que fabricar un microchip implica cientos de pasos y que el ciclo de capas puede repetirse hasta 100 veces; EUV se usa para capas críticas y DUV para otras capas. El JRC de la Comisión Europea documenta que una herramienta EUV contiene alrededor de 100.000 partes y su cadena incluye más de 5.000 proveedores globales. ASML describe dependencia de proveedores únicos y componentes cuya multifuente puede ser económicamente impráctica. Estas fuentes apoyan complejidad y dependencia global, no el número exacto >1.000 ni una imposibilidad física universal.

**Resultado:** U6 RESUELTO como corrección epistemológica. Se retira cualquier presentación de >1.000 pasos o imposibilidad física como EVIDENCE; se conserva solo la limitación práctica/económica/temporal bajo aislamiento de recursos. C16 sigue siendo la formulación aceptada.

> **Rectificación MUSE-003 (2026-11-07) — R-07.** Alineación con §7 de report-r2: U6 permanece RESUELTO como corrección epistemológica acotada; no prueba universal física. Sin cambio de estado.

## Resolución U7 — cuarentena frente a recuperación (2026-11-07)

Lectura directa de NIST SP 800-53 Rev. 5.1: `quarantine` aparece en AC-4(8) (datos tras fallo de filtro), SC-18(1) (código móvil inaceptable) y SI-3 (código malicioso). Estos usos corresponden a filtrado/contención, no a una fase de restauración. CP-10 define recovery/reconstitution a un estado conocido; IR-9 exige aislar sistemas contaminados y erradicar información. La actualización NIST 5.2.0 no cambió CP-10 ni IR-9 ni los controles AC-4/SC-18/SI-3 citados.

**Resultado:** U7 RESUELTO en ese alcance. `Quarantine` como acción de contención está respaldada por controles; `quarantine` como etapa general de restauración no está prescrita por CP-10 y sigue siendo una propuesta de diseño Nexo.

> **Rectificación MUSE-003 (2026-11-07) — R-07.** Alineación con §7 de report-r2: U7 permanece RESUELTO en el alcance de NIST SP 800-53 examinado (Rev. 5.1; controles AC-4(8), SC-18(1), SI-3, CP-10, IR-9); `quarantine` como fase general de restauración sigue siendo PROPOSAL. La afirmación «la actualización NIST 5.2.0 no cambió CP-10 ni IR-9 ni los controles citados» se lee como «no cambió esos controles» y su nivel es CORROBORATED, no EVIDENCE (la versión 5.2.0 no se leyó como diff, solo por change list). Sin cambio de estado.


## Resolución U9 — límites de pruebas Merkle (2026-11-07)

Se leyó directamente IETF RFC 9162 (Certificate Transparency v2.0; Experimental, no Standards Track):
- §2.1.3: una Merkle inclusion proof demuestra que una hoja concreta existe en el árbol.
- §2.1.4: una Merkle consistency proof demuestra que un árbol posterior conserva el prefijo del árbol anterior (append-only).
- §§8.2–8.3: los monitores inspeccionan cada nueva entrada, validan STH y pruebas de consistencia/inclusión; las auditorías verifican que las promesas firmadas se cumplan.
- §11.3: un log puede mostrar vistas inconsistentes a distintos clientes; la comparación de STH entre clientes (gossip) puede detectar divergencias, pero el RFC indica que gossip es un área activa de investigación y queda fuera de su especificación.

El RFC espera que las CAs envíen todos los certificados emitidos y contempla SCT/recibos firmados, inclusión dentro del Maximum Merge Delay y monitores que detecten incumplimiento. Sin recibo firmado ni inventario independiente de eventos, un evento que nunca se envió al log no deja una hoja que Merkle pueda probar ausente.

**Resultado:** U9 RESUELTO como precisión criptográfica: Merkle demuestra inclusión y consistencia del conjunto registrado, no completitud del universo de eventos. La detección de omisiones requiere fuentes/recibos independientes, monitores y comparación de checkpoints/árboles. RFC 9162 es un modelo técnico de transparencia, no un estándar general de Nexo.

> **Rectificación MUSE-003 (2026-11-07) — R-07.** Alineación con §7 de report-r2: U9 permanece RESUELTO como precisión criptográfica. Merkle demuestra inclusión y consistencia del conjunto registrado, no completitud del universo de eventos; se distingue la prueba de no-pertenencia de una clave concreta (posible en un árbol Merkle ordenado/sparse) de la inclusión/consistencia de un árbol y de la completitud del universo de eventos. Sin cambio de estado.


## Rectificación final de integridad UTF-8 y SHA-256 (2026-11-07)

Esta sección es la verificación vigente de los bytes publicados en la rama. Se recuperaron íntegramente los cuatro documentos desde GitHub en UTF-8 y se calcularon los bytes UTF-8 reales y SHA-256 sobre el contenido completo, no sobre longitudes de caracteres ni fragmentos. El autocontrol de la implementación SHA-256 con el vector conocido `abc` produjo exactamente `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`.

| Archivo | Bytes UTF-8 | SHA-256 recalculado | Comparación con manifiesto |
|---|---:|---|---|
| `report-r2.md` | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | Coincide |
| `expediente-consolidado-nexo-r2.html` | 153.699 | `af343327e190a37fbc317774e4b3da77b84724ee73bff50eb6053b835b728e7b` | Coincide |
| `hashes-r2.md` | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | Ancla externa; no se autorreferencia |
| `consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | Coincide |

Los cuatro valores coinciden con el manifiesto R2 en los archivos a los que este asigna hash. El SHA-256 de `hashes-r2.md` queda registrado externamente en este cierre. El propio `closure-r2.md` no se incluye en el manifiesto ni contiene su propio hash; su huella final se registra externamente junto al commit de esta rectificación.

### Supersesión expresa de una verificación histórica

La sección anterior **“Revisión editorial adicional (2026-11-07)”**, en el bloque que comienza “Verificación final posterior a estas correcciones” y contiene tamaños de 112.505 y 152.279 bytes y hashes que comienzan `6d111749`, `d27ad56e` y `f09815f1`, queda **SUPERSEDIDA** para la integridad de los archivos actualmente publicados. Esos valores no corresponden a los bytes recuperados del HEAD comprobado. Se conservan arriba únicamente como historial de una comprobación anterior; no deben citarse como hashes vigentes ni como evidencia de integridad actual.

La tabla de integridad de § “Integridad de archivos publicados” y esta rectificación contienen los valores vigentes, recalculados sobre los bytes completos recuperados de la rama. No se modificó el manifiesto porque sus tamaños y hashes vigentes ya coinciden exactamente.

### HEAD y alcance documental comprobado

- HEAD inmediatamente anterior a esta rectificación: `459e56722ac5fdf1bc539be6fc2a60e8aec30916`.
- La comparación desde el commit de publicación inicial `96e227eb06134037fa5e01fabc8cfba4c384f476` hasta ese HEAD devuelve exactamente seis rutas modificadas, todas dentro de `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`: este cierre, el handoff R2, `consolidation-method.md`, el HTML R2, `hashes-r2.md` y `report-r2.md`.
- No aparecen cambios de código, pruebas, CI, workflows, NCS M0, P07 ni D-01 a D-12 en ese alcance comparado.
- Esta rectificación modifica únicamente este archivo de cierre documental.

### Estado que no cambia

- **Integridad de los cuatro documentos publicados y comprobados arriba:** PASS, limitado a bytes UTF-8 y SHA-256 de esos archivos.
- **Cierre sustantivo global de MUSE-AUTONOMY-002:** PARTIAL.
- **UNKNOWN:** U2, U3 y U5 permanecen UNKNOWN. U1, U4, U6, U7, U8 y U9 permanecen RESUELTOS según la evidencia ya documentada. No se altera ningún estado.
- **C14:** PARCIALMENTE CONFIRMADA.
- **D-01 a D-12:** SIN DECIDIR.
- **PDF R2 independiente:** no publicado en la rama; el HTML continúa siendo el artefacto canónico aceptado.
- No se deriva autorización de implementación, autoridad, seguridad operativa ni conformidad técnica de esta comprobación documental.


---

## Addendum de rectificación posterior — MUSE-AUTONOMY-003 (2026-11-07)

> **Naturaleza de esta sección.** Este addendum es **posterior** al cierre R2 de MUSE-AUTONOMY-002 y no forma parte de su texto original. El texto original del cierre se conserva íntegro como historial, sin conocimiento retrospectivo: nada de lo registrado aquí debe leerse como si los autores de MUSE-AUTONOMY-002 lo hubieran conocido. Las notas de rectificación visibles junto a las secciones afectadas (U2, C14, U5, U6, U7, U9) forman parte de este mismo addendum y no reescriben el texto original.

### (a) Procedencia

Los cambios registrados aquí proceden de los hallazgos adversariales de **MUSE-AUTONOMY-003** (informe adversarial, matriz de afirmaciones, registro de fuentes y handoff, 2026-11-07), posteriores a MUSE-AUTONOMY-002, y de la propuesta rectificada aprobada como plan editorial con las cuatro precisiones **A-01 a A-04**. Especificación autoritativa aplicada: *MUSE_AUTONOMY_003_R2_RECTIFICATION_PACKET_DRAFT.md* (§2 R-01–R-10, §3, §4), con el mapa de correspondencia de Fase A. Esta copia es una **copia de revisión**; los archivos canónicos R2 permanecen intactos y no se ha realizado merge ni publicación.

### (b) Cambios incorporados (resumen con anclaje)

- **R-01 / A-02 — U5, procedencia de «4–5 puntos»:** la cifra no es un diferencial HELM vs lm-eval. CRFM HELM MMLU (2024-05-01) compara HELM con puntuaciones reportadas por los creadores (25 modelos; rango −5,0 a +1,8; mediana de |Δ| = 1,2 puntos; media firmada −0,65); 4–5 es un extremo, no el típico. Hugging Face (2023): +14,9 puntos para LLaMA-65B, evidencia histórica acotada. MMLU-Pro §6.3 (Wang et al.): variaciones típicas de 4–5% y picos de hasta 10,98% por 24 estilos de prompt — sensibilidad al prompt, registrada como **INFERENCE** / hipótesis de procedencia plausible, no demostrada. Se conservan los sub-UNKNOWNs de U5. Anclaje en este cierre: notas de rectificación en ambos bloques «Revisión primaria U5».
- **R-02 — U3, inventario:** el Frente B incorporó **25 fichas nuevas (F-01–F-25)** y una ficha de reexamen (**F-26**, UCAN/ZCAP); F-26 no constituye un candidato nuevo. La unión de prioridades contiene **nueve** fichas: GNAP (F-01), RFC 8693 (F-02), KERI (F-08), did:webvh, BitstringStatusList (F-14), SPIFFE/WIMSE (F-18), eIDAS 2.0 (F-22), SCITT (F-24) y FROST. Se registra la discrepancia entre la lista de siete de §9.9 del informe MUSE-003 y la lista del handoff (que añade did:webvh y FROST) como diferencia entre entregables, no como equivalencia textual. El inventario sigue sin ser exhaustivo; U3 permanece UNKNOWN.
- **R-03 — F-E01, AAL3:** NIST SP 800-63B-4 §§2.3.2 y 3.2.13 requieren un entorno de ejecución aislado protegido por hardware para el autenticador criptográfico no exportable. Un TEE puede ser una de las tecnologías pertinentes, pero la mera presencia de un TEE en un dispositivo no demuestra que su implementación satisfaga AAL3. No se afirma que el POCO X7 Pro cumpla AAL3 sin evidencia específica del dispositivo, del autenticador y del flujo de autenticación. U1 no se reabre (RESUELTO por lectura primaria).
- **R-04 — Taxonomía de evidencia:** se retira la equivalencia «EVIDENCE = fuente primaria leída o corroborada por ≥2 resúmenes independientes». Criterio rectificado: **EVIDENCE** = fuente primaria consultada directamente en el pasaje pertinente, o cálculo/prueba reproducible con entradas y método identificables; **CORROBORATED** = apoyo secundario (la cantidad de resúmenes no sustituye una lectura primaria); **INFERENCE** / **HYPOTHESIS** / **PROPOSAL** / **UNKNOWN** según su definición; **PASS** solo con evidencia verificable y criterio de aceptación satisfecho. C09, C10, C12 y R2c quedan degradados a CORROBORATED salvo lectura verbatim; se separa la existencia de un control de la propuesta de diseño Nexo construida sobre él.
- **R-05 / A-01 / A-03 — U2 y C11:** restituida la división **U2-a** (existencia), **U2-b** (parámetros) y **U2-c** (definición de «caso»); Basilea MAR32 conservada como caso sectorial (250 observaciones/días para backtesting bancario de VaR), no como mínimo universal. Atribución corregida: Miller publicó ≈**969** preguntas con MDE **13,2%** y **7,5%** bajo sus escenarios; **3.876** (no determinista con K = 1) y **7.108** (no pareado) son cálculos derivados del Frente A. Escenarios: 969 (determinista pareado, σ² = 0 y ω² = 1/9). Anclaje en este cierre: nota de rectificación en «Revisión primaria de U2».
- **R-06 / A-04 — C14:** IR 8547 describe un **plan anunciado** («will deprecate» / «will disallow»), no una obligación «shall». Hitos separados: establecimiento de claves **2030**, firmas **2031**. «Migrar firmas antes de 2030» no es prescripción NIST; como recomendación prudencial se etiqueta PROPOSAL. Ed25519 no aparece literalmente en IR 8547 (inferencia en dos pasos con FIPS 186-5 §7). «Disallowed» = no permitido para **aplicar protección criptográfica**; no prohíbe por sí solo verificar firmas o datos protegidos previamente. El tratamiento legacy post-2035 sigue UNKNOWN; la revisión de SP 800-131A está anunciada, pendiente. Alcance federal/NIST. Anclaje en este cierre: nota de rectificación junto al Dictamen.
- **R-07 — U6/U7/U9 alineados con §7 de report-r2:** U6 RESUELTO como corrección epistemológica acotada; U7 RESUELTO en el alcance de SP 800-53 examinado, con la cuarentena como fase general de restauración en PROPOSAL; U9 RESUELTO como precisión criptográfica (Merkle: inclusión y consistencia del conjunto registrado, no completitud del universo de eventos; no-pertenencia de clave distinguida de completitud). U5 UNKNOWN. Anclaje en este cierre: notas de rectificación en «Resolución U6», «Resolución U7» y «Resolución U9».
- **R-08 — C12:** se mantiene como PROPOSAL. Su justificación presupone D-01, D-02 y D-08 todavía SIN DECIDIR y no puede utilizarse para resolverlas circularmente. El registro de rechazos es una superficie potencialmente hostil (límites, tipado, separación de funciones, protección contra manipulación; lo registrado no se convierte en instrucción ni autoridad). No se declara una arquitectura de log aprobada.
- **R-09 — §6.4:** el encabezado «Requisitos mínimos, no negociables sin sustituto documentado» pasa a «Principios arquitectónicos y salvaguardas propuestas»; cada uno de los doce ítems se etiqueta según su contenido (requisito normativo solo cuando la fuente primaria lo imponga expresamente y el ámbito coincida; principio arquitectónico; PROPOSAL). No se atribuye a NIST una prohibición general de ejecutar dentro de Core.
- **R-10 — Coherencia y cierre:** «APROBADO CONDICIONADO» califica el expediente como documentación de investigación/referencia, mientras PARTIAL es el cierre sustantivo; no son estados contradictorios. **R-10.8 (duplicación U5):** el cierre contenía dos secciones «Revisión primaria U5» casi idénticas; el segundo bloque (encabezado «HELM y lm-evaluation-harness») queda marcado como **SUPERSEDIDO / CONSOLIDADO** en el primero, con su contenido conservado íntegro como historial (ver nota editorial visible antes de ese encabezado). El texto original de las correcciones C01–C16 sigue UNKNOWN (no archivado en el expediente verificable; no se reconstruye desde resúmenes). La cadena de custodia de P7 conserva su dependencia y limitación de procedencia; esta rectificación no la resuelve.

### (c) Estados preservados

- **UNKNOWN:** U2, U3 y U5 permanecen abiertos (U2 y U3 como cuestiones generales; U5 con sus sub-UNKNOWNs conservados).
- **RESUELTOS con alcance acotado:** U1, U4, U6, U7, U8 y U9 (U6 como corrección epistemológica; U7 en el alcance de SP 800-53 examinado; U9 como precisión criptográfica). No quedan registros U1–U9 en estado PARCIAL.
- **C14:** PARCIALMENTE CONFIRMADA.
- **D-01 a D-12:** SIN DECIDIR.
- **Cierre sustantivo global:** PARTIAL.
- **Publicación e integridad documental R2** (tabla de integridad, hashes y sección de supersesión expresa de la verificación histórica): se conserva íntegra; el PASS se limita estrictamente a la publicación e integridad de los documentos enumerados.

### (d) Ausencia de autorización y de PASS nuevo

Esta rectificación **no autoriza implementación**, no produce autorización de seguridad operativa ni conformidad técnica, no modifica NCS M0 ni P07, no resuelve ninguna decisión D-01 a D-12 y **no declara ningún PASS nuevo**: el único PASS que subsiste es el de publicación e integridad documental R2 ya registrado en el cierre original. Ningún UNKNOWN se convierte en RESUELTO por esta rectificación.

### (e) Historial conservado

El texto original del cierre —incluidas la sección de supersesión expresa de la verificación histórica y sus valores, los hashes y la tabla de integridad, y las secciones de verificación primaria U1/U4/U3/U5/U6/U7/U9— se conserva íntegro. Las adiciones de esta copia son únicamente las notas de rectificación visibles junto a las secciones afectadas, la nota editorial de supersesión del bloque U5 duplicado y este addendum. Cualquier sustitución de los archivos canónicos o publicación del expediente rectificado requiere un gate posterior separado.
