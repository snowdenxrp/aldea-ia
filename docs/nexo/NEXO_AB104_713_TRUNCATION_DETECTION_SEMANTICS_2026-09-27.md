# NEXO AB104.713 — truncation detection semantics
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source finding
Current Kafka SubscriptionState.maybeCompleteValidation() validates a requested FetchPosition against an OffsetForLeaderEpoch result.

Critical branches:
- undefined epoch/end offset: with a default reset policy Kafka resets; without one it returns LogTruncation details without a divergent offset;
- broker endOffset < current fetch position: Kafka treats this as truncation; with reset policy it seeks to the broker-reported divergent end offset, otherwise it returns LogTruncation with OffsetAndMetadata(endOffset, leaderEpoch);
- endOffset >= current position with defined epoch: validation completes normally.

The method also refuses to apply a response when the partition is no longer assigned, validation is no longer pending, or the current position differs from the request position. A stale validation response therefore does not become truncation evidence for a newer position.

## Nexo epistemic mapping
The source-backed truncation predicate is not merely an offset error. It is a validation result tied to the exact requested FetchPosition, the same active current position, the affected TopicPartition, and the broker OffsetForLeaderEpoch end offset/leader epoch.

## Frozen distinction
- endOffset < currentPosition.offset with matching validation context => LOG_TRUNCATION_UNRESOLVED after observation begins.
- Undefined epoch/end offset with no reset policy => LOG_TRUNCATION_UNRESOLVED with incomplete causal detail.
- Stale/mismatched validation response => not truncation evidence.
- Retriable request failure => retry state, not truncation.
- Exact identity observed before truncation => PRESENT remains frozen.

## Important correction
Kafka may automatically reset when a default reset policy exists. Nexo uses auto.offset.reset=none specifically to avoid silently selecting a new observation coordinate.

## Minimum evidence
TopicPartition; requested fetch offset; active/current fetch offset; returned end offset when defined; returned leader epoch when defined; exception/state; validation-response position match; observation epoch; exact-identity-observed flag; setup/observation phase.

## Status
SOURCE_CODE_VERIFIED=YES
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.714: inspect the exact LogTruncation data structure and exception construction to freeze the minimum serializable evidence contract without inventing fields.
