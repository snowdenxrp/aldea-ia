# AB105.045R — CloudFormation Change Sets, ResourceChange, ChangeSource/CausingEntity audit

Date: 2026-09-30
Chain: AB105.044R -> AB105.045R

## Research question

Can Change Sets and ResourceChange/ChangeSource/CausingEntity provide a provider-native explanation of intended resource changes, and can that intention be distinguished from execution and later drift?

## Primary evidence

AWS documents that a Change Set is a preview of changes CloudFormation will make if the Change Set is executed. ResourceChange describes the action CloudFormation will perform if executed. ResourceChange includes Action, LogicalResourceId, PhysicalResourceId when known, Details, Replacement, and ResourceDriftStatus for drift-aware change sets.

For ResourceChangeDetail, ChangeSource identifies the source group of the change and CausingEntity identifies the entity that triggered it. Documented ChangeSource values include ResourceReference, ParameterReference, ResourceAttribute, DirectModification, Automatic, and NoModification.

AWS explicitly describes Change Sets as review/planning artifacts; execution is a separate decision/action.

## Findings

### 1. Change Set evidence is intent/planning evidence, not execution evidence

A Change Set describes what CloudFormation will do if executed. Therefore its ResourceChange is a planned transition.

CHANGESET_RESOURCECHANGE -> INTENDED_PLANNED_CHANGE

It must not be promoted to EXECUTED_RESOURCE_CHANGE without independent execution evidence such as StackEvents or resource-status evidence.

### 2. ChangeSource/CausingEntity provides causal explanation inside the planned graph

For a planned modification, ChangeSource identifies the source class and CausingEntity identifies the entity that triggered the planned change.

Examples include a changed parameter, a Ref to another resource, a GetAtt-derived value, direct template modification, or an automatic nested-stack effect.

This is useful causal structure for the PLAN graph.

It does not prove that the planned change was executed, that the physical resource actually changed as planned, or that the later real-world state was caused exclusively by that planned change.

### 3. Replacement prediction is also planning evidence

ResourceChange Replacement indicates whether execution is expected to recreate the resource. This can strengthen the predicted incarnation transition.

It remains a forecast until execution evidence confirms what actually happened.

Therefore:

planned Replacement=True
!=
observed old/new physical-resource incarnation transition.

### 4. Drift-aware ResourceChangeStatus adds state context but not causality

AWS documents ResourceDriftStatus values such as IN_SYNC, MODIFIED, DELETED, UNKNOWN and UNSUPPORTED for drift-aware change sets.

This can place a resource's known drift state into the Change Set view.

It does not convert the Change Set into a historical operation ledger.

### 5. ChangeSource/CausingEntity must remain separate from CloudTrail identity

ChangeSource/CausingEntity explain the origin of a planned template change.

They are not CloudTrail eventID/requestID, not StackEvent EventId, and not OperationId by definition.

A concrete record can be cross-bound to an operation using additional evidence, but no universal identifier equivalence is established.

### 6. Nested-stack Automatic is especially important

AWS documents Automatic as a ChangeSource for AWS::CloudFormation::Stack resources when a nested stack's template may have changed even though the parent stack resource itself was not directly modified.

Therefore a planned nested-stack change can have an indirect source relationship.

This reinforces the need to preserve causal edges rather than flattening all changes into one direct actor/action.

### 7. Correct three-layer model

PLAN:
ChangeSet -> ResourceChange -> ChangeSource/CausingEntity -> predicted Action/Replacement

EXECUTION:
CloudFormation operation -> ClientRequestToken/OperationId -> StackEvents/Resource Status Change -> observed resource state

OBSERVATION:
DetectStackDrift -> StackDriftDetectionId -> Drift Status Change -> observed drift

A valid reconstruction may join these layers, but each join requires identity, semantic, temporal and coverage evidence.

## Distilled rule

ChangeSet + ResourceChange + ChangeSource/CausingEntity -> BOUNDED_INTENDED_CHANGE

+ independent execution evidence -> BOUNDED_EXECUTED_CHANGE

+ exact resource identity/incarnation + state evidence -> BOUNDED_OBSERVED_TRANSITION

+ independent DriftDetectionId/result + coverage -> BOUNDED_DRIFT_RECONSTRUCTION

No ChangeSet alone proves execution or causality.

## Anti-collapse rules

- ChangeSet != executed operation.
- ResourceChange != observed transition.
- ChangeSource != actor identity.
- CausingEntity != CloudTrail requestID/eventID.
- Replacement prediction != observed replacement.
- ResourceDriftStatus in a change set != drift detection operation.
- Planned causality != executed causality.
- ChangeSet existence != execution.
- ChangeSet absence != no historical change.
- Current drift state != proof that a planned change caused it.
- Nested-stack Automatic != direct modification.
- Timestamp proximity != execution binding.

## Status ledger

- ChangeSet as preview/planning artifact: FOUND
- ResourceChange planned Action: FOUND
- ChangeSource taxonomy: FOUND
- CausingEntity semantics: FOUND
- Planned replacement semantics: FOUND
- Drift-aware ResourceDriftStatus: FOUND
- Planned-to-executed bridge: REQUIRES INDEPENDENT EXECUTION EVIDENCE
- Universal ChangeSource-to-actor theorem: REJECTED
- Universal ChangeSet-to-execution theorem: REJECTED
- Drift-to-change-set causal closure: NOT ESTABLISHED
- Acquisition boundary: NOT CLOSED
- Reconstruction: BOUNDED / PER-CLAIM
- W19/W20: NOT FROZEN
- Coverage denominator: NOT FROZEN
- Formal verification: NOT PERFORMED
- Implementation: NOT STARTED
- Semantic/architecture freeze: NOT DECLARED

## Historical carry-forward — MUST NOT COLLAPSE

AB50–AB58 unresolved state remains unchanged:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

AB55 scope remains only 64 states × 6 total orders = 384 per attack across 8 attacks; it did not establish full UsedAdmissionContext/EventDAG/FutureObs_PAA closure.

## Next exact direction

AB105.046R — investigate Change Set execution identity and the boundary between CreateChangeSet/ExecuteChangeSet, including whether CloudTrail and CloudFormation operation identifiers can bind the planned ResourceChange to the actual execution without conflating plan and execution.
