# NCS M0 — Decisión del propietario A-04

**Fecha:** 2026-11-13  
**Estado:** RATIFICADA — OPCIÓN A (2026-11-13)  
**Alcance:** decisión de confianza para REC; no autoriza operación ni implementación.

## 1. Por qué A-04 vuelve a ser necesaria

La reconciliación documental posterior a la aceptación T-02 distingue:

- **P07-A / A-06:** ya ratificada opción A. La re-identificación post-restore exige atestación externa/off-band del propietario, registrada fuera del objeto restaurado. Sin ella, no hay recuperación/readmisión.
- **REC V4, P-R1.6:** exige una atestación específica sobre qué ocurrió (crash, rollback declarado y alcance, intervención) y qué debe activarse o descartarse en QRT. El predicado es necesario, pero no suficiente; depende de A-04 y de G-08.
- **A-04:** determina si esa atestación del propietario es la raíz de confianza declarada del procedimiento REC. Por tanto, es necesaria para definir la ruta de REC que los entregables T-02 describen. No queda aprobada por la ratificación previa de A-06 ni por la aceptación documental de T-02.

Fuentes directas: ACA-1, tabla de decisiones A-04; P07-A, predicado P7A-4; REC V4, P-R1.6 y §8.

## 2. Alternativas de ACA-1

| Opción | Decisión | Evaluación documentada |
|---|---|---|
| **A** | REC exige atestación del propietario fuera de banda | Hace explícita la confianza humana (CE-15); es lenta y auditable. La atestación debe ser específica y quedar registrada externamente. No elimina la posibilidad de error o falsedad del propietario. |
| **B** | REC solo usa predicados técnicos, sin atestación | No viable según ACA-1: un estado revertido y autoconsistente no puede distinguirse técnicamente bajo I-5. |
| **C** | Atestación solo para RB-3/RB-4 | Incoherente con la secuencia REC: también en RB-1/RB-2 debe decidirse qué estado de QRT activar o descartar. |

**Recomendación técnica:** opción A, porque es la única compatible con los límites y la lógica de REC documentados. Esta recomendación no constituye decisión del propietario.

## 3. Consecuencias y límites si se ratifica A

1. La atestación debe ser concreta, contextual y vinculada al incidente y al contenido de QRT; una confirmación genérica como «todo bien» no satisface P-R1.6.
2. Debe registrarse fuera del dominio restaurable. El registro D-RB-09 A conserva ámbito, snapshot, ejecutor, instante y resultado.
3. **G-08 sigue UNKNOWN:** canal, formato y custodio del registro externo todavía deben definirse. La opción A no los selecciona automáticamente.
4. La atestación es necesaria, no suficiente. P-R1.1…P-R1.5 y P-R1.7 también deben cumplirse; no permite por sí sola volver a NORMAL.
5. La confianza humana sigue siendo un supuesto residual CE-15, no una garantía técnica.
6. A-04 no satisface D-RB-04 A, no crea un ancla monotónica, no demuestra detección de rollback no declarado y no levanta D-RB-01. RB-1…RB-4 siguen sujetos a la moratoria y STOP/UNKNOWN.
7. No autoriza REC operativo, implementación, pruebas, CI, inspección del dispositivo, commissioning ni efectos protegidos.

## 4. Clasificación de A-07 para el claim actual

**A-07 no es una dependencia necesaria del REC en el claim restringido M0 actual.** A-07 diseña el testigo WIT para una arquitectura de ancla externa/monotónica. La decisión vigente mantiene D-RB-04 A como requisito ratificado pero NO satisfecho y fuera del claim restringido; no se selecciona ni realiza un ancla. D-RB-09 A sigue siendo un registro externo obligatorio para auditoría, pero no se equipara a un testigo monotónico.

Por tanto:
- No solicitar ni inferir ratificación de A-07 en esta fase.
- Reabrir A-07 solo si una decisión posterior incorpora el ancla D-RB-04 A o amplía el claim de forma que requiera diseñar ese testigo.
- No confundir esta clasificación con la selección del canal G-08 para D-RB-09.

## 5. Disposición del propietario — 2026-11-13

**RATIFICADA: opción A, con los límites de §3.** El propietario confirmó expresamente la ratificación el 2026-11-13. Esta disposición cierra únicamente la decisión A-04. G-08 permanece UNKNOWN y REC/readmisión operativa continúa bloqueado hasta resolver G-08 y todos los demás predicados aplicables. No hay autorización de operación, implementación, pruebas, CI, dispositivo, commissioning, rollback ni efectos protegidos.

Hasta que el propietario decida:
- A-04 opción A está **RATIFICADA por el propietario (2026-11-13)**; G-08 y los demás predicados REC permanecen pendientes.
- P-R1.6 y la ruta de REC que depende de él no pueden declararse satisfechos.
- P07-A permanece ratificada como criterio, pero no se interpreta como autorización para readmisión ni operación.
- G-08 permanece UNKNOWN.

## 6. Trazabilidad y estado

Este documento es una propuesta de decisión preparada tras la aceptación expresa de T-02 (2026-11-13). No modifica los tres entregables históricos de Claude ni los convierte en implementación. La clasificación de A-07 aplica únicamente al claim restringido M0 vigente.

**Fuentes del repositorio (rama de investigación):**
- `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_P05_P07_CANDIDATE_ARCHITECTURE_CLAUDE_2026-11-10.md`, tabla A-04/A-07.
- `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/CLAUDE/NCS_M0_T02_P07A_IDENTITY_AND_REIDENTIFICATION_SPEC_2026-11-12.md`, P7A-4.
- `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/CLAUDE/NCS_M0_T02_REC_QUARANTINE_PREDICATES_SPEC_V4.md`, P-R1.6 y §8.
- `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/CLAUDE/NCS_M0_T02_EXTERNAL_MONOTONIC_ANCHOR_OPTIONS_2026-11-12.md`, §5–6.
- Registro del propietario y plan mínimo de cierre SNOW, actualizados en la misma rama.

**Clasificación:** PROPUESTA. Sin ratificación, implementación, prueba, CI ni efecto protegido.
