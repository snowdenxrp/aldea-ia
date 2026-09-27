# NEXO — AB104.584 — Atomicidad de snapshots del grafo entre proveedores

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
AWS states that Saga coordinates independent local transactions and does not provide the same isolation as a single ACID transaction; concurrent orchestration can therefore observe stale data. citeturn0search1
Azure documents the same cross-service isolation problem and recommends rereads/versioning or semantic locking to detect conflicting changes. citeturn0search2
etcd provides atomic compare-and-swap transactions inside its own key-value store, but its serializable reads may be stale; linearizable reads use current consensus state. citeturn0search4turn0search7

## Finding
A graph snapshot assembled from independent providers is NOT automatically an atomic global snapshot.
Reading P1 at revision r1 and P2 at revision r2 does not prove that any single global state existed containing both observations simultaneously.

Therefore Nexo must not label a multi-provider snapshot GLOBAL_ATOMIC unless a common authoritative mechanism actually provides that guarantee.

## Required snapshot semantics
Every recovery/admission snapshot records:
- SnapshotID
- per-provider observation identity/revision
- provider/resource incarnation
- observation consistency mode
- capture interval/order
- dependency graph digest
- authority/fence state
- evidence freshness/expiry

The resulting state is explicitly classified:
- ATOMIC_GLOBAL — only with a demonstrated cross-domain atomic mechanism;
- CONSISTENT_AT_ANCHOR — all observations are tied to a common authoritative anchor that defines the allowed consistency boundary;
- BOUNDED_SNAPSHOT — individually authoritative observations with known temporal/version bounds;
- MIXED/STALE — observations cannot establish a coherent admissible state;
- UNKNOWN — required evidence cannot be reconciled.

## Important consequence
A stale or mixed snapshot may be useful for diagnosis, but it cannot authorize a mutation whose safety depends on simultaneous global state.

A fresh local reread can detect some races, but it still does not manufacture cross-provider atomicity.

## Commit rule
For strong internal state, Nexo may use one authoritative store with atomic compare-and-swap over the complete admission predicate. For external providers, the commit guarantee remains bounded by what those providers enforce.

Thus:
INTERNAL_ATOMIC_COMMIT ≠ EXTERNAL_ATOMIC_EFFECT.

## Snapshot invalidation
Any relevant provider revision/incarnation/fence change invalidates the affected snapshot. Unrelated providers need not invalidate independent work unless the changed participant is in its dependency closure.

## New invariants
1. No GLOBAL_ATOMIC claim without an actual cross-domain atomic mechanism.
2. Every observation carries its own revision/incarnation/consistency semantics.
3. Mixed snapshots may inform reconciliation but cannot silently authorize strong effects.
4. Snapshot freshness is separate from snapshot atomicity.
5. Internal CAS can protect Nexo's own authority state but cannot fence a provider that does not consume the fence.
6. Snapshot invalidation is scoped by dependency reachability.
7. Historical snapshots remain immutable evidence.

## Closure
AB104.584 closes the distinction between a distributed observation set and a truly atomic global snapshot.

OPEN:
- concurrent scheduler/admission races;
- fairness under graph churn;
- anchor construction across heterogeneous providers;
- formal liveness/safety model;
- implementation/fault injection.

## Next exact step
AB104.585 — concurrent scheduler/admission races: analyze the final race between eligibility selection, queueing, execution and authority invalidation, including stale queued work.