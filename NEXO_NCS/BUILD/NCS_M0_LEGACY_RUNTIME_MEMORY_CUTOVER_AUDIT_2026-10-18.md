> **Continuidad de nuevo chat (2026-10-18):** antes de seguir, leer `NEXO_NCS/BUILD/NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md`. Es el handoff operativo vigente con HEAD observado, últimos cambios y CI, estado real de M0 y siguiente tarea exacta. No repetir auditorías cerradas. La misión sigue siendo M0: runtime canónico de Nexo, independiente de Lúmina.



## Hallazgo incremental — misión bloqueada con paso planned (2026-10-18)

`recordPrepared()` podía admitir una operación cuando el paso estaba `planned` pero la misión canónica estaba `blocked`. El owner ahora exige `mission.status === planned` para una nueva obligación PREPARED; rechaza con `NEXO_PREPARED_MISSION_NOT_RUNNABLE`, sin commit. La validación se ejecuta tras reconocer PREPARED existente, preservando el estado de recuperación.

Test-first SHA `4c5cbf530da03642fb68da62f0abf1e8829bae5e`: [repair crash cuts 39153079971](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153079971) y [bounded admission/restart 39153080078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153080078) fallaron en la aserción nueva. Código y pruebas validados en SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d`; runs 39153137599, 39153137708, 39153137714 y 39153137611 SUCCESS.

Este guard mejora admisión, pero no sustituye el runtime legacy ni autoriza efectos fuera de la reconciliación específica. Mantener repair-only seam, sin atomicidad entre stores y sin declarar completion o atribución causal.


## Hallazgo incremental — PREPARED sin paso ejecutable (2026-10-18)

`recordPrepared()` comprobaba identidad canónica pero no exigía por sí mismo que el paso estuviera `planned` y que todas sus dependencias estuvieran `completed`. La sesión de reparación ya hacía esa admisión; el owner necesitaba defender su propia frontera para que otros callers no pudieran crear un PREPARED sobre pasos no ejecutables.

Fix en `src/nexo/core/continuity-owner.mjs`; regresión en `tests/nexo/continuity-migration.test.mjs`. Para PREPARED nuevo: estado no `planned` → `NEXO_PREPARED_STEP_NOT_RUNNABLE`; dependencia inexistente/no completada → `NEXO_PREPARED_DEPENDENCIES_UNMET`. No se avanza `storeRevision` ni se escribe journal. Los checks están después del manejo de PREPARED existente, preservando la señal de una obligación incierta en vez de revalidar su admisibilidad como si fuera un nuevo despacho.

Test-first SHA `71764ddb9dfc511cfe437c6a12dc9f6122a2297b`: repair [39152101773](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101773) y mission/restart [39152101743](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101743) fallaron en la nueva aserción; STEP 4/STEP 5 pasaron. Código/pruebas validados en SHA `4549662e9cf879a15c4833b011ce5a8122e1c65e`: runs 39152160229, 39152160394, 39152160252, 39152160267 todos SUCCESS.

Este avance no migra `src/nexo/runtime.js`, no autentica evidencia y no añade settlement genérico. La integración runtime debe seguir sin despacho para acciones sin reconciliación específica; no generalizar el repair-only dispatcher ni inventar transacciones cross-store.


## Hallazgo incremental — replay de outcome no idéntico (2026-10-18)

En `createNexoContinuityOwner().recordOutcome()`, la rama de intento existente verificaba identidad misión/paso/acción/objetivo, pero respondía `already_recorded` sin comparar `status`, `evidence`, `parentMissionId` ni `replanReason`. Se corrigió para exigir igualdad de esos campos; una afirmación contradictoria retorna `blocked / NEXO_OUTCOME_RESULT_MISMATCH` y conserva el registro durable original y la revisión. No se está autenticando `evidence.source`: sigue siendo una etiqueta declarada por caller, no una prueba de procedencia.

La regresión está en `tests/nexo/continuity-migration.test.mjs`. Test-first SHA `d953e13aa026e52c6dcf3c65f4c18f7e86fc7d37`: crash cuts [39151769794](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769794) y bounded admission/restart [39151769766](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769766) fallaron en la expectativa nueva. Tras fix, SHA `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3` tiene cuatro workflows SUCCESS: 39151794904, 39151794891, 39151794922, 39151794894.

Este guard no soluciona el cutover de runtime. El código legacy `executeNexoStep()` hace `adapter.execute()` antes de `recordNexoExecution()` y `recordNexoOutcome()` sobre `src/assistants/memory.js`; su journal de efecto vive en esa memoria. La ruta repair-only canónica de scripts sigue siendo distinta y no debe generalizarse sin un contrato explícito. La siguiente tarea es identificar el seam mínimo del runtime y decidir cómo se proporciona el PREPARED durable, con rechazo por defecto para acciones fuera del conjunto admitido. No introducir un segundo ledger ni un transaction wrapper ficticio.
# NCS M0 — auditoría de memoria legacy y frontera de corte de runtime
Fecha: 2026-10-18
Rama: `ncs-clean-architecture`
HEAD inspeccionado: `1cee895229e6980b8f142571a28a820fed7eef04`

## Dictamen

**No es seguro sustituir ahora los imports legacy de `src/nexo/runtime.js` por llamadas directas al owner.** No es un problema de nombres de funciones: la ruta genérica actual combina dispatch, resultado del adapter y mutaciones de memoria en un orden distinto del contrato durable del owner. Un reemplazo mecánico podría persistir un outcome sin PREPARED durable, duplicar un efecto tras reinicio o interpretar indebidamente `settled_observed` como finalización.

El siguiente corte válido no es “cambiar memoria.js por continuity-owner”. Es separar explícitamente el ciclo de vida de efecto durable de la proyección de estado de misión, y luego migrar solo un camino cuya semántica esté probada. La ruta repair-only ya tiene ese contrato acotado; no debe convertirse en autorización general para acciones de Lúmina ni efectos protegidos.

## 1. Mapa exacto de la ruta legacy

### `src/nexo/runtime.js`

- Importa `recordNexoOutcome`, `recordNexoExecution`, `recordNexoPlan` y `reconstructNexoMission` de `src/assistants/memory.js`.
- `replanPersistedNexoMission()`: valida la forma de la memoria local, reconstruye la misión desde ella, comprueba el journal local y agrega el plan sucesor a esa misma memoria.
- `executeNexoStep()`: valida opcionalmente el objeto `memory`; llama `beginNexoStep`; después ejecuta `adapter.execute()`; solo después llama `commitRuntimeOutcome()`.
- `commitRuntimeOutcome()`: reconstruye desde la memoria en proceso, avanza la misión, agrega plan, execution y outcome en una proyección nueva y muta el objeto original mediante `Object.assign`. Un `WeakMap` serializa commits concurrentes solo para la misma instancia de objeto; no es CAS entre procesos ni persistencia durable.
- `executeLuminaNexoStep()`: crea el adapter de simulación con el journal que exista en el objeto de memoria y reenvía a `executeNexoStep()`. Puede recibir `persistPreparedIntent`, pero la ruta genérica no exige que se haya persistido PREPARED antes de dispatch.

### `src/assistants/memory.js`

- `createLearningMemory()`: normaliza/copias de memoria y retiene misiones, attempts, executions y effect journal.
- `recordNexoPlan()`: agrega el plan si no existe; no es CAS durable.
- `recordNexoExecution()`: registra una ejecución por `idempotencyKey`; el registro vive en la proyección de memoria entregada.
- `recordNexoOutcome()`: registra un único attempt por misión/paso; rechaza completion sin evidencia con `verified === true` y `kind` no vacío. Aun así, el dato es un outcome reportado por la ruta de runtime, no autentica por sí mismo evidencia externa ni liquida PREPARED.
- `reconstructNexoMission()`: reconstruye el estado de paso a partir de plan y attempts retenidos. Es reconstrucción de memoria, no prueba de que el estado físico de un efecto quedó persistido.

### `scripts/assistants.mjs`

- Abre el store separado con `openNexoContinuityOwner()`; si no existe, importa explícitamente la memoria heredada solo en esa inicialización. Una vez existente, el store separado es canónico y no se fusionan copias legacy.
- Construye una vista local `nexoMemory` desde el snapshot del owner para que `buildNexoMission()` conserve compatibilidad; después registra la misión mediante `owner.recordMission()`.
- Solo con `--nexo-repair-once` invoca el puente repair-only después de guardar el entorno; luego vuelve a leer la revisión del entorno. La ruta por defecto no despacha esa reparación.
- El archivo de Lúmina no debe volver a persistir `nexoMemory`. El uso de la vista local para planificación todavía no equivale a una fuente única para todas las operaciones de runtime.

## 2. Contrato disponible del owner y la incompatibilidad crítica

En `src/nexo/core/continuity-owner.mjs`:

- `loadCurrent()` devuelve snapshot y `storeRevision`.
- `reconstructMission()` reconstruye una misión del snapshot canónico.
- `recordMission({ expectedRevision, mission })` exige revisión esperada.
- `recordPrepared({ expectedRevision, operation })` persiste la obligación PREPARED con identidad/revisión de entorno; devuelve conflicto ante CAS fallido.
- `recordExecutionLineage({ expectedRevision, operation, result })` requiere una obligación PREPARED concordante y conserva `journalSettled: false`; no liquida el journal.
- `recordOutcome({ expectedRevision, outcome })` exige contexto canónico e identidad acción/target. Si existe un efecto `prepared` o `settled_observed` para ese paso, bloquea `completed` con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`. Esto es intencional: outcome, settlement y completion no son intercambiables.
- Los métodos de escritura usan `expectedRevision`; el lock local del runtime legacy no sustituye esta concurrencia CAS.

**Implicación:** no se puede hacer que `commitRuntimeOutcome()` llame sencillamente a `owner.recordOutcome()` después de cualquier adapter. Primero debe demostrarse el ciclo PREPARED → dispatch permitido → observación durable → settlement/reconciliación → outcome que el contrato permita. Para reparaciones convergentes existe una sesión acotada en `scripts/nexo-repair-session.mjs`; sus resultados `settled_observed` no deben promoverse automáticamente a misión completada.

## 3. Separación que debe mantenerse

- Continuidad operativa canónica: store independiente de Nexo.
- Estado de simulación: archivos de Lúmina; no incluir `nexoMemory`.
- Vista legacy temporal para compatibilidad: solo derivada de snapshot canónico; nunca segunda autoridad ni doble escritura.
- Efectos protegidos y acciones generales de `execute_lumina_action`: fuera del alcance del dispatcher repair-only; siguen STOP.
- `settled_observed`: evidencia de que se observó una invariante persistida bajo el contrato de reparación; no afirma causalidad, autorización ni completion de misión.

## 4. Estado actualizado de la siguiente frontera técnica

1. **COMPLETADO para el contrato repair-only:** prueba de reinicio/replay sobre la misma misión owner-backed. El caller intenta registrar `completed` después de `settled_observed` con etiquetas `verified/kind/source`; el owner rechaza con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, no cambia revisión y la reconstrucción antes/después de reabrir el store mantiene la misión bloqueada. Commit de prueba `fd2331e8d71afbbf0f19ea978d552a89087c1dc6`; CI exacto de repair, STEP 4 y STEP 5 SUCCESS (runs 39145754425, 39145754371, 39145754375).
2. **COMPLETADO solo para reparación acotada:** `runNexoRuntimeRepairSession()` y `runNexoRepairSession()` reciben identificadores, recargan el snapshot canónico y derivan acción/target desde la misión persistida. No equivalen a un adaptador genérico para `executeNexoStep()`.
3. **COMPLETADO para la entrada de proceso existente:** el dispatcher repair-only requiere opt-in `--nexo-repair-once`; la ruta por defecto no ejecuta reparaciones. No ampliar a acciones generales ni protegidas.
4. **PARCIAL:** hay pruebas de CAS/revisión, PREPARED, persistencia de entorno, recuperación sin redispatch, replay tras settlement, UNKNOWN y separación de archivos; la cobertura corresponde al lifecycle repair-only y a su entrada CLI aislada. No demuestra integración del runtime genérico ni atomicidad cross-store.
5. **PENDIENTE / BLOQUEANTE:** no retirar aún las lecturas/escrituras legacy de `src/nexo/runtime.js`. Antes hace falta un contrato para el primer caller genérico que distinga durabilidad PREPARED, resultado de adapter, observación de estado y outcome de misión sin confiar en etiquetas de evidencia del caller. Luego migrar una sola operación y demostrar que no quedan callers dependientes.

## 5. Evidencia y límites

- HEAD de rama consultado directamente: `1cee895229e6980b8f142571a28a820fed7eef04`.
- El test de proceso CLI más reciente con evidencia disponible es [CI 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529), SHA de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`, SUCCESS. Ese SHA precede al HEAD documental inspeccionado; **no** atribuir ese PASS al HEAD actual.
- Esta auditoría es de código y contratos existentes. No se hizo un nuevo CI de código porque no se modificó código; la documentación añadida tampoco está cubierta por el run anterior.
- M0 permanece abierto. No se ha probado un cutover del runtime genérico, un despliegue en el teléfono ni atomicidad entre el store Nexo y el estado de Lúmina.


## Evidencia posterior — falsa promoción tras restart (2026-10-18)

La prueba en commit `fd2331e8d71afbbf0f19ea978d552a89087c1dc6` añade un caso concreto al paso 1 de la siguiente tarea: tras `settled_observed`, el owner rechaza un `completed` basado solo en etiquetas `verified/kind/source` del caller y mantiene la misión bloqueada al reconstruirla desde un owner reabierto.

CI exacto sobre ese SHA: [repair crash cuts 39145754425](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754425) SUCCESS; [STEP 4 39145754371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754371) SUCCESS; [STEP 5 39145754375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754375) SUCCESS. Estos resultados reemplazan la nota de “sin CI exacto” para esta regresión específica; no cambian la evaluación del resto de esta auditoría.

El contrato aún carece de una transición basada en verificación independiente de objetivo que pueda representar completion sin atribuir causalidad al repair. No usar `settled_observed` como prueba de completion y no cortar el runtime genérico hasta resolver este contrato y probar el primer caller migrado.


## Nueva evidencia de verificación de objetivo (2026-10-18)

El test de lifecycle ahora verifica que el objetivo no queda observado si la invariante desaparece en una revisión posterior, y que una revisión ambiental inferior a la registrada en settlement produce UNKNOWN por posible rollback/replay. CI verde en commit de prueba `d01384083368d1b9f52ad5c327dc4b1985e5573a`: repair 39146476081, STEP 4 39146476199, STEP 5 39146476145.

También queda registrada una decisión de diseño negativa: no aceptar el intento incompleto de agregar `goalObservations` como una colección más. El cambio solo actualizaba la lista del snapshot, sin compatibilidad de store ni contrato de observación; falló CI (39146494871, 39146494887) y fue revertido en `16c51fc994de1ca8a6471fa30f9060068b998da8`. Si la persistencia de observación independiente resulta necesaria, debe diseñarse como contrato completo con procedencia verificable, compatibilidad de snapshots antiguos, CAS/replay y una semántica que no confunda observación con completion.

El HEAD actual es `864ab85d38bf67040ef5a662dd8769cad3ea4c9f`; el último CI verde registrado es de su padre. No declarar HEAD exacto validado hasta que los workflows lo confirmen.


## Evidencia adicional — revisión de continuidad estable durante verificación (2026-10-18)

El verificador ahora realiza una segunda lectura de `storeRevision` antes de devolver `goal_observed`. Una diferencia devuelve `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. La prueba simula una revisión que cambia entre lecturas. Esto impide un resultado positivo basado en el snapshot inicial si el store ya cambió antes de la comprobación final; no es un commit coordinado con el archivo ambiental ni cubre escrituras posteriores a esa lectura.

Commit probado `57f3bffb52989a924bdbc5fb4fc626d803e6988f`; CI exacto: repair 39146959705, STEP 4 39146959738, STEP 5 39146959691, todos SUCCESS. El job repair ejecutó y pasó la regresión de verificación de objetivo.

El corte del runtime genérico permanece bloqueado hasta tener un contrato explícito de outcome/evidencia y pruebas integradas de PREPARED durable, CAS, recuperación y replay. No se agregó colección `goalObservations`; no se confunde observación con causalidad o completion.


## Decisión posterior — observación de objetivo y cutover (2026-10-18)

Véase `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_AND_RUNTIME_CUTOVER_DECISION_2026-10-18.md` para el contrato formal. Decisión: no añadir `goalObservations` sin requisito explícito de auditoría; mantener el verificador read-only, no causal y sin completion. El guard de cambio de revisión de continuidad se conserva y está cubierto por regresión determinista. No se retiene un guard de cambio ambiental durante la verificación porque el experimento de regresión no reprodujo de manera fiable el orden que pretendía cubrir; se retiraron ese test y el guard experimental antes de declarar CI verde.

La lectura del settlement actual confirma que `settlePreparedRepairFromPersistedState()` exige un PREPARED único, acción de reparación admitida, revisión ambiental enlazada, revisión actual igual a la base o base+1, invariante persistida presente y CAS de continuidad. El entrypoint persiste lineage aparte antes de settlement y no declara misión completa. Esto es una ruta repair-only; no demuestra que el runtime genérico legacy haya sido migrado ni permite generalizar el bridge a acciones protegidas.

Último código/pruebas con CI verde tras retirar el experimento ambiental: `fe9fe3b656fceff67be31722d7729ff6637a428b` (repair 39149853015, STEP 4 39149852997, STEP 5 39149853023; todos SUCCESS). Commits posteriores son documentación. M0 continúa INCOMPLETO.


## Evidencia incremental posterior — replay estricto de execution lineage (2026-10-18)

Se corrigieron dos ambigüedades concretas de replay en `recordExecutionLineage()` sin cambiar el esquema de snapshot:

1. Si la identidad de operación coincide pero el resultado del adaptador difiere del resultado durable, bloquear con `NEXO_EXECUTION_RESULT_MISMATCH`; no aceptar como idempotente una afirmación contradictoria.
2. Para las tres reparaciones admitidas, antes de aceptar una lineage existente en replay, exigir una sola entrada de journal con baseline ambiental conocido y que `operation.environmentStateRevision` coincida con el baseline PREPARED. Discrepancia: `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`; base desconocida/ambigua: `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`.

Las regresiones viven en `tests/nexo/repair-owner-lifecycle.test.mjs` y `tests/nexo/continuity-migration.test.mjs`. Test-first hizo visibles los dos comportamientos anteriores: [39150256557](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150256557) y [39150495080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150495080) fallaron en las aserciones nuevas, como se esperaba antes del fix. El primer fix también expuso una expectativa heredada incompatible, corregida de forma explícita.

CI SUCCESS de código/pruebas sobre SHA `0653d7216c49dd6a9b0ea7a182333ff18ee07bc3`: repair 39150332075, STEP 4 39150332148, STEP 5 39150331964, bounded admission/restart 39150331921. CI SUCCESS posterior sobre SHA `3bfbad268ac1a9b5ea9492e8db0a90b5972f22d9`: repair 39150515026, STEP 4 39150514997, STEP 5 39150515080, bounded admission/restart 39150515015. Los documentos se actualizaron después; no declarar CI sobre el HEAD documental actual.

Estos guards fortalecen idempotencia y contexto de lineage; no cambian la decisión de no añadir `goalObservations`, no declaran completion, no prueban atomicidad cross-store y no migran `src/nexo/runtime.js`. El siguiente paso sigue siendo diseñar y probar un seam canónico mínimo del runtime, sin sustituir mecánicamente los imports legacy ni extender el dispatcher repair-only a acciones generales/protegidas.


## M0 — fallo de recarga inmediatamente después de PREPARED (2026-10-18)

- **Hueco reproducido:** `runNexoRepairOnce()` confirmaba el commit de PREPARED y luego llamaba `owner.loadCurrent()` fuera de un `try/catch`. Si esa lectura fallaba, la excepción escapaba de la frontera de runtime sin un resultado estructurado. La obligación permanecía en disco, pero el caller no recibía claramente que PREPARED estaba confirmado y que el dispatch no había ocurrido.
- **Prueba primero:** regresión añadida a `tests/nexo/repair-owner-lifecycle.test.mjs`. El commit de prueba `75e5e968ed234572661495d362586a9fd6e3a107` falló exactamente en la recarga posterior al PREPARED, reproduciendo el hueco: [repair crash cuts, run 39153769377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153769377).
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura ese fallo y devuelve `blocked`, conserva el código de error, `preparedCommitted: true`, `dispatched: false` y `uncertainty: prepared_commit_confirmed_but_journal_reload_unconfirmed`. No intenta recuperar desde una vista obsoleta ni despacha; la obligación PREPARED permanece para una invocación posterior de recuperación.
- **Validación exacta:** código + regresión en `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`; workflow [Nexo M0 — repair settlement crash cuts, run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS, job `repair-crash-cuts` SUCCESS. El test confirma journal PREPARED único, revisión Nexo 1, estado ambiental sin cambio (revisión 80), y cero dispatch.
- **Alcance:** corrige el contrato de fallo de esta frontera de recuperación; no migra `src/nexo/runtime.js`, no autoriza acciones generales/protegidas, no afirma atomicidad entre archivos y no convierte PREPARED en completion.

**Siguiente frontera M0:** diseñar y probar el seam canónico para el primer caller de runtime fuera de la ruta repair-only. No sustituir imports legacy mecánicamente ni generalizar el dispatcher de reparaciones. M0 continúa INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.



## M0 — excepción durante commit de execution lineage después del dispatch (2026-10-18)

- **Hueco reproducido:** el entorno podía quedar persistido y el journal seguir `prepared`, pero si `owner.recordExecutionLineage()` lanzaba una excepción en vez de devolver un resultado estructurado, `runNexoRepairOnce()` dejaba escapar la excepción. La llamada no debía interpretarse como lineage ni settlement confirmado.
- **Prueba primero:** la regresión en `tests/nexo/repair-owner-lifecycle.test.mjs` simula fallo de escritura del owner tras una reparación persistida. El test falló en el punto exacto, reproduciendo el hueco: [repair crash cuts, run 39153970940](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153970940), SHA `0aaefc0afae250472749e1f7405ba561a5414089`.
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura la excepción y devuelve `blocked` con el código de error, el resultado del dispatch, la condición real `persisted` y una incertidumbre explícita. Si el entorno sí se escribió, devuelve `environment_persisted_but_lineage_and_settlement_unconfirmed`; no intenta settlement ni redispatch en esa invocación. El journal permanece PREPARED y una recuperación posterior debe volver a observar el estado persistido.
- **Validación exacta:** código + ambas regresiones de fallo de frontera en `209dde321dbca3bc755e8ee89948ec94db2be2e6`; [Nexo M0 — repair settlement crash cuts, run 39154037675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39154037675) SUCCESS, job `repair-crash-cuts` SUCCESS.
- **Primera frontera relacionada:** la recarga de owner inmediatamente después del commit PREPARED también queda capturada con resultado `blocked`, `preparedCommitted: true` y `dispatched: false`; código `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`, CI [run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS.

**Alcance:** se han endurecido dos excepciones en límites concretos del lifecycle repair-only. No implica que todas las operaciones post-PREPARED estén libres de excepciones, no migra `src/nexo/runtime.js`, no habilita acciones generales/protegidas y no afirma atomicidad entre Nexo y Lúmina. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

**Siguiente frontera:** revisar los límites restantes de settlement/commit para detectar fallos no estructurados sin añadir un catch global que oculte si el efecto pudo ocurrir. Después, continuar el diseño del seam canónico del runtime genérico; no ampliar el dispatcher repair-only.



## M0 — excepción al confirmar settlement del journal PREPARED (2026-10-18)

- **Hueco reproducido:** `settlePreparedRepairFromPersistedState()` ejecutaba `store.commitIfCurrent()` sin capturar una excepción. Si el store lanzaba error, aunque el entorno y el lineage ya estuvieran persistidos, `runNexoRepairOnce()` terminaba por excepción sin resultado estructurado.
- **Prueba primero:** se añadió un caso que simula fallo de escritura durante settlement después de una reparación y lineage confirmados. La prueba falló en el punto exacto con el error `NEXO_CONTINUITY_WRITE_FAILED`: [run 39155348004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155348004), SHA `51c0ed94a7362133ddb9a29bd97e15b310dc298d`.
- **Corrección:** `scripts/nexo-repair-settlement.mjs` captura la excepción del commit y devuelve `blocked`, `verified: false` y `uncertainty: settlement_commit_outcome_unknown`. No presume si la escritura llegó o no al almacenamiento durable. `scripts/nexo-repair-entrypoint.mjs` preserva el código concreto del settlement en vez de reemplazarlo por un código genérico.
- **Validación exacta:** implementación + regresión en `67048ebbdd30b49000f3a2bfea5e6a3ef0eb1b74`; [Nexo M0 — repair settlement crash cuts, run 39155469445](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155469445) SUCCESS, job `repair-crash-cuts` SUCCESS. El caso verifica que el entorno permanece en revisión 101, lineage sigue registrado, y el journal conserva `prepared` al no estar confirmado el commit de settlement.
- **Alcance:** se protege la frontera de escritura de settlement; no se afirma que todo el lifecycle carezca de excepciones. No migra `src/nexo/runtime.js`, no amplía el dispatcher repair-only, no habilita efectos protegidos ni afirma atomicidad entre archivos.

**Siguiente revisión:** inspeccionar la frontera de `adapter.execute()` en `scripts/nexo-repair-dispatch.mjs`. Una excepción antes de `persistState()` no debe escapar como excepción cruda; debe devolver un bloqueo claro y dejar PREPARED para revisión/recuperación. Después, seguir con el seam canónico del runtime genérico, sin sustituir legacy memory por imports de owner a ciegas.

**Estado global:** M0 INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.



## M0 — excepción durante commit de settlement (2026-10-18, validada)

- **Fallo reproducido:** `settlePreparedRepairFromPersistedState()` podía propagar una excepción lanzada por `store.commitIfCurrent()`. La obligación seguía `PREPARED`; el entorno y `execution lineage` podían estar persistidos, pero el caller no recibía un resultado estructurado. La regresión se agregó en `tests/nexo/repair-owner-lifecycle.test.mjs` y falló en CI antes de corregir el punto de entrada.
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura específicamente la excepción alrededor de la liquidación final y devuelve `blocked`, el código original del error, `dispatch`, `lineage`, el valor real de `persisted` y `uncertainty: environment_persisted_but_continuity_settlement_unconfirmed`. No declara `settled_observed`, no elimina la obligación PREPARED y no intenta redispatch en esa invocación.
- **Prueba:** la regresión simula una excepción de escritura del store de continuidad durante `commitIfCurrent`; verifica bloqueo, incertidumbre explícita, revisión ambiental avanzada, lineage conservado y journal aún PREPARED.
- **Validación exacta:** código + regresión en `8d37f804901d410ad5e32c0bc842729d53c8593e`; [CI Nexo M0 — repair settlement crash cuts, run 39160463984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160463984) SUCCESS.
- **Alcance:** esto cierra una frontera de excepción concreta del lifecycle repair-only. No prueba atomicidad entre archivos, no migra el runtime genérico `src/nexo/runtime.js` y no autoriza efectos protegidos.

**Siguiente trabajo:** revisar las restantes fronteras explícitas de lectura/commit de settlement y sus resultados de conflicto, sin añadir un catch global. Después diseñar la migración arquitectónica del runtime genérico a la continuidad canónica, con PREPARED durable antes de cualquier dispatch y pruebas de crash/restart. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.



## M0 — resultado incierto al confirmar PREPARED (2026-10-18, validado)

- **Hueco reproducido:** `owner.recordPrepared()` podía persistir el registro PREPARED y luego lanzar una excepción antes de devolver confirmación (por ejemplo, respuesta perdida después del reemplazo durable). `prepareRepairAgainstPersistedState()` dejaba escapar la excepción y `runNexoRepairOnce()` no devolvía una respuesta estructurada. El journal podía contener PREPARED durable pese a que el caller no recibió confirmación.
- **Prueba primero:** `tests/nexo/repair-owner-lifecycle.test.mjs` simula una escritura confirmada internamente seguida de excepción. El test falló antes de la corrección: [CI run 39160592605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160592605), SHA `3b066758fe3313b56344a26e0c64bf3ef5d5d7c1`.
- **Corrección:** `scripts/nexo-repair-preparation.mjs` devuelve `blocked`, preserva el código de error, marca `preparedCommitOutcome: unknown` y `uncertainty: prepared_commit_outcome_unknown`. `scripts/nexo-repair-entrypoint.mjs` propaga la incertidumbre y fija `dispatched: false`. No afirma que PREPARED no se haya escrito y no despacha sin confirmación. La siguiente invocación debe volver a leer el journal canónico y reconciliar la obligación.
- **Validación exacta:** código + regresión en `6300f8cb60fe18568e3ebd58e3ca1ee5b70d3d51`; [CI Nexo M0 — repair settlement crash cuts, run 39160656605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160656605) SUCCESS.
- **Alcance:** esto no migra el runtime genérico, no afirma atomicidad entre archivos y no habilita acciones protegidas.

**Siguiente trabajo:** continuar auditando límites de error específicos del lifecycle repair-only; mantener separados PREPARED, lineage, observación y settlement. Después, diseñar la ruta canónica del runtime genérico con PREPARED durable antes de dispatch. M0 permanece INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

