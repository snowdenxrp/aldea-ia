# NCS M0 — D1 entrypoint manifest and edge classification

Date: 2026-10-24
Branch: `ncs-clean-architecture`
Baseline commit: `fc0ecb289819a5392dcb1be4e4d356dc1d53cc72` (documentary cross-check; source files independently fetched from the named branch during this review)
State: D1-DESIGN OPEN — DOCUMENTARY ONLY — NO IMPLEMENTATION — NO TEST/CI

## Purpose and closure rule

This manifest consolidates the already-established production surfaces and their evidence sources. It is not a claim that the transitive graph is closed. A path is not admitted merely because it appears here; all unresolved dynamic/computed loader edges, external consumers, and execution boundaries remain `UNKNOWN/BLOCKED`. This document does not authorize runtime, test, workflow, or CI changes.

## Evidence snapshot

| Artifact | Observed blob SHA | What it establishes |
|---|---|---|
| `package.json` | `e45dc6d215db53ea2758009cd501f565634e3610` | Explicit scripts: `nexo`, `simulate`, `assistants`, and a chained `test` command including `tests/nexo/entrypoint.test.mjs`. |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | CLI direct-execution guard; query/preview routes; `spawnSync` to Chronicle child. |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Separately executable child; imports public append API; accepts direct store paths and initialization flags. |
| `scripts/nexo-continuity.mjs` | `f08969f2d77a2e90f74d01c96242e29de89e3f22` | Compatibility re-export wrapper; current in-repository production callers previously found: `assistants.mjs` and `simulate.mjs`. |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | Separate multi-domain operation; not demonstrated to satisfy the ordinary Nexo instance boundary. |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` | Separate simulation/Continuity path; not demonstrated to satisfy the ordinary Nexo instance boundary. |
| `.github/workflows/nexo-m0-chronicle.yml` | `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7` | Explicit path filters and selected Chronicle/store/runtime/entrypoint tests. |
| `.github/workflows/nexo-mission-admission-continuity.yml` | `03f2a0cb8268e442ce4db434383b0f4854073d82` | Explicit path filters and selected continuity/runtime/Chronicle tests. |
| `NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md` | `5dd884069663b628f498095279b89ad2bb603875` | Prior caller classifications, evidence limitations, and test-design requirements. |

A previously recorded recursive repository tree was `fc546b0e998abcecafb44ead2b2ae9dd1222d539`, with 2,982 entries and `truncated=false`. That tree is evidence for the prior census only; this manifest does not assert that it is the exact tree of the baseline commit above.

## Entrypoint and edge ledger

| Repository path / surface | Observed edge or behavior | Documentary classification | Closure |
|---|---|---|---|
| `package.json#scripts.nexo` → `scripts/nexo.mjs` | Explicit executable command | Production candidate; root-admission contract not evidenced | OPEN |
| `scripts/nexo.mjs` → `src/nexo/application/index.mjs` | Imports status, mission status/plan, preview APIs | Production API edge; all snapshot reads must be covered if D2 selects the bounded-live-snapshot guarantee | OPEN |
| `scripts/nexo.mjs` → `scripts/nexo-chronicle-session.mjs` | `spawnSync` child process | Child must independently validate explicit root and coordinate admission without double-lock/deadlock | OPEN |
| `scripts/nexo-chronicle-session.mjs` → `src/nexo/application/index.mjs` | Direct append API import; child can run independently | Production candidate; direct-path arguments and bootstrap flags need contract-level admission | OPEN |
| `src/nexo/application/chronicle-append.mjs` → store factories / Continuity owner | Constructs store paths and opens owner | Internal operation path; one admission boundary must be propagated, not re-entered | OPEN |
| `src/nexo/application/continuity-queries.mjs` → path-based store factory / `loadCurrent` | Read-only status, mission, plan, preview, Open Loops | Production read path; D2 scope decision required | OPEN |
| `src/nexo/application/mission-request-preview.mjs` → draft preview | Delegating preview API | Nested helper must not acquire a second instance lock | OPEN |
| `src/nexo/core/continuity-service.mjs` → Continuity store factory | Owner construction and optional initialization/import paths | Internal primitive; allowed only within explicit normal-operation/bootstrap contract | OPEN |
| `src/nexo/core/continuity-store.mjs` | Exported path-based factory and per-store locking | Internal/test primitive or require admitted context; preserve existing lock contract | OPEN |
| `src/nexo/core/chronicle-store.mjs` | Exported path-based factory and per-store locking | Internal/test primitive or require admitted context; preserve existing lock contract | OPEN |
| `package.json#scripts.assistants` → `scripts/assistants.mjs` | Uses compatibility wrapper; also writes separate Lúmina/world state | Explicitly excluded from ordinary Nexo instance path pending defined/verified boundary | EXPLICIT_EXCEPTION — DESIGN ONLY |
| `package.json#scripts.simulate` → `scripts/simulate.mjs` | Uses compatibility wrapper; separate world-state lock behavior | Explicitly excluded from ordinary Nexo instance path pending defined/verified boundary | EXPLICIT_EXCEPTION — DESIGN ONLY |
| `package.json#scripts.test` | Explicit chained test list | Test entrypoint; not a production entrypoint; architecture coverage remains partial | TEST_ONLY / OPEN |
| `tests/nexo/entrypoint.test.mjs` | Static import/re-export checks are partial | Does not prove dynamic imports, `require`, computed loaders, path-based factory access, or child-process edge closure | TEST_ONLY / INSUFFICIENT |
| Chronicle workflow | Runs store/runtime/entrypoint tests; path-filtered | Does not yet evidence instance-root admission coverage | CI SURFACE / NOT UPDATED |
| Mission-admission workflow | Runs selected runtime/store/migration/Chronicle tests; path-filtered | Must be reviewed for every implementation file when implementation is separately authorized | CI SURFACE / NOT UPDATED |
| Any dynamic/computed module loader, generated destination, uninspected direct-execution guard, or external/downstream consumer | Not proven closed by the evidence listed above | `UNKNOWN/BLOCKED` | OPEN |

## Accepted D0 design constraints applied here

- One explicit `--root <directory>` per operation; no environment override or legacy path fallback in the first version.
- Normal operation requires an existing valid root. Bootstrap is separate and explicit; normal operation cannot create or repair missing root/stores.
- Canonicalize the existing root before deriving store/lock paths. Define symlink, reserved-name and collision behavior; block ambiguous states. Do not claim protection against hostile filesystem races.
- No automatic migration, dual-write, or heuristic merge in M0. Migration/cutover remains excluded until target environment is identified and verified.
- `assistants.mjs` and `simulate.mjs` remain outside the ordinary Nexo instance path until consistency is defined and verified. Exclusion is a design classification, not runtime protection.

## D1 design acceptance criteria (not yet demonstrated)

1. Enumerate production entrypoints from package scripts, workflow run commands, and every direct-execution guard in the relevant source set.
2. Classify every reachable edge, including static imports/re-exports, dynamic imports, `require`, computed loaders, factory/owner access, and child-process destinations.
3. Tie each classification to the exact source snapshot and source blob evidence; any missing source, unresolvable edge, or external-consumer uncertainty stays `UNKNOWN/BLOCKED`.
4. Define the child admission contract so direct execution is not a bypass and parent/child coordination cannot deadlock through duplicate acquisition.
5. Freeze the D2 decision on whether all canonical snapshot reads, including previews/queries, are within the admission boundary.
6. Specify architecture fixtures that fail closed on unclassified production edges and test invalid/missing-root no-mutation behavior. These are specifications only; no test has been implemented or run in this pass.
7. Verify workflow path filters and run commands only after implementation has been separately authorized.

## Current result

This pass establishes a consolidated, source-linked documentary ledger and makes explicit that workflow path filters are not themselves proof of coverage. It does **not** close the transitive graph, D1-DESIGN, D0 technical evidence, D2, or D3. No runtime/test/workflow code was changed. No test or CI was run. M0 remains `INCOMPLETO`; implementation authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.

Next step: close the remaining D1 source-surface inventory against all relevant direct-execution guards and module-loading forms using a reproducible source snapshot, without changing code.

## Addendum — source-surface recheck (2026-10-24)

The following source files were fetched again from `ncs-clean-architecture` in this pass. Their observed blob SHAs match the evidence snapshot above: `package.json` (`e45dc6d...`), `scripts/nexo.mjs` (`e471eb4...`), `scripts/nexo-chronicle-session.mjs` (`30a53de...`), `scripts/nexo-continuity.mjs` (`f08969f...`), `scripts/assistants.mjs` (`d31c6db...`), `scripts/simulate.mjs` (`623d316...`), and both workflow files (`65b2bc0...`, `03f2a0c...`). This is a source-file cross-check, not a reproducible full-tree graph run.

### Specific execution-surface findings

1. **Nexo parent CLI:** `scripts/nexo.mjs` parses `--continuity` on read/preview commands and dispatches `chronicle-append` using `spawnSync(process.execPath, [chronicleEntrypoint, ...parsed.args])`. The child arguments are forwarded rather than transformed into a single explicit root contract. Root admission is therefore not evidenced at this edge.
2. **Chronicle child:** `scripts/nexo-chronicle-session.mjs` accepts `--continuity`, `--chronicle`, `--mission`, `--step`, and initialization/content flags. It has its own direct-execution guard and can invoke `runNexoChronicleAppend` without the parent CLI. This is a distinct production entrypoint, not merely a private helper.
3. **Assistants exception is executable, not protective:** `scripts/assistants.mjs` executes its operational path at module top level; the inspected beginning has no direct-execution guard before state loading and owner opening. It selects state, Lúmina memory, and Continuity paths using environment variables with legacy defaults, calls `openNexoContinuityOwner`, persists simulation state, and includes the explicit `--nexo-repair-once` branch that invokes `runNexoRuntimeRepairSession`. This remains an `EXPLICIT_EXCEPTION — DESIGN ONLY`, but its exclusion does not establish runtime inaccessibility or root admission.
4. **Simulation exception:** `scripts/simulate.mjs` has a direct-execution guard for `main()`, but it exports state/persistence helpers and opens Continuity using the fixed legacy `.nexo-continuity.json` path, with state initialization/legacy-memory input tied to simulation state. It remains outside the ordinary instance contract until a separate boundary is defined and verified.
5. **CI scope:** the Chronicle workflow runs the Chronicle store test, Chronicle runtime test, and `entrypoint.test.mjs`; its path filters are explicit. The mission-admission workflow runs selected orchestrator/runtime/effect/reconstruction/continuity/migration/Chronicle tests. These commands do not establish a root-admission graph test. The workflow file contents and their observed blob SHAs match the earlier ledger; no workflow was modified or run.

### Consequence for D1 classification

- Keep `assistants` and `simulate` as design exceptions, but do not describe them as technically blocked.
- Treat the Chronicle child as an independent production entrypoint that must validate its own root/admission contract.
- Keep parent→child argument mapping, environment-selected paths, wrapper-mediated owner construction, and direct factory/owner callers as open graph edges until a reproducible resolver accounts for them.
- Do not infer that no dynamic/computed loaders or external consumers exist: this pass did not execute a full AST-based repository graph scan or inspect every module in a local checkout.
- No code, tests, or workflows were changed; no tests/CI were run. D1-DESIGN remains OPEN; D1-IMPLEMENTATION remains not authorized; M0 remains INCOMPLETO; root authority remains PENDING/UNKNOWN; protected effects remain STOP.


## Addendum — repair-route and exact-tree cross-check (2026-10-25)

Snapshot identity was independently confirmed through the GitHub branch API and recursive Git tree: branch `ncs-clean-architecture` points to commit `4a6ec260be349d3bfdfc6bdbc56142922a170371`; the recursive tree has 3,056 entries, `truncated=false`, and 188 JavaScript-family files. This establishes the exact tree identity for this review, not a completed AST/call-graph scan.

### Refined repair-route evidence

- `scripts/nexo-runtime-session.mjs` exports `runNexoRuntimeRepairSession()`, whose observed implementation always returns `status: "blocked"`, code `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted: false`, and `dispatchAttempted: false`. This is a concrete runtime gate at that wrapper.
- `scripts/assistants.mjs` calls that wrapper only when `--nexo-repair-once` is present, after its ordinary assistant path has already opened Continuity, recorded a mission, written Lúmina learning memory, and persisted world state. Therefore the wrapper blocks that specific repair dispatch route; it does not isolate the whole assistants command from Nexo/Lúmina/world persistence or establish root admission.
- `scripts/nexo-repair-session.mjs` exports `runNexoRepairSession()`, which calls `runNexoRepairOnce()`; `scripts/nexo-repair-entrypoint.mjs` exports `runNexoRepairOnce()`, which contains PREPARED/journal checks and calls preparation, dispatch, lineage, and settlement helpers. These are callable module APIs in the repository. The source inspected here does not establish an independently guarded CLI for these files, nor does it prove that all possible importers are confined to tests. Keep their transitive production reachability `UNKNOWN/BLOCKED` until caller resolution is reproducible.
- `scripts/nexo-repair-dispatch.mjs` imports `loadStateStrict`/ `persistState` from `scripts/simulate.mjs` and the Lúmina effect adapter. This is a cross-domain persistence/effect edge, not proof of an authorized Nexo protected-effect path. Option A still excludes the operation from M0; do not equate its internal protocol tests or PREPARED journal with authorization.
- `scripts/nexo-continuity.mjs` is a two-line compatibility re-export of `openNexoContinuityOwner`. The wrapper itself is not a global guard: every importing caller must still be classified.
- `tests/nexo/entrypoint.test.mjs` statically walks literal import/re-export specifiers from the two CLI roots and runs fixtures for the current path-based CLI contract. It does not implement the proposed all-entrypoint resolver, dynamic-loader closure, repair-caller closure, or `--root` contract. The existing test's successful behavior cannot be treated as D1 closure; this review did not execute it.

### D1 consequence

The evidence now distinguishes **a specific blocked wrapper** from **global reachability closure**. The former is observed in source; the latter remains unproven. The next useful closure target is the caller inventory for repair APIs and path-based owner/store creation, followed by the already-specified resolver/test design once implementation is separately authorized. No runtime, test, or workflow source was changed; no tests or CI were run. D1-DESIGN remains OPEN; D1-IMPLEMENTATION remains unauthorized; M0 remains INCOMPLETO; legitimate root remains PENDING/UNKNOWN; protected effects remain STOP.


## Addendum — targeted caller reference sweep (2026-10-25; read-only)

This pass fetched the following exact source files from commit `a68660db5ddfe084758ab907bea5bab899f97efa` and counted references to the named APIs. This is a bounded source-reference sweep, not a complete AST call graph and not proof that all repository callers have been found.

### Observed production-source references

| Source | Observed reference | Interpretation |
|---|---|---|
| `scripts/nexo.mjs` | `spawnSync` to `scripts/nexo-chronicle-session.mjs` | Parent→child argument handoff; child has its own direct execution guard. |
| `scripts/nexo-chronicle-session.mjs` | Imports and calls `runNexoChronicleAppend`; accepts `--continuity`, `--chronicle`, and initialization flags | Independent CLI surface; no `--root` contract in the inspected parser. |
| `scripts/nexo-continuity.mjs` | Re-exports `openNexoContinuityOwner` from `src/nexo/core/continuity-service.mjs` | Compatibility surface; caller-specific admission still required. |
| `scripts/assistants.mjs` | Calls `openNexoContinuityOwner` and optional `runNexoRuntimeRepairSession` | Ordinary path already crosses Continuity, Lúmina memory and world-state persistence. Optional repair call reaches a wrapper that returns a blocked result under Option A. |
| `scripts/simulate.mjs` | Calls `openNexoContinuityOwner` | Separate simulation/legacy persistence surface; not proven to share a canonical instance root. |
| `scripts/nexo-repair-session.mjs` | Exports `runNexoRepairSession`; calls `runNexoRepairOnce` | Callable repair API chain; do not assume production reachability is closed. |
| `scripts/nexo-repair-entrypoint.mjs` | Exports `runNexoRepairOnce`; calls `dispatchPreparedRepair` | PREPARED/reconciliation/dispatch protocol; not authority or instance admission. |
| `scripts/nexo-repair-dispatch.mjs` | Exports `dispatchPreparedRepair`; imports `loadStateStrict`/`persistState` from simulation and Lúmina effect adapter | Cross-domain environment persistence/effect edge; excluded from M0 operational scope. |
| `src/nexo/application/chronicle-append.mjs` | Opens owner and creates Continuity/Chronicle stores | Composite write path; must sit under one admitted operation boundary. |
| `src/nexo/application/continuity-queries.mjs` | Directly creates Continuity store; invokes `loadCurrent` paths | Read/snapshot path; D2 must define admission scope. |
| `src/nexo/core/continuity-service.mjs` | Creates Continuity store and exports owner-opening service | Central service still accepts a file path; root derivation/admission not evidenced. |
| `src/nexo/core/continuity-store.mjs`, `chronicle-store.mjs` | Define/export path-based store factories | Low-level primitives; callers require classification, not automatic trust. |
| `src/nexo/core/continuity-owner.mjs`, `owner-backed-runtime.mjs`, observation adapters | Use `loadCurrent` and/or conditional commit paths | Internal snapshot/commit paths; instance admission must precede the first persistent read if the bounded snapshot guarantee is retained. |

### Observed test-only references (sampled, not exhaustive)

- `tests/nexo/assistants-runtime-cli.test.mjs`: `runNexoRuntimeRepairSession`, `openNexoContinuityOwner`.
- `tests/nexo/chronicle-runtime.test.mjs`: owner, both store factories, and `runNexoChronicleAppend`.
- `tests/nexo/chronicle-session-input-guard.test.mjs`: `runNexoChronicleAppend`.
- `tests/nexo/chronicle-store.test.mjs`: Chronicle store factory.
- `tests/nexo/continuity-contract.test.mjs`, `continuity-service-options-input-guard.test.mjs`, `continuity-migration.test.mjs`, `continuity-store.test.mjs`, and `entrypoint.test.mjs`: owner/store APIs.
- `tests/nexo/repair-mission-verification.test.mjs`: `runNexoRepairSession`.
- `tests/nexo/repair-owner-lifecycle.test.mjs`: `runNexoRepairOnce`, `dispatchPreparedRepair`, owner API.
- `tests/nexo/repair-session.test.mjs`: `runNexoRepairSession`, `dispatchPreparedRepair`, runtime wrapper, owner API.
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`: owner API.

### Limit of this sweep

The connector's code-search operation returned no usable matches for known symbols, including symbols verified to exist in fetched files. That result is not negative evidence. The sweep did not fetch and inspect every one of the 188 code files for every identifier, nor parse ASTs or execute imports. Therefore external/indirect/dynamic callers and complete production reachability remain `UNKNOWN/BLOCKED`; this addendum must not be read as a complete caller allowlist.

No runtime, test, or workflow file changed. No tests/CI were run. D1-DESIGN remains OPEN; D1-IMPLEMENTATION remains unauthorized; M0 remains INCOMPLETO; root PENDING/UNKNOWN; protected effects STOP.


## Addendum — reconciliación de puertas D1 (2026-10-25)

Matriz de referencia: `NCS_M0_D1_MINIMUM_RESPONSIBILITY_CUT_AND_CLOSURE_MATRIX_2026-10-25.md`, commit `e82337c70fd2545fa0e40e2eaa148a54d3f7674e`.

- CLI principal: parser path-oriented; `--root` y admisión previa a I/O pendientes.
- Chronicle hijo: invocable directamente; acepta rutas de stores separadas; root único y validación independiente pendientes.
- Queries/previews: lectura por factories path-oriented; admisión previa a primera lectura para O-10 no demostrada.
- Factories/owner: exports de bajo nivel; callers parcialmente identificados; no declarar inalcanzabilidad general.
- Repair: O-07 excluye reparación del M0 operativo; no prueba que todas las APIs inferiores sean inalcanzables.
- Nexo/Lúmina: acoplamientos conocidos en `assistants.mjs` y `simulate.mjs`; preservar persistencia legítima de Lúmina.
- El test actual cubre imports/reexports literales desde dos CLIs, no el cierre de loaders dinámicos, procesos externos o consumidores downstream.

La exclusión de repair O-07 no ratifica la Alternativa A de refactor de Gemini; la estrategia A/B/C sigue pendiente. Aristas no resueltas permanecen `UNKNOWN/BLOCKED`.

Puertas D1: root/mapping determinista; precondición de admisión por entrypoint/API; contrato padre/hijo Chronicle con validación independiente y rechazo antes de I/O; admisión de queries/previews; estado propietario y dependencias prohibidas Nexo/Lúmina; clasificación explícita de edges desconocidos y decisiones pendientes.

Estado: D1-DESIGN `OPEN`; implementación `NO AUTORIZADA`; M0 `INCOMPLETO`. Sin cambios de runtime/tests/workflows y sin tests/CI ejecutados.
