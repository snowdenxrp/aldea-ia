# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.251

Research: docs/nexo/NEXO_AB104_251_NEGATIVE_EVIDENCE_COMPOSITION_INDEPENDENCE_QUORUM_RESTORE_V1_2026-09-26.md
Commit: e21095f230c1f30324d1a184e402849a53b5465c

Core: multiple negative claims are not automatically independent. Evidence must be modeled as a dependency graph covering issuer/trust root, snapshot lineage, replication ancestry, storage/failure domain, target incarnation, authority epoch/fence, observation boundary, retention and dependencies. Several replicas restored from one old snapshot are one common-mode evidence family.

Quorum is protocol-specific, not a generic truth multiplier. Raft safety derives from majority replication plus log-matching/election/commit rules; etcd defines completion through consensus. A Nexo quorum certificate therefore needs exact statement digest, eligible authorities, configuration/epoch, coverage, lineage, freshness and anti-rollback semantics.

Contradictory admissible claims must not be resolved by timestamp, arrival order, majority count or local preference. Candidate result is CONFLICT/QUARANTINED until authority/lineage rules determine admissibility. Demonstrably stale/old-epoch claims can be downgraded without erasing their historical record.

Restore is a semantic boundary: snapshot provenance/coverage does not automatically restore authority freshness or post-snapshot history. Migration transforms evidence; it does not multiply independence or authority.

Composition candidates: union only with proven coverage/no gaps; intersection only when exact predicate matches; any unresolved dependency that could contain the commit blocks definitive negative classification.

Code study: indexed GitHub search did not surface operation registry; not evidence of absence. No implementation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; preserve UNKNOWN/PENDING/contradictions.

Exact next: AB104.252 — conflict resolution and stale-source dominance: authority generations, epoch fencing, snapshot lineage, equivocation, split-brain negative claims, and quarantine/recovery without rewriting historical facts.