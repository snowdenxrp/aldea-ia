# NEXO AB104.748R2 — correction/confirmation of OFLE correlation re-audit

Date: 2026-09-28
Kafka source: abf522e1ca5d7f4375baddc4da004da9fcb6e9ca

Fresh direct inspection of the exact Kafka test fixture confirms the previous 748R boundary and adds one concrete detail: MockClient's response helpers create ClientResponse headers from the pending request via request.makeHeader(version). Thus MockClient response preparation does not independently control the wire correlation ID.

NetworkClientTest does provide the independent wire-level construction: serializeResponseWithHeader(response, version, correlationId) -> NetworkReceive -> MockSelector.completeReceive -> NetworkClient.poll. The inspected tests use this with matching IDs; no OFLE mismatch assertion was found.

Therefore:
MOCKCLIENT_INDEPENDENT_CORRELATION = NO
LOW_LEVEL_ARBITRARY_CORRELATION_CONSTRUCTION = YES
LOW_LEVEL_MATCHING_EXECUTION = YES
OFLE_MISMATCH_EXECUTION = NO
DIRECT NETWORKCLIENT MISMATCH ASSERTION = NO

No test was executed by this audit. No production source changed. Nexo implementation remains NOT_STARTED.
