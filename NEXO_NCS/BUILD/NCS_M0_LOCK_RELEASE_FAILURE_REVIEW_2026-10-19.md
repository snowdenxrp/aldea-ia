# NCS M0 — revisión de liberación del lock (actualizada 2026-10-19)

Estado: **defecto reproducido; corrección y regresiones verificadas por CI** en SHA `6ab108e250ff1834ac74e0885e87b3f64773822b`.

## Hallazgo

En `src/nexo/core/continuity-store.mjs`, `initialize()` y `commitIfCurrent()` ejecutaban `await releaseLock()` en `finally`. Si `fsModule.rm()` fallaba después de que el envelope ya había sido escrito, la excepción de limpieza sustituía el resultado contractual. La persistencia y la limpieza del lock son resultados distintos; no deben colapsarse.

## Corrección implementada

- La liberación del lock devuelve un resultado explícito.
- Un fallo transitorio de `rm` se reintenta **una sola vez**. Si la segunda eliminación funciona, el resultado original de persistencia se conserva y añade `lockRelease: { status: "released_after_retry", initialCode }`.
- Si ambos intentos fallan, el resultado original de persistencia se conserva y añade `lockRelease: { status: "failed", code, initialCode }`. No se oculta que el lock quedó presente.
- El mismo proceso marca la ruta del lock como fallida y un siguiente intento falla cerrado con `NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED` en vez de esperar indefinidamente. Si el lock se retira explícitamente y el siguiente intento observa que ya no existe, el marcador local se limpia.
- La suite prueba ambos métodos (`initialize()`, `commitIfCurrent()`), fallos transitorios y persistentes, lectura independiente del envelope y presencia/ausencia del lock. No se cambiaron los tests anteriores para hacerlos pasar.

## Evidencia CI

SHA exacto: `6ab108e250ff1834ac74e0885e87b3f64773822b`.

- Persistencia determinista, job `tests`: [run 39345256005](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345256005) — SUCCESS.
- Aceptación integrada M0, job `Nexo M0 contracts on one SHA`: [run 39345256014](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345256014) — SUCCESS.
- Admisión/continuidad tras reinicio: [run 39345255926](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345255926) — SUCCESS.
- STEP 4 semántico: [run 39345256026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345256026) — SUCCESS.
- STEP 5 outcome classification: [run 39345255952](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345255952) — SUCCESS.

Un intento anterior falló por una aserción contradictoria en la nueva prueba (se esperaba a la vez que el lock desapareciera y que permaneciera). Se corrigió la prueba; el SHA final anterior es el que tiene los cinco workflows SUCCESS. No se presenta el SHA de los intentos fallidos como aceptación.

## Límite pendiente

El marcador de lock fallido vive en memoria del proceso. El caso persistente se prueba en un mismo proceso; **no** demuestra que otro proceso concurrente detecte el fallo y deje de esperar si el propietario del lock sigue vivo. Tampoco se reclaman fsync/durabilidad ante pérdida de energía, protección anti-rollback, resistencia a procesos locales hostiles, symlink/path attacks ni soporte de filesystem distribuido. La política de espera entre procesos debe permanecer explícita en el trabajo de aceptación del store, no declararse resuelta por esta prueba.

Estado global: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. La llave física no bloquea esta línea de trabajo.
