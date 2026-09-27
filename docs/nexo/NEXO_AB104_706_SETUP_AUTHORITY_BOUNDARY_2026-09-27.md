# NEXO AB104.706 — Setup authority boundary for offset initialization
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source finding

Current Kafka 4.1.2 implements beginningOffsets through OffsetFetcher, which issues ListOffsets requests for the earliest timestamp. The ListOffsets protocol is broker-facing and carries isolation level and current leader epoch fields; it is not a consumer-group committed-offset lookup. The KafkaConsumer API documents beginningOffsets as returning the earliest available offset without changing consumer position. position() may issue a remote call when no current position exists and returns the next fetch position.

## Frozen authority boundary

Setup authority is limited to broker responses for:
- partition existence/metadata needed to address the target;
- earliest available offset from ListOffsets;
- the consumer's resulting local fetch position after seekToBeginning.

These establish only the verifier's starting read coordinate.

They do NOT establish:
- target record presence;
- target record absence;
- producer acknowledgement;
- external effect outcome;
- historical durability beyond what remains readable.

## Important distinction

ListOffsets is an authoritative broker read for offset metadata, but it is not an authoritative business-effect proof.

Therefore:
StartingOffsetEvidence != EffectOutcomeEvidence.

The latter still requires the direct poll path and exact effect identity.

## Frozen setup sequence

1. assign(targetPartition)
2. beginningOffsets(targetPartition)
3. seekToBeginning(targetPartition)
4. position(targetPartition)
5. freeze verifierStartingPosition
6. start monotonic observation deadline
7. poll and scan complete batches

If beginningOffsets/position fails, setup is HARNESS_SETUP_FAILURE. Do not enter NOT_OBSERVED.

## Current source nuance

seekToBeginning() is lazy: the seek is applied when poll() or position() is called. Therefore AB104.705's explicit position() call forces resolution of the requested starting position before the observation deadline begins.

## Status

VERIFIED:
- beginningOffsets uses broker-side ListOffsets machinery;
- it is separate from committed consumer offsets;
- isolation level participates in ListOffsets;
- seekToBeginning is lazy and position() can force resolution;
- starting offset is setup evidence, not effect evidence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.707: inspect ListOffsets response/error semantics (leader changes, NOT_LEADER, OFFSET_OUT_OF_RANGE, truncation-related conditions) and freeze which setup failures invalidate the verifier versus which can safely retry before the observation deadline.