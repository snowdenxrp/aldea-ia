# M0 — Preserve prepared effects through memory normalization
Date: 2026-10-18

## Finding
The prior adapter-level journal-pruning correction was not sufficient. `createLearningMemory()` independently normalized `nexo.effectJournal` using `slice(-200)`. Since runtime persistence repeatedly passes through this function, it could still discard an older `prepared` entry even though the adapter's own pruning preserved it. That would erase the local pointer to an unresolved external effect during an ordinary memory snapshot/reconstruction path.

This is a source-level defect found by tracing the actual persistence boundary, not a claim of a production exploit.

## Change
- Added `retainEffectJournal()` to memory normalization.
- The normalizer detaches journal records, evicts terminal entries first, and retains every `prepared` entry.
- If more than 200 entries are all unresolved/prepared, the journal is allowed to exceed the soft cap rather than silently forget obligations.
- Added runtime regressions for (a) 200 terminal entries plus an older prepared entry, (b) terminal-first eviction, (c) record detachment, and (d) more than 200 prepared entries.

## Contract basis
PG-009 recovery/restart fencing requires original effect identity to survive recovery and explicitly prohibits using a new operation ID to evade unresolved effect controls. A restart or local absence of state does not prove that a remote effect did not occur. This change preserves local journal pointers; it does not implement the full fence or authenticate reconciliation evidence.

## Remaining gap
Runtime does not yet provide an integrated recovery operation that can reconcile the exact original prepared key after a terminal blocked step has been persisted. The complete cross-restart recovery seam remains OPEN / STOP / UNKNOWN.

## Gate
STEP 7 remains OPEN / STOP / UNKNOWN. Protected effects remain STOP.
