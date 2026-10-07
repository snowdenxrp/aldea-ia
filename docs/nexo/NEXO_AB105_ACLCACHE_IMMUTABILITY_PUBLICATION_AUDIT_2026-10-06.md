# NEXO AB105 — AclCache immutability / publication audit — 2026-10-06

## Scope
Audit the exact pinned AclCache implementation as a possible hidden synchronization/publication bridge between MetadataLoader/AclPublisher W1 and request-thread D1.

## 🟢 Exact pinned source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

AclCache is explicitly declared immutable. Its state is held in final fields:
- ImmutableNavigableSet<StandardAcl> aclsByResource
- ImmutableMap<Uuid, StandardAcl> aclsById

addAcl/removeAcl do not mutate the existing AclCache. They construct and return a new AclCache containing updated immutable structures.

StandardAuthorizerData then performs the critical publication step by assigning the returned snapshot to its plain field:
`aclCache = aclCache.addAcl(...)` or `aclCache = aclCacheSnapshot`.

authorize subsequently reads that plain `aclCache` field.

## 🔵 Causal consequence
The immutable nature of AclCache closes one possible internal-mutation race: an already-observed AclCache instance is not itself modified in place.

However, immutability does NOT create a cross-thread happens-before edge for the publication of the new AclCache reference. The relevant publication variable remains the plain `StandardAuthorizerData.aclCache` field.

The volatile `StandardAuthorizer.data` field is not written by incremental addAcl/removeAcl. Therefore its volatile semantics do not automatically publish the later plain-field reassignment of `aclCache`.

The JMM requires a synchronization/happens-before relation to guarantee visibility across the conflicting cross-thread accesses; temporal ordering or immutable object structure alone is insufficient.

## 🟢 Boundary closed
No hidden lock, Future, queue handoff, or concurrent-collection synchronization was found inside AclCache itself that would bridge W1 to D1.

This is a source-level refinement of the existing race/publication model, not a new runtime experiment.

## Epistemic state
- W1→ENQUEUE JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not treat AclCache immutability as publication.
Do not reopen AclCache internals as a synchronization frontier unless the exact pinned immutable collection implementation itself reveals a cross-thread synchronization primitive.
Do not add artificial synchronization to the experiment.
