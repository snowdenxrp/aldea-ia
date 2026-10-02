# NEXO AB105 G0 — R/W lock removal provenance

Date: 2026-10-02
Kafka revision under audit: 99b940733a9f6bc409457dba7108f08421d81e42

## Provenance recovered

Commit df137752542c005c6998c37c03222ffbeca0f349
"KAFKA-14828: Remove R/W locks using persistent data structures (#13437)"

The commit explicitly says the previous StandardAuthorizer used a read/write lock and that the goal was to remove it using immutable/persistent collections. The diff confirms removal of the ReentrantReadWriteLock from StandardAuthorizer and removal of read/write lock acquisition around authorize/addAcl/removeAcl/etc.

The resulting design uses immutable AclCache objects. A write constructs a new cache and then changes the StandardAuthorizerData.aclCache reference. Reads snapshot the cache object used by a single authorization operation.

## Critical contract recovered

The public Authorizer interface at the pinned revision explicitly requires:
"All authorizer operations including authorization and ACL updates must be thread-safe."

Therefore the lock removal was not intended to relax the thread-safety contract. The intended safety model is persistent/immutable data plus publication of the current cache reference.

## Remaining unresolved point

At the audited revision, StandardAuthorizerData.aclCache is declared as a plain non-volatile field. StandardAuthorizer.data is volatile, but incremental addAcl/removeAcl do not replace the StandardAuthorizerData object; they mutate its aclCache reference.

So the exact Java Memory Model publication mechanism for incremental ACL updates remains unresolved.

This is NOT yet a vulnerability conclusion. We have source evidence of the design change and the thread-safety contract, but still need to establish how visibility of the new cache reference is guaranteed in the supported execution model, or determine whether the historical design relied on an implicit single-writer/external synchronization assumption.

## Important correction to previous hypothesis

The prior wording "there may simply be a missing lock" is too broad. The lock was deliberately removed by a documented architectural change. The correct question is now:

"What publication/synchronization mechanism makes the immutable-cache replacement visible to concurrent authorize() calls while preserving the Authorizer thread-safety contract?"

## Epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
ACL_PUBLISHER_ORDERING=SOURCE_CONFIRMED
RW_LOCK_REMOVAL=SOURCE_CONFIRMED
PERSISTENT_ACL_CACHE_DESIGN=SOURCE_CONFIRMED
AUTHORIZER_THREAD_SAFETY_REQUIREMENT=SOURCE_CONFIRMED
INCREMENTAL_ACL_CACHE_FIELD_VOLATILE=NO
PUBLICATION_MECHANISM=UNKNOWN
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next target

Trace the exact publication assumptions/tests introduced by KAFKA-14828, especially StandardAuthorizerData concurrency tests and the immutable-cache implementation. Determine whether tests exercise concurrent add/remove versus authorize, and whether the project deliberately relies on one writer plus immutable snapshots.

Do not repeat PR #86 unchanged.
Do not rerun TLC.
Do not create AB105.117R.
AB105.116R remains frozen.
