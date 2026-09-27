# NEXO AB104.657 — minimum Produce timeout/late-response test specification

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED.

Goal: specify the smallest current-Kafka test that demonstrates client-side ambiguity for a Produce request without claiming broker durability.

Existing primitives verified:
- `KafkaProducer` test constructor accepts injected `ProducerMetadata`, `MockClient`, and `Time`.
- `MockClient` exposes pending-request inspection and response injection.
- `MockClient.disconnect(node, true)` can preserve a pending request while producing a disconnected response; `respondToRequest(request, response)` can later target a retained request.
- `KafkaProducer.send(record)` returns a RecordMetadata future; Sender creates the Produce request and handles its response/timeout.
- `request.timeout.ms` bounds waiting for a request response; `delivery.timeout.ms` bounds total record delivery time and must be >= request timeout + linger.

Minimum test specification:
A. Setup
1. MockTime.
2. ProducerMetadata containing one known topic/partition.
3. MockClient attached to KafkaProducer.
4. `request.timeout.ms` small enough for deterministic simulated timeout; `delivery.timeout.ms` larger than request timeout.
5. retries configured so the test can explicitly distinguish first-request timeout from eventual retry behavior.

B. Establish request identity
6. `producer.send(record)`.
7. Wait for exactly one ProduceRequest to become in-flight.
8. Capture the actual ClientRequest object/reference before forcing timeout.

C. Ambiguity injection
9. Preserve the pending request using the explicit `allowLateResponses=true` disconnect path rather than the default timeout path.
10. Advance/process time until the producer-side request is observed as timed out / disconnected.
11. Assert that the application-visible state is not treated as authoritative external outcome.
12. Inject a ProduceResponse targeted to the retained request using `respondToRequest`.
13. Observe the callback/future behavior and record it strictly as CLIENT_CALLBACK_STATE.

D. Required assertions
- A timeout/disconnect does not establish NOT_COMMITTED.
- A later client response does not establish COMMITTED.
- Any retry has a separately observable attempt/request identity.
- No assertion may equate callback success with external durable state.

E. Real-broker extension (separate test layer)
To resolve the ambiguity, repeat the fault against an actual broker/integration environment and independently read authoritative topic state using a consumer/read-to-end observation. Only that independent observation can promote the external-effect claim.

Important constraint:
This specification intentionally does not implement or execute the test. It is a research artifact defining the exact next experiment. The current Kafka documentation confirms request timeout controls response waiting and may cause resend/failure, while delivery timeout governs total record delivery reporting. citeturn0search0turn0search1

Evidence:
EXACT_PRIMITIVES_VERIFIED=YES
TEST_SPECIFIED=YES
TEST_IMPLEMENTED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.658 — verify the exact `MockClient` disconnect/response behavior against the proposed sequence and identify any hidden race that would make the specification invalid or nondeterministic before implementation is ever considered.
