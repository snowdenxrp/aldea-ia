# AB104.959R — provider resource identity versus visible identifier under eventual-consistency race

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a provider-scoped resource identifier returned by an idempotent retry safely bind a later current-state read when deletion and recreation may occur between observations?

## Fresh evidence
AWS ECS documents that idempotent RunTask retries return the original result and expose task ARNs associated with the client token. The same documentation states that the ECS API is eventually consistent and recommends repeated DescribeTasks observations with exponential backoff. AWS ECS also reports ConflictException when a client token is already associated with a different RunTask request, exposing the existing task ARNs. AWS Proton documents that idempotent create retries can return original resource details, but after token expiry or original-resource deletion a retry can create a new resource; its delete APIs separately distinguish historical delete metadata, empty responses, and DELETE_IN_PROGRESS. AWS Cloud Control API recommends unique idempotency tokens and notes that a single resource operation can involve multiple underlying calls and can partially apply changes without rollback.

## Findings
1. A provider-generated resource identity is stronger binding evidence than a reusable visible name/ID, but it is not automatically a permanent current-state reference.
2. The identity returned by an idempotent replay can establish association with the historical operation when the provider contract says so.
3. A later read must independently establish that the referenced provider identity still exists and what state it has at observation time.
4. If the provider identity itself is immutable and never reused, a missing later read can support historical disappearance of that specific identity; it still does not prove absence of a successor resource sharing a visible identifier.
5. If the provider does not guarantee identity non-reuse, even provider-scoped identifiers require an explicit incarnation/lineage contract before being treated as globally unique historical bindings.
6. Eventual consistency means a read immediately after delete/recreate may lag the mutation; therefore NOT_FOUND, old-state, or new-state observations must carry observation time and consistency semantics.
7. A current read of a visible identifier cannot override a stronger historical binding to a different provider identity.
8. Conversely, a historical provider identity cannot by itself establish the current state of a visible identifier after recreation.
9. Cloud Control evidence reinforces that operation identity and resource mutation are separate: one logical resource operation may involve multiple underlying calls and may partially apply without rollback.
10. No new top-level interaction class is justified. The evidence strengthens I18/I19/I21/I22 and classes 7, 11, 12, and 19; class 20 remains conditional on an explicit atomic boundary.

## Anti-collapse
PROVIDER_ID != VISIBLE_ID
HISTORICAL_PROVIDER_ID != CURRENT_STATE
CURRENT_VISIBLE_ID != HISTORICAL_LINEAGE
NOT_FOUND(t2) != HISTORICAL_ABSENCE
OLD_STATE(t2) != CURRENT_TRUTH_UNDER_EVENTUAL_CONSISTENCY
NEW_STATE(t2) != ORIGINAL_OPERATION
RESOURCE_IDENTITY != OPERATION_ID
PARTIAL_APPLY != ATOMIC_COMMIT
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I22; classes 7, 11, 12, 19.
Secondary: I15 and class 20 where idempotency/atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The safe evidence model requires two independent bindings: historical operation-to-provider-resource identity and observation-to-current-state identity. A visible identifier cannot substitute for either. A provider identity can strengthen historical lineage, but current-state claims still require a time-bounded observation under the provider's consistency semantics. When those bindings cannot be joined, preserve partial knowledge or UNKNOWN rather than collapsing the evidence into absence, successor identity, or successful current state.
