# NCS M0 — matriz de regresión para confirmación PREPARED

**Fecha:** 2026-10-19  
**Estado:** matriz derivada de inspección estática; todavía no ejecutada.

## Contrato de runtime observado

En `src/nexo/core/owner-backed-runtime.mjs`, después de `owner.recordPrepared()`, el runtime:
- devuelve `conflict` sin despacho si la respuesta es `status: "conflict"`;
- devuelve `unknown` sin despacho si la respuesta declara `status: "unknown"`, `preparedCommitted: "UNKNOWN"`, o la llamada lanza una excepción;
- solo permite continuar cuando `status === "committed"` y `preparedCommitted === true`;
- devuelve `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` para las demás respuestas.

La prueba existente `tests/nexo/chronicle-runtime.test.mjs` comprueba conflicto y UNKNOWN, pero la inspección de sus líneas 389–429 no encontró casos explícitos para todas las respuestas malformadas del último grupo.

## Matriz de casos a validar

| Caso de respuesta de `recordPrepared()` | Resultado esperado | ¿Despacho? |
|---|---|---|
| `{status:"committed", preparedCommitted:true, storeRevision:5}` | El flujo normal continúa | Sí, una vez |
| `{status:"conflict", ...}` | `conflict` | No |
| `{status:"unknown", ...}` | `unknown` | No |
| Excepción / respuesta perdida | `unknown` | No |
| `{status:"committed", storeRevision:5}` | `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` | No |
| `{status:"committed", preparedCommitted:false, storeRevision:5}` | `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` | No |
| `{status:"committed", preparedCommitted:true}` sin revisión | `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` | No |
| `{status:"committed", preparedCommitted:true, storeRevision:-1}` | `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` | No |
| `{status:"failed", preparedCommitted:true, storeRevision:5}` | `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` | No |
| `null` u otra respuesta no objeto | `blocked / NEXO_PREPARED_COMMIT_NOT_CONFIRMED` | No |

## Regresión posterior al despacho

Las pruebas existentes también comprueban que, tras comenzar el despacho, una excepción o una reconciliación desconocida produce `UNKNOWN` y `redispatchAuthorized: false`. Esas garantías deben mantenerse sin alterar el contrato de recuperación.

## Estado de evidencia

- Inspección estática del runtime y de las pruebas: completada para esta matriz.
- Añadir los casos negativos como regresiones ejecutables: pendiente.
- Ejecutar la prueba focal y la suite Nexo: pendiente.
- Evidencia CI vinculada al SHA exacto: pendiente.
- No se declara PASS ni se cambia el estado de autoridad. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.
