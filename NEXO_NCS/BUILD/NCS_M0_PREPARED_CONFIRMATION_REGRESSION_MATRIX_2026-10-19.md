# NCS M0 — matriz de regresión para confirmación PREPARED

**Fecha:** 2026-10-19  
**Estado:** corrección y regresiones añadidas al repositorio; ejecución dinámica y CI siguen pendientes.

## Contrato observado

En `src/nexo/core/owner-backed-runtime.mjs`, después de `owner.recordPrepared()`, el runtime:
- devuelve `conflict` sin invocar el adaptador si la respuesta declara `status: "conflict"`;
- devuelve `unknown` sin invocar el adaptador si declara `status: "unknown"`, `preparedCommitted: "UNKNOWN"`, o la llamada lanza una excepción;
- antes de invocar el adaptador exige `status === "committed"`, `preparedCommitted === true` y `storeRevision` entero seguro no negativo y exactamente igual a `current.storeRevision + 1`;
- devuelve `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` si falla cualquiera de esas condiciones.

**Hallazgo adicional y estado de corrección:** la inspección inicial detectó que el runtime no validaba `storeRevision` antes de marcar el despacho. Esto se corrigió en dos pasos en `src/nexo/core/owner-backed-runtime.mjs`: el guard inicial de revisión está en `dd1abc69cd867927c2fba949a4677fc7b2e51e99` y la exigencia de revisión sucesora exacta en `879b9e0791696bafdb081f973ae16827cf8eab04`. Las regresiones de `tests/nexo/chronicle-runtime.test.mjs` cuentan llamadas al adaptador y al handler; diez respuestas malformadas o contractualmente inconsistentes esperan cero llamadas. **La prueba está escrita, pero no se ha ejecutado**; la garantía dinámica queda pendiente hasta correrla.

## Matriz de regresión requerida

| Respuesta de `recordPrepared()` | Resultado/propiedad que debe probarse | Invocaciones del handler |
|---|---|---|
| `{status:"committed", preparedCommitted:true, storeRevision:5}` | Flujo normal; PREPARED precede al efecto | Exactamente 1 |
| `{status:"conflict", ...}` | `conflict`, `dispatchAttempted:false` | 0 |
| `{status:"unknown", ...}` | `unknown`, `redispatchAuthorized:false` | 0 |
| La llamada lanza / respuesta perdida | `unknown`, sin despacho | 0 |
| `{status:"committed", storeRevision:5}` | Bloqueo contractual antes de invocar el adaptador | 0 |
| `{status:"committed", preparedCommitted:false, storeRevision:5}` | Bloqueo contractual antes de invocar el adaptador | 0 |
| `{status:"failed", preparedCommitted:true, storeRevision:5}` | Bloqueo contractual antes de invocar el adaptador | 0 |
| `null` | Bloqueo contractual antes de invocar el adaptador | 0 |
| `{status:"committed", preparedCommitted:true}` | Guard corregido; prueba debe confirmar que no se marca despacho ni se invoca adaptador | 0 |
| `{status:"committed", preparedCommitted:true, storeRevision:-1}` | Guard corregido; prueba debe confirmar que no se marca despacho ni se invoca adaptador | 0 |
| `{status:"committed", preparedCommitted:true, storeRevision:1.5}` o revisión no segura | Guard corregido; prueba debe confirmar que no se marca despacho ni se invoca adaptador | 0 |
| `{status:"committed", preparedCommitted:true, storeRevision:4}` cuando `current.storeRevision:4` | Revisión no avanza; bloquear antes de despacho | 0 |
| `{status:"committed", preparedCommitted:true, storeRevision:6}` cuando `current.storeRevision:4` | Revisión salta más de una unidad; bloquear antes de despacho | 0 |

## Prueba posterior al inicio del efecto

Conservar las garantías ya cubiertas: si el handler puede haber producido el efecto y luego lanza, o la reconciliación queda desconocida, el resultado es `UNKNOWN`, `redispatchAuthorized:false`, y el handler no se vuelve a invocar automáticamente.

## Evidencia y estado

- Inspección estática de runtime, adaptador y prueba focal: realizada.
- Pruebas dinámicas: no ejecutadas.
- Corrección runtime para validar revisión antes de la frontera de despacho: commit `dd1abc69cd867927c2fba949a4677fc7b2e51e99`.
- Diez regresiones negativas añadidas; cuentan tanto llamadas al adaptador como invocaciones del handler. Prueba inicial: `4203330689d6ea4072585d8cc6bca74b383ca461`; aserciones de frontera: `cfd57bf8e8a74570c23908c30599126f9d76748a`; revisiones no sucesoras: `bdef7856448b3004b4c64afc635b79f6ad862176`.
- Ejecutar prueba focal y suite Nexo: pendiente.
- CI vinculado al SHA exacto: pendiente.
- No declarar PASS. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.
