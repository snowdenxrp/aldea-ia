# NEXO AB104.697 — End-offset boundary and moving observation window
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka 4.1.2 documents that `endOffsets()` does not change consumer position. With `read_uncommitted`, the returned end offset is the high watermark: the offset immediately after the last successfully replicated message. With `read_committed`, it is instead the LSO. citeturn0search0turn0search1

## Frozen decision

Do NOT capture an initial `endOffset` as a hard observation boundary for the base AB104 verifier.

Reason: the experiment asks whether the exact effect becomes observable during a fixed wall-clock interval. Kafka's end offset is a moving broker state. A record can be appended after the initial endOffset, and using that initial value as a stopping boundary could incorrectly classify a still-valid observation window as NOT_OBSERVED.

The verifier therefore uses:
- fixed starting position evidence from AB104.696;
- fixed wall-clock observation deadline;
- repeated bounded polls;
- exact effect identity matching;
- no initial end-offset cutoff.

## End-offset use allowed only as diagnostic

An endOffset may optionally be captured at the beginning or during diagnostics, but it is metadata only. It MUST NOT terminate the observation loop and MUST NOT be used to prove absence.

If captured, store:
- sampledAt;
- endOffset;
- isolation.level.

Do not compare an initial endOffset against a later record and infer causality or durability.

## High-watermark boundary

The documentation's phrase "last successfully replicated message" is a Kafka broker replication boundary, not a Nexo-wide durability proof. In the AB104 base test RF=1, the observation remains single-broker and does not establish cross-node durability.

## Frozen absence rule

NOT_OBSERVED is emitted only when:
1. assignment succeeded;
2. beginning offset was captured;
3. explicit seek succeeded;
4. starting position was captured;
5. all polls completed successfully through the fixed deadline;
6. no exact identity was observed;
7. no truncation/read-path error occurred.

No endOffset condition is required.

## Status

VERIFIED:
- endOffsets() is a snapshot and does not move consumer position;
- read_uncommitted endOffset represents the high watermark;
- the end boundary can move while the verifier is running;
- a fixed endOffset must not become an absence cutoff.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.698: inspect exact current `poll()` timeout/empty-result behavior and freeze the observation loop timing so an empty poll, scheduler delay, or final-deadline race cannot be mistaken for a clean read-path failure or premature NOT_OBSERVED.