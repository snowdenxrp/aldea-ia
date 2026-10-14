# STEP 7 — Concrete execution-path crosswalk and stop finding
Date: 2026-10-14
Branch: ncs-clean-architecture
Status: SOURCE CROSSWALK — NO IMPLEMENTATION — OPEN / STOP / UNKNOWN

## Question
Does the current branch contain a real, existing state/effect sink where the initial Constitution activation can be enforced, or can an existing runtime path be reused without inventing a new authority boundary?

## Exact source pins re-read
- `src/nexo/core/protected-transition.mjs` SHA `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `src/nexo/core/ownership.mjs` SHA `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `src/nexo/runtime.js` SHA `1b4096bd6868fd9086ba6740f07d6a104a258651`.
- `src/nexo/simulation-adapter.js` SHA `291ef4d43ca1af2dad29503d8c15f5cdd05aa114`.
- `src/nexo/adapters/conditional-commit-persist-state.mjs` SHA `9a707677c99d226f87f9b8b0d9e7673e7a1a100e`.
- `scripts/simulate.mjs` SHA `4dafebec265cc490ee17b388c75c04bb48869ac8`.
- `src/nexo/core/policy-context-resolver.mjs` SHA `024b385d928b6b95edee1a54de867f7193917c91`.
- Prior source-backed maps consulted, not rerun as fresh audits: `docs/nexo/NEXO_CURRENT_EFFECT_PATH_CAPABILITY_MAP_V1_2026-09-25.md`; `NEXO_CONTINUITY/P112_EXECUTEACTION_FINAL_GATE_BOUNDARY_AUDIT_V1_2026-10-07.md`; `NEXO_CONTINUITY/P112_RUNTIME_ADAPTER_SNAPSHOT_CROSSING_AUDIT_V1_2026-10-07.md`.

## Path A — STEP 7 protected transition
Observed source flow:
`claimBuilder.build(proposal)` → injected `authorityGate.check(claim)` → snapshot isolation → candidate execution → semantic validation → injected `conditionalCommit.commit(candidate)` → outcome classification.

Findings:
1. The authority gate is an injected port; its default is `NOT_IMPLEMENTED`. Tests can inject a valid-looking authority result, which verifies composition/fail-closed behavior, not Genesis legitimacy.
2. On validation PASS, the transition calls `conditionalCommit.commit(candidate)`. It does not call `effectBoundary.prepare()`.
3. `createPersistStateConditionalCommit` forwards the candidate state and expected revision to `persistState`; it maps state revision conflict to a conditional conflict. This proves a state-persistence adapter, not that the state is the canonical Constitution authority owner or that this commit is the final gate for an external/protected effect.
4. `resolvePolicyContext` validates the supplied shapes/states and returns an immutable resolution record. That function does not independently establish source provenance or canonical active-Constitution authority.

Disposition: existing Core path is a generic transition/persistence skeleton, not a demonstrated initial-Constitution activation path.

## Path B — current Nexo/Lúmina runtime
Observed source flow:
`executeLuminaNexoStep(simulation,...)` → `createLuminaEffectAdapter(simulation,...)` → `executeNexoStep(...)` → adapter handler → `executeAction(simulation, agent, intent)` / local simulation mutation → local postcondition → in-memory mission/effect outcome recording.

Findings:
1. `createLuminaEffectAdapter` is built over the supplied simulation object and its handlers mutate that simulation. This is the Lúmina simulation domain, not the canonical Constitution activation store.
2. `nexoEffectRevision` is an in-memory simulation revision; prior capability map records that it is not a durable cross-restart authority/resource fence.
3. `executeNexoStep` calls `commitRuntimeOutcome`, which updates mission/execution/outcome memory. The inspected runtime function does not call canonical `persistState(expectedRevision)` itself.
4. Existing P112 source audits already establish the common `executeAction` mutation primitive and the absence of a demonstrated semantic final gate immediately before mutation. They also distinguish effect mutation from post-effect learning/history. This crosswalk relies on those existing results and does not reopen their closed questions.

Disposition: the runtime supplies a concrete local simulation mutation path for future work, but it is not a valid substitute for STEP 7's initial Constitution state owner or final constitutional activation boundary.

## Decision
**No existing suitable STEP 7 sink/state owner was evidenced in the inspected branch.** Do not wire the Constitution to `world-state.json`, reuse the simulation adapter as authority, add a new registry/store/wrapper, or connect `effectBoundary.prepare()` without first identifying the legitimate canonical state owner and the actual activation effect.

This is a bounded source finding, not a proof that no future architecture can supply the boundary. It means the next implementation action is blocked rather than hidden inside a patch.

## Next non-duplicative action
Inspect the already-existing MASTER/AB/P112 source requirements only for a previously approved, concrete activation-state owner or a named current sink. If none exists (consistent with the source inventory and P112 findings), mark the source path as naturally blocked and prepare the narrow owner-level architectural choice; do not create more generic contracts or repeat effect-path audits.

## Status and non-actions
STEP 7 remains `OPEN / STOP / UNKNOWN`.
No source code, tests, keys, signatures, Constitution, APK, device, deployment, or runtime authority changed. No tests were run in this source-only crosswalk.
