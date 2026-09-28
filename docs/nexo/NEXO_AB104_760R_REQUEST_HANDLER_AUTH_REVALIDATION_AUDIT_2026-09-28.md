# NEXO AB104.760R — request-handler revalidation / stale-work audit

Date: 2026-09-28
Kafka baseline: abf522e1ca5d7f4375baddc4da004da9fcb6e9ca

## Direct source findings

KafkaRequestHandler receives a BaseRequest from RequestChannel and dispatches a Request directly to apis.handle(request, requestLocal). The handler records dequeue time, sets the current request, invokes the API handler, catches ordinary Throwables, and finally releases the request buffer.

No generic transport/session revalidation is performed by KafkaRequestHandler immediately before `apis.handle`. The handler does not check that the originating socket/channel is still open before invoking the API handler.

For callbacks, the RequestChannel/current request is captured and callbacks can be rescheduled onto an arbitrary request thread. The callback path likewise does not perform a generic transport-authority revalidation before executing the callback function.

The source therefore reinforces the AB104.759R boundary: once work has crossed into the request-handler queue, socket lifetime is not itself a generic authorization gate.

## Evidence boundary

Repository search did not establish a dedicated test for the exact interleaving: enqueue request -> close originating socket -> handler dequeues -> API handler executes -> external effect. No runtime execution was performed by this audit.

API-specific authorization checks may exist inside individual handlers, but they are not equivalent to generic transport/session revalidation and must be audited per API before being treated as a cancellation/fencing mechanism.

## Nexo consequence

A protected operation must revalidate current authority/fence at the execution boundary. Transport/session liveness can be an input, but cannot be the sole proof that queued work remains authorized.

Status: HANDLER_TRANSPORT_REVALIDATION=NOT_PRESENT_GENERICALLY; QUEUED_WORK_AFTER_CLOSE_RUNTIME=NOT_EXECUTED; API_SPECIFIC_AUTHORIZATION=REQUIRES_SEPARATE_AUDIT.

No Kafka production source changed. No Nexo implementation. V21 remains forbidden/not started.
