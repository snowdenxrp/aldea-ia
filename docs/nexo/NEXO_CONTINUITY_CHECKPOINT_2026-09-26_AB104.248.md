# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.248

Research: docs/nexo/NEXO_AB104_248_TARGET_CONDITIONAL_COMPENSATION_COMPARE_AND_COMPENSATE_V1_2026-09-26.md
Commit: 3777c7cf94a3780e963368938ab6e9d2db29a202

Core: strongest candidate compensation boundary is target-side conditional acceptance combining original operation identity/fingerprint, target incarnation, authority/fence, expected resource version and compensation identity/fingerprint. Client pre-read + later write is TOCTOU, not atomic compare-and-compensate.

Operation registry candidate: UNSEEN -> RESERVED -> ACCEPTED -> COMMITTED -> RECEIPT_AVAILABLE, with REJECTED_PRE_ACCEPTANCE, UNKNOWN_EXTERNAL, PARTIAL and CONFLICT. RESERVED != effect; ACCEPTED != necessarily COMMITTED.

CAS protects resource version; authority epoch/fence protects authorization freshness. Neither replaces the other. Candidate atomic target operation checks all required predicates and, if valid, applies compensation plus receipt at the same target boundary.

Target restart/restore must not lower authority generation/fence or erase operation history such that committed work becomes apparent absence. If rollback is possible, negative evidence requires continuity/anti-rollback.

Partial effects require child identities and child-level reconciliation. Parent compensation identity alone is insufficient.

GitHub indexed search returned no effect-adapter result in this pass; this is not proof of absence. Earlier direct code inspection remains prototype evidence. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; preserve UNKNOWN/PENDING and contradictions.

Exact next: AB104.249 — target operation registry crash/restore and negative evidence: receipt ordering, tombstones/absence guarantees, compaction, target incarnation changes, and authoritative NOT_COMMITTED.