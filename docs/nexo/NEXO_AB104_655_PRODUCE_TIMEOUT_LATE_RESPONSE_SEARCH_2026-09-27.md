# NEXO AB104.655 — Produce timeout / late-response search

Date: 2026-09-27
Status: RESEARCH ONLY.

Current KafkaProducerTest was searched for the AB104.654 pattern using ProduceResponse, prepareResponse, respond and TimeoutException.

Finding:
- The exact timeout-then-late-response sequence verified at AB104.654 exists for `InitProducerId`.
- Current KafkaProducerTest contains actual ProduceResponse injections, including `Errors.CONCURRENT_TRANSACTIONS` followed by `Errors.NONE`, but this is an error/retry sequence, not a timeout followed by a late ProduceResponse.
- Current tests `testCommitTransactionWithMetadataTimeoutForMissingTopic` and `...PartitionOutOfRange` assert producer send futures timing out and commit failing, but the source does not show a subsequent injected ProduceResponse resolving the timed-out send.
- `testOnlyCanExecuteCloseAfterInitTransactionsTimeout` confirms post-init timeout state restrictions and close behavior; it does not exercise an external Produce effect.

Therefore no current KafkaProducerTest was identified that directly models: ProduceRequest in flight -> client timeout -> later ProduceResponse for that same ProduceRequest.

Nexo conclusion:
The research gap is now narrower: the client test suite has a verified ambiguity pattern for transactional initialization, and verified Produce error/retry patterns, but no verified same-operation late ProduceResponse pattern in the current KafkaProducerTest.

Evidence:
CURRENT_TEST_SOURCE_VERIFIED=YES
PRODUCE_TIMEOUT_LATE_RESPONSE_TEST_VERIFIED=NO
PRODUCE_ERROR_RETRY_TEST_VERIFIED=YES
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.656 — inspect KafkaProducer/Sender test seams and MockClient request lifecycle to determine the smallest exact test that would model ProduceRequest timeout followed by late response, without conflating simulation with broker acceptance.
