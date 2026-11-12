# NCS M0 — T-02: Predicados de REC y de verificación de cuarentena (BORRADOR REVISADO)

**Estado del documento:** PROPUESTA. No es decisión, no autoriza implementación, no cierra G-2/G-3 y no levanta la moratoria D-RB-01.
**Tarea:** T-02, entregable 2 de 3 — corrección independiente de REC/cuarentena.
**Sustituye a:** `NCS_M0_T02_REC_QUARANTINE_PREDICATES_SPEC_2026-11-12.md` (para uso en revisión; el original no se modifica).
**Fecha de elaboración:** 2026-11-11 (nombre de entregable: 2026-11-12).
**HEAD de la rama: UNKNOWN** (ver §8).

## 1. Alcance

Especifica, como PROPUESTA, los predicados de REC (BLOCKED/QRT → NORMAL) y los criterios de verificación de cuarentena. Distingue los escenarios de incertidumbre y fija qué no puede resolver REC. No define condiciones de recuperación que las fuentes no contengan.

## 2. Fuentes (rutas relativas a `NEXO_NCS/`, SHA-256 verificado el 2026-11-11)

| Fuente | SHA-256 | Uso |
|---|---|---|
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/Reconciliación de decisiones de rollback.md` | `f1d5e4bd98ea14b6459525f5502a120496e0105fde8c219c7f63827d0d266057` | §0.3 (opciones ratificadas), §4.1 (D-RB-01 A), §4.4 (D-RB-04 A), §4.5 (D-RB-05 A, matriz por alcance), §4.8 (D-RB-08 A) |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md` (ACA-1) | `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` | §2.1 (máquina de estados; líneas 214–222 con los disparadores de BLOCKED), §2.4 (disparadores del bloqueo, líneas 308–336), §2.5 (revocación, pasos 2–5), §2.6 (REC, pasos 1–8), línea 181 (QRT), tabla A-04 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_CLOSURE_CRITICAL_PATH_AND_EVIDENCE_CONTRACT_2026-11-10.md` (contrato de evidencia) | `a5c4710a0b5ef0426d5980cbadf4790a420620bb75fd2ab3b94765724f4547ce` | G-2 (línea 135), G-5/G-07, P05-C como política ratificada y respuesta por defecto (línea 301) |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_MINIMUM_SAFE_CLOSURE_PLAN_2026-11-10.md` (plan de cierre) | `6db9b6daac569e1bfa4c35ffcb6d9b422983328eb273803a78862fd34578e49f` | Filas T-02 (línea 11) y T-07 (línea 16) |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_ROLLBACK_SEMANTICS_AND_OWNER_DECISIONS_SNOW_2026-11-10.md` | `f36008ec442736cfd822b5cd956c2ddfe4e8d6119a74816cf34c033630d343a4` | Detectabilidad por alcance RB-1…RB-4 (líneas 218, 230, 242, 245, 257) |

Ausentes del clon y no sustituidos: `OPERATIONS/NON_REPETITION_PROTOCOL.md`, `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` (ver §8).

## 3. Hechos verificados

- **Moratoria (D-RB-01 A, ratificada):** cualquier rollback, conocido o sospechado, produce STOP/UNKNOWN. Abarca RB-1, RB-2, RB-3 y RB-4 (Reconciliación §4.1 y §5).
- **Respuesta P05-C por alcance (D-RB-05 A, ratificada):** RB-1/RB-2 en UNKNOWN/BLOCKED hasta una reconciliación verificada; un parcial detectado, en BLOCKED. Para RB-3/RB-4 se separan tres planos: (1) **obligación normativa:** RB-3/RB-4 mantienen la respuesta obligatoria BLOCKED conforme a D-RB-05; (2) **detección técnica:** cuando no existe ancla externa realizada ni declaración del ejecutor, el mecanismo de detección por esas vías es inaplicable; (3) **enforcement:** sigue UNKNOWN/no demostrado; la inaplicabilidad del mecanismo de detección no elimina la obligación normativa ni autoriza continuar. Hoy no existe ninguna reconciliación que levante el BLOCKED (Reconciliación §4.5; rollback F14).
- **Disparadores de BLOCKED** (ACA-1 §2.4): crash con resultado ambiguo; inconsistencia GEN entre copias; identidad no verificable; lease inválido o reutilizado; nonce re-presentado; MED muerto; escritura directa detectada; rollback declarado por el ejecutor; holder desconocido.
- **Sin reintento de negocio** ante release o crash ambiguo: el reintento es operación nueva con lease nuevo (ACA-1 §2.3, §2.4; O9).
- **Máquina de estados** (ACA-1 §2.1): no hay transición automática BLOCKED → NORMAL ni QRT → NORMAL (líneas 248–250). Un arranque de MED arranca en BLOCKED.
- **Cuarentena (QRT)**: conserva el estado sospechoso con su diagnóstico, sin activarlo; nada sale de QRT automáticamente (C09; ACA-1 línea 181).
- **Detectabilidad por alcance**: RB-1 detectable por inconsistencia interna (RES↔COORD↔AUTH); RB-2 parcialmente detectable (COORD↔AUTH); RB-3 indetectable desde dentro (rollback autoconsistente).
- **Obligación normativa de BLOCKED para RB-3/RB-4 (D-RB-05 A, ratificada):** la respuesta documentada es BLOCKED. Es una obligación de política; no describe una capacidad implementada.
- **Enforcement técnico de BLOCKED para RB-3/RB-4: no demostrado (UNKNOWN).** Ninguna fuente verifica que el sistema lo haga cumplir. Sin ancla externa realizada ni declaración del ejecutor, D-RB-05 declara inaplicable el mecanismo de detección por esas vías (Reconciliación §4.5).
- **Consecuencia de la indetectabilidad:** que RB-3/RB-4 sean indetectables desde dentro no elimina la obligación normativa de BLOCKED, no autoriza continuar y no permite transición a NORMAL. Sin evidencia suficiente, prevalece UNKNOWN/STOP.
- **La generación fresca (paso 7 de REC) la emite el propio sistema.** No es un testigo externo.

## 4. Clasificación de escenarios

Las fuentes distinguen los escenarios siguientes. La respuesta está en la fuente en la columna «Respuesta documentada»; las condiciones de salida hacia NORMAL no están en la fuente salvo donde se indica.

| Escenario | Qué lo caracteriza | Respuesta documentada | Condición de salida a NORMAL |
|---|---|---|---|
| **E-A. Crash ambiguo** | Resultado de operación no determinado tras crash; no hay rollback | BLOCKED; sin reintento de negocio; QRT con diagnóstico (ACA-1 §2.4, §2.3) | Por REC (P-R1.1…P-R1.8). Suficiencia de la evidencia: **UNKNOWN** |
| **E-B. Rollback detectado** | Inconsistencia que evidencia un rollback (RB-1 o RB-2 detectables, o parcial) | D-RB-01: STOP/UNKNOWN. D-RB-05: BLOCKED; reconciliación que lo levante, **ninguna existe** (F14) | **UNKNOWN.** Las fuentes no definen condiciones de salida. No se propone ninguna |
| **E-C. Rollback sospechado** | Indicio no concluyente de rollback. Incluye RB-3/RB-4, que son indetectables desde dentro | **Normativa:** D-RB-01 → STOP/UNKNOWN; D-RB-05 → BLOCKED para RB-3/RB-4 (obligación normativa, no capacidad implementada). **Técnica:** el enforcement de BLOCKED **no está demostrado (UNKNOWN)**; sin ancla realizada ni declaración del ejecutor, el mecanismo de detección que D-RB-05 prevé es inaplicable | **Sin vía de salida definida; excluido de REC.** Ni la ausencia de detección técnica ni la ausencia de ancla o de declaración **autorizan continuar o NORMAL**. Sin evidencia suficiente para determinar el escenario, prevalece **UNKNOWN/STOP**. La falta de detección técnica **no elimina** la obligación normativa de BLOCKED |
| **E-D. Evidencia insuficiente** | Predicados de REC no verificables (P-R1.2, P-R1.4, P-R1.5) | UNKNOWN/BLOCKED; fracaso de cualquier paso deja BLOCKED/QRT (ACA-1 §2.6) | **BLOCKED/QRT** mientras la evidencia necesaria no sea verificable. La evidencia adicional **no convierte E-D en E-A automáticamente**. Solo si la evidencia establece que el caso subyacente es E-A puede evaluarse REC, exigiendo P-R1.1…P-R1.8. El umbral de suficiencia es **UNKNOWN** |

Regla común a E-A…E-D: ninguna transición automática sale de BLOCKED/QRT (ACA-1 §2.1). REC es el único camino previsto, y su fracaso devuelve a BLOCKED/QRT.

## 5. Predicados de REC (PROPUESTA, por paso de ACA-1 §2.6, con correcciones)

| Paso | Acción (ACA-1 §2.6) | Predicado propuesto | Estado de la regla |
|---|---|---|---|
| 1 | Congelar: sin admisión, mutaciones ni limpieza; MED detenido o solo diagnóstico | **P-R1.1:** admisión cerrada y MED en modo diagnóstico o detenido | Definido en ACA-1. Verificación técnica UNKNOWN |
| 2 | Diagnosticar: evidencia externa (GEN por copia, identidad, leases, procesos, registro del ejecutor) | **P-R1.2:** inventario completo de la evidencia enumerada, con fuente externa | Lista definida. **Umbral de suficiencia UNKNOWN** |
| 3 | Poner en cuarentena: estado sospechoso a QRT con diagnóstico | **P-R1.3:** estado y diagnóstico registrados en QRT; ningún dato activado | Definido (C09). Sin verificación técnica en fuentes |
| 4 | Verificar poseedores (SUP, como revocación §2.5 pasos 2–5) | **P-R1.4:** ningún poseedor vivo de capacidad sobre RES. Sin esta verificación no hay recuperación | Depende de SUP (A-01) y de `/proc`. **Disponibilidad en Termux: SUPUESTO**, sin evidencia |
| 5 | Re-identificar (IDN): R-OBJ y R-NAME vigentes | **P-R1.5:** R-OBJ y R-NAME verificados; si no, objeto **no identificado** | Depende de A-06 (entregable 1). Sin criterio aprobado: UNKNOWN |
| 6 | Atestación del propietario fuera de banda, registrada externamente | **P-R1.6:** atestación de qué ocurrió (crash, rollback y su alcance, intervención) y de qué debe activarse o descartarse en QRT. Registrada en el registro externo. **Necesaria, no suficiente**: la atestación no sustituye P-R1.1…P-R1.5 ni P-R1.7 | Depende de A-04 (opción A recomendada, no decidida) y de G-08. **Canal UNKNOWN** |
| 7 | Emitir generación fresca, solo tras 4–6 | **P-R1.7:** GEN nueva que invalida los leases anteriores. **Necesaria, no suficiente**: la emite el propio sistema; no constituye evidencia externa ni autoriza por sí sola volver a NORMAL | Definido en ACA-1. Verificación técnica UNKNOWN |
| 8 | Re-admitir a NORMAL; primera operación = verificación (identidad + GEN) | **P-R1.8:** transición a NORMAL solo si P-R1.1…P-R1.7 se cumplen **y** el escenario no es E-B ni E-C (ver §6). La primera operación tras REC no es de negocio | Definido en ACA-1 para la parte de la primera operación. La exclusión de E-B/E-C es corrección de esta revisión (ver §7) |

Regla de fracaso: el fallo de cualquier predicado deja el sistema en BLOCKED/QRT (ACA-1 §2.6).

## 6. Alcance de REC

- **E-A (crash ambiguo)** es el único escenario candidato a salida mediante REC. La salida queda sujeta al cumplimiento de todos los predicados P-R1.1…P-R1.8 y a evidencia suficiente (P-R1.2).
- **E-B (rollback detectado) y E-C (rollback sospechado)** no tienen vía de salida definida en las fuentes. Quedan excluidos de REC y permanecen en STOP/UNKNOWN. Para RB-3/RB-4, la obligación normativa BLOCKED de D-RB-05 se mantiene; su enforcement técnico no está demostrado y no se presume.
- **E-D (evidencia insuficiente)** permanece en BLOCKED/QRT mientras la evidencia necesaria no sea verificable. Que aparezca evidencia adicional no lo convierte automáticamente en E-A. Solo si esa evidencia establece que el caso subyacente es E-A puede evaluarse REC, exigiendo P-R1.1…P-R1.8 completos. No se define aquí umbral ni procedimiento de verificación (UNKNOWN).
- **REC no levanta D-RB-01 ni modifica ninguna decisión ratificada**: D-RB-01…D-RB-09, P05-C ni P07 V2.3. No autoriza ningún alcance de rollback RB-1…RB-4 ni lo convierte en operación permitida.
- **Un cambio de la moratoria** (por ejemplo, admitir RB-1 o RB-2) exige una decisión explícita del propietario (Reconciliación C-03). No se solicita aquí y no se presume.
- **La atestación del propietario (P-R1.6) y la GEN fresca (P-R1.7) son necesarias, no suficientes.** Ninguna de las dos autoriza por sí sola volver a NORMAL.

## 7. Correcciones frente al borrador original

1. Se añade la regla de moratoria: rollback conocido o sospechado produce STOP/UNKNOWN (D-RB-01 A). Antes el borrador no lo recogía.
2. Se establece que REC no levanta la moratoria D-RB-01 y que no autoriza ningún alcance de rollback.
3. Se establece que la atestación (P-R1.6) y la GEN fresca (P-R1.7) son necesarias pero no suficientes, y que la generación la emite el propio sistema. Antes el borrador las trataba como cierre de la recuperación.
4. Se distinguen cuatro escenarios: crash ambiguo (E-A), rollback detectado (E-B), rollback sospechado (E-C) y evidencia insuficiente (E-D), con su respuesta documentada.
5. No se inventan condiciones de recuperación ni decisiones del propietario. Las salidas de E-B y E-C quedan UNKNOWN.
6. Se mantienen como UNKNOWN todos los puntos que no pueden demostrarse (§8).

## 8. Cuarentena, UNKNOWN y límites

**Verificación de cuarentena (D-RB-08 A; candidatos de G-07):**
- Regla firme: ningún dato restaurado se activa sin cuarentena y verificación previas (D-RB-08 A). Nada sale de QRT sin REC (C09; ACA-1 D-7).
- **Q-1, integridad:** UNKNOWN (sin algoritmo ni alcance definidos).
- **Q-2, coherencia RES↔COORD↔AUTH:** capacidad según el alcance de rollback (RB-1 sí; RB-2 solo COORD↔AUTH; RB-3 no detectable). Umbral UNKNOWN.
- **Q-3, vigencia:** UNKNOWN. Ninguna fuente define qué significa «vigente» para un dato restaurado.

**UNKNOWN (no completado por inferencia):**
- Umbral de suficiencia de la evidencia (P-R1.2) y de las condiciones de salida de E-B y E-C.
- Disponibilidad de `/proc` y verificación de poseedores en Termux (P-R1.4).
- Contenido de Q-1, umbral de Q-2 y contenido de Q-3.
- Canal, formato y custodio del registro externo (P-R1.6; G-08).
- Procedimiento que detecta RB-3 sin ancla externa (ver entregable 3, anclas).

**Límites documentales:**
- `OPERATIONS/NON_REPETITION_PROTOCOL.md` y `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` no están en el clon. Este documento no usa ninguna conclusión que dependa de ellos.
- ACA-1 (línea 11) cita un HEAD `eee2ae77…`, distinto de los registrados en el corrigendum. **HEAD: UNKNOWN**; no se reconcilia aquí.
- No se revisa de nuevo P07-A ni el ancla externa en esta tarea.

## 9. Cuestiones abiertas

1. ¿Existe, y en qué términos, una vía de salida a NORMAL para E-B y E-C? Las fuentes no la definen. Requeriría una decisión futura del propietario, no solicitada aquí.
2. ¿Qué constituye evidencia suficiente en P-R1.2? UNKNOWN.
3. ¿Cómo se verifica poseedores (P-R1.4) en Termux? SUPUESTO, sin evidencia.
4. Canal, formato y custodio del registro externo (G-08).
5. A-04 (atestación como raíz de REC) y A-06 (identidad): decisiones del propietario, no tomadas.
