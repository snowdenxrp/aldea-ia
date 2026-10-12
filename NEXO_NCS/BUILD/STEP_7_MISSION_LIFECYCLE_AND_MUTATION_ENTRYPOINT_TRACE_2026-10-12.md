# STEP 7 — Mission lifecycle and mutation-entrypoint trace — 2026-10-12

Status: RESEARCH ONLY. Commissioning remains OPEN / STOP / UNKNOWN.

## Scope and method

Read-only source inspection on branch `ncs-clean-architecture`. This pass follows the existing mission lifecycle and classifies actual mutation paths. GitHub code search is used as corroboration only; its index is not treated as proof of absence. No code or tests were changed or executed.

## Source pins inspected

- `src/nexo/runtime.js` — blob `1b4096bd6868fd9086ba6740f07d6a104a258651`
- `src/nexo/effect-adapter.js` — blob `e2095c52282865699e4de107c75a6792bcf5dac3`
- `src/nexo/simulation-adapter.js` — blob `291ef4d43ca1af2dad29503d8c15f5cdd05aa114`
- `scripts/assistants.mjs` — blob `ecacf579d401e13f8602e396b87a1b7a89495fa7`
- `scripts/simulate.mjs` — blob `4dafebec265cc490ee17b388c75c04bb48869ac8`

## Lifecycle trace

1. `scripts/assistants.mjs` loads persisted simulation state, builds a mission plan, records that plan into Nexo memory, and persists the simulation state. The inspected flow does not call `executeNexoStep()` or `executeLuminaNexoStep()`.
2. `scripts/simulate.mjs` loads/reconstructs the simulation, advances it with `tick()` and movement, then persists the state under a local directory lock and state-revision check. Its main flow does not call the Nexo runtime execution functions.
3. `src/nexo/runtime.js` defines `executeNexoStep()` and `executeLuminaNexoStep()`. The first accepts an injected adapter; the second creates a Lúmina simulation adapter over the supplied simulation. The inspected production-path candidates do not compose either function into an evidenced protected owner.
4. `src/nexo/effect-adapter.js` supports registered handlers, optional preconditions/postconditions, an execution journal, and an optional `persistPreparedIntent` callback. A prepared journal entry is not itself proof that an effect did or did not occur. These features do not independently establish constitutional authority or final-sink fencing.
5. `src/nexo/simulation-adapter.js` registers local handlers for `repair_agent_state`, `repair_agent_needs`, `repair_resource_state`, and `execute_lumina_action`. These mutate the in-memory simulation; the latter calls `executeAction(simulation, agent, action)`. The local `nexoEffectRevision` is an in-memory simulation revision, not an externally enforced authority fence.

## Mutation-path classification

| Path / operation | Class | Evidence boundary |
|---|---|---|
| Mission construction and plan persistence in `assistants.mjs` | Planning / state persistence | No effect execution call in inspected flow |
| `simulate.mjs` `tick()`, movement, simulation state save | Local simulation transition | Local simulation persistence; not a real external sink |
| Lúmina repair handlers | Local candidate/simulation-state mutation | Mutates supplied simulation object |
| Lúmina `execute_lumina_action` handler | Local simulation action | Calls simulation's `executeAction`; no Genesis/final admission boundary shown |
| Generic `executeNexoStep` + injected handler | Unknown until a concrete caller/handler is named | Runtime primitive exists; no production composition demonstrated |
| External/device/network/physical-world effect sink | UNKNOWN / NOT IDENTIFIED | No deployed target or sink established by this pass |

## Findings

- The repository currently evidences mission planning, local simulation transitions, and generic execution primitives. This pass did not identify a demonstrated production deployment joining Genesis, canonical current-Constitution/revocation ownership, a production AuthorityGate, and the final protected sink.
- The fact that `tick()` and the Lúmina adapter can mutate simulation state is not evidence that a real-world effect path exists.
- Do not wire the mission executor into `assistants.mjs` or `simulate.mjs` merely to create a caller. That would assign a new execution-owner responsibility without resolving Genesis, canonical authority ownership, sink identity, or final admission/revocation ordering.
- No extra epoch, authority recheck, registry, or transaction wrapper is justified until a concrete deployment and sink are identified.
- The next blocker is now explicitly split: (A) the repository-level candidate paths are local simulation/planning, while (B) any external deployment/sink, if it exists outside the inspected repository evidence, must be identified with concrete deployment records and traced separately.

## Decision

Keep STEP 7 at OPEN / STOP / UNKNOWN. No implementation, test run, device action, key/Constitution change, or commissioning claim is authorized or supported by this read-only trace.
