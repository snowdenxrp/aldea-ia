# NEXO AB104.710 — auto.offset.reset=none boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Research finding

Kafka 4.1.2 documents `auto.offset.reset=none` as the strategy that throws `NoOffsetForPartitionException` when no initial offset is available. By contrast, `earliest` can reset to the earliest available offset. `OffsetOutOfRangeException` and `LogTruncationException` are distinct invalid/truncation conditions exposed by the consumer API. citeturn1view0turn1view1

## Frozen decision

For the AB104 base verifier, use `auto.offset.reset=none` rather than `earliest` once implementation begins.

Reason: the experiment must not silently repair an invalid starting coordinate. A reset would change the read window without making that semantic transition explicit.

## Boundary

If the explicitly requested `seekToBeginning()` cannot establish a valid position because the partition's available range changed, classify the condition as `SETUP_POSITION_INVALID` / `HARNESS_SETUP_FAILURE` unless the harness has separately and explicitly modeled the truncation event.

Do NOT convert this condition to `NOT_OBSERVED`.

Do NOT silently fall back to `earliest`.

## Important nuance

`auto.offset.reset=none` does not make `seekToBeginning()` itself a proof of historical continuity. It only prevents the consumer from silently choosing a replacement offset when no valid initial position exists.

The final `position()` after successful explicit seek remains the authority for the actual read coordinate. `beginningOffsets()` remains diagnostic.

## Frozen evidence states

- VALID_START: position successfully resolved after explicit seek.
- SETUP_POSITION_INVALID: requested starting coordinate could not be established without an implicit reset.
- HARNESS_SETUP_FAILURE: setup cannot produce a valid verifier coordinate within the setup deadline.
- NOT_OBSERVED: only reachable after VALID_START and a completed observation window with successful reads and no exact identity.

## Status

VERIFIED:
- `none` prevents implicit offset reset when no initial offset exists;
- `earliest` can alter the starting coordinate by resetting to the current earliest available offset;
- invalid/truncated offset conditions have dedicated Kafka error semantics.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.711: inspect `LogTruncationException` and offset-out-of-range semantics in the exact manual-assignment path, then freeze whether truncation is a separate evidence state rather than generic setup failure.