# AB104.964R — resource model observation versus authoritative operation history

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a resource model returned during an asynchronous provider operation be treated as authoritative proof of the final historical effect of that operation?

## Fresh evidence
AWS Cloud Control API documents that ProgressEvent can contain ResourceModel while OperationStatus is still IN_PROGRESS. The API separately tracks the request with RequestToken and exposes OperationStatus as the current request status. AWS's resource-operation guide also states that requests are asynchronous and that cancellation can leave partial changes applied. The update documentation further states that if an update handler fails, Cloud Control API does not roll the resource back to its previous state.

## Findings
1. A ResourceModel observed in an IN_PROGRESS ProgressEvent is an observation associated with the operation, not automatically terminal-state evidence.
2. ResourceModel != committed final state unless the provider contract explicitly binds that field at the relevant status boundary.
3. RequestToken identifies the operation request, while ResourceModel describes resource data; these are distinct evidence dimensions.
4. A later ProgressEvent can supersede an earlier model observation, so observation time must remain attached to the evidence.
5. A SUCCESS status strengthens the claim that the provider operation completed successfully, but it does not erase the distinction between the operation's status and independently evidenced downstream effects.
6. FAILED or CANCEL_COMPLETE cannot be interpreted as historical absence of every change when partial application is contractually possible.
7. Reconciliation therefore needs to preserve at least RequestToken, Identifier, OperationStatus, ResourceModel observation time, and provider-specific downstream/effect evidence.
8. No new top-level interaction class is justified. This strengthens I19/I21/I22 and classes 7, 11, 12, 19; class 20 remains conditional on an explicit atomicity boundary.

## Anti-collapse
RESOURCE_MODEL(t1) != FINAL_STATE
RESOURCE_MODEL != EFFECT_COMMIT
IN_PROGRESS_MODEL != TERMINAL_TRUTH
REQUEST_TOKEN != RESOURCE_MODEL
OBSERVATION_TIME != EFFECT_TIME
FAILED != NO_HISTORICAL_CHANGE
CANCEL_COMPLETE != ROLLBACK
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 11, 12, 19.
Secondary: I15, I18 and class 20 where idempotency, identity, or cross-domain atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A provider resource model is time-bound observation evidence, not automatically a final historical effect record. Nexo must preserve the observation timestamp/status and bind any claim of finality to the provider's explicit contract. Partial application and asynchronous progress require UNKNOWN or reconciliation where the terminal effect cannot be independently established.
