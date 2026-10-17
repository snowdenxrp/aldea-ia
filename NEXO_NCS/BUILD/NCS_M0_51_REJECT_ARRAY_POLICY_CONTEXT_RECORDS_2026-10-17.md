# NCS M0.51 — Reject array-shaped policy-context records

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The policy-context contract checked several record-shaped fields with `typeof value === "object"`, which also accepts arrays. JavaScript arrays can be assigned named properties such as `status` or `dependencies`, but `structuredClone(array)` does not preserve those named properties. That meant malformed arrays could pass pre-clone checks and become malformed output records.

## Change

- `policyContext.policyRef` must be a non-array record.
- `policyContext.validity` must be a non-array record.
- `policyContext.resolved` must be a non-array record.
- Regression tests use arrays decorated with named properties to ensure each is rejected before cloning.

## Commits

- Source: `fbc7ede58e7ed397f39b66d2b94f506ebcfed801`
- Regression tests: `349dddb5143f71e3a550be92bd499e7297118c81`

## Focused CI

- M0 core: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227742 — success
- STEP 7 policy-context contract: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227754 — success
- STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227792 — success
- STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227880 — success
- STEP 3A/3B/3C: https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227744 — success

## Limits

This hardens input shape and clone fidelity only. It does not authenticate policy references, validate policy truth, establish constitutional authority, or prove production runtime reachability. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
