# NCS / Nexo — handoff de continuidad M0
Fecha: 2026-10-19
Repositorio: https://github.com/snowdenxrp/aldea-ia
Rama: `ncs-clean-architecture`
SHA de código+tests validado: `d4544e74e8568cf7d5221ccbc42e48daacd1e9f5`
Los commits documentales pueden mover HEAD; comprobar la rama viva al retomar.

## 0. Instrucción principal

**La misión sigue siendo M0.** No reiniciar M0.1–M0.52 ni auditorías históricas cerradas; no desviarse a STEP 7, M1, Lúmina, UI o despliegue. Leer `NEXO_NCS/STATUS.md`, este handoff y `NEXO_NCS/BUILD/NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md`.

## 1. Estado confirmado

### Admisión
- El registro proyectado rechaza funciones, símbolos, bigint/undefined proyectados, números no finitos, ciclos, arrays sparse y propiedades extra de arrays.
- `step.action` debe ser string no vacío.
- Los estados de misión/paso deben pertenecer al vocabulario existente. El allowlist se derivó de productor, runtime y reconstrucción; no se añadieron estados.
- Nullish mantiene el default `planned`; valores desconocidos se rechazan antes del commit.
- El claim `completed` en un plan no es evidencia: la reconstrucción bloquea pasos completados sin evidencia canónica.

### Runtime readiness gate
- Se reprodujo que un sucesor podía llegar a PREPARED con una dependencia aún `planned`; ahora se requiere misión/paso reconstruidos `planned` y dependencias `completed`.
- Se reprodujo que una misión almacenada como `blocked` podía reactivarse si tenía un paso `planned`; ahora el runtime exige el estado almacenado `mission.status === "planned"` antes de nueva preparación/dispatch.
- El recovery de obligaciones existentes en el journal sigue antes del gate. Los checks de capacidad de handler/verificador siguen antes del gate y del PREPARED.

### SHA / CI
- SHA final código+tests: `d4544e74e8568cf7d5221ccbc42e48daacd1e9f5`.
- SUCCESS: bounded admission/runtime [39210288131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288131), STEP 4 [39210288085](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288085), STEP 5 [39210288034](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288034), crash cuts [39210287996](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210287996), Chronicle native vertical [39210287994](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210287994).
- PRs integrados: [#99](https://github.com/snowdenxrp/aldea-ia/pull/99), [#100](https://github.com/snowdenxrp/aldea-ia/pull/100), [#101](https://github.com/snowdenxrp/aldea-ia/pull/101), [#102](https://github.com/snowdenxrp/aldea-ia/pull/102), [#103](https://github.com/snowdenxrp/aldea-ia/pull/103), [#104](https://github.com/snowdenxrp/aldea-ia/pull/104), [#105](https://github.com/snowdenxrp/aldea-ia/pull/105).

### Siguiente frontera
Auditar la consistencia entre `mission.status`, los estados de sus pasos y `objective`. Buscar combinaciones imposibles que puedan persistirse y cambiar la reconstrucción. Reproducir antes de corregir; no introducir invariantes por intuición.

**Estado global:** M0 **INCOMPLETO**; efectos protegidos **STOP**; STEP 7 **OPEN / STOP / UNKNOWN**; Nexo y Lúmina separados. No se ha demostrado autoridad constitucional legítima.


## 2. Último cambio concreto: replay Chronicle incompleto

Hueco reproducido: la ruta de replay genérico exigía un registro canónico completo, pero la rama específica `chronicle_append` validaba sólo identidad, `settled_observed`, `applied`, fuente `nexo-chronicle-store` y revisión observada no negativa. Podía devolver `already_observed` aunque el settlement no tuviera evidencia ni timestamp de observación.

Cambio en `src/nexo/core/continuity-owner.mjs` (código `005338b...`):
- Chronicle replay exige además `settlement.evidence`.
- Exige `observedAt` en formato ISO válido/canónico.
- Si el registro está incompleto, no lo acepta como `already_observed`, no ejecuta el verificador como fallback; la prueba observa conflicto de revisión.

Prueba añadida en `tests/nexo/repair-settlement-crash-cuts.test.mjs` (código/test SHA `ddf1034...`):
- Crea un settlement parcial con estado/source/revisión correctos pero sin `evidence` ni `observedAt`.
- Verifica que el replay no lo acepta y que el verificador no es invocado.

CI:
- Base código `005338...`: seis workflows focales SUCCESS (IDs arriba).
- Base código+test `ddf103...`: cuatro workflows activados por la regresión SUCCESS (IDs arriba).
- Commits `c832a6b...`, `db69693...`, `0e689f3...` actualizan documentación, sin cambios de código/test.

## 3. Hardening previo ya hecho — no repetir

### A. Fallos de lectura de continuidad

En `src/nexo/core/continuity-owner.mjs`:
- `recordMission()` captura fallo de `store.loadCurrent()` y devuelve incertidumbre estructurada; no construye ni guarda una misión desde estado desconocido.
- `reconcilePrepared()` captura fallo de lectura inicial y de relectura inmediatamente previa al CAS.
- Si falla la lectura inicial, el verificador no se invoca.
- Si falla la relectura pre-CAS, no se escribe la observación y el registro `PREPARED` queda intacto.
- Los resultados incluyen código de error existente o código fallback y un marcador de incertidumbre; no afirman commit ni settlement.

SHA/cobertura histórica documentada en `NEXO_NCS/STATUS.md`, especialmente checkpoints `b34c094...`, `9852ec...`, `c8b5c59...` y `f43c757...`. No repetir estas mismas pruebas salvo que el código haya cambiado o surja una nueva brecha demostrable.

### B. Replay de observación genérica

El replay sólo acepta una entrada canónica con:
- identidad exacta: idempotency key, misión, paso, acción y target;
- estado de journal `reconciled_observed`;
- observación `applied` o `not_applied`;
- revisión observada entera segura y no negativa;
- fuente no vacía;
- propiedad `evidence` presente;
- `observedAt` ISO válido.

Una entrada parcial no se acepta como `already_observed`; no se invoca el verificador para “reparar” un replay inválido. Las pruebas cubren respuesta perdida tras commit durable, reabrir owner y replay sin volver a invocar el verificador, y replay incompatible/malformado.

### C. Respuesta perdida después de commit durable

La frontera genérica de commit de observación captura excepción posterior al commit y devuelve incertidumbre estructurada. La prueba usa el store canónico real, persiste el cambio y después lanza una excepción:
- primera llamada: bloqueada con incertidumbre; no presume éxito/fallo;
- después de reabrir: replay recupera `already_observed`, revisión canónica 1;
- el verificador no se ejecuta otra vez.
No añade atomicidad cross-store, retry, redispatch ni reejecución automática.

### D. Completion fail-closed

`recordOutcome(status=completed)` se bloquea por defecto con `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`, salvo:
- `chronicle_append`, que pasa por el gate de settlement canónico;
- `local_analysis`, la acción definida como no mutante.

El bloqueo por efecto PREPARED/reconciliación no resuelta mantiene prioridad. Se cubren reparación sin PREPARED, efecto registrado sin PREPARED y acción genérica no registrada sin PREPARED; la revisión canónica no avanza. Esto **no** implementa el goal verifier.

### E. Contrato de resultados públicos y admisión

Ya está endurecida la serialización pública con allowlist de campos y tipos; `UNKNOWN` permanece explícito, `dispatchAttempted` sólo acepta booleano true, `redispatchAuthorized` queda false, campos malformados se omiten y no se filtran objetos internos. Admisión de misión ante respuesta perdida se recupera desde la continuidad canónica; no asumir que un segundo `recordMission()` debe devolver `already_recorded` (el store puede devolver conflicto; la recuperación se hace leyendo el estado canónico).

### F. Límites de arquitectura

- Nexo y Lúmina son sistemas separados; no importar memoria/simulación de Lúmina.
- No habilitar UI, `index.html`, HTTP, runtime legacy ni efectos protegidos como atajo.
- No inventar IDs, colas, retries, tombstones, wrappers transaccionales ni estados nuevos.
- Falta todavía un contrato confiable de verificación de objetivo conectado a observación persistida y decisión de misión. Los campos de evidencia del caller no constituyen verificación.
- No afirmar autoridad legítima ni runtime listo por pruebas unitarias verdes.

## 4. Punto exacto donde continuar

Último trabajo inspeccionó:
- `src/nexo/core/continuity-owner.mjs`
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`
- `NEXO_NCS/STATUS.md`
- `NEXO_NCS/BUILD/NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md`

Último cambio funcional: validar `evidence` y `observedAt` al recuperar el settlement de `chronicle_append`. La frontera sugerida en el status anterior era comparar la validación del settlement en la ruta de escritura con la del replay. Esta comparación ya debe ser la siguiente inspección puntual; no asumir que falta validación sin leer ambos caminos.

Pasos:
1. Leer en `continuity-owner.mjs` el código que escribe el settlement Chronicle y la rama `chronicleSettlement` que recupera el replay. Comparar invariantes: identidad, status, source, observedRevision, evidence y observedAt.
2. Leer las pruebas Chronicle/settlement existentes antes de escribir una nueva.
3. Sólo si se encuentra una diferencia concreta, añadir una regresión que falle primero, corregir el mínimo necesario y ejecutar los workflows focales pertinentes.
4. Comprobar los workflows reales por SHA; diferenciar resultados heredados del SHA de código y ejecuciones activadas por cambios sólo de prueba.
5. Actualizar `STATUS.md`, este handoff y el contrato de resultados si el contrato cambió.
6. Si no hay hueco, no fabricar una modificación: documentar el resultado y avanzar al siguiente límite real dentro de M0.

## 5. Definición de progreso / cómo informar

Para cada cambio, dejar:
- fallo concreto demostrado;
- archivo y función afectados;
- prueba de regresión;
- SHA de código y SHA de pruebas;
- workflows y estados CI reales;
- límite de lo que NO demuestra;
- siguiente tarea puntual.

No repetir resúmenes completos en cada mensaje. No afirmar “terminado” mientras el goal verifier, la frontera de ejecución real y la prueba de autoridad sigan sin resolverse. Mantener la misión M0 como prioridad absoluta.


## 6. Checkpoint verificado — completion Chronicle exige settlement completo (2026-10-19)

Se cerró la discrepancia detectada entre replay y `recordOutcome()`: replay ya exigía `evidence` y `observedAt` ISO canónico, pero la condición `chronicleSettlementReady` de `recordOutcome()` podía aceptar un registro `settled_observed` con estado/fuente/revisión correctos sin esos dos campos. La validación estructural del snapshot no impone ese contrato completo a cada settlement histórico.

**Cambio de código:** `src/nexo/core/continuity-owner.mjs` ahora calcula y exige un `observedAt` ISO válido/canónico y la presencia de `evidence` antes de permitir que un settlement Chronicle autorice `completed`. No se añadieron estados, retries, colas ni acciones mutantes.

**Regresión:** `tests/nexo/repair-settlement-crash-cuts.test.mjs` carga un settlement Chronicle incompleto y confirma que `recordOutcome()` devuelve `blocked / NEXO_CHRONICLE_SETTLEMENT_REQUIRED`, conserva `storeRevision=0` y no registra un attempt terminal.

- SHA de código: `f3a54153d3574f559aa32f1c56d093e1152b4842`.
- SHA de código + prueba de regresión con fixture corregido: `b21896e893a1b739bbfa511f76c3a215298a73e6`.
- CI SUCCESS en el SHA de código + prueba: [repair settlement crash cuts — 39192937988](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937988), [effect/settlement contract regressions — 39192937997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937997), [STEP 4 semantic validation — 39192938031](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192938031), [STEP 5 outcome classification — 39192937987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937987). Los cuatro están en `success`.
- El commit de código `f3a5415` tuvo un fallo inicial de la regresión por identidad inconsistente dentro del fixture (`target=alpha` frente a `target=alex`), no por la aserción del contrato; se corrigió el fixture y se reejecutó el conjunto. El SHA final anterior contiene la identidad alineada y sus workflows pasaron.
- Este resultado demuestra la frontera de completion y la regresión de CI; no demuestra durabilidad ante pérdida de energía, causalidad del efecto externo, goal verifier general ni autoridad legítima.

**Siguiente paso:** continuar M0 desde el siguiente límite real de escritura/recuperación, leyendo sus pruebas antes de cambiar código. No repetir la auditoría de `chronicleSettlementReady` ni del replay ya cerrada. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## 7. Checkpoint verificado — evidencia Chronicle no puede ser null (2026-10-19)

Se encontró una brecha posterior al gate de settlement completo: el verificador Chronicle confirmaba la entrada persistida pero no devolvía evidencia. El propietario serializaba `evidence: null`, y las guardas previas sólo exigían que la propiedad existiera.

**Cambio funcional:**
- `src/nexo/adapters/chronicle-observation.mjs`: cuando encuentra una única entrada con operationKey y contenido coincidentes, devuelve `evidence: { kind: "persisted-chronicle-entry", operationKey, content }`.
- `src/nexo/core/continuity-owner.mjs`: helper compartido valida que evidence sea objeto, kind sea exacto y operationKey/content coincidan con la entrada/target. Aplicado tanto al replay de settlement Chronicle como a `recordOutcome(status="completed")`.
- Pruebas: `tests/nexo/chronicle-store.test.mjs` comprueba la evidencia material del verificador. `tests/nexo/repair-settlement-crash-cuts.test.mjs` inyecta `evidence: null` con el resto de settlement válido y confirma bloqueo tanto en completion como en replay, sin cambiar la revisión ni los intentos.

**SHA y CI:** código `b3a583038a3844b804655544097783d73bc222d2`; observador + prueba de forma `af465ba0d2d0b787dc6ac0f7c6dc4f2f18851db4`; SHA final con regresiones de completion y replay `2c859b001a705e6dd839d2b0c311182dd6ed9f81`. Chronicle native SUCCESS run `39193460291`; bounded admission/restart SUCCESS `39193460351`; STEP 4 SUCCESS `39193464132`; STEP 5 SUCCESS `39193464001`; crash cuts SUCCESS `39193464060`; effect/settlement regressions SUCCESS `39193464046`. Chronicle/bounded pasaron en el SHA de código+test `af465...`; los otros cuatro en el SHA final `9914...`. Una ejecución intermedia falló por la expectativa exacta antigua del test y se corrigió antes del checkpoint validado; no ocultar ese orden ni atribuir el fallo a producto.

**Límite:** evidencia estructurada tomada del store local, no autenticación criptográfica ni causalidad, autorización, garantía fsync/power-loss, o verificación general del objetivo. M0 sigue INCOMPLETO y efectos protegidos STOP.

## 8. Próximo paso obligatorio

Continuar la siguiente frontera real de M0 en recuperación/reconstrucción de continuidad canónica. Leer primero los tests relevantes antes de modificar. No repetir auditoría de settlement Chronicle; no hacer un cambio si no hay un fallo reproducible. Mantener Nexo separado de Lúmina y no activar efectos protegidos.


## 9. Checkpoint adicional — runtime no puede saltarse el contrato de settlement

La recuperación de Chronicle en `src/nexo/core/owner-backed-runtime.mjs` tenía una puerta más débil que el owner: con status `settled_observed`, source y revisión bastaba para llamar a `recordOutcome`, sin validar evidencia ni timestamp. Aunque el writer real bloqueaba el outcome inválido, el runtime podía informar settlement como válido en su estado intermedio.

Se creó `src/nexo/core/chronicle-settlement-contract.mjs` para centralizar las invariantes estructurales: status/action, identidad exacta y no ambigua, target content, settlement applied/source/revisión, evidencia objeto con kind/operationKey/content ligados al target y timestamp ISO canónico. Owner replay, completion y runtime recovery usan ahora la misma función.

La prueba positiva de replay incluye evidence/timestamp válidos. La negativa usa `evidence: null` y verifica que no hay redispatch, no se invoca outcome writer y el resultado no marca `journalSettled` ni terminal outcome. SHA de código/contrato final `e62b65ab699c5d177c40d08f32a1393af118e4ee`; SHA con regresión runtime `26eab01d09ab4be20c7228da8abf17e3224f5a6b`. Chronicle native, bounded admission, STEP 4 y STEP 5 pasaron en `26eab...`; crash cuts, STEP 4 y STEP 5 pasaron después del cambio final de identidad en `e62b...`. Una ejecución intermedia de Chronicle falló por fixture antigua sin evidencia; fixture corregida y ejecución posterior verde. Detalle y enlaces en `NEXO_NCS/STATUS.md`.

**Siguiente paso:** revisar observación genérica y la forma de `evidence` con el mismo estándar, empezando por los tests existentes. No cambiar el contrato genérico hasta demostrar la brecha y comprobar las compatibilidades deliberadas.


## 11. Checkpoint — evidencia genérica ausente/vacía ya no se acepta

Se cerró la brecha en `reconcilePrepared()`: una observación `applied/not_applied` debe traer una propiedad propia `evidence` con objeto no nulo, no-array y al menos una clave enumerable. Replay genérico usa la misma condición. `unknown` mantiene su retorno de incertidumbre antes de exigir evidencia positiva.

`observeChronicleOperation()` aporta evidencia de ausencia cuando no encuentra entrada: `{kind: "chronicle-operation-absence", operationKey, observedRevision, matchCount: 0}`. Esto conserva la ruta legítima que registra que la entrada no estaba presente sin permitir que un verificador genérico omita evidencia.

Pruebas nuevas: sin evidence y `evidence: {}` bloquean sin mutar; replay legacy con `evidence: null` no devuelve `already_observed`. SHA código owner `6ab75e1...`, adaptador `8920343...`; SHA de pruebas `b3a3f8...`. Chronicle native + bounded admission SUCCESS en `6ab75e...`; crash cuts, effect/settlement, STEP 4 y STEP 5 SUCCESS en `b3a3f8...`. Enlaces e IDs en STATUS.

**Siguiente frontera:** revisar colisiones de identidad por separador en `validateOperation()`; no introducir formato nuevo. Reproducir si `missionId`/`stepId` con `:` permiten identidad ambigua y añadir test antes del cambio mínimo.


## 12. Checkpoint — identidad de operación sin separadores ambiguos

`validateOperation()` ahora rechaza `:` dentro de `missionId` o `stepId` con el código existente `NEXO_OPERATION_IDENTITY_MISMATCH`. Sin esta regla, pares diferentes podían serializarse a la misma clave concatenada; el comportamiento previo ya bloqueaba una segunda identidad incompatible, por lo que el riesgo demostrado era ambigüedad/colisión, no duplicación de efecto.

La regresión comprueba ambas variantes y que el store permanece sin cambios. Código final `442963578e2de42e6d67afd6fd85062ccea1a23e`; test `ddfc6f98514ca3222a6e9424835602c40643cbea`. Los seis workflows focales pasaron en el SHA final; enlaces en STATUS. El primer intento de test falló por el código de error incorrecto; se corrigió la clasificación antes de aceptar el checkpoint.

**Siguiente paso:** auditar si la reconstrucción de misión filtra intentos históricos por identidad completa (action/target) o sólo por missionId/stepId. Reproducir con una entrada mismatcheada antes de cambiar.


## 13. Checkpoint — reconstrucción exige identidad y evidencia para completed

Se corrigió `reconstructNexoMissionFromSnapshot()`: la completion sólo se reconstruye desde un intento con acción y target coincidentes con el paso canónico y evidencia verificada con kind/source no vacíos. Si existe una afirmación `completed` pero falla identidad o evidencia, el paso se bloquea en lugar de quedar completed o planned/executable. Los intentos no terminales con identidad disponible también se filtran por action/target; registros legacy sin ambos campos siguen siendo elegibles sólo para estados no terminales.

Pruebas: intento con action/target distintos y completion con evidence no verificada. Código SHA `98abe80...`; pruebas SHA `576785...`. Bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS en el SHA de prueba final; enlaces en STATUS. La ejecución intermedia de código falló contra la expectativa antigua planned, y el test se actualizó a la condición segura blocked antes de dar por válido el checkpoint.

**Siguiente paso:** auditar el caso Chronicle `settled_observed` sin outcome terminal válido y verificar que la reconstrucción no deje una operación ejecutable; no modificar runtime ni volver a abrir contratos ya cerrados sin una regresión nueva.


## 14. Checkpoint — Chronicle settled sin outcome no se reconstruye como ejecutable

La reconstrucción consulta ahora el contrato compartido de settlement Chronicle. Un paso `chronicle_append` sólo puede reconstruirse como completed si existe exactamente un settlement canónico válido y un intento completed con action/target coincidentes y evidencia verificada. Si hay settlement válido pero falta intento terminal, se devuelve blocked con `NEXO_CHRONICLE_OUTCOME_REPLAY_REQUIRED`; si existe un claim completed pero el settlement no es válido, se devuelve blocked con `NEXO_CHRONICLE_SETTLEMENT_REQUIRED`.

Pruebas: settlement válido sin outcome y outcome completed con evidence null en el settlement. Código SHA `dfef720...`; regresiones SHA `fe798622...`. Bounded admission/restart, crash cuts, STEP 4 y STEP 5 SUCCESS en el SHA de pruebas; enlaces en STATUS. La ejecución previa de test demostró el hueco: reconstruía planned en el caso settled sin outcome.

**Siguiente paso:** delimitar los intentos legacy frente a los intentos canónicos de acciones no Chronicle. El goal verifier general sigue pendiente; no afirmar que una evidencia caller-supplied autoriza completion.


## 15. Checkpoint — reconstrucción no trata labels caller-supplied como goal verifier

La reconstrucción canónica ahora permite completion sólo para `local_analysis` y `chronicle_append` (este último requiere settlement válido y outcome). Para acciones mutantes sin goal verifier, un attempt completed con `verified/kind/source` no es suficiente y queda blocked con `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`. Evidence inválida se clasifica como `NEXO_COMPLETION_EVIDENCE_UNVERIFIED`.

El test de replay monotónico se acotó a `local_analysis`; no se tocó el runtime legacy `src/assistants/memory.js`. Código `fbfda4...`; test final `ac8e4...`. Bounded admission/restart, STEP 4, STEP 5 SUCCESS en `ac8e4...`; crash cuts SUCCESS en `fbfda4...`. Enlaces en STATUS. Goal verifier general sigue pendiente; no activar efectos protegidos.

**Siguiente paso:** auditar la admisión de dependencias con pasos terminales declarados en el plan, y comprobar que `recordPrepared()` se guía por resultados canónicos en vez de etiquetas de estado. No cambiar si los guards existentes ya bloquean el caso.


## 16. Checkpoint — PREPARED usa estado reconstruido del paso

La regresión demostró que un intento terminal caller-supplied para `repair_agent_state` dejaba el paso reconstruido como blocked, pero `recordPrepared()` miraba únicamente el estado `planned` del plan almacenado y aun así confirmaba PREPARED. La prueba falló antes del fix con `committed` en vez de `blocked`.

Fix en `src/nexo/core/continuity-owner.mjs`: antes de PREPARED se reconstruye la misión desde el snapshot y se exige que el paso correspondiente también esté `planned`. El rechazo usa `NEXO_PREPARED_STEP_NOT_RUNNABLE` y no cambia storeRevision ni effectJournal. La verificación de dependencias usa esa misma reconstrucción.

Fix SHA `615941bf3bc4389c3ce9fd12b0212f3144f9c87a`; HEAD con regresiones `9d46f1400cef0eb4c74a4c4419edcc2c616a73b9`. En HEAD pasaron bounded admission/restart run 39195354527, STEP 4 run 39195354529, STEP 5 run 39195354611, crash cuts run 39195354737. Chronicle native y effect/settlement pasaron en el SHA funcional: runs 39195344263 y 39195344261. Los enlaces están en STATUS.

**Siguiente paso:** buscar el contrato ya existente sobre más de un PREPARED no resuelto por misión. La reconstrucción marca la misión bloqueada si existe uno; antes de cambiar admission, comprobar si la arquitectura permite obligaciones independientes en paralelo. No inventar un mutex, cola ni serialización.


## 17. Checkpoint — misión reconstruida bloqueada no admite un segundo PREPARED

Se cerraron dos guards relacionados en `recordPrepared()`:

1. El paso solicitado debe estar `planned` tanto en el plan almacenado como en `reconstructNexoMissionFromSnapshot()`. La regresión con un attempt terminal caller-supplied para `repair_agent_state` demostró que el plan viejo podía seguir `planned` mientras la reconstrucción ya bloqueaba el paso.
2. La misión reconstruida también debe estar `planned`. Un PREPARED sin resolver hace que la reconstrucción marque la misión `blocked / reconcile_prepared_effect`; ahora no puede admitirse otro paso de esa misión. El branch de PREPARED existente permanece antes de los guards y conserva `prepared_existing / NEXO_EFFECT_OUTCOME_UNKNOWN`, no redispatch.

El segundo hueco se reprodujo con una misión de dos pasos independientes: step-1 se preparaba, step-2 se intentaba preparar con la misión reconstruida bloqueada. El guard ahora devuelve `NEXO_PREPARED_MISSION_NOT_RUNNABLE` y no modifica la revisión ni el journal. Se actualizaron expectativas de pruebas de dependencia para reflejar que el guard de misión canónica se activa antes que el guard más específico de dependencias.

HEAD código+tests `c59a825771af3376a88a9bc212e9967cf1d75f1d`. SUCCESS: bounded admission/restart run 39195866238, STEP 4 run 39195866236, STEP 5 run 39195866226, crash cuts run 39195866266. Chronicle native/effect-settlement SUCCESS en código funcional `3ebb037...` (runs 39195543682, 39195543685). Enlaces en STATUS.

**Auditoría completada; no repetir:** `reconcilePrepared()` conserva observaciones genéricas como `reconciled_observed` no terminales, y `recordOutcome()` rechaza outcomes mientras el efecto siga unresolved salvo Chronicle completo. Los crash-cut tests cubren esta frontera.

**Siguiente paso:** comprobar el contrato de fallos de lectura de `store.loadCurrent()` en `recordPrepared()`, `recordExecutionLineage()` y `recordOutcome()`, comparado con los catches fail-closed de `recordMission()` y `reconcilePrepared()`.


## 18. Checkpoint — replay de PREPARED tras reinicio conserva la obligación UNKNOWN

Se añadió una regresión que crea la misión, confirma un PREPARED y vuelve a abrir el owner desde el mismo archivo. Repetir la misma operación con la revisión vigente devuelve `prepared_existing / NEXO_EFFECT_OUTCOME_UNKNOWN`, `preparedCommitted=false`, `authorization=NOT_EVALUATED`; revisión permanece en 2, el journal conserva exactamente una entrada `prepared` y la misma idempotency key. No se redispatcha ni se trata como una nueva admisión.

Test SHA `376f2d984eeb969d25c2c797a40037a72a6a5c6b`. Bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS (runs 39195866238, 39195866236, 39195866226, 39195866266). La lógica funcional de misión/step gate permanece en `3ebb037f53409df9681f5ed01b6458e915e36a29`; el último commit sólo añade prueba de continuidad tras reinicio.

**Auditoría de reconciliación revisada:** `reconcilePrepared()` persiste observaciones genéricas como `reconciled_observed`, no las trata como settlement terminal; `recordOutcome()` rechaza los estados `prepared`, `settled_observed` y `reconciled_observed` salvo el contrato Chronicle completo. Los crash-cut tests ya cubren que un outcome prematuro no añade attempt y que la observación genérica sigue no-terminal. No se hizo cambio en esa frontera porque la conducta observada es fail-closed y coherente con el contrato.


## 19. Frontera Chronicle restart/lost-response ya cubierta — no duplicar

La prueba existente `tests/nexo/chronicle-runtime.test.mjs` ya cubre el reinicio tras append antes de settlement, el reinicio después de settlement/outcome y la pérdida de respuesta tras el commit del outcome. En el último caso, la reconstrucción devuelve step `completed` sólo porque el settlement Chronicle canónico y el outcome terminal están persistidos; el replay posterior devuelve `completed` sin redispatch. La migración también cubre settlement sin outcome y mantiene el paso blocked. Se comprobó el código/test existente; no se añadió otra regresión redundante.

**Siguiente paso:** revisar el contrato de errores de lectura de continuidad en `recordPrepared()`, `recordExecutionLineage()` y `recordOutcome()`; comparar con `recordMission()`/`reconcilePrepared()` y probar antes de cambiar.


## 19. Checkpoint — outcome Chronicle se reconstruye tras pérdida de respuesta

Se añadió una aserción en el crash cut de `tests/nexo/chronicle-runtime.test.mjs`: después de que `recordOutcome()` persiste completion pero se pierde la respuesta, el owner se reabre y la reconstrucción devuelve `status: reconstructed`, paso `completed`, misión global `awaiting_verification`. La recuperación del runtime no vuelve a despachar; el contador permanece en uno.

SHA test `467cea28706a54b2f30e320485c1d7b3f57e2692`. Chronicle native, bounded admission, STEP 4 y STEP 5 SUCCESS (runs 39196004121, 39196004116, 39196004098, 39196004164). Crash cuts de continuidad SUCCESS en SHA `376f2d...` (run 39195866266); no hubo cambios de código funcional.

**Siguiente paso:** comprobar si la evidencia/result de outcome Chronicle está vinculada al settlement canónico y no sólo el estado terminal. Exigir reproducción antes de cambiar el contrato.


## 20. Checkpoint — outcome Chronicle vinculado al settlement persistido

Contrato compartido `isValidNexoChronicleOutcomeEvidence()` exige `verified === true`, el tipo canónico `nexo-chronicle-persisted-invariant`, y `source/observedRevision` iguales al settlement Chronicle validado. `recordOutcome()` rechaza metadata desatada con `NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH`; reconstrucción bloquea outcomes desatados y distingue identidad de operación incorrecta con `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`. El test positivo confirma que la pareja settlement+outcome correcta sigue reconstruyendo el paso completed.

Fix funcional `c9be5ee5f931d2a873cca32e2dd0b81c33010396`; SHA final de pruebas `9ca094242d25fced843b7d5595f9cff6e0d82ee3`. Bounded admission, crash cuts, STEP 4 y STEP 5 SUCCESS (runs 39196527692, 39196527776, 39196527671, 39196527814). No es autenticación criptográfica ni prueba de causalidad.

**Siguiente paso:** probar si evidence Chronicle acepta campos extra no ligados al settlement y, si la regresión confirma exposición de claims falsos en `step.result`, acotar el shape canónico sin ampliar el contrato innecesariamente.


## 21. Checkpoint — shape exacto de evidencia terminal Chronicle

`isValidNexoChronicleOutcomeEvidence()` limita el outcome a las claves `verified`, `kind`, `source`, `observedRevision`; `kind` es `nexo-chronicle-persisted-invariant`, y source/revision coinciden con el settlement. El owner bloquea claims extra con `NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH`; reconstrucción usa el mismo contrato. El runtime real confirma que la evidencia generada usa exactamente ese shape.

Fix funcional `4a976b76ece07e1c168761cb6bd29ec5b420ab00`; SHA final de pruebas `d4936c965eb926b3e61eb7ecbe3f9becf58925ca`. Bounded admission, Chronicle native, STEP 4 y STEP 5 SUCCESS (runs 39196697574, 39196697543, 39196697516, 39196697496); crash cuts SUCCESS en código `4a976...` (run 39196649127).

**Siguiente paso:** auditar uso externo de `settlement.evidence`; sólo endurecer su shape si puede afectar una decisión o resultado público.


## 20. Checkpoint — read failure bloquea owner writes y runtime dispatch (2026-10-19)

En `continuity-owner.mjs`, `recordPrepared()`, `recordExecutionLineage()` y `recordOutcome()` convierten fallo de `store.loadCurrent()` en respuesta estructurada fail-closed. Conservan el código del error si existe, marcan `continuity_read_failed`, dejan autorización sin evaluar y no intentan commit.

**Pruebas nuevas y evidencia:**
- `tests/nexo/continuity-contract.test.mjs`: los tres métodos bloquean con lectura fallida; `commitIfCurrent` no se invoca.
- `tests/nexo/chronicle-runtime.test.mjs`: una falla en la lectura de admisión PREPARED bloquea el runtime antes del adapter: cero dispatches y commits.
- SHA código+pruebas `d200472052b3795b2b7e6ab7d1cd4fae5e71ae91`. CI SUCCESS: Chronicle native 39196910123, bounded admission/restart 39196910131, STEP 4 39196910145 y STEP 5 39196910180. Enlaces en STATUS.
- La ejecución intermedia de la regresión de continuidad falló por la excepción no normalizada; después se añadió el manejo explícito en los tres métodos y la misma prueba pasó. Esto fue una brecha real, no un fallo ocultado.

La auditoría de Chronicle outcome quedó también cerrada en el código actual: la evidencia del outcome debe coincidir con source/revision del settlement canónico, y replay exige esa misma correspondencia. Es un control de coherencia persistida, **no** una firma, una procedencia autenticada ni un goal verifier.

**Siguiente frontera:** auditar la reconstrucción de snapshots con entradas terminales inconsistentes en `effectJournal` genérico. Leer schema + reconstrucción + tests antes de modificar; preservar compatibilidad legacy deliberada. No inventar estados nuevos ni extender a runtime legacy. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## 22. Checkpoint — identidad y effectJournal desconocido

La admisión rechaza step IDs duplicados y mission/step IDs con `:`; el contrato de snapshot rechaza mission IDs duplicados y step IDs duplicados persistidos. La reconstrucción bloquea estados de effectJournal fuera de `prepared/settled_observed/reconciled_observed`, incluidas entradas desconocidas huérfanas. Pruebas de admission, snapshot y replay; bounded admission/restart, STEP 4, STEP 5 y crash cuts SUCCESS en SHA `a2bd5ba8cdfdbb4f2129337a13c071b7d18b47d3` (runs 39197181542, 39197181545, 39197181644, 39197181585).

Siguiente paso: auditar `dependsOn` persistido (self-reference, IDs inexistentes/duplicados y ciclos) y comprobar si algún grafo inválido puede volverse ejecutable. No crear scheduler ni estados nuevos.


## 21. Checkpoint — replay fail-closed de effectJournal desconocido/desanclado

Se comprobó con una regresión que un `settled_observed` Chronicle huérfano (step inexistente) podía ser ignorado y dejar el paso planned. También se comprobó que un estado de journal desconocido no debe equivaler a ausencia de efectos. `reconstructNexoMissionFromSnapshot()` ahora bloquea cuando:

- el estado de journal es desconocido y se atribuye a la misión actual, o su identidad de misión falta/no existe;
- un estado reconocido (`prepared`, `settled_observed`, `reconciled_observed`) no tiene misión propietaria o no enlaza con step/action/target canónicos.

La lectura legacy sigue permitida; no se inventa un nuevo estado de ejecución ni se transforma la observación en completion. Las pruebas cubren estado desconocido ligado, estado desconocido huérfano y settlement Chronicle con step ausente. El test de settlement huérfano falló antes del fix y pasó después.

SHA código+tests `e31547f17764c18fd0bf2fe39dab1ebfc5748686`; bounded admission/restart 39197251854, STEP 4 39197251843, STEP 5 39197251835, crash cuts 39197251844: SUCCESS. Ver enlaces en STATUS.

**Siguiente paso:** revisar el contrato de reconstrucción para attempts `completed` no-Chronicle: asegurar que el historial terminal no se acepte si falta vínculo suficiente a un contrato de completion, sin fingir un goal verifier general. M0 sigue INCOMPLETO; efectos protegidos STOP.


## 22. Checkpoint — replay de journal e input mission sin getters

HEAD código+pruebas `82826e12bfd88c07aeabda05f6a14605f85bda33`; CI SUCCESS en bounded admission/restart (39197558462), STEP 4 (39197558524), STEP 5 (39197558514) y crash cuts (39197558507).

Se reforzó reconstrucción para no ignorar estados de journal desconocidos, huérfanos o desanclados; ahora exige vínculo de misión/step/action/target para estados conocidos. La regresión nueva demuestra que una entrada `settled_observed` Chronicle con IDs de step coincidentes pero action/target ajenos no puede dejar el step runnable. Se conserva la compatibilidad de carga legacy, pero las obligaciones ambiguas reconstruyen como blocked.

Además, `missionRecord()` valida la forma del input con `assertContractInput` antes de acceder a `mission.missionId`, rechazando getters caller-supplied sin ejecutarlos. La primera ejecución del test falló antes del guard; el fix pasó los cuatro workflows en `24e44be...`, y las pruebas de journal pasaron en `82826e...`.

**Siguiente paso:** auditar si la validación de la misión también protege sus objetos anidados (`steps`, `target`, `dependsOn`) antes de leerlos y clonarlos. No duplicar la validación top-level ni ampliar contratos sin test que reproduzca ejecución de getter o ambigüedad.


## 23. Checkpoint — getter anidado de step no se ejecuta durante admission

Test SHA `bceabad2e1f62a23ba7586ba27b2977841d6b778`; código funcional `82826e12bfd88c07aeabda05f6a14605f85bda33`. La nueva regresión añade un getter en `step.target` y verifica que `recordNexoMissionInSnapshot()` lo rechaza como `NEXO_MISSION_CONTEXT_INVALID` sin invocarlo. Esto confirma que `assertContractInput(mission)` protege también propiedades anidadas antes del recorrido y clonación.

SUCCESS: bounded admission/restart 39197679061, STEP 4 39197679021 y STEP 5 39197678998. Crash cuts siguen SUCCESS en código+tests previos 82826e... (39197558507); el cambio actual es sólo una prueba en continuity-contract.

**Siguiente paso:** reproducir si valores no persistibles (función/símbolo/ciclo) pueden atravesar mission admission y producir un error no estructurado o CAS innecesario. No modificar el helper global sin caso reproducible y análisis de compatibilidad.


## 24. Checkpoint — dependencia sparse rechazada antes de recorrer el grafo

La regresión `dependsOn: new Array(1)` reprodujo un `TypeError` en `visitDependencyGraph()`: `.some()` omite huecos sparse. `missionRecord()` ahora cuenta índices canónicos dentro de `dependencies.length`; también rechaza un hueco ocultado por una propiedad extra. El input se rechaza como `NEXO_MISSION_CONTEXT_INVALID` antes de persistir.

SHA código+pruebas `3683e4708e5ff97b65fb7b0fe0cd6f154a732745`; código `360b0dafbebc700477bc30879ef4175da81c904b`. SUCCESS: bounded admission 39197992970, STEP 4 39197992902, STEP 5 39197992893. Crash cuts SUCCESS con el código funcional 360b0daf..., run 39197974984.

Siguiente paso: probar valores no persistibles dentro de mission/target sin ampliar globalmente el contrato antes de tener reproducción y evaluación de compatibilidad.

## 25. Checkpoint actual — rechazar arrays sparse de dependencias (2026-10-19)

### Hallazgo reproducido

`missionRecord()` recorría `step.dependsOn` con `.some()`. JavaScript omite los huecos de arrays sparse: `new Array(1)` podía superar el filtro inicial y provocar un `TypeError` más tarde durante `visitDependencyGraph()`, en vez de un rechazo contractual estable. La primera defensa basada en contar todas las keys tampoco bastaba: un array sparse con propiedad extra podía enmascarar el hueco.

### Fix + prueba

- Fix funcional `360b0dafbebc700477bc30879ef4175da81c904b`: contar sólo claves que representan índices canónicos dentro de `dependencies.length`; comparar el número de índices reales con la longitud antes de recorrer el grafo.
- Regresión inicial `21aafeb87dbc42d1e8144d1aad51ab60073fd190` y segunda regresión en test SHA `3683e4708e5ff97b65fb7b0fe0cd6f154a732745`: tanto `new Array(1)` como una matriz con hueco y propiedad extra deben fallar con `NEXO_MISSION_CONTEXT_INVALID`.
- CI SUCCESS: bounded admission/restart [39197992970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992970), STEP 4 [39197992902](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992902), STEP 5 [39197992893](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992893), crash cuts [39197974984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197974984).
- Commits después del SHA test `3683e470...` sólo actualizaron documentación; HEAD de rama actual `b171cf23...`.

### Siguiente trabajo exacto

Seguir la frontera que ya registra `NEXO_NCS/STATUS.md`: investigar si valores no persistibles dentro de `mission`/`target` (funciones, símbolos, ciclos y valores numéricos no finitos) pueden superar admisión o producir una excepción no estructurada/CAS innecesario. Leer `assertContractInput()` y `missionRecord()` en `src/nexo/core/continuity-operations.mjs`, junto con `tests/nexo/continuity-contract.test.mjs` y las pruebas de bounded admission. Primero crear/reproducir un caso concreto, después determinar si el helper ya lo rechaza y sólo entonces modificar. No ampliar globalmente el helper ni duplicar los tests de getters/sparse arrays ya cerrados.

**Reglas de continuación:** no reabrir Chronicle settlement/restart, read-failure handling, reconstructed mission PREPARED gate, IDs de journal, nested accessors o sparse dependencies salvo evidencia nueva. No cambiar estado/contrato por intuición. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.


## 20. Recuperación de parada y continuidad exacta (2026-10-19)

El usuario informó que el chat se detuvo en esta secuencia: “Ajustando tus pruebas local_analysis / Aclaraste la prueba heredada / Actualizaste la documentación / Actualizó el estado / Revisaste la reconciliación / Vinculó evidencia”. Se recupera así, sin reiniciar investigación:

- **Pruebas:** el estado final visible en el repo es el rechazo de dependencias `dependsOn` sparse. Se cubre `new Array(1)` y también un hueco que intenta ocultarse con propiedad extra. El código devuelve `NEXO_MISSION_CONTEXT_INVALID` antes del recorrido del grafo. No volver a abrir esta regresión si no hay evidencia nueva.
- **Documentación:** `STATUS.md`, este handoff y el contrato de resultados reflejan el checkpoint. HEAD documental verificado `1e9f3badf026c00131b2207101d32652c2042f2c`; SHA código+tests `3683e4708e5ff97b65fb7b0fe0cd6f154a732745`; fix funcional `360b0dafbebc700477bc30879ef4175da81c904b`.
- **Reconciliación/evidencia Chronicle:** el trabajo previo ligó el outcome a la evidencia del settlement canónico y se añadió reconstrucción condicionada por esa misma evidencia. Está fuera de la siguiente frontera; no repetir ni debilitarlo. La línea actual continúa con validación de datos de entrada en misión, no con una nueva investigación de Chronicle.

CI final para el SHA de prueba: bounded admission/restart run 39197992970, STEP 4 run 39197992902, STEP 5 run 39197992893. Crash cuts SUCCESS run 39197974984 en el SHA funcional `360b0daf...`; no afirmar que ese run corresponde al SHA de prueba posterior.

**Próximo paso obligatorio:** inspeccionar `assertContractInput()` y `missionRecord()` en `src/nexo/core/continuity-operations.mjs`; revisar `tests/nexo/continuity-contract.test.mjs` y bounded admission; probar funciones, símbolos, ciclos y valores numéricos no finitos antes de cambiar el helper. La regla es reproducir primero y mantener el alcance mínimo. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## 20. Recuperación de las últimas respuestas interrumpidas (2026-10-19)

El usuario reportó que se borró el texto de cuatro respuestas que se detuvieron. No es posible recuperar palabra por palabra los mensajes que la interfaz ya eliminó, pero se contrastó el rastro visible, los archivos de la rama y GitHub Actions para reconstruir el trabajo verificable y guardar el punto de continuidad.

### Los tres puntos recuperados

1. **Pruebas / análisis local:** se estaba ajustando y aclarando una regresión heredada de admisión de misión. Se probó que `dependsOn: new Array(1)` podía esquivar validación con `.some()` y terminar en error al recorrer el grafo. La validación ahora cuenta los índices de array reales y rechaza también un hueco enmascarado por una propiedad extra. Resultado: `NEXO_MISSION_CONTEXT_INVALID` antes de recorrer dependencias. Fix funcional `360b0dafbebc700477bc30879ef4175da81c904b`; test final `3683e4708e5ff97b65fb7b0fe0cd6f154a732745`.
2. **Documentación / estado:** STATUS, este handoff y el contrato de resultados reflejan la frontera dense-dependency, el SHA y la diferencia entre código validado y commits documentales. Se corrigió el SHA documental stale: antes de guardar esta actualización, GitHub confirmó HEAD `1260dfad73f144c0264dcf22bc0b601e018fe5d4`. Al volver a entrar, leer el HEAD actual directamente; los nuevos commits de documentación cambian ese valor, pero no el SHA de código/test.
3. **Reconciliación / vinculación de evidencia Chronicle:** la línea previa vinculó la evidencia terminal del outcome Chronicle al settlement persistido exacto. `isValidNexoChronicleOutcomeEvidence()` exige el settlement estructuralmente válido y metadata de outcome que coincide con source/revision del settlement; la reconstrucción sólo considera completed el intento `chronicle_append` cuando esa evidencia corresponde al settlement. Se anotó que estas comprobaciones son consistencia estructural, no procedencia autenticada ni garantía de durabilidad. No reabrir sin una nueva regresión concreta.

### Evidencia CI que se conserva

- Test SHA `3683e4708e5ff97b65fb7b0fe0cd6f154a732745`: bounded admission/restart [39197992970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992970), STEP 4 [39197992902](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992902), STEP 5 [39197992893](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992893) SUCCESS.
- Fix funcional `360b0dafbebc700477bc30879ef4175da81c904b`: crash cuts [39197974984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197974984) SUCCESS. No afirmar que ese workflow se ejecutó en el SHA posterior `3683e470...`.
- Hubo runs fallidos durante iteraciones intermedias; no son el resultado final. El checkpoint final indicado arriba pasó sus workflows focales.

### Instrucciones obligatorias para el chat nuevo

- Misión exclusiva: **M0**. No reiniciar auditorías cerradas ni desviarse a M1, STEP 7, Lúmina, interfaz, `index.html`, runtime legacy o despliegue.
- Leer `NEXO_NCS/STATUS.md` primero y verificar HEAD actual de `ncs-clean-architecture`; después este handoff y `NEXO_NCS/BUILD/NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md`.
- Continuar por la siguiente frontera registrada: `assertContractInput()` / `missionRecord()` frente a funciones, símbolos, ciclos y valores numéricos no finitos en misión/target. Inspeccionar tests y contrato antes de editar; reproducir primero; sólo aplicar un fix con regresión concreta.
- No declarar M0 completo: permanece INCOMPLETO y los efectos protegidos permanecen STOP. Nexo y Lúmina continúan separados.


## 7. Continuidad añadida — auditoría de consistencia de misión

Se revisó la frontera indicada en STATUS: estados almacenados/reconstruidos de misión, paso, dependencias y `objective`. No se encontró un defecto nuevo que justifique un cambio de código. La rama exige estado almacenado `planned`, misión/paso reconstruidos `planned`, y dependencias `completed`; claims de completion sin respaldo canónico quedan bloqueados. `objective` no autoriza ejecución y se recalcula en la reconstrucción normal.

La comparación GitHub de `d4544e74e8568cf7d5221ccbc42e48daacd1e9f5...ncs-clean-architecture` muestra tres commits documentales y ningún cambio de código posterior a ese checkpoint.

### Siguiente frontera exacta
Auditar el límite entre observación de estado y verificación del objetivo, sin habilitar acciones nuevas. `scripts/nexo-repair-settlement.mjs` consume un snapshot leído con `loadStateStrict()`; `src/nexo/adapters/persisted-repair-observation.mjs` clasifica invariantes presentes/ausentes/unknown. Esos datos son evidencia diagnóstica: no prueban causalidad, autoridad de origen ni atomicidad con el store de continuidad. Antes de conectar un goal verifier, establecer qué componente es propietario canónico del estado observado y qué contrato independiente puede respaldarlo. No integrar Lúmina, simulación, UI ni reparaciones al runtime Nexo como atajo. Si no existe fuente independiente suficiente, conservar STOP y documentar el bloqueo; no fabricar un verificador.

No se hicieron cambios de código ni se ejecutaron nuevas pruebas en esta auditoría; no atribuirle un CI nuevo. M0 sigue INCOMPLETO.


## 8. Hallazgo M0 adicional — lock incompleto tras fallo de owner.json (PR #106)

Inspeccionando stores independientes, se detectó la misma secuencia en Continuity Store y Chronicle Store: `mkdir(<store>.lock)` puede funcionar y la escritura siguiente de `owner.json` puede fallar. Antes del fix, el catch trataba el error como fallo normal de adquisición y no limpiaba el directorio que la llamada acababa de crear. Ese lock sin owner podía hacer esperar a escritores posteriores y acabar como `*_LOCK_STALE_RECOVERY_REQUIRED` tras el umbral de antigüedad.

Se añadieron tests con fallo `EIO` inyectado y se cambió `acquireLock()` en ambos stores para limpiar el directorio cuando la misma llamada creó el lock pero no logró establecer owner.json, conservando el error original. No se toca la política de stale-locks ni se reclama automáticamente un lock ajeno.

PR #106: https://github.com/snowdenxrp/aldea-ia/pull/106 — rama `ncs-m0-lock-acquisition-cleanup`. No está integrado y no debe marcarse como cerrado hasta verificar CI. No pudimos ejecutar pruebas localmente; verificar Actions y corregir cualquier fallo antes de merge. Si las pruebas pasan, solicitar revisión del diff y luego integrar por el flujo normal. M0 sigue INCOMPLETO, efectos protegidos STOP, Nexo/Lúmina separados.
