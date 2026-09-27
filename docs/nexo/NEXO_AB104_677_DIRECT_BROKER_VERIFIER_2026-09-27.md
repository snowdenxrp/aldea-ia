# NEXO AB104.677 — Direct broker verifier and observation classification
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Current Kafka verifier evidence
The current `FaultProxyExampleIntegrationTest` establishes the exact architectural pattern:
- application client points to `proxy.bootstrapServers()`;
- verifier consumer points directly to `cluster.bootstrapServers()`, bypassing the proxy;
- verifier uses `read_committed` where committed visibility is required;
- Kafka integration utilities use bounded wait conditions for observation.

For the Nexo response-loss experiment, the verifier must remain a separate client and direct-broker path.

## Frozen observation protocol
Use one topic and one partition, with a unique effectId encoded in the record key/value.

Verifier:
1. connect directly to `cluster.bootstrapServers()`;
2. assign/subscribe to the target topic;
3. use `auto.offset.reset=earliest`;
4. poll repeatedly until the fixed observation deadline;
5. inspect records for the exact effectId;
6. if found, capture topic + partition + offset and classify `PRESENT`;
7. if deadline expires with successful polling and exact effectId absent, classify `NOT_OBSERVED`;
8. if consumer creation, assignment, polling, or broker read fails, classify `READ_PATH_ERROR`.

## Deadline
Frozen initial experiment deadline: 10 seconds from the start of verifier polling.

This is an observation bound, not a durability proof. `NOT_OBSERVED` must never be converted to `NOT_COMMITTED`.

## Why not use waitUntilFinalKeyValueRecordsReceived
That helper is designed for expected final mappings and can assert a complete expected state. Our experiment has a different epistemic contract: find one unique effect while preserving the distinction between absence, read failure, and presence. Therefore a narrow custom polling loop is preferable.

## Evidence tuple
- producer outcome
- fault rule matched/triggered
- verifier path
- observation deadline
- observation class
- exact effect identity
- partition/offset when PRESENT
- read error diagnostics when READ_PATH_ERROR

## Status
VERIFIED:
- direct-broker verifier pattern exists in current Kafka integration tests;
- bounded observation utilities/patterns exist.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.678: inspect the exact current consumer polling/assignment primitives used by the Kafka integration tests and freeze the minimal verifier implementation without relying on helper assertions that collapse epistemic states.
