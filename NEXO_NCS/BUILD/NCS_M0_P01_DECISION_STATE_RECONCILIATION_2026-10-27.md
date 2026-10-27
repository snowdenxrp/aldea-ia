# NCS M0 — reconciliación del estado de decisiones P-01 (2026-10-27)

## Propósito y límites

Resolver una ambigüedad documental sin reabrir auditorías ni ampliar decisiones del propietario. Este artefacto compara la matriz P01-A…P01-H con las decisiones previas aceptadas y la línea de meta. Es solo documentación: no ratifica contrato final, no autoriza implementación, pruebas, workflows, configuración ni CI.

## Decisiones del propietario que sí constan en las fuentes

1. **Alcance A:** estudiar/delimitar únicamente almacenamiento local M0 estrictamente no autoritativo y acotado. Esto limita el alcance de la investigación; no prueba que el almacenamiento actual cumpla esa propiedad.
2. **Separación de operaciones B:** la decisión de estado ausente indica expresamente que el commit condicional normal no inicializa silenciosamente un estado ausente; la inicialización debe ser una operación explícita y separada. La propuesta de contrato registra esta decisión como aceptada en cuanto a separación de operaciones.
3. **Raíz explícita y bootstrap separado:** el registro D0–D3 ya enumera como diseño base aceptado que la operación normal requiere una raíz existente/válida y que el bootstrap se separa de la operación normal.

Fuentes primarias:
- `NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md`, encabezado de estado y §§1–5.
- `NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`, §§83–111 (aceptación de separación; autoridad sigue UNKNOWN/PENDING).
- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, §2, O-02.
- `NCS_M0_P01_SCOPE_VS_INITIALIZATION_DECISION_RECONCILIATION_2026-10-27.md`.

## Qué está decidido y qué no

| Tema | Estado preciso | No debe inferirse |
|---|---|---|
| Alcance no autoritativo acotado | Aceptado como alcance de estudio | No demuestra la propiedad del objeto real ni el aislamiento de sus consumidores. |
| Commit normal no auto-inicializa | Aceptado como decisión de diseño | No prueba que el adaptador actual lo cumpla. |
| Inicialización explícita separada | Aceptada como principio/separación de operaciones | No selecciona por sí sola procedimiento operativo, API, esquema ni mecanismo de filesystem. |
| Autoridad legítima para la primera creación | PENDING/UNKNOWN | No se infiere de propietario del repositorio, caller, ausencia, lock, snapshot ni contexto constitucional por analogía. |
| Quiescencia de procesos/escritores previos | PENDING/UNKNOWN | La separación conceptual no prueba que ningún escritor pueda reanudar escrituras. |
| Exclusión frente a todos los escritores y creación exclusiva | PENDING/UNKNOWN | El lock cooperativo existente no demuestra cobertura de escritores no cooperativos. |
| Preservación de bytes inválidos y clasificación end-to-end | Requisito contractual; no verificado en ejecución | La existencia de un loader estricto no demuestra que la ruta real lo use. |
| Resultado UNKNOWN y reconciliación autorizada | PENDING/UNKNOWN | No retry automático; no declarar que no hubo mutación sin evidencia. |
| Pruebas/CI ligadas al SHA final | NOT RUN / NOT VERIFIED en este trabajo | YAML, tests fuente y commits documentales no demuestran ejecución CI. |

## Ajuste interpretativo de la matriz P01

La matriz P01-A…P01-H continúa siendo válida. Su eje P01-C debe leerse en dos niveles:
- **Principio de diseño ya aceptado:** bootstrap explícito, separado del commit condicional normal.
- **Protocolo operacional todavía abierto:** cómo se invoca, qué precondiciones comprueba, cómo se prueba quiescencia y exclusión, cómo se observa el resultado y quién puede reconciliar UNKNOWN.

Por tanto, P01-C no pasa globalmente por la aceptación del principio. Sigue pendiente hasta que el protocolo y la evidencia cubran sus brechas.

## Orden de trabajo recomendado

1. **P01-A/G:** identificar el objeto exacto y determinar si una base canónica existente cubre legítimamente la primera creación, sin ampliar el contrato constitucional por analogía.
2. **P01-B:** demostrar el límite de la invocación de bootstrap frente a admisión, PREPARED, dispatch, reconciliación y mutaciones de dominio.
3. **P01-C/D:** documentar condiciones operacionales de quiescencia y qué evidencia soportaría exclusión efectiva para todos los escritores relevantes; no seleccionar primitivas sin evidencia del entorno.
4. **P01-E/F:** cerrar semántica de estado ausente/válido/corrupto/error/conflicto/UNKNOWN y preservación de bytes.
5. **P01-H:** solo después de contrato congelado y autorización independiente, definir ejecución de pruebas y evidencia de CI sobre SHA exacto.

No proponer una implementación de filesystem hasta resolver autoridad, objeto, escritores y modelo operacional. Si alguno no puede demostrarse, mantener STOP/UNKNOWN y registrar el bloqueo, no sustituirlo con un mecanismo inventado.

## Estado canónico

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad raíz `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.

No se cambiaron runtime, tests, workflows ni configuración. No se ejecutaron tests, CI o Actions.
