# AB105.016R — Imported-resource provider history vs current relationship audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS documents that an import operation maps a template LogicalResourceId to an existing resource using a resource identifier/value. After import, AWS recommends a new drift detection to verify that the template and actual configuration match. AWS also states that CloudFormation does not check during import that template configuration matches actual resource properties. Resource drift records separately expose LogicalResourceId, PhysicalResourceId, PhysicalResourceIdContext, ActualProperties and ExpectedProperties. citeturn0search0turn0search6

## Finding

An import operation establishes a new management relationship between the stack and an existing resource. The import identifier is sufficient for the import operation's target-selection contract, but the resulting relationship is not, by itself, a complete historical event lineage for the resource.

Anti-collapse:
- IMPORT_TARGET_MATCH != HISTORICAL_CONTINUITY
- IMPORT_COMPLETE != HISTORICAL_CONFORMANCE
- IMPORT_IDENTIFIER != OPERATION_HISTORY
- CURRENT_PHYSICAL_ID != COMPLETE_RESOURCE_LINEAGE
- POST_IMPORT_DRIFT_CHECK != PRE_IMPORT_HISTORY
- TEMPLATE_MATCH_AFTER_IMPORT != NEVER_DRIFTED_BEFORE_IMPORT
- MANAGEMENT_RELATIONSHIP != RESOURCE_CREATION_HISTORY

Critically, AWS explicitly recommends drift detection after import because import success alone does not establish that the imported resource's actual configuration matches the template. citeturn0search0turn0search3

## Nexo implication

Import/reattachment must be modeled as a distinct lineage event. It can establish `managed_by(stack, resource)` from the import boundary onward, but historical claims about the resource before that boundary require separate evidence.

Conceptual separation:
`import_event -> current_management_relation`
`prior_history -> retained_provider_evidence | UNKNOWN`
`post_import_drift_detection -> new_observation`

The evidence graph must therefore avoid inheriting historical claims merely because a resource was successfully reattached to an authoritative domain.

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.017R: continue fresh evidence research on whether post-import drift detection can distinguish pre-import history from post-import observation, including the first authoritative observation boundary.