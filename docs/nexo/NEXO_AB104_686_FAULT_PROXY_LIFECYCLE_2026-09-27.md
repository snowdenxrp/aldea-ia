# NEXO AB104.686 — Fault-proxy lifecycle isolation
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current source finding
KafkaProtocolFaultProxy.close() sets running=false, closes the server socket to unblock accept(), closes every registered Connection to unblock pump reads, clears the registry, then shuts down the executor and waits up to 10 seconds before shutdownNow().

Each request/response pump also removes its Connection and closes both sockets in finally. The accept loop has an explicit close-race guard: after creating a connection it checks running; if shutdown already began, it removes and closes the new connection.

## Isolation result
The direct verifier can run before proxy.close() with no proxy teardown race. The proxy only needs to remain alive while the producer's proxied response-loss path is being observed. Once the verifier evidence is frozen, proxy.close() deterministically tears down its sockets and threads.

The proxy's own close path cannot be used as broker-state evidence. Any socket/thread cleanup outcome is CLEANUP_ERROR or normal teardown only.

## Important causal boundary
For disconnectOn(PRODUCE): broker response is read by pumpResponses, the fault rule fires, the response is not forwarded, then that connection is closed. This is distinct from proxy.close(), which is initiated by the test after evidence freeze.

## Frozen lifecycle
ARM -> PRODUCE -> PRODUCER_OUTCOME -> DIRECT_BROKER_VERIFY -> EVIDENCE_FREEZE -> PRODUCER_CLEANUP -> PROXY_CLOSE -> CLUSTER_STOP

## Status
VERIFIED:
- proxy close implementation;
- accept/close race guard;
- connection unblocking and executor termination;
- separation between fault-triggered disconnect and test teardown.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.687: inspect the direct verifier's consumer assignment/poll/close lifecycle and freeze a bounded observation deadline that cannot be extended by teardown.
