# NEXO AB104.766R — Broker metadata publication and ACL freshness boundary

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation and no executed race test.

## Scope

Audit the broker metadata publication path to determine what point proves that an ACL metadata offset has reached and been applied by a broker, and whether the normal Produce path consumes such a proof before effect.

## Source findings

1. Current BrokerMetadataPublisher receives a MetadataDelta plus MetadataImage and records `newImage.highestOffsetAndEpoch()` as the metadata position being published.

2. The broker publishes several metadata domains from the same update. The ACL delta is handed to AclPublisher during the broker metadata publication callback.

3. Current AclPublisher receives committed metadata updates. Kafka's KAFKA-15318 explicitly describes the design as a MetadataPublisher that listens to MetadataLoader and receives only committed data. KIP-801 likewise states that brokers continuously read the metadata log up to their last stable offset.

4. AclPublisher applies the ACL delta to ClusterMetadataAuthorizer. Its implementation preserves the order of ACL changes and updates StandardAuthorizer's local state. StandardAuthorizer's authorize() then evaluates against its current local StandardAuthorizerData snapshot.

5. This establishes a meaningful broker-local freshness point: once the relevant BrokerMetadataPublisher/AclPublisher publication has completed for a metadata image containing offset D, the broker's StandardAuthorizer has processed the ACL changes represented by that publication (assuming no publication fault).

6. However, the audited normal Produce path does not expose or require this metadata offset as an effect-time authorization fence. KafkaApis performs authorization, constructs authorizedRequestInfo, and passes the already-authorized records to ReplicaManager. No generic second topic ACL authorization was found between admission and append.

## Critical distinction

We can now distinguish:

D0 = ACL deletion committed into the metadata timeline.
D1 = target broker has received a committed metadata image containing D0 and AclPublisher has applied the ACL delta.
D2 = protected effect is attempted.

D0 != D1 because metadata propagation is distributed.
D1 != D2 because the request may have been authorized before D1 and can continue without a generic second ACL check.

A broker-local metadata offset therefore can be useful evidence for a revocation fence, but Kafka's ordinary Produce path does not appear to use that offset as an effect-time reauthorization condition.

## Important source-backed nuance

KIP-801 says brokers continuously read metadata up to their last stable offset and that StandardAuthorizer state corresponds to some point on a single metadata timeline. This gives a consistency model, not a claim of instantaneous cluster-wide revocation. The current implementation's `initialLoadFuture` only addresses initial authorizer readiness; it is not a continuously updated request fence.

## Test / execution status

No deterministic execution of `ALLOW → revoke → metadata publication → in-flight Produce → append` was performed.
No claim is made that the race is externally exploitable.
No claim is made that all custom Authorizers behave like StandardAuthorizer.

## Nexo interpretation

This is strong evidence for separating an authority version from its propagation state.
A useful future Nexo model may need at least:
- authority commit/version;
- per-effect-domain observed/applied version;
- effect-time requirement specifying the minimum version/freshness that must be observed before the side effect.

But this remains a research conclusion, not a finalized architecture. We must still study real revocation/fencing systems and failure behavior before distillation.

## Evidence ledger

BROKER_METADATA_HAS_OFFSET: SOURCE CONFIRMED
ACL_PUBLISHER_RECEIVES_COMMITTED_METADATA: SOURCE CONFIRMED
ACL_ORDER_PRESERVED: SOURCE CONFIRMED
BROKER_LOCAL_AUTHORITATIVE_STATE: SOURCE CONFIRMED
GENERIC_PRODUCE_EFFECT_TIME_REAUTHORIZATION: NOT FOUND
INITIAL_READINESS_BARRIER: SOURCE CONFIRMED
CONTINUOUS_REVOCATION_FENCE_IN_PRODUCE: NOT FOUND
EXECUTED_RACE: NO
CUSTOM_AUTHORIZER_GENERALIZATION: OPEN

## Exact next action

AB104.767R:
Search Kafka tests and metadata-loader APIs for explicit offset-observation/barrier primitives (including wait-for-metadata or high-watermark mechanisms). Determine whether any existing primitive could be used to make a broker wait until ACL version D1 before an operation, and whether any test demonstrates its interaction with authorization. Then compare this with other real systems that implement revocation/fencing at effect time.
