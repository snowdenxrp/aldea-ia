# AB105.013R — Provider-generated timestamp/identifier historical-bridge audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS states that each drift detection run receives a new StackDriftDetectionId, while retention of prior drift results may vary. The detection status Timestamp records when that detection operation was initiated. At resource level, DriftDetectionTimestamp records when drift was detected for the resource property; LiveResourceDrift also exposes ActualValue and PreviousValue. AWS warns users to compare timestamps to avoid stale data. citeturn0search1turn0search2turn0search13turn0search6

## Finding

Provider-generated identifiers and timestamps are strong provenance metadata, but they are not by themselves a universal historical bridge.

Anti-collapse:
- DETECTION_ID != HISTORICAL_LINEAGE_BY_ITSELF
- DETECTION_TIMESTAMP != EFFECT_TIMESTAMP
- RESOURCE_DRIFT_TIMESTAMP != COMPLETE_OPERATION_HISTORY
- PREVIOUS_VALUE != COMPLETE_PREVIOUS_HISTORY
- SAME_STACK_ID != SAME_DETECTION_SCOPE
- LATER_DETECTION_ID != EARLIER_DETECTION_ID
- TIMESTAMP_ORDER != CAUSAL_ORDER

The identifiers establish which provider detection result is being referenced, and timestamps establish observation/detection boundaries. They become sufficient historical evidence only to the extent the provider contract binds the referenced result to the relevant scope, expected configuration, actual value, and historical event semantics.

## Nexo implication

Observation metadata should therefore be typed separately from lineage guarantees.

Minimum conceptual evidence tuple for this boundary:
`provider + detection_id + resource_identity + expectation_version + observation_scope + observation_timestamp + observed_values + retention/provenance_status`

A timestamp can establish that observation B occurred after observation A; it does not establish that no mutation occurred between them, nor that an effect happened exactly at either timestamp.

Historical reconstruction remains contract-dependent:
`historical_claim <- provider_result` only when the provider contract explicitly defines the result as sufficient evidence for that historical claim.

This reinforces I19/I21/I22 and classes 7, 12, 17, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.014R: investigate whether provider detection IDs plus retained result scope can distinguish one historical observation from another across resource recreation/incarnation boundaries.