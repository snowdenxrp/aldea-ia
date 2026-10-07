# NEXO AB105 — R1 downstream append boundary audit — 2026-10-06

## Purpose
New source audit after the bounded W1→D1 publication audit. This does NOT reopen W1→D1 and does not add synchronization or a runtime experiment.

## Exact source pin
Kafka: 99b940733a9f6bc409457dba7108f08421d81e42

Inspected:
- core/src/main/scala/kafka/server/KafkaApis.scala
- core/src/main/scala/kafka/server/ReplicaManager.scala

## New finding

### 🟢 D1 → normal Produce append is established by production control flow

For a normal non-transactional Produce request:

1. KafkaApis.handleProduceRequest() calls authHelper.filterByAuthorized(... WRITE, TOPIC, ...).
2. Only entries present in authorizedRequestInfo continue.
3. When authorizedRequestInfo is non-empty, the same request-handling call invokes:
   ReplicaManager.handleProduceAppend(... entriesPerPartition = authorizedRequestInfo ...).
4. In handleProduceAppend(), when there is no transactional producer verification required, postVerificationCallback is invoked directly on the current request-handler path.
5. postVerificationCallback invokes ReplicaManager.appendRecords(... origin = AppendOrigin.CLIENT ...).
6. appendRecords() synchronously calls appendRecordsToLeader().
7. appendRecordsToLeader() synchronously calls appendToLocalLog().
8. appendToLocalLog() calls Partition.appendRecordsToLeader(...), which is the local-log append boundary.

Therefore, for the ordinary non-transactional Produce path used by the G0-style request:

D1 authorization result -> authorizedRequestInfo -> handleProduceAppend -> appendRecords -> appendRecordsToLeader -> appendToLocalLog -> Partition.appendRecordsToLeader

is a verified execution/program-order chain on the request path.

## What this does NOT prove

- It does NOT establish W1 -> D1 JMM happens-before.
- It does NOT establish W1 -> R1.
- It does NOT prove a stale ACL read occurred.
- It does NOT prove a security vulnerability.
- It does NOT retroactively turn the temporal W1 < D1 observation into HB.
- It does NOT replace the missing runtime R1 marker in AB105.117R.

## Important narrowing

The downstream side of the exploit chain is now source-defined:

W1 -> ? -> D1(ALLOW) -> R1(local append)

The unresolved causal frontier is therefore upstream of D1:

W1 -> [publication/visibility] -> D1

If a future empirical witness ever observes D1=ALLOW after the ACL removal, the normal request path already contains the concrete downstream append route; a separate proof of D1->R1 can rely on this source chain for the ordinary non-transactional case.

## Epistemic state

- MetadataLoader -> AclPublisher -> W1: VERIFIED
- D1 request authorization: VERIFIED as request-path operation
- D1 -> normal local append: VERIFIED by exact pinned source control flow
- W1 -> ENQUEUE HB: UNKNOWN / NOT IDENTIFIED
- W1 -> D1 HB: UNKNOWN / NOT IDENTIFIED
- W1 -> R1: UNKNOWN
- stale-read execution: NOT OBSERVED / NOT DISPROVEN
- security vulnerability: NOT ESTABLISHED

## DO-NOT-REPEAT

- Do not rerun G0/AB105.117R for this source result.
- Do not rerun TLC.
- Do not reopen closed W1→D1 source audits.
- Do not add artificial synchronization.
- Do not treat this as runtime R1 evidence.

## Next legitimate frontier

The remaining genuinely new question is empirical and downstream-aware:

Can a real non-transactional Produce request be instrumented at the existing local append boundary so that a future witness can distinguish:

D1=ALLOW -> R1 observed

without introducing any synchronization from W1 to D1?

Any such experiment must preserve the existing no-artificial-synchronization constraint and meet the evidence chain:
trigger/path -> run -> job -> executed head/pin -> raw artifact -> semantic interpretation.
