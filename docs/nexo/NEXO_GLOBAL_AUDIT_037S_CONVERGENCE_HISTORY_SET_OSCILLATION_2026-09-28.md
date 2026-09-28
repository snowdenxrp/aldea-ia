# GLOBAL-AUDIT-037S — CONVERGENCE / HISTORY-SET OSCILLATION ATTACK — 2026-09-28

## Duplicate audit
A recursive tree check found exactly four 037-related paths:
- NEXO_GLOBAL_AUDIT_037_RETRY_RECONCILIATION_UNKNOWN_CONVERGENCE_2026-09-28.md
- NEXO_GLOBAL_AUDIT_037R_RETRY_RECONCILIATION_DEEP_ATTACK_2026-09-28.md
- NEXO_GLOBAL_AUDIT_CONTINUITY_2026-09-28_GLOBAL-AUDIT-037.md
- NEXO_GLOBAL_AUDIT_CONTINUITY_2026-09-28_GLOBAL-AUDIT-037R.md

No duplicate numbered 037 audit artifact was found. 037R is explicitly a continuation/deep attack of 037, not a duplicate. 037 remains open.

## Convergence attack
Model reconciliation as a sequence of compatible-history sets CH_0, CH_1, ... . A sound observation normally removes histories incompatible with authenticated evidence. However, if evidence itself is later revoked, expires, is superseded, or is discovered stale, the previously constrained set cannot simply be treated as permanently closed.

Therefore a naive monotone rule CH_(n+1) subseteq CH_n is unsafe across evidence invalidation. The correct semantic object must include evidence validity/provenance state. When evidence E becomes invalid, the admissible-history set may widen relative to the state computed using E, while the epistemic result becomes UNKNOWN rather than silently retaining the old conclusion.

## Provider ordering attack
A provider observation is sufficient for final resolution only if the provider exposes semantics that bind the observation to the exact EffectID/resource incarnation and establish freshness/order relative to competing observations. Local receive time is insufficient.

Possible provider contracts:
1. authoritative revision/sequence for the exact effect identity;
2. linearizable status query with defined snapshot point;
3. immutable event log with authoritative ordering;
4. explicit version/incarnation plus causal relation.

Absent such a contract, repeated identical answers do not necessarily eliminate stale/common-mode alternatives.

## Oscillation result
Repeated polling is not itself a convergence proof. A system can alternate between apparent ACCEPTED and UNKNOWN when observations are stale, contradictory or invalidated. Safe behavior is to preserve UNKNOWN until an authoritative ordering/evidence contract excludes the relevant alternatives.

## Closure status
037 is still OPEN. The convergence criterion is now sharpened: convergence requires stabilization of the claim-relevant compatible-history equivalence class under an evidence validity model, not merely termination or repeated identical responses.

No formal proof, TLC/TLAPS execution, or runtime fault injection.

NEXT: remain in 037 for a final attack on stabilization/termination assumptions and whether a bounded reconciliation protocol can soundly detect non-convergence.
