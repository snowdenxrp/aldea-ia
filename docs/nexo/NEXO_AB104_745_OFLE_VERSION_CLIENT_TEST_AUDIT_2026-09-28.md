# NEXO AB104.745 — OFLE version coverage + client test inventory audit

Date: 2026-09-28
Status: RESEARCH ONLY

## Version evidence

Kafka's MessageTest contains testOffsetForLeaderEpochVersions(). It explicitly tests the OFLE request message across:
- all versions via testAllMessageRoundTrips(data);
- versions from ApiKeys.OFFSET_FOR_LEADER_EPOCH.oldestVersion() through version 1 for the current-leader-epoch compatibility distinction;
- version 2 onward for currentLeaderEpoch;
- version 3 onward for replicaId, with explicit pre-v3 omission/default behavior.

This establishes request-message round-trip coverage across the generated message's supported version range, but it is NOT equivalent to consumer reducer semantic coverage.

No analogous dedicated test named testOffsetForLeaderEpochResponseVersions was found in MessageTest.

## OFLE client test evidence

Current clients/src/test/java/org/apache/kafka/clients/consumer/internals/OffsetForLeaderEpochClientTest.java exists and directly exercises the consumer client:
- testEmptyResponse: empty response accepted and produces empty result.
- testUnexpectedEmptyResponse: when a requested partition is absent, it remains retryable.
- testOkResponse: requested partition with NONE is accepted and removed from retry.
- testUnauthorizedTopic: TOPIC_AUTHORIZATION_FAILED becomes terminal TopicAuthorizationException.
- testRetriableError: LEADER_NOT_AVAILABLE remains retryable.

Its helper constructs a single response entry for one requested partition. The inspected file does not establish tests for duplicate response entries, unrequested partitions, mixed requested/unrequested entries, mixed duplicate/error orderings, or correlation mismatch.

## Important correction to prior gap statement

AB104.743/744 said missing-requested and unrequested OFLE tests were not established. This must be refined:
- Missing requested partition: YES, executed directly by testUnexpectedEmptyResponse.
- Unrequested partition: NOT ESTABLISHED.
- Duplicate partition: NOT ESTABLISHED.
- Correlation mismatch generic Kafka: YES; OFLE-specific: NOT ESTABLISHED.

This is a correction, not an overwrite of history. The earlier audit remains preserved; the continuity record records the refined epistemic state.

## Semantic coverage boundary

The existing OFLE client tests cover a useful minimal semantic matrix, but do not establish exhaustive reducer closure. In particular, absence of a requested partition is covered as retryable, while an extra response partition and duplicate response entry remain uncharacterized by dedicated current tests.

Message serialization coverage and client semantic coverage must remain separate.

## Status

OFLE_REQUEST_MESSAGE_ROUNDTRIP_VERSION_COVERAGE=YES
OFLE_REQUEST_VERSION_TRANSITIONS_EXPLICITLY_TESTED=YES
OFLE_RESPONSE_VERSION_ROUNDTRIP_DEDICATED=NOT_ESTABLISHED
OFLE_CLIENT_EMPTY_RESPONSE=EXECUTED
OFLE_CLIENT_MISSING_REQUESTED_PARTITION=EXECUTED
OFLE_CLIENT_UNREQUESTED_PARTITION=NOT_ESTABLISHED
OFLE_CLIENT_DUPLICATE_PARTITION=NOT_ESTABLISHED
OFLE_CLIENT_MIXED_DUPLICATE_ORDER=NOT_ESTABLISHED
OFLE_CLIENT_CORRELATION_MISMATCH=NOT_ESTABLISHED
OFLE_DIRECT_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next action

AB104.746: inspect whether any existing OFLE client/helper test elsewhere supplies unrequested or duplicate response entries indirectly; inspect response schema/version handling for OFLE specifically. If no coverage is found, characterize the remaining minimal matrix and freeze it. No production modification, no Nexo implementation, no V21.
