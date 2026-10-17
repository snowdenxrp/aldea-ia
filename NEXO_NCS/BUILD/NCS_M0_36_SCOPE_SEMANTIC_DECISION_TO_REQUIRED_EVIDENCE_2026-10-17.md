# NCS M0.36 — Scope semantic decision to claim-critical requirements

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

In `src/nexo/core/final-semantic-validator.mjs`, STEP 4 iterated over every item in `context.requirements`. Although authority checks were limited to IDs required by the claim, status classification was not: an unrelated requirement with status `FAILED` could force the entire claim to `FAIL`; an unrelated invalid/unknown status could force `UNKNOWN`. This allowed unrelated context data to change a claim's decision.

## Change

The validator now classifies status/authority only for requirements whose IDs are in the claim's required claim-critical ID set. Missing required IDs still yield `UNKNOWN`; a required `FAILED` still yields `FAIL`; required evidence with invalid/unknown status or inadequate authority still yields `UNKNOWN`. Unrelated requirements no longer alter the decision.

Regression added: a valid claim with its required evidence satisfied plus an unrelated `FAILED` requirement returns `PASS`. Existing required-failure test remains `FAIL`.

## Commits and CI

- Source commit: `17431cff0bc9e1c13fb74dd0bb7741f4fe416ba3`
- Regression test commit: `eea37c61c75a725bec28e0c9331d37e53f3ef66f`
- STEP 4 run on source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993022847
- STEP 5 run on source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993022854
- STEP 4 run including regression test: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993025244
- STEP 5 run including regression test: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993025169

All four listed STEP 4/STEP 5 runs completed successfully, including both runs on the regression-test head.

## Limits

This is a claim-decision scoping correction only. It does not authenticate requirement sources, establish legitimate constitutional authority, prove production runtime reachability or protected-sink closure, or change STEP 7. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No full-repository test run or device test is claimed.
