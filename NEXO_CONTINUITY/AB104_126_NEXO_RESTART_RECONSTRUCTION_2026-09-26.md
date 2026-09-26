# AB104.126 — durable mission restart reconstruction — 2026-09-26

Previous: AB104.125.

Audit finding:
- Durable mission plans preserve the original plan, while attempts and executions preserve step-level runtime history.
- Before this checkpoint there was no canonical reconstruction function to rebuild the current mission state after a process restart from those durable journals.
- A restart could therefore recover the evidence ledger but still lack a deterministic current mission object.

Repair:
- Added reconstructNexoMission(memory, missionId).
- It locates the durable mission plan, overlays the latest durable attempt for each step, preserves mission lineage, and derives the conservative current status/objective.
- Completed steps are reconstructed from verified attempts.
- Failed steps reconstruct needs_replan.
- Blocked steps reconstruct blocked.
- Unresolved steps retain planned/awaiting-dependencies semantics based on completed dependencies.
- A persisted execution without a persisted outcome is not treated as completed; this preserves conservative recovery semantics.
- Added a dedicated regression test and included it in npm test.

Fresh validation:
- Run 2231 / 36205464557 completed successfully.
- Simulate job 108300965544 completed successfully.
- Node setup, synchronization, assistant validation, diagnostics, simulation advance, and state save all succeeded.
- Full npm test completed.
- Runtime output: Nexo: runtime bridge + automatic evidence + failure/replan + persisted idempotency + lineage OK.
- Restart regression output: Nexo: durable mission restart reconstruction OK.
- Tester: passed=8, failed=0.
- Simulation advanced to day 675 with 2 agents alive.
- State save pushed commit 300aa62.

Status:
- AB104.125 remains validated.
- AB104.126 durable mission restart reconstruction REPAIRED and VALIDATED.
- Restart-boundary audit is not declared globally finished; further crash-window semantics remain to inspect.

Next:
- Audit the crash window between durable execution persistence and durable outcome persistence.
- Verify that recovery can safely distinguish an executed-but-uncommitted outcome from a completed mission step, while idempotently replaying the persisted adapter result.
- Do not infer completion from execution presence alone.

DO-NOT-REPEAT:
- Do not treat nexo.executions alone as proof that a mission step completed.
- Do not discard persisted execution results during restart.
- Do not weaken idempotency or verified-evidence requirements.
- Do not delete historical failure evidence.
- Do not declare restart-boundary completeness from a single reconstruction test.

CONTINUITY:
Resume from commit 300aa62. AB104.126 is the current validated checkpoint. Next frontier: execution/outcome crash-window recovery semantics.
