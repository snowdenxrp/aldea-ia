# NCS M0 — modelo de amenazas para PREPARED receipt

**Fecha:** 2026-10-19  
**Estado:** decisión de alcance resuelta; no se cambió código.

## Evidencia

`tests/nexo/effect-adapter.test.mjs` (blob `602a220cafc31888892a04d31a06d256bf49b455`, alrededor de líneas 386–399) comprueba que un objeto con `preparedCommitted: false` bloquea y después entrega manualmente `{ status: "committed", preparedCommitted: true, storeRevision: 4 }`, esperando que el handler se ejecute. El adaptador comprueba forma e identidad, pero no la procedencia del objeto.

## Alcance correcto

Esto demuestra que el método público `executePrepared()` acepta un recibo fabricado dentro del mismo proceso JavaScript. **No demuestra** que un atacante remoto pueda acceder al adaptador ni que el runtime owner-backed normal omita `owner.recordPrepared()`. Tampoco demuestra un bypass de autoridad constitucional, que aún no está implementada/evaluada.

La decisión depende de quién puede llamar al adaptador:
- **Consumidor no confiable:** el método de despacho debe quedar detrás de una capacidad no accesible al consumidor o una frontera de proceso/módulo real. Un objeto con booleanos no autentica su origen.
- **Consumidor de la misma base de confianza:** declarar `executePrepared` como API interna del runtime y validar la composición owner-backed puede ser suficiente para el alcance actual; no vender esa API como una sandbox frente a código arbitrario dentro del mismo proceso.

No tratar un callback `verifyReceipt` suministrado por el mismo consumidor como prueba de autenticidad. Tampoco agregar un segundo journal, una cola, reintentos o una envoltura transaccional para ocultar esta decisión.

## Próxima acción

Antes de cambiar código, inspeccionar todos los puntos de creación/consumo de `createEffectAdapter()` y decidir cuál de las dos bases de confianza describe el producto actual. Después escribir una prueba negativa que corresponda al límite elegido y ejecutar CI en el SHA exacto.

**Estado global:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; raíz/autoridad PENDING; efectos protegidos STOP; ambigüedad de alcance resuelta documentalmente; no se añade regresión de seguridad a la API de bajo nivel.

## M0 — decisión de alcance PREPARED receipt (2026-10-19)

- Decisión registrada: [NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md](../DECISIONS/NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md).
- El adaptador genérico y su `executePrepared()` son interfaces internas de la misma base de confianza; no son una sandbox contra JavaScript arbitrario en el mismo proceso. Bloquear sólo un recibo fabricado no arreglaría ese modelo: el consumidor con acceso al adaptador también puede registrar handlers o llamar a `execute()`.
- Se cierra la ambigüedad documental como decisión de alcance, no como PASS de seguridad ni como cambio de runtime. La composición owner-backed mantiene sus regresiones de PREPARED/settlement/no-redispatch. No se añade segundo journal, booleano de autenticidad ni callback auto-verificador.
- No hay evidencia de un caller de producción actual para el runtime legacy de Lúmina; no describirlo como ruta protegida activa.
- **Sin cambio constitucional:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`. La provisión independiente de la raíz sigue siendo un bloqueo separado.

---

