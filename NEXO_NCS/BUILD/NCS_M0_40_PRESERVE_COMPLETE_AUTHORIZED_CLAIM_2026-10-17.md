# NCS M0.40 — Preserve the complete authorized claim in the candidate

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

The protected-transition boundary previously compared only `candidate.claim.claimId` with the claim sent to the authority gate. A candidate could preserve the identifier but substitute another field, such as `action`, without this identity check detecting the substitution. That is insufficient: semantic validation and commit must operate on the same complete claim that crossed the authority gate.

## Change

`assertCandidate()` now rebuilds the candidate claim through `createClaimEnvelope()` and uses Node's `isDeepStrictEqual` to compare the complete normalized claim against the claim previously authorized. A mismatch is rejected before final semantic validation and conditional commit. Regression coverage substitutes the action while preserving the same claim ID and asserts zero validator/commit calls. The existing wrong-ID test now expects the stronger full-claim error.

## Commits and CI

- Source commit: `7a453037c731cb26bca1d1bbc6ed02df47d32f45`
- Regression-test commit: `1c0493708cf11874a46e73e25920bb45c1e885d3`
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993603206 — success
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993603150 — success
- M0 core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993603226 — success

## Limits

This closes the observed candidate claim substitution at this boundary; it does not prove the authority gate is legitimate, the runtime path reaches this function in production, or all protected sinks are closed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No full-repository or device test is claimed.
