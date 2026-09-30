# AB105.012R — Historical lineage contract for later observations

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS CloudFormation's resource-drift API exposes the resource's physical identity/context, actual properties, expected properties, drift status, status reason, and the timestamp at which drift detection was performed. The drift-aware change-set API separately records the previous deployment value, current actual value, and drift-detection timestamp. AWS also states that only properties explicitly defined in the template are checked. citeturn0search9turn0search0turn0search8

## Finding

A later observation can prove a historical claim only when the source contract supplies enough stable lineage to bind the later observation to the historical object, scope, expectation, and relevant state transition. A later observation of the same resource identifier is otherwise only a current observation.

Anti-collapse:
- SAME_PHYSICAL_RESOURCE_ID != COMPLETE_HISTORICAL_LINEAGE
- LATER_EXPECTED_PROPERTIES != PRIOR_EXPECTED_PROPERTIES
- CURRENT_ACTUAL_PROPERTIES != HISTORICAL_ACTUAL_PROPERTIES
- SAME_STACK_ID != SAME_EXPECTATION_VERSION
- SAME_RESOURCE != SAME_OBSERVATION_SCOPE
- LATER_TIMESTAMP != HISTORICAL_EFFECT_TIME
- CURRENT_IN_SYNC != HISTORICAL_CONFORMANCE
- PROVIDER_CONTEXT != AUTOMATIC_HISTORY_RECONSTRUCTION

The AWS evidence is strong precisely because it carries explicit expected/actual values, identity/context, status reason, and timestamps. Even so, those fields describe a bounded observation; they do not establish an unbounded historical timeline.

## Nexo implication

An evidence contract that permits historical reconstruction should explicitly declare the lineage fields that make the implication valid. Conceptually:

`historical_claim <- {subject_identity, incarnation/lineage, expectation_version, scope, observation_time, authority, source_contract, evidence_reference}`

A later observation may be linked to that claim only when the contract proves continuity of the relevant identity, expectation, scope, and lineage. Otherwise the correct result remains a new current fact, not retroactive reconstruction.

This reinforces I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.013R: continue researching whether explicit provider identity/context plus timestamps can support bounded historical reconstruction across resource recreation, expectation changes, and scope changes.