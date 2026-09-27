# NEXO AB104.662 — KAFKA-21074 exact response-gap capability

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Fresh Apache evidence reviewed: KAFKA-21074 / PR #23438.

Verified from the Apache issue description:
- The proposed/active test fixture is a client-agnostic Kafka wire-protocol fault-injection proxy placed in front of an EmbeddedKafkaCluster.
- It decodes/encodes Kafka protocol messages using Kafka's own protocol classes.
- `disconnectOn(apiKey)` drops the connection when the matching response would return and is explicitly described as modeling the EOS "commit gap".
- `delayOn(apiKey, Duration)` holds the matching response, isolated to one connection.
- `PRODUCE` is explicitly among the APIs supported by `injectError`; the proxy is designed to be extensible per API.
- The deterministic trigger DSL supports one-shot and call-count style triggers.
- The issue is still OPEN/Unresolved and has no Fix Version; PR #23438 is also shown as open. citeturn0search1turn0search0

Critical result:
This is the first exact current Kafka evidence matching the needed production-faithful seam. `disconnectOn(PRODUCE)` can model the response-path gap, and `delayOn(PRODUCE, Duration)` can model a slow response. However, because the issue/PR is not yet verified as merged into the canonical trunk, it must NOT be treated as an available stable Kafka primitive today.

For Nexo research:
- CAPABILITY = VERIFIED IN CURRENT PROPOSED FIXTURE DESIGN.
- MERGED/AVAILABLE IN TRUNK = NOT VERIFIED.
- TEST EXECUTED = NO.
- BROKER DURABILITY = NO.

The correct next step is source-level inspection of PR #23438's changed files to determine exact class/API names and whether the fixture implementation itself establishes that the response is intercepted after broker processing rather than before request delivery. Do not copy the Jira description into an implementation assumption.

NEXT: AB104.663 — inspect PR #23438 changed source and tests at exact blob/commit level; verify trigger semantics and ordering around PRODUCE response interception.
