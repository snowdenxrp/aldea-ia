# NEXO AB104.658 — MockClient late-response race audit

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED.

Audit target: AB104.657 proposed sequence `ProduceRequest -> preserve pending request -> timeout/disconnect -> late response`.

Verified current behavior:
- `MockClient.disconnect(node, true)` iterates pending requests, queues a disconnected `ClientResponse`, and intentionally retains the request instead of removing it.
- `MockClient.poll()` drains queued responses and invokes callbacks.
- `MockClient.respondToRequest(request, response)` removes the targeted pending request and queues the supplied response.
- The default `MockClient.checkTimeoutOfPendingRequests()` calls `disconnect(request.destination())` with `allowLateResponses=false`; therefore it removes the request and is not suitable for the retained-late-response sequence.
- In real `NetworkClient`, request timeout handling clears the in-flight request from the connection and treats the node as disconnected. Current `Sender.handleProduceResponse()` maps a timed-out response to `Errors.REQUEST_TIMED_OUT`; a normal disconnected response maps to `Errors.NETWORK_EXCEPTION`. citeturn0search1turn0search3

Race/ordering result:
The proposed AB104.657 sequence is NOT a faithful model of a real Kafka timeout followed by a late response if it expects the same in-flight request to receive both a timeout/disconnect completion and then a normal response. The real `NetworkClient` removes timed-out in-flight requests, so a later network response for that correlation cannot be delivered through the normal in-flight matching path. The MockClient's `allowLateResponses=true` mode is therefore a special test fixture capability, not a direct reproduction of normal NetworkClient timeout semantics.

Safe test interpretation:
- It can test that application logic remains conservative when a fixture deliberately creates an ambiguous/late-response scenario.
- It cannot be labeled as a faithful proof that the production NetworkClient will deliver a late response after timeout.
- A production-faithful ambiguity test requires an integration/fault-injection layer that can cause the broker to accept/process the Produce request while suppressing/delaying the response, followed by an independent authoritative read.

Nexo consequence:
AB104.657's minimum test spec is revised from `faithful late response` to `fixture-level ambiguity guard`. The architecture must never use MockClient late-response behavior as proof of external commitment.

Evidence:
MOCKCLIENT_RACE_AUDIT=COMPLETE
PRODUCTION_NETWORKCLIENT_TIMEOUT_REMOVES_INFLIGHT=VERIFIED
FIXTURE_LATE_RESPONSE_EQUALS_PRODUCTION_SEMANTICS=NO
BROKER_DURABILITY_VERIFIED=NO
TEST_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.659 — research a production-faithful Kafka fault-injection mechanism for "broker accepts Produce, response suppressed/delayed", preferably using existing Apache Kafka integration/test infrastructure, and define the authoritative observation needed to resolve UNKNOWN.
