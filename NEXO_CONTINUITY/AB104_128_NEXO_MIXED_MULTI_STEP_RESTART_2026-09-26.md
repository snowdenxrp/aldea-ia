# AB104.128 — mixed multi-step restart frontier — 2026-09-26

Previous: AB104.127.

Audit finding:
- Restart reconstruction already used durable outcomes rather than execution entries, but the multi-step frontier had not yet been regression-tested with mixed durable states.
- The invariant is conservative reconstruction: completed outcomes remain completed; execution-only steps remain unresolved/planned; blocked steps remain blocked; failed steps force replan.
- A failed step must not be hidden by another step's execution-only journal entry.

Hardening:
- Added a mixed multi-step reconstruction regression containing one verified completed step, one execution-only step with no outcome, one blocked step, and one failed step.
- The reconstructed mission preserves those individual states and derives needs_replan from the failed step.
- The execution-only step does not inherit its execution result as mission evidence or completion.

Fresh validation:
- Run 2236 / 36205921302 completed successfully.
- Job 108302319476 completed successfully.
- All workflow steps succeeded, including full test validation, diagnostics, simulation advance, and state save.
- Full npm test passed.
- Tester: passed=8, failed=0.
- Runtime output retained all Nexo validation lines, including deep contract/dependency/evidence/memory/replanning audit OK; typed adapter concurrency/idempotency/partial-effect/evidence audit OK; runtime bridge + failure/replan + persisted idempotency + lineage OK; concrete Lúmina adapter verification OK; durable restart reconstruction + crash-window semantics OK.
- Simulation advanced to day 675, hour 23.265, with 2 agents alive.
- State save produced commit 843196772f54029534ba25e10a0b7fb52f334b81.

Status:
- AB104.127 remains validated.
- AB104.128 mixed multi-step restart frontier REPAIRED/HARDENED and VALIDATED by fresh CI.
- This closes the specific regression gap for mixed completed/execution-only/blocked/failed recovery states.
- Restart-boundary audit is still not globally declared complete; concurrent/replayed attempts across the same mission remain the next frontier.

Next:
- Audit concurrent/replayed attempts for the same mission and step.
- Verify that duplicate successful outcomes, stale retries, and late results cannot regress a verified completed step or create contradictory current state.
- Preserve the full attempt history while deriving a deterministic current state.

DO-NOT-REPEAT:
- Do not treat execution-only entries as completion.
- Do not collapse mixed step histories into a single global status without preserving per-step state.
- Do not erase blocked or failed evidence during reconstruction.
- Do not let a stale retry silently overwrite a newer verified outcome.
- Do not declare concurrent-recovery safety from reconstruction tests alone.

CONTINUITY:
Resume from the checkpoint after Run 2236 / job 108302319476. AB104.128 is the current validated checkpoint. Next frontier: concurrent/replayed same-step attempts and deterministic stale-result handling.
