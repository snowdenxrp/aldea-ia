# NCS M0.68 — Preflight outer reconciliation input before destructuring
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Source + regression commit: `2891397fe57f1fd894033b43017c506c9fd7c13a`

## Contract defect
The reconciliation API destructured its argument in the parameter list. JavaScript evaluates property accessors during parameter destructuring, so a caller-controlled getter on the outer call record ran before M0.67's descriptor-based validation of nested case/evidence data. A `null` argument also threw before the reconciler could fail closed.

## Change
- Replaced parameter destructuring with an opaque `input` parameter.
- Preflighted the complete call record with descriptor-based `assertPlainData` before reading fields.
- Return `INVALID` for malformed/non-record/null outer input.
- Destructure only after the original record has passed preflight.

## Regression coverage
- Getter on outer `evidence` remains uncalled and result is `INVALID`.
- Getter on outer `reconciliationCase` remains uncalled and result is `INVALID`.
- `reconcile(null)` returns `INVALID` rather than throwing.

## Verification
Focused CI runs on the source/test commit:
- M0 non-authority Core contracts: run 39077509867 — pending at report creation.
- STEP 5 outcome classification: run 39077509873 — pending at report creation.
- STEP 6 reconciliation: run 39077509943 — pending at report creation.
- STEP 4 semantic validation: run 39077510016 — pending at report creation.

Replace pending status only after checking the actual run conclusions. Focused CI does not equal a full repository test run.

## Boundary that remains unresolved
M0.68 is structural input hardening. It does not authenticate `authoritative: true`, prove evidence provenance/freshness, establish legitimate constitutional authority, or prove production protected-effect reachability/bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
