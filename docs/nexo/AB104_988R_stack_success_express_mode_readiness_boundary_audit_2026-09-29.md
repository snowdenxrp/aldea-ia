# AB104.988R — stack success can precede resource operational readiness under express mode

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a CloudFormation stack operation report success before resources are fully operational, and what does that imply for the semantic boundary between orchestration completion and resource/effect completion?

## Fresh evidence
AWS currently documents CloudFormation express mode as completing stack operations as soon as CloudFormation applies the resource configuration, without waiting for resources to reach a fully stabilized state. AWS explicitly warns that resources might not be fully operational when the stack operation reports success, and gives examples including EC2 health checks and globally deployed CloudFront distributions. AWS also notes that downstream resources can fail when they depend on a previous resource being fully operational. Separately, the normal CONFIGURATION_COMPLETE documentation describes that event as occurring before CREATE_COMPLETE and warns that it may be unsuitable where thorough eventual-consistency checks are required for full operational readiness.

## Findings
1. CloudFormation has an explicit operational mode in which orchestration-level stack success can precede full resource operational readiness.
2. Therefore STACK_SUCCESS != ALL_RESOURCES_OPERATIONAL under express-mode semantics.
3. A stack-level terminal status and a resource-level terminal/readiness status are distinct evidence domains.
4. A downstream failure after stack success is not necessarily evidence that the earlier stack-success event was false; it can be consistent with the documented semantics when full stabilization was intentionally skipped.
5. This demonstrates that terminality is scope-dependent: operation terminality, configuration completion, desired-state stabilization, runtime readiness, and downstream usability are separate claims.
6. The exact deployment mode is therefore part of evidence provenance; a SUCCESS event without its mode/contract context is semantically incomplete for global readiness claims.
7. No new top-level interaction class is justified. The finding reinforces I7/I19/I21/I22 and classes 7, 11, 12, 17, 19; class 20 remains conditional.

## Anti-collapse
STACK_SUCCESS != ALL_RESOURCES_OPERATIONAL
ORCHESTRATION_TERMINALITY != RESOURCE_TERMINALITY
CONFIGURATION_APPLIED != FULL_STABILIZATION
STACK_SUCCESS != DOWNSTREAM_USABILITY
LATER_DOWNSTREAM_FAILURE != RETROACTIVE_STACK_FAILURE
STATUS_WITHOUT_MODE != COMPLETE_SEMANTIC_EVIDENCE
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 7, 11, 12, 17, 19.
Conditional: class 20 only where an explicitly declared deployment contract makes the stack and downstream effects one atomic boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.988R provides a concrete production-level counterexample to collapsing orchestration terminality into resource readiness: CloudFormation express mode intentionally allows stack operations to complete before resources are fully operational. Nexo must therefore bind terminal status to deployment mode, scope, and readiness contract, and must not infer downstream effect completion from an orchestration-level SUCCESS alone.
