# NCS M0 — Factibilidad de opción C: exclusión de escritores y durabilidad (2026-10-26)

## Estado
- Tipo: análisis documental de factibilidad.
- Runtime/tests/workflows: sin cambios.
- Tests/CI: no ejecutados.
- Decisión de implementación: ninguna; este documento no autoriza cambios de runtime.

## Pregunta
¿Puede la arquitectura observada demostrar hoy que una exclusión de escritores y un contrato de durabilidad bastan para resolver un resultado `COMMIT.UNKNOWN` como `SAFE_COMMIT`?

## Evidencia acotada de la rama `ncs-clean-architecture`
1. `scripts/simulate.mjs` implementa `persistState()` con bloqueo de directorio, comprobación de `expectedRevision` bajo ese bloqueo, escritura de archivo temporal, `rename()` y liberación del bloqueo.
2. La garantía de coordinación está condicionada a que los escritores participantes respeten el mismo bloqueo y contrato. El bloqueo comienza dentro de `persistState()`; no es una barrera global de ejecución ni prueba que no existan otros escritores.
3. `scripts/assistants.mjs` también carga un snapshot, realiza trabajo y después invoca `persistState()`. El hecho de compartir la primitiva no demuestra exclusión universal de todos los actores capaces de escribir o relanzar procesos.
4. La auditoría P112 existente ya distingue el bloqueo de persistencia de una barrera de ejecución y señala que no se demuestra `fsync`/sincronización del archivo temporal ni de directorio después de `rename()`. Referencia: [P112 — Persistence Primitive Crash-Cut Audit](../../NEXO_CONTINUITY/P112_PERSISTENCE_PRIMITIVE_CRASH_CUT_AUDIT_V1_2026-10-07.md).
5. La auditoría P112 sobre durabilidad también distingue recuperabilidad lógica de durabilidad física: un marcador lógico escrito por la ruta actual no prueba supervivencia a una pérdida de energía. Referencia: [P112 — Local Journal vs Storage Durability](../../NEXO_CONTINUITY/P112_LOCAL_JOURNAL_VS_STORAGE_DURABILITY_AUDIT_V1_2026-10-07.md).
6. En `src/nexo/core/protected-transition.mjs`, `COMMIT.UNKNOWN` se clasifica como `RECONCILE_REQUIRED`; el flujo inspeccionado no llama al puerto de reconciliación. `src/nexo/core/reconciliation.mjs` permanece fail-closed y devuelve `UNRESOLVED` para casos válidos.

## Resultado de factibilidad
**Opción C no es suficiente con la evidencia actual.** La implementación observada demuestra coordinación de persistencia para escritores cooperantes, no una exclusión de extremo a extremo de todos los writers ni una garantía de durabilidad que cubra todos los cortes de fallo.

Esto no demuestra que C sea imposible en principio. Significa que no puede utilizarse como premisa para promover ahora un resultado ambiguo a `SAFE_COMMIT`.

## Política conservadora recomendada — aún no ratificada
- Mantener `COMMIT.UNKNOWN → RECONCILE_REQUIRED`.
- Mantener la reconciliación automática sin resolver (`UNRESOLVED`) hasta que exista evidencia independiente que cumpla un contrato ratificado.
- Si el contrato de producto no exige resolver automáticamente el caso, preferir conservarlo como no resuelto y requerir intervención explícita, en vez de introducir un mecanismo durable nuevo por inferencia.
- No tratar igualdad de snapshot, revisión incremental, lock local o retorno de `rename()` como prueba causal o garantía universal de durabilidad.
- No añadir journal, identificadores de operación, fencing, retries, colas, tombstones ni cambios de runtime como parte de este análisis.
- No iniciar integración de reconciliación sin autorización acotada y contrato de evidencia ratificado.

## Qué queda por decidir
1. ¿El producto exige resolución automática de `COMMIT.UNKNOWN`, o acepta mantenerlo no resuelto hasta intervención explícita?
2. ¿Qué modelo de fallo debe cubrir el contrato: fallo de proceso, caída del sistema operativo o pérdida de energía?
3. ¿Qué evidencia independiente y verificable puede satisfacer la correspondencia causal si el contrato actual no basta?

## Gates
- M0: `INCOMPLETO`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Reconciliación: `DISEÑO PENDIENTE`, no integrada.
- Causa primaria exacta del run CI histórico `40270739196`: `UNKNOWN`.
