# NEXO AB104.767R — Metadata freshness barriers versus effect-time authorization

Date: 2026-09-30
Status: RESEARCH ONLY. No Nexo implementation and no executed revocation race.

## Scope
Determine whether Kafka exposes a primitive that lets an operation wait until a broker has applied a target metadata/ACL version, and whether ordinary authorization/Produce consumes such a barrier. Compare the semantic boundary with real systems using revisions/fencing.

## Source findings

1. Kafka's current Authorizer interface exposes startup futures for waiting until authorization metadata is available on listeners. The interface also states ACL update methods are asynchronous. This is an initialization/readiness mechanism, not a generic per-effect revocation barrier.

2. StandardAuthorizer has an initialLoadFuture completed after loading the initial metadata high watermark. Current StandardAuthorizer state is maintained as local state synchronized for reads/writes. This confirms an initial readiness boundary but does not establish an API saying that a request is authorized only if local metadata revision is at least D.

3. Current BrokerServer startup waits for broker metadata publishers to install, controller catch-up, and first broker metadata publication. The first publication is tied to reading at least the metadata partition high watermark. Again, this is startup/catch-up readiness, not an effect-time fence.

4. KIP-801 states brokers continuously read the metadata log up to the last stable offset and that StandardAuthorizer state corresponds to some point on a single metadata timeline. It also notes that authorization can continue while ACL records are being applied, while preserving ACL record order.

5. The current KafkaProducer awaitTopicMetadata primitive is client-side topic metadata waiting and is not an authorization-version barrier. It cannot establish that a broker has applied a particular ACL revision before a Produce effect.

6. Therefore the audited evidence does not establish an existing generic Kafka primitive that couples Produce authorization to a caller-specified ACL metadata offset. A broker-local applied metadata point exists conceptually, but normal Produce does not expose/use it as an effect-time reauthorization condition.

## Comparison with real revision/fencing systems

etcd exposes a cluster-wide store revision in response headers and supports atomic transactions guarded by revision/version comparisons. Its documentation explicitly distinguishes leases from mutual exclusion and describes revision/version validation as the mechanism that prevents stale owners from successfully updating protected etcd state. This is a stronger effect-boundary pattern because the protected resource itself evaluates the version predicate.

ZooKeeper exposes total ordering through zxid, including epoch and counter. That provides an ordering identity, but zxid alone is not evidence that an arbitrary external resource enforces the ordering as a fence.

Kubernetes ResourceVersion is an opaque server version usable for consistency/concurrency checks on the same resource type. Again, the key property is resource-side validation, not merely observing that a version exists.

## Nexo interpretation

The useful distinction is now sharper:

OBSERVED/APPLIED_AUTHORITY_VERSION != EFFECT_AUTHORIZATION_FENCE.

A metadata loader can establish:
BROKER_APPLIED_VERSION >= D

but that alone does not establish:
EFFECT_ACCEPTED_ONLY_IF_AUTHORITY_VERSION >= D

The second requires the effect boundary to consume and enforce the version/fence predicate, or an equivalent reauthorization step immediately before the consequential action.

This reinforces the existing Nexo distinction:
AUTHORITY_COMMITTED -> AUTHORITY_PROPAGATED/APPLIED -> EFFECT-TIME AUTHORIZATION -> EFFECT

where each boundary needs its own evidence.

No architecture change is frozen here. This is evidence for the audit only.

## Evidence ledger

AUTHORIZER_STARTUP_READINESS: SOURCE CONFIRMED
INITIAL_HIGH_WATERMARK_LOAD: SOURCE CONFIRMED
BROKER_METADATA_HIGH_WATERMARK_STARTUP: SOURCE CONFIRMED
ACL_ORDERED_APPLICATION: SOURCE CONFIRMED
GENERIC_CALLER_SUPPLIED_ACL_OFFSET_BARRIER: NOT FOUND
PRODUCE_EFFECT_TIME_REAUTHORIZATION_ON_METADATA_VERSION: NOT FOUND
CLIENT_AWAIT_TOPIC_METADATA_AS_AUTHORIZATION_FENCE: NOT VALID
ETCD_REVISION_COMPARE_FOR_PROTECTED_RESOURCE: SOURCE CONFIRMED
ZOOKEEPER_ZXID_TOTAL_ORDER: SOURCE CONFIRMED
RESOURCE_SIDE_FENCE_GENERALIZATION: CONCEPTUALLY SUPPORTED, NOT UNIVERSAL
EXECUTED_KAFKA_REVOCATION_RACE: NO

## Exact next action

AB104.768R:
Audit Kafka's actual request/append test infrastructure for whether authorization is evaluated before or after any append-side state transition, and search for tests involving ACL mutation during an in-flight Produce. Separately inspect whether ReplicaManager or request-channel boundaries expose any generation/version/fencing check that could invalidate already-authorized records. Do not infer safety or exploitability from source ordering alone.

## Continuity

If chat stops, recover the canonical handoff first and resume at AB104.768R. Preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED. Do not create parallel handoffs. AB105.116R remains canonical Nexo model anchor. Research only; no implementation/V21; no formal verification claim.
