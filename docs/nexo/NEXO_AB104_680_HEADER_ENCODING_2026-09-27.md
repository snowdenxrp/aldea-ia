# NEXO AB104.680 — Effect header encoding
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source finding
Apache Kafka's current RecordHeader stores header values as raw byte[] and exposes them unchanged through value(). Header keys are represented as strings and Kafka's implementation decodes key bytes as UTF-8.

## Frozen encoding
The Nexo experiment will encode effectId exactly once as:
effectId.getBytes(StandardCharsets.UTF_8)

Verifier decoding:
new String(header.value(), StandardCharsets.UTF_8)

No platform-default charset is permitted.

## Matching rule
A candidate record is PRESENT only if:
1. header key exactly equals nexo-effect-id;
2. header value bytes decode as UTF-8 to the expected effectId;
3. record key equals expected effectId;
4. record value equals expected effectId.

## Why
Kafka carries header values as bytes. Explicit UTF-8 removes JVM/platform charset ambiguity and makes the evidence reproducible.

## Status
VERIFIED:
- current RecordHeader byte[] semantics;
- explicit UTF-8 encoding/decoding boundary.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.681: inspect current producer retry/send lifecycle and prove that one ProducerRecord object preserves its key/value/header identity across retries; then freeze retry settings.