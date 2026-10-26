# NCS — CI EVIDENCE CHECKPOINT — 2026-10-26

## Purpose and authority
This is a docs-only continuation checkpoint. It does not change runtime, tests, workflow configuration, device state, or canonical gates. It is not CI execution evidence by itself.

## Verified source baseline before this document revision
- Repository: `snowdenxrp/aldea-ia`
- Branch: `ncs-clean-architecture`
- Baseline HEAD immediately before this revision: `daf4c2b1a5dffeb0eccd3c2ae38b52a4d2d59a3b`
- Baseline commit: `docs(ncs): record specialized CI evidence checkpoint`
- Tree SHA: `2ce530455b3807664a4c1b0f6e0713178f9ab075`
- This document is being revised on that baseline; the resulting documentation commit will become the branch HEAD. Verify branch HEAD again after the revision and do not confuse the baseline SHA with the resulting commit SHA.

## Confirmed CI evidence on the baseline
- Run: [40421889169](https://github.com/snowdenxrp/aldea-ia/actions/runs/40421889169)
- Workflow: `Nexo — deterministic persistence tests`
- Job: `tests`, job ID `121918084740`
- Exact HEAD: `daf4c2b1a5dffeb0eccd3c2ae38b52a4d2d59a3b`
- Conclusion: `success`
- Job steps observed completed successfully: checkout, Node.js, install, `Run tests`, and `Bounded temporary cleanup regression`.
- Scope limit: this does not prove the specialized repair-session or assistants runtime CLI workflows ran. The `npm test` command in `package.json` does not include `tests/nexo/repair-session.test.mjs`.

Prior run [40420502163](https://github.com/snowdenxrp/aldea-ia/actions/runs/40420502163) also passed on earlier HEAD `0f818d3099533f434129cf9f389d66b8db2160e6`; it is historical evidence, not evidence for later SHAs.

## Specialized workflows inspected
1. [Nexo M0 — integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-acceptance.yml)
   - Has `workflow_dispatch`.
   - Includes `tests/nexo/repair-session.test.mjs`, protected transition tests, entrypoint, crash-cut and related contract tests.
2. [Nexo M0 — repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-repair-crash-cuts.yml)
   - Has `workflow_dispatch`.
   - Includes `tests/nexo/repair-session.test.mjs`, `tests/nexo/assistants-runtime-cli.test.mjs`, owner lifecycle, crash cuts and syntax checks.

### Search limitations
- The repository-wide Actions listing returned `total_count=2500`; recent pages queried in this session did not show either specialized workflow.
- Workflow-specific API queries were rejected by the GitHub connector as unsupported URLs.
- Correct conclusion: **no specialized run verified in this checkpoint**, not “the workflows never ran” or “no run exists.”
- The available GitHub connector operations in this session support reading/listing workflow runs, jobs and logs, plus rerunning existing failed jobs; no workflow-dispatch action was available. No specialized workflow was dispatched, and no code commit was made to force path filters.

## Required next operation
Manually dispatch both specialized workflows from GitHub Actions for branch `ncs-clean-architecture`:
- `nexo-m0-acceptance.yml`
- `nexo-m0-repair-crash-cuts.yml`

Then verify each run's workflow name, event, exact HEAD SHA, job conclusion, step conclusions, and relevant logs. Do not infer a pass from workflow configuration or from a different SHA. If either run cannot be verified, keep that criterion `UNKNOWN/PENDING`.

## Existing technical interpretation to preserve
- Product route `runNexoRuntimeRepairSession()` was observed to return `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `dispatchAttempted:false`, `persisted:false`.
- A separate lower-level repair path contains `dispatchPreparedRepair()` and a simulation `persistState()` call. This is source-level evidence of a persistence-capable lower-level path, not proof that it is globally reachable or a protected Nexo effect.
- `scripts/assistants.mjs` normal simulation persistence can occur before the optional repair gate. Thus `persisted:false` for the blocked repair result must not be interpreted as “the entire assistants process wrote nothing.”
- Unit tests cover some no-redispatch and UNKNOWN barriers, but do not prove global no-retry/no-writer claims or integration of the protected-effect boundary across all consumers.
- The product contract `COMMIT.UNKNOWN` Option A is ratified: preserve unresolved outcome until explicit intervention; no automatic retry; do not promote UNKNOWN to success.

## Canonical gates — unchanged
- M0: `INCOMPLETO`
- Root authority: `PENDING/UNKNOWN`
- Authorization: `NOT_EVALUATED` unless actual evidence establishes otherwise
- Protected effects: `STOP`
- Reconciliation: not integrated
- M0 exit-criteria proposal: not ratified; documentation is not acceptance evidence
- Historical CI run `40270739196` primary cause: `UNKNOWN`

## Safety and scope
This revision only corrects evidence provenance and branch-SHA wording. No runtime/test/workflow changes were made. Do not add a new retry, reconciler, authority port, journal, persistence layer, queue, or wrapper as a workaround. Do not declare M0 complete solely because the two workflows pass; use their evidence to update the finite acceptance table and preserve remaining UNKNOWNs.
