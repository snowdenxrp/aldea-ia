# NEXO AB104.659 — production-faithful Produce fault-injection route

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Research target: model `broker accepts Produce -> producer acknowledgement lost/delayed -> independent observation resolves UNKNOWN` without relying on MockClient's artificial late-response capability.

Findings:
1. Current `Sender.handleProduceResponse()` distinguishes timed-out/disconnected client responses from actual ProduceResponse data and feeds the resulting error into batch completion/retry logic. citeturn0search1
2. Current Kafka integration/system-test infrastructure supports real broker clusters and independent producer/consumer validation. Apache's system-test documentation describes the ducktape framework for distributed Kafka tests, and its end-to-end test template explicitly produces records, consumes them, injects failure logic, then validates delivery. citeturn0search7turn0search3
3. Current KafkaProducer source itself explicitly warns that a transaction timeout does not mean the request never reached the broker; it means the acknowledgement was not obtained in time. This is consistent with Nexo's UNKNOWN rule. citeturn0search6
4. A production-faithful test therefore needs the network/broker layer to suppress or delay the response after the request can have reached the broker. A pure MockClient test cannot establish this.

Minimum faithful harness shape:
- real multi-broker Kafka cluster;
- producer with a uniquely identifiable record/effect identity;
- intercept or fault the Produce response path after request transmission (network proxy/fault layer or equivalent Kafka integration fault seam);
- cause producer-side timeout/disconnect;
- independently consume/read the target partition after stabilization;
- classify external state from the authoritative observation, not from producer callback.

Required outcomes to record separately:
CLIENT_TIMEOUT
CLIENT_RETRY
BROKER_RECORD_OBSERVED
BROKER_RECORD_NOT_OBSERVED_WITH_AUTHORITY
EXTERNAL_OUTCOME_UNKNOWN_WHEN_OBSERVATION_BOUNDARY_IS_INSUFFICIENT

Important limitation:
The current evidence establishes the correct integration-test architecture and independent-consumer validation pattern, but does NOT yet identify an exact current Apache Kafka built-in hook that suppresses one Produce response after broker append. That exact fault seam remains open and must be researched before implementation.

Evidence:
PRODUCTION_FAITHFUL_TEST_SHAPE=ESTABLISHED
REAL_BROKER_VALIDATION_PATTERN=VERIFIED
EXACT_RESPONSE_SUPPRESSION_HOOK=NOT_YET_VERIFIED
TEST_IMPLEMENTED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.660 — inspect Apache Kafka's current integration-test network/fault-injection utilities and locate an exact existing mechanism for delaying/dropping a Produce response after request handling.
