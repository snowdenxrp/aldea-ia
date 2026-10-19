# NCS M0 — decisión de alcance para el recibo PREPARED

**Fecha:** 2026-10-19  
**Estado:** decisión de alcance propuesta; no cambia código de ejecución ni declara autoridad implementada.

## Evidencia examinada

- `src/nexo/effect-adapter.js`, blob `efe00f7f0bd3586266209fb17e2eb725a6522463`: `createEffectAdapter()` devuelve públicamente `executePrepared`; este método comprueba forma e identidad del recibo, no procedencia.
- `tests/nexo/effect-adapter.test.mjs`, blob `602a220cafc31888892a04d31a06d256bf49b455`: la prueba construye manualmente `{ status: "committed", preparedCommitted: true, storeRevision: 4 }` y espera que se ejecute el handler.
- `src/nexo/core/owner-backed-runtime.mjs`, blob `ca738c3e42cefbdd6576770ac0296dd7e3ac8966`: el flujo owner-backed llama a `owner.recordPrepared()` y solo continúa después de una confirmación explícita comprometida.
- Búsqueda de referencias de `createEffectAdapter` / `createLuminaEffectAdapter`: usos encontrados en el runtime de simulación y pruebas; no se encontró un consumidor de producción actual de `executeLuminaNexoStep()`. La búsqueda de texto no constituye prueba universal de ausencia de consumidores dinámicos.
  
## Decisión de alcance para M0

Para la arquitectura actual, el límite que podemos sostener es **contrato interno dentro de una misma base de confianza de proceso**, no una sandbox frente a código arbitrario que ya puede importar módulos y llamar funciones. Un objeto ordinario fabricado no puede demostrar que hubo PREPARED canónico; pero añadir un booleano, marca, símbolo exportado o callback verificable por el mismo consumidor tampoco crea una frontera de seguridad frente a ese consumidor.

Por ello:
1. Tratar `executePrepared()` como API interna de composición, no como una frontera de seguridad independiente ni como prueba de autorización constitucional.
2. La garantía que M0 debe probar es la composición: el runtime owner-backed no llama al despacho antes de una confirmación PREPARED explícita y comprometida; si la confirmación es conflictiva, fallida o ambigua, el despacho no ocurre.
3. Mantener una prueba que muestra que el objeto ordinario es aceptado por el método de bajo nivel solo como demostración de que ese método no autentica procedencia; no etiquetarla como prueba de seguridad.
4. Si en el futuro se exige resistencia a consumidores no confiables dentro del mismo entorno, esta decisión deja de ser suficiente: hará falta aislar el despacho tras una frontera de proceso real o un mecanismo de capacidad inaccesible a esos consumidores. No simular ese aislamiento con un campo en el objeto.
5. Esta decisión no sustituye la autorización del propietario. `authorization: NOT_EVALUATED`; raíz/autoridad PENDING; efectos protegidos STOP.

## Pruebas que corresponden a esta decisión

- PREPARED confirmado: el runtime registra una sola preparación canónica antes del primer despacho.
- PREPARED conflictivo/fallido/UNKNOWN: cero despachos.
- Excepción o pérdida de respuesta después de que la escritura pudiera ocurrir: resultado conservador UNKNOWN y cero redispatch automático.
- El recibo descriptivo no se presenta como identidad del propietario ni como autorización.
- Ejecutar las pruebas y CI en el SHA exacto antes de declarar PASS.

## Límites de la evidencia

Esta nota es análisis estático y decisión de alcance. No se ejecutaron pruebas ni CI para los blobs revisados en esta nota. No demuestra una vulnerabilidad remota, ni que exista un bypass de autoridad ya implementada.
