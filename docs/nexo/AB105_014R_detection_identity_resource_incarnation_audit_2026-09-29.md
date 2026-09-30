# AB105.014R — Detection identity vs resource incarnation audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS identifies a drifted resource using stack ID, logical resource ID, resource type, physical resource ID, and, where logical/physical IDs are insufficient, PhysicalResourceIdContext. Drift detection itself has a separate detection identity/result. AWS's import workflow can remove a resource from the stack without deleting it and then import the existing resource back using an identifier. citeturn0search8turn0search11turn0search1

## Finding

Detection identity and resource identity are related but not interchangeable. A provider detection ID identifies an observation operation; it does not by itself establish that two observations concern the same physical incarnation across removal, recreation, or import.

Anti-collapse:
- DETECTION_ID != RESOURCE_IDENTITY
- LOGICAL_RESOURCE_ID != PHYSICAL_INCARNATION_BY_ITSELF
- PHYSICAL_RESOURCE_ID != OPERATION_ID
- SAME_LOGICAL_ID != SAME_PHYSICAL_INCARNATION
- SAME_VISIBLE_IDENTIFIER != SAME_HISTORICAL_RESOURCE
- NEW_DETECTION_ID != NEW_RESOURCE
- IMPORT_REFERENCE != HISTORICAL_CONTINUITY_PROOF

AWS's own `PhysicalResourceIdContext` exists for cases where logical and physical IDs alone are insufficient to uniquely identify a resource, demonstrating that identity scope may require additional context. citeturn0search8turn0search11

## Nexo implication

The evidence identity tuple should keep observation identity separate from target identity and incarnation. A robust historical claim should bind, when available:

`observation_id + target_scope + logical_identity + physical_identity + physical_identity_context + incarnation/lineage + expectation_version + observation_time`

An import/re-attachment event is a new lineage fact. It cannot silently establish that the imported resource is historically identical to every earlier resource carrying the same logical or human-readable identifier.

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.015R: continue fresh evidence research on import/re-attachment and delayed historical evidence, specifically whether a reused logical identity can safely inherit prior claims without an explicit incarnation binding.