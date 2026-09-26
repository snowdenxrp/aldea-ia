# NEXO AB104.243 — MIGRATION CHAIN DEPENDENCY ORDERING AND INCOMPATIBLE GRAPH RECOVERY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Migration order is a dependency problem, not merely a sequence-number problem. A migration chain must declare what state it consumes, what state it produces, and which authority/effect invariants it preserves.

## Dependency model
Candidate migration node M:
inputs = {schema, semantic model, authority generation, target incarnation, effect-contract version, predecessor state}
outputs = {new schema/semantics, derived state, authority transition evidence if explicitly authorized}
Edges represent required predecessor state. A migration may execute only when its required inputs are verified.

Candidate graph states:
READY, BLOCKED_BY_PREDECESSOR, CONFLICTING_BRANCH, STALE, PARTIAL, UNKNOWN, VERIFIED.

## Ordering attacks
1. Sequence-number deception: M3 has higher numeric ID than M2 but does not depend on M2. Numeric order alone is not semantic order.
2. Missing predecessor: M3 references M2 but M2 is absent. Recovery must block M3 rather than infer M2.
3. Cycle: M2 requires M3 while M3 requires M2. Graph is invalid; no arbitrary order.
4. Fork: M2a and M2b both derive from M1 but change incompatible semantics. Preserve conflict until authority selects a branch.
5. Merge without proof: M4 claims to combine M2a/M2b but does not prove both inputs or a valid merge policy. Reject/quarantine.
6. Hidden dependency: M4 changes authority semantics but metadata says only schema dependency. Semantic dependency must be explicit.
7. Cross-domain race: schema migration completes while target-incarnation migration is still pending. A decision relying on both cannot become executable.
8. Authority-before-schema: root/epoch changes but old schema interpreter remains active. Revalidate semantic compatibility before accepting current decisions.
9. Schema-before-authority: new schema is installed but old authority remains. New records must not inherit authority they did not receive.
10. Partial chain: M1/M2 committed, M3 partially applied. Recovery must reconstruct the exact frontier and not assume M3 completion.

## Topological safety
A valid DAG admits a topological ordering, but not every topological order is necessarily safe if migrations have side effects or shared resources.
Candidate barriers:
- authority transition barrier before accepting decisions under new authority;
- schema semantic barrier before interpreting new security fields;
- target-incarnation barrier before binding operations to a recreated resource;
- effect-contract barrier before executing operations under changed external semantics.
Independent migrations may run concurrently only when their dependency/resource domains are proven non-overlapping.

## Forks and merge
Two valid branches are not automatically mergeable.
A merge migration must identify both parent digests, exact merge semantics, conflict resolution authority, and resulting state commitment. It must not simply select one branch based on timestamp, length, or arrival.

## Recovery frontier
Candidate recovery computes:
trusted anchor -> validated migration DAG -> highest contiguous verified frontier -> blocked/partial nodes -> re-evaluate dependent decisions -> expose only permissions whose full dependency path is CURRENT_ADMISSIBLE.
If a dependency is UNKNOWN, the dependent permission cannot silently become CURRENT.

## Relation to distributed consistency
Raft's joint-consensus design is a useful reference for transitions where old and new configurations overlap; it demonstrates that membership/configuration changes require explicit transition semantics rather than unilateral local choice. It is not a Nexo implementation choice. citeturn0search3turn0search7
TUF similarly binds metadata to trusted roles and coherent versions; this is analogous to requiring migration nodes to be bound to the authority/configuration they consume. citeturn0search0turn0search1

## Current prototype
No migration DAG, dependency barrier, migration frontier or branch arbitration engine was demonstrated in the inspected Nexo path. No implementation added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
sequence number != semantic dependency order; valid nodes != valid graph; DAG != safe arbitrary execution order when effects/resources overlap; missing predecessor != success; fork != merge; merge != authority; partial frontier != full chain; UNKNOWN dependency != executable permission; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.244: attack migration graph authority and merge semantics — conflicting branches, explicit merge authority, dependency rollback, partial merges, concurrent migration workers and prevention of branch-induced authority escalation.