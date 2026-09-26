# NEXO CONTINUITY CHECKPOINT — AB104.274 — 2026-09-26

AB104.274 persisted.

Key finding: conflicting statements from one authority for the same scope/epoch are EQUIVOCATION/CONFLICT, not a choice by arrival time, timestamp or signature validity. Preserve both statements and their digests/lineage; fence the affected authority from current executable permission until an authenticated transition resolves the conflict. Historical evidence remains intact. Replay after a later authority transition must pass current-authority validation. Direct prototype inspection confirms idempotencyKey/reconciliation but no authority-generation, target-incarnation or fingerprint binding.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.275 — equivocation recovery after crash/restore and anti-resurrection.