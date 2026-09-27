# NEXO AB104.603 — Provenance propagation mechanisms and adversarial test matrix
Date: 2026-09-27
Status: RESEARCH/DESIGN ONLY; no Nexo implementation.

## External mechanism findings
- W3C Baggage propagates application-defined context across distributed requests, but entries are mutable and may be dropped under size limits; useful as transport/context, not sufficient as authority proof. https://www.w3.org/TR/baggage/
- OpenTelemetry propagates context across service/process boundaries for causal/telemetry context; it is not an authoritative DependencySet. https://opentelemetry.io/docs/concepts/signals/baggage/
- Redis client-side caching provides invalidation behavior; on invalidation-channel loss the client must flush cache; its two-connection race requires an in-progress marker so an old GET response cannot repopulate invalidated cache. https://redis.io/docs/latest/develop/reference/client-side-caching/

## Architecture conclusion
Nexo needs a protected provenance carrier distinct from ordinary trace/baggage context:
ProvenanceEnvelope = AdmissionID + Generation + ReadID + SourceIdentity + SourceIncarnation + SourceVersion/Revision + DerivationID/Version + ParentDigest + CacheGeneration + Freshness + ConsistencyMode + Completeness + TrustBoundary.
Transport metadata may carry a reference/digest, but authoritative state must bind and validate the envelope at FINAL_GATE.

## Smallest adversarial matrix
T1 nested derivation: A@v1 -> B -> helper C -> decision. Delete A provenance at each edge. Expected: COMPLETE only when closure survives; otherwise HOLD.
T2 nested cache: cache(C) derived from A@v1,B@v2; invalidate A; cache hit. Expected: stale/revalidate.
T3 refresh race: GET old value + invalidation + late response. Expected: late response cannot repopulate current cache.
T4 invalidation-channel loss: disconnect before invalidation. Expected: authority-relevant cache flush/quarantine.
T5 speculative branch discarded: read A but branch never influences decision. Expected: observed-only, no forced dependency.
T6 speculative branch merged: speculative result influences decision. Expected: dependency promotion.
T7 external observation stale: provider reports old revision. Expected: insufficient/UNKNOWN.
T8 external observation incarnation change: same resource name, new incarnation. Expected: old observation rejected.
T9 crash after capture: restart before FINAL_GATE. Expected: resume only with durable matching provenance/generation; otherwise new admission/HOLD.
T10 retry after partial provenance loss. Expected: retry cannot inherit old authority.
T11 helper bypass: authority-relevant helper reads protected state outside recorder. Expected: INCOMPLETE_CAPTURE.
T12 cache-of-cache: derived cache consumes another cached derived value. Expected: transitive source closure retained.
T13 final-gate mutation: source version changes after capture. Expected: STALE_ADMISSION.
T14 carrier truncation: transport drops provenance members. Expected: no silent authority expansion; incomplete/HOLD.
T15 generation rollback: old cache/provenance generation reappears after restart. Expected: anti-rollback rejection/quarantine.

## Key distinction
Trace/Baggage propagation != Authority provenance.
Cache invalidation != authoritative fencing.
Recorded dependency != complete dependency.
Observation != world truth.

## Next
AB104.604: map these tests to real implementation/code patterns (transactional outbox, versioned cache keys, CAS/etcd revisions, OpenTelemetry propagation boundaries) and identify which mechanisms can supply evidence versus which require Nexo-specific protected semantics.