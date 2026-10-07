# P112 — WRITE-SKEW / AGGREGATE ADVERSARIAL AUDIT V1 — 2026-10-07

## Purpose
Test whether naive object/subsystem versioning could accept unsafe concurrent commits despite apparently disjoint direct writes.

## Six adversarial cases

1. RESOURCE — shared scarcity
T1 reads water.amount >= 5 and drinks 5; T2 reads the same predicate and drinks 5. If each validates only an agent version, both can commit against one shared resource. Required dependency: water resource version/incarnation plus availability predicate.

2. TRADE — aggregate price skew
T1 reads economy price derived from inventories and trades with A; T2 changes another agent's inventory, changing the aggregate price basis. If only participant versions are checked, T1 can commit using stale aggregate economics. Required: economy aggregate/dependency token or equivalent conditional validation.

3. COOPERATE — joint eligibility skew
T1 and T2 both read the same participant/project eligibility and each contributes or creates overlapping project state. Per-agent versions alone miss project-level predicate and project incarnation. Required: project + participant + inventory dependency.

4. EXPLORATION — range/predicate phantom
T1 reads resources/territory within a radius and selects a target; T2 creates/moves/changes an entity that changes membership of that range. Object-only versions of the originally observed objects do not prove the predicate remains true. Required: spatial/range predicate token or authoritative spatial version.

5. BUILD/FARM — resource/structure predicate skew
T1 reads land quality and inventory sufficient to farm; T2 changes land or consumes the same inventory/structure capacity. Checking only one subsystem can accept a stale eligibility decision. Required: complete resource + inventory + structure/production dependency set.

6. SOCIAL/KNOWLEDGE — relational predicate skew
T1 reads trust/knowledge/proximity and shares knowledge; T2 changes relationship or knowledge state concurrently. A knowledge-only version misses the relationship predicate; a relationship-only version misses the knowledge predicate. Required: participant relationship + knowledge versions and relevant event/derived generation.

## General result
A direct WriteSet can be disjoint while the authoritative Admission ReadSets intersect. That is sufficient for a write-skew hazard class.

The protected transition therefore cannot be derived from writes alone. The final gate must reject when any authoritative dependency that influenced eligibility/branch/target has become stale, including aggregate/range/predicate dependencies.

## External corroboration
PostgreSQL's SSI documentation explicitly describes write skew as concurrent transactions reading overlapping data while writing data that can appear disjoint, and describes predicate locking for dependencies where a concurrent write would have affected a prior predicate read. This is a conceptual concurrency cross-check, not proof of Nexo behavior. citeturn0search0turn0search3

## Important boundary
This audit demonstrates the *risk pattern*, not that the current Lúmina implementation already permits each exact interleaving. No runtime adversarial test was executed in this block.

## Status
GREEN: one concrete write-skew scenario identified for each representative class.
GREEN: aggregate and predicate dependencies are independently necessary categories.
BLUE: exact executable interleavings and final-gate rejection behavior remain unverified.
BLUE: complete dynamic provenance coverage remains open.

## Exact next
Trace which current Lúmina state fields already have revision/version semantics, then identify the smallest missing tokens needed for the six cases without inventing a global transaction prematurely.

## DO-NOT-REPEAT
No implementation. No TLC rerun. No AB104.185 primary artifact. Do not claim these scenarios were runtime-executed.
