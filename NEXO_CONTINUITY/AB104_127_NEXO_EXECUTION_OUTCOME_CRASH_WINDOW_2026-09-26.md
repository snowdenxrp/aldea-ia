# AB104.127 — execution/outcome crash-window recovery semantics — 2026-09-26

Previous: AB104.126.

Audit finding:
- The durable mission plan and outcome journals are the authoritative reconstruction sources.
- `nexo.executions` is an idempotency/replay journal, not proof that a mission step completed.
- The runtime adapter persists an executed result into the execution journal before the runtime records the outcome in memory. A process crash can therefore be modeled at the boundary where execution exists but the outcome does not.
- No speculative new persistence layer was added: the current workflow persists the resulting memory/state as a unit, while the recovery contract is now explicitly regression-tested against an execution-only durable snapshot.

Repair / hardening:
- Added a restart reconstruction regression asserting that a mission with a persisted execution but no persisted outcome reconstructs the step as `planned`, never as `completed`.
- Added a runtime crash-window regression that removes the durable outcome while retaining the persisted execution result, then retries the same idempotency key.
- The retry must bypass the precondition and side effect, reuse the persisted adapter result, preserve the simulation state, and finally record exactly one verified outcome.
- Existing strict completion semantics remain unchanged: completion requires verified evidence; execution presence alone cannot advance the mission.

Fresh validation:
- Run 2234 / 36205641902 completed successfully.
- Job 108301476970 completed successfully.
- All workflow steps succeeded: checkout, Node setup, synchronization, full npm test, assistant diagnostics, simulation advance, and state save.
- Full `npm test` passed.
- Runtime output included:
  - `Nexo: runtime bridge + automatic evidence + failure/replan + persisted idempotency + lineage OK.`
  - `Nexo: durable mission restart reconstruction + execution/outcome crash-window semantics OK.`
- Tester: passed=8, failed=0.
- Simulation advanced to day 675, hour 15.814, with 2 agents alive.
- The simulation state save produced commit `0ec1df8f56e2c263f97ea656c679f0b377eec450`.

Status:
- AB104.126 remains validated.
- AB104.127 execution/outcome crash-window recovery semantics REPAIRED/HARDENED and VALIDATED by fresh CI.
- The system now has explicit evidence that an execution-only recovery snapshot is not treated as completion and that idempotent replay can safely close the missing outcome without duplicating the simulation effect.
- This does not declare the entire restart-boundary audit globally finished.

Next:
- Continue the restart-boundary audit into multi-step recovery and concurrent/replayed mission attempts.
- Verify that a recovered mission with mixed completed, execution-only, failed, and blocked steps reconstructs the exact executable frontier without duplicate effects or false completion.
- Preserve conservative UNKNOWN/PENDING semantics and verified evidence.

DO-NOT-REPEAT:
- Do not infer completion from `nexo.executions` alone.
- Do not execute a side effect again when a persisted idempotency result exists.
- Do not discard an execution result merely because its outcome was not yet recorded.
- Do not weaken verified-evidence requirements to make recovery appear complete.
- Do not declare restart-boundary completeness from one crash-window test.
- Do not delete historical failure evidence.

CONTINUITY:
Resume from the checkpoint commit created for AB104.127. Validation baseline: Run 2234 / job 108301476970. AB104.127 is the current validated checkpoint. Next frontier: mixed multi-step/concurrent restart recovery semantics.
