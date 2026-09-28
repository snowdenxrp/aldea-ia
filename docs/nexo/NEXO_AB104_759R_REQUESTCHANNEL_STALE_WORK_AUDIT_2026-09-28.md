# NEXO AB104.759R — RequestChannel / stale-work audit

Date: 2026-09-28
Kafka source baseline: abf522e1ca5d7f4375baddc4da004da9fcb6e9ca

## Direct source findings

RequestChannel.sendRequest(request) puts the already-created Request into a shared ArrayBlockingQueue. The request is therefore decoupled from the socket receive lifecycle once enqueued.

receiveRequest() removes requests from that queue for handler processing. clear() can clear both request and callback queues, and shutdown() invokes clear.

The response path is processor-bound by request.processor. sendResponse() looks up that processor and enqueues the response; if the processor has already been removed/shut down, the response is dropped.

Critically, there is no source-level evidence in RequestChannel that closing a client socket automatically removes a Request that has already been placed in requestQueue. The transport close and application request queue are separate lifecycle domains.

RequestChannel.closeConnection(request, ...) generates a CloseConnectionResponse; it is an explicit response path, not a general revocation mechanism for arbitrary already-queued work.

## Evidence boundary

This audit did not execute runtime tests. Repository search did not establish a dedicated test proving the exact sequence socket close -> request already queued -> handler executes -> external effect. Therefore persistence of queued work after transport closure is source-derived from separation of queue and selector lifecycle, while the exact runtime interleaving remains NOT_EXECUTED.

## Nexo relevance

TRANSPORT_DISCONNECT != OPERATION_REVOKED
QUEUE_ENTRY != CURRENT_AUTHORITY
CHANNEL_CLOSE != EFFECT_CANCELLATION

A future Nexo protected transition must therefore bind operation execution to current authority/fence at the execution boundary, not merely to the validity of the originating transport/session.

No Kafka production source changed. No Nexo implementation. V21 remains forbidden/not started.
