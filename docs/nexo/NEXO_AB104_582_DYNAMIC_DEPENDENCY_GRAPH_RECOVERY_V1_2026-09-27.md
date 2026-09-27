# NEXO — AB104.582 — Mutación dinámica del grafo durante recovery

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
Temporal requires deterministic workflow history and explicit versioning when execution logic changes; running executions can remain pinned to a prior version while newer executions use changed logic. citeturn0search1turn0search5
Temporal recovery guidance also treats recovery as state-dependent and uses idempotent recovery operations while waiting for eventual-consistency/drainage state to converge. citeturn0search0

## Finding
A dependency graph is not static during recovery. Provider state, resource incarnation, authority/fence state, compensation requirements, and workflow logic can change.

Therefore a previously admitted effect MUST NOT remain valid merely because its original graph snapshot was valid.

## Required graph identity
Each admission binds to:
- GraphVersion / DependencyGraphDigest
- participant incarnations
- dependency-state digest
- authority epoch / fence revision
- effect contract digest
- recovery generation.

A graph mutation creates a new graph version. Old admissions are not silently migrated.

## Mutation classes
1. EDGE_ADD: new causal dependency appears.
2. EDGE_REMOVE: dependency is proven no longer required.
3. NODE_STATE_CHANGE: participant becomes UNKNOWN/COMMITTED/INVALID.
4. INCARNATION_CHANGE: provider/resource is replaced.
5. COMPENSATION_EXPANSION: recovery introduces new effects/dependencies.
6. POLICY/LOGIC_VERSION_CHANGE: admission semantics change.

## Admission rule
At execution/commit boundary, expected GraphVersion + dependency digest + incarnations + authority/fence + contract must still match authoritative state, where the target boundary can enforce it.

Mismatch => STALE_ADMISSION, not automatic retry.
Then recompute admission under a fresh recovery generation.

## Important distinction
Edge removal is NOT automatically safe. Removing an edge requires evidence that the causal/consistency obligation disappeared. Otherwise it can convert a blocked dependency into an unsafe independent action.

## Preventing unrelated freezes
Only the transitive dependent closure of the mutated node/edge is invalidated. Independent branches retain their own admissions if their predicates remain valid.

## Versioning lesson
Changing orchestration semantics while a long-running mission exists requires explicit versioning/pinning, not silently replaying the mission under new semantics. This mirrors Temporal's deterministic replay/versioning boundary. citeturn0search1turn0search9

## New invariants
1. Admission is valid only against its bound graph/version snapshot.
2. Any relevant graph mutation invalidates affected admissions.
3. Graph-version mismatch never means NOT_COMMITTED.
4. Re-admission requires fresh authority and current dependency evidence.
5. Independent branches are not invalidated without dependency reachability.
6. Recovery-generated compensation dependencies are first-class graph mutations.
7. Historical graph versions remain immutable evidence.

## Closure
AB104.582 establishes dynamic graph versioning + scoped invalidation + fresh re-admission.

OPEN:
- fairness/starvation under repeated graph churn;
- safe concurrent graph updates;
- graph snapshot atomicity across providers;
- formal liveness;
- implementation/fault injection.

## Next exact step
AB104.583 — fairness and starvation: determine how Nexo permits independent safe work to progress while recovery/UNKNOWN branches repeatedly invalidate or retry, without allowing starvation or priority inversion.