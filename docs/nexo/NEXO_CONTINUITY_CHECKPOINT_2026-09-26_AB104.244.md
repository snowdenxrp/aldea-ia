# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.244

Research: docs/nexo/NEXO_AB104_244_MIGRATION_GRAPH_AUTHORITY_BRANCH_MERGE_NON_ESCALATION_V1_2026-09-26.md
Commit: af7e676d45c2804beb030101a47d000ed0f1684c

Core: valid migration nodes do not automatically form an authoritative branch. A merge is an explicitly authorized state transition binding both parent branches, merge policy, resulting digest, authority context, target incarnation and lineage.

Non-escalation: migration output cannot create stronger authority than authenticated transition evidence grants. Historical roots/branches may remain valid evidence but are not automatically current permission.

Attacks covered: branch substitution, merge laundering, authority smuggling, partial merge, merge replay/collision, concurrent merge workers, old-branch resurrection, cross-incarnation merge, semantic laundering, dependency rollback.

Recovery: trusted anchor -> validate parents -> validate merge authorization -> validate dependencies -> validate result -> durable merge commit -> revalidate dependent permissions. UNKNOWN parent/dependency blocks downstream executable permission.

Code-search limitation: migration/schema/effect/reconstruction keyword search returned no indexed matches in this pass; this is not proof of absence. Earlier direct prototype inspection remains authoritative for those findings.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next: AB104.245 — rollback/compensation and anti-resurrection attacks.