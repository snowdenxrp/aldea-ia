# Nota de método — Consolidación R2 (MUSE-AUTONOMY-002)

> **COPIA DE REVISIÓN NO OFICIAL — ALTERNATIVA B (MUSE-AUTONOMY-004-G, 2026-11-08; alternativa preparada en MUSE-AUTONOMY-004-F y actualizada en G).** Esta copia **NO sustituye** el canónico `consolidation-method.md` (9.720 bytes, SHA-256 `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285`, intacto). **No aprobada.** Preparada únicamente para que el gate decida entre **A** (canónico intacto, con la divergencia documentada en el informe g y en los Addenda F y G del cierre g) y **B** (esta copia actualizada). No se ha publicado ni fusionado nada. Los cambios respecto al canónico llevan la marca `[Rectificación MUSE-004-F (D-02)]` y los cambios G la marca `[Rectificación MUSE-004-G (C-01/D-02)]`, y no deben leerse como si los autores de R2 los hubieran conocido. Estados vigentes: U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL. No se declara PASS.

**Misión:** MUSE-AUTONOMY-002, auditoría adversarial independiente de R1 e integridad documental.
**Fecha:** 2026-11-06.
**Repositorio:** `snowdenxrp/aldea-ia`.
**Rama:** `nexo-mission-02-pdf-2026-11-05`.
**Carpeta:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`.
**Commit de publicación de los cuatro archivos R2:** `96e227eb06134037fa5e01fabc8cfba4c384f476` (07-11-2026).

## Archivos fuente utilizados

Versión R1 (conservada intacta como evidencia; no sobrescrita):

| Archivo | Tamaño (bytes) | SHA-256 |
|---|---|---|
| `report.md` (informe R1) | 95.294 | `780c1acba72ed0f9dc99cf0bd8c81405629e01ad28c818c5bfe18b3308d967f1` |
| `auditoria-consolidada-muse-m02-m03-m03b-r1-corregida.html` (HTML R1) | 147.680 | `56330207241d88d67bde723656175c6daa8757f943bf385705f1ffffc78cbd64` |
| `expediente-consolidado-nexo.pdf` (PDF R1, 28 págs A4) | 141.597 | `6bab7c1692cb09d703c3f52c71bdc733c1ed6c7439e8c12f02d61071269c0a6d` |
| `hashes.md` (manifiesto R1) | 1.514 | `690a3a520a831d2ef06c8890acf21eda65e3c6fc2d91a26c6f2264175b399e4a` |
| `notes/consolidation-method.md` (nota de método R1) | 2.209 | `ac1efe9f9e8d7a5224f6de8011bb3ce47540e8975f7d6574d14297abd2c9a679` |

Siete partes fuente P1–P7 (originales conservados, sin modificar): P1 `8f75a49d…1f30c`, P3 `ccd68c91…f576af675`, P5 `ec063ee5…48c32355`, P2 `e80623e0…9150b`, P4 `11b00121…63057`, P6 `e594bc28…b71b771a`, P7 HTML `5a6506ef…40a`, P7 PDF `2a892849…775ca3`.

Documentos de la auditoría 002 (ya publicados en la rama): `audit-r1-independent.md` (23.857 bytes, `0f9d3730…7028`), `manifest-r1-verified.md` (5.765 bytes, `4e7fe75d…2e655`), informe de cambios R2 publicado en la rama bajo el nombre `audit-r1-criteria-matrix.md` (6.272 bytes, `9ec420f5…3707`) — ese nombre procede de una instrucción de nomenclatura anterior y se conserva sin atribuir el error a ninguna persona; el contenido es el informe exacto de cambios R2.

## Procedimiento de consolidación

1. Copia de `report.md` (R1) a `report-r2.md`, sin alterar el original.
2. Aplicación exclusiva de las 9 correcciones demostradas por la auditoría (§11 E de `report-r2.md`): H-01 (reconciliación de PASS a PARTIAL), H-02 (Anexo A actualizado), H-B2 (§8.4 como secundaria), H-03 (cita real de C03), H-04 (nota de limitación de corroboración), H-05 (referencias de C04), H-07 (U1 calificado), H-08 (D9 aclarado), H-06 (sección web como apéndice de entrega).
3. Comparación directa (`diff`): 57 líneas cambiadas (42 añadidas, 15 eliminadas), 536 → 563 líneas. Ninguna otra línea se tocó.
4. Anexo A reescrito para R2: las filas de `report-r2.md`, HTML R2 y PDF R2 remiten al manifiesto externo `hashes-r2.md`; las filas R1 y de las siete partes fuente conservan sus valores reales.
5. Construcción del HTML R2 desde `report.md` (copia de `report-r2.md`) con el sistema de artefactos web; verificación programática contra el informe (10 tablas, C01–C16, D1–D15, 13 SHA-256 reales del Anexo A).
6. Generación del PDF R2 desde `report-r2.md` (ver Herramientas); verificación por extracción de texto (C01–C16 completos, "ESTADO: PARTIAL", cita inventada de C03 ausente).
7. Cálculo de SHA-256 sobre los bytes finales de cada entregable y registro en `hashes-r2.md`.
8. Preparación del paquete de publicación con los cinco nombres exactos en la carpeta de destino.

## Herramientas utilizadas

- **HTML:** sistema de artefactos web de Muse (página estática construida desde `report.md`).
- **PDF:** Python 3 + fpdf2, script `/tmp/md2pdf_r2.py` (convierte `report-r2.md` a A4; las tablas se procesan celda a celda; la conversión directa HTML→PDF se descartó porque pierde el contenido de tablas renderizadas por JavaScript).
- **Hashes:** `sha256sum` (GNU coreutils) sobre los archivos finales; `wc -c` para tamaños exactos.
- **Verificación de texto:** `pdftotext` y `pdfinfo` (PDF abre, 30 páginas A4); `grep`/`diff` para conteos y referencias cruzadas.
- **Verificación de la rama:** clonación de solo lectura (`git clone --depth 1 --branch nexo-mission-02-pdf-2026-11-05 --filter=blob:none --sparse`) y comparación de hashes de los archivos ya publicados en la rama contra las copias locales.
- **Revisión del contenido:** tres pasadas adversariales separadas (A integridad de archivos, B cinco correcciones R1, C contenido) ejecutadas como subagentes.

## Procedimiento de cálculo SHA-256

`sha256sum <archivo>` sobre los bytes finales de cada entregable, después de la última edición. Nunca se calcularon hashes sobre texto reconstruido, fragmentos o contenido copiado parcialmente. El manifiesto `hashes-r2.md` no puede contener su propio hash de manera autocontenida: su hash se registra como evidencia externa en el informe de cierre de la misión y en un commit posterior.

## Etiquetas epistemológicas

Se conservan con su significado, con la taxonomía rectificada: **EVIDENCE** solo para afirmaciones verificadas en una fuente primaria consultada directamente en el pasaje pertinente, o cálculo/prueba reproducible con entradas y método identificables; **CORROBORATED** para apoyo secundario — la cantidad de resúmenes no sustituye una lectura primaria y fuentes que reescriben un mismo comunicado no cuentan como corroboraciones independientes; **INFERENCE** para conclusiones derivadas; **HYPOTHESIS** para explicaciones no verificadas; **PROPOSAL** para opciones de diseño no aprobadas; **UNKNOWN** para lo no resuelto. **«Heredado» es un atributo de procedencia** —verificación hecha en M02/M03 y no repetida en este expediente—, **no un nivel de evidencia**: una afirmación heredada conserva EVIDENCE solo si su fuente primaria fue consultada directamente en este expediente o su cálculo es reproducible; en caso contrario su nivel es CORROBORATED o inferior. «Index» es asimismo procedencia, no nivel de evidencia. [Rectificación MUSE-004-F (D-02): la equivalencia anterior «CORROBORATED = ≥2 fuentes independientes nombradas» queda retirada, conforme a §0 del informe rectificado g (M-02).] C14 se mantiene **PARCIALMENTE CONFIRMADA**; no se elevó a PASS. D-01 a D-12 se mantienen **SIN DECIDIR**. Ninguna propuesta arquitectónica se convirtió en requisito normativo. No se declara implementación, seguridad operativa ni conformidad técnica demostradas por evidencia meramente documental. El estado global sigue siendo **PARTIAL** mientras existan criterios de cierre sin evidencia suficiente.

## Qué se verificó y qué permanece UNKNOWN

**Verificado:** los 8 archivos locales de R1 (0 discrepancias); las 9 correcciones R2 y su coherencia entre secciones; todos los conteos (16 correcciones, 15 discrepancias, 12 materiales, 7 riesgos, 9 UNKNOWN, 12 decisiones); C14 parcialmente confirmada; D-01 a D-12 SIN DECIDIR en todas sus apariciones; el PDF R2 abre y corresponde al informe R2; los archivos ya publicados en la rama son byte a byte idénticos a las copias locales (audit-r1-independent.md, manifest-r1-verified.md, audit-r1-criteria-matrix.md, HTML R1, HTML original, HTML R2 bajo el nombre `auditoria-muse-autonomy-002-r1-independiente.html`).

**Permanece UNKNOWN:** U2 (U2-a/b/c), U3, U5. [Rectificación MUSE-004-F (D-02): lista actualizada a los estados vigentes a 2026-11-08 — U1 RESUELTO (lectura verbatim de SP 800-63B-4 §§2.3.2/3.2.13/Ap. B/Ap. E, 2026-11-07); U4 RESUELTO (no PARCIAL; fuentes primarias LF, A2A, AAIF y GitHub verificadas 2026-11-07); U6 RESUELTO (corrección epistemológica acotada); U7 RESUELTO (alcance acotado a SP 800-53 Rev. 5.1; cuarentena como fase general de restauración sigue PROPOSAL); U8 RESUELTO (lectura directa del PDF de Miller, 2026-11-07); U9 RESUELTO (precisión criptográfica: Merkle prueba inclusión/consistencia, no completitud). La integridad de los archivos una vez publicados quedó verificada (los cuatro archivos coinciden con el manifiesto R2); el commit de publicación es conocido: `96e227eb06134037fa5e01fabc8cfba4c384f476` (07-11-2026).]

## Limitaciones conocidas

- **No se utilizaron agentes independientes:** las tres pasadas de auditoría fueron subagentes que comparten el contexto de Snow, no revisores externos. No se afirma lo contrario.
- **Sin acceso de escritura a GitHub durante la preparación:** la integración de GitHub estaba en estado `not_connected` (`authenticated: false`); la rama se verificó solo en lectura (clonación pública). La publicación requiere autorización OAuth de GitHub e instalación de la app en el repositorio, o la subida manual de los cinco archivos.
- P2/P4/P6/P7 (documentos entregados como artefactos) no se re-verificaron en esta misión; sus hashes se heredan de la consolidación.
- `hashes.md` (R1) y `hashes-r2.md` no tienen ancla de integridad propia; su integridad descansa en la verificación externa posterior.
- Las lecturas verbatim de SP 800-63B-4, del PDF final de IR 8547 y de la spec A2A §8.4 siguen pendientes. [Rectificación MUSE-004-F (D-02): **superado** — las tres lecturas se cerraron el 2026-11-07: SP 800-63B-4 §§2.3.2/3.2.13/Ap. B/Ap. E (cierre U1); PDF final de IR 8547 íntegro, 2.204 líneas (Frente D); spec A2A §8.4 (MAY/SHOULD) confirmada en vivo en la spec `latest` por el Frente E (F-E15) — esta última no verificada contra el tag v1.0.1 ni archivada con instantánea, por lo que no se presenta como lectura primaria del tag.]


## Actualización de publicación y verificación posterior (2026-11-07)

Esta sección actualiza las notas de preparación anteriores, que describían el estado previo a la subida. Para el estado vigente prevalece esta sección.

- **Rama:** `nexo-mission-02-pdf-2026-11-05`.
- **Commit de publicación:** `96e227eb06134037fa5e01fabc8cfba4c384f476`.
- **Archivos efectivamente presentes en la rama:** `report-r2.md`, `expediente-consolidado-nexo-r2.html`, `hashes-r2.md` y esta nota de método en la raíz de `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`.
- **Ruta canónica de esta nota:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/consolidation-method.md`. La ruta `notes/consolidation-method.md` que figuraba en la primera versión del manifiesto no existe en el árbol publicado y debe corregirse allí.
- **PDF R2:** se generó una representación PDF durante la preparación, pero no existe un archivo PDF R2 separado en el árbol de la rama. El propietario confirmó que el HTML y el PDF representan el mismo expediente y aceptó el HTML como entrega suficiente. Por tanto, el HTML es el artefacto publicado canónico; esta aceptación de equivalencia de contenido no afirma identidad binaria ni publicación del PDF.
- **Integridad posterior a la subida:** se recuperaron los bytes UTF-8 de los cuatro archivos presentes en la rama y se recalcularon sus SHA-256 y tamaños. Los cuatro coinciden con los valores declarados para ellos en el manifiesto R2. El SHA-256 propio del manifiesto se conserva como comprobación externa, no dentro del mismo manifiesto.
- **Alcance del dictamen:** esta verificación prueba integridad documental de los archivos publicados; no prueba implementación, seguridad operativa, autoridad, conformidad técnica ni cierre de los UNKNOWN.

La frase anterior que indicaba que el commit de publicación era pendiente y que la integridad posterior a la subida seguía UNKNOWN queda superada por esta verificación posterior. [Rectificación MUSE-004-F (D-02): en esta copia de revisión, la superación parcial de esta frase queda extendida a las secciones «Etiquetas epistemológicas», «Qué se verificó y qué permanece UNKNOWN» y «Limitaciones conocidas», actualizadas arriba con los estados vigentes a 2026-11-08. Esta extensión vale solo dentro de esta copia de revisión (alternativa B); el canónico conserva su texto.] La limitación sobre la falta de agentes independientes permanece vigente: las tres pasadas fueron subagentes con contexto compartido y no revisores externos independientes.

## Actualización G (MUSE-AUTONOMY-004-G, 2026-11-08)

[Rectificación MUSE-004-G (C-01/D-02): esta copia G actualiza la copia F2 de la alternativa B — banner, referencias a los archivos g y esta sección. La taxonomía y la lista UNKNOWN ya eran las vigentes y no cambian; la salvedad de §8.4 (confirmada solo en `latest`, no contra el tag v1.0.1) se conserva. La decisión de gate entre A y B sigue pendiente.]
