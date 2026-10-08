# P112 — SIX ADVERSARIAL STALE-ADMISSION CASES V2 — 2026-10-07

## Purpose
One adversarial modeled interleaving per representative action class. Research only; not runtime executions.

### 1. Resource — shared quantity
A admits while quantity Q is sufficient. B/world/production mutates Q before A commit. A's direct agent WriteSet may be disjoint from B's. Minimum rejection dependency is the exact resource incarnation/quantity dependency plus every writer that can invalidate it. Agent-local revision alone fails.

### 2. Trade — aggregate price
A admits using price P derived from inventories. An unrelated agent inventory changes; advanceEconomyDay recomputes aggregate and price. A's buyer/seller writes can remain unchanged while its price premise is stale. Minimum rejection dependency is the economy aggregate/price generation plus complete inventory/alive writer coverage.

### 3. Cooperate — joint eligibility
A admits cooperation while both agents satisfy alive/home/inventory/relationship/project predicates. Another writer changes participant inventory, relationship, home/structure, or project progress before commit. Project-only or participant-only tokens can miss cross-domain invalidation. Minimum rejection set is the union of all authoritative predicates that made the admission true.

### 4. Exploration — range/phantom
A selects a target because it is within a spatial/range predicate. moveAgent() changes position before commit, or normalization changes spatial state. Target identity can remain unchanged while the admission predicate becomes false. Minimum rejection dependency is a range/spatial generation covering every position/normalization writer, plus resource/knowledge state when those affect eligibility.

### 5. Build/Farm — land/resource predicate
A admits construction/farming using land quality, resource quantity, tool/skill and structure predicates. World/ecosystem/production or another action changes one premise before commit. A direct structure WriteSet can be disjoint from the writer that invalidated land/resource eligibility. Minimum rejection set is land/resource + structure + agent/tool/technology dependencies with complete writer coverage.

### 6. Social/Knowledge — relational predicate
A admits a social/knowledge action based on relationship, confidence/knowledge and proximity. Another interaction updates trust/cooperation/history, or movement changes proximity, before commit. The direct write may target a different memory/event field. Minimum rejection set is participant social/knowledge generation + proximity predicate + every relationship/memory/knowledge writer affecting the admission.

## Cross-case result
All six exhibit the same anomaly shape:
Admission ReadSet intersects a concurrent invalidator even when direct WriteSets do not.
Therefore direct WriteSet versioning is insufficient.

A composite token is valid only if:
1. every authoritative dependency has a token;
2. every writer of each dependency updates that token before commit validation;
3. derived/aggregate/predicate dependencies have generation semantics;
4. the final gate revalidates the same claim against canonical authoritative state.

If any condition is unproven, the system cannot honestly treat the token set as a complete semantic fence.

## Comparison with isolated snapshot + conditional commit
applyState() gives an isolated working state and persistState(expectedRevision) gives a canonical revision conflict boundary. That combination can reject whole-state stale snapshots, but it does not automatically prove that the selected action's semantic admission remained valid unless the final gate revalidates its dependency closure.

## Status
🟢 Six adversarial categories closed as modeled safety cases.
🟢 New movement/normalization bypass incorporated.
🔵 Exact token ownership/generation for every dependency remains OPEN.
🔵 Final semantic revalidation remains OPEN.
🔴 No runtime interleaving or JMM-HB claim.

## Exact next
Trace each case to its smallest canonical writer and determine whether a composite dependency token can be made complete without a global revision. Then compare its complexity/coverage against whole-snapshot conditional commit.

## DO-NOT-REPEAT
No runtime race claim, no JMM-HB, no implementation, no TLC rerun, no AB104.185 backfill, no AB105.117R, no generic token inventory.