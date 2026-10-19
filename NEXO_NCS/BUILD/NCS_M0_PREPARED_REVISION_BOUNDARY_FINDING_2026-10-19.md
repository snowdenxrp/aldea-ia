# NCS M0 — revisión de la frontera PREPARED y storeRevision

**Fecha:** 2026-10-19  
**Tipo de evidencia:** inspección estática de blobs; no se ejecutaron pruebas.

## Hallazgo

Archivos revisados en la rama `ncs-clean-architecture`:

- `src/nexo/core/owner-backed-runtime.mjs`, blob `ca738c3e42cefbdd6576770ac0296dd7e3ac8966`.
- `src/nexo/effect-adapter.js`, blob `efe00f7f0bd3586266209fb17e2eb725a6522463`.
- `tests/nexo/chronicle-runtime.test.mjs`, blob `1fcb816f14565fb5630f8bc32d175c513732119b`.

El runtime owner-backed acepta como confirmación suficiente de PREPARED únicamente `status === "committed"` y `preparedCommitted === true`. No valida `storeRevision` antes de poner `_executionState.dispatchAttempted = true` y llamar `adapter.executePrepared(...)`.

El adaptador sí valida que `storeRevision` sea un entero seguro no negativo. Si falta o es inválida, devuelve `blocked / EFFECT_CANONICAL_PREPARE_CONFIRMATION_REQUIRED` sin llamar a `executeFresh()`. Sin embargo, el runtime continúa posteriormente a `owner.recordExecutionLineage()` con `expectedRevision: prepared.storeRevision` y, si la respuesta de lineage es `committed`, a reconciliación. Esto mezcla una respuesta PREPARED estructuralmente inválida con la ruta posterior al intento de despacho y puede reportar `dispatchAttempted: true` aunque el handler no se haya invocado.

## Alcance

- Hallazgo de contrato/estado de ejecución, no prueba de efecto externo no autorizado.
- No demuestra acceso remoto, un bypass de autoridad del propietario ni ejecución del handler en los casos de revisión inválida.
- La API del adaptador es interna dentro de la base de confianza actual; esta nota no cambia la decisión de amenaza sobre recibos fabricados.
- Autoridad sigue `NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.

## Corrección mínima propuesta para revisión

Antes de cruzar la frontera de invocación del adaptador, validar que `prepared.storeRevision` sea `Number.isSafeInteger(...)` y `>= 0`. Si la respuesta no satisface el contrato completo, devolver un resultado bloqueado con `dispatchAttempted: false`, sin invocar el adaptador, lineage ni reconciliación. Añadir regresiones con contador del handler para revisión ausente, negativa, fraccionaria y no segura; mantener los casos de status/flag malformados y los casos de resultado ambiguo posterior al efecto.

No aplicar esta corrección ni declarar PASS hasta que el cambio de código y las pruebas puedan escribirse, ejecutarse y verificarse en el SHA exacto.
