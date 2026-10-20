# NCS M0 — frontera de la ruta de reparación respecto al deadline compartido

Fecha: 2026-10-20
Rama: `ncs-clean-architecture`

## Estado

**Auditoría de callers completada para la API pública estable. La ruta de reparación inyectada queda fuera del contrato interactivo Chronicle actual; no se habilita ni se declara lista.** Esta nota registra el límite operativo observado, no una decisión de producto para activar reparación.

## Evidencia inspeccionada

- `src/nexo/application/index.mjs` exporta una sola operación mutante estable: `runNexoChronicleAppend`; las consultas de Continuity son de lectura.
- `src/nexo/application/chronicle-append.mjs` crea un deadline monotónico único y lo comparte entre Continuity, Chronicle y el owner.
- `scripts/nexo-chronicle-session.mjs` delega en la API de aplicación y emite metadata sanitizada de timeout.
- `src/nexo/core/owner-backed-runtime.mjs` bloquea acciones de reparación con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` antes de PREPARED en el runtime canónico.
- `scripts/nexo-repair-session.mjs` y `scripts/nexo-repair-entrypoint.mjs` forman una ruta separada que recibe owner/store por inyección. No deben confundirse con la API pública Chronicle ni considerarse cubiertas por su deadline compartido.
- `tests/nexo/repair-settlement-crash-cuts.test.mjs` prueba que la ruta de reparación conserva PREPARED y bloquea la finalización cuando falta el contrato de settlement. Esto no autoriza activar la ruta ni demuestra cobertura de deadline en ella.
- La auditoría de entrypoints está registrada en `NCS_M0_LOCK_DEADLINE_CALLER_MAP_2026-10-20.md`.

## Regla operativa provisional y fail-closed

1. Mantener la ruta de reparación inyectada fuera del contrato interactivo estable; no añadirla a `src/nexo/application/index.mjs` ni delegar desde Chronicle.
2. No declarar la ruta de reparación “cubierta por deadline”: hoy no se ha demostrado un único deadline compartido de principio a fin en esa ruta.
3. Si posteriormente se solicita habilitarla, primero especificar y propagar un deadline absoluto monotónico único por toda la operación (PREPARED, dispatch, lineage, observación/settlement y resultado terminal), y añadir pruebas de timeout/no-dispatch/no-redispatch. Ejecutar CI exacto antes de cambiar su estado.
4. No alterar la ruta Chronicle soportada ni añadir un framework general de cancelación, lease, heartbeat, watchdog o reclaim automático como parte de esta frontera.

## Evidencia CI de la ruta activa

SHA de código/tests: `12efac26d0948b91c59706612edec7df9e78c4f5`.

- [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332936) — success
- [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332981) — success
- [Deterministic persistence](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376333167) — success
- [Repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376333016) — success
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332991) — success
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376333035) — success

No se afirma un workflow de mission-admission/restart para ese SHA: no apareció en la consulta de runs exactos.

## Límite de la conclusión

Esto cierra el inventario de callers para el alcance de la API estable actual; no cierra M0 global, no demuestra raíz legítima ni autoriza efectos protegidos.

- M0: `INCOMPLETO`
- `authorization: NOT_EVALUATED`
- Efectos protegidos: `STOP`
- Raíz legítima: `PENDING/UNKNOWN`

## Próximo paso

Continuar el siguiente bloqueo M0 desde `NEXO_NCS/STATUS.md`, sin volver a auditar los internals de adquisición del lock ya cubiertos. La ruta de reparación permanece fuera del alcance activo hasta que exista una necesidad explícita y su contrato de deadline/settlement esté probado.
