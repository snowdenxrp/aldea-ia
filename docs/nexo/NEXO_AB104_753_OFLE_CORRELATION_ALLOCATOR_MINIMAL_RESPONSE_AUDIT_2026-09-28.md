# NEXO AB104.753 — OFLE correlation allocator + minimal response audit

Date: 2026-09-28
Scope: research-only inspection of current Apache Kafka code for the OFLE correlation-mismatch experiment.

## 1. Correlation allocator

Current Kafka `NetworkClient` has a `correlation` field initialized to 0. The current source exposes a package-visible testing helper `nextCorrelationId()`. It checks the reserved SASL correlation range; if the current value is reserved, it jumps to `MAX_RESERVED_CORRELATION_ID + 1`, where numeric overflow is explicitly accepted and negative values are valid. It then returns `correlation++`.

The production `newClientRequest(...)` path calls `nextCorrelationId()` and passes the returned value into the `ClientRequest` constructor. Therefore the request correlation is allocated by NetworkClient, not by RequestHeader/ClientRequest itself.

Consequence:
- A fresh NetworkClient starts its allocator at 0.
- The allocator is not a random source.
- Current production allocation already avoids the reserved SASL range.
- A test must still observe the actual OFLE request correlation rather than assume it is 0 or 1, because bootstrap/internal requests can consume earlier IDs.
- A test-local deterministic observation point exists: `ClientRequest.correlationId()` after `newClientRequest`.
- A package-visible `nextCorrelationId()` also exists for tests, but consuming IDs through it changes allocator state; it is therefore better to observe the actual request ID than use the helper merely to predict it.

## 2. RequestHeader boundary

`RequestHeader` stores the correlation ID supplied by the caller and exposes it through `correlationId()`. It does not allocate correlation IDs. The header's response-header conversion carries that same correlation ID.

Therefore the mismatch experiment should treat the ClientRequest/NetworkClient allocator as the source of request identity and RequestHeader as the wire representation, not as an independent allocator.

## 3. Safe mismatch value

Because the current allocator skips the reserved SASL range, the test can select a response correlation after observing the real request correlation. The only required properties are:
1. response ID != request ID;
2. response ID is not in the reserved SASL range when testing the ordinary mismatch path.

No fixed request ID is required. Avoid blind `request.correlationId()+1`: although the current allocator normally stays outside the reserved range, the test does not need an arithmetic assumption and overflow/wrap boundaries are unnecessary to the target claim.

## 4. Minimal OFLE response object

Current `OffsetsForLeaderEpochResponse` accepts an `OffsetForLeaderEpochResponseData` object directly and returns it through `data()`. The existing Kafka test fixture constructs the data with:
- one `OffsetForLeaderTopicResult`;
- one or more `EpochEndOffset` records;
- topic name;
- partition index;
- error code;
- leader epoch;
- end offset.

For the wire mismatch experiment, one topic + one partition is sufficient in principle because correlation validation occurs before OFLE reducer semantics are reached. A minimal structurally valid response can therefore contain one topic result and one epoch-end record with `Errors.NONE`, a defined leader epoch and end offset.

This is response-construction evidence only. It does not establish reducer correctness.

## 5. Evidence boundary

Established:
- NetworkClient correlation allocator source path: YES.
- Fresh allocator initial value: 0.
- Test-visible allocator helper: YES.
- Actual request correlation observable from ClientRequest: YES.
- RequestHeader allocation responsibility: NO; it only stores/serializes the supplied ID.
- Minimal one-topic/one-partition OFLE response construction: SPECIFIABLE.
- Generic wire mismatch infrastructure: YES.

Not established:
- OFLE-specific correlation mismatch execution: NO.
- OFLE-specific CorrelationIdMismatchException assertion: NO.
- OFLE reducer exhaustive coverage: NO.
- Nexo implementation/runtime execution/correctness: NO.
- TLC: PENDING.

## 6. Exact next action

AB104.754: inspect the exact current `NetworkClientTest`/OFLE test imports and assertion idioms needed to route a real OFLE request through `MockSelector.completeReceive`, then determine whether an existing test can execute the minimal mismatch path without production changes. If execution is still not performed, freeze the executable test recipe and continue the remaining response-shape evidence rather than inferring execution.

No production modification. No Nexo implementation. No V21.
