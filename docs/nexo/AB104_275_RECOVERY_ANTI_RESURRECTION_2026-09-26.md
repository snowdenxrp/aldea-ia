# NEXO AB104.275 — Recovery anti-resurrection — 2026-09-26

Research-only.

Finding: a detected authority conflict/fence must survive crash/restore. Restoring a pre-detection snapshot must not resurrect a previously fenced authority. Raft snapshot restoration treats snapshot index/term and configuration as safety boundaries; obsolete snapshots are rejected. citeturn0search0turn0search2

Candidate invariant: RESTORE(snapshot) cannot lower the effective authority fence or resurrect a fenced authority without an explicitly authenticated newer authority transition.

Recovery must compare restored authority state against the newest trusted fence/epoch evidence before re-enabling execution. If freshness cannot be established, execution remains blocked/UNKNOWN. Historical equivocation may be archived, but its current fencing consequence must remain recoverable.

Direct Nexo effect-adapter inspection: prepared-effect reconciliation exists, but authority anti-resurrection is not encoded there.

Status: RESEARCHED_NOT_FORMALLY_VERIFIED. No implementation, architecture selection, or semantic freeze. AB50–AB58 residuals unchanged.

Next: AB104.276 — proving freshness/order when authority evidence itself was restored or replicated.