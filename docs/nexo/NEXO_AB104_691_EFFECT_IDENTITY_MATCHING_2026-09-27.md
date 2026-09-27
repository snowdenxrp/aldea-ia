# NEXO AB104.691 — Exact effect-identity header matching
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Current ConsumerRecord exposes non-null Headers, while Kafka Headers supports both headers(key), which returns all matching headers in insertion order, and lastHeader(key), which returns only the last matching header. Therefore lastHeader() alone is insufficient for a strict identity contract when duplicate identity headers are possible. citeturn0search0turn0search5

## Frozen identity algorithm

For each fetched ConsumerRecord:

1. Require topic == target topic.
2. Require partition == target partition.
3. Require key bytes exactly equal UTF-8(effectId).
4. Require value bytes exactly equal UTF-8(effectId).
5. Enumerate ALL headers whose key equals exactly "nexo-effect-id".
6. Require exactly one matching identity header.
7. Require that header's value is non-null.
8. Require header value bytes exactly equal UTF-8(effectId).
9. Only then classify PRESENT.

All other headers are irrelevant.

## Duplicate/null handling

- Zero identity headers -> unrelated record.
- More than one identity header -> identity ambiguity; do NOT classify PRESENT.
- Identity header with null value -> identity mismatch/ambiguity; do NOT classify PRESENT.
- One identity header with wrong bytes -> unrelated record.
- Correct identity header but wrong key/value -> unrelated record.
- Multiple unrelated headers do not matter.

Because the producer's frozen contract creates exactly one identity header, duplicate identity headers cannot be silently accepted by taking lastHeader().

## Evidence distinction

A record failing identity matching is an observed unrelated record, not READ_PATH_ERROR and not NOT_OBSERVED by itself. The verifier continues until the fixed deadline.

PRESENT is emitted only by the complete conjunction:
topic ∧ partition ∧ key ∧ value ∧ exactly-one-header ∧ exact-header-bytes.

## Frozen implementation shape

Use raw byte arrays and constant-time-independent equality semantics appropriate for ordinary test identity comparison; no charset defaults.

Do not mutate ConsumerRecord.headers(); current Kafka documents headers as mutable and ConsumerRecord itself as not thread-safe, so the verifier should treat fetched records as read-only. citeturn0search0

## Status

VERIFIED:
- Headers exposes all duplicate matches;
- lastHeader returns only the final match;
- ConsumerRecord.headers() is never null;
- exact identity conjunction frozen.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.692: inspect the verifier's offset/record ordering semantics and freeze whether seeing the exact effectId once is terminal even if later duplicate copies could appear, and how duplicate effect identities are classified.
