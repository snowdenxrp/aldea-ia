# AB104.950R — in-flight idempotency continuity versus liveness/effect guarantee audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a provider explicitly says that an in-flight idempotent operation will complete and return its result, does that statement itself prove the eventual business effect, or only define the provider's retry/continuation contract?

## Fresh evidence
AWS Auto Scaling documents IdempotentCallInProgressFault as indicating that another request with the same client token is being processed and instructs the caller to retry with that token; the in-flight operation will complete and return its result. AWS EC2 documents that mutating API requests can return before asynchronous workflows finish and that returned information may represent current creation status. AWS's Builders Library describes idempotency as making retries safe while noting that the original request may continue in the background after a client timeout.

## Scenario
P1(K,X) is accepted and processing.
Client loses the response.
R2(K,X) receives PROVIDER_IN_PROGRESS.
The provider contract promises that the in-flight operation will complete and return a result.

The promise establishes a provider protocol/liveness property about continuation and result availability. It does not, by itself, establish that the final result will be business success or that an external effect has already committed.

## Findings
1. WILL_COMPLETE is not equivalent to WILL_SUCCEED.
2. RESULT_WILL_BE_RETURNED is not equivalent to EFFECT_ALREADY_COMMITTED.
3. The in-progress response can strengthen the evidence that the original provider operation exists and is still active.
4. It can reduce uncertainty about request identity, but not necessarily about final business outcome.
5. A later terminal provider result remains necessary to classify the operation as confirmed success, authoritative non-execution/failure, or unresolved.
6. If the provider's documented contract explicitly defines a terminal response as proof of a committed effect, that terminal response can resolve the corresponding UNKNOWN; the rule comes from the provider contract, not from idempotency alone.
7. Client timeout/disconnect does not imply provider cancellation or effect absence.
8. A local decision to abandon or compensate while the provider operation is still in progress must be modeled as a new operation; it does not rewrite the historical operation's outcome.
9. Provider liveness statements should be stored as protocol evidence with scope/version/time, not treated as an effect fact.
10. Existing classes remain sufficient: I15/I22, I19, I21, I24, class 11, class 12, and I9 where authority is relevant. No new top-level class.

## State/evidence separation
P1(K,X) -> UNKNOWN
R2(K,X) -> PROVIDER_IN_PROGRESS
Provider contract -> EXPECTED_TERMINAL_RESULT
This does NOT imply:
EXPECTED_TERMINAL_RESULT -> COMMITTED_EFFECT

Later:
TERMINAL_COMMITTED -> CONFIRMED
TERMINAL_NONEXECUTION -> FAILED
TERMINAL_AMBIGUOUS -> UNKNOWN

## Anti-collapse
PROVIDER_LIVENESS_PROMISE != BUSINESS_SUCCESS
WILL_COMPLETE != WILL_SUCCEED
IN_PROGRESS != COMMITTED
RESULT_EVENTUALITY != EFFECT_ORACLE
CLIENT_TIMEOUT != PROVIDER_CANCELLATION
ABANDON != CANCELLED
COMPENSATION != REWRITE
UNKNOWN != FAILED

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
An in-flight idempotency guarantee is useful evidence about continuity and provider protocol behavior, but it is not itself a business-effect oracle. Nexo should preserve protocol/liveness evidence separately from terminal effect evidence.
