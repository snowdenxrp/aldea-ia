# NCS M0.11 — Legacy planner non-authority regression guard

**Date:** 2026-10-16  
**Branch:** `ncs-clean-architecture`  
**Status:** Focused CI PASS for seven commands on the recorded test commit; final path-filter revision has its own CI run pending at time of note.  
**Production source changes:** none.

## Rationale

The existing M0.2 bounded caller trace explicitly requires preserving legacy simulation planner behavior and forbids a quick integration of ObservationEnvelope/MissionCandidate into the legacy orchestrator. The repository already has a focused test, `tests/nexo/orchestrator.test.mjs`, that protects severity ordering, dependency blocking, verified-evidence requirements, replanning, bounded Lúmina action allowlisting, and rejection of an unsupported action.

Instead of changing planner semantics or wiring it to the new Core, this step adds that existing test as a named non-authoritative regression guard to the existing M0 workflow. This protects a known boundary while the authority/claim-identity gates remain blocked.

## Changes

Workflow: `.github/workflows/nexo-step-7-observation-contract.yml`

- Added path triggers for `src/nexo/orchestrator.js` and `tests/nexo/orchestrator.test.mjs` under both `push` and `pull_request`.
- Added named command: `node tests/nexo/orchestrator.test.mjs`, labelled `Legacy simulation planner regression guard (non-authoritative)`.
- No production source or test file changed; an existing test was added to CI.

Workflow commits:
- Test command/path trigger: `7c260c7b57d4d2ec75b1545365c406142ccc6aa3`.
- Push-filter alignment: `a96229c0eca928ead2159dbc18cba6c01103841d`.
- Pull-request filter alignment: `57aeefc7112c37c265daacc1ae10d0d285de13d8`.
- Current workflow blob: `e22b51cf977d464d04f5c3d43bcddfa8d2cacafd`.

## CI evidence

Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979129802  
Run ID: `38979129802`  
Tested head: `7c260c7b57d4d2ec75b1545365c406142ccc6aa3`  
Job `observation-contract`: `success`.

All seven commands passed:
1. `node tests/nexo/observation.test.mjs`
2. `node tests/nexo/observation-equivalence.test.mjs`
3. `node tests/nexo/outcome-classifier.test.mjs`
4. `node tests/nexo/core-contracts.test.mjs`
5. `node tests/nexo/protected-transition.test.mjs`
6. `node tests/nexo/reconciliation.test.mjs`
7. `node tests/nexo/orchestrator.test.mjs` — legacy simulation planner regression guard.

A subsequent workflow-only change aligned the pull-request path filters. Its run is tracked separately: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979159431. Do not describe that later run as passed until its own conclusion is `success`.

## Interpretation and non-claims

This demonstrates that the six existing M0 contract tests and the existing legacy planner test pass together in GitHub Actions on the recorded test commit. It creates a regression signal for the tested planner behaviors; it does not establish complete legacy behavior coverage, a full repository test-suite pass, production runtime reachability, claim identity, observation authenticity, constitutional authority, protected-effect enforcement, or bypass closure.

No integration was added between the legacy orchestrator and ObservationEnvelope/MissionCandidate. No authority, identifier scheme, persistence behavior, device setup, Constitution status, or protected-effect behavior changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. No commissioning and no protected effects.**
