# MISIÓN MUSE-AUTONOMY-004-I — BORRADOR PARA REVISIÓN DEL PROPIETARIO

**Estado:** BORRADOR — NO AUTORIZADO. No se ha ejecutado nada. No se ha modificado ningún archivo canónico ni de revisión.
**Fecha del borrador:** 2026-11-09.
**Origen:** siguiente acción mínima definida en `MUSE_004_H_ADVERSARIAL_REVIEW.md` y `MUSE_004_H_HANDOFF.md` (MUSE-AUTONOMY-004-H, completada 2026-11-09, dictamen: readiness documental SÍ, 0 críticos, 0 mayores, 2 menores nuevos H-05 y H-06 documentados para una corrección aparte).

## 0. Qué se corrige y qué no

La 004-H encontró **2 defectos MENORES** y ningún defecto crítico ni mayor. Esta misión los corrige, con su propia verificación. No re-audita nada más.

| Hallazgo | Severidad | Ubicación exacta (verificada por lectura directa, 2026-11-09) | Qué está mal |
|---|---|---|---|
| H-05 | MENOR | `review-g/closure-r2-rectified-review-g.md` L275, párrafo «Naturaleza de esta sección» del Addendum F | La frase «Esta copia es una **copia de revisión F2**» sobrevive en presente, referida a la copia actual. Contradice L306 (Addendum G): «Esta copia es una **copia de revisión G**». Heredada de F2 (línea byte-idéntica en `review-f/closure-r2-rectified-review-f2.md` L275), misma clase que H-02. Las demás menciones F2 del cierre son legítimas (L3, L283–L287, L319) y **no** se tocan. |
| H-06 | MENOR | `MUSE_004_G_D02_DECISION_GATE.md` L96 (§7); `Resumen ejecutivo MUSE-004-G.md` L29 y L46 (L46 cita el §7 del gate); `MUSE_004_G_CORRECTION_REPORT.md` L409 (cita del gate §7) | La glosa de la descomposición del 4/10 es aritméticamente falsa: «las 4 añadidas extra son el banner G y la sección "Actualización G"» (resumen L29: «el banner G (2)»). Medido con `diff`: canónico→G = 4 eliminadas / 10 añadidas; canónico→F2 = 4/6; F2→G = 2 eliminadas / 6 añadidas. Las 4 añadidas extra frente a F2 son **solo** las 4 líneas del bloque «Actualización G» (hunk `83a84,87`: blanco, título, blanco, párrafo). El banner es una sustitución 1-a-1 presente en ambas copias y aporta **0** añadidas extra. La cifra titular **4/10 es correcta**; solo la descomposición es falsa. |

**Comprobación adicional hecha al preparar este borrador (no estaba en la tabla de la 004-H):** la glosa falsa aparece también en el resumen L46, que cita el §7 del gate — la corrección debe arreglar L29 **y** L46, no solo L29. El manifiesto G (L73) y el manifiesto de hashes G (L61) afirman el 4/10 **sin** la descomposición falsa: no necesitan corrección de texto, pero el manifiesto de hashes sí debe actualizarse con el nuevo hash del cierre tras corregir H-05 (ver §3). Las menciones «copia de revisión F2» de `MUSE_004_G_DIAGNOSTIC_MATRIX.md` (L63, L117–L120) son referencias históricas legítimas a archivos F2 y **no** son H-05.

## 1. Objetivo

Corregir H-05 y H-06 en copias de revisión separadas, sin tocar los canónicos R2 ni los originales G (que se conservan como evidencia), recalcular integridad, y dejar constancia verificable de cada cambio. El dictamen global de G seguirá PARCIAL por publicación aunque esta misión salga limpia: la publicación de los archivos corregidos corresponde al propietario y se verifica después.

## 2. Punto de partida (verificado, no re-verificar salvo discrepancia)

- **Repositorio:** `snowdenxrp/aldea-ia`, rama `nexo-mission-02-pdf-2026-11-05`. HEAD verificado por última vez `f2b7edfe` (Kevin subió el resumen ejecutivo, byte-idéntico). La publicación de los 4 .md G sigue pendiente; no es alcance de esta misión verificar la rama.
- **Carpeta local:** `~/workspace/research_notes/nexo-autonomy-004-g/` — 8 informes de misión + `review-g/` con las 5 copias G finales + `Resumen ejecutivo MUSE-004-G.md`.
- **Copias G finales (verificadas con `sha256sum`, 2026-11-09):**

| Archivo | Bytes | SHA-256 |
|---|---|---|
| `review-g/report-r2-rectified-review-g.md` | 159.176 | `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b` |
| `review-g/closure-r2-rectified-review-g.md` | 48.458 | `d7e85d53e72acb6729a07624ca62026128e0069c8c275210250aeca469519655` |
| `review-g/expediente-consolidado-nexo-r2-rectified-review-g.html` | 195.786 | `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9` |
| `review-g/consolidation-method-rectified-review-g.md` | 13.351 | `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` |
| `review-g/hashes-r2-rectification-review-g.md` | 8.811 | `44b97e7f867e4f067bc42e4fdac5231cc3aa72414310485e2cdb21098e19f98d` |

- **Informes G con la glosa H-06 (también finales, `sha256sum` 2026-11-09):** `MUSE_004_G_D02_DECISION_GATE.md` 13.054 bytes `d39db99c911d6ed3aae023dc074e503c85cfe6079c816ee0914621d47a75b222`; `MUSE_004_G_CORRECTION_REPORT.md` 73.137 bytes `85be5bf19e472628f99f117e9e72cce14b5ee0de49e1879124c5988971f6b2e6`; `Resumen ejecutivo MUSE-004-G.md` 22.807 bytes `ddec26fb72c7f79c762d4d1c0ecc550b0ca2167af04fcfd9521322edc4585f44`.
- **Informes de la 004-H (fuente de los hallazgos):** `~/workspace/research_notes/nexo-autonomy-004-h/MUSE_004_H_ADVERSARIAL_REVIEW.md` (16.433 bytes, `4a98dafb…`), `MUSE_004_H_RECONCILIATION.md` (18.779 bytes, `56e88cf9…`), `MUSE_004_H_HANDOFF.md` (16.135 bytes, `4f38cf6d…`).

## 3. Alcance: solo H-05 y H-06

**H-06 — corrección directa (la glosa es texto propio de G, no texto histórico).** Sustituir en los 4 pasajes (gate L96, resumen L29 y L46, informe de corrección L409) la descomposición falsa por la correcta, sin tocar la cifra 4/10:

> «las 4 añadidas extra son solo las 4 líneas del bloque "Actualización G" (hunk `83a84,87`: blanco, título, blanco, párrafo); el banner G es una sustitución 1-a-1 presente en ambas copias y aporta 0 añadidas extra».

Antes de aplicar, barrer todos los documentos G con `grep` de «banner G» y «añadidas extra» para confirmar que no queda ningún otro pasaje con la glosa (el barrido del borrador encontró solo esos 4; el manifiesto G y el manifiesto de hashes G no la contienen).

**H-05 — corrección condicionada a la decisión del propietario sobre la redacción.** El texto del Addendum F es histórico: la frase de L275 es la que F2 escribió sobre sí misma. Por eso la misión **no** reescribe L275 por su cuenta. Opciones preparadas por la misión, con el texto exacto propuesto para cada una:

- **Opción A (anotación, no destructiva — recomendada):** conservar la frase histórica intacta y añadir una nota editorial al pie del Addendum F (o en el Addendum G, con referencia a L275) que diga que esa frase es texto histórico de F2 y que la copia actual es G, como ya declara L306.
- **Opción B (corrección con registro):** cambiar L275 a «copia de revisión G» y registrar la redacción original F2, byte a byte, en el informe de corrección de esta misión y en el manifiesto, como texto superseded.

Si Kevin lanza la misión eligiendo A o B, se aplica esa opción. Si la lanza sin elegir, la misión aplica H-06, prepara ambas opciones con su texto exacto, y **se detiene antes de tocar L275**, dejando la decisión documentada como pendiente — no adivina la redacción.

**Archivos que cambian y archivos que no cambian.** Entre los 5 entregables, solo el **cierre** cambia de contenido (H-05) y el **manifiesto de hashes** cambia para registrar el nuevo hash y tamaño del cierre y la constancia de la corrección. El informe, el HTML y la nota de método **no** cambian: sus hashes quedan iguales. Los 3 informes G (gate, corrección, resumen) se corrigen como **versiones nuevas** en la carpeta de esta misión; los originales G se conservan sin modificar como evidencia. Atención al re-medir: la línea L275 del cierre era byte-idéntica entre F2 y G, así que al corregirla el diff f2→g del cierre **ya no será 7/38** — re-medirlo con `diff` y registrar la cifra nueva, sin afirmar que se mantiene.

**Nomenclatura (propuesta, no decisión):** misión `MUSE-AUTONOMY-004-I`; copias corregidas con sufijo `-review-i` (p. ej. `closure-r2-rectified-review-i.md`) en `~/workspace/research_notes/nexo-autonomy-004-i/review-i/`. Se usa `-i` y no `-h` porque `004-H` ya es la pasada adversarial (que no produjo copias de revisión) y reutilizar la letra confundiría el dictamen H con las copias. Kevin puede cambiar el nombre; la sustancia no depende de él.

## 4. Lo que NO hace esta misión

- No re-audita M02, M03, M03-B, C01–C16, H-01–H-04, ni el fondo heredado de R2, salvo comprobar que la corrección no rompe nada de lo verificado por la 004-H.
- No decide D-01 a D-12 (D-02 sigue pendiente del propietario, A o B, sin plazo, y no bloquea esta corrección).
- No eleva UNKNOWN (U2, U3, U5 siguen UNKNOWN; U1/U4/U6/U7/U8/U9 RESUELTOS acotados), no cambia C14 (PARCIALMENTE CONFIRMADA), no declara PASS ni LISTO global.
- No modifica canónicos R2, NCS M0, P07, código, tests, CI ni workflows; no elimina originales ni historial; no publica nada en GitHub (integración NOT_CONNECTED); no verifica la publicación.
- No corrige las menciones históricas legítimas a F2 (cierre L3/L283–L287/L319, matriz de diagnóstico L63/L117–L120, registro F del informe y del HTML).

## 5. Límites de autoridad (heredados de G y de H)

PROHIBIDO: modificar o sobrescribir canónicos R2 y originales G; decidir D-01 a D-12; elevar UNKNOWN a RESUELTO; declarar PASS sin evidencia; inventar fuentes, hashes, resultados o verificaciones; ocultar limitaciones de acceso o verificación; reescribir texto histórico sin la decisión del propietario (§3, H-05).

## 6. Entregables

1. `review-i/closure-r2-rectified-review-i.md` — cierre corregido (H-05 según la opción elegida).
2. `review-i/hashes-r2-rectification-review-i.md` — manifiesto actualizado con el nuevo hash y tamaño del cierre, la constancia de H-05/H-06 y la tabla de correspondencia.
3. Versiones corregidas de los 3 informes G (gate, informe de corrección, resumen ejecutivo) con la glosa H-06 corregida en los 4 pasajes; originales G conservados intactos.
4. `MUSE_004_I_CORRECTION_REPORT.md` — antes/después por hallazgo y por archivo y línea, diffs re-medidos con `diff` (incluido el nuevo diff f2→i del cierre), hashes recalculados con `sha256sum`, recuento de marcas del cierre, y registro de la decisión de redacción H-05 (opción elegida o pendiente).
5. `MUSE_004_I_HANDOFF.md` — dictamen explícito, inventario, hashes, limitaciones y pendientes concretos de publicación (qué archivos corregidos hay que subir y cuáles sustituyen a los G publicados/superseded).

La verificación es parte de esta misión (re-medición de diffs, marcas y hashes, y coherencia MD↔HTML en los pasajes tocados — el HTML no cambia, así que la paridad 29/29 debe mantenerse). Una pasada adversarial separada sobre esta corrección queda disponible si Kevin la pide después; no se auto-declara como tal.

## 7. Criterio de aceptación

H-05 y H-06 corregidos y verificados: ningún documento conserva la auto-identificación F2 referida a la copia actual ni la glosa falsa del 4/10 (barrido `grep` limpio, salvo citas históricas etiquetadas); la cifra 4/10 intacta; los diffs, marcas y hashes re-medidos coinciden con lo declarado; los canónicos intactos; D-01–D-12 SIN DECIDIR; ningún PASS nuevo. **Aun así, el dictamen global de G seguirá PARCIAL hasta que los archivos corregidos se publiquen y se verifique la publicación.** Esta misión no declara LISTO global.

## 8. Decisión que se pide a Kevin

Responder con una palabra (o con la opción de redacción, si ya la tiene clara):

1. **«Lánzala»** — se ejecuta esta corrección tal como está delimitada aquí.
2. **Redacción H-05: A o B** — anotación no destructiva (A, recomendada) o corrección con registro (B). Si no elige, la misión aplica H-06 y deja H-05 preparada y pendiente, sin tocar L275.
