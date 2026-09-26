# NEXO AB104.281 — Partial-order and join semantics for recovery frontiers
Date: 2026-09-26
Status: RESEARCH ONLY

## Result
AB104.280's multi-dimensional frontier should not be ordered by a single scalar. Distributed-systems causality is naturally partial: Lamport's happened-before relation leaves concurrent events incomparable. A logical timestamp can preserve causal order but a scalar ordering does not prove causal comparability.

## Candidate formalization (not architecture)
Let each recovery frontier F contain independently authenticated dimensions. Define F1 <= F2 only when every required dimension of F1 is covered by, and lineage-compatible with, F2, and the cross-domain dependencies required by the recovery policy are satisfied.
- Comparable: F1 <= F2 or F2 <= F1.
- Concurrent/incomparable: neither relation holds; do not manufacture order from a larger scalar.
- Mergeable: two frontiers may be combined only when dependency/lineage constraints establish a coherent common state.
- Conflicting: authenticated claims refer to the same scope but assert incompatible authority/incarnation/effect facts.
- UNKNOWN: evidence is insufficient to decide comparability, mergeability, or conflict.

## Recovery consequence
A component with a numerically newer revision can still be semantically stale relative to another dimension. Therefore max(revision) is not a safe generic join. A join, if one exists, must preserve the component-wise partial order and cross-domain dependencies.

## Implementation evidence
etcd-io/raft restore rejects snapshots whose index is <= the already committed index and restores log/state plus configuration. This demonstrates recovery constraints beyond an application-level scalar.

## Candidate join rule
JOIN(F1,F2) is defined only if:
1. both frontiers are individually authenticated/integrity-valid;
2. lineage is compatible;
3. shared identity/scope dimensions agree;
4. authority generation/fence does not regress;
5. target incarnation is compatible;
6. operation/effect evidence coverage is not reduced;
7. schema/semantic versions are compatible or an authenticated migration relation exists;
8. no dependency edge requires information absent from either frontier.

Otherwise return CONFLICT or UNKNOWN according to whether contradiction is established versus evidence is insufficient.

## Open questions
- Minimal algebra: whether a true least-upper-bound exists for all valid frontiers.
- Whether joins should be domain-specific rather than global.
- Exact distinction between CONFLICT and UNKNOWN when a dimension is missing.
- Formal proof obligations for monotonicity and anti-resurrection.
- No architecture implementation or formal verification performed.

## Carry-forward
AB50→AB58 residuals unchanged. AB104.256/257/259 and other PENDING items remain unresolved. No overwrite/delete/migration/architecture freeze.

## Next
AB104.282 — study authenticated lineage/dependency graphs and whether a recovery frontier can safely carry a compact certificate instead of every historical component.
