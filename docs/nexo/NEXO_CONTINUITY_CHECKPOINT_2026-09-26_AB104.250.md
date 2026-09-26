# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.250

Research: docs/nexo/NEXO_AB104_250_AUTHORITATIVE_NOT_COMMITTED_EVIDENCE_CONTRACT_EXPIRY_V1_2026-09-26.md
Commit: 7440dc4490accec5d1ed2b2943ba19db75363021

Core: NOT_COMMITTED is a positive non-occurrence claim. Evidence must cover every point where the operation could have committed, bind operation/namespace/fingerprint, target/resource identity, target incarnation, authority root/epoch/fence, coverage interval, observation consistency, durable absence certificate/tombstone semantics, retention/expiry, anti-rollback continuity, issuer/integrity and dependency graph.

Expiry means loss of admissibility, not proof of non-occurrence. Candidate states: VALID_NOT_COMMITTED; EXPIRED_NOT_COMMITTED_EVIDENCE; UNKNOWN; UNKNOWN_PERMANENT; CONFLICT. UNKNOWN_PERMANENT means authoritative reconciliation is no longer obtainable under the contract while historical outcome remains unresolved; it is not NOT_COMMITTED.

A generic tombstone is not automatically an application-level negative operation certificate. New target incarnation must not inherit old negative evidence without explicit authenticated transition semantics. Multiple replicas are not independent merely because there are several; shared snapshot/storage/trust/replication failure domains can create common-mode failure.

RFC 9110 If-Match supports target-side conditional state changes and recognition of an already-successful equivalent change after a lost response, but it does not supply Nexo authority/incarnation/historical negative-evidence semantics. etcd compaction provides a concrete retention boundary: old revisions become inaccessible after compaction.

Code search did not surface operation-registry implementation; not evidence of absence. No implementation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints preserved: research/study only; no V21; no unsupported verification; preserve UNKNOWN/PENDING/contradictions.

Exact next: AB104.251 — compose multiple negative claims: evidence independence, quorum/threshold admissibility, common-mode dependency graph, contradictory replicas, and reconstruction after migration/restore.