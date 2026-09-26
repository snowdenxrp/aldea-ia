# NEXO AB104.294 — Exactly-once scope and end-to-end limits

Date: 2026-09-26
Status: RESEARCH ONLY.

## Evidence
Apache Kafka documents exactly-once semantics for Kafka-native transactional processing, where offsets, state, and Kafka outputs can participate in the same transactional system. It explicitly notes that writing to external systems requires cooperation with those systems; otherwise the guarantee does not automatically extend across the boundary. citeturn0search2turn0search4
Kafka's idempotent producer uses producer identity and sequence numbers to reject duplicates within the defined producer/session scope; this is stronger than a bare retry ID but remains scoped to Kafka's protocol. citeturn0search6

## Findings
1. 'Exactly once' is not a universal property; it is a scoped protocol guarantee.
2. Exactly-once processing can be real when input position, state, and output share an atomic/transactional domain.
3. Crossing into an external database, API, device, or other resource creates a new effect boundary. The upstream system cannot inherit exactly-once semantics unless the destination participates in an equivalent atomic/idempotent protocol.
4. Idempotency prevents repeated logical application of the same operation when the target can durably recognize its identity; it does not prove whether the first attempt committed if the acknowledgment was lost.
5. Therefore Nexo should distinguish at least: delivery semantics, processing semantics, target mutation semantics, and historical observability/evidence semantics.
6. A retry-safe protocol can guarantee 'at most one committed mutation for operation_id' without guaranteeing that the caller can immediately know whether that mutation occurred.
7. If target-side operation identity is lost through restore/expiry, exactly-once behavior can degrade into UNKNOWN or permit duplicate risk; retention and anti-rollback are part of the semantic guarantee.
8. 'Exactly once' must never be used as a substitute for the previously established UNKNOWN_EXTERNAL state. A crashed call can remain uncertain even when the surrounding message system is exactly-once.
9. The useful Nexo candidate is not global exactly-once, but explicit per-boundary contracts: each domain states what it guarantees, what evidence it produces, and what remains UNKNOWN across its boundary.

## Candidate invariants
`EOS(scope=S) => guarantee applies only to operations whose relevant state/effect boundary is inside S`.
`EOS(transport) != EOS(external_mutation)`.
`IDEMPOTENCY != HISTORICAL_OBSERVABILITY`.

## Explicit non-claims
No architecture selected; no implementation; no formal verification; no semantic freeze.

## Next exact step
AB104.295 — investigate idempotency-key scope, retention, expiry, and collision semantics in concrete APIs/protocols, especially whether keys must bind target incarnation and payload fingerprint to remain safe across restore.