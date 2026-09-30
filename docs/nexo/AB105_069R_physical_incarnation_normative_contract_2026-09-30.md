# AB105.069R — normative contract for closed physical-incarnation evidence branch

Date: 2026-09-30
Chain: AB105.068R -> AB105.069R

## Purpose

Distill the generic physical-incarnation branch into a compact contract. This is a closure artifact, not a new implementation.

## Primary evidence boundary

AWS documents replacement as recreation with a new physical ID, normally creating the replacement before deleting the old resource. UpdateReplacePolicy can retain or back up the old physical instance. citeturn0search5turn0search11

AWS documents import as bringing an existing resource under CloudFormation management without deleting and recreating it. citeturn0search2turn0search6

AWS stack refactoring preserves existing resource properties/data and explicitly separates planning/preview from execution. MOVE actions carry the physical resource identifier and source/destination mapping. citeturn0search4turn0search9

## Normative identity envelope

Required generic scope:

ACCOUNT
REGION
RESOURCE_TYPE
SERVICE_PRIMARY_IDENTIFIER

Optional CloudFormation management context:

STACK_ID
LOGICAL_RESOURCE_ID
OPERATION_ID
PHYSICAL_RESOURCE_ID

Evidence context:

OBSERVED_AT
EVIDENCE_SOURCE
COVERAGE_SCOPE
RETENTION_BOUNDARY
CORRELATION_CONFIDENCE

No field may silently substitute for another.

## Edge contract

### Physical edges

PHYSICAL_CREATION
PHYSICAL_REPLACEMENT
PHYSICAL_DELETION

These require lifecycle evidence sufficient to bind the physical identity transition.

### Management edges

MANAGEMENT_ADOPTION
MANAGEMENT_RELEASE
MANAGEMENT_MOVE

These change CloudFormation management context without automatically implying a physical incarnation transition.

### Observation edges

CURRENT_STATE_PRESENT
CURRENT_STATE_NOT_FOUND
DRIFT_OBSERVATION

Observations do not become historical lifecycle edges merely because they are timestamped.

## Decision rules

1. IMPORT -> MANAGEMENT_ADOPTION, not PHYSICAL_CREATION. citeturn0search2
2. MOVE/refactor -> MANAGEMENT_MOVE, not PHYSICAL_REPLACEMENT. citeturn0search4turn0search9
3. Retain -> management/scope transition; never infer physical deletion from management deletion. citeturn0search11
4. Replacement requires replacement semantics plus evidence binding old/new physical identities to the operation.
5. Same identifier at two times proves two observations, not uninterrupted continuity.
6. Different identifiers alone do not prove replacement.
7. Current NOT_FOUND proves only a bounded current observation.
8. Missing physical identity yields UNKNOWN for physical-incarnation claims.
9. Preview/plan evidence yields PLAN_ONLY until execution evidence exists. citeturn0search4turn0search9
10. Correlation gaps yield UNKNOWN rather than inferred joins.

## Claim states

PROVEN_WITHIN_SCOPE
BOUNDED_OBSERVATION
PLAN_ONLY
PARTIAL
UNKNOWN

No negative historical claim may be emitted merely because a query returned no record.

## Anti-collapse invariants

IMPORT != CREATE
MOVE != REPLACE
RETAIN != DELETE
PLAN != EXECUTION
OBSERVATION != CONTINUITY
CURRENT_ABSENCE != HISTORICAL_DELETION
IDENTIFIER_EQUALITY != CONTINUOUS_EXISTENCE
IDENTIFIER_INEQUALITY != REPLACEMENT
MANAGEMENT_IDENTITY != PHYSICAL_IDENTITY
OPERATION_ID != PHYSICAL_INCARNATION

## Type-specific boundary

The generic layer does not decide:
- which service identifier is authoritative;
- whether an identifier can be reused;
- exact replacement semantics for a resource type;
- how CloudFormation PhysicalResourceId maps to the service primary identifier.

Those belong in a type-specific adapter backed by provider documentation.

## Closure

PHYSICAL_INCAR​NATION_GENERIC_CONTRACT = CLOSED

The contract is sufficient for the AB105.068R adversarial set. No new generic edge is introduced here.

This closure does NOT establish:
- formal verification;
- implementation correctness;
- universal historical completeness;
- proof of physical state for every resource type;
- elimination of UNKNOWN.

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

AB55 remains 64 states × 6 total orders = 384 per attack across 8 attacks; it did not establish full UsedAdmissionContext/EventDAG/FutureObs_PAA closure.

## Next exact direction

AB105.070R — perform a final scope/coverage audit of the closed branch: identify which claims still require type-specific adapters or external service evidence, then close this AWS physical-incarnation branch unless a concrete uncovered evidence edge remains.
