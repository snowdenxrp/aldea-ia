# P112 ADMISSION→COMMIT TEMPORAL WINDOW AUDIT V1 — 2026-10-07

Research-only. No implementation and no runtime interleaving executed.

## Temporal result
The current code has multiple mutation opportunities between decision/dependency capture and any future protected commit boundary.

### Block / invalidate / reconcile classification
- `advanceWorldDay()` / `advanceSocietyDay()`: these are broad shared writers. A protected transition spanning a day boundary must either exclude/block the boundary or revalidate every affected dependency after it. Treating a day transition as invisible is unsafe.
- `tick()` per-agent updates: needs, perception, knownResources, urgent intent and selection can change before/around execution. These are admission inputs; stale capture requires invalidation/revalidation, not silent continuation.
- Relationship helpers: `getOrCreateRelationship()` may materialize missing relationship state during observation. This is a hidden mutation and must either occur before dependency capture or be included in the protected dependency/mutation model.
- Spatial/exploration helpers: region/biome/discovery/known-resource state can be materialized while evaluating options. Same rule: normalize/materialize before capture or model as a mutation/dependency event.
- Randomness: seeded randomness is reproducible only when the random source and consumption sequence are preserved. `Math.random()` remains nondeterministic. A protected claim whose outcome depends on random choice must bind the random evidence or treat it as unresolved at final gate.
- Research/technology/specialization/institution/governance daily writers: they can change skills, technology, institution norms, commons, knowledge and other predicates that feed later admission. They are invalidators, not post-commit noise, when their state is part of the selected action's claim.

## Important separation
Post-effect writes such as learning, memory, discovery records and events must not automatically enlarge the physical-effect atomic footprint. However, if any of those writes are themselves authoritative inputs to a later claim, their versions/provenance become dependencies of that later claim.

## Stronger result
The temporal window cannot currently be proven safe merely by placing a FINAL_GATE inside `executeAction()`. `performDecision()` contains direct mutation branches outside `executeAction()`, and shared daily writers can invalidate dependencies independently.

The defensible protocol shape is therefore:
1. capture claim-specific dependency/provenance;
2. establish protected admission context;
3. prevent or detect invalidation during the protected window;
4. revalidate complete dependency closure at the final commit boundary;
5. commit only if current authority/context matches;
6. otherwise reject as stale/UNKNOWN and route to reconciliation where required.

This mirrors the conceptual property of serializable systems: a concurrent transaction cannot be accepted if its read/write dependencies would make the result impossible to explain as a valid serial execution; failed transactions must not have their pre-failure decision results treated as committed truth. PostgreSQL documents this as serialization failure and requires retry of the complete transaction logic. See current docs: https://www.postgresql.org/docs/current/sql-set-transaction.html and https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html

## Status
GREEN: concrete current writers and temporal invalidation classes identified.
BLUE: exact Nexo final-gate ownership, ordering and atomicity remain OPEN.

## Exact next
Audit the final commit candidates and identify the first common boundary that can atomically (or conditionally) cover: protected admission context + dependency validation + local protected mutation + durable history/state. Compare that boundary against the post-effect learning/event writes so we do not over-serialize the world.

## DO-NOT-REPEAT
No implementation; no TLC rerun; no global stateRevision promotion; no AB104.185 primary; no AB105.117R; no runtime concurrency claim.
