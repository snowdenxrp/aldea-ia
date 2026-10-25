# NCS M0 — clasificación de superficies ejecutables y APIs importables D1
Fecha: 2026-10-24
Estado: EVIDENCIA ESTÁTICA SOBRE SNAPSHOT FIJADO — NO IMPLEMENTADO — NO EJECUTADO

## Snapshot de origen

- Commit: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`
- Método: archivos leídos mediante referencias al SHA del commit y cotejados con el árbol recursivo no truncado.
- Esta nota no describe el HEAD móvil actual; si el origen cambia, repetir la captura sobre un nuevo snapshot y no mezclar evidencia.

## Hallazgo principal

Hay que distinguir tres superficies diferentes: comandos declarados en `package.json`, módulos que detectan ejecución directa, y módulos importables que exportan funciones capaces de alcanzar persistencia o efectos. Ninguna de estas listas sustituye el análisis de todas las rutas transitivas.

### 1. Scripts declarados por package.json

Blob `package.json`: `e45dc6d215db53ea2758009cd501f565634e3610`.

- `npm run nexo` → `node scripts/nexo.mjs`
- `npm run assistants` → `node scripts/assistants.mjs`
- `npm run simulate` → `node scripts/simulate.mjs`
- `npm test` ejecuta una cadena extensa de tests y contiene `tests/nexo/entrypoint.test.mjs`; no se ejecutó aquí.

La ausencia de un script npm dedicado no impide que un archivo pueda ejecutarse mediante `node ruta/al/archivo.mjs` ni que una función exportada se invoque desde otro módulo.

### 2. Superficies con evidencia de guardia de ejecución directa

| Archivo | Blob SHA | Evidencia observada | Clasificación D1 provisional |
|---|---|---|---|
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | Guardia `import.meta.url` / `process.argv[1]`; crea proceso hijo con `spawnSync` para `nexo-chronicle-session.mjs` | Entry point CLI; el hijo sigue siendo frontera de admisión propia |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Guardia `import.meta.url` / `process.argv[1]`; exporta `runNexoChronicleAppend` | Entry point de hijo y API importable; debe validar admisión por sí mismo |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` | Guardia `import.meta.url` / `process.argv[1]`; exporta `loadStateStrict`, `loadState`, `applyState`, `persistState` | CLI Lúmina más API de estado compartida; conservar persistencia legítima y resolver la frontera Nexo/Lúmina |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | Lee `process.argv` para `--nexo-repair-once`; importa Continuity owner, wrapper runtime Nexo, persistencia de simulación y orquestador Lúmina | Superficie Lúmina con ruta explícita de reparación Nexo; no tratar como entrypoint Nexo ordinario ni como excepción aprobada |

La búsqueda de guardias fue estática sobre el texto de estos archivos. No demuestra que todos los caminos de ejecución estén cubiertos ni que no existan otros entrypoints en módulos, loaders o consumidores externos.

### 3. APIs de reparación importables sin guardia CLI observada

Los siguientes archivos exportan funciones y no mostraron guardia de ejecución directa en el texto inspeccionado:

| Archivo | Blob SHA | API exportada observada |
|---|---|---|
| `scripts/nexo-repair-session.mjs` | `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5` | `runNexoRepairSession` |
| `scripts/nexo-repair-entrypoint.mjs` | `74d0fa92c447034e7454b7b846d584819ac81ffd` | `runNexoRepairOnce` |
| `scripts/nexo-repair-dispatch.mjs` | `ed45438be7604d3b341cecd5fbcfc69adda2447e` | `dispatchPreparedRepair` |
| `scripts/nexo-repair-preparation.mjs` | `3e978dc11c6f4d7f9e5f61c722629be34f6404a0` | `prepareRepairAgainstPersistedState` |
| `scripts/nexo-repair-settlement.mjs` | `2f6e91d494b4edb012c2b2db5a077b875c5b0348` | `settlePreparedRepairFromPersistedState` |
| `scripts/nexo-repair-mission-verification.mjs` | `6f9c58cac203faa65e23c1a076af4746f5c22324` | `verifyRepairMissionGoalFromPersistedState` |
| `scripts/nexo-runtime-session.mjs` | `f67b6fbe1b6f0098ebf23b35055cc668f96df991` | `runNexoRuntimeRepairSession` |

La ausencia de guardia CLI no es una vulnerabilidad por sí sola: estos archivos pueden ser módulos internos. Pero el wrapper `runNexoRuntimeRepairSession` que bloquea una ruta no demuestra que todos los consumidores productivos sean incapaces de importar e invocar las APIs de nivel inferior. La exclusión global de reparación continúa sin demostrarse. No se invocó ninguna API ni se modificó estado.

### 4. Reexport de Continuity

- `scripts/nexo-continuity.mjs`, blob `f08969f2d77a2e90f74d01c96242e29de89e3f22), reexporta `openNexoContinuityOwner` desde `src/nexo/core/continuity-service.mjs`.
- El reexport no es una admisión de instancia y no establece quiénes son todos sus consumidores.
- Mantener la clasificación de los consumidores no identificados en `UNKNOWN/BLOCKED`.

## Próxima unidad de trabajo D1

1. Completar el mapa de importadores/callers de cada API de reparación y de Continuity usando únicamente el mismo snapshot.
2. Seguir las aristas hacia factories, lecturas persistentes, `conditionalCommit`, adapters y procesos hijos.
3. Distinguir `PRODUCTION_ADMITTED`, `INTERNAL_ONLY`, `TEST_ONLY`, `EXPLICIT_EXCEPTION`; no asignar estas clases por el nombre del archivo.
4. Marcar imports dinámicos/computados, consumidores externos y aristas no resolubles como `UNKNOWN/BLOCKED`.
5. Solo después de demostrar el grafo, cerrar la especificación del test arquitectónico negativo. No añadir ni ejecutar tests sin autorización explícita separada.

## Límites y gates

- Solo lectura estática y documentación; no se ejecutó código, tests ni CI.
- No se modificaron runtime, tests, workflows ni estado Lúmina.
- M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
