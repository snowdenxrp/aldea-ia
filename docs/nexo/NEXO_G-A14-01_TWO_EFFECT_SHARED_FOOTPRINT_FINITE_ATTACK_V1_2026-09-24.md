# G-A14-01 — Two-Effect Shared-Footprint Finite Attack V1 — 2026-09-24

## Research-first result

### External cross-check
Raft's replicated-state-machine model gives a single ordered command stream to the state machine. etcd transactions atomically evaluate multiple comparisons and apply multiple writes; serializable isolation is specifically intended to prevent concurrent executions from producing a non-serializable state. PostgreSQL documents the same principle: successful serializable transactions must have an effect equivalent to some serial order, or one is rejected/retried. These mechanisms reason about the relevant conflict/dependency set; merely serializing unrelated keys is insufficient when an invariant spans them.

Sources:
- Raft paper: https://raft.github.io/raft.pdf
- etcd API: https://etcd.io/docs/v3.7/learning/api/
- PostgreSQL transaction isolation: https://www.postgresql.org/docs/17/transaction-iso.html

## Code study

Current `src/nexo/dependency_closure_evaluator.py` computes dependency closure, correlated component pairs, shared failure domains, trust roots and authority domains. It is explicitly non-authoritative and returns `authority_granted: false` and `effects_executed: false`.

Important observation: the existing evaluator already has the shape needed for an external analysis/validation layer, but its correlation result cannot itself authorize execution. The protected core must consume a context-bound result and enforce its freshness/currentness.

## Finite adversarial reduction

Scenario:
- capacity invariant: used + reservation <= 10;
- effect A requires 7;
- effect B requires 7;
- each effect is individually admissible;
- initial footprint result says A and B are disjoint;
- after admission preparation, dependency analysis discovers a shared protected capacity domain.

Unsafe protocol:
1. A validates under footprint epoch e0.
2. B validates under footprint epoch e0.
3. Both are admitted independently.
4. Footprint relation changes from disjoint to shared.
5. If old admissions remain usable, both can cross the effect boundary and produce 14 units of demand against capacity 10.

Required protection:
- footprint/disjointness result is bound to an epoch/context;
- relevant footprint invalidation advances that epoch;
- final admission/effect boundary requires the stored footprint epoch/context to equal the current protected epoch/context;
- UNKNOWN footprint is never interpreted as disjoint;
- if the current relation is shared, both operations enter the same protected conflict domain or use a proven cross-domain atomic protocol.

## Field-minimality conclusion

A literal full dependency graph is not required in the minimum linearization state.

A literal `conflict_domain_id` field is also not yet proven mandatory.

What IS mandatory semantically is an authoritative protected relation equivalent to:

`Independent(A,B,current_context)`

together with currentness/invalidation semantics.

The minimum protected representation can therefore plausibly be:
- footprint/disjointness result reference or bounded relation;
- footprint epoch/currentness lineage;
- context binding (policy/invariant/VersionSet/dependency-graph version);
- conservative UNKNOWN state.

The full graph, recursive analysis, and detailed dependency evidence can remain outside the linearization machine if the protected validator makes the resulting relation authoritative for admission and invalidates it on relevant changes.

## Adversarial cases that survive the reduction

1. False-negative footprint: must resolve to UNKNOWN/HOLD, never independent admission.
2. Footprint changes after admission: epoch mismatch invalidates old admission.
3. Shared invariant without shared storage key: conflict relation must capture invariant domain, not just key overlap.
4. Two effects with different effect keys but same protected capacity: they must coordinate.
5. Dependency graph changes without obvious object mutation: graph/context epoch must invalidate the result.
6. Analysis component compromised or stale: its output cannot bypass protected validation.
7. Recovery from old snapshot: old footprint epoch cannot regain validity merely because the snapshot is internally consistent.

## Status

This is a semantic/adversarial research result, not a formal proof.
SANY/TLC have not been executed in the current environment.
Implementation remains gated.

Next attack: prove or refute whether the protected footprint relation itself can be reduced to a single monotonic epoch plus a bounded conflict-domain set, including multi-domain effects and dynamic expansion of the footprint.
