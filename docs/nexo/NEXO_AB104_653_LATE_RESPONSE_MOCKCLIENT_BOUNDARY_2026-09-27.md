# NEXO AB104.653 — late-response MockClient boundary

Date: 2026-09-27
Status: RESEARCH ONLY.

Exact current MockClient.java was retrieved from Apache Kafka at the current trunk path `clients/src/testFixtures/java/org/apache/kafka/clients/MockClient.java`.

Verified exact behavior:
- `disconnect(String node, boolean allowLateResponses)` exists.
- When `allowLateResponses` is false, pending requests are removed.
- When `allowLateResponses` is true, the pending request is retained while a disconnected ClientResponse is generated.
- `checkTimeoutOfPendingRequests(nowMs)` calls disconnect(request.destination()) with the default false path when a request times out.
- `poll()` drains queued responses and invokes response completion callbacks.
- `respondToRequest(...)` can target a specific pending request, allowing controlled response injection.

Current KafkaProducerTest search found only one direct textual timeout-related candidate (`testInitTransactionsResponseAfterTimeout`) and no explicit `allowLateResponses` usage in the current file. Therefore there is NO verified current KafkaProducerTest showing a late response after a client timeout via this exact MockClient mechanism.

Nexo implication:
The MockClient primitive is capable of modeling an ambiguity window, but capability is not test coverage. Even if a late response is injected after timeout, that response proves only that the client received a later response in the simulation; it does not prove the broker accepted the original request unless the simulated response is independently tied to authoritative broker state.

Evidence:
MOCKCLIENT_LATE_RESPONSE_PRIMITIVE_VERIFIED=YES
CURRENT_KAFKAPRODUCERTEST_LATE_RESPONSE_TEST_VERIFIED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.654 — inspect `KafkaProducerTest` around `testInitTransactionsResponseAfterTimeout` and adjacent producer timeout tests to establish the exact state transition and whether the retry can create a duplicate/ambiguous external operation identity.
