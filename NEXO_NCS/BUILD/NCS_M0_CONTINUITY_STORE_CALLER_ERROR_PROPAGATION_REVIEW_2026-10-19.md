# NCS M0 — callers y propagación de errores del continuity store (2026-10-19)

Estado: revisión estática acotada; no cambia runtime ni tests.

## Evidencia

Archivo revisado: `src/nexo/core/continuity-owner.mjs`, blob `07f3df47d33da08c38b1f6ebee9b782a68f85847`; `src/nexo/core/continuity-service.mjs`, blob `9f19377f67103bf0d22f68cab9266c2accacc768`.

En `continuity-owner.mjs` se observaron seis llamadas a `store.commitIfCurrent()`:
- `recordMission` devuelve el resultado del store directamente.
- `recordOutcome`, `recordPrepared` y `recordExecutionLineage` esperan el resultado y lo proyectan, pero no envuelven la llamada en un catch local.
- La ruta de observación/reconciliación en torno a las líneas 707–723 sí captura excepciones y devuelve `blocked` con `uncertainty: effect_observation_commit_outcome_unknown`, sin afirmar que se guardó la observación.
- Hay una sexta llamada dentro del owner que debe seguir revisándose junto con su método y sus callers antes de cualquier normalización general; esta inspección no es un inventario completo de todas las capas superiores del repositorio.

En `continuity-service.mjs`, `openNexoContinuityOwner()` espera `store.initialize()` y convierte cualquier resultado distinto de `committed` o `conflict` en una excepción de inicialización; los errores lanzados por la propia llamada también se propagan.

## Interpretación

La política de errores del store es observable en capas superiores y no puede cambiarse sólo dentro de `acquireLock()`:
- Convertir una excepción actual en `{status:"failed"}` cambia la superficie pública de errores.
- Introducir `BUSY` exige definir su propagación en cada capa y probar que no se convierte en reintento/redispatch de un efecto.
- La ruta de reconciliación ya distingue una excepción de commit como incertidumbre, pero eso no significa que todas las otras operaciones compartan la misma estrategia.

## Límite y siguiente paso

Esto es revisión estática parcial, no una búsqueda exhaustiva de todos los callers superiores ni prueba dinámica de cada resultado. Antes de alterar el contrato, completar el mapa de rutas de entrada y definir si la API de store devuelve exclusivamente resultados estructurados o también permite excepciones de infraestructura. Mantener runtime sin cambios hasta cerrar ese contrato.

M0 permanece INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.
