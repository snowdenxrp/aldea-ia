# NEXO AB104.696 — Verifier starting-offset evidence
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka 4.1.2 documents that `beginningOffsets()` returns the earliest available offset and does not change the consumer position. `seekToBeginning()` is lazy: the seek takes effect when `poll()` or `position()` is called. The consumer position is the offset of the next record that will be returned. citeturn0search0turn0search3

## Frozen verifier sequence

After manual `assign(targetPartition)`:
1. call `beginningOffsets(singleton(targetPartition))`;
2. record `verifierBeginningOffset`;
3. call `seekToBeginning(singleton(targetPartition))`;
4. call `position(targetPartition)` to force/evidence the lazy seek;
5. record `verifierStartingPosition`;
6. only then start the fixed observation deadline;
7. poll until PRESENT or deadline.

The beginning offset is evidence metadata, not the identity of the target effect.

## Why capture both values

`beginningOffsets` describes the broker's earliest currently available offset. `position` describes the verifier's next-fetch position after the explicit seek. Capturing both makes the observation window auditable without relying on implicit `auto.offset.reset` behavior.

Expected clean invariant:
`verifierStartingPosition >= verifierBeginningOffset`.

For a freshly created single-partition topic in the minimal experiment, they are normally equal, but the verifier must not hard-code equality because Kafka offsets can advance independently of the verifier.

## Failure classification

- beginningOffsets failure -> HARNESS_SETUP_FAILURE;
- seek failure -> HARNESS_SETUP_FAILURE;
- position failure before observation begins -> HARNESS_SETUP_FAILURE;
- truncation/out-of-range after observation has begun -> READ_PATH_ERROR;
- successful polling to deadline with no exact identity -> NOT_OBSERVED.

No automatic reset is allowed to silently define the evidence window.

## Deadline rule

The fixed observation deadline starts only after successful assignment + beginning-offset capture + explicit seek + successful position observation. Setup latency therefore cannot consume the observation budget.

The starting offset must be stored in the evidence record even though the test remains RF=1 and does not prove replicated durability.

## Status

VERIFIED:
- beginningOffsets does not change consumer position;
- seekToBeginning is lazy;
- position exposes the next-fetch offset;
- exact starting position can therefore be recorded before the observation window.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.697: inspect Kafka's current end-offset/high-watermark semantics and freeze whether the verifier should capture an end boundary at observation start or avoid it because a moving end boundary could create false absence claims.