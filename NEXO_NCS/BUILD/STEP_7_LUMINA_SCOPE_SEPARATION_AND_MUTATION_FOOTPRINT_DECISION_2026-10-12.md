# STEP 7 — Lúmina scope separation and mutation-footprint decision — 2026-10-12

Status: RESEARCH / DESIGN DECISION ONLY. STEP 7 commissioning remains OPEN / STOP / UNKNOWN.

## Question

Can the local Lúmina simulation be treated as the production effect sink or used to justify wiring the generic Nexo executor into a live loop?

## Evidence inspected

- `src/simulation.js`, blob `f9ad65003693f4c563659f92da8ef8e52abf2c14`: defines Lúmina's simulation loop and broad state transitions. It normalizes the supplied world/agents during creation, and the loop coordinates world/day/society changes, needs, perception, decisions, actions, learning, relationships, exploration, spatial state, and events.
- `src/actions.js`, blob `93745c691f0fdf6f976211c89a406ec1b11f8810`: `executeAction(simulation, agent, action)` mutates simulation/agent state for resource, needs, inventory, production, trade, and institution actions.
- `src/nexo/simulation-adapter.js`, blob `291ef4d43ca1af2dad29503d8c15f5cdd05aa114`: the Lúmina adapter wraps selected local handlers over a supplied simulation object and bumps `nexoEffectRevision`; it calls `executeAction` for `execute_lumina_action`.
- `src/nexo/runtime.js`, blob `1b4096bd6868fd9086ba6740f07d6a104a258651`: `executeLuminaNexoStep()` invokes the adapter for a supplied simulation; no protected production owner was identified in the inspected caller flows.
- `NEXO_CONTINUITY/P112_FINAL_GATE_EXECUTION_BOUNDARY_AUDIT_2026-10-07.md`, blob `c33f4b41a131e2ccec5bd89beaab0042d978e4f8`: prior source audit identifies direct mutation branches in `performDecision()` outside `executeAction()`, including social interaction, knowledge sharing, cooperation, exploration/discovery, plus post-effect learning/memory/event writes.
- `NEXO_CONTINUITY/P112_SHARED_WRITER_FOOTPRINT_AUDIT_V1_2026-10-07.md`, blob `72bf582f27fbb20910876ae942bafedb836841cd`: `tick()`, `advanceWorldDay()`, and `advanceSocietyDay()` are broad shared writers that can invalidate admission dependencies.

## Decision

1. Treat the current Lúmina simulation as a local experimental/simulation environment, not as evidence of a production Nexo effect sink.
2. Do not wire `executeLuminaNexoStep()` into `tick()`, `performDecision()`, `assistants.mjs`, or `simulate.mjs` just to fill a missing caller.
3. Do not claim that guarding `executeAction()` alone protects the simulation: the mutation footprint includes direct branches outside it and broad shared writers before/after the selected action.
4. For any future claim that Lúmina itself is a protected target, require an explicit scope decision first, then enumerate all state-mutating entrypoints and their dependency/read/write footprints before designing one coherent transition boundary. A narrow action gate is not sufficient evidence.
5. For any future external device/network/physical-world integration, identify the concrete target and all paths that can produce the effect independently of Lúmina's simulation. Its local revision and tests cannot stand in for external enforcement.
6. This scope separation is not a claim that no external deployment exists. The inspected repository evidence does not identify one; any external deployment remains UNKNOWN until supported by concrete records.

## Root-cause guard

The missing caller is not itself a defect that authorizes a new composition. The unresolved architectural question is ownership and scope: which exact state/effect is canonical, who owns it, and what all paths must be mediated? Do not add a wrapper, epoch, lock, or second gate before answering that question.

## Next admissible step

Continue a read-only inventory of actual deployment/build records and target references. If none identifies a real external sink, preserve the bounded result and leave production effect admission unimplemented. No code changes, tests, device actions, Constitution changes, or trust-anchor selection were made by this decision.
