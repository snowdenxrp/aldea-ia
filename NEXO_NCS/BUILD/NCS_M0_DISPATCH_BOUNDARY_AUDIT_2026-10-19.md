# NCS M0 — auditoría de frontera de despacho del runtime

Fecha: 2026-10-19  
Tipo: revisión estática read-only; no modifica runtime ni autoriza nuevas capacidades.

## 1. Pregunta

¿Puede el runtime owner-backed actual despachar una acción de reparación u otra acción arbitraria solo porque el caller registra un handler/verifier?

## 2. Resultado observado

En `src/nexo/core/owner-backed-runtime.mjs`:

1. El runtime carga continuidad canónica y reconstruye la misión/paso.
2. Rechaza las tres acciones de reparación conocidas (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`) antes de PREPARED y antes de llamar al adapter, con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`.
3. Rechaza cualquier acción distinta de `chronicle_append` con `NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED`, aunque el caller haya registrado un handler/verifier.
4. Para Chronicle, exige una misión/paso canónico ejecutable, confirma PREPARED antes del dispatch y no redispatcha si existe una obligación previa sin resolver.
5. Si el adapter lanza una excepción, el resultado se trata como incertidumbre: el efecto pudo ocurrir. El runtime no autoriza redispatch.
6. El runtime registra lineage por separado; no lo confunde con settlement.
7. La reconciliación de Chronicle debe devolver evidencia compatible con la observación específica de Chronicle; el resultado terminal exige settlement persistido y evidencia de outcome vinculada.
8. El serializer de la API pública `publicChronicleResult()` usa una lista permitida, valida estados/campos de resultado y fuerza `redispatchAuthorized=false`.

## 3. Fronteras y límites

- Esta conclusión aplica al runtime owner-backed y a la API de aplicación actual. No demuestra que todos los entrypoints legacy de la simulación estén desconectados; esa es una auditoría distinta y no debe resolverse habilitando el runtime por defecto.
- La restricción por nombre de acción no sustituye autorización constitucional ni legitimidad de propietario.
- El store local no reclama fsync/power-loss durability, protección contra rollback, resistencia a manipulación de rutas ni transacción atómica entre Chronicle y Continuity.
- `effectVerifiers` es configuración de confianza suministrada al crear el owner; no se debe convertir en registro dinámico controlado por una operación ni interpretar su mera presencia como autorización.
- Las observaciones genéricas quedan `reconciled_observed`, con causalidad no establecida y sin autorización de redispatch. Las reparaciones permanecen en su contrato específico no conectado al runtime.

## 4. Evidencia de pruebas registrada en el contrato de aplicación

El contrato `NEXO_NCS/BUILD/NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md` identifica:
- `tests/nexo/chronicle-runtime.test.mjs`: cortes de PREPARED, excepciones del adapter, conflictos, pérdida de respuesta de reconciliación/outcome y no divulgación.
- `tests/nexo/entrypoint.test.mjs`: replay/reinicio y preservación de PREPARED.
- SHA de prueba focal `274af889dfcfe8457af005f5ee126d012b1b6555` con los cuatro workflows focales citados en el contrato; SHA de código/test `42f0e12640a35bc1e7b524501f8dbe879a311d90` con workflows focales exitosos para validación de esquema del resultado público.
- Esta revisión no volvió a ejecutar esos workflows. No se afirma CI nuevo para el commit documental de esta nota.

## 5. Decisión

La frontera actual es deliberadamente estrecha: solo `chronicle_append` tiene un camino mutante owner-backed documentado; las reparaciones y las demás acciones permanecen bloqueadas antes de dispatch. No se encontró una justificación para ampliar el registro de acciones ni conectar el observador de reparaciones al runtime.

Siguiente frontera de auditoría: inventariar entrypoints de aplicación/CLI/legacy y demostrar cuáles son accesibles por defecto, sin cambiar el runtime ni `index.html`. Antes de cualquier cutover debe existir una decisión explícita y evidencia verificable de desconexión o aislamiento de rutas legacy.

## 6. Estado

Revisión estática completada; no hay cambios de runtime ni tests nuevos. M0 INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados.
