# MISIÓN MUSE-AUTONOMY-002 — Dictamen de auditoría independiente de R1

**Documento auditado:** Expediente consolidado Nexo M02 → M03 → M03-B, versión R1 (corrección final de MUSE-AUTONOMY-001-R1).
**Documento objetivo en repositorio:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/auditoria-consolidada-muse-m02-m03-m03b-r1-corregida.html`, rama `nexo-mission-02-pdf-2026-11-05`, repositorio `snowdenxrp/aldea-ia`.
**Fecha de la auditoría:** 2026-11-06.
**Auditor:** Snow, en modalidad adversarial. Tres pasadas separadas con criterios propios: Línea A (integridad de archivos), Línea B (las cinco correcciones R1), Línea C (contenido adversarial).

## 0. Declaración de limitaciones (antes del dictamen)

1. **No dispongo de agentes independientes reales.** Las tres pasadas las realizaron agentes que comparten mi contexto, con criterios separados, pero de una sola mente. No es una revisión externa. Lo declaro como exige la misión; nada de este dictamen debe presentarse como revisión de un tercero.
2. **No tengo acceso al repositorio.** No existe integración autorizada de GitHub (estado `not_connected`, constatado el 2026-11-05 y vigente). No se intentó ningún acceso a la rama por ningún medio. Todos los archivos del repositorio —incluido el documento objetivo y `hashes.md` en la rama— se clasifican como **NO VERIFICABLE**. No se inventó ningún hash ni se declaró ninguna coincidencia sobre la rama.
3. **Archivos de artefacto fuera de lectura directa.** Los archivos bajo `~/workspace/ts-spaces/` (P2, P4, P6, P7 HTML) no se leyeron ni se recalcularon en esta auditoría. Sus hashes se heredan de la consolidación y se clasifican como **NO RE-VERIFICADO**.
4. **El PASS declarado por R1 no se aceptó como evidencia.** Cada punto se comprobó desde cero.

## 1. Dictamen global: PARTIAL

El expediente R1, en contenido, es mayoritariamente coherente y tres de las cinco correcciones superan la comprobación adversarial. Pero **el PASS global declarado por R1 no se sostiene**, por tres razones independientes, cualquiera de las cuales basta para impedirlo según los criterios de cierre de esta misión:

1. **Dos de las cinco correcciones no superan la comprobación completa** (R1: PARTIAL; Anexo A: PARTIAL).
2. **El veredicto "ESTADO: PASS" contradice la regla propia del documento (§9)**, que prohíbe conceder PASS por documentación.
3. **La integridad del documento publicado en la rama no puede cerrarse**: todos los archivos de la rama son NO VERIFICABLES desde aquí, y el manifiesto del HTML entregado presenta como verificados valores de versiones anteriores.

Un PARTIAL bien demostrado es preferible a un PASS falso. Los defectos son corregibles sin rehacer el documento (ver R2, sección 8).

## 2. Matriz de los cinco criterios R1

| # | Corrección R1 | Veredicto | Evidencia (resumen; detalle en §4) |
|---|---|---|---|
| 1 | C12 — seis controles, dos preexistentes, cuatro incorporaciones | **PASS** | §3 C12: "dos de los seis controles… omite cuatro… en cuatro de seis controles"; §4 D9: "(4 de 6 controles nuevos)"; §5 A.5 enumera las 4 incorporaciones. "Tres de cinco" solo sobrevive en contextos históricos (registro de la corrección). Ordinales (1–5 de 5) conservados sin confusión. |
| 2 | R1 — separación primaria / secundaria / inferencia | **PARTIAL** | La fila R1 (§6.1) separa correctamente (a) EVIDENCE en vivo, (b) secundario no-EVIDENCE (JWS MAY §8.4, SHOULD), (c) inferencia. PERO la tabla §12, fila A2A, lista §8.4 entre las secciones con nivel "Verificado en vivo", contradiciendo la propia R1. El error que la corrección debía eliminar sobrevive en la tabla de fuentes, en informe y HTML. |
| 3 | R2 — separación pickle / conversión / trust_remote_code / mitigación | **PASS** | Fila R2 separa (a)–(e) con etiquetas correctas en ambos documentos; §12 incluye las dos fuentes nuevas. Verificación independiente: la cita de `pickle` es literal en la documentación oficial de Python (leída en vivo 2026-11-06); `trust_remote_code` queda CORROBORATED por ≥2 fuentes independientes que citan la documentación de HF Transformers, sin fingir lectura primaria. (b) HYPOTHESIS es honesta. |
| 4 | A1–A3 — precisiones del propietario, sin decisiones nuevas | **PASS** | §11 A reescrito como precisiones adoptadas; solo verificaciones documentales pendientes. C02/C10 y §7 U1: "precisión del propietario adoptada". §8: D-01 a D-12 todas SIN DECIDIR (12 filas). "DECIDIDO": 0 ocurrencias. |
| 5 | Anexo A — manifiesto exacto | **PARTIAL** | El Anexo A de `report.md` + `hashes.md` son exactos para lo verificable. PERO el Anexo A del HTML está desactualizado en 4 de 6 filas: describe versiones previas/intermedias, no los archivos actuales, y omite el PDF vigente de R1 (ver H-02). |

## 3. Criterios de cierre aplicados

La misión 002 prohíbe conceder PASS global si se da cualquiera de estas condiciones. Evaluación:

| Condición de no-PASS | ¿Se da? |
|---|---|
| Hashes incorrectos o no verificables presentados como verificados | **SÍ** — H-02: el Anexo A del HTML presenta como manifiesto vigente tamaños y hashes de versiones anteriores (report.md 93.872/`f829d792…` frente a 95.294/`780c1acb…`; hashes.md 172/`133ee465…` frente a 1.514/`690a3a52…`; PDF pre-R1 133.322/`d37d0d76…`, 26 págs, frente al PDF R1 141.597/`6bab7c169…`, 28 págs, ausente del HTML). |
| Archivos declarados que no existen y no están identificados como ausentes | **PARCIALMENTE** — los archivos de la rama no están identificados como ausentes sino como NO VERIFICABLES (distinción registrada en la Línea A, O3). El manifiesto local es íntegro; la integridad del documento objetivo publicado es UNKNOWN. |
| Alguna de las cinco correcciones no supera la comprobación | **SÍ** — criterios 2 y 5 son PARTIAL. |
| Contradicciones materiales sin resolver | **SÍ** — H-01 (PASS vs §9), H-02 (manifiesto HTML vs Anexo A de report.md), H-B2 (§8.4 en §12). |
| Se ha alterado una decisión reservada al propietario | **NO** — D-01 a D-12 permanecen SIN DECIDIR en todas sus apariciones; A1–A3 son precisiones ya dadas, no decisiones nuevas. |

## 4. Hallazgos

### 4.1 Mayores

**H-01 — El "ESTADO: PASS" contradice la regla propia del documento (§9).** [EVIDENCE, Línea C]
§9: "'PASS' exige evidencia de implementación y pruebas aplicables; **no se concede por documentación**." La nota de método (§0) dice lo mismo. Sin embargo §11 D declara "**ESTADO: PASS.** Los criterios de aceptación de MUSE-AUTONOMY-001 están cumplidos…". El expediente es exclusivamente documental; no hay evidencia de implementación ni pruebas aplicables en ningún punto (el propio §11 C lo admite). El documento intenta salvarlo diciendo que las verificaciones pendientes "quedan como limitaciones registradas… no como incumplimientos de aceptación", pero eso no reconcilia la contradicción: la regla de §9 es categórica y no tiene excepción para "criterios de aceptación de misión". La misma contradicción existe en el HTML (sección de informe final, segundo "ESTADO: PASS"). Qué podría refutarlo: que el documento definiera dos sentidos distintos de PASS (epistémico, §9; aceptación de misión, §11 D) y lo declarara explícitamente. No lo hace en ningún punto. Veredicto: MAYOR. No falsifica ninguna de las cinco correcciones (que están hechas), pero invalida la coherencia del veredicto principal. Además §11 D afirma como criterio cumplido "etiquetas correctamente aplicadas", lo que H-03 y H-04 desmienten en parte.

**H-02 — El manifiesto del Anexo A del HTML entregado está obsoleto e incompleto.** [EVIDENCE, Líneas B y C]
Verificado con `sha256sum`/`wc -c` sobre los archivos reales:
- Fila `report.md`: "93.872 bytes, `f829d792…`, Verificado: SHA-256 recalculado sobre el archivo real el 2026-11-06". Realidad actual: **95.294 bytes, `780c1acb…`**. No coincide.
- Fila `hashes.md`: "172 bytes, `133ee465…`, Su contenido lista los hashes de la versión previa a R1". Realidad actual: **1.514 bytes, `690a3a52…`**. No coincide.
- Fila del PDF: "133.322 bytes, `d37d0d76…`, exportación PDF **previa a R1 (26 páginas A4)**". El PDF vigente de R1 (141.597 bytes, `6bab7c169…`, 28 páginas) **no aparece en ningún punto del HTML** (búsqueda de `6bab7c169` y `141.597`: 0 ocurrencias). `report.md` sí lo incluye (vía `hashes.md`).
- Fila del HTML pre-R1: "135.043 bytes, `5b499113…`, exportación idéntica… a la versión original (pre-R1)". El manifiesto del HTML mezcla filas pre-R1 con la fila R1 de `index.html`, sin marcar el conjunto como histórico.
Atenuante: las filas problemáticas están parcialmente etiquetadas como previas a R1, y el Anexo A de `report.md` sí es correcto y completo; el defecto está en el documento web entregado, no en el informe de trabajo. Limitación: no se pudo comprobar la identidad byte a byte entre el HTML exportado y `index.html` en `ts-spaces/` (fuera de alcance); solo consta igualdad de tamaño (147.680 bytes). Veredicto: MAYOR. Es exactamente uno de los supuestos de no-PASS de la misión 002.

**H-03 — C03: una cita entrecomillada que no existe en la página citada.** [EVIDENCE, Línea C]
§3 C03 presenta como cita textual de GitHub Docs: 'El registro de verificación persistente "**does not establish that a change was reviewed, is free from defects, or remains authorized under the organization's current key policy**"'. Leída íntegra la página citada (`https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification`, 164 líneas, 2026-11-06): esa frase no aparece. Lo que la página sí dice, y sostiene la sustancia, es que el registro de verificación persiste aunque la clave se revoque o expire ("previously verified commits retain their verified status… GitHub will not re-verify previously signed commits"). Qué podría refutarlo: que la frase proceda de otra página de GitHub Docs distinta de la citada, o de una versión anterior de la página. El documento no indica otra fuente, así que la atribución, tal como está, no es verificable. Limitación: no se puede descartar por completo la deriva de versión de la página; pero la carga de la prueba recae en el documento, y su propia §9 prohíbe inventar referencias. Veredicto: MAYOR (integridad de la evidencia). **No** altera el veredicto de C03: la sustancia —una firma verificada no prueba autoridad vigente— es correcta y está respaldada por la misma página. Es un defecto de citación, no de conclusión.

**H-04 — "Corroborado por ≥2 resúmenes independientes" se afirma sin identificarlos.** [EVIDENCE, Línea C]
Varias etiquetas EVIDENCE descansan en "≥2 (o ≥3) resúmenes independientes" que nunca se nombran, por lo que nadie puede comprobar si son independientes o repiten la misma fuente. Esto viola la propia regla de §9 ("'EVIDENCE' solo cuando exista fuente identificable y alcance verificable"). Casos: C14 ("corroborado por ≥3 resúmenes independientes del final, 2026-11-05; el PDF final no se leyó línea a línea"); C02 ("§2.3.2/Ap. B corroborados por ≥2 resúmenes independientes que citan la primaria"); C09 ("existencia y texto corroborados por resúmenes independientes"); C12 ("existencia de los controles corroborada por resúmenes independientes"); R2 (c) ("corroborada por ≥2 fuentes independientes que la citan"). En ningún caso se nombra ni enlaza un solo resumen; §12 no lista ninguno de esos resúmenes como fuente. Qué podría refutarlo: que los resúmenes existan en los informes de base (M02/M03/M03-B) con identidad suficiente. No constan en este expediente consolidado, que es el documento auditado; la trazabilidad debe estar en él. Atenuante importante: comprobación externa de la sustancia de los casos más materiales — IR 8547 final (27-10-2026) confirmado por ≥4 fuentes independientes nombradas (postquantum.com, Cloud Security Alliance, yaamlabs.com, quentir.ai); fechas A2A (v1.0.0 12-03-2026, v1.0.1 28-05-2026, donación LF 23-06-2025, AAIF 27-08-2026) y opcionalidad de la firma JWS confirmadas por varias fuentes independientes; la cita de `pickle` (R2a) es textual y exacta según la documentación oficial de Python. Veredicto: MAYOR como defecto metodológico sistemático; MENOR en impacto sobre las conclusiones, porque la sustancia de los casos críticos se confirmó externamente.

**H-B2 — §8.4 sigue atribuido a lectura en vivo en la tabla §12.** [EVIDENCE, Línea B]
`report.md` (l. 488) y HTML §12: fila A2A, columna "Sección" incluye §8.4, columna "Nivel" = "Verificado en vivo (spec `dev`)". La propia R1 (§6.1, l. 253) dice que §8.4 "no fue leída verbatim en la primaria". Es el mismo tipo de error que la corrección 2 debía eliminar, residual en la tabla de fuentes. Refutación posible: demostrar que §8.4 sí se leyó verbatim en M03-B (ninguna evidencia en el expediente lo muestra; R1 afirma lo contrario). Veredicto: MEDIA. Es el motivo del PARTIAL del criterio 2.

### 4.2 Observaciones de integridad (Línea A)

**O1 — El manifiesto no está auto-anclado.** [INFERENCE, gravedad baja] Ningún documento declara el SHA-256 de `hashes.md` (correcto, porque no puede declararse a sí mismo). Consecuencia: la integridad de `hashes.md` descansa en confianza, no en un hash; si alguien alterara el manifiesto, nada en el expediente lo detectaría. Es inherente a cualquier manifiesto, pero queda registrado como limitación, no como verificación.

**O2 — Dos filas del Anexo A difieren su hash al manifiesto externo.** [EVIDENCE, gravedad baja] `report.md` y el PDF no llevan su hash en el Anexo A sino "ver `hashes.md`". La afirmación de B14(5) —"manifiesto completado con … SHA-256 … de cada entregable"— solo es literalmente cierta contando el manifiesto externo. La tabla misma es explícita al respecto, así que no es una afirmación falsa; es una imprecisión de redacción.

**O3 — Brecha central: rama no verificable.** [UNKNOWN, gravedad alta para el cierre de integridad] El criterio de cierre exige no conceder PASS si hay "archivos declarados que no existen y no están identificados como ausentes". Aquí los archivos de la rama no están identificados como ausentes: están **no verificados**. La distinción importa: el manifiesto local es íntegro, pero la integridad del documento objetivo publicado en la rama es UNKNOWN, no VERIFICADA. El PASS de R1 descansa sobre copias locales; la integridad documental en la rama no puede cerrarse desde aquí.

### 4.3 Menores (Línea C)

**H-05 — B1: referencia cruzada falsa ("fila D12/D4" para C04).** [EVIDENCE] §11 B1 dice "C04 permanece CONFIRMADA en §3 y en la fila D12/D4 de trazabilidad". No existe ninguna fila de la matriz D1–D15 que trate C04 (MCP): D4 es límites físicos/EUV y D12 es la frontera del Core. C04 no tiene fila porque no hubo discrepancia sobre ella, lo cual es legítimo — pero la afirmación de que está "en la fila D12/D4" es falsa. Veredicto: MENOR.

**H-06 — El HTML y `report.md` no son textualmente idénticos.** [EVIDENCE] (a) El HTML incluye una sección completa ausente en `report.md`: "§8-misión Informe final obligatorio — MISIÓN MUSE-AUTONOMY-001" (con un segundo "ESTADO: PASS" — 2 ocurrencias en HTML frente a 1 en `report.md` — y un resumen de PRODUCTO/EVIDENCIA/PENDIENTES); (b) D9 dice "(cuatro de seis controles nuevos)" en HTML frente a "(4 de 6 controles nuevos)" en `report.md` — mismo significado, distinta redacción; (c) "SIN DECIDIR" aparece 27 veces en HTML frente a 22 en `report.md` (las 5 extra proceden de la sección añadida y del encabezado resumen). Veredicto: MENOR. No hay contradicción de fondo, pero rompe la afirmación implícita de que el HTML es "el mismo expediente" que `report.md`.

**H-07 — U1 "RESUELTO" en la tabla de §7 puede leerse como verificado.** [EVIDENCE] La tabla de §7 presenta U1 como **RESUELTO** sin calificación en la propia tabla; la calificación ("estado fijado por el propietario; la verificación verbatim del PDF de SP 800-63B-4 sigue pendiente") vive solo en los motivos y en §11 A1/C.1. Un lector que lea solo la tabla concluirá que el texto de AAL3 fue verificado. Veredicto: MENOR. El documento es transparente en los motivos, por eso no es mayor.

**H-08 — Tensión de redacción en D9: "recursos" listado entre las aportaciones de C12.** [EVIDENCE] La fila D9 enumera como aportación de C12 "autenticación, autorización por mensaje, anti-replay, **recursos**, contenido hostil", mientras §3 C12 establece que los límites de recursos (tamaño/frecuencia) ya existían en M02. La fila mezcla el conjunto completo de seis controles con las cuatro incorporaciones. El calificador "(4 de 6 controles nuevos)" de la misma celda lo aclara, así que no induce a error a un lector atento. Veredicto: MENOR.

**H-B3 — El Anexo A de `report.md` no es autocontenido.** [EVIDENCE] Las filas de `report.md` y del PDF delegan tamaño y hash a "ver `hashes.md`", y la fila de `hashes.md` tiene "—" en tamaño y hash. La información existe y es correcta en `hashes.md`, así que es una incompletitud formal, no un dato falso. Veredicto: BAJA.

**H-B4 — Nota autorreferencial confusa en la fila `index.html` del HTML.** [EVIDENCE] El texto dice que el SHA-256 se calculó "con esta celda en valor neutro" y que "el recálculo externo del archivo publicado difiere únicamente en esta celda". No se declara ningún valor hash falso en esa celda (remite al manifiesto externo), pero la nota afirma un cálculo sobre una versión que no es el archivo publicado. El hash real del HTML exportado (`56330207…`) está en `hashes.md` y en el Anexo A de `report.md` y fue verificado; su aplicabilidad al `index.html` de `ts-spaces` es **INFERENCE** (mismo tamaño, 147.680 bytes; no verificado directamente por estar fuera de alcance). Veredicto: BAJA.

**H-B5 — B14 afirma una corrección "en §5" que no se puede constatar.** [INFERENCE] §5 A.5 no contiene ningún conteo, solo una lista de 4 incorporaciones coherente con el conteo corregido; no hay evidencia textual de que §5 cambiara. Además, el "sin ejecución de código" de M02 §6.1 solapa parcialmente el 6.º control, por lo que el reparto binario 2 preexistentes / 4 nuevos es defendible pero simplifica un elemento parcial preexistente. Veredicto: BAJA (observación).

## 5. Lo verificado como CORRECTO (para que el balance sea justo)

- **Conteos:** 16 correcciones (15 CONFIRMADA + C14 PARCIALMENTE), 15 discrepancias D1–D15 (15 filas con resolución), 12 materiales (5+4+2+1 en §5), 7 riesgos R1–R7, 9 UNKNOWN, 12 decisiones D-01 a D-12, 13 riesgos omitidos (§6.2, 13 ítems), 12 requisitos (§6.4, 12 ítems), matriz T1–T14 (14 filas). Todos cuadran en ambos archivos; ningún código citado (C, D, R, U, T) falta en su registro.
- **C11:** aritmética binomial verificada a mano: n=200, p=0,70 → SE≈0,032, IC95% ≈±6,4; n=500 → ±4,0; p=0,50, n=200 → ±6,9. GPQA Diamond 198 preguntas, ±6,4 al 70%: correcto.
- **C12 (R1 punto 1):** la lista tiene seis controles, M02 cubría dos y C12 añade cuatro. Aritmética correcta en §3, §4 D9 y §5. "Tres de cinco" sobrevive solo como mención histórica.
- **R1/R2 (R1 puntos 2–3):** las separaciones son correctas en el texto del riesgo; JWS opcional y SHOULD son secundarios (confirmado externamente); `pickle` es EVIDENCE textual exacto; la conversión pickle→safetensors queda como HYPOTHESIS; `trust_remote_code` es EVIDENCE en sustancia; sandbox/pinning es PROPOSAL.
- **D-01 a D-12:** SIN DECIDIR en las 12 filas de §8 y en todas las apariciones relevantes de ambos archivos (27 menciones en HTML, 22 en `report.md`). Ninguna decisión reservada fue tomada, alterada ni presentada como resuelta. A1–A3 se presentan como precisiones del propietario ya dadas, no como decisiones nuevas.
- **UNKNOWN:** U1 RESUELTO (decisión del propietario, disclosed), U4 PARCIAL, U2/U3/U5/U6/U7/U8/U9 UNKNOWN. Ningún UNKNOWN se convierte en verdadero o falso por inferencia.
- **Autorización de implementación:** buscadas todas las fórmulas de permiso: todas las apariciones son negaciones ("no autoriza", "no se aprueba ninguna tecnología", "Sin autorización de implementación"). El dictamen APROBADO CONDICIONADO se califica en cada aparición como "documentación de investigación y referencia, no como especificación técnica autorizada". No se encontró autorización implícita ni accidental.
- **Sustancia externa verificada:** IR 8547 final, fechas A2A, opcionalidad JWS y advertencia `pickle` confirmados por fuentes independientes nombradas (ver H-04). C03: sustancia confirmada por la página de GitHub Docs aunque la cita entrecomillada no sea textual (H-03).

## 6. Limitaciones reales de esta auditoría

1. No se verificó el contenido de la rama ni del artefacto web publicado (sin acceso a GitHub; archivos de artefacto fuera de lectura directa). La integridad del documento objetivo publicado es UNKNOWN.
2. P2/P4/P6/P7 (ts-spaces) no re-verificados por alcance definido; sus hashes se heredan de la consolidación.
3. `hashes.md` no tiene ancla de integridad propia (O1).
4. No se re-verificaron todas las fuentes primarias de §12; se hicieron comprobaciones puntuales (IR 8547, A2A, `pickle`, GitHub Docs). Otras afirmaciones "corroboradas" (SP 800-53, CP-9/CP-10, DID/VC) se aceptan solo en la medida en que el documento las etiqueta honestamente como no leídas en vivo.
5. Las tres pasadas comparten una sola mente (ver §0.1): no es una revisión externa independiente.
6. No se modificó ningún archivo del expediente R1 en esta auditoría; R1 se conserva intacto como evidencia. Las correcciones van en una versión R2 separada (ver §8).

## 7. Confirmación explícita

- **NCS M0 y P07 no fueron modificados** en esta auditoría ni en R1.
- **D-01 a D-12 no fueron modificados**: permanecen SIN DECIDIR en todas sus apariciones.
- **No se autorizó implementación, bootstrap ni efectos protegidos.**
- **No se eliminó evidencia anterior para ocultar discrepancias**: R1 se conserva intacto; los hallazgos se documentan con su evidencia y procedencia.

## 8. Versión R2 (separada, correctiva)

Los defectos hallados son corregibles sin rehacer el documento. Se preparó una versión R2 separada del HTML (artefacto `expediente-consolidado-nexo-r2`) con informe exacto de cambios (ver `r2-change-report.md` en la carpeta de esta auditoría). R2 corrige: H-01 (reconciliación de los dos sentidos de PASS; estado global PARTIAL bajo §9, con los cinco criterios R1 demostrados en su ámbito), H-02 (Anexo A del HTML actualizado a los archivos vigentes, incluido el PDF R1), H-B2 (fila A2A de §12: §8.4 como secundaria, no "Verificado en vivo"), H-03 (cita de C03 sustituida por la redacción real de GitHub Docs), H-04 (nota explícita de limitación de corroboración + fuentes nombradas para IR 8547), H-05 (referencia cruzada B1), H-07 (calificación de U1 en la propia tabla de §7), H-08 (aclaración de D9) y H-06 (sección añadida del HTML declarada como apéndice de entrega). R2 **no** sustituye a R1: su procedencia es esta auditoría (MUSE-AUTONOMY-002) y R1 se conserva como evidencia de lo entregado.

## 9. Archivos generados por esta auditoría

- `audit-r1-independent.md` — este dictamen.
- `manifest-r1-verified.md` — inventario real de archivos, rutas, tamaños, SHA-256 y estado individual.
- `r2-change-report.md` — informe exacto de cambios de la versión R2.
- Versión R2: artefacto `expediente-consolidado-nexo-r2` + HTML exportado + PDF.

Los hashes SHA-256 de estos archivos, calculados sobre los archivos reales tras su última edición, están en `manifest-r1-verified.md` (el hash de este dictamen figura allí, porque un archivo no puede contener su propio hash).
