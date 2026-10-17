# NCS M0.44 — Validate policy-resolution reasons/evidence shapes

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

`resolvePolicyContext()` validated the status field of each check result but accepted malformed `reasons` and `evidence` values. In particular, a string in `reasons` was spread into individual characters while constructing the final reasons list; a non-iterable value could instead throw during result construction. This violated the resolver's expected list-shaped diagnostic contract and made malformed check results behave inconsistently.

## Change

The internal `check()` boundary now rejects arrays masquerading as check-result objects and requires optional `reasons` and `evidence` fields to be arrays when present. Existing behavior for valid statuses and omitted optional arrays remains unchanged. This is input-shape validation only; it does not authenticate the evidence or prove a check's claim is true.

## Evidence

- Source commit: `6cf588982a1b809b54820bb0c96362975f697867`
- Regression-test commit: `c856d19472ca55755f5655678f01151754b865e1`
- STEP 7 policyContext resolver CI at source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994767198 — success
- STEP 4 semantic validation CI at source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994767241 — success
- STEP 5 outcome classification CI at source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994767183 — success

## Limits

No full-repository or device test is claimed. This does not establish source/evidence authenticity, production runtime reachability, constitutional authority, or bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
