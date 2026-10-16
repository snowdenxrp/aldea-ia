# NCS M0.13 — Outcome classifier input-shape validation

Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

The existing pure outcome classifier validated the terminal outcome name but passed `reasons` and `evidence` directly to `createOutcome()`. That lower-level contract spreads these values into arrays. A string could therefore become an array of characters instead of being rejected as malformed input.

## Change

- `src/nexo/core/outcome-classifier.mjs` now requires both `reasons` and `evidence` to be arrays, otherwise it throws `TypeError`.
- `tests/nexo/outcome-classifier.test.mjs` covers a string for reasons, an object for evidence, and null reasons.
- No changes to terminal outcome meanings, commit, reconciliation, runtime, authority, or protected-effect paths.

## Exact evidence

- Source commit: `8b82db6cab6e8a2d589467a0042f3d06b0357809`
- Test commit / CI head: `e7ca523c674e8f45aaea12b71650f4fb83262f14`
- Full M0 contract workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979568891
- Job `observation-contract`: success; all seven configured commands succeeded.
- Focused outcome workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979568886
- Job `outcome-classification`: success; both `node tests/nexo/outcome-classifier.test.mjs` and `node tests/nexo/protected-transition.test.mjs` succeeded.

## Boundaries / non-claims

This is input-shape validation for a pure contract only. It does not validate the truth or provenance of evidence, authorize an outcome, commit state, or prove full `npm test` success.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective.
