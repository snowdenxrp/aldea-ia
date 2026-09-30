# AB105.067R — stack refactoring and closure of the generic physical-incarnation model

Date: 2026-09-30
Chain: AB105.066R -> AB105.067R

## Research question

Determine whether CloudFormation stack refactoring introduces another physical-incarnation edge, or whether it is purely a management-association transition that can be represented by the existing evidence taxonomy.

## Primary evidence

AWS documents Stack Refactoring as reorganizing existing resources while preserving their existing properties and data. Resources can move between stacks, and the refactor preview exposes MOVE actions with a PhysicalResourceId plus source/destination stack and logical-resource mappings. AWS explicitly states that stack refactoring is limited to reorganizing existing resources and cannot create or delete resources as part of the refactor. citeturn0search0turn0search10

AWS also documents that resources can be moved between stacks using import, with Retain used so the physical resource is preserved when removed from the source stack and imported into the destination stack. citeturn0search1

## Findings

### 1. Stack refactor MOVE is not a physical replacement

A MOVE action carries the physical resource identifier while changing source/destination management context.

Therefore:

SOURCE_STACK + SOURCE_LOGICAL_ID
-> MOVE
DEST_STACK + DEST_LOGICAL_ID
with the same PhysicalResourceId

is a management-association transition, not a new physical incarnation.

### 2. Logical-ID rename is also not physical replacement

AWS requires explicit source-to-destination logical ID mappings when logical IDs change during refactoring.

Therefore:

L_old -> L_new

does not imply:

P_old -> P_new.

The physical identifier remains the stronger physical-instance anchor.

### 3. Refactor preview is plan evidence, not execution proof

The StackRefactorAction describes what CloudFormation will do if the refactor is executed.

Therefore:

StackRefactorAction(MOVE)
!= completed MOVE.

Execution/result evidence remains necessary before reconstructing a completed management transition.

### 4. Refactor constraints strengthen the edge classification

AWS states that stack refactoring cannot create or delete resources or modify resource configuration as part of the refactor.

This makes the intended semantic of MOVE materially different from CREATE/DELETE/REPLACE.

However, an incomplete or failed refactor remains an operation outcome and must not be treated as successful movement without execution evidence.

### 5. Management graph now has an explicit MOVE edge

The evidence graph should distinguish:

PHYSICAL_CREATION
PHYSICAL_REPLACEMENT
PHYSICAL_DELETION
MANAGEMENT_ADOPTION
MANAGEMENT_RELEASE
MANAGEMENT_MOVE

A MOVE can be represented as:

P@Stack_A,L_A
--MANAGEMENT_MOVE-->
P@Stack_B,L_B

with the same physical identity where evidence confirms it.

### 6. Import and native refactor converge semantically

Import-based movement and native Stack Refactoring have different operational surfaces, but both can produce:

same physical resource
+
different CloudFormation management context.

Therefore the generic evidence model does not need a second physical-incarnation mechanism.

It needs a common management-transition abstraction with operation-specific evidence types.

### 7. The physical-incarnation model is now closed at the generic evidence-layer level

The research chain has covered:

- normal creation,
- replacement,
- rollback,
- DELETE_FAILED,
- DELETE_SKIPPED,
- Retain,
- UpdateReplacePolicy:Retain,
- missing PhysicalResourceId,
- current service-state reads,
- identifier namespace,
- identifier reuse boundary,
- import/adoption,
- stack-to-stack movement,
- native stack refactoring.

The remaining uncertainty is not a missing generic lifecycle edge. It is resource-type-specific identity semantics and evidence coverage.

Therefore the generic model can be marked:

PHYSICAL_INCARNA​TION_GENERIC_MODEL = CLOSED_WITH_BOUNDED_UNKNOWN

This does NOT mean every physical lifecycle claim is provable.

It means the generic edge taxonomy is sufficient and remaining UNKNOWN states are evidence/coverage-dependent rather than requiring another generic edge category.

### 8. Generic identity envelope

Final generic identity envelope:

ACCOUNT
REGION
RESOURCE_TYPE
SERVICE_PRIMARY_IDENTIFIER

CloudFormation management context:

STACK_ID
LOGICAL_RESOURCE_ID
OPERATION_ID
PHYSICAL_RESOURCE_ID

Temporal/evidence context:

OBSERVED_AT
EVIDENCE_SOURCE
COVERAGE_SCOPE
RETENTION_BOUNDARY
CORRELATION_CONFIDENCE

### 9. Generic edge taxonomy

Physical edges:
- PHYSICAL_CREATION
- PHYSICAL_REPLACEMENT
- PHYSICAL_DELETION

Management edges:
- MANAGEMENT_ADOPTION
- MANAGEMENT_RELEASE
- MANAGEMENT_MOVE

Observation edges:
- CURRENT_STATE_PRESENT
- CURRENT_STATE_NOT_FOUND
- DRIFT_OBSERVATION

These edge classes must not be collapsed.

## Closure matrix

| Event | Physical incarnation change? | Management association change? |
|---|---:|---:|
| CREATE | Yes | Yes |
| REPLACE | Yes | Yes |
| DELETE | Yes/end | Yes |
| Retain | No necessarily | Yes |
| DELETE_FAILED | Unknown | Attempted |
| IMPORT | No | Yes |
| STACK MOVE | No | Yes |
| Logical-ID rename | No | Yes |
| Current service read | No | No; observation only |
| Drift detection | No; observation only | No |

## Distilled rule

**Physical incarnation and CloudFormation management are now separate, complete generic dimensions.**

The generic evidence layer should not invent more lifecycle categories merely because a resource type has special semantics.

Resource-type adapters provide:
- primary identity,
- secondary identity,
- replacement behavior,
- reuse constraints,
- service-state mapping.

The evidence layer provides:
- scoped identity,
- typed edges,
- coverage,
- correlation,
- UNKNOWN preservation.

## Anti-collapse rules

- MOVE != REPLACE.
- IMPORT != CREATE.
- Logical-ID rename != physical replacement.
- Refactor preview != executed refactor.
- Retain != physical deletion.
- Management transition != incarnation transition.
- Same PhysicalResourceId across management contexts can represent the same physical instance.
- PhysicalResourceId alone does not establish historical continuity.
- Resource-type-specific identity semantics remain outside the generic evidence layer.
- UNKNOWN remains valid whenever execution, identity, coverage, or correlation evidence is incomplete.

## Status ledger

- Generic physical lifecycle edge taxonomy: CLOSED
- Generic identity envelope: CLOSED
- Management transition taxonomy: CLOSED
- Stack refactor MOVE semantics: FOUND
- Import/adoption semantics: CLOSED
- Physical incarnation vs management separation: CLOSED
- Resource-type-specific adapters: REQUIRED
- Historical continuity: CLAIM-SPECIFIC / BOUNDED
- Universal physical-state proof: NOT ESTABLISHED
- Reconstruction: BOUNDED / PER-CLAIM
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

AB55 remains only 64 states × 6 total orders = 384 per attack across 8 attacks; it did not establish full UsedAdmissionContext/EventDAG/FutureObs_PAA closure.

## Next exact direction

AB105.068R — perform a bounded adversarial counterexample pass against the now-closed generic physical-incarnation taxonomy: construct minimal cases where naive reconstruction would falsely infer CREATE, REPLACE, DELETE, CONTINUITY, or NONEXISTENCE, and verify that the contract yields UNKNOWN or the correct bounded edge. If no new generic edge is required, close this branch rather than extending it indefinitely.
