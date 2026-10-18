# NCS — HANDOFF PARA NUEVO CHAT — MISIÓN M0
Fecha: 2026-10-18
Repo: https://github.com/snowdenxrp/aldea-ia
Rama: `ncs-clean-architecture`

## Entrada
El usuario abrirá el nuevo chat con la palabra exacta `NCS`. Leer primero este documento y `NEXO_NCS/STATUS.md`. Continuar desde aquí, sin repetir auditorías cerradas ni pedir que el usuario repita contexto. La misión es M0: construir la base propia de Nexo. No desviarse a M1, Lúmina o STEP 7.

## Misión M0
Crear continuidad operativa de Nexo propia, recuperable, validada y separada de Lúmina. No declarar M0 terminado hasta probar con CI en HEAD exacto: migración de continuidad, validación de datos, reconstrucción tras reinicio, recuperación de PREPARED/cortes de fallo, runtime de Nexo conectado a su propio almacén y ausencia de efectos duplicados o finalizaciones falsas.

## Arquitectura no negociable
- Nexo y Lúmina son sistemas separados. La memoria operativa de Nexo no se serializa dentro del estado de simulación de Lúmina.
- El almacén de continuidad de Nexo y `world-state.json` son dos almacenes diferentes; atomicidad transversal NO está demostrada.
- `storeRevision` (Nexo) y `stateRevision` (Lúmina) son dominios diferentes.
- `settled_observed` solo significa que se observó una invariante en un snapshot persistido. No es `completed`, no demuestra causalidad y no autoriza efectos protegidos.
- Un resultado caller-provided `verified: true` no es evidencia autenticada.
- PREPARED desconocido no se redispara a ciegas. Revisiones ausentes, contradictorias, datos corruptos o evidencia incompleta => BLOCKED/UNKNOWN, nunca PASS supuesto.
- No introducir colas, IDs globales, retries, tombstones o transacciones genéricas sin necesidad demostrada.
- No cambiar el runtime ni retirar memoria heredada antes de probar reinicio, cortes, regresiones y rollback/diagnóstico.
- No reabrir AB/P cerrados salvo contradicción nueva: AB104.759R (no .862R), AB104.999R→AB105.000R, AB104.151, P112 activo; AB105.116R protegido, TLC congelado, G0 W1/D1 UNKNOWN, P34 cerrado, P35 load-failure/fallback/persistState.

## Estado técnico confirmado
Archivos clave:
- `src/nexo/core/continuity-store.mjs`: almacén propio, `storeRevision`, CAS mediante `commitIfCurrent`.
- `src/nexo/core/continuity-owner.mjs`: propietario de continuidad, reconstrucción y lineage.
- `src/nexo/core/continuity-operations.mjs`: reconstrucción; `settled_observed` queda bloqueado, objetivo `verify_observed_repair_goal`, siguiente `verify_mission_goal_without_redispatch`.
- `scripts/nexo-continuity.mjs`: apertura del owner.
- `scripts/nexo-repair-preparation.mjs`: enlaza PREPARED a una revisión cargada estrictamente del entorno.
- `scripts/nexo-repair-dispatch.mjs`: reparaciones convergentes con comprobación de revisión y persistencia condicional.
- `scripts/nexo-repair-settlement.mjs`: observación limitada; marca `settled_observed`, causalidad `not_claimed`.
- `scripts/nexo-repair-mission-verification.mjs`: lectura diagnóstica de objetivo, no finalización durable.
- Tests: `tests/nexo/continuity-migration.test.mjs`, `tests/nexo/simulation-restart-persistence.test.mjs`, `tests/nexo/repair-settlement-crash-cuts.test.mjs`.

## Cambios recientes
1. `recordExecutionLineage()` no liquida PREPARED, aunque el caller indique completed/verified. Requiere una única obligación PREPARED coincidente en clave idempotente, misión, paso, acción y target. Owner commit `71b2db0b83e190f9f6d13c765a4e1bc85857903d`; test `9971058e2477aa458e6afebdb240f4a52b3b2401`.
2. Para las tres reparaciones, lineage exige que la revisión de entorno del resultado coincida con la revisión durable de PREPARED. Revisión ausente => `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`; mismatch => `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`. Owner `291d482a2f1e03294c519bb8971fcce0b1c69176`; test mismatch `4667d3b3cbe4a587c6e53118961437b2db733958`; test ausente+mismatch `12452f8d851c646d3cb7674cd0f59d7ba1246fe1`.
3. CI detectó que un test calculaba stateRevision desde `applyState()`, que no conserva metadata de persistencia. Se corrigió usando el snapshot estricto fuente: `ea1a8390c2826021feab46f3197c84a1a4f47039`.
4. La revisión de una ejecución se registra como lineage, no settlement. PREPARED permanece abierto hasta reconciliación específica con evidencia.

## CI verificada
En el HEAD de código/test `12452f8d851c646d3cb7674cd0f59d7ba1246fe1`:
- [Mission/restart continuity, run 39139024311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024311). Job confirma éxito de `simulation-restart-persistence.test.mjs` y `continuity-migration.test.mjs`.
- [STEP 5, run 39139024315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024315).
- [STEP 4, run 39139024377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024377).
- [Repair settlement crash cuts, run 39138771613](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138771613), sobre owner code `291d482a2f1e03294c519bb8971fcce0b1c69176).
Esto valida esas suites/heads, NO la migración runtime, causalidad, atomicidad transversal, dispositivo real ni autorización protegida.

## Estado que no se debe perder
- M0 INCOMPLETO.
- `src/nexo/runtime.js` todavía importa memoria heredada de `src/assistants/memory.js`; runtime migration pendiente.
- No hay ruta de arranque real hasta efecto protegido probada.
- `effectBoundary.prepare` sigue en `NOT_IMPLEMENTED` por defecto y `protected-transition.mjs` no demuestra conexión productiva.
- Reparaciones convergentes tienen helpers, no una solución de atomicidad cross-store.
- STEP 7 sigue OPEN / STOP / UNKNOWN, pero no es el foco inmediato.
- M1 local está pausado; no repetir instalación de APKs salvo que M0 lo exija.
- La invariante observada puede revertirse después; una observación solo cubre el snapshot leído.

## Plan obligatorio del nuevo chat
1. Verificar el HEAD real de la rama `ncs-clean-architecture`, leer `STATUS.md`, este handoff y los tests/contratos. No inferir HEAD desde commits globales que podrían ser cambios paralelos de Lúmina.
2. Crear una tabla de crash cuts: fallo antes de PREPARED; PREPARED sin dispatch; efecto en memoria sin persistir; conflicto de revisión; entorno persistido y crash antes de Nexo; revisión esperada/adyacente/posterior; invariante ausente/regresada; journal/target/action/key/revisión incoherente; almacén ausente/corrupto. Definir estado y redispatch permitido para cada caso.
3. Determinar contrato mínimo de reconciliación por acción. No conectar settlement al owner sin definir evidencia fuente, vínculo con PREPARED, revisión y límites de causalidad. No construir transacción ficticia.
4. Añadir tests contra API real de owner/store y scripts existentes antes de ampliar runtime. Probar no-mutación ante rechazo, PREPARED preservado, no duplicación y no redispatch inseguro.
5. Ejecutar CI en cada HEAD exacto; inspeccionar jobs/logs; registrar run IDs en STATUS. Workflow ausente o pendiente = UNKNOWN.
6. Después de cerrar recuperación, mapear todas las lecturas/escrituras de memoria heredada en `src/nexo/runtime.js`; migrar de forma incremental al almacén propio con pruebas de arranque, reinicio, errores de I/O y rollback. No eliminar la ruta heredada hasta demostrar seguridad de cutover.

## Disciplina de trabajo
Cada ciclo: brecha concreta → cambio código/test → CI → inspección de logs → actualizar STATUS/handoff. No afirmar pruebas locales no ejecutadas; no confundir commit con PASS. No repetir investigación cerrada ni quedarse en análisis indefinido. Mantener al usuario informado con resultados y enlaces. Prioridad única: terminar M0 y crear Nexo propio.

Referencias a reutilizar:
- `NEXO_NCS/STATUS.md`
- `NEXO_NCS/BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md`
- `NEXO_NCS/BUILD/NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md`
- `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md`
- `NEXO_NCS/BUILD/NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md`
- P112 audits: `NEXO_CONTINUITY/P112_PERSISTSTATE_FINAL_COMMIT_FEASIBILITY_AUDIT_V1_2026-10-07.md`, `NEXO_CONTINUITY/P112_PERSISTSTATE_PHYSICAL_BOUNDARY_CRASH_CUT_AUDIT_V2_2026-10-07.md`, `NEXO_CONTINUITY/P112_PROTECTED_OWNER_AGAINST_EXISTING_PERSISTENCE_PRIMITIVE_V1_2026-10-07.md`, `NEXO_CONTINUITY/P112_WRITER_DEPENDENCY_GRAPH_V1_2026-10-07.md`.

Estado de entrega: M0 EN PROGRESO / NO COMPLETO; store separation diseñada pero sin atomicidad cross-store; lineage guard y suites señaladas en CI aprobadas; runtime pendiente; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


---

## Actualización final del 2026-10-18 — CLI real aislado

### Qué cambió desde el handoff previo
- Añadido puente `scripts/nexo-runtime-session.mjs`, llamado desde `scripts/assistants.mjs` solo con el flag explícito `--nexo-repair-once`. El modo normal no despacha reparaciones.
- Los paths de entorno, memoria de Lúmina y continuidad de Nexo son configurables solo mediante variables de entorno de test; sin ellas se conservan los paths normales.
- Añadida prueba de proceso `tests/nexo/assistants-runtime-cli.test.mjs` que lanza el entrypoint real en subprocesos aislados. Modo normal deja el journal vacío. Modo opt-in realiza la reparación, guarda `settled_observed`, actualiza la revisión de entorno de 1 a 2 y reporta la revisión final. Se confirma que `world-state.json` no contiene `nexoMemory`.
- El test detectó que los hallazgos `AGENT_POSITION` y `INVALID_NEED` no incluían el ID del agente, por lo que una misión podía tener `target: null`. Corregido en `src/assistants/debugger.js`.
- La sesión ahora exige paso `planned` y dependencias canónicas completadas incluso si se llama directamente, no solo por el puente.
- CI [39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529) pasó en SHA exacto de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`; los checks STEP 4 y STEP 5 también pasaron sobre ese SHA. El HEAD actual de documentación es `e6db7493e96014a1008bce3a3bb9a2e63eafe6a4`; no confundir HEAD documental con SHA de prueba.

### Qué no significa
- No se ejecutó sobre los datos reales del repositorio ni sobre el teléfono del usuario; solo fixtures temporales en CI.
- El flag no migra el runtime genérico `src/nexo/runtime.js` y no sustituye las escrituras heredadas de resultados. Es una ruta opt-in para tres reparaciones.
- `settled_observed` no prueba causalidad ni finaliza misión. El reporte puede conservar exit code de diagnóstico porque el informe principal refleja el estado previo a reparar.
- No existe atomicidad entre continuidad Nexo y entorno Lúmina. Los efectos protegidos siguen STOP.

### Próxima tarea concreta (no repetir auditorías)
1. Auditar en detalle todas las lecturas/escrituras legacy de `src/nexo/runtime.js` y el uso de la vista `nexoMemory` dentro de `scripts/assistants.mjs`.
2. Diseñar el corte mínimo hacia una sola fuente canónica: la misión ya se guarda en el owner; la ruta repair-only deja el journal en `settled_observed`, pero no registra completion/causalidad. No usar `recordOutcome()` para liquidar ese journal.
3. Añadir pruebas de reinicio/replay contra el proceso real con los mismos archivos temporales, incluida ausencia de dispatch por defecto y bloqueo del replay tras settlement.
4. Solo entonces proponer un cutover incremental del runtime genérico; mantener rollback y no borrar la ruta heredada sin pruebas.
5. Actualizar STATUS, handoff maestro y este handoff con SHA/run/job exactos.

**M0 sigue EN PROGRESO / NO COMPLETO.** Continuar desde este punto; no volver a M1, STEP 7 ni investigaciones AB/P cerradas. Nexo y Lúmina deben permanecer separados.


## Update 2026-10-18 — prueba de objetivo observado tras settlement

Último avance adicional: `tests/nexo/repair-mission-verification.test.mjs` cubre objetivo persistido después de `settled_observed`, replay read-only tras reabrir el owner, pérdida posterior de la invariante, PREPARED pendiente y misión desconocida. Se añadió al workflow M0.

**CI verificado:** [39144348792](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144348792), commit `1d12c8e65aff1be75b04c0acee2fbc513b8ba5f4`, job `repair-crash-cuts` SUCCESS; el paso de verificación nueva terminó SUCCESS.

Resultado semántico importante: `goal_observed` es una observación actual y read-only; no implica causalidad, autorización ni `missionCompleted:true`. Si la invariante desaparece en una revisión posterior, el verificador bloquea. No se añadió estado de misión nuevo ni se migró el runtime genérico.

Siguiente tarea: auditar si hace falta persistir una observación de objetivo separada, sin convertir una observación histórica en verdad actual; definir vínculo con revisión de entorno, CAS, restart y replay. No cambiar a completion ni retirar legacy hasta tener ese contrato y regresiones. Nexo/Lúmina separados; efectos protegidos STOP; M0 abierto.
