# NEXO CONTINUITY — AB104.329

## Canonical state
AB104.329 research persisted. No implementation performed.

## Finding
The recovery vector should compose with the multidimensional recovery frontier as a structured partial order, not a scalar revision/score. Distributed checkpoint/recovery theory uses partial orders and lattices because some states are incomparable. citeturn0search24turn0search7

## Candidate frontier
`<Authority, TargetIncarnation, Resource/CAS, OperationRegistry, EffectEvidence, Coverage, Schema/Semantics, Lineage, RecoveryVector>`

Relation: dominance, equality, incomparability, or authenticated conflict.

## Critical invariant
`INCOMPARABLE != NEWER`

A component-wise join is permitted only where every component has a compatible defined join. Otherwise `JOIN_UNDEFINED/UNKNOWN`.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.330: study safe compaction/garbage collection of recovery frontiers without erasing incomparable evidence or UNKNOWN boundaries.

## DO-NOT-REPEAT
Do not scalarize the multidimensional frontier into one revision, timestamp, score, or "latest" state.
