# NCS M0.48 — Detach and deeply freeze reconciliation evidence

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The reconciler returned the caller's evidence object inside a frozen array. The array itself could not be modified, but the evidence object and nested values remained caller-owned and mutable. A caller could therefore change the evidence after a result had been reported `RESOLVED`, undermining the stability of the result.

## Change

- Reconciliation evidence is structured-cloned, validated as arrays/plain objects only, and recursively frozen before inclusion in the result.
- Evidence containing exotic mutable objects (for example, `Map`) fails closed to `UNRESOLVED`.
- Reconciliation rejects arrays and malformed/blank-boundary objects as reconciliation cases.
- Regression tests prove caller mutation no longer changes returned evidence and the returned nested evidence cannot be mutated.

## Evidence

- Source commit: `aff3d102cc43fe464f05c030bf69af9e4508b133`
- Regression-test commit: `a6e3f688964435500a9602654692b76fe033a489`
- STEP 6 source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996755140 — success
- M0 core source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996755038 — success
- STEP 5 source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996755081 — success
- STEP 4 source CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996755318 — success
- STEP 6 regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996762772 — success
- M0 core regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996762735 — success
- STEP 5 regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996762756 — success
- STEP 4 regression CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996762759 — success

## Limits

The reconciler still trusts the caller-supplied `authoritative: true` flag. Deep detachment and freezing protect result integrity; they do not authenticate the evidence or prove its authority. No full-repository/device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
