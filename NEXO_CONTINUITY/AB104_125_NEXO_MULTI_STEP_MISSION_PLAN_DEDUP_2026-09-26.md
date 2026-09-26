# AB104.125 — multi-step mission journal deduplication — 2026-09-26

Previous: AB104.124.

Audit finding:
- recordNexoPlan was being called at each execution boundary, so a multi-step mission could append the same missionId more than once.
- Durable plan identity is missionId; step-level history already exists in nexo.attempts and nexo.executions.
- This created duplicate durable plan records without adding lineage information.

Repair:
- recordNexoPlan is now idempotent by missionId.
- Replanned missions still receive a new plan record because replans have a new missionId.
- Added a regression assertion to the real two-step runtime chain: after both steps, the durable mission-plan journal contains exactly one record for the original mission.

Fresh validation:
- Run 2227 / 36205340990 completed successfully.
- Simulate job 108300574328 completed successfully.
- Node setup, synchronization, assistant validation, diagnostics, simulation advance, and state save all succeeded.
- Full npm test completed.
- Runtime output: Nexo: runtime bridge + automatic evidence + failure/replan + persisted idempotency + lineage OK.
- Tester: passed=8, failed=0.
- Simulation advanced to day 675 with 2 agents alive.
- State save pushed commit 8afa209 (Actualizar estado de Lúmina).
- Repaired source and regression test are present on main: memory blob d4ebcae90a733ec298bf609f14ee543b315fa1bf; runtime-test blob e92c985a721d2a92a03f4a1c7bea059e4158ecdf.

Status:
- AB104.124 validation remains valid.
- AB104.125 multi-step durable mission-plan deduplication REPAIRED and VALIDATED.
- Restart-boundary audit remains open.

Next:
- Continue auditing restart reconstruction semantics around durable mission, attempt, and execution journals.
- Specifically inspect whether a restarted process can reconstruct the correct current mission state from durable records without relying on transient mission objects.
- Do not change behavior unless a concrete reconstruction gap is evidenced.

DO-NOT-REPEAT:
- Do not reintroduce duplicate durable mission-plan records for the same missionId.
- Do not use nexo.missions as a substitute for step-level execution/outcome journals.
- Do not weaken idempotency or lineage assertions.
- Do not delete historical failure evidence.
- Do not treat workflow cancellation as a test failure when the validation job has already completed successfully.

CONTINUITY:
Resume from commit 8afa209. AB104.125 is the current validated checkpoint. Next frontier: restart reconstruction from durable mission, attempt, and execution journals.
