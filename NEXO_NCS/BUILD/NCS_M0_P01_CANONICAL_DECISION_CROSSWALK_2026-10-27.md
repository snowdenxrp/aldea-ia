# NCS M0 — cruce canónico de decisiones P-01 (2026-10-27)

## Propósito y límites

Cruzar la matriz P01-A…P01-H con el registro D0–D3, la decisión de inicialización de estado ausente y la línea de meta M0. Esta es una reconciliación documental estática. No ratifica decisiones nuevas, no declara criterios satisfechos y no autoriza runtime/tests/workflows/configuración ni ejecución de pruebas/CI/Actions.

## Fuentes consultadas en `ncs-clean-architecture`

- `NEXO_NCS/BUILD/NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md` (blob `dac612b4e1a2d12f9cac5a7b6531abf008ea289c`).
- `NEXO_NCS/BUILD/NCS_M0_P01_SCOPE_VS_INITIALIZATION_DECISION_RECONCILIATION_2026-10-27.md` (blob `a1d7d2df97034d6908be14fbfb684cdb27a22dad`).
- `NEXO_NCS/BUILD/NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md` (blob `3c48fadfaeaa7dfbbee01bd40d619bdbf9da2c83`).
- `NEXO_NCS/BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md` (blob `f6d953c448aa91eee4193317cd060320bcc83d40`).
- `NEXO_NCS/BUILD/NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md` (blob `e37a98ecfe1dcdccfef3cb0c5c98e0f2cb7d1287`).
- `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md` (blob `7dfd8058bad81c4cb70eb16c2c71e2d0f870d973`).

Los SHA identifican los blobs leídos en esta revisión; no son prueba de ejecución ni de estado de CI.

## Reconciliación de decisiones existentes

1. **Raíz/operación normal:** el registro ya acepta como base de diseño raíz explícita por operación, operación normal sobre raíz existente/válida y ausencia de bootstrap implícito (O-01, O-02, O-08). Esto no selecciona por sí solo el protocolo concreto ni demuestra enforcement en runtime.
2. **Inicialización explícita:** la decisión de diseño del 26 de octubre dice que el commit condicional normal no crea el primer estado; la inicialización, si alguna vez se autoriza, es operación separada. El propio documento la marca pendiente de incorporación/verificación en el estado canónico. Se puede registrar como decisión de diseño previa, pero no afirmar que el estado canónico ya está actualizado o que el protocolo está listo.
3. **Alcance no autoritativo:** la elección del propietario de estudiar almacenamiento local M0 estrictamente no autoritativo y acotado limita el objetivo. No demuestra que el objeto actual cumpla ese límite, ni legitima su primera creación.
4. **Línea de meta:** M0_BUILD_COMPLETE y PROTECTED_EFFECTS_AUTHORIZED son resultados distintos. Incluso un cierre futuro de M0 no autoriza efectos protegidos.
5. **Bootstrap histórico C2:** el registro histórico prefiere bootstrap offline/controlado por operador solo si se demuestra quiescencia; en caso contrario UNKNOWN/BLOCKED. No se interpreta como elección de un protocolo operativo actual ni como evidencia de que la quiescencia exista.
6. **Aislamiento en una invocación:** el registro conserva una pregunta de alcance no ratificada (aislamiento general frente a aislamiento por rutas que alcanzan efectos protegidos). La matriz P01-B no puede marcarse PASS mientras una ruta identificada puede continuar desde inicialización hacia admisión/ejecución/mutación y no hay contrato/evidencia que cierre esa brecha.

## Estado por dimensión

| Dimensión | Cruce con decisiones existentes | Conclusión documental |
|---|---|---|
| P01-A objeto/alcance | La elección de alcance limita el objetivo; no identifica ni prueba todas las propiedades negativas del objeto creado. | OPEN / UNKNOWN |
| P01-B aislamiento | La línea de meta exige no-bypass; inventario estático muestra caminos compuestos de inicialización y operación. La elección general vs. por efecto sigue sin ratificación. | NO PASS |
| P01-C procedimiento/quiescencia | Bootstrap offline/controlado es condicional a quiescencia verificable; entorno y actores relevantes no están acreditados aquí. | PENDING / UNKNOWN |
| P01-D exclusión/concurrencia | El procedimiento explícito no demuestra creación exclusiva frente a escritores no cooperativos. | PENDING / UNKNOWN |
| P01-E estado ausente vs inválido | La decisión prohíbe auto-inicialización y exige preservar estado corrupto/inválido; falta demostrar el comportamiento en el consumidor efectivo. | DECISIÓN DE DISEÑO; EVIDENCIA PENDIENTE |
| P01-F resultado ambiguo | UNKNOWN, sin retry automático; la decisión de diseño no acredita implementación/reconciliación operacional. | DECISIÓN DE DISEÑO; EVIDENCIA PENDIENTE |
| P01-G autoridad de primera creación | Ninguna decisión de raíz explícita, lock, ausencia o snapshot constituye por sí sola autoridad legítima para crear. | PENDING / UNKNOWN |
| P01-H pruebas/SHA | No se ejecutaron pruebas ni CI en esta revisión; los blobs consultados solo fijan fuentes estáticas. | PENDING |

## Orden de trabajo sin reabrir auditorías previas

1. Resolver documentalmente la decisión de alcance del aislamiento (pregunta ya presente en el registro; no crear un nuevo ID P-01).
2. Identificar el objeto exacto de bootstrap y su grafo de consumidores, reutilizando el inventario existente.
3. Separar la base de legitimidad de la creación de las garantías técnicas de exclusión, quiescencia, preservación de estado inválido y resultado UNKNOWN.
4. Actualizar el registro canónico únicamente con una decisión explícita ya aceptada o una nueva decisión autorizada; no convertir recomendaciones en aceptación.
5. Mantener P01-H pendiente hasta que exista autorización independiente para pruebas/CI y evidencia ligada al SHA evaluado.

## Estado canónico

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz legítima `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.

No se modificó runtime, tests, workflows ni configuración. No se ejecutaron pruebas, CI o Actions.
