# NEXO AB104.336 — Retention/compaction/deletion linearization barrier

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd makes compacted revisions inaccessible and its physical compaction can be separated from the logical compaction request. citeturn0search4turn0search8 Restore also establishes a new logical cluster identity and can use revision bump + mark-compacted to prevent old revisions appearing current. citeturn0search2turn0search0

## Finding
The dangerous race is not only "new root during scan"; it is the whole interval:
`discover roots → validate dependencies → decide GC → logically compact → physically delete`.
A safe design needs a finality/linearization barrier tying the deletion decision to the retention frontier it was based on. If a new root can become authoritative after the decision but before deletion, the system must either revalidate/revoke the deletion decision or have a protocol rule proving that the new root cannot depend on the discarded interval.

## Nexo candidate boundary
`GC_COMMIT` should bind:
`candidate evidence set + retention-root frontier + dependency closure + coverage frontier + authority/epoch + target incarnation + semantic version + decision digest`.
After that boundary, later roots cannot silently invalidate the committed decision; they must be rejected as too late, force a new compaction epoch, or trigger recovery/revalidation according to an explicit policy.

Physical deletion is therefore not itself the authorization boundary. It must follow a durable logical compaction/GC commitment whose evidence can be audited.

## Critical invariants
`ROOT_SCAN != GC_COMMIT`
`GC_COMMIT != PHYSICAL_DELETE`
`NEW_ROOT_AFTER_COMMIT` must have explicit semantics; never silently disappear.
If the barrier cannot be proven, classify `UNKNOWN/STOP` rather than delete.

## Status
Exact linearization mechanism and protocol remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.337 — study two-phase logical/physical GC and crash recovery: what happens if the system crashes between GC commitment, compaction, and physical deletion.
