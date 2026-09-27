# NEXO AB104.702 — Group.id boundary for manual verifier
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka's manual assignment API does not use the consumer group management protocol for partition assignment. The current KafkaConsumer documentation distinguishes assign() from subscribe(): manual assignment is controlled directly by the application, and group-based assignment/rebalancing applies to subscription mode. citeturn0search1

## Frozen decision

The verifier uses:

- assign(Collections.singleton(targetPartition))
- no subscribe()
- no consumer-group offset commits
- enable.auto.commit=false
- no group.id unless the selected Kafka client version requires it for another unrelated feature

The base verifier therefore SHOULD omit group.id entirely if construction succeeds without it.

## Why this matters

Removing group.id eliminates an unnecessary authority/evidence dependency:

consumer observation
!=
consumer-group membership
!=
consumer offset state.

The verifier only needs direct partition reads.

## Close boundary

With manual assignment and no group membership, close() should not be treated as a group-leave or committed-offset evidence source. It remains bounded cleanup after evidence freeze.

If the runtime unexpectedly requires group.id, that is a harness/configuration constraint and must be recorded; it must not be silently interpreted as part of the observation claim.

## Frozen forbidden surface

Base verifier must not introduce:
- subscribe()
- consumer group rebalance
- commitSync()
- commitAsync()
- auto-commit
- group-offset inspection
- group membership as evidence

## Status

VERIFIED:
- manual assign is application-controlled rather than group assignment;
- group coordination is unnecessary for the base direct-partition verifier;
- group.id should be omitted where Kafka permits;
- consumer-group state is outside the broker-record observation claim.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.703: inspect current KafkaConsumer configuration validation for group.id with manual assign and freeze the exact minimal consumer property set so no accidental group dependency enters implementation.