# NEXO AB104.716 — OffsetOutOfRange multi-partition semantics
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source evidence
Kafka OffsetOutOfRangeException stores a Map<TopicPartition, Long> named offsetOutOfRangePartitions and exposes it through offsetOutOfRangePartitions(). Its partitions() implementation returns the map's keySet(). The public API does not impose an ordering contract on that map.

LogTruncationException inherits this partition set and stores divergentOffsets separately as an unmodifiable map. Kafka's current truncation builder creates both maps with HashMap. Therefore Nexo must not use map iteration order as semantic ordering or as an evidence sequence.

## Multi-partition consequence
A single LogTruncationException can represent multiple truncated partitions. Each partition has an independent fetch offset, and divergentOffsets may contain only a subset of those partitions because Kafka explicitly permits the divergent coordinate to be unknown.

Therefore serialization must be keyed by TopicPartition, with explicit per-partition presence/UNKNOWN state. Never align two maps by iteration index.

## Mutation consequence
OffsetOutOfRangeException does not wrap the supplied map in an unmodifiable view. LogTruncationException does wrap divergentOffsets. This difference is an implementation/API detail and means Nexo should snapshot/canonicalize evidence itself rather than retaining exception map object identity or mutability semantics.

## Ordering rule
Canonical Nexo evidence serialization must define its own deterministic partition ordering (for example lexical topic then numeric partition) rather than inheriting HashMap order. This is a serialization rule, not a Kafka semantic claim.

## Frozen interpretation
- partition present in exception => Kafka reported that partition as out-of-range/truncated according to the exception path;
- partition absent => no conclusion about that partition;
- partition present but absent from divergentOffsets => divergent coordinate UNKNOWN;
- divergent coordinate present => first known divergence coordinate for that partition, not proof about external EffectID state.

## Status
SOURCE_CODE_VERIFIED=YES
SEMANTIC_INTERPRETATION=BOUNDED
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.717: inspect the exact construction and propagation path for multi-partition truncation through OffsetFetcher/PositionsValidator, including cached exception replacement/retention semantics.
