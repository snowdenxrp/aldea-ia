# NEXO AB105 — ApiVersionManager / MetadataCache bridge audit

Date: 2026-10-06
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Candidate
Could the SocketServer Processor's ApiVersionManager/MetadataCache path provide an indirect W1 publication bridge before ENQUEUE?

## Exact source result
- SocketServer Processor parses request headers through ApiVersionManager.
- DefaultApiVersionManager holds a MetadataCache reference and reads metadataCache.features() when constructing an ApiVersions response.
- BrokerMetadataPublisher calls metadataCache.setImage(newImage) before invoking AclPublisher/W1.
- Therefore this shared MetadataCache publication occurs before W1, not after it.
- AclPublisher's incremental ACL mutation changes the authorizer state, not the MetadataCache image reference.
- The Processor's ordinary request construction path does not perform a metadataCache read that is causally dependent on the later ACL mutation before RequestChannel.sendRequest.

## Interpretation
The shared MetadataCache/ApiVersionManager object is real, but it does not form W1 -> Processor HB. The relevant metadata-cache publication is upstream of W1, and ApiVersions handling is not a per-ACL publication gate.

🟢 Candidate closed at source level.
🔵 No change to AB105 epistemic state.

Current state:
- W1→Processor HB: UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: ApiVersionManager/MetadataCache as a generic W1 publication candidate unless a new source path shows a post-W1 write/read or explicit synchronization handoff.
