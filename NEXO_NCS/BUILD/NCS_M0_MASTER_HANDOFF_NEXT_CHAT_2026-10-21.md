# NCS — handoff maestro para siguiente chat: continuidad M0 tras decisiones constitucionales
Fecha: 2026-10-21
Repositorio: `snowdenxrp/aldea-ia`
Rama de trabajo: `ncs-clean-architecture`
Misión única: **cerrar M0 con criterios finitos y evidencia trazable**.

## Instrucción de arranque para el siguiente chat

1. No empezar otra auditoría general ni pedir al propietario que repita decisiones ya registradas.
2. Leer, en este orden:
   - `NEXO_NCS/STATUS.md`
   - este handoff
   - `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md`
   - `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md`
   - `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_UNKNOWN_EFFECT_RECONSTRUCTION.md`
   - `NEXO_NCS/BUILD/NCS_M0_ROOT_BOOTSTRAP_TEST_SCOPE_AND_RUNTIME_GAP_2026-10-20.md`
   - `NEXO_NCS/DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md`
3. Confirmar el HEAD real mediante `GET /repos/snowdenxrp/aldea-ia/git/ref/heads/ncs-clean-architecture` (o evidencia equivalente de la referencia). En el checkpoint verificado el HEAD fue `4e841d3115a43eefe60266346140d948dcae2052`; workflow determinista [39683852574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39683852574), job `tests`, `completed/success` para ese SHA exacto. Este run valida ese checkpoint, no commits posteriores. Repetir consulta de HEAD y CI al iniciar cada nueva unidad de trabajo.
4. Continuar desde la matriz finita A–E; no volver a investigar B/C/D sin contraejemplo o evidencia nueva. M0-E sigue siendo el bloqueo sustantivo.
5. Antes de cambiar runtime, inspeccionar los archivos actuales de la rama y describir el contrato mínimo de integración requerido. No inventar un root verifier, pin, firma, digest, Genesis ceremony o commissioning para simular que existe legitimidad.
6. Hacer trabajo concreto y acotado. Cualquier defecto runtime nuevo exige: contraejemplo reproducible → prueba adversarial mínima → corrección raíz mínima si procede → ejecutar workflow(s) → comprobar job/run/SHA → actualizar matriz, STATUS e handoff. No declarar PASS sin evidencia.
7. Al terminar una unidad de trabajo, guardar otro handoff completo para el siguiente chat y actualizar STATUS con referencias directas.

## Decisiones del propietario ya registradas — no volver a preguntarlas

El propietario aceptó explícitamente los puntos constitucionales 1–7 **como base del borrador**, sin observaciones adicionales especificadas para cada decisión. Esto no significa aprobación constitucional completa, firma, congelación, commissioning ni autorización de efectos protegidos. El borrador fuente no se modificó.

1. Principios fundamentales: inteligencia ≠ autoridad; autoridad ≠ ejecución; evidencia técnica por sí sola ≠ legitimidad; incertidumbre crítica ⇒ `UNKNOWN/STOP`.
2. Alcance inicial: reconoce la necesidad de autoridad legítima, Policy/contexto, claims, transiciones protegidas y fail-closed, manteniendo exclusiones explícitas.
3. Enmiendas: proponer no equivale a aprobar/activar; aprobación vinculada al contenido exacto; doble control es principio, mecanismo concreto pendiente.
4. Estado canónico/vigencia/revocación: aprobación y vigencia deben distinguirse; rollback/recencia no prueban legitimidad; conflicto/desconocido ⇒ `UNKNOWN/STOP`. Dónde reside el estado canónico y cómo se verifica independientemente sigue pendiente.
5. Raíz/propietario: dispositivo ≠ autoridad; credencial raíz no concede permisos ilimitados. Provisión, procedencia, verificación criptográfica, ancla independiente y recuperación siguen pendientes.
6. Delegación: límites explícitos, no ampliables por el delegado, verificable y revocable. Mecanismos y sucesión formal pendientes; la hija no obtiene autoridad actual por esta aceptación.
7. Policy/contexto/evaluación: cada operación debe evaluarse frente a Constitución vigente, Policy aplicable, contexto y evidencia. Información crítica insuficiente, contradictoria, obsoleta o no verificable ⇒ `UNKNOWN/STOP`, no autorización por defecto. La aceptación no demuestra que exista un evaluador runtime conectado al sink real.

Registro de decisiones:
`NEXO_NCS/DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md`
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md

Guía de revisión:
`NEXO_NCS/BUILD/NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md`
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md

No editar automáticamente el borrador constitucional fuente para convertir las aceptaciones de base en una Constitución final. No generar digest/firma, provisionar raíz ni iniciar commissioning antes de la aprobación explícita del objeto exacto.

## Plan adversarial M0-E agregado (2026-10-21)

Plan: [NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md](NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md)
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md

- Se especificaron diez escenarios adversariales; los negativos deben demostrar tanto `UNKNOWN/STOP` como cero invocaciones del sink real.
- No asumir que `conditionalCommit.commit` es el sink externo hasta inspeccionar implementación y callers.
- No hay cambio runtime ni CI atribuible al nuevo documento por el mero hecho de crearlo.
- Próximo paso: identificar sink y rutas, mapear suites existentes a los casos y evitar duplicar M0-B/C/D. No implementar raíz/verificador ficticio; no firmar, congelar ni commissionar Constitución. Los puntos 1–7 siguen aceptados solo como base del borrador.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Hallazgo nuevo: distinguir rutas de ejecución/sinks M0-E

Plan actualizado: [NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md](NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md)

- Core `protected-transition → conditionalCommit.commit`: no asumir que es el sink externo real.
- Ruta Lúmina `executeLuminaNexoStep → executeNexoStep → effect-adapter → registered handler`: los handlers de simulación pueden mutar `simulation` antes de la comprobación postcondition; el código inspeccionado no demuestra que la autoridad constitucional de NCS gobierne ese punto.
- Ruta owner-backed canónica `src/nexo/core/owner-backed-runtime.mjs`: bloquea acciones distintas de `chronicle_append` en la ruta inspeccionada; eso no demuestra que todas las rutas alternativas sean inalcanzables.
- No se declara exploit activo ni alcance de todos los efectos Lúmina. Siguiente tarea: derivar del alcance inicial del borrador qué efectos están en scope, enumerar callers/entry points y localizar el último punto de mutación para cada efecto protegido.
- La matriz E-01…E-10 es diseño; no se han implementado tests nuevos ni existe CI PASS por estos documentos.

## M0 — estado técnico y criterios finitos

Estados conservadores que deben permanecer:
- M0: `INCOMPLETO`
- `authorization: NOT_EVALUATED`
- raíz legítima: `PENDING/UNKNOWN`
- efectos protegidos: `STOP`

La matriz de aceptación es:
`NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md`
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md

Criterios:
- **M0-A**: una puerta reproducible y finita. Workflow candidato: `.github/workflows/nexo-deterministic-tests.yml`, job `tests`, script `npm test`. PASS solo si el run es `completed/success` en el SHA exacto evaluado.
- **M0-B**: continuidad, admisión y persistencia. Reutilizar `tests/nexo/continuity-contract.test.mjs`, `tests/nexo/conditional-commit-persist-state.test.mjs`, `tests/nexo/restart-reconstruction.test.mjs`.
- **M0-C**: reconstrucción terminal: conflicto de evidencia, identidad/contexto discordantes, outcome ausente u obsoleto no deben completar ni redispatch por inferencia. Reutilizar suites existentes y enlazar CI focal ya registrado.
- **M0-D**: journal desconocido, persistencia de intent antes del handler, recuperación/reconciliación. Reutilizar `tests/nexo/effect-intent-persistence.test.mjs`, `tests/nexo/continuity-contract.test.mjs`, `tests/nexo/repair-settlement-crash-cuts.test.mjs`.
- **M0-E — BLOQUEANTE**: procedencia legítima de raíz conectada hasta la frontera real de efecto protegido. Los fixtures `AUTHORIZED` no demuestran legitimidad.

Evidencia histórica que no debe extrapolarse:
- SHA `2690d89e197ccadd3e280ff7542f790955d6ce42`, run determinista [39490757350](https://github.com/snowdenxrp/aldea-ia/actions/runs/39490757350) SUCCESS.
- SHA `1a309a19dd1e3d2c300776c2e3dd240203eac78f`, run determinista [39491101839](https://github.com/snowdenxrp/aldea-ia/actions/runs/39491101839) SUCCESS.
- SHA `bb57725f8cd1f0faa9528df82ed76a0fa0b5eba6`, run [39491191357](https://github.com/snowdenxrp/aldea-ia/actions/runs/39491191357) SUCCESS.
- Fix journal desconocido SHA `dd30b70e1204750fc09fac683f30b6e7e129bfe6): SUCCESS focales: [39464052770](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052770), [39464053282](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053282), [39464053079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053079), [39464052881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052881), [39464052959](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052959).
Estos resultados solo demuestran los workflows y SHA indicados. No se ejecutó CI por las actualizaciones documentales más recientes; el nuevo chat debe verificar el HEAD de la rama y sus propios checks.

## Brecha M0-E ya localizada — no repetir desde cero

Informe focal:
`NEXO_NCS/BUILD/NCS_M0_ROOT_BOOTSTRAP_TEST_SCOPE_AND_RUNTIME_GAP_2026-10-20.md`

Hechos observados en el árbol inspeccionado:
- `tests/nexo/root-bootstrap-protocol.test.mjs` prueba un vector criptográfico fijo de software; no es la raíz provisionada de Nexo.
- `src/nexo/core/ownership.mjs` expone puertos `authorityGate.check` y `effectBoundary.prepare`; este último tiene fallback `NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs` consume `authorityGate.check(claim)` y puede llegar a `conditionalCommit.commit(candidate)` sin invocar `effectBoundary.prepare`.
- Tests con `AUTHORIZED` inyectado validan composición con fixtures, no procedencia legítima.
- No se ha demostrado un módulo runtime que conecte raíz legítima → Constitución/Policy/contexto → claim → sink real.
- Esto demuestra una brecha de integración/contrato que bloquea M0-E; **no** demuestra por sí solo un bypass activo de producción.

Próximo trabajo correcto:
1. Verificar rama/HEAD/CI actuales.
2. Inspeccionar de nuevo solo los archivos M0-E pertinentes en ese HEAD, porque la inspección previa puede quedar obsoleta si hubo commits posteriores.
3. Delimitar el contrato mínimo requerido por las decisiones 1–7 ya aceptadas como base y listar las decisiones técnicas aún OPEN (estado canónico, fuente de confianza independiente, verificador, sink cubierto y procedencia de Genesis).
4. No asumir que aceptar el borrador resuelve esos detalles. Si alguna decisión del propietario es estrictamente necesaria, formular una pregunta concreta; de lo contrario avanzar en diseño técnico sin activarlo.
5. No empezar M1 ni reiniciar STEP 7 como proyecto separado. M0 es la misión actual.

## Principios de continuidad

- STATUS es la puerta de entrada: `STATUS → criterio de salida → handoff → HEAD actual → CI del SHA → matriz → brecha bloqueante`.
- No repetir explicaciones ni auditorías cerradas sin evidencia nueva.
- No afirmar que Nexo está completo ni que M0 pasó.
- No confundir Modelo/OS/dispositivo con Nexo o con su autoridad.
- No inventar IDs, colas, retries, tombstones, wrappers transaccionales, autoridad, recuperación o subsistemas por comodidad.
- Si aparece una deficiencia estructural, demostrarla con contraejemplo y corregir la raíz, sin esconderla con un parche.
- No tomar “continúa” como aprobación de decisiones técnicas/constitucionales pendientes.
- Mantener el alcance finito: cerrar M0 con los criterios acordados y evidencia; no convertir la cautela en investigación infinita.


## Actualización técnica adicional — M0-E (2026-10-21)

Nuevo análisis: [NCS_M0_E_MINIMUM_INTEGRATION_CONTRACT_ANALYSIS_2026-10-21.md](NCS_M0_E_MINIMUM_INTEGRATION_CONTRACT_ANALYSIS_2026-10-21.md). Se inspeccionaron los blobs actuales de `ownership.mjs`, `protected-transition.mjs`, `contracts.mjs` y el test del vector bootstrap. La transición sigue sin invocar `effectBoundary.prepare` antes de `conditionalCommit.commit`; el vector bootstrap es software-only. Esto confirma la brecha de integración ya registrada, no un bypass productivo demostrado.

**Importante sobre HEAD/CI:** la búsqueda de commits recientes devuelve commits globales de otras líneas de trabajo (incluida Lúmina) y la comparación de hashes se mostró divergente; no usar esos commits como HEAD de `ncs-clean-architecture`. El conector disponible no devolvió el SHA de `refs/heads/ncs-clean-architecture` directamente. Por tanto, el HEAD exacto y el CI atribuible a él quedan **PENDING de verificación**. Resolverlo antes de cualquier cambio runtime o declaración de CI PASS.

Próximo paso: verificar el SHA exacto de la ref; si no hay cambios en M0-E desde los blobs anotados en el análisis, avanzar con el contrato mínimo y una prueba adversarial del sink real. No reabrir B/C/D, no implementar una raíz ficticia, no inferir autorización de las aceptaciones de base.
