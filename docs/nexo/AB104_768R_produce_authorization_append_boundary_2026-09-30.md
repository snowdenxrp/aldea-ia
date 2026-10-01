# NEXO AB104.768R — Produce authorization versus append boundary

Date: 2026-09-30
Status: RESEARCH ONLY. No Nexo implementation and no executed deterministic revocation race.

## Scope
Audit the current Kafka Produce request path and available evidence for ACL mutation during an in-flight Produce. Determine whether ReplicaManager or request/append boundaries revalidate authorization or consume a generation/version fence.

## Source findings

1. KafkaApis.handleProduceRequest evaluates topic WRITE authorization through authHelper.filterByAuthorized and stores the resulting records in authorizedRequestInfo. The source comment explicitly describes this as caching the result to avoid redundant authorization calls, but this is request-local state, not a cross-request authorization cache.

2. After validation, KafkaApis passes authorizedRequestInfo directly to ReplicaManager.handleProduceAppend. The audited path contains no generic second topic ACL authorization call between that authorization step and the append call.

3. The current Produce protocol authorization model identifies normal Produce as WRITE on Topic. Kafka's security documentation does not describe a separate effect-time ACL generation/fence requirement for normal Produce. Therefore source evidence supports a single request authorization boundary followed by append processing, not a two-stage ACL reauthorization protocol.

4. The audited KafkaApis boundary does not carry an explicit ACL metadata offset/generation alongside authorizedRequestInfo. No source evidence was established that ReplicaManager receives an authorization generation and rejects the append when the broker's ACL state has advanced.

5. Search for a dedicated upstream test proving ALLOW -> ACL revoke -> in-flight Produce -> append was not established. A third-party audit/demo repository documents a running-producer ACL-removal scenario in which subsequent producing attempts receive authorization errors, but that does not establish the exact in-flight interleaving or append-before/after revocation boundary and is not Apache Kafka's own verification.

6. Kafka's current security model explicitly assumes a trusted broker fleet and describes authorization as broker-side arbitration of client access. This means findings about the request boundary must not be generalized into a claim that Kafka's security model is intended to provide resource-side transactional fencing.

## Critical distinction

The source path establishes:
AUTH_CHECK -> AUTHORIZED_REQUEST_INFO -> REPLICA_APPEND

It does NOT establish:
AUTH_CHECK(D) -> APPEND_ONLY_IF_LOCAL_AUTH_VERSION >= D

Nor does source ordering alone establish whether a particular interleaving can occur under a real scheduler/network/metadata publication timing.

## Test status

SOURCE_PATH_AUTH_BEFORE_APPEND: SOURCE CONFIRMED
REQUEST_LOCAL_AUTHORIZATION_REUSE: SOURCE CONFIRMED
GENERIC_SECOND_TOPIC_ACL_CHECK_BEFORE_APPEND: NOT FOUND_IN_AUDITED_PATH
ACL_GENERATION_PASSED_TO_REPLICA_APPEND: NOT ESTABLISHED
APPEND_SIDE_AUTHORIZATION_FENCE: NOT ESTABLISHED
DEDICATED_UPSTREAM_IN_FLIGHT_REVOKE_TEST: NOT ESTABLISHED
THIRD_PARTY_RUNNING_PRODUCER_AFTER_ACL_REMOVAL: OBSERVED_IN_EXTERNAL_TEST/DOCUMENTATION, NOT EXACT RACE PROOF
EXECUTED_DETERMINISTIC_RACE: NO

## Nexo interpretation

This strengthens, but does not prove exploitability of, the distinction between admission authorization and effect-time authorization.

The correct evidence chain remains:
AUTHORITY/ACL STATE -> REQUEST AUTHORIZATION -> AUTHORIZED WORK -> APPEND EFFECT

A stronger safety contract would require an effect boundary that checks a current authority generation/fence, or an equivalent protected-resource predicate. Whether Nexo needs such a mechanism remains an architectural question for later distillation; no model change is frozen here.

## Exact next action

AB104.769R:
Inspect ReplicaManager.handleProduceAppend and the append/purgatory/partition boundaries for any hidden state transition, leader epoch, partition epoch, transaction marker, producer epoch, or other generation check that could indirectly act as a stale-authorization fence. Separate partition/producer correctness mechanisms from ACL authority freshness. Also inspect upstream tests around ACL changes and Produce for any ordering guarantees.

## Continuity

If chat stops, recover the canonical handoff first and resume at AB104.769R. Preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED. Do not create parallel handoffs. AB105.116R remains canonical Nexo model anchor. Research only; no implementation/V21; no formal verification claim.
