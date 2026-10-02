# NEXO AB105 G0 — Visibility finding: KafkaEventQueue vs StandardAuthorizerData

Date: 2026-10-02
Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Source-confirmed facts

- KafkaEventQueue protects its queue structures with a ReentrantLock. enqueue() acquires/releases that lock; the event-handler thread also acquires/releases it before selecting events.
- MetadataLoader callbacks run on the event-handler thread.
- StandardAuthorizerData is explicitly documented as "not thread-safe".
- StandardAuthorizerData.aclCache is a non-volatile field.
- addAcl/removeAcl replace aclCache with a newly returned AclCache.
- authorize() reads aclCache directly in findAclRule(): AclCache aclCacheSnapshot = aclCache.
- AclCache itself is immutable, so readers use a snapshot reference.

## Critical distinction

The KafkaEventQueue lock gives ordering/visibility for data exchanged through that queue boundary, but the RPC authorization path does not acquire the same KafkaEventQueue lock. Therefore the queue lock alone cannot be treated as a proof that an ACL-cache write on the metadata-loader thread is immediately visible to an unrelated RPC thread.

At the same time, this is NOT evidence of a Java memory-model bug. StandardAuthorizer also owns a volatile StandardAuthorizer.data reference, and the full publication path must still be traced to determine whether data replacement or another synchronization mechanism establishes the required happens-before relation.

## Current epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
ACL_PUBLISHER_ORDERING=SOURCE_CONFIRMED
STANDARD_AUTHORIZER_DATA_NOT_THREAD_SAFE=SOURCE_CONFIRMED
ACL_CACHE_NONVOLATILE=SOURCE_CONFIRMED
QUEUE_LOCK_TO_RPC_HAPPENS_BEFORE=NOT_ESTABLISHED
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next target

Trace StandardAuthorizer.data publication and every path that replaces StandardAuthorizerData, then inspect broker initialization/configuration and any synchronization around authorizer updates. A runtime visibility harness is premature until that source contract is mapped.

Do not repeat PR #86 unchanged.
Do not rerun TLC.
Do not create AB105.117R.
AB105.116R remains frozen.