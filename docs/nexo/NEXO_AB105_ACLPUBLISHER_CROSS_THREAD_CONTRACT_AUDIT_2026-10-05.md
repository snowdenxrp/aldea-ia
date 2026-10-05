# AB105 AclPublisher cross-thread contract audit — 2026-10-05

Exact Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

New verified source point: AclPublisher.onMetadataUpdate explicitly states that ACL changes are applied while the Authorizer continues returning authorization results in other threads. It applies incremental changes by iterating the LinkedHashMap delta and directly calling ClusterMetadataAuthorizer.addAcl/removeAcl. There is no per-update Future, join, lock acquisition around the authorizer call, metadata-offset wait, or request-thread callback in this method.

BrokerMetadataPublisher.onMetadataUpdate invokes aclPublisher.onMetadataUpdate synchronously as part of the same metadata publication callback. Thus this confirms the metadata-side sequence:
MetadataLoader event thread -> BrokerMetadataPublisher -> AclPublisher -> Authorizer add/remove.

Crucial interpretation: the comment that authorization continues in other threads confirms concurrency by design, but does NOT itself prove a stale read or prove absence of a JMM synchronization edge. The concrete source inspected here provides no cross-thread handoff from this ACL update call to a later independently generated request authorization.

Epistemic state:
- 🟢 Metadata-side W1 execution path verified.
- 🟢 Authorization may continue concurrently during ACL application, per source comment.
- 🟢 Incremental update calls are direct add/remove calls.
- 🔴 No per-update publication/wait edge identified here.
- 🟡 W1 -> D1 HB remains UNKNOWN.
- 🔴 stale ACL read remains unobserved/not disproven.
- 🔴 vulnerability remains unestablished.

Next frontier: inspect ClusterMetadataAuthorizer/Authorizer lifecycle and any request admission/version gate that could establish a cross-thread edge after incremental ACL publication. Do not treat the AclPublisher comment as a proof of the race; it only establishes the intended concurrent execution model.

DO-NOT-REPEAT: PR92/93/94/G0, TLC, AB105.117R, artificial synchronization, AB105 RW-lock hypothesis.
