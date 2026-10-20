# NCS M0 — revisión de liberación del lock (actualizada 2026-10-19)

Estado: **defecto reproducido; corrección y regresiones verificadas por CI** en SHA `539bcc4cf98dbc33a73140bde7cf18a4374c68c0`.

## Hallazgo

En `src/nexo/core/continuity-store.mjs`, `initialize()` y `commitIfCurrent()` ejecutaban `await releaseLock()` en `finally`. Si `fsModule.rm()` fallaba después de que el envelope ya había sido escrito, la excepción de limpieza sustituía el resultado contractual. Persistencia y limpieza del lock son hechos distintos.

## Corrección implementada

- La liberación del lock devuelve un resultado explícito.
- Un fallo transitorio de `rm` se reintenta **una sola vez**. Si la segunda eliminación funciona, se conserva el resultado de persistencia y se añade `lockRelease: { status: "released_after_retry", initialCode }`.
- Si ambos intentos fallan, la API devuelve `status: "failed"`, `code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED"`, `persistenceStatus` y `lockRelease: { status: "failed", code, initialCode }`. Cuando el envelope sí se escribió, `persistenceStatus: "committed"` conserva ese hecho; el estado exterior fallido evita que callers que sólo comprueban `status === "committed"` continúen hacia dispatch.
- El mismo proceso marca la ruta del lock como fallida y un siguiente intento falla cerrado con `NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED` en vez de esperar indefinidamente. Si el lock se retira explícitamente y el siguiente intento observa que ya no existe, el marcador local se limpia.
- La suite prueba ambos métodos (`initialize()`, `commitIfCurrent()`), fallos transitorios y persistentes, lectura independiente del envelope y presencia/ausencia del lock. No se debilitaron las regresiones existentes.

## Evidencia CI

SHA exacto: `539bcc4cf98dbc33a73140bde7cf18a4374c68c0`.

- Persistencia determinista, job `tests`: [run 39345507299](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507299) — SUCCESS.
- Aceptación integrada M0, job `Nexo M0 contracts on one SHA`: [run 39345507269](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507269) — SUCCESS.
- Admisión/continuidad tras reinicio: [run 39345507268](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507268) — SUCCESS.
- STEP 4 semántico: [run 39345507248](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507248) — SUCCESS.
- STEP 5 outcome classification: [run 39345507252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507252) — SUCCESS.

Los intentos previos detectaron primero una aserción contradictoria en la nueva prueba y luego el riesgo de que un resultado `committed` con lock persistente siguiera pareciendo exitoso a callers. Ambos problemas se corrigieron; el SHA anterior es el que tiene los cinco workflows SUCCESS. No se presentan intentos fallidos como aceptación.

## Límite pendiente

El marcador de lock fallido vive en memoria del proceso. El caso persistente se prueba en un mismo proceso; **no** demuestra que otro proceso concurrente detecte el fallo y deje de esperar si el propietario del lock sigue vivo. Tampoco se reclaman fsync/durabilidad ante pérdida de energía, protección anti-rollback, resistencia a procesos locales hostiles, symlink/path attacks ni soporte de filesystem distribuido. La política de espera entre procesos permanece abierta en la aceptación del store, no declarada resuelta por esta prueba.

Estado global: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. La llave física no bloquea esta línea de trabajo.
