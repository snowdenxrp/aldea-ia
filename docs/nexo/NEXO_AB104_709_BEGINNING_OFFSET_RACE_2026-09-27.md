# NEXO AB104.709 — Beginning-offset race and setup evidence
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka 4.1.2 documents that beginningOffsets() is a snapshot of the first offset currently available and does not change consumer position. seekToBeginning() is lazy and the seek takes effect on a subsequent position()/poll path. If a seek resolves to an invalid offset, auto.offset.reset controls behavior; with `earliest`, the consumer resets to the current beginning, while `none` throws OffsetOutOfRangeException. Kafka also notes that the seek does not alter an in-flight fetch request. citeturn0search2turn0search1

## Frozen decision

KEEP beginningOffsets() as diagnostic setup evidence for AB104, but it is NOT the authority for the final starting position.

The authoritative starting coordinate remains the successfully resolved `position()` after seekToBeginning().

This preserves useful audit evidence without turning the preliminary snapshot into a false invariant.

## Why not remove it

Removing beginningOffsets() would reduce one broker interaction, but it would also remove an explicit record of the earliest available offset at setup. That value is useful for explaining why a later starting position differs, especially if log-start movement or retention occurs between calls.

Therefore the additional observation surface is accepted because it is metadata-only and cannot create PRESENT/NOT_OBSERVED.

## Critical reset boundary

The base verifier must avoid silently relying on auto.offset.reset to repair an unexpected invalid seek.

Recommended base configuration remains:
`auto.offset.reset=none`

Then an invalid resolved seek produces an explicit OffsetOutOfRangeException rather than silently changing the evidence window.

If the experiment specifically needs earliest reset semantics, that must be a separate, explicitly named variant; it must not be hidden inside the base verifier.

## Truncation distinction

A later LogTruncationException/OffsetOutOfRangeException during active fetching is READ_PATH_ERROR, not NOT_OBSERVED. Kafka documents LogTruncationException for detected log divergence after truncation. citeturn0search0turn0search1

## Frozen evidence

Store:
- beginningOffsetSnapshot
- finalStartingPosition
- optional leader epoch metadata
- setup timing
- setup retry/error diagnostics

Do not assert `beginningOffsetSnapshot == finalStartingPosition`.

## Status

VERIFIED:
- beginningOffsets is a snapshot and position-neutral;
- seekToBeginning resolves lazily;
- log-start movement can make an earlier snapshot stale;
- explicit reset semantics are preferable to silent repair for the base evidence test;
- truncation/out-of-range must not become clean absence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.710: inspect whether `auto.offset.reset=none` is compatible with the no-group manual-assignment initialization path in Kafka 4.1.2, and freeze the exact setup behavior when the partition has no valid fetch position or the log start advances before the seek is resolved.