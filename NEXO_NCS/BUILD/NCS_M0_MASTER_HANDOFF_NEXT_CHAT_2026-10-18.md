## M0 — resultado incierto al confirmar PREPARED (2026-10-18, validado)

- **Hueco reproducido:** `owner.recordPrepared()` podía persistir el registro PREPARED y luego lanzar una excepción antes de devolver confirmación (por ejemplo, respuesta perdida después del reemplazo durable). `prepareRepairAgainstPersistedState()` dejaba escapar la excepción y `runNexoRepairOnce()` no devolvía una respuesta estructurada. El journal podía contener PREPARED durable pese a que el caller no recibió confirmación.
- **Prueba primero:** `tests/nexo/repair-owner-lifecycle.test.mjs` simula una escritura confirmada internamente seguida de excepción. El test falló antes de la corrección: [CI run 39160592605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160592605), SHA `3b066758fe3313b56344a26e0c64bf3ef5d5d7c1`.
- **Corrección:** `scripts/nexo-repair-preparation.mjs` devuelve `blocked`, preserva el código de error, marca `preparedCommitOutcome: unknown` y `uncertainty: prepared_commit_outcome_unknown`. `scripts/nexo-repair-entrypoint.mjs` propaga la incertidumbre y fija `dispatched: false`. No afirma que PREPARED no se haya escrito y no despacha sin confirmación. La siguiente invocación debe volver a leer el journal canónico y reconciliar la obligación.
- **Validación exacta:** código + regresión en `6300f8cb60fe18568e3ebd58e3ca1ee5b70d3d51`; [CI Nexo M0 — repair settlement crash cuts, run 39160656605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160656605) SUCCESS.
- **Alcance:** esto no migra el runtime genérico, no afirma atomicidad entre archivos y no habilita acciones protegidas.

**Siguiente trabajo:** continuar auditando límites de error específicos del lifecycle repair-only; mantener separados PREPARED, lineage, observación y settlement. Después, diseñar la ruta canónica del runtime genérico con PREPARED durable antes de dispatch. M0 permanece INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — excepción durante commit de settlement (2026-10-18, validada)

- **Fallo reproducido:** `settlePreparedRepairFromPersistedState()` podía propagar una excepción lanzada por `store.commitIfCurrent()`. La obligación seguía `PREPARED`; el entorno y `execution lineage` podían estar persistidos, pero el caller no recibía un resultado estructurado. La regresión se agregó en `tests/nexo/repair-owner-lifecycle.test.mjs` y falló en CI antes de corregir el punto de entrada.
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura específicamente la excepción alrededor de la liquidación final y devuelve `blocked`, el código original del error, `dispatch`, `lineage`, el valor real de `persisted` y `uncertainty: environment_persisted_but_continuity_settlement_unconfirmed`. No declara `settled_observed`, no elimina la obligación PREPARED y no intenta redispatch en esa invocación.
- **Prueba:** la regresión simula una excepción de escritura del store de continuidad durante `commitIfCurrent`; verifica bloqueo, incertidumbre explícita, revisión ambiental avanzada, lineage conservado y journal aún PREPARED.
- **Validación exacta:** código + regresión en `8d37f804901d410ad5e32c0bc842729d53c8593e`; [CI Nexo M0 — repair settlement crash cuts, run 39160463984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160463984) SUCCESS.
- **Alcance:** esto cierra una frontera de excepción concreta del lifecycle repair-only. No prueba atomicidad entre archivos, no migra el runtime genérico `src/nexo/runtime.js` y no autoriza efectos protegidos.

**Siguiente trabajo:** revisar las restantes fronteras explícitas de lectura/commit de settlement y sus resultados de conflicto, sin añadir un catch global. Después diseñar la migración arquitectónica del runtime genérico a la continuidad canónica, con PREPARED durable antes de cualquier dispatch y pruebas de crash/restart. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — excepción al confirmar settlement del journal PREPARED (2026-10-18)

- **Hueco reproducido:** `settlePreparedRepairFromPersistedState()` ejecutaba `store.commitIfCurrent()` sin capturar una excepción. Si el store lanzaba error, aunque el entorno y el lineage ya estuvieran persistidos, `runNexoRepairOnce()` terminaba por excepción sin resultado estructurado.
- **Prueba primero:** se añadió un caso que simula fallo de escritura durante settlement después de una reparación y lineage confirmados. La prueba falló en el punto exacto con el error `NEXO_CONTINUITY_WRITE_FAILED`: [run 39155348004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155348004), SHA `51c0ed94a7362133ddb9a29bd97e15b310dc298d`.
- **Corrección:** `scripts/nexo-repair-settlement.mjs` captura la excepción del commit y devuelve `blocked`, `verified: false` y `uncertainty: settlement_commit_outcome_unknown`. No presume si la escritura llegó o no al almacenamiento durable. `scripts/nexo-repair-entrypoint.mjs` preserva el código concreto del settlement en vez de reemplazarlo por un código genérico.
- **Validación exacta:** implementación + regresión en `67048ebbdd30b49000f3a2bfea5e6a3ef0eb1b74`; [Nexo M0 — repair settlement crash cuts, run 39155469445](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155469445) SUCCESS, job `repair-crash-cuts` SUCCESS. El caso verifica que el entorno permanece en revisión 101, lineage sigue registrado, y el journal conserva `prepared` al no estar confirmado el commit de settlement.
- **Alcance:** se protege la frontera de escritura de settlement; no se afirma que todo el lifecycle carezca de excepciones. No migra `src/nexo/runtime.js`, no amplía el dispatcher repair-only, no habilita efectos protegidos ni afirma atomicidad entre archivos.

**Siguiente revisión:** inspeccionar la frontera de `adapter.execute()` en `scripts/nexo-repair-dispatch.mjs`. Una excepción antes de `persistState()` no debe escapar como excepción cruda; debe devolver un bloqueo claro y dejar PREPARED para revisión/recuperación. Después, seguir con el seam canónico del runtime genérico, sin sustituir legacy memory por imports de owner a ciegas.

**Estado global:** M0 INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


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


## Quinto avance verificado — estado de misión en admisión PREPARED (2026-10-18)

Se encontró que un paso `planned` dentro de una misión `blocked` podía pasar la admisión del owner. `src/nexo/core/continuity-owner.mjs` ahora requiere `mission.status === planned` antes de crear PREPARED nuevo; falla con `NEXO_PREPARED_MISSION_NOT_RUNNABLE` sin cambiar revisión ni journal. El check ocurre después del manejo de PREPARED existente, para que una obligación incierta ya durable siga siendo visible a recuperación.

Regresión test-first en `tests/nexo/continuity-migration.test.mjs`: SHA `4c5cbf530da03642fb68da62f0abf1e8829bae5e`; [repair crash cuts 39153079971](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153079971) y [bounded admission/restart 39153080078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153080078) fallaron como esperado (`committed` vs `blocked`). El arreglo en SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d` quedó validado por las cuatro suites: [STEP 5 39153137599](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137599), [STEP 4 39153137708](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137708), [repair crash cuts 39153137714](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137714), [bounded admission/restart 39153137611](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137611) SUCCESS.

**Siguiente:** la frontera legacy sigue sin migrar. El paso siguiente es diseñar integración runtime usando solo la sesión canónica repair-only ya existente; no sustituir llamadas legacy con writes del owner sin un PREPARED duradero y conciliación específica. No `goalObservations`, no atribución causal por etiquetas, no atomicidad cross-store, no dispatcher genérico.

---

## Cuarto avance verificado — PREPARED solo para pasos ejecutables (2026-10-18)

`src/nexo/core/continuity-owner.mjs` ahora impone admisión en `recordPrepared()` para una obligación nueva: el paso canónico debe seguir `planned` y todas las dependencias declaradas deben existir y estar `completed`. Rechaza estados no ejecutables con `NEXO_PREPARED_STEP_NOT_RUNNABLE` y dependencias incompletas con `NEXO_PREPARED_DEPENDENCIES_UNMET`, sin avanzar revisión ni escribir journal. La validación se aplica después del branch de PREPARED existente, de modo que una obligación incierta existente no se oculta por cambios posteriores de estado.

Regresión test-first en `tests/nexo/continuity-migration.test.mjs`. SHA test-only `71764ddb9dfc511cfe437c6a12dc9f6122a2297b`: repair crash cuts [39152101773](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101773) y mission/restart [39152101743](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101743) fallaron como esperado (`committed` en vez de `blocked`). Fix y prueba en SHA `4549662e9cf879a15c4833b011ce5a8122e1c65e`: mission/restart [39152160229](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160229), repair crash cuts [39152160394](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160394), STEP 4 [39152160252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160252), STEP 5 [39152160267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160267) SUCCESS.

**Continuar:** todavía no es runtime cutover. No añadir `goalObservations`, no aceptar evidencia del caller como autenticación, no declarar completion por `settled_observed`, no generalizar el dispatcher repair-only ni reclamar atomicidad entre Nexo y Lúmina. La siguiente frontera es el seam runtime canónico con `PREPARED` durable y conciliación por tipo de efecto; lo no soportado sigue STOP.

---

## Tercer avance verificado — replay contradictorio de outcome (2026-10-18)

`src/nexo/core/continuity-owner.mjs`: `recordOutcome()` ahora exige que un replay de la misma identidad coincida también en `status`, `evidence`, `parentMissionId` y `replanReason`. Un resultado contradictorio devuelve `blocked / NEXO_OUTCOME_RESULT_MISMATCH`, sin escritura ni avance de revisión. La regresión en `tests/nexo/continuity-migration.test.mjs` demuestra que `completed` seguido de `failed` no se acepta como replay idéntico y que la reconstrucción permanece `completed`.

Test-first: [39151769794](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769794) y [39151769766](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769766) fallaron antes del fix por la nueva expectativa. Tras el fix, CI SUCCESS sobre SHA `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3`: [repair crash cuts 39151794904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794904), [STEP 4 39151794891](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794891), [STEP 5 39151794922](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794922), [bounded admission/restart 39151794894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794894). Documentación posterior no debe presentarse como código probado en ese SHA.

**Continuar:** siguiente trabajo es el cutover mínimo y explícito del runtime genérico desde `src/assistants/memory.js` hacia el owner canónico. No hacer reemplazo mecánico: hoy `executeNexoStep()` despacha antes de registrar `recordNexoExecution()`/`recordNexoOutcome()` y usa un journal en memoria; la ruta repair-only en `scripts/` tiene PREPARED duradero, lineage y settlement separados. Antes de migrar, definir un seam que exija admisión/PREPARED duradero y mantenga acciones no admitidas/protegidas en STOP. No hay aún prueba de runtime genérico canónico ni atomicidad cross-store.

---

## Segundo avance verificado — replay de lineage ligado al baseline PREPARED (2026-10-18)

Se detectó y cerró otro hueco acotado: una lineage existente podía ser aceptada en replay con la misma identidad y resultado, pero con `operation.environmentStateRevision` distinto al baseline PREPARED. En `src/nexo/core/continuity-owner.mjs`, las reparaciones ahora vuelven a comprobar que exista una sola entrada de journal con baseline conocido y que coincida con la revisión que presenta el replay. Discrepancia: `blocked / NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`; base ausente/ambigua: `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`. No se escribe continuidad.

Regresión añadida a `tests/nexo/continuity-migration.test.mjs`. El test-first falló en [39150495080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150495080), al aceptar el comportamiento anterior. Tras el fix, CI SUCCESS sobre SHA `3bfbad268ac1a9b5ea9492e8db0a90b5972f22d9`: crash cuts [39150515026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515026), STEP 4 [39150514997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150514997), STEP 5 [39150515080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515080), bounded admission/restart [39150515015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515015).

El primer incremento relacionado está documentado inmediatamente después en este handoff y en `NEXO_NCS/STATUS.md`: el replay con el mismo identity pero distinto `result` ahora se bloquea como `NEXO_EXECUTION_RESULT_MISMATCH`. Ambos guards son estrechos; no equivalen al cutover de `src/nexo/runtime.js`, no crean completion, no agregan observaciones persistentes y no cambian los límites de aislamiento.

**Continuar:** inspeccionar el siguiente gap de integración runtime, con test-first y CI sobre SHA exacto. No reabrir la decisión de `goalObservations`; Nexo y Lúmina siguen separados, no hay atomicidad cross-store, efectos protegidos STOP, STEP 7 OPEN / STOP / UNKNOWN.

---

## Último avance verificado — replay contradictorio de execution lineage (2026-10-18)

Se cerró una brecha concreta en `src/nexo/core/continuity-owner.mjs`: `recordExecutionLineage()` ya no devuelve `already_recorded` si la misma identidad de operación se repite con un `result` diferente. Ahora devuelve `blocked / NEXO_EXECUTION_RESULT_MISMATCH` sin mutar continuidad. Se añadieron/actualizaron regresiones en `tests/nexo/repair-owner-lifecycle.test.mjs` y `tests/nexo/continuity-migration.test.mjs`.

CI exacto verde sobre SHA de código/pruebas `0653d7216c49dd6a9b0ea7a182333ff18ee07bc3`: repair settlement crash cuts [39150332075](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332075), STEP 4 [39150332148](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332148), STEP 5 [39150331964](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331964), bounded mission admission/restart [39150331921](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331921); los cuatro terminaron SUCCESS. Los commits documentales posteriores no deben atribuirse a ese CI como si fueran el mismo SHA de código.

Los fallos intermedios fueron explícitos: el test-first falló porque el código viejo aceptaba el replay; el primer fix CI reveló una expectativa heredada que también esperaba `already_recorded` para un resultado distinto. Esa prueba se alineó con el nuevo contrato y el SHA siguiente pasó. No borrar este historial.

**Continuar desde aquí:** no añadir `goalObservations`; no promover `settled_observed` ni `goal_observed` a completion; no cortar aún `src/nexo/runtime.js`; mantener Nexo separado de Lúmina, sin atomicidad cross-store ficticia, efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN. Inspeccionar el siguiente hueco mínimo después de PREPARED → lineage → settlement y luego avanzar hacia una integración canónica runtime con crash/restart/replay verificables.

---

## Incremento M0 — entrada repair-only owner-backed (2026-10-18)

Se añadió `scripts/nexo-repair-entrypoint.mjs` (`runNexoRepairOnce`) para reunir los helpers existentes en un flujo limitado a reparaciones convergentes. Para una obligación PREPARED previa, intenta observar la invariante persistida primero; solo considera dispatch si el estado sigue en la revisión base y la observación demuestra que la invariante no está presente. Rechaza target/context discrepante y revisiones nuevas. Settlement se mantiene separado y solo registra `settled_observed`.

Test del entrypoint/crash recovery: [CI 39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), SHA `e36121220d4d89475a68bc4bf1a0d2880b4092be`, SUCCESS. Incluye recovery antes del dispatch y el caso donde la invariante ya estaba satisfecha: settlement observado sin escritura ni avance de revisión del entorno.

No confundir este entrypoint de script con la integración productiva: `src/nexo/runtime.js` sigue usando la memoria heredada y no llama a `runNexoRepairOnce`. No hay atomicidad cross-store demostrada, no se completan misiones y los efectos protegidos permanecen fuera de alcance. Siguiente paso: auditar el contrato del entrypoint (incluido el caso de estado ya satisfecho sin escritura y los límites de recuperación) y preparar pruebas de integración antes de cualquier corte de runtime.

---

## Incremento confirmado — recuperación después del commit de entorno (2026-10-18)

El test de lifecycle ahora simula el crash cut entre persistir el entorno y liquidar PREPARED. Commit de prueba: [55f9a064dd28ed5b51eb552f903f3bec504f9640](https://github.com/snowdenxrp/aldea-ia/commit/55f9a064dd28ed5b51eb552f903f3bec504f9640). CI exacto [39141847081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141847081) terminó SUCCESS en ese SHA; los tres pasos de prueba del workflow finalizaron success.

La prueba persiste entorno revisión 31 desde PREPARED revisión 30, reabre el owner/store desde disco, observa la invariante y registra `settled_observed`, y confirma que replay queda bloqueado sin otra escritura. Esto valida el helper lifecycle y recuperación de estado, no un reinicio completo de la aplicación productiva ni atomicidad cross-store. STATUS con evidencia actualizado en [ef459d67c31fe0c03515ab226b56dcc7a8d27ef5](https://github.com/snowdenxrp/aldea-ia/commit/ef459d67c31fe0c03515ab226b56dcc7a8d27ef5).

Próximo paso: diseñar un único entrypoint repair-only owner-backed con contratos explícitos para PREPARED, dispatch, observación/settlement, recovery y UNKNOWN/STOP. No migrar todavía el runtime genérico que registra outcomes vía `src/assistants/memory.js`; no activar efectos protegidos.

---

## Incremento posterior — replay y stale revision (2026-10-18)

La prueba integrada `tests/nexo/repair-owner-lifecycle.test.mjs` ahora incluye dos regresiones adicionales en el commit [53cf292ae966c80eb722a7f48eec0c6c2c86595d](https://github.com/snowdenxrp/aldea-ia/commit/53cf292ae966c80eb722a7f48eec0c6c2c86595d):

1. Tras `settled_observed`, repetir dispatch debe quedar bloqueado sin mutar entorno ni continuidad.
2. Si el entorno cambia de revisión 20 a 21 después de PREPARED, dispatch debe fallar cerrado, conservar revisión 21 y dejar la obligación PREPARED para reconciliación.

**CI exacto verificado:** [run 39141470114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141470114) completó SUCCESS sobre el commit de prueba `53cf292ae966c80eb722a7f48eec0c6c2c86595d`. El job `repair-crash-cuts` y los tres pasos de test finalizaron `success`. STATUS actualizado con esta evidencia en commit [e6b48e922af1caf5e173ae273e2f7a2e80c84fba](https://github.com/snowdenxrp/aldea-ia/commit/e6b48e922af1caf5e173ae273e2f7a2e80c84fba).

Estas pruebas cubren el comportamiento de helpers repair-only, no el corte de runtime productivo ni atomicidad entre almacenes. Siguiente: verificar CI del commit de test; corregir cualquier fallo real; después añadir/ejecutar el corte de crash tras persistencia de entorno antes del settlement y evaluar un entrypoint owner-backed repair-only antes de cualquier conexión a `runtime.js`.

---

# NCS — MASTER HANDOFF PARA NUEVO CHAT — MISIÓN M0

Fecha de corte: 2026-10-18
Repositorio: `snowdenxrp/aldea-ia`
Rama de trabajo: `ncs-clean-architecture`
Misión única: **terminar M0 sin desviaciones y sin perder continuidad**.
Puerta de entrada obligatoria en la próxima sesión: `NEXO_NCS/STATUS.md`.

## 0. Instrucción inicial para el siguiente chat

El usuario iniciará el nuevo chat escribiendo exactamente: `NCS`.

Al recibir `NCS`:
1. Leer primero `NEXO_NCS/STATUS.md`.
2. Leer este documento completo: `NEXO_NCS/BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md`.
3. Leer el handoff de migración y el checkpoint de execution lineage enlazados más abajo.
4. Retomar desde la sección **“Siguiente tarea concreta”**. No volver a empezar auditorías históricas, no repetir investigaciones cerradas, no pedir al usuario que repita el contexto.
5. Verificar el estado real de la rama y los checks del HEAD antes de afirmar cuál es el commit más reciente o que CI está verde. Los SHAs que aparecen en este documento son puntos de evidencia específicos, no garantía de que sean el HEAD más nuevo.
6. Mantener el trabajo centrado en M0. No desviarse a M1, Step 7, GenesisRoot, Lúmina, negocio personal u otras líneas salvo que un bloqueo técnico concreto de M0 lo requiera.

## 1. Meta real de M0

Construir la base operativa propia de Nexo: continuidad y memoria operativa con propiedad arquitectónica de Nexo, recuperación tras reinicio, admisión de misiones y registro de resultados con evidencia suficiente, manteniendo autoridad/Constitución por encima de cualquier ejecución.

La meta no es simplemente tener archivos, tests o un prototipo que “funcione”. M0 debe dejar una ruta de runtime de Nexo coherente, comprobable, recuperable y separada de Lúmina. No se debe activar una ruta protegida ni declarar migración completa hasta que los límites de persistencia, recuperación, evidencia y rollback estén demostrados.

Axiomas de separación:
- Modelo ≠ Nexo.
- Sistema operativo ≠ Nexo.
- Dispositivo ≠ Nexo.
- Lúmina ≠ Nexo.
- La memoria/continuidad operativa de Nexo debe pertenecer a Nexo; no serializarla dentro del estado de simulación de Lúmina.
- El teléfono es un posible canal/dispositivo, no la autoridad de identidad del propietario.

## 2. Estado real al corte

### Hecho y comprobado en el repositorio
- Hay un almacén canónico separado de continuidad de Nexo y un owner semántico para cargar/reconstruir misiones, registrar misiones y escribir obligaciones `PREPARED`.
- `recordExecutionLineage()` existe en `src/nexo/core/continuity-owner.mjs`. Registra una línea de ejecución en el almacén de Nexo con CAS de `storeRevision`, identidad vinculada a misión/paso/acción/target y controles de replay. **No liquida ni modifica `effectJournal`.**
- Para reparaciones, la línea de ejecución exige una obligación `PREPARED` única y coincidente, y exige que la revisión de entorno de la operación coincida con la capturada en `PREPARED`.
- Si la revisión falta o difiere, la operación falla cerrada antes de guardar línea de ejecución.
- La reconstrucción de una obligación sin resolver conserva la misión bloqueada. `settled_observed` también reconstruye bloqueada y dirige a verificar el objetivo sin redispatch.
- Hay scripts de preparación, dispatch, liquidación observada y verificación de objetivos para reparaciones convergentes. La ruta de settlement registra observación, no causalidad, y no está conectada al runtime productivo.
- Se añadió una prueba de crash cuts para la frontera donde Lúmina ya persistió pero Nexo continúa PREPARED, para revisión de entorno no relacionada y para invariante ausente.
- La corrección del fixture de prueba de persistencia se verificó en CI.
- Los workflows exactos indicados en la sección 5 pasaron.

### No está hecho / no se debe afirmar
- M0 sigue INCOMPLETO.
- `src/nexo/runtime.js` todavía utiliza rutas de memoria legacy desde `src/assistants/memory.js`; la migración del runtime no está terminada.
- No hay prueba de arranque completo de Nexo → frontera real de efectos protegidos.
- No existe atomicidad entre el almacén de continuidad de Nexo y el archivo persistido de entorno de Lúmina.
- `recordExecutionLineage()` no autentica evidencia externa ni prueba causalidad; un objeto caller-provided con `status: completed` o `verified: true` no es prueba independiente.
- `settled_observed` no significa `completed`; no debe habilitar ejecución, redispatch ni efectos protegidos.
- No hay evidencia de migración real de dispositivo ni de ejecución protegida autorizada.
- STEP 7 permanece `OPEN / STOP / UNKNOWN`. No reabrirla ahora salvo que M0 dependa concretamente de un requisito suyo.
- No se debe declarar todo M0 terminado porque pasaron tres workflows de CI.

## 3. Cambios de código recientes

### A. Owner-backed execution lineage
Archivo principal: `src/nexo/core/continuity-owner.mjs`.

La API `recordExecutionLineage({ expectedRevision, operation, result })`:
- valida contexto e identidad de la operación;
- usa `storeRevision` esperado y rechaza revisiones obsoletas;
- verifica que la misión y el paso existan y que acción/target coincidan;
- requiere una única entrada `effectJournal` con misma clave idempotente, misión, paso, acción y target y estado `prepared`;
- para `repair_agent_state`, `repair_agent_needs`, `repair_resource_state`, requiere revisión de entorno válida y coincidente con la revisión persistida en PREPARED;
- no duplica una identidad de ejecución existente ni reemplaza su primer registro;
- registra lineage, pero devuelve `journalSettled: false` y no modifica el estado del journal.

Códigos de bloqueo importantes:
- `NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED`
- `NEXO_EXECUTION_PREPARED_IDENTITY_MISMATCH`
- `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`
- `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`
- `NEXO_CONTINUITY_STORE_REVISION_CONFLICT`

### B. Recovery de reparación persistida
Archivos relevantes:
- `scripts/nexo-repair-preparation.mjs`
- `scripts/nexo-repair-dispatch.mjs`
- `scripts/nexo-repair-settlement.mjs`
- `scripts/nexo-repair-mission-verification.mjs`
- `src/nexo/adapters/persisted-repair-observation.mjs`
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`
- `tests/nexo/simulation-restart-persistence.test.mjs`

Límites comprobados:
- preparación carga estrictamente el estado persistido y liga la revisión a PREPARED;
- dispatch requiere que la revisión persistida siga siendo exactamente la preparada;
- la persistencia usa la primitiva condicional existente de `persistState()`;
- si el resultado de persistencia es ambiguo, no se redispatcha automáticamente;
- settlement solo puede producir `settled_observed` si la revisión del entorno es la preparada o la inmediatamente siguiente y la invariante de reparación está presente;
- si la revisión es más avanzada/no relacionada o falta la invariante, se mantiene PREPARED;
- la atribución causal se registra como `not_claimed`;
- la reconstrucción de `settled_observed` queda bloqueada y solicita verificación sin redispatch.

### C. Corrección del test de revisión persistida
`applyState()` crea simulación en memoria y no conserva `stateRevision` del snapshot persistido. La prueba había calculado la revisión siguiente desde el objeto de simulación y fallaba. Se corrigió para conservar el snapshot estrictamente cargado (`changedGoalSource`) y calcular `changedGoalSource.stateRevision + 1`. No se cambió la persistencia de Lúmina para acomodar el test.

### D. Owner-backed durable outcome recording — latest increment

Added `recordOutcome({ expectedRevision, outcome })` to `src/nexo/core/continuity-owner.mjs`. It persists step outcomes through Nexo's own store CAS, binds them to the stored mission/step/action/target, preserves the first attempt, and refuses completed outcomes while the matching effect journal remains `prepared` or `settled_observed`. The method does not settle the journal and reports authorization as `NOT_EVALUATED`.

Regression coverage was added to `tests/nexo/continuity-migration.test.mjs` for required completion evidence, durable reconstruction, replay immutability, and the unresolved-effect guard. The focused M0 workflow now runs both continuity migration and repair crash-cut tests.

Evidence:
- Owner implementation: `cd559da754ca407da25095f689e434e314597e42`
- Unresolved-effect completion guard: `d6eed85aadcb106eeed7cfb44c0e47d215c4b5af`
- Exact source + test head: `c7a8852b791dec8a2bee64cda6126aa1658af198`
- Focused workflow: [39140292963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140292963) — SUCCESS; crash-cut and continuity-migration test steps passed.
- Mission/restart [39140282526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282526), STEP 4 [39140282510](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282510), STEP 5 [39140282488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282488) — SUCCESS on the source/test head.
- Detailed checkpoint: `NEXO_NCS/BUILD/NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md`.

This is a persistence primitive, not runtime cutover. Runtime still uses legacy memory. No independent evidence authentication, cross-store atomicity, authority, or protected-effect authorization is claimed.

## 4. Commits de referencia y evidencia

Los SHAs siguientes identifican cambios concretos; consultar GitHub para HEAD real antes de hacer más cambios.

### Owner/lineage y endurecimiento
- Owner inicial lineage: `f5e9e20c9911f75b66624aa62c4af020e185a326`
- Test inicial lineage: `014b589ff84e1bdae5d7f4ef44068264b70cf363`
- Owner exige PREPARED: `71b2db0b83e190f9f6d13c765a4e1bc85857903d`
- Regresión sin PREPARED: `9971058e2477aa458e6afebdb240f4a52b3b2401`
- Bloqueo de reconstrucción `settled_observed`: `98caddd0edd81908c2f07b199391e9fe85dbeeae`
- Owner liga la revisión de entorno de lineage a PREPARED: `291d482a2f1e03294c519bb8971fcce0b1c69176`
- Regresión de revisión discrepante: `4667d3b3cbe4a587c6e53118961437b2db733958`
- Corrección del fixture crash-cut: `ea1a8390c2826021feab46f3197c84a1a4f47039`
- Pruebas de revisión ausente y discrepante: `12452f8d851c646d3cb7674cd0f59d7ba1246fe1`

### Documentación actualizada
- Estado: `NEXO_NCS/STATUS.md`
- Handoff de migración: `NEXO_NCS/BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md`
- Checkpoint lineage: `NEXO_NCS/BUILD/NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md`
- Análisis de fence cross-store: `NEXO_NCS/BUILD/NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md`
- Decisión de consumidor de goal observation: `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md`

## 5. CI verificado — no extrapolar fuera de estos heads

Exact-head test commit `12452f8d851c646d3cb7674cd0f59d7ba1246fe1`:
- Mission/restart continuity: run [39139024311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024311). El job confirma éxito de `tests/nexo/simulation-restart-persistence.test.mjs` y `tests/nexo/continuity-migration.test.mjs`.
- STEP 5 outcome classification: run [39139024315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024315).
- STEP 4 semantic validation: run [39139024377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024377).

También existe:
- Crash-cut settlement run [39138771613](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138771613), para el owner code head `291d482a2f1e03294c519bb8971fcce0b1c69176`.
- La verificación de crash cuts cubre las condiciones descritas, no la atomicidad entre almacenes ni la integración del runtime.

**Regla de evidencia:** no copiar “PASS” a commits posteriores sin comprobar su propio run/job/log. Si la documentación cambia después del head probado, el código no necesariamente cambia, pero tampoco se debe presentar el nuevo head documental como si fuera el head exacto probado por esos workflows.

## 6. Decisiones ya cerradas; no repetir auditorías

- La verificación de objetivo en `scripts/nexo-repair-mission-verification.mjs` es de solo lectura. No hay consumidor productivo demostrado que requiera persistir un estado terminal `goal_observed`; el runtime no la llama. Por tanto, no crear un fence cross-store solo para persistir ese estado no utilizado. Revalidar el estado actual cuando un consumidor lo necesite.
- No reabrir las auditorías P112 ya realizadas:
  - `NEXO_CONTINUITY/P112_PERSISTSTATE_FINAL_COMMIT_FEASIBILITY_AUDIT_V1_2026-10-07.md`
  - `NEXO_CONTINUITY/P112_PERSISTSTATE_PHYSICAL_BOUNDARY_CRASH_CUT_AUDIT_V2_2026-10-07.md`
  - `NEXO_CONTINUITY/P112_PROTECTED_OWNER_AGAINST_EXISTING_PERSISTENCE_PRIMITIVE_V1_2026-10-07.md`
  - `NEXO_CONTINUITY/P112_WRITER_DEPENDENCY_GRAPH_V1_2026-10-07.md`
- No hacer un transaction wrapper genérico, no inventar revisiones globales, IDs, colas, retries, tombstones ni hooks solo para tests.
- No quitar todavía el path legacy de memoria.
- No conectar todavía settlement ni lineage al runtime como si fueran autoridad para ejecutar.
- No afirmar que una revisión contigua prueba causalidad: es una restricción conservadora de reconciliación, no una prueba causal.

## Incremento adicional — integración repair-only (2026-10-18)

Se añadió `tests/nexo/repair-owner-lifecycle.test.mjs`, una regresión integrada sobre los helpers reales existentes. Cubre la secuencia:
1. continuidad legacy importada al store Nexo separado;
2. PREPARED comprometido contra la revisión de entorno 10;
3. dispatch repair-only con persistencia condicional del entorno en revisión 11;
4. settlement separado como `settled_observed`, sin causalidad afirmada;
5. verificación de solo lectura `goal_observed`, sin marcar misión completada ni mutar continuidad;
6. aserción de que el archivo de Lúmina no incluye `nexoMemory`.

Workflow modificado para ejecutar el test: `.github/workflows/nexo-m0-repair-crash-cuts.yml`.

Commits:
- Test integrado: `eddf41c542b252329e45304245728a7bdb5d6800`
- Workflow: `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`
- STATUS: `42af7045279ddc494abc8c2b4f984a5506781596`

CI enfocado [39140959531](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140959531) completó **SUCCESS** en el SHA exacto del workflow `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`. El job `repair-crash-cuts` y los pasos de crash-cut, migración y lifecycle integrado finalizaron `success`. Esta prueba todavía **no** integra `runtime.js`; valida el flujo repair-only de los helpers ya existentes. Los commits documentales posteriores no cambian el SHA al que aplica esta evidencia.

## Incremento — CI trigger coverage corregida (2026-10-18)

El workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml` ahora activa CI ante cambios en preparación, dispatch, settlement, verificación de misión, migración de continuidad y la prueba integrada. Antes, varios de esos inputs no estaban en `paths`, por lo que una edición podía no ejecutar el workflow focalizado.

- Commit: `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`.
- CI exacto: [39141182732](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141182732), **SUCCESS** sobre ese mismo SHA; todos los tres pasos de test configurados finalizaron `success`.
- Pendiente como regresión explícita: replay después de `settled_observed` y revisión de entorno obsoleta entre PREPARED y dispatch. No inferir que están cubiertos por el PASS actual.

## 7. Siguiente tarea concreta

**La inspección dirigida y el mapa de integración ya están hechos; no repetirlos. El siguiente paso es definir y probar la entrada owner-backed real para la ruta repair-only antes de conectarla al runtime general.**

Estado actual de la inspección (revalidado en HEAD antes de esta actualización):
- `scripts/assistants.mjs` ya usa `owner.recordMission()` para persistir la misión en el store independiente; no ejecuta misiones.
- `scripts/simulate.mjs` abre continuidad para migración legacy/diagnóstico, pero no ejecuta misiones.
- `src/nexo/runtime.js` sigue usando `src/assistants/memory.js` para plan, execution, outcome y reconstruction; no hay caller productivo demostrado que ejecute `executeLuminaNexoStep()`.
- `world-state.json` excluye `nexoMemory`; la regresión de reinicio ya verifica esa separación. No reintroducirla.
- El owner tiene `recordMission`, `recordPrepared`, `recordExecutionLineage` y `recordOutcome`, pero el último no autentica evidencia externa y ninguno autoriza efectos protegidos. `settled_observed` no equivale a misión completada.

Secuencia obligatoria:

1. Diseñar una sesión/entrada de ejecución **específica para las tres reparaciones convergentes existentes**; no una capa genérica de transacciones. Debe cargar misión canónica, mantener `storeRevision`, preparar antes del dispatch, usar el fence de `stateRevision`, liquidar solo por observación persistida y volver a verificar el objetivo.
2. La recuperación de un PREPARED preexistente no debe redispatchar automáticamente. Si el estado persistido no prueba la invariante, dejar PREPARED/UNKNOWN y detenerse.
3. Añadir primero pruebas con archivos temporales para: ejecución repair-only normal; crash/reinicio después de PREPARED; crash tras persistencia de entorno antes de settlement; revisión de entorno obsoleta; conflicto del store Nexo; invariant ausente/UNKNOWN; y comprobación de que el resultado nunca afirma causalidad ni misión completada.
4. Ejecutar CI para ese test y revisar el log exacto. Solo después implementar el mínimo helper owner-backed y volver a ejecutar las pruebas. No conectarlo todavía a efectos no idempotentes ni a la ruta protegida general.
5. Mantener la ruta legacy disponible hasta que una prueba end-to-end cubra arranque, misión canónica, dispatch elegible, recuperación, reinicio y rollback/fallback seguro. Corrupto/missing desconocido no se convierte en memoria vacía.
6. Verificar HEAD y CI sobre el SHA exacto; actualizar `STATUS.md` y este handoff con commits y run IDs. No extrapolar PASS a un SHA sin run/job/log.
7. Solo después decidir el punto mínimo de conexión a `runtime.js`. M0 no se declara completo hasta que el runtime de Nexo usa su continuidad propia con persistencia/reinicio/migración/rollback probados y sin mezclar Lúmina.

## 8. Criterios de “no avanzar todavía”

Detener el corte y rediseñar la raíz si:
- la continuidad de Nexo sigue siendo serializada junto al estado de Lúmina;
- el runtime no tiene una fuente canónica para su memoria operativa;
- un error de carga se transforma en inicialización vacía;
- un resultado de adapter puede liquidar PREPARED sin evidencia independiente;
- un restart permite redispatch no seguro;
- un commit de Nexo se presenta como atómico con un commit de Lúmina sin fence real;
- los tests prueban solo funciones aisladas y no el camino real de arranque/runtime;
- la evidencia no conecta trigger → run → job → head → artefacto/log → interpretación.

## 9. Mensaje operativo al siguiente asistente

Trabaja directamente en el repositorio con cambios concretos, inspecciones dirigidas y pruebas. No respondas con otra recapitulación extensa como sustituto de avance. No repitas las mismas explicaciones cada turno. No marques tareas terminadas solo porque el usuario diga “continúa”. El usuario quiere iniciativa, pero exige precisión y continuidad.

La misión es M0. Todo lo que no desbloquee M0 debe esperar.


---

## Update de continuidad — contrato de sesión de runtime (2026-10-18)

### Último trabajo real
- Rama inspeccionada antes del cambio: `7ed44d7179988e07cd0e19bbe5a5ab486eb9e191`.
- El flujo repair-only mantiene CI SUCCESS en [39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), exacto al SHA de código/pruebas `e36121220d4d89475a68bc4bf1a0d2880b4092be`. No trasladar ese PASS a commits documentales posteriores.
- Se inspeccionaron directamente `scripts/nexo-repair-entrypoint.mjs`, `scripts/nexo-repair-dispatch.mjs`, `tests/nexo/repair-owner-lifecycle.test.mjs`, `src/nexo/runtime.js` y `scripts/assistants.mjs`.
- Confirmación: el entrypoint repair-only está aislado de runtime; `runtime.js` sigue con outcomes en memoria legacy; `assistants.mjs` persiste una misión en owner pero no ejecuta sus pasos. No existe todavía un camino productivo completo owner-backed.
- Nuevo documento de contrato: [NCS_M0_RUNTIME_SESSION_CONTRACT_2026-10-18.md](NCS_M0_RUNTIME_SESSION_CONTRACT_2026-10-18.md), commit [d654583139df69202a726981a53878f32219cffa](https://github.com/snowdenxrp/aldea-ia/commit/d654583139df69202a726981a53878f32219cffa). STATUS actualizado en commit [4492fb32b500723312f0ba3f18159738c40b49d0](https://github.com/snowdenxrp/aldea-ia/commit/4492fb32b500723312f0ba3f18159738c40b49d0).

### Siguiente tarea concreta — implementación test-first
1. Inspeccionar las APIs existentes de `createNexoContinuityOwner()`, reconstrucción de misión y commits CAS para reutilizarlas; no crear un segundo modelo de misión ni duplicar el owner.
2. Crear una prueba de integración contra la API propuesta de sesión owner-backed, usando archivos temporales y un owner reabierto desde disco. Debe demostrar: selección de misión/paso canónicos, PREPARED durable antes de dispatch, reparación elegible, recuperación tras crash y replay bloqueado.
3. Implementar solo el mínimo de sesión que satisfaga esa prueba. Si el owner actual no puede expresar alguna transición necesaria, identificar la brecha exacta antes de alterar contratos.
4. Mantener el dispatcher limitado a `repair_agent_state`, `repair_agent_needs`, `repair_resource_state`. No pasar `execute_lumina_action`, acciones no idempotentes ni protegidas.
5. Ejecutar el workflow pertinente y verificar run → job → SHA exacto. Actualizar STATUS/handoff después de evidencia, no antes.
6. Solo cuando la sesión real tenga tests de crash/restart, estudiar su conexión mínima con runtime. No reemplazar imports legacy ni declarar M0 completo antes de demostrar el arranque/camino productivo.

### No cambiar
- No volver a abrir P112/AB104 ni investigaciones cerradas.
- No incorporar memoria Nexo en `world-state.json`.
- No interpretar `settled_observed` como completion o causalidad.
- No afirmar atomicidad entre el store Nexo y el estado persistido de Lúmina.
- M0 sigue incompleto; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


---

## Actualización posterior — primera sesión repair-only owner-backed (2026-10-18)

### Implementación
- Nuevo `scripts/nexo-repair-session.mjs`: exporta `runNexoRepairSession()`. El caller selecciona solo `missionId` y `stepId`; acción y target se obtienen de la misión/paso del snapshot canónico de Nexo. Se rechazan identidades de misión/paso ausentes o duplicadas, pasos terminales y acciones fuera de la allowlist de reparación.
- La sesión llama al entrypoint existente `runNexoRepairOnce()`; por tanto conserva PREPARED durable antes del dispatch, revisión condicional de entorno, settlement observado separado y recovery fail-closed.
- Nuevo `tests/nexo/repair-session.test.mjs`: prueba la sesión real para reparación normal, rechazo de `execute_lumina_action` sin PREPARED ni escritura, y recuperación tras el crash cut entorno-persistido/settlement-pendiente con owner reabierto desde disco. La recuperación no redispatcha ni incrementa otra vez la revisión del entorno. Confirma separación física de `world-state.json`.
- Workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml` actualizado para incluir sesión y prueba.

### Evidencia
- Un primer CI falló por imports relativos incorrectos del test en commit `e7eb93294de02951a988b6770c19507f11cf9e91`; el log señaló exactamente que buscaba `tests/nexo/nexo-continuity.mjs`. Se corrigieron los imports en `a04483f34cd54dda9ee346bd1980ffacf8aff7a9`; CI [39142614805](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142614805) pasó.
- Después se añadió crash-recovery a través de la API de sesión, no solo a través de helpers. El commit exacto de código/pruebas `b011a8078f9f0562a61a3bafb9c260810147ea84` pasó en [CI 39142674734](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142674734): job `repair-crash-cuts` y sus cuatro pasos de prueba SUCCESS.
- STATUS actualizado en commit [db9de499677c184c02a71bedfe07cede51b5d2d9](https://github.com/snowdenxrp/aldea-ia/commit/db9de499677c184c02a71bedfe07cede51b5d2d9).

### Próxima frontera (no declarar M0 completo)
1. Auditar qué contrato mínimo hace falta para que esta sesión sea invocada por el runtime real sin entregar acción/target desde un caller no confiable. No cambiar `executeNexoStep()` genérico para que invoque el dispatcher de reparación.
2. Diseñar prueba de arranque/entrada real del runtime que abra continuidad canónica y ejecute solo un paso repair-only elegible; mantener la ruta legacy disponible para rollback hasta que esa prueba y sus crash cuts pasen.
3. Incorporar línea de ejecución solo si puede registrarse de forma coherente sin presentar `settled_observed` como causalidad/completion. `recordExecutionLineage()` exige PREPARED y conserva el journal sin liquidar; no usarlo para simular prueba independiente.
4. Actualizar docs tras pruebas, verificando siempre SHA/run/job exactos.

**Límite:** esto ya no es solo un conjunto de helpers; existe una sesión owner-backed y probada para reparación convergente. Aun así no está conectada a `src/nexo/runtime.js`, no representa todo el runtime productivo y no cierra M0. No hay atomicidad cross-store ni permiso para efectos protegidos.


---

## Continuidad más reciente — puente opt-in de runtime (2026-10-18)

### Implementado
- `scripts/nexo-runtime-session.mjs` exporta `runNexoRuntimeRepairSession()`. Lee el owner actual, exige una sola misión candidata y selecciona un único paso de reparación `planned` cuyas dependencias estén completadas. Acción y target se vuelven a derivar en `runNexoRepairSession()` desde la continuidad canónica.
- `scripts/assistants.mjs` tiene una conexión explícita y opt-in con `--nexo-repair-once`. El flujo normal no despacha reparaciones. Con el flag, el snapshot inicial del entorno se persiste primero, se ejecuta la sesión después y se vuelve a leer el estado para informar la revisión final, evitando que la escritura anterior del mismo proceso sobrescriba la reparación.
- Endurecimiento: la sesión directa solo admite estado `planned` y dependencias canónicas satisfechas; no confía en que el wrapper sea el único caller.
- Tests cubren puente, repair-only, recuperación tras reapertura del owner, no redispatch, acción no elegible, dependencia no satisfecha y separación Nexo/Lúmina. Workflow incluye además `node --check scripts/nexo-runtime-session.mjs && node --check scripts/assistants.mjs`.

### Evidencia verificada
- [CI 39143194694](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143194694) SUCCESS en SHA `3c414ff2d0b8ebd8f880e8a37e83602138924395`; job `repair-crash-cuts`, cuatro regresiones y comprobación sintáctica SUCCESS.
- La suite de integración del puente pasó primero en [CI 39143167854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143167854) con SHA `93dc2cf3ed070fed35298a4777e43804e862fdef`; el run más reciente suma la comprobación de sintaxis.
- STATUS actualizado en commit [af4ebdd9eed77fab0bcc35abbed798e885b5de99](https://github.com/snowdenxrp/aldea-ia/commit/af4ebdd9eed77fab0bcc35abbed798e885b5de99).

### Siguiente tarea inmediata
Crear una prueba de proceso aislada que invoque la entrada real `scripts/assistants.mjs --nexo-repair-once` con fixtures/directorio temporal y nunca toque `world-state.json` real. Probar también el modo por defecto sin dispatch. La entrada actual usa rutas derivadas de `import.meta.url`; para testearla de forma segura, extraer solo el mínimo bootstrap/configurable de paths o introducir un proceso fixture sin cambiar la ruta productiva por defecto. No añadir abstracciones generales. Verificar que el resultado CLI refleja la revisión final del entorno después de la reparación. Solo después considerar cutover gradual de la ruta legacy.

**Límites:** la integración está opt-in y acotada a tres reparaciones; no se ha ejecutado con datos reales. No es el runtime genérico completo, M0 no está cerrado, no hay atomicidad cross-store, `settled_observed` no significa completion ni causalidad, efectos protegidos STOP, Nexo y Lúmina separados, STEP 7 OPEN / STOP / UNKNOWN.


---

## Actualización — CLI real aislado con opt-in (2026-10-18)

### Código
- `scripts/assistants.mjs` acepta paths temporales por `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH` y `NEXO_CONTINUITY_PATH`. En ausencia de esas variables, conserva los paths normales del repositorio.
- Nuevo `tests/nexo/assistants-runtime-cli.test.mjs` lanza el proceso Node real del entrypoint de asistentes, no solo una función importada, con dos fixtures en directorios temporales:
  1. Sin flag: no se llama a la sesión; el journal permanece vacío.
  2. Con `--nexo-repair-once`: la sesión selecciona una reparación de la misión canónica, persiste la reparación, el journal queda `settled_observed`, el entorno llega a revisión 2 y la salida CLI informa la revisión final. El estado guardado no incluye `nexoMemory`.
- Se corrigió `src/assistants/debugger.js`: los hallazgos de posición/necesidad inválida incluyen `agent`, para que el plan derive un target de agente en vez de `null`.
- Workflow ejecuta este proceso test además de las cuatro regresiones anteriores y chequeos sintácticos.

### Evidencia
- [CI 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529) SUCCESS sobre el SHA exacto de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`; todos los pasos del job `repair-crash-cuts` terminaron correctamente.
- Primer intento falló por falta de continuidad heredada explícita en el fixture; segundo identificó que el script conserva exit code 1 por el diagnóstico inicial deliberadamente erróneo aunque la reparación pueda asentarse. Se corrigió el fixture y la aserción; no se eliminó el estado de error del reporte original. La sesión reporta su resultado por separado.
- STATUS actualizado en commit [cb54fc0b5b1560e84ed29a60a86b2f4fb9c1291b](https://github.com/snowdenxrp/aldea-ia/commit/cb54fc0b5b1560e84ed29a60a86b2f4fb9c1291b).

### Próxima frontera
1. Diseñar el corte de la memoria operativa de runtime: ahora `scripts/assistants.mjs` crea una vista legacy local `nexoMemory` para construir misiones y luego registra la misión canónica en el owner. El nuevo puente solo ejecuta el paso canónico y no completa la migración de memoria/outcomes.
2. Evitar doble escritura o tratar la memoria legacy como autoridad. Primero mapear las lecturas/escrituras necesarias en `src/nexo/runtime.js` y `scripts/assistants.mjs`; luego prueba de proceso de reinicio y CAS con una sola fuente canónica.
3. No promover `settled_observed` a completion ni borrar el diagnóstico anterior; cualquier verificación de objetivo debe tener contrato explícito y evidencia persistida.
4. Mantener el flag opt-in hasta que la ruta canónica de memoria/outcome y las pruebas de restart/replay pasen.

**Límites:** CI usa solo fixtures temporales; no se tocó el `world-state.json` real. No es prueba de despliegue en dispositivo ni runtime genérico completo. M0 sigue abierto, reparación opt-in, efectos protegidos STOP, sin atomicidad cross-store y Nexo/Lúmina separados.


---

## Update M0 — frontera de corte de memoria legacy (2026-10-18)

Nueva auditoría dirigida: [NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md](NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md), commit `f2b14a63665df50a99ea576d44db00092e2f7ca4`.

### Hallazgo decisivo
No hacer sustitución mecánica de `src/assistants/memory.js` por `continuity-owner`. `executeNexoStep()` despacha primero y compromete outcome después en memoria de proceso. La API owner-backed exige revisión CAS y PREPARED concordante; `recordOutcome()` bloquea completion cuando existe journal `prepared` o `settled_observed`. La separación entre outcome, settlement y completion es deliberada.

### Próximo trabajo obligatorio
1. Resolver mediante prueba el estado durable posterior a `settled_observed`: qué observación permite registrar outcome de misión sin afirmar causalidad ni promover settlement a completion.
2. Implementar solo una ruta owner-backed mínima basada en `missionId/stepId` canónicos; acción y target siempre desde snapshot, nunca desde caller.
3. Añadir pruebas de CAS conflictivo, reinicio, replay, PREPARED pendiente, entorno persistido antes del settlement y estado UNKNOWN.
4. Mantener la ruta genérica y los efectos protegidos apagados; no cambiar el dispatcher repair-only a acciones generales.
5. Ejecutar CI y verificar SHA/run/job exactos antes de presentar el código como validado. El CI disponible `39143459529` valida SHA `a1fea5791adbb81a8d6b6e82da9dad09accc7918`, no el HEAD documental actual `1cee895229e6980b8f142571a28a820fed7eef04`.

No repetir el mapa de llamadas ni reabrir AB/P/P112. M0 sigue abierto; Nexo y Lúmina no se mezclan; no hay atomicidad cross-store; `settled_observed` no significa causalidad ni completion; efectos protegidos STOP.


---

## Incremento M0 — verificación persistida del objetivo sin declarar completion (2026-10-18)

Se añadió `tests/nexo/repair-mission-verification.test.mjs` y se conectó al workflow de crash cuts. CI exacto: [39144348792](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144348792), commit `1d12c8e65aff1be75b04c0acee2fbc513b8ba5f4`, job `repair-crash-cuts` SUCCESS y todos los pasos SUCCESS, incluido el nuevo test de verificación.

La prueba confirma:
- Después de settlement, el verificador puede devolver `goal_observed`, pero `missionCompleted:false` y `causalAttribution:not_claimed`.
- Reabrir el owner y repetir la observación no cambia la revisión de continuidad.
- Si la invariante ya no está presente en una revisión de entorno posterior, la observación queda bloqueada.
- PREPARED sin resolver bloquea; misión desconocida produce UNKNOWN.

Esto valida el contrato de observación, no una transición de misión a completion ni el runtime genérico productivo. No se ha añadido un estado durable nuevo. Siguiente paso: auditar si hace falta representar `goal_observed` como dato durable separado, qué revisión/identidad debería enlazar y cómo evitar que replay convierta una observación histórica en verdad actual; solo después proponer la transición mínima y sus pruebas CAS/restart.

El CI anterior corresponde al commit de código/prueba indicado; las actualizaciones documentales posteriores no están cubiertas por ese run. M0 sigue abierto; repair-only opt-in; efectos protegidos STOP; Nexo y Lúmina separados; no atomicidad cross-store.

---

## CI adicional — objetivo observado no desbloquea redispatch (2026-10-18)

Se amplió `tests/nexo/repair-mission-verification.test.mjs` para comprobar que la reconstrucción canónica, después de `goal_observed`, conserva misión y paso en `blocked` bajo `NEXO_REPAIR_SETTLED_BY_OBSERVATION`. Así se prueba que observar el objetivo no modifica la continuidad ni habilita un redispatch accidental.

CI exacto: [39144434201](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144434201), SHA `ec36dd7df7cccf57f372d2cf252444ce28292e84`, workflow de crash cuts SUCCESS; todos los pasos, incluido el test de verificación, SUCCESS.

**Semántica probada:** el journal conserva `settled_observed`; la función de verificación devuelve `goal_observed` sin escritura; la reconstrucción aún no tiene una transición durable que resuelva la misión y la deja bloqueada. No introducir completion implícita.

Próximo trabajo: definir si conviene un registro separado de observación de objetivo y su regla de vigencia ligada a la revisión del entorno. Debe quedar invalidable si la invariante desaparece; un dato histórico no puede reemplazar observación actual. Probar CAS/restart/replay antes de añadir persistencia. Runtime genérico sigue sin migrar; M0 abierto.

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


## Última frontera cerrada — replay y falsa promoción de misión (2026-10-18)

La prueba añadida en commit `fd2331e8d71afbbf0f19ea978d552a89087c1dc6` extiende `tests/nexo/repair-owner-lifecycle.test.mjs`: después de `settled_observed`, intenta registrar un outcome `completed` usando etiquetas de evidencia suministradas por el caller. La operación debe bloquearse con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, sin mutar la revisión. Luego reconstruye la misma misión tanto en el owner vivo como tras reabrir el store desde disco; permanece `blocked` con objetivo `verify_observed_repair_goal`.

**CI exacto en el SHA de prueba:** repair crash cuts [39145754425](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754425) SUCCESS; STEP 4 [39145754371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754371) SUCCESS; STEP 5 [39145754375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754375) SUCCESS.

Esto cierra la regresión de promoción/replay para el contrato repair-only, no el corte del runtime genérico. Próximo trabajo: revisar el contrato canónico de estado/outcome para definir cómo una verificación independiente de objetivo puede registrar progreso sin convertir `settled_observed` en causalidad; después migrar una única operación legacy, con PREPARED durable antes de dispatch, CAS y replay de reinicio probados. No cambiar imports legacy mecánicamente. No ampliar el dispatcher a acciones no-repair o protegidas.


## Último avance — límites del verificador de objetivo (2026-10-18)

Se añadieron regresiones que hacen que `verifyRepairMissionGoalFromPersistedState()` falle de forma cerrada si la invariante ya no está presente en una revisión posterior, o si el estado persistido aparece con una revisión menor que la registrada en settlement. Resultados esperados: `blocked / NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT` y `unknown / NEXO_REPAIR_MISSION_ENVIRONMENT_REVISION_ROLLBACK_OR_REPLAY`. Ambas rutas dejan intacta la revisión del store Nexo.

Prueba commit `d01384083368d1b9f52ad5c327dc4b1985e5573a`; CI verde: repair [39146476081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476081), STEP 4 [39146476199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476199), STEP 5 [39146476145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476145).

Se intentó agregar una colección `goalObservations`, pero se detectó que el cambio solo modificaba la lista de colecciones y rompía el contrato de snapshot/store/migración. Se registró CI fallido en runs 39146494871 y 39146494887 y se revirtió el cambio incompleto en commit `16c51fc994de1ca8a6471fa30f9060068b998da8`. No se debe volver a añadir esa colección como parche de una sola línea: si se requiere persistir observaciones, primero definir contrato de procedencia, compatibilidad de snapshots existentes, migración, CAS, replay y semántica explícita de que observación no equivale a completion.

El HEAD actual es `864ab85d38bf67040ef5a662dd8769cad3ea4c9f`; el último CI verde citado corresponde al padre `16c51fc994de1ca8a6471fa30f9060068b998da8`. Confirmar run exacto sobre HEAD antes de declararlo validado. Próximo paso: diseñar el contrato de goal observation sin confiar en `verified/source` enviados por caller, y solo entonces decidir si requiere una colección durable o si la lectura read-only satisface el límite de M0 actual.


## Último cambio de código probado — estabilidad del snapshot de continuidad (2026-10-18)

El verificador `verifyRepairMissionGoalFromPersistedState()` ahora vuelve a leer continuidad antes de devolver un resultado positivo. Si la revisión cambió desde la lectura inicial, responde `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. Prueba de regresión en `tests/nexo/repair-mission-verification.test.mjs` simula el cambio y comprueba el código, estado y dos lecturas.

Commit exacto: `57f3bffb52989a924bdbc5fb4fc626d803e6988f`. CI verde sobre el mismo SHA: repair [39146959705](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959705), STEP 4 [39146959738](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959738), STEP 5 [39146959691](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959691). El workflow repair confirma explícitamente el paso de verificación del objetivo.

Esto evita un PASS basado en continuidad que cambió durante la verificación; no es atomicidad cross-store ni cubre cambios que ocurran después de la lectura final. No persistimos aún goal observations, no declaramos misión completada y no migramos el runtime genérico. Siguiente: diseñar un contrato de observación durable/procedencia solo si el requisito de continuidad M0 lo necesita; de lo contrario, delimitar con precisión qué prueba de punto en el tiempo requiere el cutover. No añadir una colección de snapshot sin contrato/migración completos.


## Último estado M0 — decisión de cutover y guard de continuidad (2026-10-18)

Nueva decisión: `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_AND_RUNTIME_CUTOVER_DECISION_2026-10-18.md`. No se añade `goalObservations` por ahora: la observación es read-only, no declara misión completa y la reconstrucción ya bloquea el paso `settled_observed` para impedir redispatch. El documento define el contrato mínimo de cutover y sus crash cuts.

Se conserva el guard y test determinista de cambio de `storeRevision` durante la verificación: `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. No afirmar atomicidad cross-store ni estabilidad del entorno a lo largo de toda la lectura. Se intentó una prueba de carrera ambiental pero no reprodujo el orden esperado; se retiró el test y el guard experimental antes de aceptar una falsa garantía. No ocultar ese límite ni reintroducirlo sin una prueba determinista.

Código/pruebas verificados sobre `fe9fe3b656fceff67be31722d7729ff6637a428b`: repair [39149853015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853015), STEP 4 [39149852997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149852997), STEP 5 [39149853023](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853023), todos SUCCESS. Próximo trabajo: inspeccionar el menor hueco demostrable entre PREPARED, lineage, observación y journal settlement antes de cualquier cambio de runtime. M0 INCOMPLETO; efectos protegidos STOP; no migrar runtime genérico aún.
