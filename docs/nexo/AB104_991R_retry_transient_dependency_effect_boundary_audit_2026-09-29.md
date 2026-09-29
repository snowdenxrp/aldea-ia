# AB104.991R — retry after transient dependency failure is a new attempt, not proof of continuous execution

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When Express Mode starts a dependent resource after configuration of its dependency is applied, and that dependent operation encounters a transient failure because the dependency is not yet ready, does CloudFormation's later retry prove that the original attempt remained continuously in progress or that no partial external effect occurred?

## Fresh evidence
AWS documents that Express Mode may start a dependent operation once the referenced resource's configuration is applied; if the dependent encounters a transient failure because the referenced resource is not ready, CloudFormation retries the operation. AWS separately documents that resource provisioning can be retried after failures and that independent provisioning paths may continue. AWS's troubleshooting guidance also distinguishes resources that fail to stabilize from completed configuration and notes that failed operations may require later retry or remediation.

## Findings
1. A retry is evidence of a later provisioning attempt under the orchestration contract; it is not by itself evidence that the original attempt had no partial external effect.
2. The documented retry behavior therefore creates a temporal boundary between ATTEMPT_1 and ATTEMPT_2.
3. If the underlying service/API is not itself idempotent or otherwise contractually deduplicated, retry semantics do not automatically prove effect uniqueness.
4. A transient dependency failure does not establish whether the first downstream request was rejected before effect, accepted asynchronously, partially applied, or otherwise left an external trace; that outcome depends on the downstream API contract and evidence.
5. Therefore RETRY != CLEAN_RESTART and RETRY != EFFECT_ABSENCE.
6. If the provider contract explicitly binds the failure response to a no-effect guarantee, that can close this uncertainty for the specific API boundary; otherwise UNKNOWN must be preserved for the external-effect outcome.
7. No new top-level interaction class is justified. The finding reinforces I3/I6/I19/I21/I22 and classes 3, 6, 11, 15, 16, 17, 19.

## Anti-collapse
RETRY != CLEAN_RESTART
RETRY != EFFECT_ABSENCE
TRANSIENT_FAILURE != PRE_EFFECT_REJECTION
ATTEMPT_1 != ATTEMPT_2
DEPENDENCY_NOT_READY != DOWNSTREAM_NO_EFFECT
ORCHESTRATOR_RETRY != PROVIDER_DEDUP
UNKNOWN != FAILED

## Classification
Primary: I3, I6, I19, I21, I22.
Interactions: classes 3, 6, 11, 15, 16, 17, 19.
Conditional: class 20 only where an explicit atomic contract spans the retry boundary and downstream effect.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.991R establishes that CloudFormation retry after a transient dependency failure is a new orchestration attempt, not proof of a clean restart or absence of external effect from the earlier attempt. Nexo must keep retry identity, provider idempotency/dedup semantics, and effect evidence separate; absent an explicit no-effect or dedup contract, the earlier attempt's external outcome remains UNKNOWN.
