# NEXO AB104.715 — LogTruncationException public semantics and tests
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source evidence
Kafka 4.1 source defines LogTruncationException as a public OffsetOutOfRangeException subclass. Its public constructor accepts fetchOffsets and divergentOffsets. The public divergentOffsets() accessor returns an unmodifiable map.

The documented meaning is precise: divergentOffsets contains the first offset known to diverge from what the consumer previously read. Kafka explicitly states that this offset is not guaranteed to be known; callers must inspect partitions() and then check presence in divergentOffsets().

Current OffsetFetcherTest covers AutoOffsetResetStrategy.NONE for both undefined epoch/offset and a concrete divergent end offset. It asserts:
- offsetOutOfRangePartitions() contains the original fetch offset;
- undefined epoch/offset => divergentOffsets() is empty;
- concrete epoch/end offset => divergentOffsets() contains OffsetAndMetadata(endOffset, leaderEpoch, empty metadata string);
- validation remains awaiting when NONE is used.
The test also verifies an in-flight validation response is ignored after the consumer seeks to a different position.

## Nexo consequences
1. `divergentOffsets` is an optional coordinate, not a mandatory field.
2. Empty `divergentOffsets` is explicitly supported and must remain UNKNOWN, not interpreted as “no truncation”.
3. The fetch offset is the consumer's out-of-range/request coordinate; it is distinct from the first known divergent broker coordinate.
4. A stale response after a seek is explicitly tested as ignored, strengthening the requirement to bind evidence to the active position.
5. Kafka's public exception does not expose all internal FetchPosition provenance, so Nexo must preserve its own richer evidence before collapsing to the exception-level representation.

## Important scope boundary
Kafka's exception documentation describes loss of previously committed log data after an unclean leader election. This is a statement about Kafka log semantics; it does not establish the status of an arbitrary external EffectID. Nexo must not translate LogTruncationException into external-effect absence.

## Status
SOURCE_CODE_VERIFIED=YES
TEST_SEMANTICS_VERIFIED=YES
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.716: inspect the exact `partitions()` / `offsetOutOfRangePartitions()` inheritance semantics in OffsetOutOfRangeException and verify how multi-partition truncation is represented, including whether map ordering or mutation guarantees matter for Nexo evidence serialization.
