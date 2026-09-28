# NEXO AB104.756 — OFLE correlation exception boundary audit

Date: 2026-09-28
Scope: exact NetworkClient source path from raw receive to response parsing.

## Findings

Current NetworkClient.poll() invokes handleCompletedReceives(...) after selector processing. handleCompletedReceives obtains the next in-flight request for the receive source and immediately calls:

parseResponse(receive.payload(), req.header)

before any throttle handling, logging of the parsed response, response-type dispatch, or completion callback.

NetworkClient.parseResponse delegates to AbstractResponse.parseResponse(responseBuffer, requestHeader). A CorrelationIdMismatchException is rethrown for ordinary non-SASL-reserved request correlations. The only special conversion is for a reserved SASL request receiving a non-reserved response, where NetworkClient converts the mismatch into SchemaException.

Therefore for a normal consumer OFLE request with a non-reserved request correlation and deliberately different non-reserved response correlation, the source path establishes that mismatch is raised at the response-header parsing boundary before the OFLE response body can reach consumer reducer processing.

This remains source-level evidence only. No OFLE-specific mismatch test has been executed in this audit chain.

## Exact causal boundary

raw NetworkReceive
→ selector.completedReceives()
→ inFlightRequests.completeNext(source)
→ NetworkClient.parseResponse(...)
→ AbstractResponse.parseResponse(...)
→ response-header correlation validation
→ CorrelationIdMismatchException
→ no OFLE response object returned to handleCompletedReceives
→ no throttle/reducer/completion processing

Important caveat: inFlightRequests.completeNext(source) occurs before parseResponse. Thus the request is removed from the in-flight collection before the mismatch exception is surfaced. The evidence does not by itself establish what higher-level caller recovery/retry semantics do after this exception.

## Status

NETWORKCLIENT_PARSE_RESPONSE_BOUNDARY=SOURCE_VERIFIED
CORRELATION_CHECK_PRECEDES_OFLE_BODY_PROCESSING=SOURCE_VERIFIED
NORMAL_NON_RESERVED_MISMATCH_RETHROWN=SOURCE_VERIFIED
SASL_RESERVED_EXCEPTION_SPECIAL_CASE=SOURCE_VERIFIED
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.757: inspect AbstractResponse.parseResponse and ResponseHeader parsing at exact source level, including the point where the correlation IDs are compared and whether the API body is parsed only after that comparison. Preserve NOT EXECUTED until a real OFLE test run is observed.
