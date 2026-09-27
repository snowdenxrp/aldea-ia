# NEXO AB104.654 — InitTransactions timeout / late response

Date: 2026-09-27
Status: RESEARCH ONLY.

Exact current `KafkaProducerTest.testInitTransactionsResponseAfterTimeout` body was retrieved.

Verified sequence:
1. `max.block.ms=500`.
2. MockClient prepares a successful transaction coordinator response.
3. `producer.initTransactions()` runs asynchronously.
4. The test waits until the `InitProducerId` request is in flight.
5. MockTime advances by `maxBlockMs`.
6. The future is asserted to throw `TimeoutException`.
7. ONLY AFTER that timeout, the test injects a successful `InitProducerId` response.
8. The test sleeps 1 second and calls `producer.initTransactions()` again successfully.

Critical interpretation:
- This is genuine evidence of a client-side timeout followed by a late response injection.
- It is NOT proof that the original broker-side `InitProducerId` request was accepted before the timeout; MockClient is the simulated transport.
- It does demonstrate that a timeout does not imply the request never reached the remote participant.
- The operation is `InitTransactions`, whose protocol semantics establish/recover transactional producer identity/epoch; this is not itself an external business effect.
- No duplicate external effect is asserted by this test, and no durable broker-state observation is made.

Nexo mapping:
E642-6 = CONCRETE CLIENT-SIDE AMBIGUITY TEST SURFACE.
ExternalEffectOutcome = UNKNOWN remains required unless independent authoritative evidence resolves the remote outcome.

Evidence:
EXACT_TEST_BODY_VERIFIED=YES
LATE_RESPONSE_AFTER_TIMEOUT_SIMULATED=YES
BROKER_ACCEPTANCE_PROVEN=NO
EXTERNAL_EFFECT_COMPLETION_PROVEN=NO
TEST_EXECUTED_BY_NEXO=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.655 — inspect whether current KafkaProducer tests contain an analogous timeout-then-late-response sequence for an actual Produce request (not InitProducerId), because that would be materially closer to an external-effect ambiguity case.
