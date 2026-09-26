# AB104.122 — durable mission lineage restart-boundary repair — 2026-09-26

Previous: AB104.121.

Audit finding:
- The recovery/restart tests already preserved execution idempotency and durable attempt lineage.
- A deeper source audit exposed a boundary gap: `recordNexoPlan()` correctly stores missionId, parentMissionId, replanReason, status, objective and step metadata, but `executeNexoStep()` did not call it.
- Therefore a mission could execute successfully while its durable memory contained an outcome/attempt record but no corresponding durable mission-plan record. This weakened the restart boundary for reconstructing the replanned mission itself.
- No existing evidence was deleted or weakened.

Repair:
- `src/nexo/runtime.js`: import and invoke `recordNexoPlan(nextMemory, started)` at the execution boundary before recording execution/outcome.
- `tests/nexo/runtime.test.mjs`: after recovered replan execution, assert that the durable mission journal contains the replanned missionId, parentMissionId and replanReason.
- Runtime repair commit: 9477e9899555a803be176fe18cb19c6525673832.
- Test repair commit: d7bbcc0836964b56877a2af686a45f5bc4ad4212.
- Test content SHA after repair: c0e6f5a78e531ae729f1a184455b3060dd1316b9.

Epistemic status:
- This is a source-level repair; fresh GitHub Actions validation is REQUIRED.
- No CI success is claimed yet.
- Historical Run 2215 and all prior failure evidence remain untouched.
- AB104.121 remains the last validated frontier; AB104.122 is OPEN pending fresh validation.

Next exact action:
1. Inspect the fresh Lúmina workflow triggered by the repair commits.
2. Recover job-level evidence, not merely the workflow conclusion.
3. If a failure appears, inspect the exact failing assertion/log before making another change.
4. If the job passes, verify durable mission lineage in the executed test path and then persist clean validation.

DO-NOT-REPEAT:
- Do not weaken lineage assertions.
- Do not treat attempt lineage as a substitute for mission-plan persistence.
- Do not claim CI passed without fresh evidence.
- Do not alter historical AB artifacts.
- Do not interpret workflow cancellation caused by the state-saving push as a test failure.

CONTINUITY:
Resume from d7bbcc0836964b56877a2af686a45f5bc4ad4212 and the runtime repair parent 9477e9899555a803be176fe18cb19c6525673832. Fresh validation is the immediate boundary.