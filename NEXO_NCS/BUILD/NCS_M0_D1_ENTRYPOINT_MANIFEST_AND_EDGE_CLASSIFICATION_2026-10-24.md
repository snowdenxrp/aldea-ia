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