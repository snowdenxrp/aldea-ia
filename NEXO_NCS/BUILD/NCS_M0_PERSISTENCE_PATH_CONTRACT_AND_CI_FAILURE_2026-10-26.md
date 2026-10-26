# NCS M0 — Contrato de rutas de persistencia y fallo CI (2026-10-26)

Estado: análisis documental de solo lectura. No es una corrección implementada ni una autorización de implementación.

## Anclaje de evidencia

- Repositorio: `snowdenxrp/aldea-ia`.
- Rama: `ncs-clean-architecture`.
- HEAD consultado antes de este registro: `325d004c8f89e1ec25d9253bc7918a52d2351349`.
- Workflow: [Nexo — deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/40270739196), run `40270739196`, job `121402789784`, conclusión `failure`.
- Fuente de persistencia inspeccionada: [scripts/simulate.mjs](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/scripts/simulate.mjs), blob `623d316c7a1efd10cc2f06a3080c0d9f06087596`.
- Adaptador inspeccionado: [conditional-commit-persist-state.mjs](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/adapters/conditional-commit-persist-state.mjs), blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`.
- Prueba fallida: [conditional-commit-persist-state.test.mjs](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/conditional-commit-persist-state.test.mjs), blob `58a2dfb0310e82270a0441fca94e6dd87b112bc2`.
- Pruebas de reinicio: [simulation-restart-persistence.test.mjs](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/simulation-restart-persistence.test.mjs), blob `b747ff5df8c91121cbd3f6e2b5c74d4efe5e91f9`.

## Hechos observados

1. El job de CI llegó a `tests/nexo/conditional-commit-persist-state.test.mjs` y falló en la aserción de la línea 88: actual `RECONCILE_REQUIRED`, esperado `SAFE_COMMIT`. Los pasos previos visibles pasaron; la regresión de limpieza posterior fue omitida por dependencia.
2. La prueba fallida define `statePath` con `path.join(...)`, por tanto como cadena, y lo entrega a `createPersistStateConditionalCommit()`.
3. El adaptador acepta únicamente `statePath` de tipo string no vacío. Invoca `persistState(statePath, ...)` y convierte errores distintos de `STATE_REVISION_CONFLICT` en `COMMIT.UNKNOWN`, con `errorCode` preservado como campo del resultado del adaptador.
4. En `scripts/simulate.mjs`, `lockPathFor(statePath)` interpola `statePath.pathname`. `persistState()` también deriva `tempPrefix`, el directorio de limpieza y `tempPath` a partir de `statePath.pathname`, pero llama a `fsModule.rename(tempPath, statePath)`.
5. Cuando `statePath` es una cadena, `statePath.pathname` no es la ruta. La limpieza de temporales está dentro de un `catch {}`, por lo que el fallo de `path.dirname(undefined)` se oculta. Los nombres de lock/temporal construidos con la propiedad ausente no representan el destino pretendido.
6. La prueba de reinicio utiliza URL `file:` mediante `pathToFileURL(...)` en varios casos y llama directamente a `persistState()`. Por tanto, las fuentes examinadas muestran dos formas de ruta en uso, pero no un contrato explícito y uniforme entre todos los callers.

## Inferencias, no causas demostradas

- El uso de `.pathname` con una cadena es un defecto estático confirmado.
- El temporal puede terminar en una ubicación distinta del archivo destino; si esto cruza sistemas de archivos, `rename()` podría fallar. No se ha demostrado que este sea el error concreto del run `40270739196`.
- El fallo de CI demuestra que el resultado observado no alcanzó `SAFE_COMMIT`; no identifica por sí solo la excepción de persistencia que lo provocó.
- `executeProtectedTransition()` convierte un resultado `COMMIT.UNKNOWN` en `RECONCILE_REQUIRED` con una razón genérica. El `errorCode` existe en el resultado del adaptador, pero no se conserva en la razón final mostrada por esta rama de la transición. Esto reduce la capacidad de diagnóstico sin promover erróneamente un resultado desconocido a éxito.

## Desconocidos que siguen abiertos

- Código y mensaje de la excepción original en el run fallido; los logs consultados solo exponen la aserción.
- Si existe otra fuente de fallo además del contrato de ruta.
- Política prevista para rutas relativas: resolución respecto al CWD, al módulo, o rechazo.
- Si la API pública de `persistState()` debe aceptar tanto cadenas como URL `file:`, o si la URL debe normalizarse antes de llegar a la función.
- Semántica requerida para enlaces simbólicos, rutas codificadas, unidades/plataformas distintas y límites de la limpieza de temporales.

## Propuesta documental para la frontera de rutas

No implementada ni ratificada. Antes de cambiar código, decidir y documentar:

1. El tipo de ruta aceptado en cada frontera. El adaptador actual es string-only; `persistState()` tiene callers que usan URL `file:`.
2. Normalizar una sola vez a una ruta absoluta canónica. Si se aceptan URL, convertirlas mediante `fileURLToPath()`; rechazar esquemas no soportados. Definir explícitamente cómo se interpretan rutas relativas.
3. Usar esa misma ruta normalizada para lock, lectura de revisión, limpieza, temporal, escritura, rename y liberación del lock.
4. Crear el temporal en el mismo directorio que el destino y no silenciar fallos de limpieza que sean relevantes para la seguridad/diagnóstico. Los errores no deben convertirse en confirmación de commit.
5. Preservar el código original del error a través del resultado de reconciliación, sin afirmar que el commit no ocurrió cuando su estado es incierto.

## Validación futura propuesta (no ejecutada)

- Cadena absoluta: commit, revisión, recarga y lock deben apuntar al mismo archivo.
- URL `file:`: comportamiento explícito conforme al contrato elegido; si se admite, resolver al mismo destino que su ruta equivalente.
- Rutas relativas: resultado de la política documentada, sin dependencia accidental.
- Dos destinos distintos: locks y temporales aislados.
- Revisión obsoleta: conflicto sin sobreescritura.
- Fallo de write/rename: nunca declarar `COMMITTED`; resultado desconocido requiere reconciliación.
- Reinicio y limpieza: el snapshot confirmado no puede confundirse con un temporal.
- Ejecutar pruebas/CI solo tras autorización explícita para ese ciclo.

## Estado operativo y límites

- Cambios de runtime/tests/workflows: ninguno.
- Pruebas o CI ejecutados durante esta revisión: ninguno; solo se consultó el run existente y sus logs.
- `M0`: `INCOMPLETO`.
- `D0/D1-DESIGN/D2/D3`: `OPEN`.
- `D1-IMPLEMENTATION`: `NO AUTORIZADA`.
- `authorization`: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Bootstrap A/B/C/D: sin seleccionar.

Este documento registra evidencia y preguntas pendientes; no cierra gates ni autoriza cambios de implementación.
