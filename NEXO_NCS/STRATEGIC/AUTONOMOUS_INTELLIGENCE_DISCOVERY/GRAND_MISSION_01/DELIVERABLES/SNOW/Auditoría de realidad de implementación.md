# GRAND MISSION 01 — Auditoría de realidad de implementación (Implementation Reality Audit)

- **Alcance:** código, pruebas, CI e integraciones en `snowdenxrp/aldea-ia`, rama `nexo-mission-02-pdf-2026-11-05`, HEAD `c5724aa60914e71c352fd5f793be636c9c6703cb`. **Modalidad READ-ONLY:** sin ejecución de código, pruebas ni CI; sin commits. El clon quedó sin modificar (`git status --porcelain` vacío antes y después).
- **Método:** lectura completa de cada módulo; rastreos `grep` de integración en `src/` y `scripts/`; lectura completa de las 20 entradas de `tests/nexo/`; inspección de las 23 definiciones de workflow; evidencia de CI solo documental (`NEXO_NCS/PROOF/*`, `NEXO_NCS/STATUS.md`). AB104/AB105 y TLC/Kafka: solo existencia, sin reapertura.
- **Convención:** `IMPLEMENTED` y `TESTED` se clasifican por separado. Ninguna capacidad se declara funcional completa sin integración demostrada. Etiquetas: DECIDED / IMPLEMENTED / PARTIAL / TESTED / CI-VERIFIED / PROPOSAL / UNKNOWN / STOP (definidas en `GRAND_MISSION_01_SOURCE_REGISTER.md` §0).

## 1. Módulos inspeccionados (resumen factual)

### 1.1 `src/nexo/core/contracts.mjs` — 5.883 B, 163 L, blob `294eb400…`
Exports: `createClaimEnvelope`, `createCandidate`, `createValidationResult`, `createCommitResult`, `createOutcome`, `createAuthorityResult`; vocabularios cerrados (`TERMINAL_OUTCOMES`, `VALIDATION_STATES`, `COMMIT_STATES`, `AUTHORITY_STATES`); inmutabilidad profunda (`immutable`, `detachedImmutable`). Contrato tipado de política: `requiredPolicyRef` (L42–49) exige objeto con `id`/`semanticVersion`/`hash` strings no vacíos; `createPolicyContext` (L50–73) exige además `scope` definido, `validity.status ∈ {VALID, FAIL, UNKNOWN}`, `resolved.dependencies` array y `resolutionProvenance` array. **Hueco de forma:** `createClaimEnvelope` (L75–93) copia `authoritativeReads`, `dependencies`, `predicateDependencies`, `derivedProvenance`, `causalInputs`, `sourceProvenance` como arrays opacos (L84–87) **sin validar la forma de los elementos**; todo `policyContext` no nulo se enruta por `createPolicyContext` (L88). Sin puertos inyectados (módulo puro).

### 1.2 `src/nexo/core/protected-transition.mjs` — 4.088 B, 135 L, blob `00a4fa06…`
Export: `executeProtectedTransition({ports, proposal, state, expectedRevision})`. Puertos inyectados obligatorios: `claimBuilder.build`, `authorityGate.check`, `snapshotIsolator.isolate`, `candidateExecutor.execute`, `finalSemanticValidator.validate`, `conditionalCommit.commit`, `outcomeClassifier.classify` (con aserción de integridad del clasificador). Flujo implementado fail-closed: construir claim → verificar identidad → autoridad (`STOP`/`UNKNOWN` cortocircuitan antes de aislar/ejecutar) → aislar snapshot → ejecutar candidato + `assertCandidate` → validar (inválido → `UNKNOWN`; no-PASS → `SEMANTIC_CONFLICT`/`UNKNOWN`) → commit (excepción → `UNKNOWN`) → clasificar (`COMMITTED → SAFE_COMMIT`, `CONDITIONAL_CONFLICT → STALE_CANDIDATE`, resto → `UNKNOWN`). **No invoca** los puertos `reconciliation` ni `effectBoundary` de `ownership.mjs`; el flujo termina en la clasificación. Llama a `finalSemanticValidator.validate(candidate)` **con un solo argumento** (L90), sin contexto de validación.

### 1.3 `src/nexo/core/final-semantic-validator.mjs` — 5.100 B, 153 L, blob `853be0d3…`
Export: `createFinalSemanticValidator()` → `{validate(candidate, context = {})}`. Comprobaciones: identidad de claim (`context.claimId === claim.claimId`), igualdad de `target` y `targetIncarnation` por `JSON.stringify`, `policyContext` presente e igual por serialización (**sin validar la estructura tipada `policyRef`**), `context.requirements` array obligatorio (L74–76), ids requeridos desde `authoritativeReads + dependencies + predicateDependencies + causalInputs` filtrados por `item && typeof item.id === "string" && item.required !== false` (L78–85), rechazo de evidencia no autoritativa (`authoritative !== true` o `source ∈ {cache, helper, derived}`), agregación missing → `UNKNOWN`, failed → `FAIL`, unknown → `UNKNOWN`, todo satisfecho → `PASS`.

### 1.4 `src/nexo/core/observation.mjs` — 2.153 B, 62 L, blob `bff04910…`
Exports: `createObservationEnvelope`, `createMissionCandidate`, `ADMISSION`. Sobre de observación con `source`/`code` obligatorios; candidato de misión con `admission ∈ {ADMITTED, NOT_ADMITTED, UNKNOWN}` (defecto `UNKNOWN`). La admisión es **declarada por el llamante**; el módulo no la decide.

### 1.5 `src/nexo/core/observation-equivalence.mjs` — 2.702 B, 82 L, blob `c5980233…`
Export: `evaluateNegativeResourceEquivalence(a, b)`. Solo maneja observaciones `code === "NEGATIVE_RESOURCE"`; compara `source`/`code`, `resourceType`, `amount`; exige `resource_incarnation`, `freshness` y `causal_dependency` presentes y no vacíos, si no → `UNKNOWN` (con comentario explícito: la ausencia de proveniencia no prueba equivalencia). Diferencias → `NON_EQUIVALENT`; todo coincide → `EQUIVALENT`. Conservador por diseño.

### 1.6 `src/nexo/core/outcome-classifier.mjs` — 386 B, 12 L, blob `1f65f9d8…`
Export: `createOutcomeClassifier()` → `classify({kind, reasons, evidence})`. Valida `kind ∈ OUTCOMES` y devuelve `createOutcome`. Sin lógica de decisión: paso de validación puro.

### 1.7 `src/nexo/core/ownership.mjs` — 1.923 B, 54 L, blob `c7f9e267…`
Export: `createCorePorts({...})`. Registro de 10 puertos con **defaults `NOT_IMPLEMENTED`** que lanzan `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED` (`proposal`, `claimBuilder`, `authorityGate`, `snapshotIsolator`, `candidateExecutor`, `finalSemanticValidator`, `conditionalCommit`, `outcomeClassifier`, `reconciliation`, `effectBoundary`). Superficie de contrato; sin implementaciones productivas propias.

### 1.8 `src/nexo/core/policy-context-resolver.mjs` — 2.318 B, 48 L, blob `024b385d…`
Exports: `resolvePolicyContext(input)`, `POLICY_CONTEXT_RESOLUTION`. Exige `policyRef.{id, semanticVersion, hash}` strings no vacíos y `scope` definido; lee cinco chequeos **declarados por el llamante** (`identity`, `applicability`, `dependencies`, `temporal`, `provenance`) con `status ∈ {PASS, FAIL, UNKNOWN}`; agrega `FAIL > UNKNOWN > VALID`. **Sin criptografía:** `hash` es solo chequeo de string no vacío; no hay verificación de firma, recomputación de hash ni autenticidad del contenido. Los estados son afirmaciones del llamante, no hechos verificados.

### 1.9 `src/nexo/core/reconciliation.mjs` — 1.147 B, 21 L, blob `be295ef6…`
Exports: `createReconciliationCase({boundary, claimId})`, `createReconciler()` → `reconcile({reconciliationCase, evidence})`. Caso con `boundary` string no vacío y `claimId` opcional; `reconcile` devuelve `INVALID` sin boundary, exige `evidence` array, busca el **primer** ítem con `authoritative === true && typeof outcome === "string"` (L17): sin él → `UNRESOLVED`; con él → `RESOLVED` con ese outcome. **No vincula la evidencia al caso** (no compara boundary/claimId de la evidencia), ni comprueba claim, objetivo, identidad del efecto, vigencia ni procedencia.

### 1.10 `src/nexo/adapters/conditional-commit-persist-state.mjs` — 1.715 B, 54 L, blob `9a707677…`
Export: `createPersistStateConditionalCommit({persistState, statePath, clock})` → `commit(candidate)`. Reenvía `persistState(statePath, candidate.state, clock(), {expectedRevision, stateRevision: expectedRevision + 1})` → `COMMITTED`; `STATE_REVISION_CONFLICT` → `CONDITIONAL_CONFLICT`; cualquier otro error → `UNKNOWN`. Adaptador fino y correcto sobre la primitiva inyectada; el estado del candidato es opaco.

### 1.11 Apoyo Lúmina (no foco, pero parte de la realidad)
- `src/discovery.js` (65 L, blob `db8972b6…`): descubrimiento de acciones de agentes Lúmina con confianza acotada [0.1, 0.8] y evidencia acotada a 500 ítems. Funcionalidad **real** de cognición de habitantes, integrada en el tick; **no** es capacidad de Nexo.
- `src/planning.js` (144 L, blob `057f5c69…`): planificación reactiva por reglas con replanning tras 3 atascos y cooldowns. Real, de Lúmina; **no** es el planificador Nexo (que vive en `src/nexo/orchestrator.js`).
- `scripts/assistants.mjs` (83 L, blob `ecacf579…`): carga estado → asistentes (debugger/tester/analista/squad/estructural) → misión Nexo vía `buildNexoMission` → `recordNexoPlan` en `simulation.nexoMemory` → aprendizaje de asistentes → persistencia optimista. Es (con `simulate.mjs`) la única ruta que mantiene viva la memoria Nexo embebida.
- `src/nexo/dependency_closure_evaluator.py` (9.680 B) y `src/nexo/formal_correspondence_checker.py` (4.321 B): evaluadores deterministas (cierre transitivo con techo I0–I5; detección de huecos de mapeo formal). Ambos declaran en su propio código que **no conceden autoridad ni ejecutan efectos**; `formally_equivalent` es siempre `False` por diseño (detectan huecos, no prueban equivalencia).

## 2. Mapa de pruebas (`tests/nexo/`, 20 entradas; lectura sin ejecución)

| Archivo | Qué cubre |
|---|---|
| `core-contracts.test.mjs` | Aislamiento/inmutabilidad; claim con dependencias **string** (`"world.revision"`…) L9–15; contrato tipado `policyContext` positivo + 5 negativos; defaults `NOT_IMPLEMENTED` de puertos. |
| `final-semantic-validator.test.mjs` | PASS/FAIL/UNKNOWN; binding de identidad/target/incarnation; evidencia no autoritativa → UNKNOWN; **casos `policyVersion` L141–160 (obsoletos — veredicto A)**. |
| `protected-transition.test.mjs` | Composición con puertos stub: SAFE_COMMIT con conteo de llamadas; FAIL → SEMANTIC_CONFLICT sin commit; autoridad UNKNOWN/STOP cortocircuitan; conflicto → STALE_CANDIDATE; validador UNKNOWN; sonda de integridad del clasificador; identidad de candidato; excepción de commit → UNKNOWN. **El validador es un stub que ignora argumentos (L38–43).** |
| `conditional-commit-persist-state.test.mjs` | Integración con `persistState` real en tmp: SAFE_COMMIT + revisión persistida; commit stale → CONDITIONAL_CONFLICT sin tocar estado. Validador stub (L56–60). |
| `outcome-classifier.test.mjs` | Los seis outcomes pasan; kind inválido rechazado; inmutabilidad. |
| `policy-context-resolver.test.mjs` | Agregación VALID/FAIL/UNKNOWN; status inválido lanza; resultado sin claves authorize/commit/safeCommit; detachment de `policyRef`. |
| `reconciliation.test.mjs` | UNRESOLVED sin evidencia autoritativa; RESOLVED con ella (aunque `outcome: "UNKNOWN"`); INVALID sin caso; sin commit/execute/authorize. |
| `observation.test.mjs` | Sobre inmutable; candidato NOT_ADMITTED; admisión inválida lanza; defecto UNKNOWN. |
| `step-7-negative-resource-equivalence.test.mjs` | NON_EQUIVALENT por amount/tipo/source; UNKNOWN por dimensiones sin establecer. |
| `step-7-negative-resource-handoff.test.mjs` | Equivalencia UNKNOWN → admisión UNKNOWN (no se convierte en admitida); candidato sin claves authority/commit/safeCommit. |
| `step-7-provenance.test.mjs` | Misma acción+target ≠ equivalencia observacional; proveniencia adjunta por candidato; admisión explícita/acotada; candidato no autoritativo. |
| `orchestrator.test.mjs` | `buildNexoMission` v4, bloqueo por dependencia, begin/advance/verify/plan, replan con linaje, whitelist (`shell_exec` → `inspect_and_collect_evidence`). Cubre `src/nexo/orchestrator.js`. |
| `effect-adapter.test.mjs` | Pre/postcondición, idempotencia por clave, efecto parcial, outcome ambiguo → `EFFECT_OUTCOME_UNKNOWN` + reconciliación, concurrencia, orden prepared-intent. Cubre `src/nexo/effect-adapter.js`. |
| `effect-intent-persistence.test.mjs` | `persistPreparedIntent` antes de ejecutar; fallo de persistencia → `EFFECT_INTENT_PERSISTENCE_FAILED`. |
| `runtime.test.mjs` | `executeNexoStep`/`executeLuminaNexoStep`: completado, bloqueado sin handler, idempotencia tras reinicio y crash-window, fallo → `needs_replan`, replan con linaje, multi-paso, replay serializado. Cubre `runtime.js` + `simulation-adapter.js`. |
| `runtime-concurrency.test.mjs` | Dos pasos concurrentes convergen sin perder outcomes. |
| `restart-reconstruction.test.mjs` | `reconstructNexoMission`: completado no se degrada; ejecución sin outcome ≠ completado; frontera mixta con fallo dominante → `needs_replan`. |
| `simulation-adapter.test.mjs` | `createLuminaEffectAdapter`: reparaciones reales, whitelist, recurso agotado → `LUMINA_ACTION_FAILED` sin revisión. |
| `simulation-restart-persistence.test.mjs` | Persistencia real → reinicio → reconstrucción; conflictos de revisión; carrera de dos procesos (1 committed / 1 conflict); fallos inyectados write/rename; lock huérfano tras SIGKILL (61 s). |
| `persistence-lock-worker.mjs` | Worker del test de carrera. |
| `test_dependency_closure_evaluator.py` | Cierre transitivo, trust-root compartido → techo I2, UNKNOWN → I1, COMPROMISED → I0, fingerprint determinista, fixture PG-009. |
| `test_formal_correspondence_checker.py` | Cobertura parcial detectada; cobertura stale detectada; fixture sin huecos; trust-root/authority sin mapear → inconsistente. |

**Composición de `npm test`:** ~40 tests de auditoría de Lúmina en `tests/` raíz + subconjunto `tests/nexo` (orchestrator, effect-adapter, effect-intent-persistence, runtime, runtime-concurrency, simulation-adapter, restart-reconstruction, simulation-restart-persistence, protected-transition). **Fuera de `npm test`:** core-contracts, final-semantic-validator, outcome-classifier, policy-context-resolver, observation, reconciliation, step-7-*, conditional-commit-persist-state y ambos `.py` (solo en sus workflows dedicados o en ninguno).

## 3. Workflows (disparo y comandos; sin ejecutar)

| Workflow | Disparo | Corre |
|---|---|---|
| `nexo-deterministic-tests.yml` | push a `main` + dispatch | `npm install`; `npm test` |
| `nexo-step-3a-isolation.yml` | push a `main` + dispatch | core-contracts, protected-transition, conditional-commit-persist-state |
| `nexo-step-4-semantic-validation.yml` | push paths core/tests/BUILD STEP_4 + dispatch | final-semantic-validator.test |
| `nexo-step-5-outcome-classification.yml` | push paths + dispatch | outcome-classifier + protected-transition |
| `nexo-step-6-reconciliation.yml` | push paths + dispatch | reconciliation.test |
| `nexo-step-7-policy-context.yml` | push paths + dispatch | core-contracts.test |
| `nexo-step-7-policy-context-resolver.yml` | push paths + dispatch | policy-context-resolver.test |
| `nexo-step-7-observation-contract.yml` | **solo dispatch** | observation.test |
| `nexo-step-7-negative-resource-equivalence.yml` | solo dispatch | equivalence.test |
| `nexo-step-7-negative-resource-handoff.yml` | solo dispatch | handoff.test |
| `nexo-step-7-semantic-provenance.yml` | solo dispatch | provenance.test |
| `nexo-m0-acceptance.yml` | push a `ncs-clean-architecture` + paths | suite M0 (varios tests referenciados **no existen en esta rama**: pertenecen a `ncs-clean-architecture`) |
| `nexo-m0-repair-crash-cuts.yml` | push a `ncs-clean-architecture` + paths + dispatch | suite repair (mismos tests ausentes en esta rama) |
| `lumina-simulation.yml` | cada 5 min + push a `main` | `npm test`; `npm run assistants`; `npm run simulate`; commit de estado a `main` |
| `lumina-longevity-audit-v2.yml` | push a rama de auditoría / PR a `main` | longevity-audit-v2, `npm test`, system-audit |
| AB104/AB105 (7 archivos) + `ab65-gate.yml` | existencia registrada, **sin reapertura** | SANY/TLC/Kafka G0 (fuera de alcance) |

**Ningún workflow ejecuta** los dos chequeadores Python (rastreo de `python|pytest|unittest` en `.github/workflows/`: solo hits en `ab65-gate.yml` y heredocs inline de los harnesses Kafka G0).

## 4. Veredictos A–E (evidencia file:línea, HEAD `c5724aa6`; verificados por Snow con grep/sed directo)

### A. Validación semántica — **CONFIRMADO en ambas mitades**
- **A1. Incompatibilidad `policyRef` tipado vs `policyVersion` en prueba: CONFIRMADA (estática).** `contracts.mjs` exige `policyRef` objeto con `id`/`semanticVersion`/`hash` (L42–49) y `createClaimEnvelope` enruta todo `policyContext` no nulo por `createPolicyContext` (L88), que lanza `TypeError` si falta `policyRef` (L51). `final-semantic-validator.test.mjs` L141–160 construye claims con `policyContext: {policyVersion: 2}` (L142, L144, L150, L152, L158) — a HEAD, ejecutar ese archivo lanzaría `TypeError: policyContext.policyRef is required` al construir el claim, **antes** de cualquier aserción (inferencia estática directa; no ejecutado por la modalidad READ-ONLY). Historia: la prueba se añadió en `8cb6ea83` (commit con CI exitoso registrado); el contrato tipado llegó después en `fd8c3ad0`; la prueba nunca se actualizó. Además, el validador solo compara `policyContext` por igualdad JSON (L57–72) y **no** aplica el contrato tipado: por la vía del validador pasan formas que la capa de contratos rechazaría. **Cierre:** actualizar la prueba a `policyRef` tipado (o eliminar los casos obsoletos) + run de CI sobre un SHA que contenga ambas cosas.
- **A2. Fail-open con dependencias string: CONFIRMADO.** `createClaimEnvelope` acepta `dependencies`/`predicateDependencies`/`authoritativeReads`/`causalInputs` como arrays opacos sin validar elementos (`contracts.mjs` L84–87); la propia `core-contracts.test.mjs` L9–15 crea un claim con strings (`"world.revision"`, `"target"`, `"eligibility"`). En `final-semantic-validator.mjs` L78–85, los ids requeridos se derivan con `.filter(item => item && typeof item.id === "string" && item.required !== false)`: un string **no tiene `.id` y se descarta silenciosamente** — nunca es requerido, nunca falta, nunca falla. El validador puede devolver `PASS` sin haber comprobado ninguna dependencia string. La prueba del validador usa objetos `{id, required: true}` (L12–27), así que la ruta string no está cubierta. **Cierre:** validar la forma de los elementos en la capa de contratos (rechazar strings o mapearlos a `{id}` explícito) + prueba que fije el comportamiento.

### B. Reconciliación — **CONFIRMADO: solo clasificación parcial**
`reconciliation.mjs` (21 líneas) resuelve buscando el primer ítem de evidencia con `authoritative === true && typeof outcome === "string"` (L17) y devuelve `RESOLVED` con ese outcome (L19); sin evidencia así → `UNRESOLVED` (L18); sin boundary → `INVALID`. **No comprueba:** coincidencia boundary/claimId entre evidencia y caso (el caso los almacena, L5–9, pero `reconcile` nunca los compara), claim, objetivo, identidad del efecto, vigencia/expiración, procedencia, ni unicidad (gana el primero). La prueba (19 líneas) solo fija UNRESOLVED/RESOLVED/INVALID y la ausencia de commit/execute/authorize. Es un prototipo de clasificación, no reconciliación semántica. El propio `NEXO_NCS/STATUS.md` (STEP 6) lo describe igual: «resolves only from explicitly authoritative evidence… has no commit, authorization, execution, retry, queue, or external-effect capability». **Cierre:** reconciliación que vincule evidencia a caso/claim/boundary/objetivo/identidad del efecto/vigencia/procedencia, con pruebas de no-coincidencia.

### C. Política y confianza — **CONFIRMADO: solo estructura/estados declarados**
`policy-context-resolver.mjs` verifica presencia y tipo de `policyRef.id/semanticVersion/hash` (`hash` = solo string no vacío), `scope` definido y los `status` PASS/FAIL/UNKNOWN **declarados por el llamante** en cinco chequeos, agregando FAIL > UNKNOWN > VALID. No hay import de `node:crypto`, ni verificación de firma, ni recomputación de hash, ni comprobación de autenticidad/integridad del contenido de la política (los únicos hits de `hash` en `src/nexo/core/` son el nombre del campo). Resolución estructural/declarativa, **no** verificación criptográfica. **Cierre:** verificación real de integridad/autenticidad de la política referenciada (firma o recomputación de hash contra contenido), o degradar explícitamente el claim a «estructura declarada» en todos los documentos que lo citan. **STOP** para cualquier afirmación que requiera confianza criptográfica de la política.

### D. Transición protegida — **CONFIRMADO: piezas aisladas, integración productiva ausente**
- **Implementado:** orquestación fail-closed completa en `protected-transition.mjs` (autoridad antes de aislar/ejecutar, validación antes de commit, clasificación terminal con aserción de integridad) y adaptador de commit real pero fino sobre `persistState` inyectado.
- **Dependiente de puertos inyectados:** todo. `ownership.mjs` define 10 puertos con default `NOT_IMPLEMENTED`. `executeProtectedTransition` exige que el llamante suministre claimBuilder, authorityGate, snapshotIsolator, candidateExecutor, finalSemanticValidator, conditionalCommit y outcomeClassifier.
- **Integración efectiva: NO demostrada en código productivo.** Rastreo de los símbolos del núcleo en `src/` + `scripts/` fuera de `core/`/`adapters/`: **cero coincidencias**. Las únicas composiciones están en `tests/nexo/` con dobles. Tres huecos concretos: (1) el llamante pasa `validate(candidate)` sin contexto (L90) pero el validador real exige `context.claimId === claim.claimId` o devuelve FAIL — cablear el validador real tal cual produciría siempre SEMANTIC_CONFLICT; no existe en `src/` ningún wrapper que ligue el contexto; (2) los puertos `reconciliation` y `effectBoundary` existen en `ownership.mjs` pero `executeProtectedTransition` nunca los invoca — no hay paso de reconciliación ni de frontera de efectos en el flujo; (3) ni siquiera las pruebas integran el validador real (stubs PASS en ambas suites de composición). La pila que sí ejecuta (`runtime.js`, `effect-adapter.js`, `simulation-adapter.js`, `orchestrator.js`, cableada en `scripts/assistants.mjs`) es una **ruta paralela acoplada a Lúmina** que no usa el núcleo de transición protegida. **Cierre:** cableado productivo con puertos reales (autoridad, aislamiento, validador con contexto, commit, reconciliación, frontera de efectos) + prueba de integración extremo a extremo sin stubs en los eslabones críticos.

### E. Pruebas y CI — **evidencia por niveles (solo histórica, en repo)**
| Nivel | Estado en el repo |
|---|---|
| Prueba existe | Sí: 20 entradas en `tests/nexo/`, con blobs en §2. |
| Ejecutada localmente | **UNKNOWN**: el repo no contiene logs de ejecución local; los banners `PASS` son código de aserción, no evidencia de ejecución. |
| Ejecutada en CI | Documentada para STEP 3A/3C/4/5/6. STEP 7 observation/equivalence/handoff/provenance: workflows **dispatch-only** → sin evidencia de ejecución automática; `STEP_7_RUNTIME_VERIFICATION_2026-10-08.md` L13 declara que el run ID no se recuperó y «no se inventa»; `STATUS.md` L142 registra ejecución manual reportada PASS sin run ID. |
| CI exitoso en SHA concreto | **Sí, histórico:** STEP 3A — commit `6c06a6fe`, job `113178605145`, success; STEP 3C — run `37740178286`, job `113188835156`, commit `de859aa0`, success; STEP 4 — run `37784767180`, job `113336577540`, commit `8cb6ea83`, success; STEP 5 — run `37785361553`, job `113338604779`, commit `8ac970ed`, success (primer run `37785123024` falló por import de harness, corregido en el mismo commit); STEP 6 — run `37813930630`, job `113437564891`, commit `838d0538`, success, comando `node tests/nexo/reconciliation.test.mjs`. |
| CI exitoso en HEAD actual (`c5724aa6`) | **NO hay evidencia en el repo.** HEAD es un commit «Add files via upload» del 2026-11-10, posterior a todos los PROOF citados. |
| Verificación formal | **UNKNOWN en este alcance:** workflows TLA+ SANY/TLC (AB104/AB105, solo existencia). Los dos chequeadores Python son código con pruebas, pero ningún workflow los ejecuta; `formally_equivalent` es `False` por diseño. |

**Regla aplicada:** la existencia de una prueba no demuestra que se haya ejecutado; un CI exitoso en otro commit no demuestra el estado del HEAD actual. Los run/job IDs son afirmaciones documentales del repo, **no** recuperados vía API de GitHub en esta auditoría.

## 5. Matriz de realidad por capacidad (HEAD `c5724aa6`)

| Capacidad | Etiqueta | Base (evidencia) | Limitación / riesgo | Próximo requisito de verificación |
|---|---|---|---|---|
| Contratos tipados e inmutabilidad (`contracts.mjs`) | **IMPLEMENTED + TESTED**; CI-VERIFIED @ `6c06a6fe` | `core-contracts.test.mjs` L78–99; PROOF STEP 3A | Arrays de claim sin validación de forma de elementos (A2) | Validación de forma de elementos + prueba |
| Orquestación de transición protegida | **PARTIAL** | Composición implementada y testeada con stubs; puertos default NOT_IMPLEMENTED; sin cableado productivo; hueco de contexto del validador; reconciliation/effectBoundary sin invocar | Falsa apariencia de cadena completa | Cableado productivo + integración sin stubs |
| Validación semántica final | **PARTIAL** | Lógica implementada; prueba obsoleta a HEAD (A1) y fail-open string (A2); CI solo @ `8cb6ea83` (anterior al contrato tipado) | PASS sin comprobar dependencias string | Actualizar prueba a `policyRef` + CI en SHA nuevo |
| Clasificación de outcomes | **IMPLEMENTED + TESTED**; CI-VERIFIED @ `8ac970ed` | `outcome-classifier.mjs`; PROOF STEP 5 | Sin lógica de decisión (por diseño) | — (suficiente para su rol actual) |
| Reconciliación | **PARTIAL** (clasificación del primer ítem autoritativo; sin binding); CI-VERIFIED @ `838d0538` solo para ese contrato limitado | `reconciliation.mjs` L11–21 | RESOLVED sin vínculo a caso/claim/efecto/vigencia/procedencia | Reconciliación semántica vinculada + pruebas de no-coincidencia |
| Resolución de contexto de política (estructura) | **IMPLEMENTED + TESTED** | `policy-context-resolver.mjs` L21–48 | Estados declarados por el llamante | Verificación criptográfica (ver fila siguiente) |
| Verificación de integridad/autenticidad de política (criptográfica) | **UNKNOWN** (ausente) — **STOP** para afirmaciones que la requieran | Solo chequeos de string; sin `node:crypto` | Confundir resolución estructural con confianza | Firma o recomputación de hash contra contenido |
| Sobre de observación + candidato de misión | **IMPLEMENTED + TESTED**; CI **UNKNOWN** (dispatch-only; PASS manual sin run ID) | `observation.mjs`; 3 archivos de prueba | Admisión declarada por el llamante | Run de CI con ID sobre SHA congelado |
| Equivalencia de recurso negativo | **IMPLEMENTED + TESTED**; CI **UNKNOWN** (dispatch-only) | `observation-equivalence.mjs` (UNKNOWN conservador) | Alcance limitado a `NEGATIVE_RESOURCE` | Ampliar alcance o declarar el límite en cada cita |
| Adaptador conditional-commit | **IMPLEMENTED + TESTED** (con `persistState` real en tmp); CI-VERIFIED @ `de859aa0` | Adaptador; PROOF STEP 3C | Validador stub en la prueba de integración | Integración con validador real |
| Superficie de puertos de propiedad (`ownership.mjs`) | **PROPOSAL** como capacidad (contrato definido; sin implementaciones productivas) | Defaults NOT_IMPLEMENTED | — | Implementaciones reales por puerto |
| Pila runtime/orchestrator/effect-adapter (acoplada a Lúmina) | **IMPLEMENTED + TESTED** (subconjunto en `npm test` → CI en push a `main`) | Tests runtime/effect/simulation/restart/concurrency; cableado en `assistants.mjs` | Acoplamiento a Lúmina (ver §6); outcomes del runtime no llegan al sobre por rutas de script | Desacoplamiento progresivo (roadmap) |
| Heurísticas discovery/planning de Lúmina | **IMPLEMENTED** (heurística, lado Lúmina); TESTED **UNKNOWN** en `tests/nexo` | `discovery.js`, `planning.js` | No son capacidades de Nexo | No atribuirlas a Nexo |
| Evaluador de cierre de dependencias (Python) | **IMPLEMENTED + TESTS EXIST**; CI **UNKNOWN** | `dependency_closure_evaluator.py`; fixture PG-009 | Ningún workflow lo ejecuta | Workflow o ejecución documentada |
| Checker de correspondencia formal (Python) | **IMPLEMENTED + TESTS EXIST**; CI **UNKNOWN** | `formally_equivalent` siempre `False` por diseño | Detecta huecos; no prueba equivalencia | Ídem |
| Cadena protegida extremo a extremo en producción | **UNKNOWN** (no cableada a HEAD) | Veredicto D | — | Cableado + prueba extremo a extremo |
| Verificación formal TLA+ | **UNKNOWN** en este alcance | Workflows AB104/AB105 existen; no reabiertos | — | Fuera de alcance de esta misión |

## 6. Acoplamiento Lúmina ↔ Nexo (síntesis verificada)

La raíz del repo es **Lúmina — Aldea IA** (simulación persistente con habitantes Alex y Bruno, cliente web, estado `world-state.json` avanzando cada 5 minutos en CI); Nexo monta su capa de misiones sobre ella. Acoplamientos en código (15 inventariados en `notes/lumina-discovery.md` §10; los decisivos):

1. **`simulation.nexoMemory` nace dentro del objeto simulación de Lúmina** (`src/simulation.js:40`, vía `createLearningMemory`). El runtime Nexo la usa por defecto (`src/nexo/runtime.js:53-54`) y el journal de efectos se alimenta de ella (`runtime.js:55`).
2. **Un solo sobre de persistencia** (`world-state.json` vía `persistState` con lock + `stateRevision` + temp-rename) transporta mundo + agentes + eventos + `nexoMemory` (`scripts/simulate.mjs:108,156`). `nexoEffectRevision` **no** se serializa; los outcomes del runtime no llegan al sobre por las rutas de script (`assistants`, `simulate`): el sobre conserva 50 planes de misión (tope) y **0** attempts/executions/effectJournal persistidos.
3. **Dos almacenes divergentes:** `.lumina-assistant-memory.json` (runs/lessons/patterns del aprendizaje de asistentes; su sub-objeto `nexo` está **vacío por construcción** — `recordNexoPlan` se aplica a la memoria embebida, nunca a este archivo) vs `world-state.nexoMemory`. Sin contrato canónico unificado (P111 lo deja abierto).
4. **Riesgos documentados y aún presentes en código:** `applyState` no clona en profundidad `nexoMemory` (alias mutable con el snapshot, P112); `loadState` devuelve estado por defecto indistinguible (`nexoMemory: null`, revisión 0) sin procedencia; mutación del handler y `persistState` son pasos separados sin atomicidad demostrada. Los 4 documentos de `docs/nexo` (2026-09-25) son **RESEARCH ONLY** con cortes C0–C8 y frontera OwnerFence/PreparedIntent propuesta, **sin implementar**.
5. **Lo que Lúmina aporta a Nexo hoy:** mundo/agentes como objeto de misión; motor canónico `src/actions.js` (reusado con whitelist de 15 acciones); sobre de persistencia único; workflow `lumina-simulation.yml` (cada 5 min) como infraestructura de continuidad de facto — **Nexo no tiene proceso propio en el repo**; su persistencia depende de que Lúmina siga corriendo en CI. La app de navegador arranca con memoria vacía y no carga la persistida.
6. **Lo que NO es de Nexo:** `discovery.js` (65 L) y `planning.js` (144 L) son cognición **real** de los habitantes Lúmina (descubrimiento de acciones con confianza/evidencia; planificación por reglas con replanning tras 3 atascos), integradas en el tick y con tests propios. La planificación de misiones Nexo vive en `src/nexo/orchestrator.js`. Atribuir `discovery.js`/`planning.js` a Nexo sería un error de atribución.

**Conclusión de la fase:** existe código real y probado en partes (contratos, commit condicional, pila runtime acoplada a Lúmina, evaluadores Python), pero **ninguna capacidad está demostrada como funcional completa de extremo a extremo**: la cadena protegida no está cableada en producción, la reconciliación es clasificación parcial, la política no tiene verificación criptográfica, la prueba de validación semántica está rota a HEAD (A1), hay un fail-open demostrado (A2), y no hay evidencia de CI sobre el HEAD actual. La implementación que sí ejecuta es la ruta paralela acoplada a Lúmina, no el núcleo de transición protegida.

## 7. Limitaciones de acceso

- READ-ONLY estricto: sin ejecución de código, pruebas ni CI. El fallo de A1 es inferencia estática directa desde `contracts.mjs` L51 + L88, no una ejecución observada.
- Snapshot histórico: rama `nexo-mission-02-pdf-2026-11-05` en `c5724aa6` (2026-11-10). Otras ramas (`ncs-clean-architecture`, investigación M0) fuera de alcance; los workflows `nexo-m0-acceptance`/`nexo-m0-repair-crash-cuts` referencian tests ausentes en esta rama.
- Evidencia de CI documental (PROOF/STATUS del repo); **no** recuperada independientemente vía API de GitHub en esta auditoría.
- Sin logs de ejecución local en el repo: «ejecutada localmente» es UNKNOWN para todo.
- AB104/AB105, TLC/Kafka: solo existencia registrada, sin reapertura.
- El clon quedó sin modificar.
