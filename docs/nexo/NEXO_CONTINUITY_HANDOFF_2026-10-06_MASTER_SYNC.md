# NEXO CONTINUITY HANDOFF — MASTER SYNC — 2026-10-06

## Purpose
Canonical handoff so the next chat resumes from the current NEXO state without restarting closed research.

## Protected state
- Canonical anchor: AB105.116R.
- Do NOT create/recreate AB105.117R; an existing historical/verified raw witness is already preserved.
- Kafka exact pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- TLC is frozen; do not rerun.
- Current epistemic boundary remains:
  - HB(W1→D1): UNKNOWN / NOT IDENTIFIED
  - HB(W1→ENQUEUE): UNKNOWN / NOT IDENTIFIED
  - W1→R1: UNKNOWN
  - stale-read execution: NOT OBSERVED / NOT DISPROVEN
  - security vulnerability/exploitability: NOT ESTABLISHED
  - safety proof: NOT ESTABLISHED

## Latest verified research commits
1. 0c7258fd895a31aec823c1cde0678fb66af11c19 — close bounded AB105 G0 W1-D1 causal audit.
2. cbbfc4b0a98e8c61a595184c7ef265977635481e — finalize AB105 evidence reconciliation.
3. 27fa117c807347b0eb681b07734c082fd2eeb423 — audit AB105 R1 downstream append boundary.
4. 673d166f1157204f792aaf980f87021d9ee325a3 — refine AB105 D1 R1 batch authorization boundary.
5. ff0772c5a0c22bc5698f406f3132fb804b3c05aa — record exact Partition/leader-log R1 append boundary.
6. e525e5ae625ebdc361315c8b18e5730951a463ac — distinguish R1 local append from post-append completion/purgatory.

## Latest source-level refinement
D1 authorization is consumed synchronously on the request-handler path:
D1 authorize → immediate AuthorizationResult consumption → authorizedRequestInfo → target existence check → handleProduceAppend → appendRecords → appendRecordsToLeader → appendToLocalLog → Partition.appendRecordsToLeader.

This establishes D1→R1 conditionally for the ordinary non-transactional Produce path, but does NOT establish W1→D1 or W1→R1.

R1 is specifically the Partition/leader-log append boundary (`leaderLog.appendAsLeader`). Post-append completion/purgatory is a later state and must not be conflated with R1.

## Important reconciliation
The authoritative real-broker witness identity is:
- run 37098764557
- job 111133973894
- artifact 11265332252
- artifact SHA-256 d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c
- head SHA 4026db554b617243c13de7f881b98473852aee7b

Historical run 370778 is currently unresolved through the live Actions API and must NOT be counted as a second independent sample.

## Closed / DO-NOT-REPEAT
- TLC.
- PR92 cache census.
- PR93 exact JMM snapshot diagnostic.
- PR94/G0 rerun merely for bookkeeping.
- Artificial volatile/atomic/latch/barrier/Future/synchronization.
- Timestamps as JMM happens-before.
- D0_RETURN as broker-local W1 completion.
- initialLoadFuture / firstPublishFuture / metadataCache publication as per-update W1→D1 bridges.
- downstream append synchronization as retroactive W1→D1 publication.
- Recreating AB105.117R.
- Claiming vulnerability or safety from current evidence.

## Next legitimate frontier
If research continues, it must be genuinely distinct and downstream-aware:
1. inspect exact ReplicaManager/Partition local append semantics and any hidden async boundary;
2. determine whether an R1 observation can be instrumented at the real local append boundary without introducing synchronization into W1→D1;
3. if an experiment is justified, require the full acceptance chain: trigger/path → run → job → executed head/pin → raw artifact/log → semantic interpretation.

## Deduplication rule
The ff0772 and e525e5 documents are NOT independent discoveries/runs. They are two source-level refinements of the same D1→R1 downstream branch. Count the underlying evidence once; retain the more precise semantic distinction in the master state. No new runtime evidence was produced by these commits.

## Continuity rule
Every material new finding, contradiction, evidence identity, epistemic-state change, or experiment result must be appended to the master/continuity record so the next chat starts here, not from an earlier checkpoint.
