# NCS M0 — normalización del error de adquisición de lock en initialize() (2026-10-20)

**Estado final:** corrección estrecha de contrato y regresión validadas por cinco workflows SUCCESS en el SHA exacto `b133c8c392739a0912f7b0466650a25962ead267`.  
**Rama:** `ncs-clean-architecture`  
**Misión:** M0. No modifica autoridad, despacho, política de espera ni recuperación de locks.

## 1. Discrepancia reproducible

Archivo previo: `src/nexo/core/continuity-store.mjs`, blob `ee19bb3a4fad2323289ccf58f96b8ec7d8f0a1d5`.

En `initialize()`, el catch de `acquireLock()` declaraba que mantendría los códigos OS detrás del contrato de Nexo, pero sólo normalizaba `ENOENT/ENOTDIR`; para otros errores devolvía `error.code` literalmente. Por ejemplo, un rechazo de `mkdir(lockPath)` con `EACCES` resultaba en `{status:"failed", code:"EACCES"}`, no en un código del dominio Nexo.

El contrato actual de `commitIfCurrent()` es diferente: normaliza `ENOENT/ENOTDIR` y propaga otras excepciones de adquisición. Esa asimetría ya está descrita en la revisión de contrato público y se preserva explícitamente en este cambio; no se cambió por preferencia estética.

## 2. Corrección aplicada

En `src/nexo/core/continuity-store.mjs`:
- Los errores `ENOENT/ENOTDIR` siguen convirtiéndose en `NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE`.
- Los códigos ya pertenecientes al dominio `NEXO_CONTINUITY_STORE_*` se preservan para no ocultar estados internos como lock ambiguo, stale o fallo de liberación.
- Otros códigos/errores de infraestructura en adquisición se normalizan a `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`.

Esto sólo afecta el resultado estructurado de `initialize()` cuando falla adquirir el lock antes de iniciar la escritura. No altera el contrato de `commitIfCurrent()`, el loop de espera, la semántica CAS ni el manejo de persistencia ambigua.

## 3. Regresión agregada

En `tests/nexo/continuity-store.test.mjs` se inyecta un error `EACCES` al crear el directorio de lock:
- `initialize()` debe devolver exactamente `{status:"failed", code:"NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED"}`.
- `commitIfCurrent()` con la misma clase de error sigue rechazando con `EACCES`, registrando el contrato mixto actual en lugar de modificarlo inadvertidamente.

Blobs después de los cambios:
- Runtime: `ecf982a028dcd4e9208eb236e27538eb5b508863`.
- Test: `f3c9eeb3d0e28926511dcc5ed5051ac567ece130`.
- SHA de commit de runtime: `995871f4500b4dee5e164c2d83a59cb0e6207bf8`.
- SHA de commit de test: `9fad44406e3c19bac2a20ecb830cf29f6758dae7`.

## 4. CI y límites de evidencia

El primer SHA de código/prueba `9fad44406e3c19bac2a20ecb830cf29f6758dae7` sí generó cinco workflows. Dos fallaron por una aserción obsoleta en la prueba: esperaba `EACCES` en `initialize()`, pero el runtime devolvía el nuevo código de dominio como se requería. Red conservado: aceptación integrada [39372027172](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027172) y admisión/reinicio [39372027076](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027076). STEP 4 [39372027142](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027142), STEP 5 [39372027131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027131) y persistencia determinista [39372027145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027145) fueron SUCCESS.

La expectativa se corrigió sólo en el test, commit `b133c8c392739a0912f7b0466650a25962ead267`, blob `ee9327c706f8b34a7c2a7c632f48cb81776df098`. La aserción que mantiene el contrato de `commitIfCurrent()` (propagar `EACCES`) no se modificó. **Cinco workflows son SUCCESS en el SHA exacto corregido**: M0 integrado [39372728077](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728077), admisión/reinicio [39372728055](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728055), persistencia determinista [39372728046](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728046), STEP 4 [39372728141](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728141), STEP 5 [39372728127](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728127).

La regresión es un test de software con fallo inyectado. No prueba permisos de filesystem de un dispositivo real, durabilidad ante pérdida de energía, seguridad ante host local comprometido ni autoridad legítima.

## 5. Estado M0

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Siguiente paso: continuar la revisión contractual acotada de contención de locks, callers públicos y requisitos de progreso. No introducir timeout/BUSY/cancelación/lease/recuperación automática sin fijar primero el contrato. No ampliar el alcance ni reabrir auditorías cerradas.
