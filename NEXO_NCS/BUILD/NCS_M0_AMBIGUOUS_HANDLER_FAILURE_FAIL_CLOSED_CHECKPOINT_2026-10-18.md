# NCS M0 — Ambiguous handler failures remain PREPARED

Date: 2026-10-18  
Repository: `snowdenxrp/aldea-ia`  
Branch: `ncs-clean-architecture`

## Change

The generic effect adapter no longer treats a handler-reported non-completion as a terminal failure merely because the observed state revision stayed unchanged.

- `src/nexo/effect-adapter.js`: invalid handler results return `blocked`; an unchanged observed revision maps to `EFFECT_OUTCOME_UNKNOWN`, while a changed revision maps to `PARTIAL_EFFECT_DETECTED`.
- A valid handler result with status other than `completed` is likewise blocked and leaves its journal entry `prepared`.
- The response records `uncertainty: "effect_may_or_may_not_have_occurred"`. No terminal result is cached, so the same idempotency key cannot redispatch while unresolved.
- A handler's own failure code is not independent proof that an external effect did not occur. A generic revision is not a universal observation of all external effects.
- Existing PREPARED recovery remains fail-closed; caller-supplied reconciliation callbacks are not treated as authority.

## Regression tests

- `tests/nexo/effect-adapter.test.mjs`: covers a handler-reported failure with no observed state revision change, an invalid result, retained PREPARED state, and no redispatch on retry.
- `tests/nexo/runtime.test.mjs`: updates the no-water scenario to expect blocked/UNKNOWN and asserts that changed environment conditions cannot trigger replan around PREPARED.

Commits:
- Adapter: [7a2fada5f15cdff3c4a92114e8a7b0afa507cefd](https://github.com/snowdenxrp/aldea-ia/commit/7a2fada5f15cdff3c4a92114e8a7b0afa507cefd)
- Adapter tests: [806d91fccd2cada55685ba1d50d2a72cdebae9e4](https://github.com/snowdenxrp/aldea-ia/commit/806d91fccd2cada55685ba1d50d2a72cdebae9e4)
- Runtime tests: [431978730f3b2be300fa51d3a35938ef6702e607](https://github.com/snowdenxrp/aldea-ia/commit/431978730f3b2be300fa51d3a35938ef6702e607)

## Verification status

CI for this exact code-and-test head has not yet been confirmed. Do not mark it PASS without checking the corresponding Actions runs.

## Boundary / next step

This closes one unsafe terminal-failure classification. It does **not** provide an operation-specific verifier or terminal settlement API, complete runtime migration to the standalone Nexo owner, establish atomicity across the Nexo continuity file and Lúmina world-state file, or authorize protected effects.

Next work must inspect the exact environment persistence boundary and crash cuts, then specify a trusted operation-specific read/verification path before allowing terminal settlement. Until then, PREPARED remains UNKNOWN; no redispatch or replan around it. M0 remains incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
