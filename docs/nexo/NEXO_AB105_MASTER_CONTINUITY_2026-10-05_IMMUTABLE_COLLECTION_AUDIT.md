# NEXO AB105 — MASTER CONTINUITY ADDENDUM — 2026-10-05

## Immutable collection publication audit

Exact Kafka pin:
99b940733a9f6bc409457dba7108f08421d81e42

The immediate frontier from the previous checkpoint was inspected:
- server-common/src/main/java/org/apache/kafka/server/immutable/ImmutableMap.java
- server-common/src/main/java/org/apache/kafka/server/immutable/ImmutableNavigableSet.java
- server-common/src/main/java/org/apache/kafka/server/immutable/pcollections/PCollectionsImmutableMap.java
- server-common/src/main/java/org/apache/kafka/server/immutable/pcollections/PCollectionsImmutableNavigableSet.java

Confirmed:
- wrappers hold their underlying persistent collections in final fields;
- updates create new persistent objects via plus/minus;
- no volatile field, synchronized block/method, lock, AtomicReference, Future, or explicit publication primitive was identified in these Kafka wrapper implementations;
- therefore these collection implementations add no identified cross-thread publication edge from W1 to D1.

Epistemic update:
- Snapshot structural coherence: CONFIRMED.
- Immutable/persistent implementation: CONFIRMED.
- Collection-level publication mechanism: NOT IDENTIFIED / CLOSED AS A SYNCHRONIZATION HYPOTHESIS.
- W1→D1 JMM happens-before: UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE publication edge: NOT IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

Important nuance:
The final fields support safe initialization properties of the immutable objects once observed, but they do not make the plain StandardAuthorizerData.aclCache reference assignment a happens-before edge.

Do-not-repeat remains unchanged:
117R, G0/PR92/PR93/PR94, TLC rerun, artificial synchronization, D1 snapshot probe, D0_RETURN as W1 proxy, temporal ordering as JMM HB.

Next genuinely new frontier:
inspect the exact pinned dependency implementation/semantics of the persistent structures only if needed to determine whether their own internals can introduce synchronization; otherwise move upward to the writer-side call chain and reader-side authorize path for any overlooked shared publication mechanism. Do not infer from absence alone; preserve UNKNOWN where evidence is insufficient.
