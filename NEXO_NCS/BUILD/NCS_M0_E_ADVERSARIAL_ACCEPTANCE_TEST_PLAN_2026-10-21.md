# NCS M0-E — plan adversarial de aceptación para la frontera de efectos
Fecha: 2026-10-21
Rama de trabajo: `ncs-clean-architecture`
Estado: **PLAN DE PRUEBAS / NO ES IMPLEMENTACIÓN / NO CI PASS**

## Propósito

Convertir la brecha M0-E en un conjunto pequeño y verificable de pruebas adversariales. Este documento no elige ni provisiona una raíz, no aprueba la Constitución, no define por sí solo el estado canónico y no autoriza efectos protegidos.

## Base observada

- `tests/nexo/protected-transition.test.mjs` (blob consultado `65353fe9e20898fb13f225ee004240b6c54687f1`) contiene múltiples casos fail-closed para resultados malformados, `UNKNOWN`, `STOP` y validación semántica. Su helper `makePorts()` también usa `authorityGate.check` que devuelve `AUTHORIZED` y un `conditionalCommit.commit` que confirma el commit; es un fixture de control de flujo, no una prueba de procedencia legítima.
- `tests/nexo/root-bootstrap-protocol.test.mjs` (blob `996c031224ba4544d8982ca4fd1762e9d4f44dc0`) valida un vector P-256/ECDSA conocido. El archivo declara explícitamente que la clave y la firma no son la raíz de Nexo.
- `src/nexo/core/ownership.mjs` (blob `3b66d07e67df09b058b37716716573f6c17a2099`) expone `effectBoundary.prepare`, pero el fallback es `NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs` (blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`) consulta `authorityGate.check` y puede llegar a `conditionalCommit.commit(candidate)` sin invocar `effectBoundary.prepare`.
- `PolicyContext` valida la forma de referencias, scope, resolución, validez y procedencia declarada; la forma por sí sola no demuestra quién emitió los datos ni su legitimidad.

## Principio de prueba

Cada caso debe observar tanto el resultado de la operación como el contador del sink protegido. Un resultado `UNKNOWN` o `STOP` sin comprobar que el sink no fue invocado es evidencia incompleta. Igualmente, una llamada al sink no es aceptable solo porque un fixture haya devuelto `AUTHORIZED`.

El sink se debe nombrar al cerrar el contrato. `conditionalCommit.commit` solo puede tratarse como sink de efectos externos si la implementación y el alcance del sistema demuestran que lo es; si es un commit de estado interno, la aceptación debe seguir hasta el sink real de efectos externos. No asumir esa equivalencia.

## Matriz adversarial mínima

| ID | Escenario | Resultado exigido | Observación del límite |
|---|---|---|---|
| E-01 | Falta la fuente de raíz o su procedencia | `UNKNOWN/STOP`; sink invocado 0 veces | No convertir un estado ausente en raíz predeterminada |
| E-02 | El llamante aporta `AUTHORIZED`, `rootProof`, Constitución o Policy autodeclarados | Rechazo/UNKNOWN; sink invocado 0 veces | Los datos del llamante no pueden autenticar su propia autoridad |
| E-03 | Firma inválida, clave distinta o formato de prueba alterado | `UNKNOWN/STOP`; sink invocado 0 veces | El vector criptográfico existente sigue siendo una prueba de primitiva, no una raíz |
| E-04 | Constitución distinta de la revisión exacta aprobada | `UNKNOWN/STOP`; sink invocado 0 veces | Comparar contenido canónico exacto, no solo nombre o revisión declarada |
| E-05 | Vigencia no verificable, revocación, rollback o conflicto de estado canónico | `UNKNOWN/STOP`; sink invocado 0 veces | La recencia no prueba legitimidad |
| E-06 | Policy/contexto incompleto, contradictorio, obsoleto o sin procedencia verificable | `UNKNOWN/STOP`; sink invocado 0 veces | El objeto de forma válida no equivale a fuente válida |
| E-07 | Verificador no disponible, fallo o configuración distinta de la que se esperaba ejecutar | `UNKNOWN/STOP`; sink invocado 0 veces | Probar el verificador realmente conectado, no solo una función aislada |
| E-08 | Ruta alternativa llega al mismo sink sin pasar por el control | La ruta queda bloqueada; sink invocado 0 veces | Inventariar todos los callers/rutas dentro del alcance acordado |
| E-09 | Sink falla o su resultado es incierto después de registrar intención | Resultado de reconciliación/UNKNOWN según contrato; no redispatch por inferencia | Reutilizar los contratos M0-D existentes; no duplicar su auditoría |
| E-10 | Camino positivo con raíz independiente, Constitución exacta vigente, Policy/contexto verificados y claim dentro del alcance | Solo el efecto permitido por el contrato; evidencia vinculada al claim y revisión gobernante | No se puede marcar PASS hasta definir y provisionar de forma legítima las fuentes requeridas |

## Requisitos para que las pruebas cuenten como aceptación

1. Identificar el objeto constitucional exacto y su representación canónica; aprobación expresa del propietario para ese objeto, no solo aceptación como base del borrador.
2. Definir la fuente independiente de confianza y su procedencia. No crear una clave/pin ficticio ni tratar un vector de test como raíz.
3. Identificar el verificador y demostrar que el flujo de ejecución usa esa implementación/configuración.
4. Nombrar el sink externo protegido y documentar las rutas de acceso incluidas en el alcance.
5. Hacer que los casos negativos comprueben simultáneamente decisión fail-closed y ausencia de invocación del sink.
6. Hacer que el caso positivo use los mismos controles reales de procedencia, vigencia, Policy/contexto y enforcement; no inyectar un resultado final `AUTHORIZED` como sustituto.
7. Integrar los casos en la puerta de aceptación acordada y enlazar run, job y SHA exactos.

## Qué se puede hacer ahora y qué no

**Se puede hacer ahora:** conservar este plan, mapear los casos a los tests existentes, determinar cuál es el sink real y preparar el inventario de rutas de acceso sin cambiar semántica.

**No se debe hacer todavía:** implementar una raíz de prueba como raíz de Nexo, generar digest/firma o commissioning de la Constitución, elegir unilateralmente la fuente canónica, o cambiar runtime para simular que el propietario ya aprobó un objeto constitucional exacto.

## Criterio de salida de M0-E

M0-E solo puede pasar cuando la procedencia legítima y el objeto constitucional exacto gobiernan la operación hasta el sink real; los casos negativos bloquean el sink; las rutas alternativas dentro del alcance están cerradas; y la suite reproducible pasa en el SHA evaluado.

Una suite verde sin esta integración no cierra M0-E.

## Estado conservador

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Actual execution-path inventory — preliminary finding (2026-10-21)

Inspection of current branch files adds an important distinction; it does **not** yet select the protected-effect scope:

1. **Core transition path:** `src/nexo/core/protected-transition.mjs` calls `conditionalCommit.commit(candidate)` after the injected `authorityGate` and semantic validation. This is a state-transition/commit port. Its implementation must be inspected before treating it as the final sink for external effects. The Core exposes `effectBoundary.prepare` but this path does not call it.
2. **Simulation effect path:** `src/nexo/runtime.js` exports `executeLuminaNexoStep()`, which creates a Lúmina effect adapter and routes into `executeNexoStep()`. `src/nexo/simulation-adapter.js` registers handlers such as `execute_lumina_action` that call `executeAction(simulation, agent, action)` and mutate simulation before postcondition verification. The inspected path does not show the constitutional root/Policy authority gate being applied at that mutation boundary. Treat this as a separate execution path requiring scope determination, not proof of a production exploit.
3. **Canonical owner-backed path:** `src/nexo/core/owner-backed-runtime.mjs` has an explicit action allowlist and currently blocks actions other than `chronicle_append` (with separate repair rejection). That is concrete fail-closed behavior for this entry point, but does not prove all legacy or simulation paths are unreachable.
4. **Effect-adapter internals:** `src/nexo/effect-adapter.js` owns the registered handler invocation after intent/precondition checks. The handlers supplied at trusted construction are therefore candidate mutation sinks for that adapter path; caller-supplied reconciliation callbacks are explicitly not trusted. This adapter is distinct from the NCS Core's `conditionalCommit` port.

### Required next decision/design step

Before calling any one of these the M0-E sink, map the exact initial protected-effect scope from the accepted Constitution draft and the actual supported entry points. For every in-scope effect, identify the last mutation-capable handler and all callers/alternate paths. Do not broaden scope to all Lúmina simulation effects by inference, and do not declare the Core transition's commit to be an external sink without evidence.

The test matrix E-01…E-10 remains valid as a contract-level checklist, but concrete tests must be bound to the selected path(s). Until that mapping is documented, E-08 (no alternate route) and the positive path cannot be marked PASS.


## Existing test coverage mapped to the path inventory (2026-10-21)

- `tests/nexo/chronicle-runtime.test.mjs` (blob `cb2c2397bba3dd11a1a15a81cca65ca498e385f6`) tests the owner-backed Chronicle execution slice and explicitly asserts public results retain `authorization: NOT_EVALUATED` when authority has not been evaluated. This is correct conservative signaling; it is not a root verifier or constitutional authorization test.
- `tests/nexo/effect-adapter.test.mjs` (blob `602a220cafc31888892a04d31a06d256bf49b455`) exercises handler invocation, precondition rejection, postcondition failure, PREPARED obligations, and canonical prepare receipts. It proves adapter lifecycle properties in its fixtures; it does not show a Constitution/root authority gate connected to every registered handler.
- `src/nexo/core/owner-backed-runtime.mjs` currently allows the canonical owner-backed path only for `chronicle_append`; it rejects other non-repair actions before dispatch and rejects repair actions under a separate missing settlement contract. This is useful fail-closed scope reduction for that entry point, not proof that other entry points are unreachable.
- `.github/workflows/nexo-deterministic-tests.yml` runs `npm test`; the `package.json` test script does include Nexo suites including `effect-adapter.test.mjs`, `chronicle-runtime.test.mjs`, `root-bootstrap-protocol.test.mjs`, `protected-transition.test.mjs`, and persistence/reconstruction suites.

### Consequence

Do not write duplicate tests for the already-covered lifecycle semantics. The new M0-E acceptance tests should target the missing predicate: **a legitimate, current owner/Constitution decision must be derived from trusted sources and enforced before the canonical dispatch/mutation point**, while all untrusted/missing/stale/conflicting cases demonstrate no dispatch. In parallel, determine whether the legacy Lúmina simulation mutation path is excluded from initial M0 scope or must receive the same enforcement; do not infer reachability or exclusion from module separation alone.
