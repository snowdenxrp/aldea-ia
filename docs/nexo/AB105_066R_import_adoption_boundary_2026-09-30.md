# AB105.066R — import/adoption boundary: existing resource != created by current stack

Date: 2026-09-30
Chain: AB105.065R -> AB105.066R

## Research question

Determine whether CloudFormation import/adoption creates a distinct identity/incarnation boundary and whether LogicalResourceId + PhysicalResourceId can prove that the current stack created the physical resource.

## Primary evidence

AWS documents that CloudFormation resource import brings existing AWS resources into a new or existing stack without requiring deletion and recreation. The import request supplies a LogicalResourceId, ResourceType, and a resource identifier that maps the logical resource to the already-existing physical resource. citeturn0search0turn0search5

AWS states that import does not allow new resource creation, deletion, or property configuration changes as part of the import operation. Successful import reaches IMPORT_COMPLETE. AWS recommends drift detection afterward because the template does not automatically establish that the existing configuration matches the template. citeturn0search0turn0search1

AWS also supports automatic import of existing named resources when the resource has the required identifier and is not already managed by another stack. citeturn0search6

## Findings

### 1. Import proves adoption, not creation

For an imported resource:

physical resource P existed before the import operation.

The import maps:

LogicalResourceId L
+
ResourceType R
+
ResourceIdentifier I
-> existing physical resource P

Therefore:

IMPORT_COMPLETE
!= CREATED_BY_CURRENT_STACK

This is a distinct provenance state.

### 2. LogicalResourceId begins at stack-management scope

The logical ID belongs to the CloudFormation template/stack representation.

An imported physical resource can therefore acquire a new logical-management identity without acquiring a new physical incarnation.

Model:

P_existing
   |
   | import/adoption
   v
L@Stack_new -> P_existing

No physical replacement is implied.

### 3. PhysicalResourceId can predate the stack

Because import explicitly targets an existing resource, the physical identifier can have a lifecycle beginning before the current stack's management interval.

Thus:

PhysicalResourceId observed at IMPORT
!= creation timestamp of current stack resource.

The architecture must store separate timestamps/epochs:

PHYSICAL_EXISTENCE_EPOCH
CF_MANAGEMENT_EPOCH
CURRENT_STACK_EPOCH

when evidence supports them.

### 4. Import creates a management boundary

The import event establishes:

CF_MANAGED_FROM = IMPORT_OPERATION

It does not establish:

PHYSICAL_CREATED_AT = IMPORT_OPERATION.

### 5. Import identifier is an identity edge, not a creation edge

AWS requires a resource identifier such as BucketName for S3 or another type-specific identifier. That identifier is sufficient for mapping the template logical resource to the existing resource for import, but it does not establish when the physical object was created. citeturn0search3turn0search5

Therefore:

IMPORT_IDENTIFIER_MATCH
-> identity/adoption edge

not:

IMPORT_IDENTIFIER_MATCH
-> creation provenance.

### 6. Import rollback does not imply physical deletion

AWS documents import rollback states. Because import does not perform new resource creation/deletion as part of the import operation, rollback must not be modeled as proof that the adopted physical resource never existed.

A failed/rolled-back import can leave the underlying pre-existing resource outside the target stack's management scope.

Therefore:

IMPORT_ROLLBACK
-> management-operation outcome

not:

PHYSICAL_NONEXISTENCE.

### 7. Moving a resource between stacks is another management boundary

AWS explicitly supports importing resources from one stack into another. This demonstrates that a physical resource can change CloudFormation management context without changing physical identity. citeturn0search12

Therefore:

P@Stack_A
--adoption/import-->
P@Stack_B

does not imply:

P_old -> P_new.

It is a management-edge transition.

### 8. Import must be represented as a different edge type

The evidence graph needs at least:

CREATION_EDGE
REPLACEMENT_EDGE
MANAGEMENT_ADOPTION_EDGE
MANAGEMENT_RELEASE_EDGE
PHYSICAL_DELETION_EDGE

Import belongs to MANAGEMENT_ADOPTION_EDGE.

It must never be normalized into CREATION_EDGE.

### 9. LogicalResourceId + PhysicalResourceId ambiguity is resolved

A pair:

StackId + LogicalResourceId + PhysicalResourceId

can establish a bounded management association.

It cannot by itself establish physical creation provenance.

For creation provenance, require a separate creation/lifecycle evidence edge from the underlying service or a CloudFormation creation event that predates adoption.

### 10. Import + current service state

The strongest bounded statement after import is:

EXISTED_BEFORE_IMPORT
+
ADOPTED_BY_STACK_AT_T
+
CURRENTLY_PRESENT_AT_T2

provided the import identity and current service identity are correctly bridged.

It remains invalid to infer continuous physical existence between those points without an interval-covering ledger.

## Provenance matrix

| Observation | What it proves | What it does NOT prove |
|---|---|---|
| IMPORT_IN_PROGRESS | adoption operation started | physical creation |
| IMPORT_COMPLETE | resource successfully adopted into stack | resource was created by stack |
| LogicalResourceId + PhysicalResourceId | management association | physical creation provenance |
| Import identifier match | target identity mapping | creation time |
| Imported resource + current service read | current physical presence | uninterrupted existence |
| Import rollback | import management path rolled back | physical deletion/nonexistence |
| Resource imported from another stack | management transfer | new physical incarnation |

## Distilled rule

Creation provenance and management provenance are separate dimensions.

The physical resource may predate CloudFormation management by an unknown or externally evidenced interval.

Therefore the identity graph must distinguish:

PHYSICAL_INCARNATION
from
CF_MANAGEMENT_ASSOCIATION.

Import is a management-adoption edge, never a creation edge.

## Anti-collapse rules

- IMPORT_COMPLETE != CREATED.
- Import identifier != creation evidence.
- LogicalResourceId != physical creation identity.
- PhysicalResourceId != current-stack creation timestamp.
- Import rollback != physical deletion.
- Stack-to-stack import != replacement.
- Management association != physical incarnation.
- Current presence after import != continuous existence since import.
- Never infer creation provenance from CloudFormation ownership alone.

## Status ledger

- Existing-resource import semantics: FOUND
- Import identifier mapping: FOUND
- Import as management boundary: ESTABLISHED
- Creation vs management provenance separation: ESTABLISHED
- Stack-to-stack management transition: FOUND
- Generic identity contract: PRESERVED
- Physical creation provenance from import alone: NOT ESTABLISHED
- Import rollback -> physical deletion: NOT ESTABLISHED
- Physical lifecycle model: CLOSED for import/adoption distinction
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

AB105.067R — investigate CloudFormation stack refactoring / resource movement to determine whether management-association transitions beyond import need the same edge taxonomy, and whether the physical-incarnation model can now be considered closed at the generic evidence-layer level.
