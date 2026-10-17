# NCS M0.68 — Preflight outer reconciliation input before destructuring
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Source + regression commit: `2891397fe57f1fd894033b43017c506c9fd7c13a`; refinement commit: `269ec27b41d24752e9ab784c450f4c6a1981c3e6`

## Contract defect
The reconciliation API destructured its argument in the parameter list. JavaScript evaluates property accessors during parameter destructuring, so a caller-controlled getter on the outer call record ran before M0.67's descriptor-based validation of nested case/evidence data. A `null` argument also threw before the reconciler could fail closed.

## Change
- Replaced parameter destructuring with an opaque `input` parameter.
- Preflighted the outer record's own property descriptors before reading fields; nested case/evidence graphs are then validated independently, preserving `INVALID` for malformed call/case input and `UNRESOLVED` for malformed evidence.
- Return `INVALID` for malformed/non-record/null outer input.
- Destructure only after the original record has passed preflight.

## Regression coverage
- Getter on outer `evidence` remains uncalled and result is `INVALID`.
- Getter on outer `reconciliationCase` remains uncalled and result is `INVALID`.
- `reconcile(null)` returns `INVALID` rather than throwing.

## Verification
Focused CI on refinement commit `269ec27b41d24752e9ab784c450f4c6a1981c3e6` — all completed successfully:
- M0 non-authority Core contracts: [run 39077587049](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077587049) — success.
- STEP 5 outcome classification: [run 39077587028](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077587028) — success.
- STEP 6 reconciliation: [run 39077587039](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077587039) — success.
- STEP 4 semantic validation: [run 39077587027](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077587027) — success.

An initial attempt failed because the full recursive outer preflight changed malformed nested evidence from `UNRESOLVED` to `INVALID`. The implementation was narrowed to preflight only the outer envelope descriptors before destructuring; the independent nested checks preserve the established status semantics. The four runs above test that corrected source.

## Boundary that remains unresolved
M0.68 is structural input hardening. It does not authenticate `authoritative: true`, prove evidence provenance/freshness, establish legitimate constitutional authority, or prove production protected-effect reachability/bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
