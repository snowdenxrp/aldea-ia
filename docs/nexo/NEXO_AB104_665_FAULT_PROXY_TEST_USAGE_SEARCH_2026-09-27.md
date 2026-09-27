# NEXO AB104.665 — fault-proxy test usage search

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Search target: existing Apache Kafka trunk tests that already exercise `KafkaProtocolFaultProxy`, especially `disconnectOn(PRODUCE)`, client scoping, EmbeddedKafkaCluster setup, and independent consumer validation.

Fresh evidence:
- Kafka trunk contains the fault-proxy fixture and documents `disconnectOn(...)` / `delayOn(...)` usage directly in its source. The fixture is single-broker and intended for fast integration tests.
- Official Kafka system-test documentation confirms the broader established pattern of produce + consume + fault + validation, but that is the ducktape/system-test layer rather than proof that an existing fault-proxy test already covers Produce-response loss. citeturn0search5turn0search1
- A direct GitHub code-search route for exact current usages was unavailable through the available GitHub connector, and web search returned no exact usage result. Therefore no existing test method is claimed without source-level verification.

Important non-finding:
No verified current test using `disconnectOn(PRODUCE)` was located in this step. The fixture API is verified, but existing test adoption remains UNKNOWN.

Implication for Nexo:
Do not copy a hypothetical test pattern. The next safe step is to inspect the fixture's own test class(es) and the surrounding `clients/src/test` / `clients/src/testFixtures` tree via exact repository paths, then derive the setup from actual source. If no current usage exists, AB104.666 should specify the minimal new integration test while keeping implementation deferred.

Evidence:
FAULT_PROXY_SOURCE=VERIFIED
PRODUCE_DISCONNECT_API=VERIFIED
EXISTING_PRODUCE_DISCONNECT_TEST=NOT_VERIFIED
CLIENT_SCOPING_USAGE=NOT_VERIFIED
CONSUMER_RECONCILIATION_USAGE=NOT_VERIFIED
TEST_IMPLEMENTED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.666 — locate exact fixture test source(s) in the merged commit/tree and verify their usage; if no Produce-response-loss test exists, define the minimal new integration test from verified APIs only.
