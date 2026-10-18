# NCS M0 — Runtime refuses execution/replan from invalid continuity

Date: 2026-10-18
Status: IMPLEMENTED; EXACT-HEAD CI PASS

## Problem

The strict continuity contract existed at the snapshot-loading boundary, but the runtime and persisted-replan function could still receive an arbitrary in-memory object. Tolerant helpers such as `createLearningMemory()` normalize malformed/missing collections, which is useful for compatibility but must not be allowed to erase a prepared-effect obligation immediately before execution or replanning.

## Change

`src/nexo/runtime.js` now calls the Nexo-owned `assertNexoContinuityMemoryShape()` before:
- beginning a step when a non-null memory snapshot is supplied;
- reconstructing/replanning a persisted mission.

If validation fails:
- execution returns `blocked` with the continuity contract's error code;
- the adapter handler is not invoked;
- the supplied mission/memory are not mutated;
- persisted replan returns `not_replanned` with the same code and creates no successor.

The guard is conditional on a supplied memory object. It does not pretend that a memory-less generic adapter invocation has durable continuity; the production execution owner remains absent.

## Regression

`tests/nexo/runtime.test.mjs` creates a prepared journal entry whose mission plan is missing. It asserts:
- execution is blocked with `NEXO_RECOVERY_CONTEXT_MISSING`;
- handler invocation count remains zero;
- the mission remains planned and the prepared entry remains untouched;
- replan returns `not_replanned` and creates no mission.

## Evidence

- Runtime source commit: `4316b079b9bc54f973ab71ed1657cdf4886ac734`
- Test commit / exact source+test head: `e237469a4e17ea4687a7b5fa9a84d9005d7938b6`
- Exact-head CI PASS:
  - Mission/restart continuity [39097980956](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097980956), including runtime, restart, strict state persistence, and continuity-contract tests.
  - STEP 4 [39097980918](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097980918).
  - STEP 5 [39097980960](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097980960).

## Limits

This closes the in-memory normalization bypass for supplied continuity objects. It does not establish Nexo's canonical persistence owner, authenticate evidence, resolve a prepared external effect, or establish current constitutional authority. A structurally valid continuity snapshot remains only structural evidence. M0 incomplete; external prepared effects UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

## Next

Define Nexo's canonical continuity owner and store boundary, independent from Lúmina's world-state ownership. Then connect only the bounded local operation lifecycle under a contract that can prove prepare-before-dispatch, terminal snapshot consistency, crash behavior and restart reconstruction. Do not create an external executor or promote the simulation store into constitutional authority.
