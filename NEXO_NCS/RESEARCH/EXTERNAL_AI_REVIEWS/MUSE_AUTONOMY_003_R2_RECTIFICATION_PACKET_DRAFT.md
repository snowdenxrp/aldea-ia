# MUSE-AUTONOMY-003 — PAQUETE DE RECTIFICACIÓN DOCUMENTAL R2 (BORRADOR)

**Estado:** PREPARADO PARA REVISIÓN  
**Autorización utilizada:** preparar la rectificación documental en espacio separado.  
**Aplicación sobre R2 canónico:** NO REALIZADA.  
**Publicación/merge a la rama de expediente:** NO AUTORIZADOS.  
**Decisiones D-01 a D-12:** SIN DECIDIR.  
**Cierre sustantivo:** PARTIAL.

## 0. Alcance, base y regla de preservación

Este paquete convierte el plan editorial aprobado en una especificación de cambios trazable. No sustituye los archivos canónicos ni afirma que la rectificación esté aplicada.

Base recuperada de la rama `nexo-mission-02-pdf-2026-11-05`, cuyo HEAD verificado es `067e615b817c989227d25c66dbce7daf047e1c16`:

| Archivo fuente | Blob SHA recuperado |
|---|---|
| `report-r2.md` | `c7d5169e63dd0ad20731ac405633250f0fa753a4` |
| `expediente-consolidado-nexo-r2.html` | `54ee9ec35e8810809d6ca6eccdf797c055cb8a6b` |
| `closure-r2.md` | `38e3c8efe69998926066c868d1a1526845141cac` |
| `hashes-r2.md` | `b6522c3bec121949c1613d3ff80dc539edb483a5` |
| `MUSE_AUTONOMY_003_ADVERSARIAL_REPORT.md` | `49ad9b3ac0baa51d41528d868c8b7ca7ab641b78` |
| `MUSE_AUTONOMY_003_CLAIM_MATRIX.md` | `e55db6e8473197b3fddb3bbaea592b78701374d0` |
| `MUSE_AUTONOMY_003_HANDOFF.md` | `18da204b851dd536ddb6584d99f1c57ca8933f39` |

Los originales R2 se preservan como evidencia histórica. La rectificación se atribuye expresamente a MUSE-AUTONOMY-003, posterior a MUSE-AUTONOMY-002. No se reescribe R2 como si sus autores hubieran conocido los hallazgos posteriores.

## 1. Inventario exacto de cambios

| ID | Archivo(s) destino | Secciones | Operación |
|---|---|---|---|
| R-01 | report + HTML + closure | D5/U5, §7 U5, §11 E/H-07 | Corregir procedencia, magnitudes y sub-UNKNOWNs |
| R-02 | report + HTML | §7 U3, referencias de inventario | Registrar 25 fichas nuevas + F-26 reexaminada; unión de nueve prioridades |
| R-03 | report + HTML | C02 / precisión F-E01 | Aclarar aislamiento protegido por hardware; no inferir AAL3 del TEE |
| R-04 | report + HTML | §0 método; C09/C10/C12 y R2c | Corregir taxonomía epistemológica y degradar soporte secundario |
| R-05 | report + HTML + closure | C11, U2, D-07 | Restituir U2-a/b/c y atribuir correctamente cálculos de Miller |
| R-06 | report + HTML + closure | C14, U-legacy, §12 | Precisar estatus prospectivo, hitos y significado de disallowed |
| R-07 | report + HTML + closure | §7 U6/U7/U9; §11 B2/B7 | Alinear estados y acotar conclusiones Merkle/cuarentena |
| R-08 | report + HTML | C12, D-01/D-02/D-08 | Registrar circularidad y superficie hostil del log; conservar PROPOSAL |
| R-09 | report + HTML | §6.4 | Cambiar encabezado y etiquetar cada ítem por fuerza epistemológica |
| R-10 | report + HTML + closure | §1, §3, §11, §12 y cierre | Resolver inconsistencias editoriales sin borrar historial |

## 2. Texto y criterios por rectificación

### R-01 — D5/U5: procedencia de las cifras

Reemplazar la atribución general «4–5 puntos entre HELM y lm-eval» por una descripción que distinga tres resultados:

1. **CRFM HELM MMLU (2024-05-01):** compara HELM con puntuaciones reportadas por los creadores, no con lm-eval. En 25 modelos, el rango observado va de −5,0 a +1,8; la **mediana de los valores absolutos de las diferencias, mediana de |Δ| = 1,2 puntos**; la media firmada es −0,65. El valor de 4–5 es un extremo, no el diferencial típico.
2. **Hugging Face (2023):** comparación pareada histórica de implementaciones, con +14,9 puntos para LLaMA-65B. Es evidencia histórica acotada, no una estimación universal ni una comparación actual reproducida.
3. **MMLU-Pro §6.3 (Wang et al.):** 24 estilos de prompt producen variaciones típicas de 4–5% y picos de hasta 10,98%. Es sensibilidad al prompt, no diferencia entre harnesses. Registrar como **INFERENCE / hipótesis de procedencia plausible**; no está demostrado que M02 lo consultara ni que esa fuera la fuente de la cifra original.

U5 permanece UNKNOWN como cuestión general. Conservar sus sub-UNKNOWNs: documento enlazado para Claude 2.1; versión de HELM; temperatura/semilla/decoding; agregación macro/micro; historial de fuentes secundarias a 2026-11-05. No presentar la atribución refutada como si resolviera la pregunta general de comparabilidad.

### R-02 — U3: inventario y prioridades

Usar exactamente esta formulación:

> El Frente B incorporó 25 fichas nuevas (F-01–F-25) y una ficha de reexamen (F-26), dedicada a UCAN/ZCAP. F-26 no constituye un candidato nuevo.

El inventario sigue siendo no exhaustivo y U3 permanece UNKNOWN.

Registrar la inconsistencia interna entre la lista del handoff y §9.9 del informe. Para no ocultarla ni escoger una lista arbitrariamente, la unión contiene nueve fichas:

- GNAP (F-01).
- RFC 8693 (F-02).
- KERI (F-08).
- did:webvh.
- BitstringStatusList (F-14).
- SPIFFE/WIMSE (F-18).
- eIDAS 2.0 (F-22).
- SCITT (F-24).
- FROST.

La lista de siete de §9.9 es F-01, F-02, F-08, F-14, F-18, F-22 y F-24. did:webvh y FROST aparecen en el handoff. La discrepancia se registra como diferencia entre entregables, no como equivalencia textual.

No inferir que la unión de nueve agota el universo. Mantener pendientes el censo del registro DID, los borradores WIMSE/AIMS, los esquemas nacionales y el dato jurisdiccional que solo puede proporcionar el propietario.

### R-03 — F-E01: AAL3

Añadir la precisión de MUSE-003 a C02/M03 §2:

> NIST SP 800-63B-4 §§2.3.2 y 3.2.13 requieren un entorno de ejecución aislado protegido por hardware para el autenticador criptográfico no exportable. Un TEE puede ser una de las tecnologías pertinentes, pero la mera presencia de un TEE en un dispositivo no demuestra que su implementación satisfaga AAL3. No se afirma que el POCO X7 Pro cumpla AAL3 sin evidencia específica del dispositivo, del autenticador y del flujo de autenticación.

No reabrir U1: la lectura primaria de SP 800-63B-4 ya está documentada como RESUELTA. La corrección ataca la inferencia de M03 sobre software aislado; no convierte AAL3 en arquitectura de identidad o autoridad.

### R-04 — Taxonomía de evidencia

En §0, retirar la equivalencia «EVIDENCE = fuente primaria leída o corroborada por ≥2 resúmenes independientes».

Criterio rectificado:

- **EVIDENCE:** fuente primaria consultada directamente en el pasaje pertinente, o cálculo/prueba reproducible con entradas y método identificables.
- **CORROBORATED:** apoyo secundario; la cantidad de resúmenes no sustituye una lectura primaria. Fuentes que reescriben un mismo comunicado no cuentan como corroboraciones independientes.
- **INFERENCE:** conclusión derivada de hechos disponibles.
- **HYPOTHESIS:** explicación plausible no demostrada.
- **PROPOSAL:** recomendación o diseño no impuesto por la fuente normativa.
- **UNKNOWN:** cuestión no establecida con la evidencia disponible.
- **PASS:** solo con evidencia verificable y criterio de aceptación satisfecho; no se deriva de documentación narrativa.

Revisar C09, C10, C12 y R2c. Si no se leen directamente los controles SP 800-53 citados, etiquetar el soporte como CORROBORATED; separar explícitamente la existencia de un control de la propuesta de diseño Nexo que se construye sobre él. No atribuir a NIST la cuarentena de restauración, una frontera Core/ejecución concreta ni una lista específica de controles de cola como si fueran prescripciones literales.

### R-05 — U2/C11: subregistros y estadística

Restituir la división:

- **U2-a — Existencia:** existencia de normas primarias que prescriban tamaños muestrales en ámbitos acotados y alcance de la búsqueda. No confundir la ausencia de un N universal para agentes con ausencia de N en todos los sectores.
- **U2-b — Parámetros:** validez de parámetros estadísticos, supuestos, emparejamiento, varianza y potencia aplicables a D-07.
- **U2-c — Definición de «caso»:** unidad de análisis, independencia/dependencia, clustering y correspondencia con una ejecución K.

U2 global permanece UNKNOWN. Resolver un subregistro no resuelve U2 global ni autoriza una decisión D-07.

Conservar Basilea MAR32 como caso sectorial: 250 observaciones/días para backtesting bancario de VaR, no un mínimo universal para agentes.

Corregir la atribución a Miller:

> Miller publicó el resultado de aproximadamente 969 preguntas, junto con los resultados de MDE 13,2% y 7,5% bajo sus escenarios. El Frente A calculó adicionalmente 3.876 y 7.108 mediante la misma fórmula; son cálculos derivados del Frente A, no cifras publicadas por Miller.

Registrar los tres escenarios con sus supuestos:

- 969: determinista pareado, σ² = 0 y ω² = 1/9.
- 3.876: no determinista con K = 1.
- 7.108: no pareado.

La reproducción del cálculo y la procedencia de cada cifra deben permanecer diferenciadas. No elevar ninguna a regla universal. Incorporar MDE, potencia, α, K, σ², ω² y correlación entre casos donde corresponda. Miller no convierte el CLT/SEM en bootstrap universal; el bootstrap se reserva para diseños o estimadores complejos.

### R-06 — C14: plan anunciado y alcance de disallowed

En C14 y en el registro de fuentes:

- IR 8547 usa formulaciones prospectivas «will deprecate» y «will disallow»: describen un plan anunciado, no una obligación redactada como «shall».
- Separar el hito federal de establecimiento de claves en 2030 del hito de firmas en 2031.
- No describir «migrar firmas antes de 2030» como prescripción NIST; si se conserva como recomendación prudencial, etiquetarla PROPOSAL.
- Ed25519 no aparece literalmente en IR 8547. Su asociación con EdDSA ≥128 bits requiere la inferencia en dos pasos junto con FIPS 186-5 §7.
- «Disallowed» se refiere a que el algoritmo deja de estar permitido para **aplicar protección criptográfica**; no significa, por sí solo, que esté prohibido verificar firmas o datos protegidos previamente.
- La revisión de SP 800-131A está anunciada, pero aún no publicada ni incorporada como calendario final.
- Mantener el alcance federal/NIST; no universalizarlo.

C14 permanece PARCIALMENTE CONFIRMADA. El tratamiento legacy post-2035 sigue UNKNOWN.

### R-07 — U6/U7/U9 y contradicciones de §11

Alinear los textos contradictorios con los estados de §7 y el cierre:

- U6: RESUELTO como corrección epistemológica acotada; no prueba universal física.
- U7: RESUELTO en el alcance de NIST SP 800-53 examinado; cuarentena como fase general de restauración sigue siendo PROPOSAL.
- U9: RESUELTO como precisión criptográfica; Merkle demuestra inclusión y consistencia del conjunto registrado, no completitud del universo de eventos.
- U5: UNKNOWN.

En particular:
- §11 B2 no puede decir que U9 «conserva la ambigüedad residual como UNKNOWN».
- §11 B7 no puede decir que U5 y U6 siguen UNKNOWN; U5 permanece UNKNOWN y U6 está RESUELTO con alcance acotado.
- En U9, distinguir prueba de no-pertenencia de clave, inclusión/consistencia de un árbol y completitud del universo de eventos.

### R-08 — C12: circularidad y log hostil

Mantener C12 como PROPOSAL. Añadir que su justificación presupone decisiones D-01, D-02 y D-08 todavía SIN DECIDIR; por tanto no puede utilizarse para resolver esas decisiones circularmente.

El registro de rechazos es una superficie potencialmente hostil. Si se conserva como propuesta, debe explicitar límites, tipado, separación de funciones, protección contra manipulación y el hecho de que el contenido registrado no se convierte en instrucción ni autoridad. No declarar una arquitectura de log aprobada.

### R-09 — §6.4: requisitos, principios y propuestas

Cambiar el encabezado:

> Requisitos mínimos, no negociables sin sustituto documentado

por:

> Principios arquitectónicos y salvaguardas propuestas

Etiquetar cada uno de los doce ítems según su contenido:
- requisito normativo solo cuando la fuente primaria lo imponga expresamente y el ámbito coincida;
- principio arquitectónico cuando sea criterio del proyecto;
- PROPOSAL cuando sea mecanismo recomendado.

No etiquetar toda la lista como EVIDENCE ni atribuir a NIST una prohibición general de ejecutar dentro de Core. Preservar las salvaguardas como propuestas sin convertirlas en decisiones D-01–D-12.

### R-10 — coherencia, cierre y referencias

1. **§1:** explicar que «APROBADO CONDICIONADO» califica el expediente como documentación de investigación/referencia, mientras que PARTIAL es el cierre sustantivo. No son estados contradictorios.
2. **C02 / §11 A:** alinear la precisión AAL3 y retirar salvedades de verificación que ya quedaron cerradas por lectura primaria; conservar la precisión F-E01 de MUSE-003.
3. **§11 B2/B7:** aplicar R-07.
4. **§11 D/E:** actualizar el texto heredado que contradiga verificaciones posteriores y distinguir el registro histórico de su estado actual.
5. **§11 C4 y §12 A2A:** fijar la referencia a A2A v1.0.1 y conservar explícita la discrepancia del frontmatter que aún declara 1.0.0. No presentar §8.4 como lectura primaria si no se leyó verbatim.
6. **§3 C11 y §7 U2:** aplicar R-05 y A-01.
7. **§3 C14 y §12:** aplicar R-06.
8. **Closure R2:** registrar la rectificación posterior como addendum MUSE-003. La duplicación de U5 debe resolverse editorialmente sin borrar la trazabilidad: identificar el bloque duplicado como supersedido y conservar su contenido como historial, o documentar de forma explícita qué bloque se consolida y por qué. No eliminar evidencia histórica silenciosamente.
9. **Texto original C01–C16:** continúa UNKNOWN si el original no está archivado en el expediente verificable. No reconstruirlo desde resúmenes.
10. **P7:** conservar la dependencia y limitación de procedencia; no afirmar que la rectificación resuelve su cadena de custodia.
11. No tocar NCS M0, P07, código, tests, CI, workflows ni decisiones D-01–D-12.

## 3. Sincronización por archivo

### `report-r2.md` — copia de revisión

Aplicar R-01 a R-10 en los apartados indicados. Añadir un registro visible de rectificación posterior que identifique MUSE-AUTONOMY-003 como fuente y fecha de los cambios. Conservar el texto de R2 como historial, sin atribuirle conocimiento retrospectivo.

### `expediente-consolidado-nexo-r2.html` — copia de revisión

Sincronizar todas las modificaciones semánticas con el Markdown. Mantener estructura, navegación, tablas y referencias internas. No declarar coherencia HTML/Markdown hasta comparar los apartados afectados y comprobar enlaces/anclas.

### `closure-r2.md` — addendum de revisión

Añadir una sección de rectificación posterior que registre los cambios, su procedencia, los estados preservados y la ausencia de autorización de implementación. No reescribir el cierre R2 original ni convertir hallazgos MUSE-003 en hechos conocidos durante MUSE-002.

### `hashes-r2.md` — no actualizar todavía

El manifiesto solo se recalcula cuando las copias rectificadas estén cerradas y sus bytes finales hayan sido generados. No copiar hashes anteriores, no inventar tamaños y no calcular hashes sobre fragmentos. La autorreferencia del manifiesto seguirá registrándose externamente.

## 4. Verificación de aceptación

- [ ] Cada corrección R-01–R-10 trazada a §9 del informe MUSE-003.
- [ ] A-01: U2-a/b/c presentes y separados; U2 global sigue UNKNOWN.
- [ ] A-02: mediana absoluta |Δ| = 1,2 y media firmada −0,65 separadas.
- [ ] A-03: 969/13,2%/7,5% atribuidos a Miller; 3.876/7.108 atribuidos al cálculo derivado del Frente A.
- [ ] A-04: «disallowed» acotado a aplicar protección criptográfica.
- [ ] U3: 25 fichas nuevas + F-26 reexaminada; nueve prioridades y discrepancia entre listas documentadas.
- [ ] U5: MMLU-Pro §6.3 clasificado como INFERENCE; no se atribuye como procedencia demostrada.
- [ ] AAL3: hardware-protected isolated execution; TEE no equivale a conformidad demostrada.
- [ ] EVIDENCE no se concede por repetición de resúmenes secundarios.
- [ ] C14: plan anunciado, hitos 2030/2031, legacy UNKNOWN y SP 800-131A pendiente.
- [ ] U6/U7/U9 coherentes entre §7, §11 y closure.
- [ ] C12 permanece PROPOSAL y no resuelve circularmente D-01/D-02/D-08.
- [ ] §6.4 distingue norma, principio y propuesta.
- [ ] APROBADO CONDICIONADO y PARTIAL quedan mapeados sin contradicción.
- [ ] Markdown y HTML coherentes.
- [ ] Closure conserva historial y registra el addendum posterior.
- [ ] Manifiesto recalculado sobre bytes finales solo después de cerrar los documentos.
- [ ] D-01 a D-12 siguen SIN DECIDIR; no se declara PASS sustantivo.
- [ ] NCS M0 y P07 no han sido modificados.

## 5. Estado de este paquete

Este archivo es una especificación de preparación, no la aplicación de la rectificación. Los cuatro archivos canónicos R2 permanecen sin modificar en la rama base. No se ha hecho merge, no se ha actualizado el manifiesto R2 y no se ha autorizado implementación ni publicación del expediente rectificado.

**Resultado esperado de la siguiente fase:** generar copias rectificadas completas para revisión final; someterlas a comparación semántica Markdown/HTML; presentar diferencias y hashes de esas copias. Cualquier sustitución de los archivos canónicos o publicación del expediente requiere un gate posterior separado.
