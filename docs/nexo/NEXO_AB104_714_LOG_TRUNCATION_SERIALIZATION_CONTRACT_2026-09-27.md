# NEXO AB104.714 — LogTruncation serialization contract
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source evidence
Kafka SubscriptionState.LogTruncation contains exactly three fields:
- TopicPartition topicPartition
- FetchPosition fetchPosition
- Optional<OffsetAndMetadata> divergentOffsetOpt

FetchPosition contains offset, optional offsetEpoch, and currentLeader. Its equality includes all three fields. LogTruncation.toString() exposes partition, fetch offset, fetch epoch, and either divergent offset/epoch or unknown values.

Fetcher.buildLogTruncationException() converts a list of LogTruncation records into two maps:
- truncatedFetchOffsets: partition -> fetchPosition.offset
- divergentOffsets: partition -> divergent OffsetAndMetadata, only when present
The exception is constructed from those maps. Thus the public exception loses FetchPosition.currentLeader and the full FetchPosition object, while preserving the fetch offset and optional divergent offset/leader epoch.

## Nexo evidence contract
Do not treat the Kafka exception maps as a complete Nexo provenance record. They are sufficient to represent the two coordinates Kafka exposes at exception level, but not the complete validation context.

Minimum Nexo record must therefore preserve separately:
1. TopicPartition
2. requested/current fetch offset
3. requested fetch epoch when available
4. divergent offset when available
5. divergent leader epoch when available
6. validation-response matched active FetchPosition = yes/no
7. current leader identity when available
8. observation/setup phase
9. exact identity observed before truncation = yes/no
10. timestamp/deadline and observation epoch
11. source exception/type and raw outcome classification

## Critical epistemic rule
`divergentOffsetOpt = empty` means Kafka did not expose a concrete divergent coordinate in that LogTruncation object. It does NOT mean offset zero, absence of divergence, or effect absence. Preserve UNKNOWN rather than synthesizing a coordinate.

Likewise, the presence of a divergent offset proves a Kafka log-position divergence condition; it does not prove that a particular external effect was never committed, was deleted, or is unrecoverable.

## Source-backed state mapping
- exact identity observed before truncation -> PRESENT remains frozen;
- truncation after observation but before identity -> LOG_TRUNCATION_UNRESOLVED;
- empty divergent coordinate -> LOG_TRUNCATION_UNRESOLVED + divergent-coordinate UNKNOWN;
- setup position invalidation -> SETUP_POSITION_INVALID;
- retriable request failure -> retry, not truncation evidence.

## Status
SOURCE_CODE_VERIFIED=YES
SEMANTIC_INTERPRETATION=BOUNDED
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.715: inspect LogTruncationException public accessors/constructors and tests to determine whether any additional externally observable semantics must enter the Nexo evidence contract.
