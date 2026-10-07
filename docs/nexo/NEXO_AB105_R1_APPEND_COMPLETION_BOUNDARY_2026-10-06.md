# NEXO AB105 — R1 Append vs Completion Boundary — 2026-10-06

## Scope
New downstream refinement at the exact Kafka pin. Does not reopen W1→D1.

Kafka pin:
99b940733a9f6bc409457dba7108f08421d81e42

## 🟢 Verified finding

The local append itself occurs BEFORE Kafka's completion/purgatory machinery.

For appendRecordsToLeader():

1. ReplicaManager calls appendToLocalLog(...).
2. appendToLocalLog reaches Partition.appendRecordsToLeader(...).
3. Partition.appendRecordsToLeader executes leaderLog.appendAsLeader(...) under the partition ISR read lock.
4. Control returns to ReplicaManager.
5. Only after that return does ReplicaManager call addCompletePurgatoryAction(...).

Therefore:

D1 → appendRecords → appendToLocalLog → Partition.appendRecordsToLeader → leaderLog.appendAsLeader = R1

and only AFTER R1:

R1 → addCompletePurgatoryAction / delayed completion machinery

## 🔵 Significance

This cleanly separates three downstream states that must not be conflated:

- R1 invocation/local append: the actual leader-log append boundary.
- completion/purgatory: post-append machinery for satisfying required acknowledgements/delayed responses.
- client response: later still.

So an observed completion/response cannot be used as evidence that W1 happened-before D1, nor can downstream completion retroactively publish W1.

Conversely, a future R1 witness can be placed before the completion machinery, making it a cleaner observation point for the W1→?→D1→R1 question.

## Conditional path

For the ordinary client Produce path, D1 authorization is consumed before ReplicaManager.appendRecords(). R1 still depends on partition leadership, minISR/requiredAcks rules, record validation and other append preconditions.

## Epistemic state

- D1 → R1: VERIFIED CONDITIONALLY.
- R1 → completion machinery: VERIFIED.
- W1 → D1 HB: UNKNOWN / NOT IDENTIFIED.
- W1 → R1: UNKNOWN.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- security vulnerability/exploitability: NOT ESTABLISHED.
- safety proof: NOT ESTABLISHED.

## DO-NOT-REPEAT

No TLC, PR92, PR93, G0 rerun, AB105.117R recreation, timestamps-as-HB, or artificial synchronization.

## Next distinct question

Determine whether the existing harness can observe R1 at Partition/leaderLog append without introducing any synchronization edge into the W1→D1 path. If so, preserve the six-link evidence chain:
trigger/path → run → job → executed head/pin → raw artifact/log → semantic interpretation.
