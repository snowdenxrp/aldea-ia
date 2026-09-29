# AB104.995R — handler failure/rollback does not imply reversal of already-completed downstream effects

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a multi-call handler completes some downstream mutations and later fails, does handler-level FAILED or stack rollback prove that the earlier downstream effects never happened or were automatically erased?

## Fresh evidence
AWS documents that handlers may require multiple API calls and waits to reach desired state, and that a handler returns FAILED when it cannot reach that state. The same contract explicitly discusses resource leakage when a handler loses track of a resource and states that rollback behavior depends on the operation and resource replacement. AWS guidance for custom resources also warns that CloudFormation can invoke a function again after not receiving a successful response, potentially creating a second resource unless the function is idempotent. citeturn0search1turn0search4

CloudFormation troubleshooting guidance also directs operators to CloudTrail to identify the downstream API calls associated with a stuck resource, showing that handler/resource progress and underlying API-call history are distinct evidence domains. citeturn0search6

## Findings
1. A handler FAILED status is evidence about the handler contract reaching its declared terminal success condition; it is not, by itself, evidence that every preceding downstream mutation was absent.
2. In a multi-call chain, call A may have succeeded before call B failed. The later handler failure does not logically erase A.
3. A subsequent rollback/delete is a new operation/effect boundary. It may compensate A, partially compensate it, fail, or itself become UNKNOWN; it must not be treated as retroactive erasure of A's historical execution.
4. Resource-leak scenarios are explicitly recognized by AWS, reinforcing that handler-level lifecycle state and downstream resource/effect history are distinct.
5. Therefore `HANDLER_FAILED != ALL_EFFECTS_ABSENT`, and `ROLLBACK_REQUESTED != ROLLBACK_COMPLETED`.
6. A later successful rollback/cleanup still does not rewrite the historical fact that an earlier effect occurred; it adds a corrective/remediation effect and relation.
7. This is not a new top-level interaction class. It strengthens failure/recovery, correction, external-effect, idempotency and provenance interactions already represented by I3/I15/I19/I21/I22 and classes 3, 6, 11, 12, 14, 16, 17, 19.

## Anti-collapse
HANDLER_FAILED != ALL_EFFECTS_ABSENT
ROLLBACK_REQUESTED != ROLLBACK_COMPLETED
ROLLBACK_COMPLETED != HISTORICAL_ERASURE
COMPENSATION != ORIGINAL_EFFECT
FAILED != NEVER_EXECUTED
RETRY != EFFECT_ABSENCE
RESOURCE_TERMINAL_STATE != COMPLETE_EFFECT_HISTORY
UNKNOWN != FAILED

## Classification
Primary: I3, I15, I19, I21, I22.
Interactions: classes 3, 6, 11, 12, 14, 16, 17, 19.
Conditional: class 20 only when an explicit atomic rollback contract spans the downstream boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.995R establishes that failure or rollback at the handler/resource-orchestration layer cannot be used as a universal historical erasure or effect-absence oracle. Previously completed downstream effects remain historical facts unless a separate, authoritative correction/effect record establishes what happened afterward. Nexo must represent rollback as its own operation/effect relation rather than rewriting the original effect history.
