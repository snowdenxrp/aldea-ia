# NEXO AB104.663 — KAFKA-21074 source-level verification

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

PR #23438 was inspected at exact head commit `d5bef784f0ab6d1d85177fca6356e1fbce59ba64`; GitHub reports the PR is now MERGED with merge commit `7cd729ff935ef57e3db075fcd92f768f5c2ef4a6`, correcting the earlier status assumption that it was still open. The PR adds reusable test-fixture code under `clients/src/testFixtures/java/org/apache/kafka/test/faultproxy/`. citeturn0search0

Exact source behavior verified:
1. `pumpRequests` forwards client frames verbatim to the broker and records each request header by correlation ID.
2. `pumpResponses` reads frames from the broker socket, extracts the correlation ID, removes the corresponding request header, and derives the API key/client ID.
3. Fault rules are evaluated on the broker->client response path, not on the request path.
4. `disconnectOn(PRODUCE).once()` therefore fires when a Produce response has already arrived at the proxy from the broker; the proxy then stops pumping and closes the connection before the response reaches the producer.
5. `delayOn(PRODUCE, Duration)` sleeps in the response pump after receiving the broker response, then forwards the original bytes.
6. `injectError(PRODUCE, Errors)` parses the already-received ProduceResponse, modifies partition error codes, and re-serializes it.
7. `blackholeClient(...)` is explicitly different: it drops the request before the broker sees it and therefore cannot establish the post-broker ambiguity required here.

This closes the exact seam question:
`broker response received by proxy -> response suppressed/delayed -> producer timeout/disconnect` is supported by the PR's implementation, not merely its title/description.

Important epistemic boundary:
The proxy's `disconnectOn(PRODUCE)` proves that the broker-side response frame reached the proxy. It does NOT by itself prove that the record is durably replicated according to the requested `acks`/ISR semantics. Independent topic observation remains necessary to classify the external effect. A proxy-level observation is evidence of response-path interception, not a substitute for broker durability proof.

Status:
POST_BROKER_RESPONSE_INTERCEPTION=VERIFIED
PRODUCE_RESPONSE_DROP_CAPABILITY=VERIFIED_AT_PR_SOURCE
PRODUCE_RESPONSE_DELAY_CAPABILITY=VERIFIED_AT_PR_SOURCE
REQUEST_PRE_BROKER_BLACKHOLE_DISTINGUISHED=VERIFIED
MERGED_IN_GITHUB=YES
TEST_IMPLEMENTED_IN_NEXO=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.664 — inspect the merged result on Apache Kafka `trunk` (not only the PR head) to verify exact current availability/path and then design the smallest real-broker test using `disconnectOn(PRODUCE).once()` plus an independent consumer/read-to-end observation.
