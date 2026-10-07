# NEXO AB105 — AclPublisher ↔ Processor shared-state inventory

Date: 2026-10-06
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Scope
Audit the remaining candidate class: an object/state touched by the metadata ACL publication path and subsequently acquired/read by the SocketServer Processor before RequestChannel ENQUEUE.

## Findings
- AclPublisher performs the incremental ACL mutation through ClusterMetadataAuthorizer.addAcl/removeAcl on the MetadataLoader publisher path.
- The SocketServer Processor owns the network receive path and constructs the request before calling RequestChannel.sendRequest.
- SocketServer's explicitly shared Processor-side objects inspected here include the RequestChannel, ApiVersionManager, CredentialProvider, socket/selector state and Processor lifecycle state.
- The audited ACL mutation does not write to those Processor-side synchronization objects as part of W1.
- RequestChannel was already closed as an ENQUEUE→DEQUEUE bridge whose producer-side publication begins in the Processor; it does not provide the missing W1→Processor edge.
- Processor lifecycle/startup synchronization was already closed separately; thread start establishes startup publication, not a per-ACL-update edge.
- Dynamic configuration callback state was audited separately and does not turn an ACL-only delta into a Processor handoff.

## Result
🟢 No concrete shared-state synchronization primitive was identified that connects incremental ACL W1 to the Processor before ENQUEUE.
🔵 This closes the current shared-state inventory frontier at source level; it is not runtime evidence and does not prove absence in all possible future code paths.

## Epistemic state
- HB(W1→Processor): UNKNOWN / NOT IDENTIFIED.
- HB(W1→ENQUEUE): UNKNOWN / NOT IDENTIFIED.
- HB(W1→D1): UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not reopen generic Processor lifecycle, RequestChannel, DynamicConfigPublisher, or AclCache searches unless a new concrete source path is identified.

## Next target
If continuing source research, only a concrete cross-domain executor/Future, concurrent collection, lock/condition/semaphore, volatile publication, or metadata-admission gate shared by W1 and the Processor remains material.
