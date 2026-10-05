# NEXO AB105 — KAFKA-14828 PUBLICATION GUARANTEE AUDIT — 2026-10-05

## New primary evidence
Repository: apache/kafka
PR: #13437
Merge commit: df137752542c005c6998c37c03222ffbeca0f349
Title: KAFKA-14828: Remove R/W locks using persistent data structures

The PR description explicitly states the purpose of the old R/W lock:
- maintain consistency of data;
- prevent one authorize() call from reading different versions of aclsById and aclsByResource.
It then defines the replacement:
- writer constructs new copies;
- creates a new AclCache only after both indexes are consistent;
- replaces the main cache reference;
- reader copies the cache reference to an intermediate local variable and uses only that object for the entire read.

## Exact patch evidence
The PR patch shows:
- ReentrantReadWriteLock was removed.
- StandardAuthorizer.authorize() changed from lock-protected access to:
  StandardAuthorizerData curData = data;
  then authorization uses curData.
- StandardAuthorizerData.addAcl/removeAcl replace aclCache with a newly constructed AclCache.
- findAclRule() captures:
  AclCache aclCacheSnapshot = aclCache;
  and both checkSection() scans use that same snapshot.
- AclCache contains immutable/persistent structures and each add/remove returns a new AclCache.

## Critical epistemic result
The PR explicitly explains the replacement as a solution for READ CONSISTENCY / SNAPSHOT COHERENCE.

It does NOT, in the inspected PR description or patch, explicitly state a Java Memory Model happens-before/publication guarantee from the single writer to concurrent authorization readers for the plain aclCache reference.

Therefore:
- snapshot structural consistency: CONFIRMED
- same-snapshot use within one authorize(): CONFIRMED
- writer constructs complete state before reference replacement: CONFIRMED
- W1 -> D1 JMM happens-before: STILL UNKNOWN / NOT IDENTIFIED
- stale read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED

## Test/benchmark finding
PR #13437 adds StandardAuthorizerUpdateBenchmark and performance comparisons. The inspected patch does not show a dedicated concurrent visibility/JMM regression test establishing that a reader thread must observe the latest aclCache reference.

Do NOT infer absence of a test from this patch alone as proof that no such test exists elsewhere. If needed, search the merged tree for concurrency/visibility tests as a distinct next action.

## Important distinction
The design claim is:
CONSISTENT SNAPSHOT != CROSS-THREAD PUBLICATION GUARANTEE.

The immutable AclCache prevents a reader that has obtained a particular snapshot from observing a partially mutated snapshot. It does not by itself prove that an unrelated reader obtains the newest snapshot after W1.

## Next frontier
Search the merged Kafka tree at/after df13775 for:
1. tests exercising concurrent add/removeAcl vs authorize;
2. explicit volatile/atomic/reference publication around aclCache or data;
3. documentation/comments stating the required visibility guarantee;
4. later commits that changed aclCache/data publication semantics.

Acceptance rule remains: no causal inference from commit titles; exact-pin evidence governs AB105.
