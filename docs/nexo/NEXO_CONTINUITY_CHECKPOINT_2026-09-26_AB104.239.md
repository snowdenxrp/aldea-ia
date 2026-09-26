# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.239

Research file: docs/nexo/NEXO_AB104_239_MIXED_SNAPSHOT_JOURNAL_FORK_PERMISSION_RESURRECTION_V1_2026-09-26.md
Research commit: 00f4f23197d0c58d56909eb6ecfe6c7fc5645034

Core result: a valid snapshot plus a valid journal segment can still be an invalid combined history. Recovery must prove common authority, scope, incarnation, predecessor continuity and semantic compatibility before replay.

Critical anti-resurrection invariant: if G is the highest trusted authority generation for a scope, recovery must not produce an executable permission below G. Historical old decisions may be reconstructed, but must remain historical/stale/revoked when superseded.

Attacks covered: mixed snapshot/journal; missing journal predecessor; old journal after root rotation; forked valid branches; duplicate event IDs; schema mismatch; root rotation during replay; truncated revocation; stale derived cache; cross-device snapshot/incarnation.

External references: RFC 9943 requires append-only/non-equivocating/replayable transparency and distinguishes registration receipts from truth of statements. citeturn0search0turn0search9 A 2026 SCITT continuity draft similarly separates recovery statements/receipts from underlying recovery truth. citeturn0search6turn0search8 TUF Snapshot binds a coherent metadata view and its security model covers rollback/freeze. citeturn0search7turn0search4

Current prototype: no demonstrated snapshot+journal authority continuity or fork-resolution engine in inspected Nexo effect/recovery path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.240 — schema evolution and semantic compatibility during recovery.