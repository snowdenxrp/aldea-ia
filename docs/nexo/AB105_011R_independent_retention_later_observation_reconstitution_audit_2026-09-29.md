# AB105.011R — Independent retention vs later authoritative reconstitution audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS states that each drift detection run creates a new result ID, while the number of retained drift results and their retention duration may vary. AWS also explicitly warns operators to check the last drift-check time to avoid using stale results. Drift-aware change sets expose previous deployment value, actual value, and drift-detection timestamp. citeturn0search0turn0search2turn0search5turn0search1

## Finding

A later authoritative observation can establish a new current fact, but it does not automatically reconstitute an expired or missing historical evidence record. Reconstitution is only valid when the later source contract explicitly provides historical lineage sufficient for the claim.

Anti-collapse:
- LATER_AUTHORITATIVE_OBSERVATION != HISTORICAL_RECONSTRUCTION
- CURRENT_IN_SYNC != HISTORICAL_IN_SYNC
- NEW_DETECTION_ID != SAME_HISTORICAL_EVIDENCE
- SOURCE_REOBSERVATION != ORIGINAL_OBSERVATION
- REPORT_EXPIRY != HISTORICAL_ERASURE
- MISSING_PRIOR_RESULT != NEVER_OCCURRED
- CURRENT_STATE_PROOF != COMPLETE_PRIOR_HISTORY

An independently retained evidence object can preserve a historical claim after the provider's original report is no longer retrievable. Conversely, a later read can prove a later state without proving the exact earlier state unless the provider explicitly binds that read to historical lineage.

## Nexo implication

The Evidence Dependency Graph must distinguish:

1. source-side historical evidence,
2. independently retained evidence materialization,
3. later authoritative observations, and
4. claims reconstructed from those observations.

A later observation may create a new claim or validate a narrowly defined invariant, but it must not silently replace an unavailable historical dependency.

Conceptual rule:
`historical_claim := supported_by(retained_historical_evidence)`
`current_claim := supported_by(current_authoritative_observation)`
`current_claim -> historical_claim` only when an explicit lineage/contract proves that implication.

This reinforces I19/I21/I22 and classes 7, 12, 17, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.012R: continue fresh research on provider/source lineage guarantees—specifically when a later observation is contractually capable of proving a historical fact rather than merely establishing current state.