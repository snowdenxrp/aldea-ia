# NCS M0 — ampliación de grafo D1: consumidores de reparación en pruebas y módulos src
Fecha: 2026-10-24
Estado: INSPECCIÓN ESTÁTICA PARCIAL — SNAPSHOT FIJADO — SIN EJECUCIÓN

## Snapshot y alcance

- Commit fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`
- Se recuperaron por SHA 32 módulos de `src/nexo/**` y 6 archivos de prueba centrados en reparación, CLI y persistencia, además de los 13 scripts ya descritos en el grafo parcial anterior.
- Este alcance es intencionalmente acotado. No equivale a una búsqueda completa de todas las referencias textuales del repositorio.

## 1. Hallazgo de pruebas: las APIs inferiores sí tienen consumidores directos de prueba

Referencias verificadas en el snapshot:

| Archivo de prueba | Blob SHA | Uso estático |
|---|---|---|
| `tests/nexo/repair-session.test.mjs` | `668957e6a02612657f5c496218ee1ebf19fb82d9` | Importa y llama `runNexoRepairSession`, `runNexoRuntimeRepairSession`, preparación y dispatch |
| `tests/nexo/repair-mission-verification.test.mjs` | `8cba314a5a11dff6cad1dbef35532c0716a42b54` | Importa y llama `runNexoRepairSession` y `verifyRepairMissionGoalFromPersistedState` |
| `tests/nexo/repair-owner-lifecycle.test.mjs` | `ace822ad75290bebbddd75f9030e55a19616cbfe` | Importa y llama `runNexoRepairOnce`, preparación, dispatch, settlement y verificación |
| `tests/nexo/repair-settlement-crash-cuts.test.mjs` | `dc65d462cdbd3a3dc1bf370c60af0b92eb7dbb55` | Importa y llama settlement y abre Continuity owner en múltiples escenarios de prueba |
| `tests/nexo/conditional-commit-persist-state.test.mjs` | `58a2dfb0310e82270a0441fca94e6dd87b112bc2` | Prueba el adaptador de commit condicional con `persistState` real/inyectado |
| `tests/nexo/assistants-runtime-cli.test.mjs` | `2c4ffb83e3bb849ac35ec381b268ef4f74a13225` | Importa el wrapper de sesión de runtime y Continuity owner |

Esto prueba que las APIs inferiores son importadas y ejercitadas por pruebas existentes en el código fuente. **No se ejecutó ninguna prueba durante este análisis**, por lo que aquí solo se registra la estructura estática, no el resultado actual de esas pruebas.

## 2. Superficie `src/nexo/**` inspeccionada

En los módulos recuperados de `src/nexo/**` no se encontraron importaciones textuales de los módulos `scripts/nexo-repair-*.mjs` ni llamadas textuales a `runNexoRepairSession`, `runNexoRepairOnce`, `dispatchPreparedRepair` o `runNexoRuntimeRepairSession`.

Aristas relacionadas pero distintas:
- `src/nexo/application/chronicle-append.mjs` importa `openNexoContinuityOwner` desde `continuity-service.mjs`.
- `src/nexo/adapters/conditional-commit-persist-state.mjs` acepta una función `persistState` como dependencia y la invoca; no importa directamente `scripts/simulate.mjs`.
- `src/nexo/core/protected-transition.mjs` llama a `ports.conditionalCommit.commit(candidate)`; esto confirma el punto de llamada del puerto, no que una autoridad legítima ni una frontera real de efectos estén configuradas en runtime.

Módulos representativos inspeccionados:
- `src/nexo/adapters/conditional-commit-persist-state.mjs` blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`
- `src/nexo/application/chronicle-append.mjs` blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`
- `src/nexo/core/continuity-service.mjs` blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`
- `src/nexo/core/protected-transition.mjs` blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`
- `src/nexo/effect-adapter.js` blob `e91648cab31878c01fa1bd253d7732e9036a2370`
- `src/nexo/orchestrator.js` blob `de257324cabfaae69219f71e598bb83c1aafc0a1`
- `src/nexo/runtime.js` blob `9d3d5109753e8ba96fc287c269da275112645523`
- `src/nexo/simulation-adapter.js` blob `318d97bd4626d6fea9289d505e071ab82ed45cc5`

## 3. Interpretación exacta

- Evidencia positiva: los consumidores directos identificados de las APIs inferiores incluyen pruebas; la ruta CLI conocida llama al wrapper bloqueado.
- Evidencia negativa acotada: no se observó una importación directa de las APIs de reparación desde los módulos `src/nexo/**` inspeccionados.
- No probado: que se haya inspeccionado cada archivo posible de `src/**` o cada prueba del repositorio; ausencia de importaciones dinámicas/reexports indirectos; ausencia de consumidores externos; inalcanzabilidad global de las APIs inferiores.
- No se concluye vulnerabilidad ni ejecución no autorizada.
- Mantener `UNKNOWN/BLOCKED` para las aristas que no se han cerrado con evidencia.

## 4. Siguiente trabajo

1. Completar la cobertura del resto de `src/**` y los tests que importan módulos de reparación indirectamente.
2. Resolver reexports, imports dinámicos y cualquier entrypoint de package/workflow que pueda alcanzar las APIs.
3. Solo después, especificar el test de arquitectura negativo que pruebe la regla deseada. No implementarlo ni ejecutarlo sin autorización explícita separada.

## 5. Gates

Solo lectura estática y documentación. Runtime/tests/workflows/estado Lúmina no modificados; no tests/CI.
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
