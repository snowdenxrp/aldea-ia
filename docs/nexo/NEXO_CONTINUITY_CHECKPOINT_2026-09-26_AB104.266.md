# NEXO CONTINUITY CHECKPOINT — AB104.266 — 2026-09-26

AB104.266 persisted.

Crash-at-transition finding: coordinator persistence order does not by itself establish effect ordering. The decisive boundary must be target-side and durable/equivalent. If F7 is atomically accepted before F8 linearizes, F7 remains historical; if F8 is already effective, F7 is fenced. If target mutation occurred but receipt/registry evidence was lost, retain UNKNOWN unless authoritative evidence reconstructs commit. If coordinator and target lack a common protected ordering boundary, recovery must not invent relative order; preserve UNKNOWN/CONFLICT and reconcile.

Candidate invariant: local authority state alone never authorizes an external effect; the effect boundary needs authenticated authority generation + target incarnation + operation identity/fingerprint plus durable linearization/receipt evidence.

Research only. No implementation, architecture selection, semantic freeze, or formal verification.

AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending; no fabricated SHAs.

Next: AB104.267 — atomic-domain vs two-phase authority/effect protocol and UNKNOWN semantics.