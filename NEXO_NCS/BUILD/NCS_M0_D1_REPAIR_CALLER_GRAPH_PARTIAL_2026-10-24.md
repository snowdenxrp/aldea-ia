# NCS M0 — grafo de llamadores observado para reparación D1
Fecha: 2026-10-24
Estado: GRAFO PARCIAL — SNAPSHOT FIJADO — NO IMPLEMENTADO — NO EJECUTADO

## Snapshot

- Commit fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`
- Archivos de `scripts/**/*.mjs|js|cjs` del árbol: 13; los 13 se recuperaron por SHA de commit y se buscaron referencias textuales a las APIs indicadas.
- Esto es una búsqueda textual de referencias en la carpeta `scripts/`, no un análisis completo de todos los módulos, pruebas, imports dinámicos ni consumidores externos.

## 1. Cadena interna de reparación observada

Las referencias textuales en los scripts establecen esta cadena:

```text
nexo-repair-session.mjs
  └─ runNexoRepairSession()
       └─ runNexoRepairOnce() [nexo-repair-entrypoint.mjs]
            ├─ loadStateStrict() [simulate.mjs]
            ├─ prepareRepairAgainstPersistedState() [nexo-repair-preparation.mjs]
            ├─ settlePreparedRepairFromPersistedState() [nexo-repair-settlement.mjs]
            └─ dispatchPreparedRepair() [nexo-repair-dispatch.mjs]
                 ├─ loadStateStrict() [simulate.mjs]
                 └─ persistState() [simulate.mjs]
```

Referencias de origen, todas del mismo snapshot:

| Archivo | Blob SHA | Referencia observada |
|---|---|---|
| `scripts/nexo-repair-session.mjs` | `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5` | Importa `runNexoRepairOnce`; la función exportada `runNexoRepairSession` lo llama en la línea 79 |
| `scripts/nexo-repair-entrypoint.mjs` | `74d0fa92c447034e7454b7b846d584819ac81ffd` | Importa preparación, settlement y dispatch; llama `loadStateStrict`, `prepareRepairAgainstPersistedState`, `settlePreparedRepairFromPersistedState` y `dispatchPreparedRepair` |
| `scripts/nexo-repair-dispatch.mjs` | `ed45438be7604d3b341cecd5fbcfc69adda2447e` | Importa `loadStateStrict` y `persistState`; contiene llamadas a ambas |
| `scripts/nexo-repair-preparation.mjs` | `3e978dc11c6f4d7f9e5f61c722629be34f6404a0` | Importa y llama `loadStateStrict` |
| `scripts/nexo-repair-settlement.mjs` | `2f6e91d494b4edb012c2b2db5a077b875c5b0348` | Importa y llama `loadStateStrict` |
| `scripts/nexo-repair-mission-verification.mjs` | `6f9c58cac203faa65e23c1a076af4746f5c22324` | Exporta `verifyRepairMissionGoalFromPersistedState`; no se encontró referencia textual a esa función en los otros 12 archivos de scripts |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` | Define `loadStateStrict` y `persistState`; también importa y llama `openNexoContinuityOwner` en su ruta de simulación |
| `scripts/nexo-continuity.mjs` | `f08969f2d77a2e90f74d01c96242e29de89e3f22` | Reexporta `openNexoContinuityOwner` |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | Importa `runNexoRuntimeRepairSession`, carga/persiste estado Lúmina y llama el wrapper bajo la condición `--nexo-repair-once` |
| `scripts/nexo-runtime-session.mjs` | `f67b6fbe1b6f0098ebf23b35055cc668f96df991` | Exporta `runNexoRuntimeRepairSession`; su nombre no equivale a un control de todos los módulos de reparación |

## 2. Hallazgo delimitado: ruta del wrapper versus ruta de APIs inferiores

En los 13 archivos de scripts inspeccionados, la ruta CLI explícita `assistants --nexo-repair-once` invoca `runNexoRuntimeRepairSession`, no `runNexoRepairSession` directamente. Esto concuerda con la decisión Option A de bloquear la ruta del wrapper.

En esa misma carpeta, la cadena de APIs inferiores sigue conectada internamente de `runNexoRepairSession` a `runNexoRepairOnce` y de ahí a `dispatchPreparedRepair`/persistencia. La búsqueda no encontró otro llamador textual de `runNexoRepairSession` ni de `verifyRepairMissionGoalFromPersistedState` en los 13 scripts, pero **no** demuestra que no haya llamadores en `src/`, tests, imports dinámicos, consumidores externos o módulos generados. Esas superficies siguen `UNKNOWN/BLOCKED` hasta que se revisen.

Por tanto:
- Evidencia positiva: el wrapper de la ruta CLI conocida bloquea; existe una cadena de APIs inferiores capaz de llegar a la frontera de persistencia en su implementación.
- No demostrado: que la cadena inferior sea invocable desde una ruta productiva no bloqueada, o que sea globalmente inalcanzable desde producción.
- No demostrado: ausencia total de consumidores de esas APIs.
- No se invocó ninguna función ni se probó ejecución real.

## 3. Frontera Lúmina y Continuity

En el snapshot, `assistants.mjs` importa `loadState`, `loadStateStrict`, `applyState`, `persistState`, `openNexoContinuityOwner`, `runNexoRuntimeRepairSession` y el orquestador Lúmina. `simulate.mjs` también importa el propietario de Continuity. Esto confirma una superficie de acoplamiento fuente que debe clasificarse; por sí solo no demuestra corrupción, ejecución protegida ni una vulnerabilidad. No cambiar ni deshabilitar la persistencia legítima de Lúmina como solución indirecta.

## 4. Próximo paso de D1

1. Buscar importadores y referencias en `src/nexo/**`, resto de `src/**` y `tests/**` sobre el mismo commit; mantener separado `TEST_ONLY` de producción.
2. Revisar módulos que reexporten APIs y referencias construidas/computadas; cualquier arista no resoluble sigue `UNKNOWN/BLOCKED`.
3. Documentar los guards y el contrato de cada frontera antes de proponer una prueba negativa de no-bypass.
4. No añadir/ejecutar tests ni cambiar runtime/workflows sin autorización explícita separada.

## 5. Límites y gates

- Solo inspección estática y documentación; sin ejecución, tests o CI.
- Runtime, tests, workflows y estado Lúmina no modificados.
- M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
