# MISIÓN MUSE-AUTONOMY-004-F — PASADA 4: REVISIÓN ADVERSARIAL DE LA CORRECCIÓN F2

**Misión:** MUSE-AUTONOMY-004-F — cierre adversarial de los seis defectos mayores de la rectificación R2.
**Pasada:** 4 — Ataque adversarial a la corrección de la Pasada 2.
**Fecha:** 2026-11-08.
**Rol:** revisor HOSTIL. El trabajo de la Pasada 2 se trata como hipótesis a falsar, no como resultado a confirmar.
**Material revisado (solo lectura; ningún archivo existente fue modificado):**
- Copias corregidas F2 en `review-f/`: `report-r2-rectified-review-f2.md`, `closure-r2-rectified-review-f2.md`, `expediente-consolidado-nexo-r2-rectified-review-f2.html`, `consolidation-method-rectified-review-f2.md`, `hashes-r2-rectification-review-f2.md`.
- `MUSE_004_F_CORRECTION_REPORT.md` (afirmaciones de la Pasada 2), `MUSE_004_F_DIAGNOSTIC_MATRIX.md` (Pasada 1), `MUSE_004_F_D01_SOURCE_EVIDENCE.md`.
- Originales de referencia en `branch/` y paquete aprobado `../nexo-autonomy-004/branch/MUSE_AUTONOMY_003_R2_RECTIFICATION_PACKET_DRAFT.md`.
- Verificación externa propia: especificación A2A `latest` consultada en vivo el 2026-11-08 (mismo crawl 07:06 UTC que la evidencia D-01).

**Método del ataque:** diffs completos f2 contra originales (`diff -u`, recuentos de líneas añadidas/eliminadas verificados); greps exhaustivos de las fórmulas retiradas, de `heredado`/`index`, de `vault`/`HSM`, de `trust_remote_code`, de `agent.json`, de `Fase A`; enumeración fila por fila de las 13 filas §12; auditoría de cada etiqueta EVIDENCE restante en §3/§6.1; comparación normalizada MD↔HTML de los 22 pasajes corregidos; parseo estructural del HTML f2 (balance de etiquetas, anclas, IDs, bloque `<script>`); recálculo `sha256sum` de los 18 archivos pertinentes; comprobación en vivo de los punteros A2A §3.3/§4.3/§4.5/§4.6/§5.1/§5.3 en `latest`.

**Criterio de severidad aplicado:** CRÍTICO = falsedad sustantiva sobre el mundo, cambio de estado/veredicto no autorizado, o rotura de integridad. MAYOR = la corrección no cierra la clase de defecto que declara cerrada, o induce a error a un verificador que siga el método del propio dossier (grep, lectura de etiquetas). MENOR = precisión, redacción o conteo sin efecto sobre estados, veredictos ni integridad.

**Resultado global: 0 CRÍTICO, 3 MAYOR, 9 MENOR — 12 defectos en total.**

**Veredicto global: la corrección F2 NO sobrevive intacta al ataque.** Sobrevive en lo sustantivo — ningún estado cambia, ningún veredicto C01–C16 cambia, la integridad está intacta y el HTML no se rompió — pero tres defectos MAYOR (A-01, A-02, A-03) falsan las afirmaciones de cierre de la Pasada 2 («No queda nada parcial en M-04», «No queda nada parcial en D-01 salvo la limitación registrada», y la exactitud verificable del Addendum F del cierre). Exigen una pasada de remediación antes de que M-01–M-04/D-01 puedan darse por cerrados. D-02 sigue PARCIAL por diseño, pendiente de gate, como estaba previsto.

**Estados vigentes que NO cambian por esta pasada:** U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL. No se declara PASS. No se modificó ningún archivo existente; el único archivo escrito es este informe.

---

## 1. Veredicto por defecto

| Defecto | Veredicto del ataque | Fundamento breve |
|---|---|---|
| M-01 (§6.4 ítem 2) | **RESISTE** | Etiqueta mixta eliminada (0 ocurrencias en informe y HTML); cláusula vault/HSM como PROPOSAL en ambos formatos; ninguna salvaguarda debilitada; cláusulas (a)/(b) con respaldo normativo verificado en C02. |
| M-02 (taxonomía `heredado`/`index`) | **RESISTE EN LO SUSTANCIAL** | Definición de procedencia aplicada coherentemente; las 13 filas §12 reclasificadas y enumeradas (5 CORROBORATED + 8 Procedencia, sin resto); 0 celdas con nivel `Heredado`/`Index`. Residuos MENORES: B-03, B-04, B-05. |
| M-03 (atribución falsa a Fase A) | **RESISTE** | Atribución corregida en informe y HTML; la cadena exacta «decisión de Fase A (INC-01)» tiene 0 ocurrencias; no se inventa ninguna decisión del propietario. Residuo MENOR: B-08 (paréntesis ambiguo). |
| M-04 (fila HF `trust_remote_code`) | **NO RESISTE DEL TODO — PARCIAL** | La celda §12 queda corregida, pero la misma clase de defecto sobrevive en tres pasajes (A-03), la etiqueta histórica contradictoria sigue como texto vivo (B-01) y la nueva redacción conserva un plural no verificado (B-02). La afirmación «No queda nada parcial en M-04» queda falsada. |
| D-01 (§6.1 R7, `agent.json`) | **RESISTE EN EL NÚCLEO — PARCIAL en la dependencia** | El re-anclaje es exacto (v0.2.6 §5.3, commit 0858ddb, 0.3.0 2025-07-30, `dev`/`latest` con 0 `agent.json` — todo re-verificado en vivo, §3.8); la afirmación refutada queda registrada como refutada. Pero la dependencia C05 queda registrada de forma incompleta (A-02): los punteros §4.3 y §4.5, también desplazados, no aparecen en ninguna de las tres notas, y C01 §4.6 no tiene nota. |
| D-02 (`consolidation-method.md`) | **PARCIAL POR DISEÑO — la alternativa B resiste; el Addendum F no del todo** | La alternativa B está preparada correctamente y sus estados se verifican contra informe/cierre; el canónico sigue intacto; la decisión de gate sigue pendiente como estaba previsto. Pero el Addendum F del cierre contiene afirmaciones literalmente falsas sobre el propio archivo (A-01, en su parte D-02/M-01/M-04/D-01) y dos precisiones omitidas (B-06, B-07). |

---

## 2. Defectos encontrados

### 2.1 MAYOR

#### A-01 — El Addendum F del cierre afirma ausencias que el propio archivo f2 refuta (4 instancias en un solo defecto)

**Ubicación:** `review-f/closure-r2-rectified-review-f2.md`, L283, L284, L286, L287.

**Citas textuales (archivo f2, no original):**

- L283: «- **M-01 — sin presencia textual en el cierre.** Verificado: 0 ocurrencias de «vault»/«HSM» en todo el cierre.»
- L284: «Ninguna etiqueta EVIDENCE de este cierre descansa en «index» o «heredado» (la única «heredado» del cierre es «metadatos heredados», en sentido descriptivo, no como respaldo de evidencia).»
- L286: «- **M-04 — sin presencia textual en el cierre.** Verificado: 0 ocurrencias de «trust_remote_code» en todo el cierre.»
- L287: «- **D-01 — sin presencia textual en el cierre.** Verificado: 0 ocurrencias de «agent.json» en todo el cierre.»

**Evidencia de la falsedad (recuentos sobre el archivo f2, no sobre el original):**

- `vault`: 1 ocurrencia en `closure-r2-rectified-review-f2.md`, en la propia L283. `HSM`: 1 ocurrencia, en la propia L283.
- `trust_remote_code`: 1 ocurrencia, en la propia L286.
- `agent.json`: 1 ocurrencia, en la propia L287.
- `heredado`: 4 ocurrencias en el archivo f2 — L57 («metadatos heredados», la única del texto anterior) y 3 en la propia L284 («descansa en «index» o «heredado»», «la única «heredado» del cierre», ««metadatos heredados»»). La afirmación de unicidad es falsa dentro de su propia frase.
- Control: en el cierre original `branch/Cierre-rectificado.md` los recuentos son 0/0/0/0 y `heredado` 1 (L55, «metadatos heredados»). Las afirmaciones eran verdaderas del texto anterior y dejaron de serlo al añadir el Addendum F que las enuncia.

**Por qué es MAYOR:** el cierre es el registro de integridad del dossier y su método de verificación es el recuento exacto (grep). Un verificador futuro que aplique ese método al archivo f2 obtiene 1, no 0, y debe concluir —erróneamente— que el cierre sí contiene `vault`/`HSM`/`trust_remote_code`/`agent.json`, o que la afirmación de unicidad de «heredado» es falsa. La lectura pretendida («en el texto anterior a este addendum») no está escrita en ninguna de las cuatro frases. La corrección es trivial —añadir «en el texto anterior a este addendum»— y su ausencia deja cuatro afirmaciones verificables falsas en el documento que certifica la integridad. No cambia ningún estado ni veredicto, pero invalida la exactitud verificable del Addendum F, que es precisamente lo que la Pasada 2 añadió al cierre. (La viñeta M-03, L285, no tiene este problema: no afirma un recuento, y es verdadera.)

#### A-02 — D-01: la dependencia C05 queda registrada de forma incompleta; punteros §4.3, §4.5 y C01 §4.6 siguen presentándose como vigentes

**Ubicaciones:**

- `review-f/report-r2-rectified-review-f2.md`, L130 (nota de dependencia en §3 C05), L290 (nota en §6.1 R1(a)), L548 (nota en fila §12 A2A), L98 (C01, sin nota), L293 (fila §6.1 R4).
- `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L342 (C05), L637 (R1(a)), L1266 (fila §12 A2A), L302 (C01), L652 (R4).

**Citas textuales (informe f2):**

- L130 (C05): «[Rectificación MUSE-004-F (D-01, dependencia): los punteros §3.3/§4.6/§5.1 corresponden a la página `dev` leída el 2026-11-05 (numeración de la era 0.2.x/0.3.x) y ya no resuelven al mismo contenido en el canal `dev`/`latest` actual (consultado 2026-11-08): §3.3 es hoy «Operation Semantics», §4.6 «Extensions» y §5.1 «Functional Equivalence Requirements». […] el contenido de autorización «implementation-specific» está hoy en §7.5, la adquisición de credenciales fuera de banda en §7.3 y la Agent Card en §8.1–§8.2.»
- L290 (R1(a)): «[Rectificación MUSE-004-F (D-01, dependencia): los punteros §5.1/§4.6/§3.3 son los de la página `dev` leída en M03-B y están desplazados en el canal `dev`/`latest` actual (ver nota en §3 C05); la sustancia no se re-verifica aquí.]»
- L548 (fila §12 A2A): «[Rectificación MUSE-004-F (D-01): la URL `pr-849` y los punteros §3.3/§4.6/§5.1/§5.3 corresponden a la lectura 2026-11-05; […]»
- L98 (C01, sin nota alguna): «A2A §4.6 — la autorización es "implementation-specific".» (bajo encabezado «Evidencia primaria (EVIDENCE)»).
- L293 (R4, sin nota): «La spec prevé autenticación secundaria en tarea (§4.5, verificado en vivo) y push notifications a webhooks del cliente; […]»

**Evidencia (verificación en vivo propia, spec `latest`, crawl 2026-11-08 07:06 UTC — el mismo que la evidencia D-01):**

- §4.3 hoy es «Push Notification Objects» (L1415 del crawl); §4.5 hoy es «Security Objects» (L1667); §4.6 hoy es «Extensions» (L1826). Ninguno es el contenido que C05/R1/R4/C01 les atribuyen.
- El contenido «adquisición de credenciales fuera de banda» (viejo §4.3, citado en el cuerpo de C05 L130: «§4.3: la adquisición de credenciales es "out-of-band"») está hoy en §7.3 «Client Authentication Process» (L3255: «2. **Credential Acquisition (Out-of-Band):** […]»).
- El contenido «implementation-specific» (viejo §4.6) está hoy en §7.5 (L3272). La autorización en tarea (viejo §4.5, R4 L293) está hoy en §7.6 «In-Task Authorization» (L3283). La cita de §3.3 tiene cero ocurrencias en `latest` (búsqueda de texto completo, confirmada).
- §1 sigue siendo §1 («Introduction», L16) y §5.3/§8.2/§8.4 son como dice la Pasada 2: correctamente omitidos o incluidos.

**Por qué es MAYOR:** la propia nota de C05 reubica el contenido de §4.3 en §7.3 sin nombrar §4.3 como puntero desplazado; las tres notas enumeran los punteros desplazados como si la lista fuera exhaustiva (§3.3/§4.6/§5.1, y §5.3 en la fila §12), pero omiten §4.3 en las tres y §4.5 en la fila §12 —pese a que §4.3 y §4.5 figuran en la lista de secciones de la propia fila §12 («§1, §3.3, §4.3, §4.5, §4.6, §5.1, §5.3», L548)—. Un lector que aplique la nota concluye que §4.3 y §4.5 siguen resolviendo; es falso. Además C01 §4.6 (L98) y R4 §4.5 (L293) quedan sin ninguna anotación de dependencia, bajo etiquetas EVIDENCE / «verificado en vivo» sin fecha. Es el mismo tipo de defecto que D-01 venía a cerrar (puntero a canal móvil presentado como vigente), reproducido en los pasajes que la corrección tocó de refilón. La afirmación del informe de corrección §2.5 «No queda nada parcial en D-01 salvo la limitación registrada» queda falsada: la limitación registrada (fecha de transición del canal `dev`) no es la única parcialidad; la enumeración de punteros desplazados es incompleta. La sustancia de C05/R1 no se cuestiona (la nota lo dice y es correcto no re-verificarla aquí); lo que falla es el registro de la dependencia, que es exactamente el entregable de ND-F2.

#### A-03 — M-04: «resúmenes independientes» sobrevive en C09, C12 y §10, contradiciendo la propia nota de limitación de §12

**Ubicaciones:**

- `review-f/report-r2-rectified-review-f2.md`, L162 (§3 C09), L186 (§3 C12), L516 (§10, ítem 9).
- `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L382 (C09), L412 (C12), L1087 (§10, ítem 9).

**Citas textuales (informe f2):**

- L162 (C09): «existencia y texto apoyados en resúmenes independientes que citan la primaria (corroborado 2026-11-05); los controles no se leyeron verbatim en la primaria en este expediente, por lo que el soporte es CORROBORATED, no EVIDENCE.»
- L186 (C12): «NIST SP 800-53 Rev. 5 (existencia de los controles apoyada en resúmenes independientes que citan la primaria, 2026-11-05; los controles no se leyeron verbatim en la primaria en este expediente, por lo que el soporte es CORROBORATED, no EVIDENCE)».
- L516 (§10, ítem 9): «**NIST SP 800-53 (SC-3, AC-3/5/6, SC-5/8/23, SI-10, CP-9/10):** existencia y texto corroborados por resúmenes independientes que citan la primaria; […]»

**Contradicción interna (informe f2, L576, nota de limitación del mismo §12, no tocada por la Pasada 2):** «los resúmenes de corroboración citados en §3 (C09, C12, R2c) no se nombran en este expediente; su independencia no es comprobable desde aquí.»

**Por qué es MAYOR:** el dossier afirma en tres pasajes que los resúmenes son «independientes» y declara en su propia nota que esa independencia «no es comprobable desde aquí» y que los resúmenes «no se nombran» —nombra expresamente a C09 y C12—. Es la misma estructura lógica que M-04: afirmar lo que la nota declara incomprobable. La Pasada 2 retiró la cuantificación «≥2» de la fila HF pero dejó intacto el adjetivo «independientes» en los pasajes hermanos, que la matriz §5 fila 3 ya señalaba como cubiertos por la nota de limitación. R2c, en cambio, está limpio («apoyada en resúmenes que la citan», sin «independientes») y demuestra que la redacción correcta ya existía como modelo. La fórmula literal «≥2 fuentes independientes» sí desapareció (ver §3.7); lo que sobrevive es su mitad sustantiva —la independencia no verificada de resúmenes no nombrados— en 3 pasajes × 2 formatos. La afirmación «No queda nada parcial en M-04» (informe de corrección §2.4) queda falsada.

### 2.2 MENOR

#### B-01 — B14: «EVIDENCE corroborado» sigue como texto vivo; solo una anotación lo neutraliza

**Ubicación:** `review-f/report-r2-rectified-review-f2.md`, L484; `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L1060.

**Cita (informe f2, L484):** «(c) `trust_remote_code=True` ejecuta código del repositorio — EVIDENCE corroborado [Rectificación MUSE-004-F (M-04, m-07): etiqueta histórica de R1, conservada como historial; la etiqueta vigente es CORROBORATED (§6.1 R2c)];»

**Por qué es MENOR (no MAYOR):** la decisión de anotar sin reescribir es explícita y razonada (informe de corrección §7, decisión 3: B14 es historial fechado de R1) y la anotación es correcta. Pero el dossier contiene ahora, como texto operativo y no tachado ni entrecomillado como cita, una etiqueta («EVIDENCE corroborado») que su propio §0 y su propia M-04 declaran no vigente, y la única protección contra la mala lectura es la anotación que la sigue en la misma frase. Un lector que extraiga etiquetas por búsqueda encuentra 2 ocurrencias de «EVIDENCE corroborado» en el informe (L40, cita en el registro F, y L484, esta). Es el mismo patrón que M-02 venía a eliminar (etiqueta contradictoria con la taxonomía), conservado por diseño. Debilita, no invalida, M-04.

#### B-02 — La nueva redacción HF conserva un plural no verificado: «resúmenes que citan la primaria, no nombrados»

**Ubicación:** `review-f/report-r2-rectified-review-f2.md`, L553; `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L1306.

**Cita (informe f2, L553):** «Corroborado (resúmenes que citan la primaria, no nombrados; página primaria no leída línea a línea en este run) [Rectificación MUSE-004-F (M-04): retirada la fórmula «≥2 fuentes independientes», retirada por R-04 en §0; los resúmenes no se nombran y su independencia no es comprobable desde aquí (nota de limitación del mismo §12). […]»

**Por qué es MENOR:** la nueva redacción es honesta sobre lo que no se sabe («no nombrados», «su independencia no es comprobable») y coherente con el modelo R2c y con la fila SP 800-53. Pero el plural «resúmenes» sigue afirmando multiplicidad y citación de la primaria sin nombrar ni contar ningún resumen: la propia afirmación de que existen (varios) resúmenes que citan la primaria no es comprobable desde el dossier. Es la versión reducida del defecto retirado, no su eliminación completa. Mitigado por la divulgación explícita; por eso MENOR y no MAYOR. (Véase también A-03: en C09/C12/§10 el mismo plural va además calificado de «independientes».)

#### B-03 — C16: CORROBORATED descansa en una verificación de origen que F-E20b dice no tener trazabilidad por cifra

**Ubicación:** `review-f/report-r2-rectified-review-f2.md`, L220; `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L454.

**Cita (informe f2, L220):** «**Evidencia (CORROBORATED para los límites materiales concretos; HYPOTHESIS/UNKNOWN para la imposibilidad universal):** lo verificado (heredado M03; CORROBORATED — cifras sin trazabilidad por cifra en este expediente, ver F-E20b): ASML único proveedor EUV, >100k componentes, 13,5 nm, 80+ pasos de litografía / 80–120 ciclos de patterning, cadena de ~30 años, capacidad de Zeiss como cuello de botella.»

**Por qué es MENOR:** la nueva definición §0 (L60) glosa CORROBORATED para lo heredado como «soporte comprobado en la fase de origen, no re-verificado aquí». Para C16, la propia nota admite que M03 §5 declara las cifras «Verificado» sin atar cada cifra a su fuente (F-E20b): la comprobación por cifra en la fase de origen es exactamente lo que falta. CORROBORATED es la etiqueta menos mala disponible (degradar a HYPOTHESIS borraría que las cifras son, en sustancia, correctas y ampliamente documentadas fuera del expediente) y la limitación está divulgada en la propia línea; por eso MENOR. Pero la tensión definitoria es real: bajo la definición nueva, «soporte comprobado en la fase de origen» es una afirmación más fuerte que lo que F-E20b permite decir de estas cifras.

#### B-04 — C14: la partición por componente no nombra la inferencia FIPS 186-5 §7 (inclusión de Ed25519)

**Ubicación:** `review-f/report-r2-rectified-review-f2.md`, L202; `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L432.

**Cita (informe f2, L202, encabezado):** «**Evidencia primaria (EVIDENCE para IR 8547, texto final leído íntegramente por el Frente D de MUSE-003, 2.204 líneas; CORROBORATED para FIPS 203/204/205, heredado M03):**»

**Por qué es MENOR:** el cuerpo del mismo pasaje divulga la inferencia (««Ed25519» no aparece literalmente en IR 8547 (cero ocurrencias); su inclusión entre los algoritmos afectados […] requiere una inferencia en dos pasos junto con FIPS 186-5 §7, no una mención literal»), y el Frente D (`../nexo-autonomy-003/fronts/D/report.md`, L27, L115, L244) clasificó esa inclusión como CORROBORATED / INFERENCE, no EVIDENCE verbatim. La partición del encabezado cubre IR 8547 y FIPS 203/204/205, pero no el tercer componente (FIPS 186-5 §7), que es el que sostiene la inclusión de Ed25519. Un lector que lea solo el encabezado puede atribuir a EVIDENCE-para-IR-8547 una conclusión que es, por el propio texto, inferencia en dos pasos. Mitigado por la divulgación en el cuerpo; por eso MENOR.

#### B-05 — Divergencia definitoria entre §0 y §12: §12 omite la vía del «cálculo reproducible»

**Ubicaciones:** `review-f/report-r2-rectified-review-f2.md`, L60 (§0) frente a L525 (§12); `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L270 frente a L1095.

**Citas:**

- L60 (§0): «Una afirmación heredada conserva EVIDENCE solo si su fuente primaria fue consultada directamente en el pasaje pertinente en este expediente **o su cálculo es reproducible**; en caso contrario su nivel es CORROBORATED […] o inferior según el caso.»
- L525 (§12): «Una fila con procedencia index/heredado no sostiene por sí sola una etiqueta EVIDENCE; su nivel es CORROBORATED **salvo lectura primaria directa en este expediente**.» (Sin vía de cálculo.)

**Por qué es MENOR:** las dos formulaciones de la misma regla difieren —§12 es más estricta que §0—. No tiene efecto operativo en este dossier: ningún caso descansa EVIDENCE solo en cálculo reproducible con procedencia heredado/index (C11, el único caso de cálculo, se apoya además en lectura directa del PDF de Miller, L178, y sus filas §12 incluyen lectura directa del PDF HELM de 162 páginas). Pero un futuro aplicador de la regla encuentra dos versiones distintas en el mismo documento. La nota de método f2 (L54) sigue la versión de §0, con la vía de cálculo.

#### B-06 — Addendum F §(c): U2 sin su subdivisión U2-a/b/c (precisión A-01 perdida en el resumen del cierre)

**Ubicación:** `review-f/closure-r2-rectified-review-f2.md`, L292.

**Cita:** «- **UNKNOWN:** U2, U3 y U5 permanecen abiertos (U2 y U3 como cuestiones generales; U5 con sus sub-UNKNOWNs conservados).»

**Por qué es MENOR:** la subdivisión U2-a/b/c (restituida por A-01) se conserva en el informe f2 (L44: «U2 (U2-a/b/c)», L22, L373), en el propio cierre f2 (L113, L246) y en la nota de método f2 (L60). Pero el resumen de estados preservados del Addendum F —el lugar que un lector del cierre consulta para saber qué sigue abierto— describe U2 como «cuestión general», sin la subdivisión, mientras sí conserva los «sub-UNKNOWNs» de U5. Pérdida de precisión en el registro de cierre; ningún estado cambia.

#### B-07 — Addendum F §(b) D-02: las tres lecturas verbatim se dan por cerradas sin la salvedad vigente de §8.4

**Ubicación:** `review-f/closure-r2-rectified-review-f2.md`, L288.

**Cita:** «[…] y lecturas verbatim pendientes (SP 800-63B-4, PDF final de IR 8547, spec A2A §8.4) que ya se cerraron el 2026-11-07.»

**Por qué es MENOR:** la salvedad vigente —§8.4 (MAY/SHOULD) se confirmó solo en la spec `latest` por el Frente E (F-E15), no verificada contra el tag v1.0.1 ni archivada con instantánea— se conserva en la nota de método f2 (L~66-67: «esta última no verificada contra el tag v1.0.1 ni archivada con instantánea, por lo que no se presenta como lectura primaria del tag») y en la fila §12 A2A del informe f2 (L548). El Addendum F la omite y presenta el cierre de las tres lecturas sin matiz. Sobrestimación por omisión en el registro de cierre; ningún estado cambia (U1/U4/U6/U7/U8/U9 siguen RESUELTOS como dice el Addendum).

#### B-08 — M-03: el paréntesis «(Fase A, INC-01)» tras «decisión del gate» sigue siendo ambiguo

**Ubicaciones:** `review-f/report-r2-rectified-review-f2.md`, L31; `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html`, L200.

**Cita (informe f2, L31):** «[…] queda fuera de alcance en esta copia por no estar listado como destino en el paquete; su tratamiento queda pendiente de decisión del gate (Fase A, INC-01). [Rectificación MUSE-004-F (M-03): Fase A documentó el problema (INC-01) y difirió la decisión a «Fase B / gate»; el gate no ha decidido; no existe decisión de Fase A de excluirlo.]»

**Por qué es MENOR:** INC-01 es la entrada diagnóstica de Fase A, no un identificador de una decisión del gate; el paréntesis tras «decisión del gate» puede leerse como si la decisión del gate fuera «Fase A, INC-01». La corchete de rectificación que sigue lo desambigua por completo, y la viñeta M-03 del registro F (L39) lo formula sin ambigüedad («Fase A (INC-01) difirió la decisión […] a «Fase B / gate»; el gate no ha decidido»). Residuo de redacción, no de fondo: la atribución falsa está corregida.

#### B-09 — El informe de corrección (y el manifiesto f2) cifran el registro F en «15 líneas»; son 12

**Ubicaciones:** `MUSE_004_F_CORRECTION_REPORT.md`, §4 («Diff rectificado → f2 (informe): 31 líneas eliminadas / 44 líneas añadidas (incluye el registro de rectificación F, 15 líneas)») y `review-f/hashes-r2-rectification-review-f2.md`, sección «Verificación» (misma frase).

**Evidencia:** el registro F en el informe f2 ocupa las líneas 33–44 (12 líneas: encabezado, párrafo de fuente, 6 viñetas, párrafo de estados); 13 con el blanco precedente (L32); 14 incluyendo la línea de alcance reescrita (L31) en el mismo hunk de diff. El primer hunk del diff añade 14 líneas y elimina 1. Ningún conteo da 15. (Los totales 31/44 del diff sí son exactos; ver §4.)

**Por qué es MENOR:** error de conteo en los documentos de proceso, no en los entregables f2. No afecta a ningún contenido, estado o hash. Se registra porque el dossier mide su propia exactitud por recuentos, y este recuento es el único de los declarados que no reproduce.

---

## 3. Intentos de falsación que FRACASARON

Cada intento se documenta con la evidencia que lo sostiene; un fracaso aquí es resultado, no ausencia de trabajo.

### 3.1 M-01: restos de «Norma» o salvaguarda debilitada — FRACASA

- La etiqueta mixta tiene 0 ocurrencias en informe y HTML f2 («Norma (SP 800-63B-4, ámbito federal) + principio arquitectónico»); la cláusula vault/HSM está como `[PROPOSAL]` en informe L340 y HTML L834, en ambos formatos.
- Las cláusulas (a) y (b) tienen respaldo normativo: C02 (informe L106) registra lectura directa de SP 800-63B-4 §§2.3.2/3.2.13 el 2026-11-07, incluida la prohibición de autenticadores sincronizables en AAL3.
- Ítems 1, 3–12 sin cambio (verificado por diff); el ítem 1 menciona HSM bajo `[Principio arquitectónico]`, sin ambigüedad normativa, como ya señalaba la matriz §2 fila 3.
- La nota de M-01 cita §§2.3.2/3.2.13, M03 §2 corrección 02 y Frente E F-E18. El corchete de ítem sigue abriendo con «[Norma …]», pero queda acotado por «— cláusulas normativas:» y por el `[PROPOSAL]` explícito; es el patrón de redacción que la propia matriz proponía (matriz §2, fila 2). No hay debilitamiento de salvaguarda: el texto sustantivo del ítem 2 es idéntico al original salvo las etiquetas.

### 3.2 M-02: recuento y completitud de las 13 filas §12 — FRACASA

- Enumeración completa en informe f2: 5 a CORROBORATED — FIPS 203/204/205 L537, RFC 8259 L540, GGUF L555, GitHub Docs L556, Veeam L561 — y 8 a Procedencia — RFC 3629 L541, LoC RFS L544, Syncthing L545, SP 800-34 L558, ONNX L559, Qubes L560, OAIS L568, Shamir/SLIP-39 L572.
- 0 celdas `| Heredado … |` / `| Index … |` en el informe y 0 `<td>Heredado…</td>` / `<td>Index…</td>` en el HTML. Los recuentos brutos («Corroborado (heredado» = 5, «Procedencia: » = 9) incluyen la mención en el párrafo de definición de §12 (L525), como ya advertía el informe de corrección §5.
- Los 6 controles de la matriz §3.4 (C10, §1 fallo estructural, §11 D «texto heredado») siguen sin contradicción y sin tocar, correctamente.
- La definición de «heredado» como procedencia se aplica en §0 (L60), §9 (L416) y §12 (L525) en ambos formatos, y en la nota de método f2 (L54).

### 3.3 M-02: degradar C03 en lugar de documentar la lectura directa — FRACASA (decisión defendible)

- La matriz §3.2 ofrecía dos salidas (degradar, o documentar la lectura primaria directa que R2 afirma haber hecho, H-03). La Pasada 2 eligió degradar porque en el expediente no consta registro de una lectura directa completa de GitHub Docs (método, fecha, extracto). H-03 acredita la redacción real de la página (corrección de la cita inventada), no una lectura completa. Degradar a CORROBORATED es la salida conservadora y honesta con la evidencia disponible; re-etiquetar como EVIDENCE habría exigido reconstruir un registro que no existe. El veredicto CONFIRMADA de C03 no cambia; solo cambia la etiqueta.

### 3.4 M-02: C01/DID-VC y C11/HELM como contradicciones no tratadas — FRACASA (con la salvedad de A-02)

- C01 (informe L98) no descansa en `index` ni `heredado`: su encabezado EVIDENCE no cita apoyo de procedencia. La matriz §3.5 lo clasifica expresamente como caso límite (ambigüedad INC-08/F-E19), no como contradicción §0. Dejarlo sin reclasificar sigue la matriz.
- C11 (L178): su EVIDENCE descansa en cálculo propio verificable + lectura directa del PDF de Miller (2026-11-07); las filas §12 de HELM incluyen el PDF primario de 162 páginas leído directamente. La etiqueta no depende del paper «no re-leído en M03-B».
- Salvedad: el puntero «A2A §4.6» dentro de C01 (L98) sí es un puntero desplazado sin nota; eso pertenece al defecto A-02 (D-01), no a M-02.

### 3.5 M-03: atribución residual o decisión inventada — FRACASA

- La cadena exacta «decisión de Fase A (INC-01)» tiene 0 ocurrencias en informe, HTML, cierre y método f2. La nueva redacción (informe L31, HTML L200) y la viñeta M-03 del registro F (L39) coinciden con la secuencia documental de la matriz §4.1 (paquete sin destino; Fase A difiere a «Fase B / gate»; Fase B excluye de facto sin acta; gate sin decidir). No se inventa ninguna decisión del propietario ni de Fase B: el texto no afirma que Fase B decidiera nada.

### 3.6 M-04: la fórmula literal «≥2 fuentes independientes» como afirmación viva — FRACASA

- Todas las ocurrencias restantes de «≥2 fuentes independientes» en informe (L40, L553) y HTML (L208, L1306) están dentro de notas de rectificación F que la citan como fórmula retirada; en la nota de método f2 (L54) igual. «EVIDENCE, index» y «EVIDENCE: GitHub Docs, index»: 0 ocurrencias en todos los f2. La fila HF queda como «Corroborado (resúmenes que citan la primaria, no nombrados; …)», coherente con R2c y con la fila SP 800-53.
- Lo que sobrevive no es la fórmula literal sino su mitad sustantiva (A-03) y un plural no verificado (B-02): defectos distintos, ya listados.

### 3.7 D-01: el re-anclaje v0.2.6 + commit 0858ddb — FRACASA (núcleo exacto)

- Verificado contra `MUSE_004_F_D01_SOURCE_EVIDENCE.md` y re-verificado en vivo en `https://a2a-protocol.org/latest/specification/` (crawl 2026-11-08 07:06 UTC): `latest` y `dev` idénticas (5.887 líneas, 0 `agent.json` / 5 `agent-card.json`); §5.3 = «Method Mapping Reference»; descubrimiento en §8.2 con `agent-card.json`; la frase citada de §3.3 tiene cero ocurrencias; «implementation-specific» hoy en §7.5 (L3272); credenciales fuera de banda en §7.3 (L3255); Agent Card en §8.1–§8.2.
- R7 f2 (informe L296, HTML L665): instantánea v0.2.6 §5.3 «Recommended Location» con `https://{server_domain}/.well-known/agent.json`; commit `0858ddb884dc4671681fd819648dfd697176abb3` (PR #841); cambio incompatible en 0.3.0 (2025-07-30); `dev` actual sirve contenido v1.0; cero `agent.json` en `latest`, v1.0.0 y v1.0.1. Todo conforme a la evidencia D-01 (§2.4–§2.5).
- La afirmación refutada queda registrada como refutada, no como vigente: R7 f2 cita la redacción anterior («la spec `dev` §5.3 «aún indica» `agent.json`») y declara «esa afirmación sobre el canal `dev` actual está refutada»; el registro F (L41) dice lo mismo. No se sustituye silenciosamente «dev» por «latest».

### 3.8 D-01: EO 14412 / OMB M-26-15 y la inferencia Ed25519 en C14 — FRACASA (con residuo B-04)

- El intento de mostrar que el componente EO/OMB de C14 carece de lectura primaria fracasa: el Frente D leyó el texto oficial de EO 14412 entero (Casa Blanca, §§1–7) y el PDF oficial de OMB M-26-15 entero (776 líneas), y los clasificó EVIDENCE (`../nexo-autonomy-003/fronts/D/report.md`, L22, L65–L66, L253). Las fechas 31-12-2030 (claves) / 31-12-2031 (firmas) tienen soporte primario directo.
- La inclusión de Ed25519 está disclosed en el cuerpo como inferencia en dos pasos (FIPS 186-5 §7), conforme a la clasificación CORROBORATED / INFERENCE del Frente D (L27, L115, L244). Queda solo el residuo de encabezado B-04.

### 3.9 Consistencia MD↔HTML de los pasajes corregidos — FRACASA (salvo artefactos de marcado)

- 22 pasajes corregidos comprobados presentes en ambos formatos con comparación normalizada (M-01 ítem 2, §0, C03, C05, C07, C13, C14, C15, C16, R3, R1(a), R7, M-03, M-04 HF, B14, §9, §12 definición, fila §12 A2A, filas FIPS/ONNX, registro D-02, registro F). R7, R1 y R3 son idénticos a nivel de palabra una vez retirados los artefactos de marcado (`**` de negrita Markdown, espacios en bordes de `<code>`, puntuación partida por etiquetas). Las 13 filas §12 coinciden en ambos formatos.
- Recuentos de marcas `[Rectificación MUSE-004-F]`: informe 19, HTML 20 (la vigésima es la bandera del masthead), cierre 1 (bandera; el Addendum F usa encabezado de sección), método 5. Coinciden con el informe de corrección §5.

### 3.10 Ausencia de cambios no autorizados — FRACASA

- Diffs rectificado → f2: informe 44 añadidas / 31 eliminadas; cierre 35 / 0; método 6 / 4; HTML 49 / 35. Todos coinciden exactamente con lo declarado (informe de corrección §4, manifiesto f2). Cada hunk pertenece a M-01, M-02, M-03, M-04, D-01, D-02 (alt. B) o al etiquetado F2 consecuente (título, masthead, TOC, bandera de revisión). Ningún cambio de redacción, reordenamiento o afirmación nueva fuera de ese alcance. El cierre conserva su texto anterior íntegro (0 eliminadas).

### 3.11 HTML construido por parcheo de bytes (ND-F1) — FRACASA (estructura intacta)

- Parseo estructural del HTML f2: 16 secciones abiertas y cerradas (15 en el original + 1 registro F); 29 anclas del índice, 0 sin destino, 0 IDs duplicados, 0 errores de parseo; el bloque `<script>` es byte-idéntico al original (SHA-256 `ee5a2b2a9402c8dd…`, 4.487 bytes); el buscador/filtro sigue presente; la nueva sección tiene id `registro-de-rectificacion-muse-004-f` y entrada en el TOC; un solo archivo HTML F2 (el duplicado accidental de la rama no se replica).
- La desviación de proceso ND-F1 (parcheo en lugar de `artifact.create_web_static`) no produjo rotura estructural, de navegación, de tablas ni de JS detectable por este ataque. Sigue siendo una desviación de proceso a decidir por el gate (ND-F1), no un defecto de contenido.

### 3.12 D-02 alternativa B: estados y taxonomía — FRACASA

- La copia `consolidation-method-rectified-review-f2.md` actualiza exactamente lo que la matriz §7.1 exigía: taxonomía (§ «Etiquetas epistemológicas», equivalencia «≥2» retirada), lista UNKNOWN (solo U2/U2-a/b/c, U3, U5), lecturas verbatim (las tres cerradas, con la salvedad de §8.4 preservada en L68: «no verificada contra el tag v1.0.1 ni archivada con instantánea»).
- Cada estado se verifica contra el dossier: U1 (C02 L106, lectura §§2.3.2/3.2.13/Ap. B/E), U4 (gobernanza LF/A2A/AAIF/GitHub), U6 (informe L365/L380, corrección epistemológica acotada), U7 (L366/L381, alcance SP 800-53 Rev. 5.1; cuarentena PROPOSAL), U8 (lectura Miller), U9 (Merkle inclusión/consistencia, no completitud, L368). Commit de publicación `96e227eb06134037fa5e01fabc8cfba4c384f476` (07-11-2026) atestado en `branch/Cierre-rectificado.md` L9/L34/L213 y en el canónico `branch/consolidation-method.md` L8/L74.
- Banner de copia no oficial presente (L3); canónico intacto (SHA-256 `7295fedb…c24285`, ver §4).

### 3.13 C05: conservar EVIDENCE como verificación histórica — FRACASA

- La decisión 4 de la Pasada 2 (conservar EVIDENCE para C05/R1(a) como verificación histórica de la instantánea 2026-11-05, con nota de desplazamiento) es coherente con el registro: la spec se leyó en vivo el 2026-11-05 con citas textuales. Degradarla contradiría ese registro. La alternativa —re-verificar contra el tag v1.0.1 con instantánea archivada (I-02)— sigue abierta y corresponde al gate, como la propia Pasada 2 registra (ND-F2).

---

## 4. Verificación de integridad (hashes recalculados vs declarados)

Recalculados con `sha256sum` sobre los bytes de cada archivo, 2026-11-08. Todos coinciden con lo declarado en el informe de corrección §4/§8 y en el manifiesto f2.

### 4.1 Archivos F2 (copias de revisión)

| Archivo | Bytes | SHA-256 recalculado | Declarado | Coincide |
|---|---|---|---|---|
| `review-f/report-r2-rectified-review-f2.md` | 147.584 | `dacefd69a40ed28d924e2dee1faceca5ef85230182c829dcae84fff6634b6546` | `dacefd69…b6546` | Sí |
| `review-f/closure-r2-rectified-review-f2.md` | 42.702 | `80a82481f12def6bf09034e47edbabdd447528da382848eb2d6124473ba68023` | `80a82481…8023` | Sí |
| `review-f/expediente-consolidado-nexo-r2-rectified-review-f2.html` | 184.564 | `28e2b188d942ebc3c376845c7c116e9ee728945e9c1bf9fc1a1390af5f8d751f` | `28e2b188…751f` | Sí |
| `review-f/consolidation-method-rectified-review-f2.md` | 12.800 | `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636` | `b8711617…5636` | Sí |
| `review-f/hashes-r2-rectification-review-f2.md` | 5.248 | `2f2e7da51592e38b6a9ec04fd06a479ea209ffe65d9d795d044a69aee46d39a0` | `2f2e7da5…39a0` (evidencia externa en el informe de corrección) | Sí |

### 4.2 Originales y canónicos (intactos)

| Archivo | Bytes | SHA-256 recalculado | Coincide |
|---|---|---|---|
| `branch/Informe-rectificado.md` | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` | Sí |
| `branch/Cierre-rectificado.md` | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` | Sí |
| `branch/expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | Sí |
| `branch/EXPEDIENTE CONSOLIDADO — NEXO (R2 RECTIFICADO, REVISIÓN).html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | Sí (`cmp`: IDENTICAL al anterior; duplicación accidental confirmada) |
| `branch/Manifiesto-SHA-256.md` | 3.117 | `b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5` | Sí |
| `branch/consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | Sí |
| `../nexo-autonomy-004/branch/report-r2.md` (canónico) | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` | Sí |
| `../nexo-autonomy-004/branch/closure-r2.md` (canónico) | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` | Sí |
| `../nexo-autonomy-004/branch/hashes-r2.md` (canónico) | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` | Sí |
| `../nexo-autonomy-004/branch/consolidation-method.md` (canónico) | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | Sí |
| `../nexo-autonomy-004/review/report-r2-rectified-review.md` | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` | Sí |
| `../nexo-autonomy-004/review/closure-r2-rectified-review.md` | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` | Sí |
| `../nexo-autonomy-004/review/expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` | Sí |
| `../nexo-autonomy-004/review/hashes-r2-rectification-review.md` | 3.117 | `b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5` | Sí |

Ningún original, canónico o archivo de MUSE-003/MUSE-004 fue modificado. Los únicos archivos escritos por la Pasada 2 son los cinco f2 y su informe; por esta pasada, únicamente este informe.

---

## 5. Limitaciones explícitas del ataque

1. **Sin re-verificación primaria propia (salvo A2A `latest`).** No re-leí SP 800-63B-4, IR 8547, los FIPS, GitHub Docs, Veeam, GGUF, los RFC ni SP 800-53. Mis juicios sobre M-01/M-02/M-04 se apoyan en la taxonomía del dossier y en los registros de verificación de M02/M03/M03-B (incluidos los informes de los Frentes D y E), no en lectura primaria propia de esas fuentes. Un ataque con re-lectura primaria podría encontrar más (o desmentir B-03).
2. **Punteros A2A verificados solo contra `latest`/`dev`.** La comprobación de §4.3/§4.5/§4.6 se hizo contra el canal `latest` (crawl 2026-11-08 07:06 UTC), no contra el tag v1.0.1 ni contra instantáneas archivadas con hash. La cuestión I-02 de la matriz (¿coinciden §3.3/§4.6/§5.1 con el tag v1.0.1?) sigue abierta y fuera de este ataque.
3. **HTML validado por parseo, no por renderizado.** No se ejecutó el JavaScript en un navegador en vivo (no disponible en esta sesión de subagente). La estructura, las anclas y el bloque `<script>` byte-idéntico se verificaron; el comportamiento del buscador/filtro en renderizado real no se probó.
4. **Fecha del commit 0858ddb no verificada.** Como ya registra la evidencia D-01, la fecha del commit no es visible en el extracto rastreado; solo consta su inclusión en la release 0.3.0 (2025-07-30). Este ataque no la establece.
5. **Alcance documental.** No se revisó `~/workspace/ts-spaces/` (regla de artefactos) ni el PDF de M02. El ataque cubre los cinco archivos f2, el informe de corrección, la matriz, la evidencia D-01 y los originales de `branch/`, más la verificación en vivo de la spec A2A `latest`.
6. **Severidades como juicio.** La clasificación CRÍTICO/MAYOR/MENOR es juicio de esta pasada según el criterio declarado arriba; el gate puede recalibrarla. Lo que no es juicio son las ubicaciones, las citas y los recuentos: todos son reproducibles con `grep`, `diff -u` y `sha256sum` sobre los archivos citados.

---

## 6. Para el gate (remediación propuesta, no decisiones D-01–D-12)

1. **A-01:** añadir «en el texto anterior a este addendum» a las cuatro frases del Addendum F §(b) (cierre f2 L283, L284, L286, L287), o reformularlas como afirmaciones sobre el texto pre-addendum.
2. **A-02:** completar las tres notas de dependencia D-01 con §4.3 (contenido hoy en §7.3) y §4.5 (contenido hoy en §7.6), y anotar C01 §4.6 (informe L98) y R4 §4.5 (L293); o re-verificar C05/R1(a) contra el tag v1.0.1 con instantánea archivada (I-02), lo que cerraría la dependencia de raíz.
3. **A-03:** retirar el adjetivo «independientes» de C09 (L162), C12 (L186) y §10 ítem 9 (L516) en ambos formatos, dejándolos como «resúmenes que citan la primaria», en línea con R2c y con la nota de limitación de §12 (L576).
4. **B-01–B-09:** correcciones editoriales menores listadas en §2.2 (la más barata: B-06, B-07, B-08 en el Addendum F, junto con A-01).
5. **D-02:** sigue pendiente la decisión de gate entre A (canónico intacto, divergencia documentada) y B (copia f2 actualizada). Nada de este ataque la resuelve ni la sustituye.
6. **ND-F1:** el gate puede, si lo desea, regenerar el HTML f2 con `artifact.create_web_static` en una sesión con esa función disponible y comparar hashes; el HTML por parcheo no muestra rotura, pero la regeneración canónica sigue siendo la vía prevista en la tarea original.
