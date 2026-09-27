# NEXO AB104.610 — outbox/inbox atomicity and minimum crash-safe EvidenceRecord
Date: 2026-09-27
Status: research/design only; no implementation.

## Research findings
- Transactional outbox makes source DB state + publish intent atomic, but relay delivery remains at-least-once and can duplicate after publish-before-marking-sent crash. AWS and microservices.io explicitly require idempotent consumers. 
- Idempotent consumer pattern records processed message identity in the same database transaction as the business effect; a uniqueness constraint makes duplicate processing transactionally detectable.
- Debezium's outbox router carries a unique event ID in the emitted message header specifically usable for consumer-side deduplication.
- Therefore, exactly-once must not be inferred merely from an outbox + unique ID. The strongest local claim is: for one consumer authority domain, if processed-ID reservation and business mutation share one atomic transaction, duplicate deliveries do not create a second committed local business effect. Cross-domain/external effects remain separate claims.

## Minimum crash-safe EvidenceRecord
EvidenceRecord fields: EvidenceID, LogicalOperationID, EffectID, AuthorityDomainID, AuthorityIncarnation, ConsumerDomainID, ConsumerIncarnation, AdmissionID, Generation, ContractDigest, SourceEventID, DeliveryAttemptID, SourceRevision/LSN, Predicate/VersionEvidence, ProcessingState, DedupDecision, LocalCommitRevision, ExternalProviderID, ResourceIncarnation, ReconciliationState, FaultPoint, EvidenceTimestamp, ProvenanceDigest.

Required semantics:
- identity fields bind evidence to the exact logical operation and authority incarnation;
- source revision/LSN is scoped ordering evidence;
- DedupDecision=ALREADY_PROCESSED proves only that this consumer authority had durable prior processing evidence;
- LocalCommitRevision proves only local transaction commit;
- external provider fields do not prove external completion without provider evidence;
- crash after external effect but before local dedup/ack => UNKNOWN unless reconciliation proves outcome;
- same EffectID with different contract/parameters => conflict, never silently treated as same operation.

## Fault additions
FI-610-A: duplicate delivery before consumer transaction -> one commit.
FI-610-B: duplicate delivery concurrently -> uniqueness conflict/serialization; exactly one local effect.
FI-610-C: crash after local effect commit before broker ack -> retry must reconcile/dedup, not execute blindly.
FI-610-D: same EffectID with changed contract digest -> reject as identity collision.
FI-610-E: dedup table restored from older snapshot -> consumer incarnation changes; old dedup evidence cannot silently authorize current effect.
FI-610-F: external effect is non-transactional with consumer DB -> local inbox atomicity does not prove external exactly-once.

## Key conclusion
Architecture must preserve three distinct claims:
1. DELIVERY CLAIM: message was accepted/observed by downstream transport.
2. LOCAL PROCESSING CLAIM: consumer committed one local effect for this logical event.
3. EXTERNAL EFFECT CLAIM: provider/resource committed the intended effect.
Only #2 can be strengthened by a transactional inbox/processed-ID boundary. #3 requires provider-specific identity, fencing, and reconciliation.

## Next
AB104.611: research concrete inbox uniqueness/concurrency behavior and CDC relay failure semantics; derive adversarial tests for concurrent duplicate delivery and stale inbox restore.