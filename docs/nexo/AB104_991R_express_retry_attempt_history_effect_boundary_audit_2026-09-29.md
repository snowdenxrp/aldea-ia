# AB104.991R — dependency retry preserves multiple provisioning attempts, so terminal success is not one-attempt history

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When Express Mode retries a dependent resource after a transient readiness failure, does its eventual success establish that the dependency was ready on the first attempt or that the first attempt had no external effect?

## Fresh evidence
AWS states that Express Mode confirms referenced-resource configuration before starting a dependent resource, but does not wait for full stabilization. If the dependent resource encounters a transient failure because the referenced resource is not yet ready, CloudFormation retries the dependent operation. AWS's resource-provider ProgressEvent model also explicitly represents handler attempts as PENDING, IN_PROGRESS, SUCCESS, or FAILED and allows re-invocation with CallbackContext to continue work. AWS's provisioning documentation further describes retrying failed resource provisioning after remediation.

## Findings
1. Express dependency ordering is not equivalent to dependency runtime readiness.
2. A dependent operation can have an initial failed/transient attempt followed by a later successful attempt under the same orchestration flow.
3. Later SUCCESS proves the later attempt reached its declared terminal boundary; it does not retroactively prove the first attempt had no effect or that the dependency was ready at the first attempt.
4. If an underlying API has side effects before reporting a transient failure, those effects require their own evidence and idempotency semantics; the CloudFormation retry record alone cannot erase that possibility.
5. CallbackContext/ProgressEvent continuity can preserve handler workflow state, but it is not a universal ledger of every side effect produced by each attempted downstream call.
6. Therefore retry history is part of causal/evidence provenance and must remain distinct from final orchestration status.
7. No new top-level interaction class is justified. The finding reinforces I3/I7/I15/I19/I21/I22 and classes 3, 6, 7, 11, 15, 16, 17, 19.

## Anti-collapse
LATER_SUCCESS != FIRST_ATTEMPT_NO_EFFECT
RETRY != PROOF_OF_IDEMPOTENT_ABSENCE
TRANSIENT_FAILURE != EFFECT_ABSENCE
DEPENDENCY_CONFIGURED != DEPENDENCY_READY
FINAL_STATUS != COMPLETE_ATTEMPT_HISTORY
CALLBACK_CONTEXT != SIDE_EFFECT_LEDGER
UNKNOWN != FAILED

## Classification
Primary: I3, I7, I15, I19, I21, I22.
Interactions: classes 3, 6, 7, 11, 15, 16, 17, 19.
Conditional: class 20 where an explicit atomic/idempotent boundary spans all attempts and downstream effects.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.991R establishes that Express Mode's automatic retry makes final success an insufficient summary of attempt history. A later SUCCESS closes the later declared boundary, not the causal uncertainty of earlier transient attempts. Nexo must preserve attempt identity/order, retry relations, side-effect evidence, and idempotency scope rather than collapsing them into the final status.
