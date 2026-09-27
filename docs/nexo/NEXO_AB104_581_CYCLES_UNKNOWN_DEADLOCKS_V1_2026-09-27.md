# NEXO — AB104.581 — Cycles, UNKNOWN y deadlocks

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
Azure explicitly identifies cyclic dependencies as a case where Saga may be unsuitable; its orchestration variant avoids participant-to-participant cyclic dependencies. citeturn0search0turn0search1
Temporal's current recovery guidance demonstrates durable pause/manual intervention and compensation as separate recoverable workflow states; compensation can itself require retry/recovery. citeturn0search9turn0search4

## Finding
An external-effect dependency graph for Nexo MUST NOT allow an unresolved cycle to be resolved by arbitrary retry or arbitrary cycle-breaking.

A cycle such as:
A → B → C → A
with one node UNKNOWN can create permanent mutual blocking if every node waits for another.

## Required rule
Nexo should distinguish:
- DAG-VALID: dependencies have an acyclic committed ordering.
- CYCLIC-DETECTED: dependency graph contains a cycle.
- UNKNOWN-BLOCKED: cycle/dependency contains unresolved evidence.
- HUMAN/ROOT-DECISION-REQUIRED: no safe automatic resolution exists.

Cycle detection is a safety gate, not merely a scheduler optimization.

## UNKNOWN propagation
If A depends on B and B is UNKNOWN:
A cannot execute merely because its own local checks pass.
If B depends on C and C is UNKNOWN, the uncertainty propagates along the dependent closure.

But propagation must be bounded to the dependency closure: unrelated effects must not be frozen.

## Cycle breaking
Never break a cycle by:
- guessing UNKNOWN means NOT_COMMITTED;
- retrying all participants;
- replaying an old authorization;
- deleting dependency edges;
- silently converting compensation into a new forward effect.

A cycle may be broken only by authoritative evidence, an explicitly defined safe independent action, or a higher-level recovery decision with a fresh authority snapshot.

## Compensation cycles
Compensation is a new effect. Therefore compensation dependencies can themselves form cycles.
Nexo must detect this before executing the compensation graph.

If no safe acyclic compensation ordering exists, state becomes BLOCKED/REQUIRES_REVIEW rather than inventing an order.

## New invariants
1. No automatic execution from a cyclic unresolved dependency graph.
2. UNKNOWN never collapses into NOT_COMMITTED.
3. Dependency blocking is transitive only over actual causal/dependency edges.
4. Cycle resolution requires fresh evidence/authority; stale admission cannot break a cycle.
5. Compensation graphs receive the same identity, fencing, incarnation and cycle checks as forward effects.
6. Root completion is impossible while required cyclic dependencies remain unresolved.

## Closure
AB104.581 establishes cycle detection + bounded UNKNOWN propagation + explicit blocked state as required control-plane semantics.

OPEN:
- dynamic graph mutation during recovery;
- starvation/fairness when independent work competes with recovery;
- safe manual/higher-authority cycle resolution;
- formal liveness proof;
- implementation/fault injection.

## Next exact step
AB104.582 — dynamic dependency-graph mutation during recovery: determine how newly added/removed edges, changing provider state, or changing compensation requirements invalidate previously admitted work without freezing unrelated work.