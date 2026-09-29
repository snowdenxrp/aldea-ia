# AB104.949R — in-flight idempotency versus effect confirmation audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does an idempotency response indicating that the same token is already in progress establish that the operation will complete, or only that the provider currently recognizes an in-flight operation?

## Fresh evidence
AWS Auto Scaling documents IdempotentCallInProgressFault: the service is processing another request with the same client token; the caller should retry with the same token and the in-flight operation will complete and return its result. AWS EC2 separately states that mutating requests can return before asynchronous workflows complete and that a returned result can contain current creation status. AWS Proton similarly documents that a mutating request can return before asynchronous workflows finish.

## Scenario
P1(K,X) is submitted.
Caller loses the response and records UNKNOWN.
R2(K,X) arrives while P1 is still being processed.
Provider returns an in-progress/idempotency indication.

This proves a provider-side relation to an existing in-flight request under the provider's idempotency contract. It does not by itself prove:
- final effect committed;
- final effect failed;
- final resource state;
- authorization at P1's execution time;
- absence of an external side effect outside the provider's own scope.

## Findings
1. IN_PROGRESS is evidence of provider-recognized operation continuity, not a terminal effect state.
2. A retry receiving IN_PROGRESS must not be converted to SUCCESS, FAILED, or EFFECT_ABSENT.
3. The same idempotency key can remain attached to an operation while the operation transitions asynchronously.
4. The later terminal result is the evidence that may resolve UNKNOWN, subject to the provider contract.
5. If the provider returns a resource/status reference, that reference can support reconciliation, but its current status is not automatically a historical proof of every intermediate effect.
6. A provider-side "in progress" response does not establish authorization validity at the original execution point.
7. A timeout, client disconnect, or lost response around the in-progress state preserves the uncertainty rather than creating a failure fact.
8. If a separate compensation is issued while the original remains IN_PROGRESS, the compensation is a new operation/effect; the original must not be silently reclassified as cancelled or absent.
9. Existing classes remain sufficient: I15/I22, I19, I21, I24, class 11, class 12, and I9 where authority is relevant. No new top-level class justified.

## State relation
P1(K,X) -> UNKNOWN
R2(K,X) -> PROVIDER_IN_PROGRESS
UNKNOWN remains UNKNOWN/PENDING
Later authoritative terminal result:
- COMMITTED_EFFECT -> CONFIRMED
- AUTHORITATIVE_NONEXECUTION -> FAILED
- still unresolved -> UNKNOWN

## Anti-collapse
IN_PROGRESS != COMMITTED
IN_PROGRESS != FAILED
IN_PROGRESS != ABSENT
IDEMPOTENCY_RELATION != EFFECT_OUTCOME
CURRENT_STATUS != COMPLETE_HISTORICAL_PROOF
RETRY_IN_PROGRESS != NEW_OPERATION
UNKNOWN != FAILED
COMPENSATION != CANCELLATION

## Classification
Primary: I15/I22, I19, I21, I24, class 11, class 12.
Secondary: I9.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
An idempotency "in progress" response is a continuity/deduplication signal. It preserves the operation's unresolved state; it is not an oracle for the eventual external effect. Nexo must retain IN_PROGRESS as a distinct state/evidence type rather than collapsing it into success or failure.
