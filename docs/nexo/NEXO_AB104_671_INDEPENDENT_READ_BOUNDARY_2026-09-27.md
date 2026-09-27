# NEXO AB104.671 — Independent read boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Verified current Kafka integration patterns
The existing fault-proxy plain-client test uses:
- EmbeddedKafkaCluster(1)
- KafkaConsumer with AUTO_OFFSET_RESET=earliest
- polling until an expected record count is reached
- a bounded wall-clock deadline.

The existing fault-proxy Streams test provides the stronger observation pattern needed here:
- verifier consumer connects to `cluster.bootstrapServers()`, bypassing the proxy;
- verifier can use `read_committed`;
- IntegrationTestUtils has bounded wait helpers for expected records.

## Correct evidence boundary for AB104 response-loss
For the first Produce response-loss experiment, use a dedicated verifier consumer connected directly to `cluster.bootstrapServers()`, with a unique verifier group and earliest offset.

The record identity MUST be exact and independent of producer callback state:
- unique effectId in key/value;
- topic;
- partition;
- offset;
- optionally record timestamp/value digest.

Observation classifications:
1. PRESENT:
   exact effectId observed; capture partition+offset.
   This is authoritative evidence that the broker log exposed the record to an independent reader.
2. NOT_OBSERVED:
   the exact effectId was not observed before the read deadline.
   This is NOT proof of NOT_COMMITTED.
3. READ_PATH_ERROR:
   verifier could not complete the observation.
   Commit state remains UNKNOWN.

## Narrowest useful read
Because the test creates one topic partition, the verifier can poll from earliest and search only for the unique effectId. No global count assertion is required; count can hide duplicates or unrelated records.

If the producer record is observed, the experiment establishes the key ambiguity:
ProducerClientOutcome = failed acknowledgement/network outcome
BrokerRecordObservation = PRESENT(offset)

If the record is not observed, the experiment must retain UNKNOWN rather than infer absence from a timeout.

## Important distinction
The consumer proves log visibility to an independent reader, not universal durability after broker failure. With a one-broker replication factor of 1:
BROKER_DURABILITY_VERIFIED = NO.

## Recommended verifier configuration
- bootstrap.servers = cluster.bootstrapServers()
- group.id = unique verifier identity
- auto.offset.reset = earliest
- enable.auto.commit = false
- key/value deserializers = String
- isolation.level = read_committed is acceptable for this non-transactional produce; it also matches the stronger existing verifier pattern.
- bounded polling loop with explicit deadline.
- close consumer in try-with-resources.

## Evidence record
Record separately:
- ProducerFutureOutcome
- ProducerException
- FaultRule.timesTriggered()
- FaultRule.timesMatched()
- VerifierObserved
- VerifierTopic
- VerifierPartition
- VerifierOffset
- VerifierDeadline
- ObservationClass = PRESENT | NOT_OBSERVED | READ_PATH_ERROR

Do not derive ExternalEffectOutcome from ProducerFutureOutcome.

## Status
VERIFIED:
- direct-broker verifier pattern;
- bounded polling/read helpers;
- exact-record observation is compatible with existing Kafka integration tests.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.672: inspect exact current KafkaProducer failure exception path for response-loss DISCONNECT and determine the assertion that is safe without assuming a particular exception wrapper/version-specific message.
