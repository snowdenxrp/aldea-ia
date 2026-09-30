# AB105.016R — Import/re-attachment event identity vs provider historical event identity audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS documents that resource import maps an existing resource into a stack using resource identifiers, then recommends a new drift detection after import to verify that template configuration matches actual configuration. AWS also exposes a separate drift-detection result identity and resource-level actual/expected properties. Stack refactoring can move resources between stacks while preserving their existing properties and data. citeturn0search1turn0search11turn0search8

## Finding

Import or re-attachment establishes a new management relationship and produces new operational evidence; it does not automatically prove that every historical event associated with the prior management relationship belongs to the same historical lineage.

Anti-collapse:
- IMPORT_COMPLETE != HISTORICAL_CONTINUITY_PROOF
- REATTACHMENT != EVENT_HISTORY_MERGE
- NEW_DRIFT_DETECTION != PRIOR_DRIFT_RESULT
- CURRENT_ACTUAL_PROPERTIES != COMPLETE_PRIOR_EVENT_HISTORY
- SAME_PHYSICAL_RESOURCE != SAME_MANAGEMENT_LINEAGE
- STACK_REFACTORING != HISTORICAL_ERASURE
- PRESERVED_RESOURCE_DATA != PRESERVED_CONTROL_PLANE_HISTORY

The fact that AWS recommends running drift detection after import is itself a useful boundary: successful import establishes management state, while the later drift check separately establishes the relationship between current template expectation and current actual configuration. citeturn0search1

## Nexo implication

An import/re-attachment event must be represented as a lineage transition, not as a merge of historical event streams.

Conceptual chain:
`prior_management_context -> detach/import/refactor -> new_management_context -> new_observation`

Historical events remain bound to their original management/identity context unless an explicit provider contract proves continuity. Preserved resource data does not imply preserved control-plane history.

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.017R: investigate stack refactoring/movement as a concrete lineage transition and determine whether preserved physical resource identity is sufficient to preserve prior claims across management-domain changes.