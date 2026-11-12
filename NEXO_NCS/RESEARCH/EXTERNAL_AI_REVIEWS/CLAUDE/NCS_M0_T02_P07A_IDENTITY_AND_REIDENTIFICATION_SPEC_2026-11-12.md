# NCS M0 — T-02: Especificación P07-A (criterio de identidad y re-identificación)

**Estado del documento:** PROPUESTA. No es decisión, no autoriza implementación y no cierra G-3.
**Tarea:** T-02 (especificación P07-A + predicados REC/cuarentena + propuesta de ancla), entregable 1 de 3.
**Dependencia de decisión:** A-06 (propietario). Esta especificación no la toma.
**Fecha de elaboración:** 2026-11-11 (nombre de entregable: 2026-11-12).
**Rama de referencia:** `ncs-m0-architecture-research-2026-11-10`. **HEAD: UNKNOWN** (ver §6).

## 1. Alcance

Define las opciones y el procedimiento candidato para P07-A: qué cuenta como «el mismo objeto» tras crash o restore, y cómo se re-identifica. Alimenta G-3 (P07-C), O3/O5 y la readmisión (E8). No define el harness, no fija el criterio aprobado y no sustituye la decisión A-06.

## 2. Fuentes (rutas relativas a `NEXO_NCS/`, con SHA-256 verificado el 2026-11-11)

| Fuente | SHA-256 | Uso |
|---|---|---|
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md` (ACA-1) | `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` | §2.6 (REC), §3.3 (CE-7), tabla de decisiones A-06 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_CLOSURE_CRITICAL_PATH_AND_EVIDENCE_CONTRACT_2026-11-10.md` | `a5c4710a0b5ef0426d5980cbadf4790a420620bb75fd2ab3b94765724f4547ce` | R-D (P07-A), G-3, tabla de decisiones |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_MINIMUM_SAFE_CLOSURE_PLAN_2026-11-10.md` | `6db9b6daac569e1bfa4c35ffcb6d9b422983328eb273803a78862fd34578e49f` | Fila T-02 y T-03 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_ACA1_RATIFIED_DECISIONS_COMPATIBILITY_DELTA_2026-11-10.md` | `c970b18668c2ee1af4bf740f1beb617c1ca0cab76e2acdac878e35919d9d9e03` | I-3, P07-06/P07-21, condiciones de A-06 |
| `RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_CE1_CE5_CE7_INDEPENDENT_FALSIFICATION_2026-11-10.md` (copia de rama) | `534c728c293c4dbbf7e0437165af1c8ac69b75877d758ccf5c817a34a7002dba` | §4.3 (refutación de identidad descriptiva). Copia local con hash `8f1bb646…`, mismo contenido según la reconciliación de rollback, Anexo B |

Estado de las fuentes del mandato: `OPERATIONS/NON_REPETITION_PROTOCOL.md` y `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` **no existen en el clon**. No se han sustituido por ningún resumen. Ver §7.

## 3. Hechos verificados en fuentes

- **P07-A está PENDIENTE** y sin decidir en los canónicos (critical path, tabla de decisiones). Bloquea O3/O5, P07-16/P07-21 y la readmisión (R-D; E8).
- **Identidad en vida del proceso**: verificada con `fstat`/`stat`/`nlink`, con R-OBJ y R-NAME por separado (ACA-1 §3.3).
- **Identidad tras crash o restore**: UNKNOWN por defecto; se resuelve por procedimiento (REC pasos 5–6), no por inferencia descriptiva (ACA-1 §3.3).
- **Atributos descriptivos** (dev, ino, hash, nlink, nombre): reutilizables o copiables. El criterio descriptivo está refutado por la falsación §4.3 (ACA-1 §3.3; delta I-3).
- **Detección**: rename por R-NAME y hardlink por `nlink` (P07-21).
- **Atestación**: la re-identificación en REC no es una demostración técnica; es decisión del propietario sobre un objeto verificado como coherente pero no como idéntico (ACA-1 §3.3).

## 4. Opciones de A-06 (decisión del propietario; ACA-1, tabla de decisiones)

| Opción | Contenido | Consecuencia documentada en la fuente |
|---|---|---|
| **A** | Aprobar un criterio (qué cuenta como mismo objeto) y el procedimiento REC pasos 5–6 | Habilita G-3 en su forma procedimental. No hace demostrable I-3. Es la recomendación de ACA-1 |
| **B** | Dejarlo pendiente; identidad UNKNOWN post-crash; sin recuperación de objetos no identificados | Seguro, pero cada crash es un bloqueo permanente de facto |
| **C** | Criterio puramente descriptivo | Refutado por la falsación §4.3 (falsos positivos y negativos). No debe proponerse |

Estado: **A-06 no decidido.** Ninguna opción queda seleccionada por esta especificación.

## 5. Procedimiento candidato (PROPUESTA, derivado de REC pasos 5–6)

Fuente del procedimiento: ACA-1 §2.6, pasos 5 y 6 [PROPUESTA].

1. **Predicado P7A-1 (R-OBJ):** el objeto vigente se verifica por identidad de objeto (dev, ino, GEN, hash, nlink) con verificación en vida del proceso. Estado de la regla: definida en ACA-1 §1.3 (IDN); la validez post-restore es UNKNOWN.
2. **Predicado P7A-2 (R-NAME):** el nombre se verifica por separado. Detección de rename (P07-21). Estado: definido como concepto; umbral no especificado (UNKNOWN).
3. **Predicado P7A-3 (no identificado):** si P7A-1 o P7A-2 no pueden verificarse con medios descriptivos, el objeto se trata como **no identificado** y no se opera sobre él hasta atestación del propietario (ACA-1 §2.6 paso 5, CE-7).
4. **Predicado P7A-4 (atestación):** la identificación post-restore se acepta solo por atestación fuera de banda registrada en el registro externo (ACA-1 §2.6 paso 6; A-04 opción A). Sin atestación no hay recuperación.

Lo que la especificación **no** establece: un criterio de identidad descriptivo, ni que la atestación demuestre identidad.

## 6. Dependencias, UNKNOWN y límites

**Dependencias:**
- A-06 (propietario): criterio y procedimiento. Sin ella, G-3 sigue BLOCKING.
- A-04 (atestación como raíz de REC) y canal del registro externo (G-08).
- T-01 (referencia de P08/P09 y P07 V2.3): la especificación de P07 V2.3 **no se localizó en el clon** con ese nombre; su contenido se toma solo de las menciones en ACA-1 y en el critical path.
- Predicados de REC/cuarentena: ver entregable 2.

**UNKNOWN (no completado por inferencia):**
- Política de aliases (P07-A): no definida en ninguna fuente.
- Umbral de R-NAME y de verificación de `nlink` en Termux (ACA-1 supone POCO/Termux sin evidencia específica, S-1–S-4).
- Contenido exacto de P07 V2.3 sobre identidad.
- Criterio de identidad tras crash cuando el objeto sobrevive con atributos idénticos: no hay procedimiento en las fuentes más allá de la atestación.

**Límites documentales:**
- `OPERATIONS/NON_REPETITION_PROTOCOL.md` y `MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md` no están en el clon. Las conclusiones sobre protocolo de no repetición y sobre dirección estratégica quedan **sin verificar**; este documento no las usa.
- ACA-1 (línea 11) cita un HEAD `eee2ae77…` distinto de los tres ya registrados en el corrigendum. **HEAD: UNKNOWN**; no se reconcilia aquí.
- Ninguna opción de este documento autoriza implementación (A-09 no solicitada).
