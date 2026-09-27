# NEXO AB104.667 — FaultRule DSL semantics

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Exact source verified from Apache Kafka trunk fixture.

VERIFIED:
- `disconnectOn(ApiKeys)` returns `FaultRule.Builder` with action DISCONNECT.
- `.once()` registers a deterministic first-match rule.
- `.onCall(n)`, `.times(n)`, `.everyTime()` are deterministic trigger forms; probability mode is non-deterministic.
- `.forClient(String substring)` scopes matching to request `clientId` containing the substring. Without it, the rule matches any client.
- Matching/counters are evaluated only after API key and client-id filters match. `timesTriggered()` and `timesMatched()` are observable test evidence.
- The proxy's response pump obtains the original request header by correlation ID, including `apiKey` and `clientId`, then applies the rule on the broker→client response path. A DISCONNECT rule breaks the response loop and closes the connection. Therefore `disconnectOn(PRODUCE)` is semantically a response-loss seam, not request blackholing.
- `blackholeClient(...)` is a different request-path fault and must not be substituted for response-loss testing.

Important test design consequence:
Use a unique producer `client.id` and `disconnectOn(PRODUCE).forClient(<producer-id>).once()` if the experiment needs to prevent unrelated PRODUCE responses from consuming the rule. This is now a verified API, not an invented extension.

Still unresolved:
- Actual execution of the response-loss test.
- Whether a single-broker Produce followed by response disconnect is sufficient to classify the broker append independently; the independent consumer/readback must establish that.
- Replicated durability/failover semantics remain outside this single-broker experiment.

Epistemic state:
FAULT_RULE_DSL=VERIFIED
CLIENT_SCOPING=VERIFIED
PRODUCE_RESPONSE_DISCONNECT=VERIFIED
REQUEST_BLACKHOLE_EQUIVALENCE=NO
TEST_IMPLEMENTED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.668 — inspect exact producer configuration and timeout behavior needed to force the client into an observable UNKNOWN after the broker has processed the Produce but before the response reaches the client; then derive the smallest executable integration test and expected evidence record.
