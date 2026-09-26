# NEXO CONTINUITY CHECKPOINT — AB104.279 — 2026-09-26

AB104.279 persisted.

Key finding: restore is a semantic boundary, not just loading old bytes. Restored operation/dedupe state must be checked against lineage, authority generation, target incarnation and coverage frontier. A valid historical record does not become current execution permission. If snapshot coverage predates a fence/authority transition or cannot cover all possible commit points, stale permission must not be resurrected; absence remains UNKNOWN rather than NOT_COMMITTED.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.280 — recovery frontier as a multi-dimensional tuple, not one revision number.