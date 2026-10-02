# NEXO AB105 G0 — Source Finding: AclPublisher serialization boundary

Date: 2026-10-02
Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Finding

The pinned Kafka source identifies an external sequencing boundary that materially changes the previous hypothesis.

`AclPublisher.onMetadataUpdate(...)` applies ACL metadata deltas in the metadata publisher path. Its source comment explicitly states that authorization continues in other threads while ACL changes are being applied, and that changes must be applied in order so invalid intermediate authorization state is not exposed.

For a normal metadata delta, `aclsDelta.changes().forEach(...)` applies each change in order, calling `ClusterMetadataAuthorizer.addAcl(...)` or `removeAcl(...)`. For snapshots, `loadSnapshot(...)` replaces the ACL state as a whole.

## Consequence

This does NOT prove that concurrent authorization has a Java happens-before guarantee with each ACL mutation. But it proves that Kafka intentionally relies on a metadata-publisher sequencing model while authorization runs concurrently.

Therefore the next investigation should move one layer outward: determine the execution/visibility contract between MetadataLoader/AclPublisher and RPC authorization threads, rather than treating StandardAuthorizerData alone as evidence of a race.

## Important source evidence

AclPublisher comment: while ACL changes are being applied, the Authorizer continues returning authorization results in other threads; the publisher must avoid exposing invalid intermediate state.

KIP-801 consistency model: brokers and standby controllers continuously read the cluster metadata log up to their last stable offset, so each node's authorization state corresponds to some point on a single metadata timeline. The active controller may be slightly ahead of other nodes.

## Current epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
STANDARD_AUTHORIZER_MEMORY_RACE=HYPOTHESIS_ONLY
ACL_PUBLISHER_ORDERING=SOURCE_CONFIRMED
JAVA_HAPPENS_BEFORE_BETWEEN_PUBLISHER_AND_RPC=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next step

Inspect the MetadataLoader / publisher executor and broker request path at the pinned revision for the concrete synchronization or thread-affinity guarantee. Do not create another runtime harness until that boundary is understood.

No AB105.117R is created. AB105.116R remains frozen.