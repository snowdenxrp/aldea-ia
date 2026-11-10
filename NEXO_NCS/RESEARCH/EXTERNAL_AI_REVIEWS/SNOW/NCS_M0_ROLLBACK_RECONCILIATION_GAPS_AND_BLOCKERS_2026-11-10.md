# NCS M0 — BRECHAS Y BLOQUEOS DE LA RECONCILIACIÓN DE DECISIONES DE ROLLBACK (D-RB-01–D-RB-09)

**Proyecto:** NEXO — NCS M0 (fundamento de continuidad)
**Rama documental de destino:** `ncs-m0-architecture-research-2026-11-10`
**Carpeta de destino:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/`
**Fecha:** 2026-11-10
**Autor:** Snow (Muse) — trabajo documental; no se modifica el repositorio.
**Documento compañero:** `NCS_M0_ROLLBACK_OWNER_DECISIONS_RECONCILIATION_2026-11-10.md` (veredicto: **PARTIAL**).

---

## Alcance de este archivo

Este archivo enumera **exclusivamente** contradicciones, brechas y bloqueos que siguen abiertos tras la reconciliación de las nueve decisiones de rollback ratificadas por el propietario el 10-Nov-2026 (D-RB-01 A, D-RB-02 A, D-RB-03 A, D-RB-04 A, D-RB-05 A, D-RB-06 C, D-RB-07 A, D-RB-08 A, D-RB-09 A).

No contiene: la reconciliación por decisión (está en el documento compañero), repeticiones de las auditorías CE-1/CE-5/CE-7, ni propuestas de diseño nuevas. Cada ítem indica qué lo resolvería y si su resolución exige una decisión del propietario o solo trabajo preparatorio. **No se solicita ninguna nueva decisión** en esta reconciliación: las tres contradicciones se resuelven interpretando fielmente las ratificaciones existentes; lo que queda abierto es trabajo preparatorio o decisiones futuras que deberán proponerse con evidencia, no decisiones que se pidan aquí.

**Etiquetas:** [RATIFICADO] = decisión del propietario. [EVIDENCIA] = fuente primaria verificable. [PROPUESTA] = opción no aprobada. UNKNOWN = no resuelto.

---

## 1. Contradicciones

### C-01 — Los informes anteriores reducen el alcance de D-RB-01 A

**Enunciado.** Cinco referencias en los informes reconciliados presentan la moratoria como si cubriera solo RB-3/RB-4, o presentan RB-1 como vía futura disponible. Eso contradice D-RB-01 A [RATIFICADO], cuya moratoria cubre RB-1, RB-2, RB-3 y RB-4.

**Evidencia [EVIDENCIA]:**

- Rollback §7, recomendación de D-RB-01: "A como postura inmediata, **con B como vía futura**… La moratoria no es una prohibición permanente… **B es la única con detección interna posible**."
- Rollback §3.5, fila "Condición mínima para permitirlo": presupone permiso por alcance.
- ACA-1 §8, A-02: título "**Moratoria RB-3/RB-4** (D-RB-01 A)" y opción C "**Solo RB-1 admitido**".
- ACA-1 §1 (l. 203), §2.6 (l. 338), §3.2 (l. 450–451), §6 (l. 587, 598, 600), §9 (l. 765): el claim restringido se describe como "rollback RB-1/RB-2" manejado por la arquitectura.

**Resolución por interpretación fiel.** La ratificación prevalece sobre la recomendación: B no es una vía; la moratoria cubre los cuatro alcances; RB-1/RB-2 es violación prohibida, no operación permitida. La corrección completa (R-01–R-05) está registrada en el documento compañero, §5.

**Qué sigue abierto.** La corrección existe solo en esta reconciliación. Los documentos anteriores, ya publicados en la rama, **siguen llevando el lenguaje que reduce el alcance**. El registro de la corrección no llegará a la rama hasta que el propietario suba estos entregables (ver B-05). Hasta entonces, un lector de la rama puede leer la moratoria como RB-3/RB-4.

**¿Exige nueva decisión?** No. La corrección es interpretación fiel de una ratificación existente.

### C-02 — D-RB-04 A exige un ancla; ACA-1 trata el ancla como cambio de modelo

**Enunciado.** D-RB-04 A [RATIFICADO] exige detección por ancla externa monótona. ACA-1 (A-08) trata la adopción de un ancla externa como cambio de modelo ("autorizar ancla externa y/o mediador a nivel de kernel (nuevo R1)") que exige una decisión separada y no debe tomarse implícitamente al aprobar un diseño. Tensión aparente: ¿la ratificación de D-RB-04 A constituye ya el cambio de modelo?

**Resolución por interpretación fiel.** No. Ratificar el **requisito** ("la detección se hará por ancla externa") no es seleccionar la **forma** del ancla ni decidir su encaje en R1. La forma concreta (contador, log, hardware, TEE, registro del propietario) no está elegida. Si la forma elegida vive fuera del entorno R1, su adopción será un cambio de modelo que exigirá una decisión separada del propietario, como advertía ACA-1. Si la forma elegida es el registro externo del propietario (D-RB-09 A), su encaje en R1 es una cuestión abierta: el registro es humano y falible (CE-15) y no es un contador monótono verificable por máquina, por lo que no está establecido que el registro *cuente* como el ancla de D-RB-04 A.

**Qué sigue abierto.** La forma del ancla, su encaje en R1, y si el registro externo satisface D-RB-04 A. Ver G-01.

**¿Exige nueva decisión?** No ahora. La exigirá cuando se proponga una forma concreta de ancla con su encaje en R1, con evidencia. Esta reconciliación no propone ninguna forma.

### C-03 — Condición de fin de la moratoria ("hasta D-RB-04") y de la prohibición de AUTH

**Enunciado.** La opción A de D-RB-01, tal como se formuló en la especificación, dice "moratoria **hasta D-RB-04**". La opción A de D-RB-07 dice "se prohíben los alcances que revierten AUTH **mientras no exista ancla externa (D-RB-04 A)**". D-RB-04 A ha sido ratificada. Lectura ingenua: la condición de fin se habría cumplido y la moratoria (y la prohibición de AUTH) se levantarían. Esa lectura contradice el propósito declarado de ambas decisiones y la falsación (sin detección, RB-3/RB-4 incumplen P05-C en silencio).

**Resolución por interpretación fiel.** D-RB-04 A ratifica un **requisito** (que la detección sea por ancla externa), no la **realización** de un ancla. No existe hoy ningún ancla (ver G-01). La condición de fin de la moratoria es la realización del ancla, no la decisión sobre su forma. La moratoria y la prohibición de AUTH siguen operativas. Su levantamiento — total o por alcance — exigiría una nueva decisión explícita del propietario. Si el propietario entendió otra cosa al ratificar, debe decirlo; esta reconciliación no lo presume.

**Qué sigue abierto.** Nada en cuanto a la interpretación (queda registrada). Queda abierta la realización del ancla (G-01).

**¿Exige nueva decisión?** No. La interpretación fiel resuelve la tensión; solo una decisión futura podría levantar la moratoria.

---

## 2. Brechas

### G-01 — El ancla externa (D-RB-04 A) es un requisito sin mecanismo

**Enunciado.** D-RB-04 A [RATIFICADO] exige detección por ancla externa monótona. No existe ningún ancla: no está seleccionada su forma (contador, log, hardware, TEE), no está diseñada, no está verificada, no hay candidato identificado.

**Afecta a:** D-RB-04 A, D-RB-01 A (fin de la moratoria), D-RB-07 A (condición de la prohibición de AUTH), O1, O2, C-4, I-2, I-5.

**Qué lo resolvería:** una propuesta de ancla concreta con su forma, su ubicación, su mecanismo de verificación, su coste y su encaje en R1, seguida de la decisión del propietario sobre esa propuesta. Trabajo preparatorio primero; decisión después, con evidencia.

**¿Exige nueva decisión?** Sí, en el futuro, cuando exista una propuesta. No se solicita ahora.

### G-02 — A-03 sigue UNKNOWN/PENDING: sin evidencia específica de restauración de HOME en Android/Termux

**Enunciado.** No existe evidencia específica de que el backup o el saved-state de Android restauren el HOME privado de Termux (`/data/data/com.termux/files/home`). La especificación (F11) establece que backup/saved-state restauran estado de app en general; eso no es evidencia sobre el HOME de Termux. D-RB-02 A no clasifica al SO (la clasificación explícita, opción C, se recomendó como acompañamiento y no fue ratificada). A-03 (ACA-1: desactivar o declarar el backup/saved-state para el dominio) sigue UNKNOWN/PENDING por instrucción expresa del encargo.

**Afecta a:** A-03, D-RB-02 A (clasificación del ejecutor), D-RB-01 A (enforcement de la moratoria frente al SO).

**Qué lo resolvería:** evidencia específica — lectura primaria de la documentación de Android backup / Termux, o evidencia de comportamiento — sobre si el backup de Android restaura el HOME de Termux; seguida de la decisión del propietario entre desactivar, declarar o aceptar.

**¿Exige nueva decisión?** La evidencia es trabajo preparatorio; la decisión (A-03) la tomará el propietario cuando se proponga con esa evidencia. No se solicita ahora.

### G-03 — El SO como ejecutor no está clasificado y la moratoria no tiene enforcement frente a él

**Enunciado.** La moratoria prohíbe todo rollback, pero ningún mecanismo impide que un ejecutor no declarado (el SO, vía backup/saved-state) restaure el dominio sin conocimiento del propietario. La recomendación de la especificación advertía que dejar al SO sin clasificar es dejar "el ejecutor más probable fuera de la especificación" (§4.4). La ratificación de D-RB-02 A no incluye la clasificación.

**Afecta a:** D-RB-01 A, D-RB-02 A, A-03, P05-C (enforcement, no solo declaración).

**Qué lo resolvería:** la evidencia de G-02 + la decisión A-03 + un mecanismo de detección (G-01) o una declaración del ejecutor que cubra al SO. Sin eso, la moratoria descansa en política + registro (D-RB-09 A), no en mecanismo.

**¿Exige nueva decisión?** Depende de G-02 y A-03. No se solicita ahora.

### G-04 — Las decisiones A-01–A-09 de ACA-1 siguen sin decidir (salvo el elemento de moratoria)

**Enunciado.** Las ratificaciones D-RB-01–D-RB-09 no deciden las decisiones de autorización de ACA-1. Estado: A-02 satisfecha en su elemento de moratoria (forma corregida, §5 del documento compañero); A-01 (autorizar MED + SUP), A-03 (backup, ver G-02), A-04 (atestación como raíz de confianza), A-05 (cierre de P09), A-06 (criterio de identidad P07-A), A-07 (diseño del testigo), A-08 (contención por política vs cambio de modelo) y A-09 (autorización de implementación) siguen SIN DECIDIR.

**Afecta a:** la condición de estabilidad de ACA-1 (§9: 1 de 3 satisfecha), el veredicto PARCIAL de ACA-1, y cualquier paso hacia la implementación.

**Qué lo resolvería:** propuestas con evidencia para cada decisión, presentadas al propietario en su momento. A-09 (implementación) no debe solicitarse hasta que las demás estén resueltas y exista evidencia del target (B-04).

**¿Exige nueva decisión?** Sí, en el futuro, una por una y con evidencia. No se solicita ninguna ahora.

### G-05 — Las obligaciones O1–O9 siguen sin demostración técnica

**Enunciado.** Ninguna de las nueve ratificaciones demuestra una obligación. Una decisión no es una demostración. Estados sin cambio (falsación y ACA-1): O1 PARCIAL/CONDICIONAL, O2 CONDICIONAL (RB-1/RB-2 detectable; RB-3/RB-4 no), O3 CONDICIONAL, O4 CONDICIONAL, O5 PARCIAL/CONDICIONAL, O6 satisfecha por diseño, O7 CONDICIONAL, O8 UNKNOWN, O9 satisfecha por diseño. E2/E3 siguen PARTIAL / NOT CLOSED.

**Afecta a:** P05, P07-C, M0.

**Qué lo resolvería:** mecanismos realizados y verificados (ancla, MED/SUP autorizados y probados, criterio de identidad, P09 cerrado, evidencia del target), no decisiones. Las decisiones fijan requisitos; las demostraciones exigen realización + verificación.

**¿Exige nueva decisión?** No. Exige trabajo técnico futuro autorizado por separado.

### G-06 — Sin fingerprint del target (O8) ni verificación de los supuestos S-1–S-6

**Enunciado.** ACA-1 descansa en supuestos no verificados en el target (POCO X7 Pro, Termux, Node): S-1 (openat/dirfd/unlinkat disponibles), S-2 (semántica de grupos de procesos), S-3 (IPC por Unix socket), S-4 (lectura de /proc), S-5 (independencia del testigo), S-6 (capacidad del propietario para atestar). O8 (fingerprint del target) sigue UNKNOWN. ACA-1 declara que su veredicto pasaría a INVIABLE incluso para el claim restringido si S-1/S-2/S-3 resultan falsas.

**Afecta a:** O8, ACA-1 (S-1–S-6), A-09 (implementación).

**Qué lo resolvería:** evidencia del target (lectura de documentación primaria de Termux/Android y, cuando se autorice, comprobación en el dispositivo). Esta reconciliación no ejecutó nada en el dispositivo, por encargo expreso.

**¿Exige nueva decisión?** No. Exige evidencia; la autorización de cualquier comprobación en el dispositivo es del propietario cuando se proponga.

### G-07 — Sin procedimiento aprobado de recuperación ni de readmisión (E8/F14)

**Enunciado.** No existe procedimiento aprobado de recuperación ni de readmisión. D-RB-05 A confirma la matriz de respuesta (BLOCKED), pero ninguna reconciliación existe hoy que pueda levantar el BLOCKED (F14). D-RB-08 A exige verificación en cuarentena, pero no está definido qué se verifica (integridad, coherencia RES↔COORD↔AUTH, vigencia). ACA-1 propone REC (8 pasos con predicados + atestación del propietario) como [PROPUESTA], no ratificado.

**Afecta a:** D-RB-05 A, D-RB-08 A, E8, P05-C (salida de BLOCKED).

**Qué lo resolvería:** una especificación documental del procedimiento de verificación en cuarentena y de los predicados de recuperación, seguida de la decisión del propietario.

**¿Exige nueva decisión?** Sí, en el futuro, cuando exista la especificación. No se solicita ahora.

### G-08 — El canal del registro externo (D-RB-09 A) no está especificado

**Enunciado.** D-RB-09 A [RATIFICADO] exige registro externo con ámbito, snapshot, ejecutor, instante y resultado. El canal externo, el formato y el custodio no están especificados. La especificación no los inventa: el propietario decide el canal.

**Afecta a:** D-RB-09 A (operatividad), D-RB-02 A (forma verificable de la declaración), D-RB-04 A (el registro como forma documental mínima del ancla).

**Qué lo resolvería:** que el propietario indique el canal (o que se le proponga uno con sus consecuencias). Hasta entonces, el registro es una exigencia sin medio.

**¿Exige nueva decisión?** Sí, en el futuro (elección de canal). No se solicita ahora.

### G-09 — P09 sigue OPEN: el universo de actores no está cerrado

**Enunciado.** P09 (cobertura de callers) sigue OPEN / UNKNOWN. Sin cierre de P09, no se sabe quién puede escribir: la frontera de ACA-1 (MED como único escritor) no puede reclamar completitud, y O7 sigue CONDICIONAL. La falsación (CE-1, CE-11) y ACA-1 (CE-12) dependen de ese cierre.

**Afecta a:** P09, O7, G-4 (ACA-1), CE-1, CE-11, CE-12.

**Qué lo resolvería:** la reconciliación de cobertura de P09 (trabajo documental pendiente, fuera del alcance de esta misión).

**¿Exige nueva decisión?** La decisión A-05 (alcance de cierre de P09) la tomará el propietario cuando se proponga. No se solicita ahora.

### G-10 — Los mecanismos C y B de D-RB-04 no quedaron ratificados como detección

**Enunciado.** La recomendación de D-RB-04 era una combinación (C declaración como mínimo, B verificación cruzada para RB-1/RB-2, A ancla para RB-3/RB-4). El propietario ratificó A sola. La declaración (C) sobrevive como requisito por D-RB-02 A y D-RB-09 A, pero no como mecanismo de detección ratificado de D-RB-04. La verificación cruzada interna (B) sobrevive únicamente como mecanismo propuesto en ACA-1 (GEN cruzada), [PROPUESTA], sin ratificación.

**Afecta a:** D-RB-04 A (cobertura de detección para RB-1/RB-2 sin ancla), C-2/C-4 (ACA-1).

**Qué lo resolvería:** o bien la realización del ancla (G-01), que hace innecesaria la cobertura B/C; o bien una decisión futura que ratifique la verificación cruzada como mecanismo de detección para RB-1/RB-2.

**¿Exige nueva decisión?** No ahora. La ratificación de A es suficiente como requisito; la cobertura B/C es una cuestión futura si el ancla no se realiza.

---

## 3. Bloqueos

### B-01 — Detección de un rollback no declarado (RB-3/RB-4) es imposible sin el ancla

**Enunciado.** Un rollback RB-3/RB-4 no declarado es autoconsistente e indetectable desde dentro (falsación CE-5; especificación §3.3/§3.4, F7/F8; ACA-1 I-5). El único mecanismo que lo detectaría es el ancla externa (D-RB-04 A), que no existe (G-01). El registro externo (D-RB-09 A) solo detecta *a posteriori* lo que el ejecutor declara; no detecta lo que el ejecutor no declara.

**Consecuencia.** La moratoria (D-RB-01 A) es **inenforzable frente a un rollback no declarado**: puede incumplirse en silencio y P05-C con ella. La moratoria es hoy una prohibición declarada, no una garantía demostrada. Esto no contradice la ratificación; es su límite conocido y declarado.

**Qué lo desbloquearía:** la realización del ancla (G-01) o la clasificación y control del ejecutor (G-02/G-03).

### B-02 — Sin procedimiento aprobado de recuperación, ningún estado BLOCKED/QRT tiene salida

**Enunciado.** Cualquier rollback detectado (o sospechado) termina en BLOCKED o cuarentena (D-RB-05 A, D-RB-08 A). No existe procedimiento aprobado que levante ese estado (F14/E8; ver G-07). La única salida prevista en los documentos es un procedimiento futuro aprobado por el propietario.

**Consecuencia.** Un BLOCKED es hoy un callejón sin salida documental: el sistema se detiene correctamente, pero no hay camino definido para volver a operar. Esto bloquea cualquier cierre de P05/P07-C y cualquier operación tras un incidente.

**Qué lo desbloquearía:** la especificación del procedimiento de verificación en cuarentena y de los predicados de recuperación (G-07), con decisión del propietario.

### B-03 — P09 abierto bloquea la completitud de cualquier frontera (B-03)

**Enunciado.** Sin P09 cerrado (G-09), ningún diseño puede demostrar que todos los escritores pasan por su frontera. ACA-1 lo declara: su frontera (MED) cubre solo escritores COVERED; los escritores RAW existen y solo se detectan, no se previenen (I-1).

**Consecuencia.** Bloquea G-4 (ACA-1) y O7. Ninguna arquitectura puede reclamar cierre universal mientras P09 esté abierto.

**Qué lo desbloquearía:** la reconciliación de cobertura de P09 (G-09).

### B-04 — Sin evidencia del target, ninguna implementación puede autorizarse (B-04)

**Enunciado.** Los supuestos S-1–S-6 y el fingerprint O8 no están verificados en el POCO X7 Pro / Termux (G-06). ACA-1 declara que su veredicto caería a INVIABLE para el claim restringido si S-1/S-2/S-3 resultan falsas.

**Consecuencia.** Bloquea A-09 (autorización de implementación) y cualquier paso de diseño a realización. El diseño sigue siendo [PROPUESTA] sin anclaje en el target.

**Qué lo desbloquearía:** evidencia del target (G-06), con autorización del propietario para cualquier comprobación en el dispositivo.

### B-05 — GitHub no conectado: Snow no puede publicar esta reconciliación en la rama

**Enunciado.** La integración GitHub de Snow sigue NOT_CONNECTED (verificado 2026-11-10; `auth_status: not_connected`, `authenticated: false`). Snow no puede publicar estos dos entregables en la rama `ncs-m0-architecture-research-2026-11-10`, carpeta `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/`. Los tres informes anteriores (S1–S3) llegaron a la rama porque el propietario los subió.

**Consecuencia.** La corrección de alcance (C-01, documento compañero §5) no llegará a la rama hasta que el propietario suba estos archivos. Mientras tanto, la rama sigue llevando el lenguaje que reduce el alcance de D-RB-01 A.

**Qué lo desbloquearía:** que el propietario suba los dos entregables (o autorice la conexión GitHub, lo que desbloquearía además la publicación pendiente de la misión R2).

---

## 4. Cierre

- **Contradicciones:** 3 (C-01–C-03). Todas resueltas por interpretación fiel de las ratificaciones existentes. **0 irresolubles. No se solicita ninguna nueva decisión.**
- **Brechas:** 10 (G-01–G-10). Todas abiertas. Ninguna es una decisión que se pida aquí; son trabajo preparatorio (evidencia, especificación, propuesta) seguido, en su momento, de decisiones del propietario con esa evidencia.
- **Bloqueos:** 5 (B-01–B-05). Todos abiertos. B-01–B-04 son bloqueos técnicos del expediente; B-05 es un bloqueo de publicación.
- **Veredicto de la reconciliación (documento compañero): PARTIAL.**
- **Estados sin cambio:** P05 OPEN, P07-C UNKNOWN/BLOCKING, P09 OPEN/UNKNOWN, M0 INCOMPLETO, A-03 UNKNOWN/PENDING.

**Confirmación explícita:** esta reconciliación es solo lectura y análisis documental. No se modificó código, no se ejecutaron tests, CI, runtime, bootstrap ni acciones en el dispositivo, no se modificó ni fusionó ningún PR, no se inventó evidencia ni se convirtió ninguna propuesta en decisión, y no se declara M0 completo.
