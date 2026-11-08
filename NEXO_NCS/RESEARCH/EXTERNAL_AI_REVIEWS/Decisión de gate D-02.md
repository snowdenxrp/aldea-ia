# MISIÓN MUSE-AUTONOMY-004-F — D-02: DECISIÓN DE GATE SOBRE EL CUARTO CANÓNICO

**Misión:** MUSE-AUTONOMY-004-F — cierre adversarial de los seis defectos mayores de la rectificación R2.
**Defecto:** D-02 — `consolidation-method.md` (4.º canónico R2) fuera de alcance: conserva estados anteriores y contradice potencialmente el dossier rectificado.
**Fecha:** 2026-11-08.
**Estado:** DECISIÓN PENDIENTE DEL PROPIETARIO. Este documento no elige: delimita la decisión, presenta las alternativas con sus consecuencias y su evidencia. Ninguna alternativa se adopta por este documento.

## 1. La decisión que debe tomarse

Decidir cuál es el documento de referencia vigente para la **nota de método de consolidación** del expediente R2 rectificado:

- ¿Sigue siendo `consolidation-method.md` (canónico, 9.720 bytes, SHA-256 `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285`, intacto) el documento de referencia, aceptando expresamente que el conjunto documental queda **no sincronizado**?
- ¿O se adopta como referencia de trabajo la copia independiente de revisión `consolidation-method-rectified-review-f2.md` (12.800 bytes, SHA-256 `b8711617976e63bea4df63053717f1d8334e908f70d2670cd042c1ca2adf5636`, en `review-f/`), manteniendo el canónico intacto como evidencia histórica?

La decisión NO autoriza sustituir, sobrescribir ni eliminar el canónico. En ninguna alternativa el canónico se modifica. La decisión tampoco concede PASS, no resuelve D-01 a D-12, no altera UNKNOWN ni el cierre PARTIAL.

## 2. Evidencia de la divergencia

Fuente: Pasada 1, `MUSE_004_F_DIAGNOSTIC_MATRIX.md` (12 ubicaciones D-02 + tabla de 6 contradicciones). Verificación: Pasada 3, `MUSE_004_F_CROSS_DOCUMENT_VERIFICATION.md` (método coherente con el dossier F2 en estados, salvo lo señalado). El canónico conserva:

| # | Afirmación / estado en `consolidation-method.md` | Estado vigente en el dossier rectificado |
|---|---|---|
| 1 | Taxonomía antigua de evidencia (L52): EVIDENCE = fuente primaria leída o corroborada por ≥2 resúmenes independientes | Taxonomía rectificada (R-04, §0 del informe F2): la cantidad de resúmenes no sustituye una lectura primaria; «heredado» e «index» son procedencia, no nivel de evidencia |
| 2 | Lista UNKNOWN superada (L58): U1 pendiente, U4 PARCIAL | U1 RESUELTO (lectura primaria SP 800-63B-4), U4 RESUELTO (gobernanza A2A verificada) |
| 3 | U6/U7/U9 UNKNOWN (L58) | U6, U7, U9 RESUELTOS con alcance acotado |
| 4 | Commit de publicación UNKNOWN (L58) | Commit conocido: `96e227eb06134037fa5e01fabc8cfba4c384f476` (atestiguado en `closure-r2.md` L9; la fecha 07-11-2026 asociada en la copia F2 carece de fuente verificable en el workspace — menor M-3, pendiente) |
| 5 | «Las tres lecturas verbatim siguen pendientes» (L66) | Lecturas verbatim cerradas el 2026-11-07 (SP 800-63B-4, PDF final de IR 8547, spec A2A §8.4 — con la salvedad de la discrepancia de fecha de v1.0.1, 26-vs-28, no resuelta) |
| 6 | Sección de actualización (L81) solo supera commit/integridad | El dossier rectificado (MUSE-003 + MUSE-004 + MUSE-004-F) supera además taxonomía, estados UNKNOWN y lecturas verbatim |

Impacto: un lector que consulte la nota de método como referencia del expediente obtendrá estados y criterios **contradictorios** con el informe, el HTML y el cierre rectificados. El PASS de integridad que el cierre otorga a `consolidation-method.md` cubre **únicamente bytes e integridad** (el archivo está intacto); **no certifica la vigencia de su contenido** (precisado en el Addendum F del cierre, §(b) D-02).

## 3. Alternativa A — Mantener el canónico intacto y declarar el conjunto no sincronizado

**En qué consiste:** `consolidation-method.md` sigue siendo el único documento de método del expediente. Se añade una declaración explícita (en el cierre o en el handoff de entrega) de que el conjunto documental está **no sincronizado**: la nota de método conserva estados anteriores a MUSE-003/MUSE-004 y debe leerse como documento histórico, no como descripción vigente del expediente.

**Ventajas:**
- Riesgo cero de alterar evidencia canónica: el archivo no se toca en absoluto.
- Preserva la historia exactamente: lo que la nota decía en R2 queda tal cual, sin reescritura retrospectiva.
- No requiere ninguna autorización adicional más allá de la declaración.

**Riesgos y consecuencias:**
- La contradicción persiste y se vuelve permanente: cada lector futuro debe descubrir por sí mismo que la nota está superada.
- El expediente rectificado queda formalmente inconsistente como conjunto: informe, HTML y cierre dicen una cosa; la nota de método, otra.
- Cualquier verificación que parta de la nota (por ejemplo, comprobar la taxonomía o la lista UNKNOWN) llegará a conclusiones erróneas salvo que conozca la declaración de no sincronización.
- La declaración debe viajar con el expediente: si la nota se consulta aislada (es un archivo suelto en la carpeta), la advertencia no se ve.

**Qué decide el propietario al elegir A:** que la exactitud histórica del canónico pesa más que la coherencia del conjunto, y que la divergencia queda documentada pero no corregida.

## 4. Alternativa B — Adoptar la copia independiente de revisión F2 como referencia de trabajo

**En qué consiste:** se adopta `consolidation-method-rectified-review-f2.md` (copia independiente de revisión, preparada en la Pasada 2) como documento de método de referencia para el expediente rectificado. El canónico `consolidation-method.md` permanece intacto en su lugar como evidencia histórica. La copia F2 lleva un encabezado que declara que es copia de revisión no oficial, no aprobada, y que no sustituye el canónico.

**Qué actualiza la copia F2 (verificado por la Pasada 3):** taxonomía rectificada (R-04), lista UNKNOWN actualizada (U1/U4/U6/U7/U9 RESUELTOS con alcance acotado; U2/U3/U5 UNKNOWN), commit de publicación conocido, lecturas verbatim cerradas. Diff: 6 líneas eliminadas / 4 añadidas respecto al canónico (ver informe de corrección, `MUSE_004_F_CORRECTION_REPORT.md`).

**Ventajas:**
- El conjunto documental queda sincronizado: informe, HTML, cierre y nota de método dicen lo mismo.
- Un lector que consulte la nota obtiene los estados vigentes sin necesidad de conocer la historia de la divergencia.
- El canónico sigue intacto: la historia no se reescribe; la corrección vive en un archivo separado con su propio nombre y hash.

**Riesgos y consecuencias:**
- Dos versiones del mismo documento en circulación: riesgo de confusión sobre cuál es la autoritativa. Se mitiga con el encabezado de la copia y con el manifiesto, pero la mitigación depende de que el lector lea el encabezado.
- La copia F2 no ha pasado por una pasada adversarial dedicada a su propio contenido (la Pasada 3 verificó su coherencia con el conjunto; la Pasada 4 la incluyó en su verificación de integridad, no en un ataque de contenido específico). Un error introducido por la propia copia F2 podría pasar desapercibido.
- Adoptar la copia como referencia es una decisión editorial con efectos: quien la adopte debe mantenerla sincronizada en futuras rectificaciones, o la divergencia reaparecerá.
- La copia F2 hereda la limitación M-3 (fecha 07-11-2026 del commit `96e227eb…` sin fuente verificable) y la discrepancia de fecha de v1.0.1 (26-vs-28, no resuelta).

**Qué decide el propietario al elegir B:** que la coherencia del conjunto pesa más que el riesgo de duplicidad, y que la copia de revisión pasa a ser la referencia de trabajo, sin sustituir el canónico.

## 5. Comparación

| Criterio | Alternativa A | Alternativa B |
|---|---|---|
| Canónico intacto | Sí | Sí |
| Conjunto sincronizado | No (divergencia declarada) | Sí (con la copia F2) |
| Riesgo de lectura errónea por un tercero | Alto si no ve la declaración | Bajo si lee el encabezado de la copia |
| Riesgo de confusión entre versiones | Ninguno (una sola versión) | Existe (dos archivos; mitigado por nombre y encabezado) |
| Reescritura retrospectiva | Ninguna | Ninguna (la corrección vive en archivo separado) |
| Mantenimiento futuro | Ninguno | La copia debe mantenerse sincronizada |
| Autorización necesaria | Declaración del propietario | Adopción expresa del propietario |
| Efecto sobre PASS / estados / D-01–D-12 | Ninguno | Ninguno |

## 6. Lo que esta decisión no resuelve

- No resuelve los 4 defectos mayores residuales de la misión (C-01, A-01, A-02, A-03): existen con independencia de la alternativa elegida y deben corregirse o decidirse en el gate antes de cualquier cierre (ver `MUSE_004_F_HANDOFF.md`).
- No resuelve la discrepancia de fecha de v1.0.1 (26-vs-28) ni la fecha no verificable del commit `96e227eb…` (menor M-3).
- No convierte la copia F2 en documento oficial: en ambas alternativas, la copia F2 sigue siendo una copia de revisión, no una versión oficial del expediente.
- No autoriza publicar, fusionar ni sustituir ningún documento.

## 7. Decisión solicitada

El propietario debe elegir **A** o **B**, o aplazar la decisión registrando expresamente que el conjunto queda no sincronizado hasta nuevo gate. La elección debe quedar registrada con fecha y alcance. MUSE no elige: ambas alternativas están preparadas y documentadas; la autoridad es del propietario.
