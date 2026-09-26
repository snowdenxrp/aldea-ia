# NEXO CONTINUITY — AB104.336

AB104.336 persisted. Research only; no implementation.

## Finding
Logical compaction can make old revisions inaccessible, while physical removal is a separate operation. citeturn0search4turn0search8 Restore also demonstrates the need for a fresh logical boundary: etcd changes cluster identity and supports revision bump/mark-compacted to prevent old revisions appearing current. citeturn0search2turn0search0

Safe GC must cover the full race window: root discovery → dependency validation → GC decision → logical compaction → physical deletion.

Candidate durable `GC_COMMIT` binds evidence set, retention-root frontier, dependency closure, coverage, authority/epoch, target incarnation, semantic version and decision digest.

## Invariants
`ROOT_SCAN != GC_COMMIT`
`GC_COMMIT != PHYSICAL_DELETE`
A new root after commit must have explicit semantics; it cannot silently disappear. If the finality barrier is unproven => `UNKNOWN/STOP`.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.337 — study two-phase logical/physical GC and crash recovery between commitment, compaction, and physical deletion.

## DO-NOT-REPEAT
Do not treat physical deletion completion as proof that the preceding GC decision was safe.
