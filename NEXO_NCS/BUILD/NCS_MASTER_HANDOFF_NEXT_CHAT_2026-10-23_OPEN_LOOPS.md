# NCS — Master handoff for the next chat
Date: 2026-10-23
Branch: `ncs-clean-architecture`
Repository: https://github.com/snowdenxrp/aldea-ia
Purpose: resume from verified current state without repeating closed research or audits.

## 1. Instructions for the next chat

1. Open exactly with the user's continuity keyword `NCS` if starting a new chat; then read this handoff and current `NEXO_NCS/STATUS.md`.
2. Follow the established entry order: `STATUS → MASTER/CORE → BUILD → implementation`. Treat STATUS as the entry door.
3. Do not repeat the already-closed audits listed below unless a concrete code change invalidates their evidence.
4. Do not claim code/test/CI success from documentation, a commit existing, or a workflow that belongs to another SHA. Verify CI on the exact implementation+test commit and then, if practical, verify the STATUS documentation commit separately.
5. Do not treat source-level design, fixture injection, or local persistence as owner authority or proof of protected execution.
6. Keep Option A: bounded local Continuity/Chronicle persistence is an internal capability, not authority. Do not put a blanket deny-first gate on all local persistence.
7. Never implement a positive authority decision, wire protected effects, activate repair, or expose generic execution while root recognition/provenance remains unresolved.
8. If a concrete defect is not demonstrated, do not add speculative guards, registries, queues, IDs, retries, tombstones, transaction wrappers, or parallel state stores. Stop and document the exact blocker instead.
9. Keep Lúmina separate from Nexo. Do not merge simulation, repair, shell, network, or other protected/external effects into the allowed local Chronicle path.

## 2. Canonical state (unchanged)

- M0: `INCOMPLETO`
- Authorization: `NOT_EVALUATED`
- Legitimate root: `PENDING/UNKNOWN`
- Protected effects: `STOP`
- The initial/single-root path is an accepted architectural scope only; it has not been provisioned or proven.
- Device/biometric evidence is not itself authority. The owner must remain recognizable across phone replacement, model changes, and reinstall, but no real root proof is established.
- `executeProtectedTransition` does not call `effectBoundary.prepare`; its fallback remains `NOT_IMPLEMENTED`. An injected `AUTHORIZED` test fixture is not Genesis/root proof.
- `conditionalCommit` is internal persistence, not a demonstrated external effect sink.
- Product repair session is explicitly blocked by the M0 Option A gate; do not rewire it.

## 3. Latest repository evidence inspected for this handoff

Branch: `ncs-clean-architecture`.

Latest verified implementation+test checkpoint:
- SHA: `962d1a327683b412c401f323514d401e7e8ec8f1`
- [Deterministic persistence / `npm test` — run 39980113239 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113239), job `120504886619` SUCCESS.
- [STEP 4 — run 39980113168 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113168).
- [STEP 5 — run 39980113209 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113209).

`NEXO_NCS/STATUS.md` is the live entry door; always read its current branch version rather than treating a historical blob SHA as current.

Current Open Loops contract:
- `NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md`
- Blob SHA: `164dbee6fd1cb2a46db933a3f63e88201c651268`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md

Relevant recent caller matrix:
- `NEXO_NCS/BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md`
- Blob: `8cc15e9faeeb45daf034d343d5a6faa5c52e5374`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md

## 4. Open Loops: the current implementation checkpoint

The master vision includes Open Loops. The right first slice is a read-only derived projection from canonical continuity, not a new task ledger, queue, scheduler, or independent lifecycle.

Design contract:
- `NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md`
- Blob: `bbd52206e80903f98ad973e8997c19134776235c`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md

Implementation:
- `src/nexo/application/continuity-queries.mjs`, blob `82429e4ec2b2830029371ee292f4875ff1180a8a`
- `src/nexo/application/index.mjs`, blob `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`
- `tests/nexo/open-loops-query.test.mjs`, blob `b294114f9a09136a3468faa4e5c991509e6dcbcd`
- `package.json`, blob `e45dc6d215db53ea2758009cd501f565634e3610`
- Test file: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/open-loops-query.test.mjs
- Query source: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/application/continuity-queries.mjs

`loadNexoOpenLoops(continuityPath)` is implemented and exported from the narrow application API; CLI exposure is deliberately deferred. It:
- Loads one validated canonical snapshot/revision.
- Projects non-completed missions/steps separately from `prepared` and `reconciled_observed` effect-journal entries; excludes `settled_observed`.
- Omits target/context payloads.
- Returns `authorization: NOT_EVALUATED` and `dispatchAttempted: false`.
- Does not create a missing store or mutate source continuity.
- Sorts output deterministically and blocks above 1,000 projected items instead of silently truncating.
- Returns `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN` if an unresolved journal row lacks mission/step/action linkage.
- Test coverage includes missing-store non-creation, required path, valid empty snapshot, mission/step projection, journal-status separation, private target omission, unchanged bytes/mtime, deterministic repeated result, unknown linkage, and output cap.

**Exact-SHA CI verification completed after the initial handoff.** The combined implementation+test SHA is `962d1a327683b412c401f323514d401e7e8ec8f1`. All three workflows passed on that exact SHA: [deterministic persistence / npm test run 39980113239](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113239), job `120504886619`; [STEP 4 run 39980113168](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113168); [STEP 5 run 39980113209](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113209).

During the implementation audit, a concrete gap was found: journal rows with syntactically present but orphaned mission/step references, or an action differing from the canonical step, could be projected as obligations. The query now validates each unresolved journal row against the mission and step in the same canonical snapshot and blocks with `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN` when the reference is missing or discordant. Regression tests cover missing fields, orphan references, and action mismatch.

This verifies the read-only Open Loops implementation+test SHA; it does not verify owner authority, a protected execution path, or a broader Open Loops engine. Do not repeat the now-closed exact-SHA CI check unless the implementation/tests change.

### Exact next actions — updated after exact-SHA verification

1. Do not repeat the exact-SHA CI check unless implementation/tests change. The combined implementation+test SHA `962d1a327683b412c401f323514d401e7e8ec8f1` passed:
   - deterministic persistence / `npm test`: run `39980113239`, job `120504886619`, SUCCESS;
   - STEP 4: run `39980113168`, SUCCESS;
   - STEP 5: run `39980113209`, SUCCESS.
2. The implementation audit found and fixed two silent-omission hazards:
   - orphan/mismatched unresolved-journal links; each journal mission/step/action must resolve against the same canonical snapshot;
   - an unrecognized journal status could be silently omitted when there were no missions to reconstruct. The query now blocks with `NEXO_OPEN_LOOPS_JOURNAL_STATUS_UNKNOWN` for any journal status other than `prepared`, `reconciled_observed`, or the explicitly excluded terminal `settled_observed`.
   Regression coverage includes missing fields, orphan references, action mismatch, unknown status with zero missions, direct planned and failed mission projection, completed-status discrepancy, corrupt continuity, and resource-limit failure.
3. Keep Open Loops scoped as an application-level read-only projection. Do not add CLI exposure, a new store, queue, scheduler, or task identity without a concrete acceptance case.
4. Continue the M0 aggregate resource-budget frontier from Section 4A: trace all public/application entrypoints touching Chronicle/Continuity and decide the supported concurrency contract before any global-lock implementation. The current stable-temp protocol already exists; do not repeat that implementation.
5. Preserve exact evidence rules: implementation+test SHA, run/job IDs, and conclusions must match. A documentation commit does not substitute for runtime/test proof.

## 4A. Aggregate resource budget — current continuation frontier (2026-10-23)

Current analysis:
- `NEXO_NCS/BUILD/NCS_M0_AGGREGATE_RESOURCE_BOUND_ANALYSIS_2026-10-22.md`, now corrected against the current HEAD.
- Analysis documentation commits: `31bff07ea76ddd86713c642b3f5ae25570e3ae57` and `e2208578bde2efd1d39aacaf70ba314411885113`.
- Current code blobs inspected:
  - `src/nexo/core/chronicle-store.mjs`: `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`
  - `src/nexo/core/continuity-store.mjs`: `9ffd28930abdbe29f5b041711cc29b74dc99fbae`
  - `src/nexo/core/resource-limits.mjs`: `98355d5dc8298695233495d4bab2264b3eeba7b3`
  - `scripts/nexo-chronicle-session.mjs`: `30a53de2f108aa255a1dfd61ce78c19788de160b`
  - `package.json`: `e45dc6d215db53ea2758009cd501f565634e3610`

Important correction: current Chronicle and Continuity writers already use a stable `.tmp` filename and a bounded directory scan/cleanup under their own store lock. The previous analysis text claiming the current code creates unique PID/time/sequence temp files was stale. Existing store tests cover a stable temp plus a legacy temp and verify they are absent after successful write. Do not reimplement stable-temp cleanup or claim this review ran CI.

What is proved vs open:
- Current writer protocol limits its own active temporary to one stable temp per store, with document-size limits, under cooperating per-store locks.
- A successful scan/cleanup does not prove a total disk quota: legacy residues, unrelated files/logs, and directory contents beyond the scan threshold remain outside a global budget. If the scan exceeds the configured bound, the store fails closed rather than performing a partial cleanup.
- Heap is still not bounded by the 32 MiB Chronicle and 16 MiB Continuity serialized caps. Locks are per store, not for the full Nexo operation; the standalone Chronicle CLI and public application/store APIs do not establish a global single-operation gate. Multiple processes can overlap. Do not invent a V8 heap multiplier.

**Entrypoint tracing is now complete.** The application accepts independent `continuityPath` and `chroniclePath`; CLI dispatch creates a child process; read-only queries, continuity-owner APIs, and store factories can enter outside one mutation workflow. Per-store locks do not provide an instance-wide lock, and deriving one from only one path would be bypassable.

Decision proposal now recorded: `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_AND_CONCURRENCY_DECISION_PROPOSAL_2026-10-23.md`, commit `3987e0656edf71369552e751f20a7bb2cec7e9ed`. It compares (A) a canonical instance root plus enforced shared admission across all entrypoints, (B) preserving independent-path APIs while keeping aggregate concurrency explicitly unbounded, and rejects a CLI-only lock as an incomplete guarantee. This proposal is not an owner decision and must not be treated as accepted.

**Next single task:** decide the instance-root contract before runtime changes: (A) introduce one canonical Nexo instance root that owns both store paths and a common operation lock, migrating all entrypoints coherently; or (B) preserve independent-path APIs and explicitly leave aggregate concurrency/heap without a strict guarantee. Do not implement a partial global lock or silently change CLI arguments. Total disk also remains OPEN because legacy and unrelated files are outside a strict global quota.

Canonical state unchanged: M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.

## 5. Existing audits/constraints that must not be repeated

- AB104.759R is the correct anchor, not .862R; AB104.999R→AB105.000R; AB104.151 boundary; P112 active; AB105.116R protected; TLC frozen; G0 W1/D1 UNKNOWN, not vulnerability; P34 closed; P35 load-failure/fallback/persistState.
- Do not repeat the closed AB104.147–AB104.150 / P112 prepared-checkpoint durability audit or AB104.214 effect-path durability research unless new code invalidates their findings.
- Do not repeat the owner/root/authority design review. Reuse:
  - `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`
  - `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`
  - `NEXO_NCS/BUILD/NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md`
  - `NEXO_NCS/BUILD/NCS_M0_E_OPTION_A_FILESYSTEM_TRUST_BOUNDARY_AUDIT_2026-10-21.md`
  - `NEXO_NCS/BUILD/NCS_M0_E_OPTION_A_OPERATION_EFFECT_ENFORCEMENT_MATRIX_2026-10-21.md`
  - `NEXO_NCS/BUILD/NCS_CHRONICLE_MUTATION_SURFACE_AND_TEST_OWNERSHIP_2026-10-23.md`
  - `NEXO_NCS/BUILD/NCS_CHRONICLE_OPTION_A_POLICY_RECONCILIATION_2026-10-23.md`
- Recent input guards address ordinary accessor/descriptors and malformed shapes; they do not neutralize Proxy traps. Do not add redundant guards without a new reproducible defect and an architecture-level trust decision.

## 6. Vision and project discipline

- The master architecture dated 2026-09-23 is a long-term destination, not a claim that every subsystem exists. Continue classifying items as 🟢 recovered, 🔵 extension, 🔴 conflict.
- Core/Constitution/Identity/World Model/Memory/Knowledge/Learning/Capabilities/Tools/Missions/Autonomy/Execution/Verification/Recovery/Chronicle/Continuity/Portability/Successor are part of the broad vision; build from the current proven frontier.
- Keep Nexo and Lúmina separate.
- Do not repeat explanations as a substitute for progress. Record what changed, what was actually verified, remaining blockers, and the single next action.
- User expects proactive continuation but has not authorized silently changing constitutional scope.

## 7. Current handoff status

- The handoff and STATUS are continuity records; neither alters runtime or constitutional state.
- Open Loops implementation+test SHA `962d1a327683b412c401f323514d401e7e8ec8f1` is verified by deterministic persistence/`npm test`, STEP 4, and STEP 5 workflows; see Section 4 and the Open Loops contract.
- Next chat should begin at `STATUS → MASTER/CORE → BUILD`, then continue the aggregate resource-budget frontier in Section 4A. Do not restart trust-boundary research or repeat the closed Open Loops CI check.


## 10. NUEVO CHECKPOINT — contrato de raíz de instancia (2026-10-23)

El propietario aceptó Opción A como **dirección de diseño**, no como autorización para implementar. No se cambió runtime, tests ni workflows.

Diseño documental:
- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`
- Commit: `01d9e11544df480a29d1a375052e53e4f7a7b7a9`
- Blob: `12bdfc0ff2c97b79a479d263c4073b32ea8915a5`
- URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md

Hallazgos de inventario inicial:
- `scripts/nexo.mjs` parsea `--continuity` y deriva Chronicle append a un child.
- `scripts/nexo-chronicle-session.mjs` acepta `--continuity` y `--chronicle` por separado.
- `runNexoChronicleAppend` abre ambos stores y Continuity owner.
- `continuity-queries.mjs` expone status, mission status, plan, draft preview y Open Loops por ruta independiente.
- `mission-request-preview.mjs` delega al preview; `continuity-service.mjs` abre/initializa Continuity.
- `createNexoContinuityStore` y `createNexoChronicleStore` son factories de bajo nivel con locks por archivo; son bypass potencial si producción los llama sin admisión.
- Las sesiones repair/runtime y workers de tests requieren clasificación explícita. El inventario del documento es inicial, no prueba que no existan más callers.

Contrato propuesto: una única raíz de configuración confiable por instancia, derivación única de rutas, ninguna combinación silenciosa con paths independientes, admisión compartida entre procesos antes de cargar snapshots, error fail-closed ante timeout/propiedad incierta, y preservación de locks per-store/protocolo `.tmp`. La raíz no es identidad/autoridad constitucional.

Pendiente antes de implementar: cerrar precedencia CLI/API/env; política de raíz inexistente; symlink/alias; alcance exacto de sección crítica; protocolo cross-process y orden de locks; reentrancia; códigos de error y release failure; compatibilidad legacy y migración de datos; callsite matrix completa. Ejecutar tests de procesos separados, timeout sin mutación, no-bypass y CI sobre SHA exacto cuando haya autorización de implementación.

**No implementar runtime por ahora.** Heap exacto y cuota global de disco siguen OPEN. Estado canónico sin cambio: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


## 11. Inventory sweep follow-up — instance-root design

Updated design document:
- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`
- Latest inventory update commit `d80993dc77075f24dd6ffe23946b034ef4a85589`, blob `2c3b031ac3cd361fffc672342a34b5d4568432f3`.

Second pass inspected all current `.mjs/.js` modules under `src/nexo/` and all `scripts/nexo*.mjs`. Direct store factory construction was found in application append/query and continuity-service; additional consumers include chronicle effect adapter, continuity owner, owner-backed runtime, repair entrypoint/session, dispatch, settlement and mission verification. These consumers must inherit the operation-level admission; they must not add nested lock acquisition or infer authorization from the root. Repair/dispatch remains under its existing constitutional gate.

The design doc now separates known production entrypoints, indirect store consumers, low-level factories, adapters, and test workers. Do not call the inventory mathematically complete yet: D1 requires a saved caller matrix including reexports/dynamic imports and an automated no-bypass regression. No runtime/tests/workflows changed.


## 12. D0 subdecision proposals and lock protocol (2026-10-23)

Updated design document:
- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`
- Commit `3221b254b1121930373787d30565d7c5482f2443`, blob `d2f027f51ace2913eac7c0e289a9a016d6bee9d6`.

The design now proposes (not owner-decided): explicit CLI --root; no environment variable in first migration; reject missing root except separate explicit bootstrap; realpath canonicalization for cooperating symlink aliases; exclusive admission for reads/previews that materialize snapshots; non-reentrant admission with context passed to helpers; monotonic timeout contract; fail closed on stale/uncertain/release failure; no automatic merge/dual-write during data migration.

Lock protocol review: Chronicle and Continuity both use per-store lock directories with PID/token owner records, monotonic deadlines and stale-lock fail-closed handling, but differ in local release-failure tracking. Do not blindly copy or declare equivalence; specify one reusable contract and test before runtime changes.

D1 remains OPEN. GitHub code search returned no usable matches in this session. Inventory is based on recursive tree review and relevant file reads, not exhaustive source grep. No local checkout was available/confirmed for running rg. Do not claim the caller matrix is complete.

Next: complete the callsite matrix from an exact branch checkout and ask owner to close D0 subdecisions before any implementation. Runtime, tests, workflows, CLI paths and store APIs remain unchanged.


## 13. Nuevo checkpoint — recomendación consolidada D0 (2026-10-23)

El propietario indicó que prefiere que el asistente recomiende la combinación técnica más conveniente en lugar de elegir entre opciones de implementación. El contrato ahora registra la recomendación consolidada, sin atribuirle aceptación específica ni autorización de runtime:
- CLI `--root`, API con instancia validada, sin env var en la primera migración.
- Rechazo de raíz inexistente por defecto; bootstrap separado.
- Admisión cross-process reusable en la frontera de operación; conservar locks per-store hasta demostrar compatibilidad.
- Migración dry-run, copia verificable y corte explícito; sin merge, dual-write ni borrado automático del origen.
- `realpath` para raíz existente; documentar límites frente a symlink TOCTOU hostil y mount aliases no demostrados.
- Lecturas/previews que materialicen snapshots bajo admisión exclusiva; lock no reentrante con contexto heredado.
- Timeout bounded y fail-closed en ownership/liberación inciertos; no recuperación automática de locks stale.
- Sin fallback silencioso de rutas legacy; factories low-level no deben servir de bypass productivo.

Fuente: [contrato de raíz de instancia y plan verificable](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md).

Próximo trabajo: continuar D1 con evidencia disponible del árbol/archivos del branch, distinguiendo claramente el inventario revisado de una búsqueda local exhaustiva. No declarar D1 cerrado mientras no exista matriz completa reproducible con SHA y prueba automatizada de no-bypass. Runtime, tests y workflows siguen sin cambios. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


## 14. D1 follow-up — remote production module sweep

A recursive Git tree fetch of ncs-clean-architecture was not truncated. All 44 current code files under src/nexo/ and scripts/nexo*.mjs were opened and scanned for store factories, owner openers, independent paths, CLI flags, and store operation calls. Findings and exact tree/blob SHAs are recorded in Section 13 of the instance-root contract.

Confirmed entrypoints: scripts/nexo.mjs (Continuity CLI for queries/previews); scripts/nexo-chronicle-session.mjs (separate Continuity/Chronicle paths); chronicle-append.mjs (constructs both stores and opens owner); continuity-queries.mjs (five read-only queries/previews construct stores); continuity-service.mjs (owner open/load/initialize); indirect consumers in repair entrypoint/session/dispatch/settlement/verification, Chronicle effect adapter and owner-backed runtime.

Ten related tests were sampled and show direct factories/per-store locking are extensively used as primitive tests; this does not prove production has no bypass. D1 remains OPEN: no full local checkout rg artifact, no exhaustive scan of all repo files/reexports/dynamic imports, and no automated architecture/no-bypass test. Do not label the caller matrix complete. No runtime/tests/workflows changed. Canonical state unchanged.


## 15. D2 — proposed instance admission lock contract

The store sources and lock-deadline helper were read from the current branch. Chronicle and Continuity have separate per-store lock implementations with materially different release-failure behavior: Continuity retries once and maintains an in-process failed-release Set; Chronicle does not implement that same policy. Both stores' loadCurrent() reads do not acquire per-store locks. The deadline helper uses performance.now() and a default 2000ms budget; absolute deadlines must not be copied across processes.

Design recommendation recorded in Section 14 of the instance-root contract: add a root-level exclusive operation admission layer; retain per-store locks initially; fixed acquisition order root then store; one admission boundary per operation; no nested/reentrant root lock; no automatic stale-lock reclamation; no claims of authority, hostile-process protection, fsync durability or network filesystem safety. Proposed lock errors are internal draft, not a finalized public API.

D2 remains OPEN until call graphs for repair/runtime are mapped, a single owner is chosen for admission in Chronicle parent/child flow, and release-uncertain/no-bypass tests are specified. No runtime/tests/workflows changed. Canonical state unchanged.


## 16. D2 follow-up — entrypoint call graph and lock owner

Section 15 of the root contract now maps observed calls for status/mission queries/previews, Chronicle append, continuity owner bootstrap, repair protocol, settlement/verification, and indirect adapters/runtime. Recommended lock owner for the current Chronicle CLI is the child process executing runNexoChronicleAppend; do not acquire the same root lock in both parent and child, and never transport absolute performance.now() deadlines across processes. Queries/previews must also use the instance admission boundary because they read mutable persisted state. Helpers inside an admitted operation should receive context and not reacquire the root lock.

Important scope guard: repair modules still exist and export store access, but scripts/nexo-runtime-session.mjs currently blocks runtime repair with NEXO_M0_OPTION_A_EFFECT_EXCLUDED. Root work must not reactivate or widen this excluded path.

D2 remains OPEN pending full caller inventory and explicit tests for operation-wide exclusion, process concurrency, release uncertainty, no reentrancy, no-bypass, read-only query semantics, and preserved repair exclusion. No runtime/tests/workflows changed. Canonical state unchanged.



## 17. D2 follow-up — admission result and uncertain release semantics

The root contract now has Section 16. It separates business outcome from root admission; a lock acquisition failure prevents the operation from starting; business failure remains the business result if release is confirmed; and release uncertainty must never be surfaced as clean success or trigger automatic re-execution. `writeStarted` is conservative and does not prove external effects completed or did not partially occur. Candidate codes remain internal drafts pending consumer compatibility review.

Verification matrix now explicitly covers invalid root, timeout, corrupt/unknown/stale owner, read-only snapshot operations, business blocked/conflict, exception, release failure after possible write, ownership loss, same-root contention, different-root independence, Chronicle child-only ownership, no-bypass and preservation of `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.

The new section does not close D2 or D1. Next: inspect all consumers of existing operation result shapes and the indirect caller edges; record a reproducible caller matrix with current branch SHAs; then define automated no-bypass/concurrency/release-uncertain tests. No runtime, tests, workflows or CLI changed. Canonical state remains M0 INCOMPLETO; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.

Updated contract: [NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md](NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md).



## 18. D2 follow-up — existing result compatibility and indirect callers

Section 17 of the root contract records the current result contracts from continuity queries, Chronicle append, continuity-service, the narrow application export, Chronicle effect adapter, owner-backed runtime and repair modules. The important compatibility rule: preserve business states such as `loaded/not_found` and Chronicle's `completed/blocked/conflict/unknown/observed/invalid`; root admission is not authorization. The runtime repair gate remains `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` and must not be bypassed.

The review used these exact branch blobs: continuity queries `e1915e94e53e71d37a37952fead37ba62bdae79a`; Chronicle append `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`; continuity service `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`; application index `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`; Chronicle adapter `6daf742eb0048724557151a728bf807613a854e9`; owner-backed runtime `a7a014489209273ce78d0103afa785728d4c467c`; repair entrypoint `74d0fa92c447034e7454b7b846d584819ac81ffd`; repair session `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5`; repair dispatch `ed45438be7604d3b341cecd5fbcfc69adda2447e`; settlement `2f6e91d494b4edb012c2b2db5a077b875c5b0348`; mission verification `6f9c58cac203faa65e23c1a076af4746f5c22324`; runtime gate `f67b6fbe1b6f0098ebf23b35055cc668f96df991`.

This is not an exhaustive caller matrix. GitHub code search yielded no usable matches in this session, so no absence-of-callers claim is justified. Next deliverable: reproducible matrix caller → entrypoint → store/owner/adapter → proposed admission boundary → current classification (production, primitive/test, excluded) → source SHA → bypass risk, then an automated no-bypass test design. D1/D2 remain OPEN; no runtime, tests or workflows changed. Canonical state unchanged.



## 19. Caller matrix — additional direct production entrypoint discovered

Contract Section 18 records a reproducible caller matrix based on the recursive Git tree for `ncs-clean-architecture`: tree SHA `cbf0a28c4c31ee1c0be55ad40f76e361d6152893`, `truncated=false`, 3,019 entries and 188 JS/MJS/CJS files. This is a complete path listing, not a completed semantic scan of every import edge.

Critical new finding: `scripts/assistants.mjs` directly opens `openNexoContinuityOwner`, records a mission, writes learning memory and persists environment state. Source blob SHA `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`; lines 47–54, 89–106, 109–122. Therefore migrating only `scripts/nexo.mjs` and the Chronicle CLI is insufficient. The composite workflow must be explicitly brought under a named instance operation/admission or explicitly kept outside the root-managed persistence boundary. In either case, no cross-file transaction/atomicity claim is permitted.

The matrix covers CLI queries/previews, Chronicle append, application API, request preview, assistants, continuity facade/service, store primitives, Chronicle effect adapter, owner-backed runtime, simulation runtime, repair protocol and the runtime repair exclusion gate. The latter must remain `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; root admission is not authority and must not enable protected transition.

Next: trace all imports of `scripts/nexo-continuity.mjs`, `openNexoContinuityOwner`, path-based application APIs, adapter registration and runtime exports; explicitly disposition the assistants workflow; then define architecture/no-bypass tests and close the migration protocol. D1/D2 remain OPEN; no runtime, tests or workflows changed. Canonical state unchanged.



## 20. Assistants/Lúmina integration boundary and no-bypass design

Contract Section 19 records that `scripts/assistants.mjs` has independent `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH` and `NEXO_CONTINUITY_PATH` overrides (source blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`, lines 19–25 and 47–54). Treat this as a composite Lúmina+Nexo integration. Do not silently move world-state or Lúmina learning memory under Nexo root, and do not claim cross-file transactionality. The exact Nexo sub-operation must be identified before implementation. Legacy independent path handling should become explicit migration-only once the instance API exists. The repair gate must remain `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.

Code search returned zero hits for several symbols directly confirmed in source. These results are a connector search limitation, not proof of no callers. The remaining call-graph closure needs a reliable tree/file scan or checkout-local search; D1 stays OPEN. Section 19 also specifies the static no-bypass architecture test contract: explicit production entrypoint allowlist, low-level factory/import restriction, root-only public API, admitted reads, one Chronicle lock owner, explicit disposition of assistants, and an invariant test for repair exclusion. Static checks are not substitutes for behavioral concurrency/release tests.

No runtime, tests or workflows changed. D1/D2 remain OPEN; canonical state unchanged.


## 21. Verified scope of existing architecture tests

The direct source review narrows the test gap. `tests/nexo/entrypoint.test.mjs` already performs a static local import/re-export walk from `scripts/nexo.mjs` and `scripts/nexo-chronicle-session.mjs`, checking the narrow application export list and separation from the legacy Lúmina/runtime modules. Blob SHA: `ff1bd2e9d292e21e00049b354249aee684837bbc`. It does **not** require an instance root, prevent path-oriented APIs from bypassing admission, or cover `scripts/assistants.mjs` as a composite entrypoint. Its current assertions explicitly accept independent `--continuity` / `--chronicle` paths.

`tests/nexo/assistants-runtime-cli.test.mjs` (blob SHA `2c4ffb83e3bb849ac35ec381b268ef4f74a13225`) does verify the repair exclusion gate remains blocked with `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, but it does not establish root admission. Preserve this gate. `scripts/nexo.mjs` uses `spawnSync` for Chronicle; the child that executes append must own the single future root lock.

Accurate gap statement: a partial architecture/isolation guard exists; the missing test is the separate canonical-root/no-bypass guard plus behavioral concurrency/release-uncertainty coverage. Do not add `scripts/assistants.mjs` to the Nexo-only import walker without a distinct composite Lúmina+Nexo contract. D1/D2 remain OPEN; no runtime, tests or workflows changed.


## 22. D3 follow-up — proposed instance API and assistants boundary

The root contract now specifies a candidate instance context: one validated explicit root; Chronicle/Continuity paths derived internally; an admission context that cannot be forged by a caller boolean; operation-wide root admission before persisted reads; helpers receive the admitted context without re-entry. First interface recommendation is \`--root\` only, no root environment override initially, existing directory required, and explicit root passed to the Chronicle child so only the child owns admission.

\`scripts/assistants.mjs\` is explicitly classified as a composite Nexo+Lúmina integration. World-state and Lúmina learning memory stay outside the Nexo root for this phase; only its Continuity sub-operation may be migrated behind the instance API. No cross-file atomicity is claimed. \`NEXO_CONTINUITY_PATH\` must not act as a production override in root-managed mode. Repair remains blocked by \`NEXO_M0_OPTION_A_EFFECT_EXCLUDED\`.

The contract adds migration gates for inventory, API, lock behavior, no-bypass, behavioral concurrency, dry-run/backup/cutover, authority safety and CI. These are design proposals only. D1/D2/D3 remain OPEN; runtime/tests/workflows/data stores unchanged; canonical status unchanged. Continue by closing exact source callers and the remaining lock/canonicalization decisions, not by implementing prematurely.


## 24. Source-level lock constraints confirmed

Both store loadCurrent() methods read and clone persisted state without per-store lock acquisition; opening the Continuity owner may read, initialize if explicitly allowed, and reread. Root admission must wrap the whole operation before the first read, including read-only queries. Preserve existing per-store lock implementations and their release behavior in the first root layer. performance.now() deadlines are process-local; the Chronicle child must create its own deadline from a duration. Normal reads must not silently initialize missing stores or project legacy memory. Repair remains blocked by NEXO_M0_OPTION_A_EFFECT_EXCLUDED. Required tests are recorded in Section 22 of the root contract. D1/D2/D3 remain OPEN; no runtime, tests or workflows changed.


## 25. Caller matrix and root canonicalization proposal

The root contract now includes a source-SHA caller matrix for the main CLI, Chronicle child, application append, path-based query API, Continuity compatibility re-export, assistants composite integration, and low-level store factories. These are verified direct boundaries, not proof of a fully closed indirect call graph. GitHub code search returned zero matches for known existing symbols, so those negative results are explicitly excluded as evidence.

Canonicalization proposal: require an existing directory, canonicalize with realpath before deriving fixed store filenames, converge symlink aliases to the same canonical path, reject mixed root/legacy-path arguments, do not create stores during ordinary reads, and fail closed on corrupt or unknown root-lock state without automatic deletion. realpath does not solve hostile-process TOCTOU, mount aliases, hard-link aliases or network filesystem semantics; no such protection is claimed.

D1 remains open until indirect callers, package scripts and child process construction are accounted for and result compatibility is reviewed. D2/D3 remain open; runtime/tests/workflows unchanged.


## 26. Package entrypoints and repair exclusion inventory

The package manifest confirms two user-facing command entrypoints: `nexo` runs scripts/nexo.mjs and `assistants` runs scripts/assistants.mjs. The serial test command includes root-bootstrap, store/runtime, entrypoint, continuity, repair crash-cut, and Open Loops tests. These package commands must be part of the production entrypoint allowlist.

The runtime-session gate still returns NEXO_M0_OPTION_A_EFFECT_EXCLUDED, while dedicated repair modules retain state-persistence paths. Classify them as blocked/internal repair tooling; root admission cannot authorize their use. D1/D2/D3 remain open; runtime/tests/workflows unchanged.


## 27. Existing guard and test semantics

The application index is intentionally narrow but persistence-backed APIs remain path-oriented. `tests/nexo/entrypoint.test.mjs` is an import-isolation and behavioral compatibility guard, not proof of root admission: it currently accepts separate `--continuity` and `--chronicle` paths. Preserve its behavioral invariants during migration: replay must not redispatch or change stored bytes; status/plan queries must not mutate Continuity; previews stay `persisted:false` and `dispatchAttempted:false`; authorization remains `NOT_EVALUATED`; the narrow Chronicle append action remains distinct from excluded repair.

`tests/nexo/root-bootstrap-protocol.test.mjs` tests P-256 signature vectors and rejection of altered inputs, not filesystem roots or locks. It is not root-admission evidence. Current CLI parsers have no `--root` option; the parent forwards parsed args to the Chronicle child, whose parser accepts independent Continuity/Chronicle paths. No tests were run during this documentation pass.


## 29. CLI process and assistants composite boundary

`scripts/nexo.mjs` handles query/preview commands in-process but delegates Chronicle append via `spawnSync` to `scripts/nexo-chronicle-session.mjs`. The child must be the sole root-lock owner for append; queries/previews also need admission before persisted reads. Current parsers accept independent paths, not `--root`. Existing entrypoint tests use path-oriented options, so migration must preserve their output/result and no-mutation guarantees while adding root-mode coverage and rejecting mixed/duplicate options before store access.

The `assistants` package command reads `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH`, and `NEXO_CONTINUITY_PATH`, opens Continuity through `nexo-continuity.mjs`, and includes `--nexo-repair-once`. Do not call it root-managed until Continuity uses an explicit instance operation. Keep simulation and Lúmina memory outside Nexo root. Repair remains blocked by `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; root admission is not repair permission. Documentation-only review; no tests executed and no runtime/test/workflow changes.

## 2026-10-23 — Continuación: matriz de CLI y fronteras de admisión

### Qué se hizo
- Inspección directa de `scripts/nexo.mjs`, `scripts/nexo-chronicle-session.mjs`, `src/nexo/application/index.mjs`, `src/nexo/application/chronicle-append.mjs`, `package.json` y `tests/nexo/entrypoint.test.mjs`.
- Se documentó el inventario de comandos, los contratos de resultado observados, las limitaciones de las pruebas actuales y diez grupos de pruebas negativas requeridas en el documento de contrato de raíz de instancia.
- Se actualizó `NEXO_NCS/STATUS.md` para que la puerta de entrada de continuidad refleje el nuevo hallazgo.
- Cambios solo documentales. No se tocaron fuentes, pruebas ni workflows; no se ejecutó CI ni pruebas locales. D1/D2/D3 siguen OPEN.

### Evidencia técnica concreta
- `scripts/nexo.mjs`: parser y router de consultas/vistas previas en el proceso padre; `chronicle-append` delega con `spawnSync` y `stdio: inherit`.
- `scripts/nexo-chronicle-session.mjs`: parser de sesión acepta `--continuity`, `--chronicle`, `--mission`, `--step` y flags de inicialización/stdin; no acepta `--root`.
- `src/nexo/application/index.mjs`: siete exportaciones concretas; no existe API pública genérica de dispatch.
- `src/nexo/application/chronicle-append.mjs`: resultado público sanitizado mantiene `authorization: NOT_EVALUATED`, `redispatchAuthorized: false` y, en los casos aplicables, fase de lock, `writeStarted` y liberación.
- `tests/nexo/entrypoint.test.mjs`: cubre lista estrecha de exports, grafo de imports estáticos, comandos desconocidos, códigos/salidas JSON, privacidad del payload, replay y propiedades de persistencia; no prueba root admission ni bloqueos de raíz.
- `tests/nexo/root-bootstrap-protocol.test.mjs`: pruebas de firma/protocolo P-256, no prueba de raíz de filesystem.

### Decisión arquitectónica derivada
La admisión de raíz debe ejecutarse antes de la primera lectura persistida. En las consultas/vistas previas el propietario es el proceso padre. Para `chronicle-append`, el hijo debe ser el propietario exclusivo del root lock durante toda la operación; el padre no debe retener el mismo lock mientras espera. La frontera de admisión no puede convertir `validated` en autorización, ni habilitar reparación o efectos protegidos.

### Siguiente secuencia obligatoria
1. Terminar el inventario de todos los entrypoints y vías de acceso: `assistants.mjs`, `nexo-continuity.mjs`, repair/runtime helpers, reexports, imports dinámicos, `spawn`/`spawnSync` y scripts de package.
2. Construir tabla por comando con argumentos admitidos, errores de parseo, códigos de salida, JSON estable y si hay lectura/escritura antes de la frontera.
3. Cerrar D1: inventario de callers y no-bypass con evidencia de import/call graph; no aceptar búsquedas de código con cero resultados como prueba de ausencia.
4. Cerrar D2: semántica de root lock, propietario por operación, timeout, lock corrupto/obsoleto, liberación incierta e interacción con locks de Continuity/Chronicle.
5. Cerrar D3: contrato de instancia, CLI `--root`, compatibilidad/rechazo de rutas legacy y protocolo explícito de bootstrap/migración.
6. Solo después de cerrar las tres puertas, proponer cambios runtime y pruebas de regresión; mantenerlos en un cambio acotado y auditable.

### No repetir
No reiniciar auditorías antiguas ni retomar Step 7 como tarea principal. No afirmar root admission implementado, no afirmar pruebas ejecutadas, no inferir ausencia de bypass a partir de búsquedas que no recorren el repositorio. Mantener autorización `NOT_EVALUATED`, root legítimo `PENDING/UNKNOWN`, efectos protegidos `STOP`.


## Hallazgo adicional de caller: `assistants.mjs`

Fuente revisada: `scripts/assistants.mjs`, blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`.

Este comando usa `NEXO_CONTINUITY_PATH` o `.nexo-continuity.json`, abre Continuity directamente mediante el reexport `scripts/nexo-continuity.mjs`, registra misión con `continuity.owner.recordMission`, escribe `NEXO_LUMINA_MEMORY_PATH`/ `.lumina-assistant-memory.json` y persiste `NEXO_STATE_PATH`/ `world-state.json`. Es una secuencia compuesta con persistencia en varios almacenes; no se vuelve root-managed por añadir `--root` al CLI principal.

No envolver automáticamente todo el comando en root lock: eso sería una decisión arquitectónica nueva que podría cubrir trabajo de Lúmina y varias persistencias con semánticas propias. D1 debe determinar si `assistants` queda explícitamente fuera del contrato de instancia, si se bloquea su persistencia Nexo o si se integra mediante API explícita con límites claros. En cualquiera de los casos, Lúmina memory y world state no se mueven silenciosamente a la raíz de Nexo. `--nexo-repair-once` sigue excluido por `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.

Este es un caller confirmado, no evidencia de que el inventario completo de callers esté cerrado.


## Hallazgo de lectura: `loadCurrent()` no toma los locks de store

Verificado en `src/nexo/core/continuity-store.mjs` (blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`) y `src/nexo/core/chronicle-store.mjs` (blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`): `loadCurrent()` lee y devuelve el documento sin adquirir el lock de mutación. `src/nexo/application/continuity-queries.mjs` usa directamente ese método para status/mission status/plan/previews y expone también `loadNexoOpenLoops`.

Consecuencia: la admisión debe envolver la operación completa desde una frontera superior, antes de la primera lectura persistida. Añadir lock solo a mutaciones deja bypasses de lectura. No poner adquisición recursiva dentro de `loadCurrent()`; pasar contexto de instancia admitida a helpers. Mantener los locks existentes como capa separada hasta validar la interacción. Esto informa D2, pero no la cierra.


## Segundo caller adicional: `scripts/simulate.mjs`

El comando `simulate` de `package.json` también abre Continuity mediante `openNexoContinuityOwner`, con `.nexo-continuity.json`, `legacyMemory` y posible inicialización. Después persiste el estado del mundo en una ruta separada. Aunque no despacha misión, puede inicializar/reconciliar Continuity y no se debe tratar como bypass inocuo.

Su lock local es para world state, con política de recuperación distinta que puede borrar locks obsoletos. No usarlo como modelo para root admission. D1 debe decidir explícitamente si `simulate` se excluye de operaciones Nexo y deja de abrir Continuity, o se integra por API de instancia sin mezclar world state con Nexo. El inventario de callers sigue abierto.


## Recomendación de diseño pendiente para D1

No retener el root lock durante todo el pipeline de Lúmina. Candidato:
- `simulate` queda fuera de operaciones Nexo y deja de abrir/inicializar Continuity incidentalmente; bootstrap de Nexo será explícito.
- `assistants` puede construir una misión candidata desde informes externos, pero lectura y escritura de Continuity deben pasar por API de instancia. Admitir lectura, hacer análisis sin lock, y realizar escritura condicional contra la revisión observada; si cambió, conflicto explícito sin retry silencioso.
- World state y memoria Lúmina permanecen fuera de la raíz Nexo.
- No tratar el registro de una misión como autorización ni ejecución.

Es recomendación documentada, no decisión cerrada ni implementación. Antes de cerrar D1, terminar inventario de callers y vías de import/reexport; luego revisar si hay más callers productivos fuera de `simulate`, `assistants` y la API de aplicación.


## Migración legacy y clasificación de repair

`tests/nexo/continuity-migration.test.mjs` confirma que `openNexoContinuityOwner({ legacyMemory })` puede migrar memoria legacy a la store canónica. Por tanto, `simulate`/`assistants` pueden inicializar o migrar Continuity incidentalmente; D3 debe convertir ese comportamiento en una operación explícita, no en compatibilidad automática invisible.

`scripts/nexo-repair-entrypoint.mjs` es un helper exportado, no un CLI de package. El camino productivo de `assistants` pasa por `scripts/nexo-runtime-session.mjs`, que hoy devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` sin dispatch ni persistencia. Mantener los helpers de repair fuera de la API de instancia y sin permiso de efectos. No confundirlos con los callers productivos `simulate`/`assistants`.


## Matriz de errores CLI exactos añadida

El documento de contrato ahora registra errores de argumentos y opciones requeridas para `status`, `mission-status`, `mission-plan`, `mission-draft-preview`, `mission-request-preview` y sesión hija Chronicle. También distingue parse error, `not_found`, root admission y fallo de spawn. Preservar esos contratos o documentar explícitamente la transición al futuro `--root`; el padre Chronicle hoy delega la validación de argumentos al hijo.


## Bypass crítico adicional: el hijo Chronicle puede ejecutarse directamente

`scripts/nexo-chronicle-session.mjs` tiene una guarda de ejecución directa, así que `node scripts/nexo-chronicle-session.mjs ...` evita el router padre. Su parser acepta rutas legacy y flags de inicialización. La no-bypass boundary debe exigir `--root` en el hijo, derivar rutas internamente y tomar el root lock antes de preflight/lecturas; el padre no lo toma. Añadir prueba negativa que invoque el hijo directamente con rutas legacy y compruebe que no lee ni crea archivos. Esto mantiene D1/D3 OPEN.


## Matriz de no-bypass de producción y cierre de D1

El contrato de raíz ahora contiene la matriz de tratamiento propuesto para ocho superficies: CLI principal; hijo Chronicle ejecutable directamente; `assistants`; `simulate`; API de aplicación path-based; reexport `nexo-continuity.mjs`; fábricas de store; helpers de repair. Define también el límite de amenaza: guardas de arquitectura para código de producción cooperativo, no aislamiento contra un proceso local hostil que pueda ejecutar/importar cualquier módulo.

**D1 sigue OPEN.** Cierre solo después de aprobar el tratamiento de cada superficie, enumerar callers productivos, retirar paths de la API pública y tener pruebas arquitectónicas contra acceso directo a stores; las pruebas deben invocar directamente el hijo Chronicle y cubrir `simulate`/`assistants`.


## Hueco D3: archivos store internos pueden ser symlinks fuera de root

`realpath(root)` no impide que `root/continuity.json` o `root/chronicle.json` sean symlinks hacia archivos externos; los stores actuales siguen symlinks al abrir. Antes de cerrar D3, decidir/testear rechazo de symlinks en nombres reservados, exigir archivos regulares cuando existan y rechazar un root-lock symlink/objeto inesperado. Añadir casos para symlink externo/roto, conflictos file-directory y root aliasado. Esto sigue sin proteger contra TOCTOU de proceso local hostil.


## Candidato concreto D2 para el root lock

Se recomienda `<root>/.nexo-instance.lock/` como directorio reservado creado atómicamente por `mkdir`, con `owner.json` mínimo (`pid`, token, `createdAt`). No agregar instance IDs/colas/leases. Owner corrupto o estado desconocido: fail-closed. Stale lock: recuperación explícita, nunca borrado automático. Liberación: comprobar token antes de retirar el directorio; incertidumbre bloquea éxito limpio y reuso local. Deadline monotónico se crea en cada proceso a partir de una duración, nunca se pasa absoluto por IPC. Es candidato, no protocolo aprobado; D2 sigue OPEN.


### D2 candidato de lock — parámetros aún por verificar

El documento de contrato propone, sin aprobar ni implementar: espera relativa 2000 ms, polling 10 ms, stale si edad >60 s y PID no vivo, ningún borrado automático, owner acotado por `NEXO_RESOURCE_LIMITS.lockOwnerBytes`, owner regular (no symlink), liberación con token y como máximo un intento adicional de limpieza. Si release sigue incierto, cuarentena local por raíz hasta que la ruta desaparezca; nunca repetir automáticamente la operación de negocio. Tests requeridos: PID vivo/muerto, owner ausente/corrupto, reemplazo de lock, timeout, fallo de release y recuperación externa.


## Censo estático externo parcial

Se inspeccionaron los 13 scripts y los 45 archivos JS/MJS/CJS de `src/` fuera de `src/nexo/` en el árbol no truncado `6c5ad80d49bb592f0d6d1f5e6ab161d489731241` (3.019 entradas, 188 archivos JS/MJS/CJS). Los callers directos externos encontrados se concentran en el CLI principal, el hijo Chronicle, `simulate`, `assistants` y el reexport `nexo-continuity.mjs`. `src/assistants/memory.js` tiene registros Nexo legacy en memoria, no acceso directo a stores. Este censo no cierra D1: falta un allowlist arquitectónico probado y revisar los módulos internos path-based como frontera de producción.


## D2 design conflict: root lock primitive reuse

No silently resolve the tension between (1) keeping the current Continuity/Chronicle locks intact until compatibility is proven and (2) avoiding a third duplicated lock implementation. Source shows Continuity retries release once and keeps a per-path local failure set; Chronicle does not. Compare:
- A: independent root-lock primitive, lower initial change radius but a third maintained protocol.
- B: shared directory-lock primitive with policy adapters, less duplication but requires characterization tests proving unchanged codes, timeout, stale handling, release retry/quarantine and persistence result semantics.

Recommendation: write the behavior matrix and characterization tests first; choose B only if the policies can be represented cleanly without broadening the abstraction or changing observable behavior. Otherwise document A as deliberate separation with independent tests. D2 remains OPEN; no runtime/test changes yet.


### Store-lock characterization matrix added

Contract now compares existing Continuity vs Chronicle lock semantics: owner metadata shape, stale/corrupt handling, timeout, token mismatch, transient/persistent release failure, local quarantine, and unlocked reads. Tests reviewed: `tests/nexo/continuity-store.test.mjs` SHA `c3af56077b94c8d641979e0853de7f70fa45d82f`; `tests/nexo/chronicle-store.test.mjs` SHA `8e182932ae98ad40c3655f6be3bf5e0585bfac26`. Characterization tests must precede any shared-lock refactor. No tests were run.


## Censo ampliado de referencias Nexo en código de aplicación — 2026-10-23

Se terminó la pasada de los 34 módulos bajo `src/nexo/`, además de los 13 scripts y los 45 archivos JS/MJS/CJS de `src/` fuera de `src/nexo/`. El árbol contiene 3.019 entradas y no está truncado. El censo está limitado al código de aplicación/runtime; no declarar que los 188 archivos JS/MJS/CJS de todo el repositorio, incluidos tests/tooling/fixtures, hayan sido auditados como grafo completo.

### Ocho categorías cubiertas
1. CLI principal `scripts/nexo.mjs`: rutas legacy, todavía sin `--root`.
2. Sesión hija Chronicle: ejecutable directamente; acepta rutas legacy.
3. API de aplicación path-based: `chronicle-append.mjs`, `continuity-queries.mjs`, `mission-request-preview.mjs`, reexports de `application/index.mjs`.
4. Servicios/stores filesystem: `continuity-service.mjs`, `continuity-store.mjs`, `chronicle-store.mjs`, lector acotado `resource-limits.mjs`.
5. Owner/runtime/modelo de memoria: owner-backed runtime y contratos operan con owner/snapshot; no se identificó otra apertura directa de stores fuera de los puntos de categoría 3/4.
6. Adaptadores y efectos: Chronicle, observación, commit, repair observation, effect/simulation adapter y protected transition; no confieren autoridad por sí mismos.
7. Memoria legacy y comandos compuestos: `src/assistants/memory.js` conserva `memory.nexo` en memoria; `assistants.mjs` y `simulate.mjs` abren Continuity y pueden inicializar/migrar con `legacyMemory`.
8. Pueblo/aldea, mundo y vendor visual: `src/village*.js`, `src/world.js`, `src/simulation.js`, `src/main.js`, `src/main-stable.js` no muestran acceso directo a stores Nexo. `lumina-world-v*` es almacenamiento del mundo visual. `src/three.core.js` sí existe en Git (1.403.455 bytes); que el fetch de texto no devolviera contenido no significa que falte. Excluir vendor Three.js y falsos positivos léxicos como `transmission`.

### Puntos de acceso conocidos
- CLI principal y sesión hija Chronicle directa.
- `assistants.mjs`, `simulate.mjs` y reexport legacy `nexo-continuity.mjs`.
- API path-based bajo `src/nexo/application/**`.
- `continuity-service.mjs`, `continuity-store.mjs`, `chronicle-store.mjs`.

El censo mejora el inventario, pero **no cierra D1**: falta convertirlo en allowlist arquitectónico de callers/imports de producción y probar que ningún entrypoint alcanza stores por ruta sin una instancia admitida. Los módulos son importables; esto no es aislamiento contra código local hostil. No se modificaron runtime/tests/workflows ni se ejecutaron pruebas.

### Continuidad obligatoria
1. Leer `NEXO_NCS/STATUS.md` y este handoff antes de continuar.
2. Completar el grafo de callers/imports de producción y un allowlist que distinga producción, tests, fixtures y helpers internos.
3. Resolver tratamiento de `simulate` y `assistants` sin mezclar world state/Lúmina con la raíz Nexo.
4. Cerrar D1; después cerrar D2 (root lock vs locks de stores) y D3 (API `--root`, symlinks, migración/bootstrap).
5. Solo después de D1/D2/D3, proponer cambios acotados de runtime y pruebas. Mantener autorización `NOT_EVALUATED`, root legítimo `PENDING/UNKNOWN`, efectos protegidos `STOP`.


## Artefacto de censo con inventario por ruta y blob SHA

Se creó el archivo independiente `NEXO_NCS/RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md` para conservar el censo más allá de esta conversación. Incluye las 13 entradas JS/MJS/CJS de `scripts/`, los 34 módulos de `src/nexo/` y los 45 archivos JS/MJS/CJS de `src/` fuera de `src/nexo/`, con ruta, blob SHA, bytes y clasificación. Snapshot de commit `f105a3a6b88c372d22aed49d29ea56d2d17ade78`; árbol no truncado. No presenta los 188 archivos JS/MJS/CJS del repo como si todos hubieran sido auditados.

URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md

### Próxima acción exacta
No repetir el censo de aplicación. Usar el manifiesto para construir un allowlist arquitectónico verificable de imports/callers de producción, separado de tests, fixtures y helpers internos. Debe cubrir CLI principal, hijo Chronicle invocable directamente, `assistants`, `simulate`, reexport legacy, API path-based y fábricas filesystem. Diseñar las pruebas que fallen ante un bypass nuevo; luego cerrar D1. D2 y D3 siguen abiertos y no se toca runtime/tests hasta cerrar las tres puertas.


## Borrador de allowlist D1 creado y enlazado

Archivo: `NEXO_NCS/RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`  
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md

El documento define entrypoints actuales (`nexo`, `assistants`, `simulate`, más el hijo Chronicle invocable directamente), API de instancia objetivo, primitivas path-based que deben quedar internas, tests que pueden importar internals y reglas para un test arquitectónico. Se inspeccionaron los imports de los 45 tests `tests/nexo/**` y los 50 tests restantes; estos últimos no mostraron imports directos a stores/API Nexo.

**No se cerró D1:** sigue faltando prueba arquitectónica ejecutable de imports/reexports transitivos, imports dinámicos/computados, spawn/spawnSync y ejecución directa, con fixtures negativos de bypass. No ejecutar cambios de runtime antes de cerrar D1/D2/D3.


## Extensión final del censo estático: tests y comandos npm

Se revisaron imports estáticos de los 45 tests `tests/nexo/**`, los 50 tests restantes y `functions/api/capture.js`, completando la pasada de imports estáticos conocidos sobre los 188 archivos JS/MJS/CJS del snapshot. Los tests Nexo importan internals intencionalmente y deben quedar bajo `TEST_ONLY`; los 50 tests restantes no mostraron imports directos a stores/API Nexo. `package.json` expone `nexo`, `assistants`, `simulate` y `test`; el hijo Chronicle es un entrypoint adicional porque se puede invocar directamente.

Esta pasada **no** demuestra cierre frente a imports dinámicos/computados, `spawn` indirecto ni todos los mecanismos de ejecución. D1 sigue OPEN hasta que el test arquitectónico del allowlist pruebe esos límites con fixtures negativos. El censo asociado quedó ampliado en `RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md`; el allowlist propuesto está en `RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`.


## Escaneo dinámico de aplicación registrado

Se buscó `import(...)`, `require`/createRequire, `eval`/Function, procesos hijos y guards directos en los 13 scripts, 34 módulos `src/nexo/**` y 45 módulos externos de `src/**`. Hallazgos: `scripts/nexo.mjs` es el único proceso hijo productivo observado y usa `spawnSync` para ejecutar la sesión Chronicle; los guards directos relevantes son `nexo.mjs`, `nexo-chronicle-session.mjs` y `simulate.mjs`. No hubo import dinámico/require/eval en scripts o `src/nexo/**`; `src/three-remote.js` tiene un `import(url)` para Three.js, no conectado a Nexo.

El detalle está en `RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`. Esto no cierra D1: falta el test arquitectónico que proteja esos hallazgos contra cambios futuros y cubra el grafo transitivo.


## Mecanismos dinámicos y workers de tests clasificados

El escaneo de los 95 tests encontró procesos `spawn`/`spawnSync` en los tests de CLI, stores y concurrencia, y un import dinámico con URL de entorno en `tests/nexo/continuity-store.test.mjs`; todo es TEST_ONLY. Otros imports dinámicos en tests cargan memoria, `society.js` o `node:fs/promises`. No se encontró import dinámico de stores en código productivo; `src/three-remote.js` carga Three.js con `import(url)`. Se añadió la clasificación al allowlist borrador. No cerrar D1 hasta implementar y probar el test arquitectónico.


## Conflicto de secuencia D1: diseño vs implementación

Se documentó un ciclo previo: D1 requería el test arquitectónico ya ejecutado para cerrar, mientras que la regla prohibía modificar tests antes de cerrar D1/D2/D3. El contrato y el allowlist ahora proponen separar:
- `D1-DESIGN`: inventario, tratamiento por superficie, allowlist y test spec/fixtures completos; puede cerrarse como diseño, sin afirmar seguridad implementada.
- `D1-IMPLEMENTATION`: implementar y ejecutar el test arquitectónico después de cerrar D1/D2/D3 de diseño.

La separación es recomendación pendiente, no decisión aceptada. No cambiar estado de gates ni tocar runtime/tests hasta resolverla. La especificación propuesta cubre imports transitivos, imports dinámicos/computados, procesos hijos, hijo Chronicle directo y callers legacy.


## Hallazgo de cobertura de tests para no perder

El `package.json` actual tiene 44 archivos `tests/nexo/*.test.mjs`; `npm test` invoca 27 y omite 17. La lista exacta está en `RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`. No asumir que todas las omisiones son bugs: determinar propósito/dependencias una por una. La futura prueba arquitectónica D1 debe quedar enlazada explícitamente a la verificación requerida; archivo presente pero no ejecutado no es evidencia.


## RECUPERACIÓN TRAS INTERRUPCIONES — 2026-10-23 12:42 (punto exacto)

El usuario pidió detener la exploración y guardar el último punto para un chat nuevo, sin perder hallazgos ni repetir auditorías. Continuar desde aquí con la palabra clave de chat nuevo **NCS**.

### Punto exacto de trabajo
Se estaba terminando el censo de referencias/callers de Nexo en todo el repositorio y trasladando los hallazgos a los documentos de contrato, STATUS y handoff. El trabajo más reciente logró actualizar el contrato principal con una **matriz de fronteras de producción y tratamiento propuesto**. El último cambio se escribió en:
- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`
- Sección añadida: **“Matriz de fronteras de producción y tratamiento propuesto”**.
- Incluye `scripts/nexo.mjs`, sesión Chronicle ejecutable directamente, `assistants.mjs`, `simulate.mjs`, API pública de aplicación, reexport de Continuity, fábricas path-based y helpers repair; define además el límite de amenaza y las condiciones verificables de cierre D1.
- El último fetch del contrato mostró además una sección posterior sobre el conflicto de secuencia entre cerrar D1 y prohibir cambios de tests. Propone separar **D1-DESIGN** de **D1-IMPLEMENTATION** para evitar un ciclo lógico. Esto es recomendación pendiente, no decisión aprobada.
- No se modificó runtime/tests/workflows ni se ejecutaron pruebas.

### Últimos hallazgos que deben preservarse
1. `scripts/nexo-chronicle-session.mjs` se puede ejecutar directamente y acepta rutas legacy `--continuity`/`--chronicle`; el router padre no es frontera suficiente. Debe exigir raíz y adquirir lock en el hijo, antes de preflight/lecturas.
2. `src/nexo/core/continuity-store.mjs` y `chronicle-store.mjs`: `loadCurrent()` lee sin adquirir lock de mutación. La admisión de raíz debe envolver la operación completa desde antes de la primera lectura; locks de store siguen como capa separada.
3. `scripts/simulate.mjs` abre Continuity mediante `openNexoContinuityOwner`, con `.nexo-continuity.json`, `legacyMemory` y posible inicialización/migración, y también persiste world state. Su lock local protege world state y tiene semántica distinta; no copiarlo como root lock.
4. `scripts/assistants.mjs` abre Continuity directamente y registra una misión, además de persistir memoria Lúmina y world state por separado. Propuesta: análisis Lúmina sin retener root lock; lectura de instancia admitida y escritura condicional por revisión; si hay conflicto, fallar explícitamente, sin retry silencioso. Lúmina/world state quedan fuera de la raíz Nexo.
5. `tests/nexo/continuity-migration.test.mjs` confirma que `openNexoContinuityOwner({ legacyMemory })` puede migrar memoria legacy al store canónico. Migración/bootstrap debe ser explícita y admitida, no incidental al ejecutar comandos legacy.
6. `scripts/nexo-repair-entrypoint.mjs` es helper importable, no CLI de package. El camino productivo `assistants` pasa por `scripts/nexo-runtime-session.mjs`, cuyo gate actual devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; no convertir root admission en autorización de reparación.
7. Las consultas de aplicación (status, mission status/plan, previews y open-loops) usan lecturas path-based. Proteger solo escrituras deja bypasses de lectura.
8. La matriz de errores de parseo se añadió al contrato: códigos actuales por comando y sesión hija Chronicle; diferenciar parse error, `not_found`, fallo de admisión y fallo de spawn. El padre Chronicle delega validación de opciones al hijo.
9. Existe un conflicto de proceso: exigir test arquitectónico para cerrar D1 pero prohibir tocar tests hasta cerrar D1/D2/D3 bloquea el avance. Recomendación pendiente: separar cierre de diseño y cierre de implementación.

### Estado real
- D1/D2/D3 siguen **OPEN**.
- M0 incompleto; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Todo lo reciente es documentación/código fuente leído, no implementación. No declarar CI ni tests ejecutados.
- No repetir auditorías históricas ya cerradas ni reabrir Step 7 como tarea inmediata.
- Próximo paso: recuperar y verificar el censo completo de referencias/callers Nexo y el estado de los tres documentos; resolver si se acepta la separación D1-DESIGN / D1-IMPLEMENTATION; luego cerrar inventario y allowlist con evidencia antes de cambiar runtime/tests.
- En el chat nuevo, leer primero `NEXO_NCS/STATUS.md`, luego el contrato de raíz, luego este handoff. Continuar exactamente desde la matriz de fronteras de producción/censo de callers; no reiniciar desde investigaciones antiguas.



## NUEVO CHECKPOINT — reconciliación D1 y alcance de admisión (2026-10-23)

Informe creado: `NEXO_NCS/BUILD/NCS_M0_D1_CALLER_RECONCILIATION_AND_LOCK_SCOPE_2026-10-23.md`, commit documental `254cd885637576ef997a5a389d65a6b645ab3f62`.

Este informe contrasta el contrato de raíz, censo y allowlist con fuentes concretas. Confirma que `assistants.mjs` lee world state, abre Continuity con `legacyMemory`, registra misión, persiste memoria Lúmina y luego world state; no hay atomicidad conjunta. `simulate.mjs` tiene lock propio con stale cleanup distinto y puede abrir/inicializar Continuity. No reutilizar ese lock como admisión de instancia; excluir simulación del modo persistente ordinario hasta definir un modo explícito. El hijo Chronicle sigue siendo invocable directamente y debe validar/adquirir admisión por sí mismo.

Contrato recomendado: admisión antes de la primera lectura persistida y durante la vida útil del snapshot protegido; orden único de locks: instancia → store(s), con liberación en orden inverso; helpers heredan contexto y no reentran. Mantener locks per-store hasta demostrar compatibilidad. La garantía se limita a exclusión entre procesos cooperantes con todas las entradas migradas; no es autoridad, sandbox ni límite exacto de heap/disco.

El informe especifica los casos mínimos para un test arquitectónico estático/negativo, pero no afirma que el grafo esté cerrado. El test no se implementó ni ejecutó; runtime, tests y workflows siguen sin cambios. D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

Siguiente acción única: terminar reconciliación de callers en checkout exacto y cerrar D1-DESIGN/D2/D3 como contratos documentales antes de autorizar cualquier cambio de runtime/tests. La separación D1-DESIGN vs D1-IMPLEMENTATION continúa siendo recomendación, no decisión del propietario.


## CHECKPOINT NUEVO — matriz de decisiones D0/D2/D3 (2026-10-23)

Documento creado: [NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md](NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md), commit documental `f352f7019b045d663bc8748d5173107827923f05`.

### Qué añade

- Matriz de 14 decisiones/contratos con recomendación, riesgo de alternativas y criterio verificable de cierre.
- D0: raíz explícita, bootstrap separado, alias/symlinks, migración legacy explícita.
- D1: secuencia D1-DESIGN/D1-IMPLEMENTATION aún requiere decisión; tratamiento propuesto de `simulate`, `assistants`, API path-based y factories.
- D2: sección crítica desde antes de la primera lectura, caracterización de locks antes de unificarlos, fail-closed en estados inciertos y admisión independiente del hijo Chronicle.
- D3: dry-run, manifiesto/hash, copia verificable, cutover explícito y rollback; garantías limitadas a procesos cooperantes.

### Qué no significa

No es aprobación del propietario, cierre de gate ni autorización de implementación. No se tocó runtime/tests/workflows y no se ejecutaron tests/CI. D0/D1/D2/D3 permanecen OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

### Siguiente acción

Continuar desde la matriz nueva, no repetir el censo. Convertir cada fila pendiente en contrato revisable; primero resolver la secuencia D1-DESIGN vs D1-IMPLEMENTATION y congelar interfaz de raíz/bootstrap. Mantener los números de timeout/stale y el primitivo de lock como candidatos hasta caracterizar tests existentes. No modificar runtime/tests hasta que las puertas de diseño estén cerradas explícitamente.


## CHECKPOINT 2 — caracterización de locks existente

La matriz de decisiones fue actualizada (commit `bc16b4dab13ef10acff4511698c5e978b58df52c`) con evidencia estática de `src/nexo/core/continuity-store.mjs` y `src/nexo/core/chronicle-store.mjs`.

Hallazgo que no debe repetirse sin cambio de blobs: aunque ambos usan directorio `<file>.lock`, `owner.json`, token, retry 10 ms y stale 60 s, sus contratos de liberación difieren. Continuity registra fallos persistentes de release, reintenta una vez e informa `released_after_retry`; Chronicle falla tras un intento y no tiene el mismo registro persistente. Los códigos públicos también difieren. Por ello, no unificar mecánicamente ni reemplazar locks existentes; especificar admisión raíz separada y preservar contratos por-store.

`tests/nexo/root-bootstrap-protocol.test.mjs` solo contiene vector software conocido; declara que no representa raíz de Nexo ni hardware/provisioning. No es prueba de autoridad.

Siguiente paso: completar D0/D1/D2/D3 como contratos documentales y reconciliar los callers que quedan UNKNOWN; no tocar runtime/tests hasta cerrar diseño. Estado: sin ejecución de tests/CI; D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


## 12. Continuation checkpoint — aggregate resource budget (2026-10-23)

New document:
- `NEXO_NCS/BUILD/NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md`
- Commit: `065df83a49ae853f8c93ca21919f545ac7322c25`
- URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md

Source limits confirmed: Continuity document 16 MiB; Chronicle document 32 MiB; 48 MiB combined serialized-document ceiling only, not heap. Per-collection, stdin and temporary-directory limits do not create an aggregate heap or total disk quota. Do not invent a heap multiplier. Aggregate heap and total disk remain OPEN / NOT DEMONSTRATED. Full-operation cross-entrypoint admission remains NOT IMPLEMENTED.

No runtime/tests/workflows changed and no tests/CI executed in this pass. Canonical state unchanged: M0 INCOMPLETO; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.

Next: reconcile the transitive caller graph against one exact source-tree snapshot, mark unresolved/dynamic edges UNKNOWN/BLOCKED, then close D0 subdecisions, D1-DESIGN sequencing, D2 admission scope and D3 migration before runtime changes.


## 13. D1 caller ledger and architecture-test specification (2026-10-23)

New document:
- `NEXO_NCS/BUILD/NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md`
- Commit: `a399cb77abfe397454ebd479d8068f1afdbc38df`
- URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md

Exact recursive tree snapshot checked before adding the document: tree SHA `74e044d2307f69350f7d5a46b01f43ee1c69061b`, not truncated, 2,982 tree entries; 121 code/config files identified in the scoped groups. This is not proof every semantic caller edge is classified. Re-read source hashes and current workflow/test invocation facts are recorded in the ledger.

Design findings: read-only queries materialize canonical snapshots, so they need admission if D2 intends a bounded live snapshot/heap profile per instance. Recommendation is to admit all snapshot-loading operations. `assistants` and `simulate` span other persistence domains and are not atomic merely because a root lock exists; exclude from ordinary instance entry until explicit design. Chronicle child is independently invocable and must validate/acquire admission itself; parent must not hold a non-reentrant lock while waiting for that child.

D1 architecture test remains unimplemented/unexecuted; no runtime/tests/workflows changed in this pass and no CI was run. Canonical status unchanged: M0 INCOMPLETO; D1/D2/D3 OPEN; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.

Next: finish caller-edge classification and close D0/D1-DESIGN/D2/D3 design decisions before any implementation. Preserve unresolved edges as UNKNOWN/BLOCKED.
