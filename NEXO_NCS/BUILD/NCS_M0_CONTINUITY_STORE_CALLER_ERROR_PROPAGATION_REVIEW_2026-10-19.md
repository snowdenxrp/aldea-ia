# NCS M0 — callers y propagación de errores del continuity store (2026-10-19)

Estado: revisión estática acotada; no cambia runtime ni tests.

## Evidencia

Archivo revisado: `src/nexo/core/continuity-owner.mjs`, blob `07f3df47d33da08c38b1f6ebee9b782a68f85847`; `src/nexo/core/continuity-service.mjs`, blob `9f19377f67103bf0d22f68cab9266c2accacc768`.

En `continuity-owner.mjs` se observaron cinco llamadas ejecutables a `store.commitIfCurrent()` (la aparición adicional del texto está en la validación de la interfaz al construir el owner):
- `recordMission` devuelve el resultado del store directamente.
- `recordOutcome`, `recordPrepared` y `recordExecutionLineage` esperan el resultado y lo proyectan, pero no envuelven la llamada en un catch local.
- La ruta de observación/reconciliación en torno a las líneas 707–723 sí captura excepciones y devuelve `blocked` con `uncertainty: effect_observation_commit_outcome_unknown`, sin afirmar que se guardó la observación.
- Este inventario cubre los cinco call sites del owner; no es un inventario completo de todas las capas superiores del repositorio.

En `continuity-service.mjs`, `openNexoContinuityOwner()` espera `store.initialize()` y convierte cualquier resultado distinto de `committed` o `conflict` en una excepción de inicialización; los errores lanzados por la propia llamada también se propagan.

## Interpretación

La política de errores del store es observable en capas superiores y no puede cambiarse sólo dentro de `acquireLock()`:
- Convertir una excepción actual en `{status:"failed"}` cambia la superficie pública de errores.
- Introducir `BUSY` exige definir su propagación en cada capa y probar que no se convierte en reintento/redispatch de un efecto.
- La ruta de reconciliación ya distingue una excepción de commit como incertidumbre, pero eso no significa que todas las otras operaciones compartan la misma estrategia.


## Rutas superiores inspeccionadas después de la primera revisión

Se inspeccionaron también `src/nexo/core/owner-backed-runtime.mjs`, `src/nexo/application/chronicle-append.mjs` y `src/nexo/application/continuity-queries.mjs`:

- En `executeNexoStepWithContinuityOwnerInternal()`, una excepción de `recordPrepared()` produce `status: "unknown"`, `preparedCommitted: "UNKNOWN"` y `dispatchAttempted: false`. El adapter no se invoca sin confirmación explícita de PREPARED.
- Las excepciones de persistencia posteriores al dispatch, como lineage/reconciliation/outcome, se convierten en resultados `unknown` y declaran `redispatchAuthorized: false`. Esto es evidencia de manejo fail-closed en esas rutas inspeccionadas, no una prueba de todos los entrypoints.
- `recordNexoMissionSafely()` captura excepción de admisión como `unknown`, `dispatchAttempted: false`, `redispatchAuthorized: false`; el caller bloquea ante ese resultado.
- Las consultas de continuidad traducen errores de lectura a `blocked`; no mutan el store.

Por tanto, el riesgo de añadir una política nueva no debe describirse como un redispatch demostrado: **no se observó tal bypass en las rutas revisadas**. El riesgo es contractual y de interoperabilidad: una nueva clase de resultado como BUSY, o cambiar excepción por resultado, puede no seguir la rama correcta en callers que comparan explícitamente `status`. Antes de cambiar runtime, probar cada rama de resultado nuevo y verificar que el gate de dispatch siga exigiendo PREPARED explícitamente committed.

## Límite y siguiente paso

Esto es revisión estática parcial, no una búsqueda exhaustiva de todos los callers superiores ni prueba dinámica de cada resultado. Antes de alterar el contrato, completar el mapa de rutas de entrada y definir si la API de store devuelve exclusivamente resultados estructurados o también permite excepciones de infraestructura. Mantener runtime sin cambios hasta cerrar ese contrato.

M0 permanece INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.
