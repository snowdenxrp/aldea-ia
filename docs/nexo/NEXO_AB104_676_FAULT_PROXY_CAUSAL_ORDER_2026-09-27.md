# NEXO AB104.676 — Fault proxy causal ordering
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current source ordering
Verified in Apache Kafka trunk `KafkaProtocolFaultProxy`:
1. broker response frame is read by `pumpResponses`.
2. correlationId is extracted and the original `RequestHeader` is removed from `inflight`.
3. API key and clientId come from that original request header.
4. `firstFiringRule(apiKey, clientId)` is evaluated.
5. For a DISCONNECT rule, the rule fires before any response bytes are written to the client.
6. The proxy executes `break`; `finally` closes both sockets.
7. Therefore the broker response has reached the proxy, but that response is not forwarded to the producer.

This is the exact causal seam required for response-loss-after-broker-response, distinct from request blackholing.

## Frozen causal evidence
Target sequence:
BROKER_RESPONSE_RECEIVED
 -> REQUEST_HEADER_CORRELATED
 -> PRODUCE_RULE_MATCHED
 -> DISCONNECT_RULE_TRIGGERED
 -> NO_RESPONSE_FRAME_FORWARDED
 -> PRODUCER_CLIENT_FAILURE/LOSS
 -> INDEPENDENT_DIRECT_BROKER_OBSERVATION

The proxy source does not itself expose a durable broker-append marker. Therefore rule-trigger evidence must remain separate from broker-record observation.

## Important limitation
The source ordering proves response suppression after the proxy receives the broker response. It does not, by itself, prove that the broker appended the record successfully. The independent direct reader remains necessary.

## Frozen implementation assertions
- `timesTriggered() == 1`
- `timesMatched() >= 1`
- producer does not obtain successful metadata
- verifier connects directly to broker, bypassing proxy
- exact effect identity determines PRESENT vs NOT_OBSERVED
- no NOT_COMMITTED conclusion from producer failure or proxy disconnect alone

## Status
VERIFIED: causal proxy ordering and response-suppression seam.
NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.677: inspect the current direct-broker verifier path and its polling/offset semantics, then freeze the observation deadline and PRESENT/NOT_OBSERVED/READ_PATH_ERROR classification before test implementation.
