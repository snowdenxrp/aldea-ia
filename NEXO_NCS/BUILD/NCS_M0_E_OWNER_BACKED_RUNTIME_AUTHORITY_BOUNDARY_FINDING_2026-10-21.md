# NCS M0-E — hallazgo de frontera entre owner-backed runtime y autoridad constitucional
Fecha: 2026-10-21
Estado: **REVISIÓN DE CÓDIGO; NO ES VULNERABILIDAD DE PRODUCCIÓN DEMOSTRADA**
Rama: `ncs-clean-architecture`

## Resumen ejecutivo

La inspección del código en `ncs-clean-architecture` confirma dos controles diferentes que no deben confundirse:

1. El `owner` del runtime owner-backed administra carga de estado canónico, PREPARED, lineage, reconciliación y resultados persistidos.
2. La legitimidad constitucional de la raíz/propietario y la evaluación de la operación contra Constitución/Policy/contexto son otra responsabilidad.

En la función `executeNexoStepWithContinuityOwner` y su implementación interna no se observó una llamada a `authorityGate.check`, un verificador de raíz legítima ni una evaluación de la Constitución/Policy/contexto actual. El runtime aplica un allowlist estricto: bloquea acciones de reparación y rechaza cualquier acción que no sea `chronicle_append` antes de PREPARED/dispatch. Esa lista de acciones es una barrera de alcance técnico; **no prueba por sí misma legitimidad de autoridad**.

El Core separado `executeProtectedTransition` sí llama a `ports.authorityGate.check(claim)` y cierra ante STOP/UNKNOWN, pero su `conditionalCommit.commit(candidate)` no se ha demostrado como sink de efectos externos y no hay prueba de que el owner-backed runtime delegue en esa transición. Por tanto, no se deben combinar ambas propiedades como si existiera una ruta constitucional end-to-end.

## Evidencia exacta observada

### A. Owner-backed runtime

Archivo: `src/nexo/core/owner-backed-runtime.mjs`.

- `executeNexoStepWithContinuityOwnerInternal` requiere interfaces de persistencia/continuidad `owner.loadCurrent`, `owner.recordPrepared`, `owner.recordExecutionLineage`, `owner.reconcilePrepared` y capacidades del adapter.
- La acción `repair_agent_state`, `repair_agent_needs` o `repair_resource_state` se bloquea con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`, `dispatchAttempted: false`.
- Toda acción distinta de `chronicle_append` se bloquea con `NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED`, antes de PREPARED/dispatch.
- `chronicle_append` es la única acción admitida por esa ruta y puede alcanzar `adapter.executePrepared(...)` tras la persistencia de PREPARED.
- La interfaz `owner` que aparece aquí es el propietario técnico del estado/contrato de continuidad; su presencia no es prueba de identidad ni legitimidad constitucional del propietario humano.

### B. Resultado público y pruebas

Archivo: `tests/nexo/chronicle-runtime.test.mjs`.

- El contrato público preserva `authorization: NOT_EVALUATED` cuando la autoridad no fue evaluada.
- Las pruebas cubren rechazo sin dispatch en varios casos de admisión, conflicto, persistencia y recuperación.
- Las pruebas de ruta positiva para `chronicle_append` prueban la ruta de persistencia/adapter bajo fixtures inyectados; no son evidencia de raíz legítima.
- Workflow `.github/workflows/nexo-deterministic-tests.yml` ejecuta `npm test`; cualquier resultado solo se atribuye al SHA exacto del run.

### C. Core protected transition

Archivos: `src/nexo/core/protected-transition.mjs`, `src/nexo/core/ownership.mjs`.

- La transición llama `ports.authorityGate.check(claim)`.
- STOP/UNKNOWN se clasifican antes de snapshot/ejecución/commit.
- El puerto `effectBoundary.prepare` existe en `createCorePorts`, pero no se observó invocado por `executeProtectedTransition`; el camino termina llamando `conditionalCommit.commit(candidate)`.
- La prueba de `AUTHORITY.AUTHORIZED` inyectada demuestra el comportamiento del contrato con ese fixture, no la procedencia legítima del resultado.
- No se ha probado que `conditionalCommit.commit` sea el sink real de mutación/dispatch ni que esta transición gobierne el camino de Lúmina.

### D. Ruta legacy de simulación

Archivos: `src/nexo/runtime.js`, `src/nexo/simulation-adapter.js`, `src/nexo/effect-adapter.js`.

- `executeLuminaNexoStep` construye el adaptador sobre la simulación recibida.
- Los handlers de simulación pueden mutar directamente el objeto de simulación.
- `persistPreparedIntent` es opcional; el adaptador puede invocar el handler tras el hook local/optional.
- La mutación de simulación y la posterior persistencia canónica no son una sola transacción demostrada.
- Se reutiliza la evidencia histórica AB104.150/P112: no se encontró un caller productivo que invoque esta función y proporcione el callback de persistencia canónica. No repetir esa búsqueda sin cambios nuevos, y no interpretar el hallazgo como prueba exhaustiva de inalcanzabilidad.

## Matriz de garantías

| Afirmación | Resultado | Razón |
|---|---|---|
| Acciones no permitidas por owner-backed se bloquean antes del dispatch de esa ruta | Soportado por el código observado y tests existentes para los casos cubiertos | Allowlist explícita y flags de dispatch |
| `chronicle_append` puede alcanzar un adapter preparado | Soportado por contrato/código bajo las dependencias inyectadas | No equivale a efecto protegido autorizado |
| El runtime owner-backed evalúa raíz/Constitución/Policy antes de cada operación | **No demostrado; brecha de integración** | No se observa gate constitucional en esa ruta |
| Core protected transition tiene un punto de gate de autoridad | Soportado a nivel de contrato | El gate es un puerto inyectado |
| El resultado AUTHORIZED tiene procedencia legítima independiente | **No demostrado** | Fixture/puerto no prueba quién lo autorizó |
| `conditionalCommit.commit` es el sink real de efectos externos | **No demostrado** | Falta rastreo del caller y destino real |
| Todas las rutas de mutación están cerradas bajo la opción A | **No demostrado** | Ruta legacy existe; falta decisión de scope y cierre de entry points |
| Hay bypass/exploit de producción activo | **No demostrado** | Falta evidencia de despliegue, alcanzabilidad y bypass real |

## Consecuencia para M0-E

No arreglar este hallazgo agregando un campo `authorized`, un callback de confianza o una fixture más. El contrato mínimo tiene que vincular, de manera verificable, la procedencia independiente de raíz, la revisión exacta de Constitución vigente, Policy/contexto y claim concreto al último límite de cada efecto incluido.

La Opción A del documento `NCS_M0_E_INITIAL_SCOPE_OPTIONS_FOR_OWNER_2026-10-21.md` es una postura provisional útil, pero la admisión de `chronicle_append` no debe describirse como autorización constitucional. Hasta que el scope exacto sea decidido y su enforcement esté demostrado, mantener `authorization: NOT_EVALUATED` y efectos protegidos `STOP`.

## Próximo paso acotado

1. No modificar el runtime para aparentar una raíz.
2. Registrar la decisión explícita del propietario sobre el scope inicial.
3. Para cada acción incluida, seguir el caller desde la entrada pública hasta el handler/sink final.
4. Añadir pruebas negativas de dispatch cero en el último límite de cada ruta incluida, además de pruebas de autorización positiva basada en una fuente independiente real.
5. Ejecutar CI y vincular el resultado al SHA exacto.


## Seguimiento acotado — aislamiento de entry points y puente heredado (2026-10-22)

Esta nota no repite la auditoría del grafo de imports de la CLI independiente ni reabre el gate de reparación.

- La prueba existente `tests/nexo/entrypoint.test.mjs` recorre el grafo de imports desde `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`; el grafo independiente de Nexo no importa el runtime legacy de Lúmina.
- La inspección actual de `scripts/assistants.mjs` muestra un puente heredado en sentido contrario: importa `openNexoContinuityOwner`, `runNexoRuntimeRepairSession` y `buildNexoMission`, además de operar sobre simulación/estado de Lúmina. Por tanto, “entry points independientes de Nexo” es una afirmación respaldada; “Nexo está completamente desacoplado de todos los scripts heredados de Lúmina” no lo está.
- El argumento `--nexo-repair-once` sigue presente en ese script, pero el destino actual `scripts/nexo-runtime-session.mjs` devuelve inmediatamente `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted: false` y `dispatchAttempted: false`. La prueba `tests/nexo/repair-session.test.mjs` cubre el gate de integración y, por separado, el protocolo de bajo nivel. No hay evidencia actual de que esa ruta de producto ejecute la reparación.
- No se modifica código en este seguimiento: retirar el puente completo alteraría el comportamiento de `npm run assistants` y requiere trasladar/retirar con cuidado las responsabilidades de continuidad y misión, no eliminar imports a ciegas. El gate de reparación no se duplica.
- Decisión técnica pendiente para el diseño, no para la autoridad constitucional: definir si `scripts/assistants.mjs` se conserva como compatibilidad heredada fuera de Nexo o si se elimina gradualmente el puente, preservando la CLI independiente. Hasta entonces, no afirmar aislamiento global completo.

Estados sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.
