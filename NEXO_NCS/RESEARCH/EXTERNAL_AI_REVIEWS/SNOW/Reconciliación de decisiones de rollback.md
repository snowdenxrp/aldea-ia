# NCS M0 — RECONCILIACIÓN DE LAS DECISIONES DE ROLLBACK DEL PROPIETARIO (D-RB-01–D-RB-09)

**Proyecto:** NEXO — NCS M0 (fundamento de continuidad)
**Rama documental de destino:** `ncs-m0-architecture-research-2026-11-10`
**Carpeta de destino:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/`
**Fecha:** 2026-11-10
**Autor:** Snow (Muse) — trabajo documental; no se modifica el repositorio.
**Estado del documento:** RECONCILIACIÓN — no es un canónico nuevo ni una modificación de los informes reconciliados.
**Veredicto:** **PARTIAL** (ver §3 para la definición exacta de los tres valores posibles).

---

## 0. Propósito, método y honestidad

### 0.1 Propósito

Reconciliar las nueve decisiones de rollback ratificadas por el propietario el 10-Nov-2026 (D-RB-01–D-RB-09) con los dos documentos que las propusieron y las encuadran:

1. La especificación de semántica de rollback para P05/P07 (2026-11-10), que formuló las nueve decisiones con opciones, consecuencias y recomendación razonada.
2. La arquitectura candidata ACA-1 (2026-11-10), que presupone algunas de esas decisiones y cuya condición de estabilidad depende de otras.

### 0.2 Lo que este documento hace y lo que no hace

**Hace:**

- Contrastar cada decisión ratificada con lo que el informe de rollback recomendaba y con lo que ACA-1 presupone o exige.
- Corregir las referencias que reducen indebidamente el alcance de D-RB-01 A (ver §5). La corrección se registra aquí; los documentos anteriores no se reescriben ni se sobrescriben.
- Distinguir, en cada decisión, el **requisito normativo ratificado** del **mecanismo técnico aún no seleccionado** (ver §4 y §9).
- Verificar que ninguna decisión se interprete como autorización de implementación.
- Mantener P05-C, P07-C y los criterios M0 en sus estados documentales reales.
- Mantener A-03 (ACA-1) como UNKNOWN/PENDING, porque no existe evidencia específica de restauración de HOME en Android/Termux (ver §7).
- Identificar las obligaciones que siguen sin demostración técnica (ver §8 y el archivo compañero de brechas y bloqueos).

**No hace:**

- No decide nada por el propietario. Las nueve ratificaciones se toman como dadas; este documento no las reabre, no las amplía y no las restringe.
- No convierte propuestas en decisiones: todo lo etiquetado [PROPUESTA] en los informes reconciliados sigue siendo propuesta.
- No repite las auditorías CE-1/CE-5/CE-7 ni la especificación de rollback, salvo para señalar una contradicción concreta.
- No modifica código, no ejecuta tests, CI, runtime, bootstrap ni acciones en el dispositivo. No modifica ni fusiona PR.
- No declara M0 completo. M0 sigue INCOMPLETO.
- No solicita nuevas decisiones al propietario: las tensiones encontradas se resuelven interpretando fielmente las ratificaciones existentes (ver §10 y el archivo compañero, C-01–C-03).

### 0.3 Fuente de las ratificaciones

Las nueve ratificaciones se recibieron en la instrucción del propietario del 10-Nov-2026 (15:33 CST), que enumera las opciones elegidas:

| Decisión | Opción ratificada |
|---|---|
| D-RB-01 | A |
| D-RB-02 | A |
| D-RB-03 | A |
| D-RB-04 | A |
| D-RB-05 | A |
| D-RB-06 | C |
| D-RB-07 | A |
| D-RB-08 | A |
| D-RB-09 | A |

Esa instrucción es la fuente de la ratificación. No existe otro registro de ratificación consultado; si el propietario tiene un registro distinto, ese registro prevalece y esta reconciliación debe corregirse.

### 0.4 Etiquetas de afirmación

Se mantiene la disciplina de evidencia de todo el expediente Nexo:

- **[RATIFICADO]** — decisión del propietario, comunicada por él. Solo las nueve opciones de §0.3 y las decisiones ratificadas anteriores (R1, P05-C, P07 V2.3, H-05 A, D-02 documental B) llevan esta etiqueta.
- **[EVIDENCIA]** — afirmación con fuente primaria identificable y verificable (hash, ruta, línea, commit).
- **[PROPUESTA]** — opción de diseño o recomendación razonada, no decisión aprobada.
- **[HIPÓTESIS]** — posibilidad no medida.
- **UNKNOWN** — no resuelto; nunca resuelto por inferencia.

---

## 1. Fuentes verificadas

### 1.1 Documentos reconciliados

| # | Documento | Hash SHA-256 local | Copia en rama | Idéntica |
|---|---|---|---|---|
| S1 | Falsación CE-1/CE-5/CE-7, 2026-11-10 (70.990 bytes, 1.021 líneas) | `8f1bb64646db47553ffe9c29541b827110e80ce09120eac0fe8a06ff477ae8b9` | `534c728c293c4dbbf7e0437165af1c8ac69b75877d758ccf5c817a34a7002dba` | No — ver nota (a) |
| S2 | Semántica de rollback P05/P07, 2026-11-10 (61.003 bytes, 527 líneas) | `f36008ec442736cfd822b5cd956c2ddfe4e8d6119a74816cf34c033630d343a4` | `f36008ec442736cfd822b5cd956c2ddfe4e8d6119a74816cf34c033630d343a4` | Sí |
| S3 | Arquitectura candidata ACA-1, 2026-11-10 (62.312 bytes, 850 líneas) | `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` | `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` | Sí |

**Nota (a) — diferencia entre la copia local y la copia en rama de S1.** La copia de la falsación publicada en la rama (70.988 bytes) difiere de la copia local (70.990 bytes) únicamente en formato: una línea plegada en dos (`...candidata más fuerte (ACM-1)...` unida en una sola línea) y la ausencia del salto de línea final. Verificado por `diff`: el contenido es el mismo; no hay cambios de texto, cifras ni veredictos. La diferencia es un artefacto de subida, no una revisión. Esta reconciliación usa el contenido, que es idéntico en ambas copias.

### 1.2 Rama y carpeta de destino

- Rama `ncs-m0-architecture-research-2026-11-10`, HEAD verificado por `git ls-remote` el 2026-11-10: `e5e4d41d1b4e9d531aabc72bbe5025a982eb1913`.
- Carpeta `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/` ya contiene S1, S2 y S3 (publicados por el propietario; Snow no tiene integración GitHub autorizada y no publicó nada).
- La misma carpeta de revisiones externas contiene además `GEMINI/NCS_M0_ANDROID_TERMUX_P05_P07_PLATFORM_FEASIBILITY_GEMINI_2026-11-10.md` y `QWEN/NCS_M0_P05_P07_ALTERNATIVE_ARCHITECTURE_QWEN_2026-11-10.md`. **No se usan como fuentes en esta reconciliación**: el encargo las excluye (el contraste es con el informe de rollback y con ACA-1). Su existencia se registra aquí solo para trazabilidad; ninguna afirmación de este documento descansa en ellas.

### 1.3 Decisiones ratificadas anteriores que se presuponen

- **R1** aceptado por el propietario (2026-11-02): modelo de confianza Android sandbox + HOME privado de Termux, invocación manual en primer plano, propietario único lanzador manual. E2/E3 PARTIAL / NOT CLOSED.
- **P05-C** ratificada como política (2026-11-07): incertidumbre de release/limpieza → UNKNOWN/BLOCKED, sin recuperación automática.
- **P07 V2.3** ratificado (8-Nov-2026).
- **H-05 OPCIÓN A** y **D-02 documental OPCIÓN B** ratificadas (2026-11-10); la D-02 de custodia de la clave raíz sigue SIN DECIDIR.
- **D-01–D-12** (Misión 02) siguen SIN DECIDIR. Las 9 decisiones de la Misión 01 siguen pendientes.

---

## 2. Las nueve ratificaciones: contenido normativo

La siguiente tabla fija el contenido normativo de cada decisión tal como fue ratificada. La columna "Texto de la opción" cita el texto de la opción en la especificación de rollback (§7); la columna "Contenido normativo" es la lectura fiel de lo que la ratificación ordena.

| Decisión | Opción | Texto de la opción (rollback §7) | Contenido normativo [RATIFICADO] |
|---|---|---|---|
| D-RB-01 | **A** | No: rollback fuera de R1; cualquier rollback → STOP/UNKNOWN (moratoria hasta D-RB-04). | **Moratoria total.** Ningún alcance de rollback (RB-1, RB-2, RB-3 ni RB-4) forma parte del alcance aceptado de R1. Cualquier rollback, conocido o sospechado, → STOP/UNKNOWN. |
| D-RB-02 | **A** | Solo el propietario, manualmente, con declaración explícita por canal fuera del ámbito. | **Ejecutor único.** Solo el propietario ejecuta un rollback, manualmente y con declaración explícita fuera del ámbito. Ningún otro actor está autorizado como ejecutor. |
| D-RB-03 | **A** | Sí: todo o nada por alcance, como requisito de cualquier rollback permitido. | **Atomicidad exigida.** Todo rollback permitido (hoy ninguno) debe ser atómico por alcance; un rollback parcial es un estado que nunca existió (CE-10) y se trata como violación. |
| D-RB-04 | **A** | Ancla externa monótona (contador/log fuera del dominio; hardware/TEE). | **Detección por ancla externa.** La detección de un rollback se hará por ancla externa monótona. Es el mecanismo de detección requerido; su forma concreta no está seleccionada (ver §4.4). |
| D-RB-05 | **A** | La matriz del §5: RB-1/RB-2 UNKNOWN/BLOCKED hasta reconciliación; RB-3/RB-4 BLOCKED (inaplicable sin ancla/declaración); parcial detectado → BLOCKED. | **Respuesta P05-C por alcance.** Se aplica la matriz del §5 de la especificación. En todos los casos: BLOCKED; solo varía qué reconciliación podría levantarlo, y hoy ninguna existe (F14). |
| D-RB-06 | **C** | Prohibir el rollback si hay sesiones vivas (el ejecutor debe terminarlas; si no puede, no hay rollback). | **Sin sesiones vivas.** Si hay sesiones, descriptores u operaciones en curso, no hay rollback. La quiescencia (opción A) es la justificación; C es su forma ejecutable. |
| D-RB-07 | **A** | No: se prohíben los alcances que revierten AUTH mientras no exista ancla externa (D-RB-04 A). | **AUTH no se revierte.** RB-3 y RB-4 están prohibidos mientras no exista ancla externa. (La condición es la realización del ancla, no su mera decisión; ver C-03 en el archivo compañero.) |
| D-RB-08 | **A** | Sí: cuarentena obligatoria + verificación antes de activar (C09). | **Cuarentena obligatoria.** Ningún dato restaurado se activa sin cuarentena y verificación previas. Es una exigencia existente (C09), no una opción nueva. |
| D-RB-09 | **A** | Sí: registro externo obligatorio (fuera de DOM o en canal externo) con ámbito, snapshot, ejecutor, instante y resultado. | **Registro externo obligatorio.** Todo rollback se registra fuera del ámbito revertido, con ámbito, snapshot, ejecutor, instante y resultado. El canal externo concreto no está especificado (lo decide el propietario; la especificación no lo inventa). |

---

## 3. Veredicto: PARTIAL — y qué significan los tres valores

**Veredicto de esta reconciliación: PARTIAL.**

Definiciones aplicadas (las tres se usan solo para esta reconciliación; no son estados del expediente):

- **CONSISTENT** — las nueve decisiones son mutuamente coherentes, están reflejadas en los informes reconciliados sin necesidad de corrección, y no quedan brechas que afecten a la reconciliación misma. (No es el caso: ver §5.)
- **PARTIAL** — las nueve decisiones son mutuamente coherentes y quedan reflejadas tras las correcciones registradas en §5; pero quedan brechas y bloqueos abiertos (ancla requerida sin realizar, A-03 pendiente, obligaciones sin demostración) que impiden que la reconciliación constituya cierre de nada. (Es el caso.)
- **CONFLICT** — existe una contradicción irresoluble entre decisiones ratificadas, o entre una decisión ratificada y un requisito normativo, que la interpretación fiel no puede resolver. (No es el caso: las tensiones encontradas — C-01–C-03 en el archivo compañero — se resuelven interpretando fielmente las ratificaciones.)

**Por qué no CONSISTENT:** cinco referencias en los informes reconciliados reducen indebidamente el alcance de D-RB-01 A (§5, R-01–R-05). La reconciliación es correcta solo después de corregirlas. Además, la ratificación de D-RB-04 A exige un ancla que no existe, y A-03 sigue pendiente; una reconciliación que las presentara como cerradas sería falsa.

**Por qué no CONFLICT:** ninguna de las nueve decisiones contradice a otra (ver §4: varias quedan subsumidas por la moratoria, lo cual es dependencia, no contradicción), y ninguna contradice P05-C, P07 V2.3 ni R1. Las aparentes tensiones (ancla como cambio de modelo; condición de fin de la moratoria) se resuelven distinguiendo requisito de realización (§4.4, C-02, C-03).

---

## 4. Reconciliación por decisión

### 4.1 D-RB-01 A — Moratoria total (RB-1, RB-2, RB-3 y RB-4)

**Ratificado [RATIFICADO]:** rollback fuera de R1; moratoria sobre los cuatro alcances; cualquier rollback → STOP/UNKNOWN.

**Lo que recomendaba el informe de rollback:** "A como postura inmediata, con B como vía futura." La opción A era la recomendada; el acompañamiento "con B como vía futura" **no fue ratificado** y queda corregido en §5 (R-01). La recomendación describía además la moratoria como "la postura conforme mientras D-RB-04 no se resuelva"; esa formulación temporal se trata en C-03 (archivo compañero).

**Lo que decía ACA-1:** A-02 se titulaba "Moratoria RB-3/RB-4 (D-RB-01 A) como precondición de ACA-1" y ofrecía como opción C "Solo RB-1 admitido". Ambas formulaciones **reducen el alcance** de la ratificación y quedan corregidas en §5 (R-04). El resto de ACA-1 presupone la moratoria como contención por política para RB-3/RB-4 (I-5, C-4, §9); esa contención se extiende ahora a los cuatro alcances (ver §5, R-05).

**Evaluación:** coherente con P05-C [RATIFICADO] (la moratoria es la única postura conforme mientras no exista detección: rollback §3.3/§3.4, F7/F8) y con la falsación (CE-5 en forma pura en RB-3/RB-4). **Decisiones correctamente reflejadas: sí, tras la corrección de §5.**

**Requisito normativo vs mecanismo no seleccionado:** la moratoria es un requisito normativo (prohibición), no un mecanismo. No selecciona cómo se hace cumplir la prohibición frente a un ejecutor no declarado (el SO). Esa es la brecha G-03 (archivo compañero). La moratoria no es, por sí misma, detección ni enforcement.

**Estado:** REFLEJADA CON CORRECCIÓN DE ALCANCE (§5, R-01–R-05).

### 4.2 D-RB-02 A — Solo el propietario ejecuta, manualmente y con declaración

**Ratificado [RATIFICADO]:** solo el propietario, manualmente, con declaración explícita por canal fuera del ámbito.

**Lo que recomendaba el informe de rollback:** "A, con C clasificado explícitamente." La ratificación coincide con la opción A; el acompañamiento "con C clasificado explícitamente" (clasificar al SO como ejecutor posible) **no fue ratificado como elemento separado** y sigue pendiente (ver §7 y G-02/G-03). La recomendación advertía que dejar al SO sin clasificar es dejar "el ejecutor más probable fuera de la especificación" (§4.4).

**Lo que dice ACA-1:** la recuperación controlada (REC) exige atestación del propietario fuera de banda (A-04, opción A recomendada) y el registro externo del consumo (D-RB-09). Ambas son coherentes con D-RB-02 A: el propietario es el único testigo que sobrevive a RB-4. ACA-1 no decide A-04; sigue [PROPUESTA].

**Evaluación:** coherente con D-RB-01 A. Bajo la moratoria total, D-RB-02 A no autoriza hoy ningún rollback: es una **regla vigente en suspenso** — define quién podría ejecutar un rollback si la moratoria se levantara alguna vez por nueva decisión del propietario, y define quién es el único ejecutor legítimo de cualquier operación de restauración que el propietario declare. No es una contradicción: es dependencia (la regla está subsumida por la moratoria mientras esta dure).

**Requisito normativo vs mecanismo no seleccionado:** la regla nombra al ejecutor autorizado y exige declaración por canal fuera del ámbito; no selecciona el canal, no define el formato de la declaración, y no establece cómo se impide que el SO ejecute un rollback sin declaración. Todo eso sigue pendiente.

**Estado:** REFLEJADA. Acompañamiento no ratificado (clasificación del SO) → pendiente (G-02/G-03).

### 4.3 D-RB-03 A — Atomicidad exigida

**Ratificado [RATIFICADO]:** todo rollback permitido debe ser atómico por alcance; un rollback parcial es un snapshot sesgado (CE-10).

**Lo que recomendaba el informe de rollback:** "A como requisito, con B como modo de fallo." La ratificación coincide con la opción A. La recomendación advertía la circularidad (§4.1): verificar atomicidad exige un testigo fuera del alcance revertido; exigirla sin verificarla es insuficiente, pero no exigirla es peor.

**Lo que dice ACA-1:** la generación cruzada (GEN en RES/COORD/AUTH/WIT) y la comprobación cruzada antes de cada mutación son el mecanismo propuesto para detectar el parcial (CE-10, §3.6). [PROPUESTA], no ratificado como mecanismo.

**Evaluación:** coherente con D-RB-01 A (bajo moratoria, la atomicidad es un requisito vigente en suspenso, como D-RB-02 A) y con D-RB-04 A (el testigo que verifica atomicidad es, en última instancia, el ancla externa). No hay contradicción.

**Requisito normativo vs mecanismo no seleccionado:** la atomicidad es un requisito; el mecanismo que la verificaría (diario, testigo, ancla) no está seleccionado. La circularidad de §4.1 sigue abierta (G-01).

**Estado:** REFLEJADA.

### 4.4 D-RB-04 A — Detección por ancla externa monótona

**Ratificado [RATIFICADO]:** la detección de un rollback se hará por ancla externa monótona (contador/log fuera del dominio; hardware/TEE).

**Lo que recomendaba el informe de rollback:** la recomendación era una combinación: "C como mínimo obligatorio inmediato; B como requisito para RB-1/RB-2; A como condición previa para permitir RB-3/RB-4". El propietario ratificó **A sola**, no la combinación. Esto es un hecho de la ratificación, no un error: el propietario eligió el elemento más fuerte como mecanismo requerido. Consecuencias de esa elección, registradas fielmente:

- La **declaración del ejecutor (C)** no queda ratificada como mecanismo de detección de D-RB-04, pero sobrevive como requisito por otras vías: D-RB-02 A (declaración explícita del ejecutor) y D-RB-09 A (registro externo). No hay vacío normativo para la declaración; hay vacío de mecanismo de detección para RB-1/RB-2, que la recomendación cubría con B.
- La **verificación cruzada interna (B)** no queda ratificada como mecanismo de detección. Sobrevive únicamente como mecanismo propuesto en ACA-1 (GEN cruzada), [PROPUESTA], sin ratificación.
- La **opción D (ninguna detección)** queda rechazada: es inaceptable bajo P05-C, como ya decía la especificación.

**Lo que dice ACA-1:** el ancla externa aparece como la única vía que haría VIABLE el claim ampliado, y como cambio de modelo (A-08 opción B: "autorizar ancla externa y/o mediador a nivel de kernel (nuevo R1)"). ACA-1 recomendaba A-08 opción A (aceptar la contención por política) "ahora; B como decisión separada y posterior", advirtiendo que B "es una decisión de modelo, no de arquitectura, y no debe tomarse implícitamente al aprobar un diseño".

**Evaluación — la distinción decisiva:** ratificar D-RB-04 A **exige un ancla**; no **selecciona su forma** ni **decide si cambia R1**. Es un requisito normativo, no un mecanismo. La forma concreta (contador, log, hardware, TEE, registro del propietario) no está elegida; si la forma elegida vive fuera del entorno R1, su adopción será un cambio de modelo que exigirá una decisión separada del propietario (como advertía ACA-1, A-08). Si la forma elegida es el registro externo del propietario (D-RB-09 A), su encaje en R1 es una cuestión abierta que deberá decidirse cuando se proponga. Esta tensión se registra como C-02 (archivo compañero): resuelta por la distinción requisito/mecanismo; abierta en cuanto a la forma y al encaje en R1.

**Requisito normativo vs mecanismo no seleccionado:** el requisito es "ancla externa monótona". No seleccionado: qué ancla, dónde vive, quién la mantiene, cómo se verifica, qué coste tiene, ni si su adopción redefine R1. Tampoco existe hoy ningún ancla: la ratificación no crea el mecanismo. (Ver G-01 y B-01.)

**Estado:** REFLEJADA COMO REQUISITO. Mecanismo pendiente de selección, diseño y verificación.

### 4.5 D-RB-05 A — Respuesta P05-C por alcance (matriz del §5)

**Ratificado [RATIFICADO]:** se aplica la matriz del §5 de la especificación: RB-1/RB-2 UNKNOWN/BLOCKED hasta reconciliación verificada; RB-3/RB-4 BLOCKED (inaplicable sin ancla/declaración); parcial detectado → BLOCKED.

**Lo que recomendaba el informe de rollback:** "A." Coincide exactamente. La recomendación añadía que B (BLOCKED uniforme) era aceptable como postura más conservadora, pero A ya es conservadora: BLOCKED en todos los casos; solo varía qué reconciliación lo levanta, y hoy ninguna existe (F14).

**Lo que dice ACA-1:** la máquina de estados (NORMAL/BLOCKED/QRT/REC) y los flujos de bloqueo y recuperación implementan exactamente esta matriz como política: BLOCKED es el estado por defecto; no hay transición automática fuera de BLOCKED; la recuperación exige predicados + atestación del propietario. [PROPUESTA] como diseño; la matriz misma es [RATIFICADO] por D-RB-05 A.

**Evaluación:** coherente con P05-C [RATIFICADO] y con D-RB-01 A (la matriz es la respuesta operativa de la moratoria ante un rollback conocido o sospechado). Bajo la moratoria total, la distinción RB-1/RB-2 vs RB-3/RB-4 de la matriz conserva su sentido como **clasificación de la violación detectada**, no como permiso por alcance: en ambos casos la respuesta es BLOCKED; lo que varía es qué reconciliación podría levantarlo (y hoy ninguna existe).

**Requisito normativo vs mecanismo no seleccionado:** la matriz es una regla de respuesta; no selecciona el procedimiento de reconciliación que levantaría el BLOCKED (no existe: F14/E8) ni el procedimiento de verificación de cuarentena (D-RB-08 A exige verificar; qué se verifica sigue sin definirse — ver G-07).

**Estado:** REFLEJADA CORRECTAMENTE.

### 4.6 D-RB-06 C — Prohibir el rollback si hay sesiones vivas

**Ratificado [RATIFICADO]:** prohibir el rollback si hay sesiones vivas; el ejecutor debe terminarlas; si no puede, no hay rollback.

**Lo que recomendaba el informe de rollback:** "C como regla, con A como su justificación." Coincide exactamente. La recomendación registraba que verificar quiescencia (A) es el problema abierto CE-1/Q: la precondición puede ser inverificable, y C es la forma ejecutable de A (si no se puede demostrar quiescencia, no hay rollback).

**Lo que dice ACA-1:** la revocación del supervisor (SUP) es precisamente el procedimiento de terminación verificada de sesiones: cerrar admisión → SIGSTOP al grupo → verificar poseedores por /proc → SIGKILL → verificar grupo vacío → solo entonces nueva generación. [PROPUESTA]. ACA-1 registra además CE-12 (escape del grupo) y CE-13 (carrera revocación/escritura) como contraejemplos abiertos contra ese procedimiento.

**Evaluación:** coherente con D-RB-01 A (bajo moratoria, la regla está subsumida: no hay rollback ni con sesiones ni sin ellas; se convierte en regla vigente en suspenso para cualquier levantamiento futuro) y con CE-1 (el proceso antiguo pausado es el caso que la regla prohíbe). No hay contradicción. La dificultad de verificar quiescencia (A) queda registrada, no ocultada: es la brecha G-06/B-03 en parte.

**Requisito normativo vs mecanismo no seleccionado:** la regla prohíbe; no selecciona el procedimiento de terminación ni su verificación (el procedimiento SUP es [PROPUESTA] de ACA-1, no ratificado).

**Estado:** REFLEJADA CORRECTAMENTE.

### 4.7 D-RB-07 A — AUTH no se revierte

**Ratificado [RATIFICADO]:** se prohíben los alcances que revierten AUTH (RB-3, RB-4) mientras no exista ancla externa (D-RB-04 A).

**Lo que recomendaba el informe de rollback:** "A." Coincide exactamente. La recomendación: B (re-emisión de credenciales frescas) es circular — invalidar con un registro que el rollback puede revertir — y hoy no tiene procedimiento; C contradice F2. Si el propietario necesita recuperar AUTH, debe hacerlo por un procedimiento aprobado nuevo, no por rollback.

**Lo que dice ACA-1:** los leases de un solo uso con doble registro (AUTH + WIT) y la generación cruzada son el mecanismo propuesto para contener CE-5 (I-2, C-2). [PROPUESTA]. ACA-1 no propone re-emitir credenciales tras rollback; coincide con la prohibición.

**Evaluación:** coherente con D-RB-01 A (la prohibición de RB-3/RB-4 por D-RB-07 A es redundante con la moratoria total, pero no contradictoria: es la misma prohibición vista desde AUTH) y con D-RB-04 A (la condición "mientras no exista ancla externa" se lee como realización del ancla, no como su mera decisión; ver C-03).

**Requisito normativo vs mecanismo no seleccionado:** la prohibición es normativa; no hay mecanismo de recuperación de AUTH corrupta (no existe procedimiento aprobado: F14). La recuperación de AUTH corrupta queda sin vía: es el coste declarado de la moratoria (ver §4.1).

**Estado:** REFLEJADA CORRECTAMENTE.

### 4.8 D-RB-08 A — Cuarentena obligatoria (C09)

**Ratificado [RATIFICADO]:** cuarentena obligatoria + verificación antes de activar cualquier dato restaurado.

**Lo que recomendaba el informe de rollback:** "A." Coincide exactamente. La recomendación: C09 ya lo exige como corrección sobreviviente del dictamen; no es una opción nueva sino una exigencia existente que la especificación aplica al rollback. B y C contradicen C09.

**Lo que dice ACA-1:** el componente QRT (cuarentena) es parte del diseño, nunca auto-activada, con activación solo por REC. [PROPUESTA] como mecanismo; la exigencia es [RATIFICADO] por D-RB-08 A.

**Evaluación:** coherente con P05-C y con D-RB-05 A (la cuarentena es el estado intermedio entre la detección y cualquier activación). No hay contradicción. Pendiente: definir qué se verifica en cuarentena (integridad, coherencia RES↔COORD↔AUTH, vigencia) — trabajo documental posterior señalado ya por la especificación (G-07).

**Requisito normativo vs mecanismo no seleccionado:** la exigencia es normativa; el procedimiento de verificación en cuarentena no está definido ni seleccionado.

**Estado:** REFLEJADA CORRECTAMENTE.

### 4.9 D-RB-09 A — Registro externo obligatorio

**Ratificado [RATIFICADO]:** registro externo obligatorio (fuera de DOM o en canal externo) con ámbito, snapshot, ejecutor, instante y resultado.

**Lo que recomendaba el informe de rollback:** "A, como precondición de cualquier rollback permitido." Coincide. La recomendación: sin registro externo no hay declaración verificable (D-RB-04 C) ni detección de RB-3/RB-4; el registro es barato comparado con el ancla hardware y es su sustituto documental mínimo. Debe especificarse qué canal externo (el propietario decide el canal; el documento no lo inventa).

**Lo que dice ACA-1:** el testigo WIT en su variante B (registro del propietario, D-RB-09) es el único testigo que sobrevive a RB-4; A-07 recomienda "C, con B como mínimo obligatorio" (ambos testigos, con el registro del propietario como mínimo). [PROPUESTA]. ACA-1 no decide A-07; sigue pendiente.

**Evaluación:** coherente con D-RB-02 A (el registro es la forma verificable de la declaración del ejecutor) y con D-RB-04 A (el registro es la forma documental mínima del ancla; no es el ancla misma — ver §4.4). Bajo la moratoria total, el registro conserva su función: es el testigo que permite detectar *a posteriori* una violación de la moratoria y reconstruir qué ocurrió. No hay contradicción.

**Requisito normativo vs mecanismo no seleccionado:** el registro es obligatorio; el canal, el formato y el custodio no están especificados. La especificación no los inventa; el propietario decide el canal (G-08). Que el registro *cuente* como el ancla de D-RB-04 A es una cuestión abierta (C-02): el registro es humano, falible (CE-15) y no es un contador monótono verificable por máquina.

**Estado:** REFLEJADA CORRECTAMENTE. Canal pendiente de especificación.

---

## 5. Corrección de alcance de D-RB-01 A

**Regla corregida [RATIFICADO]:** la moratoria de D-RB-01 A cubre **RB-1, RB-2, RB-3 y RB-4**. Ningún alcance de rollback está permitido. Cualquier referencia en los informes anteriores que presente RB-1 (o RB-1/RB-2) como alcance permitido, como vía futura disponible, o como escenario que la arquitectura "maneja" en lugar de "detecta como violación", queda corregida por esta sección. Los documentos anteriores no se reescriben; esta reconciliación es el registro de la corrección.

| # | Referencia | Ubicación exacta | Lo que dice | Lectura corregida |
|---|---|---|---|---|
| R-01 | Recomendación de D-RB-01 | Rollback §7, fila D-RB-01, columna Recomendación | "A como postura inmediata, **con B como vía futura**… La moratoria no es una prohibición permanente: es la postura conforme mientras D-RB-04 no se resuelva. Si el propietario necesita una vía de recuperación antes, **B es la única con detección interna posible**." | **B no es una vía.** La opción B (solo RB-1) no fue ratificada y no está disponible. Abrir RB-1 — o cualquier alcance — exige una **nueva decisión del propietario** que levante o modifique la moratoria. La moratoria no tiene vía futura pre-autorizada. |
| R-02 | Tabla comparativa §3.5 | Rollback §3.5, fila "Condición mínima para permitirlo" | "Comprobación cruzada RES↔COORD↔AUTH" (RB-1), "Comprobación COORD↔AUTH + atomicidad" (RB-2), etc., como condiciones **para permitir** cada alcance. | Léase **"condición mínima para detectar su violación"**. Bajo la moratoria, esas comprobaciones son detectores de una violación prohibida, no requisitos previos de una operación permitida. |
| R-03 | Vía mínima (§7.1) | Rollback §7.1, párrafo "Si el propietario decide solo D-RB-01 A…" | "La postura es completa y conforme: moratoria + ninguna otra decisión urgente, **salvo clasificar al SO como ejecutor (D-RB-02 C) y desactivar o declarar su backup**." | La frase no es errónea, pero su condición **sigue pendiente**: la clasificación del SO y la declaración/desactivación del backup no fueron ratificadas (D-RB-02 A no incluye C; A-03 sigue UNKNOWN/PENDING, §7). La "vía mínima" no está completa. Ver G-02/G-03. |
| R-04 | Título y opción C de A-02 | ACA-1 §8, fila A-02 | Título: "**Moratoria RB-3/RB-4** (D-RB-01 A) como precondición de ACA-1". Opción C: "**Solo RB-1 admitido**". | La moratoria es **RB-1–RB-4**. El título debe leerse "Moratoria RB-1–RB-4 (D-RB-01 A)". La opción C de A-02 queda **sin objeto**: no está disponible bajo D-RB-01 A ratificada. |
| R-05 | Encuadre del claim restringido | ACA-1 §1 (l. 203), §2.6 (l. 338), §3.2 (l. 450–451), §6 (l. 587, 598, 600), §9 (l. 765) | "Viable para el claim restringido (escritores COVERED, **rollback RB-1/RB-2**, recuperación mediada por el propietario)"; "Detección de rollback RB-1/RB-2"; "En RB-1/RB-2 el replay se [delata]…". | Bajo la moratoria, **RB-1/RB-2 es una violación prohibida, no una operación permitida**. Los mecanismos de detección (GEN cruzada, doble registro) conservan su valor como **detectores de violación**; su función ya no es "manejar" un rollback permitido. Las garantías condicionales C-2/C-4 se releen en ese sentido: condicionadas a que la violación sea detectable, no a que el rollback esté permitido. El veredicto PARCIAL de ACA-1 se mantiene; su descripción del claim restringido se corrige en este sentido. |

**Consecuencia para ACA-1 (§9):** la frase "PARCIAL es estable si el propietario acepta A-01, A-02 y A-08 opción A" (ACA-1 l. 801) se reevalúa en §6. La condición de A-02 está satisfecha en su forma corregida (moratoria total); A-01 y A-08 siguen pendientes.

---

## 6. Condición de estabilidad de ACA-1 tras las ratificaciones

ACA-1 (§9) declaraba que su veredicto PARCIAL es estable si el propietario acepta A-01 (autorizar mediador + supervisor), A-02 (moratoria) y A-08 opción A (aceptar la contención por política). Tras las ratificaciones D-RB-01–D-RB-09:

| Condición de ACA-1 | Estado tras las ratificaciones |
|---|---|
| A-02 (moratoria) | **Satisfecha en forma corregida.** D-RB-01 A ratifica la moratoria, con alcance total (RB-1–RB-4) según §5. La forma "RB-3/RB-4" de A-02 queda corregida. |
| A-01 (autorizar MED + SUP) | **Pendiente.** No forma parte de D-RB-01–D-RB-09. El mediador y el supervisor siguen sin autorización. |
| A-08 opción A (aceptar contención por política) | **Pendiente.** No forma parte de D-RB-01–D-RB-09. El propietario no ha aceptado formalmente la contención por política para I-1–I-7, ni ha elegido el cambio de modelo (opción B). |

**Consecuencia:** el veredicto PARCIAL de ACA-1 **se mantiene** (la arquitectura sigue siendo viable solo para el claim restringido, en su lectura corregida de §5, R-05), pero su **condición de estabilidad está parcialmente satisfecha** (1 de 3). ACA-1 sigue siendo [PROPUESTA]: ningún elemento de su diseño está autorizado por las ratificaciones D-RB-01–D-RB-09, salvo la moratoria que ya era su precondición. La autorización de implementación (A-09) no ha sido solicitada ni concedida.

---

## 7. A-03 se mantiene UNKNOWN/PENDING

**A-03 (ACA-1 §8):** "Desactivar o declarar el backup/saved-state de Android para el dominio (o aceptar el riesgo)". Opciones: A. Desactivar; B. Declarar como ejecutor con BLOCKED posterior; C. Aceptar el riesgo. Recomendación de ACA-1: A o B; C debe rechazarse.

**Estado: UNKNOWN/PENDING.** No ha cambiado.

**Por qué no se puede resolver con la evidencia disponible:**

1. La especificación de rollback (F11) establece que el backup y el saved-state de Android son dominios separados que pueden restaurar el estado de una app, y clasifica al SO como ejecutor posible no declarado. Pero **no contiene evidencia específica de que Android backup restaure el HOME de Termux** (`/data/data/com.termux/files/home`). La restauración de estado de app y la restauración del HOME privado de Termux son hechos distintos; el segundo no está evidenciado en la rama.
2. D-RB-02 A ratifica que solo el propietario ejecuta un rollback, pero no clasifica al SO: la clasificación explícita del SO (opción C de D-RB-02, recomendada como acompañamiento de A) **no fue ratificada**.
3. Esta reconciliación no ha realizado ninguna lectura nueva de fuentes primarias sobre Android/Termux (su encargo es contrastar decisiones con dos informes, no investigar la plataforma), por lo que no puede aportar la evidencia que falta.

**Consecuencia:** mientras A-03 siga UNKNOWN/PENDING, la moratoria (D-RB-01 A) **no tiene enforcement frente a un ejecutor no declarado**: si el SO pudiera restaurar el HOME sin conocimiento del propietario, la violación de la moratoria sería indetectable desde dentro (RB-3/RB-4 en forma pura) hasta que existiera el ancla (D-RB-04 A, no realizada) o el registro (D-RB-09 A, canal sin especificar). Ver G-02, G-03 y B-01 en el archivo compañero.

**Qué resolvería A-03:** evidencia específica (lectura primaria de la documentación de Android backup / Termux, o evidencia de comportamiento) sobre si el backup de Android restaura el HOME de Termux, seguida de la decisión del propietario entre desactivar, declarar o aceptar. La evidencia es trabajo preparatorio; la decisión es del propietario cuando se proponga con esa evidencia.

---

## 8. Estados preservados

Las ratificaciones D-RB-01–D-RB-09 **no cambian** los estados documentales siguientes. Ninguna de las nueve decisiones es una demostración técnica; una decisión no convierte una obligación en satisfecha.

| Elemento | Estado (sin cambio) |
|---|---|
| P05-C | RATIFICADA COMO POLÍTICA (2026-11-07) |
| P05 | OPEN (sin mecanismo, enforcement ni evidencia) |
| P07 V2.3 | RATIFICADO (8-Nov-2026) |
| P07-C | UNKNOWN / BLOCKING |
| P09 | OPEN / UNKNOWN |
| M0 | INCOMPLETO |
| `authorization` | NOT_EVALUATED |
| E2/E3 (matriz de aceptación) | PARTIAL / NOT CLOSED |
| P-RESTORE (operación snapshot/restore) | Semántica UNKNOWN (sin definición canónica en la rama) |
| Criterio de identidad P07-A | Sin decidir |
| Readmisión aprobada (F14/E8) | No existe |

### 8.1 Obligaciones O1–O9: sin demostración técnica

Las ratificaciones no demuestran ninguna obligación. El estado de cada obligación es el mismo que en la falsación y en ACA-1:

| Obligación | Estado | Qué cambiaría el estado |
|---|---|---|
| O1 (terminación y release) | PARCIAL (diseño fail-closed) / CONDICIONAL (rollback) | Realización del ancla + autorización de MED/SUP |
| O2 (descubrimiento del estado anterior) | CONDICIONAL (C-4): RB-1/RB-2 detectable; RB-3/RB-4 no | Ancla realizada (D-RB-04 A) |
| O3 (admisión y namespace) | CONDICIONAL | Criterio de identidad P07-A + MED autorizado |
| O4 (serialización) | CONDICIONAL | MED autorizado + P09 cerrado |
| O5 (identidad persistente) | PARCIAL (pérdida/ilegibilidad) / CONDICIONAL (sustitución) | P07-A + procedimiento de re-identificación |
| O6 (no inferencia por PID/edad/ausencia) | Satisfecha por diseño (prohibición) | — |
| O7 (cobertura de actores) | CONDICIONAL | P09 cerrado |
| O8 (fingerprint del target) | UNKNOWN | Evidencia del target (POCO/Termux) |
| O9 (efecto de la evidencia) | Satisfecha por diseño (evidencia positiva requerida) | — |

Detalle de brechas y bloqueos: ver el archivo compañero.

---

## 9. Verificación: ninguna decisión autoriza implementación

Verificación explícita, decisión por decisión: ninguna de las nueve ratificaciones selecciona una tecnología o framework, autoriza código, harness, pruebas, CI, runtime, bootstrap ni acciones en el dispositivo, ni autoriza publicar o fusionar.

| Decisión | ¿Autoriza implementación? |
|---|---|
| D-RB-01 A | No. Es una prohibición (moratoria). |
| D-RB-02 A | No. Es una regla de ejecutor. No autoriza herramienta alguna (la opción B, "herramienta designada", no fue ratificada). |
| D-RB-03 A | No. Es un requisito de atomicidad. |
| D-RB-04 A | No. Es un requisito de detección. No selecciona el ancla (ver §4.4). |
| D-RB-05 A | No. Es una regla de respuesta P05-C. |
| D-RB-06 C | No. Es una regla de prohibición. |
| D-RB-07 A | No. Es una prohibición. |
| D-RB-08 A | No. Es una exigencia de cuarentena. No define el procedimiento de verificación. |
| D-RB-09 A | No. Es una exigencia de registro. No especifica canal, formato ni custodio. |

ACA-1 sigue siendo [PROPUESTA] en su totalidad. Su decisión A-09 (autorización de implementación) no ha sido solicitada ni concedida. **No se ha implementado nada ni se ha ejecutado nada en esta reconciliación** (ver §10).

---

## 10. Veredicto y resumen

**Veredicto: PARTIAL.**

- **Decisiones correctamente reflejadas: 9 de 9**, tras las correcciones de §5. Ocho ratificaciones coinciden exactamente con la opción recomendada por el informe de rollback (D-RB-01 A, D-RB-02 A, D-RB-03 A, D-RB-05 A, D-RB-06 C, D-RB-07 A, D-RB-08 A, D-RB-09 A). Una (D-RB-04 A) selecciona el elemento más fuerte de una recomendación que era una combinación (C mínimo + B + A como condición para RB-3/RB-4): la declaración (C) sobrevive por D-RB-02 A y D-RB-09 A; la verificación cruzada (B) sobrevive solo como propuesta de ACA-1.
- **Contradicciones encontradas: 3 aparentes, 0 irresolubles.** C-01 (reducción de alcance de D-RB-01 A en los informes anteriores), C-02 (ancla como requisito vs ancla como cambio de modelo), C-03 (condición de fin de la moratoria). Las tres se resuelven interpretando fielmente las ratificaciones; ninguna exige una nueva decisión del propietario. Detalle en el archivo compañero.
- **Correcciones registradas:** R-01–R-05 (§5). La corrección central: la moratoria cubre RB-1, RB-2, RB-3 y RB-4; B no es una vía futura; RB-1/RB-2 es violación prohibida, no operación permitida.
- **Bloqueos pendientes:** detección de rollback no declarado sin ancla (B-01); sin procedimiento aprobado de recuperación/readmisión (B-02); P09 abierto (B-03); sin evidencia del target (B-04); GitHub no conectado — Snow no puede publicar (B-05). Detalle en el archivo compañero.
- **A-03:** UNKNOWN/PENDING (§7).
- **Estados:** P05 OPEN, P07-C UNKNOWN/BLOCKING, P09 OPEN/UNKNOWN, M0 INCOMPLETO — sin cambio.
- **No se solicita ninguna nueva decisión** al propietario en esta reconciliación.

**Confirmación explícita:** esta reconciliación es solo lectura y análisis documental. No se modificó código, no se ejecutaron tests, CI, runtime, bootstrap ni acciones en el dispositivo, no se modificó ni fusionó ningún PR, no se inventó evidencia ni se convirtió ninguna propuesta en decisión, y no se declara M0 completo.

---

## Anexo A. Trazabilidad al archivo compañero

El segundo entregable de esta misión, `NCS_M0_ROLLBACK_RECONCILIATION_GAPS_AND_BLOCKERS_2026-11-10.md`, enumera exclusivamente las contradicciones, brechas y bloqueos que siguen abiertos:

- C-01 — Reducción de alcance de D-RB-01 A en los informes anteriores (corregida aquí, §5; pendiente de registro en la rama).
- C-02 — Ancla: requisito ratificado vs cambio de modelo (ACA-1 A-08).
- C-03 — Condición de fin de la moratoria ("hasta D-RB-04") y de la prohibición de AUTH.
- G-01 – G-10 — Brechas (ancla sin seleccionar, A-03 pendiente, SO sin clasificar, A-01–A-09 sin decidir salvo moratoria, O1–O9 sin demostración, target sin fingerprint, sin procedimiento de recuperación, canal del registro sin especificar, P09 abierto, mecanismos C/B de D-RB-04 no ratificados).
- B-01 – B-05 — Bloqueos (detección de rollback no declarado, sin vía de recuperación, P09, target, publicación).

## Anexo B. Nota sobre la copia de la falsación en la rama

La copia de `NCS_M0_P05_P07_CE1_CE5_CE7_INDEPENDENT_FALSIFICATION_2026-11-10.md` publicada en la rama difiere de la copia local solo en formato (línea 1000–1001 plegada en una sola línea; falta el salto de línea final). Contenido idéntico, verificado por `diff`. No es una revisión del documento. Se registra aquí para que la diferencia de hash (`534c728c…` en rama frente a `8f1bb646…` local) no se interprete como una versión distinta del informe.
