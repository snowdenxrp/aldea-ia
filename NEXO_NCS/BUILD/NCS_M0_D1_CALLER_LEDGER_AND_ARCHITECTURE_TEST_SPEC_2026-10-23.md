# NCS M0 — D1 diseño: ledger de callers y cierre de cobertura pendiente

Fecha: 2026-10-23
Rama: ncs-clean-architecture
Snapshot Git: tree SHA 74e044d2307f69350f7d5a46b01f43ee1c69061b
Estado: D1-DESIGN EN PROGRESO — NO IMPLEMENTADO — NO EJECUTADO

## 1. Alcance de esta revisión

Se volvió a consultar el árbol recursivo de GitHub para ncs-clean-architecture. El inventario original de 2.982 entradas (tree 74e044d2307f69350f7d5a46b01f43ee1c69061b) identificó 121 archivos de código/configuración en los grupos src/nexo/, scripts/, tests/nexo/, workflows y package.json. En la continuación se consultó de nuevo el árbol completo: tree fc546b0e998abcecafb44ead2b2ae9dd1222d539, truncated=false, 2.982 entradas. Los archivos de runtime citados abajo conservaron los blobs indicados; la nueva inspección de referencias no constituye prueba de que todos los callsites semánticos estén clasificados.

Fuentes reconsultadas:
- package.json — blob e45dc6d215db53ea2758009cd501f565634e3610
- src/nexo/application/index.mjs — blob fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3
- src/nexo/application/continuity-queries.mjs — blob e1915e94e53e71d37a37952fead37ba62bdae79a
- src/nexo/application/chronicle-append.mjs — blob 5a20044bcddbaee79d0117934eefaea5f3b2c3bc
- src/nexo/core/continuity-service.mjs — blob 8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c
- scripts/assistants.mjs — blob d31c6dba86159ee0403f0cc1c236b89863e4d5cb
- scripts/simulate.mjs — blob 623d316c7a1efd10cc2f06a3080c0d9f06087596
- .github/workflows/nexo-m0-chronicle.yml — blob 65b2bc04a015f5bd1fe010e3f3eec6e0481514e7
- .github/workflows/nexo-mission-admission-continuity.yml — blob 03f2a0cb8268e442ce4db434383b0f4854073d82

## 2. Caller classification ledger

| Caller/surface | Current source fact | Proposed classification/requirement | Closure state |
|---|---|---|---|
| scripts/nexo.mjs | CLI accepts legacy path options; query routes call application API; Chronicle append launches a child | PRODUCTION_ADMITTED only after root admission before every covered read/write; no silent legacy fallback | OPEN |
| scripts/nexo-chronicle-session.mjs | Independently executable; accepts --continuity and --chronicle | PRODUCTION_ADMITTED; child independently validates same root and acquires admission; direct legacy paths blocked in instance mode | OPEN |
| src/nexo/application/chronicle-append.mjs | Constructs both store factories and opens Continuity owner | Single admitted operation boundary; nested helpers receive existing context and must not re-enter root lock | OPEN |
| src/nexo/application/continuity-queries.mjs | Status, mission status, plan, preview and Open Loops use path-based factory and loadCurrent | Read-only queries also acquire admission before snapshot load if covered by aggregate snapshot guarantee | OPEN |
| src/nexo/application/mission-request-preview.mjs | Delegates to draft preview | No nested admission; delegate under one boundary | OPEN |
| src/nexo/application/index.mjs | Reexports append and query APIs | Public API; tests must reject equivalent path-based bypasses after cutover | OPEN |
| src/nexo/core/continuity-service.mjs | Opens/initializes store; can import legacy memory or initialize empty state under explicit option | Internal bootstrap/owner primitive; called only under admitted operation/bootstrap contract | OPEN |
| src/nexo/core/continuity-store.mjs | Exported path-based factory and per-store lock; loadCurrent read path not covered by mutation lock | INTERNAL_ONLY/test primitive, or explicit admission context required; do not remove per-store contract | OPEN |
| src/nexo/core/chronicle-store.mjs | Exported path-based factory and per-store lock | INTERNAL_ONLY/test primitive, or explicit admission context required; preserve lock semantics | OPEN |
| scripts/nexo-continuity.mjs | Reexports openNexoContinuityOwner; exact-branch scan found production imports in assistants.mjs and simulate.mjs, plus test imports. No other reference to the wrapper was found in the inspected scripts/ and src/nexo/ source set. | Classify both current production callers explicitly; determine downstream/external consumers separately. Preserve only as admitted wrapper or explicitly legacy-only after the public API contract is fixed. | INTERNAL REPO SCAN: 2 production callers found; external/downstream callers UNKNOWN |
| scripts/assistants.mjs | Opens Continuity with legacy memory, records mission, writes Lúmina memory and world state separately; may invoke repair | Compound multi-domain operation; cannot claim atomicity. Exclude from ordinary Nexo persistent entry until explicit contract and commit-conflict semantics exist | OPEN / exclusion recommendation |
| scripts/simulate.mjs | Opens/initializes Continuity and has a separate world-state lock with stale-lock deletion behavior | Not an equivalent root-admission protocol; exclude from ordinary persistent Nexo path pending explicit integration design | OPEN / exclusion recommendation |
| Repair/runtime sessions and dispatch/settlement helpers | Separate multi-phase paths; some touch stores/effect adapters | Store access inherits admission; dispatch/repair remains separately blocked by constitutional gate | OPEN |
| Store tests/workers | Create low-level stores directly to test per-store locks and persistence | TEST_ONLY; retain isolation tests and add instance-admission tests | PARTIAL |
| npm test | Explicit chain of individual scripts in package.json, not globbed | Add architecture-gate tests only after design freeze and update relevant workflow paths | OPEN |
| Chronicle CI workflow | Runs Chronicle store, runtime and entrypoint tests | Must include root-admission tests and new files when implementation is authorized | NOT UPDATED |
| Mission-admission/Continuity CI workflow | Runs selected continuity, migration, runtime and Chronicle tests | Must cover all production entrypoints touched by cutover | NOT UPDATED |

### 2.1 Exact-branch wrapper/callsite recheck (2026-10-23)

A targeted reference scan was performed against ncs-clean-architecture, tree fc546b0e998abcecafb44ead2b2ae9dd1222d539 (truncated=false). Relevant source blobs re-read:

- scripts/nexo-continuity.mjs — f08969f2d77a2e90f74d01c96242e29de89e3f22: one compatibility re-export of openNexoContinuityOwner.
- scripts/assistants.mjs — d31c6dba86159ee0403f0cc1c236b89863e4d5cb: imports the wrapper and opens Continuity.
- scripts/simulate.mjs — 623d316c7a1efd10cc2f06a3080c0d9f06087596: imports the wrapper and opens Continuity.
- src/nexo/core/continuity-service.mjs — 8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c: owner service constructs the path-based Continuity store.
- src/nexo/application/chronicle-append.mjs — 5a20044bcddbaee79d0117934eefaea5f3b2c3bc: direct application path constructs both store factories and opens the owner; this is a separate production route, not a wrapper import.
- src/nexo/application/continuity-queries.mjs — e1915e94e53e71d37a37952fead37ba62bdae79a: query/preview routes call the path-based Continuity factory directly.
- scripts/nexo.mjs — e471eb478a09aa8a9a8323795583e198cdf0a127 and scripts/nexo-chronicle-session.mjs — 30a53de2f108aa255a1dfd61ce78c19788de160b: parent launches the child with spawnSync; child imports the public application append route and is directly executable.

Test-only imports/usages of the compatibility wrapper were observed in tests/nexo/assistants-runtime-cli.test.mjs, tests/nexo/continuity-migration.test.mjs, tests/nexo/entrypoint.test.mjs, tests/nexo/chronicle-runtime.test.mjs, and tests/nexo/continuity-contract.test.mjs. Direct factory use in store/runtime tests is expected for low-level persistence tests and does not demonstrate production admission.

**Interpretation boundary:** this closes the narrow question “which current in-repository production files import scripts/nexo-continuity.mjs?” for the inspected source set: two (assistants, simulate). It does not prove there are no external/downstream consumers, no dynamic/computed module edges, or no other path-based production bypass. Those remain D1-DESIGN UNKNOWN/OPEN until the architecture graph and acceptance fixtures exist. No source/test/workflow files were modified and no tests/CI were run by this scan.

## 3. Contract-level issues surfaced

### 3.1 Queries are production-relevant even though they do not write

The public application API exposes read-only status/mission/plan/preview/Open Loops queries, but these call the path-based store factory and load a snapshot without the per-store mutation lock. If D2 guarantees only “no simultaneous writes”, these calls may not need exclusive admission. If the goal includes one bounded live snapshot/heap profile per instance, queries must also be admitted. D2 must choose explicitly; do not claim the stronger guarantee while implementing only writer exclusion.

Recommendation: include all operations that load a canonical Continuity/Chronicle snapshot in the first admission contract, even read-only ones. Pure parsing/validation over an already-loaded value is outside the lock. This is simpler to verify, but serializes queries.

### 3.2 assistants and simulate are not merely alternate CLI aliases

They combine Nexo continuity with other persistence domains and can import legacy state or initialize empty state. A shared root lock alone would not make the multi-file sequence atomic. Until the product designs these cross-domain semantics, they should not be presented as supported instance-root entrypoints.

Recommendation: classify them as EXPLICIT_EXCEPTION/outside the ordinary Nexo instance entrypoint, with a fail-closed or clearly separate legacy mode. This is a recommendation, not an implemented block.

### 3.3 The child process is a separate admission boundary

The Chronicle child can be launched directly. The parent’s lock does not protect direct child invocation, and holding the parent’s non-reentrant lock while waiting for a child that also acquires it would deadlock or time out.

Recommendation: parent passes only the same explicit root and does not retain root admission while waiting if the child itself must acquire it; alternatively, parent owns the whole operation and the child is a private worker that cannot acquire independently. Do not mix models. Given direct child invocation exists, prefer independent child admission and no parent-held admission across spawnSync.

## 4. D1 static architecture test — acceptance conditions

The test is a source-graph test, not a security proof. Freeze these assertions before implementation:

1. Resolve entrypoints from package.json, configured workflow commands, executable guards in scripts/nexo*.mjs, and child-process launch sites.
2. Traverse static imports/reexports transitively from production entrypoints, including mixed .js/.mjs boundaries.
3. Find every direct factory/owner use, loadCurrent, initialize, conditionalCommit, Chronicle append, child-process call, and legacy path option.
4. Require a row for each caller with one of: PRODUCTION_ADMITTED, INTERNAL_ONLY, TEST_ONLY, EXPLICIT_EXCEPTION.
5. Fail on unclassified production entrypoints, direct path-based factory access without context, child invocation without root, or legacy paths accepted in instance mode.
6. Treat unresolved imports, dynamic loading, computed path edges or ambiguous external reexports as UNKNOWN/BLOCKED, not allowed.
7. Include negative fixtures for conflicting root+legacy paths, missing root, child without root, simulate/assistants incidental owner access, unclassified dynamic import and unresolved module.
8. Keep store tests TEST_ONLY; do not use them to claim production no-bypass.
9. Do not execute repair dispatch, external effects or protected transitions in this architecture test.

The current tree is not proven to pass this test; the test has not been implemented or executed.

## 5. CI and evidence

package.json explicitly chains test files; it is not a glob. The two reviewed workflows run selected test sets. Neither demonstrates instance-root admission, because that runtime contract has not been implemented and the architecture test does not yet exist.

No runtime, test, or workflow source was modified in this review. No tests or CI were executed. This document is a design ledger, not a PASS.

## 6. Next actions

1. Complete exact callsite classification for remaining semantic edges, dynamic/computed loading and external consumers; the compatibility-wrapper scan found two current production callers (assistants, simulate) but does not close the whole graph. Unresolved edges remain UNKNOWN/BLOCKED.
2. Freeze the D1-DESIGN acceptance conditions and choose the D1-S0 sequencing split before writing tests.
3. Resolve D0 configuration precedence, existing-root/bootstrap policy, symlink/alias behavior and legacy CLI/API behavior.
4. Resolve D2 scope (recommendation: all snapshot-loading operations), child-process ownership, non-reentrancy, timeout and uncertain release.
5. Resolve D3 dry-run/copy/verify/cutover/rollback.
6. Only after gates close, implement the architecture test and runtime under separate implementation authorization; run targeted tests and CI on the exact combined code+test SHA.

## 7. Constitutional status

M0 INCOMPLETO; D1/D2/D3 OPEN; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP. Runtime/tests/workflows unchanged; tests/CI not run in this review.


## Actualización de decisiones D0 y secuencia (2026-10-24)

El propietario aceptó D0-C1…D0-C4 como contrato de diseño para M0 y aceptó previamente D1-S0, separar D1-DESIGN de D1-IMPLEMENTATION. Esto reemplaza el lenguaje histórico de recomendación pendiente únicamente para esas decisiones; no convierte el ledger en prueba ejecutada ni autoriza implementación.

La política aceptada exige `--root` explícito único sin env/fallback legacy en la primera versión; operación normal con raíz existente y bootstrap separado; canonicalización y bloqueo de estados ambiguos sin promesa contra carreras hostiles; migración/cutover fuera del M0 operativo hasta verificar el entorno objetivo, sin migración automática, doble escritura ni merge heurístico. `assistants.mjs` y `simulate.mjs` deben permanecer fuera de la ruta ordinaria hasta definir y verificar consistencia con la frontera de instancia. Consumidores externos desconocidos continúan `UNKNOWN`.

### Revisión dirigida de D1-DESIGN — resultado actual

- **Todavía no hay manifiesto reproducible de entrypoints cerrado:** el ledger enumera superficies observadas, pero no acredita una salida de máquina reproducible que cruce `package.json`, workflows, guards ejecutables y destinos de procesos hijos.
- **La cobertura de grafo sigue especificada, no demostrada:** la prueba existente de `entrypoint.test.mjs` usa extracción regex de imports/reexports estáticos y no acredita cobertura de `import()`, `require()`, cargas calculadas, accesos a factories/owners, ni aristas de proceso.
- **Clasificación no cerrada:** los callers identificados tienen propuesta/estado abierto; toda arista no resuelta debe seguir `UNKNOWN/BLOCKED`. El escaneo de wrapper con dos callers internos no prueba ausencia de consumidores externos.
- **Consistencia D0→D1:** la política de raíz ahora está decidida; falta traducirla a una allowlist/manifiesto de entrypoints y condiciones verificables, sin implementar el test todavía.
- **Estado:** D1-DESIGN `OPEN`; D1-IMPLEMENTATION no autorizada/no iniciada; runtime/tests/workflows sin cambios por esta actualización; no se ejecutó CI. Estado canónico M0 `INCOMPLETO`; D0/D1/D2/D3 gates abiertos; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
