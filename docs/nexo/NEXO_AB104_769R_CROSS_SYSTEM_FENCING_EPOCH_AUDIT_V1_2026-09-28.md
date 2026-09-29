# NEXO AB104.769R — Cross-system fencing: Kafka producer epochs vs metadata ACL revocation

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no exploit/race claim.

## Scope

Compare Kafka's ACL revocation path with a real Kafka mechanism that already implements fencing at the protected protocol state: producer epochs / transactional fencing. Also inspect ZooKeeper's committed transaction identity as a contrasting ordered-state mechanism.

## Findings

1. Kafka already has an explicit epoch-based fencing mechanism for transactional producers. Current KafkaProducer documentation states that another producer using the same transactional.id can cause ProducerFencedException, and that an old producer epoch can cause InvalidProducerEpochException. This is materially different from ACL revocation: the protected protocol checks an epoch tied to the producer's identity/state rather than relying only on an authorization decision made earlier.

2. Current TransactionCoordinator source checks producerId/producerEpoch against coordinator state while processing transactional operations. It returns PRODUCER_FENCED when the supplied epoch is stale. TransactionMetadata explicitly bumps the producer epoch when fencing/rotation occurs and preserves state needed to reject older epochs.

3. This provides a concrete example of effect-path fencing: the operation carries an authority/identity version, and the receiver compares it with current state at the operation boundary. A stale version is rejected rather than merely being remembered as previously authorized.

4. This does NOT mean Kafka ACLs use the same mechanism. The ACL path audited in AB104.762R–768R remains based on local authorizer state and request-time authorization; no equivalent ACL epoch check was established immediately before ordinary Produce append.

5. ZooKeeper provides a different but related ordering primitive: committed transactions carry zxid and DataTree records lastProcessedZxid. This is an ordered state identifier, but the inspected source does not by itself establish that zxid is an authorization fence. It should therefore be treated as an ordering/commit-position primitive, not automatically as revocation fencing.

## Comparative model

ACL path studied:

control-plane ACL change → metadata propagation → local authorizer state → previously authorized request → append

Producer fencing path:

current producer epoch/state ← operation carries producer epoch → coordinator validates epoch → stale epoch rejected

The second path has an explicit stale-version rejection at the protocol boundary. The first path, in the audited ordinary Produce flow, does not yet show an equivalent effect-time ACL epoch comparison.

## Important epistemic boundary

This comparison demonstrates that Kafka can implement fencing semantics when the protocol is designed around epochs. It does NOT prove that ACL revocation must use epochs, nor that the ACL path is vulnerable. The exact semantics of a desired revocation fence still require cross-system study and failure analysis.

## Evidence ledger

KAFKA_PRODUCER_EPOCH_FENCING: SOURCE CONFIRMED
STALE_PRODUCER_EPOCH_REJECTED: SOURCE CONFIRMED
PRODUCER_EPOCH_BUMP_STATE: SOURCE CONFIRMED
ZK_COMMITTED_TRANSACTION_ORDER_ID: SOURCE CONFIRMED
ZK_ZXID_AS_AUTHZ_FENCE: NOT ESTABLISHED
ACL_REVOCATION_EQUIVALENT_EPOCH_FENCE: NOT FOUND IN AUDITED PATH
EXECUTED_ACL_REVOCATION_RACE: NO

## Nexo research implication

The evidence introduces a useful distinction for later distillation:

`authority_observation` is not the same primitive as `authority_version_fence`.

A fence becomes meaningful when the protected operation presents or is bound to a version/epoch and the effect-side authority state rejects stale versions. This is stronger than checking a monitoring offset or relying on a prior admission decision.

Do not yet promote this to final Nexo architecture. Continue studying fencing under retries, failover, delayed messages, and split-brain conditions.

## Exact next action

AB104.770R: study fencing failure modes in Kafka producer epochs and a second distributed lock/lease system. Focus on stale delayed operations, retries, failover, epoch persistence, and what guarantees survive process restart. Extract concrete safety invariants and counterexamples without designing Nexo yet.
