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

## 4. Siguiente paso técnico obligatorio

1. Añadir una prueba de reinicio/replay que opere sobre la **misma misión owner-backed** y demuestre cómo se representa un outcome final sin contradecir un journal `settled_observed`; si el contrato no puede expresarlo sin conflar estados, documentar y resolver esa brecha antes de cambiar runtime.
2. Definir el adaptador mínimo de runtime que recibe solo `missionId/stepId`, recarga la misión canónica y deriva acción/target del snapshot. No aceptar acción, target ni evidencia de autoridad del caller.
3. Mantener dispatch genérico apagado por defecto. Solo habilitar las tres reparaciones permitidas a través de la sesión ya probada; no reutilizarla para acciones no idempotentes.
4. Probar CAS conflictivo, restart después de PREPARED, restart después de persistir entorno, replay después de `settled_observed`, estado UNKNOWN y separación de archivos a través de la entrada real de proceso.
5. Solo tras esas pruebas, reemplazar una operación legacy a la vez y retirar una lectura/escritura legacy únicamente cuando el test demuestre que no queda caller dependiente.

## 5. Evidencia y límites

- HEAD de rama consultado directamente: `1cee895229e6980b8f142571a28a820fed7eef04`.
- El test de proceso CLI más reciente con evidencia disponible es [CI 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529), SHA de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`, SUCCESS. Ese SHA precede al HEAD documental inspeccionado; **no** atribuir ese PASS al HEAD actual.
- Esta auditoría es de código y contratos existentes. No se hizo un nuevo CI de código porque no se modificó código; la documentación añadida tampoco está cubierta por el run anterior.
- M0 permanece abierto. No se ha probado un cutover del runtime genérico, un despliegue en el teléfono ni atomicidad entre el store Nexo y el estado de Lúmina.


## Evidencia posterior — falsa promoción tras restart (2026-10-18)

La prueba en commit `fd2331e8d71afbbf0f19ea978d552a89087c1dc6` añade un caso concreto al paso 1 de la siguiente tarea: tras `settled_observed`, el owner rechaza un `completed` basado solo en etiquetas `verified/kind/source` del caller y mantiene la misión bloqueada al reconstruirla desde un owner reabierto.

CI exacto sobre ese SHA: [repair crash cuts 39145754425](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754425) SUCCESS; [STEP 4 39145754371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754371) SUCCESS; [STEP 5 39145754375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754375) SUCCESS. Estos resultados reemplazan la nota de “sin CI exacto” para esta regresión específica; no cambian la evaluación del resto de esta auditoría.

El contrato aún carece de una transición basada en verificación independiente de objetivo que pueda representar completion sin atribuir causalidad al repair. No usar `settled_observed` como prueba de completion y no cortar el runtime genérico hasta resolver este contrato y probar el primer caller migrado.
