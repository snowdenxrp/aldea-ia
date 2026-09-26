# NEXO AB104.275 — Equivocation recovery after crash/restore — 2026-09-26

Research-only.

Finding: an equivocation decision must survive crash/restore strongly enough that an older snapshot cannot resurrect an authority already fenced. Raft persists currentTerm and log state and uses term metadata to reject stale information; snapshots also carry the last included index/term and configuration. citeturn1view0

Candidate requirements:
- fencing/equivocation evidence needs an anti-rollback boundary stronger than an ordinary volatile flag;
- restore must validate that the recovered authority state is not older than a durable revocation/fence frontier;
- historical conflicting statements remain evidence even after the authority is fenced;
- if recovery cannot prove that a conflict/fence was not rolled back, current execution must remain blocked/UNKNOWN rather than resurrecting authority;
- a new authority incarnation must be distinguishable from the fenced predecessor.

Important distinction: historical validity of a signed statement does not imply current admissibility. A restored pre-fence snapshot may preserve valid old signatures while still being unsafe for execution.

Direct prototype inspection remains: effect-adapter.js has prepared/reconciliation and idempotency handling, but no demonstrated authority-equivocation persistence or anti-resurrection fence.

Status: RESEARCHED_NOT_FORMALLY_VERIFIED. No implementation or architecture selection. AB50–AB58 residuals unchanged.

Next: AB104.276 — rollback/restore attacks against authority and effect evidence; monotonicity requirements.