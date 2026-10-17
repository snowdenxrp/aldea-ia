# NCS M0.38 — Fail closed on malformed raw claim collections

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

The STEP 4 validator checked that a candidate had a claim and a string `claimId`, but later spread four claim-critical collections without confirming they were arrays. A caller passing a look-alike/raw candidate directly to the validator could cause a TypeError instead of a classified validation result. The normal contract constructor validates these arrays, but the validator's own public boundary did not defend against bypassing that constructor.

## Change

Before combining the claim-critical collections, the validator now checks that `authoritativeReads`, `dependencies`, `predicateDependencies`, and `causalInputs` are arrays. A malformed raw claim returns `UNKNOWN` with an explicit reason rather than throwing. Regression coverage invokes the validator directly with a claim missing those collections and verifies the fail-closed result.

## Commits and CI

- Source commit: `a6a1086adac72063c6c99eae36f15d7432ff1f79`
- Test commit: `d31a230d0f40918b71ddc0580210ae06139391d9`
- STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993208161 — success
- STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993208176 — success

## Limits

This is defensive validation at the semantic-validator boundary. It does not prove the complete runtime uses this boundary, authenticate evidence sources, establish constitutional authority, or prove protected-sink closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No full-repository or device test is claimed.
