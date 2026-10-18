# NCS M0.72 — Block caller-controlled effect reconciliation
Date: 2026-10-18
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED — FOCUSED CI PASS

## Finding
Even after the generic `createReconciler()` was made fail-closed in M0.71, `src/nexo/effect-adapter.js` had a separate path: when the journal contained a `prepared` effect, it invoked `request.reconcile` and accepted `status: "completed"` plus `verified: true`, then persisted the entry as terminal. The callback was supplied by the same caller whose claim needed to be checked, so it could self-assert the reconciliation result.

## Change
`reconcilePrepared()` now never invokes a caller-supplied callback as an authority boundary. If a callback is present, it returns `RECONCILIATION_AUTHORITY_UNAVAILABLE`; if no callback is present, it returns `EFFECT_RECONCILIATION_REQUIRED`. Both outcomes are blocked, unverified, preserve the uncertainty marker, and leave the journal entry `prepared`. Identity mismatch validation still runs first.

## Regression and CI
- Source change: `ffbfad3dd25e4b72b280bba1bf42b8bf8c131bad`.
- Regression tests: `0fc54a0cbc25a70f9cfbc0b8dfae98254eb6d642`.
- An intermediate run at the source-only commit failed because an old test still expected the callback's self-asserted result; that exposed stale test expectations, not a reason to restore unsafe behavior: [run 39092420444](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092420444).
- Exact source/test head focused CI PASS:
  - Mission admission/restart continuity [run 39092451637](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092451637) — includes orchestrator, runtime, effect-adapter, restart reconstruction.
  - STEP 4 [run 39092451625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092451625).
  - STEP 5 [run 39092451642](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092451642).
- M0.71 generic reconciler boundary had separately passed exact-head STEP 6 [39092325409](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325409), M0 Core [39092325426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325426), STEP 4 [39092325423](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325423), STEP 5 [39092325427](https://github.com/snowdenxrp/aldea-ia/actions/runs/39092325427).

## Limits and next engineering task
This closes a self-asserted positive path, not the full recovery capability. A prepared effect now remains unresolved indefinitely unless a real independent reconciliation authority/fence/provenance interface is designed and integrated. Current runtime does not import or call `createReconciler()`; therefore the generic reconciler and effect adapter remain separate contracts rather than one integrated PG-009 recovery flow.

Next inspect the existing ownership/authority source composition and PG-009 transition model to locate an already-defined trusted verifier/current fence boundary. Do not fabricate tokens, authority epochs, provenance, or a new trust root. If no concrete source exists, document the missing architectural dependency and keep recovery UNKNOWN. Preserve the original prepared operation and do not redispatch it.

STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP. No deployment or real-world effect proof is claimed.
