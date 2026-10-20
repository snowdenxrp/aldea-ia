# NCS M0 — regresión de aislamiento de snapshot de memoria Nexo

**Fecha:** 2026-10-20  
**Estado:** regresión focal añadida; CI verificado en SHA exacto.

## Hallazgo y alcance

El histórico P112 identificó un riesgo de alias al normalizar memoria Nexo: copiar únicamente los arrays no separa los objetos anidados de misiones, intentos, ejecuciones y el journal de efectos. La implementación actual de `src/assistants/memory.js` usa `structuredClone` en las rutas de retención de esas colecciones. La brecha concreta que se aborda aquí era la ausencia de una regresión directa que fijara esa propiedad contra futuras regresiones.

No se reabre la auditoría P112 completa ni se afirma que todos los cruces de memoria del sistema estén aislados. La prueba focal comprueba el contrato de `createLearningMemory()` para `missions`, `attempts`, `executions` y `effectJournal`, incluyendo referencias anidadas y mutación posterior de la copia normalizada.

## Cambio

- Test: `tests/assistants.test.mjs`, commit `04fcc08081f81b3c385d4d8e9217a7744545d164`, blob `5bc77be1b7a987d936efa4d5105996eaa76437da`.
- No se cambió runtime: la prueba fija el comportamiento de aislamiento que ya implementa `createLearningMemory()`.
- El test verifica que las entradas y objetos anidados relevantes no comparten identidad, y que modificar la misión/journal normalizados no muta el snapshot fuente.

## Evidencia de ejecución

[GitHub Actions — deterministic persistence tests, run 39441463747](https://github.com/snowdenxrp/aldea-ia/actions/runs/39441463747) terminó `completed / success` en el SHA exacto `04fcc08081f81b3c385d4d8e9217a7744545d164`. El paso `Run tests` concluyó `success`; `npm test` incluye `tests/assistants.test.mjs`.

## Límite

Esto prueba el aislamiento de `createLearningMemory()` en los dominios afirmados. No prueba por sí solo el aislamiento de `applyState()`, todos los objetos de simulación, la autoridad raíz, autorización constitucional, ni efectos protegidos. M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Próximo paso

Usar esta regresión como evidencia de una sola frontera cerrada. Continuar sólo con otra brecha M0 actual y acotada; no reabrir P112 completa sin evidencia nueva ni convertir esta prueba en afirmación de aislamiento global.
