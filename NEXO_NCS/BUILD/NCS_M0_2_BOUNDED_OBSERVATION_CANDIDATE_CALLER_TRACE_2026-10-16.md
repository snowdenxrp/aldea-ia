# NCS M0.2 — Bounded observation/candidate caller trace — 2026-10-16

## Status

BOUNDED TRACE COMPLETE / REPOSITORY-WIDE CALLER ENUMERATION PENDING.

This note records a targeted read of current-branch files. It is not a full import graph, bypass audit, CI run, or security acceptance.

## Current-branch sources inspected

- `src/nexo/core/observation.mjs` — blob `a7400912e0b55887a5120d059f7c1a598b9d9cd4`.
- `tests/nexo/step-7-provenance.test.mjs` — blob `0538b6c03b260cf492544a5986bace9959c07eec`.
- `tests/nexo/step-7-negative-resource-handoff.test.mjs` — blob `f5a8f0fd63abc9622ade9e4c514a90be990ddf53`.
- `src/nexo/core/observation-equivalence.mjs` — blob `c598023334948c3709c162eb3a4b44d8782496f5`.
- `src/nexo/orchestrator.js` — blob `973d3d5406c5cab16fb49529d94e07a1557c3111`.
- `src/nexo/runtime.js` — blob `1b4096bd6868fd9086ba6740f07d6a104a258651`.
- `src/nexo/core/protected-transition.mjs` — blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `src/nexo/core/ownership.mjs` — blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `package.json` — blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`.

## Findings

1. The two inspected handoff tests construct `ObservationEnvelope` and `MissionCandidate` directly. They test the contract in isolation; they do not demonstrate a runtime path from producer findings into these types.
2. `buildNexoMission()` in `src/nexo/orchestrator.js` currently consumes report findings directly, maps finding codes to actions, and builds steps. In the inspected function, no `createObservationEnvelope()` or `createMissionCandidate()` call occurs.
3. `executeNexoStep()` in `src/nexo/runtime.js` calls `beginNexoStep()`, invokes `adapter.execute(...)`, then records the outcome. The inspected function does not invoke `executeProtectedTransition()` or a constitutional authority gate before the adapter.
4. `executeProtectedTransition()` in `src/nexo/core/protected-transition.mjs` checks the injected authority result and semantic validation, then calls `conditionalCommit.commit(candidate)`; the inspected composition still does not call `effectBoundary.prepare`.
5. `evaluateNegativeResourceEquivalence()` conservatively returns `UNKNOWN` when claim-critical dimensions are absent. The existing negative-resource test confirms that UNKNOWN is carried forward rather than silently admitted. This is contract-level behavior, not proof that the production planner consumes this evidence.
6. `package.json` defines a long `npm test` chain, but the current execution environment has not run that chain against a repository checkout. The prior isolated observation test remains qualified evidence only.

## Architectural consequence

The current observation/candidate work is a useful local data-contract slice, but it is not connected to the main planner/runtime path in the inspected sources. Do not treat M0.1 as integrated, and do not connect it to runtime effects as a quick patch.

The next safe step is to establish a repository-wide current-branch caller/import inventory and identify the intended single seam between producer findings, the typed observation/candidate contract, and planning. Before any integration, specify whether this is a non-authoritative simulation-only path and what legacy behavior must remain unchanged. Do not add adapters, IDs, queues, retries, persistence, or authority semantics unless the inventory proves they are necessary.

## Explicit non-claims

- No exhaustive call graph or repository-wide bypass closure.
- No repository checkout test or CI proof.
- No proof that observations are authentic, fresh, or truthful.
- No constitutional owner authority, commissioning, or protected-effect authorization.
- No protected effects enabled.

**STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective.**
