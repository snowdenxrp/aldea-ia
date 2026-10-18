## M0 — excepción durante commit de execution lineage después del dispatch (2026-10-18)

- **Hueco reproducido:** el entorno podía quedar persistido y el journal seguir `prepared`, pero si `owner.recordExecutionLineage()` lanzaba una excepción en vez de devolver un resultado estructurado, `runNexoRepairOnce()` dejaba escapar la excepción. La llamada no debía interpretarse como lineage ni settlement confirmado.
- **Prueba primero:** la regresión en `tests/nexo/repair-owner-lifecycle.test.mjs` simula fallo de escritura del owner tras una reparación persistida. El test falló en el punto exacto, reproduciendo el hueco: [repair crash cuts, run 39153970940](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153970940), SHA `0aaefc0afae250472749e1f7405ba561a5414089`.
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura la excepción y devuelve `blocked` con el código de error, el resultado del dispatch, la condición real `persisted` y una incertidumbre explícita. Si el entorno sí se escribió, devuelve `environment_persisted_but_lineage_and_settlement_unconfirmed`; no intenta settlement ni redispatch en esa invocación. El journal permanece PREPARED y una recuperación posterior debe volver a observar el estado persistido.
- **Validación exacta:** código + ambas regresiones de fallo de frontera en `209dde321dbca3bc755e8ee89948ec94db2be2e6`; [Nexo M0 — repair settlement crash cuts, run 39154037675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39154037675) SUCCESS, job `repair-crash-cuts` SUCCESS.
- **Primera frontera relacionada:** la recarga de owner inmediatamente después del commit PREPARED también queda capturada con resultado `blocked`, `preparedCommitted: true` y `dispatched: false`; código `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`, CI [run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS.

**Alcance:** se han endurecido dos excepciones en límites concretos del lifecycle repair-only. No implica que todas las operaciones post-PREPARED estén libres de excepciones, no migra `src/nexo/runtime.js`, no habilita acciones generales/protegidas y no afirma atomicidad entre Nexo y Lúmina. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

**Siguiente frontera:** revisar los límites restantes de settlement/commit para detectar fallos no estructurados sin añadir un catch global que oculte si el efecto pudo ocurrir. Después, continuar el diseño del seam canónico del runtime genérico; no ampliar el dispatcher repair-only.


## M0 — fallo de recarga inmediatamente después de PREPARED (2026-10-18)

- **Hueco reproducido:** `runNexoRepairOnce()` confirmaba el commit de PREPARED y luego llamaba `owner.loadCurrent()` fuera de un `try/catch`. Si esa lectura fallaba, la excepción escapaba de la frontera de runtime sin un resultado estructurado. La obligación permanecía en disco, pero el caller no recibía claramente que PREPARED estaba confirmado y que el dispatch no había ocurrido.
- **Prueba primero:** regresión añadida a `tests/nexo/repair-owner-lifecycle.test.mjs`. El commit de prueba `75e5e968ed234572661495d362586a9fd6e3a107` falló exactamente en la recarga posterior al PREPARED, reproduciendo el hueco: [repair crash cuts, run 39153769377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153769377).
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura ese fallo y devuelve `blocked`, conserva el código de error, `preparedCommitted: true`, `dispatched: false` y `uncertainty: prepared_commit_confirmed_but_journal_reload_unconfirmed`. No intenta recuperar desde una vista obsoleta ni despacha; la obligación PREPARED permanece para una invocación posterior de recuperación.
- **Validación exacta:** código + regresión en `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`; workflow [Nexo M0 — repair settlement crash cuts, run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS, job `repair-crash-cuts` SUCCESS. El test confirma journal PREPARED único, revisión Nexo 1, estado ambiental sin cambio (revisión 80), y cero dispatch.
- **Alcance:** corrige el contrato de fallo de esta frontera de recuperación; no migra `src/nexo/runtime.js`, no autoriza acciones generales/protegidas, no afirma atomicidad entre archivos y no convierte PREPARED en completion.

**Siguiente frontera M0:** diseñar y probar el seam canónico para el primer caller de runtime fuera de la ruta repair-only. No sustituir imports legacy mecánicamente ni generalizar el dispatcher de reparaciones. M0 continúa INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## Avance posterior — admisión PREPARED valida también la misión (2026-10-18)

El owner ahora rechaza PREPARED nuevo si la misión canónica no está en estado `planned`, incluso cuando el paso individual aún aparece `planned`. Código: `NEXO_PREPARED_MISSION_NOT_RUNNABLE`; no cambia la revisión ni el journal. La comprobación no se aplica para ocultar un PREPARED ya existente: la obligación pendiente se conserva para recuperación.

Test-first SHA `4c5cbf530da03642fb68da62f0abf1e8829bae5e` falló en repair crash cuts [39153079971](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153079971) y bounded admission/restart [39153080078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153080078). Fix validado en SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d`: [STEP 5 39153137599](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137599), [STEP 4 39153137708](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137708), [repair crash cuts 39153137714](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137714), [bounded admission/restart 39153137611](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137611) SUCCESS.

Continuar en el seam runtime canónico; no declarar migrado `src/nexo/runtime.js`. Mantener separación Nexo/Lúmina y el alcance repair-only. No inferir completion a partir de `settled_observed` ni añadir un journal de observaciones sin requisito explícito.

---

## Avance posterior — admisión de PREPARED endurecida (2026-10-18)

El owner canónico ya no crea una obligación PREPARED nueva si el paso no está exactamente `planned` o si alguna dependencia no existe/no está `completed`. Códigos: `NEXO_PREPARED_STEP_NOT_RUNNABLE` y `NEXO_PREPARED_DEPENDENCIES_UNMET`; ambos preservan `storeRevision` y journal. El check queda después de la rama de PREPARED existente para que un efecto ya incierto no desaparezca de la recuperación por cambios de estado.

CI SUCCESS sobre SHA de código/pruebas `4549662e9cf879a15c4833b011ce5a8122e1c65e`: [bounded admission/restart 39152160229](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160229), [repair crash cuts 39152160394](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160394), [STEP 4 39152160252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160252), [STEP 5 39152160267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160267). Test-first SHA `71764ddb9dfc511cfe437c6a12dc9f6122a2297b` falló en las dos suites de continuidad por el comportamiento anterior; STEP 4/STEP 5 pasaron pero no validaban el guard.

**Siguiente:** avanzar al seam runtime canónico; runtime genérico legacy todavía no migrado. Mantener Nexo separado de Lúmina, sin atomicidad cross-store, sin `goalObservations`, sin completion por observación; efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN.

---

## Nuevo avance posterior — replay de outcome contradictorio (2026-10-18)

El owner canónico `recordOutcome()` ya no devuelve `already_recorded` cuando el mismo paso reaparece con un estado/evidencia distintos. Requiere igualdad de `status`, `evidence`, `parentMissionId` y `replanReason`; si difieren: `blocked / NEXO_OUTCOME_RESULT_MISMATCH`, sin cambiar la revisión ni el intento original. La prueba `tests/nexo/continuity-migration.test.mjs` verifica que un replay tardío `failed` no desplaza un outcome previamente `completed`.

CI SUCCESS sobre SHA de código/pruebas `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3`: [bounded restart 39151794894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794894), [repair crash cuts 39151794904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794904), [STEP 4 39151794891](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794891), [STEP 5 39151794922](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794922). Los workflows de test-first [39151769794](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769794) y [39151769766](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769766) fallaron con la expectativa nueva antes del fix; mantener visible ese historial.

**Siguiente:** preparar corte de runtime canónico sin reemplazar mecánicamente las escrituras legacy. `executeNexoStep()` ejecuta el adaptador antes de escribir execution/outcome en la memoria legacy; el camino no debe migrarse hasta que PREPARED y replay/reconciliación estén garantizados por owner canónico. No crear `goalObservations`, no reclamar completion por settlement, no mezclar Nexo/Lúmina, efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN.

---

## Incremento posterior — replay de lineage ligado al baseline (2026-10-18)

Además de rechazar resultados contradictorios (`NEXO_EXECUTION_RESULT_MISMATCH`), `recordExecutionLineage()` ahora vuelve a validar para reparaciones la revisión ambiental capturada en PREPARED antes de aceptar un replay existente. Baseline distinto → `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`; baseline desconocido/ambiguo → `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`. Ninguna de esas rutas avanza la revisión de continuidad. Regresión en `tests/nexo/continuity-migration.test.mjs`.

CI SUCCESS sobre SHA de código/pruebas `3bfbad268ac1a9b5ea9492e8db0a90b5972f22d9`: [repair crash cuts 39150515026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515026), [STEP 4 39150514997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150514997), [STEP 5 39150515080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515080), [bounded admission/restart 39150515015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515015). El test-first falló en [39150495080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150495080) al demostrar la aceptación anterior del baseline discrepante. `STATUS.md` y el handoff maestro contienen el historial y ambos incrementos.

**Siguiente:** continuar M0 hacia el cutover canónico de runtime, primero con el seam mínimo y pruebas de proceso/reinicio. No volver a investigar lo cerrado, no añadir `goalObservations`, no convertir settlement en completion, no mezclar Nexo/Lúmina, no afirmar atomicidad cross-store; efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN.

---

## Continuidad más reciente (2026-10-18, después del estado base)

Último incremento de código/pruebas validado: `0653d7216c49dd6a9b0ea7a182333ff18ee07bc3`. `recordExecutionLineage()` compara ahora el resultado ya persistido con el resultado propuesto en un replay de la misma identidad. Si son distintos: `blocked / NEXO_EXECUTION_RESULT_MISMATCH`; no cambia `storeRevision` ni el registro inicial. Regresiones en `tests/nexo/repair-owner-lifecycle.test.mjs` y `tests/nexo/continuity-migration.test.mjs`.

CI SUCCESS para ese SHA: [repair settlement crash cuts 39150332075](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332075), [STEP 4 39150332148](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332148), [STEP 5 39150331964](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331964), [bounded mission admission/restart 39150331921](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331921). `STATUS.md` y el handoff maestro incluyen el detalle. HEAD puede ser posterior por documentación; no afirmar que los documentos mismos se ejecutaron en CI.

Los intentos intermedios fallaron primero en la regresión nueva y luego en una expectativa antigua de `already_recorded` con resultado distinto. Se documentó y corrigió el contrato; no ocultar esos fallos.

**Siguiente tarea:** continuar M0 desde el siguiente hueco mínimo de continuidad; no reauditar goal-observation ni crear `goalObservations` sin requisito. No migrar aún runtime genérico, no mezclar Nexo/Lúmina, no declarar completion por `settled_observed`, no activar efectos protegidos ni retomar STEP 7/M1. Mantener STOP donde la evidencia no alcance.

---

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

## CI más reciente confirmado — 2026-10-18

[CI 39144434201](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144434201) terminó SUCCESS en SHA `ec36dd7df7cccf57f372d2cf252444ce28292e84`. La regresión adicional confirma que después de `goal_observed` la reconstrucción owner-backed mantiene misión/paso bloqueados con `NEXO_REPAIR_SETTLED_BY_OBSERVATION`, no marca completion ni permite redispatch. La verificación es read-only y no persiste una transición de misión.

Continuar evaluando una observación durable separada y ligada a la revisión del entorno; nunca promover automáticamente `settled_observed` a completion. Exigir CAS/restart/replay e invalidación al desaparecer la invariante. HEAD de este CI es el SHA de código/pruebas indicado; los commits documentales posteriores no quedan cubiertos automáticamente.

## Incremento verificado — replay fail-closed tras reinicio (2026-10-18)

La prueba del proceso real de `scripts/assistants.mjs` ya no termina al primer settlement. Después de que el subproceso persiste una reparación y sale, el test vuelve a abrir el owner desde el mismo archivo de continuidad y solicita la misma misión. El replay queda bloqueado/falla cerrado y no altera la revisión del entorno ni añade otra obligación al journal.

CI exacto: [39144863235](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144863235), SUCCESS en SHA `1cd8dfd914fad7848df51eca0f4e0f75cff22264`. El job `repair-crash-cuts` y el test CLI aislado terminaron SUCCESS.

**Siguiente tarea:** continuar la migración del runtime genérico con un contrato mínimo de resultado/lineage que use el owner. No hacer reemplazo mecánico de imports. `recordExecutionLineage()` conserva la obligación PREPARED; `recordOutcome()` registra un claim y no autentica evidencia ni liquida el journal. Mantener legacy hasta que el contrato de resultados, recuperación y rollback esté cubierto por crash cuts. M0 sigue INCOMPLETO; Nexo/Lúmina separados; efectos protegidos STOP.

## M0 — repair dispatch lineage persisted before observed settlement (2026-10-18)

The repair-only entrypoint now records the adapter/dispatch result through `owner.recordExecutionLineage()` after the dispatch reports completion and before it attempts independent persisted-state settlement. The lineage binds to the original PREPARED operation identity and baseline environment revision; the result records whether the environment write occurred and the resulting revision. The journal remains `prepared` during the lineage commit; only the separate persisted-invariant observer may transition it to `settled_observed`.

The path fails closed if the lineage API/commit cannot be confirmed after environment persistence. A later invocation can re-read the durable environment and recover from the still-PREPARED journal without redispatching when the invariant is present. This does not make the two files atomic and does not authenticate causal attribution.

Regression coverage now asserts a normal repair creates one execution-lineage record and a separate settlement commit; an already-satisfied no-op records lineage without fabricating an environment revision increment. Session integration asserts three distinct Nexo store revisions for PREPARED, lineage, and settlement.

**Exact CI:** [Nexo M0 — repair settlement crash cuts, run 39145222433](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145222433) — SUCCESS on code/test SHA `e50f47d8c1717eb8d4d0f56caa508e3b50dc4c41`. Job `repair-crash-cuts` passed, including owner migration, repair lifecycle, canonical session, CLI restart/replay, and mission-goal verification regressions.

Limit: this is still repair-only. Generic `src/nexo/runtime.js` remains legacy-memory-backed; non-repair/protected actions are not routed through this path. M0 incomplete; Nexo/Lúmina separate; unresolved PREPARED UNKNOWN; protected effects STOP.

## M0 — crash cut after lineage, before settlement (2026-10-18)

Added a dedicated recovery scenario to `tests/nexo/repair-owner-lifecycle.test.mjs`: persist PREPARED, dispatch a repair and persist the Lúmina environment, reopen the owner, commit execution lineage, then simulate process loss before journal settlement. On restart, the entrypoint observes the already-persisted invariant and settles it without dispatching again or advancing the environment revision. Assertions confirm one lineage record, PREPARED remains unresolved between the lineage commit and settlement, and final settlement is a separate third owner revision.

**Exact CI:** [Nexo M0 — repair settlement crash cuts, run 39145303242](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145303242) — SUCCESS on code/test SHA `59825c0b66034e39dfa62bf060665cff59c95269`. The `repair-crash-cuts` job passed, including the new crash-cut test, owner migration, canonical repair session, isolated CLI replay, and mission-goal verification.

This closes one crash boundary for the repair-only lifecycle; it does not prove generic runtime cutover, cross-store atomicity, causal attribution, or protected-effect authorization. M0 remains INCOMPLETE.


## Actualización final de M0 — 2026-10-18

- Commit de regresión: [fd2331e8d71afbbf0f19ea978d552a89087c1dc6](https://github.com/snowdenxrp/aldea-ia/commit/fd2331e8d71afbbf0f19ea978d552a89087c1dc6).
- La prueba verifica que `recordOutcome(status: completed)` no puede promover un repair cuyo journal ya está `settled_observed`, incluso si el caller presenta `verified: true`, `kind` y `source`. El owner responde `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` sin mutar la revisión.
- Reconstrucción antes y después de reabrir el owner: la misión permanece `blocked`, objetivo `verify_observed_repair_goal`; no se re-despacha ni se afirma completion.
- CI exacto sobre el SHA de prueba: [repair crash cuts 39145754425](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754425), [STEP 4 39145754371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754371), [STEP 5 39145754375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754375): todos SUCCESS.
- La prueba no autentica fuentes externas ni cierra M0. Mantener efectos protegidos STOP, STEP 7 OPEN / STOP / UNKNOWN, no repetir M1 ni auditorías históricas.

**Siguiente acción:** trabajar el contrato de outcome para una verificación independiente de objetivo; definir su evidencia/procedencia y transición sin conflar `settled_observed`, causalidad y completion. Luego migrar solo una operación legacy tras demostrar PREPARED durable, CAS, crash recovery y replay en la entrada real. No sustituir los imports de `src/nexo/runtime.js` por owner calls de forma mecánica.


## Actualización de continuidad — 2026-10-18

- El verificador independiente ahora tiene regresiones para pérdida de la invariante y revisión ambiental regresiva. La primera debe devolver `blocked / NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`; la segunda `unknown / NEXO_REPAIR_MISSION_ENVIRONMENT_REVISION_ROLLBACK_OR_REPLAY`. Ninguna escribe en el store Nexo.
- Prueba commit `d01384083368d1b9f52ad5c327dc4b1985e5573a`; CI verde: [repair 39146476081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476081), [STEP 4 39146476199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476199), [STEP 5 39146476145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476145).
- Un cambio incompleto de esquema `goalObservations` produjo CI fallido en runs 39146494871/39146494887; se revirtió en `16c51fc994de1ca8a6471fa30f9060068b998da8`. No ocultar este fallo ni reintroducir el campo sin contrato/migración completa.
- HEAD actual `864ab85d38bf67040ef5a662dd8769cad3ea4c9f`; el último CI verde explícito es sobre su padre `16c51fc994de1ca8a6471fa30f9060068b998da8`. Revalidar el HEAD antes de afirmar cobertura exacta.
- Próximo: definir si y cómo persistir una observación de objetivo con procedencia que no dependa de etiquetas del caller. No promover misión a completed; no afirmar causalidad; no tocar el corte del runtime genérico aún.


## Último cambio de código probado — estabilidad del snapshot de continuidad (2026-10-18)

El verificador `verifyRepairMissionGoalFromPersistedState()` ahora vuelve a leer continuidad antes de devolver un resultado positivo. Si la revisión cambió desde la lectura inicial, responde `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. Prueba de regresión en `tests/nexo/repair-mission-verification.test.mjs` simula el cambio y comprueba el código, estado y dos lecturas.

Commit exacto: `57f3bffb52989a924bdbc5fb4fc626d803e6988f`. CI verde sobre el mismo SHA: repair [39146959705](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959705), STEP 4 [39146959738](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959738), STEP 5 [39146959691](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959691). El workflow repair confirma explícitamente el paso de verificación del objetivo.

Esto evita un PASS basado en continuidad que cambió durante la verificación; no es atomicidad cross-store ni cubre cambios que ocurran después de la lectura final. No persistimos aún goal observations, no declaramos misión completada y no migramos el runtime genérico. Siguiente: diseñar un contrato de observación durable/procedencia solo si el requisito de continuidad M0 lo necesita; de lo contrario, delimitar con precisión qué prueba de punto en el tiempo requiere el cutover. No añadir una colección de snapshot sin contrato/migración completos.


## Último estado M0 — decisión de cutover y guard de continuidad (2026-10-18)

Nueva decisión: `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_AND_RUNTIME_CUTOVER_DECISION_2026-10-18.md`. No se añade `goalObservations` por ahora: la observación es read-only, no declara misión completa y la reconstrucción ya bloquea el paso `settled_observed` para impedir redispatch. El documento define el contrato mínimo de cutover y sus crash cuts.

Se conserva el guard y test determinista de cambio de `storeRevision` durante la verificación: `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. No afirmar atomicidad cross-store ni estabilidad del entorno a lo largo de toda la lectura. Se intentó una prueba de carrera ambiental pero no reprodujo el orden esperado; se retiró el test y el guard experimental antes de aceptar una falsa garantía. No ocultar ese límite ni reintroducirlo sin una prueba determinista.

Código/pruebas verificados sobre `fe9fe3b656fceff67be31722d7729ff6637a428b`: repair [39149853015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853015), STEP 4 [39149852997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149852997), STEP 5 [39149853023](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853023), todos SUCCESS. Próximo trabajo: inspeccionar el menor hueco demostrable entre PREPARED, lineage, observación y journal settlement antes de cualquier cambio de runtime. M0 INCOMPLETO; efectos protegidos STOP; no migrar runtime genérico aún.
