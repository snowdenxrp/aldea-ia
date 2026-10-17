# NCS M0.69 — Fail closed on malformed reconciliation evidence

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Implementation commit: `3ba751da5792f5534c7af6b6c2485f8e4c1ae364`

## Defect

In `src/nexo/core/reconciliation.mjs`, `if (!Array.isArray(evidence)) throw new TypeError(...)` allowed malformed caller input to escape as an exception. This contradicted the boundary's existing fail-closed contract, where malformed evidence graphs produce `UNRESOLVED` and invalid reconciliation cases produce `INVALID`.

## Correction

Non-array evidence now returns a frozen result:
- `status: "UNRESOLVED"`
- `outcome: null`
- frozen empty `evidence` array

The reconciliation-case validation remains unchanged. This keeps malformed evidence distinct from an invalid case and prevents caller-controlled malformed input from escaping as an unhandled exception.

## Regression evidence

Added cases for `evidence: null`, object, string, and number. Each asserts `UNRESOLVED`, null outcome, and empty evidence without throwing.

## Focused CI — all success

- STEP 6 reconciliation: [run 39077886855](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886855)
- M0 non-authority Core contracts: [run 39077886864](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886864)
- STEP 4 semantic validation: [run 39077886857](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886857)
- STEP 5 outcome classification: [run 39077886871](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886871)

## Scope and limitations

This is a bounded, non-authoritative Core contract fix. It does not authenticate `authoritative: true`, establish evidence provenance or freshness, prove the production runtime reaches the protected transition, prove final-sink closure, or establish legitimate constitutional authority. STEP 7 remains **OPEN / STOP / UNKNOWN** and protected effects remain STOP. No commissioning or device wiring is authorized by this increment.
