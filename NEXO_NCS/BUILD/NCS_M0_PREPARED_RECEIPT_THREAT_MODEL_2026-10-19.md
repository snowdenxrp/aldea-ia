# NCS M0 — modelo de amenazas para PREPARED receipt

**Fecha:** 2026-10-19  
**Estado:** decisión arquitectónica pendiente; no se cambió código.

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

**Estado global:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; raíz/autoridad PENDING; efectos protegidos STOP; regresión del hallazgo PENDING.
