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

- P07-A: `NCS_M0_T02_P07A_IDENTITY_AND_REIDENTIFICATION_SPEC_2026-11-12.md` (blob vigente `d66ef010ccbab2160ae75452f5f09bb7344284c0`; blob previo `56475bf3a175ac115d1c9b3e9f8404bf65431377` preservado en historia; solo se actualizaron referencias de fuentes, sin cambio sustantivo).
- REC/cuarentena: `NCS_M0_T02_REC_QUARANTINE_PREDICATES_SPEC_V4.md` (blob vigente `d7c96c5243e170f2b4c694ff9101dc9992b1e879`); blobs previos `4ca38e59bec4ed1c9b5513e088ee0e123788b697` y `ede8443140b2105b34699293d997b6239c6ea9f7` permanecen en la historia Git. Se actualizaron SHA de fuentes y referencias de línea; sin cambio de predicados. Conservar V1/V2/V3 y borradores anteriores como historia.
- Ancla: `NCS_M0_T02_EXTERNAL_MONOTONIC_ANCHOR_OPTIONS_2026-11-12.md` (blob vigente `bd8f0aee2406f7cfc7af731d6c9fb6a03aa6d16b`); blob previo `bf78f63bcfafbffa2da5e9105ae3b748356eb960` y original `7377e849ecc8293bc9a3401c1496dfe61a29b477` permanecen en la historia Git.

### Correcciones de consistencia aplicadas — revisión independiente y reconciliación incremental (2026-11-12)

1. **REC V4, encabezado — APLICADO.** La referencia de gate quedó corregida a **G-2/G-3**, sin cambio de predicados ni alcance. Blob vigente: `d7c96c5243e170f2b4c694ff9101dc9992b1e879`.
2. **Ancla §6 × D-RB-04 A — APLICADO COMO SNAPSHOT HISTÓRICO.** El texto declara D-RB-04 A **DECIDED pero no satisfecho** mientras no exista ancla externa monótona realizada y verificable; RB-3/RB-4 permanecen UNKNOWN/STOP sin esa evidencia. La situación anterior de A-08 quedó supersedida por la decisión del propietario del 2026-11-12: opción A ratificada; D-RB-04 A sigue requisito no satisfecho y fuera del claim restringido M0. No reescribir el entregable histórico. Blob vigente: `bd8f0aee2406f7cfc7af731d6c9fb6a03aa6d16b`.
3. **P07-A — SIN CAMBIO SUSTANTIVO EN EL ENTREGABLE.** El texto se elaboró antes de la ratificación A-06; su estado previo quedó supersedido por la decisión del propietario del 2026-11-12. Se mantienen: dev/ino/hash/nlink no prueban por sí solos identidad post-restore; R-OBJ/R-NAME separados. No reescribir el snapshot. Blob vigente `d66ef010ccbab2160ae75452f5f09bb7344284c0`.
4. **P08/P09 — REFERENCIA INTERRAMA.** Las ratificaciones del propietario están registradas en `NEXO_NCS/STATUS.md` de `ncs-continuity-handoff-correction-2026-11-07` (commit `53c1524b858e069c9af181d8e0b8715ddd94dd9b`, blob `5ec8f7a656978b034561a4fc8faa570441073fff`). No están presentes en el `STATUS.md` de `ncs-m0-architecture-research-2026-11-10` (blob `7b0eacd6395c34b9d16d316a5a9b704de211e5dc`). Esta referencia cruzada preserva la procedencia; no implica merge, cherry-pick ni copia del STATUS. P08: DECIDED / IMPLEMENTATION PENDING. P09: SCOPE DECIDED / COVERAGE OPEN-UNKNOWN. DISC-08A/B: NO LOCALIZADO. La separación interrama no es por sí sola requisito de merge ni causa del estado PARTIAL de T-01.

**Revisión independiente:** Snow revisó el expediente en el HEAD base `80b000bcd848f19ed52923e971de4107eb704778` y emitió `CONSISTENT WITH RESERVATIONS`; no encontró contradicciones sustantivas en los documentos T-02. Las reservas identificadas fueron (a) SHA/líneas de fuentes superados, (b) HEAD de revisión no fijado en los entregables, (c) autorización conversacional no verificable desde el repositorio aislado y (d) handoff desactualizado. La reconciliación actualiza las referencias de fuente, distingue el HEAD base histórico y etiqueta la procedencia conversacional. La verificación incremental cubrió la delta hasta `09915bb5…`; las modificaciones posteriores de T-03 se registran separadamente y no alteran los tres entregables T-02. El handoff se actualiza en esta revisión para eliminar instrucciones supersedidas.

**Fuentes vigentes para T-02:** plan de cierre, blob Git vigente `c10cde5a3cdee9a9fd91c6a2d193b4ea4cfdf04a`; contrato de cierre, blob Git `f9fa5d77b33eb4642e9e0a14de61bbda4be5974a` y SHA-256 `a5c4710a0b5ef0426d5980cbadf4790a420620bb75fd2ab3b94765724f4547ce`. No reutilizar el SHA-256 histórico del plan anterior a la reconciliación T-03.

**Estado T-02:** **ACEPTADO EXPRESAMENTE POR EL PROPIETARIO (2026-11-13), como paquete documental PROPUESTA.** Los tres entregables mantienen ese carácter y conservan las reservas de Snow (`CONSISTENT WITH RESERVATIONS`). T-02 queda cerrado solo como gate de aceptación documental; no se declaran mecanismos implementados, UNKNOWN no pasa a PASS y no se cierran G-2/G-3, REC, P05 ni P07-C. No se autoriza implementación, tests, CI, dispositivo ni efectos protegidos. T-01 sigue PARTIAL por DISC-08A/B NO LOCALIZADO.

**Estado posterior a T-02/T-03 (2026-11-13):** T-02 aceptado como paquete documental PROPUESTA. T-03 cerrado únicamente como gate documental de decisión y clasificación. A-04 quedó demostrada necesaria para REC/P-R1.6 y re-identificación P07-A; sigue PENDING OWNER DECISION. Se preparó `SNOW/NCS_M0_A04_OWNER_DECISION_BRIEF_2026-11-13.md`, que recomienda opción A sin ratificarla. A-07 no es necesaria para el claim restringido actual, porque D-RB-04 A sigue fuera del claim y no se adopta el ancla. D-RB-04 A continúa ratificado pero NO satisfecho; D-RB-09 A sigue obligatorio como registro externo, sin equivalencia con monotonía. G-08 permanece UNKNOWN. Ninguno de estos cambios autoriza REC operativo, implementación, pruebas, CI, dispositivo ni efectos protegidos.
