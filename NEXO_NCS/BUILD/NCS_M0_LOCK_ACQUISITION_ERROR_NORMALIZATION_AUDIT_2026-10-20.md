# NCS M0 — normalización del error de adquisición de lock en initialize() (2026-10-20)

**Estado inicial:** corrección estrecha de contrato implementada; CI del nuevo SHA pendiente de observación.  
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

En la primera consulta tras el commit de pruebas, el combined status de `9fad44406e3c19bac2a20ecb830cf29f6758dae7` no mostraba todavía checks y la consulta de workflow runs no devolvía ejecuciones. Por tanto, **no se afirma PASS de CI todavía**. El checkpoint se debe actualizar sólo cuando se observe un resultado asociado al SHA exacto.

La regresión es un test de software con fallo inyectado. No prueba permisos de filesystem de un dispositivo real, durabilidad ante pérdida de energía, seguridad ante host local comprometido ni autoridad legítima.

## 5. Estado M0

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Siguiente paso inmediato: observar CI del SHA exacto `9fad44406e3c19bac2a20ecb830cf29f6758dae7`. No modificar otra frontera hasta saber si esta regresión pasa.
