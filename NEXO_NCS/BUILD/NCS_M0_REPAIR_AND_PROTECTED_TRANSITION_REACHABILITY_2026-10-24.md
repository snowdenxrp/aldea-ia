# NCS M0 — mapa de alcanzabilidad estática de reparación y transición protegida
Fecha: 2026-10-24
Estado: SOLO LECTURA ESTÁTICA; NO EJECUTADO

## Snapshot

- Fuente: commit `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`

## 1. Ruta de reparación de runtime conocida: cerrada por Option A

`scripts/nexo-runtime-session.mjs` (blob `f67b6fbe1b6f0098ebf23b35055cc668f96df991`) exporta `runNexoRuntimeRepairSession()`, que retorna de forma incondicional:
- `status: blocked`
- `code: NEXO_M0_OPTION_A_EFFECT_EXCLUDED`
- `persisted: false`
- `dispatchAttempted: false`

`scripts/assistants.mjs` solo invoca esa función en la rama `--nexo-repair-once`, después de su flujo de registro/persistencia de asistentes. Esa ruta no llega al dispatcher mediante el wrapper actual.

## 2. APIs inferiores de reparación: existen, pero no equivalen a una ruta runtime habilitada

Cadena estática de módulos:
`scripts/nexo-repair-session.mjs` → `scripts/nexo-repair-entrypoint.mjs` → preparación → `scripts/nexo-repair-dispatch.mjs` → settlement específico en `scripts/nexo-repair-settlement.mjs`.

La sesión inferior deriva acción/target de una misión persistida y permite únicamente:
- `repair_agent_state`
- `repair_agent_needs`
- `repair_resource_state`

Exige misión y paso únicos, paso `planned`, dependencias completadas y contexto owner/store válido. El entrypoint exige una clave idempotente congruente con misión/paso y compara identidad de operación con PREPARED. La recuperación de PREPARED existente observa el estado persistido antes de considerar redispatch y bloquea ante revisión distinta o incertidumbre.

Alcance de la conclusión:
- Los módulos de protocolo y sus exports siguen presentes.
- Las pruebas los importan directamente para caracterizar el protocolo.
- En los entrypoints de aplicación inspeccionados, la ruta `assistants --nexo-repair-once` queda bloqueada por Option A.
- No se ha demostrado que todas las importaciones posibles, consumidores externos, reexports o scripts futuros sean inalcanzables. No se afirma inaccesibilidad global.

## 3. Transición protegida: API separada sin conexión de startup demostrada

`src/nexo/core/protected-transition.mjs` exporta `executeProtectedTransition()` y consulta `ports.authorityGate.check(claim)`; STOP/UNKNOWN devuelven una clasificación no ejecutable. Si el control de autoridad pasa, el flujo aísla el estado, ejecuta candidato, valida semántica y llama a `ports.conditionalCommit.commit(candidate)`.

`src/nexo/core/ownership.mjs` define `effectBoundary.prepare` con fallback `NOT_IMPLEMENTED`. En el cuerpo inspeccionado de `executeProtectedTransition()`, la transición no llama a `ports.effectBoundary.prepare` antes de `conditionalCommit.commit`. Esto es una brecha de composición contractual en esa API, no evidencia de que haya una instancia real conectada o que se haya ejecutado un efecto protegido.

No se halló evidencia en los entrypoints inspeccionados de una ruta de arranque que construya ports reales, establezca una autoridad raíz legítima y conecte esta API a un límite real de efectos. Esta afirmación queda limitada al subconjunto inspeccionado; no es una búsqueda exhaustiva de todos los consumers externos.

## 4. Matriz de alcanzabilidad / evidencia

| Elemento | Resultado estático | Qué NO demuestra |
|---|---|---|
| CLI/runtime de reparación conocido | bloqueado por Option A | inaccesibilidad de todos los exports inferiores |
| Protocolo de reparación inferior | exportado y probado por tests como código fuente | habilitación de runtime o autorización |
| Reconciliación genérica PREPARED | requiere verifier explícito; reparación requiere contrato separado | autoridad legítima |
| `executeProtectedTransition` | API aislada con gate de autoridad inyectado | composición con un root real |
| `effectBoundary.prepare` | puerto definido; default falla con NOT_IMPLEMENTED | invocación real desde transición |
| Startup → efecto protegido | no demostrado en rutas inspeccionadas | no prueba ausencia global de consumidores |

## 5. Criterio para la siguiente decisión de diseño

Antes de modificar runtime, decidir y documentar:
1. Si las APIs inferiores de reparación deben seguir siendo módulos internos/test-only o tener un entrypoint de producto.
2. Qué composición de autoridad/root y efecto es obligatoria para una transición protegida.
3. Cómo demostrar con pruebas (cuando se autoricen) que ninguna ruta de producto evita esa composición.
4. Qué aceptación exacta cierra M0; el estado actual no satisface esa línea de meta.

No se propone un parche implícito. No se ejecutaron scripts, tests o CI, y no se modificó runtime/tests/workflows.

## 6. Gates canónicos

M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
