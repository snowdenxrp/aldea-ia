# NCS M0 — D1 review note: repair API boundary

Date: 2026-10-24
Branch: ncs-clean-architecture
Status: read-only source review; design gap; no implementation.

## Observation

The current M0 Option A wrapper in `scripts/nexo-runtime-session.mjs` returns a blocked result with `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted: false`, and `dispatchAttempted: false`. This is a valid local guarantee for that wrapper only.

Other modules remain separately callable:
- `scripts/nexo-repair-session.mjs` exports `runNexoRepairSession()`.
- `scripts/nexo-repair-entrypoint.mjs` exports `runNexoRepairOnce()` and imports `loadStateStrict` from `scripts/simulate.mjs`.
- `scripts/nexo-repair-dispatch.mjs` exports `dispatchPreparedRepair()` and imports `loadStateStrict` and `persistState` from `scripts/simulate.mjs`, plus the Lúmina simulation adapter.
- The relevant source blobs at this review are: runtime wrapper `f67b6fbe1b6f0098ebf23b35055cc668f96df991`; repair session `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5`; repair entrypoint `74d0fa92c447034e7454b7b846d584819ac81ffd`; repair dispatch `ed45438be7604d3b341cecd5fbcfc69adda2447e`.

## Interpretation

The wrapper's blocked result does not prove that every production caller is unable to reach the other exports. This source fact does not prove that any such function was executed or that a defect was exploited. No function was invoked and no state was changed during this review.

Two design questions remain open:
1. Under accepted M0 Option A, classify every product caller of the three lower-level repair APIs and keep unknown callers UNKNOWN/BLOCKED.
2. Keep Lúmina's own simulation/world-state persistence intact, but do not treat Lúmina persistence/effect adapters as ordinary dependencies of Nexo Core.

## Required closure evidence

- Include all three repair APIs, reexports, callsites, and simulation-adapter edges in the D1 caller inventory.
- Classify every known product caller; do not infer that external/downstream callers do not exist.
- Keep the M0 product route excluded; a wrapper-only block is not sufficient evidence of global exclusion.
- If tests are later authorized, test wrapper blocking separately from lower-level reachability, without invoking real external operations.
- Treat module comments and intended call discipline as documentation, not an enforceable boundary.

## Gate state

Read-only source review only. Runtime, tests, workflows, and persisted data unchanged. No tests or CI run. M0 INCOMPLETO; D1-DESIGN OPEN; D1 implementation not authorized; D2/D3 OPEN; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected operations STOP.
