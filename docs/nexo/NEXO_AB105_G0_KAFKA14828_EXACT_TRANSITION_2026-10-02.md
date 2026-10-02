# NEXO AB105 G0 — KAFKA-14828 exact design transition

Date: 2026-10-02
Audited Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Historical confirmation

The exact KAFKA-14828 commit df137752542c005c6998c37c03222ffbeca0f349 was inspected, including its diff.

The commit removed the ReentrantReadWriteLock from StandardAuthorizer and replaced the mutable TreeSet/HashMap ACL storage with an immutable AclCache built from persistent collections.

The commit message explicitly describes the intended concurrency model:
1. construct new object references for intermediate write state;
2. after the write completes, change the main cache reference to the new object;
3. for each read, access one cache object consistently.

## Exact implementation at that commit

The same commit changed StandardAuthorizerData from two final mutable collections to:
private AclCache aclCache;

addAcl/removeAcl assign a new AclCache to that field.

StandardAuthorizer itself retained:
private volatile StandardAuthorizerData data = StandardAuthorizerData.createEmpty();

But incremental ACL methods remained:
data.addAcl(id, acl);
data.removeAcl(id);

They did not replace the volatile data reference after each incremental ACL change.

Thus the historical diff itself establishes that the lock was removed while incremental cache publication moved to a non-volatile field inside the shared StandardAuthorizerData object.

## Why this is significant

This is stronger than the prior observation that a lock is absent. It proves the publication shape existed at the exact moment the lock was removed; it was not introduced by a later refactor.

The immutable AclCache prevents readers from seeing a partially mutated collection. However, immutability of the object does not itself establish visibility of the new AclCache reference across Java threads.

Therefore two separate properties must remain distinguished:
A) atomic/consistent snapshot of an AclCache object = SOURCE CONFIRMED;
B) timely/cross-thread visibility of the new aclCache reference = NOT YET ESTABLISHED.

## Current epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
KAFKA14828_LOCK_REMOVAL=SOURCE_CONFIRMED
KAFKA14828_IMMUTABLE_CACHE=SOURCE_CONFIRMED
KAFKA14828_NONVOLATILE_ACLCACHE_AT_LOCK_REMOVAL=SOURCE_CONFIRMED
AUTHORIZE_SNAPSHOT_OBJECT=SOURCE_CONFIRMED
ACLCACHE_REFERENCE_PUBLICATION=UNKNOWN
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next target

Inspect whether later Kafka changes added a publication mechanism, changed aclCache to volatile/atomic, or changed execution/thread affinity. If none exists, the next step is a narrowly scoped JMM/concurrency test on the pinned revision, not another network propagation test.

Do not repeat PR #86 unchanged.
Do not rerun TLC.
Do not create AB105.117R.
AB105.116R remains frozen.
