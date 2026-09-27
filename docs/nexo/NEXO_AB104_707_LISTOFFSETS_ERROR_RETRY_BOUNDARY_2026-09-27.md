# NEXO AB104.707 — ListOffsets setup retry/error boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current source finding

Current Kafka OffsetFetcherUtils explicitly retries ListOffsets partitions for:
- NOT_LEADER_OR_FOLLOWER
- REPLICA_NOT_AVAILABLE
- KAFKA_STORAGE_ERROR
- OFFSET_NOT_AVAILABLE
- LEADER_NOT_AVAILABLE
- FENCED_LEADER_EPOCH
- UNKNOWN_LEADER_EPOCH
- UNKNOWN_TOPIC_OR_PARTITION

Authorization failure is terminal as TopicAuthorizationException. The protocol also defines REQUEST_TIMED_OUT and NETWORK_EXCEPTION as retriable errors. citeturn0search2turn0search0turn0search5

Current ListOffsets protocol versions include current leader epoch specifically for fencing stale-leader queries. citeturn0search8turn0search10

## Frozen verifier setup policy

### Retryable before observation deadline
Leader/metadata convergence failures may be retried by Kafka's normal offset-fetch machinery:
- NOT_LEADER_OR_FOLLOWER
- LEADER_NOT_AVAILABLE
- REPLICA_NOT_AVAILABLE
- FENCED_LEADER_EPOCH
- UNKNOWN_LEADER_EPOCH
- KAFKA_STORAGE_ERROR
- OFFSET_NOT_AVAILABLE
- REQUEST_TIMED_OUT
- NETWORK_EXCEPTION
- UNKNOWN_TOPIC_OR_PARTITION when the topic/partition is expected to exist and creation/metadata propagation is still converging.

These do NOT produce NOT_OBSERVED. They remain setup pending until successful position initialization or the bounded setup deadline expires.

### Terminal setup failure
- TOPIC_AUTHORIZATION_FAILED -> HARNESS_SETUP_FAILURE
- persistent unexpected protocol/client exception -> HARNESS_SETUP_FAILURE
- topic genuinely absent after bounded setup convergence -> HARNESS_SETUP_FAILURE
- inability to establish a valid starting position by setup deadline -> HARNESS_SETUP_FAILURE

## Critical epistemic boundary

An offset-fetch error is never evidence that the target record was absent.

Likewise, successful ListOffsets only establishes a starting coordinate. It cannot establish effect presence or absence.

## Leader-epoch refinement

The verifier may capture the leader epoch returned with ListOffsets as optional diagnostic evidence. A leader epoch change during setup is not itself an error; Kafka's offset-fetch machinery is designed to refresh metadata/retry stale-leader cases.

If setup eventually succeeds, freeze the final successful starting position and associated optional leader epoch. Earlier failed attempts remain diagnostics.

## Timing

Use a separate bounded SETUP_DEADLINE before the observation deadline. The observation deadline starts only after successful:
assign -> beginningOffsets -> seekToBeginning -> position.

This prevents metadata convergence time from being misclassified as NOT_OBSERVED.

## Status

VERIFIED:
- current retry classifications in OffsetFetcherUtils;
- ListOffsets leader-epoch fencing;
- authorization is terminal;
- setup errors are not absence evidence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.708: inspect the exact `seekToBeginning()` + `position()` retry interaction and determine whether Kafka itself can retry indefinitely; freeze the bounded setup deadline needed by the Nexo harness.