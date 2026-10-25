# NCS — handoff de continuidad — 2026-10-24 — D1 manifest

## Puerta de entrada obligatoria para el siguiente chat

Seguir el orden del proyecto: `NEXO_NCS/STATUS.md → MASTER/CORE → BUILD → trabajo actual`. No iniciar automáticamente investigaciones antiguas ni repetir el censo ya hecho. STATUS.md fue consultado en esta sesión y su primer checkpoint visible aún refleja el checkpoint D1-S0 anterior; este handoff más reciente supersede sus instrucciones de “revisar artefactos” solo en lo que respecta al avance documental D1 aquí descrito. No se afirma que STATUS.md haya sido actualizado.

## Punto exacto alcanzado

Se creó y verificó en GitHub el manifiesto documental:
- [NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md](NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md)
- Commit: `325bc58c490aaacb7cf75152f4113b4019ad73ad`
- Blob: `9b5f9796cd19a1355decf027700926ee4ec45260`
- Rama: `ncs-clean-architecture`

El documento consolida el ledger de entrypoints, referencias de `package.json`, CLI padre/hijo, rutas de consulta y preview, fábricas de stores, excepciones de `assistants.mjs` y `simulate.mjs`, y los filtros/comandos de los workflows. Está verificado por lectura posterior en GitHub.

## Conclusiones documentales

- La cobertura de `tests/nexo/entrypoint.test.mjs` es parcial: las importaciones estáticas no cierran `import()`, `require`, cargadores calculados, acceso por rutas a fábricas/owners ni aristas de procesos hijos.
- `scripts/nexo.mjs` ejecuta `scripts/nexo-chronicle-session.mjs` mediante `spawnSync`; el hijo también es ejecutable por separado. El contrato de admisión de raíz del hijo y la prevención de doble bloqueo/deadlock siguen abiertos.
- Consultas y previews cargan snapshots; D2 debe decidir si toda lectura de snapshot canónico entra en la garantía de admisión acotada. El ledger recomienda incluirlas si se pretende prometer un único snapshot/heap vivo acotado por instancia.
- Los workflows son explícitos y con filtros de rutas; eso no demuestra que cubran los nuevos archivos de admisión. No se modificaron.
- `assistants.mjs` y `simulate.mjs` son EXPLICIT_EXCEPTION solo como clasificación de diseño, no están bloqueados en runtime.
- Aristas dinámicas, consumidores externos, destinos generados y guards no inspeccionados permanecen `UNKNOWN/BLOCKED`.

## Restricciones y estado canónico

- D0-C1…D0-C4 aceptadas como contrato de diseño; D1-S0 aceptada: diseño e implementación son gates separados.
- La aceptación no cierra D0 técnico ni D1 y no autoriza implementación.
- No cambiar runtime/tests/workflows ni ejecutar CI sin autorización explícita separada.
- M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- No hubo cambios de runtime/tests/workflows y no se ejecutaron pruebas/CI en este paso.

## Siguiente paso

Continuar el cierre documental D1 desde el manifiesto nuevo, sin rehacer el inventario de 2.982 entradas: comprobar de forma reproducible el conjunto de guards de ejecución directa y formas de carga de módulos del snapshot exacto; clasificar cada arista. Toda incertidumbre sigue `UNKNOWN/BLOCKED`. Después cerrar los contratos de diseño pendientes y los criterios de aceptación, sin declarar D1 cerrado hasta que se demuestre.

## ADDENDUM — revisión de discrepancias D0/D1 del 2026-10-24

Después del manifiesto se inspeccionaron los archivos exactos de la rama `ncs-clean-architecture` y se registró esta revisión:
- [NCS_M0_D0_D1_SOURCE_CONTRACT_DISCREPANCY_REVIEW_2026-10-24.md](NCS_M0_D0_D1_SOURCE_CONTRACT_DISCREPANCY_REVIEW_2026-10-24.md)
- Commit de creación: `2970a6388acd0f1a30fa866abba171ddc43c961e` (confirmar lectura del archivo y SHA de blob antes de citar como verificado).

Hallazgo nuevo y concreto: el contrato aceptado D0-C1..C4 aún no coincide con el código actual. `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs` aceptan rutas de almacenes (`--continuity`, `--chronicle`) y el hijo expone flags de inicialización; los parsers revisados no implementan `--root`. `continuity-queries.mjs` crea directamente un store desde `continuityPath`; las fábricas de store siguen basadas en rutas. La prueba de entrypoint actual verifica ese comportamiento previo, no el contrato nuevo aceptado. Esto es una discrepancia documental/runtime observada, no un permiso para corregir el código sin autorización.

También se verificó que los workflows tienen filtros de rutas explícitos y ejecutan listas selectivas de pruebas; no ejecutan todo `npm test`. No se debe afirmar que el contrato root está cubierto por CI.

Siguiente paso recomendado: completar el diseño de cómo una raíz única se traduce a rutas de stores, cómo se separa bootstrap de operación normal, cómo consultas/previews participan en la admisión, y cómo el hijo Chronicle valida el contexto sin doble bloqueo. Mantener UNKNOWN/BLOCKED para consumidores no inspeccionados. No tocar runtime/tests/workflows ni ejecutar CI; la implementación sigue sin autorización explícita.

Estado canónico sin cambios: M0 `INCOMPLETO`; D0 técnico/evidencia `OPEN`; D1-DESIGN `OPEN`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## ADDENDUM — contrato de instancia propuesto, no aceptado — 2026-10-24

Se intentó crear un documento separado con la propuesta del contrato de raíz; la operación fue bloqueada por los controles de la herramienta, así que no se afirma que ese archivo exista. Para conservar el trabajo, este resumen queda aquí.

**Propuesta técnica para revisión, no decisión del propietario:**
1. Cada CLI/API público recibe una sola raíz explícita; no recibe rutas arbitrarias de Continuity y Chronicle.
2. Operación normal exige directorio existente y estado válido; no inicializa, repara, migra ni elige rutas heredadas.
3. Canonicalizar la raíz según una política explícita de symlinks antes de derivar rutas de stores y locks.
4. Las lecturas y escrituras públicas usan la misma admisión y derivación de rutas. D2 debe definir la vida útil/alcance del snapshot antes de prometer un límite de memoria por instancia.
5. El hijo Chronicle valida la raíz cuando se ejecuta directamente; la invocación padre/hijo debe definir quién posee cada lock y evitar doble adquisición. Un booleano enviado por el caller no demuestra por sí solo que hubo admisión.
6. Bootstrap debe ser una operación separada, con precondiciones y comportamiento explícito ante inicialización parcial; operación normal no crea ni repara almacenes.
7. Las fábricas de bajo nivel pueden seguir siendo primitivas internas/de test, pero cada caller de producción debe clasificarse y las pruebas arquitectónicas deben detectar bypasses.
8. La cobertura de arquitectura debe incluir importaciones estáticas/dinámicas, `require`, loaders calculados, acceso a factories/owners, destinos de procesos hijos y filtros/comandos de workflows.

**Decisiones pendientes:** mapping y nombres exactos de los stores; si cada operación necesita ambos stores; política de symlinks/nombres reservados/colisiones; validez de raíz vacía; semántica de bootstrap parcial; coordinación de lock padre/hijo; alcance de queries/previews; límite público/API frente a primitivas internas; consumidores externos y wrappers de compatibilidad. No inventar nombres de archivos ni inferir que consumidores externos no existen.

**Criterio:** D0-C1..C4 aceptadas establecen política general, pero no resuelven todos estos detalles. D0 técnico y D1-DESIGN siguen OPEN. Esto no autoriza implementación.

La creación del documento separado fue bloqueada; este addendum es el registro persistente disponible. No hubo cambios en runtime/tests/workflows ni ejecución de tests/CI. Estado: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP.


## Addendum: reconciliation with existing root contract (2026-10-24)

Correction to the previous addendum: the existing root contract DOES contain a candidate layout; “not selected” meant not finalized as a technical decision, not that no proposal exists.

Existing candidate layout in `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` (blob `bac9493af98c3f86001e323dab153bdee78b5f31`):
- `<root>/continuity.json`: canonical Continuity store.
- `<root>/chronicle.json`: canonical Chronicle store.
- `<root>/.nexo-instance.lock/`: candidate shared-admission directory with `owner.json`; explicitly a D2 candidate, not implemented.
- Existing per-store temporary and lock naming/protocols remain unchanged in this phase.

The contract says not to add a data subdirectory, manifest, bootstrap marker, or persistent config file without proving it necessary. The shared-lock name is illustrative and does not authorize a second lock system.

The root contract already proposes operation-wide cross-process admission before protected snapshots are loaded, release in finally, UNKNOWN/blocked on acquisition/ownership/release uncertainty, preservation of current per-store lock order, and no production query/preview bypass. Low-level store factories may remain for tests/internal composition, while production enters through an instance/admission boundary.

Next work is reconciliation, not reinvention: distinguish accepted D0-C1..C4 policy from still-open technical details; close bootstrap/partial-store semantics; settle parent/child admission and lock ownership; align query/preview scope with D2 snapshot/resource guarantees; map all production entrypoints to future architecture tests. No implementation or tests authorized.

No runtime/tests/workflows changed; no tests/CI run. D0 technical/evidence OPEN; D1-DESIGN OPEN; D2/D3 OPEN; M0 INCOMPLETO; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.


## Addendum 4 — decision/evidence reconciliation (2026-10-24)

Re-read and cross-checked the current D0 decision ledger, owner decision/evidence matrix, D0↔D1 cross-check, D1 entrypoint manifest, and root-contract document. This pass resolves the status classification below; it does not promote proposals into owner decisions.

### Already accepted by owner (policy only)
- D0-C1: one explicit `--root <directory>`; no environment override or legacy fallback in the first version.
- D0-C2: normal operation requires an existing valid root; bootstrap is separate/explicit; normal operation does not create or repair root/stores.
- D0-C3: canonicalize the existing root before deriving paths; define symlink/reserved-name/collision behavior; ambiguous states block; no broad hostile-filesystem-race claim.
- D0-C4: no automatic migration, dual-write, or heuristic merge; migration/cutover excluded from M0 operational scope until the target environment is identified and verifiable.
- `assistants.mjs` and `simulate.mjs` stay outside the ordinary Nexo instance route pending a defined and verified boundary. This is a design exclusion, not a runtime block.
- D1-S0: design and implementation are separate gates; no architectural test implementation before design freeze and separate authorization.

### Established source facts, not approvals
- Main CLI and directly executable Chronicle child currently use separate store paths; `--root` is not implemented.
- Queries/previews load snapshots via path-oriented store APIs.
- Existing store locks differ observably in release retry and local uncertain-release tracking; `loadCurrent()` does not itself acquire the store lock.
- Chronicle currently delegates to a child process. Existing static import checks do not close dynamic/computed loading or all process edges.
- Current workflow path filters select limited test sets and do not prove root-admission coverage.

### Still open; do not infer owner acceptance
- Exact public argument/error compatibility and any adapter for legacy callers.
- Bootstrap authorization and exact partial-bootstrap/recovery semantics.
- Detailed root/store/lock/owner symlink and reserved-path policy, collision cases, and no-mutation behavior.
- Root-lock primitive choice (independent vs shared primitive with policy adapters), owner/release protocol, stale handling, and re-admission after uncertain release.
- Final snapshot/admission scope for queries and previews, and how any aggregate memory promise is measured.
- Complete transitive production caller graph and proof that assistants/simulate/external consumers cannot bypass the ordinary boundary.
- Environment-specific migration/cutover/rollback; no target environment has been verified.

### Dependency order
1. Finish D1-DESIGN source-edge closure and classify unresolved edges UNKNOWN/BLOCKED; do not repeat the already completed full tree census.
2. Freeze D2-C1…C4 together: snapshot scope, root-lock primitive, uncertain release/re-admission, and Chronicle parent/child ownership. Preserve existing store-lock behavior unless an explicit characterized design proves a safe adapter.
3. Resolve bootstrap and partial-state behavior without treating a missing/empty store as authority to initialize.
4. Keep D3 cutover blocked until a real target environment and quiescence/rollback evidence exist.
5. Only after a separate explicit implementation authorization: write adversarial architecture tests, update relevant workflow filters, run tests/CI, and bind results to the exact resulting commit SHA.

No runtime/tests/workflows changed and no tests/CI run in this pass. The handoff itself is the only file targeted for documentation continuity; `STATUS.md` was not updated. Canonical state remains M0 `INCOMPLETO`; D0 technical/evidence OPEN; D1-DESIGN OPEN; D2/D3 OPEN; implementation authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.


## Addendum 5 — stale status labels found in owner decision matrix (2026-10-24)

A cross-artifact consistency check found a documentation mismatch in `NCS_M0_OWNER_DECISIONS_VS_EVIDENCE_GATES_2026-10-24.md` (blob `4ec21c6dffe53e13b19144d926836b23589a80c5`):
- Its section 2 rows for D0-C1…D0-C4 still use “decision required / recommendation not accepted” wording.
- The same file’s section 7 explicitly records D0-C1…D0-C4 as accepted owner policy on 2026-10-24.
- The D1 entrypoint manifest and this handoff also reflect that accepted policy, while retaining implementation/evidence gates as OPEN.

Interpretation: the policy acceptance is recorded; detailed interface compatibility, bootstrap/recovery semantics, concrete path/symlink cases, and environment-specific migration evidence remain open. The stale section-2 labels must not be used to revert the accepted policy, nor should acceptance be misread as implementation approval.

Attempted a documentation-only row reconciliation of the matrix, but the repository write was blocked by tool security controls. No claim that the matrix was changed. The verified handoff is the continuity record for this discrepancy until the matrix can be updated through an authorized write path. No runtime/tests/workflows changed; no tests/CI run.


## ADDENDUM — registro de decisiones y puertas de evidencia (2026-10-24)

Se creó y verificó el registro documental:
- [NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md](NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md)
- Commit: `9fef242512c18779f96f2f8574cc6691f11297c4`
- Blob: `f8ce94cf0316bf55ad65ea52d86b78ef87f02084`

El registro distingue decisiones aceptadas como base de diseño de propuestas aún no aceptadas, evidencia pendiente y capacidades bloqueadas. No sustituye los contratos fuente ni reabre auditorías cerradas.

Conclusiones concretas:
- D0-C1…C4 y D1-S0 constan como decisiones de diseño aceptadas; no están implementadas por ese hecho.
- Bootstrap A, el alcance exacto de snapshots bajo admisión, elección de primitiva de lock, política de release incierto, valores de timeout/stale y tratamiento de assistants/simulate siguen como propuestas o puntos de diseño pendientes.
- La prueba de root admission no existe por inferencia: tests de stores y CI anterior no la demuestran.
- No se modificó runtime, tests ni workflows; no se ejecutaron pruebas/CI.
- Estado conservador: M0 INCOMPLETO; D1-DESIGN OPEN; D1-IMPLEMENTATION NOT_STARTED; D2/D3 OPEN; authorization NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

Commit del registro de decisiones: `9fef242512c18779f96f2f8574cc6691f11297c4`. Commit que incorporó este addendum al handoff: `cbfe98de1670ee4159d81cb944441177fc56b8d0` (el HEAD efectivo avanzará con la corrección de esta línea).

Siguiente trabajo recomendado: cerrar D1-DESIGN únicamente contra las aristas UNKNOWN del manifiesto y el snapshot identificado; después terminar D2-DESIGN con la matriz de caracterización de locks. No repetir el censo histórico completo, no implementar runtime/tests/workflows y no ejecutar CI sin autorización separada.


## ADDENDUM — checkpoint after repair-route cross-check (2026-10-25)

- Confirmed branch HEAD: `5030085a55218386884e7c4123c42061717ca258`.
- D1 manifest was updated and verified by read-after-write in commit `5030085a55218386884e7c4123c42061717ca258`, blob `3ed5633b6a1c090668abdfbb22c5f1dc34df1218`: [manifest](NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md).
- Exact recursive tree for that HEAD: 3,056 entries, `truncated=false`, 188 JavaScript-family files. This is a tree identity check, not a complete call-graph execution or AST scan.
- Refined repair finding: `nexo-runtime-session.mjs` blocks its wrapper with `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; however, repair session/entrypoint/dispatch modules expose callable exports and the complete set of callers is still not reproducibly closed. A specific wrapper block must not be described as global unreachability.
- `assistants.mjs` still loads/persists Continuity, Lúmina learning memory and world state in its ordinary run; the optional repair wrapper is called after those operations. `nexo-repair-dispatch.mjs` links persisted simulation state and a Lúmina effect adapter. This remains a cross-domain edge and does not confer protected-effect authority.
- No runtime, test, or workflow files changed. No tests/CI executed. D1-DESIGN remains OPEN; D1-IMPLEMENTATION unauthorized; M0 INCOMPLETO; root PENDING/UNKNOWN; protected effects STOP.

### Exact next task

Continue the bounded, source-based caller ledger from this exact HEAD. Resolve, without rerunning the historical broad census, all repository references to `runNexoRepairSession`, `runNexoRepairOnce`, `dispatchPreparedRepair`, `openNexoContinuityOwner`, `createNexoContinuityStore`, and `createNexoChronicleStore`; include test-only callers separately. GitHub code search did not return usable matches in this pass, so do not treat that search as negative evidence. If the connector cannot retrieve a reproducible repository-wide caller set, leave caller reachability UNKNOWN/BLOCKED rather than infer absence. Do not modify runtime/tests/workflows or run CI before D1/D2 design gates and separate implementation authorization.


## ADDENDUM — targeted caller sweep checkpoint (2026-10-25)

- Current branch HEAD at checkpoint: `6128c69387d7eeae44438efac38432d8bf3d684e`.
- The D1 manifest was updated and read back successfully in commit `6128c69387d7eeae44438efac38432d8bf3d684e`, blob `90311f71c8293d808a3d247164faf42bd55dae7a`.
- The addendum separates observed production-source references from sampled test-only references for owner/store APIs and repair APIs. It explicitly records that this is not a full AST call graph and does not close external, dynamic, or indirect callers.
- Confirmed route distinction: `nexo-runtime-session.mjs` blocks its wrapper under Option A; repair session/entrypoint/dispatch modules remain callable exports, and complete production reachability is not established. The wrapper block is not a global no-bypass proof.
- The recursive tree at the prior checkpoint had 3,056 entries and 188 JS-family files, `truncated=false`. This current commit is documentation-only; source blob SHAs remain unchanged.
- No runtime/tests/workflows changed; no tests or CI ran. M0 remains INCOMPLETO; D1-DESIGN OPEN; D1-IMPLEMENTATION unauthorized; D2/D3 OPEN; authorization NOT_EVALUATED; root PENDING/UNKNOWN; protected effects STOP.

### Next exact task

Do not repeat the 2,982-entry historical census or claim code-search returned no callers. The next useful step is a reproducible caller-resolution method against this exact HEAD (local checkout/AST resolver or equivalent source enumeration), separating production entrypoints, internal API callers, tests, and explicit exceptions. If the available connector cannot provide a complete caller set, preserve `UNKNOWN/BLOCKED` and document the limitation; do not infer absence. Only after D1 design closes should D2 freeze snapshot admission, child ownership/deadlock, and uncertain release behavior. No implementation until separate explicit authorization.


## ADDENDUM — caller-resolution tooling boundary (2026-10-25; read-only investigation)

- Reconfirmed exact branch checkpoint commit: `c931fb10b9bf41f37c941993356076778d74beec`.
- Ran five focused GitHub code-search queries against the repository for `runNexoRepairOnce`, `dispatchPreparedRepair`, `openNexoContinuityOwner`, `runNexoChronicleAppend`, and `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. All returned zero results, including known symbols already confirmed in fetched source files. Treat the connector's code-search results as unusable for caller-absence evidence.
- Attempted to obtain a local checkout for repository-wide enumeration; the environment could not resolve `github.com`. No local source checkout or AST scan was produced.
- Therefore, this pass did **not** establish a reproducible complete caller set. Existing bounded references remain valid as observed references, but caller closure stays `UNKNOWN/BLOCKED`. Do not repeat the same ineffective code-search queries as though they were progress.
- Next viable step requires a source-enumeration route that can access the exact repository tree and all relevant source blobs (for example, a functioning local checkout/AST resolver or an equivalent authorized repository export). Once available, resolve the six named API families listed in the preceding checkpoint, and classify production entrypoints, internal callers, tests, and explicit exceptions separately.
- No runtime, test, or workflow files changed. No tests or CI ran. M0 remains INCOMPLETO; D1-DESIGN OPEN; D1-IMPLEMENTATION unauthorized; D2/D3 OPEN; authorization NOT_EVALUATED; root PENDING/UNKNOWN; protected effects STOP.


## ADDENDUM — Nexo/Lúmina boundary root-cause trace (2026-10-25; read-only source/history review)

### Confirmed source-history sequence
- Commit [1a0567b1a3207a0cd318445df3ecc61173d5fbb0](https://github.com/snowdenxrp/aldea-ia/commit/1a0567b1a3207a0cd318445df3ecc61173d5fbb0), 2026-09-25, titled `Nexo: integrate mission orchestration into assistant cycle`, added `buildNexoMission()` directly to `scripts/assistants.mjs`. Its mission input came from Lúmina assistant-squad reports plus debugger/tester/analyst reports. This is the earliest confirmed integration edge in the inspected `assistants.mjs` path.
- Commit [995bd55524e81e14951876371a4bfb65be96ee39](https://github.com/snowdenxrp/aldea-ia/commit/995bd55524e81e14951876371a4bfb65be96ee39), 2026-09-25, titled `Nexo: persist mission plans into learning memory`, added `recordNexoPlan` to `src/assistants/memory.js`, placing Nexo mission-plan persistence inside the learning-memory module.
- Commit [cc393235995fd63558b095bb47ad9df827f0bffd](https://github.com/snowdenxrp/aldea-ia/commit/cc393235995fd63558b095bb47ad9df827f0bffd), 2026-09-26, titled `fix(nexo): persist mission memory in world-state contract`, routed `simulation.nexoMemory` through `recordNexoPlan` and imported `persistState` from `scripts/simulate.mjs`; Nexo mission state was persisted in the simulation/world-state contract.
- Commit [18cc64d3f0ce9999a19e280556af65b1f02fe01a](https://github.com/snowdenxrp/aldea-ia/commit/18cc64d3f0ce9999a19e280556af65b1f02fe01a), 2026-09-26, changed `scripts/assistants.mjs` to load/apply the canonical simulation state through `simulate.mjs` and persist it after the assistant run.
- The current `scripts/assistants.mjs` source additionally opens Nexo Continuity and records the mission there, while continuing to use `src/assistants/memory.js`, `.lumina-assistant-memory.json`, `scripts/simulate.mjs`, and `world-state.json`.

### Architectural interpretation (separate from source facts)
- The historical evidence supports a concrete explanation: Nexo mission orchestration was integrated into the existing Lúmina assistant cycle, and mission memory was subsequently attached to both Lúmina learning-memory structures and the simulation/world-state persistence path. The later Nexo-only CLI/application extraction created a separate narrow route, but did not remove the legacy composite route from `scripts/assistants.mjs`.
- This is a boundary regression / incomplete extraction relative to the Nexo independence principle, not evidence that every Nexo module is coupled to Lúmina. Do not describe the legacy composite route as the ordinary Nexo entrypoint; the existing design decision explicitly keeps `assistants.mjs` and `simulate.mjs` outside the ordinary Nexo instance route until a defined and verified boundary exists.
- Existing docs already record the bounded CLI separation and the legacy bridge: `NEXO_NCS/BUILD/NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md` and `NEXO_NCS/BUILD/NCS_M0_ENTRYPOINT_ISOLATION_AUDIT_2026-10-19.md`. Reuse those artifacts; do not restart their completed narrow-CLI checks or claim repository-wide isolation from them.
- Required design direction for later implementation: Nexo’s ordinary route must not import/call Lúmina assistants, read/write Lúmina learning memory, load/persist simulation world state, or initialize/migrate Nexo Continuity from simulation state. Any intentional interoperation must be an explicit, bounded adapter outside Nexo Core, with direction, data contract, persistence ownership, and failure behavior specified. This paragraph is a design recommendation, not a code change or implementation authorization.
- Do not delete `assistants.mjs`, alter world state, move/merge memory files, or silently migrate legacy Nexo mission records. Existing installations may depend on legacy data; migration and cutover require the existing D0/D3 gates and explicit evidence.

### Current evidence boundary
- Current branch HEAD at the start of this review: `ef56184729ae710d7cd3f196d4e34028595a42eb`; recursive tree: 3,056 entries, `truncated=false`. The reviewed history commits above are earlier than this HEAD.
- Read-only review only. No runtime, tests, workflows, or data files changed; no tests/CI ran.
- The existing D1 caller-resolution limitation remains: GitHub code search is unusable for absence evidence and local checkout/AST resolution is still unavailable. This history trace does not close the full transitive caller graph.
- Continue D1 from the exact current tree and existing caller ledger; classify production entrypoints, internal callers, tests, and explicit exceptions separately. Do not repeat the broad historical census. Any unresolved caller remains `UNKNOWN/BLOCKED`.
- Canonical state unchanged: M0 `INCOMPLETO`; D0 technical/evidence OPEN; D1-DESIGN OPEN; D1-IMPLEMENTATION unauthorized; D2/D3 OPEN; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.


## ADDENDUM — exact named-API source sweep and boundary correction (2026-10-25)

### Reproducible source enumeration completed for the six named API families
- Queried the recursive Git tree at source checkpoint ef56184729ae710d7cd3f196d4e34028595a42eb: 3,056 total entries, truncated=false, 188 JavaScript-family blobs (.mjs/.js/.cjs/.ts/.tsx).
- Retrieved and scanned all 188 blobs in bounded batches for the exact identifiers already named by the D1 handoff: runNexoRepairSession, runNexoRepairOnce, dispatchPreparedRepair, openNexoContinuityOwner, createNexoContinuityStore, createNexoChronicleStore, runNexoChronicleAppend, plus the relevant memory/persistence bridge identifiers (createLearningMemory, learnFromReports, persistState, NEXO_LUMINA_MEMORY_PATH, world-state.json, nexoMemory). All 188 blob fetches completed without reported errors.
- This is now a reproducible named-identifier reference sweep over the exact tree, better than the unusable GitHub code-search operation. It is not a full AST/call graph: it does not close dynamically constructed names, computed imports/loaders, external consumers, runtime reflection, or semantic execution reachability. Do not upgrade it to a universal no-bypass proof.

### Source-reference classification from the sweep
- Production entrypoints / composite legacy paths: scripts/assistants.mjs references openNexoContinuityOwner, the Lúmina memory layer, and persistState; scripts/simulate.mjs references the owner API and world-state persistence; scripts/nexo.mjs delegates to the separately executable Chronicle child; scripts/nexo-chronicle-session.mjs calls runNexoChronicleAppend.
- Callable repair API chain: scripts/nexo-repair-session.mjs exports runNexoRepairSession and calls runNexoRepairOnce; scripts/nexo-repair-entrypoint.mjs calls dispatchPreparedRepair; scripts/nexo-repair-dispatch.mjs imports loadStateStrict/persistState from simulation and the Lúmina effect adapter. scripts/nexo-runtime-session.mjs is a separate wrapper whose Option A result is blocked; that does not prove every caller of the lower-level exports is unreachable.
- Nexo application/core APIs: src/nexo/application/chronicle-append.mjs calls owner/store APIs; src/nexo/application/continuity-queries.mjs calls createNexoContinuityStore; src/nexo/core/continuity-service.mjs calls the Continuity store factory and exports owner opening; src/nexo/core/continuity-store.mjs and chronicle-store.mjs define the path-based factories; src/nexo/application/index.mjs re-exports runNexoChronicleAppend.
- Test-only/direct test consumers found in the sweep: tests/assistants.test.mjs; tests/nexo/assistants-runtime-cli.test.mjs; chronicle-runtime.test.mjs; chronicle-session-input-guard.test.mjs; chronicle-store.test.mjs; conditional-commit-persist-state.test.mjs; continuity-contract.test.mjs; continuity-migration.test.mjs; continuity-service-options-input-guard.test.mjs; continuity-store.test.mjs; entrypoint.test.mjs; mission-preview-input-resource-limit.test.mjs; mission-request-preview.test.mjs; open-loops-query.test.mjs; orchestrator.test.mjs; persisted-repair-observation-input-guard.test.mjs; persistence-lock-worker.mjs; repair-mission-verification.test.mjs; repair-owner-lifecycle.test.mjs; repair-session.test.mjs; repair-settlement-crash-cuts.test.mjs; restart-reconstruction.test.mjs; runtime-concurrency.test.mjs; runtime.test.mjs; simulation-restart-persistence.test.mjs; and temporary-cleanup-bounds.test.mjs. This is the complete file-level match set for the searched identifiers at that tree, not a complete classification of every dynamic or external caller.
- The source sweep also confirmed tests explicitly assert that persistState() does not serialize nexoMemory into Lúmina's canonical world-state file. Preserve that guard. It does not by itself remove the reverse-direction legacy import bridge from assistants.mjs/simulate.mjs.

### Important correction to the isolation target
- assistants.mjs and simulate.mjs are Lúmina legacy commands. Their legitimate Lúmina responsibility to read/write Lúmina learning memory and simulation world-state must not be removed as a blunt “fix”.
- The boundary defect is that these Lúmina commands also open Nexo Continuity and/or build or repair Nexo missions. The intended extraction is to keep the Lúmina commands responsible for Lúmina only and keep the independent Nexo CLI/application responsible for Nexo only. Do not implement this by disabling Lúmina's own state persistence.
- Any one-time migration from legacy persisted.nexoMemory into the independent Nexo store must be a separately authorized migration path, not an implicit side effect of normal Lúmina simulation/assistant execution. Preserve existing data and the D0/D3 migration gates; no silent deletion, merge, or dual-write.
- This clarification narrows the design target; it does not authorize implementation. D1-DESIGN remains OPEN, D1-IMPLEMENTATION unauthorized, and the full graph remains OPEN for dynamic/external/semantic edges.

### Next continuation
1. Reconcile this named-API sweep with the existing D1 manifest and retain its UNKNOWN/BLOCKED labels for non-static/unresolved edges; do not repeat the 188-file sweep absent source changes.
2. Finish D1-DESIGN only against genuinely unresolved edge classes and the child-process/root-admission contract.
3. Continue the previously identified D2 design work after D1-DESIGN closure: snapshot admission scope, parent/child lock ownership/deadlock, and uncertain release/re-admission. No runtime/tests/workflows or CI until separate explicit implementation authorization.
4. No runtime, test, workflow, or data file changed in this review; no tests/CI ran. Canonical state unchanged: M0 INCOMPLETO; D0 technical/evidence OPEN; D1-DESIGN OPEN; D1-IMPLEMENTATION unauthorized; D2/D3 OPEN; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.


## ADDENDUM — parent/child instance-root boundary and D1-C2 cross-reference (2026-10-25)

- D1-C2 in the D0/D2/D3 decision matrix was reconciled with the independence principle in documentation-only commit [e95ce728549ca31b77c635ef9af83e7a5125cf0b](https://github.com/snowdenxrp/aldea-ia/commit/e95ce728549ca31b77c635ef9af83e7a5125cf0b). The matrix now recommends that Lúmina's assistants command remain Lúmina-only; it must not open Nexo Continuity or create/register Nexo missions. The matrix row remains a design proposal, not implementation authorization.
- Current parent CLI source (blob e471eb478a09aa8a9a8323795583e198cdf0a127) accepts separate --continuity paths for queries/previews and forwards raw Chronicle arguments to a child using spawnSync.
- Current child CLI source (blob 30a53de2f108aa255a1dfd61ce78c19788de160b) is independently executable and accepts separate --continuity and --chronicle paths plus initialization flags. The application API (blob 5a20044bcddbaee79d0117934eefaea5f3b2c3bc) directly accepts paths, creates both stores, reads both before mutation, and opens the owner. None of these current source edges implements the accepted --root contract.
- D1/D2 design consequence, recommendation only:
  1. Parent and child both receive one explicit --root, with no mixed --root plus legacy store paths.
  2. For Chronicle append, the parent parses/routes only and must not hold a non-reentrant root lock while waiting for the child. The independently executable child canonicalizes/validates the existing root and owns operation admission for its process.
  3. For in-process query/preview APIs, admission must occur before the first canonical snapshot read. D2 must still freeze the precise scope, including previews, and the implementation must not rely on a CLI-only lock.
  4. Path-based store factories and owner APIs remain internal/test primitives unless a caller is proven to enter through the admitted instance boundary. Existing public application imports and direct callers must be classified.
  5. Missing/invalid root, contradictory paths, invalid configuration, or ambiguous store state must fail before store initialization or writes. Bootstrap remains separate and explicit.
- The recommendation does not settle root-lock primitive, release-uncertainty behavior, exact snapshot critical section, or migration/cutover. Those remain D2/D3 dependencies. Do not infer a functioning root gate from this design note.
- Latest source tree reviewed remains ef56184729ae710d7cd3f196d4e34028595a42eb (188 JS-family blobs); commits since that source checkpoint are documentation-only. Latest documentation checkpoint after this addendum will be the commit returned by the write/read-back below.
- No runtime, tests, workflows, or data files changed; no tests/CI ran. D1-DESIGN OPEN; D1-IMPLEMENTATION unauthorized; D2/D3 OPEN; M0 INCOMPLETO; legitimate root PENDING/UNKNOWN; protected effects STOP.
