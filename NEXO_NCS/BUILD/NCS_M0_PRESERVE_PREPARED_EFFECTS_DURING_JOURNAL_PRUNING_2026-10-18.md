# M0 — Preserve unresolved prepared effects during journal pruning
Date: 2026-10-18

## Finding
The effect adapter truncated `executionJournal` to its last 200 entries in both intent recording and result persistence. A still-`prepared` entry is an unresolved external-effect obligation: local state cannot prove that the effect did not occur. If enough later operations were recorded, the old prepared entry could be silently removed, erasing the adapter-level reconciliation pointer and weakening the PG-009 anti-bypass rule.

This is a source-level contract defect. It is not a claim of a demonstrated production exploit.

## Change
- Journal pruning now removes terminal entries first.
- Entries with `status === "prepared"` are never removed by this bounded-history pruning.
- If the journal contains more than 200 unresolved prepared entries, it may exceed the soft cap rather than discard unresolved recovery obligations.
- Added a regression with 200 terminal records plus an older prepared record; a new operation triggers pruning and the prepared record must remain.

## Boundary
This does not implement end-to-end reconciliation, prove persistence durability, bind reconciliation evidence to independently authenticated operation identity, or establish authority. It does not make protected effects safe to activate.

## Gate
STEP 7 remains OPEN / STOP / UNKNOWN. Protected effects remain STOP until the integrated recovery contract and required evidence are complete.
