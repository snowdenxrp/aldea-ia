# NCS M0 — contrato de contención del continuity store: revisión de diseño (2026-10-19)

Estado: **REVISIÓN DOCUMENTAL; no cambia runtime, tests ni política de autoridad.**

## 1. Evidencia inspeccionada

- Runtime: `src/nexo/core/continuity-store.mjs`, blob `c5d8151a97a9d97315671d109f0e6e73a7e0d38e`.
- Test: `tests/nexo/continuity-store.test.mjs`, blob `b61df0f7490e7d70ab821300febd680d0e7ed806`.
- Inicialización del owner: `src/nexo/core/continuity-service.mjs`, blob `9f19377f67103bf0d22f68cab9266c2accacc768`.
- Revisión anterior y CI del test cross-process: [revisión de lock](NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md), test SHA `6f0499142781e24c55d1adf137170323c8d1afbf`; cinco workflows SUCCESS, runs 39347061453, 39347061416, 39347061419, 39347061426 y 39347061501.
- Branch HEAD observado al iniciar esta revisión: `4c4d1cb0b014705100a3720ea58767b4c4f81c16`. El runtime/test SHA y HEAD no deben confundirse: la prueba de contención citada pertenece a `6f049914...`; el tramo posterior fue documental según la comparación previamente registrada.

## 2. Semántica actual observada

1. `acquireLock()` intenta `mkdir(<file>.lock)`; si recibe `EEXIST`, lee el owner, comprueba antigüedad/vida del PID y duerme `LOCK_RETRY_MS` antes de repetir.
2. Si el lock se juzga stale, la operación falla con `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`; no lo reclama ni lo elimina automáticamente.
3. Si el PID propietario sigue vivo y el lock no desaparece, el bucle no produce un resultado de adquisición acotado.
4. `commitIfCurrent()` normaliza rutas de padre ausentes, pero otros errores de adquisición pueden propagarse como excepción. `initialize()` los normaliza como resultado `failed`. Esto significa que la superficie de error de ambos métodos no es idéntica en todos los errores de adquisición.
5. El test en el mismo proceso lanza dos `commitIfCurrent(0, ...)` concurrentes y exige un resultado `committed` y otro `conflict`. Esa expectativa depende de serializar ambas operaciones hasta que la segunda lea la revisión actualizada.
6. El test cross-process demuestra espera mientras el lock está presente y progreso después de su retirada explícita. No mide espera infinita literalmente ni demuestra una pérdida de datos.

## 3. Opciones de contrato

| Opción | Semántica | Beneficio | Riesgo/coste |
|---|---|---|---|
| A. Espera sin límite (actual) | Contendores cooperativos esperan hasta que el lock desaparezca o haya un error | Conserva la serialización que espera el test de concurrencia; no introduce una política temporal arbitraria | Un owner vivo pero bloqueado puede retener al contendor sin límite; mala garantía de progreso |
| B. Fallo inmediato ocupado | Si existe un lock no stale, devuelve un resultado explícito de contención | Latencia acotada y backpressure visible | Cambia la semántica de `Promise.all`: una escritura puede devolver BUSY en lugar de esperar y luego devolver CONFLICT; callers deben manejarlo sin re-dispatch peligroso |
| C. Espera con límite contractual | Espera hasta un límite definido por contrato y después devuelve un resultado distinto de stale/IO failure | Acota la espera y conserva oportunidad de serialización | El límite no puede inventarse: un commit legítimo lento podría ser rechazado; hay que definir cancelación, propagación, reintento y garantía de no-redispatch |
| D. Recuperación/reclamación automática de lock stale | Un contender elimina o sustituye el lock considerado viejo | Puede recuperar ciertos locks abandonados sin intervención | Riesgo de carrera al eliminar un lock que cambió; PID reutilizado, owner ausente/corrupto y filesystem alterado complican la prueba. No es aceptable con el check-then-remove actual |

## 4. Hallazgo adicional: asimetría de errores

El contrato de error ya no es idéntico entre `initialize()` y `commitIfCurrent()`: la inicialización devuelve un objeto `failed` para errores de adquisición generales; el commit sólo normaliza ENOENT/ENOTDIR y propaga otros errores. La asimetría no demuestra por sí misma un bug de seguridad, pero debe formar parte de una futura matriz de contrato y pruebas. No normalizarla por conveniencia antes de fijar si la API pública exige resultados estructurados o permite excepciones para errores de infraestructura.

## 5. Recomendación de diseño — no implementar aún

**Mantener la semántica de espera actual por ahora, documentada como limitación de progreso, y no añadir timeout, BUSY, cancelación, lease, heartbeat ni reclamación automática hasta fijar los requisitos de los callers.** Es la única opción que no cambia silenciosamente la semántica de serialización ya probada. No equivale a declarar que la espera ilimitada sea la solución final.

Antes de decidir una nueva política, el siguiente paso debe ser una revisión acotada de la API pública y de sus callers: determinar cuáles propagan excepciones, cuáles exigen resultados estructurados, si hay una política superior de deadline/cancelación ya existente y si cualquier reintento podría volver a despachar un efecto. Si no existe una política superior, registrar esa ausencia como requisito abierto en vez de inventarla en el store.

Cualquier cambio futuro deberá conservar estas invariantes:
- lock ocupado, timeout, error de filesystem, lock stale y resultado de persistencia desconocido no son autorización;
- ningún resultado de contención puede convertirse en `committed` ni permitir redispatch;
- ningún contender borra un lock que no puede demostrar que posee;
- dos commits con la misma revisión esperada no pueden producir dos commits exitosos;
- el resultado de persistencia y el resultado de liberar el lock siguen siendo hechos distintos;
- un estado `UNKNOWN` exige reconciliación desde el envelope canónico, no repetición ciega de la operación.

## 6. Límites y estado

Esta revisión no demuestra fsync/durabilidad ante pérdida de energía, anti-rollback, resistencia a procesos locales hostiles, seguridad frente a symlink/path attacks, filesystem distribuido ni autoridad legítima del propietario.

No hubo cambios de runtime/tests ni nuevas ejecuciones CI en esta revisión documental.

**M0 continúa INCOMPLETO.** `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## Addendum posterior — runtime actualizó el contrato de deadline (2026-10-20)

Esta revisión original precede a una implementación posterior. La recomendación de mantener espera sin límite describe el estado del 2026-10-19 y **no debe tratarse como semántica vigente**.

Evidencia actual observada en `ncs-clean-architecture`:

- `src/nexo/core/lock-deadline.mjs`, blob `60f80eeb5f213fff539f5e4224a387898899d668`: presupuesto predeterminado de 2.000 ms, deadline monotónico local al proceso.
- `src/nexo/core/continuity-store.mjs`, blob `9b2bf50c26a76826f40f6761e07c1537db284262`: adquisición limitada; el timeout retorna `failed / NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT`, con `phase: lock_acquisition` y `writeStarted: false`.
- `src/nexo/core/chronicle-store.mjs`, blob `924742e0a999fb0291dafcc67c5f0b250548339b`: deadline equivalente con código de Chronicle separado.
- `src/nexo/application/chronicle-append.mjs`, blob `ccb09c6874b9173963811073150c87b75f53bf2f`: comparte un único deadline entre ambos stores y las mutaciones anidadas. Las pruebas de `tests/nexo/chronicle-runtime.test.mjs`, blob `cb2c2397bba3dd11a1a15a81cca65ca498e385f6`, cubren la preservación del timeout en el límite público.
- La prueba cross-process en `tests/nexo/continuity-store.test.mjs`, blob `f50382fc7d57bacd43dcc888812ceb1bf7fdce76`, elimina el lock antes de vencer el presupuesto por defecto; las pruebas explícitas de timeout usan `lockWaitMs: 25`. Se corrigió el comentario/mensaje que afirmaba que no existía resultado de adquisición acotado en commit `9bd69669208db5bbb7d4d06bce3d304590cd7d44`.

La política vigente ya no es “esperar sin límite”; es “esperar cooperativamente hasta un deadline monotónico y fallar cerradamente si no se adquiere el lock”. Esto **no** interrumpe una llamada de filesystem que nunca retorna y no autoriza reclamación automática de locks stale.

### Puerta que sigue abierta

No rediseñar el deadline ni agregar otro estado de contención. Hacer sólo una revisión de callers actuales: para cada llamada a `initialize()`/`commitIfCurrent()` y a los métodos de owner que las envuelven, registrar si el caller trata el timeout como fallo/bloqueo/UNKNOWN, si excepciones OS no-path quedan capturadas, y si alguna rama podría permitir dispatch o redispatch tras fallo de persistencia. La asimetría de error entre `initialize()` y `commitIfCurrent()` sigue siendo observable; no uniformarla sin contraejemplo concreto.

Validación de suite existente: [run 39431631088](https://github.com/snowdenxrp/aldea-ia/actions/runs/39431631088) SUCCESS en SHA `cd9c02f1596225a419a1512a7ea9b55a4953e71e`, antes del cambio de comentario del test. El commit `9bd6966` requiere CI propio; no inferir PASS a partir de un ancestro.
