# AB105 authoritative ACL Future boundary — 2026-10-05

Exact Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

Exact ClusterMetadataAuthorizer source confirms createAcls/deleteAcls return CompletionStages whose futures complete when the controller-side ACL mutation has been called and the ACL is persisted to the cluster metadata log. These futures are controller/persistence acknowledgements; they are not documented as completion after a broker MetadataLoader/AclPublisher has applied the corresponding ACL delta to the local StandardAuthorizer cache.

The interface also states that ClusterMetadataAuthorizer methods must be thread-safe and that completeInitialLoad is specifically for making all principals able to use the authorizer after initial loading.

Therefore the ACL Admin/controller Future cannot be promoted to a W1 -> D1 happens-before edge for the broker-local cache. The previously audited MetadataLoader/AclPublisher path remains the actual local application path.

Epistemic state:
- 🟢 controller ACL Future = persistence/controller-side completion boundary.
- 🟢 local broker ACL application remains MetadataLoader -> AclPublisher -> add/remove.
- 🔴 no per-update local broker-application Future identified.
- 🟡 W1 -> D1 HB remains UNKNOWN.
- 🔴 stale-read not reproduced.
- 🔴 vulnerability not established.

Next frontier: inspect whether any broker request path consumes metadata image provenance/offset/version as an admission or authorization gate after W1. If absent, retain UNKNOWN.

DO-NOT-REPEAT: PR92/93/94/G0, TLC, AB105.117R, artificial synchronization, RW-lock hypothesis.
