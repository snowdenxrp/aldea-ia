# NEXO AB104.705 — Position initialization is not committed-offset recovery
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current finding

Current Kafka 4.1.2 documentation distinguishes consumer position from committed position. `position()` is the next record to fetch; `committed()` is the stored group offset used for recovery. `beginningOffsets()` retrieves the earliest available broker offset and explicitly does not change consumer position. `seekToBeginning()` explicitly moves the assigned partition toward its earliest available offset. `assign()` disables group coordination. citeturn0search0turn0search1

## Frozen verifier sequence

1. `assign(targetPartition)`
2. `beginningOffsets(targetPartition)` -> diagnostic earliest available offset
3. `seekToBeginning(targetPartition)`
4. `position(targetPartition)` -> actual next-fetch position
5. start fixed monotonic observation deadline
6. `poll(remaining)`

No `committed()`, `committed(offset)`, `seek(OffsetAndMetadata)`, `subscribe()`, or commit API is allowed.

## Important boundary

`position()` may perform a remote call when no current position exists, but this is position initialization, not a lookup of the consumer's committed group offset. The verifier therefore treats position acquisition as part of setup and freezes its value before observation.

If any setup operation fails or times out, classification is `HARNESS_SETUP_FAILURE`, not `NOT_OBSERVED`.

## Evidence meaning

`verifierBeginningOffset` = earliest available broker offset observed at setup.

`verifierStartingPosition` = actual consumer fetch position after explicit seek.

Neither is proof that a target record exists or does not exist.

The exact identity observation in a successful poll remains the only `PRESENT` proof in this verifier.

## Frozen invariant

No committed consumer offset participates in the base evidence path.

This removes the remaining group-offset ambiguity from AB104.701–704.

## Status

VERIFIED:
- beginningOffsets() does not change consumer position;
- seekToBeginning() controls the assigned partition's fetch position;
- position() reports next-fetch position;
- committed offsets are a separate API/state;
- manual assignment disables group coordination.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.706: inspect exact remote metadata/fetch behavior for beginningOffsets()/position() and freeze the setup-time authority boundary, including which broker response can legitimately establish the verifier's starting position.