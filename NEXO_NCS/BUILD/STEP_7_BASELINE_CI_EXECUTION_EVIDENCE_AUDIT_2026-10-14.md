# STEP 7 — Baseline CI execution evidence audit (2026-10-14)

## Purpose

Establish whether the repository's existing Node 22 / GitHub Actions definitions provide an observed baseline test result for the current `ncs-clean-architecture` head before considering a Javet compatibility experiment. This is an evidence audit, not a test run.

## Repository head inspected

- Repository: `snowdenxrp/aldea-ia`
- Branch: `ncs-clean-architecture`
- Head observed: `bf9a31fa65265339a63c803c9dbed271bb3c0e1d`
- HEAD commit message: `docs(ncs): record Javet parity gate in STATUS`
- Branch API reports protection disabled and no required status checks configured.
- Commit check-runs endpoint returned `total_count: 0`.
- Commit combined-status endpoint returned `total_count: 0` and state `pending`.
- Actions runs filtered by this exact head SHA returned `total_count: 0`.

These are direct API observations at audit time. They do not establish that code is broken; they establish that no CI run/check result was attached to this exact head in the inspected GitHub records.

## Existing workflow trigger review

### General deterministic suite

File: `.github/workflows/nexo-deterministic-tests.yml`

- Runs on push to `main` and `workflow_dispatch`.
- Uses Ubuntu, Node.js 22, `npm install`, then `npm test`.
- A push to `ncs-clean-architecture` alone does not trigger this workflow under the declared push filter.
- Workflow definition is not execution evidence.

### STEP 7 negative-resource equivalence

File: `.github/workflows/nexo-step-7-negative-resource-equivalence.yml`

- Trigger: `workflow_dispatch` only.
- Uses Node.js 22 and runs `node tests/nexo/step-7-negative-resource-equivalence.test.mjs`.
- No observed run exists for the inspected current head.

### STEP 7 observation contract

File: `.github/workflows/nexo-step-7-observation-contract.yml`

- Trigger: `workflow_dispatch` only.
- Uses Node.js 22 and runs `node tests/nexo/observation.test.mjs`.
- No observed run exists for the inspected current head.

## Historical run evidence — bounded interpretation

The branch's Actions run listing returned 19 workflow runs. It included STEP 4 semantic-validation and STEP 5 outcome-classification runs from earlier commits on 2026-10-12, including successful and failed outcomes. These are useful historical execution evidence for those specific workflows and SHAs only. They are not a full `npm test` result for the current head, not a STEP 7 negative/observation run for the current head, and not runtime or constitutional-authority evidence.

The same listing included multiple M1 build runs. They are out of STEP 7 scope and do not alter the decision to keep M1 paused.

## Execution and capability boundary

The available GitHub connector surface exposed GET/read operations for workflow records, jobs, steps, logs and artifacts, but no workflow-dispatch operation. No workflow was dispatched, rerun, or modified. No tests were executed in this audit. Do not report a PASS or FAIL for the current-head test suite.

## Finding

**BASELINE CI EVIDENCE FOR CURRENT HEAD: NOT AVAILABLE / UNKNOWN.**

This is a proof gap in the inspected records, not a claim that tests fail. The current head has no check runs or combined statuses; the default deterministic workflow is not configured to run on pushes to this branch; and the STEP 7 workflows are manual-only.

## Required next action

1. Obtain an authorized manual dispatch of the existing Node 22 deterministic suite against the exact current head, then capture run ID, head SHA, job/step summaries, logs, and conclusion; or use a supported runner that can execute the exact repository commit and dependencies, preserving raw output and environment metadata.
2. Run the two existing STEP 7 manual workflows against the same exact head and retain their evidence.
3. If the connector cannot dispatch and no repository-local runner is available, leave this gate UNKNOWN and ask for the smallest authorized action needed to start the existing workflows; do not change workflow triggers just to manufacture green checks.
4. Only after baseline evidence exists, inspect failures and exact dependency/runtime provenance. A passing baseline still does not establish host trust, constitutional authority, currentness/revocation, or protected-sink closure.

## Change boundary

- No source code, tests, workflows, dependencies, APK, runtime, device, key, Constitution, or deployment changed.
- No workflow dispatch or test execution occurred.
- STEP 7 remains **OPEN / STOP / UNKNOWN**. No commissioning and no protected effects.
