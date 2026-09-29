# AB104.989R — express-mode completion preserves background readiness work

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When CloudFormation Express mode reports a stack operation complete, does the operation's terminal status imply that resource readiness work has ended, or can readiness continue after terminality?

## Fresh evidence
Current AWS CLI documentation states that STANDARD waits for resources to be ready to serve traffic before completing the stack operation, while EXPRESS completes when resource configuration is applied and resources continue becoming ready in the background. AWS troubleshooting documentation gives concrete consequences: resources may still be initializing or propagating changes after success, and delete operations may still be in progress. AWS also documents that dependent resources can fail because express mode does not wait for stabilization.

## Findings
1. Express-mode terminality explicitly permits resource-readiness work to continue after the stack operation reports completion.
2. Therefore operation terminality and resource-effect terminality are distinct temporal boundaries, not merely different labels for the same state.
3. A post-success readiness transition is not a contradiction of the earlier SUCCESS; it is permitted by the deployment contract.
4. A post-success failure of readiness likewise does not automatically invalidate the historical fact that the stack operation reached its express-mode terminal boundary.
5. Delete operations make the distinction especially concrete: CloudFormation can report completion while resources are still being fully removed.
6. Consequently, Nexo must represent background continuation after terminality explicitly rather than assuming TERMINAL means QUIESCENT.
7. The finding reinforces I7/I19/I21/I22 and classes 6, 7, 11, 12, 17, 19. No new top-level interaction class is justified.

## Anti-collapse
TERMINAL != QUIESCENT
STACK_SUCCESS != READINESS_COMPLETE
EXPRESS_SUCCESS != NO_BACKGROUND_WORK
POST_SUCCESS_FAILURE != RETROACTIVE_REQUEST_FAILURE
DELETE_SUCCESS != RESOURCE_PHYSICALLY_GONE
OPERATION_TERMINALITY != EFFECT_TERMINALITY
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 6, 7, 11, 12, 17, 19.
Conditional: class 20 only where an explicit contract makes terminality and external-effect completion one atomic boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.989R establishes a strong temporal distinction: under CloudFormation Express mode, terminal stack status can coexist with continuing background resource readiness or deletion. Nexo must therefore not equate TERMINAL with QUIESCENT or COMPLETED_WITH_NO_FURTHER_EFFECTS. Terminal status must carry the deployment mode and the precise effect/readiness boundary it actually closes.
