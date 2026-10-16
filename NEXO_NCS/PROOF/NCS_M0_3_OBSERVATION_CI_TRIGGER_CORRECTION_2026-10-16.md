# NCS M0.3 — Observation contract CI trigger correction — 2026-10-16

## Change

Updated `.github/workflows/nexo-step-7-observation-contract.yml` on `ncs-clean-architecture` at commit `b705a71ce0527c689f169351468c364828a7e9f1`.

The workflow retains manual `workflow_dispatch` and now also declares `push` and `pull_request` triggers scoped to:
- `src/nexo/core/observation.mjs`
- `tests/nexo/observation.test.mjs`
- the workflow file itself

The job still runs only `node tests/nexo/observation.test.mjs` on Node 22. This is deliberately narrow; it does not alter source/runtime semantics or enable protected effects.

## Execution evidence

A read of the latest GitHub Actions runs after this commit found no run associated with commit `b705a71ce0527c689f169351468c364828a7e9f1`. Therefore the workflow-trigger configuration is committed, but a run of the observation test against this commit is **not yet evidenced**. The connector available in this session does not expose a workflow-dispatch action. Do not mark CI PASS based on the unrelated STEP 4/5 runs or the earlier isolated Node test.

## Next action without repetition

Wait for a normal branch push / pull request matching the paths, or manually dispatch the existing workflow from GitHub Actions. Inspect that exact run's job steps and conclusion, then attach the run ID and raw output to the proof record. Do not rerun the already-covered broad runtime audits or modify the execution path merely to produce CI activity.

## Boundaries

- This corrects test automation only.
- It does not integrate `ObservationEnvelope → MissionCandidate` into the planner.
- It does not authenticate observations, establish Genesis/owner authority, or close any effect bypass.
- Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED.
- **STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective. No protected effects.**
