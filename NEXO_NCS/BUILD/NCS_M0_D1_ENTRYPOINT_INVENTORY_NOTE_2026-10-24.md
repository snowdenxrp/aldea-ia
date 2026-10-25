# NCS M0 — D1 entrypoint inventory note

Date: 2026-10-24. Read-only source review; design evidence only.

## Exact source files reviewed
- `package.json` blob `e45dc6d215db53ea2758009cd501f565634e3610`
- `.github/workflows/nexo-m0-chronicle.yml` blob `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7`
- `.github/workflows/nexo-mission-admission-continuity.yml` blob `03f2a0cb8268e442ce4db434383b0f4854073d82`
- `tests/nexo/entrypoint.test.mjs` blob `ff1bd2e9d292e21e00049b354249aee684837bbc`
- `scripts/nexo.mjs` blob `e471eb478a09aa8a9a8323795583e198cdf0a127`
- `scripts/nexo-chronicle-session.mjs` blob `30a53de2f108aa255a1dfd61ce78c19788de160b`

## Inventory
- `npm run nexo` launches `scripts/nexo.mjs`; root admission is not implemented.
- `npm run assistants` launches `scripts/assistants.mjs`; keep this Lúmina compound entrypoint outside ordinary Nexo instance operations until cross-domain semantics are designed.
- `npm run simulate` launches `scripts/simulate.mjs`; preserve Lúmina world-state persistence and do not treat its path as Nexo root admission.
- `scripts/nexo.mjs` launches the Chronicle child using `spawnSync`; parent must not hold a non-reentrant root lock while waiting for child admission.
- `scripts/nexo-chronicle-session.mjs` is independently executable and currently accepts `--continuity` / `--chronicle` paths. The target contract requires independent validation of one explicit root.
- `src/nexo/application/index.mjs` re-exports append, query and preview use cases. Persistent snapshot reads through these APIs must enter the future admission boundary.
- `scripts/nexo-continuity.mjs` is a compatibility re-export; two in-repository production callers were previously found, while downstream callers remain UNKNOWN.
- `runNexoRepairSession`, `runNexoRepairOnce`, and `dispatchPreparedRepair` remain separate lower-level exports. A blocked wrapper alone does not prove global product exclusion.

## Existing test coverage boundary
`tests/nexo/entrypoint.test.mjs` walks static import/re-export specifiers by regex from the two Nexo command entrypoints and checks selected CLI behavior. This does not prove complete coverage of dynamic `import()`, `require()`, computed loaders, all executable guards, all factory/owner callers, all child-process edges, or external consumers. The test was not run in this review.

## D1 closure requirements
1. Derive candidate entrypoints from package.json, workflows, executable guards and child-process launch sites.
2. Traverse static imports/re-exports across .js and .mjs; dynamic/computed/ambiguous edges remain UNKNOWN/BLOCKED.
3. Inventory factory/owner calls, snapshot reads, initialization, conditional commit, append, repair APIs, child processes and legacy path options.
4. Classify callers as `PRODUCTION_ADMITTED`, `INTERNAL_ONLY`, `TEST_ONLY`, or `EXPLICIT_EXCEPTION`.
5. Add negative fixtures for missing root, root plus legacy paths, child without root, assistant/simulation incidental Nexo access, unresolved dynamic imports and unresolved modules.
6. Treat low-level store tests as TEST_ONLY. Architecture tests must not invoke repair dispatch or protected operations.

Accepted D0 policy: explicit `--root`, no environment/legacy fallback; ordinary operations require an existing root; bootstrap separate; no silent migration, dual-write or heuristic merge. Still open: admission primitive, symlink/alias policy, full executable-guard inventory, computed loaders, API enforcement, child timeout/release uncertainty and D3 cutover/rollback.

M0 INCOMPLETO; D1-DESIGN OPEN; implementation unauthorized; D2/D3 OPEN; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP. No runtime/tests/workflows changed; no tests or CI run.