# AB104.952R — replay response and post-effect mutation audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a provider's idempotent retry returns the original resource details, but that resource has subsequently changed or been deleted, what exactly does the replay prove?

## Fresh evidence
AWS Proton documents that, for some idempotent create APIs, a retry with the same client token and parameters returns original resource detail data without performing further actions. It also documents that if the original resource is deleted, a retry can create a new resource. For idempotent create APIs without client tokens, Proton documents that if the original resource has been modified, a retry can return ConflictException. AWS EC2 states that a retry may contain updated information such as current creation status. AWS ECS documents that retry responses can expose current task status and that idempotency is scoped to the cluster for RunTask.

## Findings
1. The replayed response is evidence that the provider matched the retry to the prior idempotent operation under its declared scope and contract.
2. Returned resource detail does not by itself prove that the resource is unchanged since the original operation.
3. Current-state fields in a replay are observations at the retry time; historical fields remain tied to the original operation.
4. If the resource was modified after creation, the provider may reject a retry or expose the changed/current state depending on the API contract.
5. If the original resource was deleted and provider semantics allow a new resource on token reuse after that condition, the new resource must not be conflated with the historical resource.
6. Resource identity, idempotency identity, and current-state identity are distinct evidence dimensions.
7. A replay that returns metadata for a deleted resource can be historical metadata rather than proof that the resource currently exists.
8. Therefore reconciliation must preserve the observation timestamp and the provider's stated replay semantics.
9. A later correction or compensation remains a new operation/effect.
10. No new top-level interaction class is justified; this reinforces I18/I19/I21, I15/I22 and class 12.

## Anti-collapse
REPLAY_MATCH != CURRENT_EXISTENCE
RESOURCE_METADATA != HISTORICAL_TRANSITION_LOG
CURRENT_STATUS(t2) != STATE_AT_EXECUTION(t1)
RESOURCE_IDENTITY != IDEMPOTENCY_IDENTITY
DELETED != NEVER_EXISTED
NEW_RESOURCE != HISTORICAL_RESOURCE
REPLAY != NEW_OPERATION
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I15/I22, class 12.
No new top-level class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Idempotent replay can bind a response to a historical operation without making the entire response a timeless statement about the resource. Nexo must distinguish historical identity, current observation, and resource incarnation when reconciling replay evidence.
