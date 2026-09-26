# AB104.214 — End-to-end effect path audit: durability, uncertainty loss, bounded journals
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR ARQUITECTURA

## Objetivo
Trazar el camino real del prototipo desde orchestrator → runtime → effect-adapter → simulation-adapter → memory/recovery y localizar dónde la evidencia de un efecto puede perderse o permitir una repetición.

## Evidencia de código inspeccionada
- src/nexo/orchestrator.js
- src/nexo/runtime.js
- src/nexo/effect-adapter.js
- src/nexo/simulation-adapter.js
- src/assistants/memory.js
- tests/nexo/effect-adapter.test.mjs
- tests/nexo/effect-intent-persistence.test.mjs
- tests/nexo/restart-reconstruction.test.mjs

## Flujo observado
1. orchestrator crea una misión y pasos; un paso comienza en planned.
2. runtime.beginNexoStep lo lleva a executing.
3. runtime construye idempotencyKey = missionId:stepId y llama adapter.execute().
4. effect-adapter registra primero un journal prepared cuando hay executionJournal; opcionalmente llama persistPreparedIntent antes del handler.
5. simulation-adapter ejecuta el handler. En Lúmina, el handler puede mutar simulation y luego incrementar nexoEffectRevision.
6. effect-adapter valida resultado/postcondition y persiste un resultado terminal en executionJournal.
7. runtime registra por separado execution y outcome en memory.
8. reconstruction de misión usa outcomes; una entrada execution-only no convierte el paso en completed.

## Hallazgo positivo
El diseño actual evita una repetición obvia cuando existe una entrada prepared: recovery exige reconcile() y no ejecuta directamente el handler. Esto está probado en effect-adapter.test.mjs. También existe un caso de excepción EFFECT_OUTCOME_UNKNOWN que conserva la incertidumbre hasta reconciliación.

## Hallazgo crítico: journal acotado puede borrar evidencia de incertidumbre
El journal NO es actualmente durable ni ilimitado por sí mismo. En effect-adapter.js, persist() y recordIntent() recortan el journal a los últimos 200 elementos. En memory.js, createLearningMemory() también reduce nexo.effectJournal a los últimos 200.

Consecuencia: si un efecto antiguo sigue en estado prepared/UNKNOWN y se superan 200 entradas, el sistema puede descartar físicamente esa evidencia. Si después recovery recibe el mismo operation/idempotency key y el journal ya no contiene la entrada, executeFresh() puede tratarlo como una operación nueva y llegar al handler. Eso rompe la propiedad investigada en AB104.197: CommitRecord/evidence no equivale a permiso para repetir.

Esto es un defecto concreto del prototipo, no una afirmación sobre la futura arquitectura Nexo.

## Segundo hallazgo: memory y effect journal tienen roles mezclados
recordNexoExecution() guarda un resultado de ejecución separado del effectJournal; recordNexoOutcome() guarda el outcome de misión. Un recovery que consulte solo mission outcome puede ver planned, aunque el effect journal tenga evidencia de prepared/completed. Eso es conservador, pero deja pendiente una fuente de verdad explícita para efectos externos.

## Tercer hallazgo: idempotencyKey actual es local a misión/paso
Se deriva de missionId:stepId. Para el prototipo sirve como clave de repetición local, pero no es todavía una identidad de efecto externo suficientemente fuerte para Nexo: no incluye target incarnation, authority epoch/root ni payload fingerprint.

## Cuarto hallazgo: stateVersion no equivale a external commit evidence
simulation-adapter.js usa nexoEffectRevision para detectar cambios de estado y postconditions. Es evidencia útil dentro de la simulación, pero no demuestra por sí misma qué ocurrió en un boundary externo ni ofrece anti-rollback/anti-clone.

## Quinto hallazgo: prepared-intent persistence es opcional
Si persistPreparedIntent falla, adapter devuelve EFFECT_INTENT_PERSISTENCE_FAILED. No existe garantía de que una fuente externa durable haya registrado el intento. La seguridad de recuperación no debe depender de memoria en proceso.

## Cobertura de pruebas observada
Los tests cubren precondition failure, postcondition failure, idempotencia local, concurrencia con journal compartido, partial effect, excepción/UNKNOWN, prepared → reconcile → completed, reconciliación inválida/bloqueada, persistencia preparada antes del handler y restart reconstruction donde execution-only NO equivale a completion.

No se observa en estos tests: truncamiento/evicción de un prepared/UNKNOWN antiguo; crash real entre mutación externa y persistencia del resultado; restore a snapshot anterior; cambio de target incarnation; authority epoch/root; payload fingerprint collision; reconciliación negativa autoritativa; efecto externo parcialmente completado con múltiples sub-effects; fencing entre recoverers de procesos/dispositivos.

## Investigación externa
La documentación de AWS Durable Execution distingue semánticas at-least-once y at-most-once por retry, y advierte que replay/retry puede volver a ejecutar operaciones con efectos laterales. El patrón Transactional Outbox documenta que un relay puede publicar dos veces si muere después de publicar y antes de registrar la publicación. Esto refuerza que la defensa contra repetición necesita identidad, durabilidad y semántica real del destino. citeturn0search5turn0search0

## Clasificación actual
- DURABILITY OF EFFECT EVIDENCE: PARCIAL
- UNKNOWN PRESERVATION: PARCIAL; existe localmente, pero puede ser evicted.
- RE-EXECUTION DEFENSE: PARCIAL; fuerte mientras exista la entrada preparada/resultado y la clave siga siendo reconocible.
- EXTERNAL COMMIT PROOF: NO ESTABLECIDO
- ANTI-ROLLBACK: NO ESTABLECIDO
- TARGET INCARNATION: NO REPRESENTADO
- AUTHORITY EPOCH/ROOT: NO REPRESENTADO
- PAYLOAD FINGERPRINT: NO REPRESENTADO
- FORMAL VERIFICATION: NO REALIZADA
- ARCHITECTURE DESIGN: NO INICIADA

## Nueva regla de continuidad
Un journal de efectos no puede tener una política de retención que pueda eliminar evidencia de un efecto UNKNOWN/PREPARED sin una transición explícita y verificable a una clase histórica que conserve la capacidad de evitar replay.

## Próximo AB104.215
Investigar la semántica correcta de retención/archivado de prepared, UNKNOWN, completed, failed y blocked: qué estados pueden compactarse, cuáles deben conservarse hasta un horizonte externo, cómo hacer archival sin perder anti-replay, y cómo recovery debe distinguir un registro archivado de un registro inexistente. Mantener investigación externa + estudio de código.