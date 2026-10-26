# NCS M0 — Decisión pendiente: prueba de correspondencia causal en reconciliación (2026-10-26)

## Propósito

Registrar el bloqueo concreto que impide integrar la reconciliación de `COMMIT.UNKNOWN` sin convertir observaciones ambiguas en una afirmación de éxito.

## Evidencia de lectura estática

Archivos inspeccionados en `ncs-clean-architecture`:

- `src/nexo/core/protected-transition.mjs` — el resultado `COMMIT.UNKNOWN` se clasifica como `RECONCILE_REQUIRED`; el puerto `reconciliation.reconcile()` no se invoca en el flujo inspeccionado.
- `src/nexo/adapters/conditional-commit-persist-state.mjs` — `persistState` retorna `COMMITTED` si la promesa resuelve; ante errores que no sean `STATE_REVISION_CONFLICT`, retorna `UNKNOWN` con código estable.
- `src/nexo/core/reconciliation.mjs` — el reconciliador valida las formas de entrada y devuelve `UNRESOLVED`; no dispone de un verificador independiente conectado.
- `scripts/simulate.mjs` — la persistencia usa una revisión condicional, serializa el snapshot y reemplaza el destino con `rename`; el payload incluye revisión y estado, pero no se ha demostrado que contenga un recibo autenticado de la transición concreta.
- `tests/nexo/conditional-commit-persist-state.test.mjs` — prueba la ruta real y la clasificación conservadora de resultados desconocidos; no demuestra resolución causal después de una escritura ambigua.

## Conclusión acotada

**Con el contrato y las conexiones inspeccionados no hay base suficiente para resolver un outcome incierto como `SAFE_COMMIT` mediante revisión o lectura de snapshot solamente.**

Esto no demuestra que sea imposible diseñar una prueba suficiente. Demuestra que la prueba no está definida ni conectada en la implementación observada.

La igualdad del contenido también debe tratarse con cuidado: un estado equivalente puede ser producido por otra transición o writer. No es correspondencia causal por sí sola. Una revisión incremental es útil para detectar divergencias, pero no identifica necesariamente quién produjo el snapshot.

## Opciones de diseño — no ratificadas

| Opción | Qué podría demostrar | Límite / condición |
|---|---|---|
| A. Solo lectura posterior + revisión | Integridad estructural y versión observada | No prueba causalidad; insuficiente para promover a `SAFE_COMMIT` |
| B. Comparar el snapshot con el estado candidato | Compatibilidad del contenido observado con la candidata | Una transición distinta puede producir el mismo contenido; no prueba autoría |
| C. Probar una exclusión de escritores y un contrato de durabilidad más fuerte | Podría acotar las causas alternativas si la exclusión es real y demostrable | No se ha demostrado una garantía de exclusión de extremo a extremo que resuelva la incertidumbre tras todos los fallos |
| D. Añadir una prueba durable de correlación autenticada | Puede vincular la observación con una operación concreta si se define correctamente | Introduce un mecanismo/contrato nuevo; requiere decisión explícita y evaluación de coste, persistencia, concurrencia y recuperación |

Estas opciones no son una autorización para implementar A, B, C o D. No se elige ninguna en este documento.

## Preguntas que bloquean la implementación

1. ¿El contrato debe poder resolver `COMMIT.UNKNOWN` a `SAFE_COMMIT`, o basta con preservar `RECONCILE_REQUIRED` hasta una intervención explícita?
2. ¿Qué garantía concreta de durabilidad y exclusión de escritores puede probarse para el destino de persistencia?
3. ¿Es requisito del producto identificar causalmente cada transición, y qué coste de estado persistente adicional se acepta si el contrato actual no basta?
4. ¿Qué componente independiente valida la evidencia y cómo se evita que la fabrique el mismo llamador que solicita la resolución?
5. ¿Qué información de diagnóstico puede exponerse sin filtrar rutas, mensajes arbitrarios ni datos del snapshot?

## Recomendación técnica provisional

Hasta resolver las preguntas anteriores:

- Mantener `COMMIT.UNKNOWN → RECONCILE_REQUIRED` sin promoción automática.
- Mantener `createReconciler()` fail-closed y sin capacidades de commit.
- No conectar el puerto de reconciliación al flujo de transición.
- No añadir identificadores de operación, journal, cola, retries, tombstones ni fencing por intuición.
- Conservar códigos estables de error como diagnóstico interno tipado solo tras definir una forma segura de salida; no cambiar runtime como parte de este memo.
- Si se autoriza trabajo adicional, empezar por una especificación de contrato y pruebas de aceptación, no por una implementación de recuperación.

## Clasificación de estado

- Tipo de cambio: documentación solamente.
- Runtime/tests/workflows: sin cambios.
- Tests/CI: no ejecutados.
- Causa primaria del run histórico `40270739196`: `UNKNOWN`.
- M0: `INCOMPLETO`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Reconciliación de commit incierto: `DISEÑO PENDIENTE`, no integrada.
