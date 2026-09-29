# AB104.958R — eventual observation versus historical idempotency evidence after recreation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a provider returns historical idempotency information while its API is eventually consistent, what evidence is sufficient to bind a later observation to the correct resource incarnation?

## Fresh evidence
AWS ECS explicitly states that its API follows eventual consistency: a mutation may not be immediately visible to subsequent commands, and it recommends repeated DescribeTasks observations with backoff. ECS also documents that an idempotent RunTask retry with the same token and parameters can return the original result, with the returned task ARNs identifying the resources associated with that token. AWS Proton documents that an idempotent create retry can return original resource detail data, while after token expiry or original-resource deletion a retry can create a new resource; its delete semantics separately distinguish deleted-resource metadata, empty responses, and DELETE_IN_PROGRESS. AWS EC2 documents that idempotent retry results may contain updated information such as current creation status, while token identity remains scoped by region or availability zone.

## Findings
1. Historical idempotency evidence and current-state observation are distinct evidence types even when returned in the same API response.
2. Eventual consistency means a successful mutation response does not establish that every subsequent read at time t2 reflects the committed state at t1.
3. A provider-generated resource identity (for example a task ARN) can provide stronger binding than a reusable visible name or ID; Nexo should prefer immutable/provider-scoped identifiers when available.
4. A current read can be used as evidence about I2 only if its resource identity is explicitly bound to I2; matching a reused visible identifier is insufficient.
5. Repeated observations improve evidence only when the provider contract defines what the observed identifier and state mean; repetition alone does not prove historical lineage.
6. A replay response carrying the original resource identity can establish historical association, but cannot automatically prove that the same resource is still current or unchanged.
7. A new operation after token expiry must have a distinct operation identity even if its visible resource name matches the original.
8. Therefore Nexo's evidence graph should preserve at least: operation identity, provider/resource identity, incarnation/lineage, effect time, observation time, response semantics, and consistency status.
9. If the historical operation can be bound but the current observation cannot be bound to the same incarnation, the correct state remains partially known rather than being collapsed into CURRENT_STATE or ABSENT.
10. No new top-level interaction class is justified. This strengthens I15/I18/I19/I21/I22 and classes 7, 12, and 19; class 20 remains conditional on an explicit atomic boundary.

## Anti-collapse
HISTORICAL_REPLAY_EVIDENCE != CURRENT_STATE
CURRENT_READ != HISTORICAL_LINEAGE
VISIBLE_ID_MATCH != SAME_INCARNATION
OBSERVATION_TIME != EFFECT_TIME
REPEATED_READS != LINEAGE_PROOF
PROVIDER_RESOURCE_ID > VISIBLE_NAME_FOR_BINDING
TOKEN_EXPIRY != HISTORICAL_ERASURE
NEW_OPERATION != ORIGINAL_OPERATION
UNKNOWN != FAILED

## Classification
Primary: I15, I18, I19, I21, I22; classes 7, 12, 19.
Secondary: I9 and class 20 only where authority/cross-system atomicity is explicitly involved.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The correct binding primitive is not the latest successful response or the visible resource identifier alone. Nexo must distinguish historical idempotency evidence from current observation and bind both through an explicit provider/resource identity and incarnation relation. Where that relation cannot be established, preserve partial knowledge or UNKNOWN rather than asserting current-state safety.
