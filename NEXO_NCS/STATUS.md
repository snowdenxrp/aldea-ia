## M0 — bootstrap de Chronicle sin inicialización parcial evitable (validado 2026-10-18)

- Auditoría del entrypoint encontró que inicializaba Chronicle antes de comprobar si el almacén de continuidad estaba corrupto o ausente sin permiso de inicialización. Eso podía dejar un almacén Chronicle vacío como efecto lateral aunque la sesión completa fuera bloqueada.
- `scripts/nexo-chronicle-session.mjs` ahora preflighta ambos almacenes antes de inicializar ninguno. Un almacén corrupto, ilegible o ausente sin su flag de opt-in bloquea antes de escribir el otro. Después del preflight, la inicialización sigue sin promesa de atomicidad entre archivos: una carrera o fallo de E/S posterior puede dejar una inicialización parcial; no se reclama transacción cross-store.
- `tests/nexo/chronicle-runtime.test.mjs` comprueba ambos sentidos: continuidad corrupta no crea Chronicle ausente y Chronicle corrupto no crea continuidad ausente.
- SHA de código/test validado: `43827382ed27821182727c12a4ed6d03cc51ad36`. CI SUCCESS: [Chronicle vertical run 39174839208](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839208), [continuidad/runtime run 39174839267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839267), [STEP 4 run 39174839176](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839176) y [STEP 5 run 39174839133](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839133).
- Sigue sin cambiar el runtime default ni la separación Nexo/Lúmina. M0 permanece INCOMPLETO; la próxima frontera es revisar contrato de persistencia/recuperación y la integración de esta única capacidad, sin ampliar acciones ni inferir durabilidad ante pérdida de energía.

## M0 — Chronicle: identidad de operación sin colisiones (validado 2026-10-18)

- Auditoría del primer vertical detectó un caso de ambigüedad: la clave `missionId:stepId` no es inyectiva si alguno de los identificadores contiene `:`. Dos pares distintos podían formar la misma clave, haciendo que una entrada persistida ajena pareciera corresponder a la operación consultada.
- Corrección aplicada en `src/nexo/adapters/chronicle-effect.mjs`, `src/nexo/adapters/chronicle-observation.mjs` y `scripts/nexo-chronicle-session.mjs`: la acción, el verificador y la entrada CLI rechazan IDs con `:`; el verificador devuelve UNKNOWN para la consulta ambigua. No se cambia el formato canónico de identidad de otras acciones ni se inventan IDs alternativos.
- Regresiones: `tests/nexo/chronicle-store.test.mjs` verifica que la observación ambigua no se acepte; `tests/nexo/chronicle-runtime.test.mjs` verifica que la entrada rechace el ID antes de despachar.
- La primera ejecución de CI en SHA `bf5ef739b951b73455cf96782de706afce86accb` falló por una expectativa incorrecta del código de error en el test, no por el comportamiento del runtime: [run 39174663488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174663488). Se corrigió la expectativa para usar el código contractual `NEXO_CHRONICLE_ID_INVALID`.
- SHA final validado: `5c2305c9c07c0010dc3ff6a77b2bff8ed2f7742c`. CI SUCCESS: [Chronicle vertical, run 39174706702](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706702); [bounded continuity/runtime, run 39174706654](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706654); [STEP 4, run 39174706726](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706726); [STEP 5, run 39174706730](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706730).
- Estado: la identidad de esta vertical ahora tiene un delimitador no ambiguo por validación. Chronicle sigue siendo la única acción nativa habilitada por este entrypoint; no cambia runtime default, no se amplía a otras acciones y no se declara M0 completo.

## M0 — segundo guard: outcome no puede saltarse PREPARED (CI pendiente)

- Commit `d2d96e66e1870c24af31a8b78273d4b33909e999` amplía `tests/nexo/repair-settlement-crash-cuts.test.mjs`: intentar registrar `completed` directamente sobre un paso con efecto `prepared` debe devolver `blocked / NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, conservar el journal en `prepared` y no crear un attempt.
- Esto cubre un bypass distinto al de `reconcilePrepared()`: ni una observación arbitraria ni un outcome directo pueden cerrar la obligación pendiente. Es un guard contractual; no es settlement genérico implementado.
- El SHA nuevo no muestra status checks (`statuses: []`). CI continúa PENDING/UNKNOWN; no declarar PASS.

## M0 — guard contractual de settlement genérico (CI pendiente)

- Commit `df10a6466f23903d5b9a1c7ed2992be5a635bb59` agrega a `tests/nexo/repair-settlement-crash-cuts.test.mjs` una aserción explícita: `owner.reconcilePrepared()` debe seguir devolviendo `blocked / NEXO_EFFECT_RECONCILIATION_REQUIRED` aunque el caller aporte una observación con `desired_state_present`; el journal debe permanecer `prepared`.
- Es una prueba del límite actual, no implementación de settlement genérico. El owner no acepta todavía un verificador por acción; no se debe convertir una afirmación del caller en prueba del estado ambiental persistido.
- El push de este test debería activar el workflow focal. La consulta de checks del SHA devolvió `statuses: []`; ejecución y resultado siguen PENDING/UNKNOWN. No declarar PASS.

> **Continuidad de nuevo chat (2026-10-18):** antes de seguir, leer `NEXO_NCS/BUILD/NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md`. Es el handoff operativo vigente con HEAD observado, últimos cambios y CI, estado real de M0 y siguiente tarea exacta. No repetir auditorías cerradas. La misión sigue siendo M0: runtime canónico de Nexo, independiente de Lúmina.

## M0 — CI focal para replay de settlement agregado (ejecución pendiente de observar)

- Se añadió `.github/workflows/nexo-m0-settlement-replay.yml`, limitado a la rama `ncs-clean-architecture`, con trigger por cambios en el reconciliador/test/workflow y `workflow_dispatch`. Ejecuta exactamente `node tests/nexo/repair-settlement-crash-cuts.test.mjs` en Node 22.
- Commit que agrega el workflow: `cd8daa099f6778ef80d19cbdde51a8fbf010cda5`. El workflow y el test fueron releídos del branch. La consulta inmediata de status checks devolvió una lista vacía; todavía no se afirma que Actions haya ejecutado o aprobado el test.
- Propósito: hacer visible y reproducible la regresión de respuesta perdida sin lanzar toda la batería ni mezclarla con Lúmina. El workflow no habilita runtime ni cambia el alcance repair-only.
- Siguiente: confirmar el run y el SHA observado; si falla, leer el log exacto y corregir la causa. Solo después seguir con pruebas contractuales de settlement genérico en el owner. M0 sigue INCOMPLETO.

## M0 — recuperación de respuesta perdida durante settlement (implementado; CI pendiente)

- **Problema concreto:** si `store.commitIfCurrent()` escribía `settled_observed` y la respuesta se perdía/devolvía UNKNOWN, el reintento con la revisión esperada original devolvía conflicto antes de inspeccionar el journal. La continuidad canónica podía demostrar que el settlement sí estaba registrado, pero la API no podía recuperar esa incertidumbre.
- **Cambio:** `scripts/nexo-repair-settlement.mjs` ahora permite recuperar un settlement ya registrado únicamente si el registro persistido tiene forma válida, fuente `world-state.json`, observación `desired_state_present`, revisión ambiental ligada a la revisión PREPARED o la inmediatamente siguiente y `causalAttribution: not_claimed`. No vuelve a escribir, no despacha y no infiere causalidad.
- **Regresión añadida:** `tests/nexo/repair-settlement-crash-cuts.test.mjs` simula commit real seguido de respuesta UNKNOWN; el replay usa la revisión original y debe recuperar `settled_observed` desde el journal a revisión canónica 1. Las pruebas existentes de revisión ambiental ajena e invariante no demostrada siguen exigiendo que PREPARED permanezca.
- **Commits de código/test:** `1acf070385134ecbb6eeef78b7cec43b8a4a4916`, `b572724ec18e22b9f2f5fe10cd2e50e851e4fb84`, `3bc02acc1a1293e9c7726f44bf04cdbf4ad99724`. La consulta de runs asociados al último commit no devolvió runs; por tanto **CI todavía no está verificado** y no se afirma PASS.
- **Límite:** esta recuperación sigue siendo específica de repair y de la forma del journal actual. No implementa settlement genérico ni habilita el runtime genérico. M0 continúa INCOMPLETO; no conectar aún `src/nexo/runtime.js` ni convertir el bridge repair-only en genérico.

**Siguiente corte M0:** validar el nuevo test en CI; luego diseñar el contrato de reconciliación por acción con evidencia producida por un verificador confiable y persistido. El owner debe controlar la transición CAS del journal; un objeto de observación proporcionado libremente por el caller no debe bastar. No mezclar Lúmina con la continuidad canónica de Nexo.

## M0 — excepción del adaptador durante dispatch (2026-10-18, validado)

- **Hueco:** `scripts/nexo-repair-dispatch.mjs` invocaba `adapter.execute()` sin capturar una excepción que puede ocurrir después de un efecto parcial. La excepción cruda no expresaba que el resultado del efecto fuera desconocido.
- **Corrección:** el dispatcher acepta una `adapterFactory` inyectable para la regresión y captura la excepción en la frontera de dispatch. Devuelve `blocked / NEXO_REPAIR_ADAPTER_OUTCOME_UNKNOWN`, `persisted: false` y `uncertainty: adapter_call_may_have_applied_effect_before_throwing`. No afirma que el efecto no ocurrió, no reintenta y no avanza la revisión del entorno ni el journal PREPARED.
- **Regresión:** `tests/nexo/repair-owner-lifecycle.test.mjs` inyecta un adapter que lanza, y verifica resultado incierto, continuidad en revisión 1 con journal `prepared` y entorno sin revisión inventada.
- **Primer run de la regresión:** [39167516878](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167516878) falló porque el fixture usaba una clave no canónica; se corrigió a `mission-owner-lifecycle:step-repair`. No fue un fallo de la corrección del dispatcher.
- **Validación exacta:** commit de código `3f655a3f239ecaf87d4ba3dd1504bdfffa9a33df`; [CI Nexo M0 — repair settlement crash cuts, run 39167557221](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167557221) SUCCESS. STEP 4 run 39167557187 y STEP 5 run 39167557073 también SUCCESS en el mismo SHA.
- **Alcance:** cierra el hueco concreto del dispatch repair-only; no convierte ese dispatcher en runtime genérico ni completa M0.

**Siguiente trabajo:** volver a la integración del runtime genérico de Nexo y especificar el seam mínimo owner-backed. No repetir el audit de dispatch ni el de settlement ya cubiertos.

## M0 — gate de contrato genérico de efectos (2026-10-18)

Documento: [NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md](BUILD/NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md).

Decisión: no conectar el runtime por callback aislado ni despachar antes de persistir PREPARED. El runtime genérico necesita un contrato por acción para admisión canónica, PREPARED confirmado, dispatch, lineage, reconciliación del estado ambiental persistido, settlement CAS y outcome. El owner aún no tiene settlement genérico; `reconcilePrepared()` bloquea deliberadamente. La simulación de Lúmina en memoria no prueba recuperación durable tras restart. Acciones sin contrato deben bloquearse antes del adapter.

Siguiente corte: pruebas contractuales de reconciliación/settlement en el owner antes de conectar el runtime. No crear ledger paralelo ni fingir atomicidad cross-store. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

## M0 — seam del runtime genérico: callback PREPARED no basta (auditoría 2026-10-18)

- `src/nexo/runtime.js` ejecuta `adapter.execute()` antes de `commitRuntimeOutcome()`; el commit posterior muta la memoria legacy de `src/assistants/memory.js`. No hay exigencia universal de PREPARED durable en el owner antes del dispatch.
- `executeLuminaNexoStep()` pasa `persistPreparedIntent` al adaptador, pero ese callback es opcional. Sin callback, el journal es solo local/en memoria. Con callback, el adaptador persiste la intención antes del handler, pero su `persist()` terminal solo actualiza el journal local; no escribe execution lineage ni liquida el PREPARED del owner.
- `createNexoContinuityOwner().reconcilePrepared()` devuelve deliberadamente `blocked / NEXO_EFFECT_RECONCILIATION_REQUIRED`. No existe un reconciliador genérico autorizado por el mero hecho de que el adapter informe `completed`.
- **Conclusión:** conectar únicamente `persistPreparedIntent` al owner crearía PREPARED durable sin cerrar el ciclo de recuperación; sustituir las llamadas legacy por owner writes después del dispatch también deja una ventana de duplicación. No hacer ninguno de los dos cambios aisladamente.
- **Siguiente corte:** definir contratos de reconciliación confiables por acción/efecto y bloquear dispatch para acciones que no tengan contrato demostrado. El contrato completo debe separar admisión canónica, PREPARED durable con CAS, dispatch, lineage, observación/reconciliación, settlement y outcome. El bridge repair-only es la única ruta concreta demostrada hoy; no generalizarlo por renombrado.
- **M0 sigue INCOMPLETO.** Este hallazgo es auditoría de frontera, no integración terminada ni autorización para efectos protegidos.

## M0 — resultado incierto al confirmar PREPARED (2026-10-18, validado)

- **Hueco reproducido:** `owner.recordPrepared()` podía persistir el registro PREPARED y luego lanzar una excepción antes de devolver confirmación (por ejemplo, respuesta perdida después del reemplazo durable). `prepareRepairAgainstPersistedState()` dejaba escapar la excepción y `runNexoRepairOnce()` no devolvía una respuesta estructurada. El journal podía contener PREPARED durable pese a que el caller no recibió confirmación.
- **Prueba primero:** `tests/nexo/repair-owner-lifecycle.test.mjs` simula una escritura confirmada internamente seguida de excepción. El test falló antes de la corrección: [CI run 39160592605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160592605), SHA `3b066758fe3313b56344a26e0c64bf3ef5d5d7c1`.
- **Corrección:** `scripts/nexo-repair-preparation.mjs` devuelve `blocked`, preserva el código de error, marca `preparedCommitOutcome: unknown` y `uncertainty: prepared_commit_outcome_unknown`. `scripts/nexo-repair-entrypoint.mjs` propaga la incertidumbre y fija `dispatched: false`. No afirma que PREPARED no se haya escrito y no despacha sin confirmación. La siguiente invocación debe volver a leer el journal canónico y reconciliar la obligación.
- **Validación exacta:** código + regresión en `6300f8cb60fe18568e3ebd58e3ca1ee5b70d3d51`; [CI Nexo M0 — repair settlement crash cuts, run 39160656605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160656605) SUCCESS.
- **Alcance:** esto no migra el runtime genérico, no afirma atomicidad entre archivos y no habilita acciones protegidas.

**Siguiente trabajo:** diseñar el seam mínimo del runtime genérico owner-backed. No repetir la auditoría de dispatch ni settlement ya cubiertos. Mantener separados PREPARED, lineage, observación/reconciliación, settlement y outcome. M0 permanece INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


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


## M0 — la misión también debe ser ejecutable para admitir PREPARED (2026-10-18)

- **Hueco encontrado:** un paso podía seguir `planned` aunque su misión canónica estuviera `blocked`. La comprobación de paso/dependencias no era suficiente por sí sola.
- **Cambio:** `recordPrepared()` ahora exige `mission.status === planned` para una obligación nueva; de lo contrario devuelve `blocked / NEXO_PREPARED_MISSION_NOT_RUNNABLE`, sin avanzar `storeRevision` ni modificar `effectJournal`. Este control se ejecuta después de detectar un PREPARED existente, preservando la recuperación de obligaciones inciertas.
- **Test-first:** SHA `4c5cbf530da03642fb68da62f0abf1e8829bae5e`. [Repair crash cuts 39153079971](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153079971) y [bounded admission/restart 39153080078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153080078) fallaron en la regresión nueva: el owner devolvía `committed` para una misión `blocked`. STEP 4/STEP 5 pasaron en ese SHA, pero no validan el arreglo.
- **CI verde exacto:** SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d`: [STEP 5 39153137599](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137599), [STEP 4 39153137708](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137708), [repair crash cuts 39153137714](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137714), [bounded admission/restart 39153137611](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137611): cuatro SUCCESS.
- **Estado y límite:** refuerza admisión, pero no es el corte del runtime legacy. No acredita autenticación de evidencia, atomicidad entre stores ni finalización de misión. Siguiente: integrar el runtime a través del seam repair-only que ya posee PREPARED durable y conciliación específica, sin abrir efectos genéricos. Nexo/Lúmina separados; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — el owner bloquea PREPARED si el paso no es ejecutable (2026-10-18)

- **Hueco encontrado:** `recordPrepared()` validaba misión/paso/acción/objetivo, pero podía crear una obligación PREPARED para un paso cuyo estado no era `planned` o cuyas dependencias no estaban todas `completed`. La sesión de reparación ya aplicaba estas comprobaciones, pero el owner canónico no las imponía por sí mismo.
- **Cambio:** antes de crear un PREPARED nuevo, el owner exige `step.status === planned` y que cada ID de `dependsOn` corresponda a un paso existente en estado `completed`. Si falla el estado devuelve `blocked / NEXO_PREPARED_STEP_NOT_RUNNABLE`; si falla una dependencia, `blocked / NEXO_PREPARED_DEPENDENCIES_UNMET`. No cambia `storeRevision` ni agrega journal.
- **Orden de checks deliberado:** los checks se ejecutan después de detectar una obligación PREPARED ya existente. Así un replay de obligación sin resolver continúa visible como `prepared_existing`/UNKNOWN aunque la misión cambie después; no se reinterpreta como permiso para redispatch ni se oculta el pendiente.
- **Test-first:** SHA de prueba `71764ddb9dfc511cfe437c6a12dc9f6122a2297b`. [Repair crash cuts 39152101773](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101773) y [mission/restart continuity 39152101743](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101743) fallaron en la aserción nueva: el owner anterior devolvía `committed` en vez de `blocked`. STEP 4/STEP 5 pasaron en ese SHA, pero no validan el fix.
- **CI verde exacto de código/pruebas:** SHA `4549662e9cf879a15c4833b011ce5a8122e1c65e`: [mission/restart continuity 39152160229](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160229), [repair crash cuts 39152160394](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160394), [STEP 4 39152160252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160252), [STEP 5 39152160267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160267): los cuatro SUCCESS.
- **Límite / siguiente paso:** el guard protege admisión de PREPARED en el owner; no cambia `src/nexo/runtime.js`, no prueba atomicidad cross-store ni autentica evidencia. Siguiente: definir la frontera de integración canónica runtime sin despacho de acciones genéricas que carezcan de reconciliación específica. Nexo/Lúmina separados; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — replay de outcome con afirmación contradictoria (2026-10-18)

- **Hueco demostrado:** `recordOutcome()` reconocía como `already_recorded` cualquier replay con la misma identidad misión/paso/acción/objetivo, aunque el estado o la evidencia del nuevo outcome contradijeran el intento durable existente. El intento original no se sobrescribía, pero el resultado contradictorio no quedaba explícitamente bloqueado.
- **Contrato corregido:** el replay solo es `already_recorded` cuando coinciden estado, evidencia, `parentMissionId` y `replanReason`, además de la identidad ya validada. Si la identidad coincide pero esos datos difieren, retorna `blocked / NEXO_OUTCOME_RESULT_MISMATCH`; no avanza `storeRevision` y no reemplaza el primer outcome. Un resultado tardío no puede hacer retroceder una finalización previa ni presentarse como replay idéntico.
- **Prueba:** `tests/nexo/continuity-migration.test.mjs` cambió la regresión del outcome `completed` seguido de un replay `failed` para exigir bloqueo y conservación de `storeRevision` y del estado reconstruido `completed`.
- **Test-first:** SHA de prueba `d953e13aa026e52c6dcf3c65f4c18f7e86fc7d37`; [crash cuts 39151769794](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769794) y [bounded admission/restart 39151769766](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769766) fallaron con la expectativa nueva antes del fix. STEP 4 y STEP 5 pasaron en esa fase, pero no constituyen validación del fix.
- **CI verde tras el fix:** SHA de código/pruebas `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3`: [bounded admission/restart 39151794894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794894), [repair settlement crash cuts 39151794904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794904), [STEP 4 39151794891](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794891), [STEP 5 39151794922](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794922): los cuatro SUCCESS.
- **Límite / siguiente paso:** este guard endurece la idempotencia del owner; no migra `src/nexo/runtime.js` del ledger legacy ni autentica la evidencia del caller. No convertir outcome en settlement, no añadir `goalObservations`, no mezclar Nexo/Lúmina, efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN. Siguiente frente: diseñar el cutover canónico mínimo de runtime y sus crash/restart tests antes de sustituir escrituras legacy.

---

## M0 — lineage debe conservar también la revisión PREPARED (2026-10-18)

- **Segundo hueco concreto:** incluso después de comprobar que un replay de lineage repetía exactamente el mismo resultado, `recordExecutionLineage()` podía aceptar una llamada con una revisión ambiental base distinta de la que estaba ligada al journal PREPARED. El resultado guardado por sí solo no bastaba para verificar ese contexto.
- **Cambio:** para acciones de reparación, el replay de una lineage existente ahora revalida que exista exactamente una entrada de journal con revisión ambiental base conocida y que coincida con `operation.environmentStateRevision`. Un baseline distinto devuelve `blocked / NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`; una base ausente/ambigua devuelve `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`. No escribe ni avanza `storeRevision`.
- **Regresión test-first:** [CI 39150495080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150495080) falló primero porque el código anterior aceptaba el replay con baseline contradictorio. Tras el guard, la suite de crash cuts [39150515026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515026), STEP 4 [39150514997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150514997), STEP 5 [39150515080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515080) y bounded mission admission/restart [39150515015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515015) terminaron SUCCESS sobre SHA `3bfbad268ac1a9b5ea9492e8db0a90b5972f22d9`.
- **Siguiente frontera:** el contrato de lineage tiene ahora dos checks explícitos de replay: resultado idéntico y baseline PREPARED idéntico. Continuar la integración runtime canónica con pruebas; no crear `goalObservations`, no declarar completion por settlement, no mezclar Nexo/Lúmina, efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — rechazo de replay de lineage con resultado contradictorio (2026-10-18)

- **Hueco demostrado:** `recordExecutionLineage()` devolvía `already_recorded` para una clave/identidad ya existente sin comparar el resultado de adaptador persistido con el resultado del replay. No sobrescribía el primer registro, pero ocultaba un conflicto semántico.
- **Cambio:** `src/nexo/core/continuity-owner.mjs` ahora devuelve `blocked / NEXO_EXECUTION_RESULT_MISMATCH` cuando la identidad coincide pero `existing.result` difiere del resultado propuesto. No hay commit nuevo ni avance de `storeRevision` en ese caso.
- **Regresiones:** `tests/nexo/repair-owner-lifecycle.test.mjs` prueba que el replay conflictivo no modifica continuidad; `tests/nexo/continuity-migration.test.mjs` actualiza el contrato previo para exigir bloqueo en vez de aceptar silenciosamente un resultado distinto.
- **Test-first transparente:** CI del test antes del fix [39150256557](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150256557) falló en la nueva aserción porque devolvía `already_recorded`. El primer CI tras el fix [39150274684](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150274684) detectó una expectativa heredada equivalente en la prueba de migración; se corrigió para reflejar el nuevo contrato.
- **CI verde exacto tras alinear implementación y pruebas:** SHA `0653d7216c49dd6a9b0ea7a182333ff18ee07bc3`:
  - [M0 repair settlement crash cuts — 39150332075](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332075) SUCCESS.
  - [STEP 4 semantic validation — 39150332148](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332148) SUCCESS.
  - [STEP 5 outcome classification — 39150331964](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331964) SUCCESS.
  - [bounded mission admission/restart continuity — 39150331921](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331921) SUCCESS.
- **Límite:** el guard corrige la idempotencia de lineage; no demuestra todavía cutover de `src/nexo/runtime.js`, atomicidad entre stores ni finalización de misión. M0 sigue incompleto; Nexo/Lúmina separados; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.
- **Siguiente paso:** inspeccionar el siguiente hueco mínimo de continuidad después de PREPARED → lineage → settlement sin añadir `goalObservations` ni otros campos nuevos; después avanzar a una ruta runtime canónica con pruebas de proceso/reinicio.

---

## M0 — replay de objetivo observado y no-redispatch (2026-10-18)

- Se reforzó `tests/nexo/repair-mission-verification.test.mjs`: después de `goal_observed`, la reconstrucción canónica sigue manteniendo misión/paso en `blocked` con `NEXO_REPAIR_SETTLED_BY_OBSERVATION`; no se interpreta la observación como completion ni se permite redispatch.
- **CI exacto:** [39144434201](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144434201), commit de código/pruebas `ec36dd7df7cccf57f372d2cf252444ce28292e84`, workflow `Nexo M0 — repair settlement crash cuts` SUCCESS. El job `repair-crash-cuts` y el nuevo paso de verificación terminaron SUCCESS.
- La prueba cubre objetivo presente, replay de lectura tras reabrir el owner, objetivo ausente en una revisión posterior, PREPARED pendiente, misión desconocida y el hecho de que la reconstrucción permanece bloqueada después de observar el objetivo.
- **Contrato actual:** `goal_observed` es efímero/read-only; el journal `settled_observed` permanece durable; la misión reconstruida sigue bloqueada. Aún no existe transición durable de misión a finalización, intencionalmente.
- HEAD validado por ese CI: `ec36dd7df7cccf57f372d2cf252444ce28292e84`. Verificar HEAD y CI de nuevo después de estas actualizaciones documentales.
- Siguiente paso: decidir desde el contrato existente si una observación de objetivo debe persistirse como registro distinto, enlazado a revisión del entorno, sin mutar `effectJournal` ni promoverlo a completion. Antes de implementar, añadir casos de stale revision, pérdida posterior de invariante y CAS/restart. No crear estados/campos sin especificación.
- M0 sigue abierto; runtime genérico no migrado; Nexo/Lúmina separados; no atomicidad cross-store; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — contrato de observación del objetivo tras settlement (2026-10-18)

- Añadida regresión `tests/nexo/repair-mission-verification.test.mjs` y conectada al workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml`.
- CI exacto [39144348792](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144348792) terminó SUCCESS en commit `1d12c8e65aff1be75b04c0acee2fbc513b8ba5f4`; el job `repair-crash-cuts` y todos sus pasos, incluido `Run persisted repair mission goal verification regression`, terminaron success.
- Casos probados: objetivo observado después de `settled_observed` con `missionCompleted:false` y `causalAttribution:not_claimed`; verificación repetida tras reabrir owner sin mutación de continuidad; objetivo ausente en una revisión de entorno posterior bloquea la observación; PREPARED pendiente bloquea con `NEXO_EFFECT_RECONCILIATION_REQUIRED`; misión desconocida devuelve UNKNOWN.
- La semántica queda separada: `settled_observed` registra una observación del efecto; `goal_observed` informa que la invariante del objetivo está presente ahora. Ninguno declara por sí mismo `missionCompleted:true`, causalidad ni autorización.
- El test nuevo pasa en CI sobre el commit que incluye el workflow y el test. HEAD actual puede ser posterior por las actualizaciones documentales; no atribuir el PASS a cambios posteriores sin otro run.
- Próximo paso: determinar si el contrato de misión necesita una transición durable explícita de estado “goal observed” y bajo qué regla, sin confundirla con completion. No agregar campos/estados nuevos hasta auditar el contrato y probar las consecuencias de replay/CAS. Después abordar una ruta de runtime canónica mínima.
- M0 sigue abierto; runtime genérico no migrado; Nexo/Lúmina separados; sin atomicidad cross-store; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — auditoría de frontera de memoria legacy/runtime (2026-10-18)

- Auditoría dirigida documentada en [NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md](BUILD/NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md), commit `f2b14a63665df50a99ea576d44db00092e2f7ca4`.
- Hallazgo raíz: `src/nexo/runtime.js` ejecuta el adapter antes de confirmar un ciclo owner-backed durable; después registra plan, execution y outcome sobre una proyección de memoria legacy en proceso. El lock `WeakMap` no sustituye CAS ni persistencia entre procesos.
- Incompatibilidad confirmada: `owner.recordOutcome()` bloquea `completed` cuando el mismo paso tiene efecto `prepared` o `settled_observed`; `recordExecutionLineage()` requiere PREPARED y no liquida el journal. Por eso no es seguro cambiar imports por llamadas directas al owner ni convertir `settled_observed` en completion.
- Se mapeó el rol de `scripts/assistants.mjs`: registra misión en el store canónico y usa una vista legacy temporal para construir el plan; el puente CLI de reparación continúa opt-in y limitado a tres reparaciones. No se ha demostrado un cutover del runtime genérico.
- Evidencia base disponible: [CI 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529), SUCCESS en SHA de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`. El HEAD documental actual no tiene un CI nuevo asociado; no extrapolar el PASS.
- **Siguiente paso:** probar cómo se representa un outcome de misión tras settlement sin conflar journal/outcome/completion; luego diseñar la conexión owner-backed mínima sobre misión/paso canónicos, con CAS y crash/restart/replay. Mantener legacy y flag opt-in hasta que esa regresión pase.
- M0 incompleto; Nexo/Lúmina separados; no atomicidad cross-store; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — prueba de proceso real del CLI aislado (2026-10-18)

- Se habilitaron rutas de archivos configurables mediante `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH` y `NEXO_CONTINUITY_PATH`. Sin esas variables, los paths de producción permanecen iguales; la prueba usa exclusivamente un directorio temporal.
- Se añadió `tests/nexo/assistants-runtime-cli.test.mjs`, que inicia el proceso real `scripts/assistants.mjs` dos veces con fixtures independientes: (a) modo por defecto: no aparece resultado de sesión y el journal no recibe efectos; (b) con `--nexo-repair-once`: se ejecuta una reparación canónica, el journal termina `settled_observed`, el entorno avanza de revisión 1 a 2 y el JSON reporta esa revisión final. También verifica que el estado persistido no incluya `nexoMemory`.
- El fixture reveló una brecha de procedencia de destino: los hallazgos `AGENT_POSITION`/`INVALID_NEED` no incluían `agent`, por lo que el plan podía producir `target: null`. Se corrigió `src/assistants/debugger.js` para adjuntar el ID del agente al hallazgo; ahora el target del plan se origina en la observación y la sesión lo vuelve a leer de la misión persistida.
- CI exacto: [run 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529), SHA de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`, SUCCESS. El job `repair-crash-cuts` pasó las regresiones de crash, migración, ciclo de vida, sesión, sintaxis y CLI aislado.
- El primer intento de CLI test falló por fixture incompleto (faltaba continuidad heredada explícita); segundo intento identificó el código de salida de diagnóstico esperado por el hallazgo intencional. Se corrigió el fixture y la aserción para separar el estado diagnóstico inicial del resultado de la reparación. No se ocultó ni reinterpretó el fallo inicial.
- **Límite:** prueba de proceso aislada con archivos temporales, no ejecución contra datos reales del usuario. La salida puede conservar exit code de diagnóstico `error` porque el reporte inicial se genera antes de reparar; el resultado de reparación se informa por separado y no borra la evidencia previa.
- **Siguiente frontera:** estudiar un adaptador de reporte posterior a reparación solo si usa una observación independiente del estado persistido; no convertir `settled_observed` en causalidad ni en finalización de misión. Después, diseñar el cutover de continuidad de runtime sin doble escritura ni estado de Lúmina mezclado.
- M0 incompleto; repair runtime sigue opt-in; efectos protegidos STOP; no atomicidad cross-store; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — puente opt-in hacia la entrada real de asistentes (2026-10-18)

- **Nuevo puente:** `scripts/nexo-runtime-session.mjs` exporta `runNexoRuntimeRepairSession()`. Selecciona una misión canónica sin ambigüedad y únicamente un paso `planned` de reparación cuyos prerequisitos estén `completed`; después delega en la sesión repair-only, que vuelve a leer la continuidad y deriva acción/target del snapshot.
- **Entrada real con opt-in:** `scripts/assistants.mjs` importa el puente. Solo lo ejecuta si el proceso recibe explícitamente `--nexo-repair-once`, después de persistir primero el snapshot de entorno de esa ejecución. Así el guardado previo no puede sobrescribir posteriormente el resultado de la reparación. El comportamiento normal sigue sin ejecutar reparaciones automáticamente.
- **Cierre de hueco contractual:** `scripts/nexo-repair-session.mjs` ahora rechaza cualquier paso que no esté exactamente en `planned` y bloquea dependencias no satisfechas incluso si alguien llama directamente a la sesión.
- **Pruebas:** `tests/nexo/repair-session.test.mjs` prueba el puente de runtime, flujo repair-only, recuperación después de reabrir el owner desde disco, no redispatch, acción no elegible, dependencias no satisfechas y separación de `world-state.json`. Workflow también ejecuta `node --check` sobre puente y `scripts/assistants.mjs`.
- **CI exacto:** [run 39143194694](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143194694), SHA `3c414ff2d0b8ebd8f880e8a37e83602138924395`, SUCCESS. Job `repair-crash-cuts`, las cuatro regresiones y la comprobación sintáctica finalizaron correctamente. La suite ya había pasado en SHA de código/pruebas `93dc2cf3ed070fed35298a4777e43804e862fdef` en [run 39143167854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143167854); el run más reciente incluye además el chequeo de sintaxis.
- **Alcance real:** ya hay un camino opt-in desde la entrada de asistentes hacia una sesión Nexo owner-backed, limitado a reparaciones. No es todavía el runtime genérico completo ni un cutover por defecto. No se ha ejecutado contra datos de usuario reales; la evidencia es CI con fixtures temporales. El puente no permite `execute_lumina_action`, acciones protegidas ni misión completada por `settled_observed`.
- **Siguiente paso:** crear una prueba de proceso/CLI aislada con directorio temporal y estado canónico que invoque `scripts/assistants.mjs --nexo-repair-once` sin tocar `world-state.json` real; comprobar que el flag opt-in termina en salida reportada, que el revision final corresponde al estado después de reparación y que el modo por defecto no dispatcha. Solo después evaluar la sustitución gradual de la ruta legacy; no enrutar `executeNexoStep()` genérico hacia este dispatcher.
- **No cambiar:** no atomicidad cross-store, no memoria Nexo dentro de Lúmina, efectos protegidos STOP, STEP 7 OPEN / STOP / UNKNOWN, M0 sigue incompleto.

---

## M0 — primera sesión owner-backed repair-only (2026-10-18)

- Implementada `scripts/nexo-repair-session.mjs`, API `runNexoRepairSession()`: el caller solo selecciona `missionId` y `stepId`; misión/paso/acción/target se derivan del snapshot canónico de Nexo. Lista cerrada: `repair_agent_state`, `repair_agent_needs`, `repair_resource_state`; las demás acciones se bloquean antes de PREPARED/dispatch.
- Añadida `tests/nexo/repair-session.test.mjs`: prueba de flujo completo a través de la sesión (PREPARED → dispatch condicional → `settled_observed`), rechazo de acción no elegible y crash cut tras persistencia del entorno con reapertura del owner; la sesión recupera la observación sin redispatch. También verifica que `world-state.json` no contiene `nexoMemory`.
- CI exacto: [run 39142674734](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142674734), SHA de código/pruebas `b011a8078f9f0562a61a3bafb9c260810147ea84`, SUCCESS. Job `repair-crash-cuts` y los cuatro pasos de pruebas terminaron `success`. El commit anterior `e7eb932` falló por imports relativos incorrectos del test; corregido en el siguiente commit y validado en este PASS.
- Esto es una sesión real owner-backed para la ruta repair-only y su prueba de reinicio; **todavía no está conectada a `src/nexo/runtime.js` ni demuestra arranque productivo completo**. No hay ejecución genérica, causalidad, mission completion ni atomicidad cross-store.
- Documentos de contrato/handoff ya existentes deben considerarse actualizados a partir de este incremento. M0 sigue incompleto; efectos protegidos STOP; PREPARED/`settled_observed` UNKNOWN hasta verificación de objetivo; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — contrato de sesión de runtime acotado (2026-10-18)

- Revalidado el HEAD de rama antes de continuar: `7ed44d7179988e07cd0e19bbe5a5ab486eb9e191`. El CI de repair-only más reciente verificado sigue siendo [39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), sobre el SHA de código/pruebas `e36121220d4d89475a68bc4bf1a0d2880b4092be`; no es un PASS sobre el HEAD documental posterior.
- Auditoría dirigida del seam actual: `src/nexo/runtime.js` aún ejecuta outcomes mediante `src/assistants/memory.js`; `scripts/assistants.mjs` registra misión en el owner separado pero no ejecuta la misión; `runNexoRepairOnce()` es una entrada de script repair-only, no el runtime productivo.
- Se creó [NCS_M0_RUNTIME_SESSION_CONTRACT_2026-10-18.md](BUILD/NCS_M0_RUNTIME_SESSION_CONTRACT_2026-10-18.md), commit [d654583139df69202a726981a53878f32219cffa](https://github.com/snowdenxrp/aldea-ia/commit/d654583139df69202a726981a53878f32219cffa). Define el contrato mínimo para la primera sesión owner-backed: misión canónica, identidad de paso no sustituible por caller, PREPARED durable antes de dispatch, lista cerrada de reparaciones elegibles, settlement distinto de completion, recuperación fail-closed y pruebas a través de la API de sesión real.
- **No se cortó runtime ni se afirma CI nuevo**: el cambio es documental y el contrato todavía debe materializarse en pruebas/código. El siguiente trabajo debe ser test-first sobre una API de sesión owner-backed; no reemplazar imports en `runtime.js` ni enrutar `executeNexoStep()` genérico hacia el dispatcher de reparación.
- Límites sin cambio: M0 incompleto; no atomicidad cross-store; efectos protegidos STOP; PREPARED/`settled_observed` sin resolver UNKNOWN; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — entrypoint repair-only (2026-10-18)

- Implementado `scripts/nexo-repair-entrypoint.mjs` con `runNexoRepairOnce()`; la entrada está limitada a reparaciones convergentes.
- Comprueba identidad de PREPARED, observa el entorno persistido antes de recuperar una obligación existente y bloquea si la revisión cambió o el contexto no coincide.
- El settlement solo registra `settled_observed`; no completa la misión ni afirma causalidad.
- CI verificado en [run 39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), SHA `e36121220d4d89475a68bc4bf1a0d2880b4092be`, SUCCESS. Incluye crash recovery antes del dispatch y caso de invariante ya satisfecha sin escritura.
- Límite: todavía no existe llamada desde `src/nexo/runtime.js` ni desde el arranque general. El runtime heredado sigue usando `src/assistants/memory.js`. No hay atomicidad cross-store demostrada; efectos protegidos siguen fuera de alcance y las misiones no se marcan completadas.

---

## M0 — crash cut: entorno persistido antes del settlement (2026-10-18)

- Test de reinicio añadido en `tests/nexo/repair-owner-lifecycle.test.mjs`, commit [55f9a064dd28ed5b51eb552f903f3bec504f9640](https://github.com/snowdenxrp/aldea-ia/commit/55f9a064dd28ed5b51eb552f903f3bec504f9640).
- Secuencia probada: PREPARED enlazado a entorno revisión 30 → dispatch persiste revisión 31 → se descarta el owner inicial → se reabre continuidad desde disco → settlement observa la invariante persistida y marca `settled_observed` → replay bloqueado, entorno sigue en revisión 31.
- CI exacto: [run 39141847081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141847081), sobre el SHA de prueba `55f9a064dd28ed5b51eb552f903f3bec504f9640`, completó **SUCCESS**. Job `repair-crash-cuts` y sus tres pasos de regresión finalizaron `success`.
- Alcance: demuestra recuperación mediante helpers y owner/store existentes en una simulación de reinicio dentro del mismo proceso de test; no demuestra todavía arranque real de la aplicación productiva ni atomicidad entre archivos.
- Siguiente frontera: definir y probar una entrada repair-only coherente que use continuidad propietaria de Nexo sin convertir Lúmina en dueña de memoria/identidad, y decidir el corte de runtime solo después de documentar sus contratos y fallos.

---

## M0 — replay y revisión obsoleta: regresiones añadidas, CI pendiente (2026-10-18)

- Test actualizado: `tests/nexo/repair-owner-lifecycle.test.mjs`, commit [53cf292ae966c80eb722a7f48eec0c6c2c86595d](https://github.com/snowdenxrp/aldea-ia/commit/53cf292ae966c80eb722a7f48eec0c6c2c86595d).
- Caso A — replay después de `settled_observed`: el dispatch debe bloquearse con `NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN`, sin cambiar la revisión del entorno ni la revisión del store Nexo.
- Caso B — estado de entorno cambia de revisión 20 a 21 después de PREPARED: dispatch debe bloquearse con `NEXO_PREPARED_ENVIRONMENT_REVISION_STALE`, conservar el estado de entorno en revisión 21 y dejar el journal en PREPARED para reconciliación.
- CI exacto: [run 39141470114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141470114), sobre el SHA de prueba `53cf292ae966c80eb722a7f48eec0c6c2c86595d`, completó **SUCCESS**. Job `repair-crash-cuts` y los tres pasos de regresión (crash cuts, migración de continuidad y lifecycle integrado) finalizaron `success`.
- Alcance: regresiones de los helpers repair-only; no es una integración de `src/nexo/runtime.js`, no prueba atomicidad cross-store y no autoriza efectos protegidos.

---

## M0 — repair lifecycle CI trigger coverage (2026-10-18)

- Corrected `.github/workflows/nexo-m0-repair-crash-cuts.yml` path filters to include preparation, dispatch, settlement, mission verification, continuity migration, and the lifecycle test itself. Before this correction, edits to preparation/dispatch/lifecycle test did not reliably trigger this focused workflow.
- Workflow correction commit: `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`.
- Exact-head CI [39141182732](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141182732) completed **SUCCESS** on `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`. The `repair-crash-cuts` job and all three regression steps completed successfully.
- Scope is precise: this validates the tests currently included in the workflow. Explicit replay-after-settlement and stale-environment-revision dispatch regressions remain a next test task; do not infer those cases from this PASS. Production `runtime.js` owner cutover remains pending; M0 incomplete.

---

## M0 — owner-backed repair lifecycle integration regression (2026-10-18)

- Added `tests/nexo/repair-owner-lifecycle.test.mjs` to exercise the actual existing owner/store + repair helpers in one flow: strict persisted baseline revision 10 → durable PREPARED → conditional repair persistence at revision 11 → separate `settled_observed` commit → read-only `goal_observed`.
- Assertions require that PREPARED is durable before dispatch, the Nexo store revision advances only at the expected commits (0→1→2), the verifier does not mutate continuity, the result does not claim mission completion or causal attribution, and `world-state.json` excludes `nexoMemory`.
- CI workflow updated to run the new regression after existing repair crash-cut and continuity migration tests.
- Evidence: test commit `eddf41c542b252329e45304245728a7bdb5d6800`; workflow commit `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`; focused CI [39140959531](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140959531) completed **SUCCESS** on exact workflow HEAD `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`. Job `repair-crash-cuts` and all three test steps (repair crash cuts, continuity migration, owner-backed lifecycle integration) succeeded. This PASS applies to that code/workflow SHA, not later documentation-only HEADs.
- This test is an integration regression for the existing repair-only helpers, not the production `runtime.js` owner cutover. No non-repair/protected effects are authorized. M0 remains incomplete; ambiguous PREPARED stays UNKNOWN; Nexo/Lúmina stores remain separate.

---

## M0 — Runtime integration seam revalidated (2026-10-18)

- Reused existing P112/AB104 findings and checked the current source seam without reopening the historical audit.
- `scripts/assistants.mjs` persists mission plans through the independent Nexo owner, but does not execute missions. `scripts/simulate.mjs` opens continuity for migration/reporting but does not execute missions. `src/nexo/runtime.js` still has a legacy-memory outcome path.
- Therefore this is **not** a simple import replacement: the missing component is a real owner-backed execution lifecycle. It must carry the owner store revision, persist mission and PREPARED before eligible dispatch, keep execution lineage/outcome separate from journal settlement, and recover ambiguous cross-store results without redispatch.
- Confirmed the separation regression already asserts that `world-state.json` excludes `nexoMemory` and that `applyState()` does not attach Nexo continuity to the Lúmina simulation. Preserve this boundary.
- Decision/checkpoint updated: [NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md](BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md).
- **No runtime code cutover made** because no production execution owner exists yet and `recordOutcome()` cannot authenticate external evidence or settle `prepared`/`settled_observed`.
- Next: test-first, owner-backed session contract for the narrow repair-only path. Keep non-idempotent/protected dispatch blocked. M0 incomplete; unresolved effects UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Owner-backed durable outcome recording (2026-10-18)

- Added `recordOutcome({ expectedRevision, outcome })` to `src/nexo/core/continuity-owner.mjs`, so the Nexo-owned store can durably record a mission-step outcome through `commitIfCurrent()`.
- The method checks stored mission/step/action/target identity, rejects invalid completion evidence, preserves the first attempt, and returns `authorization: "NOT_EVALUATED"`; it never settles `effectJournal`.
- Completion is blocked while the same step has an unresolved `prepared` or `settled_observed` journal entry. A blocked outcome may be persisted, but reconstruction still lets the unresolved effect dominate.
- Added regressions to `tests/nexo/continuity-migration.test.mjs` for evidence requirements, durable reconstruction, replay immutability, and unresolved-effect guards.
- Exact source + test head: [c7a8852b791dec8a2bee64cda6126aa1658af198](https://github.com/snowdenxrp/aldea-ia/commit/c7a8852b791dec8a2bee64cda6126aa1658af198).
- Focused workflow now runs continuity migration plus repair crash cuts: [run 39140292963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140292963) — SUCCESS, both test steps completed. Mission/restart [39140282526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282526), STEP 4 [39140282510](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282510), and STEP 5 [39140282488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282488) also passed for the source/test head.
- Full checkpoint: [NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md](BUILD/NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md).
- **Limits:** runtime still uses legacy memory; no runtime cutover, independent evidence verification, cross-store atomicity, authority, or protected-effect authorization is claimed. M0 remains incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

Next: test-first runtime integration. Reuse existing P112/PG-009 findings. Do not dispatch effects through this new API until PREPARED-before-dispatch, unresolved-effect recovery, and persistence/restart behavior are covered end-to-end.

---

## M0 — Current-state goal regression guard (2026-10-18)

- Regression test commit: [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a).
- Added a separate persisted environment fixture where the repair invariant regresses after a prior `settled_observed` journal record. The mission verifier must return `blocked` / `NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`, not `goal_observed` or mission completion.
- Exact-head CI for this test commit is NOT YET VERIFIED. The available GitHub status/workflow connector has not returned check records; no PASS claim.
- This proves re-observation detects a regressed invariant when it reads that state. It does NOT close the race between reading Lúmina's file and a later Nexo continuity write; no durable goal-observation write has been introduced.

Next: verify CI on the exact test commit; then define whether durable observation needs an environment-revision fence spanning both stores. Do not invent cross-file atomicity. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Mission verifier exact-coverage hardening (2026-10-18)

- Code commit: [25598ba80e377cdf39498991f29abc665a4ded69](https://github.com/snowdenxrp/aldea-ia/commit/25598ba80e377cdf39498991f29abc665a4ded69).
- Code + regression-test head: [b74cc37edfad915fc8cc5deaf9269c6f15b28872](https://github.com/snowdenxrp/aldea-ia/commit/b74cc37edfad915fc8cc5deaf9269c6f15b28872).
- Fixed two false-positive paths in `verifyRepairMissionGoalFromPersistedState()`: duplicate mission step IDs could let one journal entry satisfy multiple steps; extra journal entries outside the declared step set were ignored.
- Verifier now rejects duplicate IDs as `NEXO_REPAIR_MISSION_STEP_OR_DEPENDENCY_UNSUPPORTED` and non-exact journal coverage as `NEXO_REPAIR_MISSION_JOURNAL_COVERAGE_MISMATCH`. Regressions added to `tests/nexo/simulation-restart-persistence.test.mjs`.
- Exact-head CI: NOT YET VERIFIED. Available status/workflow lookup returned no records; this is not a PASS.
- No runtime wiring, mission completion, causal attribution, protected-effect authorization, or cross-store atomicity claim.

Next: verify Actions for exact head; then test the race between environment observation and durable continuity recording. Continuity CAS alone cannot atomically fence the separate Lúmina state file.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Read-only mission goal verification contract hardened (2026-10-18)

- Added `scripts/nexo-repair-mission-verification.mjs`: verifies that every step in a repair-only mission has one `settled_observed` journal entry and that every desired invariant is present in one current strict-loaded environment snapshot. It returns `goal_observed`, `missionCompleted: false`, and `causalAttribution: "not_claimed"`.
- Added dependency-cycle rejection and regression. Runtime replan remains blocked until a separate goal-verification/persistence contract is established.
- Exact tested head: [`1ae28c8570e76191663ed045e6d68644df17a52c`](https://github.com/snowdenxrp/aldea-ia/commit/1ae28c8570e76191663ed045e6d68644df17a52c).
- Exact-head CI PASS: mission/restart [39133517131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517131), outcome [39133517097](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517097), semantic [39133517074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517074).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Remaining: persist a separately scoped goal-observed record using continuity CAS, define which mission step statuses may become executable, and verify mission semantics before any runtime cutover. No claim of mission completion, causal attribution, authority, or cross-store atomicity.

---

## M0 — Runtime replan now respects observed-settlement uncertainty (2026-10-18)

- `replanPersistedNexoMission()` refuses successor creation if the previous mission has a `settled_observed` repair entry, returning `NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED`. Unresolved `prepared` still returns the existing reconciliation veto.
- Test confirms no successor mission is appended and journal state remains unchanged.
- Exact tested head: [`9610580f838ea2f55a482f64a28f18d84cac202e`](https://github.com/snowdenxrp/aldea-ia/commit/9610580f838ea2f55a482f64a28f18d84cac202e).
- Exact-head CI PASS: mission/restart [39133373970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373970), outcome [39133373980](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373980), semantic [39133373987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373987).
- Remaining gate: define a distinct mission-level goal verifier; observed repair state is not mission completion. No runtime cutover or non-idempotent action settlement until that contract is proven.

---

## M0 — Settlement negative cases + safe reconstruction guard verified (2026-10-18)

- Added negative tests: desired invariant absent/unknown does not settle; an environment revision beyond the allowed prepared-revision window does not settle; ambiguous continuity commit result stays UNKNOWN and PREPARED remains durable.
- Fixed mission reconstruction: `settled_observed` no longer lets its step reappear as planned/executable. The mission remains blocked at `verify_observed_repair_goal` until a separate goal verifier resolves it; no causal completion claim.
- Latest exact tested head: [`4cadf1831ecbd3664964c410ac8bc1397fd22a2e`](https://github.com/snowdenxrp/aldea-ia/commit/4cadf1831ecbd3664964c410ac8bc1397fd22a2e).
- Exact-head CI PASS: mission/restart [39133277523](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277523), outcome [39133277522](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277522), semantic [39133277520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277520).
- Detailed checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Next: validate runtime compatibility of `settled_observed` and mission verification semantics; do not wire runtime until explicit mission-level verifier exists. No non-idempotent actions, no cross-store atomicity claim, no authority implication.

---

## M0 — Repair settlement now records persisted invariant observation (2026-10-18)

- Added `scripts/nexo-repair-settlement.mjs`: re-loads the durable Nexo journal and strict environment snapshot, requires one matching PREPARED repair, validates the action-specific invariant, constrains environment revision to the prepared revision or immediate successor, and commits `settled_observed` through continuity-store compare-and-commit.
- Settlement evidence explicitly records `causalAttribution: "not_claimed"`: observed desired state is not proof this operation caused it. No atomicity is claimed across Lúmina and Nexo files.
- Exact code/test head: [`72bb686a4d6b84d6cd058751005dbe34cda1d273`](https://github.com/snowdenxrp/aldea-ia/commit/72bb686a4d6b84d6cd058751005dbe34cda1d273).
- Exact-head CI PASS: mission/restart [39133009763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009763), semantic [39133009760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009760), outcome [39133009772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009772).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Next: add negative tests for absent/unknown invariant and unrelated environment revision; test continuity commit failure/ambiguous result; review reconstruction semantics before runtime wiring. No non-idempotent settlement or runtime cutover.

---

## M0 — Repair preparation + conditional dispatch fence implemented; exact-head CI PASS (2026-10-18)

- `scripts/nexo-repair-preparation.mjs` loads the environment through `loadStateStrict()` and derives the revision recorded in PREPARED; callers do not supply the integer to this helper.
- `scripts/nexo-repair-dispatch.mjs` derives the operation from exactly one durable PREPARED journal entry, refuses missing entries and stale environment revisions, runs only the three convergent repairs, and persists changed state through `persistState(expectedRevision, stateRevision)` with strict reload comparison.
- The helper intentionally leaves Nexo PREPARED unresolved after environment persistence. It is not terminal settlement and does not claim cross-file atomicity.
- Exact code/test head: [`64f8329aef2ba050e9600227e2661f56fb75e21d`](https://github.com/snowdenxrp/aldea-ia/commit/64f8329aef2ba050e9600227e2661f56fb75e21d).
- Exact-head CI PASS: mission/restart [39132820121](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820121), semantic [39132820068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820068), outcome [39132820026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820026).
- Checkpoint: [NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md).
- Next: test write-failure/commit-ambiguity crash cuts and define repair-only terminal settlement from repository-derived evidence with continuity compare-and-commit. Do not generalize to non-idempotent effects or migrate runtime before this gate.

---

## M0 — New repair PREPARED intents bind the persisted environment revision (2026-10-18)

- `recordPrepared()` now requires `environmentStateRevision` for the three convergent repair actions and stores it on the PREPARED entry.
- Existing PREPARED repair entries cannot be rebound to a different revision. Legacy entries without a revision remain unresolved and report UNKNOWN; omission on a new repair intent is blocked.
- Code/test head: [`d0e38809992be291262153b527ec21a4793ac3d6`](https://github.com/snowdenxrp/aldea-ia/commit/d0e38809992be291262153b527ec21a4793ac3d6).
- Checkpoint: [NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md).
- **Not yet an end-to-end dispatch fence:** the owner still receives the revision from its caller; it does not itself load the strict environment snapshot, and adapter mutation is not yet conditional on the durable revision. No settlement API/runtime cutover.
- Next: derive the revision from a strict persisted snapshot inside a Nexo-owned preparation path; guard dispatch against the same durable revision using existing conditional persistence; keep PREPARED on stale/conflict; add crash-cut tests.

---

## M0 — Ambiguous repair target now fails closed; exact-head CI PASS (2026-10-18)

- Read-only repair observation now requires exactly one matching agent for `repair_agent_state` and `repair_agent_needs`; duplicate IDs return UNKNOWN instead of selecting the first match. Resource lookup requires an own property so inherited object members cannot masquerade as persisted resources.
- Code/test commit: [`f6ad72da4f0caff056a21dbdf8835391844c6b0c`](https://github.com/snowdenxrp/aldea-ia/commit/f6ad72da4f0caff056a21dbdf8835391844c6b0c).
- Exact-head CI PASS: semantic [39132380744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380744), outcome [39132380742](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380742), mission/restart [39132380735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380735).
- Checkpoint: [NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md).
- Still not settlement: PREPARED lacks persisted environment revision binding; revision observation is not atomic against later writers. No runtime cutover.
- Next: design explicit environment revision binding and dispatch/recovery fencing before any terminal settlement API.

---

## M0 — Missing/stale environment revision binding now explicitly classified (2026-10-18)

- Added `comparePersistedRepairRevision()` to the read-only repair observer. Matching revision → `current`; differing valid revisions → `stale`; missing PREPARED binding or invalid current revision → `unknown`.
- Crucially, it does not substitute the current environment revision when PREPARED has no recorded revision. Existing PREPARED schema currently has no authoritative environment revision field.
- Code/test commit: [`db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`](https://github.com/snowdenxrp/aldea-ia/commit/db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f).
- Exact-head CI PASS: mission/continuity [39132287649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287649), outcome [39132287652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287652), semantic [39132287648](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287648). Mission workflow explicitly passed `simulation-restart-persistence.test.mjs`.
- Checkpoint: [NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md).
- Hard boundary: this is stale-state detection, not atomic fencing. PREPARED lacks environment revision binding and two-store settlement is still unresolved. Do not wire runtime or settle from this observer alone.
- Next: define PREPARED revision binding + adapter dispatch fence + recovery recheck + continuity compare-and-commit settlement, with crash cuts at each boundary. Non-idempotent actions remain UNKNOWN.

---

## M0 — Read-only persisted repair observer added; exact-head CI PASS (2026-10-18)

- Added `src/nexo/adapters/persisted-repair-observation.mjs`: action-specific, read-only classification for `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state`.
- Outcomes are `desired_state_present`, `desired_state_absent`, or `unknown`; unknown snapshot revision, target/schema ambiguity, and unknown `alive` fail closed. The observer does not mutate the snapshot, settle PREPARED, or authorize retry.
- Code/test commit: [`8a89ef9b83b3126db3e83122a7876abe2a78819f`](https://github.com/snowdenxrp/aldea-ia/commit/8a89ef9b83b3126db3e83122a7876abe2a78819f).
- Exact-head CI PASS: mission/continuity [39107811320](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811320), semantic [39107811311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811311), outcome [39107811306](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811306). Mission log confirms read-only observation + crash-cut regressions passed.
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md).
- Boundary: observer assumes `loadStateStrict()` supplied the snapshot; it does not authenticate the file or make observation atomic with writes. PREPARED still lacks binding to an authoritative environment revision. No settlement API/runtime cutover.
- Next: settle the repair-only contract and address the environment revision/concurrent-write race before any owner settlement. Non-idempotent actions remain UNKNOWN.

---

## M0 — Durable repair crash-cut test added; exact-head CI PASS (2026-10-18)

- Added a restart regression that persists `repair_agent_state` to the authoritative Lúmina snapshot after Nexo has committed PREPARED, then reopens both stores.
- The repaired coordinate and explicit `alive:true` survive strict snapshot reload, while Nexo's separate journal correctly remains `prepared`; `reconcilePrepared()` remains blocked with `NEXO_EFFECT_RECONCILIATION_REQUIRED`, `verified:false`.
- Code/test commit: [`db3399aa28e6671bf5329ea5ca60544c8ac581ee`](https://github.com/snowdenxrp/aldea-ia/commit/db3399aa28e6671bf5329ea5ca60544c8ac581ee).
- Exact-head CI PASS: mission/continuity [39107632187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632187), outcome classification [39107632188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632188), semantic validation [39107632199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632199). Mission workflow log confirms `simulation-restart-persistence.test.mjs` ran and passed.
- Checkpoint: [NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md).
- Meaning: this closes a crash-cut test gap only. Durable environment state does not silently settle Nexo PREPARED. No settlement API or runtime cutover was added.
- Next: define and test the repair-only recovery contract from persisted snapshot semantics (desired invariant present/absent, malformed target, unknown alive, stale environment revision, continuity revision conflict). Keep non-idempotent actions UNKNOWN and do not redispatch them.

---

## M0 — Unknown life-state remains UNKNOWN (2026-10-18)

- Further tightened `repair_agent_state`: if `alive` is absent or not boolean, the handler returns `AGENT_ALIVE_STATE_UNKNOWN` before touching coordinates. It no longer infers `alive:true` from missing data.
- Regression test verifies the operation returns `blocked / EFFECT_OUTCOME_UNKNOWN`, leaves the unknown life-state unchanged, and makes no coordinate mutation.
- Final code/test head: [508a76a13384e282b812fcc91cbf4fb17222341f](https://github.com/snowdenxrp/aldea-ia/commit/508a76a13384e282b812fcc91cbf4fb17222341f).
- Exact-head CI PASS: [semantic validation 39106685371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685371) and [outcome classification 39106685361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685361). Mission/restart workflow on this exact head not confirmed.
- Updated checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Remaining boundary unchanged: in-memory revision is not durable world-state revision; no independent operation receipt, settlement API, or runtime cutover. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

## M0 — Dead-agent-safe convergent repair verified (2026-10-18)

- Refined `repair_agent_state`: postcondition now requires finite coordinates and a boolean `alive` value, not that the agent be alive. The action normalizes invalid coordinates without resurrecting a dead agent.
- Added a regression test asserting a dead agent remains dead after repair while coordinates become finite. Previous tests still cover idempotent needs normalization and a missing resource amount.
- Final code/test head: [0846597665e72de65917101c9206c3d26c11bf1b](https://github.com/snowdenxrp/aldea-ia/commit/0846597665e72de65917101c9206c3d26c11bf1b).
- Exact-head CI PASS: [semantic validation 39106552699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552699) and [outcome classification 39106552701](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552701). Mission/restart workflow for this exact head has not been confirmed.
- Checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Still not solved: in-memory revision is not durable environment revision; postcondition does not attribute the state to a particular prepared operation; no terminal settlement API or runtime cutover. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

## M0 — Convergent repair revision correction (2026-10-18)

- `src/nexo/simulation-adapter.js`: `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state` now increment the in-memory effect revision only when their normalized fields actually change. A missing resource amount normalizes to zero. The agent repair preserves an explicit dead state rather than resurrecting it.
- Regression tests: a second normalization under a distinct operation key completes without fabricating a new revision; a resource with missing amount is normalized and passes its postcondition.
- Code commit: [8926800](https://github.com/snowdenxrp/aldea-ia/commit/892680032b5512de11532b6ea609e5e9cbc9f75f); test head: [575d017](https://github.com/snowdenxrp/aldea-ia/commit/575d01789250bb26800d66146da18321ffad32ab).
- Exact-head CI: semantic validation [39106460906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460906) PASS; outcome classification [39106460938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460938) PASS. A mission/restart workflow on this exact head has not been confirmed; do not carry forward the previous head's result as if it covered this commit.
- Checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Limit: revision remains in-memory, not the durable Lúmina snapshot revision; a convergent postcondition is not an operation receipt. The repair-state postcondition still rejects dead agents, so that edge must be resolved before treating it as universally settleable. No owner settlement or runtime cutover was made.

# NCS — STATUS / ÚNICA ENTRADA

Fecha: 2026-10-18  
Repositorio: `snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`

## Estado global

**M0: INCOMPLETO.** La migración de continuidad de Nexo está parcialmente implementada. La ruta de ejecución/resultados de `src/nexo/runtime.js` todavía usa funciones de memoria heredadas; no conectar el despacho al propietario de continuidad independiente hasta que exista un contrato de reconciliación y liquidación de efectos respaldado por evidencia independiente.

- **Efectos PREPARED no resueltos:** UNKNOWN; no redispatch ni replan alrededor de ellos.
- **Efectos protegidos:** STOP.
- **STEP 7:** OPEN / STOP / UNKNOWN.
- **Nexo y Lúmina:** mantener separados. No declarar terminada la migración.
- **Dispositivo real:** no se ha realizado ni verificado una migración local del usuario.

## Punto técnico más reciente

1. El adaptador genérico ahora conserva como PREPARED cualquier fallo del manejador sin prueba independiente de ausencia de efecto. Resultado: `EFFECT_OUTCOME_UNKNOWN` si la revisión observada no cambia, `PARTIAL_EFFECT_DETECTED` si cambia.
2. CI exacto PASS en código/pruebas `431978730f3b2be300fa51d3a35938ef6702e607`:
   - [Mission/restart continuity — 39105986623](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623)
   - [Semantic validation — 39105986616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616)
   - [Outcome classification — 39105986625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625)
3. La inspección de persistencia encontró que el adaptador modifica una simulación en memoria, mientras `world-state.json` y `.nexo-continuity.json` tienen revisiones y commits separados. No existe hoy un protocolo durable conectado de ejecución de efecto + liquidación Nexo.

## Leer y continuar en este orden

1. [Handoff principal de migración M0](BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md)
2. [Crash cuts de reconciliación del entorno](BUILD/NCS_M0_ENVIRONMENT_RECONCILIATION_CRASH_CUTS_2026-10-18.md)
3. [Matriz de reconciliación por acción](BUILD/NCS_M0_ACTION_RECONCILIATION_CLASSIFICATION_2026-10-18.md)
4. [Checkpoint de fallos ambiguos fail-closed](BUILD/NCS_M0_AMBIGUOUS_HANDLER_FAILURE_FAIL_CLOSED_CHECKPOINT_2026-10-18.md)
5. [Contrato del propietario de continuidad Nexo](BUILD/NCS_M0_NEXO_CONTINUITY_OWNER_CONTRACT_2026-10-18.md)
6. Historial de STATUS preservado en [STATUS_HISTORY_2026-10-18.md](STATUS_HISTORY_2026-10-18.md).

## Próxima tarea obligatoria

Terminar la clasificación de reconciliación para las acciones candidatas idempotentes de reparación y probar los cortes de reinicio contra el estado persistido real. Las acciones no idempotentes deben permanecer UNKNOWN cuando falte evidencia durable específica de la operación. Después, definir el contrato mínimo de liquidación en el propietario Nexo. No integrar aún el runtime con el propietario; no inventar IDs, colas, tombstones, revisión global, reintentos, ni wrappers transaccionales.

## Principio de evidencia

Trigger → ejecución → job → head/pin → artefacto/log bruto → interpretación. Un eslabón faltante significa PENDING/UNKNOWN, nunca PASS supuesto. La documentación y CI no prueban ejecución en el dispositivo real.


## Latest M0 boundary — cross-store revision-fence analysis (2026-10-18)

- Analysis checkpoint: [NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md](BUILD/NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md), commit [6e3a51be77b45407707917ccc0ecf0cc94e50994](https://github.com/snowdenxrp/aldea-ia/commit/6e3a51be77b45407707917ccc0ecf0cc94e50994).
- Concrete boundary: `scripts/simulate.mjs` and `src/nexo/core/continuity-store.mjs` lock and CAS their own independent files. Nexo continuity CAS does not fence Lúmina's `world-state.json`; a read of environment revision R can race with another writer committing R+1 before Nexo records its observation.
- Therefore the mission verifier remains read-only/ephemeral. No durable goal-observed transition, mission completion, replan, protected runtime wiring, or cross-store atomicity claim is allowed yet.
- Exact-head CI for test commit [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a) remains NOT VERIFIED: status lookup returned no statuses and workflow lookup returned no runs. Missing evidence is neither PASS nor FAIL.
- Next: trace all writers/callers of persisted environment state and choose a domain-specific fence only if all relevant writers can honor it. If not, keep terminal durable goal status unavailable and re-check on use. Do not invent a generic transaction wrapper or test-only hook.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Goal-observation consumer decision (2026-10-18)

- Decision checkpoint: [NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md](BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md), commit [5a3922413ff8702aafe12b05bc69b09f8b0fc864](https://github.com/snowdenxrp/aldea-ia/commit/5a3922413ff8702aafe12b05bc69b09f8b0fc864).
- The read-only mission-goal verifier has no demonstrated production consumer requiring a durable terminal `goal_observed` record; `src/nexo/runtime.js` does not call it. Therefore do not build a cross-store fence for that diagnostic now. Keep it ephemeral/read-only and re-check current state on use.
- This does NOT resolve M0 runtime migration. `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`. The independent owner does not yet provide a fully verified terminal effect-settlement contract.
- Next: define and test the narrow owner-backed runtime API; keep result lineage separate from PREPARED settlement, reject caller-supplied verification as independent proof, and retain UNKNOWN/PREPARED across cross-file ambiguity. Preserve the legacy path until crash-cut and rollback tests pass.
- No broad writer-audit repeat, generic transaction wrapper, runtime cutover, protected-effect authorization, or device migration claim.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Execution-lineage owner seam (2026-10-18)

- Checkpoint: [NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md](BUILD/NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md), commit [5acefe5](https://github.com/snowdenxrp/aldea-ia/commit/5acefe5ed04b93c3a6d12a56f8aa14c759dc7301).
- Added `recordExecutionLineage()` to the Nexo continuity owner. It records adapter-result lineage in Nexo's own store with expected-revision CAS, checks persisted mission/step/action/target identity, and preserves the first record on duplicate identity.
- Crucial boundary: this method does not mutate `effectJournal`; even a result claiming `completed` and `verified: true` is only lineage. PREPARED remains unresolved and reconstructed mission remains blocked.
- Regression test authored in `tests/nexo/continuity-migration.test.mjs`: PREPARED preservation, blocked reconstruction, duplicate idempotency, stale revision conflict. Owner code `f5e9e20`; test commit `014b589`.
- Exact-head CI is NOT VERIFIED: combined-status/workflow lookups returned no records for the code/test commits; no local test run was performed in this session.
- This is not runtime cutover. Next: determine an operation-specific durable reconciliation path for one convergent repair and test restart/crash cuts before introducing any settlement API.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Execution-lineage admission guard (2026-10-18)

- Follow-up review found that a new execution lineage could be recorded for a valid mission step without a matching PREPARED journal obligation. Hardened `recordExecutionLineage()` to require exactly one PREPARED entry with matching key, mission, step, action and target.
- Owner hardening commit: [71b2db0b83e190f9f6d13c765a4e1bc85857903d](https://github.com/snowdenxrp/aldea-ia/commit/71b2db0b83e190f9f6d13c765a4e1bc85857903d); regression test commit: [9971058e2477aa458e6afebdb240f4a52b3b2401](https://github.com/snowdenxrp/aldea-ia/commit/9971058e2477aa458e6afebdb240f4a52b3b2401).
- Test checks that a mission without PREPARED cannot gain execution lineage (`NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED`). Exact-head CI NOT VERIFIED; tests were not run locally.
- Still no runtime cutover, effect settlement, independent evidence authentication, or cross-store atomicity claim.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.
- Added regression commit `98caddd0edd81908c2f07b199391e9fe85dbeeae`: a persisted `settled_observed` repair reconstructs as blocked with objective `verify_observed_repair_goal` and explicit `verify_mission_goal_without_redispatch`; observation is not converted into completed execution.
- Exact-head CI remains NOT VERIFIED and no local test execution is claimed.

## M0 — reparación persistida: pruebas de cortes de reinicio (2026-10-18)
- Añadida `tests/nexo/repair-settlement-crash-cuts.test.mjs` para tres límites: (1) Lúmina persiste la reparación y Nexo sigue en PREPARED; la reconciliación solo puede escribir `settled_observed` con `causalAttribution: not_claimed` y la misión reconstruida permanece bloqueada; (2) revisión de entorno más allá de la revisión preparada + 1: no liquidar y conservar PREPARED; (3) revisión adyacente pero invariante ausente: no liquidar y conservar PREPARED.
- `package.json` incorpora la regresión al comando `npm test`.
- Commits: prueba `59f3501f1d96358ad8f59649e06e00af00e219c3`; inclusión en suite `8c08f82792915c444ec9c0acc9decd0acd6b19e5`.
- Estado de evidencia: el código de prueba está en la rama; no se ha ejecutado localmente y no hay un resultado de CI exacto verificado para estos commits. No marcar PASS hasta disponer de ejecución/job/log del head exacto.

M0 sigue incompleto; no hay integración runtime ni liquidación causal; los efectos protegidos siguen STOP; STEP 7 continúa OPEN / STOP / UNKNOWN.


## M0 — Repair lineage environment-revision binding (2026-10-18)

- Review found that `recordExecutionLineage()` checked PREPARED identity but did not compare a repair's supplied environment revision to the revision captured in the PREPARED entry.
- Owner change: `291d482a2f1e03294c519bb8971fcce0b1c69176`. For the three repair actions, new lineage now blocks if either revision is absent/invalid (`NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`) or they differ (`NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`). The guard does not settle `effectJournal`.
- Regression commit: `4667d3b3cbe4a587c6e53118961437b2db733958`; test asserts mismatched revision leaves Nexo `storeRevision` and execution lineage unchanged before a matching revision is accepted.
- Exact-head CI and local execution are NOT VERIFIED. Do not call this a PASS until the exact code/test head has a recorded job result/log.

M0 incomplete; runtime still uses legacy memory paths; Nexo/Lúmina remain separate stores; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — CI-discovered crash-cut test fixture correction (2026-10-18)

- The mission/restart workflow exposed a test failure in `tests/nexo/simulation-restart-persistence.test.mjs` before it reached the continuity migration regression: `applyState()` does not carry persisted `stateRevision` into the in-memory simulation, so the test incorrectly computed `stateRevision` from the simulation and passed an invalid value to `persistState()`.
- Corrected the test to retain the strictly loaded persisted source snapshot and compute the next revision from `changedGoalSource.stateRevision`. Commit `ea1a8390c2826021feab46f3197c84a1a4f47039`.
- Earlier workflow runs for owner/test heads failed at this unrelated test line; STEP 4/STEP 5 and repair crash-cut workflows succeeded. The corrected head's workflows are pending at the time of this note; do not mark the overall suite PASS until the rerun completes.


### CI result correction — exact code/test head `ea1a8390c2826021feab46f3197c84a1a4f47039`

The three workflows completed successfully on the exact test-fix head:
- [Mission/restart continuity — run 39138908196](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908196). Job log confirms both `simulation-restart-persistence.test.mjs` and `continuity-migration.test.mjs` passed.
- [STEP 5 outcome classification — run 39138908043](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908043).
- [STEP 4 semantic validation — run 39138908074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908074).

The repair-settlement crash-cut workflow also passed on owner code head `291d482a2f1e03294c519bb8971fcce0b1c69176` ([run 39138771613](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138771613)); the STEP 4/STEP 5 workflows passed on test head `4667d3b3cbe4a587c6e53118961437b2db733958`. Do not interpret these tests as runtime migration or protected-effect proof.


### Repair-lineage revision guard — latest regression result

- Regression commit `12452f8d851c646d3cb7674cd0f59d7ba1246fe1` adds both missing-revision and mismatched-revision rejection checks; neither may append lineage or advance the Nexo store.
- Exact-head workflows all passed: mission/restart continuity [39139024311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024311) (job confirms `simulation-restart-persistence.test.mjs` and `continuity-migration.test.mjs` succeeded), STEP 5 [39139024315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024315), and STEP 4 [39139024377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024377).
- This validates the owner seam regression only. `effectJournal` still remains PREPARED after lineage; no runtime cutover, independent causal proof, or protected-effect authorization is established.


---

## Puerta de continuidad para nuevo chat — misión M0 (2026-10-18)

**Nuevo handoff maestro creado:** [NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md](BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md), commit [1b4ee8dafbed4b7bae6820d7d1853d3a31816382](https://github.com/snowdenxrp/aldea-ia/commit/1b4ee8dafbed4b7bae6820d7d1853d3a31816382).

Al abrir un nuevo chat con `NCS`, leer este STATUS y después el handoff maestro completo. Retomar exclusivamente la misión M0 desde la sección “Siguiente tarea concreta”; verificar el HEAD y los checks actuales antes de seguir. No repetir auditorías cerradas, no reiniciar investigación y no mezclar Nexo con Lúmina. La migración del runtime continúa incompleta; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


## New-chat handoff (2026-10-18)

For the next chat, read `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-18.md` first, then this STATUS. Entry keyword is exactly `NCS`. Mission: complete M0 and build Nexo's own continuity/runtime; keep Nexo separate from Lumina; do not restart M1 or closed historical audits. The handoff contains exact verified CI runs, current limits, and the ordered next steps.

## M0 — replay tras reinicio del owner (2026-10-18)

Se amplió `tests/nexo/assistants-runtime-cli.test.mjs`: tras ejecutar el entrypoint real en un subproceso y observar `settled_observed`, la prueba reabre el owner desde el archivo de continuidad y vuelve a solicitar la misma misión. El replay falla cerrado; la revisión del entorno no cambia y el journal conserva una sola obligación. La prueba no exige que el replay sea `skipped`: `blocked` es aceptable y más conservador si el selector no puede confirmar elegibilidad.

**CI exacto:** [Nexo M0 — repair settlement crash cuts, run 39144863235](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144863235) — SUCCESS, SHA de código/pruebas `1cd8dfd914fad7848df51eca0f4e0f75cff22264`. El job `repair-crash-cuts` y el paso `Run isolated assistants runtime CLI regression` finalizaron SUCCESS.

Límite: prueba aislada con archivos temporales y owner reabierto; no es cutover del runtime genérico `src/nexo/runtime.js`, no prueba atomicidad cross-store ni efectos protegidos. M0 continúa INCOMPLETO. Siguiente frontera: definir el contrato mínimo de resultados/lineage owner-backed antes de migrar las escrituras legacy; `recordExecutionLineage()` no liquida PREPARED y `recordOutcome()` no puede usar etiquetas `verified` del caller como autenticación.

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


## M0 — no promover settled_observed a completed tras reinicio (2026-10-18)

- La regresión nueva en `tests/nexo/repair-owner-lifecycle.test.mjs` intenta registrar `completed` con evidencia etiquetada por el caller como `verified: true` después de `settled_observed`. El owner debe rechazarla con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` sin incrementar `storeRevision`.
- La misma prueba reconstruye la misión desde el owner actual y desde un owner reabierto en disco; en ambos casos la misión y el paso siguen `blocked`, con objetivo `verify_observed_repair_goal`. Esto verifica persistencia de la barrera, no autenticidad de la evidencia externa.
- Commit de prueba: [fd2331e8d71afbbf0f19ea978d552a89087c1dc6](https://github.com/snowdenxrp/aldea-ia/commit/fd2331e8d71afbbf0f19ea978d552a89087c1dc6).
- CI exacto en ese SHA: [repair settlement crash cuts — 39145754425](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754425) SUCCESS; [STEP 4 — 39145754371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754371) SUCCESS; [STEP 5 — 39145754375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754375) SUCCESS. En el workflow repair, el job `repair-crash-cuts` pasó el lifecycle, migración, sesión canónica, CLI aislado y verificación de objetivo.
- Límite: esto no liquida el journal, no convierte observación en causalidad, no habilita acciones generales ni prueba cutover del runtime genérico. M0 continúa INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — verificador de objetivo: pérdida de invariante y revisión anterior (2026-10-18)

- Se amplió `tests/nexo/repair-owner-lifecycle.test.mjs` para comprobar dos resultados adicionales del verificador independiente: (1) si el estado persistido vuelve a perder la invariante en una revisión posterior, devuelve `blocked / NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`; (2) si la revisión ambiental queda por debajo de la revisión registrada en el settlement, devuelve `unknown / NEXO_REPAIR_MISSION_ENVIRONMENT_REVISION_ROLLBACK_OR_REPLAY`. Ambos casos no modifican `storeRevision` de Nexo.
- Commit de prueba: [d01384083368d1b9f52ad5c327dc4b1985e5573a](https://github.com/snowdenxrp/aldea-ia/commit/d01384083368d1b9f52ad5c327dc4b1985e5573a). La suite repair completa pasó en [39146476081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476081); STEP 4 [39146476199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476199); STEP 5 [39146476145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476145).
- Se detectó y revirtió antes de aceptar una ampliación incompleta de esquema que agregaba `goalObservations` sin contrato, inicialización ni compatibilidad de store: su CI falló en [39146494871](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146494871) y [39146494887](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146494887). Reversión de esquema [16c51fc994de1ca8a6471fa30f9060068b998da8](https://github.com/snowdenxrp/aldea-ia/commit/16c51fc994de1ca8a6471fa30f9060068b998da8) restauró CI verde. La observación de objetivo sigue siendo de solo lectura; no se añadió persistencia de observaciones ni se declaró completion.
- HEAD actual de la rama tras restaurar la forma de snapshot: `864ab85d38bf67040ef5a662dd8769cad3ea4c9f`. El CI verde más reciente valida el padre `16c51fc994de1ca8a6471fa30f9060068b998da8`; verificar si se dispara un run nuevo para el HEAD actual antes de atribuirle validación exacta.
- M0 permanece INCOMPLETO; efectos protegidos STOP; no migrar el runtime genérico hasta resolver la frontera de evidencia de misión.


## M0 — verificación detecta cambios concurrentes de continuidad (2026-10-18)

- El verificador de objetivo de reparación ahora vuelve a leer el almacén de continuidad justo antes de devolver `goal_observed`. Si `storeRevision` cambió entre la lectura inicial del journal/mission y esa comprobación final, devuelve `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`; no devuelve `verified: true` a partir de la vista inicial obsoleta.
- Regresión añadida en `tests/nexo/repair-mission-verification.test.mjs` con un store de prueba que cambia la revisión entre lecturas; verifica `unknown`, código exacto y que ambas lecturas ocurrieron. Esto no afirma atomicidad entre los archivos de continuidad y entorno, ni elimina una escritura que ocurra después de la comprobación final.
- Código/prueba commit: [57f3bffb52989a924bdbc5fb4fc626d803e6988f](https://github.com/snowdenxrp/aldea-ia/commit/57f3bffb52989a924bdbc5fb4fc626d803e6988f).
- CI exacto sobre ese SHA: [M0 repair crash cuts — 39146959705](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959705) SUCCESS; [STEP 4 semantic validation — 39146959738](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959738) SUCCESS; [STEP 5 outcome classification — 39146959691](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959691) SUCCESS. El job repair confirma que pasó el paso `Run persisted repair mission goal verification regression`.
- Límite: es una comprobación de estabilidad optimista de la revisión del store, no una transacción entre stores, no autenticación de fuente de evidencia y no misión completada. M0 sigue INCOMPLETO; efectos protegidos STOP; runtime genérico legacy no migrado.


## M0 — decisión de observación y contrato mínimo de cutover (2026-10-18)

- Decisión registrada en `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_AND_RUNTIME_CUTOVER_DECISION_2026-10-18.md`: no añadir ahora `goalObservations`; el verificador actual es de solo lectura y la reconstrucción mantiene `settled_observed` bloqueado. Solo diseñar persistencia de observaciones si existe requisito explícito de historial auditable, con contrato completo de procedencia, esquema/migración, CAS y replay.
- El contrato enumera el orden obligatorio del primer cutover: selección canónica → dependencias → PREPARED durable/CAS → dispatch acotado → lineage separado → reconciliación independiente → settlement no causal → replay/reinicio → aislamiento de Lúmina.
- La verificación final de estabilidad de continuidad permanece: un cambio de `storeRevision` durante el verificador devuelve `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. No se añadió ni se afirma una garantía de estabilidad equivalente para el archivo ambiental durante toda la verificación; la observación sigue siendo de punto en el tiempo y no cross-store atómica.
- CI verde exacto del código/pruebas restaurados: [repair M0 39149853015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853015), [STEP 4 39149852997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149852997), [STEP 5 39149853023](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853023), todos sobre `fe9fe3b656fceff67be31722d7729ff6637a428b`. Un experimento posterior para simular una carrera del archivo ambiental falló en CI y se retiró en vez de aceptar cobertura no demostrada; el guard ambiental experimental también fue revertido. El guard de cambio de continuidad y su prueba determinista se conservan.
- M0 continúa INCOMPLETO; runtime genérico legacy NO MIGRADO; efectos protegidos STOP; Nexo/Lúmina separados.

## M0 — capability preflight del adaptador de efectos (2026-10-18)

- `src/nexo/effect-adapter.js` expone `supports(action)` para consultar si existe un handler registrado sin ejecutarlo. El registro sigue siendo dinámico mediante `register()`; `supports` refleja el registro actual.
- La API declara explícitamente su límite: presencia de handler no equivale a contrato de reconciliación, verificación persistida ni autorización. Su propósito es permitir al futuro seam canónico rechazar una acción no registrada antes de admitir PREPARED o despachar.
- Implementación: [595ca45888de1d131537de65d1b9b22b6267e754](https://github.com/snowdenxrp/aldea-ia/commit/595ca45888de1d131537de65d1b9b22b6267e754). Regresión: [af463e90aa77b116ce4f940ba112521ba48413ab](https://github.com/snowdenxrp/aldea-ia/commit/af463e90aa77b116ce4f940ba112521ba48413ab); comprueba acción registrada/no registrada, registro posterior y que consultar capacidad no invoca el handler.
- CI exacto aún no observado: el lookup de workflow runs devuelve `[]` y los checks devuelven `statuses: []`. No declarar PASS; ejecución local tampoco realizada.
- Siguiente paso M0: usar este seam solo como preflight dentro del diseño del runtime canónico, sin tratar `supports()` como reconciliador. El bloqueo principal sigue siendo un contrato confiable por acción para resolver PREPARED tras restart y liquidar por CAS con evidencia del estado persistido. Runtime genérico todavía no migrado; efectos protegidos STOP; Nexo/Lúmina separados.

## M0 — corrección de sintaxis y CI focal ampliado (2026-10-18)

- Se detectó que la adición de `supports()` en `src/nexo/effect-adapter.js` contenía secuencias literales `\\n` en el código fuente en vez de saltos de línea. Se corrigió antes de continuar la integración. Corrección: [`2247b0672cba85e9bd7e551fc42aa2bbd3dfc299`](https://github.com/snowdenxrp/aldea-ia/commit/2247b0672cba85e9bd7e551fc42aa2bbd3dfc299).
- El workflow anterior no incluía los cambios del adaptador ni ejecutaba su suite; por ello no servía para validar esa frontera. Se amplió para activar con cambios de `effect-adapter.js`, `continuity-owner.mjs`, `runtime.js` y sus pruebas focales, y ejecutar tanto `tests/nexo/effect-adapter.test.mjs` como `tests/nexo/repair-settlement-crash-cuts.test.mjs`. Cambio: [`8c1845e49cf116aad4d7b6de058a1b73b55e4d0d`](https://github.com/snowdenxrp/aldea-ia/commit/8c1845e49cf116aad4d7b6de058a1b73b55e4d0d).
- **Estado de validación:** pendiente de observar los checks/runs exactos de estos commits. No se ejecutaron las suites localmente en esta sesión; no declarar PASS.
- **Siguiente frontera M0:** contrato confiable por acción para reconciliar el estado ambiental persistido y liquidar PREPARED mediante CAS. `supports(action)` solo acredita que existe un handler; no acredita verificador, autoridad, persistencia ni permiso para dispatch. No conectar todavía el runtime genérico ni introducir callbacks de reconciliación aportados por el caller.

## M0 — outcome terminal bloqueado en cualquier estado mientras PREPARED siga abierto (2026-10-18)

- Hallazgo concreto: `recordOutcome()` solo rechazaba `completed` cuando existía un efecto `prepared` o `settled_observed`. Permitía intentar registrar `failed` o `blocked` aunque el efecto pudiera haberse aplicado antes de una interrupción; eso no resolvía la incertidumbre y podía dejar una narrativa terminal contradictoria.
- Corrección en `src/nexo/core/continuity-owner.mjs`: cualquier outcome terminal para esa misma operación queda bloqueado con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` mientras la obligación esté abierta. No liquida el journal ni convierte el bloqueo en una conclusión sobre el efecto.
- Regresión ampliada en `tests/nexo/repair-settlement-crash-cuts.test.mjs`: intenta `completed`, `failed` y `blocked`; los tres deben quedar bloqueados, PREPARED debe permanecer y no debe crearse ningún attempt.
- Commits: código [`86c3ebc8ade8fe018a9c40e95102af13c40f1d22`](https://github.com/snowdenxrp/aldea-ia/commit/86c3ebc8ade8fe018a9c40e95102af13c40f1d22); regresión [`3e3b76de309bbccaa7150e12e0ea5bbf0f2e9826`](https://github.com/snowdenxrp/aldea-ia/commit/3e3b76de309bbccaa7150e12e0ea5bbf0f2e9826).
- El workflow M0 focal fue ampliado en [`8c1845e49cf116aad4d7b6de058a1b73b55e4d0d`](https://github.com/snowdenxrp/aldea-ia/commit/8c1845e49cf116aad4d7b6de058a1b73b55e4d0d) para incluir el owner, runtime y la suite del adaptador además de crash cuts. Aun así, las consultas de status/runs disponibles no devuelven evidencia de ejecución para estos SHAs. **CI PENDING/UNKNOWN; no declarar PASS.**
- Siguiente frontera: contrato confiable de reconciliación por acción y settlement CAS. Esta corrección cierra un bypass de outcomes, no el ciclo de efecto ni la integración del runtime genérico. M0 sigue INCOMPLETO.

## M0 — PREPARED domina también replay de un attempt terminal obsoleto (2026-10-18)

- Hallazgo: aunque `recordOutcome()` ya bloqueaba outcomes terminales nuevos mientras el journal estaba `prepared` o `settled_observed`, la búsqueda de un attempt existente ocurría antes de ese guard. Un replay idéntico podía devolver `already_recorded` pese a que el mismo efecto seguía sin reconciliarse.
- Corrección: el owner comprueba primero la obligación de efecto pendiente y solo después considera idempotencia del attempt. Un attempt previo no invalida ni resuelve PREPARED.
- Regresión: fixture con un attempt `completed` preexistente y el journal `prepared`; repetir el outcome debe devolver `blocked / NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, conservando PREPARED.
- Commits: código [`909d564cbb88812624e29afb7cae7952b55d2b3f`](https://github.com/snowdenxrp/aldea-ia/commit/909d564cbb88812624e29afb7cae7952b55d2b3f); prueba [`2c64848e77c0e6ffc6989c7b16371123b0b19679`](https://github.com/snowdenxrp/aldea-ia/commit/2c64848e77c0e6ffc6989c7b16371123b0b19679).
- Validación: el workflow M0 ampliado incluye esta suite, pero los checks/runs observables consultados siguen sin mostrar una ejecución asociada. **PENDING/UNKNOWN; no afirmar PASS.**
- Siguiente frontera: contrato de reconciliación por acción, verificadores confiables y settlement CAS. Esta corrección endurece replay del owner; no conecta aún el runtime genérico. M0 permanece INCOMPLETO.


## M0 — seam inicial de verificación confiable por acción (2026-10-18)

- Se separó la presencia de un handler (supports(action)) de la capacidad de reconciliación: supportsReconciliation(action) informa únicamente si hay un verificador configurado en el bootstrap confiable.
- createEffectAdapter() acepta ahora verifiers como configuración de arranque y permite registerVerifier(action, verifier). verifyPrepared() solo consulta una obligación que ya exista en estado prepared, comprueba identidad exacta (misión/paso/acción/target/idempotencyKey) y exige que la observación devuelta incluya status applied | not_applied | unknown, acción/target/idempotencyKey coincidentes, observedRevision entero no negativo y source no vacío.
- Si el verificador falta, lanza excepción o devuelve evidencia mal formada, el resultado es unknown; la función no llama handlers, no modifica el journal, no liquida PREPARED y no autoriza redispatch. La función de verificación no acepta el verificador desde el request/caller.
- Código: [6a123952c24a932e8a033de53381fcc17f34aa85](https://github.com/snowdenxrp/aldea-ia/commit/6a123952c24a932e8a033de53381fcc17f34aa85). Pruebas: [a29da03e62279ff748ecdac4ce01ae0b1cc30fb1](https://github.com/snowdenxrp/aldea-ia/commit/a29da03e62279ff748ecdac4ce01ae0b1cc30fb1).
- Validación observable: get_commit_combined_status devolvió statuses vacíos para ambos SHAs. No se ejecutaron las pruebas localmente; CI PENDING/UNKNOWN, no PASS.
- Límite deliberado: este es solo el seam de lectura confiable, no settlement. Aún no existe un contrato común que permita al owner aceptar esa observación mediante CAS y mover PREPARED a un estado terminal. No inferir causalidad a partir de applied, ni redispatch a partir de not_applied. La integración de src/nexo/runtime.js sigue pendiente; M0 INCOMPLETO, efectos protegidos STOP, Nexo/Lúmina separados.
- Siguiente tarea concreta: diseñar y probar settlement CAS en el owner con la observación del verificador registrada como dato no causal y vinculada a identidad/revisión; definir cómo se conserva la procedencia del verificador sin confiar en una observación arbitraria del caller. Solo después evaluar el primer corte vertical del runtime canónico, empezando por bloquear antes de dispatch toda acción sin handler y verificador configurados.


- Endurecimiento del seam después de revisar la frontera de confianza: los verificadores ya no se pueden registrar/reemplazar a través de un método público del adaptador; quedan fijos en la configuración de bootstrap. supportsReconciliation también exige que el valor configurado sea realmente una función. Código: [509cff958c8971a100fc13283e643112596ccf55](https://github.com/snowdenxrp/aldea-ia/commit/509cff958c8971a100fc13283e643112596ccf55). El test usa verifiers de configuración y no depende de registro dinámico.

## M0 — owner registra observación confiable mediante CAS (2026-10-18)

- `createNexoContinuityOwner` recibe ahora `effectVerifiers` como configuración de confianza fija al construir el owner. `reconcilePrepared({ expectedRevision, operation })` valida contexto e identidad contra exactamente una obligación PREPARED, llama solo al verificador configurado para esa acción y valida la respuesta (`applied | not_applied | unknown`, idempotencyKey/acción/target exactos, revisión ambiental entera no negativa y fuente no vacía).
- Si no hay verificador, el verificador falla, la evidencia no valida o responde `unknown`, PREPARED permanece intacto. La función vuelve a leer la continuidad después de la verificación y antes del CAS; si cambió la revisión o la obligación, devuelve conflicto sin sobrescribir el cambio concurrente.
- Para observaciones válidas `applied`/`not_applied`, el owner persiste `status: settled_observed` y la observación en el journal con `commitIfCurrent`. Esto solo registra observación: `journalSettled: false`, `causalAttribution: NOT_ESTABLISHED`, `redispatchAuthorized: false`, `authorization: NOT_EVALUATED`. No convierte el resultado en `completed` ni autoriza redispatch.
- Se preservó el cierre seguro del API anterior: llamadas sin contexto canónico (incluidas observaciones aportadas por caller) continúan bloqueadas con `NEXO_EFFECT_RECONCILIATION_REQUIRED`.
- Pruebas añadidas a `tests/nexo/repair-settlement-crash-cuts.test.mjs`: observación confiable persistida, `unknown` deja PREPARED, ausencia de verificador deja PREPARED y carrera de revisión/CAS no liquida la obligación. Commits de implementación: [f877063545261a1672c9463a9ca0df6a1048462c](https://github.com/snowdenxrp/aldea-ia/commit/f877063545261a1672c9463a9ca0df6a1048462c), [16a259d6e98173f7905d10e463e840e5e78e298e](https://github.com/snowdenxrp/aldea-ia/commit/16a259d6e98173f7905d10e463e840e5e78e298e), [fb6de0a6ebba7886af14d67582a4427fef450319](https://github.com/snowdenxrp/aldea-ia/commit/fb6de0a6ebba7886af14d67582a4427fef450319); pruebas: [530a5455ca83b6879b8de2b1cc5c521af3ce7e63](https://github.com/snowdenxrp/aldea-ia/commit/530a5455ca83b6879b8de2b1cc5c521af3ce7e63), [7cec6b07d49bd1099c7f97b08e512077edecca57](https://github.com/snowdenxrp/aldea-ia/commit/7cec6b07d49bd1099c7f97b08e512077edecca57).
- Validación CI: las consultas de checks y runs asociadas a estos SHAs devolvieron listas vacías. Las pruebas están escritas pero no ejecutadas en esta sesión; **PENDING/UNKNOWN, no PASS**.
- Frontera pendiente: los verificadores concretos aún deben conectarse a fuentes ambientales persistidas reales y la integración de `src/nexo/runtime.js` todavía no usa el owner como ciclo canónico. La reconciliación registrada no basta para cerrar M0. Próxima tarea: validar el contrato de owner contra el verificador real de reparación existente sin duplicar su lógica; después definir el corte vertical mínimo para PREPARED antes del dispatch y settlement tras la verificación. M0 INCOMPLETO; Nexo y Lúmina permanecen separados.

## M0 — separación explícita entre observación genérica y liquidación de reparación (2026-10-18, corrección arquitectónica)

- Durante la integración del owner se detectó que reutilizar `settled_observed` para cualquier acción mezclaría el contrato específico de reparación (`settlement` con revisión ambiental enlazada) con una observación genérica (`reconciliation`). Se corrigió antes de considerar esa ruta integrada.
- Las acciones de reparación (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`) quedan rechazadas por el reconciliador genérico con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`; deben seguir pasando por su contrato específico y revisión ambiental enlazada. No se duplica ni se renombra esa lógica.
- Para acciones no pertenecientes a reparación, la observación CAS se guarda como `reconciled_observed`, distinta de `settled_observed`. Reconstrucción mantiene el paso bloqueado con objetivo `verify_reconciled_effect`; `recordOutcome` y replanning bloquean mientras exista esa observación. Esto no es permiso para redispatch ni una declaración causal.
- Pruebas extendidas: acción genérica observada, reconstrucción bloqueada, outcome terminal rechazado, `unknown` y ausencia de verificador preservan PREPARED, y carrera de revisión no sobrescribe estado. Commits: [1b47319a21b4d7f4f92f3e18b6b3b72c0ff418f9](https://github.com/snowdenxrp/aldea-ia/commit/1b47319a21b4d7f4f92f3e18b6b3b72c0ff418f9), [0b0fad1dffd8771008b6945d5bc9a54c05be41aa](https://github.com/snowdenxrp/aldea-ia/commit/0b0fad1dffd8771008b6945d5bc9a54c05be41aa), [db20ba7c322a3ce32131c274f7f7a850724eb502](https://github.com/snowdenxrp/aldea-ia/commit/db20ba7c322a3ce32131c274f7f7a850724eb502), [f13a8b7ed0dcd7ebd95c1cabe490858fec1a27ef](https://github.com/snowdenxrp/aldea-ia/commit/f13a8b7ed0dcd7ebd95c1cabe490858fec1a27ef), [6f63e89dc6a3992501e36fc7767eb763fa6dc568](https://github.com/snowdenxrp/aldea-ia/commit/6f63e89dc6a3992501e36fc7767eb763fa6dc568), [0c1f6c1c4a39b94708c1a7da3c6587f4731492b7](https://github.com/snowdenxrp/aldea-ia/commit/0c1f6c1c4a39b94708c1a7da3c6587f4731492b7).
- Validación sigue **PENDING/UNKNOWN**: no hay checks/runs visibles para los SHAs consultados y no se ejecutaron pruebas localmente.
- Siguiente frontera: adaptar el verificador persistido real para que proporcione una observación de solo lectura al owner sin duplicar la comprobación ambiental; conservar el settlement de reparación específico donde corresponde. Después integrar el owner con el runtime canónico en un corte vertical que impida dispatch antes de PREPARED confirmado. M0 INCOMPLETO; Nexo/Lúmina separados.

- Ajuste semántico posterior: el resultado del CAS de observación ya no marca `preparedCommitted: true`; devuelve `preparedCommitted: false` y `observationCommitted: true` para no confundir la admisión PREPARED original con la escritura de reconciliación. Código [0fb4555efba22c8be59e6ebf015ff450ab086ae0](https://github.com/snowdenxrp/aldea-ia/commit/0fb4555efba22c8be59e6ebf015ff450ab086ae0), regresión [8703cbd512f2c65495a34f5f713307b1ece0cc42](https://github.com/snowdenxrp/aldea-ia/commit/8703cbd512f2c65495a34f5f713307b1ece0cc42). Validación aún PENDING/UNKNOWN.

- Regresión adicional: se prueba explícitamente que `repair_agent_state` no puede liquidarse mediante el contrato genérico aunque haya un verificador configurado; la ruta devuelve `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` y mantiene PREPARED. Prueba [3c19383f848f43bd606687aeee1c96d56f35a183](https://github.com/snowdenxrp/aldea-ia/commit/3c19383f848f43bd606687aeee1c96d56f35a183). Sigue PENDING/UNKNOWN hasta un run/check observable.

- Fail-closed adicional en el owner: el clonado/validación del payload de evidencia y la validación del snapshot quedan dentro de una captura de error; una evidencia no serializable devuelve `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID` sin cambiar PREPARED. Código [6cc47a6c591c06db2818d3abbc9a65ce63bb134e](https://github.com/snowdenxrp/aldea-ia/commit/6cc47a6c591c06db2818d3abbc9a65ce63bb134e). CI todavía PENDING/UNKNOWN.

- Prueba adicional para evidencia no serializable: el owner bloquea y conserva PREPARED con `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID`. Commit de prueba [a5a6c097bb30b005593282724a99124356313020](https://github.com/snowdenxrp/aldea-ia/commit/a5a6c097bb30b005593282724a99124356313020). No declarar PASS sin ejecución CI observable.

## M0 — inmovilizar el registro de verificadores al construir el owner (2026-10-18)

- Hallazgo: aunque los verificadores se recibían al construir `createNexoContinuityOwner`, el owner conservaba el objeto de registro externo. El caller podía reemplazar una función después de la construcción, lo que contradecía el límite de confianza descrito.
- Corrección: el owner valida el registro, copia las funciones a un mapa propio sin prototipo y congela sus propiedades. `reconcilePrepared` solo consulta esa copia; el objeto de configuración original ya no puede reemplazar el verificador registrado.
- Regresión añadida: se construye el owner, se muta después el registro externo y se comprueba que el verificador original continúa siendo el invocado. Código [776051522ec54ca3f159e6a95d15f0424ad4b7f3](https://github.com/snowdenxrp/aldea-ia/commit/776051522ec54ca3f159e6a95d15f0424ad4b7f3), prueba [3070a8e514f0ca37fb9106f72641421ea725677f](https://github.com/snowdenxrp/aldea-ia/commit/3070a8e514f0ca37fb9106f72641421ea725677f).
- Este ajuste inmoviliza la selección del verificador, no vuelve confiable cualquier función por arte de magia: el bootstrap sigue siendo frontera de confianza y el verificador debe leer estado ambiental persistido. Tampoco liquida efectos, prueba causalidad ni habilita redispatch.
- CI sigue PENDING/UNKNOWN: no se observaron checks/runs disponibles y no se ejecutaron pruebas localmente. M0 permanece incompleto; siguiente tarea es el corte vertical mínimo de runtime con PREPARED confirmado antes del dispatch y resultado incierto conservado como obligación abierta.

## M0 — primer corte vertical del runtime con owner canónico (2026-10-18)

- Se añadió `executeNexoStepWithContinuityOwner` en `src/nexo/runtime.js`, como ruta explícita separada del runtime legado. Solo admite acciones no-reparación que tengan handler y verificador de reconciliación registrados tanto en el adaptador como en el owner.
- Orden obligatorio: cargar misión canónica → comprobar capacidades antes de cualquier efecto → `recordPrepared` → exigir confirmación explícita `status: committed` y `preparedCommitted: true` → dispatch → registrar lineage → reconciliar con el verificador del owner. La ruta no escribe outcome terminal ni marca el efecto liquidado; devuelve `observed`/`unknown`, con `redispatchAuthorized: false`.
- Si la llamada a PREPARED arroja incertidumbre, no se despacha (`NEXO_PREPARED_COMMIT_OUTCOME_UNKNOWN`). Si el adaptador arroja después del dispatch, se conserva UNKNOWN y no se reintenta. Si falla la persistencia de lineage o la reconciliación, tampoco se convierte la incertidumbre en éxito.
- Reparaciones (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`) quedan bloqueadas antes de PREPARED/dispatch en esta ruta, porque su contrato ambiental ligado a revisión aún no está integrado con el owner canónico. Deben seguir el settlement específico; no se intenta usar el reconciliador genérico.
- El registro de verificadores del owner ahora se copia y congela al construirlo, con regresión para impedir reemplazo desde el objeto de configuración original.
- Commits de runtime y pruebas: [dd3a981](https://github.com/snowdenxrp/aldea-ia/commit/dd3a98190ff763f2546b167fd4926ec9d900c326), [211e5d2](https://github.com/snowdenxrp/aldea-ia/commit/211e5d207bc596d0169c2411f53e9a493e8711ba), [cad56cd](https://github.com/snowdenxrp/aldea-ia/commit/cad56cd8dc74e9aef56446d6b338d08e70e07506), [1533c36](https://github.com/snowdenxrp/aldea-ia/commit/1533c36193e1b8c940185b9fed1bc1a3cc426a6f), [220dcc2](https://github.com/snowdenxrp/aldea-ia/commit/220dcc28219f31dba43da1c6067a5a27c38e4c9a), [bcec2ee](https://github.com/snowdenxrp/aldea-ia/commit/bcec2eec151f13f7d905610ea99817e01e240c10), [5ce72d8](https://github.com/snowdenxrp/aldea-ia/commit/5ce72d8a10ba8c7494363d2519817207d38dc11b), [8317a46](https://github.com/snowdenxrp/aldea-ia/commit/8317a46611e016b6f91f773f46ccad64988f4d2b).
- Pruebas añadidas en `tests/nexo/runtime.test.mjs`: orden PREPARED→dispatch→lineage→reconcile, falta de verificador bloquea antes de PREPARED, throw de dispatch no provoca lineage/retry, incertidumbre de commit PREPARED no permite dispatch, fallo de lineage permanece UNKNOWN y reparación bloqueada antes de dispatch.
- Validación: no se pudieron observar checks/runs de CI desde las herramientas disponibles y no se ejecutaron pruebas localmente; estado PENDING/UNKNOWN, no PASS. La nueva ruta necesita validación ejecutada antes de promoverla como camino predeterminado.
- Siguiente paso: validar con CI observable; después integrar el verificador persistido genérico real y el contrato de reparación específico al owner sin cruzar stores atómicamente ni mezclar Nexo/Lúmina. Solo entonces considerar mover consumidores al nuevo runtime. M0 INCOMPLETO.

## M0 — CI observada y regresiones corregidas (2026-10-18 22:14 UTC)

- Se consultaron los runs reales de GitHub Actions, no solo combined-status. La primera ejecución falló en `tests/nexo/simulation-restart-persistence.test.mjs:479`: el test esperaba `conflict` al repetir una liquidación que ya estaba persistida, mientras que el contrato de recuperación por respuesta perdida devuelve `settled_observed / NEXO_REPAIR_SETTLEMENT_ALREADY_JOURNALED`. Se actualizó la expectativa para probar recuperación idempotente y ausencia de atribución causal: [cambio de prueba](https://github.com/snowdenxrp/aldea-ia/commit/a25669271e5e7470d9cedc84615a53955dbee3aa).
- La siguiente ejecución detectó otro test obsoleto en `tests/nexo/continuity-migration.test.mjs:336`: intentaba registrar un outcome `blocked` mientras la obligación seguía en `PREPARED`. El contrato correcto es bloquear todo outcome terminal hasta reconciliar. Se corrigió para exigir `status: blocked`, código `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, revisión sin incremento y ausencia de intento terminal: [cambio de prueba](https://github.com/snowdenxrp/aldea-ia/commit/7a34a4366a8a59a8d71616c522aced77074da13c).
- CI confirmada en el commit `7a34a4366a8a59a8d71616c522aced77074da13c`:
  - [Nexo — bounded mission admission and restart continuity: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379142). Incluye `runtime.test.mjs`, `simulation-restart-persistence.test.mjs` y `continuity-migration.test.mjs`.
  - [Nexo M0 — repair settlement crash cuts: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379055).
  - [STEP 4 semantic validation: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379069).
  - [STEP 5 outcome classification: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379122).
- Esta validación sí es evidencia CI observable para las suites anteriores y la nueva ruta de runtime. No implica que M0 esté terminado ni que se haya integrado el verificador ambiental real al owner para toda acción. El runtime owner-backed continúa siendo una ruta explícita nueva, no reemplaza el runtime legado; reparación permanece bloqueada en esa ruta hasta integrar su contrato específico. Próxima frontera: hacer que la observación genérica se apoye en lectura ambiental persistida real, conectar reparación al owner sin prometer atomicidad entre stores y seguir validando cada corte vertical. M0 INCOMPLETO.

## M0 — evitar un segundo journal al despachar desde PREPARED canónico (2026-10-18 22:20 UTC)

- Hallazgo arquitectónico: el primer corte `executeNexoStepWithContinuityOwner` llamaba a `adapter.execute()`. En un adaptador configurado con `executionJournal` o `persistPreparedIntent`, eso podía crear otro PREPARED/local journal además del journal canónico del owner. Eso contradice el objetivo de una sola continuidad operativa canónica.
- Corrección: `createEffectAdapter` ahora expone `executePrepared(request, { preparedCommit })`. Exige confirmación de PREPARED (`status: committed`, `preparedCommitted: true`, revisión válida) y que `request.preparedOperation` coincida exactamente con la identidad de la solicitud. En este modo no escribe intención ni resultado al journal local ni invoca `persistPreparedIntent`; el resultado es devuelto al runtime para registrar lineage en el owner canónico. Si ya existe un registro local para esa clave, bloquea en lugar de fusionar ledgers.
- El runtime owner-backed ahora requiere `executePrepared` y lo llama solo después de la confirmación canónica. Las acciones de reparación siguen bloqueadas antes del dispatch en esta ruta hasta conectar su settlement ambiental específico.
- Se abrió la configuración de verificadores confiables en `openNexoContinuityOwner({ effectVerifiers })`; el owner copia y congela ese registro. Esto es solo un punto de inyección de bootstrap: no hay todavía un verificador ambiental genérico conectado por defecto. Sin registro específico, la ruta sigue bloqueada antes de PREPARED.
- Commits: bootstrap de verificadores [1f10238](https://github.com/snowdenxrp/aldea-ia/commit/1f102389b358b14c94ecd7bc2ed7c8c4e96fdbc1), adaptador sin journal duplicado [df9b146](https://github.com/snowdenxrp/aldea-ia/commit/df9b1465befc426d77532d53f3311df51a7ff3e6), corrección de persistencia condicional [ff8d7d1](https://github.com/snowdenxrp/aldea-ia/commit/ff8d7d1f328372e5eb7da6a44e75199f62e321ec), integración del runtime [85ef18f](https://github.com/snowdenxrp/aldea-ia/commit/85ef18fbf3d730aa85bffa36a8afcf4995ac05ad), actualización de pruebas del runtime [3702e4a](https://github.com/snowdenxrp/aldea-ia/commit/3702e4a390d3f318b4b0559b9920b4eddde44ef3).
- CI observada para `3702e4a390d3f318b4b0559b9920b4eddde44ef3`: [bounded mission admission/restart continuity SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723235), [STEP 4 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723241), [STEP 5 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723238). Un run previo del runtime falló por mocks de prueba todavía usando la API anterior (`execute`); la actualización de tests al nuevo contrato fue seguida por la ejecución verde de bounded. No afirmar que ese fallo anterior pasara.
- Próximo corte: añadir prueba directa del nuevo método del adaptador y probar fallo de precondición en modo owner-prepared sin escribir al journal local; configurar un verificador genérico real solo cuando exista un contrato de lectura persistida específico para la acción. No conectar el estado de Lúmina como fuente genérica de verdad de Nexo. M0 INCOMPLETO.


## M0 — cobertura directa de executePrepared (2026-10-18; CI pendiente)

- Commit de pruebas: [da3f3fa](https://github.com/snowdenxrp/aldea-ia/commit/da3f3fa2621e1dd046a10d028b4fe8a81faee582). Se agregaron pruebas directas de `createEffectAdapter().executePrepared()`:
  - recibo PREPARED inválido bloquea antes de dispatch;
  - recibo committed válido ejecuta sin escribir un segundo journal ni llamar a `persistPreparedIntent`;
  - conflicto con entrada local preexistente para la misma clave bloquea y conserva la obligación local;
  - precondición fallida en modo canónico no crea journal local ni llama persistencia local.
- La actualización está confirmada en el branch, pero los checks/runs consultados para este SHA no muestran ejecución asociada. **Estas pruebas están añadidas; su resultado CI sigue PENDING/UNKNOWN.** No declarar PASS.
- Esto valida el contrato del adaptador a nivel unitario cuando se ejecute; no demuestra por sí solo que el recibo sea una prueba criptográfica ni que el runtime esté conectado por defecto. La autoridad para invocar este modo sigue siendo el runtime que obtiene la confirmación del owner.
- Siguiente corte: obtener ejecución CI observable de `tests/nexo/effect-adapter.test.mjs`; corregir cualquier fallo real. Luego identificar una acción genérica concreta con un lector de estado persistido real. Si no hay acción/fuente de verificación definida, mantener el preflight bloqueante; no inventar un verificador genérico ni cambiar el runtime por defecto.


## M0 — pruebas canónicas de adaptador ejecutadas en CI (2026-10-18)

- Para el commit de pruebas [da3f3fa2621e1dd046a10d028b4fe8a81faee582](https://github.com/snowdenxrp/aldea-ia/commit/da3f3fa2621e1dd046a10d028b4fe8a81faee582), se observaron dos runs completos:
  - [Nexo M0 — effect and settlement contract regressions, run 39172107130](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172107130): **SUCCESS**. El paso Effect adapter contract regressions y settlement crash cuts terminaron SUCCESS.
  - [bounded mission admission and restart continuity, run 39172107167](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172107167): **SUCCESS**. Incluye runtime, effect-adapter.test.mjs, restart reconstruction, continuity store/contract/migration y otras regresiones listadas en el workflow.
- Esto valida esas suites en ese SHA; no declara M0 completo ni cambia el runtime por defecto.
- Revisión del siguiente límite: no se debe elegir el adaptador de Lúmina como verificador genérico porque su estado simulado en memoria no demuestra estado ambiental persistido tras reinicio. Las acciones repair tienen settlement específico y no son un atajo para generalizar el contrato. Aún no está identificada una acción genérica no-repair con escritura persistida y lector independiente reales.
- **Siguiente paso exacto:** trazar desde la entrada real de Nexo una acción no-repair candidata hasta su mutación persistida y el mecanismo independiente para leerla después de reiniciar. Si no existe tal pareja escritura/lector, diseñar el mínimo contrato persistente que la acción necesita antes de implementar el verificador. No escribir un verificador ficticio, no habilitar dispatch por conveniencia y no mezclar Nexo con Lúmina. M0 sigue INCOMPLETO.


## M0 — bloqueo estructural identificado: no hay aún un dominio de efectos propio de Nexo (2026-10-18)

La inspección de la entrada real confirma por qué no se debe improvisar un verificador:

- `scripts/assistants.mjs` abre el owner canónico de Nexo y persiste la misión, pero construye los reportes y `buildNexoMission()` a partir de `simulation`, los agentes y las acciones del dominio de Lúmina.
- `src/nexo/simulation-adapter.js` delega las acciones permitidas a `executeAction` de `src/actions.js`; sus postcondiciones leen el objeto `simulation` en memoria. Eso no es una fuente independiente de estado ambiental persistido después de reiniciar.
- `scripts/nexo-runtime-session.mjs` solo selecciona `repair_agent_state`, `repair_agent_needs` y `repair_resource_state`, que ya tienen un contrato repair-only con revisión ambiental.
- Por tanto, el repositorio todavía no ofrece una acción genérica no-repair propia de Nexo con writer + reader persistido independiente. Reusar `execute_lumina_action` como si fuera esa acción mantendría la dependencia que la arquitectura prohíbe.

**Decisión de trabajo:** no implementar todavía un verificador genérico ni cambiar el runtime por defecto. El siguiente diseño debe definir la primera capacidad/efecto nativo de Nexo y su estado persistido canónico (fuera de la simulación de Lúmina), incluyendo quién escribe, quién lo lee después de reinicio y qué invariante observable permite reconciliarlo. Solo entonces se añade un verificador por acción y se prueba el ciclo PREPARED → dispatch → lineage → observación/settlement sin redispatch. No construir otro monolito ni inventar infraestructura general antes de tener una acción concreta. M0 sigue INCOMPLETO.


## M0 — preflight doble de verificador confirmado en CI (2026-10-18)

- Prueba añadida en `tests/nexo/runtime.test.mjs`, commit [2088417a482fefc0128f024c8c63fa212e87d64f](https://github.com/snowdenxrp/aldea-ia/commit/2088417a482fefc0128f024c8c63fa212e87d64f): aunque el owner anuncie un verificador, si el adaptador no anuncia su propio contrato de reconciliación, el runtime bloquea antes de PREPARED y antes de dispatch.
- CI observable: [run 39172525158 — bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525158) SUCCESS. Incluye `runtime.test.mjs`, `effect-adapter.test.mjs`, reconstrucción tras reinicio, store y contrato de continuidad.
- STEP 4 y STEP 5 también SUCCESS para este SHA: [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525106), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525094). No extrapolar estas suites a M0 completo.
- El bloqueo arquitectónico sigue igual: no hay aún una acción no-repair nativa de Nexo con writer persistente + lector independiente post-restart. La ruta simulada de Lúmina no sirve como sustituto. La siguiente tarea no es agregar más preflights, sino definir la primera vertical nativa y su fuente persistida concreta antes de conectar un verificador específico.


## M0 — primera vertical nativa seleccionada: Chronicle (2026-10-18)

- Decisión documentada en [NCS_M0_FIRST_NATIVE_VERTICAL_CHRONICLE_2026-10-18.md](BUILD/NCS_M0_FIRST_NATIVE_VERTICAL_CHRONICLE_2026-10-18.md): usar una escritura de Chronicle como primer candidato no-repair para demostrar writer persistente + reader independiente tras reapertura, usando la identidad/idempotency key de la operación existente. Chronicle se mantiene separado de continuidad operativa, memoria ordinaria y Lúmina.
- Es una decisión de vertical, no implementación ni autorización de dispatch. Aún faltan writer/reader reales, idempotencia/conflicto, verificador específico, crash-cut tests y CI. No cambiar el runtime por defecto; M0 INCOMPLETO.
- Siguiente: inspeccionar convenciones de persistencia existentes e implementar solo el almacenamiento mínimo de Chronicle y sus pruebas de reapertura/concurrencia; luego conectar el verificador específico a la ruta owner-backed. No añadir otro effect journal ni asumir atomicidad cross-store.


## M0 — primera vertical Chronicle implementada; CI pendiente de observar (2026-10-18)

- Se añadió `src/nexo/core/chronicle-store.mjs`: store local de historia durable separado del continuity owner, inicialización explícita (la lectura/escritura no reconstruye un archivo ausente), validación de esquema, clave de operación única, append idempotente para la misma clave/contenido y conflicto para misma clave/contenido distinto. Usa lock local y reemplazo por archivo temporal; no afirma fsync ni resistencia a pérdida de energía/rollback.
- Se añadió `src/nexo/adapters/chronicle-observation.mjs`: observación por lectura nueva del store; devuelve `applied`, `not_applied` o `unknown`, y no reclama causalidad.
- Pruebas `tests/nexo/chronicle-store.test.mjs`: archivo ausente bloquea, inicialización explícita, escritores concurrentes con la misma clave no duplican la entrada, conflicto de contenido, nueva instancia/lectura post-restart y JSON corrupto → UNKNOWN.
- Workflow focal: `.github/workflows/nexo-m0-chronicle.yml`, ejecuta únicamente la suite nueva en Node 22.
- Commits de código/prueba/workflow: [store](https://github.com/snowdenxrp/aldea-ia/commit/aa9a3a34fd955edc19759aa8996416de7f938c7f), [observador](https://github.com/snowdenxrp/aldea-ia/commit/ef104bd8f2395449cc68fcaf374c136e17a367cb), [pruebas](https://github.com/snowdenxrp/aldea-ia/commit/8535c3a4df301d94b4f5d2bee3bf4b041e8402c5), [workflow](https://github.com/snowdenxrp/aldea-ia/commit/9c759110dc2ac76b20030c2d9fac2a8feb18fa0e). **No declarar PASS hasta observar el run real.**
- Todavía NO está conectado al runtime owner-backed ni a `effectVerifiers`; no existe settlement genérico habilitado por este cambio. Próximos cortes: observar CI y corregir fallos; agregar crash cuts de escritura/respuesta perdida; definir cómo ligar el resultado del observador a la PREPARED exacta y al CAS del owner; integrar solo esta acción y probar el flujo completo antes de cualquier cutover. M0 INCOMPLETO, efectos protegidos STOP, Nexo/Lúmina separados.


## M0 — primera CI verde de Chronicle y ampliación crash-cut en curso (2026-10-18)

- Corrección de estado: el workflow focal sí se ejecutó y terminó verde para la versión inicial de la vertical: [run 39173007733 — Chronicle persisted writer and independent reader, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173007733). El paso `Chronicle store and post-restart observation` terminó SUCCESS en SHA `9c759110dc2ac76b20030c2d9fac2a8feb18fa0e`.
- Después se ampliaron `tests/nexo/chronicle-store.test.mjs` para cubrir dos escrituras concurrentes con claves distintas y respuesta perdida después de que el rename ya persistió. El nuevo commit de pruebas es [bf3ded5](https://github.com/snowdenxrp/aldea-ia/commit/bf3ded518216a9556118b36f6f6135a7baa3fa93); su run [39173111447](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173111447) está QUEUED/PENDING al registrar esta nota. No declarar esas pruebas ampliadas como verdes hasta revisar el resultado.
- Sigue siendo una vertical de store/verifier, no una integración completa de efectos: no está conectada al runtime ni al CAS de settlement del owner. M0 INCOMPLETO; efectos protegidos STOP; runtime default sin cambios; Nexo/Lúmina separados.


## M0 — crash-cut Chronicle verde en CI (2026-10-18)

- La ampliación de pruebas también quedó verde: [run 39173111447 — Chronicle persisted writer and independent reader, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173111447), SHA `bf3ded518216a9556118b36f6f6135a7baa3fa93`. El job y el paso focal de Chronicle terminaron SUCCESS.
- Se valida, para esta suite acotada: lectura post-reapertura, idempotencia por misma clave/contenido, conflicto por contenido distinto, concurrencia tanto con misma clave como con claves diferentes, corrupción → UNKNOWN y respuesta perdida simulada después de rename ya persistido que se recupera mediante lectura posterior. Esto no prueba fsync, pérdida de energía ni runtime integrado.
- Siguiente corte: integrar el observador al contrato de reconciliación del owner sin permitir que el caller proporcione su propia evidencia ni que un resultado Chronicle liquide otra PREPARED. Primero revisar la forma exacta de `effectVerifiers`, `reconcilePrepared()` y CAS; luego añadir pruebas de identidad, revisión, crash/replay. M0 sigue INCOMPLETO.


## M0 — Chronicle conectado a la ruta owner-backed; integración vertical validada (2026-10-18)

- Se añadió `src/nexo/adapters/chronicle-effect.mjs`: contrato específico `chronicle_append` con handler, postcondition y verifier, sin activarlo automáticamente. El target de la operación lleva el contenido exacto que se verifica; la clave sigue siendo la identidad canónica `missionId:stepId`.
- `src/nexo/core/continuity-owner.mjs` ahora permite que la observación de Chronicle pase a `settled_observed` solo cuando el verificador registrado para `chronicle_append` devuelve `applied` desde `nexo-chronicle-store`; la admisión de outcome completed está ligada a la misma clave, acción, target y settlement persistido. Las demás acciones conservan el gate anterior.
- `src/nexo/runtime.js` completa el outcome de Chronicle solo tras esa observación; recuperación de PREPARED y replay de outcome leen estado persistido y nunca redispatch automáticamente.
- Prueba de integración real añadida en `tests/nexo/chronicle-runtime.test.mjs`: stores reales, owner real, adapter real; flujo completo PREPARED → dispatch → lineage → lectura independiente → settlement → outcome; restart después de append antes de lineage; PREPARED sin entrada no dispara reintento; respuesta perdida tras commit del outcome se recupera sin dispatch; replay tras settlement no duplica; se agregó guard para bloquear completion inventado sin settlement.
- CI observada para el flujo real y crash cuts anteriores: [run 39173898535 — Chronicle native vertical, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173898535), SHA `5e076ac31bd0c74432f104e54699918984520103`. El test nuevo de completion inventado está en [run 39173941624](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941624), todavía PENDING al registrar esta nota; el cambio de owner está en run 39173935254, IN_PROGRESS. No extrapolar éxito a esos SHA hasta confirmar sus runs.
- Iteraciones fallidas no ocultadas: [39173270651](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173270651) detectó un literal `\\n` que invalidó sintaxis; [39173290225](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173290225) detectó tests aún usando la firma anterior del verifier; [39173452126](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173452126) detectó invocación incorrecta de `contracts.verifiers`; las siguientes iteraciones corrigieron esos fallos y tuvieron CI verde.
- Estado: primera vertical nativa conectada en una ruta explícita y con crash/restart cubiertos; no es autorización para activar otras acciones ni para cambiar el runtime legado a default. No se reclama fsync, resistencia a pérdida de energía/rollback ni atomicidad entre Chronicle y continuity store. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.
- Siguiente: observar runs 39173935254 y 39173941624; después ejecutar/verificar suites amplias de runtime/owner y auditar el contrato de crash cuts contra el SHA final. Mantener el runtime por defecto sin cambiar hasta cerrar evidencia de la integración y decidir explícitamente su cutover.


## M0 — guard contra completion inventado y suites afectadas verdes (2026-10-18)

- CI final de la iteración: [run 39173941624 — Chronicle native vertical, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941624), SHA `47790c4014581c42fc5f85f9ba609e3a0678b53b`. Pasaron tanto la suite del store como el runtime owner-backed, incluidos: bloqueo de completion sin settlement, append real, recuperación tras restart, no-apply sin redispatch y replay de outcome tras respuesta perdida.
- En el SHA inmediatamente anterior del cambio de owner, también pasaron [bounded mission admission and restart continuity, run 39173935284](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935284), [STEP 4 run 39173935176](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935176) y [STEP 5 run 39173935237](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935237). Para el SHA final 47790, STEP 4 [run 39173941657 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941657) y STEP 5 [run 39173941656 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941656).
- La integración sigue siendo una ruta explícita de runtime; no se ha cambiado `scripts/assistants.mjs` ni el runtime default, y todavía no existe una entrada de producto nativa independiente de Lúmina para invocar esta capacidad. La siguiente tarea es crear esa entrada mínima sin importar simulación ni inventar IDs: exigir misión/step IDs suministrados, rutas de store explícitas e inicialización opt-in; validar que una misión existente coincida exactamente antes de ejecutar.
- M0 sigue INCOMPLETO hasta que la entrada Nexo propia esté integrada y se pruebe junto a esta vertical. No ampliar a otras acciones, no habilitar efectos protegidos, no reclamar fsync/power-loss durability ni atomicidad cross-store.


## M0 — entrada propia de Chronicle disponible; CI final verde (2026-10-18)

- Se añadió `scripts/nexo-chronicle-session.mjs`: entrada local explícita que no importa Lúmina ni simulación. Requiere rutas de continuidad/Chronicle, missionId y stepId suministrados por el caller, y contenido; la inicialización de cada store es opt-in mediante flags. Antes de ejecutar, valida que una misión existente coincida exactamente con el contenido/acción/step y bloquea el reuso de identidad con payload distinto.
- El script construye el owner con el verifier confiable de Chronicle y el adaptador de una sola acción `chronicle_append`; el runtime solo da completed después de observación persistida, settlement y outcome. Replay/recovery no redispatcha.
- Pruebas de entrada real incluidas en `tests/nexo/chronicle-runtime.test.mjs`: inicialización explícita, primera escritura, replay sin dispatch, payload diferente bloqueado y stores ausentes bloqueados sin flags.
- `package.json` incluye ambas suites Chronicle en el test estándar; el workflow focal se dispara también si cambia `package.json`.
- CI final: [run 39174162150 — Chronicle native vertical, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174162150), SHA `1ef9a4745d31d324b56733e43e250d36bb3908b7`. Tanto el paso del store/reader como el de runtime owner-backed/recovery terminaron SUCCESS. CI de entrada antes del último ajuste también fue verde en [run 39174097465](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174097465).
- Comando local documentado por interfaz: `node scripts/nexo-chronicle-session.mjs --continuity <ruta> --chronicle <ruta> --mission <id-suministrado> --step <id-suministrado> --content "texto" --initialize-continuity --initialize-chronicle`. Los flags de inicialización se omiten cuando los stores ya existen. No generar IDs por cuenta propia.
- **Alcance real:** primera vertical nativa de Nexo funciona por una entrada explícita y tests con stores/owner/adapter reales. No se ha migrado el runtime por defecto ni `scripts/assistants.mjs`; no se habilitaron otras acciones. Sin garantía fsync/pérdida de energía/rollback ni atomicidad cross-store. M0 sigue INCOMPLETO hasta auditar la integración de la entrada y definir el siguiente corte nativo sin mezclar Lúmina.


## M0 — suites Chronicle y continuidad acotada verdes en el mismo SHA (2026-10-18)

- SHA validado: `4626afbb1220feb0784c020288de697608b9276b`.
- [Chronicle native vertical, run 39174272574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272574): SUCCESS; store, verificador, runtime owner-backed, entrada CLI y recuperación tras reinicio.
- [Bounded mission admission and restart continuity, run 39174272526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272526): SUCCESS; orchestrator, runtime, adapter, reconstrucción, persistencia de reinicio, contrato/store/migración de continuidad y ambas suites Chronicle.
- STEP 4 y STEP 5 ya estaban verdes en el SHA inmediatamente anterior; el código del owner/runtime no cambió entre ese SHA y 4626, que añadió las pruebas de corrupción de stores y los triggers de workflow.
- No declarar M0 completo: la vertical cubre una acción y un CLI explícito. No hay cutover del runtime legado ni integración con `scripts/assistants.mjs`; esa separación es deliberada para no reintroducir Lúmina. Siguiente frontera: auditar los contratos de bootstrap/path de almacenamiento y decidir el corte de integración principal sin ampliar el dominio de acciones.


## M0 — auditoría de identidad de operación en Chronicle (2026-10-18)

- En la auditoría de la entrada propia se detectó una ambigüedad del formato heredado `missionId:stepId`: IDs que contuvieran `:` podían producir la misma clave concatenada para pares distintos. No se cambió el formato global ni se migraron journals; el entrypoint Chronicle ahora rechaza IDs con separador o espacios periféricos mediante `NEXO_CHRONICLE_ID_INVALID`. Es una restricción explícita de esta vertical para mantener compatibilidad con la identidad canónica existente.
- Se agregaron pruebas para colisión en missionId, colisión en stepId y espacios periféricos. Ambos workflows quedaron SUCCESS en el SHA `de89e228ca5b46becd17ef2e3159ab2e47c25f8e`: [Chronicle native vertical run 39174610849](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610849) y [bounded continuity/runtime run 39174610848](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610848).
- Estado de la frontera: la entrada sigue opt-in y Chronicle-only; runtime por defecto intacto; no hay garantía de fsync/pérdida de energía/rollback ni atomicidad entre los dos stores. M0 INCOMPLETO. Siguiente: auditar el parser CLI y sus errores de entrada, documentar el contrato de bootstrap de los stores y no ampliar acciones ni tocar `scripts/assistants.mjs`.


## M0 — parser CLI endurecido y CI verde (2026-10-18)

- `parseNexoChronicleArguments()` ahora rechaza opciones desconocidas, opciones de valor duplicadas, flags duplicados, valores ausentes y valores que comienzan con otra opción. Se agregó manejo de errores en la entrada ejecutable que devuelve un código estructurado sin imprimir contenido de Chronicle, stack ni rutas de archivos.
- Pruebas de parser agregadas a `tests/nexo/chronicle-runtime.test.mjs`; la identidad de operación también se valida contra colisiones del separador heredado.
- Un run intermedio [39174663488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174663488) falló por una aserción que aún esperaba el código previo para IDs inválidos; la aserción ya reflejaba el contrato explícito y se volvió a ejecutar. SHA final de esta iteración: `d7af2db2150ab6be57683ad1e15977f29c613081`. [Chronicle run 39174722540 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722540) y [continuity/runtime run 39174722491 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722491).
- Siguiente corte: validar con ejecución CLI real (subproceso) que argumentos inválidos no toquen stores y que la salida no contenga el contenido privado; revisar el bootstrap explícito y el contrato de almacenamiento. No cambiar runtime default ni ampliar acciones. M0 INCOMPLETO.


## M0 — frontera CLI real probada; stores intactos ante argumentos inválidos (2026-10-18)

- La suite ahora lanza `scripts/nexo-chronicle-session.mjs` como subproceso real, no solo llama al parser exportado. Con argumento desconocido y contenido centinela, confirma salida no cero, código estructurado `NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID`, stderr vacío, sin filtrar el contenido y sin crear ninguno de los dos stores.
- SHA validado: `429fc980427c04f8db286e28ee9887333941acb8`. [Chronicle run 39174861087 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861087); [bounded continuity/runtime run 39174861039 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861039).
- Con esto queda cubierto el límite CLI para errores de gramática. No equivale a validar todos los escenarios del SO/filesystem, durabilidad ante pérdida de energía ni rollback. Bootstrap sigue explícito; archivos faltantes/corruptos no se regeneran sin el flag, y corrupción existente no se sobrescribe.
- Siguiente: revisar el contrato de persistencia local (directorios padres, archivos temporales/locks, symlinks y límite de concurrencia soportado), decidir qué garantías se pueden afirmar y documentar los límites sin prometer fsync. Mantener runtime default sin cambios; M0 INCOMPLETO.


## M0 — privacidad de entrada CLI y auditoría de filesystem (2026-10-18)

- Auditoría detectó que `--content <texto>` exponía el cuerpo de Chronicle como argumento de proceso, aunque el programa no lo imprimiera. Se eliminó esa opción. El CLI ahora requiere `--content-stdin` y lee el contenido desde stdin; si stdin es TTY, falla cerrado en lugar de quedarse esperando. El contenido no aparece en argv ni en stdout/stderr.
- Prueba real de subproceso valida ambas rutas: argumentos inválidos no crean stores ni filtran el centinela; la invocación válida transmite por stdin, termina completed y el cuerpo aparece únicamente en el archivo Chronicle persistido. Se verificó que la lista de argumentos construida no contiene el contenido.
- SHA final: `0ea0b8bcbd68a2e2062e359b11247cd6a04a2457`. [Chronicle CI 39176108822 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108822); [continuidad/runtime CI 39176108833 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108833).
- Auditoría del store: la escritura usa archivo temporal + rename y lectura posterior, pero eso no prueba fsync ni supervivencia a pérdida de energía. Las rutas de almacenamiento son suministradas por caller; no hay sandbox/canonicalización de rutas ni protección demostrada frente a symlinks. La recuperación de locks viejos usa comprobación de edad/PID seguida de borrado; ese check-then-remove no demuestra exclusión robusta bajo carreras adversariales entre procesos. No declarar soporte distribuido ni garantías de lock frente a procesos hostiles. Esto queda como bloqueo explícito antes de integración de producción.
- No cambié el runtime por defecto, no amplié las acciones y no mezclé Lúmina. Próximo corte: especificar el modelo de confianza de rutas/filesystem y resolver de forma comprobable la reclamación segura de locks o limitar formalmente la ejecución a un único proceso cooperante; después añadir pruebas de concurrencia entre procesos. M0 sigue INCOMPLETO.


## M0 — concurrencia multiproceso cooperante verificada (2026-10-18)

- Se amplió `tests/nexo/chronicle-store.test.mjs` para iniciar dos procesos Node independientes que escriben claves distintas simultáneamente al mismo Chronicle y después abrir un reader nuevo. Ambas operaciones deben confirmar commit y ambas entradas deben sobrevivir; el test pasó.
- SHA: `6940f9524773b36a97d8c6eb44d7c2bd81146d62`. [Chronicle run 39176214934 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214934), [continuidad/runtime 39176214965 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214965), [STEP 4 39176214931 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214931), [STEP 5 39176214932 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214932).
- Esta prueba demuestra solo dos escritores cooperantes bajo el filesystem local de CI; no resuelve la carrera de reclamación de locks obsoletos ni valida procesos adversariales, symlinks o power loss. Esas limitaciones siguen bloqueando integración de producción. M0 INCOMPLETO.


## M0 — stale-lock reclamation fail-closed (validado 2026-10-18)

- Se eliminó la eliminación automática de locks considerados obsoletos en `src/nexo/core/chronicle-store.mjs` y `src/nexo/core/continuity-store.mjs`. El patrón previo comprobaba PID/antigüedad y luego hacía `rm -r`; otro proceso podía adquirir un lock nuevo entre ambas operaciones y el reaper borrar el lock ajeno.
- Nuevo comportamiento: si un lock se considera obsoleto, la operación falla explícitamente con `NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED` o `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`. No elimina el directorio ni despacha una escritura. La recuperación requiere intervención explícita; no se afirma recuperación automática de locks abandonados.
- Regresiones: ambos tests crean un lock con propietario muerto y antigüedad >60 s, verifican el error específico, comprueban que el archivo de datos no cambió y que el lock original sigue intacto.
- Evidencia CI observada: Chronicle vertical [run 39178005072 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005072), STEP 4 [39178005085 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005085), STEP 5 [39178005091 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005091) en SHA `8cb919e182de9ff0b36b7d0827e6e479e6cf9de5). Tras incluir también la regresión de continuidad: continuidad/restart [run 39178015348 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015348), STEP 4 [39178015299 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015299) y STEP 5 [39178015376 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015376), SHA `b32b1307f7aedf1a0b39d78f58cde6f1c87776b0).
- Esto valida el contrato fail-closed en el filesystem local de CI; no prueba resistencia a symlink/path attacks, fsync, pérdida de energía, filesystem distribuido ni todos los interleavings adversariales. El uso de rutas sigue necesitando un contrato explícito.
- **Siguiente frontera M0:** definir el contrato de ruta/FS (rutas canónicas, symlinks, permisos y ámbito local) y decidir si el modelo de operación será explícitamente un único proceso cooperante o si hace falta una estrategia de locking segura que no dependa de reaper racy. No ampliar acciones ni cambiar el runtime default. M0 sigue INCOMPLETO; Nexo/Lúmina separados.


## M0 — contrato de ruta explícito y CI tras documentación de stores (2026-10-18)

- Los comentarios de ambos stores y `NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md` ahora declaran que `filePath` es configuración confiable, no sandbox; el caller debe usar directorio local de confianza y evitar mutación por procesos no confiables. No se reclama defensa frente a symlinks/path attacks.
- CI del último SHA de código `24d2e3561e1a65a8399875e5d826a43aef593129`: continuidad/restart [39178122458 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122458), STEP 5 [39178122453 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122453), repair crash cuts [39178122447 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122447), STEP 4 [39178122428 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122428). Chronicle vertical y las mismas suites también pasaron en SHA `888572c78390d4d46a4e7e4149bb793a93be82d1`: [39178115475](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115475), [39178115490](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115490), [39178115492](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115492), [39178115533](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115533), [39178115484](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115484).
- **Decisión aún pendiente:** confirmar que el despliegue inicial acepta el contrato de directorio local privado/cooperación confiable, o detener la integración hasta disponer de locking de sistema operativo más fuerte. No confundir esta validación de stores con cutover del runtime: M0 sigue INCOMPLETO y runtime default sin cambios.


## M0 — frontera de entrada principal: no acoplar Chronicle a assistants.mjs (auditoría 2026-10-18)

- Relectura de `scripts/nexo-chronicle-session.mjs`: es un entrypoint opt-in separado que crea stores Nexo propios y llama `executeNexoStepWithContinuityOwner()`; no importa Lúmina ni la simulación. Es una vertical ejecutable, no el runtime general ni la entrada principal integrada.
- `scripts/assistants.mjs` importa `world.js`, `simulation.js`, `simulate.mjs`, memoria de asistentes y el builder de misiones desde informes de simulación. Aunque persiste continuidad, su flujo principal pertenece a la aplicación de simulación. Conectar ahí Chronicle como si fuera la entrada de Nexo reintroduciría el acoplamiento que queremos evitar.
- Decisión de trabajo: conservar la vertical Chronicle como CLI explícita de validación; no modificar `scripts/assistants.mjs` para alojarla. La siguiente frontera de arquitectura es diseñar/identificar una entrada de aplicación Nexo independiente que pueda invocar la capacidad sin inicializar mundo/simulación Lúmina. No construir todavía una segunda aplicación completa ni cambiar runtime default: primero inspeccionar el punto de entrada del producto y los contratos mínimos que requiere.
- Esta auditoría no altera código ni cambia el estado de M0: INCOMPLETO. Efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — handoff de cambio de chat (2026-10-18, actualizado)

- Handoff operativo vigente: [NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md](BUILD/NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md), sección 10. Contiene HEAD observado, commits, CI probado, límites ya cerrados y pasos exactos para continuar sin repetir investigación.
- Punto actual: definir una entrada principal Nexo-only sin inicializar Lúmina. `scripts/assistants.mjs` importa simulación/mundo y no debe ser anfitrión de Chronicle. Mantener el CLI Chronicle explícito como vertical focal.
- Stores: locks obsoletos fallan cerrado; no hay reaper automático. `filePath` es configuración confiable, no sandbox. No reclamar resistencia a symlink/path attacks, fsync/power-loss o filesystem distribuido.
- Continuación posterior: seam mínimo de entrada Nexo-only; luego contrato genérico owner-backed con PREPARED confirmado antes de dispatch y reconciliación confiable por acción. Chronicle es la única acción no-repair demostrada en esta vertical.
- **M0 INCOMPLETO; runtime default sin cutover; efectos protegidos STOP; Nexo/Lúmina separados.** No reabrir auditorías cerradas ni pasar a M1/STEP 7.


## M0 — replay idempotente de reconciliación genérica tras respuesta perdida (2026-10-18)

- Código: `src/nexo/core/continuity-owner.mjs`. Si `reconcilePrepared` encuentra una revisión distinta de la esperada, ahora inspecciona primero el journal persistido. Solo reconoce replay cuando existe exactamente una entrada con la misma identidad canónica (missionId, stepId, action, target e idempotencyKey) y un registro de observación ya persistido compatible con su estado.
- Respuesta de replay: `already_observed`; no vuelve a ejecutar el verifier, no afirma causalidad, no autoriza redispatch y no convierte `reconciled_observed` en settlement. Para Chronicle, solo refleja `journalSettled: true` cuando ya existe el settlement persistido específico `nexo-chronicle-store`.
- Prueba añadida a `tests/nexo/repair-settlement-crash-cuts.test.mjs`: el store confirma internamente el commit y devuelve una respuesta incierta; el replay recupera la observación sin segunda llamada al verifier; una operación con target distinto no puede reutilizar el registro; el journal permanece `reconciled_observed`.
- Commits de cambio: implementación `39d13a8251e836abd1917aff071396f165993ab8`; prueba `31c8b3a4be5743ac12fc0c66bcae1d69b2fae1d6`.
- Validación remota consultada para el SHA de prueba: no hay statuses/checks visibles en el conector y la consulta de runs asociadas no devolvió ejecuciones. **CI = UNKNOWN/PENDING; la prueba aún no está demostrada como ejecutada.** No declarar PASS por ausencia de fallo.
- Próximo paso: conseguir evidencia de ejecución de la suite focal y regresiones. Después continuar la frontera arquitectónica ya fijada: entrada principal Nexo-only sin importar mundo/simulación de Lúmina. No hacer cutover del runtime default ni ampliar acciones.
- M0 continúa **INCOMPLETO**; efectos protegidos **STOP**; Nexo/Lúmina separados.


### Resultado de validación — replay genérico (SHA `32df994706a16167d8d92440569b5db200feeb1b`)

- La primera ejecución de la nueva prueba falló antes de ejecutar tests por una declaración duplicada de `genericVerifierCalls` en el mismo scope: [39178949801 FAILURE](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178949801). Se corrigió renombrando el contador local; el fallo quedó visible y no se presentó como un fallo del runtime.
- En el SHA `32df994706a16167d8d92440569b5db200feeb1b` quedaron **SUCCESS**:
  - [39179028829 — repair crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028829), incluyendo migración del owner, repair lifecycle, sesión canónica, sintaxis del puente/runtime y CLI aislada.
  - [39179029008 — effect adapter + settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179029008).
  - [39179028944 — semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028944).
  - [39179028821 — outcome classification, restart reconstruction y protected transition](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028821).
- Resultado limitado a estas suites/workflows; no equivale a la suite completa del repositorio ni al cutover del runtime. La recuperación genérica queda probada para el crash cut añadido; no se infiere causalidad ni se habilita redispatch.
- Próximo frente sigue siendo la entrada principal Nexo-only sin imports de Lúmina, manteniendo Chronicle opt-in. **M0 INCOMPLETO**.


## M0 — entrada Nexo-only (2026-10-18)

- Se añadió `scripts/nexo.mjs` como router CLI independiente; únicamente permite `chronicle-append` y rechaza comandos desconocidos. El Chronicle session ahora importa `src/nexo/core/owner-backed-runtime.mjs`, separado de los imports estáticos de Lúmina que conserva `src/nexo/runtime.js` por compatibilidad.
- La prueba real del entrypoint y la vertical Chronicle pasaron en SHA `9174921f587b504f40524ae5e89f47da68e40ae2`: [CI 39179321550 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179321550).
- Detalle y límites: [NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md](BUILD/NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md).
- Alcance: CLI Nexo-only, no UI web ni runtime general. `index.html` sigue siendo Lúmina; no se modificó. M0 INCOMPLETO, runtime default sin cutover, efectos protegidos STOP.
