# AB104.954R — delete idempotency versus recreation race and stale retry audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a delete operation is followed by resource recreation or identifier reuse, what can a late retry of the original delete key legally affect?

## Fresh evidence
AWS Proton documents that idempotent delete behavior is tied to the client token and resource context, and that after resource deletion certain retry behavior can differ from the original operation. AWS EC2 documents that idempotency scope is part of the contract and that client tokens can be scoped regionally or zonally. AWS ECS documents RunTask idempotency as cluster-scoped. These provider contracts show that late retries must be interpreted within the original operation's provider scope and resource semantics rather than by a bare resource identifier.

## Scenario
O1 = DELETE(resource R, incarnation I1, key K)
O1 becomes UNKNOWN.
Resource R/I1 is deleted.
Later O2 creates R/I2 (same visible identifier where reuse is possible).
A late retry O1(K) arrives.

The late retry must not silently become:
DELETE(R/I2).

## Findings
1. A resource identifier reused after deletion is insufficient to bind a late retry to the successor incarnation.
2. The original idempotency scope and key must remain attached to O1.
3. If the provider contract explicitly binds the delete token to the original resource/incarnation, the late retry may replay or resolve O1 without touching I2.
4. If the provider contract permits the same token to act on the successor context, that is a provider-specific semantic requiring explicit evidence; Nexo must not assume it.
5. Current lookup by resource ID is not enough to decide whether a late request targets I1 or I2.
6. A stale retry can therefore create a safety boundary at the identity-binding layer, but this is already represented by I18/I19 and existing namespace/incarnation interactions.
7. If the provider cannot distinguish the historical target, the correct outcome is not silent retargeting; preserve UNKNOWN or require an explicit reconciliation/authority decision.
8. A confirmed deletion of I1 does not establish deletion of I2.
9. A correction/compensation for I1 is a new operation/effect and must retain the historical target relation.
10. No new top-level interaction class is justified.

## Anti-collapse
RESOURCE_ID_REUSE != TARGET_IDENTITY
LATE_RETRY != CURRENT_RESOURCE_OPERATION
DELETE(I1) != DELETE(I2)
HISTORICAL_KEY != SUCCESSOR_AUTHORITY
CURRENT_LOOKUP != HISTORICAL_BINDING
CONFIRMED_I1 != CONFIRMED_I2
RETRY != RETARGET
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I15/I22, class 12.
Secondary: I9 and class 20 where authority or cross-system atomicity matters.
No new top-level class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A late idempotent delete retry must be bound to its original operation and target incarnation according to the provider contract. A reused resource identifier must never be treated as proof that the late retry targets the successor resource. This is an identity/lineage problem, not a new top-level interaction class.
