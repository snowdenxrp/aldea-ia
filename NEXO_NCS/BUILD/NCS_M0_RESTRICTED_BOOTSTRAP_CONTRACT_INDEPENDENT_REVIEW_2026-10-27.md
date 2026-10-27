# NCS M0 — revisión independiente focalizada del contrato de entorno restringido

**Fecha:** 2026-10-27  
**Rama objetivo:** `ncs-clean-architecture`  
**Estado:** ENCARGO PREPARADO — NO ENVIADO A MODELOS EXTERNOS  
**Tipo:** revisión documental; no autoriza implementación, ejecución ni CI.

## 1. Contexto canónico actual

El propietario ya tomó esta decisión: permitir un entorno operativo restringido para la primera publicación de Continuity, con precondiciones explícitas y verificables. La decisión está registrada en `NCS_M0_OWNER_DECISION_RESTRICTED_BOOTSTRAP_ENVIRONMENT_2026-10-27.md`.

El borrador que debe revisarse es `NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_DRAFT_2026-10-27.md`. Reutiliza la matriz P-01 y el perfil D3 existente. El perfil D3 ya identifica POCO X7 Pro/Android como primer entorno de prototipo, pero no demuestra que el bootstrap de esta operación vaya a ejecutarse allí ni cómo se controlan escritores/relanzadores.

La revisión debe partir del `STATUS.md` y del SHA actual de la rama. No tomar los SHAs históricos de esta solicitud como HEAD vigente.

## 2. Pregunta de revisión

¿El borrador define criterios de aceptación observables, completos y consistentes para un entorno restringido de primera publicación, sin elegir por inferencia un mecanismo ni elevar la evidencia documental a prueba operacional?

## 3. Alcance limitado

Leer solo lo necesario de:
1. `NEXO_NCS/STATUS.md`
2. `NEXO_NCS/AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md`
3. `NEXO_NCS/BUILD/NCS_M0_OWNER_DECISION_RESTRICTED_BOOTSTRAP_ENVIRONMENT_2026-10-27.md`
4. `NEXO_NCS/BUILD/NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_DRAFT_2026-10-27.md`
5. `NEXO_NCS/BUILD/NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md`
6. `NEXO_NCS/BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md`
7. `NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`
8. `NEXO_NCS/BUILD/NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`

No repetir el censo de callers/archivos, STEP 7, Chronicle/PB-08 ni auditorías históricas. No investigar runtime si el encargo puede resolverse por contrato documental.

## 4. Pruebas de calidad del contrato

Revisar específicamente:

- ¿Distingue claramente la decisión de alcance del propietario de la demostración operacional de precondiciones?
- ¿Cada precondición tiene un criterio observable y una regla de fallo/UNKNOWN?
- ¿El contrato cubre writers cooperativos y no cooperativos, procesos previos/legacy, supervisores, relanzadores y cambios durante la ventana, sin afirmar que todos fueron identificados?
- ¿Evita convertir una instantánea de procesos, un lock cooperativo o una comprobación previa de ausencia en prueba de quiescencia o de no sobrescritura?
- ¿La relación entre primera publicación, autoridad canónica, admisión, PREPARED, dispatch, reparación/reconciliación y mutaciones está descrita sin exceder el alcance M0?
- ¿Trata correctamente los estados previo existente, inválido/corrupto, inaccesible, error de inspección y resultado indeterminado?
- ¿Mantiene separadas persistencia, release y readmisión conforme a P-05?
- ¿La evidencia propuesta queda vinculada al entorno, objeto/path efectivo, intervalo pertinente y SHA exacto?
- ¿Hay redundancias, contradicciones o requisitos nuevos que no tengan soporte en decisiones aceptadas?
- ¿Qué mínimo cambio documental aumentaría materialmente la verificabilidad sin inventar IDs, colas, retries, tombstones, transacciones, mecanismos de coordinación ni nuevas autoridades?

## 5. Entregable requerido

Separar:
1. **Hechos textuales confirmados** con archivo/sección exactos.
2. **Defectos/contradicciones concretos** del borrador, si existen.
3. **Riesgos inferidos/no demostrados**, sin llamarlos vulnerabilidades observadas.
4. **UNKNOWN y evidencia que falta**.
5. **Correcciones mínimas propuestas**, con ubicación y texto o criterio preciso.
6. **Cosas que ya están cubiertas** y no deben volver a investigarse.
7. Rama y SHA exacto examinado; método; archivos realmente leídos; cambios; tests/CI ejecutados (esperado: ninguno); límites.

Si no hay discrepancia material, decirlo explícitamente y no inventar trabajo.

## 6. Restricciones obligatorias

- No modificar archivos, abrir PRs ni escribir en el repositorio.
- No ejecutar comandos, tests, CI, Actions ni pruebas dinámicas.
- No seleccionar opciones A/B/C/D ni proponer un mecanismo como si estuviera aprobado.
- No inferir que POCO/Android es el entorno operativo de esta publicación sin confirmación específica.
- No afirmar que existe una barrera real de quiescencia ni que se conocen todos los writers.
- No declarar P-01 cerrado, M0 completo, ROOT_READY, autoridad o efectos protegidos autorizados.
- No pedir al propietario que repita decisiones ya registradas.

## 7. Instrucción para Claude

Realiza una revisión de consistencia contractual, especialmente sobre la suficiencia de los predicados de exclusión, el estado previo y el resultado indeterminado. Prioriza contradicciones textuales demostrables y correcciones mínimas. No reaudites código ni repitas hallazgos ya registrados.

## 8. Instrucción para Gemini

Realiza un red-team documental: intenta encontrar contraejemplos que hagan que una precondición declarada PASS aunque todavía pueda existir un escritor, un relanzamiento, una sustitución de destino o un resultado incierto. Para cada contraejemplo, cita el predicado exacto del borrador y explica si ya está bloqueado por otra cláusula o si falta un criterio observable. No inventes componentes de Nexo ni mecanismos.

## 9. Estado canónico que no cambia por recibir opiniones

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-A/B/C/D/E/F/G/H no se cierran por este encargo; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`; primera creación de Continuity y efectos protegidos `STOP`.

Las respuestas externas serán entradas de revisión, no evidencia de ejecución ni autoridad. Si no se entregan en esta conversación, no fingir que se recibieron.
