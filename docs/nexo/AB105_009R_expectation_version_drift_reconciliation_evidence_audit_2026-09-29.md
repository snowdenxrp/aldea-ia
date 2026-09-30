# AB105.009R — Expectation-version / drift-reconciliation evidence audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS CloudFormation's current drift-aware change-set documentation explicitly models three states during comparison: actual live state, previous deployment state, and desired state. It can either revert drifted resources toward the template or update the template/expected definition to match actual state. AWS also documents that resolving drift by import can retain the existing resource while updating the stack definition to describe its actual configuration. citeturn0search0turn0search6

AWS's drift model separately defines the current actual-vs-expected result and records a last-check timestamp. Therefore an IN_SYNC result is scoped to the expectation against which that detection was performed, rather than being a timeless statement about the resource's entire history. citeturn0search2turn0search3

## Finding

Expectation/version changes create a second semantic axis in the evidence graph:

- EXPECTATION_VERSION != RESOURCE_STATE
- CURRENT_IN_SYNC(EXPECTATION_N) != HISTORICAL_CONFORMANCE(EXPECTATION_N-1)
- TEMPLATE_UPDATE_TO_ACTUAL != HISTORICAL_DRIFT_ERASURE
- THREE_WAY_COMPARISON != COMPLETE_HISTORY
- RESOLUTION_EVENT != RETROACTIVE_RECLASSIFICATION_OF_PAST_FACT
- LAST_CHECK_TIMESTAMP != EFFECT_TIME

A resource can legitimately become IN_SYNC because the expected configuration was changed to match its actual state. That establishes consistency with the newer expectation; it does not establish that the resource satisfied the older expectation before the change.

## Evidence-model consequence

The evidence object should bind at least:

evidence_id + observation_time + expectation_version + scope + actual_snapshot + expected_snapshot + authority + derivation/operation relation

A reconciliation operation must append a new fact/relation. It must not mutate the historical drift observation into a new interpretation.

Recommended conceptual lineage:

historical_expected_v1
→ drift_observation_v1
→ reconciliation_or_template_change
→ expected_v2
→ current_observation_v2

The valid inference is:

CURRENT_IN_SYNC(v2) → current consistency with v2

The invalid inference is:

CURRENT_IN_SYNC(v2) → historical absence of drift under v1

## Classification

This is not a new top-level interaction class. It reinforces I19/I21/I22 and classes 7, 12, 14, 17, 19. Class 14 remains relevant when reconciliation is itself a corrective operation, but reconciliation does not erase the original effect/history.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.010R: continue fresh evidence research on whether later reconciliation/current observations can establish historical continuity when expectation versions, observation scopes, or source evidence differ.