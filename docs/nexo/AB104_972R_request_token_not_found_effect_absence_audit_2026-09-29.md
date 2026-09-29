# AB104.972R — RequestTokenNotFound versus historical effect absence

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When Cloud Control API no longer finds a resource operation request by RequestToken, can that observation be treated as evidence that the historical operation or its downstream effects never occurred?

## Fresh evidence
AWS documents that resource operation requests expire after seven days. GetResourceRequestStatus returns RequestTokenNotFoundException when a resource operation with the specified token cannot be found. AWS separately documents that cancellation may leave a request partially completed and does not roll back the resource; asynchronous downstream operations that already started are not necessarily terminated.

## Findings
1. RequestTokenNotFound means the provider cannot return the request record for that token at the observation point; it does not by itself encode a historical outcome.
2. The seven-day request-retention horizon is an observability/control boundary, not an effect-lifetime boundary.
3. Because cancellation can leave partial changes and downstream asynchronous work, disappearance of the request record cannot be used as proof of zero effect.
4. Therefore REQUEST_TOKEN_NOT_FOUND != EFFECT_ABSENT.
5. REQUEST_TOKEN_NOT_FOUND != OPERATION_NEVER_OCCURRED.
6. REQUEST_RECORD_EXPIRY != HISTORICAL_ERASURE.
7. A later current-state read can provide additional evidence, but without an explicit lineage/causal contract it does not reconstruct the expired request's complete history.
8. Reconciliation after token expiry therefore requires preserving uncertainty unless independent authoritative evidence closes the historical relation.
9. No new top-level interaction class is justified. This strengthens I15/I17/I19/I21/I22 and classes 7, 12, 17, 19; class 11/20 remain conditional on external-effect scope.

## Anti-collapse
REQUEST_TOKEN_NOT_FOUND != EFFECT_ABSENT
REQUEST_TOKEN_NOT_FOUND != OPERATION_NEVER_OCCURRED
REQUEST_RECORD_EXPIRY != HISTORICAL_ERASURE
TOKEN_EXPIRY != EFFECT_EXPIRY
CURRENT_STATE != EXPIRED_OPERATION_HISTORY
ABSENCE_OF_RECORD != ABSENCE_OF_EFFECT
UNKNOWN != FAILED

## Classification
Primary: I15, I17, I19, I21, I22; classes 7, 12, 17, 19.
Conditional: classes 11 and 20 when downstream/external effects are in scope.
Secondary: I18 where resource incarnation/reuse is involved.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.972R establishes an observability-horizon boundary: loss of a provider request record is not evidence that the operation or its downstream effects were absent. Nexo must model request-record availability separately from operation history and effect existence. After retention expiry, unresolved historical linkage remains partial/UNKNOWN unless independent authoritative evidence closes it.
