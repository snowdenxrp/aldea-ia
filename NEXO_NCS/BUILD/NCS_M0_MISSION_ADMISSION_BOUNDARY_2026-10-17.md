# NCS M0 — explicit bounded mission admission across restart

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Source/test commit: `10067f1eaa626500c803bb6d3504fc5816eb7239`  
Status: implemented; focused CI verified.

## Change

The Nexo mission planner intentionally admits at most eight steps. Before this increment, it silently applied `steps.slice(0, 8)`, so a plan could omit candidate steps without recording whether truncation occurred. It could also leave an admitted step looking planned when a dependency existed only in the omitted portion.

The planner now exposes an `admission` summary on each newly built mission:

- `candidateStepCount`: deduplicated candidate steps before the historical eight-step bound;
- `admittedStepCount`: steps actually included in this mission;
- `omittedStepCount`: candidates not admitted to this mission;
- `truncated`: whether any candidate was omitted.

The eight-step limit is unchanged. No deferred queue, new observation ID, tombstone, or claim that omitted candidates failed/resolved was introduced. If an admitted step depends on a candidate outside the admitted set, the admitted step is marked `blocked` with `DEPENDENCY_NOT_ADMITTED`; it is not left executable without its prerequisite. The admission summary is persisted and reconstructed across restart.

## Regression evidence

- `tests/nexo/orchestrator.test.mjs`: creates nine deduplicated candidates; asserts eight admitted, one omitted, and a dependent admitted step is blocked because its prerequisite was not admitted.
- `tests/nexo/restart-reconstruction.test.mjs`: asserts admission metadata survives plan persistence and reconstruction.
- Focused mission admission / continuity workflow: [run 39080272772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272772) — **success**; both named tests ran successfully.
- Existing STEP 4 semantic validation: [run 39080272763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272763) — **success**.
- Existing STEP 5 outcome classification: [run 39080272752](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272752) — **success**.
- M0 Core contract workflow: [run 39080272843](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272843) — **success**.

## Bounded Core input/callsite review

The governing Core design says the Core is separate from legacy orchestration and protected effects. Current `src/nexo/runtime.js` imports the mission orchestrator, memory, and simulation adapter; it does not import `src/nexo/core/protected-transition.mjs`. The direct `executeProtectedTransition` references found in the repository search are its own implementation, tests, and documentation, not a demonstrated production runtime call. This is a bounded static finding, not proof against every generated/dynamic path.

The reflection-based Proxy-trap issue remains a separate architecture decision. No Core input API, trust boundary, authority gate, or protected effect path was changed by this increment. The mission-planning improvement is non-authoritative and must not be interpreted as authorization to execute protected effects.

## Limits / next step

This change makes omission visible and dependency-safe; it does not implement continuation of omitted candidates, prove claim equivalence, authenticate authority, or resolve the Proxy boundary. Continue functional work only in isolated non-authoritative modules. Before refactoring Core input validation or wiring any protected sink, settle the root input trust boundary and preserve STEP 7 `OPEN / STOP / UNKNOWN`.
