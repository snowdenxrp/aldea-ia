# MISIÓN MUSE-004 — Informe de diferencias (originales R2 → copias rectificadas para revisión)

**Fecha:** 2026-11-08.
**Base:** originales canónicos R2 de la rama `nexo-mission-02-pdf-2026-11-05`
(HEAD de referencia c37a3575f5e043e9db9af01a786d658b363ead87), copiados en
`research_notes/nexo-autonomy-004/branch/`.
**Destino:** copias de revisión en `research_notes/nexo-autonomy-004/review/`.
Los originales permanecen intactos (SHA-256 verificados sin cambios).

## Estadística global del diff

| Archivo | Original | Rectificado | Líneas eliminadas | Líneas añadidas | Líneas cambiadas |
|---|---|---|---|---|---|
| `report-r2.md` → `report-r2-rectified-review.md` | 113.706 bytes, 576 líneas | 135.870 bytes, 603 líneas | 50 | 77 | 127 |
| `closure-r2.md` → `closure-r2-rectified-review.md` | 21.346 bytes, 208 líneas | 37.652 bytes, 266 líneas | 0 | 58 | 58 |
| `expediente-consolidado-nexo-r2.html` → `expediente-consolidado-nexo-r2-rectified-review.html` | 153.699 bytes (R2 publicado) | 171.310 bytes | — (ver nota) | — | 40 pasajes rectificados verificados por extracción de texto |

Nota sobre el HTML: el original R2 vive como artefacto (ts-spaces, fuera de
lectura directa por regla de artefactos), por lo que no se computó un diff por
líneas contra él. La sincronización se verificó por extracción de texto: los
40 pasajes rectificados del Markdown están presentes en el HTML; 28 enlaces
internos de fragmento resuelven contra ids existentes (0 rotos); las 16
tarjetas C01–C16, las tablas D1–D15, R1–R7, T1–T14, U1–U9 y D-01–D-12 están
presentes.

## Modificaciones por rectificación (report)

| ID | Secciones tocadas | Tipo de cambio |
|---|---|---|
| Registro de rectificación (nuevo) | Sección nueva tras el encabezado | Adición: fuente MUSE-AUTONOMY-003, fecha 2026-11-07, lista R-01–R-10/A-01–A-04, texto R2 como historial sin conocimiento retrospectivo, límite de alcance (consolidation-method.md fuera de alcance, INC-01) |
| R-01 / A-02 | §4 D5, §7 U5, §3 C11, §11 B7 | Reescritura: procedencia CRFM HELM vs reportado; 4–5 es el máximo; mediana de los valores absolutos de las diferencias, mediana de \|Δ\| = 1,2 puntos; media firmada −0,65; HF 2023 +14,9 LLaMA-65B; MMLU-Pro §6.3 como INFERENCE; sub-UNKNOWNs |
| R-02 | §7 U3 | Reescritura: "25 fichas nuevas (F-01–F-25) y una ficha de reexamen (F-26)"; unión de nueve prioridades; discrepancia handoff/§9.9 registrada |
| R-03 | §3 C02, §11 A2 | Precisión F-E01 exacta; retirada salvedad de verificación verbatim ya cerrada |
| R-04 | §0, §3 C09/C10/C12, §6.1 R2c, §9, §12 | Taxonomía rectificada en §0; C09/C10/C12 y R2c degradados a CORROBORATED; nota de limitación de §12 actualizada (C02 y C14 ya no dependen de corroboración) |
| R-05 / A-01 / A-03 | §3 C11, §7 U2 | U2-a/b/c restituidos y separados; atribución Miller exacta (969/13,2%/7,5% publicados; 3.876/7.108 derivados del Frente A con supuestos); MAR32 sectorial; CLT/SEM, bootstrap solo para diseños complejos; MDE, K, definición de "caso" |
| R-06 / A-04 | §3 C14, §4 D2, §5 ítem 12, §6.1 R6, §11 C2, §12 fila IR 8547 | Plan anunciado; hitos 2030 claves / 2031 firmas; "antes de 2030" PROPOSAL; Ed25519 inferencia en dos pasos; "disallowed" acotado a aplicar protección criptográfica; legacy UNKNOWN; SP 800-131A pendiente; matiz §3.1.2 |
| R-07 | §7 U6/U7/U9, §11 B2, §11 B7 | Alcances acotados; B2 ya no dice U9 UNKNOWN; B7: U5 UNKNOWN, U6 RESUELTO; no-pertenencia de clave ≠ completitud |
| R-08 | §3 C12 | Circularidad D-01/D-02/D-08 SIN DECIDIR; log de rechazos como superficie hostil; C12 sigue PROPOSAL |
| R-09 | §6.4 | Nuevo encabezado "Principios arquitectónicos y salvaguardas propuestas"; 12 ítems etiquetados norma/principio/PROPOSAL; ítem 11 PQC como PROPOSAL prudencial |
| R-10 | §1, §3 C02/C05, §11 A2/C4/D/E, §12 A2A, Anexo A | Mapeo APROBADO CONDICIONADO vs PARTIAL; A2A v1.0.1 fijado con discrepancia del frontmatter 1.0.0 conservada; §8.4 confirmado en spec `latest` (F-E15), no como lectura primaria del tag v1.0.1; Anexo A última línea: ruta corregida a `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/consolidation-method.md` (INC-13) |
| INC-02 (Fase A) | §11 E H-07 | Ningún cambio U5 aplicado a H-07; H-07 corregido solo vía R-10.4 como texto histórico superado |

## Modificaciones por rectificación (closure)

| ID | Secciones tocadas | Tipo de cambio |
|---|---|---|
| Addendum final (nuevo) | Sección nueva al final | Adición: R-01–R-10 y A-01–A-04 resumidos con anclaje; estados preservados; sin autorización de implementación ni PASS nuevo; texto original conservado como historial |
| R-01 / A-02 | Dictamen C14; ambas secciones "Revisión primaria U5" | Notas de rectificación: procedencia CRFM/HF/MMLU-Pro INFERENCE; mediana de \|Δ\| = 1,2; media firmada −0,65; corrección de "no se encontró una comparación primaria pareada" (sí existe la histórica HF 2023, +14,9, que no sustenta 4–5 general) |
| R-10.8 | Segundo bloque U5 (ll. 141–147 originales) | Nota editorial: bloque marcado SUPERSEDIDO/CONSOLIDADO en el primer bloque; contenido conservado íntegro como historial |
| R-05 / A-01 / A-03 | Revisión primaria de U2 | Notas: U2-a/b/c; reconciliación Miller 969/13,2%/7,5% vs 3.876/7.108 derivados; escenarios y supuestos; MAR32 sectorial |
| R-06 / A-04 | Dictamen C14 | Notas: plan anunciado, hitos 2030/2031, disallowed acotado, legacy UNKNOWN, SP 800-131A pendiente |
| R-07 | Resolución U6/U7/U9 | Notas: U6 corrección epistemológica acotada; U7 RESUELTO en alcance SP 800-53, cuarentena-restauración PROPOSAL, matiz 5.2.0 CORROBORATED; U9 precisión criptográfica, no-pertenencia ≠ completitud |

## Modificaciones por rectificación (HTML)

El HTML rectificado se construyó desde el informe rectificado (`report.md`
idéntico a `report-r2-rectified-review.md`). Sincroniza todas las
modificaciones semánticas del Markdown: registro de rectificación posterior
destacado al inicio; 39 marcas `[Rectificación MUSE-003 (R-xx)]` en sus
secciones; tablas y filtros conservados; Anexo A con 4 remisiones al
manifiesto externo `hashes-r2-rectification-review.md` y los SHA-256 reales
R1/R2. Verificación del constructor: pass, sin errores de consola, sin
desbordamiento horizontal; controles probados (búsqueda AAL3, botón Limpiar,
enlace de índice, chip "Parcialmente confirmada · 1").

## Lo que NO cambió

- Estados: U2/U3/U5 UNKNOWN (U2 dividido en U2-a/b/c, cada uno UNKNOWN);
  U1/U4/U6/U7/U8/U9 RESUELTOS (U7/U9 con alcance acotado); C14 PARCIALMENTE
  CONFIRMADA; D-01 a D-12 SIN DECIDIR (25 ocurrencias en report, 27 en HTML);
  cierre sustantivo global PARTIAL; ningún PASS nuevo (la única ocurrencia de
  "ESTADO: PASS" en el informe rectificado es la cita histórica de §11 E H-01).
- NCS M0 y P07 no modificados; no se tocó código, pruebas, CI ni workflows.
- Texto original C01–C16: sigue UNKNOWN en fidelidad; no reconstruido.
- Cadena de custodia P7: limitación conservada, no resuelta.
- `consolidation-method.md` (4.º canónico): fuera de alcance de esta misión;
  conserva estados anteriores a la rectificación (INC-01/D-02, decisión de gate).
- El diff del cierre contiene 0 líneas eliminadas: el contenido original está
  íntegro.

## Hashes (ver manifiesto)

Manifiesto: `review/hashes-r2-rectification-review.md`.
Hash propio del manifiesto (evidencia externa, no autocontenida):
`b0395ed5a9afd661f39475feba9d045f22076e56ff4fafe16dffd642f701abd5`.
