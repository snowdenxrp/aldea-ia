# NCS M0 — T-02: Nota separada de corrección y reconciliación cruzada

**Fecha:** 2026-11-12  
**Estado:** PROPUESTA DOCUMENTAL — correcciones propuestas; no equivale a aceptación de T-02 ni a decisión del propietario sobre A-06/A-08/ancla.  
**Rama de destino:** `ncs-m0-architecture-research-2026-11-10`  
**Alcance autorizado:** crear esta nota separada. No sobrescribir ni modificar los tres entregables T-02, los corrigenda existentes, el README, el plan ni STATUS.  
**Restricciones:** sin código, pruebas, CI, runtime, dispositivo/Termux, PR, merge, selección de ancla, cambio de R1, modificación de decisiones ratificadas ni efectos protegidos.

---

## 1. Propósito y regla de conservación

Esta nota reúne las correcciones mínimas identificadas en la revisión independiente de T-02. Es una delta documental separada para que el propietario y los revisores puedan aplicarla o rechazarla explícitamente.

Se conservan íntegros los originales:
- P07-A — blob `56475bf3a175ac115d1c9b3e9f8404bf65431377`.
- REC/cuarentena V4 — blob `ede8443140b2105b34699293d997b6239c6ea9f7`.
- Opciones de ancla externa — blob `7377e849ecc8293bc9a3401c1496dfe61a29b477`.

No se crea V5 ni una versión sustitutiva. Esta nota no transforma ninguna PROPUESTA en DECIDED.

## 2. Corrección editorial: REC V4, encabezado

**Fuente:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/CLAUDE/NCS_M0_T02_REC_QUARANTINE_PREDICATES_SPEC_V4.md`, blob `ede8443140b2105b34699293d997b6239c6ea9f7`.

Texto actual:
> Estado del documento: PROPUESTA. No es decisión, no autoriza implementación, no cierra G-2/G-5 y no levanta la moratoria D-RB-01.

Texto propuesto:
> Estado del documento: PROPUESTA. No es decisión, no autoriza implementación, no cierra G-2/G-3 y no levanta la moratoria D-RB-01.

**Justificación:** la fila T-02 del plan de cierre asigna T-02 a G-2/G-3. La sustitución corrige la referencia de gate; no altera predicados, alcance ni normativa.

## 3. Corrección sustantiva: ancla §6 y D-RB-04 A

**Fuente:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/CLAUDE/NCS_M0_T02_EXTERNAL_MONOTONIC_ANCHOR_OPTIONS_2026-11-12.md`, blob `7377e849ecc8293bc9a3401c1496dfe61a29b477`.

Texto actual en §6:
> A-08 opción A (aceptar contención por política): el ancla no se adopta; el claim se restringe (veredicto PARCIAL de ACA-1). Consistente con el estado actual.

Texto propuesto para sustituirlo:
> A-08 opción A (aceptar contención por política): el ancla no se adopta y el claim se restringe. Esta opción no satisface D-RB-04 A, que permanece DECIDED pero no satisfecho mientras no exista un ancla externa monótona realizada y verificable. El claim restringido debe declarar expresamente esa carencia y excluir cualquier claim de detección de RB-3/RB-4; la detección de esa capacidad permanece UNKNOWN/STOP. A-08 sigue PENDIENTE para T-03; esta nota no selecciona la opción A ni revoca o modifica D-RB-04 A.

**Base normativa:** la reconciliación de rollback identifica D-RB-04 A como requisito ratificado de detección mediante ancla externa monótona; ratificar el requisito no crea ni selecciona el mecanismo. Sin ancla realizada, RB-3 es indetectable desde dentro. La opción de restringir el claim no puede presentarse como cumplimiento del requisito ni como su revocación.

**Límite:** no se selecciona una forma de ancla, no se declara viabilidad Android/Termux y no se cambia R1. La forma concreta y el encaje siguen sujetos a T-03 y a decisión expresa del propietario.

## 4. P07-A: sin corrección obligatoria

**Fuente:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/CLAUDE/NCS_M0_T02_P07A_IDENTITY_AND_REIDENTIFICATION_SPEC_2026-11-12.md`, blob `56475bf3a175ac115d1c9b3e9f8404bf65431377`.

La revisión no encontró contradicción que requiera modificar el entregable:
- A-06 permanece PENDIENTE.
- Los atributos dev/ino/hash/nlink/nombre no se elevan a prueba autónoma de identidad post-restore.
- R-OBJ y R-NAME permanecen separados.
- La atestación está descrita como procedimiento/decisión del propietario, no como demostración técnica de identidad.

Aclaración opcional, no necesaria para aceptar esta nota:
> La atestación es un procedimiento de decisión del propietario y no una demostración técnica de identidad del objeto (ACA-1 §3.3).

No insertar esta aclaración salvo que el propietario o el responsable documental la considere útil; no es una corrección bloqueante.

## 5. Reconciliación de precedencia P08/P09 entre ramas

### 5.1 Evidencia comprobada

En la rama de esta nota, `ncs-m0-architecture-research-2026-11-10`:
- `NEXO_NCS/STATUS.md` tiene blob `7b0eacd6395c34b9d16d316a5a9b704de211e5dc`.
- Ese contenido no contiene las entradas P08, P09 ni DISC-08.
- HEAD base observado por Claude antes de publicar esta nota: `6228d61fe8bc7d0db52d7be984d4ff67f6af0d4c` (padre del commit que publicó la nota); no es el HEAD actual de la rama.

En la rama `ncs-continuity-handoff-correction-2026-11-07`:
- `NEXO_NCS/STATUS.md` tiene blob `5ec8f7a656978b034561a4fc8faa570441073fff`.
- Ese contenido sí registra la delta P08/P09.
- El blob corresponde al commit `53c1524b858e069c9af181d8e0b8715ddd94dd9b`.

La revisión de Claude verificó que ese commit no es ancestro de la rama de investigación. Por tanto, el README CLAUDE y la fila T-01 del plan no deben afirmar que la delta está registrada en el `STATUS.md` de la rama de investigación.

### 5.2 Texto propuesto para sustituir el punto 4 del README CLAUDE

> **P08/P09 — referencia interrama, no incorporada en esta rama.** Las ratificaciones del propietario están registradas en `NEXO_NCS/STATUS.md` de la rama `ncs-continuity-handoff-correction-2026-11-07`, commit `53c1524b858e069c9af181d8e0b8715ddd94dd9b`, blob `5ec8f7a656978b034561a4fc8faa570441073fff`. No están presentes en el `STATUS.md` de `ncs-m0-architecture-research-2026-11-10` (blob `7b0eacd6395c34b9d16d316a5a9b704de211e5dc`). Esta referencia cruzada no incorpora el registro a esta rama ni implica merge, cherry-pick o copia del STATUS. P08: DECIDED / IMPLEMENTATION PENDING. P09: SCOPE DECIDED / COVERAGE OPEN-UNKNOWN. DISC-08A/B: NO LOCALIZADO; no se declara resuelto.

### 5.3 Texto propuesto para la fila T-01 del plan de cierre

Sustituir la afirmación de que P08/P09 están «registrados en STATUS» sin indicar rama por:

> **B-DOC-1 — PARTIAL:** P08/P09 son legibles mediante referencia explícita al STATUS de la rama `ncs-continuity-handoff-correction-2026-11-07` (commit `53c1524b858e069c9af181d8e0b8715ddd94dd9b`, blob `5ec8f7a656978b034561a4fc8faa570441073fff`); no están incorporados al STATUS de esta rama. Esta separación no exige merge ni copia para satisfacer la trazabilidad de procedencia. P01-B = C significa «no seleccionar todavía»: no ratifica A ni B; B2/P01-B sigue sin PASS, P-01 OPEN/UNKNOWN y primera creación STOP (decision register §10.6). DISC-08A/B sigue NO LOCALIZADO y es el residuo que mantiene T-01 PARTIAL. G-4/G-5 no quedan cerrados técnicamente.

En la columna de evidencia, conservar ambos registros con su rama explícita:
- STATUS de la rama `ncs-continuity-handoff-correction-2026-11-07`: blob `5ec8f7a656978b034561a4fc8faa570441073fff`.
- STATUS de la rama de investigación: blob `7b0eacd6395c34b9d16d316a5a9b704de211e5dc`, que no contiene esa delta.
- Decision register: blob `53691bce19edc20c6a3acb6dd99aca4d6d58e33a`, §10.6.

**No realizar** merge, cherry-pick, copia de archivo o actualización de la rama canónica como parte de esta corrección. La referencia interrama mantiene trazabilidad sin crear una segunda fuente de verdad.

## 6. Estado resultante y límites de aceptación

Tras aplicar y verificar estas propuestas en los documentos destinatarios:
- El error G-2/G-5 del encabezado REC quedaría corregido editorialmente.
- La incompatibilidad de presentación entre A-08 opción A y D-RB-04 A quedaría explicitada; D-RB-04 A seguiría DECIDED y no satisfecho mientras no exista ancla realizada.
- P07-A no necesitaría cambios obligatorios.
- P08/P09 quedarían citados con su rama y blob reales; no se afirmaría que están en el STATUS de investigación.
- DISC-08A/B seguiría NO LOCALIZADO.
- Los tres entregables seguirían siendo PROPUESTAS. T-02 no pasa automáticamente a COMPLETE: requiere verificación de que las correcciones fueron aplicadas a los documentos destinatarios y una revisión cruzada posterior.
- T-01 permanece PARTIAL por DISC-08A/B y por la separación interrama de su registro.
- M0 permanece INCOMPLETO. No se declara ningún gate PASS, TESTED, IMPLEMENTED ni CI-VERIFIED.

**Esta nota no aplica las correcciones a los originales.** Su única función es proporcionar el texto preciso y la trazabilidad para una aplicación documental posterior, preservando los entregables originales.


## 7. Enmienda de aplicación documental — 2026-11-12

La autorización posterior del propietario permite aplicar esta delta a los documentos destinatarios. Esta enmienda prevalece sobre las frases de §5/§6 que describían la aplicación como futura o prohibida en el alcance inicial de creación de la nota.

- El HEAD `6228d61fe8bc7d0db52d7be984d4ff67f6af0d4c` citado en §5.1 es el HEAD base observado por Claude antes de publicar la nota, no el HEAD actual.
- P01-B = C significa exclusivamente «no seleccionar todavía»; no ratifica A ni B, no produce PASS, P-01 sigue OPEN/UNKNOWN y la primera creación sigue STOP.
- P08/P09 conservan trazabilidad mediante referencia interrama explícita. No se exige merge, cherry-pick ni copia del STATUS para satisfacer la procedencia documental. T-01 permanece PARTIAL por DISC-08A/B NO LOCALIZADO, no por la mera separación entre ramas.
- La fila T-02 del plan también se corrige: T-01 sigue PARTIAL por DISC, P08/P09 se citan con su rama de origen y T-02 queda PARTIAL hasta revisión cruzada posterior.
- Las correcciones se aplicaron a REC V4, ancla §6, README CLAUDE y filas T-01/T-02 del plan. P07-A no se modificó porque no se identificó corrección obligatoria.

No se modificaron código, runtime, tests, workflows, CI, dispositivo/Termux, PR ni decisiones ratificadas. No se declara T-02 COMPLETE ni M0 completo.
