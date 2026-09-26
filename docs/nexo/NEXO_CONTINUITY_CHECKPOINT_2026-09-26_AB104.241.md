# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.241

Research file: docs/nexo/NEXO_AB104_241_MIGRATION_RECORD_AUTHORITY_NON_ESCALATION_ATTACKS_V1_2026-09-26.md
Research commit: 1dea56a0c24c593fd6a7320d47de85d295c9d7e3

Core result: migration is evidence transformation, not authority creation. It must not silently increase authority, freshness, scope, signer eligibility, target incarnation or effect permission.

Key attacks: malicious transformation; permissive defaults; double migration; migration fork; partial migration; crash after target transformation; rollback; concurrent migration; source disappearance; authority-root rewrite; target-incarnation substitution; obsolete migration reuse.

Candidate monotonicity: migrated authority <= source authority unless an explicitly authenticated authority transition permits otherwise.
UNKNOWN_EXTERNAL cannot become COMMITTED merely because data was migrated. REVOKED cannot become CURRENT through schema conversion. An old target incarnation cannot become a new incarnation through representation migration.

Migration identity should bind source digest/schema/semantics, target schema/semantics, transformation digest, executor, authority context, incarnation, predecessor/generation and evidence. These are research candidates, not an implementation specification.

External cross-checks: Fowler documents version-controlled, uniquely identified, sequenced migration artifacts and auditability; useful for traceability, not Nexo authority. citeturn0search5 TUF separates signing roles and protects against rollback/coherence attacks, useful as an analogy. citeturn0search0turn0search1

Current prototype: no migration executor/journal/authority binding demonstrated in inspected Nexo path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.242 — migration executor as an effect: side effects, idempotency, crashes, fencing, rollback/compensation and security-metadata authorization races.