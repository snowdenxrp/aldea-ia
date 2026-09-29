# AB104.991R — retry of a dependent resource is a new execution attempt, not proof of prior readiness

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When Express Mode starts a dependent resource after configuration is applied and that dependent operation encounters a transient readiness failure, does a later retry establish that the dependency was ready at the original attempt?

## Fresh evidence
AWS documents that Express Mode starts dependent work once the referenced resource's configuration is applied, while the referenced resource may still be stabilizing. AWS explicitly states that a dependent resource can encounter a transient failure because the referenced resource is not yet ready and that CloudFormation retries the operation. AWS also distinguishes retrying failed provisioning operations from the original provisioning attempt; retry is a later operation attempt after the cause has been addressed. Standard mode instead waits for resources to be ready before completing the stack operation.

## Findings
1. Express dependency satisfaction is not equivalent to runtime readiness at the instant the dependent attempt begins.
2. A transient failure on the first dependent attempt is therefore compatible with the documented deployment semantics.
3. A later successful retry proves success of the later attempt under the later observed conditions; it does not retroactively prove readiness at the first attempt.
4. The retry sequence itself is historical evidence and must retain attempt identity/order rather than collapsing all attempts into one timeless success.
5. If the first attempt produced an external partial effect before failing, later retry success does not erase that possibility; effect identity and reconciliation remain separate evidence domains.
6. AWS's retry mechanism therefore strengthens the distinction among dependency configuration, readiness observation, attempt identity, effect identity, and final convergence.
7. No new top-level interaction class is justified. The result reinforces I7/I19/I21/I22 and classes 3, 6, 7, 11, 15, 16, 17, 19; class 20 remains conditional.

## Anti-collapse
DEPENDENCY_CONFIGURED != DEPENDENCY_READY
FIRST_ATTEMPT_FAILURE != NO_PRIOR_EFFECT
RETRY_SUCCESS != RETROACTIVE_FIRST_ATTEMPT_SUCCESS
RETRY_ATTEMPT != ORIGINAL_ATTEMPT
FINAL_CONVERGENCE != COMPLETE_ATTEMPT_HISTORY
RETRY != EFFECT_ERASURE
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 3, 6, 7, 11, 15, 16, 17, 19.
Conditional: class 20 only where an explicitly declared atomic contract covers all attempts and external effects.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.991R establishes that Express-mode retry semantics create a concrete temporal distinction between the first dependent attempt and later convergence. A later retry success cannot be used as retroactive proof that the dependency was ready during the first attempt, nor can it erase possible partial external effects from that attempt. Nexo must preserve attempt identity, ordering, effect evidence, and reconciliation separately.
