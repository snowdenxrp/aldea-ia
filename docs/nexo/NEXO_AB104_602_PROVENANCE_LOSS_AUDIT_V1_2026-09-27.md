# NEXO AB104.602 — Adversarial provenance-loss audit
Date: 2026-09-27
Status: RESEARCH ONLY; implementation/V21 blocked.

## Question
Can a dynamically captured DependencySet remain complete across multi-stage derivation, cache refresh races, speculative reads, external observations, and crash/retry between capture and final gate?

## Evidence
- PostgreSQL 18 SERIALIZABLE: predicate locks are based on data actually accessed; acquired locks depend on query plan; results from a serializable transaction must not be treated as valid if that transaction later aborts. https://www.postgresql.org/docs/18/transaction-iso.html
- PostgreSQL SSI implementation notes: predicate coverage can be coarse and depends on physical access paths; range/predicate conflicts matter, not only returned tuples. https://wiki.postgresql.org/wiki/Serializable
- Redis client-side caching documents an invalidation race: a GET response can arrive after invalidation and repopulate stale data; it also requires flushing cache state after invalidation-channel loss. https://redis.io/docs/latest/develop/reference/client-side-caching/
- Redis cache-consistency guidance documents write-ordering and multi-instance cache-fill races. https://redis.io/blog/cache-consistency-strategies/
- etcd distinguishes linearizable reads from serializable member-local reads that may be stale; watch consumers must reason about revisions. https://etcd.io/docs/v3.4/learning/api_guarantees/
- AWS EC2 documents eventual consistency: successful create/modify may not be immediately visible to later calls; a NotFound response after success does not prove non-existence. https://docs.aws.amazon.com/ec2/latest/devguide/eventual-consistency.html

## Adversarial findings
A1 MULTI-STAGE DERIVATION: provenance can be lost when protected state becomes derived values through helpers. Recording only the final value or immediate caller is insufficient. Provenance must survive every authority-relevant derivation edge, including helper identity/version and input dependency digest.

A2 CACHE REFRESH RACE: a cache hit can be stale even before expiry. A refresh response can race with invalidation and repopulate an older value. Authority-relevant cache provenance therefore needs source identity, incarnation/version/revision, derivation identity, freshness/expiry, and invalidation/reconciliation generation. Arrival time never establishes freshness.

A3 INVALIDATION LOSS: if invalidation delivery is interrupted, cached values cannot be assumed current. A disconnected cache observer requires flush, quarantine, or revalidation before cached authority-relevant data can influence protected transitions.

A4 SPECULATIVE READS: speculative/model-generated/planner reads should not enlarge the authoritative DependencySet merely because they were observed. If a speculative result actually influences the final decision, its source dependencies must be promoted. Distinguish OBSERVED_READ, DECISION_INPUT, and AUTHORITATIVE_DEPENDENCY.

A5 EXTERNAL OBSERVATIONS: provider Describe/status/telemetry responses are observations, not automatically current world truth. Evidence must bind provider/endpoint identity, resource incarnation, observation revision/version when available, observation time, freshness bound, request/operation identity, and consistency mode. If required freshness/lineage is unavailable, final admission treats the observation as insufficient/UNKNOWN.

A6 CRASH/RETRY BETWEEN CAPTURE AND FINAL GATE: a recorded DependencySet is not durable proof that the same evidence survives restart. Crash/retry must preserve AdmissionID/generation, provenance digest, authoritative snapshot/version set, cache generation, provider/resource incarnation, policy/logic version, and completeness state. Missing provenance means fresh admission or HOLD, not inherited authority.

A7 DERIVATION/CACHE COMPOSITION: a cached derived value computed from multiple protected sources must expose its exact source closure. A cache entry storing only a value is insufficient for authority-relevant use. Unknown, expired, invalidated, or incarnation-mismatched sources require recomputation/revalidation.

A8 FINAL-GATE RACE: provenance can become stale after capture. Final admission must compare the complete provenance/version/incarnation digest against authoritative current state. DependencySetRecorded=true is insufficient.

## Minimum provenance record candidate
ReadID; source object/predicate/range/aggregate identity; source provider/endpoint identity; source resource incarnation; authoritative version/revision/consistency mode; observation time + freshness/expiry; evaluator/helper identity+version; input dependency digest; derivation identity/version; cache key+cache generation+source provenance; policy/config/logic version; AdmissionID/OperationID; capture generation; completeness/coverage status; evidence boundary/trust-domain marker; invalidation/reconciliation generation.

## Required distinctions
RECORDED != COMPLETE.
CACHE_HIT != CURRENT.
OBSERVATION != WORLD_TRUTH.
SPECULATIVE_READ != DECISION_INPUT unless promoted.
COMPUTED_VALUE != PROVENANCE-FREE VALUE.
RETRY != CONTINUATION unless prior provenance and authority state are durably recoverable.

## Architecture consequence
Dependency completeness is a claim-specific TCB spanning the authoritative read boundary, provenance propagation through derivation/helpers, cache coherence/reconciliation, external-observation validation, and crash-safe admission replay. Any uninstrumented boundary or incomplete provenance must force HOLD/STALE_ADMISSION/REVALIDATE rather than silently widen authority.

## Open gaps
- Executable tests for nested cache-of-cache and multi-stage derivation.
- Tests for speculative branches whose outputs are partially merged into final decisions.
- Provider-specific freshness/consistency contracts and incarnation semantics.
- Crash injection between each provenance capture stage and FINAL_GATE.
- TLC remains pending; SANY success is not formal verification.
- AB104.596 bounded model still does not cover provider-side acceptance followed by resource reincarnation.
