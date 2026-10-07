# NEXO AB105 — R1 Partition Append Boundary — 2026-10-06

## Scope
New downstream source audit only. Does not reopen the bounded W1→D1 audit.

Kafka pin:
99b940733a9f6bc409457dba7108f08421d81e42

## 🟢 New verified source finding

At the exact Kafka pin, ReplicaManager.appendRecordsToLeader() calls appendToLocalLog(...) synchronously, then registers completion/purgatory work through addCompletePurgatoryAction(...).

For the ordinary non-transactional client path, ReplicaManager.appendRecords() calls appendRecordsToLeader(...) before constructing delayed-produce handling.

Partition.appendRecordsToLeader(...) then executes the local leader append inside the partition's leaderIsrUpdateLock read lock:

Partition.appendRecordsToLeader
→ leaderLogIfLocal
→ leaderLog.appendAsLeader(records, ...)
→ maybeIncrementLeaderHW(leaderLog)
→ return LogAppendInfo

Therefore the R1 boundary is more precise than simply "ReplicaManager append": the request-handler path reaches a concrete Partition-level local-leader append operation while holding the Partition ISR read lock.

## Important semantic boundary

The Partition read lock protects the local partition append path, but this is DOWNSTREAM of D1. It does not create a retroactive happens-before edge from W1 to D1.

So the current chain is:

W1 → ? → D1
             ↓
       authorization result
             ↓
       ReplicaManager.appendRecords
             ↓
       appendRecordsToLeader
             ↓
       Partition.appendRecordsToLeader
             ↓
       leaderLog.appendAsLeader = R1 local leader-log append boundary

## 🔵 Additional condition

Partition.appendRecordsToLeader can fail before the local append if the partition is not locally leader or if required acknowledgements/minISR conditions reject the write. Therefore D1=ALLOW is not by itself proof that R1 occurred.

## Epistemic state

- D1 → Partition R1 invocation: VERIFIED CONDITIONALLY for the ordinary non-transactional Produce path.
- Partition R1 → leaderLog.appendAsLeader: VERIFIED by source.
- W1 → D1 HB: UNKNOWN / NOT IDENTIFIED.
- W1 → R1: UNKNOWN.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- security vulnerability/exploitability: NOT ESTABLISHED.
- safety proof: NOT ESTABLISHED.

## No experiment change

This is source archaeology only. No synchronization primitive was added, no timing was promoted to JMM HB, no TLC/PR92/PR93/G0 rerun, and AB105.117R was not recreated.

## Next distinct frontier

If a runtime R1 witness is justified, the cleanest downstream marker is the actual Partition/leader-log append boundary, while preserving the existing W1→D1 path unchanged. Acceptance still requires:
trigger/path → run → job → executed Kafka head/pin → raw artifact/log → semantic interpretation.
