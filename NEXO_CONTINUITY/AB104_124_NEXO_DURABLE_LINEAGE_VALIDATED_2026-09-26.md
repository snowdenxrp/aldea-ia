# AB104.124 — durable mission lineage validation — 2026-09-26

Previous: AB104.123.

Validation evidence:
- Run 2224 / 36205166739 completed its simulate job successfully.
- Node setup, synchronization, assistant validation, diagnostics, simulation advance, and state save all succeeded.
- Full npm test completed, including Nexo runtime and simulation tests.
- Runtime output explicitly reports: "Nexo: runtime bridge + automatic evidence + failure/replan + persisted idempotency + lineage OK."
- Tester passed 8/8 checks.
- Simulation advanced to day 675 with 2 agents alive.
- State save pushed commit 14ad58d.
- Run 2223 was cancelled before validation because concurrency replaced it; this is preserved as historical evidence.

Status:
- AB104.123 newline repair VALIDATED.
- AB104.122 durable mission-plan lineage repair VALIDATED at job level.
- No new code defect exposed.

Next:
- Continue the recovery/restart-boundary audit.
- Inspect multi-step mission-plan journal semantics and determine whether repeated plan records are a contract issue before changing code.

DO-NOT-REPEAT:
- Do not treat self-triggered workflow cancellation as a test failure when the validation job already succeeded.
- Do not weaken lineage assertions.
- Do not remove historical failures.
- Do not assume restart-boundary completeness is finished.

CONTINUITY:
Resume from 14ad58d. Next frontier: multi-step mission journal/restart-boundary audit.
