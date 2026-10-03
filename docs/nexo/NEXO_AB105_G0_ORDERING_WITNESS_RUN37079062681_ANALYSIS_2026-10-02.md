# NEXO AB105 G0 Ordering Witness — Run 37079062681 Analysis

Date: 2026-10-02
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
Artifact: 11257159423
Artifact digest: sha256:194b3d23a58c1a26c6cfa7472d274275198c6e8b88d714546f829df219f1557f

## Raw event inventory

Verified from the downloaded artifact `nexo-ordering-evidence.txt`:
- 20 ENQUEUE
- 20 DEQUEUE
- 20 AUTH_ENTER
- 20 AUTH_DECISION
- 20 ACL_W1
- 10 A1_SUCCESS
- 10 D0_TARGET
- 10 D0_RETURN
- 10 D1_RESULT
- total NEXO_ORDER records: 140

All 10 cycles have one pre-delete ALLOWED request and one post-delete DENIED request. Correlation IDs 47..66 form the 20 request traces.

## Per-cycle ordering result

For cycles 1-8 and 10, both ACL_W1 observations precede D0_RETURN.
Cycle 9 is the only exception:
- ACL_W1 broker-3000: 194912429618
- D0_RETURN: 194914236349
- ACL_W1 broker-0: 194914743739
- ENQUEUE CID 64: 194919919857
- DEQUEUE CID 64: 194920017767
- AUTH_ENTER CID 64: 194920206816
- AUTH_DECISION CID 64 DENIED: 194920389006
- D1_RESULT DENIED: 194921186725

Therefore the exact observed temporal pattern is:
- first W1 before D0_RETURN: 10/10
- second W1 before D0_RETURN: 9/10
- both W1 before the post-D0 ENQUEUE: 10/10
- post-D0 ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION: 10/10
- post-D0 AUTH_DECISION result: DENIED 10/10

The cycle-9 interleaving must be preserved; it is not an error and must not be normalized away.

## Important correction

A prior conversational statement claimed that cycle 9 had `D0_RETURN -> ACL_W1 broker-0 -> ENQUEUE`. That statement is confirmed by the raw artifact. However, the broader claim that cycle 9 represented a unique ordering failure must NOT be made: the second W1 still precedes ENQUEUE. The useful distinction is specifically W1-vs-D0_RETURN, not W1-vs-post-D0-request admission.

## Request-path timing observations

For every post-delete request, ENQUEUE precedes DEQUEUE, which precedes AUTH_ENTER, which precedes AUTH_DECISION. The measured elapsed times are observational only and use workflow-local `System.nanoTime()` instrumentation. They do not establish a Java Memory Model happens-before relation.

## Semantic status

GREEN/OBSERVED:
- real broker execution
- local W1 cache-update observation on both brokers
- request ENQUEUE/DEQUEUE observations
- authorization entry and decision observations
- 10/10 post-delete DENIED outcomes
- correlation of the two ACL_W1 records by identical ACL UUID within each cycle

UNKNOWN/PENDING:
- JMM happens-before from W1 to request authorization
- whether the exact AUTH reader observed the second broker's post-delete cache state through a proven synchronization edge
- race/exploitability characterization beyond this witness
- whether timestamp order can be lifted into a formal causal claim

## DO NOT REPEAT

Do not rerun merely to obtain ENQUEUE: it is now present in the raw artifact.
Do not convert `System.nanoTime()` ordering into JMM happens-before.
Do not erase cycle 9 because it is unusual.
Do not create AB105.117R from this observational result alone.
Do not rerun TLC from this witness alone.
AB105.116R remains unchanged.
AB105.117R remains NOT CREATED.
TLC remains NOT RERUN.

## Next analytical target

The next step is to establish the exact synchronization/causal path between the metadata event handler's `aclCache = aclCacheSnapshot` publication and the authorization reader's cache access. The raw witness establishes temporal ordering and outcome correlation; it does not yet prove the JMM edge. The source-level path must therefore be analyzed before any formal safety conclusion.