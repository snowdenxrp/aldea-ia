# NCS M0 — revisión de compatibilidad de forma de misión persistida
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
Alcance: revisión estática focal de `src/nexo/core/continuity-contract.mjs`, `src/nexo/core/continuity-snapshot.mjs`, `src/nexo/core/continuity-operations.mjs` y `tests/nexo/continuity-contract.test.mjs`.

## Pregunta
¿La tolerancia a registros de misión persistidos sin un array `steps` es un fallo confirmado o compatibilidad histórica intencional?

## Evidencia observada
1. En `assertNexoContinuityMemoryShape()`, el validador comprueba que `memory.nexo.missions` sea una colección densa, pero para cada misión hace `if (!Array.isArray(mission?.steps)) continue;`. Por tanto, un registro de misión sin `steps` no recibe validación del grafo.
2. En `reconstructNexoMissionFromSnapshot()`, la proyección usa `steps: structuredClone(Array.isArray(plan.steps) ? plan.steps : [])`. Una misión así se reconstruye con cero pasos, en vez de fallar por forma desconocida.
3. La ruta de admisión nueva, `missionRecord()`, exige `Array.isArray(mission.steps)`; por ello, la tolerancia descrita pertenece a datos ya persistidos/legacy, no a la admisión de misión nueva.
4. Si un registro `prepared` del `effectJournal` depende de un paso ausente, el validador sí rechaza la memoria con `NEXO_RECOVERY_CONTEXT_MISSING`. Esto evita que esa obligación PREPARED se valide como correctamente enlazada.
5. No se encontró en el alcance leído una regla versionada que defina si toda misión legacy debe contener `steps` o si la forma incompleta se acepta expresamente para lectura histórica.

## Conclusión
**Compatibilidad contractual ambigua; no vulnerabilidad confirmada.** La diferencia entre admisión estricta y lectura tolerante está demostrada estáticamente. No hay evidencia suficiente para decidir que la tolerancia sea accidental ni para endurecer el runtime sin riesgo de romper snapshots históricos.

## Decisión técnica segura
- No cambiar runtime ni elevar a PASS/FAIL de seguridad por inferencia.
- No añadir una prueba que congele la tolerancia legacy como requisito normativo antes de localizar el contrato de migración/versionado.
- Próxima comprobación de bajo riesgo: rastrear el productor/migrador de misiones legacy y los fixtures de snapshots históricos; determinar si el contrato define versión y forma mínima de cada misión. Si no existe tal contrato, proponer un cambio mínimo de contrato con pruebas diferenciando datos legacy reconocidos de forma desconocida, sin migración implícita.
- La suite CI del SHA `594cee05c61617b38cc6481698643215e9da9ae2` sigue **NO VERIFICADA en esta revisión**; consulta de estados no devolvió checks asociados. No afirmar PASS.

## Estado global
M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Este análisis no autentica autoridad ni habilita efectos.
