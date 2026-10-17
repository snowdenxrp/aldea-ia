# NCS M0.28 — Detach nested evidence in result contracts

Date: 2026-10-17
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

`createClaimEnvelope()` and policy-context construction use `detachedImmutable()` to clone nested caller data before freezing it. The result constructors `createValidationResult()`, `createOutcome()`, and `createAuthorityResult()` instead copied only the top-level arrays and recursively froze nested evidence/reason objects by reference. This could freeze caller-owned objects and allow subsequent caller mutations to affect the intended ownership boundary differently from the ClaimEnvelope contract.

## Change

- `src/nexo/core/contracts.mjs`: the three result constructors now use `detachedImmutable(reasons)` and `detachedImmutable(evidence)`, matching the existing clone-then-freeze pattern.
- `tests/nexo/core-contracts.test.mjs`: regression assertions for validation, outcome, and authority results verify nested data is detached, source values cannot mutate returned results, and caller-owned nested objects remain unfrozen.
- No new contract abstraction or authority semantics introduced.

## Evidence

Source commit: `eb5e50c3bf5ca2cddec4e46e63531b6a1c72890e`
Test commit / CI head: `6ef02115c86c259363d28e363c8d0468f3c35b9f`

Focused CI on the test commit:
- M0 non-authority core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987977314 — success.
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987977285 — success.
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987977316 — success.
- Policy-context contract workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987977369 — success.

## Boundaries

These are focused tests only, not a full-repository test run. This fixes ownership/immutability semantics for the three result constructors; it does not establish authenticity, truth, freshness, authority, production runtime reachability, or protected-effect safety. STEP 7 remains OPEN / STOP / UNKNOWN; Constitution remains uncommissioned and protected effects remain STOP.
