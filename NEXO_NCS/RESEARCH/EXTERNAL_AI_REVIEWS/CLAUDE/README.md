# CLAUDE — Entregas de investigación NCS M0

Esta carpeta conserva las entregas documentales de Claude para la investigación arquitectónica independiente de NCS M0.

- Rama: `ncs-m0-architecture-research-2026-11-10`
- Alcance: análisis, auditorías documentales, corrigenda y entregas de investigación.
- Conservación: mantener los archivos originales; las correcciones o reconciliaciones se guardan como documentos separados, sin sobrescribir las entregas originales.
- Restricción: esta carpeta no autoriza implementación, pruebas, CI, acciones en Termux/dispositivo, modificación de decisiones ratificadas ni cierre de M0.


## Índice y reconciliación de entregas (2026-11-12)

### Corrigenda de auditoría — conservar ambos

- `NCS_M0_ADVERSARIAL_AUDIT_CORRIGENDUM_2026-11-11.md` (blob `79a08c1cb7f4524852e2e04c078add56b6ce26ee`): primera corrección; precisa publicación, P08/P09, ADV-01, ADV-03, T-07 y E2/E3.
- `NCS_M0_ADVERSARIAL_AUDIT_CORRIGENDUM_2026-11-11 (1).md` (blob `92b4386a27865e0e0513ce0554da2ff81aa79a36`): segunda corrección; añade la clasificación DECIDED/documentary gap de D-RB-01…09 y el análisis de AUTH.
- **No son duplicados byte a byte ni deben borrarse/renombrarse por el sufijo `(1)`.** La segunda es una revisión material posterior y prevalece solo en los puntos que corrige. Los HEAD `16d38e89…` consignados en ambas son snapshots históricos, no el HEAD vivo de la rama.

### T-02 — tres entregables identificados

- P07-A: `NCS_M0_T02_P07A_IDENTITY_AND_REIDENTIFICATION_SPEC_2026-11-12.md` (blob `56475bf3a175ac115d1c9b3e9f8404bf65431377`).
- REC/cuarentena: `NCS_M0_T02_REC_QUARANTINE_PREDICATES_SPEC_V4.md` (blob `ede8443140b2105b34699293d997b6239c6ea9f7`), versión vigente para revisión; conservar V1/V2/V3 y borradores anteriores como historia.
- Ancla: `NCS_M0_T02_EXTERNAL_MONOTONIC_ANCHOR_OPTIONS_2026-11-12.md` (blob `7377e849ecc8293bc9a3401c1496dfe61a29b477`).

### Correcciones de consistencia pendientes antes de aceptar T-02

1. **REC V4, encabezado:** dice que no cierra G-2/G-5; la fila T-02 del plan de cierre asigna este entregable a G-2/G-3. Corregir la referencia de gate a **G-2/G-3**. Es una corrección de trazabilidad, no un cambio de alcance.
2. **Ancla §6 × D-RB-04 A:** §1 reconoce D-RB-04 A como requisito ratificado de detección por ancla externa monótona; §6 presenta A-08 opción A como «el ancla no se adopta» y lo llama consistente. No puede presentarse la opción A como cumplimiento ni como revocación del requisito. Si el claim restringido no adopta ancla, debe declarar D-RB-04 A **DECIDED pero no satisfecho**, excluir cualquier claim de detección de RB-3/RB-4 y conservar UNKNOWN/STOP para esa capacidad. Solo una decisión expresa posterior podría cambiar el requisito; no inferirla aquí.
3. **P07-A:** mantener A-06 como PENDIENTE. Los atributos dev/ino/hash/nlink son evidencia descriptiva/consistencia, no prueba autónoma de identidad post-restore; preservar R-OBJ/R-NAME separados y la atestación como procedimiento, no como demostración de identidad.
4. **P08/P09:** las afirmaciones de «contenido no referenciado» en documentos de 11-11 eran históricas. Desde 12-11 el contenido ratificado está registrado en `NEXO_NCS/STATUS.md`, blob `5ec8f7a656978b034561a4fc8faa570441073fff`. P08 queda DECIDED/IMPLEMENTATION PENDING; P09 SCOPE DECIDED/COVERAGE OPEN-UNKNOWN. DISC-08A/B sigue NO LOCALIZADO. No repetir la decisión ni la búsqueda ya documentada.

**Estado T-02:** los tres entregables existen, pero siguen siendo PROPUESTAS. No marcar T-02 completo hasta reconciliar estos puntos y verificar sus referencias cruzadas. No se autoriza implementación, tests, CI, dispositivo ni efectos protegidos.
