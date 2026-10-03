# NEXO AB105 G0 — Ordering Witness JMM Resolution — 2026-10-02

## Scope
Resolve whether Kafka commit `99b940733a9f6bc409457dba7108f08421d81e42` provides a JMM publication edge from an ACL cache update performed by `StandardAuthorizerData.addAcl/removeAcl` to a concurrent `authorize()` reader.

## Evidence
1. Kafka commit `df13775` is `KAFKA-14828: Remove R/W locks using persistent data structures`. Its commit message explicitly says the R/W lock was removed using immutable/persistent collections and that after a write operation the main cache reference is changed to the new object; reads are intended to use one cache object for the whole read operation.
2. In `df13775`, `StandardAuthorizer` has `volatile StandardAuthorizerData data`, but `addAcl()` and `removeAcl()` call `data.addAcl/removeAcl()` without assigning a new `data` object.
3. In `df13775` and the tested `99b940...`, `StandardAuthorizerData.aclCache` is a plain non-volatile field. `addAcl/removeAcl` compute a new immutable `AclCache` and then assign `aclCache = ...`.
4. `authorize()` first performs a volatile read of `data` and then `StandardAuthorizerData.findAclRule()` performs a plain read `AclCache aclCacheSnapshot = aclCache`.
5. Therefore, the volatile `data` read does NOT, by itself, create a happens-before edge for later writes to the already-published `StandardAuthorizerData.aclCache` field. The immutable nature of the AclCache objects prevents mutation races inside an individual cache object, but does not itself make publication of the new reference visible under the Java Memory Model.
6. The historical commit confirms the intended design was to eliminate the lock via persistent/immutable state, but the implementation shown in `df13775` does not replace the outer `data` reference for each ACL delta.
7. The exact Kafka commit used by the NEXO witness remains `99b940733a9f6bc409457dba7108f08421d81e42`.
8. Real-broker witness evidence independently shows W1, ENQUEUE, DEQUEUE, AUTH_ENTER and AUTH_DECISION across 10/10 cycles. That is runtime observation, not by itself a JMM proof.

## Resolution
The previous hypothesis is resolved as follows:

- It is NOT correct to say that an unknown external synchronization mechanism must exist merely because the cache is immutable.
- The code path inspected does NOT expose a JMM happens-before edge from the per-ACL `aclCache = newCache` write to the concurrent `aclCacheSnapshot = aclCache` read.
- The existing `volatile data` field only establishes publication for writes to `data` itself (including assignments such as `data = data.copyWithNewAcls(...)`). It does not retroactively publish later mutations of a field inside the already-published object.
- Therefore the specific visibility edge `W1(cache publication) -> AUTH read of new cache` remains UNPROVEN by the inspected code and is a concrete JMM publication gap candidate.

## Important limitation
This is NOT yet a proven exploitable authorization vulnerability. The runtime may observe the new cache because of stronger implementation behavior, scheduling, platform memory effects, executor coordination, or another synchronization edge elsewhere in the complete metadata/request path. Those must be audited separately. The correct claim is: the inspected `StandardAuthorizer`/`StandardAuthorizerData` code does not itself provide the required JMM edge for incremental ACL updates.

## Historical context
`df13775` explicitly removed `ReentrantReadWriteLock` and introduced `AclCache` backed by immutable/persistent collections. The implementation's own comment in later code still says “We use a read-write lock,” despite no lock field being present; this comment is stale and must not be treated as evidence of synchronization.

## Next action
Do not patch Kafka and do not rerun TLC yet. Next audit the complete producer/consumer execution path around `ClusterMetadataAuthorizer`/`AclPublisher` and the request executor to identify whether an independent happens-before edge exists between the metadata-thread ACL update and the request-thread authorization. If none exists, construct a minimal focused concurrency witness against the exact pinned commit to distinguish stale-cache visibility from merely delayed metadata propagation.

## Epistemic state
- Real broker ordering observations: CONFIRMED
- 10/10 DENIED post-delete observations: CONFIRMED
- `aclCache` plain write/read: CONFIRMED
- `data` volatile field: CONFIRMED
- `data` replacement on incremental add/remove: NOT OBSERVED IN PATH
- JMM happens-before W1 -> AUTH cache read: UNKNOWN / NOT ESTABLISHED
- Exploitability: UNKNOWN
- AB105.116R: INTACT
- AB105.117R: INTACT / no overwrite
- TLC: NOT RERUN
