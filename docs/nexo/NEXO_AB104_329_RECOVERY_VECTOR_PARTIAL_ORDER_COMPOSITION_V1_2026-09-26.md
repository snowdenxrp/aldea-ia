# NEXO AB104.329 — Recovery vector composition without scalarization

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Distributed recovery naturally contains partial orders: vector clocks preserve causal incomparability, and checkpoint/rollback research models recoverable states as a lattice rather than forcing every state into one total order. citeturn0search24turn0search7

## Nexo consequence
The four-dimensional recovery vector from AB104.328 should NOT be collapsed into a single revision, score, or "latest" flag. It should be composed with the existing multidimensional recovery frontier as a product/structured partial order.

Candidate structure:
`Frontier = <Authority, TargetIncarnation, Resource/CAS, OperationRegistry, EffectEvidence, Coverage, Schema/Semantics, Lineage, RecoveryVector>`

Each component may be ordered only where its semantics define an order. Two frontiers can therefore be:
- `A < B` when B dominates A on every required component and strictly advances at least one;
- `A = B` when all relevant components match;
- `A || B` when neither dominates the other;
- `CONFLICT` when authenticated components contradict rather than merely remain incomparable.

## Critical safety rule
`INCOMPARABLE != NEWER`

A frontier with a newer operation registry but weaker coverage cannot automatically replace one with older registry state but stronger coverage. Recovery must retain both evidence dimensions and evaluate the effect contract's admission predicate.

This matches the established requirement that insufficient evidence yields UNKNOWN rather than an invented total order.

## Candidate join boundary
A mathematical component-wise join is valid only if every component has a defined compatible join. If any component has incompatible semantics, the result is `JOIN_UNDEFINED/UNKNOWN`, not an arbitrary winner.

No scalarization, final lattice implementation, or formal proof selected.

## Next
AB104.330 — study whether a recovery frontier can be safely garbage-collected/compacted while preserving incomparable evidence and UNKNOWN boundaries.
