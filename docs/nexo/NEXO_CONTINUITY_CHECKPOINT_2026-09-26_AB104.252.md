# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.252

Research: docs/nexo/NEXO_AB104_252_CONFLICT_RESOLUTION_STALE_SOURCE_AUTHORITY_EPOCH_SPLIT_BRAIN_V1_2026-09-26.md
Commit: 4d074ea759fa213c4d3807747dc505abef5e7f5e

Core: conflict resolution must use authenticated authority/lineage, not timestamps, arrival order, raw replica count, or local sequence. Historical fact and current admissibility remain separate.

Candidate authority context: authority_root + authority_epoch/generation + configuration_digest + fence_generation. A claim is current-admissible only if the trusted transition chain validates its generation/scope. Later authority can fence old permissions without erasing historical evidence.

Stale-source dominance is a partial order. A source dominates another only when protocol evidence establishes valid later authority/lineage for the exact scope. Timestamp alone is insufficient.

Split brain or incompatible authoritative claims -> CONFLICT/QUARANTINED until consensus/authority transition resolves admissibility. Equivocation: preserve conflicting signed statements, mark issuer equivocation, apply revocation/fencing, retain history.

Restore must preserve snapshot identity/coverage/restore event and create a new target incarnation. Old restored state cannot silently regain current authority. Recovery derives current admissibility without rewriting historical evidence.

Useful external analogues: Raft Leader Completeness/Log Matching; TUF scoped roles, signed versions, expiration, rollback/freeze defenses. citeturn0search14turn0search0

Code search did not surface operation registry/effect-adapter in this pass; not evidence of absence. No implementation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints preserved: research/study only; no V21; preserve UNKNOWN/PENDING/contradictions.

Exact next: AB104.253 — authority-generation transition/revocation and evidence fencing: monotonicity, root rotation, emergency revocation, delayed messages, replay after fencing, historical auditability vs current inadmissibility.