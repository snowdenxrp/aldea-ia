# NEXO AB104.708 — Bounded setup deadline and lazy seek resolution
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current finding

Current Kafka source shows that position() calls updateFetchPositions() when no valid position exists. updateFetchPositions() first validates positions, then only consults committed offsets when the coordinator exists and a partition still lacks a position; otherwise it resets positions using the configured reset strategy. With manual assignment and no group.id, coordinator is absent, so the no-group path avoids committed-offset recovery. citeturn0search2

seekToBeginning() is lazy: the seek takes effect on a subsequent position()/poll path. Kafka documents that an invalid seek below the current log start is handled according to auto.offset.reset. citeturn0search0turn0search5

## Frozen setup algorithm

Use an explicit SETUP_DEADLINE, separate from OBSERVATION_DEADLINE.

1. assign(targetPartition)
2. call beginningOffsets() with remaining setup budget
3. seekToBeginning(targetPartition)
4. call position(targetPartition, remaining setup budget)
5. if position succeeds, freeze verifierStartingPosition
6. only then create OBSERVATION_DEADLINE

If any operation exceeds the setup budget or throws an unrecoverable exception:
HARNESS_SETUP_FAILURE.

## Retry boundary

Kafka's internal offset machinery may retry retriable ListOffsets/metadata failures until the supplied Timer expires. Nexo must therefore provide a bounded timeout to the public beginningOffsets()/position() calls rather than relying on default.api.timeout.ms.

A setup timeout is not NOT_OBSERVED.

## Critical race

The beginning offset captured in step 2 is diagnostic only. The log can advance/truncate before step 4. The authoritative starting coordinate is the successfully resolved position after seekToBeginning(), not the earlier beginningOffsets result.

If position resolves after a log-start movement, record the final position and any relevant exception/epoch diagnostics. Do not assume equality with the earlier beginning offset.

## Frozen deadlines

SETUP_DEADLINE:
- starts immediately before first broker-dependent setup call;
- bounded independently;
- failure => HARNESS_SETUP_FAILURE.

OBSERVATION_DEADLINE:
- starts only after successful position();
- controls PRESENT/NOT_OBSERVED observation.

This prevents setup latency, metadata convergence, or seek resolution from being misclassified as record absence.

## Status

VERIFIED:
- no-group manual assignment avoids committed-offset recovery path;
- seekToBeginning is lazy;
- position() forces resolution;
- bounded public timeouts bound setup work;
- earlier beginning offset is not the final authority for fetch start.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.709: inspect the exact log-start movement/truncation behavior between beginningOffsets() and position(), and freeze whether the base experiment should remove the preliminary beginningOffsets() call entirely to minimize this race.