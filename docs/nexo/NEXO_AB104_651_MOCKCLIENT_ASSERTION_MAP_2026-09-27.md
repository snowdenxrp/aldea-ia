# NEXO AB104.651 — MockClient assertion map

Date: 2026-09-27
Status: RESEARCH ONLY.

Exact current KafkaProducerTest was retrieved at blob SHA 6180ffee369acbb1b7b7b9cab3ddf6f57c286a65 and filtered locally by source-line content.

Verified current MockClient test surface includes:
- `testInitTransactionsResponseAfterTimeout`: prepared coordinator response + timeout, then retry of initTransactions.
- `testInitTransactionTimeout`: prepared coordinator response, timeout, then prepared coordinator + InitProducerId responses and successful retry.
- `testInitTransactionsWithKeepPreparedTxnAndTwoPhaseCommit`: prepared coordinator/producer-id responses.
- `testTransactionV2ProduceWithConcurrentTransactionError`: exact ProduceResponse with `Errors.CONCURRENT_TRANSACTIONS`, followed by success ProduceResponse and successful EndTxn response; this is concrete retry/error behavior.
- `testCommitTransactionWithRecordTooLargeException`: prepared transaction responses; send future gets RecordTooLargeException and commit throws KafkaException.
- `testCommitTransactionWithMetadataTimeoutForMissingTopic` and partition-out-of-range: producer-side timeout/error propagation through mocked client/metadata.
- `testAbortTransaction`: mocked coordinator, InitProducerId and EndTxn responses.

Important boundary: these assertions prove producer state/error handling under injected client responses. They do NOT prove broker durability, external effect completion, or read-to-end reconciliation.

E642 mapping status:
E642-1 response loss after broker acceptance: NOT directly proven by these identified tests.
E642-2 retriable response/error: PARTIAL — concurrent transaction response followed by success is directly represented.
E642-3 multi-in-flight/reordering: NOT directly established by this filter.
E642-5 transactional send + commit response loss: NOT directly established.
E642-6 timeout + late acceptance: timeout paths exist, but late broker acceptance is not proven.
E642-7 callback metadata vs consumer/read-to-end: NOT proven.
E642-8 close unresolved: separate tests exist but no external durability claim.

Evidence:
CURRENT_TEST_SOURCE_VERIFIED=YES
FILTERED_ASSERTION_SURFACE_VERIFIED=YES
E642_EXHAUSTIVE_COVERAGE=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.652 — inspect the exact source around the strongest ambiguous-outcome candidates (timeouts, response disconnects, close, and transactional commit) and determine whether any current test explicitly models acknowledgement loss rather than ordinary error/timeout.
