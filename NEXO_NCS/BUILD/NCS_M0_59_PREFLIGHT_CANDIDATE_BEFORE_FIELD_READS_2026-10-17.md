# NCS M0.59 — Preflight candidate before reading fields

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Status: FOCUSED CI PASS — BOUNDED CORE DATA-CONTRACT FIX

## Finding

M0.58 preflighted the request passed to `executeProtectedTransition()`, but the next boundary remained unchecked: the object returned by `candidateExecutor.execute()`. `assertCandidate()` read `candidate.claim` and `candidate.expectedRevision` before establishing that the returned candidate was a plain data record. A candidate object with a getter could therefore execute caller-controlled code during validation.

## Change

- `assertCandidate()` now calls the shared `assertContractInput(candidate, "candidate")` before reading any candidate fields.
- Removed the redundant truthiness check for `candidate.claim` from the first condition; the shared preflight establishes a non-null, non-array record and rejects accessors, symbol properties, non-enumerable properties, and unsupported nested object shapes before field reads.
- Added a regression test where the candidate's enumerable `expectedRevision` getter increments a counter. The transition rejects the candidate while the getter counter remains zero; semantic validation and commit are not called.

## Evidence

- Source change commit: `eccc1fc200a41e5ec3a3f70243658e39d4a39e13`
- Regression test commit: `85da2fdcdfeaf8f0eed2585024a7e85c82b62a63`
- M0 Core contracts CI: [run 39075400456](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075400456) — success
- STEP 4 semantic validation CI: [run 39075400447](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075400447) — success
- STEP 5 outcome classification CI: [run 39075400437](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075400437) — success
- STEP 3A/3B/3C verification CI: [run 39075400440](https://github.com/snowdenxrp/aldea-ia/actions/runs/39075400440) — success

All four focused workflows completed successfully on the final regression-test commit `85da2fdcdfeaf8f0eed2585024a7e85c82b62a63`.

## Scope and limits

This closes the identified data-shape/read-before-validation defect at the candidate boundary. It does not establish that a candidate executor or any port is compositionally trusted; it does not prove the candidate state is authoritative, the production runtime reaches this transition exclusively, durable commit/reconciliation is wired, or protected-effect bypasses are closed. The authority tests remain contract-level tests, not proof of legitimate constitutional authority.

**STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.** Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED. No first deployment target or first constitutional ownership class is inferred by this fix.
