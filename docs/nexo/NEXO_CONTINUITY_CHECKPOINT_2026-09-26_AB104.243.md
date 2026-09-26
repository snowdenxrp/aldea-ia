# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.243

Research file: docs/nexo/NEXO_AB104_243_MIGRATION_CHAIN_DEPENDENCY_ORDERING_GRAPH_RECOVERY_V1_2026-09-26.md
Research commit: c5c53ee7d0874af49c785cadeeace86258dfc031

Core result: migration ordering is a dependency problem, not merely sequence numbering. Each migration must declare consumed state, produced state and preserved authority/effect invariants.

Attacks covered: deceptive sequence IDs; missing predecessor; dependency cycles; forks; unproven merges; hidden semantic dependencies; schema/target-incarnation races; authority/schema ordering races; partial migration frontiers.

Candidate recovery: trusted anchor -> validated migration DAG -> highest contiguous verified frontier -> blocked/partial nodes -> re-evaluate dependent decisions -> expose only permissions whose full dependency path is CURRENT_ADMISSIBLE.

UNKNOWN dependency blocks current permission. A valid DAG does not imply every topological order is safe when migrations have side effects or shared resources. Candidate barriers include authority, schema semantics, target incarnation and effect-contract changes.

Raft joint consensus is a reference for explicit configuration-transition semantics; not a Nexo implementation choice. citeturn0search3turn0search7 TUF provides analogous role/configuration/version binding. citeturn0search0turn0search1

Current prototype: no migration DAG/dependency-barrier/frontier/branch-arbitration engine demonstrated in inspected Nexo path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.244 — migration graph authority/merge semantics.