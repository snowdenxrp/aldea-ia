# NCS — STEP 7: Existing Nexo Code Reuse Boundary for M1
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: SOURCE-LEVEL REUSE AUDIT — NO IMPLEMENTATION OR RUNTIME CLAIM

## Question
Can existing Nexo code in the inspected branch directly implement the first M1 interaction slice (one request → answer → local presentation, no tools, no network, no persistent memory), or are the existing modules contracts/orchestration for another domain?

## Sources inspected
- `src/nexo/orchestrator.js` — blob `973d3d5406c5cab16fb49529d94e07a1557c3111`
- `src/nexo/runtime.js` — blob `1b4096bd6868fd9086ba6740f07d6a104a258651`
- `src/nexo/core/contracts.mjs` — blob `294eb400e9685788f7dd084a28a838b69d0323c7`
- `src/nexo/core/ownership.mjs` — blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`
- `src/nexo/core/protected-transition.mjs` — blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`
- `src/nexo/core/policy-context-resolver.mjs` — blob `024b385d928b6b95edee1a54de867f7193917c91`
- `tests/nexo/orchestrator.test.mjs` — blob `32faa8ac519bed97003b00ea9a2ed013b64cba84`
- `tests/nexo/runtime.test.mjs` — blob `4dcb4ce2ad5ac09caa6b52dd37b93ed4be1bd615`
- `tests/nexo/protected-transition.test.mjs` — blob `888c3dc5e8e3143ec62c36b3ec4a15ab9fbd1ea0`
- Existing M1 trace and capability-minimal client-boundary records.

## Findings

### A. The existing mission orchestrator is domain-bound
`orchestrator.js` maps diagnostics such as `AGENT_POSITION`, `MESH_MISSING`, and `LUMINA_ACTION` to simulation repair/probe actions. Its allowlist and planning logic are tied to Lúmina/simulation state. It is not a generic user-conversation client, and reusing it as the M1 request router would couple Nexo interaction to the Lúmina domain, violating the recorded independence constraint.

### B. The existing runtime is effect/memory oriented
`runtime.js` starts planned mission steps, invokes effect adapters, records execution/outcome in learning memory, and uses idempotency keys and postconditions for simulation effects. That is useful historical code for its existing domain, but M1 expressly excludes tool/effect execution and persistent memory. Calling this runtime for M1 would import capabilities the slice is intended to omit.

### C. The Core contract modules provide reusable semantic constraints, not an interaction implementation
- `contracts.mjs` defines claim/policy-context/validation/commit/outcome structures.
- `ownership.mjs` separates ports and makes unimplemented ports fail explicitly.
- `protected-transition.mjs` enforces ordering around an injected authority gate, isolation, execution, validation and conditional commit.
- `policy-context-resolver.mjs` aggregates supplied check statuses; it does not authenticate their source or establish a trust root.

These modules may inform cross-domain invariants, but they do not provide a request UI, local model runtime, no-egress enforcement, or a recognized protected authority implementation. The injected authority gate is a seam, not evidence of independent enforcement.

### D. Existing tests do not prove M1 feasibility
The tests demonstrate expected behavior for simulation mission planning/runtime and injected Core ports, including fail-closed behavior when the injected authority gate returns UNKNOWN/STOP. They do not exercise a mobile client, local inference, complete network egress, remote fallback prevention, or device/platform enforcement. No claim about those properties may be inferred from these tests.

## Reuse disposition
- Reuse as design invariants: explicit claims, separation of authority from validation, UNKNOWN/STOP, no effect before the authority gate, isolated candidate state, final validation, conditional commit, idempotency/reconciliation where applicable.
- Do not reuse directly for M1 execution: Lúmina-specific mission planner, effect runtime, simulation adapter, or persistent learning-memory writes.
- Do not create a generic abstraction merely to unify these domains. M1's smallest eventual client path must be designed around its own narrow claim/effect boundary if separately authorized.
- No code was changed, no tests were run, no client/model/platform/provider was selected, no key or root was created, and no activation or external effect was authorized.

## Next exact action
The inspected code has no existing M1 client path to reuse. Further work must be evidence-bearing: either identify a specific external/pre-existing client/model artifact, or obtain a separate explicit decision to open an analysis-only M1 client-design slice. Until then, stop expanding generic contracts and keep M1 feasibility and genesis authority as separate UNKNOWN/BLOCKED claims.
