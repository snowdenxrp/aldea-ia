# NCS M0 — Nexo-owned execution-lineage seam

Date: 2026-10-18
Branch: `ncs-clean-architecture`

## Change

Added `recordExecutionLineage()` to `createNexoContinuityOwner()` as a narrow owner-backed persistence seam.

The method validates mission/step/action/target identity against the persisted Nexo mission, uses the Nexo store expected-revision compare-and-commit, records execution lineage, preserves the first record on replay, and rejects stale revisions or identity mismatches. It returns `journalSettled: false` and never changes `effectJournal`.

This is not a terminal outcome API. A result object saying `completed`, even with caller-provided `verified: true`, is stored only as lineage. It does not settle PREPARED, authenticate evidence, authorize an effect, or prove Lúmina persisted a change.

## Regression test authored

`tests/nexo/continuity-migration.test.mjs` now checks that recording lineage preserves PREPARED, reconstruction remains BLOCKED with `reconcile_prepared_effect`, duplicate identity does not append or increment revision, and stale expected revision conflicts.

## Evidence status

- Owner code commit: `f5e9e20c9911f75b66624aa62c4af020e185a326`.
- Regression test commit: `014b589ff84e1bdae5d7f4ef44068264b70cf363`.
- Combined-status and workflow-run lookups returned no records for either commit. Exact-head CI is NOT VERIFIED, not PASS or FAIL.
- Tests were authored but not executed locally in this session.

## Boundary and next step

This does not wire `src/nexo/runtime.js` to the owner and does not remove legacy memory. The remaining blocker is an independent, operation-specific reconciliation/settlement contract. Next, determine whether a specific repair action can be independently reconciled from durable environment state after restart, then add crash-cut tests against the actual owner/store API. Keep non-idempotent Lúmina actions UNKNOWN when no durable operation receipt exists.

Nexo continuity and Lúmina environment persistence remain separate stores; no cross-store atomicity is claimed. M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## Follow-up hardening (2026-10-18)

A review found that the first version could record a *new* execution-lineage row for a valid mission step without proving a matching persisted PREPARED journal entry. The owner now requires exactly one PREPARED entry with matching idempotency key, mission, step, action and target before adding new lineage. Existing identical lineage replay remains read-only; mismatched identity remains blocked.

- Owner hardening commit: `71b2db0b83e190f9f6d13c765a4e1bc85857903d`.
- Added regression in `tests/nexo/continuity-migration.test.mjs` proving a mission with no PREPARED obligation cannot gain an execution row (`NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED`); test commit `9971058e2477aa458e6afebdb240f4a52b3b2401`.
- Exact-head CI for these follow-up commits remains NOT VERIFIED; no local execution is claimed.

This guard narrows the lineage API but does not settle PREPARED, authenticate result evidence, or wire the production runtime.