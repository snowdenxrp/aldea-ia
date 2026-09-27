# NEXO AB104.605 — Real implementation failure modes
Date: 2026-09-27
Status: research only.

## Code-level findings
1. Transactional outbox: atomic DB+outbox commit does not make delivery atomic. AWS sample/docs explicitly require idempotent consumers because SQS standard delivery can duplicate messages; ordering is also a separate concern. Failure mode: duplicate downstream effect or reordered observation if consumer semantics are weak. Nexo response: durable EffectID + idempotent consumer/effect contract + explicit outcome state.
2. Redis client-side caching: official implementation documents a GET/invalidation race in two-connection mode and requires a placeholder/in-progress marker; loss of the invalidation connection requires flushing the cache. Failure mode: stale value re-enters cache after invalidation, or stale cache survives connection loss. Nexo response: cache generation/source revision + fail-closed invalidation generation; cache cannot independently authorize.
3. OpenTelemetry Baggage: official docs say baggage has no built-in integrity checks and may be automatically sent to downstream resources. Failure mode: untrusted/stale/mutated context can be mistaken for trusted identity/provenance. Nexo response: never treat Baggage/trace context as authoritative; bind protected provenance in Z1.
4. etcd/CAS: CAS is bounded by the consistency domain of the etcd state being compared. Failure mode: local CAS success is incorrectly interpreted as fencing an external provider/resource. Nexo response: distinguish protected-store commit evidence from external effect evidence; external outcome remains separate/UNKNOWN until reconciled.

## Cross-cutting failure classes
F1 duplicate delivery
F2 stale cache resurrection
F3 invalidation-channel loss
F4 untrusted/mutable propagation metadata
F5 local atomicity mistaken for global/external atomicity
F6 observation/evidence mistaken for current world truth

## Architecture consequence
The clean architecture must enforce a hard semantic boundary:
mechanism evidence -> EvidenceRecord -> claim-specific validation -> protected admission.
No mechanism may directly mint AuthorityContext merely because it returned success.

## Next
AB104.606: research concrete CAS/revision semantics and crash behavior in etcd plus transactional outbox duplicate/idempotency implementations, then formulate executable fault-injection scenarios for F1/F5 and recovery UNKNOWN.
