# Decisión NCS M0 — alcance de confianza del recibo PREPARED (2026-10-19)

**Estado:** DECISIÓN DE ALCANCE ACEPTADA; no añade protección de runtime  
**Misión:** M0  
**Estado constitucional:** sin cambio: M0 INCOMPLETO, `authorization: NOT_EVALUATED`, efectos protegidos STOP.

## Decisión

Para el prototipo actual, `createEffectAdapter()` y `executePrepared()` son interfaces internas de composición dentro de la misma base de confianza del proceso. **No son una sandbox ni una frontera de seguridad frente a código JavaScript arbitrario que ya tiene acceso al adaptador, a sus handlers o al proceso.**

No se añadirá un segundo journal, un booleano de autenticidad, un callback de verificación proporcionado por el mismo consumidor ni una envoltura transaccional para fingir que el objeto `preparedCommit` no se puede falsificar.

El flujo que puede evaluarse como contrato de continuidad es la composición owner-backed: reconstrucción canónica → confirmación PREPARED por el owner → llamada al adaptador → reconciliación/settlement → outcome terminal. La validez de esa secuencia se comprueba en las pruebas del runtime. Esto no demuestra autoridad constitucional ni habilita efectos protegidos.

## Evidencia de alcance revisada

1. `src/nexo/effect-adapter.js` exporta `createEffectAdapter()`; el adaptador expone `execute()`, `register()` y `executePrepared()`. Un consumidor con acceso a ese objeto ya controla la selección de handlers o puede llamar directamente al método de ejecución genérico. Por tanto, impedir sólo el recibo fabricado en `executePrepared()` no crearía una frontera frente a código no confiable dentro del mismo proceso.
2. `src/nexo/core/owner-backed-runtime.mjs` exige que el owner confirme PREPARED con `status: committed`, `preparedCommitted: true` y una revisión exactamente igual a `current.storeRevision + 1` antes de llamar a `adapter.executePrepared()`. Las pruebas de runtime cubren conflictos, confirmación ambigua y no-redispatch.
3. La auditoría previa `NCS_M0_CANONICAL_PREPARED_RECEIPT_TRUST_BOUNDARY_AUDIT_2026-10-19.md` observó correctamente que el método de bajo nivel acepta un objeto ordinario con campos correctos. El alcance se precisa ahora: esto es una limitación de la API interna, no evidencia de un bypass constitucional implementado ni de un atacante remoto.
4. La búsqueda de call sites no demuestra un caller de producción actual para `executeLuminaNexoStep()`; los entrypoints de planificación/simulación no constituyen evidencia de ejecución protegida activa. El runtime legacy no se promociona a ruta protegida.

## Consecuencias

- No cambiar la prueba de bajo nivel para fingir que el objeto es una capacidad no falsificable.
- No describir el adaptador genérico como una frontera de autorización.
- No aceptar una composición owner-backed inyectada por un caller arbitrario como raíz de confianza: la composición sigue dependiendo de su base de confianza y no tiene autorización constitucional implementada.
- Si el producto requiere ejecutar código no confiable dentro del mismo proceso o exponer directamente el adaptador a ese código, esta decisión deja de ser suficiente. Se necesitará una frontera de proceso/capacidad real y un nuevo modelo de amenazas antes de implementar esa expansión.
- La llave raíz y su provisión independiente continúan bloqueadas por separado; esta decisión no resuelve ese bloqueo.

## Criterio de aceptación de esta decisión

La documentación no debe dejar el recibo fabricado clasificado como una corrección de seguridad pendiente del prototipo actual. Debe describirlo como API interna no apta para aislar código no confiable. Los tests del runtime siguen siendo obligatorios para la composición owner-backed, pero su PASS no demuestra autoridad legítima.

**Estado final:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.
