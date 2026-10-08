# P112 PROTECTED OWNER AGAINST EXISTING PERSISTENCE PRIMITIVE V1 — 2026-10-07

## Scope
Check whether the repository has a competing canonical world-state writer/bypass that would invalidate reuse of `persistState(expectedRevision)` as the final snapshot commit.

## Evidence
Repository search found the canonical `world-state.json` persistence path in `scripts/simulate.mjs` and its reuse from `scripts/assistants.mjs`.
- `simulate.mjs` owns lock, revision check, temp write and rename.
- `assistants.mjs` loads through `loadState()`, clones through `applyState()`, mutates its working simulation, and commits through the same `persistState(expectedRevision)`.
- The assistant path does not call `executeLuminaNexoStep()`; it records a mission plan and persists it.
- The dedicated race test exercises two independent processes through the same persistence primitive and proves one commit/one revision conflict.
- No inspected direct writer to canonical `world-state.json` bypassing `persistState()` was found.

## Result
🟢 The existing persistence primitive is not merely a helper used by one script; the known canonical state writers converge on it.
🟢 A future protected owner can therefore reuse the existing conditional snapshot replacement rather than introducing another canonical writer.
🔵 This does not prove every future writer will cooperate; protocol coverage must remain an explicit invariant.
🔵 It does not close the protected execution owner, final revalidation, prepared checkpoint, conflict reconciliation, or storage durability questions.

## Important separate issue discovered during cross-check
`loadState()` falls back to a fresh default state on read/JSON/schema failure. Existing continuity research already records this as a separate fallback-provenance problem. It is not evidence against `persistState` as a commit primitive, but a future protected owner must not mistake fallback state for authoritative current state.

## Exact next
Do not redesign persistence. Trace the future protected-owner lifecycle only:
load authoritative state → capture revision/provenance → isolated execution → final revalidation → `persistState(expectedRevision)` → classify conflict/reconciliation.
Treat fallback provenance as a separate gate.

## DO-NOT-REPEAT
No new generic commit wrapper. No persistence patch. No TLC. No AB104.185 backfill. No AB105.117R.
