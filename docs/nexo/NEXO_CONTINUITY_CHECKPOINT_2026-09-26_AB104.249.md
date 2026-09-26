# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.249

Research: docs/nexo/NEXO_AB104_249_TARGET_OPERATION_REGISTRY_CRASH_RESTORE_NEGATIVE_EVIDENCE_V1_2026-09-26.md
Commit: 2cba4c42f348b7dfbec1452b0f703a5cc7231f82

Core finding: target-side absence is NOT_COMMITTED only when protected by complete-history coverage, target incarnation, authority/fence generation, retention, authoritative observation boundary, durable absence marker/equivalent proof, and anti-rollback continuity. Current registry absence alone is insufficient.

Tombstones preserve historical deletion semantics only while their coverage remains valid. Compaction is storage lifecycle, not proof of non-occurrence. etcd preserves MVCC history until compaction and then makes earlier revisions inaccessible; RocksDB similarly removes tombstones only as compaction/snapshot conditions allow. Watch/history ordering is not equivalent to linearizable current-state observation.

Crash/restore: committed receipt + response loss can reconcile to COMMITTED; empty registry after rollback-prone restore is UNKNOWN; compacted history without surviving coverage certificate expires negative evidence; incarnation changes require explicit binding.

Compaction certificate candidate must preserve namespace, covered sequence/revision interval, incarnation, authority, retention, and integrity/authenticity anchor. If certificate is absent/untrusted, downgrade to UNKNOWN, not NOT_COMMITTED.

Code study: indexed GitHub search for effect-adapter/operation-registry terms returned no results; not evidence of absence. Earlier direct prototype inspection remains valid. No implementation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; preserve UNKNOWN/PENDING and contradictions.

Exact next: AB104.250 — authoritative NOT_COMMITTED evidence contract: coverage intervals, tombstone certificates, expiry, incarnation transitions, authority/quorum dependence, UNKNOWN_PERMANENT boundary.