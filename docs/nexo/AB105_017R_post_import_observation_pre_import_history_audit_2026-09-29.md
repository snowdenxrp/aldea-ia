# AB105.017R — Post-import observation boundary vs pre-import history audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS documents that import establishes management of an existing resource, but the import operation itself does not verify that template configuration and actual configuration are identical. AWS recommends an optional post-import drift detection for that comparison. Resource drift results contain actual/expected properties and a detection timestamp; AWS also notes that rechecking a resource after restoring expected values can change its current drift status back to IN_SYNC. citeturn0search0turn0search2turn0search5turn0search7

## Finding

The first post-import drift check establishes an authoritative observation boundary for the imported resource under the current stack expectation. It does not, by itself, prove the resource's configuration before import or prove that no pre-import drift existed.

Anti-collapse:
- POST_IMPORT_IN_SYNC != PRE_IMPORT_IN_SYNC
- IMPORT_COMPLETE != PRE_IMPORT_CONFORMANCE
- FIRST_POST_IMPORT_OBSERVATION != COMPLETE_RESOURCE_HISTORY
- CURRENT_EXPECTED_PROPERTIES != HISTORICAL_EXPECTED_PROPERTIES
- CURRENT_ACTUAL_PROPERTIES != HISTORICAL_ACTUAL_PROPERTIES
- POST_IMPORT_TIMESTAMP != RESOURCE_CREATION_TIMESTAMP
- MANAGEMENT_START != RESOURCE_EXISTENCE_START

The provider can therefore be authoritative about the state it observed after import while remaining unable to establish the complete pre-import history from that observation alone.

## Nexo implication

The evidence graph should create an explicit boundary event:

`import_complete -> management_authority_boundary`
`post_import_drift_detection -> first_authoritative_observation_after_boundary`

Historical claims before that boundary require independent provider evidence or retained evidence. A post-import `IN_SYNC` result may support the bounded claim `resource matched expectation at observation t`, but not `resource always matched expectation before t`.

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.018R: continue fresh evidence research on the first-observation boundary itself—whether the provider can expose historical state before management acquisition, or whether the acquisition boundary necessarily leaves a historical evidence gap.