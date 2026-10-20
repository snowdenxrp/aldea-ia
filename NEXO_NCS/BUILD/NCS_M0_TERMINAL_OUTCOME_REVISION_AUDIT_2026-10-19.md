# NCS M0 — auditoría acotada de settlement y resultado terminal

**Fecha:** 2026-10-19  
**Rama de trabajo:** `ncs-clean-architecture`  
**Estado:** revisión estática acotada; sin cambios de runtime en esta nota.

## Alcance y evidencia inspeccionada

Se siguió la continuidad desde el checkpoint de PREPARED/lineage y se inspeccionaron, en la referencia actual de la rama:

- `src/nexo/core/owner-backed-runtime.mjs` — blob observado `e5b956ea5394387708535106c2dcee8de70bf2fe`.
- `src/nexo/core/continuity-owner.mjs` — blob observado `10d4dae7c601023ffc00587f704434be67a8092b`.
- `src/nexo/core/chronicle-settlement-contract.mjs` — blob observado `4d04930cbf67b5943916cc497dd44b14c87e27bd`.
- `src/nexo/adapters/chronicle-observation.mjs` — blob observado `e052ce5018984989eeddb3e26498e68892493610`.
- `tests/nexo/chronicle-runtime.test.mjs` — blob observado `873d38bf7fd19b8c90ec5e48c9fbfec87ffe0777`.

Los identificadores anteriores son SHA de blobs, no SHAs de commit. Esta inspección no sustituye CI ni una prueba local.

## Resultado estático

1. **PREPARED y lineage mantienen guardas de revisión:** el runtime exige una confirmación de PREPARED con revisión sucesora exacta antes del dispatch. Después del posible efecto, lineage debe confirmar exactamente la revisión siguiente. Una respuesta ausente o inconsistente queda como UNKNOWN; no se reconcilia ni se autoriza redispatch.
2. **El resultado terminal exige recibo de revisión:** `recordChronicleTerminalOutcome()` sólo devuelve `completed` cuando `recordOutcome()` devuelve `committed` con revisión exactamente `expectedRevision + 1`, o `already_recorded` con la misma revisión esperada. Una respuesta sin revisión válida queda UNKNOWN.
3. **El owner impone settlement estructural:** `recordOutcome()` para `chronicle_append/completed` exige exactamente una entrada de journal con identidad coincidente y un settlement que satisfaga `isValidNexoChronicleSettlementRecord()`; además compara la evidencia terminal con ese settlement. El store no convierte por sí solo una respuesta de adaptador en settlement.
4. **El lector Chronicle reabre el store y verifica el contenido persistido:** `observeChronicleOperation()` devuelve applied sólo si encuentra exactamente una entrada con la clave de operación y el contenido esperado; ausencia es not_applied y discrepancia/duplicidad es UNKNOWN.

## Límite que permanece abierto

Las comprobaciones de settlement son **consistencia estructural y observación del estado persistido**, no autenticación criptográfica, atribución causal, garantía de durabilidad ante pérdida de energía ni autoridad constitucional. El propio contrato documenta ese límite. No se debe interpretar `verified: true` como prueba de una raíz legítima o como autorización de efectos protegidos.

Permanece pendiente la frontera de confianza del adaptador PREPARED descrita en `NEXO_NCS/BUILD/NCS_M0_CANONICAL_PREPARED_RECEIPT_TRUST_BOUNDARY_AUDIT_2026-10-19.md`: un objeto ordinario con campos válidos acredita forma, no procedencia. Antes de cambiar código, debe mantenerse explícito el modelo de confianza del proceso y no fingir que otro booleano/campo convierte el recibo en una capacidad no falsificable.

## CI y próximo paso

- La evidencia focal previa sigue anclada al SHA de código `48114cd275b98cbbf3142bb242f90d0c5c543d0a`: aceptación M0 integrada run `39335842717` SUCCESS y Chronicle native run `39335842965` SUCCESS. Sus jobs confirmados terminaron SUCCESS.
- **No se afirma que `npm test` completo haya pasado.** El workflow `.github/workflows/nexo-deterministic-tests.yml` ejecuta `npm install` y `npm test` en push a `ncs-clean-architecture`; la ejecución de suite completa sobre el commit que incluya esta nota debe verificarse por separado y asociarse a su SHA exacto.
- Siguiente frontera M0: resolver con la mínima decisión arquitectónica explícita el contrato de confianza entre runtime owner-backed y adaptador; luego validar el cambio mediante regresión que rechace recibo fabricado y conserve el camino owner-backed válido. No añadir colas, reintentos, tombstones, segundo journal ni wrappers transaccionales incidentales.

## Estado constitucional

**M0 INCOMPLETO · authorization NOT_EVALUATED · protected effects STOP · legitimate owner root PENDING/UNKNOWN.**
