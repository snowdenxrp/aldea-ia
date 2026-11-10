# MISIÓN MUSE-AUTONOMY-004-J — INFORME DE RECONCILIACIÓN DOCUMENTAL FINAL 004-I / REVIEW-G

**Misión:** MUSE-AUTONOMY-004-J — Reconciliación documental final 004-I / review-G.
**Encargo:** propietario (Kevin), 2026-11-10 12:12 CST («RECONCILIACIÓN DOCUMENTAL FINAL 004-I / REVIEW-G»).
**Ratificación incorporada:** propietario, 2026-11-10 12:17 CST (H-05 OPCIÓN A; D-02 documental OPCIÓN B).
**Fecha de ejecución:** 2026-11-10.
**Método:** revisión independiente, exclusivamente documental y de SOLO LECTURA. Nada editado, creado, borrado, reemplazado, subido ni modificado en la rama. Ningún commit, PR, código ni archivo local alterado. Los dos entregables de esta misión (este informe y su handoff) son los únicos archivos nuevos, creados en `research_notes/nexo-autonomy-004-j/`.
**Punto de partida verificado por el coordinador (no copiado):** `git ls-remote` + clon de solo lectura (`/tmp/aldea-ia-j`, `--depth 1`), rama `nexo-mission-02-pdf-2026-11-05`, repo `snowdenxrp/aldea-ia`, HEAD **`9fefe3b3c25edefd5a204693a7501afd8550d8ab`** («Add files via upload», 2026-11-10 12:10:43 -0600). HEAD anterior en el encargo: `6ff9a143c26d38eabea1547549b443fa50fab0cf` (12:06 CST). El HEAD avanzó durante la misión por una subida del propietario a las 12:10:43; todas las mediciones de este informe son sobre `9fefe3b3`, salvo indicación expresa.
**Etiquetas de evidencia:** EVIDENCIA = medido directamente por el coordinador con `sha256sum`/`diff`/`grep` sobre bytes del clon o de archivos locales verificados por hash; CORROBORADO = verificado por el revisor adversarial y re-medido por el coordinador, o medido por el revisor y confirmado coherente; INFERENCIA = conclusión derivada de evidencia, marcada como tal; UNKNOWN = no verificable en esta sesión. Ningún SHA-256 se declara verificado usando únicamente un Git blob SHA: todos los SHA-256 de este informe se calcularon con `sha256sum` sobre bytes. Ningún Git blob SHA se calcula ni se cita.
**Limitaciones:** las pasadas comparten contexto (coordinador y revisor adversarial son subagentes con contexto compartido, no revisores externos independientes). El clon es superficial (`--depth 1`): solo el HEAD `9fefe3b3` está en el log; los commits citados `96e227eb…`, `0ef2f2b8…` y `459e5672…` no pudieron verificarse desde este clon (nada los contradice; quedan como no verificables en esta sesión). La integración GitHub está NOT_CONNECTED: no hay acceso de escritura; todo es clon de solo lectura.

## §0. Corrección de una premisa del encargo y de la ratificación (EVIDENCIA)

El encargo (12:12 CST) y la ratificación (12:17 CST) parten de la verificación de las 12:06 (HEAD `6ff9a14`), según la cual el informe review-G y el HTML «siguen sin publicarse en la rama». **Esa premisa es obsoleta.** Medido por el coordinador en HEAD `9fefe3b3` (commit 12:10:43, siete minutos antes de la ratificación):

- `report-r2-rectified-review-g.md`: 159.176 bytes, SHA-256 `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b` — PUBLICADO y byte-idéntico al local.
- `expediente-consolidado-nexo-r2-rectified-review-g.html`: 195.786 bytes, SHA-256 `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9` — PUBLICADO y byte-idéntico al local.

El revisor adversarial confirmó independientemente la misma corrección. Consecuencia: el motivo que la ratificación da para no declarar el cierre global («informe review-G y HTML siguen sin publicarse») **ya no se sostiene para esos dos archivos**. Lo que sigue pendiente de publicación es el manifiesto G (ver MAYOR-2, §F), no el informe ni el HTML. No se ha confirmado con el propietario si conocía la subida de las 12:10 al ratificar a las 12:17; se registra la pregunta, no se presume la respuesta.

## A. Veredicto general: PARCIAL

**PARCIAL — la publicación de la tabla de 8 archivos más los dos entregables antes discrepantes está completa y verificada byte a byte, y H-06 está verificado correcto en sus cuatro ubicaciones; pero el manifiesto G (quinto entregable) no está en la rama, el manifiesto de Pasada 7 en la rama sigue en versión pre-final con una afirmación de coincidencia hoy falsa, y las decisiones ratificadas H-05 (A) y D-02 (B) aún no están aplicadas.**

No es CERRADO: quedan discrepancias (MAYOR-1, MAYOR-2, menor-1, menor-2, menor-3) y una aplicación pendiente (H-05 A). No es BLOQUEADO: ninguna discrepancia impide avanzar; las reparaciones son conocidas, acotadas y no requieren redactar nada nuevo salvo el registro de ratificación y la aplicación de H-05 A. No se declara PASS nuevo ni LISTO PARA REVISIÓN FINAL.

## B. Tabla de los ocho archivos: función, coherencia con el manifiesto y estado

Manifiesto de referencia: «Manifiesto review-i.md» publicado (13.210 bytes, SHA-256 `3e2dcff4dd3b169d29d3682e3a927a63d768ba7eefb23e8a8974dbfd28689b7a`, medido en el clon; su hash propio consta como evidencia externa en «Informe de corrección 004-I.md» L110, verificado). Todas las comparaciones son SHA-256 sobre bytes del clon contra lo declarado en el manifiesto.

| # | Archivo publicado (rama) | Función documental | Tamaño / SHA-256 medido | Coherencia con el manifiesto | Estado |
|---|---|---|---|---|---|
| 1 | `Cierre review-i.md` | Cierre rectificado review-i; H-05 intacto (L275 «F2» / L306 «G»), byte-idéntico al cierre G | 48.458 / `d7e85d53e72acb6729a07624ca62026128e0069c8c275210250aeca469519655` | Coincide exactamente con la tabla del manifiesto (48.458 / `d7e85d53…`) | CONFIRMADO |
| 2 | `Manifiesto review-i.md` | Manifiesto SHA-256 de las copias review-i; registro vigente de integridad; constancia H-06/H-05 | 13.210 / `3e2dcff4dd3b169d29d3682e3a927a63d768ba7eefb23e8a8974dbfd28689b7a` | Es el propio manifiesto; su hash consta como evidencia externa en el informe 004-I L110. Sus declaraciones (tablas, diffs, marcas) verificadas en §B.1 | CONFIRMADO |
| 3 | `Gate corregido.md` | Decisión de gate D-02 (defecto del 4.º canónico): delimita A/B, recomienda B técnicamente, no decide | 13.198 / `c286a168b5485409d2a81147a6e922b9633e91a7bfed7967cdaa72ba9db957f3` | Coincide exactamente (13.198 / `c286a168…`); original G 13.054 / `d39db99c…` declarado SUPERSEDED | CONFIRMADO |
| 4 | `Informe de corrección corregido.md` | Informe de corrección G con H-06 aplicado (L409) | 73.281 / `c6bb0c0bf17f630b78671c0a5f57ee6144212ad7500afa566b258642f4b3b6fb` | Coincide exactamente (73.281 / `c6bb0c0b…`); original G 73.137 / `85be5bf1…` declarado SUPERSEDED | CONFIRMADO |
| 5 | `Resumen ejecutivo corregido.md` | Resumen ejecutivo G con H-06 aplicado (L29, L46) | 23.039 / `ea549ab01c905b2756370d41baf33601eb9d23288696f0703b7ccc415703941f` | Coincide exactamente (23.039 / `ea549ab0…`); original G 22.807 / `ddec26fb…` declarado SUPERSEDED | CONFIRMADO, con menor-1 (§F) en su §5 |
| 6 | `consolidation-method-rectified-review-g.md` | Nota de método G (alternativa B, copia de revisión); referencia de trabajo tras la ratificación D-02 B | 13.351 / `5356bd1c60b8808c06c9f01803212011f3ee1992b9be4ac3862b2ed0f3d3c9bf` | Coincide exactamente (13.351 / `5356bd1c…`); canónico 9.720 / `7295fedb…` intacto en la rama, verificado | CONFIRMADO |
| 7 | `Informe de corrección 004-I.md` | Registro de misión 004-I: corrección H-06 (antes/después por pasaje), H-05 preparado (§3), verificación puntos 1–8, dictamen permitido | 18.464 / `fa73ac53528d254459cd853fcd3530acd4b11cc3a64b2c8232f30ca1f6de9ec7` | No forma parte de la tabla de publicación del manifiesto (ver §B.2); su contenido es coherente con el manifiesto (hashes, diffs, marcas) | CONFIRMADO como registro; NO es entregable de la tabla |
| 8 | `Handoff 004-I.md` | Handoff de continuidad 004-I (protocolo de eficiencia): qué se recibió, verificó, cambió; inventario; pendientes; tabla de publicación §6 | 9.825 / `2ff5b85eee8871af5aaaf104122787c0ff58afaf6881987df2f81c341ef57d77` | No forma parte de la tabla de publicación del manifiesto (ver §B.2); su hash se establece por medición directa en esta misión (no consta citado en el informe 004-I) | CONFIRMADO como registro; NO es entregable de la tabla |

**Archivos adicionales de la publicación (fuera del inventario de 8, verificados en el mismo HEAD):**

| Archivo publicado (rama) | Tamaño / SHA-256 medido | Estado |
|---|---|---|
| `report-r2-rectified-review-g.md` | 159.176 / `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b` | CONFIRMADO (ver §C) |
| `expediente-consolidado-nexo-r2-rectified-review-g.html` | 195.786 / `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9` | CONFIRMADO (ver §C) |

### B.1. Coherencia del manifiesto con lo medido (EVIDENCIA)

- **Tabla de 5 archivos de revisión:** informe 159.176 / `89fb7665…`, cierre 48.458 / `d7e85d53…`, HTML 195.786 / `98a207b6…`, método 13.351 / `5356bd1c…` — los 4 coinciden con lo medido en la rama; el 5.º (el propio manifiesto) no puede autocontenerse y su hash consta externamente en el informe 004-I L110 (verificado).
- **Tabla de 3 informes corregidos:** gate 13.198 / `c286a168…`, corrección 73.281 / `c6bb0c0b…`, resumen 23.039 / `ea549ab0…` — los 3 coinciden con lo medido; los originales G declarados SUPERSEDED (13.054 / `d39db99c…`, 73.137 / `85be5bf1…`, 22.807 / `ddec26fb…`) coinciden con los archivos locales verificados por hash.
- **Tabla de referencia (bases F2, originales MUSE-004, canónicos R2):** canónicos verificados en la rama — `report-r2.md` 113.706 / `e41c8f3b…`, `closure-r2.md` 21.346 / `0d9ed5ff…`, `hashes-r2.md` 4.450 / `cde302f0…`, `consolidation-method.md` 9.720 / `7295fedb…` (todos coinciden). Bases F2 verificadas en local — informe 147.584 / `dacefd69…`, cierre 42.702 / `80a82481…`, HTML 184.564 / `28e2b188…`, método 12.800 / `b8711617…`, manifiesto 5.248 / `2f2e7da5…` (todos coinciden).
- **Diffs declarados, re-medidos por el coordinador con `diff` (desglose eliminadas/añadidas):** informe f2→g **21/44** ✓; cierre f2→i **7/38** ✓ (y cierre f2→g 7/38, coherente porque review-i es byte-idéntico a G); HTML f2→g **32/46** ✓ (base F2 correcta: 184.564 bytes, `28e2b188…`; la primera medición con la base MUSE-004, 171.310 bytes, dio 53/81 y fue descartada por base incorrecta, no por discrepancia del manifiesto); método f2→g **2/6** ✓; canónico→G método **4/10** ✓ (ver §D).
- **Marcas `[Rectificación MUSE-004-G]` (ocurrencias, `grep -o`):** informe 29 (24 líneas), HTML 29 (25 líneas), cierre 8 (7 líneas), método 2 — coinciden con lo declarado; paridad MD↔HTML 29/29 mantenida. Marcas `(D-02)`: informe 12, HTML 12, método 5, cierre 0 — «12 por formato» se refiere a informe/HTML.
- **Constancia H-06/H-05 del manifiesto:** H-06 declarado corregido en los 4 pasajes con la descomposición correcta y la cifra 4/10 intacta — verificado en §D. H-05 declarado PREPARADO, NO CORREGIDO, decisión PENDIENTE — era exacto al redactarse (2026-11-09); tras la ratificación del 2026-11-10 12:17 (ver §E) su estado es RATIFICADA OPCIÓN A, pendiente de aplicación. El manifiesto, como documento histórico, no se reescribe: el cambio de estado se registra en este informe (§E) y deberá reflejarse en la aplicación (ver §H).
- **«0 ocurrencias vivas» de la glosa falsa:** verificado (ver §D). La única cita de la glosa en el manifiesto es su L35, etiquetada explícitamente como redacción superseded falsa.

### B.2. Función documental de los archivos 7 y 8 (EVIDENCIA)

«Informe de corrección 004-I.md» y «Handoff 004-I.md» son **registros de la misión 004-I, no entregables de la tabla de publicación de 8 archivos**. Evidencia:

- El handoff 004-I §6 declara expresamente: «Los informes de esta misión […] son registros locales; pueden subirse como evidencia si el propietario lo decide. No forman parte de los cinco entregables de revisión». El propietario los subió (HEAD `6ff9a14`); su presencia en la rama es **legítima como evidencia**, no un error.
- El informe 004-I §7 registra fuera de alcance la verificación de publicación y la decisión D-02; su §8 limita su dictamen a H-06 corregido y H-05 preparado. Nada en ellos afirma ser entregable de la tabla de publicación.
- El manifiesto review-i no los lista en su tabla de publicación. No hay contradicción: el inventario de 8 archivos del encargo mezcla dos categorías — 6 archivos de la tabla de publicación (n.º 1–6) y 2 registros de misión (n.º 7–8). La tabla de publicación completa es de 8 archivos (5 de revisión + 3 corregidos); con informe G y HTML G, el conjunto publicado verificado es de 10 archivos.
- **Consecuencia:** los 2 registros no sustituyen a ningún entregable. La discrepancia original (informe review-G y HTML ausentes) no se explica por ellos: en HEAD `6ff9a14` esos dos archivos estaban genuinamente ausentes y los registros ocupaban su lugar en el inventario de «los ocho más recientes» por ser los últimos subidos, no por sustituirlos.

## C. Resolución de los dos entregables discrepantes: informe review-G y HTML review-G

**RESUELTOS — PRESENTES, no renombrados, no sustituidos, no innecesarios.** (EVIDENCIA)

- **Informe review-G** (`report-r2-rectified-review-g.md`): 159.176 bytes, SHA-256 `89fb766555e1febcaef8c00192c3a7a9071a6fc65f44ff40dd25b26dff12993b`, en `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/` con su nombre esperado, byte-idéntico al local. **HTML review-G** (`expediente-consolidado-nexo-r2-rectified-review-g.html`): 195.786 bytes, SHA-256 `98a207b6b7c8561952c3aca02cdb480765d03ebbae8ab553cb62d919c03a16a9`, misma carpeta y nombre esperado, byte-idéntico al local.
- **Alcance de la búsqueda (para no presentar una ausencia de búsqueda como prueba):** `git ls-tree -r HEAD` sobre el árbol completo (2.509 archivos). Búsqueda por tamaño: exactamente UN archivo de 159.176 bytes y UN archivo de 195.786 bytes en todo el árbol, ambos en la carpeta esperada. Mismo contenido implica mismo tamaño, por lo que la búsqueda por tamaño descarta copias renombradas o duplicadas en cualquier ruta. Búsqueda por nombre parcial (`review-g`, `rectified`, `expediente`, `report-r2`): 7 rutas, todas en la carpeta esperada; ninguna otra copia de estos dos archivos. Búsqueda por hash: los SHA-256 medidos coinciden con los declarados en el manifiesto review-i y en el handoff 004-I §6.
- **Historia temporal de la discrepancia (EVIDENCIA):** en HEAD `6ff9a14` (12:06 CST, verificado por Snow) ambos archivos estaban genuinamente ausentes de la carpeta y el HTML publicado era la versión superseded de 195.843 bytes (`210e29ab…`). En HEAD `9fefe3b3` (commit 12:10:43 CST, «Add files via upload») ambos están presentes. La discrepancia se resolvió por **subida posterior del propietario**, no por renombrado ni sustitución. El archivo superseded «HTML rectificado G.html» (195.843 bytes, `210e29ab…`) sigue en la rama junto al corregido: coexisten como historia, no como sustitución.
- **Conclusión:** la tabla de publicación de 8 archivos está completa: 8/8 presentes y byte-idénticos (ver §B). Con informe G y HTML G, el conjunto de entregables de revisión publicado es 5/5 en archivos de revisión… **salvo el manifiesto G** (ver MAYOR-2, §F): el quinto entregable (manifiesto G, 8.811 bytes, `44b97e7f…`) no está en la rama, aunque el informe G (Anexo A) y el HTML G lo citan como manifiesto externo. La discrepancia original queda resuelta; queda abierto el hueco del manifiesto G.

## D. Resultado de H-06, con evidencia de las cuatro ubicaciones

**H-06: CORREGIDO y verificado en los 4 pasajes, cifra 4/10 intacta, barrido limpio.** (EVIDENCIA, medido por el coordinador en las copias PUBLICADAS de la rama; corroborado por el revisor adversarial.)

Descomposición correcta (idéntica en los 4 pasajes): «las 4 añadidas extra son solo las 4 líneas del bloque "Actualización G" (hunk `83a84,87`: blanco, título, blanco, párrafo); el banner G es una sustitución 1-a-1 presente en ambas copias y aporta 0 añadidas extra».

| # | Ubicación (copia publicada) | Evidencia medida |
|---|---|---|
| 1 | Gate corregido.md, L96 (§7) | Descomposición correcta presente, con nota de la auditoría final (H-01). Cifra 4/10; 4/6 solo para F2. |
| 2 | Resumen ejecutivo corregido.md, L29 (tabla H-01) | Descomposición correcta presente. Cifra 4/10; 4/6 solo para F2. |
| 3 | Resumen ejecutivo corregido.md, L46 (tabla de corrección, cita del gate §7) | Descomposición correcta presente (cita del §7). |
| 4 | Informe de corrección corregido.md, L409 (cita del gate §7) | Descomposición correcta presente (cita del §7). |

**Verificación aritmética (EVIDENCIA, re-medida con `diff`):**

- Canónico → copia G (nota de método): **4 eliminadas / 10 añadidas**. Desglose: 4 sustituciones 1-a-1 (L52, L58, L66, L81 — neto 0 cada una); banner añadido `2a3,4` (+2 líneas, presente también en F2); hunk `81c83,87` (1 línea → 5 líneas, neto +4). Total: 4 eliminadas, 10 añadidas. ✓
- Canónico → copia F2: **4/6** (medido). F2 → G: **2/6**, desglose exacto: `3c3` (banner, sustitución 1-a-1, neto 0), `54c54` (referencia f2→g, neto 0), `83a84,87` (bloque «Actualización G», +4 líneas). Las 4 añadidas extra de G respecto a F2 son **únicamente** el bloque «Actualización G». ✓
- El banner G es sustitución 1-a-1 en F2→G (`3c3`), neto 0; en canónico→G su aporte es el mismo que en canónico→F2 (`2a3,4`), no un extra de G. La descomposición es aritméticamente exacta. ✓
- «4/10» en el cierre review-i: 0 ocurrencias (correcto; el cierre no menciona el diff 4/10).

**Barrido de la glosa falsa (EVIDENCIA):** patrón «son el banner G» — **0 ocurrencias vivas** en los 8 archivos y en informe G y HTML G. Supervivencias, todas citadas, ninguna viva:

- Manifiesto review-i.md L35: 1 ocurrencia, en la viñeta H-06, etiquetada explícitamente como «descomposición falsa» / «redacción superseded». Es la única cita prevista por 004-I.
- Informe de corrección 004-I.md L39, L45, L51, L57: 4 ocurrencias, todas en bloques «Antes:» que documentan lo corregido (el revisor adversarial contó 3 con el patrón más estrecho «el banner G y la sección», que excluye L45 por el «(2)» intercalado; sustancia idéntica).
- Handoff 004-I.md: 1 ocurrencia, en cita que describe el hallazgo.
- Conteo de «banner G» por archivo (publicados): cierre 0, manifiesto 1 (L35), gate 1 (L96, correcto), informe 1 (L409, correcto), resumen 2 (L29, L46, correctos), método 0, informe 004-I 10 (citas del hallazgo), handoff 004-I 1 (cita). Ninguna es texto vivo del expediente con la glosa falsa.

## E. Decisiones: registro formal de las ratificaciones y lo que queda

### E.1. H-05 — RATIFICADA OPCIÓN A (2026-11-10 12:17 CST)

**Decisión del propietario (hecho, no propuesta):** conservar la frase histórica existente en L275 del cierre; añadir una nota editorial que explique la actualización y permita comprender el contexto sin perder la trazabilidad histórica; mantener identificable la redacción original. **Justificación del propietario:** preservar el historial documental y evitar que una corrección editorial borre el contexto de una versión anterior. La nota debe aclarar la situación actual sin alterar el significado histórico de la frase.

**Texto exacto preparado (EVIDENCIA — existe en el informe 004-I publicado, §3, L79; no se inventa una nueva redacción):**

> **Nota editorial (MUSE-AUTONOMY-004-I, opción A — aplicada por decisión del propietario):** la frase «Esta copia es una **copia de revisión F2**» de este Addendum F es texto histórico de MUSE-AUTONOMY-004-F, conservado íntegro: F2 la escribió sobre sí misma. La copia actual es una **copia de revisión G**, como declara el Addendum G (L306). No se ha modificado el texto histórico.

**Estado actual (EVIDENCIA):** L275 sigue intacto en el cierre publicado («Esta copia es una **copia de revisión F2**», Addendum F) y L306 sigue diciendo «copia de revisión G» (Addendum G). La ratificación **no está aplicada**: la nota editorial no existe aún en ningún cierre. La aplicación requiere misión separada con autorización expresa de ejecución (esta misión es de solo lectura y la ratificación no autoriza ejecutar cambios en GitHub). Previsión registrada (no medida, a re-medir al aplicar): con A, el diff del cierre f2→g dejará de ser 7/38 y pasará a 7/(38+N), donde N es la longitud final de la nota; el cierre cambiará de hash y tamaño, y el manifiesto deberá actualizarse.

**Lo que ya NO es pendiente:** la decisión (A). **Lo que sigue pendiente:** la aplicación de A y su verificación.

### E.2. D-02 documental (gate) — RATIFICADA OPCIÓN B (2026-11-10 12:17 CST)

**Decisión del propietario (hecho, no propuesta):** adoptar `consolidation-method-rectified-review-g.md` como referencia de trabajo vigente para el método de consolidación del expediente R2 rectificado; conservar intacto `consolidation-method.md` como evidencia histórica; identificar claramente cuál es la referencia de trabajo y cuál es el documento canónico histórico. **Justificación:** mantener coherencia entre el método y el expediente rectificado, sin sobrescribir ni eliminar el documento original.

**Estado actual (EVIDENCIA):** las condiciones materiales de B ya se cumplen — la copia G del método está publicada (13.351 bytes, `5356bd1c…`, verificada) y el canónico sigue intacto (9.720 bytes, `7295fedb…`, verificado). Lo que faltaba era la decisión, y ya está ratificada. El gate §9 exigía que la elección quedara «registrada con fecha y alcance»: este informe es ese registro formal (fecha 2026-11-10 12:17 CST; alcance: referencia de trabajo únicamente; la copia G sigue siendo copia de revisión, no documento oficial; no concede PASS; no altera estados; no sustituye ni modifica el canónico).

**Lo que ya NO es pendiente:** la decisión (B). **Lo que sigue pendiente:** el registro visible en la rama que identifique la referencia de trabajo (ver §H, propuesta 2) y la actualización de las afirmaciones de «pendiente» en los documentos publicados (ver MAYOR-1, §F), que son texto histórico y no se reescriben.

**Aclaración de identificadores (EVIDENCIA):** la D-02 ratificada aquí es la del **gate documental** (el 4.º canónico fuera de alcance). Es distinta de la decisión del propietario D-02 (custodia y recuperación de la clave raíz, Shamir/SLIP-39), que sigue **SIN DECIDIR** y pertenece a otra serie. El informe G L25 («C12 […] presupone D-01/D-02/D-08 SIN DECIDIR») se refiere a estas últimas y **no** queda afectado por la ratificación. D-01 a D-12 (decisiones del propietario) siguen todas SIN DECIDIR; ninguna se resuelve por esta ratificación ni por inferencia.

## F. Discrepancias nuevas, separadas de asuntos ya conocidos

Hallazgos del revisor adversarial independiente (subagente con contexto compartido, no revisor externo); los marcados EVIDENCIA fueron re-verificados por el coordinador con mediciones propias. Ningún hallazgo es CRÍTICO.

### F.1. MAYOR-1 — Decisiones ratificadas que los documentos publicados declaran pendientes (obsolescencia sobrevenida)

**Severidad: MAYOR. Estado: NUEVO (causado por la ratificación del 2026-11-10 12:17; no existía al redactarse los documentos).**

Los documentos publicados —redactados 2026-11-08/09, antes de la ratificación— afirman en presente que H-05 y D-02-gate están pendientes (verificado por el coordinador, ubicaciones exactas):

- `Gate corregido.md` L6: «**Estado:** DECISIÓN PENDIENTE DEL PROPIETARIO»; §9: «El propietario debe elegir **A** o **B**, o aplazar».
- `Resumen ejecutivo corregido.md` L117 (§8.5): «**Decisión D-02 (propietario, sin plazo):** elegir entre A […] y B […]».
- `consolidation-method-rectified-review-g.md` L87 (bloque «Actualización G»): «La decisión de gate entre A y B sigue pendiente».
- `Cierre review-i.md` L288 (viñeta D-02, Addendum F) y L319 (viñeta C-01, Addendum G): «La alternativa B sigue pendiente de decisión del gate».
- `Informe de corrección 004-I.md` §3 (L65): «decisión PENDIENTE del propietario»; §8: «decisión **PENDIENTE** del propietario».
- `Handoff 004-I.md` §5 (L59) y §7 (L84): «**Decisión D-02 (A o B)** […] Sin plazo».

**Clasificación:** no es un error de los documentos al redactarse (eran ciertos el 2026-11-09); es **obsolescencia sobrevenida**. Es MAYOR porque afecta a la declaración de coherencia: mientras no se aplique la ratificación, el lector de la rama lee como pendientes dos decisiones ya tomadas. No cambia ningún byte ni ningún estado UNKNOWN/RESUELTO. La ejecución requiere autorización posterior expresa; no se resuelve editando nada en esta misión. El registro formal de la ratificación es §E de este informe.

### F.2. MAYOR-2 — El manifiesto G (quinto entregable) NO está en la rama

**Severidad: MAYOR. Estado: NUEVO (no detectado en verificaciones anteriores; el manifiesto review-i lo sustituye como registro, pero el archivo citado no existe en la rama).**

- `hashes-r2-rectification-review-g.md` (8.811 bytes, SHA-256 `44b97e7f867e4f067bc42e4fdac5231cc3aa72414310485e2cdb21098e19f98d`, 61 líneas, verificado en local) **no existe en el árbol** (`git ls-tree -r HEAD`, 2.509 archivos; EVIDENCIA).
- Sin embargo, lo citan como manifiesto externo vigente: informe G Anexo A L597–L605 («el SHA-256 del informe G se registra en el manifiesto externo `hashes-r2-rectification-review-g.md`»; fila del manifiesto: «contiene los SHA-256 finales de los cuatro archivos G»); HTML G, 7 ocurrencias (EVIDENCIA); cierre review-i.md L319 («El manifiesto G registra los SHA-256 calculados sobre los bytes finales de los cuatro archivos G»); informe de corrección §7.4 («El manifiesto G es la única fuente de los cinco hashes juntos»).
- **Atenuantes (por eso no es CRÍTICO):** los cuatro hashes G **sí** están en la rama en `Manifiesto review-i.md` (informe `89fb7665…`, cierre `d7e85d53…`, HTML `98a207b6…`, método `5356bd1c…`, todos verificados byte a byte), por lo que la verificación no queda bloqueada. El handoff 004-I §6 declara: «El manifiesto G nunca se publicó; este manifiesto es el registro vigente de integridad y lo sustituye como referencia»; el informe 004-I §6.3: «el manifiesto review-i es el registro vigente de integridad para las copias I».
- **Pero:** la sustitución es una afirmación de la propia misión 004-I, no una decisión registrada del propietario, y el manifiesto sustituto **nunca registra el hash completo del archivo sustituido**: `44b97e7f` aparece **0 veces** en `Manifiesto review-i.md` (EVIDENCIA). Además, la frase de §6.3 «El Anexo A del informe G y del HTML G no cambian (remiten a los manifiestos…)» es imprecisa: el Anexo A remite específicamente al manifiesto G, no a «los manifiestos» en genérico.
- **Consecuencia:** el conjunto de 5 entregables está en **4/5**; la publicación no está completa. La reparación mínima es subir el manifiesto G local, byte-idéntico y ya verificado (8.811 bytes, `44b97e7f…`); no requiere redactar nada nuevo. La afirmación del resumen §1 «solo 1 de 5 está publicado (el HTML)» quedó obsoleta en su cifra (hoy 4/5), pero su dictamen PARTIAL sobrevive por este hueco.

### F.3. menor-1 — Tamaño erróneo del manifiesto Pasada 7 publicado (resumen §5)

**Severidad: menor. Estado: NUEVO.**

Resumen ejecutivo corregido.md L82 (tabla §5): «la copia publicada (7.082 bytes, `7953961a…`) está SUPERSEDIDA». Medido en la rama: «manifiesto SHA-256 (1).md» tiene **8.043 bytes** y SHA-256 `7953961a94a7e67b8be1a179766aee06941a06a9598c5095c1539cbdfc69b97d` (EVIDENCIA; mismo valor en la copia local `branch-eb6ff90/`, por lo que el error es anterior a la subida). Un mismo hash determina un único contenido y por tanto un único tamaño: la pareja «7.082 bytes + hash `7953961a…`» es imposible. Origen probable (INFERENCIA): copia de la cifra del manifiesto F (`MUSE_004_F_SHA256_MANIFEST.md`, 7.082 bytes, `7eda960d…`). **Impacto nulo en verificación viva:** el archivo está declarado SUPERSEDIDO en el propio resumen §5 y §8.3, y su sustituto correcto (9.384 bytes, `3d1220bd…`) está citado correctamente y verificado en local.

### F.4. menor-2 — La sustitución del manifiesto Pasada 7 no se ejecutó en la subida

**Severidad: menor. Estado: NUEVO (el hecho —archivo pre-final en rama— era conocido como «superseded que coexiste»; la falsedad concreta de su afirmación de coincidencia es nueva).**

- El resumen §8.3 (L115) ordenaba sustituir «manifiesto SHA-256 (1).md» por la versión corregida (9.384 bytes, `3d1220bd…`, verificada en local: `3d1220bd55b6a8e57d74a89031a089b8c7c53f04a36cabecaa91273ff635056d`). La tabla de 8 archivos del handoff 004-I §6 **no incluye** esa sustitución, y la rama conserva el archivo pre-final (8.043 bytes, `7953961a…`).
- Su §1 (L18) afirma: «los 5 hashes coinciden con lo declarado en `hashes-r2-rectification-review-g.md` y con lo declarado en `MUSE_004_G_CORRECTION_REPORT.md` (sección «Corrección post-Pasada 5»)». Su tabla lista hashes pre-finales (informe `0b742e67…`, cierre `63c3277c…`, manifiesto G `996911b3…` 8.058 bytes — EVIDENCIA). Esa afirmación es **falsa contra los archivos finales publicados** (`89fb7665…`, `d7e85d53…`, `98a207b6…`, `44b97e7f…`). Es un residuo vivo que un lector exclusivo de la rama puede tomar por verificación vigente. Reparación ya prescrita: subir la versión `3d1220bd…` (ver §G).

### F.5. menor-3 — Puntero de línea erróneo «manifiesto G (L73)» en dos documentos publicados

**Severidad: menor. Estado: NUEVO.**

`Manifiesto review-i.md` (viñeta H-06): «El manifiesto G (L73) […] afirmaban el 4/10 sin la descomposición falsa»; `Informe de corrección 004-I.md` §1: «El manifiesto G (L73) y el manifiesto de hashes G (L61) afirman el 4/10 sin la descomposición falsa». El manifiesto G local tiene **61 líneas en total** (EVIDENCIA); L73 no existe. La afirmación del 4/10 sin glosa falsa está en su **L61** (última línea; verificado: 0 ocurrencias de «banner G»/«añadidas extra» en ese archivo). L73 sí existe en el otro manifiesto, `MUSE_004_G_SHA256_MANIFEST.md` (Pasada 7, corregido), cuya L73 es la viñeta «Corrección final (auditoría post-Pasada 5…)» sobre H-01. Es decir, el puntero L73 pertenece al manifiesto de Pasada 7, no al manifiesto G; los autores confluyeron ambos manifiestos. La sustancia es verdadera (ningún manifiesto contiene la glosa falsa); solo el puntero es erróneo.

### F.6. observación-1 — Autodescripciones de no-publicación: declaraciones históricas fechadas, NO contradicciones materiales

Verificadas una por una (EVIDENCIA); todas eran verdaderas en su fecha y ámbito (la publicación la hizo después el propietario por subida manual):

- `Manifiesto review-i.md` L7 (fecha 2026-11-09): «No se ha publicado ni fusionado nada» — ámbito: misión 004-I, que efectivamente no publicó nada.
- `consolidation-method-rectified-review-g.md` L3, banner (2026-11-08): «No se ha publicado ni fusionado nada» — estado de preparación de la copia; su condición de «copia de revisión NO OFICIAL — No aprobada» sigue vigente (publicar ≠ aprobar).
- `Cierre review-i.md` L275 (Addendum F) y L306 (Addendum G): «no se ha realizado merge ni publicación» — naturaleza de la copia de revisión en su momento.
- `Informe de corrección corregido.md`, encabezado: «No se publicó ni fusionó nada»; `Handoff 004-I.md` §3: «Nada publicado, nada fusionado, nada eliminado» — ámbito de la misión 004-I (2026-11-09).

**Matiz (EVIDENCIA):** la columna «Estado actual en la rama» de la tabla §6 del handoff 004-I es una instantánea del 2026-11-09 y **no debe citarse como inventario vigente de la rama**: las filas que decían «Nunca publicado» para cierre, manifiesto review-i, informe G y método G son hoy falsas (los 4 están publicados y verificados); las filas «SUPERSEDED» siguen siendo exactas sobre los archivos antiguos. Lo mismo vale para las tablas de estado de publicación del resumen (§1 «solo 1 de 5 está publicado», §4/§5 «LOCAL — PENDIENTE DE PUBLICACIÓN», §8 lista de pendientes), congeladas a 2026-11-09 / HEAD `eb6ff90d`. No son contradicciones internas; son inventarios con fecha que la publicación posterior superó. El inventario vigente es §B de este informe.

### F.7. Asuntos ya conocidos (separados de lo nuevo; confirmados vigentes)

- **H-05 (texto):** L275/L306 intactos — ya no es decisión pendiente (ratificada A, §E.1); lo pendiente es su aplicación.
- **D-02 gate:** ratificada B (§E.2); lo pendiente es su registro visible en la rama y la actualización de las afirmaciones de «pendiente» (MAYOR-1).
- **M-3:** fecha 07-11-2026 del commit `96e227eb…` sin fuente verificable (presente en método G L60 y gate §2.4). Sigue pendiente, no empeorado por esta misión.
- **I-02:** sustancia de C05 (A2A) sin re-verificar contra el tag v1.0.1 (gate §6, informe de corrección §6, método L68). Sigue pendiente.
- **Discrepancia de fecha v1.0.1 (26-vs-28):** presente en cierre, informe G L27, resumen §3. Sigue pendiente.
- **Archivos superseded que coexisten con los corregidos:** gate (1).md `539657d4…`, informe (1).md `d75cd743…`, HTML `210e29ab…`, resumen (1).md `ddec26fb…`, handoff G `e90af24c…`, manifiesto Pasada 7 `7953961a…`. Conocido; no es nuevo. La novedad es solo menor-2 (la falsedad concreta de la afirmación de coincidencia del manifiesto Pasada 7).

## G. Próximo paso mínimo y exacto para el propietario

En orden, sin combinar pasos que exigen autorizaciones distintas:

1. **Subir el manifiesto G** (`~/workspace/research_notes/nexo-autonomy-004-g/review-g/hashes-r2-rectification-review-g.md`, 8.811 bytes, SHA-256 `44b97e7f867e4f067bc42e4fdac5231cc3aa72414310485e2cdb21098e19f98d`) a `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/` de la rama. No requiere redactar nada: el archivo ya existe, byte-idéntico y verificado. Con esto, los 5 entregables de revisión quedan 5/5 en la rama y el Anexo A del informe G y el HTML G dejan de apuntar a un archivo ausente (resuelve MAYOR-2).
2. **Sustituir «manifiesto SHA-256 (1).md»** en la rama por la versión corregida local (`~/workspace/research_notes/nexo-autonomy-004-g/MUSE_004_G_SHA256_MANIFEST.md`, 9.384 bytes, SHA-256 `3d1220bd55b6a8e57d74a89031a089b8c7c53f04a36cabecaa91273ff635056d`), como ya ordenaba el resumen §8.3 (L115). Resuelve menor-2 y deja sin efecto menor-1 (la cifra 7.082 queda solo en el resumen, donde el archivo ya está declarado SUPERSEDED).
3. **Autorizar (o no) la misión separada de aplicación de H-05 A**: crear la copia del cierre con la nota editorial exacta del informe 004-I §3 (L79) al pie del Addendum F, L275 intacto; re-medir el diff f2→cierre (pronóstico 7/(38+N)) y actualizar el manifiesto con el nuevo hash del cierre; verificar la copia. La ratificación de la decisión no es autorización de ejecución: esta misión no la ejecutó ni la ejecuta.
4. **Registrar D-02 B de forma visible en la rama** (ver §H, propuesta 2): el registro formal ya existe en este informe (§E.2); falta el artefacto visible que identifique la referencia de trabajo en la carpeta.
5. **Verificación de publicación** tras los pasos 1–2 (y tras el 3, si se autoriza): bytes publicados contra las tablas de este informe.

Solo tras 1–5 podrá revisarse si el conjunto global puede declararse LISTO. Hasta entonces, **PARCIAL**. D-01 a D-12 siguen SIN DECIDIR y no forman parte de este cierre.

## H. Propuesta EXACTA de cambios documentales para reflejar las ratificaciones (PROPUESTA, no ejecutada)

Nada de lo siguiente se ha ejecutado. Cada cambio corresponde a una decisión ratificada y requiere autorización expresa de ejecución en misión separada (salvo el registro, que es este informe).

### H.1. Aplicación de H-05 A (misión separada, con autorización de ejecución)

| # | Archivo y ubicación | Cambio exacto | Efecto medible previsto (a re-medir al aplicar) |
|---|---|---|---|
| H-05.A.1 | Nueva copia del cierre (misma convención que review-i: copia separada, originales intactos) | Añadir al pie del Addendum F la nota editorial exacta del informe 004-I §3 (L79), citada en §E.1. **L275 intacto**, sin tocar una coma. No tocar L3, L283–L287, L319 ni la matriz de diagnóstico (menciones F2 legítimas). | Cierre cambia de hash y tamaño; diff f2→cierre pasa de 7/38 a 7/(38+N); marcas y recuentos de líneas se re-miden. |
| H-05.A.2 | Nuevo manifiesto (sucesor del review-i) | Registrar el nuevo hash/tamaño del cierre; actualizar la viñeta H-05 de «PREPARADO, NO CORREGIDO — decisión PENDIENTE» a «RATIFICADA OPCIÓN A (2026-11-10 12:17 CST) — aplicada en [nueva copia]». Registrar el hash del manifiesto anterior como superseded. | El manifiesto review-i queda como referencia histórica; el nuevo manifiesto es el registro vigente. |
| H-05.A.3 | Informe y handoff de la misión de aplicación (nuevos) | Documentar la aplicación, la re-medición del diff y la verificación; registrar que la decisión A fue ratificada el 2026-11-10 12:17 CST. | Trazabilidad completa A (preparada → ratificada → aplicada → verificada). |

### H.2. Registro visible de D-02 B en la rama (no requiere redactar contenido nuevo, salvo el registro)

| # | Archivo y ubicación | Cambio exacto | Efecto |
|---|---|---|---|
| D-02.B.1 | Nuevo archivo de registro en `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`, p. ej. `Registro de ratificación H-05 A y D-02 B (2026-11-10).md` | Registrar: fecha de ratificación (2026-11-10 12:17 CST); H-05 A (texto de la nota y ubicación); D-02 B (referencia de trabajo: `consolidation-method-rectified-review-g.md`, 13.351 bytes, `5356bd1c…`; canónico histórico: `consolidation-method.md`, 9.720 bytes, `7295fedb…`, intacto); alcance (referencia de trabajo únicamente; la copia G sigue siendo copia de revisión, no documento oficial; no concede PASS; no altera estados); justificaciones del propietario; límites (sin sobrescribir el canónico, sin eliminar historia, sin resolver D-01–D-12). | El gate §9 queda satisfecho («la elección debe quedar registrada con fecha y alcance») con un artefacto visible en la rama. |
| D-02.B.2 | (Opcional, mínimo) Añadir una línea al `README.md` de la carpeta (hoy 47 bytes: «Carpeta para investigaciones externas de Nexo.») | Línea: «Referencia de trabajo vigente para el método de consolidación (decisión D-02 B, ratificada 2026-11-10): `consolidation-method-rectified-review-g.md`; canónico histórico intacto: `consolidation-method.md`.» | Cualquier lector de la carpeta identifica la referencia sin abrir el gate. |
| D-02.B.3 | Sin cambios de contenido | No se toca el canónico, no se toca la copia G, no se reescribe el gate ni el cierre. Las afirmaciones de «pendiente» en gate L6/§9, resumen L117, método L87 y cierre L288/L319 quedan como texto histórico superado por el registro D-02.B.1 (ver MAYOR-1). | Cero riesgo de alterar evidencia; la obsolescencia queda documentada, no borrada. |

### H.3. Coherencia de las ratificaciones con manifiesto, gate, cierre, informe y handoff (verificado)

- **H-05 A:** no genera contradicciones. La opción A es no destructiva: L275 queda intacto, así que todo lo afirmado sobre L275 en manifiesto, informe 004-I §3/§5 y handoff §2/§3 sigue siendo verdadero; solo cambia el estado de «pendiente» a «ratificada, pendiente de aplicación», cambio que se registra en H-05.A.2, no reescribiendo los documentos históricos. El texto de la nota ya existe verbatim en el informe 004-I §3; no se inventa redacción.
- **D-02 B:** no genera contradicciones. El gate §8 ya recomendaba B técnicamente y separaba la recomendación de la decisión; la ratificación confirma la recomendación sin tocarla. El banner «No aprobada» de la copia G significa «no aprobada como documento oficial», coherente con B (referencia de trabajo, no documento oficial) y con el gate §8. El cierre L288 precisa que el PASS del cierre sobre el canónico cubre únicamente bytes e integridad, no vigencia de contenido — coherente con adoptar la copia G como referencia de trabajo manteniendo el canónico intacto. El manifiesto no afirma nada sobre la referencia de trabajo (sus referencias D-02 son a los defectos de Pasada 5, otra serie); no hay conflicto.
- **Interacción H-05 A × D-02 B:** ninguna. Afectan a documentos distintos (cierre vs. nota de método) y a decisiones distintas. La aplicación de A no altera la referencia de trabajo B ni viceversa.

## I. Registro de evidencia y método

- **HEAD y clon:** `git ls-remote` + clon `--depth 1` en `/tmp/aldea-ia-j`; HEAD `9fefe3b3c25edefd5a204693a7501afd8550d8ab` (2026-11-10 12:10:43 -0600, «Add files via upload»). Todas las mediciones son sobre este HEAD.
- **Hashes:** `sha256sum` sobre bytes del clon y de archivos locales verificados por hash. 10/10 archivos publicados byte-idénticos a sus locales (revisor adversarial, corroborado por el coordinador en los 8 + 2). Canónicos R2 y bases F2 verificados contra la tabla del manifiesto.
- **Diffs:** `diff` con desglose eliminadas/añadidas: informe f2→g 21/44; cierre f2→i 7/38; cierre f2→g 7/38; HTML f2→g 32/46 (base F2 184.564 bytes, `28e2b188…`); método f2→g 2/6; canónico→G 4/10; canónico→F2 4/6; F2→G 2/6 (hunks `3c3`, `54c54`, `83a84,87`).
- **Búsqueda de los 2 discrepantes:** `git ls-tree -r HEAD` (2.509 archivos) por tamaño (159.176 y 195.786: un único archivo de cada tamaño en todo el árbol) y por nombre parcial; SHA-256 medidos.
- **Marcas y glosas:** `grep -o`/`grep -c`: marcas 29/29/8/2; (D-02) 12/12; glosa falsa 0 vivas; «banner G» por archivo (cierre 0, manifiesto 1, gate 1, informe 1, resumen 2, método 0, informe 004-I 10, handoff 1).
- **Revisión adversarial:** subagente distinto y hostil, solo lectura, que no produjo las mediciones del coordinador. Hallazgos: 0 CRÍTICOS, 2 MAYORES, 3 menores, 1 observación; 14 comprobaciones sin contradicción (hashes 10/10, diffs, H-06, marcas, estados, barrido de 61 SHA-256 citados — 38 a archivos reales, 23 explicados: 12 históricos R1/P1–P7, 3 SUPERSEDIDOS, 7 intermedios, 1 vector de prueba «abc» —, tabla de referencia del manifiesto, referencias cruzadas de línea, estructura HTML, aritmética del gate §2, función de los 2 registros, asuntos conocidos). **Todos los hallazgos nuevos del revisor fueron re-verificados por el coordinador con mediciones propias** (MAYOR-1: las 6 ubicaciones; MAYOR-2: ausencia en el árbol, 0 ocurrencias de `44b97e7f` en el manifiesto review-i, manifiesto G local 8.811/`44b97e7f…`/61 líneas, Anexo A L597–L605, 7 menciones en HTML; menor-1: resumen L82 y archivo 8.043/`7953961a…`; menor-2: manifiesto Pasada 7 L18 y hashes pre-finales, resumen L115, corregido local 9.384/`3d1220bd…`; menor-3: manifiesto G 61 líneas, L61, manifiesto Pasada 7 L73, 0 «banner G» en el manifiesto G). Dos llamadas `exec` del revisor fallaron (exit 128 y exit 1) sin afectar a su informe, que se entregó completo. El revisor comparte contexto con el coordinador: no es un revisor externo independiente.
- **Estados preservados:** U2 (U2-a/b/c), U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS (U7/U9 acotados); C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR; cierre sustantivo PARTIAL; ningún PASS nuevo; ningún «LISTO PARA REVISIÓN FINAL» en las copias G. La ratificación H-05 A / D-02 B no altera ningún UNKNOWN ni ningún estado: cambia el estado de dos decisiones de «pendiente» a «ratificada» (y, para D-02, su referencia de trabajo), no el estado del expediente.
