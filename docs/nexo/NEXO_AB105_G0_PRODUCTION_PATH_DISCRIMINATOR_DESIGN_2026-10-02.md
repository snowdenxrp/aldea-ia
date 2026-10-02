# AB105 G0 — Production-path discriminator design checkpoint

Date: 2026-10-02 UTC
Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Current verified state
DIRECT_JMM=200/200_DENIED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
PUBLISHER_TO_RPC_VISIBILITY=UNKNOWN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC=UNKNOWN
PRODUCTION_PATH_TEST=NOT_PERFORMED
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## New source-boundary discovery
The pinned Kafka source contains an integration-test harness based on KafkaClusterTestKit in BrokerMetadataPublisherTest.scala. This is materially closer to the required experiment than another direct StandardAuthorizer test.

BrokerMetadataPublisher is constructed with an AclPublisher and its onMetadataUpdate path invokes:
  aclPublisher.onMetadataUpdate(delta, newImage, manifest)
The broker-side metadata publisher therefore provides a concrete integration seam between metadata publication and the broker runtime.

The existing BrokerMetadataPublisherTest demonstrates that a one-broker/one-controller KRaft cluster can be started in-process with KafkaClusterTestKit, access the BrokerServer, and exercise real Admin operations.

## Proposed discriminator
Build a dedicated diagnostic on a branch, not main:
1. Start a real KRaft cluster with KafkaClusterTestKit.
2. Configure a real StandardAuthorizer/ACL path matching the existing G0 witness.
3. Establish baseline authorization through a real client/RPC path.
4. Trigger controller-side ACL deletion through Admin.
5. Instrument/observe the broker-side metadata publication boundary without replacing the authorization implementation.
6. Submit a NEW authorization request after D0 and capture the actual RPC result.
7. Independently retain an earlier in-flight request where needed to keep the existing D2 control.
8. Record whether D1 is denied, allowed, or not observed, plus target broker and local ACL state where observable.

## Critical discriminator
The test must not equate:
- controller-side D0 completion,
- broker MetadataLoader/AclPublisher callback,
- local ACL cache mutation,
- RPC authorization decision.

Each must be independently observed or explicitly UNKNOWN.

## Do-not-overclaim
A D1 denial would not prove a JMM happens-before edge.
A D1 allowance would be evidence requiring source/runtime investigation, but would still not by itself establish production exploitability.
A missing D1 decision remains UNKNOWN and must not be converted to DENIED.

## Preservation
AB105.116R remains the canonical audit anchor.
Do not create AB105.117R while the semantic/attainability audit remains open.
Existing G0 witnesses remain unchanged.
