# NCS — M0 Application Surface Acceptance Gate
Date: 2026-10-19
Basis code/test SHA: 71a01beb06d9a9d01e1cd459fe123588e1dd553b

## Purpose

Define the minimum proof required before any UI, local API, Android shell, or legacy-runtime caller consumes the Nexo application API. This gate prevents the current CLI/Chronicle vertical from being mistaken for a completed Nexo application.

## Required conditions before integration

1. **Single public entry:** consumers import only `src/nexo/application/index.mjs`. They do not call the core owner/store or Chronicle adapter directly to perform an effect.
2. **Nexo/Lúmina separation:** the complete static import graph from the consumer entry must not reach `src/nexo/runtime.js`, `src/assistants/memory.js`, `simulation-adapter.js`, `world.js`, `simulation.js`, or `simulate.mjs`.
3. **One mutating use case:** only `runNexoChronicleAppend` is mutating. The other public functions are read-only status/reconstruction queries. No generic dispatcher or action registration from UI input.
4. **Trusted local configuration:** store paths are trusted configuration, not user-controlled arbitrary paths. Missing/corrupt state must not be silently repaired. Initialization stays opt-in.
5. **Honest outcome mapping:** the surface preserves `completed`, `blocked`, `conflict`, `unknown`, and `observed`; it preserves tri-state `UNKNOWN` fields and never maps them to false/success.
6. **No implicit retry:** no background retry, queue, retry timer, or second dispatch. The caller may re-read canonical state and make an explicit retry decision.
7. **No payload leakage:** Chronicle content, targets, context, raw adapter errors, and full snapshots must not be emitted to logs/status output. Mission-status is limited to the documented summary.
8. **Restart and race proof:** tests cover same-identity replay after a new process, same-operation concurrent calls, concurrent first-time bootstrap, PREPARED recovery, response loss at PREPARED/lineage/reconciliation/outcome boundaries, and payload mismatch.
9. **No authority inference:** continuity records prove only what the operation-specific contract establishes. A store revision, device, process, or successful append does not grant owner/authorization authority.
10. **No runtime-default cutover:** `src/nexo/runtime.js` and `index.html` remain unchanged until a separate architecture decision is supported by end-to-end evidence.

## Current evidence

- Public application API: `src/nexo/application/index.mjs` exports exactly `runNexoChronicleAppend`, `loadNexoContinuityStatus`, `loadNexoMissionStatus`.
- Result semantics: [NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md](NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md).
- Import graph, read-only mission reconstruction, private-payload non-disclosure, process replay and concurrency regressions pass in focused CI. See [NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md](NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md) and the current handoff.

## Not yet satisfied / explicit STOP

- No Android or browser Nexo application has been built by this work.
- The existing `index.html` is still Lúmina's entrypoint.
- No secure local HTTP service, authentication boundary, or authority protocol has been established for a UI.
- No generic external effect or protected transition is enabled.
- No claim of fsync/power-loss durability or atomicity across continuity and Chronicle stores.

## Acceptance decision

The current public API and CLI are a validated backend/application seam for one native Chronicle vertical, **not** authorization to wire it into a UI or legacy runtime. A new surface requires a separate review of its threat boundary and test plan against every condition above.

M0 remains **INCOMPLETO**. Protected effects remain **STOP**. Nexo and Lúmina remain separate.
