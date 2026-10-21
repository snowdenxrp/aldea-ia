# NCS M0-E — Brecha y cierre del gate de reparaciones en opción A

Fecha: 2026-10-21
Rama: `ncs-clean-architecture`
Tipo: hallazgo de enforcement con corrección de integración y pruebas.
Runtime modificado: sí, solo para bloquear la ruta de reparación excluida por la decisión vigente.

## Hallazgo concreto

La decisión del propietario de opción A excluye reparaciones que muten agentes, necesidades o recursos. `src/nexo/core/owner-backed-runtime.mjs` ya bloquea esas acciones en su propia ruta, pero no era la única ruta de ejecución.

`scripts/assistants.mjs` acepta `--nexo-repair-once` y llama `runNexoRuntimeRepairSession`. Antes de la corrección, `scripts/nexo-runtime-session.mjs` seleccionaba un paso de reparación de la misión persistida y lo entregaba a `runNexoRepairSession`, que llegaba a `runNexoRepairOnce` → `dispatchPreparedRepair` → `createLuminaEffectAdapter` → handler de reparación → `persistState`.

Por tanto, el bloqueo de reparación del owner-backed runtime no cubría esa integración alternativa. La ruta podía mutar y persistir el estado local de Lúmina si se invocaba explícitamente. No se afirma ejecución automática, efecto externo ni exploit remoto.

## Corrección aplicada

`scripts/nexo-runtime-session.mjs` ahora devuelve de forma inmediata:

- `status: blocked`
- `code: NEXO_M0_OPTION_A_EFFECT_EXCLUDED`
- `persisted: false`
- `dispatchAttempted: false`

El gate se ubica en la integración del runtime de producto que invoca `assistants --nexo-repair-once`. No se alteraron los módulos inferiores de preparación/dispatch/settlement ni sus pruebas de protocolo aislado; esas pruebas verifican las garantías de recuperación del mecanismo, no habilitan el mecanismo dentro del scope A. La ruta de runtime de producto ya no despacha reparaciones bajo la decisión vigente.

## Prueba actualizada

`tests/nexo/repair-session.test.mjs` ahora comprueba que la integración de runtime devuelve el código de exclusión y deja sin cambios el journal y la revisión del entorno; luego prueba separadamente el protocolo de reparación de bajo nivel para conservar su cobertura mecánica.

`tests/nexo/repair-mission-verification.test.mjs` invoca explícitamente la sesión de bajo nivel para verificar settlement y observación de misión, y documenta que esto es una prueba aislada del protocolo, no una ruta habilitada por el runtime de producto.

La corrección aún requiere CI de un SHA que contenga ambos cambios y este informe.

## Límites

- Esto cierra el dispatch por la integración `runNexoRuntimeRepairSession` utilizada por `scripts/assistants.mjs`; no constituye una certificación exhaustiva de todas las capacidades internas importables ni una frontera contra código arbitrario dentro del mismo proceso.
- Los módulos internos de reparación siguen existiendo para pruebas del protocolo y futura revisión de alcance. No deben conectarse a otro entry point de producto sin decisión explícita del propietario y pruebas de enforcement.
- No se cambia `authorization: NOT_EVALUATED`, no se crea raíz legítima y no se habilitan efectos protegidos.
- Las rutas legacy/simulation siguen bajo sus hallazgos AB104/P112 previos; no se reabren sin evidencia nueva.

## Estado

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. La opción A continúa siendo el scope de trabajo actual.
