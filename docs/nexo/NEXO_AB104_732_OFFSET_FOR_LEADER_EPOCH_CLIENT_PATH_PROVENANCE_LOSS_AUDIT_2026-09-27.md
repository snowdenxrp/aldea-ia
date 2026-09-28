# NEXO AB104.732 — OffsetForLeaderEpoch client-path and provenance-loss audit
Date: 2026-09-27

Status: SOURCE_PATH_VERIFIED=PARTIAL/YES; CLIENT_TO_REDUCER_BOUNDARY_VERIFIED=YES; RAW_FIELD_PRESERVATION_BEFORE_REDUCER=NO; CORRELATION_MISMATCH_HANDLING=VERIFIED_AT_NETWORK_LAYER; DISCONNECT_TIMEOUT_UNKNOWN_HANDLING=VERIFIED_AT_NETWORK_LAYER; DIRECT_OFFSET_LEADER_EPOCH_TEST_COVERAGE=UNKNOWN; TOPIC_INCARNATION=UNKNOWN; BROKER_INCARNATION=UNKNOWN; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## Scope
AB104.732 directly audits the current client path using available current Apache Kafka source evidence, concentrating on the boundary where a parsed OffsetForLeaderEpoch response is handed to OffsetsForLeaderEpochUtils.handleResponse().

## 1. Parsed-response to reducer boundary
Current Kafka source shows the OffsetForLeaderEpoch request is constructed for a specific broker/node. When the asynchronous request completes successfully, the response body is cast to OffsetsForLeaderEpochResponse and immediately passed to OffsetsForLeaderEpochUtils.handleResponse(fetchPositions, offsetsForLeaderEpochResponse). The result is then exposed as OffsetForEpochResult.
This establishes: NETWORK/PARSED RESPONSE -> OffsetsForLeaderEpochResponse -> handleResponse(...) -> OffsetForEpochResult.

## 2. Provenance available before reducer
NetworkClient's in-flight request carries request header, destination, request creation/send times, request body, callback and timeout state. RequestHeader contains API key, API version, header version, client ID and correlation ID. Response processing uses the original request header to determine API key/version and correlates the response header against the request correlation ID.

## 3. Correlation mismatch
Current NetworkClient explicitly checks response correlation ID against request correlation ID and rejects mismatches. Nexo consequence: provenance must bind to original request metadata before reduction; it must not reconstruct correlation later.

## 4. Disconnect and timeout
Current NetworkClient clears in-flight requests on disconnect and creates disconnected/timeout response states. These states do not contain a successful OffsetForLeaderEpoch response body. Therefore DISCONNECT/TIMEOUT != VALID_RESPONSE. For Nexo this remains UNKNOWN and must not become proof of non-commitment.

## 5. Version mismatch
If the selected API version cannot represent the request, the send path handles UnsupportedVersionException locally and records an aborted response state rather than a successful broker response. Therefore LOCAL_VERSION_REJECTION != BROKER_PROTOCOL_ERROR != TIMEOUT/DISCONNECT.

## 6. Reducer information-loss boundary
After OffsetsForLeaderEpochUtils.handleResponse() reduces the response, multiple raw protocol errors share the same retry result. RAW_RESPONSE(errorCode=X, partition=P) and RAW_RESPONSE(errorCode=Y, partition=P) can both become partitionsToRetry += P. OffsetForEpochResult therefore cannot alone prove which raw error occurred.
This confirms AB104.729/730: raw response provenance must be captured before reduction when Nexo depends on error identity or response semantics.

## 7. Mixed-partition responses
OffsetForLeaderEpoch is partition-scoped. Aggregate retry membership is insufficient provenance. Minimum granularity is OperationID + correlationId + topic + partition + raw response fields.

## 8. Direct test evidence limitation
Available current public source searches did not produce a directly inspectable exhaustive dedicated OffsetsForLeaderEpochUtils.handleResponse() test body. Existing consumer tests establish downstream validation/retry behavior but do not prove exhaustive raw reducer coverage.
Required direct evidence remains: every explicit retry branch; authorization terminal branch; default/unrecognized branch; NONE success; empty response; mixed partitions; duplicate/contradictory entries where representable; correlation mismatch; disconnect/timeout; unsupported version; stale response after metadata/topic recreation.

## 9. Provenance-loss map
Before reducer: API key, API version, header version, client ID, correlation ID, destination/node ID, request/response timing, raw topic/partition, raw error code, raw leader epoch when supplied, raw end offset, and transport state are available at their respective boundaries.
After reducer: successful epoch/end-offset data survives for successful entries; retry-classified raw error identity is collapsed into retry membership; authorization remains distinguishable; transport/request metadata is not represented by OffsetForEpochResult itself.

## 10. Nexo consequence
If Nexo ever depends on this evidence, the adapter/observation layer should capture an immutable evidence record at the parsed-response boundary before reducer collapse. Candidate fields: OperationID, KafkaApiKey, ApiVersion, HeaderVersion, ClientID, CorrelationID, DestinationNodeID, RequestTime, ResponseTime, Topic, Partition, request leader epoch/current leader epoch when supplied, ResponseErrorCode, ResponseLeaderEpoch when supplied, ResponseEndOffset, ProtocolSchemaIdentity, TransportOutcome, source/metadata generation, and independently authoritative TopicIncarnation when available.

## 11. UNKNOWN
Exact current generated OffsetsForLeaderEpochClient.java body was not directly retrieved through the available GitHub connector. Exhaustive direct reducer tests remain UNKNOWN. Topic incarnation and broker incarnation remain UNKNOWN. No Nexo adapter or runtime test exists. No broker durability or external-world correctness is established. TLC remains PENDING.

## 12. Conclusion
CONFIRMED: parsed response reaches reducer directly; NetworkClient preserves request header/destination/in-flight correlation context; correlation mismatch is rejected; timeout/disconnect/version mismatch are distinct from a successful parsed response; reducer is a provenance-loss boundary for retry-classified raw errors; partition-level evidence is required for multi-partition claims.
NOT CONFIRMED: exhaustive direct reducer tests, topic incarnation, broker incarnation, Nexo implementation/runtime correctness.
No Kafka source was modified. No Nexo implementation was performed. No runtime test was executed. No correctness/security/deployment guarantee is claimed.

## EXACT NEXT ACTION
AB104.733 — inspect strongest available direct Kafka tests around reducer/client, NetworkClient correlation mismatch, stale/disconnected responses, unsupported versions, and mixed-partition responses; distinguish directly asserted cases from behavior only implied by source. Do not implement Nexo. Do not create V21.