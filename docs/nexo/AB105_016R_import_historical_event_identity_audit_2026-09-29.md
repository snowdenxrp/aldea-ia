# AB105.016R — Imported resource historical event identity audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS documents that after an import completes, it recommends running drift detection to establish whether the imported resource matches the template. Import completion is a new operation state (`IMPORT_COMPLETE`), while drift detection is a separate observation operation. AWS also documents that resolving drift by import can remove a retained resource from the stack without deleting it and then import the existing resource back. citeturn0search0turn0search1turn0search3

## Finding

Import/re-attachment establishes a new management relationship and a new operation history; it does not, by itself, merge the imported resource's prior provider events into the current stack's historical event graph.

Anti-collapse:
- IMPORT_COMPLETE != HISTORICAL_EVENT_CONTINUITY
- IMPORT_OPERATION_ID != PRIOR_OPERATION_ID
- REATTACHMENT != HISTORY_MERGE
- CURRENT_DRIFT_RESULT != PRE_IMPORT_HISTORY
- IMPORT_REFERENCE != PRIOR_STACK_EVENT_ID
- RETAINED_PHYSICAL_RESOURCE != RETAINED_MANAGEMENT_LINEAGE
- POST_IMPORT_IN_SYNC != PRE_IMPORT_CONFORMANCE

The resource can survive removal from the stack while its CloudFormation management relationship changes. Therefore physical continuity and management-lineage continuity are separate facts. A later drift result can establish current conformance against the post-import expectation, but does not automatically prove the complete pre-import history.

## Nexo implication

An import/reattachment event should be represented as a typed lineage transition rather than a transparent continuation. The Evidence Dependency Graph should preserve the boundary between:

1. pre-detachment resource/effect history,
2. detachment/retention event,
3. import/reattachment operation, and
4. post-import observations.

Conceptual relation:
`physical_continuity != management_continuity != operation_continuity`

A historical claim may cross the boundary only when an explicit provider contract binds the old and new identities/lineage. Otherwise the relation remains UNKNOWN or explicitly INCOMPARABLE.

This reinforces I18/I19/I21/I22 and classes 7, 12, 17, 18, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.017R: investigate whether provider event logs/events attached to the import can establish a complete causal bridge to pre-import operations, or whether they remain separate operation evidence.