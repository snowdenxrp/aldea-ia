# AB104.972R — terminal status does not establish intervening-state exclusion

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If Cloud Control reports SUCCESS for an operation, can Nexo infer that no other mutation of the same resource occurred between operation initiation, terminal status observation, and a later current-state read?

## Fresh evidence
AWS documents that GetResourceRequestStatus returns the current status of a request identified by RequestToken, while GetResource separately observes current resource state. Cloud Control also states that resource operation requests are asynchronous and that a single resource operation may involve multiple calls to the underlying service. AWS further states that cancellation may leave a request partially completed and does not roll back the resource. The ProgressEvent contract defines EventTime as request initiation and OperationStatus as the request's current status; it does not define EventTime as a global resource serialization point.

## Findings
1. SUCCESS closes the status of the identified operation request under the provider contract; it does not by itself establish a global serialization point for all mutations to the resource.
2. A later GetResource observation is evidence about state at the read boundary, not proof that the resource remained unchanged throughout the interval.
3. Because the provider exposes request-scoped status separately from current resource state, an inference of "no intervening mutation" requires additional causal/version/serialization evidence.
4. Even when the same Identifier appears in both records, identifier correlation does not establish an exclusive history for the interval.
5. Therefore SUCCESS + later matching GetResource can corroborate a current outcome but cannot, without an explicit provider guarantee, prove an uninterrupted state interval or absence of an intervening operation.
6. If a provider supplies an explicit version/generation/conditional-read contract, that evidence may constrain the interval; absent that contract, preserve the relation as partial.
7. No new top-level interaction class is justified. This strengthens I19/I21/I22 and classes 7, 8, 12, 17, 19; class 20 remains conditional on an intended atomic boundary.

## Anti-collapse
SUCCESS != GLOBAL_SERIALIZATION_POINT
SUCCESS + CURRENT_MATCH != NO_INTERVENING_MUTATION
SAME_IDENTIFIER != EXCLUSIVE_HISTORY
CURRENT_READ != INTERVAL_PROOF
OPERATION_TERMINAL_STATUS != GLOBAL_RESOURCE_ORDER
CORRELATION != CAUSAL_PROOF
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 8, 12, 17, 19.
Secondary: I18/I15 where identity or retention boundaries are explicit.
Conditional: class 20 only where a cross-domain atomicity claim is actually made.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.972R establishes that a terminal operation status plus a later matching current-state read does not constitute proof of an uninterrupted resource history. Nexo must require explicit serialization/version/causal evidence before asserting that no intervening mutation occurred; otherwise the interval remains partially known.
