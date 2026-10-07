# NEXO AB105 — StandardAuthorizer version-drift audit — 2026-10-06

## Scope
Compare the exact Kafka pin used by AB105 with current upstream only to determine whether the earlier claim of a changed synchronization strategy is applicable.

## 🟢 Exact AB105 pin
Kafka commit: 99b940733a9f6bc409457dba7108f08421d81e42.

At this exact pin:
- StandardAuthorizer has `volatile StandardAuthorizerData data`.
- StandardAuthorizerData is explicitly documented as not thread-safe.
- StandardAuthorizerData has plain `AclCache aclCache`.
- addAcl/removeAcl reassign `aclCache` inside StandardAuthorizerData.
- authorize reads the ACL state through the StandardAuthorizerData object.

This confirms the previously audited pinned-source model.

## 🟢 Current-upstream check
Current Apache Kafka trunk was inspected separately. Its StandardAuthorizer source contains a comment describing read/write-lock synchronization, but the fetched source does not contain ReadWriteLock/ReentrantReadWriteLock/readLock/writeLock identifiers. Current StandardAuthorizerData still contains a plain `AclCache aclCache` and is documented as not thread-safe.

Therefore the earlier shorthand "current upstream changed to a read-write lock" is NOT established by the source inspection and must not be used as a version-drift conclusion.

## 🔵 Epistemic consequence
No version-drift bridge was discovered that changes the AB105 conclusion.

Pinned AB105 state remains:
- W1→ENQUEUE JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not use current-trunk synchronization commentary as evidence about the pinned Kafka commit.
Do not reopen the AB105 runtime experiment based on this version comparison.
