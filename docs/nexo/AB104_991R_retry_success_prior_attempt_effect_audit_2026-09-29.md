# AB104.991R — dependency success and retry history do not prove absence of prior downstream effects

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If an Express-mode dependent resource initially fails because its dependency is not yet ready and CloudFormation later retries it successfully, does the final success prove that the earlier attempt had no external effect or that the retry was the only effect?

## Fresh evidence
AWS documents that Express Mode can start a dependent resource after the referenced resource's configuration is applied, before full stabilization, and that a dependent operation can fail transiently because the referenced resource is not yet ready; CloudFormation may retry the operation. AWS also documents general retry/provisioning behavior: failed provisioning actions can be retried after remediation. Separately, AWS resource-handler guidance describes downstream API calls, error handling, stabilization, and continuation as distinct steps in a handler call chain.

## Findings
1. A later successful retry establishes that a later provisioning attempt reached its own success boundary; it does not by itself prove that the earlier failed attempt produced no external side effect.
2. An API-level failure can occur after a downstream service has received or partially processed a request; therefore failure status alone is not a universal absence oracle unless the service contract explicitly binds failure to non-application.
3. CloudFormation's retry semantics are orchestration evidence; downstream service effect evidence remains a separate domain unless the provider contract closes that relation.
4. Consequently `RETRY_SUCCESS != PRIOR_ATTEMPT_NO_EFFECT` and `FAILED != EFFECT_ABSENT` are required anti-collapse rules.
5. If the downstream API explicitly guarantees atomic rejection before any effect, that is stronger scoped evidence and may close this specific boundary.
6. The retry relation itself must be represented explicitly: attempt identity, retry relation, downstream effect identity, and provider outcome are distinct fields/evidence nodes.
7. This does not create a new top-level interaction class; it deepens classes 3, 6, 11, 15, 16, 17, 19 and I19/I21/I22.

## Anti-collapse
RETRY_SUCCESS != PRIOR_ATTEMPT_NO_EFFECT
FAILED != EFFECT_ABSENT
ORCHESTRATOR_RETRY != EFFECT_RETRY
ATTEMPT_ID != EFFECT_ID
API_FAILURE != UNIVERSAL_ROLLBACK
LATER_SUCCESS != COMPLETE_HISTORY
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: classes 3, 6, 11, 15, 16, 17, 19.
Conditional: class 20 where an explicit atomic contract covers the attempt and downstream effect.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.991R establishes that orchestration retry success is not proof that an earlier failed attempt had no external effect. Nexo must preserve attempt identity, retry relation, provider outcome semantics, and downstream effect evidence separately. A failure may establish absence only when the relevant provider contract explicitly guarantees non-application.
