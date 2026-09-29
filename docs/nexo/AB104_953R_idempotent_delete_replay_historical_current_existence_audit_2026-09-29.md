# AB104.953R — idempotent delete replay versus historical deletion and current existence audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a successful idempotent delete retry prove current non-existence, historical deletion, or only that the provider recognizes the prior delete operation?

## Fresh evidence
AWS Proton documents two distinct idempotent-delete behaviors. For synchronous-style idempotent delete APIs, if the resource was deleted, a retry can return its metadata; if the resource does not exist, the response can be empty and still succeed. For asynchronous idempotent deletes, a retry can return resource details while deletion is DELETE_IN_PROGRESS, and an empty response after the original delete is complete. AWS Cloud Control documents that delete operations can involve underlying provider calls and can be partially completed; failure does not imply rollback.

## Findings
1. A successful delete retry is not universally equivalent to CURRENT_RESOURCE_ABSENT.
2. Returned metadata after deletion can be historical evidence tied to the prior delete operation.
3. Resource absence can be a current-state observation, but absence alone does not prove how or when deletion occurred.
4. DELETE_IN_PROGRESS establishes an active provider operation, not completed deletion.
5. An empty response can mean different things depending on the API contract; it must not be interpreted without endpoint-specific semantics.
6. Partial underlying operations mean a high-level delete result can require reconciliation with provider/resource state.
7. Therefore delete replay evidence must distinguish operation identity, effect status, current existence, and historical transition.
8. If a resource is recreated after deletion, current absence/non-absence cannot be used to rewrite the historical deletion fact.
9. A later recreate is a new operation/effect and, when identifiers are reused, requires incarnation/lineage separation.
10. No new top-level interaction class is justified; this reinforces I18/I19/I21, I24, I15/I22 and classes 11/12/20 where boundaries cross systems.

## State/evidence separation
D1(K,R) -> DELETE_UNKNOWN
R2(K,R) -> DELETE_REPLAY
Possible semantics:
- DELETE_IN_PROGRESS -> operation active; effect unresolved
- DELETED_WITH_METADATA -> historical deletion evidence; current existence still separately assessed
- EMPTY_SUCCESS -> current absence only if contract explicitly binds empty response to absence
- PARTIAL/AMBIGUOUS -> UNKNOWN

## Anti-collapse
DELETE_REPLAY != CURRENT_ABSENCE
DELETED_METADATA != NEVER_EXISTED
DELETE_IN_PROGRESS != DELETED
EMPTY_RESPONSE != UNIVERSAL_ABSENCE_PROOF
DELETE_SUCCESS != COMPLETE_GLOBAL_ERASURE
RECREATED_RESOURCE != HISTORICAL_RESOURCE
RETRY != NEW_OPERATION
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I24, I15/I22, classes 11/12.
Secondary: class 20 for local/provider atomicity claims.
No new top-level class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Delete idempotency is especially dangerous to collapse into a generic NOT_FOUND or ABSENT fact. Nexo must interpret the provider's exact delete-replay contract and retain historical deletion evidence separately from current existence observations.
