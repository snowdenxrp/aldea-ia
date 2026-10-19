# NCS / Nexo — handoff de continuidad M0
Fecha: 2026-10-19
Repositorio: https://github.com/snowdenxrp/aldea-ia
Rama: `ncs-clean-architecture`
Último SHA de código + regresión validado por CI: `b21896e893a1b739bbfa511f76c3a215298a73e6`
Último SHA de código: `f3a54153d3574f559aa32f1c56d093e1152b4842`; SHA de código + regresión corregida: `b21896e893a1b739bbfa511f76c3a215298a73e6`

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
