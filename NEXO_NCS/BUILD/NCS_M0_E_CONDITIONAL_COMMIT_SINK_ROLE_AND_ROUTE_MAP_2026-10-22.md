# NCS M0-E — resolución del rol de conditionalCommit y mapa de rutas candidato
Fecha: 2026-10-21/22
Repositorio: `snowdenxrp/aldea-ia`
Rama inspeccionada: `ncs-clean-architecture`
Tipo: hallazgo técnico/documental; no cambia runtime ni tests.

## Evidencia de revisión

- HEAD más reciente observado por búsqueda de commits: `8b7f4e690de76832393dc854ff7433953c51d4a4` (`Actualizar estado de Lúmina`, 2026-10-22T00:09:35Z). Debe confirmarse nuevamente contra la referencia de rama antes de atribuir CI o cambios posteriores.
- `src/nexo/core/protected-transition.mjs`, blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`.
- `src/nexo/core/ownership.mjs`, blob `3b66d07e67df09b058b37716716573f6c17a2099`.
- `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `7e20654901fdd7f732e3246f8c80d13b44f7ecaa`.
- `src/nexo/effect-adapter.js`, blob `efe00f7f0bd3586266209fb17e2eb725a6522463`.
- `src/nexo/simulation-adapter.js`, blob `369e988c1f4617ce2eb079640511eb94c4e9e798`.
- Plan de aceptación existente: `NEXO_NCS/BUILD/NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md`, blob `35b0c222f19310147f7daf3ba786d08ba5bc0389`.
- No se observó ningún status check asociado al SHA consultado en la respuesta del conector; esto no equivale a ejecutar CI ni prueba fallo de CI.

## Hallazgo 1 — conditionalCommit no está demostrado como sink externo

La implementación actual de `createPersistStateConditionalCommit()` adapta el puerto a `persistState(statePath, candidate.state, clock(), { expectedRevision, stateRevision: expectedRevision + 1 })`. Traduce conflicto de revisión a `CONDITIONAL_CONFLICT` y otros errores a `UNKNOWN`.

Por tanto, en la implementación inspeccionada, `conditionalCommit.commit(candidate)` es una frontera de persistencia de estado canónico. No ejecuta directamente handlers de efectos externos. No debe nombrarse como el sink externo protegido sin una ruta adicional que demuestre esa equivalencia.

La transición Core sí llega a este commit después de consultar un `authorityGate` inyectado y validar semántica, pero no invoca `effectBoundary.prepare`. El puerto `effectBoundary.prepare` continúa con fallback `NOT_IMPLEMENTED`. Esto constituye una brecha de integración del contrato Core, no prueba por sí solo un bypass productivo.

## Hallazgo 2 — hay tres rutas diferentes; no deben fusionarse por su nombre

| Ruta | Último punto observado capaz de mutar | Qué se demuestra | Qué no se demuestra |
|---|---|---|---|
| Core `executeProtectedTransition` → `conditionalCommit.commit` → adaptador `persistState` | Persistencia de `candidate.state` mediante `persistState` | Commit interno con control de revisión; salida UNKNOWN ante resultado incierto | No demuestra que sea un efecto externo ni que controle todos los handlers |
| `executeLuminaNexoStep` → adaptador de efectos → handler `execute_lumina_action` | `executeAction(simulation, agent, action)` dentro de `src/nexo/simulation-adapter.js` | El handler puede mutar `simulation.agents/world` antes de la comprobación de postcondición | No demuestra caller productivo actual ni que el scope constitucional inicial incluya todas las acciones Lúmina |
| Runtime owner-backed canónico | Dispatch de `adapter.executePrepared` después de `owner.recordPrepared` | En el código inspeccionado, solo `chronicle_append` pasa la allowlist; reparaciones y otras acciones se bloquean antes del dispatch nuevo | No demuestra que las rutas legacy/de simulación sean universalmente inalcanzables |

El inventario previo AB104.150/P112 ya registró que no se encontró caller de producción para `executeLuminaNexoStep()` con callback de persistencia canónica. No se repite esa auditoría ni se eleva esa ausencia a prueba de inalcanzabilidad universal.

## Consecuencia arquitectónica

No hay base para cablear ahora `effectBoundary.prepare` al adaptador de persistencia y declarar cerrada M0-E: eso solo conectaría un puerto con estado persistido, sin demostrar que la decisión de autoridad gobierna la mutación protegida real.

Tampoco corresponde integrar el adaptador legacy Lúmina al runtime owner-backed solo para unificar nombres. Primero se necesita una decisión explícita del scope inicial y, para cada clase de efecto incluida, una frontera de mutación identificada.

## Próxima puerta concreta

1. Mantener scope exacto como `OPEN`; los puntos 1–7 constitucionales siguen aceptados solo como base del borrador.
2. Elegir explícitamente qué clase de efecto se pretende permitir inicialmente. La opción A (arranque sin efectos protegidos) sigue siendo una postura provisional propuesta, no una decisión aceptada por inferencia.
3. Para el scope seleccionado, especificar el contrato de ejecución permitido y el último límite capaz de mutar; separar el append local de Chronicle de cualquier efecto externo.
4. Cruzar los tests existentes contra ese límite y reutilizar E-01…E-10. Los negativos deben comprobar decisión fail-closed y cero llamadas al sink real.
5. No implementar raíz, pin, verificador, constructor de contexto constitucional ni camino positivo integrado mientras no existan procedencia independiente legítima y aprobación explícita del objeto constitucional exacto.

## Estado que no cambia

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- No se modificó runtime ni tests en este hallazgo.
- No se declara ejecución de CI ni PASS nuevo.
