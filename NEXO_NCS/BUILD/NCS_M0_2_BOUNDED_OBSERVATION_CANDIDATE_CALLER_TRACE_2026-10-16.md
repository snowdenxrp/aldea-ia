# NCS M0.2 — Bounded observation/candidate caller trace — 2026-10-16

## Status

BOUNDED TRACE COMPLETE / REPOSITORY-WIDE CALLER ENUMERATION PENDING. Current source/test comparison and the protected-transition handoff are inspected. No source code changed in this pass.

This is a targeted source-and-test trace, not a full import graph, bypass audit, or security acceptance.

## Current-branch sources inspected

- `src/nexo/core/observation.mjs` — blob `a7400912e0b55887a5120d059f7c1a598b9d9cd4`.
- `tests/nexo/observation.test.mjs` — blob `abe4e94f685406c3e879b38650a20e3393d6fe67`.
- `tests/nexo/step-7-provenance.test.mjs` — blob `0538b6c03b260cf492544a5986bace9959c07eec`.
- `src/nexo/core/contracts.mjs` — blob `294eb400e9685788f7dd084a28a838b69d0323c7`.
- `tests/nexo/core-contracts.test.mjs` — blob `bf9453c4c3c675e8269b1c5038e3c11f8e789063`.
- `src/nexo/core/ownership.mjs` — blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `src/nexo/core/protected-transition.mjs` — blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `tests/nexo/protected-transition.test.mjs` — blob `b40caf831523c231a45959885d4890f245a43d76`.
- `src/nexo/core/observation-equivalence.mjs` — blob `c598023334948c3709c162eb3a4b44d8782496f5`.
- `src/nexo/orchestrator.js` — blob `973d3d5406c5cab16fb49529d94e07a1557c3111`.
- `tests/nexo/orchestrator.test.mjs` — blob `32faa8ac519bed97003b00ea9a2ed013b64cba84`.
- `scripts/assistants.mjs` — blob `ecacf579d401e13f8602e396b87a1b7a89495fa7`.
- `src/assistants/squad.js` — blob `6d9b9bdfbabf79c8924033c72046f056806d9918`.
- `src/nexo/runtime.js` — blob `1b4096bd6868fd9086ba6740f07d6a104a258651`.
- `package.json` — blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`.

## Findings

1. The handoff tests construct `ObservationEnvelope` and `MissionCandidate` directly. They test the contract in isolation; they do not demonstrate a production path from producer findings into these types.
2. `buildNexoMission()` in `src/nexo/orchestrator.js` consumes report findings directly, maps finding codes to actions, and builds legacy mission steps. The inspected function does not call `createObservationEnvelope()` or `createMissionCandidate()`.
3. One direct operational caller was confirmed: `scripts/assistants.mjs` imports `buildNexoMission()` and calls it with reports from the assistant squad, debugger, tester, and analyst. It then records the plan in simulation memory, writes learning memory to `.lumina-assistant-memory.json`, and persists simulation state through `persistState()`. This is a side-effectful legacy Lúmina/simulation workflow, not a clean or non-authoritative new-Core seam.
4. `src/assistants/squad.js` produces report findings as plain objects (e.g. code, severity, agent/resource, message). It does not construct observation/candidate types. This confirms a potential producer side, but not a complete repository-wide caller inventory.
5. `tests/nexo/orchestrator.test.mjs` protects legacy planner behavior: severity ordering, dependency construction and blocking, verified-evidence requirements for completion, replan linkage, allowlisting of known Lúmina actions, and rejection of unsupported actions. Any future seam must preserve these behaviors unless an explicitly reviewed design changes them.
6. Current legacy identity details are insufficient for a protected claim identity: `buildNexoMission()` generates step IDs as positional values such as `step-1`; mission IDs are based on timestamp plus in-process sequence; and deduplication uses action + target + optional action name. None of these is demonstrated to be a stable, claim-specific identity. The builder also calculates the executable objective from the full planned list and then persists only `steps.slice(0, 8)`. P112 already audited the bounded-admission/provenance consequences; this pass reuses that conclusion rather than reopening the audit.
7. `createObservationEnvelope()` and `createClaimEnvelope()` share some field names (target, targetIncarnation, derivedProvenance), but their semantic roles differ. ObservationEnvelope holds producer observation/proposal context (source, code, inputs, freshness, explanatory text, optional existing identity); ClaimEnvelope holds a protected claim's action, authoritative reads, dependencies, predicate dependencies, causal inputs, source provenance, and policy context.
8. Prior contract `NEXO_NCS/BUILD/STEP_7_MINIMUM_OBSERVATION_ENVELOPE_CONTRACT_2026-10-08.md` defines `ObservationEnvelope -> MissionCandidate -> ClaimEnvelope`. The objects should remain distinct. Mapping must be claim-specific and evidence-preserving; it must not blindly copy a mission candidate into a ClaimEnvelope or imply authorization.
9. A concrete mapping blocker is visible in current contracts: `createClaimEnvelope()` requires `claimId` and `action`; `MissionCandidate` permits a nullable claim and does not define a canonical claim identity. No existing mapping from a candidate to a legitimate `claimId` has been demonstrated. Do not invent an ID or substitute `missionId`; if actual claim identity cannot be established from existing evidence, mapping remains blocked/UNKNOWN pending a root contract decision.
10. `executeProtectedTransition()` receives a `proposal`, calls `ports.claimBuilder.build(proposal)`, then checks authority, isolates state, executes a candidate, validates and conditionally commits. The default `claimBuilder` and `effectBoundary.prepare` ports are NOT_IMPLEMENTED. Its tests inject a prebuilt ClaimEnvelope and an AUTHORIZED result; they test composition logic, not the legitimacy of the claim ID or authority source.
11. `executeNexoStep()` in `src/nexo/runtime.js` calls `beginNexoStep()`, invokes `adapter.execute(...)`, then records the outcome. The inspected function does not invoke `executeProtectedTransition()` or a constitutional authority gate before the adapter.
12. `evaluateNegativeResourceEquivalence()` conservatively returns `UNKNOWN` when claim-critical dimensions are absent. Its test confirms UNKNOWN is carried forward rather than silently admitted. This is contract-level behavior, not proof that the production planner consumes the evidence.
13. The observation test is confirmed by GitHub Actions run `38975253568`, tested commit `b705a71ce0527c689f169351468c364828a7e9f1`, workflow `Nexo — STEP 7 observation contract`, job `observation-contract`, exact step `node tests/nexo/observation.test.mjs`: conclusion `success`. Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38975253568
14. This CI result confirms that exact test command on that tested commit. It does not prove the full `npm test` chain or any planner/runtime/security property.

## Reuse of existing research — no repeated audit

The earlier `NEXO_CONTINUITY/P112_ASSISTANT_RUN_OBSERVATION_LIFECYCLE_AUDIT_V1_2026-10-07.md` already traced the production assistant lifecycle and found no explicit run/sample/report identity attached to findings, no direct durable persistence of the full squad report, and compressed learning memory that does not preserve raw squad findings. It also warns against inventing runId/sampleId/observationId or treating timestamps as unique identity.

The earlier `NEXO_NCS/BUILD/STEP_7_OBSERVATION_TO_MISSION_CANDIDATE_HANDOFF_2026-10-08.md`, `STEP_7_MISSION_OBSERVATION_PROVENANCE_BOUNDARY_2026-10-08.md`, and `STEP_7_MINIMUM_OBSERVATION_ENVELOPE_CONTRACT_2026-10-08.md` already establish the transport-only boundary and non-goals. They remain applicable; this pass does not reopen AB/TLC/Kafka work.

## Decision for the next seam

Do not integrate observation/candidate types into the legacy orchestrator or runtime as a quick patch. The confirmed operational caller has simulation and filesystem side effects, and the prior contract explicitly rejects legacy-orchestrator integration.

The next bounded design decision is whether a legitimate claim identity already exists at the proposed candidate boundary and, if so, what exact evidence binds it to the claim. Current legacy step IDs, mission IDs, and action+target dedupe do not establish that identity. If no existing identity is supported, stop at the semantic boundary and document the missing contract; do not manufacture one. Only after this is resolved can a pure mapping function be specified and tested. It must not authorize, final-validate, commit, persist, or execute. The protected-transition path remains separate and not production-wired.

## Explicit non-claims

- No exhaustive repository-wide call graph or bypass closure.
- No full repository test-suite result; only the exact observation contract CI step is confirmed.
- No proof that observations are authentic, fresh, or truthful.
- No proof of durable raw observation recovery or unique observation identity.
- No legitimate MissionCandidate-to-ClaimEnvelope identity mapping demonstrated.
- No constitutional owner authority, commissioning, or protected-effect authorization.
- No protected effects enabled.

**STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective.**
