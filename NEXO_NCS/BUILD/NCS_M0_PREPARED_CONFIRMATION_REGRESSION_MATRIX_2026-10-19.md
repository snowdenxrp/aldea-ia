# NCS M0 — matriz de regresión para confirmación PREPARED

**Fecha:** 2026-10-19  
**Estado:** corrección y regresiones añadidas al repositorio; ejecución dinámica y CI siguen pendientes.

## Contrato observado

En `src/nexo/core/owner-backed-runtime.mjs`, después de `owner.recordPrepared()`, el runtime:
- devuelve `conflict` sin invocar el adaptador si la respuesta declara `status: "conflict"`;
- devuelve `unknown` sin invocar el adaptador si declara `status: "unknown"`, `preparedCommitted: "UNKNOWN"`, o la llamada lanza una excepción;
- antes de invocar el adaptador solo exige `status === "committed"` y `preparedCommitted === true`;
- devuelve `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` cuando no se cumplen esas dos condiciones.

**Hallazgo adicional y estado de corrección:** la inspección inicial detectó que el runtime no validaba `storeRevision` antes de marcar el despacho. Esto fue corregido en `src/nexo/core/owner-backed-runtime.mjs` (commit `dd1abc69cd867927c2fba949a4677fc7b2e51e99`): ahora exige una revisión entera segura y no negativa antes de llamar al adaptador. Las regresiones en `tests/nexo/chronicle-runtime.test.mjs` (commit `4203330689d6ea4072585d8cc6bca74b383ca461`) cuentan invocaciones del handler y esperan cero para las respuestas malformadas. **La prueba está escrita, pero no se ha ejecutado**; la garantía dinámica queda pendiente hasta correrla.

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
| `{status:"committed", preparedCommitted:true}` | **Definir/corregir frontera:** revisión ausente; no marcar despacho ni llamar handler | 0 |
| `{status:"committed", preparedCommitted:true, storeRevision:-1}` | **Definir/corregir frontera:** revisión inválida; no marcar despacho ni llamar handler | 0 |
| `{status:"committed", preparedCommitted:true, storeRevision:1.5}` o revisión no segura | **Definir/corregir frontera:** revisión inválida | 0 |

## Prueba posterior al inicio del efecto

Conservar las garantías ya cubiertas: si el handler puede haber producido el efecto y luego lanza, o la reconciliación queda desconocida, el resultado es `UNKNOWN`, `redispatchAuthorized:false`, y el handler no se vuelve a invocar automáticamente.

## Evidencia y estado

- Inspección estática de runtime, adaptador y prueba focal: realizada.
- Pruebas dinámicas: no ejecutadas.
- Corrección runtime para validar revisión antes de la frontera de despacho: commit `dd1abc69cd867927c2fba949a4677fc7b2e51e99`.
- Ocho regresiones negativas añadidas con contador del handler: commit `4203330689d6ea4072585d8cc6bca74b383ca461`.
- Ejecutar prueba focal y suite Nexo: pendiente.
- CI vinculado al SHA exacto: pendiente.
- No declarar PASS. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.
