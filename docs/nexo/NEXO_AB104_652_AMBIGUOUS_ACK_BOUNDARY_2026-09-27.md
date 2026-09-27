# NEXO AB104.652 — ambiguous ACK boundary

Date: 2026-09-27
Status: RESEARCH ONLY.

New external evidence: current KafkaProducerTest contains timeout/transaction tests, but the identified cases do not establish broker acceptance after lost acknowledgement.

The strongest relevant current tests are timeout-driven InitTransactions cases and transactional ProduceResponse error/retry cases. They exercise client-side state transitions and retry/error handling, not an authoritative proof that a broker accepted a request while the response was lost.

Current Apache Kafka issue evidence is useful for the boundary: KAFKA-21089 documents current KafkaProducerTest failures caused by leaked producer sender threads and a too-small wait timeout; this is test-harness behavior, not broker durability proof. KAFKA-17103 documents MockClient timeout/busy-wait behavior and nondeterminism concerns in KafkaProducerTest. Neither issue establishes external effect completion.

Key Nexo conclusion:
- Timeout/disconnect => outcome UNKNOWN unless an independent authoritative observation proves COMMITTED or NOT_COMMITTED.
- MockClient response injection => client-side test evidence only.
- A producer callback/exception cannot mint ExternalEffectOutcome.
- A broker-side or read-to-end observation is still required for durable external-effect claims.

Evidence:
CURRENT_TEST_SOURCE_VERIFIED=YES
AMBIGUOUS_ACK_EXACT_TEST_VERIFIED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.653 — inspect current KafkaProducer tests and implementation for explicit `disconnect(..., allowLateResponses)`/late-response paths and determine whether a test can demonstrate a late response after client-side timeout without treating it as proof of broker acceptance.
