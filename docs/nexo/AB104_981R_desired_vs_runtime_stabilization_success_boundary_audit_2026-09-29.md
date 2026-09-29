# AB104.981R — desired-state SUCCESS does not universally imply runtime-state stabilization

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a CloudFormation/Cloud Control resource handler returns SUCCESS after reaching desired state, does that terminal status necessarily prove runtime-state stabilization or completion of every downstream consumer/effect?

## Fresh evidence
AWS resource-type handler contract states that create/update handlers MUST NOT return SUCCESS until all requested properties have been applied and desired-state stabilization has been reached. AWS separately states that runtime-state stabilization is optional but encouraged, and describes it as resource-dependent: additional mutating calls may still be made, dependent resources may need the resource to reach a particular state, and users may require a particular runtime status before use. AWS also documents progress chaining in which a handler can make downstream service calls, stabilize, then continue to later calls before finally returning success.

## Findings
1. SUCCESS has a mandatory lower semantic boundary: requested desired-state properties must have been applied and desired-state stabilization reached for create/update handlers.
2. AWS explicitly distinguishes desired-state stabilization from runtime-state stabilization.
3. Runtime-state stabilization is optional at the handler-contract level, so SUCCESS does not universally mean that every runtime readiness condition or downstream consumer condition has been established.
4. Therefore SUCCESS != UNIVERSAL_RUNTIME_READY and SUCCESS != ALL_DOWNSTREAM_CONSUMERS_READY.
5. A resource-specific handler may voluntarily include runtime stabilization before returning SUCCESS; if its contract/evidence explicitly binds that stabilization to a downstream condition, that relation can be recorded as scoped evidence.
6. A later downstream effect or consumer transition can remain a separate evidence domain even after Cloud Control SUCCESS, unless the resource contract explicitly closes that boundary.
7. This is stronger and more precise than treating SUCCESS as merely request accepted: it proves a defined desired-state boundary, but the boundary is not global.
8. No new top-level interaction class is justified.

## Anti-collapse
SUCCESS != UNIVERSAL_RUNTIME_READY
DESIRED_STATE_REACHED != ALL_RUNTIME_CONDITIONS
SUCCESS != ALL_DOWNSTREAM_CONSUMERS_READY
HANDLER_TERMINALITY != GLOBAL_EFFECT_TERMINALITY
RUNTIME_STABILIZATION_OPTIONAL != RUNTIME_EFFECT_ABSENT
RESOURCE_CONTRACT_SUCCESS != GLOBAL_SUCCESS
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: classes 11, 12, 17, 19.
Conditional: class 20 only where an explicitly declared atomic boundary crosses the handler/resource boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.981R establishes a sharper semantic boundary: Cloud Control/CloudFormation SUCCESS for create/update proves the handler has reached the required desired state, but AWS separately treats runtime-state stabilization as optional. Therefore SUCCESS cannot be promoted to a universal claim that all runtime, consumer, or downstream effects are complete. Nexo should bind terminal-status evidence to the exact contract boundary that produced it and preserve UNKNOWN outside that boundary.
