# NCS M0.46 — Reject mutable exotic policy-context data

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The policy-context resolver detached and recursively froze output data, but accepted arbitrary structured-cloneable values. As with the earlier Core contract issue, freezing a `Map`, `Set`, or `Date` does not make its internal state immutable. The resolver also accepted whitespace-only `policyRef.id`, `semanticVersion`, or `hash` values as present identifiers.

## Change

- `detached()` now clones then validates that all nested values are arrays or plain objects before freezing.
- Required policy reference strings reject whitespace-only values.
- Regression tests cover a `Map` scope, a nested `Date` in policy metadata, a nested `Set` in evidence, and a blank policy ID.

## Evidence

- Source commit: `232359375b5fe457a8920454c09ea40fb481bd61`
- Regression-test commit: `d89c45fdc8c1925937c3c4d40bbe3cd8df49fe7d`
- STEP 7 policyContext resolver CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996552925 — success
- STEP 4 semantic validation CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996552902 — success
- STEP 5 outcome classification CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996552905 — success

## Limits

This is data-shape and immutability-boundary validation. It does not authenticate policy references, evidence provenance, or policy authority. No full-repository or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
