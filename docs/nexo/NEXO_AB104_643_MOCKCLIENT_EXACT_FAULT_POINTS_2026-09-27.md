# NEXO AB104.643 — MockClient / ProducerFailureHandling exact fault-point map

Date: 2026-09-27
Status: RESEARCH ONLY. No tests executed; no verification claim.

## Evidence
Apache Kafka's current repository explicitly supports targeted producer tests with Gradle, including `ProducerFailureHandlingTest`; its test architecture distinguishes unit tests from integration/system tests. citeturn0search0turn0search1

Current KafkaProducer source has testing-visible constructors accepting a supplied KafkaClient, Sender, RecordAccumulator and TransactionManager. This is important because unit tests can inject deterministic client/network behavior without pretending that such a test proves broker durability. citeturn0search8

## E642 fault-point map
- E642-1: KafkaClient response injection after ProduceRequest dispatch → models response loss. Expected client state: unresolved/UNKNOWN until retry or metadata reconciliation.
- E642-2: retriable ProduceResponse error before successful metadata → models retry. Expected: same producer-session lineage; no new Nexo logical operation.
- E642-3: multiple in-flight batches + first failure → models reorder risk when idempotence is disabled and max.in.flight permits concurrency.
- E642-4: broker/leader failure between send and response → integration-level fault, not MockClient proof of persistence.
- E642-5: transactional ProduceResponse success followed by commit response loss → transaction outcome remains separate from individual record callback.
- E642-6: delivery timeout/expiry → client reports failure after configured deadline, but this alone does not prove broker absence.
- E642-7: callback metadata received while consumer/read-to-end has not caught up → separates producer ACK from consumer convergence.
- E642-8: close/force-close with unresolved sends → unresolved outcome must not be synthesized as NOT_COMMITTED.

## Evidence-level separation
`MockClient/unit = client protocol transition evidence`.
`Integration broker fault = Kafka-domain behavior evidence`.
`Kafka read/reconciliation = current authoritative observation evidence`.
`Independent durable EvidenceRecord = Nexo historical claim evidence`.

No one layer substitutes for the next.

## New invariant
`ClientCallbackState MUST NOT mint ExternalEffectOutcome.`
For Kafka-backed offset persistence it may contribute `ProducerAckEvidence`; final Nexo claim requires scoped Kafka identity/lineage and reconciliation evidence.

## Exact next action
AB104.644: inspect actual ProducerFailureHandlingTest and MockClient source bodies around response injection, retry, timeout and callback assertions, then identify which E642 cases are directly represented by existing tests and which require new tests.
