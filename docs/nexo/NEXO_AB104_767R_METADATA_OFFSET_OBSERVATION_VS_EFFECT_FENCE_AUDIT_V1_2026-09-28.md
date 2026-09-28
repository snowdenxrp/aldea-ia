# NEXO AB104.767R — Metadata offset observation vs effect-time barrier

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no executed revocation race.

## Scope

Determine whether Kafka exposes an existing broker metadata offset observation/barrier that request processing can use to wait until a revocation is locally applied before a protected effect.

## Findings

1. Kafka exposes broker-side `last-applied-record-offset` as an explicit monitoring metric. Apache Kafka documents it as the offset of the last cluster-metadata record applied by the broker. This is evidence that broker metadata application has a measurable local position.

2. Kafka also exposes metadata-load/apply error metrics. Therefore an observed applied offset is not equivalent to an unconditional proof that every publisher completed successfully; publication faults are a separate state that must remain visible.

3. The audited BrokerMetadataPublisher path carries `MetadataImage.highestOffsetAndEpoch()` and invokes AclPublisher as part of applying a committed metadata update. This gives a concrete relationship between a metadata image position and local ACL publication.

4. Historical Kafka APIs demonstrate the concept of waiting for a metadata version/epoch (`waitForMetadataUpdate` in KIP-232), but that mechanism belongs to the client metadata-update path and is not evidence of a broker-side ACL-effect fence. Do not generalize it into a broker authorization primitive.

5. Current Kafka documentation/source evidence found in this audit does not establish a generic request-processing primitive of the form: `wait until broker metadata applied offset >= D`, followed by mandatory reauthorization against that state, immediately before Produce append.

6. Therefore the metric/offset is an OBSERVATION, not yet a SYNCHRONIZATION/FENCING primitive.

## Key distinction

Observed:

`broker_applied_offset >= D`

means the broker has reported applying metadata through D.

A security/effect fence would need something stronger:

`before_effect: prove broker_authorizer_state >= D AND authorize(request, current_state) == ALLOW`

and the protected effect must be ordered so that a later authority change cannot invalidate the authorization without another fence.

Kafka source audited so far does not establish that compound condition for normal Produce.

## Evidence status

BROKER_LAST_APPLIED_METADATA_OFFSET: SOURCE CONFIRMED
BROKER_METADATA_APPLY_ERROR_SIGNAL: SOURCE CONFIRMED
METADATA_IMAGE_HAS_HIGHEST_OFFSET: SOURCE CONFIRMED
ACL_PUBLISHER_PART_OF_BROKER_METADATA_PUBLICATION: SOURCE CONFIRMED
CLIENT_METADATA_WAIT_PRIMITIVE_EXISTS_HISTORICALLY: SOURCE CONFIRMED
BROKER_EFFECT_TIME_METADATA_WAIT_PRIMITIVE: NOT ESTABLISHED
OFFSET_OBSERVATION_AS_AUTHORIZATION_FENCE: NOT ESTABLISHED
GENERIC_SECOND_ACL_CHECK_BEFORE_PRODUCE_APPEND: NOT FOUND IN AUDITED PATH
EXECUTED_REVOCATION_RACE: NO

## Research consequence for Nexo

The audit now supports a sharper vocabulary:

- `committed_authority_version`: control-plane fact
- `observed/applied_authority_version`: local effect-domain observation
- `effect fence`: protocol condition that prevents the protected operation unless the required version/freshness is satisfied at the effect boundary

The first two are observable facts. The third is a safety mechanism and cannot be inferred merely from the existence of an offset metric.

This distinction must survive distillation and must not be silently converted into an architectural guarantee.

## Exact next action

AB104.768R: inspect Kafka's authorization tests and request pipeline for any test-only synchronization hooks or metadata-version assertions around Produce/ACL changes. Specifically search for ACL deletion tests, concurrent Produce tests, StandardAuthorizer tests, and any use of metadata offsets/barriers in server request tests. Then determine whether the absence of an effect-time fence is merely an implementation choice or a documented semantic contract.
