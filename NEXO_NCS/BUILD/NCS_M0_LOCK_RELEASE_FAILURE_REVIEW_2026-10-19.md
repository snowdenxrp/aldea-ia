# NCS M0 — revisión de liberación del lock (2026-10-19)

Estado: hipótesis estática; no defecto confirmado. No se modificaron runtime ni tests.

En `src/nexo/core/continuity-store.mjs`, `initialize()` y `commitIfCurrent()` llaman `await releaseLock()` desde `finally`. La función de liberación hace `await fsModule.rm(...)` si el token coincide y no captura explícitamente un fallo de limpieza. La suite `tests/nexo/continuity-store.test.mjs` cubre fallos de creación del registro del lock y de escritura/rename, pero no se encontró un caso dedicado al fallo de `rm` durante la liberación.

Hipótesis: si el envelope ya se escribió y después falla la limpieza del lock, la excepción de limpieza podría sustituir el resultado contractual de persistencia. Esto debe probarse; no afirmo que ya esté reproducido.

Regresión mínima pendiente:
1. Inyectar un fallo de `rm` sólo para el directorio `.lock`, después de crear el owner.
2. Probar por separado `initialize()` y `commitIfCurrent()`.
3. Leer el envelope con un store normal para conocer la revisión persistida y comprobar si el lock sigue presente.
4. Verificar que el llamador recibe un resultado contractual que no se confunda con autorización para despachar ni con un commit fallido cuando sí se escribió.
5. Verificar que el siguiente intento no queda bloqueado indefinidamente.

No silenciar el error sin contrato: persistencia y liberación del lock son hechos distintos. Primero reproducir; después fijar semántica de resultado y corregir causa raíz. No cambiar tests existentes para hacerlos pasar.

Estado: defecto NO CONFIRMADO; test y CI PENDING; M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP. La llave física no es necesaria para esta revisión.