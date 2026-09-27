# NEXO AB104.648 — current Apache Kafka MockClient exact primitives

Date: 2026-09-27
Status: RESEARCH ONLY.

Canonical current path:
clients/src/testFixtures/java/org/apache/kafka/clients/MockClient.java
Blob SHA: e24c9f4dc95c07b2b4ca8ad9e7e1a617e40acc92

Verified primitives:
- requests: ConcurrentLinkedDeque<ClientRequest>
- responses: ConcurrentLinkedDeque<ClientResponse>
- futureResponses: ConcurrentLinkedDeque<FutureResponse>
- send() consumes a matching FutureResponse and constructs ClientResponse, or queues ClientRequest.
- disconnect(node, allowLateResponses) can convert pending requests into disconnected ClientResponse; with allowLateResponses=false the request is removed.
- poll() drains responses and invokes response.onComplete().
- respond(response) removes the next queued request and queues a ClientResponse.
- respondToRequest(request,response) removes a specific request and queues its response, allowing out-of-order response simulation.
- respondFrom(response,node,disconnected) removes the first request for a node and queues its response.
- prepareResponse(matcher,response,disconnected) places a FutureResponse for later matching.
- prepareUnsupportedVersionResponse uses the same FutureResponse mechanism.
- setUnreachable/backoff/throttle/delayReady/authenticationFailed provide connection-level fault controls.
- checkTimeoutOfPendingRequests(now) calls disconnect() when request timeout expires.
- waitForRequests() and numAwaitingResponses() expose synchronization/queue state.

Important correction:
The actual MockClient is a test fixture under clients/src/testFixtures, not the previously guessed clients/src/test path.

Mapping to prior E642 matrix:
E642-1 response suppression after broker acceptance: MockClient itself can model missing/disconnected responses, but it does NOT prove broker acceptance/durability.
E642-2 retriable response/error: can be modeled through prepared responses, but broker-side acceptance remains outside MockClient.
E642-3 multi-in-flight/reordering: respondToRequest provides explicit out-of-order response injection; actual producer configuration/in-flight behavior must be tested separately.
E642-5 transactional send + commit response loss: MockClient can inject disconnected responses, but transaction durability/commit outcome remains outside this fixture.
E642-6 timeout + late acceptance: timeout path disconnects pending request; allowLateResponses=true preserves request while injecting disconnect response, useful for ambiguity tests, but no broker acceptance proof.
E642-7 callback metadata vs consumer/read-to-end: MockClient callback completion is local client evidence only; read-to-end remains separate evidence surface.
E642-8 close unresolved: close() only marks client inactive and closes metadata updater; it is not external-effect proof.

Critical invariant retained:
CLIENT_CALLBACK_STATE != EXTERNAL_EFFECT_OUTCOME.

Evidence:
EXACT_MOCKCLIENT_BODY_VERIFIED=YES
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.649 — retrieve the exact current KafkaProducer tests that instantiate/use MockClient and identify concrete assertions around response loss, retries, ordering, timeout, and transaction completion. Do not infer test coverage from MockClient capability alone.
