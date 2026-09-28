# NEXO AB104.760 — OFLE NetworkReceive injection audit

Date: 2026-09-28
Scope: exact NetworkReceive construction, MockSelector injection, NetworkClient.poll processing, and freeze of the no-production-change OFLE correlation-mismatch test recipe.

## Findings

NetworkReceive(String source, ByteBuffer buffer) directly stores the supplied source and payload buffer. The constructor is therefore suitable for injecting the already serialized response bytes without reproducing socket framing in the test.

Current MockSelector.completeReceive(NetworkReceive) only appends the supplied receive to completedReceives. It performs no response parsing or correlation validation.

Current NetworkClient.poll(...) calls selector.poll(), then handleCompletedReceives(...). That method iterates completed receives, obtains the matching in-flight request using the receive source, and calls parseResponse(receive.payload(), req.header). Thus the injected bytes reach the same response parsing boundary used by the NetworkClient path.

Repository tests already execute this exact structural injection pattern with real NetworkReceive objects and NetworkClient.poll(); those examples use matching correlation IDs. This establishes the test mechanism, not the OFLE mismatch assertion.

## Frozen no-production-change recipe

1. Create a real NetworkClient with MockSelector.
2. Establish the test node/connection and await readiness as existing NetworkClientTest infrastructure does.
3. Construct a minimal consumer OFLE request using Builder.forConsumer at supported version (v3 is the minimum stable target).
4. Send the request and retain the actual ClientRequest correlationId and API version.
5. Ensure the chosen response correlationId is non-reserved and different from the actual request correlationId.
6. Construct a valid one-topic/one-partition OffsetsForLeaderEpochResponse.
7. Serialize it with RequestTestUtils.serializeResponseWithHeader(response, requestVersion, mismatchedCorrelationId).
8. Inject a new NetworkReceive(node.idString(), buffer) using selector.completeReceive(...).
9. Call networkClient.poll(...).
10. Assert CorrelationIdMismatchException.
11. Do not interpret this assertion as proof of reducer behavior, retry semantics, provider recovery, or Nexo correctness.

Expected boundary:
MockSelector queue -> NetworkClient.poll -> handleCompletedReceives -> completeNext -> parseResponse -> ResponseHeader.parse -> correlation compare -> CorrelationIdMismatchException

Important caveat retained from AB104.756: completeNext(source) removes the in-flight request before the mismatch exception is surfaced. Post-exception retry/recovery behavior is therefore outside this minimal test.

## Status

NETWORKRECEIVE_DIRECT_PAYLOAD_CONSTRUCTION=SOURCE_VERIFIED
MOCKSELECTOR_COMPLETE_RECEIVE=SOURCE_VERIFIED
NETWORKCLIENT_POLL_TO_COMPLETED_RECEIVES=SOURCE_VERIFIED
EXACT_INJECTION_PATTERN_EXISTING_IN_REPO=YES
OFLE_SPECIFIC_MISMATCH_RECIPE=FROZEN
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.761: inspect the existing NetworkClientTest setup/fixture helpers needed to instantiate the real OFLE ClientRequest without production changes, and determine the smallest concrete test location/fixture reuse. Preserve the frozen recipe and NOT EXECUTED status.
