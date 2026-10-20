# NCS M0 — inventario de callers del continuity store (2026-10-19)

**Estado:** revisión estática de rutas identificadas; no cambia runtime/tests y no es una auditoría exhaustiva del repositorio.  
**Misión:** M0. **Estado constitucional:** `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`.

## 1. Fuentes y versiones examinadas

- `src/nexo/core/continuity-store.mjs` — blob `c5d8151a97a9d97315671d109f0e6e73a7e0d38e`.
- `src/nexo/core/continuity-owner.mjs` — blob `07f3df47d33da08c38b1f6ebee9b782a68f85847`.
- `src/nexo/core/continuity-service.mjs` — blob `9f19377f67103bf0d22f68cab9266c2accacc768`.
- `src/nexo/core/owner-backed-runtime.mjs` — blob `e5b956ea5394387708535106c2dcee8de70bf2fe`.
- `src/nexo/application/chronicle-append.mjs` — blob `9fc3a96c595945dc01529a5acaaef3660270649d`.
- `src/nexo/application/continuity-queries.mjs` — blob `557b97e5338258dfe3b7755f9a22221e4b114994`.

Los hashes son blobs de archivos examinados. Esta revisión no demuestra que sean el mismo SHA de una ejecución CI.

## 2. Call sites de `store.commitIfCurrent()` en el owner

La inspección encontró cinco llamadas ejecutables. La validación de interfaz al crear el owner también menciona el método, pero no es una llamada de persistencia.

| Método owner | Manejo de excepción del commit | Forma que devuelve al caller | Momento/impacto |
|---|---|---|---|
| `recordMission()` | No hay catch alrededor del commit | Devuelve directamente el resultado del store; excepción puede propagarse | Admisión previa a dispatch; el wrapper de Chronicle captura la excepción como `unknown` |
| `recordOutcome()` | No hay catch alrededor del commit | Añade `journalSettled: false` y `authorization: NOT_EVALUATED` al resultado; una excepción se propaga | Outcome terminal; el runtime Chronicle captura la excepción como `unknown`, no autoriza redispatch |
| `recordPrepared()` | No hay catch alrededor del commit | Añade `prepared/preparedCommitted` según `status === "committed"`; una excepción se propaga | Frontera previa al dispatch; el runtime transforma excepción en UNKNOWN y no llama al adapter |
| `recordExecutionLineage()` | No hay catch alrededor del commit | Añade `journalSettled: false` y `authorization: NOT_EVALUATED`; una excepción se propaga | Posterior al dispatch; el runtime trata incertidumbre como UNKNOWN y no autoriza redispatch |
| `reconcilePrepared()` | Sí; catch local | Devuelve estado desconocido con código de incertidumbre y sin afirmar commit | Reconciliación; si la escritura puede haberse aplicado, el siguiente intento debe leer el journal canónico y no repetir el efecto |

### Consecuencia

La interfaz del owner no tiene una política homogénea de captura en los cinco call sites. Eso no significa que una excepción se filtre necesariamente al usuario final: varias capas superiores la capturan. Sí significa que un cambio de excepción a objeto de resultado dentro del store puede cambiar la rama de control en cada caller y debe probarse individualmente.

## 3. Apertura e inicialización

En `openNexoContinuityOwner()`:

1. `loadCurrent()` se intenta primero.
2. Sólo `NEXO_CONTINUITY_STORE_NOT_FOUND` activa el camino de bootstrap.
3. Otros errores de lectura se propagan; no se regeneran silenciosamente.
4. `initialize()` acepta `committed` o `conflict` como estados que permiten una nueva lectura canónica; otros resultados se convierten en excepción de apertura. Las excepciones de `initialize()` también se propagan.
5. Tras `committed/conflict`, se vuelve a cargar el envelope; si esa lectura falla, la apertura falla.

En `runNexoChronicleAppend()`, la apertura se captura y se traduce a `blocked`; el preflight de ambos stores ocurre antes de inicializar alguno. Los errores del store Chronicle durante inicialización también se traducen a `blocked`. La respuesta pública fuerza `authorization: NOT_EVALUATED` y `redispatchAuthorized: false`.

## 4. Consultas de solo lectura

`loadNexoContinuityStatus()` y `loadNexoMissionStatus()` capturan errores de lectura y devuelven `blocked`; no escriben ni cambian el journal. La consulta de misión hace una sola lectura para que el estado persistido y el reconstruido correspondan a la misma revisión.

## 5. Runtime y gate de dispatch

En las rutas inspeccionadas de `owner-backed-runtime.mjs`:

- Error al cargar el estado: `blocked`, `dispatchAttempted: false`.
- Error/resultado incierto de `recordPrepared()`: `unknown`, `preparedCommitted: UNKNOWN`, `dispatchAttempted: false`.
- El adapter no se invoca hasta que PREPARED esté confirmado como committed.
- Fallos posteriores de lineage, reconciliación u outcome pueden dejar el resultado `unknown`, pero mantienen `redispatchAuthorized: false`.
- La acción Chronicle tiene su contrato específico; las acciones no habilitadas y las acciones de reparación sin contrato de settlement quedan bloqueadas antes de PREPARED/dispatch.

**Hallazgo acotado:** no se observó un bypass de redispatch en las rutas revisadas. No es prueba exhaustiva de todos los entrypoints ni una garantía constitucional de autorización.

## 6. Decisión de diseño que se deriva

Todavía no cambiar el runtime. El inventario confirma una API mixta y demuestra que varias capas ya distinguen estados según la fase. La futura decisión debe escoger explícitamente entre:

- conservar excepciones para fallos de infraestructura y documentar qué métodos pueden lanzarlas; o
- adoptar resultados estructurados de forma uniforme, actualizando cada caller y probando todas las ramas.

No elegir por estética. Antes de editar, deben añadirse regresiones específicas para cualquier rama que cambie, incluyendo:
- error de adquisición en `initialize()` y `commitIfCurrent()`;
- error de commit que se lanza antes de persistir frente a error después del reemplazo canónico;
- resultado de persistencia UNKNOWN durante PREPARED;
- incertidumbre después de dispatch;
- liberación fallida con `persistenceStatus: committed`;
- conflicto de revisión bajo contención concurrente.

No añadir `BUSY`, timeout, cancelación, lease, heartbeat ni recuperación automática como parte de esta normalización. La política de contención es una decisión separada y abierta.

## 7. Evidencia y límites

- Revisión estática, sin edición de runtime/tests.
- No se ejecutó CI nuevo para este documento.
- La suite de concurrencia previa observó un proceso hijo esperando por lock y continuando tras su retirada explícita; eso caracteriza el comportamiento, no demuestra progreso acotado.
- Ningún resultado de persistencia demuestra la identidad legítima del propietario ni cambia `authorization: NOT_EVALUATED`.
