# AB105.018R — Acquisition boundary and pre-management evidence gap audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS states that resource import brings an existing resource under CloudFormation management using a template plus resource identifiers. Import validation verifies existence, schema/property validity, required properties, and that the resource is not already managed by another stack; it explicitly does not check that template configuration matches the resource's actual configuration. AWS recommends drift detection after import for that comparison. citeturn0search1turn0search9

CloudFormation also allows drift detection on an individual resource and records the actual/expected configuration observed by that detection. A later observation can move a resource from DRIFTED back to IN_SYNC. citeturn0search7turn0search11

## Finding

The acquisition/management boundary is not itself a historical observation boundary for the resource's prior lifecycle.

Anti-collapse:
- IMPORT_VALIDATION != PRE_IMPORT_STATE_PROOF
- MANAGEMENT_ACQUISITION != RESOURCE_CREATION
- FIRST_POST_IMPORT_OBSERVATION != PRE_IMPORT_HISTORY
- IMPORT_COMPLETE != PRE_IMPORT_CONFORMANCE
- POST_IMPORT_IN_SYNC != HISTORICAL_IN_SYNC
- RESOURCE_EXISTS_AT_IMPORT != RESOURCE_HISTORY_KNOWN
- AUTHORITY_ACQUIRED_NOW != AUTHORITY_HELD_PAST

Therefore a provider can establish a strong current relationship after acquisition while leaving an evidence gap for the period before acquisition, unless historical provider records or independently retained evidence bridge that period.

## Nexo implication

The evidence graph should explicitly represent an acquisition boundary with a bounded epistemic scope:

`pre_acquisition_history -> retained_provider_evidence | UNKNOWN`
`acquisition_event -> management_relationship_start`
`post_acquisition_observation -> current_authoritative_fact`

The acquisition event must not be treated as a synthetic checkpoint proving everything that happened before it.

Where a provider explicitly supplies historical event lineage spanning the boundary, that lineage can close a particular historical claim. Without such a contract, the boundary remains an evidence gap rather than an inferred absence of events.

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.019R: investigate whether provider-side event logs/audit trails can close an acquisition-boundary evidence gap, and what minimum lineage fields are required before historical reconstruction is justified.