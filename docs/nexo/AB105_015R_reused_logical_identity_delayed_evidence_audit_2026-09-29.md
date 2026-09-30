# AB105.015R — Reused logical identity and delayed evidence inheritance audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS documents that drift detection identifies a resource through StackId, LogicalResourceId, PhysicalResourceId and, where needed, PhysicalResourceIdContext. AWS also documents that a resource can be removed from a stack without deleting it and later imported back, while drift detection remains a comparison against the stack's expected configuration. citeturn0search0turn0search1

## Finding

A reused logical identity or a later import reference does not automatically inherit historical claims from an earlier incarnation. The provider's current identity fields establish the identity recognized by the current operation; they do not universally prove continuity with every prior resource state.

Anti-collapse:
- REUSED_LOGICAL_ID != SAME_HISTORICAL_RESOURCE
- IMPORTED_RESOURCE != PRIOR_INCARNATION_PROVEN
- CURRENT_PHYSICAL_ID != COMPLETE_PRIOR_LINEAGE
- CURRENT_DRIFT_RESULT != HISTORICAL_DRIFT_RESULT
- LATE_EVIDENCE != RETROACTIVE_IDENTITY_BINDING
- SAME_STACK_ID != SAME_RESOURCE_INCARNATION
- SAME_HUMAN_VISIBLE_NAME != SAME_RESOURCE

CloudFormation's use of PhysicalResourceIdContext is particularly relevant: AWS explicitly allows cases where logical and physical identifiers alone are insufficient to uniquely identify a resource. citeturn0search1

## Nexo implication

Delayed evidence must bind to the historical target through an explicit identity/lineage contract before it can update a historical claim. If the binding is absent, the later evidence can establish a current fact but should remain UNKNOWN or INCOMPARABLE with respect to the historical target.

Conceptual relation:
`late_evidence -> historical_claim` only when `target_identity + incarnation/lineage` are contractually bound.

Otherwise:
`late_evidence -> current_fact`
`historical_claim -> retained_prior_evidence | UNKNOWN`

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.016R: continue fresh evidence research on whether an imported/re-attached resource can preserve provider-side historical event identity, versus merely establishing a new current resource relationship.