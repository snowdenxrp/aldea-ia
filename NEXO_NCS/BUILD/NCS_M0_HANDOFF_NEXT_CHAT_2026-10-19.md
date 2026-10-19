# NCS / Nexo — handoff de continuidad M0
Fecha: 2026-10-19
Repositorio: https://github.com/snowdenxrp/aldea-ia
Rama: `ncs-clean-architecture`
Último SHA de código validado por CI: `fbfda4b7be4de8cf2e3ae1b0d7903f0287cf5b6e`
Último SHA de código: `fbfda4b7be4de8cf2e3ae1b0d7903f0287cf5b6e`; SHA final de pruebas: `ac8e4bc88c04c2f1ea257a58ecf224d867dd4b94`

## 0. Instrucción principal al chat nuevo

**La misión sigue siendo M0.** No reiniciar investigaciones ya cerradas, no volver a auditar por costumbre los mismos contratos, y no desviarse a M1, STEP 7, Lúmina, interfaz, `index.html`, runtime antiguo ni despliegue. Empezar leyendo, en este orden:

1. `NEXO_NCS/STATUS.md` (puerta de entrada única).
2. Este handoff: `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19.md`.
3. `NEXO_NCS/BUILD/NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md`.
4. Sólo los archivos y pruebas nombrados en la siguiente frontera, antes de modificar código.

No reabrir research ya cerrado salvo que aparezca evidencia nueva y concreta. Continuar desde el HEAD actual; no recrear commits ni reimplementar arreglos que ya están presentes.

## 1. Estado confirmado

- HEAD de rama al guardar: `0e689f32df5463c751bcd32ef29b4af66b5c20a1`, commit documental.
- Comparación GitHub entre código/pruebas validados `ddf1034f4ef605dc68e0e7eb5debe4f61cecbd72` y HEAD: **3 commits posteriores, todos documentación**; no hay cambios de código/pruebas posteriores a la base validada.
- Código base anterior a la regresión Chronicle: `005338b91656e61eee3ffbef105c306e2af496b2`.
- Último conjunto de pruebas focales disparado por la regresión Chronicle (SHA `ddf1034...`): crash cuts SUCCESS run `39190786403`; effect/settlement SUCCESS `39190786395`; STEP 4 SUCCESS `39190786373`; STEP 5 SUCCESS `39190786377`.
- Los seis workflows focales habían pasado en `005338...`: Chronicle `39190771042`, bounded admission/restart `39190771031`, STEP 4 `39190771037`, STEP 5 `39190771029`, crash cuts `39190771021`, effect/settlement `39190771114`.
- Por tanto, Chronicle y bounded admission pasaron en el SHA de código `005338...`; el SHA `ddf103...` agregó la regresión de replay parcial y los cuatro workflows activados pasaron. No describirlo como una ejecución única de seis workflows en `ddf103...`.
- Estado de misión: **M0 INCOMPLETO**. Efectos protegidos en **STOP**. Ningún PASS implica que el runtime real esté autorizado o listo.

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
