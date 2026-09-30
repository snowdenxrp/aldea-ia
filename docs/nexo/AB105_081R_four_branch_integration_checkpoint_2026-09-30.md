# AB105.081R — four-branch Claim/Decision/Evidence integration checkpoint

Date: 2026-09-30
Chain: AB105.080R -> AB105.081R

## Objective
Perform the final small integration check across physical lifecycle, configuration/drift, causal provenance, and authorization, then decide whether the AWS evidence campaign has a generic unresolved dependency.

## Fresh primary evidence
AWS CloudFormation explicitly separates drift-detection operation identity (StackDriftDetectionId), detection status, and the resulting configuration observation. A completed detection covers supported resources; filtered detections cover only the supplied logical-resource scope; unsupported resources remain unchecked. AWS also warns that drift results can have edge cases and that detection can be long-running. [AWS DetectStackDrift / DescribeStackDriftDetectionStatus] citeturn0search3turn0search9turn0search4
AWS StackSet drift detection similarly has a distinct OperationId for the long-running detection operation, reinforcing that operation identity and configuration observation are separate evidence objects. citeturn0search5turn0search11

## Integrated graph
CLAIM
  -> DECISION
  -> AUTHORIZATION_EVALUATION
  -> OPERATION
  -> EFFECT_EVIDENCE
  -> CONFIGURATION_OBSERVATION
  -> CAUSAL_PROVENANCE

These are related evidence nodes, not interchangeable states.

## Identity separation
PHYSICAL_IDENTITY identifies a physical resource/incarnation only when the relevant provider evidence establishes it.
CONFIGURATION_OBSERVATION_ID identifies an observation/detection, not a physical incarnation.
CAUSAL_EVENT_ID identifies provenance evidence, not a physical effect.
AUTHORIZATION_DECISION_ID identifies an authority decision, not execution.
OPERATION_ID identifies an operation boundary, not automatically every physical/configuration consequence.

## Cross-branch edge rules
1. AUTHORIZATION_DECISION -> OPERATION_START is valid only when the authorization contract covers the request context.
2. OPERATION -> PHYSICAL_EFFECT requires lifecycle evidence; authorization alone cannot create it.
3. OPERATION -> CONFIGURATION_EFFECT requires an explicit configuration observation/correlation; drift alone cannot create an operation edge.
4. ACTOR/API_PROVENANCE -> OPERATION requires an explicit provider correlation; temporal proximity is insufficient.
5. CONFIGURATION_OBSERVATION -> CAUSE is not automatic.
6. PHYSICAL_EFFECT -> CAUSE is not automatic.
7. EFFECT_OBSERVED -> AUTHORIZATION_PROVEN is not automatic.
8. AUTHORIZATION_PROVEN -> EFFECT_OBSERVED is not automatic.
9. Missing cross-branch correlation remains UNKNOWN.
10. Coverage scope and retention remain part of every negative claim.

## State separation
Each branch retains its own evidence state:
- AUTHORIZATION: ALLOW / EXPLICIT_DENY / IMPLICIT_DENY / UNKNOWN / STALE / REVOKED
- OPERATION: AUTHORIZED_TO_START / STARTED / IN_FLIGHT / STOP_REQUESTED / REVOCATION_OBSERVED / STOPPING_OR_ROLLING_BACK / COMPLETED / FAILED / CANCELLED / UNKNOWN
- PHYSICAL: CREATION / REPLACEMENT / DELETION / UNKNOWN
- CONFIGURATION: MATCH / DIFFERENCE / DELETION_OBSERVED / NOT_OBSERVED / PARTIAL / UNKNOWN
- CAUSAL: PROVEN_WITHIN_SCOPE / BOUNDED_OBSERVATION / PARTIAL / UNKNOWN

No state from one branch is allowed to overwrite or upgrade a state in another branch.

## Adversarial integration results
Scenario A: authorized operation succeeds but no physical evidence -> AUTHORIZATION_PROVEN + EFFECT_UNKNOWN.
Scenario B: physical effect observed but authorization evidence missing -> EFFECT_PROVEN + AUTHORIZATION_UNKNOWN.
Scenario C: actor/API request observed but operation correlation missing -> ACTOR_PROVEN + OPERATION_CAUSALITY_UNKNOWN.
Scenario D: drift observed after an operation -> CONFIGURATION_DIFFERENCE does not establish that operation as cause.
Scenario E: operation cancelled after partial mutation -> CANCELLED + prior EFFECTS preserved; reconciliation required.
Scenario F: STOP/revocation during execution -> authority state and operation/effect history remain separate.
Scenario G: drift detection complete but filtered/unsupported scope -> bounded configuration result, not universal configuration proof.
Scenario H: current service state present/absent -> current observation, not historical continuity.
Scenario I: all four branches have incomplete correlation -> final graph remains usable with explicit UNKNOWN edges.

## Result
No contradiction found.
No missing generic identity edge found.
No missing generic state-separation invariant found.
No previously closed branch needs reopening.

## Campaign closure
AWS evidence campaign AB105 generic branch set = CLOSED_WITH_BOUNDED_UNKNOWN.

Closed branches:
- PHYSICAL_INCARNATION_GENERIC_BRANCH
- CONFIGURATION_DRIFT_GENERIC_BRANCH
- CAUSAL_ATTRIBUTION_GENERIC_BRANCH
- AUTHORIZATION_EFFECTIVE_PERMISSION_GENERIC_BRANCH
- AUTHORIZATION_FRESHNESS_REVOCATION
- IN_FLIGHT_AUTHORIZATION

Bounded UNKNOWN remains by design where provider-specific correlation, coverage, retention, enforcement, or resource-type semantics are absent.

## Important boundary
This closes the generic evidence-model investigation, not implementation or formal verification.
No implementation claim is made.
No historical AB50–AB58 unresolved item is altered.

## Next exact direction
Return to Nexo core evidence dependencies. Do not continue AWS lifecycle expansion unless a concrete Nexo requirement or primary-source contradiction requires it.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.