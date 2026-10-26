# NCS — CI EVIDENCE CHECKPOINT — 2026-10-26

## Purpose and authority
Docs-only continuation checkpoint. It does not change runtime, tests, workflow configuration, device state, or canonical gates. This document is not CI execution evidence by itself.

## Verified current source and checkpoint revision
- Repository: `snowdenxrp/aldea-ia`
- Branch: `ncs-clean-architecture`
- Verified current HEAD at checkpoint review: `b6a93161510bc2d7911100eb3a6865570d8042a3`
- Commit: `docs(ncs): correct CI checkpoint provenance`
- Tree SHA: `17ac679a05f4a90acaa8f5c965207b382b899585`
- Parent/baseline before that commit: `daf4c2b1a5dffeb0eccd3c2ae38b52a4d2d59a3b`, tree `2ce530455b3807664a4c1b0f6e0713178f9ab075`.
- Important: the baseline SHA is not the current HEAD. Recheck branch HEAD before future work; this checkpoint can become stale if the branch moves.

## Confirmed general CI evidence
- Run: [40422457556](https://github.com/snowdenxrp/aldea-ia/actions/runs/40422457556)
- Workflow: `Nexo — deterministic persistence tests`
- Job: `tests`, job ID `121919939110`
- Exact HEAD: `b6a93161510bc2d7911100eb3a6865570d8042a3`
- Conclusion: `success`
- Completed steps: setup job, checkout, Node.js, install, Run tests, Bounded temporary cleanup regression, post steps and job completion.
- Scope limit: this general workflow does not establish that the specialized repair-session or assistants runtime CLI workflows ran. `npm test` does not include `tests/nexo/repair-session.test.mjs`.

Prior evidence:
- Run [40421889169](https://github.com/snowdenxrp/aldea-ia/actions/runs/40421889169) passed on parent/baseline SHA `daf4c2b1a5dffeb0eccd3c2ae38b52a4d2d59a3b`, job `tests`, ID `121918084740`. Historical evidence only for that SHA.
- Run [40420502163](https://github.com/snowdenxrp/aldea-ia/actions/runs/40420502163) passed on earlier SHA `0f818d3099533f434129cf9f389d66b8db2160e6`. Historical evidence only for that SHA.

## Specialized workflows inspected
1. [Nexo M0 — integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-acceptance.yml)
   - Supports `workflow_dispatch`.
   - Includes continuity, restart reconstruction, protected-transition, Chronicle, crash-cut, owner lifecycle, repair-session, mission verification and outcome classification tests.
2. [Nexo M0 — repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-repair-crash-cuts.yml)
   - Supports `workflow_dispatch`.
   - Includes repair crash cuts, continuity migration, owner lifecycle, repair-session, runtime/assistant syntax checks, `tests/nexo/assistants-runtime-cli.test.mjs`, and mission verification.

## Dispatch and discovery limits
- The repository-wide Actions endpoint returned `total_count=22836`; the default first page showed the general run above. That response does not exhaustively establish whether either specialized workflow has ever run.
- Workflow-specific API queries were rejected by the connected GitHub interface as unsupported URLs. No specialized run has been verified in this checkpoint. This means `UNKNOWN/PENDING`, not “never ran” or “no run exists.”
- Available GitHub operations in this session did not include manual workflow dispatch. No specialized workflow was dispatched and no artificial code commit was made to force path filters.
- Required manual operation: open each workflow, select **Run workflow**, choose `ncs-clean-architecture`, and start it. Then verify workflow name, event, exact HEAD SHA, job/step conclusions, and relevant logs:
  - [Dispatch integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-acceptance.yml)
  - [Dispatch repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-repair-crash-cuts.yml)

## Existing technical interpretation to preserve
- `runNexoRuntimeRepairSession()` was observed to return `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `dispatchAttempted:false`, `persisted:false`.
- A separate lower-level repair path contains `dispatchPreparedRepair()` and a simulation `persistState()` call. This is source-level evidence of a persistence-capable lower-level path, not proof that it is globally reachable or a protected Nexo effect.
- `scripts/assistants.mjs` may persist normal simulation state before the optional repair gate. Thus `persisted:false` for the blocked repair result must not be interpreted as “the entire assistants process wrote nothing.”
- Unit tests cover some no-redispatch and UNKNOWN barriers, but do not prove global no-retry/no-writer claims or integration of the protected-effect boundary across all consumers.
- `src/nexo/core/protected-transition.mjs` maps `COMMIT.UNKNOWN` to `RECONCILE_REQUIRED`, but its reason is generic (`conditional commit outcome is UNKNOWN`) and does not propagate the adapter's stable `errorCode` through that branch. This is a diagnostic-contract gap, not proof that the durable outcome is known.
- `src/nexo/core/reconciliation.mjs` remains fail-closed: caller-supplied `authoritative: true` does not resolve the case; the reconciler exposes no commit, execute or authorize capability.
- Product contract Option A is ratified: preserve UNKNOWN unresolved until explicit intervention; no automatic retry; do not promote UNKNOWN to success.
- The cause of historical CI run `40270739196` remains `UNKNOWN`; do not repeat archaeology absent new direct evidence.

## Acceptance gaps to address next
- UO-06: consumer/product behavior must visibly represent `RECONCILE_REQUIRED` / `UNRESOLVED` and stop the affected path.
- UO-07: global absence of automatic retries is not established.
- UO-08: no integrated proof that protected effects are not prepared/executed after UNKNOWN; effect boundary is not integrated in the inspected transition.
- UO-09: define and test diagnostic `errorCode` propagation without implying durable outcome.
- UO-10: define the durability model (process failure, OS crash, power/storage loss) before claiming F2/F3.
- Run the two specialized workflows on the current branch SHA before updating any CI acceptance claims.
- Do not change runtime semantics for diagnostic propagation without a separately scoped authorization. Do not add a journal, retry, queue, new authority port, reconciler, or wrapper as a workaround.

## Canonical gates — unchanged
- M0: `INCOMPLETO`
- Root authority: `PENDING/UNKNOWN`
- Authorization: `NOT_EVALUATED` unless actual evidence establishes otherwise
- Protected effects: `STOP`
- Reconciliation: not integrated; fail-closed
- M0 exit-criteria proposal: not ratified; documentation is not acceptance evidence
- Historical CI run `40270739196` primary cause: `UNKNOWN`

## Safety and scope
This checkpoint revision corrects provenance and adds a confirmed general-CI result plus explicit acceptance gaps. No runtime, test or workflow code was changed. Do not declare M0 complete solely because the two specialized workflows pass; use their exact-SHA evidence to update the finite acceptance table and preserve remaining UNKNOWNs.
