# NEXO AB104.273 — Quorum certificates and independence under shared trust roots — 2026-09-26

Research-only.

Evidence:
- Raft joint consensus requires majorities from both old and new configurations during transition, preserving quorum overlap and safety across membership changes. citeturn0search24turn0search0
- etcd linearizable operations rely on the consensus path; a watch/mirror is not itself a linearizable authority source. citeturn0search1turn0search8

Findings:
1. A quorum certificate proves agreement only relative to its defined configuration, epoch/term, statement digest and quorum rule.
2. Raw signature count is insufficient: the same identity must not be counted twice, and eligibility must be evaluated against the authoritative configuration for that epoch.
3. During authority/configuration transition, a safe certificate must bind the transition state; joint-consensus-style overlap is evidence that old and new authority sets cannot independently certify conflicting decisions.
4. Shared trust roots, replicated storage ancestry, common snapshot/WAL, or a common issuer create common-mode dependencies. A quorum of such certificates is not automatically independent.
5. A certificate from an obsolete configuration can remain valid historical evidence but must not automatically authorize a current effect.
6. A current quorum certificate cannot erase contradictory historical evidence; conflicts require lineage/epoch/statement comparison and quarantine if unresolved.
7. Candidate QC fields: statement digest, predecessor/config digest, authority root+epoch, eligible signer set, threshold, signer identities, target incarnation, operation/fingerprint, freshness/anti-rollback context, and evidence-dependency references.

Candidate rule:
QUORUM_COUNT != INDEPENDENT_AUTHORITY.
VALID_SIGNATURE != CURRENT_AUTHORIZATION.

No architecture selected or implemented. AB50–AB58 residuals unchanged.

Next: AB104.274 — equivocation: same authority signs conflicting statements and how Nexo preserves/fences the conflict.