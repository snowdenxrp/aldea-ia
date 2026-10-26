# NCS — CI EVIDENCE CHECKPOINT — 2026-10-26

## Purpose and authority
This is a docs-only continuation checkpoint. It does not change runtime, tests, workflow configuration, device state, or canonical gates. It is not CI execution evidence by itself.

## Current branch identity
- Repository: `snowdenxrp/aldea-ia`
- Branch: `ncs-clean-architecture`
- Latest HEAD observed during this checkpoint: `0f818d3099533f434129cf9f389d66b8db2160e6`
- Commit: `docs(ncs): add 2026-10-26 repair route and M0 exit handoff`
- Tree SHA: `9f92f2e2f3e6e86a4946dbc77fdf451aa90025c2`
- Confirm branch HEAD again before relying on any results; branch rewrites are possible.

## Confirmed CI evidence
- Run: [40420502163](https://github.com/snowdenxrp/aldea-ia/actions/runs/40420502163)
- Workflow: `Nexo — deterministic persistence tests`
- Job: `tests`, job ID `121913443433`
- Exact HEAD: `0f818d3099533f434129cf9f389d66b8db2160e6`
- Conclusion: `success`
- Job steps observed completed: checkout, Node.js, install, `Run tests`, and `Bounded temporary cleanup regression`.
- Scope limit: this does not prove the specialized repair-session or assistants runtime CLI workflows ran. The `npm test` command in `package.json` does not include `tests/nexo/repair-session.test.mjs`.

## Specialized workflows inspected
1. [Nexo M0 — integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-acceptance.yml)
   - Has `workflow_dispatch`.
   - Includes `tests/nexo/repair-session.test.mjs`, protected transition tests, entrypoint, crash-cut and related contract tests.
2. [Nexo M0 — repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-repair-crash-cuts.yml)
   - Has `workflow_dispatch`.
   - Includes `tests/nexo/repair-session.test.mjs`, `tests/nexo/assistants-runtime-cli.test.mjs`, owner lifecycle, crash cuts and syntax checks.

### Search limitations
- The repository-wide recent Actions listing returned 2,500 total runs but the first page contained recent general deterministic-persistence runs and no matching specialized workflow runs.
- Workflow-specific API queries were rejected by the GitHub connector as unsupported URLs.
- Therefore the correct state is **no specialized run verified in this checkpoint**, not “the workflows never ran” or “no run exists.”
- The available GitHub connector tools expose read/list/log operations and rerun operations for existing failed jobs, but no workflow-dispatch action was available in this session. No workflow was dispatched and no commit was created to force path filters.

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
No runtime/test/workflow changes were made as part of this checkpoint. Do not add a new retry, reconciler, authority port, journal, persistence layer, queue, or wrapper as a workaround. Do not declare M0 complete solely because the two workflows pass; use their evidence to update the finite acceptance table and preserve remaining UNKNOWNs.
