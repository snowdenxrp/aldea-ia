# NCS M0 — revisión de liberación y contención del lock (actualizada 2026-10-19)

Estado: **fallo de liberación reproducido y corregido; contención entre procesos caracterizada; política de adquisición aún abierta**.

## 1. Hallazgo: fallo de liberación después de persistir

En `src/nexo/core/continuity-store.mjs`, `initialize()` y `commitIfCurrent()` liberan el lock en `finally`. Si `fsModule.rm()` falla después de escribir el envelope, no se debe confundir el resultado de persistencia con el de limpieza.

### Corrección y contrato

- La liberación del lock devuelve un resultado explícito.
- Un fallo transitorio de `rm` se reintenta una sola vez. Si la segunda eliminación funciona, se conserva el resultado de persistencia y se añade `lockRelease: { status: "released_after_retry", initialCode }`.
- Si ambos intentos fallan, la API devuelve `status: "failed"`, `code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED"`, `persistenceStatus` y `lockRelease: { status: "failed", code, initialCode }`. Si el envelope se escribió, `persistenceStatus: "committed"` preserva ese hecho, pero el estado exterior falla para impedir un handoff exitoso.
- El mismo proceso registra la ruta con fallo de liberación y los intentos posteriores fallan cerrados. Si se retira el lock explícitamente, el siguiente intento puede limpiar el marcador local.

### CI del runtime y regresiones

SHA exacto: `539bcc4cf98dbc33a73140bde7cf18a4374c68c0`.

- Persistencia determinista: [run 39345507299](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507299) — SUCCESS.
- Aceptación M0 integrada: [run 39345507269](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507269) — SUCCESS.
- Admisión/continuidad: [run 39345507268](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507268) — SUCCESS.
- STEP 4: [run 39345507248](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507248) — SUCCESS.
- STEP 5: [run 39345507252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507252) — SUCCESS.

## 2. Caracterización nueva: un proceso independiente espera por un lock cuyo dueño sigue vivo

Test agregado a `tests/nexo/continuity-store.test.mjs`; SHA exacto: `6f0499142781e24c55d1adf137170323c8d1afbf`.

- Persistencia determinista: [run 39347061453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061453) — SUCCESS.
- Aceptación M0 integrada: [run 39347061416](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061416) — SUCCESS.
- Admisión/continuidad: [run 39347061419](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061419) — SUCCESS.
- STEP 4: [run 39347061426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061426) — SUCCESS.
- STEP 5: [run 39347061501](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061501) — SUCCESS.

La prueba crea un lock con `owner.pid = process.pid` del proceso padre. Un proceso hijo independiente invoca `commitIfCurrent()`; el test observa que el hijo sigue pendiente mientras el lock existe, elimina el lock de forma explícita y comprueba que el hijo completa el commit y que la revisión canónica avanza. Esto confirma la contención entre procesos y el comportamiento de espera actual.

**Interpretación exacta:** `acquireLock()` usa `while (true)` y espera 10 ms entre intentos. Si el owner PID sigue vivo y el lock no desaparece, no existe un resultado acotado de adquisición. La prueba observa la espera durante el intervalo de control y la reanudación tras retirar el lock; no pretende medir literalmente tiempo infinito.

## 3. Decisión pendiente — no introducir un parche todavía

No se cambió runtime en el SHA `6f049914...`. No añadir automáticamente timeout, lease, heartbeats, takeover, reclamación del lock ni borrado por un segundo proceso: cualquiera de esas opciones altera semántica de concurrencia y necesita contrato.

Antes del cambio de código, definir y probar:
1. Qué debe devolver un contendor cuando el lock pertenece a un PID vivo pero no progresa: esperar sin límite, fallar tras un límite contractual o permitir cancelación explícita.
2. Si la espera acotada existe, cómo distinguir `BUSY/TIMEOUT` de lock stale y de fallo de filesystem sin convertirlos en permiso para redispatch.
3. Qué evidencia permite recuperación explícita sin que un contendor elimine un lock válido de otro proceso.
4. Qué garantías de progreso se esperan de filesystem local y de procesos cooperantes.

No se afirma que el wait actual haya causado pérdida de datos: la prueba documenta el comportamiento y el requisito todavía no decidido.

## 4. Límites no reclamados

No hay afirmación de fsync/durabilidad ante pérdida de energía, anti-rollback, resistencia a procesos locales hostiles, protección frente a symlink/path attacks ni soporte de filesystem distribuido. La prueba no valida autoridad del propietario ni efectos externos.

Estado global: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. La llave física no bloquea esta línea.
