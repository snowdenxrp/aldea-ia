# NEXO AB104.656 — Produce timeout seam analysis

Date: 2026-09-27
Status: RESEARCH ONLY.

Exact current Apache Kafka `Sender` source was inspected together with current `KafkaProducer` and `MockClient` evidence.

Verified implementation seam:
- `Sender.sendProduceRequest(...)` marks each `ProducerBatch` in-flight, builds a `ProduceRequest`, creates a `ClientRequest` with `requestTimeoutMs`, and sends it through the injected `KafkaClient`.
- The completion callback enters `handleProduceResponse(...)`.
- If the response `wasTimedOut()`, Sender converts the client-side timeout into `Errors.REQUEST_TIMED_OUT` for the affected batch and may retry when retry conditions hold.
- The request callback therefore operates below the application-level `send()` future and is the correct seam for a simulated Produce timeout.
- `MockClient.checkTimeoutOfPendingRequests(...)` can generate the timeout/disconnect path; `respondToRequest(...)` can later target a retained pending request when a late-response setup deliberately uses `allowLateResponses=true`.

Important distinction:
The normal MockClient timeout checker uses `disconnect(request.destination())`, whose default is `allowLateResponses=false`. Therefore a purpose-built late-Produce test must deliberately preserve the request or otherwise inject a response through a controlled test seam. The current KafkaProducerTest does not already provide this exact test.

Minimum conceptual test (NOT implemented/executed):
1. Construct KafkaProducer with MockClient + MockTime and valid metadata.
2. Call `send(record)` and wait until a ProduceRequest is in flight.
3. Advance MockTime past request timeout / trigger the client timeout path.
4. Assert the application-facing callback/future is not treated as broker proof merely because a timeout/error is observed.
5. Inject a later ProduceResponse for the same request identity in the simulated client.
6. Record that the late response is client-observed evidence only.
7. If the test is extended to a real Kafka integration environment, independently consume/read authoritative broker state to resolve whether the record actually committed.

Nexo implication:
A late ProduceResponse is not by itself a durable ExternalEffectOutcome. The test must keep `ClientCallbackState` separate from `ExternalEffectState`, and only an independent authoritative observation can promote UNKNOWN to COMMITTED/NOT_COMMITTED.

External research corroborates the implementation boundary: current Kafka Sender explicitly handles timed-out Produce responses, while KafkaProducer documentation notes timeout means the acknowledgement was not obtained in time rather than proving the request never reached the broker. citeturn0search0turn0search2

Evidence:
CURRENT_SENDER_BODY_VERIFIED=YES
PRODUCE_TIMEOUT_SEAM_VERIFIED=YES
LATE_PRODUCE_TEST_EXISTS=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.657 — retrieve the exact current `MockClient` request/timeout APIs plus relevant `KafkaProducerTest` setup around `send(record)` and determine whether the minimum conceptual test can be specified with exact existing primitives (without implementing it).
