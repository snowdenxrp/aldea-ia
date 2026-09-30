# AB105.068R — adversarial counterexample pass for generic physical-incarnation taxonomy

Date: 2026-09-30
Chain: AB105.067R -> AB105.068R

## Objective

Attack the now-closed generic model with minimal counterexamples that could cause false CREATE, REPLACE, DELETE, CONTINUITY, or NONEXISTENCE conclusions.

## Primary evidence

AWS StackEvents expose LogicalResourceId, PhysicalResourceId, ResourceType, timestamps and statuses including CREATE, DELETE, IMPORT and rollback states. citeturn0search9

AWS distinguishes replacement from ordinary updates: replacement recreates a resource and generates a new physical ID. citeturn0search12

AWS StackRefactorAction exposes MOVE with PhysicalResourceId and source/destination mappings, while stack refactoring is limited to reorganizing existing resources and cannot create or delete resources as part of the refactor. citeturn0search1turn0search3

AWS documents Retain as removing a resource from CloudFormation scope while allowing the physical resource to continue existing. citeturn0search2turn0search11

## Counterexample set

### C1 — IMPORT mistaken for CREATE

Evidence:
IMPORT_COMPLETE + LogicalResourceId + PhysicalResourceId.

Naive claim:
"Current stack created the physical resource."

Correct result:
BOUNDED MANAGEMENT_ADOPTION.

Import targets an already-existing resource; IMPORT_COMPLETE is not creation evidence. citeturn0search15

### C2 — MOVE mistaken for REPLACE

Evidence:
StackRefactorAction = MOVE, same PhysicalResourceId, source and destination logical mappings.

Naive claim:
"Resource was replaced."

Correct result:
BOUNDED MANAGEMENT_MOVE.

Stack refactoring reorganizes existing resources and MOVE carries the physical identifier. citeturn0search1turn0search3

### C3 — Retain mistaken for DELETE

Evidence:
DELETE_COMPLETE with Retain/retention semantics.

Naive claim:
"Physical resource no longer exists."

Correct result:
CLOUD_FORMATION_SCOPE_ENDED + PHYSICAL_STATE_UNKNOWN/PRESENT_IF_SERVICE_EVIDENCE.

Retained resources can continue to exist after stack deletion. citeturn0search2

### C4 — DELETE_FAILED mistaken for existence or deletion

Evidence:
DELETE_FAILED.

Naive claim:
"Resource definitely still exists" or "resource definitely disappeared."

Correct result:
BOUNDED DELETE_ATTEMPT_FAILED; physical final state UNKNOWN until stronger service evidence.

### C5 — Same PhysicalResourceId mistaken for uninterrupted continuity

Evidence:
P observed at T1 and P observed at T2.

Naive claim:
"P existed continuously between T1 and T2."

Correct result:
P OBSERVED_AT_T1 + P OBSERVED_AT_T2; continuity UNKNOWN without interval coverage.

### C6 — Different IDs mistaken for replacement

Evidence:
P_old and P_new are different.

Naive claim:
"Replacement definitely occurred."

Correct result:
UNKNOWN unless replacement semantics and operation/lifecycle evidence bind the observations.

### C7 — Missing PhysicalResourceId mistaken for no physical resource

Evidence:
StackEvent without PhysicalResourceId.

Naive claim:
"No physical resource exists."

Correct result:
UNKNOWN_PHYSICAL_ID.

StackEvent makes PhysicalResourceId optional. citeturn0search9

### C8 — Current service NOT_FOUND mistaken for historical deletion

Evidence:
Current underlying-service read cannot find P.

Naive claim:
"P was deleted by CloudFormation."

Correct result:
BOUNDED_CURRENT_NOT_FOUND.

Historical deletion cause/time remains UNKNOWN without a deletion evidence chain.

### C9 — Import rollback mistaken for physical deletion

Evidence:
IMPORT_ROLLBACK_COMPLETE.

Naive claim:
"Imported physical resource was deleted."

Correct result:
MANAGEMENT_IMPORT_ROLLBACK; physical deletion not established.

AWS import status describes rollback as reverting the import/template configuration. citeturn0search15

### C10 — Retained replacement mistaken for single incarnation

Evidence:
Replacement + UpdateReplacePolicy:Retain.

Naive claim:
"P_old ceased to exist when P_new appeared."

Correct result:
P_old may remain outside CloudFormation scope while P_new becomes the managed replacement. citeturn0search11

### C11 — Refactor preview mistaken for executed movement

Evidence:
StackRefactorAction MOVE in preview.

Naive claim:
"Resource has already moved."

Correct result:
PLAN_ONLY until execution/result evidence.

AWS describes StackRefactorAction as what CloudFormation will perform if executed. citeturn0search3

### C12 — Logical ID change mistaken for physical replacement

Evidence:
L_old -> L_new with same physical identity in refactor.

Naive claim:
"New physical incarnation."

Correct result:
MANAGEMENT_MOVE/LOGICAL_REMAP.

## Adversarial result

All twelve counterexamples are handled by the existing taxonomy.

No new generic physical-incarnation edge is required.

The failures arise when one of four dimensions is collapsed:

1. physical incarnation,
2. management association,
3. observation,
4. execution/provenance.

Therefore the branch does not require another generic lifecycle category.

## Closure decision

PHYSICAL_INCARNA​TION_GENERIC_MODEL = CLOSED

with explicit epistemic boundary:

CLOSED != ALL CLAIMS PROVABLE

It means the generic model has enough edge classes to represent the adversarial cases tested.

Remaining UNKNOWN states are expected when identity is incomplete, execution is only planned, retention changes management scope, physical state is unavailable, historical coverage has gaps, or correlation edges are missing.

## Minimal invariant set

1. Every physical claim is scoped by account, region and resource type.
2. Physical identity and management identity are separate.
3. Plan evidence is not execution evidence.
4. Observation is not historical continuity.
5. Current absence is not historical deletion.
6. Retention is not deletion.
7. Import is not creation.
8. Move is not replacement.
9. Different identifiers do not alone prove replacement.
10. Missing identity yields UNKNOWN.
11. Missing correlation yields UNKNOWN.
12. Resource-type semantics come from the adapter, not the generic evidence layer.

## Status ledger

- Adversarial CREATE false-positive test: PASSED
- Adversarial REPLACE false-positive test: PASSED
- Adversarial DELETE false-positive test: PASSED
- Adversarial CONTINUITY false-positive test: PASSED
- Adversarial NONEXISTENCE false-positive test: PASSED
- Generic edge taxonomy: CLOSED
- Generic identity envelope: CLOSED
- Generic physical-incarnation model: CLOSED WITH EXPLICIT UNKNOWN BOUNDARIES
- Resource-type adapters: REQUIRED
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

AB105.069R — distill the closed physical-incarnation branch into a compact normative contract: identity envelope, edge types, evidence requirements, UNKNOWN transitions, and anti-collapse invariants. Then stop expanding this branch unless a new primary-source counterexample invalidates the contract.
