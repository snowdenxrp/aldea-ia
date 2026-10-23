# CHECKPOINT NUEVO — 2026-10-22 — MISSION DRAFT PREVIEW INPUT GUARD

- Hallazgo concreto: `previewNexoMissionDraft(continuityPath, missionDraft)` leía `missionDraft.missionId` antes de validar el draft completo. Un getter podía ejecutarse incluso antes de cargar el store; la operación canónica validaba más tarde, demasiado tarde para esta lectura.
- Corrección runtime: se ejecuta `assertNexoMissionAdmission(missionDraft)` antes de leer `missionId` y antes de abrir el store. La guardia existente valida descriptores propios de datos, límites estructurales y forma JSON-like.
- Regresión nueva: `tests/nexo/mission-draft-preview-input-guard.test.mjs` instala un getter centinela y verifica bloqueo, `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false` y cero ejecución del getter. Integrada en `npm test`.
- Commits: runtime `e34e3f1f8cda735c7926cf5dcf593991c6940492`; test `e60f06d7217f8c7eb5a90a62e43f07a03b6fa263`; integración `ed9a4885900d0f04487fb3d7554d8c56ed556f91`.
- CI verificado el 2026-10-22: SHA del checkpoint `0902d4748e5378c02367f5cddc40281cc7b1ce08`, persistencia determinista [SUCCESS, run 39864429149](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864429149). SHA integrado previo `ed9a4885900d0f04487fb3d7554d8c56ed556f91`: admisión/continuidad [SUCCESS, run 39864412972](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864412972), Chronicle nativo [SUCCESS, run 39864412981](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864412981), aceptación integrada [SUCCESS, run 39864412923](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864412923). Persistencia en `ed9a4885` fue cancelada por commit posterior y no se cuenta como resultado.
- Límite: los Proxy traps siguen fuera de la garantía de esta guardia; validar la forma del draft no demuestra que intención y draft estén alineados, no persiste la misión y no evalúa autoridad.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CHRONICLE PUBLIC SESSION OPTIONS GUARD

- Hallazgo concreto: `runNexoChronicleAppend({ ... } = {})` leía sus ocho opciones por destructuring antes de validar. Un getter en cualquier campo podía ejecutarse antes del primer control de entrada y antes de que la función devolviera un resultado seguro.
- Corrección runtime: el punto de entrada ahora extrae opciones mediante descriptores propios de datos enumerables en objetos planos/prototipo nulo; aplica defaults solo después de la lectura segura y devuelve `blocked / NEXO_CHRONICLE_SESSION_INPUT_INVALID` si la envoltura es inválida.
- Regresión nueva: `tests/nexo/chronicle-session-input-guard.test.mjs` proporciona un getter centinela que lanzaría si se ejecutara; exige bloqueo, `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y cero llamadas al getter. Integrada en `npm test`.
- Commits: runtime `214a96c0e866b7039e89f18ad2741f272b46ed68`; test `65e3f74181df88a158460d05197e5061beefb568`; integración `356990bcea66f5156e5094b203bb5f6a3babd211`.
- CI de la corrección anterior (Chronicle effect) en SHA `f53ac99015d6eef9faf99222de3c4a2655e8d6b8`: [bounded mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864266094) y [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864266027) terminaron `success`; la persistencia determinista estaba en curso cuando se consultó. Para esta nueva integración, comprobar los workflows del SHA exacto antes de declarar validación.
- Límites: los guards no neutralizan todos los Proxy traps ni establecen confianza del store. No prueban interpretación de intención, autoridad legítima, ni autorización para ejecutar efectos protegidos.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CHRONICLE EFFECT INPUT GUARD

- Hallazgo concreto: `createNexoChronicleEffectContracts({ store })` y el handler de Chronicle leían opciones/operación por destructuring. Un getter en `store`, `missionId` o `target.content` podía ejecutarse antes de validación y, en el handler, antes de decidir si se llamaba a `store.append`.
- Corrección runtime: extracción de campos de datos propios enumerables desde objetos planos/prototipo nulo; el handler rechaza opciones inválidas sin ejecutar getters y extrae `target.content` como descriptor de datos. La fábrica también exige métodos `append` y `loadCurrent` como propiedades propias de datos, evitando evaluar accesores del store.
- Regresión nueva: `tests/nexo/chronicle-effect-input-guard.test.mjs` verifica getter del constructor, getter de `missionId`, getter de `target.content` y que no se llame `append` en los casos inválidos. Integrada en `npm test`.
- Commits: runtime `f53ac99015d6eef9faf99222de3c4a2655e8d6b8`; test `de23714fb27d66ab492f04095ec37298e3f6a3e6`; integración `fa5497c78e8347b5959f5e056282908c2574d4ee`.
- CI: pendiente para el SHA integrado; no declarar PASS hasta leer conclusiones de workflows asociados al SHA exacto.
- Límite: no neutraliza todos los Proxy traps; no demuestra que el store inyectado sea confiable; no autoriza el efecto Chronicle ni cambia la frontera constitucional.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CONDITIONAL COMMIT ADAPTER OPTIONS GUARD

- Hallazgo concreto: `createPersistStateConditionalCommit({ ... } = {})` leía `persistState`, `statePath` y `clock` mediante destructuring de opciones antes de validar. Un getter ordinario podía ejecutarse al construir el adaptador.
- Corrección runtime: el constructor ahora extrae los tres campos con descriptores propios de datos enumerables, restringe el contenedor a objeto plano o prototipo nulo, y valida explícitamente `persistState`, ruta y `clock`. Las opciones inválidas se rechazan antes de crear el adaptador.
- Regresión añadida al test existente `tests/nexo/conditional-commit-persist-state.test.mjs`: getter centinela en `persistState` debe ser rechazado sin ejecución. El test ya forma parte de `npm test`.
- Commits: runtime `58ea41eef5f57cfc5626e00adfd2405dc552424f`; regresión `a782be8a449ee567263d701b7d42fb4ef6914708`.
- CI sobre SHA de integración de test `a782be8a449ee567263d701b7d42fb4ef6914708`: STEP 3A/3B/3C [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827928), STEP 4 [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827907), STEP 5 [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827885); la persistencia determinista [sigue en ejecución](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827923). El workflow de persistencia para el checkpoint documental posterior `b72682ea1e3ee4e13f6fac1248f02186139f6ff2` está en cola: [run](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863842817). No declarar validación completa hasta cerrar estos dos runs.
- Límite: el cambio protege la extracción de opciones del constructor; no demuestra que el `persistState` suministrado sea confiable ni cambia la evaluación de autoridad o el estado de los efectos protegidos.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## Incidente y corrección — guard de observación de reparación — 2026-10-22

- La primera ejecución del workflow `Nexo M0 — repair settlement crash cuts` sobre el commit runtime `ddecd9b10eac1d01f275f3c271ee90b30735373c` falló antes de ejecutar las pruebas: una edición generó secuencias literales `\\n` en dos declaraciones y Node reportó `SyntaxError`. No fue un fallo semántico de la regresión; tampoco cuenta como PASS.
- Corrección de sintaxis publicada en `e662afe24269e6f832a178aedfb9f413dbb2f042`. En ese SHA exacto concluyeron `success` tanto [repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863728233) como [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863728328). La regresión nueva estaba integrada en el `package.json` de ese SHA.
- El fallo inicial se conserva en el historial; el runtime corregido queda validado por esos dos workflows, no por todos los workflows del repositorio. La ejecución de persistencia en el SHA documental posterior se encuentra en cola al momento del último chequeo.

---

# CHECKPOINT NUEVO — 2026-10-22 — PERSISTED REPAIR OBSERVATION INPUT GUARD

- Hallazgo concreto: las funciones exportadas `observePersistedRepairInvariant(options)` y `comparePersistedRepairRevision(options)` recibían opciones por destructuring. Un getter ordinario en `snapshot` o `expectedStateRevision` podía ejecutarse antes de validar el contexto.
- Corrección runtime: `src/nexo/adapters/persisted-repair-observation.mjs` ahora extrae `snapshot/action/target` y `expectedStateRevision/currentSnapshot` mediante descriptores propios de datos enumerables, en objetos planos o de prototipo nulo. Opciones inválidas producen `UNKNOWN` sin evaluar getters.
- Regresión nueva: `tests/nexo/persisted-repair-observation-input-guard.test.mjs` comprueba ambos getters centinela, el comportamiento normal de observación de agente y la comparación de revisiones. Integrada al final de `npm test` en `package.json`.
- Commits: runtime `ddecd9b10eac1d01f275f3c271ee90b30735373c`; test `74b4a3708088d4033fa9289ffc04d5f35a5ea7fd`; integración `2541df081dc34410b3c0c7565c1ae559ad9de4c4`.
- CI: los workflows para el SHA integrado están pendientes de consulta/resultado; no declarar PASS hasta comprobar conclusiones del SHA exacto.
- Límite: esto protege la extracción de opciones ordinarias, no valida exhaustivamente snapshots con getters anidados, no neutraliza todos los Proxy traps, no establece autoridad ni habilita reintentos o efectos protegidos.
- Estado constitucional no cambia: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: comprobar CI de esta integración y continuar solo con defectos reproducibles en las fronteras públicas restantes.

---

# CHECKPOINT NUEVO — 2026-10-22 — CHRONICLE OBSERVATION INPUT GUARD

- Hallazgo: `observeChronicleOperation()` recibía opciones por destructuring, que podía ejecutar getters de `store`, identidad de operación o `target` antes de la validación. También leía `store.loadCurrent` y `target.content` por acceso de propiedad.
- Corrección: `src/nexo/adapters/chronicle-observation.mjs` ahora inspecciona descriptores propios de las opciones y del campo `content`, obtiene `loadCurrent` como método propio de datos y valida la forma básica del resultado leído antes de clasificar la observación. Los casos inválidos retornan `UNKNOWN` y no llaman al store.
- Regresión: `tests/nexo/chronicle-observation-input-guard.test.mjs` comprueba que getters de opciones y de `target.content` no se ejecutan, y que una observación válida de ausencia conserva la semántica `not_applied` / causalidad no establecida. Integrada en `npm test`.
- Commits: runtime `5d9c67e49e08286b5400a9cfe3de82ab812682d2`; test `15946a494167df90ce5785917e25dc8478dd4e3e`; integración `e137229aad19ca01a245d2a5067dabeef41d24d4`.
- CI para el cambio actual: workflows sobre el commit de runtime y sobre la integración de test están en curso/pendientes; no declarar PASS hasta leer conclusiones finales. [Persistencia determinista en el SHA de integración](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863421297).
- CI previo del guard de opciones de admisión: los cuatro workflows para `285464c8c04d027a19268f442f3942bde9d99450` concluyeron `success`; queda documentado en el checkpoint anterior.
- Límite: la validación de descriptores ordinarios no neutraliza todos los traps de `Proxy`, ni prueba que el store sea autoridad confiable. La observación sigue sin demostrar atribución causal ni autorizar reintentos o efectos.
- Estado constitucional no cambia: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: comprobar CI para `e137229aad19ca01a245d2a5067dabeef41d24d4`; después continuar la auditoría de adaptadores por defectos reproducibles, sin ampliar la superficie de cambios por prevención especulativa.

---

## CI FINAL — ADMISIÓN DE OPCIONES — 2026-10-22

Los cuatro workflows asociados al SHA exacto `285464c8c04d027a19268f442f3942bde9d99450` terminaron en `success`:
- [Bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052143)
- [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052297)
- [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052261)
- [Integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052375)

Este resultado verifica esos workflows para ese SHA. El checkpoint documental se agregó después, en `6c9603c35ab88372c14fc3c80bc1734e0f2daa06`; no debe confundirse con el SHA de runtime/test validado.

---

# CHECKPOINT NUEVO — 2026-10-22 — OPCIONES DEL CONTRATO DE ADMISIÓN SIN LECTURA PREMATURA

- Hallazgo concreto: la función exportada `assertNexoMissionAdmission(input, { requestIntent = false } = {})` leía `requestIntent` mediante destructuring antes de validar el registro de opciones. Un getter ordinario en ese campo podía ejecutarse al entrar al contrato.
- Corrección runtime: `src/nexo/core/mission-admission-contract.mjs` ahora recibe `options` sin destructuring y extrae `requestIntent` mediante descriptor propio; rechaza accessors, campos no enumerables, valores no booleanos y prototipos no permitidos con `NEXO_MISSION_CONTEXT_INVALID`. Las opciones omitidas y los registros válidos mantienen el comportamiento previsto.
- Regresión nueva: `tests/nexo/mission-admission-options-input-guard.test.mjs`; integrada en `npm test`.
- Commits: runtime `ca209fd3857acdc14c7fbb427240165048760a43`; test `ec0109e6e2abef21b92adac31642729de15e7edf`; integración del test en `package.json` y SHA combinado de CI `285464c8c04d027a19268f442f3942bde9d99450`.
- CI sobre SHA exacto `285464c8c04d027a19268f442f3942bde9d99450`: 4 workflows disparados y observados inicialmente en curso/pendientes — [admisión y continuidad tras reinicio](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052143), [Chronicle](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052297), [persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052261), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052375). Aún no se declara PASS: falta comprobar las conclusiones finales.
- Alcance: cierra el acceso prematuro a getter ordinario en las opciones de este contrato. No neutraliza Proxy traps hostiles, no autentica evidencia, no resuelve autoridad legítima y no habilita efectos protegidos.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: verificar conclusiones de esos cuatro workflows sobre el SHA exacto. Después continuar auditoría de frontera pública solo con defectos reproducibles; no repetir la auditoría ya cerrada de opciones de owner/store/registro.

---

# CHECKPOINT NUEVO — 2026-10-22 — CONSTRUCTORES DE STORES SIN LECTURA PREMATURA DE OPCIONES

- Hallazgo: `createNexoContinuityStore()` y `createNexoChronicleStore()` usaban destructuring de opciones en la firma. Getters en `filePath`, `fsModule`, `lockDeadline` o `lockWaitMs` podían ejecutarse antes de validar la configuración.
- Corrección: ambos constructores inspeccionan prototipo y descriptores propios de los cuatro campos consumidos; rechazan accessors y campos no enumerables, y aplican defaults tras extracción segura. La validación de ruta y presupuesto de lock sigue vigente.
- Regresiones: getter en `filePath` para cada store; se exige que el getter no se ejecute y que se produzca el código de configuración inválida esperado.
- Commits runtime/test: [continuity runtime](https://github.com/snowdenxrp/aldea-ia/commit/27be3d92cee91d7b9135a80ebe1fba6e4b61b765), [Chronicle runtime](https://github.com/snowdenxrp/aldea-ia/commit/b9c247a84178d7b288761c526c0d12d70d266902), [continuity regression](https://github.com/snowdenxrp/aldea-ia/commit/823f1f91c1117cc9a2e15cc6a69a9570c3e0f089), [Chronicle regression / SHA combinado](https://github.com/snowdenxrp/aldea-ia/commit/b5a67903510b4319624d33ebfa723c938a3c59d3).
- CI exacto SHA `b5a67903510b4319624d33ebfa723c938a3c59d3`: 6/6 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188829), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188828), [Chronicle](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188968), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862189087), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188812), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862189002). No se afirma que todos los workflows del repo corrieran.
- Informe: [NCS_M0_STORE_CONSTRUCTOR_OPTIONS_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_STORE_CONSTRUCTOR_OPTIONS_INPUT_GUARD_2026-10-22.md).
- Alcance: endurece extracción de configuración. No crea sandbox de filesystem, no neutraliza todos los Proxy traps ni procesos locales hostiles, no cambia la autoridad ni habilita efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — OPCIONES DE LLAMADA DEL OWNER VALIDAS ANTES DE DESTRUCTURING

- Hallazgo reproducible: los métodos públicos `recordMission`, `recordOutcome`, `recordPrepared`, `recordExecutionLineage` y `reconcilePrepared` recibían opciones con destructuring de parámetros. Un getter en las opciones se evaluaba antes de entrar al cuerpo y antes de cualquier guard.
- Corrección: helper compartido `readOwnerInputFields()` inspecciona descriptores propios de los campos consumidos y solo extrae propiedades de datos enumerables de objetos planos o de prototipo nulo. Accessors, campos no enumerables, prototipos no permitidos y fallos de reflexión se rechazan antes de entrar en la lógica de store.
- Regresión: cinco métodos públicos se prueban con getter centinela en `expectedRevision`; ningún getter se ejecuta y cada método devuelve `failed`.
- Commits runtime/test: [1c553ac541d3c98f8c36c17047e9a5e750c0ef31](https://github.com/snowdenxrp/aldea-ia/commit/1c553ac541d3c98f8c36c17047e9a5e750c0ef31), [57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e](https://github.com/snowdenxrp/aldea-ia/commit/57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e).
- CI exacto SHA `57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e`: 5/5 workflows disparados SUCCESS — [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949525), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949462), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949470), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949564), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949623). No se afirma que todos los workflows del repo corrieran.
- Informe: [NCS_M0_OWNER_CALL_OPTIONS_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_CALL_OPTIONS_INPUT_GUARD_2026-10-22.md).
- Alcance: validación de opciones de llamada in-process; no neutraliza todos los Proxy traps, no autentica evidencia/verificadores, no establece autoridad legítima ni habilita efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — OPCIONES DEL CONSTRUCTOR SIN ACCESO A GETTERS

- Revisión del hallazgo de registro: además del getter dentro de `effectVerifiers`, el destructuring de parámetros de `createNexoContinuityOwner()` podía evaluar un getter en el objeto de opciones exterior antes de ejecutar las validaciones.
- Corrección: el constructor recibe ahora `options`, inspecciona prototipo y descriptores propios y solo lee los valores de propiedades de datos válidas. La validación del registro anidado sigue siendo independiente.
- Regresiones: getter en `effectVerifiers` del registro y getter en `effectVerifiers` del objeto de opciones; ambos deben rechazarse sin invocación.
- Commits runtime/test: [eb0249e332d450e7b533ebd7309f721f19f43230](https://github.com/snowdenxrp/aldea-ia/commit/eb0249e332d450e7b533ebd7309f721f19f43230), [c192a9b21cef925ac303644a8f3e6a6d8489dcd7](https://github.com/snowdenxrp/aldea-ia/commit/c192a9b21cef925ac303644a8f3e6a6d8489dcd7).
- CI exacto SHA `c192a9b21cef925ac303644a8f3e6a6d8489dcd7`: 5/5 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291162), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291263), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291086), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291219) y [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291274). Esto cubre los flujos disparados en este SHA, no todos los workflows del repo.
- Informe: [NCS_M0_OWNER_OPTIONS_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_OPTIONS_INPUT_GUARD_2026-10-22.md).
- Alcance: rechaza getters ordinarios en opciones y registro. No neutraliza todos los Proxy traps, no autentica fuente/verificador/evidencia y no establece raíz legítima ni habilita efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# Current checkpoint — 2026-10-22 — verifier registry input guard

- Registry runtime/test: `d65245bdbcc20cdee7ebf315d6a65f162bcb894d` / `796219c48fda52dd51e9eec4fa696cb48ec88096`. Outer constructor-options guard/test: `eb0249e332d450e7b533ebd7309f721f19f43230` / `c192a9b21cef925ac303644a8f3e6a6d8489dcd7`. Store-adapter method guard/test: `ccc10ead2f881396bf5af70c24c54a523e10201e` / `7f5bd699b50768d5e890a66a2c2cc9785c46ee1f`.
- Finding: owner construction and injected store validation had read-before-validation paths through accessors. The owner now inspects verifier-registry, outer options, and store-method descriptors before reading values; the store's validated methods are captured so later calls do not re-read mutable properties. Accessor regressions prove getters remain unexecuted.
- Regression proves the getter is not invoked and the registry is rejected with `NEXO_EFFECT_VERIFIER_REGISTRY_INVALID`.
- CI: 7/7 listed workflows succeeded on registry runtime SHA `d65245b...`; 5/5 workflows succeeded on registry test SHA `796219c...`; 5/5 workflows succeeded on latest combined constructor regression SHA `c192a9b...`. Exact current evidence is in `NEXO_NCS/BUILD/NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md`.
- Scope: constructor/configuration boundary only; not authorization, legitimate-owner proof, hostile-Proxy isolation, or effect enablement.
- Canonical gate unchanged: M0 incomplete; authorization `NOT_EVALUATED`; root proof `PENDING/UNKNOWN`; protected effects `STOP`.
- Next: inspect only concrete public-boundary read-before-validation/resource issues, with regression and exact-SHA CI evidence. No arbitrary quotas or invented mechanisms.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARD DE ENTRADA DEL REGISTRO DE VERIFICADORES

- Hallazgo: `createNexoContinuityOwner()` construía el registro con `Object.entries(effectVerifiers)`, que lee valores de propiedades y puede ejecutar un getter configurado por quien llama al constructor.
- Corrección: el constructor ahora inspecciona claves propias y descriptores, rechaza accessors, símbolos, prototipos no permitidos, entradas no enumerables, nombres vacíos y valores que no sean funciones. El registro interno sigue copiado a un objeto de prototipo nulo y congelado.
- Regresión: `tests/nexo/continuity-contract.test.mjs` usa un getter centinela; la construcción debe rechazar el registro sin ejecutar el getter.
- Commits runtime/test: [d65245bdbcc20cdee7ebf315d6a65f162bcb894d](https://github.com/snowdenxrp/aldea-ia/commit/d65245bdbcc20cdee7ebf315d6a65f162bcb894d), [796219c48fda52dd51e9eec4fa696cb48ec88096](https://github.com/snowdenxrp/aldea-ia/commit/796219c48fda52dd51e9eec4fa696cb48ec88096).
- CI en SHA exacto `796219c48fda52dd51e9eec4fa696cb48ec88096`: 5/5 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074402), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074339), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074353), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074344), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074399). No se afirma que todos los workflows del repo hayan corrido.
- Informe: [NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md).
- Alcance: evita la evaluación accidental de getters ordinarios en el registro. No neutraliza todos los Proxy traps, no autentica verificadores ni evidencia, no establece autoridad legítima y no habilita efectos protegidos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — VALIDACIÓN DE OBSERVACIONES DEL VERIFICADOR

- Continuación tras recuperar la conexión: la revisión detectó que `reconcilePrepared()` inspeccionaba directamente el objeto devuelto por el verificador de reconciliación. Un getter en `observation.status` podía ejecutarse antes del rechazo estructural.
- Corrección: reutiliza `validateCallerRecord()` antes de leer cualquier campo de la observación. Entrada inválida devuelve `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID`, mantiene el PREPARED sin liquidar y no avanza la revisión canónica.
- Regresión: observación de verifier con getter en `status`; exige cero ejecución del getter, resultado bloqueado, `journalSettled:false` y revisión intacta.
- Commits: runtime `6937d230b7fff32e04416a47c6a612180ef7c1c7`; primer test `988a3facfab2b6291f9f8d636d32fac7b9c372e0` falló porque el fixture utilizaba la operación equivocada y nunca alcanzaba el verificador; se inspeccionó el log, se corrigió el enlace de operación en `e48e2f9b5f63b63176c7e198bea0a4753e85893d`.
- CI en SHA exacto `e48e2f9b5f63b63176c7e198bea0a4753e85893d`: 5/5 workflows disparados SUCCESS — [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091120), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091141), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091130), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091149), [admisión/continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091015). No se afirma que todos los workflows del repo corrieran en este SHA.
- Informe: [NCS_M0_VERIFIER_OBSERVATION_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_VERIFIER_OBSERVATION_INPUT_GUARD_2026-10-22.md).
- Alcance: guard de datos para salida del verifier in-process. No autentica fuente/evidencia, no neutraliza todo código hostil/Proxy en el mismo proceso, no habilita dispatch ni prueba raíz legítima.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARDAS DE ENTRADA OWNER Y OPERACIONES DE CONTINUIDAD

- El primer cambio del owner detectó una regresión de contrato en CI: los rechazos de misión perdían storeRevision. Se corrigió leyendo la revisión actual solo en la ruta de rechazo y sin tocar el estado canónico.
- La auditoría posterior extendió la misma frontera a las funciones exportadas recordNexoExecutionInSnapshot() y recordNexoOutcomeInSnapshot(): el destructuring de parámetros y structuredClone() podían ejecutar getters caller-supplied antes de rechazar los records. Ahora se hace preflight iterativo del record completo y comprobación de persistibilidad antes de leer campos o clonar.
- Regresiones: getter en missionId de recordMission; getter en result de recordNexoExecutionInSnapshot; getter en evidence de recordNexoOutcomeInSnapshot. Se exige que no se ejecuten y que no cambie la continuidad canónica.
- Commits: owner guard [5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037](https://github.com/snowdenxrp/aldea-ia/commit/5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037); preservación de revisión [e11327c73a83ffa1ae5af4dafcc9cf46da648440](https://github.com/snowdenxrp/aldea-ia/commit/e11327c73a83ffa1ae5af4dafcc9cf46da648440); tests de operaciones [89ba6387068b2c303680b2774b752dca213b77e7](https://github.com/snowdenxrp/aldea-ia/commit/89ba6387068b2c303680b2774b752dca213b77e7); fix de operaciones [b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6](https://github.com/snowdenxrp/aldea-ia/commit/b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6).
- CI exacto del HEAD de código b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6: 7 workflows SUCCESS — [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781227), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781258), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781259), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781165), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781247), [proyección de estado de misión](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781235), [crash cuts de settlement](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781246). El commit posterior solo documental no se cuenta como un nuevo SHA de código validado.
- Informe: [NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md).
- Alcance: hardening de contratos de entrada in-process. No convierte Proxy traps en inocuos, no crea cuota global de heap, no autentica evidencia ni autoriza efectos protegidos.
- Estado canónico sin cambio: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# CHECKPOINT NUEVO — 2026-10-22 — VALIDACIÓN DE INPUT DEL OWNER ANTES DE LEER CAMPOS

- Hallazgo reproducible de contrato: `createNexoContinuityOwner().recordMission()` inspeccionaba `mission.missionId/steps` antes de ejecutar la admisión compartida. Un getter caller-supplied podía ejecutarse antes de que el guard de misión lo rechazara. Patrones equivalentes de orden existían en las entradas de `recordOutcome`, `recordPrepared`, `recordExecutionLineage` y `reconcilePrepared`.
- Regresión añadida en `tests/nexo/continuity-contract.test.mjs`: misión con getter en `missionId`; se exige que el getter no se ejecute y que la revisión canónica no cambie.
- Corrección en `src/nexo/core/continuity-owner.mjs`: `recordMission` llama primero a `assertNexoMissionAdmission`; las demás entradas de records usan preflight iterativo de continuidad seguido de `assertContractInput` antes de leer campos.
- Commits: regresión [`d05519c5ddea931d83dc691064efb012c85ff848`](https://github.com/snowdenxrp/aldea-ia/commit/d05519c5ddea931d83dc691064efb012c85ff848); fix [`5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037`](https://github.com/snowdenxrp/aldea-ia/commit/5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037); informe [`137f60e93e47d72de53dcd2c898074bb69b0f7f7`](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md).
- CI: ocho workflows estaban en cola al registrar el fix. No se declara PASS hasta verificar resultados para el SHA exacto de la rama tras el commit documental.
- Alcance: endurecimiento de entrada in-process; no protege contra código hostil ya ejecutándose en el proceso ni contra todos los traps de Proxy. No es autoridad, autenticación de evidencia ni habilitación de efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — LÍMITE DE LECTURA PARA LOCK OWNER

- Hallazgo de inventario: los stores de continuidad y Chronicle limitaban los documentos canónicos a 16 MiB/32 MiB, pero sus archivos auxiliares `*.lock/owner.json` se leían mediante `readFile()` sin límite explícito. Esos metadatos participan en decisiones de propiedad del lock; una entrada local corrupta o excesiva podía consumir memoria fuera del presupuesto de documento.
- Cambio: `NEXO_RESOURCE_LIMITS.lockOwnerBytes = 4096`. Ambos stores leen owner records con `readUtf8FileBounded`; si superan el límite o no pueden validarse, la adquisición queda `LOCK_STATE_UNKNOWN` y no se elimina el lock ni se inicia la escritura. Esto no reclama resistencia frente a procesos hostiles que controlen el directorio; la configuración de ruta local confiable sigue siendo un requisito documentado.
- Regresiones: `tests/nexo/continuity-store.test.mjs` y `tests/nexo/chronicle-store.test.mjs` ahora comprueban que un owner record de 4097 bytes bloquea de forma fail-closed, preserva el lock y no crea el documento canónico. Las simulaciones de pérdida de propiedad del lock se adaptaron para interceptar `open/read`, conservando la cobertura después de pasar a lecturas acotadas.
- Código y pruebas en HEAD [`1d822786d972616ffbb03e25abd43084076f10e4`](https://github.com/snowdenxrp/aldea-ia/commit/1d822786d972616ffbb03e25abd43084076f10e4).
- CI SUCCESS en ese SHA:
  - STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027492
  - STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027483
  - bounded mission admission/restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027449
  - Chronicle native vertical: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027473
  - integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027551
  - deterministic persistence suite: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027546
- Scope: límite auxiliar de lectura y tests. No se añadieron locks nuevos, colas, retries de negocio ni cuotas de memoria global; no se cambió el runtime de efectos.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — PREFLIGHT COMPARTIDO Y OPTION A ALINEADA CON SUS PRUEBAS

- Se extrajo el preflight iterativo común a `src/nexo/core/continuity-data-guard.mjs`. Lo usa `continuity-snapshot.mjs` antes de validación recursiva de snapshots y `continuity-contract.mjs` antes de validar memoria legacy. Así la ruta de proyección legacy ya no depende de entrar por un snapshot para tener límite de profundidad.
- Límite global del grafo de continuidad: profundidad 35. Se eligió 35 para conservar el presupuesto existente de profundidad 32 por misión después de los contenedores de snapshot/memoria (snapshot + colección + misión; legacy root + nexo + colección + misión). Esto limita profundidad antes de recursión; no es una cuota de heap ni una medición de producción.
- Regresiones en `tests/nexo/continuity-contract.test.mjs`: snapshot profundo en `attempts`, memoria legacy profunda y `projectNexoContinuitySnapshot()` deben fallar con códigos de límite explícitos antes de la validación/clonación recursiva.
- Option A reconciliada en la prueba CLI, sin tocar runtime: commit [`3850889d7f127c7415d429bc3512d78171573291`](https://github.com/snowdenxrp/aldea-ia/commit/3850889d7f127c7415d429bc3512d78171573291). `tests/nexo/assistants-runtime-cli.test.mjs` ahora exige que la ruta opt-in permanezca bloqueada con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`, sin crear obligaciones en `effectJournal` ni reescribir el entorno. La misión puede quedar registrada; el efecto protegido sigue excluido.
- CI para el SHA `3e98103aa6ea65a4de4d74b68300ee89a1321e36`:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246643
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246786
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246618
  - STEP 5 outcome classification — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246778
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852030397 (SHA anterior `d63cf5b`; no atribuir ese run al SHA `3e98103`)
  - repair settlement crash cuts — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246635
- El workflow de crash cuts pasa ahora porque la prueba representa Option A con exactitud; esto NO autoriza ejecución de efectos y NO convierte M0 en completo.
- No se habilitó dispatch ni se modificó `scripts/nexo-runtime-session.mjs`. No se cambió el estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — PREFLIGHT ITERATIVO DE PROFUNDIDAD EN SNAPSHOTS

- Hallazgo: `assertNexoContinuitySnapshot()` invocaba el guard recursivo genérico (`assertContractInput`) antes de que la admisión iterativa por misión pudiera limitar profundidad. En snapshots persistidos, un objeto profundamente anidado en colecciones como `attempts` podía agotar la pila durante validación antes de que se aplicaran los límites del documento.
- Corrección: commit [`2b617e2843a7de0c4b9d900ea4f13dbee0e4f191`](https://github.com/snowdenxrp/aldea-ia/commit/2b617e2843a7de0c4b9d900ea4f13dbee0e4f191), `src/nexo/core/continuity-snapshot.mjs`, añade un preflight iterativo antes del guard recursivo. Profundidad máxima del snapshot: 32; los ciclos, propiedades no-dato, claves símbolo, arrays dispersos/extendidos y prototipos no permitidos se rechazan antes de la validación recursiva.
- Regresión: commit [`4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`](https://github.com/snowdenxrp/aldea-ia/commit/4c8763a52cea5c481e1291d6d1aaafd1a5aac79c), prueba un objeto de profundidad 40 en `attempts` y exige `NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED`.
- CI para el SHA de código/pruebas `4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743391
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743415
- En el SHA inmediatamente anterior `2b617e2`, STEP 4, STEP 5 y bounded mission admission/restart continuity también pasaron: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724112 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724169 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724204.
- Separado y aún abierto: el workflow `Nexo M0 — repair settlement crash cuts` falló en `tests/nexo/assistants-runtime-cli.test.mjs:74`, donde se esperaba `continuity.snapshot.effectJournal[0]` aunque el runtime excluyó el efecto (Option A). Las pruebas previas del mismo workflow pasaron; no se cambia runtime ni se altera la exclusión para forzar verde. Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724226.
- Alcance: se endureció validación estructural de snapshot; no se cambió despacho, persistencia de efectos ni autoridad. El techo de profundidad 32 se aplica a todo el snapshot, no sólo al subárbol de misión, y queda registrado como límite estructural v1.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CI DE PERSISTENCIA: CONCURRENCIA Y EVIDENCIA

- Cambio de workflow: [`3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0`](https://github.com/snowdenxrp/aldea-ia/commit/3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0), `.github/workflows/nexo-deterministic-tests.yml`.
- Causa observada: el workflow usaba un grupo de concurrencia fijo (`nexo-deterministic-tests`) y `cancel-in-progress: true`; sucesivos commits cancelaban pruebas de persistencia de SHAs anteriores. Para el SHA `c105f9098faf5bf45531b5c91731499c319070ac`, la ejecución quedó CANCELLED, no FAILED ni SUCCESS.
- Cambio aplicado: grupo por referencia (`nexo-deterministic-tests-${{ github.ref }}`) y `cancel-in-progress: false`, para aislar ramas y encolar ejecuciones en lugar de cancelar el test completo de persistencia con cada push.
- Estado del CI de persistencia antes del ajuste: ejecución para HEAD documental anterior `0ccffaedb981250119f126ab7c351ba3e9c41d18`, run https://github.com/snowdenxrp/aldea-ia/actions/runs/39851124108, seguía `PENDING` sin job asignado al último chequeo; una ejecución previa seguía `IN_PROGRESS` desde antes y sin conclusión. No presentar como verde.
- Los cuatro workflows del SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac` permanecen en SUCCESS: integrated acceptance regression https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153; STEP 4 https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210; STEP 5 https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069; bounded mission admission https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071.
- Próxima verificación: confirmar que el nuevo grupo de concurrencia permita que el workflow de persistencia se ejecute y termine en el HEAD actual. No hacer nuevos commits de código mientras se espera, salvo que aparezca un fallo real que requiera corrección.
- No se cambió runtime de Nexo, los límites de admisión, la política de efectos ni la autorización.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — UNIFICACIÓN DEL LÍMITE DE ADMISIÓN PERSISTIDA

- Cambio de contrato: [`df0ea917f38e02afb4dba97c5cec4e13b57a7e72`](https://github.com/snowdenxrp/aldea-ia/commit/df0ea917f38e02afb4dba97c5cec4e13b57a7e72) añade comprobación de admisión al validar misiones persistidas en `src/nexo/core/continuity-contract.mjs`. Un límite de 256 pasos no debe depender de haber llegado por `recordNexoMissionInSnapshot`: los snapshots entregados directamente al store también deben respetarlo.
- Corrección de contrato: [`16406ed67a05a68924289e0c215bd66be84210bc`](https://github.com/snowdenxrp/aldea-ia/commit/16406ed67a05a68924289e0c215bd66be84210bc) conserva los códigos de error de schema ya establecidos para formas persistidas inválidas; sólo propaga el código específico cuando se excede el límite de recursos de misión.
- Regresión: [`17d03d4bab51498dee4293c0d924ab632cf4cf48`](https://github.com/snowdenxrp/aldea-ia/commit/17d03d4bab51498dee4293c0d924ab632cf4cf48) comprueba que un snapshot con 257 pasos se rechaza en la frontera de validación persistida.
- Ajuste de prueba de store: [`c105f9098faf5bf45531b5c91731499c319070ac`](https://github.com/snowdenxrp/aldea-ia/commit/c105f9098faf5bf45531b5c91731499c319070ac) separa el límite del documento de Continuity (16 MiB) del límite de admisión de cada misión. El fixture ahora combina 65 misiones individualmente acotadas para exceder el presupuesto agregado del documento sin que una sola misión viole su propio contrato.
- CI para SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac` al momento de este checkpoint:
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210
  - STEP 5 outcome classification — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071
  - deterministic persistence tests — PENDING, sin job asignado aún: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946294
- Resultado: 4 SUCCESS, 1 PENDING. No declarar CI completo hasta que termine la prueba de persistencia.
- Nota de reparación durante esta ronda: las ejecuciones intermedias `df0ea91`/`16406ed` mostraron regresiones en tests existentes; la causa se acotó a mezclar los errores estructurales previos y el límite de documento con el nuevo límite de admisión. Se corrigió el mapeo y se ajustó el fixture de presupuesto agregado. El SHA `c105f90` ya pasa el workflow de aceptación integrada, que incluye la regresión de continuidad y recuperación.
- No se modificó el runtime de ejecución ni se autorizó ningún efecto. Los límites de admisión existentes no se han elevado.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — MISIÓN RAMIFICADA Y VARIEDAD DE ADMISIÓN

- Código/prueba: [commit `ed48932f2479f398b11a6f10af55c8821150cc00`](https://github.com/snowdenxrp/aldea-ia/commit/ed48932f2479f398b11a6f10af55c8821150cc00), archivo `tests/nexo/continuity-contract.test.mjs`.
- Añade un segundo fixture independiente: grafo fork/join de cuatro pasos, destinos textuales, estados omitidos con valores predeterminados y campos opcionales `reason`, `source`, `reversible`, `requiresEvidence`. Comprueba que se conserva la topología y los campos admitidos.
- CI observado para el SHA exacto:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868669
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868908
  - STEP 5 outcome classification — IN_PROGRESS al último chequeo: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868876
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837869070
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868724
- Estado de CI al guardar este checkpoint: 4 SUCCESS, 1 IN_PROGRESS; no declarar el conjunto completo aprobado hasta que termine el workflow STEP 5.
- Conclusión acotada: ya hay dos formas de misión aceptada en pruebas de integración (cadena con contexto anidado y grafo ramificado con valores por defecto/campos opcionales). Sigue sin ser evidencia de producción, medición de heap ni garantía de que se admitan todas las misiones legítimas.
- No se modificó runtime, no hubo dispatch ni se habilitaron efectos. Siguiente paso: confirmar el workflow pendiente y después abordar una sola brecha de recursos con evidencia; no inventar cuota de memoria global ni concurrencia multiproceso.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARD DE OPCIONES EN ADMISIÓN PÚBLICA DE CHRONICLE

- Hallazgo: `recordNexoMissionSafely({ owner, expectedRevision, mission } = {})` desestructuraba opciones antes de validar. Un accesor podía ejecutarse antes de entrar al `try`; no había una prueba específica de esta frontera.
- Primer cambio de runtime: [`2a2408d9`](https://github.com/snowdenxrp/aldea-ia/commit/2a2408d9f78ded91e3566895a74ae85454bb1ced). CI falló en parseo de `chronicle-append.mjs`: se sustituyó la función sin conservar su cuerpo completo de manejo de resultados. Runs fallidos, no ocultados: [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865009176) y [persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865009110). La salida del job identificó `SyntaxError: Unexpected token 'export'`.
- Corrección del runtime: [`8a63cba5`](https://github.com/snowdenxrp/aldea-ia/commit/8a63cba5aee4f434da90aff3c1707708131b7d7d) restaura el manejo de resultados y mantiene el preflight de opciones.
- Regresión nueva: [`eb303003`](https://github.com/snowdenxrp/aldea-ia/commit/eb303003680022cf31688e3304c439aed13f93f7), `tests/nexo/mission-admission-wrapper-input-guard.test.mjs). Comprueba getter no ejecutado, cero llamadas al propietario en entrada inválida y preservación de la ruta válida.
- Integración de la prueba en `npm test`: [`f512e800`](https://github.com/snowdenxrp/aldea-ia/commit/f512e8007a311df141d950f7e89f7e54a6a7211a).
- Estado CI actualizado para el SHA correctivo `8a63cba5aee4f434da90aff3c1707708131b7d7d`: aceptación integrada [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865107760); persistencia determinista [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865107828). El CI del SHA intermedio `f512e800` falló por el mismo error de sintaxis; no se considera validación del guard.
- Límite de la corrección: se valida el contenedor de opciones antes de extraer campos y se rechazan prototipos/accessors. Esto no neutraliza todos los traps posibles de Proxy ni prueba autoridad legítima. No se ejecutó dispatch deliberado durante esta corrección.
- Siguiente paso obligatorio: esperar resultados del SHA correctivo, resolver cualquier fallo real y sólo entonces continuar auditando otra frontera.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT NUEVO — 2026-10-22 — GUARD DEL VERIFICADOR PÚBLICO DE CHRONICLE

- Hallazgo: `createNexoChronicleEffectContracts()` exponía un `verifier` que llamaba a `observe(operation)`; éste construía opciones con `{ store, ...operation }`. El spread puede ejecutar getters de `operation` antes de que `observeChronicleOperation` valide sus descriptores. Las guardias previas del handler y la postcondición no cubrían este punto de entrada.
- Corrección runtime: commit `72ebe229677b98c66401f2d74cfe398508cb99d6`. El verificador ahora lee descriptores propios de datos para `idempotencyKey`, `missionId`, `stepId`, `action` y `target`, y construye un objeto nuevo sin spread del objeto no confiable.
- Regresión: commit `8a7b8562a9f6689c86162b82f4cadab5a1302984`. Se añadió una prueba de getter centinela para el verifier y se comprueba que la lectura del almacén no se inicia.
- CI en comprobación: Chronicle native vertical para SHA runtime `72ebe229...` [SUCCESS, run 39865376589](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376589). En el momento de este checkpoint siguen en curso la persistencia determinista [run 39865376604](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376604) y admisión/continuidad [run 39865376544](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376544). En SHA de test `8a7b8562...`, validación semántica [run 39865398271](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398271) y clasificación de resultado [run 39865398267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398267) están en curso; persistencia [run 39865398289](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398289) está pendiente. No declarar matriz completa hasta revisar conclusiones finales.
- Límite: se previene la ejecución accidental de getters normales en los campos del operation object; no se neutralizan todos los traps de Proxy y esto no acredita procedencia causal ni autoridad legítima. El verificador conserva su semántica observacional; no habilita dispatch.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Resultado posterior del checkpoint de verificador Chronicle — 2026-10-22

- Confirmación de CI para runtime SHA `72ebe229677b98c66401f2d74cfe398508cb99d6`: Chronicle native vertical [SUCCESS, run 39865376589](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376589); persistencia determinista [SUCCESS, run 39865376604](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376604); admisión/continuidad [SUCCESS, run 39865376544](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376544).
- Confirmación de CI para test SHA `8a7b8562a9f6689c86162b82f4cadab5a1302984`: validación semántica [SUCCESS, run 39865398271](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398271); clasificación de resultado [SUCCESS, run 39865398267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398267); persistencia determinista [SUCCESS, run 39865398289](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398289).
- Alcance exacto: estas pruebas validan la regresión del verificador y workflows señalados; no equivalen a una corrida completa de `npm test`, ni a prueba de autoridad raíz o de activación segura de efectos protegidos.


---

# CHECKPOINT NUEVO — 2026-10-22 — ENDURECIMIENTO DE CONTRATOS CORE (CI PENDIENTE)

- `src/nexo/core/contracts.mjs`: validación iterativa del grafo con conjuntos activo/completado; ciclos reales rechazados, referencias compartidas acíclicas admitidas, arrays densos con prototipo canónico y sin propiedades extra, congelación iterativa en postorden.
- Límites de admisión v1 revisados tras CI de compatibilidad: profundidad 40, 100 000 objetos, 16 MiB por cadena y 17 MiB agregados de cadenas/keys. Son límites estructurales, no mediciones de heap ni garantías de producción.
- `detachedMutable()` valida antes y después de clonar. Las listas de claims se validan antes de copiarlas, sin spread previo que normalice la forma de entrada.
- `tests/nexo/core-contracts.test.mjs`: regresiones para ciclos, referencias compartidas, arrays dispersos/extendidos/prototipo no canónico, límites de profundidad/nodos/cadenas y estado mutable cíclico.
- El script `npm test` ahora incluye la prueba directa de contratos como primera etapa para que el workflow de persistencia la ejecute.
- Estado de verificación: prueba directa y CI para el SHA nuevo PENDING hasta observar resultados vinculados al commit; no declarar PASS por la existencia de tests.
- Límite explícito: traps de Proxy no neutralizados. No se cambia autoridad ni se habilita despacho de efectos protegidos.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT DE CORRECCIÓN — 2026-10-22 — ALINEACIÓN DE REGRESIONES DE CONTRATOS

- El primer CI del endurecimiento, en commit `76194883df726b413ae604fb3b7ba224456671f9`, falló de forma visible en regresiones existentes: tres pruebas esperaban el mensaje de error específico de un campo cuando la nueva validación del grafo detectaba antes la forma no canónica del array. Se amplió la expectativa para aceptar ambos rechazos válidos, sin relajar la validación.
- La misma ejecución reveló que `final-semantic-validator.test.mjs` construía un candidato cíclico mediante el constructor público. Ese escenario ahora se separa: la prueba del contrato verifica rechazo en admisión; la prueba del validador usa un candidato externo deliberadamente malformado para conservar la comprobación de resultado `UNKNOWN` al comparar targets cíclicos.
- El commit inicial no se considera validado. Se esperan nuevas ejecuciones sobre el SHA correctivo; no atribuir los resultados del SHA anterior al nuevo.


---

# AJUSTE DE COMPATIBILIDAD — LÍMITES DE GRAFO CORE

- El CI del SHA `739405e42a3ef49e09238980bdf5c8b91734030d` detectó una incompatibilidad real: el límite provisional de 256 KiB por cadena rechazaba el fixture de snapshot válido de 16 MiB antes de que `continuity-store` pudiera devolver su resultado contractual `NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED`.
- Ajuste para respetar contratos existentes: profundidad 40 (por encima del preflight global de continuidad de 35), 100 000 objetos, 16 MiB por cadena y 17 MiB agregados de cadenas/keys. Así el preflight de contratos no debe apropiarse de la clasificación de capacidad que pertenece al store.
- Se elevan las regresiones de nodo/cadena para probar los nuevos límites reales. La ejecución previa de CI del SHA anterior permanece registrada como FAIL y no se atribuye al SHA correctivo.
