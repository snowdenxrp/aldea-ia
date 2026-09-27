# NEXO AB104.604 — Mechanism mapping: evidence vs protected semantics
Date: 2026-09-27
Status: research only; no implementation.

## Mappings
1. Transactional outbox: strong evidence mechanism for atomic local persistence of state + intent/event. AWS notes the DB update and outbox update commit/rollback together, while downstream delivery can be at-least-once and therefore needs idempotent processing. It does NOT prove external effect completion, freshness, authority, or cross-provider atomicity.
2. etcd revision/CAS: suitable evidence/guard mechanism for authoritative version checks and compare-and-swap inside the etcd consistency domain. It does NOT by itself fence an external provider/resource or prove physical-world effect.
3. Redis client-side caching/tracking: useful evidence mechanism for invalidation and cache-coherence detection. Redis explicitly documents asynchronous invalidation, stale-cache races, and flushing on invalidation-channel loss. It is NOT an authority fence; for protected decisions Nexo still needs version/incarnation/freshness validation at FINAL_GATE.
4. OpenTelemetry Context/Baggage: useful transport/correlation evidence. OTel documents Context as execution-scoped propagation and Baggage as cross-service contextual data; Baggage has no built-in integrity guarantee. It MUST NOT be treated as authoritative provenance or authorization.
5. Versioned cache keys: useful implementation pattern for separating generations, but key naming alone is not proof. The generation must be anchored to authoritative source version/incarnation and validated at the protected gate.

## Classification
EVIDENCE-SUPPLYING MECHANISMS:
- outbox commit record
- etcd revision/CAS result
- Redis invalidation event/cache state
- OTel trace/context correlation
- provider observation with explicit revision/incarnation

NEXO-PROTECTED SEMANTICS STILL REQUIRED:
- complete authority-relevant read capture
- provenance transitive closure
- generation/epoch fencing
- admission freshness
- resource/provider incarnation binding
- final authoritative revalidation
- UNKNOWN semantics after crash/timeout/partition
- external effect outcome/reconciliation

## Critical result
No surveyed mechanism closes the whole provenance claim. Each supplies a bounded piece of evidence inside its own semantics. Nexo must compose them without upgrading evidence into authority.

## AB104.603 matrix mapping
T1/T6/T11/T12 -> provenance instrumentation/derivation boundary.
T2/T3/T4 -> cache invalidation + generation/freshness.
T7/T8 -> provider revision/incarnation evidence.
T9/T10/T15 -> durable generation + crash/replay/anti-rollback.
T13 -> final CAS/version check.
T14 -> explicit completeness validation; transport truncation is fail-closed.

## Next
AB104.605: adversarially inspect real code paths/implementations for transactional outbox, etcd CAS/revisions, Redis tracking, and OTel propagation to identify concrete failure modes that a clean Nexo design must forbid or quarantine.