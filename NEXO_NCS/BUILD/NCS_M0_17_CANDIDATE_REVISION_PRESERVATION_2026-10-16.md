# NCS M0.17 — Candidate preserves requested expected revision

Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

`executeProtectedTransition()` passed the requested `expectedRevision` to the candidate executor, but its candidate assertion only required that the returned revision be a non-negative integer. It did not verify equality with the revision requested by the transition. A candidate executor could therefore return a different revision, and the commit port would receive that altered candidate.

## Change

- `src/nexo/core/protected-transition.mjs`: `assertCandidate` now requires the candidate's `expectedRevision` to exactly equal the requested revision.
- `tests/nexo/protected-transition.test.mjs`: a regression probe returns a candidate with revision 2 for a transition requested at revision 1. The transition rejects it before semantic validation or conditional commit; both call counts remain zero.

## Exact evidence

- Source commit: `c1dd1cfc230bf26fbbb109b7db5ef172dd50d982`
- Test commit / CI head: `d0794939196db91fd380aa133e74805a1e135401`
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38980210565 — success.
- STEP 5 outcome classification + protected-transition tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/38980210484 — success.
- M0 seven-command contract workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38980210530 — success.

## Boundaries

This enforces revision preservation inside the protected-transition composition. It does not prove that the commit adapter checks the same revision atomically, that a production runtime invokes this composition, that the authority gate is legitimate, or that bypass paths are closed. No full-repository test result is claimed.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. Constitution is not frozen or commissioned; protected effects remain stopped.
