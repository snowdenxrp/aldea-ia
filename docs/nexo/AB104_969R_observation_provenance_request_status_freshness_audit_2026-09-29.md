# AB104.969R — observation provenance and request-status freshness boundary

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a current GetResource observation and a historical ProgressEvent both reference the same resource identifier, can they be merged into one undifferentiated fact, or must their provenance and temporal semantics remain separate?

## Fresh evidence
AWS Cloud Control API defines GetResource as returning information about the current state of a specified resource. The API can return resources regardless of whether they were provisioned through Cloud Control API. ProgressEvent, by contrast, represents the current status of a particular resource operation request and carries RequestToken, Identifier, Operation, OperationStatus, EventTime, and optionally ResourceModel. AWS also documents that resource identifiers may be available before SUCCESS.

## Findings
1. GetResource is a current-state observation; ProgressEvent is request-scoped operation evidence. They are different evidence types even when they contain the same Identifier.
2. Matching Identifier values permit correlation only at the resource-identity layer; they do not erase the difference between current-state observation and historical/request-scoped evidence.
3. EventTime on ProgressEvent describes when the resource operation request was initiated, not a universal timestamp proving when every underlying effect occurred.
4. Therefore a current GetResource result cannot be retroactively substituted for the missing terminal ProgressEvent of an expired operation.
5. Conversely, an old ProgressEvent cannot be treated as the current resource state after later mutations.
6. Reconciliation should retain both evidence records and their provenance/type/time semantics rather than normalize them into a single state fact.
7. If the provider contract supplies explicit causal/version linkage between the operation and current resource state, the two evidence records can be related; otherwise the relation remains partial.
8. No new top-level interaction class is justified. This strengthens I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
GETRESOURCE_CURRENT_STATE != PROGRESSEVENT_OPERATION_HISTORY
SAME_IDENTIFIER != SAME_EVIDENCE
EVENT_TIME != EFFECT_TIME
CURRENT_OBSERVATION != HISTORICAL_OPERATION
OLD_OPERATION_EVENT != CURRENT_STATE
CORRELATION != CAUSAL_PROOF
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 12, 17, 19.
Secondary: I18 and I15 where identity/incarnation or retention boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.969R establishes a provenance boundary: current-state observations and request-scoped historical operation evidence may refer to the same resource without being the same fact. Nexo must retain evidence type, provenance, timestamp semantics, and correlation relation separately. Where no causal/version contract closes the relation, preserve partial knowledge or UNKNOWN.
