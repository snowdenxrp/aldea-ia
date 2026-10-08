# NEXO — STEP 3B Protected-Transition Composition — 2026-10-08

## Purpose
Compose the smallest executable protected-transition path on top of the verified STEP 3A isolation contract.

## Implemented
- `src/nexo/core/protected-transition.mjs`
- `tests/nexo/protected-transition.test.mjs`
- `src/nexo/core/contracts.mjs`: formal `AuthorityResult` contract
- `.github/workflows/nexo-step-3a-isolation.yml`: focused 3A + 3B verification workflow
- `package.json`: protected-transition contract test included in the project test command

## Composition
`CLAIM → AUTHORITY → ISOLATION → CANDIDATE → FINAL VALIDATION → CONDITIONAL COMMIT → OUTCOME`

The proposal boundary remains outside this function; ClaimBuilder receives the provider/application proposal and produces the claim.

## Required gates
1. ClaimBuilder must produce a valid claim identity.
2. AuthorityGate must return a valid AuthorityResult.
3. STOP exits as AUTHORITY_STOP before isolation/candidate work.
4. UNKNOWN authority exits as UNKNOWN before isolation/candidate work.
5. SnapshotIsolator must establish isolated state.
6. CandidateExecutor receives only the isolated state and cannot directly commit.
7. Candidate must preserve the claim identity and expected revision.
8. FinalSemanticValidator is mandatory.
9. Validation FAIL → SEMANTIC_CONFLICT.
10. Validation UNKNOWN → UNKNOWN.
11. ConditionalCommit is reachable only after validation PASS.
12. Commit conflict → STALE_CANDIDATE.
13. Commit failure/UNKNOWN → UNKNOWN; no safe success inference.
14. SAFE_COMMIT requires COMMITTED conditional commit.
15. OutcomeClassifier is mandatory and its returned terminal kind is checked against the required classification. A classifier that converts UNKNOWN/STOP/etc. into another outcome is rejected as a contract violation.

## Architectural correction discovered during composition
The first draft returned terminal outcomes directly and therefore did not exercise the explicit OutcomeClassifier ownership boundary. That would have bypassed a defined construction stage.

This was corrected at the design boundary rather than patched around:
- all terminal outcomes now pass through `ports.outcomeClassifier.classify`;
- the composition verifies that the classifier returns the required terminal kind;
- an attempted UNKNOWN → SAFE_COMMIT conversion raises a structural contract error.

## Evidence
🟢 STEP 3A focused runtime verification is proven by GitHub Actions job 113178605145 on commit 6c06a6fee413a74aebc92ba41536c45120f18d97.
🟢 STEP 3B source syntax for `protected-transition.mjs` was checked in an executable Node.js 22 environment.
🔵 STEP 3B behavioral test execution is still NOT VERIFIED in the available runtime/Actions state.
🔵 The focused workflow was committed, but no completed STEP 3B workflow result is currently observable for the latest composition commits.
🔴 STEP 3B is therefore NOT marked production-safe or fully verified.

## Safety boundary
This composition does not implement external irreversible effects, exactly-once semantics, power-loss durability, distributed fencing, reconciliation, or provider/model execution. Those remain separate construction stages.

## Next action
Verify the STEP 3B behavioral test in an executable environment.

If the test passes:
- record runtime proof;
- close STEP 3B only if the invariants are actually demonstrated;
- proceed to the smallest next construction step.

If it fails:
- determine whether it is an implementation defect or architectural contradiction;
- fix the root mechanism;
- never add a bypass/patch merely to obtain a green test.

## DO-NOT-REPEAT
- Do not rerun TLC.
- Do not create AB105.117R.
- Do not replay AB104/AB105 sequentially.
- Do not reopen broad historical audits.
