# NEXO AB104.760R2 — continuity claim re-audit / RequestHandler revalidation

Date: 2026-09-28
Kafka source commit audited: abf522e1ca5d7f4375baddc4da004da9fcb6e9ca
Nexo status: RESEARCH ONLY; no implementation; no runtime execution by this audit.

## Purpose
Re-audit the continuity handoff claim labeled AB104.760R. The handoff currently names commit d854ef3b59358cd7a5da8571dd7558dac8407a71b, but that SHA is not present in the canonical Nexo repository and the corresponding artifact path could not be resolved. Therefore that prior continuity entry is NOT treated as persisted evidence. This record preserves the correction without deleting or overwriting it.

## Direct Kafka source evidence
1. core/src/main/scala/kafka/server/KafkaRequestHandler.scala at abf5221e...
   - run() dequeues with requestChannel.receiveRequest(300).
   - For a normal Request, it sets dequeue time, stores threadCurrentRequest, then directly calls apis.handle(request, requestLocal).
   - There is no generic check that the originating transport/channel is still open immediately before apis.handle().
   - Exceptions are caught/logged; finally removes threadCurrentRequest and releases the request buffer.
   - CallbackRequest also executes its callback on a request-handler thread; the generic callback path does not perform a transport-open revalidation.
2. core/src/main/scala/kafka/server/KafkaApis.scala at abf5221e...
   - top-level handle() logs request.context.connectionId/principal/securityProtocol and dispatches by API key.
   - The API-enabled check is a protocol/API-version check; the comment says SocketServer rejects APIs outside the exposed scope before handing them to the request handler.
   - No generic transport-currentness check is performed before dispatch.
   - Individual API handlers may contain their own authorization/state checks; that is separate evidence and cannot be generalized from this top-level method.
3. RequestChannel evidence from AB104.759R remains: sendRequest() puts the already-created Request into the shared request queue; there is no generic source path that removes an already-queued request merely because its client socket closes.

## Test evidence
KafkaRequestHandlerTest.java was inspected at the same commit. Existing tests cover callback timing, callback scheduling/thread behavior, and handler-pool metrics. No test was found that executes the exact adversarial interleaving:
enqueue Request -> originating socket closes -> queued Request dequeued -> API handler executes
with an assertion that transport closure cancels/revokes the queued application work.
No test was executed by this audit.

## Epistemic boundary
SOURCE_CONFIRMED: generic handler dequeues and invokes API handler without a generic transport-open revalidation.
SOURCE_CONFIRMED: RequestChannel queue is decoupled from socket receive lifecycle.
NOT_EXECUTED: exact disconnect-after-enqueue interleaving.
OPEN: API-specific authorization/current-session semantics; effect cancellation; provider-side consequences.

## Nexo implication
TRANSPORT_DISCONNECT != OPERATION_REVOKED
QUEUE_ENTRY != CURRENT_AUTHORITY
CHANNEL_CLOSE != EFFECT_CANCELLATION
A future protected execution boundary must establish current authority/fence independently of the stale transport/session origin. Do not infer that Kafka's generic handler provides that guarantee.

## Status
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

## Next exact mission
AB104.761R: select concrete Kafka APIs with externally meaningful effects and audit whether handler-level checks bind execution to current connection/session/authority, or whether authorization is entirely request-local. Do not generalize from one API.
