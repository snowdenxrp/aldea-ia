# NCS M0 — coexistencia de rutas de efecto legacy y owner-backed

**Fecha:** 2026-10-19  
**Estado:** brecha estática confirmada; no se cambió código de ejecución.

## Archivos y blobs inspeccionados

- `src/nexo/runtime.js`: `f9dfcd461705471546a1676b738c0547ad118f7e`
- `src/nexo/simulation-adapter.js`: `369e988c1f4617ce2eb079640511eb94c4e9e798`
- `src/nexo/core/owner-backed-runtime.mjs`: `ca738c3e42cefbdd6576770ac0296dd7e3ac8966`
- `src/nexo/effect-adapter.js`: `efe00f7f0bd3586266209fb17e2eb725a6522463`
- `docs/nexo/NEXO_CURRENT_EFFECT_PATH_CAPABILITY_MAP_V1_2026-09-25.md`: `b197e906edf09ee3198854fc45a268d2cff69bb6`

## Observación reproducible por estructura de llamadas

1. `executeLuminaNexoStep()` crea `createLuminaEffectAdapter()` y llama a `executeNexoStep()`.
2. `executeNexoStep()` invoca `adapter.execute(...)`, no `executeNexoStepWithContinuityOwner()`.
3. `createLuminaEffectAdapter()` crea handlers que mutan directamente el objeto `simulation` y entrega el adaptador general `createEffectAdapter()`.
4. El journal de `executeLuminaNexoStep()` se obtiene de `memory.nexo.effectJournal` si existe; `persistPreparedIntent` es opcional y por defecto `null`. La ruta puede ejecutar una mutación local sin que esa llamada demuestre un PREPARED duradero en el store canónico independiente.
5. La ruta owner-backed de `executeNexoStepWithContinuityOwner()` aplica controles distintos: sólo permite `chronicle_append` actualmente; las acciones de reparación y otras acciones quedan bloqueadas antes de PREPARED/dispatch.

## Precisión de alcance: API existente no equivale a ruta de producción activa

La búsqueda de referencias en la rama encontró `executeLuminaNexoStep()` como definición y llamada interna a `executeNexoStep()`, además de referencias históricas y pruebas; no encontró un caller de producción actual. `scripts/assistants.mjs` planifica/persiste misiones y `scripts/simulate.mjs` mantiene la persistencia de la simulación, pero ninguno llama actualmente a `executeNexoStep()` ni a `executeLuminaNexoStep()`.

Por tanto, el hallazgo demuestra que el módulo legacy puede mutar una simulación si se invoca, y que la API existe sin PREPARED durable obligatorio; **no demuestra que la aplicación actual despache efectos por esa ruta en producción**. El riesgo inmediato es de clasificación/composición futura y de exposición de API importable, no evidencia de un bypass activo en un caller de producción. Esta distinción evita sobredimensionar el hallazgo.

## Interpretación

Hay dos contratos de ejecución coexistiendo a nivel de APIs/módulos:
- **Legacy/simulación:** `executeNexoStep → adapter.execute → handler`, con memoria local y journal opcional.
- **Owner-backed canónico:** `executeNexoStepWithContinuityOwner → owner.recordPrepared → adapter.executePrepared → lineage/reconciliation`, actualmente limitado a Chronicle.

No es correcto decir que la ruta legacy ya es la ruta de ejecución protegida de Nexo. La brecha no se resuelve cambiando el nombre de `memory`, pasando `stateRevision` ni conectando un callback de persistencia opcional sin definir quién tiene autoridad sobre el efecto.

## Próxima decisión mínima

Antes de habilitar efectos protegidos, decidir explícitamente si:
- la ruta legacy queda sólo como simulación/no protegida y se etiqueta como tal, o
- las acciones de producto deben migrar a un contrato owner-backed con una frontera de autoridad y efecto definida.

No migrar todas las acciones ahora: el owner-backed rechaza deliberadamente las acciones no habilitadas y no hay aún raíz/decisión de autorización. No introducir segundo journal, retries, rollback o envolturas transaccionales para cerrar artificialmente la brecha.

## Criterios para cierre

- Inventario de cada punto de entrada de mutación y clasificación (simulación local / protegida).
- Ninguna API presentada como ejecución protegida si no atraviesa la misma admisión canónica.
- Pruebas negativas para llamadas fuera del camino autorizado.
- Evidencia de test/CI para el SHA exacto.

**Estado global:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; raíz/autoridad PENDING; efectos protegidos STOP; validación dinámica PENDING.
