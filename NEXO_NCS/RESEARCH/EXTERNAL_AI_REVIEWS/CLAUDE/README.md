# CLAUDE — Entregas de investigación NCS M0

Esta carpeta conserva las entregas documentales de Claude para la investigación arquitectónica independiente de NCS M0.

- Rama: `ncs-m0-architecture-research-2026-11-10`
- Alcance: análisis, auditorías documentales, corrigenda y entregas de investigación.
- Conservación: preservar la historia Git de las entregas. Las correcciones documentales autorizadas pueden actualizar el archivo destinatario; su blob anterior permanece recuperable en el historial. No crear versiones paralelas salvo que se solicite expresamente.
- Restricción: esta carpeta no autoriza implementación, pruebas, CI, acciones en Termux/dispositivo, modificación de decisiones ratificadas ni cierre de M0.


## Índice y reconciliación de entregas (2026-11-12)

### Corrigenda de auditoría — conservar ambos

- `NCS_M0_ADVERSARIAL_AUDIT_CORRIGENDUM_2026-11-11.md` (blob `79a08c1cb7f4524852e2e04c078add56b6ce26ee`): primera corrección; precisa publicación, P08/P09, ADV-01, ADV-03, T-07 y E2/E3.
- `NCS_M0_ADVERSARIAL_AUDIT_CORRIGENDUM_2026-11-11 (1).md` (blob `92b4386a27865e0e0513ce0554da2ff81aa79a36`): segunda corrección; añade la clasificación DECIDED/documentary gap de D-RB-01…09 y el análisis de AUTH.
- **No son duplicados byte a byte ni deben borrarse/renombrarse por el sufijo `(1)`.** La segunda es una revisión material posterior y prevalece solo en los puntos que corrige. Los HEAD `16d38e89…` consignados en ambas son snapshots históricos, no el HEAD vivo de la rama.

### T-02 — tres entregables identificados

- P07-A: `NCS_M0_T02_P07A_IDENTITY_AND_REIDENTIFICATION_SPEC_2026-11-12.md` (blob `56475bf3a175ac115d1c9b3e9f8404bf65431377`).
- REC/cuarentena: `NCS_M0_T02_REC_QUARANTINE_PREDICATES_SPEC_V4.md` (blob vigente `4ca38e59bec4ed1c9b5513e088ee0e123788b697`), versión corregida; el blob anterior `ede8443140b2105b34699293d997b6239c6ea9f7` permanece en la historia Git. Conservar V1/V2/V3 y borradores anteriores como historia.
- Ancla: `NCS_M0_T02_EXTERNAL_MONOTONIC_ANCHOR_OPTIONS_2026-11-12.md` (blob vigente `bf78f63bcfafbffa2da5e9105ae3b748356eb960`); el blob anterior `7377e849ecc8293bc9a3401c1496dfe61a29b477` permanece en la historia Git.

### Correcciones de consistencia aplicadas — revisión cruzada pendiente (2026-11-12)

1. **REC V4, encabezado — APLICADO.** La referencia de gate quedó corregida a **G-2/G-3**, sin cambio de predicados ni alcance. Blob vigente: `4ca38e59bec4ed1c9b5513e088ee0e123788b697`.
2. **Ancla §6 × D-RB-04 A — APLICADO.** El texto declara D-RB-04 A **DECIDED pero no satisfecho** mientras no exista ancla externa monótona realizada y verificable; RB-3/RB-4 permanecen UNKNOWN/STOP sin esa evidencia. A-08 sigue PENDIENTE para T-03 y no fue seleccionada. Blob vigente: `bf78f63bcfafbffa2da5e9105ae3b748356eb960`.
3. **P07-A — SIN CAMBIO OBLIGATORIO.** A-06 permanece PENDIENTE; dev/ino/hash/nlink no se elevan a prueba autónoma de identidad post-restore; R-OBJ/R-NAME permanecen separados. Blob `56475bf3a175ac115d1c9b3e9f8404bf65431377`.
4. **P08/P09 — REFERENCIA INTERRAMA.** Las ratificaciones del propietario están registradas en `NEXO_NCS/STATUS.md` de `ncs-continuity-handoff-correction-2026-11-07` (commit `53c1524b858e069c9af181d8e0b8715ddd94dd9b`, blob `5ec8f7a656978b034561a4fc8faa570441073fff`). No están presentes en el `STATUS.md` de `ncs-m0-architecture-research-2026-11-10` (blob `7b0eacd6395c34b9d16d316a5a9b704de211e5dc`). Esta referencia cruzada preserva la procedencia; no implica merge, cherry-pick ni copia del STATUS. P08: DECIDED / IMPLEMENTATION PENDING. P09: SCOPE DECIDED / COVERAGE OPEN-UNKNOWN. DISC-08A/B: NO LOCALIZADO. La separación interrama no es por sí sola requisito de merge ni causa del estado PARTIAL de T-01.

**Estado T-02:** las correcciones documentales están aplicadas, pero T-02 sigue **PARTIAL** hasta completar la revisión cruzada independiente y la aceptación expresa del propietario. T-01 sigue PARTIAL por DISC-08A/B NO LOCALIZADO. No se autoriza implementación, tests, CI, dispositivo ni efectos protegidos.
