# NEXO AB104.645 — Kafka producer test-body retrieval boundary

Date: 2026-09-27
Status: RESEARCH ONLY — no implementation, no test execution, no correctness verification.

## Evidence
Official Apache Kafka Gitiles exposes current repository commits and test-running guidance, including targeted ProducerFailureHandlingTest execution, but the direct current trunk path requested for ProducerFailureHandlingTest.java was not retrievable through the available GitHub connector route (404). The official Apache Gitiles search result confirms the Kafka repository and current test-run mechanism, but does not expose the exact requested test body in the retrieved result.

Web evidence:
- Apache Kafka Gitiles repository commit page: current repository history is publicly exposed.
- Apache Kafka GitHub README: targeted ProducerFailureHandlingTest execution is supported.
- GitHub connector direct fetch of clients/src/test/java/org/apache/kafka/clients/producer/ProducerFailureHandlingTest.java at trunk returned 404.
- GitHub connector direct fetch of the corresponding GitHub blob URL also returned 404.

## Claim boundary
EXACT_TEST_BODY_VERIFIED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

Do not infer exact method names, MockClient queue APIs, assertions, or coverage from repository structure, historical versions, or search snippets.

## Research result
The retrieval gap is narrowed but not closed. Official Apache Gitiles is a viable source family, and the Kafka repository currently documents targeted ProducerFailureHandlingTest execution. Exact current test-body evidence still requires a retrievable canonical snapshot/path or another direct source exposing the source text.

## Preserved fault surface
E642-1..E642-8 remain execution-pending:
1 response injection after ProduceRequest;
2 retriable ProduceResponse;
3 multi-in-flight failure/reorder;
4 broker/leader failure requiring integration;
5 transactional send/commit response loss;
6 delivery timeout/late acceptance;
7 producer ACK vs consumer/read-to-end lag;
8 unresolved close/force-close sends.

Invariant preserved:
ClientCallbackState MUST NOT mint ExternalEffectOutcome.

## Exact next action
AB104.646: use the official Apache Gitiles commit/tree route to locate the exact current ProducerFailureHandlingTest and MockClient paths by tree navigation or a known commit, then retrieve the source body line-by-line. If the current path has moved, record the exact replacement path and commit. Do not mark any test covered/executed until the body and actual execution evidence are available.
