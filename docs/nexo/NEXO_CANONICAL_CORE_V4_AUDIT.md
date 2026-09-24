# NEXO Canonical Core V4 Audit — 2026-09-23

V4 was created from the V3 structural findings and immediately audited before any evaluator implementation.

## Findings

### V4-F01 — TLA+ record schemas are still illustrative
The model uses record fields and helper constants such as evidenceTemplate without defining finite domains and record constructors. It is not yet SANY-ready.

### V4-F02 — Authority scoping is improved but current authority still depends on a domain map
The intended per-domain epoch is present, but the model needs an explicit operation-to-authority-domain relation and a precise rule for which epoch changes fence each operation.

### V4-F03 — STOP scope is now per operation, but enforcement is still missing
The model has NORMAL/REQUESTED/ENFORCING/VERIFIED as a state set, but RequestStop only enters REQUESTED. A complete emergency plane requires explicit enforcement and verification transitions.

### V4-F04 — Effect state is now first-class
This is a structural improvement: EffectState is separate from EvidenceRecord. However, transitions connecting execution to UNKNOWN/PARTIAL/APPLIED and evidence to effect reconciliation are still incomplete.

### V4-F05 — Release authorization is now consumed
Commit requires a release authorization bound to authority epoch, exact effect, exact target and recovery generation, and invalidates it on commit. This closes the previous observational-only authorization hole, but post-authorization policy/dependency changes still need explicit invalidation.

### V4-F06 — Freshness now has logical time
A freshUntil/deadline is present and AdvanceTime can mark evidence STALE. However, freshness semantics and clock assumptions still need explicit definition and bounded model configuration.

### V4-F07 — Generation is operation-scoped
Recovery and reconciliation generations are per operation. Temporal monotonicity still needs explicit transition invariants: acquire increments exactly once; non-acquire transitions preserve the generation.

### V4-F08 — Release eligibility still requires recovery ownership
This is intentionally now a coordination guard, not the source of evidence truth. The architecture must specify whether final commit always requires recovery ownership or whether a completed reconciliation can transition through another explicitly authorized path.

### V4-F09 — Global version variables remain
policyVersion and dependencyGraphVersion are global. This may be valid if they are global control-plane versions, but materiality and operation impact must be explicit.

### V4-F10 — Stop/release ordering remains unproven
RequestStop invalidates release authorization, but V4 lacks Release/Stop enforcement ordering scenarios and a linearization proof obligation.

## Decision

V4 is structurally closer to the canonical target, but is not accepted as final. Do not patch individual lines. Next pass must make the model executable: finite records, explicit authority-domain mapping, effect transition relation, STOP enforcement/verification, invalidation events, and a small bounded adversarial configuration.

Status:
DESIGNED/SPECIFIED.
SANY/TLC: NOT RUN.
Runtime tests: NOT RUN.
Formal equivalence: NOT CLAIMED.
