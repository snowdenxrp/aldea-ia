# NEXO AB105 — Run Identity Reconciliation — 2026-10-05

## Finding

The previously recorded historical run identifier 370778 cannot currently be resolved through the GitHub Actions API for snowdenxrp/aldea-ia.

Direct API checks:
- GET /repos/snowdenxrp/aldea-ia/actions/runs/370778 → HTTP 404 NOT_FOUND.
- GET /repos/snowdenxrp/aldea-ia/actions/runs/370778/artifacts → HTTP 404 NOT_FOUND.

The authoritative AB105.117R run is independently resolvable:
- run 37098764557
- workflow: NEXO AB105 G0 ordering witness runner v2
- workflow file: .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml
- event: workflow_dispatch
- conclusion: success
- head SHA: 4026db554b617243c13de7f881b98473852aee7b
- job: 111133973894
- artifact: 11265332252
- artifact digest: sha256:d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c

The artifact API independently reports artifact 11265332252 as belonging to workflow run 37098764557.

## Epistemic interpretation

The association 370778 → 11265332252 is not currently reproducible from GitHub's live Actions API and therefore remains HISTORICAL/UNRESOLVED.

It must not be treated as a second run, second artifact, or independent sample.

The canonical raw evidence chain is:
37098764557 → 111133973894 → 11265332252

## Consequence

AB105.117R remains an existing verified raw witness.
No rerun is justified by this discrepancy alone. The discrepancy is documentation/identity reconciliation, not missing experimental evidence.

## DO-NOT-REPEAT
- Do not recreate AB105.117R.
- Do not count artifact 11265332252 twice.
- Do not infer a second sample from unresolved run 370778.
- Do not rerun G0 merely to repair historical bookkeeping.

## Current epistemic state

HB(W1→D1): UNKNOWN / NOT IDENTIFIED.
Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
Security vulnerability: NOT ESTABLISHED.