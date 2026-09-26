# NEXO AB104.279 — Restore boundary and stale-operation revalidation — 2026-09-26

Research-only.

Evidence:
- Raft snapshots preserve last included index/term and configuration, and restore rejects/ignores snapshots that do not advance the committed boundary. A restored state therefore carries ordering metadata; it is not merely arbitrary historical data. citeturn0search12turn0search0
- Raft client serial numbers prevent a committed command from being executed twice after a leader crash/retry. citeturn0search14

Finding:
- Nexo recovery must treat restore as a semantic boundary: restored operation/dedupe state is usable only after lineage, authority generation, target incarnation and covered frontier are validated.
- A stale operation found in a restored snapshot cannot be treated as currently executable merely because its historical record is valid.
- If the snapshot predates a known fence/authority transition, current authority must be re-established before execution; otherwise stale permission can be resurrected.
- If the snapshot's coverage cannot be proven complete for the operation's possible commit points, absence remains UNKNOWN, not NOT_COMMITTED.
- Historical COMMITTED evidence may remain valid as history while current execution requires fresh authorization.
- This reinforces the separation: historical fact → current admissibility → external effect.

Prototype: no demonstrated restore-aware authority/dedupe frontier binding. Research only.

AB50–AB58 residuals unchanged. Next: AB104.280 — formalize the recovery frontier as a multi-dimensional tuple rather than one revision number.