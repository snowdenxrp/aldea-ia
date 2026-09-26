# NEXO CONTINUITY — AB104.337

AB104.337 persisted. Research only; no implementation.

## Finding
etcd separates logical compaction from physical removal; physical waiting is an explicit option. citeturn0search6turn0search7 Compacted history becomes inaccessible. citeturn0search0 Restore also creates a new logical cluster identity and may use revision bump/mark-compacted to prevent old state appearing current. citeturn0search1

Nexo GC therefore needs durable phases:
`PREPARED → GC_COMMITTED → LOGICALLY_COMPACTED → PHYSICALLY_RECLAIMED`.

Crash after GC_COMMITTED must not make the decision disappear merely because physical reclamation did not finish. Physical deletion adds storage reclamation, not historical truth.

## Invariants
`PHYSICAL_DELETE != GC_AUTHORIZATION`
`PHYSICAL_DELETE != HISTORICAL_TRUTH`
`GC_COMMITTED survives crash/restart`
`INCOMPLETE_PHYSICAL_RECLAIM != UNCOMMITTED_GC`

Missing/inconsistent durable GC state => `UNKNOWN/STOP`; contradiction => `CONFLICT`.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.338 — study crash-consistent persistence of GC commitments/certificates and detection of torn or contradictory GC state.

## DO-NOT-REPEAT
Never infer GC authorization or historical truth from physical deletion alone.
