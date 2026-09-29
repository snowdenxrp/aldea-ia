# AB104.951R — idempotent replay response versus current-state freshness audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a provider returns the original idempotent result on a retry, can that response be treated as a current-state snapshot, or is it evidence of the original request/result semantics?

## Fresh evidence
AWS EC2 states that a mutating request can return before asynchronous workflows complete. AWS Proton explicitly states that a successful retry with the same client token can return original resource detail data, while the result may contain updated information such as the current creation status. AWS DynamoDB documents that repeated idempotent calls can have the same server-side result/effect while response metadata can differ between the initial and subsequent calls.

## Findings
1. An idempotent replay response is not necessarily a frozen copy of the original wire response.
2. The provider may return original resource identity/detail while also reporting current status.
3. Therefore response fields need semantic typing: original-result evidence, current-state observation, or both.
4. A current status observed on retry is not automatically proof of every historical transition.
5. Conversely, a historical result returned by replay does not automatically describe the resource's present state if the provider contract permits later changes.
6. Same effect/no duplicate execution and same response bytes are separate properties.
7. A replay response can therefore carry both identity evidence and freshness-sensitive state evidence.
8. If the current state has changed after the original effect, the replay does not create a new operation; it is still evidence tied to the original idempotency scope.
9. Reconciliation should preserve observation time and provider scope so stale observations are not promoted to authoritative current state.
10. No new top-level class is justified; this reinforces I19/I21, I15/I22, class 12, and I18 where resource incarnation matters.

## State/evidence separation
Original operation O1 -> provider effect identity E1
Retry K -> replay response R2
R2.identity -> evidence about O1/E1
R2.current_status(t2) -> observation at t2
Neither field alone proves the complete historical transition graph O1 -> E1 -> state(t2).

## Anti-collapse
REPLAYED_RESPONSE != ORIGINAL_WIRE_BYTES
REPLAYED_RESPONSE != HISTORICAL_TRANSITION_LOG
CURRENT_STATUS(t2) != COMPLETE_HISTORY
ORIGINAL_RESULT != CURRENT_STATE
SAME_EFFECT != SAME_RESPONSE
OBSERVATION_TIME != EFFECT_TIME
IDEMPOTENCY_REPLAY != NEW_OPERATION
STALE_OBSERVATION != AUTHORITATIVE_CURRENT_STATE
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I15/I22, class 12.
Secondary: I18.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
An idempotent replay may contain a mixture of historical identity/result evidence and a fresh current-state observation. Nexo must preserve the temporal semantics of each field instead of treating the entire replay response as one undifferentiated fact.
