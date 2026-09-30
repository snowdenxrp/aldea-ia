# AB105.010R — Reconciliation provenance sufficiency audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS exposes drift-aware change-set evidence with `PreviousValue`, `ActualValue`, and `DriftDetectionTimestamp`; it also distinguishes `ACTUAL_STATE` from `PREVIOUS_DEPLOYMENT_STATE`. A `SyncWithActual` target resets drift status without modifying the resource. AWS further states that retained drift reports may vary in number and duration. citeturn0search0turn0search2turn0search8

## Finding

A reconciliation record can establish that a later reconciliation occurred, but it is not by itself sufficient to reconstruct the complete historical evidence that justified the earlier drift claim.

Anti-collapse:
- RECONCILIATION_RECORD != COMPLETE_PRE_RECONCILIATION_EVIDENCE
- SYNC_WITH_ACTUAL != HISTORICAL_NO_DRIFT
- CURRENT_ACTUAL_VALUE != HISTORICAL_ACTUAL_VALUE
- CURRENT_EXPECTATION != PRIOR_EXPECTATION
- RESOLUTION_EVENT != ORIGINAL_OBSERVATION
- RETAINED_RESULT != COMPLETE_HISTORY
- MISSING_PRIOR_REPORT != NEVER_OCCURRED

A later reconciliation can therefore be authoritative for the new state while remaining insufficient as a proof of the complete prior state. The evidence graph needs a distinction between the reconciliation fact and the independently retained observation/evidence on which the prior claim depended.

## Nexo implication

Evidence retention should preserve, where required by the claim's authority/risk, the dependency set rather than only a later resolution marker.

Conceptual model:

`claim(t1) -> evidence_set(E1) -> expectation_version(E1) -> observation(t1)`
`reconciliation(t2) -> new_expectation/state(E2)`
`claim(t2) -> evidence_set(E2)`

Neither claim should be reconstructed solely from the other.

This reinforces I19/I21/I22 and classes 7, 12, 14, 17, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.011R: investigate the boundary between independently retained evidence, source-side report expiration, and whether later authoritative observations can legitimately reconstitute an earlier claim.