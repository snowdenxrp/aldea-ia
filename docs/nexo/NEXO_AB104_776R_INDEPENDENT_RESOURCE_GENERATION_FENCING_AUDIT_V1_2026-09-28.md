# NEXO AB104.776R — independent resource-side generation fencing audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Compare the etcd incarnation-fencing findings with an independent implementation that places generation checks at the protected metadata/effect boundary, including failure and recovery behavior.

## Independent implementation studied
EtcFS documents a generation-fencing protocol in which each node has a monotonically increasing generation stored in etcd. Metadata mutations include a generation guard in the same etcd transaction as the mutation. The write path also stamps the data with the writer generation. A generation bump therefore makes subsequent metadata commits from the old node fail. The project documents integration/chaos verification of the fenced-write path on real AWS infrastructure. This is implementation evidence from the project itself, not an independent formal proof. citeturn0search0turn0search7

## Critical detail: the guard is at the mutation boundary
The documented write sequence is approximately:
1. process obtains its startup generation;
2. process performs data-path work;
3. process attempts metadata commit carrying the original generation;
4. the metadata transaction compares current generation with that original generation;
5. if fencing happened meanwhile, the transaction fails and the metadata mutation is not committed.
The design explicitly accepts that a low-level data write can have happened before the guarded metadata commit. Such orphaned/unreferenced data is treated differently from committed metadata state. This is useful evidence of containing an unsafe intermediate side effect rather than pretending the entire external I/O sequence is atomic. citeturn0search0

## Recovery / failure finding
The external fencing controller does not treat lease expiry alone as sufficient proof that a node can safely be reclaimed. Where a configured external fencer exists, device access is severed first and the generation is bumped only after that external fencing step succeeds. The generation bump then becomes the authoritative signal used by lock reclamation and metadata guards. The documented NVMe path relies on the device itself rejecting stale writes; EBS detach is asynchronous and is polled to completion. citeturn0search1turn0search3

This gives a concrete ordering rule:

external access fence -> generation bump -> new-owner reclamation

rather than:

lease expired -> assume old writer is harmless -> reclaim

## Independent comparison result
This independently reinforces the general pattern already observed in etcd:
- authority generation is state;
- the generation transition is durable/ordered;
- every protected mutation carries the generation it started under;
- the protected store checks the generation as part of the mutation boundary;
- stale generation is rejected;
- reclamation of the resource is delayed until the old writer is actually fenced where necessary.
The important difference from a simple distributed lock is that the resource/effect path participates in enforcement.

## Kubernetes contrast
Kubernetes provides a related but narrower optimistic-concurrency primitive: objects expose a resourceVersion and clients can submit an update conditioned on the version they observed; stale versions are rejected with 409 Conflict. Kubernetes also documents that some read/cache semantics can be stale. This confirms that resource versioning is useful for stale-update detection, but it is not by itself proof that an arbitrary external side effect is fenced. citeturn0search2turn0search6

## Evidence ledger
INDEPENDENT_GENERATION_GUARDED_MUTATION: SOURCE CONFIRMED
GENERATION_STAMP_ON_EFFECT_METADATA: SOURCE CONFIRMED
STALE_GENERATION_REJECTED: SOURCE CONFIRMED
CHAOS/REAL_INFRA_VERIFICATION_REPORTED: SOURCE CONFIRMED
LEASE_EXPIRY_ALONE_SUFFICIENT_FOR_EXTERNAL_RECLAIM: FALSE IN STUDIED DESIGN
EXTERNAL_FENCING_BEFORE_GENERATION_BUMP: SOURCE CONFIRMED FOR CONFIGURED FENCER
RESOURCE_VERSION_STALE_UPDATE_REJECTION_KUBERNETES: SOURCE CONFIRMED
ARBITRARY_EXTERNAL_EFFECT_ATOMICITY: NOT ESTABLISHED
FORMAL_PROOF: NOT ESTABLISHED
NEXO_IMPLEMENTATION: NOT PERFORMED

## Nexo implication
We now have converging evidence from etcd, Kafka producer epochs, an independent generation-fenced storage design, and Kubernetes resource-version concurrency control that stale state must be rejected at or immediately within the protected mutation boundary. The exact mechanism differs, but the common safety property is stronger than merely observing freshness.

Candidate invariant for later formalization:

For protected namespace R, an effect carrying authority/incarnation state S is accepted only if S satisfies the current acceptance predicate of R at the same commit boundary that makes the effect durable.

This is intentionally a candidate invariant, not yet the final Nexo law.

## Exact next action
AB104.777R: investigate the boundary where the generation/fence itself is changed and the old operation may already be in flight. Focus on ordering: fence transition, queued/in-flight effects, resource commit, restart, and recovery. Determine whether a stale effect can still become durable after the fence transition, and which layer actually prevents it.