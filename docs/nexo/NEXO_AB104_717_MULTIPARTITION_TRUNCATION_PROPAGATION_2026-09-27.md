# NEXO AB104.717 — Multi-partition truncation propagation and cached exception semantics
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source evidence
Kafka's consumer validation path groups partitions by leader/node and issues OffsetForLeaderEpoch validation requests. In the inspected Fetcher implementation, each successful node response creates a local `List<SubscriptionState.LogTruncation>`. Every returned partition is checked with `maybeCompleteValidation`; detected truncations are accumulated for that response and converted by `buildLogTruncationException` into two TopicPartition-keyed maps.

The builder therefore preserves multi-partition truncation only within the set of truncations produced by that response. It does not create a cross-request global aggregation object.

## Cached exception semantics
The resulting exception is published through an atomic single-slot cache:
`cachedOffsetForLeaderException.compareAndSet(null, e)`.
If another exception is already pending, the later exception is discarded/logged rather than merged.

At the start of the next validation cycle, `validateOffsetsIfNeeded()` consumes the cached exception with `getAndSet(null)` and throws it before starting the next validation work.

## Epistemic consequence
A single `LogTruncationException` can faithfully represent multiple partitions, but the cache is not an evidence accumulator across asynchronous validation responses.

Therefore:
- multi-partition contents inside one emitted exception are preserved and independently keyed;
- truncation findings arriving in a later response while another exception is already cached are not guaranteed to be represented in the thrown exception;
- a non-retriable exception cached before a later truncation response can also prevent the later truncation from becoming the surfaced exception;
- absence of a partition from the surfaced exception must NOT be interpreted as evidence that the partition had no truncation event.

This is an evidence-completeness boundary, not proof of data absence.

## Nexo requirement
Nexo's evidence layer must distinguish:
1. partition absent from a particular Kafka exception;
2. partition not observed in a particular response;
3. partition not yet validated;
4. partition observed truncated;
5. validation response superseded/stale;
6. exception suppressed because another exception occupied the cache.

The canonical record must retain response/request identity and observation epoch so that a surfaced exception is not mistaken for an exhaustive account of all partitions being validated.

## Status
SOURCE_CODE_VERIFIED=YES (via inspected Kafka consumer implementation; exact propagation behavior cross-checked against current GitHub source/search evidence)
SEMANTIC_INTERPRETATION=BOUNDED
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Evidence note
The web-inspected Kafka implementation explicitly shows per-response truncation accumulation, TopicPartition-keyed exception construction, and single-slot `cachedOffsetForLeaderException` publication/discard behavior. cite source: GitHub Fetcher implementation result inspected 2026-09-27.

## Next
AB104.718: inspect the exact `PositionsValidator`/validation-state retention and replacement rules after a truncation or failed validation, including whether stale/superseded validation state can erase or replace evidence before Nexo records it.
