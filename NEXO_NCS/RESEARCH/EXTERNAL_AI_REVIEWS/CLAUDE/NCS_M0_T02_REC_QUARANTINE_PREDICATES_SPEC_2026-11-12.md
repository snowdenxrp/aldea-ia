# NCS M0 — T-02: Predicados de REC y de verificación de cuarentena

**Estado del documento:** PROPUESTA. No es decisión, no autoriza implementación y no cierra G-2/G-5.
**Tarea:** T-02, entregable 2 de 3.
**Dependencias de decisión:** A-04 (atestación como raíz de REC), A-01 (SUP/MED), A-06 (identidad, ver entregable 1), D-RB-08 A (cuarentena obligatoria, ratificada), P05-C (ratificada).
**Fecha de elaboración:** 2026-11-11 (nombre de entregable: 2026-11-12).
**HEAD de la rama: UNKNOWN** (ver §6).

## 1. Alcance

Especifica, como PROPUESTA, los predicados que deben cumplirse en cada paso de REC (BLOCKED/QRT → NORMAL) y los criterios de verificación de la cuarentena. Resuelve la brecha G-07 solo en la parte que las fuentes sustentan. El contenido de predicados sin fuente queda en UNKNOWN.

## 2. Fuentes (rutas relativas a `NEXO_NCS/`, SHA-256 verificado el 2026-11-11)

| Fuente | SHA-256 | Uso |
|---|---|---|
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md` (ACA-1) | `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` | §2.1 (máquina de estados, líneas 181–183, 248–253), §2.5 (revocación, pasos 2–5), §2.6 (REC, pasos 1–8), tabla A-04 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_CLOSURE_CRITICAL_PATH_AND_EVIDENCE_CONTRACT_2026-11-10.md` | `40f50d1d56f38a087793d166a14e3a031c9342e72579289244b7908210a30526` | G-5, G-07 (predicados sin especificar), etapa 1 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_ROLLBACK_SEMANTICS_AND_OWNER_DECISIONS_SNOW_2026-11-10.md` | `f36008ec442736cfd822b5cd956c2ddfe4e8d6119a74816cf34c033630d343a4` | Detectabilidad por alcance RB-1…RB-4 (líneas 218, 230, 242, 245, 257) |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/Reconciliación de decisiones de rollback.md` | `f1d5e4bd98ea14b6459525f5502a120496e0105fde8c219c7f63827d0d266057` | §0.3 (opciones D-RB-05 A, D-RB-08 A) y §4.5, §4.8 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_MINIMUM_SAFE_CLOSURE_PLAN_2026-11-10.md` | `46db9f1c1ebbb1b38de75aebe610965db3dac2f2d3f2a8c35199fb01304c3588` | Filas T-02 y T-07 |

Ausentes del clon y no sustituidos: `OPERATIONS/NON_REPETITION_PROTOCOL.md`, `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` (ver §6).

## 3. Hechos verificados

- **Máquina de estados** (ACA-1 §2.1): NORMAL, BLOCKED, QRT, REC. No hay transición automática BLOCKED → NORMAL ni QRT → NORMAL (líneas 248–250). Toda transición a NORMAL exige los predicados de REC. Un arranque de MED no reanuda NORMAL: arranca en BLOCKED y solo REC lo saca (líneas 252–253).
- **REC es el único camino BLOCKED/QRT → NORMAL**. El fracaso de cualquier paso deja el sistema en BLOCKED/QRT (ACA-1 §2.6).
- **Cuarentena (QRT)**: conserva el estado sospechoso con su diagnóstico, sin activarlo. Nada sale de QRT automáticamente (C09 [EVIDENCIA]; ACA-1 línea 181).
- **Detectabilidad por alcance** (rollback): RB-1 detectable por inconsistencia interna (RES↔COORD↔AUTH); RB-2 parcialmente detectable (COORD↔AUTH); RB-3 indetectable desde dentro (rollback autoconsistente). Por tanto, las comprobaciones de verificación de cuarentena tienen capacidad distinta según el alcance.
- **Ratificado**: P05-C (sin readmisión sin procedimiento aprobado; UNKNOWN/BLOCKED por defecto) y D-RB-08 A (cuarentena obligatoria + verificación antes de activar).

## 4. Predicados de REC (PROPUESTA, por paso de ACA-1 §2.6)

| Paso | Acción (ACA-1 §2.6) | Predicado propuesto | Estado de la regla |
|---|---|---|---|
| 1 | Congelar: sin admisión, mutaciones ni limpieza; MED detenido o solo diagnóstico | **P-R1.1:** admisión cerrada y MED en modo diagnóstico/detenido | Definido en ACA-1. Verificación técnica UNKNOWN |
| 2 | Diagnosticar: evidencia externa (GEN por copia, identidad, leases, procesos, registro del ejecutor) | **P-R1.2:** inventario completo de la evidencia enumerada, con fuente externa | Lista definida; **umbral de suficiencia UNKNOWN** |
| 3 | Poner en cuarentena: estado sospechoso a QRT con diagnóstico | **P-R1.3:** estado y diagnóstico registrados en QRT; ningún dato activado | Definido (C09). Sin verificación técnica en fuentes |
| 4 | Verificar poseedores (SUP, como revocación §2.5 pasos 2–5) | **P-R1.4:** ningún poseedor vivo de capacidad sobre RES. Sin esta verificación no hay recuperación | Depende de SUP (A-01) y de `/proc`: **disponibilidad en Termux SUPUESTO**, sin evidencia |
| 5 | Re-identificar (IDN): R-OBJ y R-NAME vigentes | **P-R1.5:** R-OBJ y R-NAME verificados; si no, objeto **no identificado** | Depende de A-06 (entregable 1). Sin criterio aprobado: UNKNOWN |
| 6 | Atestación del propietario fuera de banda, registrada externamente | **P-R1.6:** atestación con qué ocurrió (crash, rollback y alcance, intervención), y que QRT debe activarse o descartarse. Registrada en el registro externo | Depende de A-04 (opción A recomendada) y de G-08 (canal del registro): **canal UNKNOWN** |
| 7 | Emitir generación fresca, solo tras 4–6 | **P-R1.7:** GEN nueva que invalida todos los leases anteriores | Definido en ACA-1. Verificación técnica UNKNOWN |
| 8 | Re-admitir a NORMAL con GEN fresca; primera operación = verificación (identidad + GEN) | **P-R1.8:** transición a NORMAL solo si P-R1.1…P-R1.7 se cumplen; primera operación no es de negocio | Definido en ACA-1 |

Regla de fracaso: el fallo de cualquier predicado deja el sistema en BLOCKED/QRT (ACA-1 §2.6). Esta regla está en la fuente y no se modifica.

## 5. Verificación de cuarentena (D-RB-08 A; candidatos de G-07)

La fuente exige verificación antes de activar cualquier dato restaurado, pero **no define su contenido**. Los candidatos enumerados en G-07 son:

- **Q-1, integridad:** UNKNOWN (sin algoritmo ni alcance definidos).
- **Q-2, coherencia RES↔COORD↔AUTH:** capacidad por alcance según la detectabilidad de rollback (RB-1 sí; RB-2 solo COORD↔AUTH; RB-3 no detectable). Umbral UNKNOWN.
- **Q-3, vigencia:** UNKNOWN. Ninguna fuente define qué significa «vigente» para un dato restaurado.

Reglas firmes sin depender de Q-1…Q-3:
- Nada sale de QRT sin REC (C09; ACA-1 D-7).
- Un dato restaurado no se activa sin verificación previa (D-RB-08 A).

## 6. Dependencias, UNKNOWN y límites

**Dependencias:**
- A-04 (atestación) y A-06 (identidad), entregable 1.
- A-01 (SUP y MED): sin SUP no hay P-R1.4.
- G-08: canal del registro externo (requerido por P-R1.6).
- T-03: decisiones del propietario antes de cualquier predicado con efecto.

**UNKNOWN (no completado por inferencia):**
- Umbral de suficiencia de la evidencia de P-R1.2.
- Disponibilidad de `/proc` y verificación de poseedores en Termux (P-R1.4).
- Contenido de Q-1, Q-2 umbral y Q-3.
- Canal, formato y custodio del registro externo (P-R1.6).
- Procedimiento que detecta RB-3 (indetectable desde dentro) sin un ancla externa: ver entregable 3.

**Límites documentales:**
- `OPERATIONS/NON_REPETITION_PROTOCOL.md` y `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` no están en el clon. Este documento no usa ninguna conclusión que dependa de ellos.
- ACA-1 (línea 11) cita un HEAD `eee2ae77…`, distinto de los registrados en el corrigendum. **HEAD: UNKNOWN**; no se reconcilia aquí.
- Ningún predicado de este documento queda como decisión. Ninguna opción autoriza implementación (A-09 no solicitada).
