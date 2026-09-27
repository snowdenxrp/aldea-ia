# NEXO AB104.660 — Kafka response fault-injection hook audit

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Search target: exact current Apache Kafka mechanism for `ProduceRequest reaches broker -> ProduceResponse suppressed/delayed -> producer timeout -> independent read resolves outcome`.

Verified current NetworkClient path:
- `doSend(...)` inserts the request into `InFlightRequests` and sends it through `selector`.
- `poll()` processes completed receives, disconnections, then timed-out requests.
- A completed receive consumes the matching in-flight request and invokes its completion path.
- A timeout/disconnection is therefore a network-client lifecycle event, not broker-state evidence. citeturn0search0

Result of current hook search:
- No exact built-in current Kafka integration hook was verified that says "append this Produce request, but suppress only its response" as a reusable test API.
- `MockClient` can simulate response loss but is explicitly not broker-faithful.
- `NetworkClient`/Selector provide the production boundary, but direct response suppression requires a network-level fault mechanism or broker-side test seam that must be identified separately.
- Therefore AB104.659's proposed proxy/fault-layer route remains the cleanest production-faithful direction, but the exact Apache-provided hook is still UNKNOWN.

Critical correction:
Do not infer that absence of a response from `NetworkClient` means the Produce was rejected. The current client can only establish that its acknowledgement path did not complete. Independent topic observation is still required for an external-effect claim.

Evidence state:
NETWORKCLIENT_PRODUCTION_BOUNDARY=VERIFIED
EXACT_BUILTIN_RESPONSE_DROP_HOOK=NOT_VERIFIED
MOCKCLIENT_RESPONSE_LOSS=VERIFIED_BUT_NOT_BROKER_FAITHFUL
PRODUCTION_FAULT_HARNESS=REQUIRED
TEST_IMPLEMENTED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.661 — inspect Kafka's current integration-test networking utilities (including request/response filters, proxy/network fault utilities, and broker test hooks) for an exact response-drop/delay mechanism; if none exists, document the minimal external fault harness boundary rather than inventing one.
