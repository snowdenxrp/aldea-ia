# NEXO AB104.337 — GC commit crash recovery across logical/physical phases

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd distinguishes logical history compaction from physical removal: its compaction API can return after logical compaction, while a physical option waits for old revisions to be physically removed. citeturn0search6turn0search7 Compacted revisions become inaccessible, so a crash cannot be treated as harmless if the logical boundary was already committed. citeturn0search0 Snapshot recovery likewise establishes a new logical cluster identity and may require revision bump/mark-compacted so old state is not presented as current. citeturn0search1

## Finding
GC must be recoverable as a durable state machine, not inferred from whether physical deletion completed.

Candidate phases:
`PREPARED → GC_COMMITTED → LOGICALLY_COMPACTED → PHYSICALLY_RECLAIMED`
with crash/restart allowed between every phase.

Recovery rule:
- `PREPARED`: no historical coverage may be assumed lost.
- `GC_COMMITTED`: the decision is durable; recovery must honor its bound evidence/coverage contract even if physical deletion never happened.
- `LOGICALLY_COMPACTED`: historical queries in the compacted interval may be unavailable; classification follows the recorded coverage certificate, not physical-storage state.
- `PHYSICALLY_RECLAIMED`: only storage reclamation completed; it adds no new historical truth.

A crash after logical compaction but before physical reclamation must **not** roll back the logical evidence boundary merely because bytes remain. Conversely, physical deletion without a durable GC commitment cannot itself prove that deletion was safe.

## Critical invariants
`PHYSICAL_DELETE != GC_AUTHORIZATION`
`PHYSICAL_DELETE != HISTORICAL_TRUTH`
`GC_COMMITTED survives crash/restart`
`INCOMPLETE_PHYSICAL_RECLAIM != UNCOMMITTED_GC`

If the durable GC state or coverage certificate is missing/inconsistent after recovery => `UNKNOWN/STOP`; contradictory records => `CONFLICT`.

## Status
Exact state machine, crash protocol, and proof obligations remain UNSELECTED. No implementation/formal verification performed.

## Next
AB104.338 — study crash-consistent persistence of GC commitments/certificates and how recovery detects torn or contradictory GC state.
