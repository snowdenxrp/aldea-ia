# NCS M0.71 — Fail closed on unauthenticated reconciliation authority claims
Date: 2026-10-18
Branch: `ncs-clean-architecture`

## Finding
`src/nexo/core/reconciliation.mjs` treated a caller-supplied evidence record containing `authoritative: true` and a recognized terminal outcome as sufficient for `RESOLVED`. The value was only caller-controlled metadata. Descriptor checks and immutable cloning protect shape and aliasing, but cannot authenticate who observed the effect or whether the observation is current and fenced.

## Change
The generic reconciler now validates the envelope and dense evidence slots, but returns `UNRESOLVED` for evidence supplied through this boundary. It no longer promotes the `authoritative` boolean or outcome field into a resolved decision. This is intentionally fail-closed because no trusted verifier + current fence/authority epoch + provenance source is wired into this module.

Regression changes assert:
- a caller record with `authoritative: true` and `SEMANTIC_CONFLICT` remains `UNRESOLVED`;
- a plausible `SAFE_COMMIT` object is not retained as resolved evidence;
- caller-controlled array methods are not invoked and cannot establish authority;
- existing malformed/accessor/symbol and indeterminate-outcome behavior remains fail-closed.

## Verification
Final source/test head: `d67fd243016a2457747853a4b4a5342f8ca2ce4e`.
Focused CI was triggered at that exact head:
- STEP 6 reconciliation: [run 39092325409](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325409)
- M0 non-authority core contracts: [run 39092325426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325426)
- STEP 4 semantic validation: [run 39092325423](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325423)
- STEP 5 outcome classification: [run 39092325427](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325427)

These runs were queued at report creation; their final conclusions must be checked before calling the increment verified.

## Limits / next blocker
This does not implement authoritative reconciliation. It removes an unsafe positive claim: evidence at this generic boundary cannot resolve the case until a trusted authority/fence/provenance port exists. It also does not implement PG-009 recovery transitions or prove the production runtime reaches this reconciler.

Next: check the four exact-head CI runs; then trace all callers of `createReconciler()` and the recovery contract to decide where the independent verifier/current fence should live. Do not fabricate authority, epochs, lease tokens, or source provenance. If the trust boundary cannot be grounded in existing architecture, keep recovery UNKNOWN and protected effects STOP.

STEP 7 remains OPEN / STOP / UNKNOWN. No activation or deployment proof is claimed.
