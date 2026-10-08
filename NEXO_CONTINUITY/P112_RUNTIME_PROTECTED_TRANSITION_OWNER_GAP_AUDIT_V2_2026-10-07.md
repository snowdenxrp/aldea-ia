# P112 RUNTIME PROTECTED-TRANSITION OWNER GAP AUDIT V2 — 2026-10-07

## Scope
Audit the exact runtime sequence from `executeLuminaNexoStep()` through adapter mutation and runtime memory commit, against the already-proven `persistState(expectedRevision)` boundary.

## Exact sequence recovered
1. `executeLuminaNexoStep(simulation,...)` selects `runtimeMemory = memory ?? simulation.nexoMemory`.
2. It creates a Lumina effect adapter over that same `simulation`.
3. `executeNexoStep()` calls `beginNexoStep()` and then `adapter.execute()`.
4. The adapter records PREPARED in its supplied `executionJournal`, optionally invokes `persistPreparedIntent`, checks a precondition, invokes the real handler, checks a postcondition, then terminally updates the journal in memory.
5. The Lumina handler mutates the supplied simulation directly.
6. After adapter completion, `commitRuntimeOutcome()` updates mission execution/outcome memory and can mutate the same memory object.
7. No canonical `persistState(expectedRevision)` is called by this runtime path.

## 10 findings
1. 🟢 The runtime can operate on an isolated simulation supplied by a caller; `executeLuminaNexoStep` does not itself load the canonical singleton.
2. 🟢 The runtime can carry `simulation.nexoMemory` together with that simulation, so effectJournal + mission outcome can conceptually cross the same later snapshot boundary.
3. 🔵 The current `precondition` is an admission-time guard immediately before the handler, not the final canonical commit validator.
4. 🔵 The current postcondition validates the result after mutation; it does not prove that the admission dependencies are still valid for committing the whole candidate.
5. 🔴 There is no runtime call that performs: final semantic revalidation → `persistState(expectedRevision)`.
6. 🔴 The actual handler mutation happens before any canonical conditional commit. If the later canonical commit never occurs, the mutation exists only in the working simulation unless another persistence path captures it.
7. 🔴 If the supplied simulation is accidentally a canonical/live object rather than an isolated snapshot, the adapter can mutate it before any `stateRevision` conflict is checked; `persistState` cannot retroactively undo that mutation.
8. 🟢 The existing architecture therefore has a clean potential seam: caller supplies isolated snapshot + expected revision; runtime performs protected local preparation; a future owner validates the complete claim before invoking the existing conditional snapshot commit.
9. 🔵 `commitRuntimeOutcome()` is not that owner: it records mission outcome in memory and serializes memory commits with an in-process WeakMap, but it does not establish canonical revision ownership or persistence/reconciliation.
10. 🔵 The unresolved design choice is now narrower: determine whether the protected transition must revalidate against a complete claim DependencySet or conservatively use whole-snapshot expectedRevision as the conflict domain. Current evidence favors whole-snapshot conflict for canonical persisted state when complete semantic dependency coverage cannot be proven.

## Boundary conclusion
The runtime pieces are compatible with a future protected-transition owner, but they are not currently that owner.

The minimum safe research model is:
`load canonical state + capture expectedRevision`
→ `applyState()`
→ `admit/prepare`
→ `mutate isolated candidate`
→ `final claim validation on candidate`
→ `persistState(expectedRevision)`
→ classify `STATE_REVISION_CONFLICT` as `STALE_COMMIT_CANDIDATE`
→ if an external/protected effect may already have occurred, reconcile instead of blindly retrying.

This is a research model, not an implementation proposal yet.

## Evidence
- 🟢 Runtime/source sequence.
- 🟢 Isolated snapshot capability through `applyState()`.
- 🔵 Final validator seam.
- 🔵 Production owner/reconciliation.
- 🔴 No exactly-once, JMM-HB, or power-loss claim.

## DO-NOT-REPEAT
No implementation.
No second persistence wrapper.
No TLC rerun.
No AB104.185 backfill.
No AB105.117R.
No claim that `persistState` fences a handler already executed.
No claim that PREPARED means NOT_ATTEMPTED.

## Exact next
Audit the mutation timing relative to the final validator: identify which handler mutations can be safely treated as candidate-state preparation and which can represent an irreversible/external effect that must occur only after durable PREPARED and a final commit decision. Then map each current Lumina action class to that distinction.
