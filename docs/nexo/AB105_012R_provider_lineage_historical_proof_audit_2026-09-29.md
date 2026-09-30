# AB105.012R — Provider lineage guarantee vs historical proof audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS CloudFormation defines drift as a comparison between current actual resource configuration and the expected configuration from the stack template/parameters. A later resource drift check can update both the resource and stack drift status to IN_SYNC after the resource is restored. AWS also states that drift-aware change sets perform a three-way comparison between actual state, previous deployment state, and desired state, with drift details carrying a detection timestamp. citeturn0search1turn0search3turn0search0

## Finding

A provider's current observation becomes historical proof only when the provider contract explicitly preserves the lineage relation needed for that historical claim. Ordinary re-observation establishes the state observed at the later observation boundary; it does not, by itself, establish what the resource was at an earlier boundary.

Anti-collapse:
- CURRENT_OBSERVATION != HISTORICAL_PROOF
- CURRENT_IN_SYNC(t2) != IN_SYNC(t1)
- SAME_RESOURCE_ID != SAME_HISTORICAL_STATE
- SAME_EXPECTED_TEMPLATE != CONTINUOUS_CONFORMANCE
- LATER_DRIFT_CHECK != RETROACTIVE_DRIFT_PROOF
- DETECTION_TIMESTAMP != EFFECT_TIMESTAMP
- PROVIDER_AUTHORITY != AUTOMATIC_HISTORICAL_LINEAGE

CloudFormation's own model demonstrates the needed distinction: a resource can be checked again and become IN_SYNC after being changed back to expected values, while the prior drift event remains a distinct historical fact. citeturn0search3

## Nexo implication

The Evidence Dependency Graph must not infer historical continuity merely from provider identity, current authority, or a fresh successful observation. A historical claim can be reconstructed from a later observation only when the source contract supplies an explicit temporal/lineage guarantee that bridges the two observations.

Conceptual rule:
`current_observation(t2) -> historical_claim(t1)` only if `lineage_contract(t2,t1)` is explicitly established.

Otherwise the correct state is a new current fact, with the historical claim remaining supported only by retained historical evidence or UNKNOWN if that dependency is unavailable.

This reinforces I19/I21/I22 and classes 7, 12, 17, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.013R: investigate whether provider-generated timestamps/identifiers can constitute a sufficient historical bridge, or remain observation metadata unless stronger lineage guarantees exist.