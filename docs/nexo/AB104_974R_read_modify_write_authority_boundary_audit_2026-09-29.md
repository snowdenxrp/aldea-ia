# AB104.974R — read-modify-write boundary lacks universal external-version proof

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When Cloud Control UPDATE first reads current resource state, constructs a desired state, and then invokes the update handler, does successful completion prove that the state read at the beginning remained the authoritative base throughout the operation?

## Fresh evidence
AWS documents that Cloud Control UPDATE first retrieves the current state, combines the requested JSON Patch operations with that state to generate the desired state, and then calls the resource type's update handler. AWS also documents that a Cloud Control resource can be operated on directly through the underlying service and warns that such concurrent management can produce unexpected or unpredictable behavior. The API exposes a ConcurrentOperationException for another Cloud Control operation on the same resource, but the documented serialization is specifically about Cloud Control resource operations. The documented ProgressEvent and UpdateResource response contain request/resource identifiers and status information; the cited API contract does not expose a universal resource version or compare-and-swap token binding the initial read to the eventual external effect.

## Findings
1. Cloud Control's UPDATE has a read -> desired-state construction -> handler execution boundary.
2. The fact that the initial read was current when obtained does not, by itself, prove that it remained globally current until the handler's effect.
3. Cloud Control prevents concurrent Cloud Control operations on the same resource, but that does not extend the serialization guarantee to direct underlying-service actors.
4. Therefore INITIAL_READ + SUCCESS does not by itself prove INITIAL_READ_WAS_STILL_AUTHORITATIVE_AT_EFFECT.
5. A later current-state match with the requested desired state also does not prove that the handler used an uninterrupted state lineage; the same final state can arise through another history.
6. If a specific resource type or underlying service provides a version/etag/generation/conditional-write contract and the handler actually binds the update to that evidence, the inference boundary can be narrowed. That is provider/resource-specific evidence, not a universal Cloud Control guarantee.
7. No new top-level interaction class is justified. The result strengthens I19/I21/I22 and classes 7, 8, 9, 11, 12, 17, 18, 19; class 20 remains conditional.

## Anti-collapse
INITIAL_READ != GLOBAL_AUTHORITY_AT_EFFECT
READ_FRESH_AT_T0 != READ_STILL_FRESH_AT_T1
CLOUD_CONTROL_SERIALIZATION != UNDERLYING_SERVICE_SERIALIZATION
SUCCESS != VERSION_PROOF
FINAL_STATE_MATCH != UNIQUE_HISTORY
IDENTIFIER_MATCH != LINEAGE_PROOF
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 8, 9, 11, 12, 17, 18, 19.
Conditional: class 20 if a claimed atomic boundary spans the read and external effect.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.974R establishes a read-modify-write evidence boundary: an initial current-state read plus successful Cloud Control completion is not universal proof that the initial state remained authoritative through the external effect. Nexo must preserve the distinction between observation freshness and effect-time authority, unless an explicit resource/provider concurrency contract closes that gap.
