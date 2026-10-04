# NEXO — Ordering Source Audit — 2026-10-03

## Epistemic state
- STATUS: VERIFIED_SOURCE_AUDIT / OPEN
- AB105.117R remains the raw-broker evidence checkpoint.
- This note does not upgrade W1→R1 or JMM happens-before.

## Pinned source
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Finding
At the pinned revision, StandardAuthorizerData declares `private AclCache aclCache;` as a non-volatile field.
`addAcl()` and `removeAcl()` replace that field with a new immutable AclCache, but do not synchronize and do not publish a new StandardAuthorizerData reference.
StandardAuthorizer declares `private volatile StandardAuthorizerData data`, and `authorize()` snapshots that volatile reference into `curData`. However, an ACL update through addAcl/removeAcl leaves the data reference unchanged.

The authorization path then enters StandardAuthorizerData.authorize() and findAclRule(), where findAclRule snapshots the non-volatile aclCache field into `aclCacheSnapshot`.

AclCache itself is immutable, so the object state after construction is stable; the open visibility question is publication of the new AclCache reference from the metadata-loader/update thread to the authorization thread.

AclPublisher.onMetadataUpdate() invokes addAcl/removeAcl directly while noting that authorization continues on other threads. No synchronized/lock construct appears in the inspected StandardAuthorizerData, StandardAuthorizer, or AclPublisher source at this pinned revision.

## Consequence
- 🟢 Observed: W1 before D1 ENQUEUE in the successful real-broker artifact.
- 🟢 Source fact: W1 is placed after the `aclCache = aclCacheSnapshot` assignment.
- 🟢 Source fact: authorization reads `aclCache` through findAclRule().
- 🔵 Analysis: the experiment is now focused on whether some external execution/publication mechanism supplies the missing visibility edge.
- 🔴 Do not claim yet: absence of a visible lock in these classes alone proves a stale read in the broker. That requires ruling in/out synchronization/publication elsewhere in the call path/runtime.

## UNKNOWN / PENDING
1. Exact thread/executor publication path from MetadataLoader/AclPublisher to request-handler authorization.
2. Whether the surrounding metadata-loader invocation establishes a synchronization edge that makes the non-volatile aclCache replacement visible.
3. Whether the successful denied D1 result is caused by a fresh or stale aclCache snapshot.

## Next action
Trace the concrete MetadataLoader -> AclPublisher -> StandardAuthorizer update path and the RequestHandler -> StandardAuthorizer authorize path, looking specifically for locks, executor handoffs, futures, queues, thread-safe handoff objects, or other JMM publication edges. Do not add synchronization to the witness.

## Do-not-repeat
- Do not rerun TLC solely from this finding.
- Do not add volatile/latch/barrier/sleep to the ordering witness.
- Do not overwrite AB105.117R raw evidence.
- Do not claim W1→R1 or JMM HB from timestamps.
