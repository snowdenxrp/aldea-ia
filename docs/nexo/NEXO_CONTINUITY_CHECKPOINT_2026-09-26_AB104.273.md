# NEXO CONTINUITY CHECKPOINT — AB104.273 — 2026-09-26

AB104.273 persisted.

Key finding: quorum count is not evidence independence. A QC must bind statement digest, authoritative configuration/epoch, eligible signer set, threshold and lineage. During transitions, overlapping old/new quorums prevent conflicting authoritative decisions. Obsolete certificates remain historical evidence but do not automatically authorize current effects. Shared roots/storage/issuer can create common-mode failure. VALID_SIGNATURE != CURRENT_AUTHORIZATION.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.274 — equivocation: one authority signs conflicting statements; preserve conflict and fence authority.