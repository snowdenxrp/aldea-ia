# AB104.971R — status success versus provider-state verification boundary

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a provider SUCCESS status for an asynchronous resource operation make a subsequent current-state read unnecessary, or does SUCCESS and current-state observation remain distinct evidence?

## Fresh evidence
AWS Cloud Control API documents that GetResourceRequestStatus returns the current status of a resource operation request, while GetResource independently returns information about the current state of a specified resource. AWS's getting-started examples show a CREATE request first returning IN_PROGRESS and later SUCCESS, followed by a separate read of the resource's current state. The API reference describes ProgressEvent as representing the current status of the resource operation request.

## Findings
1. SUCCESS is evidence about the provider operation request, not automatically a timeless assertion about all later resource state.
2. GetResource is an independent current-state observation and can therefore detect later mutations or state divergence that occurred after the operation's terminal observation.
3. A successful operation status can establish that the provider considers that request successfully completed under its contract; it does not establish that the resource will remain in that state afterward.
4. Therefore OPERATION_SUCCESS != CURRENT_STATE_AT_ANY_LATER_TIME.
5. Conversely, a current state matching the desired result does not prove which historical operation established that state if multiple operations could produce the same state.
6. The evidence model must preserve terminal request status and later current-state observations as separate records, connected by explicit temporal/causal relations where available.
7. A later read can corroborate persistence of an effect, but it cannot retroactively replace the historical operation status record or prove that no intervening mutation occurred.
8. If the operation status is unavailable but a current state matches the desired result, historical outcome remains only partially reconstructable unless provider identity/version/lineage evidence closes the gap.
9. No new top-level interaction class is justified. This strengthens I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
OPERATION_SUCCESS != CURRENT_STATE_AT_ANY_LATER_TIME
CURRENT_STATE_MATCH != HISTORICAL_OPERATION_PROOF
LATER_READ != TERMINAL_STATUS_RECORD
TERMINAL_STATUS != PERMANENT_STATE
CURRENT_STATE != COMPLETE_HISTORY
CORROBORATION != CAUSAL_PROOF
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
AB104.971R establishes that terminal provider operation status and later resource-state observation are complementary but non-identical evidence. SUCCESS can close the provider's request outcome under its contract, while a later read addresses current state. Nexo must retain both rather than substitute one for the other; when historical linkage is incomplete, preserve partial reconstruction/UNKNOWN.
