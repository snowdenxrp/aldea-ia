# NCS M0 — T-02: Opciones de ancla externa monótona y canal de registro

**Estado del documento:** PROPUESTA. No es decisión, no selecciona forma de ancla, no autoriza implementación y no cierra G-2.
**Tarea:** T-02, entregable 3 de 3 (propuesta de ancla + canal de registro, con alternativas).
**Dependencias de decisión:** forma del ancla y encaje en R1 (propietario, T-03), A-08 (alcance del claim o cambio de modelo), A-07 (diseño del testigo), A-03 (SO/backup), S-8.
**Fecha de elaboración:** 2026-11-11 (nombre de entregable: 2026-11-12).
**HEAD de la rama: UNKNOWN** (ver §7).

## 1. Requisito ratificado y lo que no lo es

- **D-RB-04 A [RATIFICADO]:** la detección de un rollback se hará por **ancla externa monótona**. Su forma concreta no está seleccionada (Reconciliación de rollback, §4.4).
- **Ratificar el requisito no crea el ancla.** Tampoco decide su forma ni si su adopción cambia R1 (Reconciliación §4.4; C-02, C-03). La condición de fin de la prohibición de D-RB-07 es la realización efectiva del ancla, no su decisión.
- Sin ancla realizada, RB-3 es indetectable desde dentro (rollback autoconsistente, rollback §3.4, falsación CE-5).

## 2. Fuentes (rutas relativas a `NEXO_NCS/`, SHA-256 verificado el 2026-11-11)

| Fuente | SHA-256 | Uso |
|---|---|---|
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_CLOSURE_CRITICAL_PATH_AND_EVIDENCE_CONTRACT_2026-11-10.md` | `40f50d1d56f38a087793d166a14e3a031c9342e72579289244b7908210a30526` | §2, ítem 2: opciones (a), (b), (c) por propiedad; ruta crítica |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md` (ACA-1) | `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` | Tabla A-07 y A-08; I-5; §1 (ancla fuera del ámbito restaurable, línea 461–465) |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_ROLLBACK_SEMANTICS_AND_OWNER_DECISIONS_SNOW_2026-11-10.md` | `f36008ec442736cfd822b5cd956c2ddfe4e8d6119a74816cf34c033630d343a4` | §3.4 (RB-3 indetectable), §7 (D-RB-04, formas: contador/log, hardware/TEE) |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/Reconciliación de decisiones de rollback.md` | `f1d5e4bd98ea14b6459525f5502a120496e0105fde8c219c7f63827d0d266057` | §0.3 (D-RB-04 A), §4.4, §4.9, C-02, C-03 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_MINIMUM_SAFE_CLOSURE_PLAN_2026-11-10.md` | `46db9f1c1ebbb1b38de75aebe610965db3dac2f2d3f2a8c35199fb01304c3588` | Fila T-02 (propuesta ancla + canal) y T-07 |

Ausentes del clon y no sustituidos: `OPERATIONS/NON_REPETITION_PROTOCOL.md`, `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md`.

## 3. Formas de ancla que las fuentes enumeran

Las fuentes enumeran las siguientes formas (D-RB-04 y Reconciliación §4.4). **No seleccionan ninguna.** Su viabilidad en Android/Termux está **UNKNOWN**: no hay evidencia (S-8).

| Forma | Fuente | Propiedad requerida | Viabilidad en Android/Termux |
|---|---|---|---|
| Contador monótono fuera del dominio | D-RB-04 (§7) | Monotonía verificable | UNKNOWN (S-8) |
| Log monótono fuera del dominio | D-RB-04 (§7) | Monotonía verificable y no reescribible desde el dominio | UNKNOWN (S-8) |
| Hardware / TEE | D-RB-04; A-08 opción B | Fuera del alcance del SO y del usuario | UNKNOWN; implica cambio de modelo (A-08 B) |
| Registro externo del propietario | D-RB-09 A; A-07 B | Custodia humana (CE-15); no es contador de máquina | Depende del canal (G-08), sin especificar |

## 4. Opciones por propiedad (critical path §2, ítem 2)

Las tres opciones son mutuamente complementarias. Ninguna cumple sola el requisito de D-RB-04.

| Opción | Garantiza | No garantiza | Condición para garantizar |
|---|---|---|---|
| **(a) Ancla externa monótona** (D-RB-04 A) | Detección de RB-3 y RB-4; no-replay | Nada más allá de la detección si su verificación no es previa a la admisión | Verificación previa a la admisión y canal fuera del dominio restaurable |
| **(b) Declaración del ejecutor por canal externo** (D-RB-02 A) | Conocimiento del rollback declarado | Prevención; detección de rollback no declarado | El ejecutor declara; el SO no está clasificado (acompañamiento C de D-RB-02 no ratificado) |
| **(c) Registro externo** (D-RB-09 A) | Auditabilidad a posteriori | Monotonía por sí solo; equivalencia con el ancla | Custodia y canal definidos (G-08) |

## 5. Diseño del testigo (A-07; ACA-1 tabla de decisiones)

| Opción | Contenido | Consecuencia documentada |
|---|---|---|
| A | WIT-local (segundo dominio) | Automático, pero con independencia no verificada (CE-14) |
| B | WIT-propietario (registro externo, D-RB-09) | Robusto frente a restore del dispositivo; depende del humano (CE-15); lento. Único testigo que sobrevive a RB-4 |
| C | Ambos | Lo mejor de ambos; mayor complejidad. ACA-1 lo recomienda con B como mínimo obligatorio |
| D | Ninguno | ACA-1 pierde C-5; solo detección local de RB-1/RB-2 |

Estado: **A-07 no decidido.** La recomendación de ACA-1 (C con B mínimo) es [PROPUESTA].

## 6. Encaje en R1 (A-08)

- **A-08 opción A** (aceptar contención por política): el ancla no se adopta y el claim se restringe. Esta opción no satisface D-RB-04 A, que permanece DECIDED pero no satisfecho mientras no exista un ancla externa monótona realizada y verificable. El claim restringido debe declarar expresamente esa carencia y excluir cualquier claim de detección de RB-3/RB-4; la detección de esa capacidad permanece UNKNOWN/STOP. A-08 sigue PENDIENTE para T-03; esta sección no selecciona la opción A ni revoca o modifica D-RB-04 A.
- **A-08 opción B** (cambiar el modelo): autorizar ancla externa y/o mediador a nivel de kernel, es decir, un **nuevo R1**. Es una decisión de modelo, no de arquitectura (ACA-1, A-08). Si la forma elegida vive fuera de R1, su adopción es cambio de modelo y exige decisión separada (Reconciliación C-02).
- Si la forma elegida es el registro del propietario (D-RB-09), su encaje en R1 queda **abierto** (Reconciliación C-02).

Ninguna de estas formas se elige aquí.

## 7. Dependencias, UNKNOWN y límites

**Dependencias:**
- T-03 (propietario): forma del ancla y encaje en R1; A-08; A-07.
- A-03 (backup/saved-state de Android): determina si la moratoria es enforzable frente al SO (critical path, ítem 4). Sin evidencia: UNKNOWN.
- S-8 y evidencia de viabilidad de cada forma.
- G-08: canal del registro externo.

**UNKNOWN (no completado por inferencia):**
- Forma del ancla seleccionable en Android/Termux (contador, log, hardware/TEE): viabilidad sin evidencia.
- Quién mantiene el ancla y cómo se verifica su monotonía.
- Coste y encaje en R1 de cada forma.
- Canal, formato y custodio del registro externo (G-08).
- Si el registro externo satisface D-RB-04 A (Reconciliación C-02, G-01).

**Límites documentales:**
- `OPERATIONS/NON_REPETITION_PROTOCOL.md` y `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` no están en el clon. Este documento no usa conclusiones que dependan de ellos.
- ACA-1 (línea 11) cita un HEAD `eee2ae77…`, distinto de los registrados en el corrigendum. **HEAD: UNKNOWN**; no se reconcilia aquí.
- Este documento no autoriza implementación (A-09 no solicitada) ni declara ningún gate cerrado. M0 sigue INCOMPLETO.
