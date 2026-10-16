# NCS M0.2 — Bounded observation/candidate caller trace — 2026-10-16

## Status

BOUNDED TRACE COMPLETE / REPOSITORY-WIDE CALLER ENUMERATION PENDING.

This note records a targeted read of current-branch files. It is not a full import graph, bypass audit, or security acceptance.

## Current-branch sources inspected

- `src/nexo/core/observation.mjs` — blob `a7400912e0b55887a5120d059f7c1a598b9d9cd4`.
- `tests/nexo/observation.test.mjs` — blob `abe4e94f685406c3e879b38650a20e3393d6fe67`.
- `tests/nexo/step-7-provenance.test.mjs` — blob `0538b6c03b260cf492544a5986bace9959c07eec`.
- `tests/nexo/step-7-negative-resource-handoff.test.mjs` — blob `f5a8f0fd63abc9622ade9e4c514a90be990ddf53`.
- `src/nexo/core/observation-equivalence.mjs` — blob `c598023334948c3709c162eb3a4b44d8782496f5`.
- `src/nexo/orchestrator.js` — blob `973d3d5406c5cab16fb49529d94e07a1557c3111`.
- `tests/nexo/orchestrator.test.mjs` — blob `32faa8ac519bed97003b00ea9a2ed013b64cba84`.
- `scripts/assistants.mjs` — blob `ecacf579d401e13f8602e396b87a1b7a89495fa7`.
- `src/assistants/squad.js` — blob `6d9b9bdfbabf79c8924033c72046f056806d9918`.
- `src/nexo/runtime.js` — blob `1b4096bd6868fd9086ba6740f07d6a104a258651`.
- `src/nexo/core/protected-transition.mjs` — blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `src/nexo/core/ownership.mjs` — blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `package.json` — blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`.

## Findings

1. The handoff tests construct `ObservationEnvelope` and `MissionCandidate` directly. They test the contract in isolation; they do not demonstrate a runtime path from producer findings into these types.
2. `buildNexoMission()` in `src/nexo/orchestrator.js` consumes report findings directly, maps finding codes to actions, and builds legacy mission steps. The inspected function does not call `createObservationEnvelope()` or `createMissionCandidate()`.
3. One direct operational caller was confirmed: `scripts/assistants.mjs` imports `buildNexoMission()` and calls it with reports from the assistant squad, debugger, tester, and analyst. It then records the plan in simulation memory, writes learning memory to `.lumina-assistant-memory.json`, and persists simulation state through `persistState()`. This is a side-effectful legacy Lúmina/simulation workflow, not a clean or non-authoritative new-Core seam.
4. `src/assistants/squad.js` produces report findings as plain objects (for example `code`, `severity`, `agent`/resource, message). It does not construct the observation/candidate types. This confirms a potential producer side, but not a complete import/caller inventory.
5. `tests/nexo/orchestrator.test.mjs` already protects legacy planner behavior: severity ordering, dependency construction and blocking, verified-evidence requirement for completion, replan linkage, allowlisting of known Lúmina actions, and rejection of an unsupported action. Any future seam must preserve these behaviors unless a separately approved design explicitly changes them.
6. `executeNexoStep()` in `src/nexo/runtime.js` calls `beginNexoStep()`, invokes `adapter.execute(...)`, then records the outcome. The inspected function does not invoke `executeProtectedTransition()` or a constitutional authority gate before the adapter.
7. `executeProtectedTransition()` in `src/nexo/core/protected-transition.mjs` checks the injected authority result and semantic validation, then calls `conditionalCommit.commit(candidate)`; the inspected composition still does not call `effectBoundary.prepare`.
8. `evaluateNegativeResourceEquivalence()` conservatively returns `UNKNOWN` when claim-critical dimensions are absent. Its test confirms UNKNOWN is carried forward rather than silently admitted. This is contract-level behavior, not proof that the production planner consumes the evidence.
9. The observation test is confirmed by GitHub Actions run `38975253568`, tested commit `b705a71ce0527c689f169351468c364828a7e9f1`, workflow `Nexo — STEP 7 observation contract`, job `observation-contract`, exact step `node tests/nexo/observation.test.mjs`: conclusion `success`. Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38975253568
10. This CI result replaces the earlier qualified statement that no repository CI proof existed for this specific observation test. It does not prove the full `npm test` chain or any planner/runtime/security property.

## Architectural consequence

The observation/candidate work is a local data-contract slice, not an integrated planner/runtime path. Do not treat M0.1 as integrated.

Do not patch the legacy orchestrator into the new Core merely to make the types appear connected. The saved P112 checkpoint explicitly warns against beginning by patching the old orchestrator into becoming the new Core. The one confirmed operational caller, `scripts/assistants.mjs`, has simulation and filesystem side effects; inserting new data-contract logic there could silently widen scope and conflate Lúmina's current planner with Nexo's non-authoritative Core.

Before any integration, finish a bounded current-branch inventory of imports/callers and identify a seam whose input/output contract can be tested without changing legacy side effects. Existing orchestrator tests are the non-regression floor. No adapters, IDs, queues, retries, persistence, or authority semantics should be added unless the inventory demonstrates a concrete need. Do not connect this slice to runtime effects as a quick patch.

## Explicit non-claims

- No exhaustive call graph or repository-wide bypass closure.
- No full repository test-suite result; only the exact observation contract CI step is confirmed.
- No proof that observations are authentic, fresh, or truthful.
- No constitutional owner authority, commissioning, or protected-effect authorization.
- No protected effects enabled.

**STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective.**
