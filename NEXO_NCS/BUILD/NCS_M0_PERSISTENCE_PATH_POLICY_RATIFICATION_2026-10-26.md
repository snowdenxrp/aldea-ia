# NCS M0 — Ratificación de política de rutas de persistencia (2026-10-26)

## Decisión del owner

El owner ratificó la opción B en la conversación del 2026-10-26: “Entonces B, continúa sin límites!”. Esta ratificación selecciona la política de rutas descrita abajo; no constituye por sí sola autorización para modificar runtime/tests ni ejecutar CI, porque el gate canónico D1-IMPLEMENTATION permanece `NO AUTORIZADA` hasta autorización explícita.

## Contrato ratificado

1. `persistState()` acepta una cadena de ruta nativa o una URL `file:`.
2. Normaliza la entrada una sola vez a una ruta nativa absoluta.
3. Rechaza entradas vacías, tipos no admitidos, esquemas distintos de `file:` y rutas relativas.
4. Usa la misma ruta normalizada para lectura, revisión, lock, temporal, escritura, `rename` y limpieza.
5. `createPersistStateConditionalCommit()` conserva por ahora su contrato de entrada string-only.
6. No se amplía la política de symlinks ni de errores secundarios fuera del alcance mínimo sin decisión y pruebas específicas.
7. `COMMIT.UNKNOWN` nunca se transforma en `SAFE_COMMIT` por inferencia; se conserva `RECONCILE_REQUIRED` cuando el resultado durable no está demostrado.

## Evidencia y límites

- Fallo CI conocido: run `40270739196`, job `121402789784`; `tests/nexo/conditional-commit-persist-state.test.mjs:88:10` obtuvo `RECONCILE_REQUIRED` donde esperaba `SAFE_COMMIT`.
- La incompatibilidad estática entre URL `file:` y cadena nativa está confirmada; la causa raíz exacta del fallo CI sigue `UNKNOWN`.
- El registro de reparación previo: [NCS_M0_PERSISTENCE_REPAIR_DECISION_REGISTER_2026-10-26.md](NCS_M0_PERSISTENCE_REPAIR_DECISION_REGISTER_2026-10-26.md).
- Este commit modifica solo documentación. No se modifican runtime, tests ni workflows; no se ejecuta CI.

## Estado de gates

M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; autoridad raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

## Próximo paso

Solicitar autorización explícita para implementar el contrato ratificado, añadir únicamente las pruebas de tipo/ruta que falten tras revisar la cobertura existente, reproducir el test aislado y ejecutar CI. No relajar aserciones para ocultar el fallo.
