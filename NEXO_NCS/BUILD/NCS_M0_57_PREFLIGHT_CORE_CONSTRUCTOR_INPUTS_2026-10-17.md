# NCS M0.57 — Preflight Core constructor inputs before field access

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

M0.56 made `detachedImmutable()` validate object graphs before cloning, but some public Core constructors read caller-controlled fields before reaching that helper. For example, `createClaimEnvelope()` read `claimId` and `action` first; `createValidationResult()` destructured `reasons` and `evidence` in its parameter list; policy-context validation read nested fields before detachment. An enumerable getter at those entry points could therefore execute before the M0.56 guard, leaving the earlier fix incomplete at the constructor boundary.

## Change

Added `assertContractInput()` to validate each constructor's input/options record as a plain record and run the deep data-property preflight before reading fields. Applied it to:
- `createClaimEnvelope`
- `createPolicyContext`
- `createCandidate` (changed from parameter destructuring to validated body destructuring)
- `createValidationResult`
- `createCommitResult`
- `createOutcome`
- `createAuthorityResult`

Regression tests prove a top-level `claimId` getter and a result-options `evidence` getter are rejected without executing either getter. They also verify malformed array/null constructor inputs fail closed.

## Evidence

- Source commit: `c10e241c7dbd5830c9d084d02190878c5b1ac68b`
- Regression tests: `5980f45d22eb0ef3f9ee2bdab9da35075d4ed94f`
- M0 Core contracts CI: [run 39044318251](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044318251) — success on regression-test commit
- STEP 4 semantic validation CI: [run 39044318273](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044318273) — success
- STEP 5 outcome classification CI: [run 39044318250](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044318250) — success
- STEP 7 policyContext contract CI: [run 39044318249](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044318249) — success
- STEP 3A/3B/3C CI: [run 39044318372](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044318372) — success

## Scope and limits

This closes pre-validation getter execution at the listed Core constructor input boundaries. It is a contract/data-shape result only; it does not prove evidence authenticity, legitimate constitutional authority, production runtime reachability, durable external-effect reconciliation, or absence of protected-path bypasses. No full-repository or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
